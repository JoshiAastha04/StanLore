import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user,    setUser]    = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Fetch profile from Supabase (called on login + after updates) ──────────
    async function fetchProfile(userId) {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            console.error("Profile fetch error:", error);
            setProfile(null);
            return;
        }
        setProfile(data ?? null);
    }

    // ── Init: restore session on page load ────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) console.error("Session fetch error:", error);
                if (!mounted) return;

                const currentUser = session?.user ?? null;
                setUser(currentUser);
                if (currentUser) await fetchProfile(currentUser.id);
                else setProfile(null);
            } catch (err) {
                console.error("Auth init error:", err);
                if (mounted) { setUser(null); setProfile(null); }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) fetchProfile(currentUser.id);
            else setProfile(null);
            setLoading(false);
        });

        return () => { mounted = false; subscription.unsubscribe(); };
    }, []);

    // ── Sign up ───────────────────────────────────────────────────────────────
    // After Supabase creates the auth user, we update their profile row
    // to grant 20 starter stars. The profiles row is created by a Supabase
    // trigger (handle_new_user) — we just patch stars onto it.
    async function signUp(email, password, username) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    display_name: username,
                },
            },
        });

        if (!error && data?.user) {
            // Give new user 20 starter stars so they can collect right away.
            // We upsert in case the trigger hasn't run yet.
            await supabase
                .from("profiles")
                .upsert({
                    id:           data.user.id,
                    username,
                    display_name: username,
                    stars:        20,
                }, { onConflict: "id" });
        }

        return { data, error };
    }

    // ── Sign in ───────────────────────────────────────────────────────────────
    async function signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    }

    // ── Sign out ──────────────────────────────────────────────────────────────
    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (!error) { setUser(null); setProfile(null); }
        return { error };
    }

    // ── Update profile (bio, username, display_name etc.) ─────────────────────
    async function updateProfile(updates) {
        if (!user) return { error: "Not logged in" };

        const { data, error } = await supabase
            .from("profiles")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", user.id)
            .select()
            .single();

        if (!error) setProfile(data);
        return { data, error };
    }

    // ── Spend stars (buy a card from catalog) ─────────────────────────────────
    // Atomically deducts stars + inserts collection row via Supabase RPC.
    // Falls back to direct update if RPC not available yet.
    async function spendStars(cardId, cost) {
        if (!user) return { success: false, error: "Not logged in" };
        if ((profile?.stars ?? 0) < cost) return { success: false, error: "insufficient_stars" };

        try {
            // Try atomic RPC first (from migration_rewards.sql)
            const { data, error } = await supabase.rpc("spend_stars_for_card", {
                p_user_id: user.id,
                p_card_id: cardId,
                p_cost:    cost,
            });

            if (error) throw error;

            if (data?.success) {
                // Refresh profile so stars display updates everywhere instantly
                await fetchProfile(user.id);
                return { success: true, newBalance: data.new_balance };
            }

            return { success: false, error: data?.error ?? "Unknown error" };

        } catch {
            // RPC not set up yet — fall back to direct update
            const newStars = (profile?.stars ?? 0) - cost;

            const { error: collErr } = await supabase
                .from("collection")
                .upsert({ user_id: user.id, card_id: cardId, status: "owned" },
                    { onConflict: "user_id,card_id" });

            if (collErr) return { success: false, error: collErr.message };

            const { error: starErr } = await supabase
                .from("profiles")
                .update({ stars: newStars })
                .eq("id", user.id);

            if (starErr) return { success: false, error: starErr.message };

            // Refresh profile so stars update everywhere
            await fetchProfile(user.id);
            return { success: true, newBalance: newStars };
        }
    }

    // ── Earn stars (daily login, era complete, trade etc.) ────────────────────
    async function earnStars(amount, reason) {
        if (!user) return;
        try {
            await supabase.rpc("earn_stars", {
                p_user_id: user.id,
                p_amount:  amount,
                p_reason:  reason,
            });
        } catch {
            // RPC not set up — direct update fallback
            await supabase
                .from("profiles")
                .update({ stars: (profile?.stars ?? 0) + amount })
                .eq("id", user.id);
        }
        // Always refresh so the sidebar/topbar star count updates
        await fetchProfile(user.id);
    }

    // ── Refresh profile manually (call after any external star change) ────────
    async function refreshProfile() {
        if (user) await fetchProfile(user.id);
    }

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            signUp,
            signIn,
            signOut,
            updateProfile,
            spendStars,
            earnStars,
            refreshProfile,
            isLoggedIn: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
