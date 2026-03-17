import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LandingPage  from "./pages/Landing/LandingPage";
import AuthPage     from "./pages/Auth/AuthPage";
import GrpSelect    from "./pages/GrpSelect/GrpSelect";
import HomePage     from "./pages/Home/HomePage";
import ProfilePage  from "./pages/Profile/ProfilePage";
import LorePage     from "./pages/Lore/LorePage";
import UpdatesPage  from "./pages/Updates/UpdatesPage";
import StylePage    from "./pages/Fashion/StylePage";
import CatalogPage  from "./pages/Catalog/CatalogPage";
import TradesPage   from "./pages/Trades/TradesPage";
import "./styles/globals.css";

// Pages worth restoring on refresh (skip landing / auth / grpselect / profile)
const PERSISTABLE = new Set(["home", "catalog", "trades", "lore", "updates", "style"]);

function Router() {
    const { isLoggedIn, loading, signOut, isRecovery, clearRecovery } = useAuth();

    // ── Restore page + active group from localStorage on first render ────────
    const [page, setPage] = useState(() => {
        try {
            const saved = localStorage.getItem("stanlore_page");
            return PERSISTABLE.has(saved) ? saved : "landing";
        } catch { return "landing"; }
    });
    const [activeGroup, setActiveGroup] = useState(() => {
        try {
            const saved = localStorage.getItem("stanlore_activeGroup");
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const [profileUser, setProfileUser]     = useState(null);
    const [guestMode, setGuestMode]         = useState(false);
    const [catalogOnLoad, setCatalogOnLoad] = useState(false);
    const [authMode, setAuthMode]           = useState("signin"); // "signin" | "signup"

    // Helper — navigate to auth in signup mode
    function goCreateAccount() { setAuthMode("signup"); setPage("auth"); }
    // Helper — navigate to auth in signin mode
    function goSignIn()        { setAuthMode("signin"); setPage("auth"); }

    // ── Persist page on every change ────────────────────────────────────────
    useEffect(() => {
        try {
            if (PERSISTABLE.has(page)) {
                localStorage.setItem("stanlore_page", page);
            } else {
                localStorage.removeItem("stanlore_page");
            }
        } catch {}
    }, [page]);

    // ── Persist active group on every change ────────────────────────────────
    useEffect(() => {
        try {
            if (activeGroup) {
                localStorage.setItem("stanlore_activeGroup", JSON.stringify(activeGroup));
            } else {
                localStorage.removeItem("stanlore_activeGroup");
            }
        } catch {}
    }, [activeGroup]);

    // Auto-redirect after sign-in — no manual refresh needed
    useEffect(() => {
        if (isLoggedIn && (page === "auth" || page === "landing")) {
            setPage("grpselect");
        }
    }, [isLoggedIn]);

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh", background: "#1a1830",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 24, color: "#534AB7", fontStyle: "italic",
            }}>
                Loading...
            </div>
        );
    }

    // Password recovery — show set new password form directly
    // Triggered when user clicks reset link in email (Supabase fires PASSWORD_RECOVERY event)
    if (isRecovery) {
        return <AuthPage isRecovery={true} onRecoveryDone={clearRecovery} />;
    }

    // Auth
    if (page === "auth") {
        return (
            <AuthPage
                initialMode={authMode}
                onBack={() => setPage(guestMode || !isLoggedIn ? (activeGroup ? "home" : "grpselect") : "landing")}
            />
        );
    }

    // Profile
    if (page === "profile") {
        return (
            <ProfilePage
                onHome={() => {
                    setProfileUser(null);
                    setPage(isLoggedIn ? "home" : "grpselect");
                }}
                onCatalog={() => {
                    setProfileUser(null);
                    setPage("home");
                    setCatalogOnLoad(true);
                }}
                onSignOut={isLoggedIn ? async () => {
                    await signOut();
                    localStorage.removeItem("stanlore_page");
                    localStorage.removeItem("stanlore_activeGroup");
                    setProfileUser(null); setActiveGroup(null);
                    setGuestMode(false); setCatalogOnLoad(false);
                    setPage("landing");
                } : null}
                onSignIn={goSignIn}
                onCreateAccount={goCreateAccount}
            />
        );
    }

    // Lore
    if (page === "lore") {
        return (
            <LorePage
                isGuest={!isLoggedIn}
                onBack={() => setPage(isLoggedIn || activeGroup ? "home" : "grpselect")}
                onSignIn={goSignIn}
                onHome={() => setPage(isLoggedIn || activeGroup ? "home" : "grpselect")}
                onCatalog={() => setPage("catalog")}
                onUpdates={() => setPage("updates")}
                onStyle={() => setPage("style")}
                onLore={() => setPage("lore")}
            />
        );
    }

    // Updates
    if (page === "updates") {
        return (
            <UpdatesPage
                isGuest={!isLoggedIn}
                onBack={() => setPage(isLoggedIn || activeGroup ? "home" : "grpselect")}
                onSignIn={goSignIn}
                onHome={() => setPage(isLoggedIn || activeGroup ? "home" : "grpselect")}
                onCatalog={() => setPage("catalog")}
                onUpdates={() => setPage("updates")}
                onStyle={() => setPage("style")}
                onLore={() => setPage("lore")}
            />
        );
    }

    // Catalog — accessible to guests too, but add/wishlist require sign-in
    if (page === "catalog") {
        return (
            <CatalogPage
                activeGroup={activeGroup}
                isGuest={!isLoggedIn}
                onBack={() => setPage(isLoggedIn || activeGroup ? "home" : "grpselect")}
                onSignIn={goSignIn}
                onHome={() => setPage(isLoggedIn || activeGroup ? "home" : "grpselect")}
                onCatalog={() => setPage("catalog")}
                onUpdates={() => setPage("updates")}
                onStyle={() => setPage("style")}
                onLore={() => setPage("lore")}
            />
        );
    }

    // Trades — logged-in only
    if (page === "trades" && isLoggedIn) {
        return (
            <TradesPage
                activeGroup={activeGroup}
                onBack={() => setPage("home")}
                onHome={() => setPage("home")}
                onCatalog={() => setPage("catalog")}
                onUpdates={() => setPage("updates")}
                onStyle={() => setPage("style")}
                onLore={() => setPage("lore")}
                onTrades={() => setPage("trades")}
            />
        );
    }

    // Style / Fashion
    if (page === "style") {
        return (
            <StylePage
                isGuest={!isLoggedIn}
                onBack={() => setPage(isLoggedIn || activeGroup ? "home" : "grpselect")}
                onSignIn={goSignIn}
                onHome={() => setPage(isLoggedIn || activeGroup ? "home" : "grpselect")}
                onCatalog={() => setPage("catalog")}
                onUpdates={() => setPage("updates")}
                onStyle={() => setPage("style")}
                onLore={() => setPage("lore")}
            />
        );
    }

    // Home — logged-in users AND browsing guests
    if (page === "home" && (isLoggedIn || activeGroup)) {
        return (
            <HomePage
                activeGroup={activeGroup}
                isGuest={!isLoggedIn}
                initialTab={catalogOnLoad ? "catalog" : "collection"}
                onProfile={(username) => {
                    if (!isLoggedIn) { goCreateAccount(); return; }
                    setProfileUser(username); setPage("profile"); setCatalogOnLoad(false);
                }}
                onLore={() => setPage("lore")}
                onUpdates={() => setPage("updates")}
                onStyle={() => setPage("style")}
                onCatalog={() => setPage("catalog")}
                onTrades={() => isLoggedIn ? setPage("trades") : goSignIn()}
                onGroupSwitch={() => setPage("grpselect")}
                onSignIn={goSignIn}
                onCreateAccount={goCreateAccount}
                onSignOut={isLoggedIn ? async () => {
                    await signOut();
                    localStorage.removeItem("stanlore_page");
                    localStorage.removeItem("stanlore_activeGroup");
                    setProfileUser(null); setActiveGroup(null);
                    setGuestMode(false); setCatalogOnLoad(false);
                    setPage("landing");
                } : null}
            />
        );
    }

    // GrpSelect — shown to logged-in users AND guests
    if (page === "grpselect" || guestMode || isLoggedIn) {
        return (
            <GrpSelect
                isGuest={!isLoggedIn}
                onEnter={(group) => {
                    // Guests can browse — they enter home in read-only mode
                    setActiveGroup(group);
                    setPage("home");
                }}
                onLore={() => setPage("lore")}
                onUpdates={() => setPage("updates")}
                onCatalog={() => setPage("catalog")}
                onSignIn={goSignIn}
                onSignOut={isLoggedIn ? async () => {
                    await signOut();
                    localStorage.removeItem("stanlore_page");
                    localStorage.removeItem("stanlore_activeGroup");
                    setGuestMode(false);
                    setPage("landing");
                } : null}
            />
        );
    }

    // Landing
    return (
        <LandingPage
            onEnter={goSignIn}
            onBrowse={() => { setGuestMode(true); setPage("grpselect"); }}
            onCreateAccount={goCreateAccount}
        />
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router />
        </AuthProvider>
    );
}