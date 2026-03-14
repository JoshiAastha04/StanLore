import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LandingPage  from "./pages/Landing/LandingPage";
import HomePage     from "./pages/Home/HomePage";
import AuthPage     from "./pages/Auth/AuthPage";
import ProfilePage  from "./pages/Profile/ProfilePage";

// ─── Router ───────────────────────────────────────────────────────────────────
// Simple client-side router — replace with React Router when you add more pages
function Router() {
  const { isLoggedIn, loading } = useAuth();
  const [page, setPage] = useState("landing"); // landing | auth | home | profile
  const [profileUser, setProfileUser] = useState(null);

  // Show nothing while auth state is loading
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

  // Once logged in, always show home (unless viewing a profile)
  if (isLoggedIn && page !== "profile") {
    return (
        <HomePage
            onProfile={(username) => { setProfileUser(username); setPage("profile"); }}
        />
    );
  }

  if (page === "profile" && profileUser) {
    return (
        <ProfilePage
            username={profileUser}
            onHome={() => { setProfileUser(null); setPage(isLoggedIn ? "home" : "landing"); }}
        />
    );
  }

  if (page === "auth") {
    return (
        <AuthPage
            onBack={() => setPage("landing")}
        />
    );
  }

  // Default: landing page
  return (
      <LandingPage
          onEnter={() => setPage("auth")}
      />
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
      <AuthProvider>
        <Router />
      </AuthProvider>
  );
}
