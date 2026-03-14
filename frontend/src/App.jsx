import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LandingPage  from "./pages/Landing/LandingPage";
import AuthPage     from "./pages/Auth/AuthPage";
import GrpSelect    from "./pages/GrpSelect/GrpSelect";
import HomePage     from "./pages/Home/HomePage";
import ProfilePage  from "./pages/Profile/ProfilePage";
import LorePage     from "./pages/Lore/LorePage";
import UpdatesPage  from "./pages/Updates/UpdatesPage";
import "./styles/globals.css";
import './styles/Mobile.css'

function Router() {
    const { isLoggedIn, loading, signOut } = useAuth();
    const [page, setPage]               = useState("landing");
    const [profileUser, setProfileUser] = useState(null);
    const [activeGroup, setActiveGroup] = useState(null);
    const [guestMode, setGuestMode]     = useState(false);

    // Fix #4 — auto-redirect after sign-in without refresh
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

    // Auth page
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
            />
        );
    }

    // Lore — guests can read, but prompts sign-up to interact
    if (page === "lore") {
        return (
            <LorePage
                isGuest={!isLoggedIn}
                onBack={() => setPage(isLoggedIn ? "home" : "grpselect")}
                onSignIn={() => setPage("auth")}
            />
        );
    }

    // Updates — same guest rules
    if (page === "updates") {
        return (
            <UpdatesPage
                isGuest={!isLoggedIn}
                onBack={() => setPage(isLoggedIn ? "home" : "grpselect")}
                onSignIn={() => setPage("auth")}
            />
        );
    }

    // Home (logged-in only)
    if (page === "home" && isLoggedIn) {
        return (
            <HomePage
                activeGroup={activeGroup}
                onProfile={(username) => { setProfileUser(username); setPage("profile"); }}
                onLore={() => setPage("lore")}
                onUpdates={() => setPage("updates")}
                onGroupSwitch={() => setPage("grpselect")}
                onSignOut={async () => {
                    await signOut();
                    setProfileUser(null);
                    setActiveGroup(null);
                    setGuestMode(false);
                    setPage("landing");
                }}
            />
        );
    }

    // GrpSelect — shown to both logged-in users AND guests browsing
    if (page === "grpselect" || guestMode || isLoggedIn) {
        return (
            <GrpSelect
                isGuest={!isLoggedIn}
                onEnter={(group) => {
                    // Fix #5 — guests see the page but must sign up to enter
                    if (!isLoggedIn) {
                        setPage("auth");
                        return;
                    }
                    setActiveGroup(group);
                    setPage("home");
                }}
                onLore={() => setPage("lore")}
                onUpdates={() => setPage("updates")}
                onSignIn={() => setPage("auth")}
                onSignOut={isLoggedIn ? async () => {
                    await signOut();
                    setGuestMode(false);
                    setPage("landing");
                } : null}
            />
        );
    }

    // Landing — for brand-new visitors
    return (
        <LandingPage
            onEnter={() => setPage("auth")}
            onBrowse={() => {       // Fix #5 — "Browse the app" → GrpSelect without auth
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
