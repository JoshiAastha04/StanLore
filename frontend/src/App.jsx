import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LandingPage from "./pages/Landing/LandingPage";
import HomePage from "./pages/Home/HomePage";
import AuthPage from "./pages/Auth/AuthPage";
import ProfilePage from "./pages/Profile/ProfilePage";

function Router() {
    const { isLoggedIn, loading, signOut } = useAuth();
    const [page, setPage] = useState("landing");
    const [profileUser, setProfileUser] = useState(null);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#1a1830",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 24,
                    color: "#534AB7",
                    fontStyle: "italic",
                }}
            >
                Loading...
            </div>
        );
    }

    if (isLoggedIn && page !== "profile") {
        return (
            <HomePage
                onProfile={(username) => {
                    setProfileUser(username);
                    setPage("profile");
                }}
                onSignOut={async () => {
                    const { error } = await signOut();
                    if (!error) {
                        setProfileUser(null);
                        setPage("landing");
                    }
                }}
            />
        );
    }

    if (page === "profile" && profileUser) {
        return (
            <ProfilePage
                username={profileUser}
                onHome={() => {
                    setProfileUser(null);
                    setPage(isLoggedIn ? "home" : "landing");
                }}
            />
        );
    }

    if (page === "auth") {
        return <AuthPage onBack={() => setPage("landing")} />;
    }

    return <LandingPage onEnter={() => setPage("auth")} />;
}

export default function App() {
    return (
        <AuthProvider>
            <Router />
        </AuthProvider>
    );
}