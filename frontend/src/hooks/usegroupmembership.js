import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase.js";

const STARTER_STARS = 20;

// useGroupMembership
// Manages a user's membership in a specific group - their star balance,
// whether they've joined before, and helpers to join/spend/earn stars.
// Usage:
//   const { stars, isNew, joinGroup, spendStars, addStars } =
//       useGroupMembership(user?.id, "BlackPink");
// GrpSelect calls joinGroup() on first entry. Everything else (catalog,
// buying cards) calls spendStars(cost) and addStars(amount) as needed.

export function useGroupMembership(userId, groupId) {
    const [membership, setMembership] = useState(null);   // null = not yet loaded
    const [loading,    setLoading]    = useState(true);
    const [checked,    setChecked]    = useState(false);  // true once DB is queried

    const load = useCallback(async () => {
        if (!userId || !groupId) { setLoading(false); setChecked(true); return; }

        setLoading(true);
        const { data } = await supabase
            .from("group_stars")
            .select("*")
            .eq("user_id", userId)
            .eq("group_id", groupId)
            .maybeSingle();   // returns null (not error) if no row exists

        setMembership(data ?? null);
        setLoading(false);
        setChecked(true);
    }, [userId, groupId]);

    useEffect(() => { load(); }, [load]);

    // ── Join group for the first time (called from GrpSelect) ─────────────
    // Creates a row with STARTER_STARS. Safe to call multiple times
    // ignoreDuplicates means it won't overwrite an existing balance.
    async function joinGroup() {
        if (!userId || !groupId) return { error: "Not logged in" };

        const { data, error } = await supabase
            .from("group_stars")
            .upsert(
                { user_id: userId, group_id: groupId, stars: STARTER_STARS },
                { onConflict: "user_id,group_id", ignoreDuplicates: true }
            )
            .select()
            .single();

        if (!error && data) setMembership(data);

        // If ignoreDuplicates swallowed the row (already existed), re-fetch
        if (!data) await load();

        return { data, error };
    }

    // ── Spend stars (buying a card) ───────────────────────────────────────
    async function spendStars(amount) {
        if (!membership) return { error: "No membership" };
        const newStars = Math.max(0, (membership.stars ?? 0) - amount);

        const { data, error } = await supabase
            .from("group_stars")
            .update({ stars: newStars })
            .eq("user_id", userId)
            .eq("group_id", groupId)
            .select()
            .single();

        if (!error && data) setMembership(data);
        return { data, error };
    }

    // ── Earn stars (voting, activity rewards, etc.) ───────────────────────
    async function addStars(amount) {
        if (!membership) return { error: "No membership" };
        const newStars = (membership.stars ?? 0) + amount;

        const { data, error } = await supabase
            .from("group_stars")
            .update({ stars: newStars })
            .eq("user_id", userId)
            .eq("group_id", groupId)
            .select()
            .single();

        if (!error && data) setMembership(data);
        return { data, error };
    }

    return {
        membership,                          // full row or null
        loading,
        checked,                             // true once initial DB check is done
        isNewMember: checked && !membership, // true = user has never entered this group
        stars: membership?.stars ?? 0,
        joinedAt: membership?.joined_at ?? null,
        joinGroup,
        spendStars,
        addStars,
        reload: load,
    };
}



// useAllGroupMembership
// Fetches all groups the user has joined- used on the Profile page to
// show the "My Fandoms" section with per-group star balances.
export function useAllGroupMemberships(userId) {
    const [memberships, setMemberships] = useState([]);
    const [loading,     setLoading]     = useState(true);

    useEffect(() => {
        if (!userId) { setLoading(false); return; }

        async function load() {
            const { data } = await supabase
                .from("group_stars")
                .select("group_id, stars, joined_at")
                .eq("user_id", userId)
                .order("joined_at", { ascending: true });

            setMemberships(data ?? []);
            setLoading(false);
        }

        load();
    }, [userId]);

    return { memberships, loading };
}