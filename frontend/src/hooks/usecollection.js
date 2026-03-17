import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";


// NOW ACCEPTS a groupId param — all reads and writes are scoped to that group.
// Usage:
//   const col = useCollection("bts");        // BTS binder
//   const col = useCollection("BlackPink");  // Blackpink binder
// When the user switches groups in the app, pass the new groupId and the hook
// re-fetches automatically (groupId is in the dependency array
export function useCollection(groupId) {
    const { user } = useAuth();
    const [collection, setCollection] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);

    const fetchCollection = useCallback(async () => {
        if (!user || !groupId) { setCollection([]); setLoading(false); return; }

        setLoading(true);
        const { data, error } = await supabase
            .from("collection")
            .select(`
                id,
                status,
                quantity,
                created_at,
                group_id,
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
            .eq("group_id", groupId)           // ← group-scoped
            .order("created_at", { ascending: false });

        if (error) setError(error);
        else setCollection(data || []);
        setLoading(false);
    }, [user, groupId]);

    useEffect(() => { fetchCollection(); }, [fetchCollection]);

    // ── Set card status (owned / wishlist / duplicate / for-trade) ──────────
    async function setCardStatus(cardId, status) {
        if (!user || !groupId) return;

        // Optimistic update
        setCollection(prev => {
            const exists = prev.find(c => c.photocards?.id === cardId);
            if (exists) {
                return prev.map(c =>
                    c.photocards?.id === cardId ? { ...c, status } : c
                );
            }
            return prev;
        });

        const { error } = await supabase
            .from("collection")
            .upsert({
                user_id:    user.id,
                card_id:    cardId,
                group_id:   groupId,           // ← group-scoped
                status,
                updated_at: new Date().toISOString(),
            }, { onConflict: "user_id,card_id,group_id" });  // ← updated constraint

        if (error) {
            console.error("setCardStatus error:", error);
            fetchCollection(); // revert on error
        }
    }

    // ── Remove card from this group's collection ────────────────────────────
    async function removeCard(cardId) {
        if (!user || !groupId) return;

        setCollection(prev => prev.filter(c => c.photocards?.id !== cardId));

        const { error } = await supabase
            .from("collection")
            .delete()
            .eq("user_id", user.id)
            .eq("card_id", cardId)
            .eq("group_id", groupId);          // ← group-scoped

        if (error) {
            console.error("removeCard error:", error);
            fetchCollection();
        }
    }

    // ── Derived stats ────────────────────────────────────────────────────────
    const stats = {
        totalOwned:     collection.filter(c => c.status === "owned").length,
        totalWishlist:  collection.filter(c => c.status === "wishlist").length,
        totalDuplicate: collection.filter(c => c.status === "duplicate").length,
        total:          collection.length,
    };

    // ── Group by era for the binder view ────────────────────────────────────
    const byEra = collection.reduce((acc, item) => {
        const era    = item.photocards?.versions?.albums?.eras?.name ?? "Unknown";
        const member = item.photocards?.members?.name ?? "Unknown";
        const key    = `${member}__${era}`;

        if (!acc[key]) {
            acc[key] = {
                member,
                era,
                slug:  item.photocards?.versions?.albums?.eras?.slug,
                cards: [],
            };
        }
        acc[key].cards.push(item);
        return acc;
    }, {});

    // ── Recent activity (last 10 added) ─────────────────────────────────────
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


// ─────────────────────────────────────────────────────────────────────────────
// usePublicCollection
//
// Fetches another user's public collection for a specific group.
// Pass groupId to see only their Blackpink binder, etc.
// Pass null to get everything across all groups (for the overview profile tab).
// ─────────────────────────────────────────────────────────────────────────────
export function usePublicCollection(username, groupId = null) {
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

            // Build collection query — optionally group-scoped
            let query = supabase
                .from("collection")
                .select(`
                    id, status, quantity, created_at, group_id,
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

            if (groupId) query = query.eq("group_id", groupId);

            const { data: collection, error: collectionError } = await query;

            if (collectionError) setError(collectionError);
            else setData({ profile, collection: collection || [] });
            setLoading(false);
        }

        fetch();
    }, [username, groupId]);

    return { data, loading, error };
}