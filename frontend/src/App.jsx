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
import "./styles/globals.css";

function Router() {
    const { isLoggedIn, loading, signOut, isRecovery, clearRecovery } = useAuth();
    const [page, setPage]               = useState("landing");
    const [profileUser, setProfileUser] = useState(null);
    const [activeGroup, setActiveGroup] = useState(null);
    const [guestMode, setGuestMode]     = useState(false);
    const [catalogOnLoad, setCatalogOnLoad] = useState(false);

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
        return <AuthPage onBack={() => setPage(guestMode ? "grpselect" : "landing")} />;
    }

    // Profile
    if (page === "profile" && profileUser) {
        return (
            <ProfilePage
                username={profileUser}
                onHome={() => {
                    setProfileUser(null);
                    setPage(isLoggedIn ? "home" : "grpselect");
                }}
                onCatalog={() => {
                    // Go home first, then the catalog tab opens via state
                    setProfileUser(null);
                    setPage("home");
                    setCatalogOnLoad(true);   // signal HomePage to open catalog tab
                }}
            />
        );
    }

    // Lore
    if (page === "lore") {
        return (
            <LorePage
                isGuest={!isLoggedIn}
                onBack={() => setPage(isLoggedIn ? "home" : "grpselect")}
                onSignIn={() => setPage("auth")}
                onHome={() => setPage(isLoggedIn ? "home" : "grpselect")}
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
                onBack={() => setPage(isLoggedIn ? "home" : "grpselect")}
                onSignIn={() => setPage("auth")}
                onHome={() => setPage(isLoggedIn ? "home" : "grpselect")}
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
                isGuest={!isLoggedIn}
                onBack={() => setPage(isLoggedIn ? "home" : "grpselect")}
                onSignIn={() => setPage("auth")}
                onHome={() => setPage(isLoggedIn ? "home" : "grpselect")}
                onCatalog={() => setPage("catalog")}
                onUpdates={() => setPage("updates")}
                onStyle={() => setPage("style")}
                onLore={() => setPage("lore")}
            />
        );
    }

    // Style / Fashion
    if (page === "style") {
        return (
            <StylePage
                isGuest={!isLoggedIn}
                onBack={() => setPage(isLoggedIn ? "home" : "grpselect")}
                onSignIn={() => setPage("auth")}
                onHome={() => setPage(isLoggedIn ? "home" : "grpselect")}
                onCatalog={() => setPage("catalog")}
                onUpdates={() => setPage("updates")}
                onStyle={() => setPage("style")}
                onLore={() => setPage("lore")}
            />
        );
    }

    // Home (logged-in)
    if (page === "home" && isLoggedIn) {
        return (
            <HomePage
                activeGroup={activeGroup}
                initialTab={catalogOnLoad ? "catalog" : "collection"}
                onProfile={(username) => { setProfileUser(username); setPage("profile"); setCatalogOnLoad(false); }}
                onLore={() => setPage("lore")}
                onUpdates={() => setPage("updates")}
                onStyle={() => setPage("style")}
                onCatalog={() => setPage("catalog")}
                onGroupSwitch={() => setPage("grpselect")}
                onSignOut={async () => {
                    await signOut();
                    setProfileUser(null);
                    setActiveGroup(null);
                    setGuestMode(false);
                    setCatalogOnLoad(false);
                    setPage("landing");
                }}
            />
        );
    }

    // GrpSelect — shown to logged-in users AND guests
    if (page === "grpselect" || guestMode || isLoggedIn) {
        return (
            <GrpSelect
                isGuest={!isLoggedIn}
                onEnter={(group) => {
                    if (!isLoggedIn) { setPage("auth"); return; }
                    setActiveGroup(group);
                    setPage("home");
                }}
                onLore={() => setPage("lore")}
                onUpdates={() => setPage("updates")}
                onCatalog={() => setPage("catalog")}
                onSignIn={() => setPage("auth")}
                onSignOut={isLoggedIn ? async () => {
                    await signOut();
                    setGuestMode(false);
                    setPage("landing");
                } : null}
            />
        );
    }

    // Landing
    return (
        <LandingPage
            onEnter={() => setPage("auth")}
            onBrowse={() => {
                setGuestMode(true);
                setPage("grpselect");
            }}
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