import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

// ─── useCollection ────────────────────────────────────────────────────────────
// Fetches and manages the current user's photocard collection
export function useCollection() {
    const { user } = useAuth();
    const [collection, setCollection] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);

    const fetchCollection = useCallback(async () => {
        if (!user) { setCollection([]); setLoading(false); return; }

        setLoading(true);
        const { data, error } = await supabase
            .from("collection")
            .select(`
        id,
        status,
        quantity,
        created_at,
        photocards (
          id,
          image_url,
          is_rare,
          members ( id, name, stage_name ),
          versions (
            id,
            name,
            albums (
              id,
              title,
              eras ( id, name, slug )
            )
          )
        )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) setError(error);
        else setCollection(data || []);
        setLoading(false);
    }, [user]);

    useEffect(() => { fetchCollection(); }, [fetchCollection]);

    // ── Set card status (owned / wishlist / duplicate) ──────────
    async function setCardStatus(cardId, status) {
        if (!user) return;

        // Optimistic update
        setCollection(prev => {
            const exists = prev.find(c => c.photocards.id === cardId);
            if (exists) {
                return prev.map(c =>
                    c.photocards.id === cardId ? { ...c, status } : c
                );
            }
            return prev;
        });

        const { error } = await supabase
            .from("collection")
            .upsert({
                user_id: user.id,
                card_id: cardId,
                status,
                updated_at: new Date().toISOString(),
            }, { onConflict: "user_id,card_id" });

        if (error) {
            console.error("setCardStatus error:", error);
            fetchCollection(); // revert optimistic update on error
        }
    }

    // ── Remove card from collection ──────────────────────────────
    async function removeCard(cardId) {
        if (!user) return;

        setCollection(prev => prev.filter(c => c.photocards.id !== cardId));

        const { error } = await supabase
            .from("collection")
            .delete()
            .eq("user_id", user.id)
            .eq("card_id", cardId);

        if (error) {
            console.error("removeCard error:", error);
            fetchCollection();
        }
    }

    // ── Derived stats ────────────────────────────────────────────
    const stats = {
        totalOwned:     collection.filter(c => c.status === "owned").length,
        totalWishlist:  collection.filter(c => c.status === "wishlist").length,
        totalDuplicate: collection.filter(c => c.status === "duplicate").length,
        total:          collection.length,
    };

    // ── Group by era for the binder view ────────────────────────
    const byEra = collection.reduce((acc, item) => {
        const era    = item.photocards.versions.albums.eras?.name ?? "Unknown";
        const member = item.photocards.members.name;
        const key    = `${member}__${era}`;

        if (!acc[key]) {
            acc[key] = {
                member,
                era,
                slug: item.photocards.versions.albums.eras?.slug,
                cards: [],
            };
        }
        acc[key].cards.push(item);
        return acc;
    }, {});

    // ── Recent activity (last 10 added) ─────────────────────────
    const recentActivity = [...collection]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

    return {
        collection,
        loading,
        error,
        stats,
        byEra,
        recentActivity,
        setCardStatus,
        removeCard,
        refetch: fetchCollection,
    };
}

// ─── usePublicCollection ──────────────────────────────────────────────────────
// Fetches another user's public collection by username
export function usePublicCollection(username) {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        if (!username) return;

        async function fetch() {
            // Get profile by username
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("username", username)
                .eq("is_public", true)
                .single();

            if (profileError) { setError(profileError); setLoading(false); return; }

            // Get their collection
            const { data: collection, error: collectionError } = await supabase
                .from("collection")
                .select(`
          id, status, quantity, created_at,
          photocards (
            id, image_url, is_rare,
            members ( id, name, stage_name ),
            versions (
              id, name,
              albums (
                id, title,
                eras ( id, name, slug )
              )
            )
          )
        `)
                .eq("user_id", profile.id)
                .order("created_at", { ascending: false });

            if (collectionError) setError(collectionError);
            else setData({ profile, collection: collection || [] });
            setLoading(false);
        }

        fetch();
    }, [username]);

    return { data, loading, error };
}
