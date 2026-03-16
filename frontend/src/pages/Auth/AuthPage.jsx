import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import "./auth.css";

// ─── Preview cards for left panel ────────────────────────────────────────────
const PREVIEW_CARDS = [
    { ver: "Ver. A", status: "owned" },
    { ver: "Ver. B", status: "owned" },
    { ver: "Ver. C", status: "wishlist" },
    { ver: "Ver. D", status: "missing" },
    { ver: "Ver. E", status: "owned" },
    { ver: "Ver. F", status: "duplicate" },
    { ver: "Ver. G", status: "owned" },
    { ver: "Ver. H", status: "missing" },
];

// ─── Left decorative panel ────────────────────────────────────────────────────
function AuthLeft() {
    return (
        <div className="auth-left">
            <div className="auth-left__orb-1" />
            <div className="auth-left__orb-2" />

            <div className="auth-left__fc auth-left__fc--1" />
            <div className="auth-left__fc auth-left__fc--2" />
            <div className="auth-left__fc auth-left__fc--3" />
            <div className="auth-left__fc auth-left__fc--4" />

            {/* Binder preview */}
            <div className="auth-left__binder">
                <div className="auth-left__binder-header">
                    <div className="auth-left__binder-avatar">JK</div>
                    <div style={{ flex: 1 }}>
                        <div className="auth-left__binder-name">Jungkook</div>
                        <div className="auth-left__binder-era">Butter Era</div>
                    </div>
                    <div className="auth-left__binder-count">5 / 8</div>
                </div>

                <div className="auth-left__binder-grid">
                    {PREVIEW_CARDS.map((card, i) => (
                        <div key={i} className={`auth-left__pc auth-left__pc--${card.status}`}>
                            <div className="auth-left__pc-ver">{card.ver}</div>
                            <span className={`auth-left__pc-badge auth-left__pc-badge--${card.status}`}>
                {card.status}
              </span>
                        </div>
                    ))}
                </div>

                <div className="auth-left__binder-footer">
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Butter Era</span>
                    <div className="auth-left__progress-track">
                        <div className="auth-left__progress-fill" style={{ width: "63%" }} />
                    </div>
                    <span style={{ fontSize: 10, color: "var(--purple-light)" }}>63%</span>
                </div>
            </div>

            <div className="auth-left__tagline">
                Your collection,<br />every era.
            </div>
            <div className="auth-left__sub">Track every photocard. Free, forever.</div>
        </div>
    );
}

// ─── Sign In form ─────────────────────────────────────────────────────────────
function SignInForm({ onSwitch, onForgot }) {
    const { signIn } = useAuth();
    const [email,    setEmail]   = useState("");
    const [password, setPassword] = useState("");
    const [error,    setError]   = useState("");
    const [loading,  setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
        setLoading(false);
    }

    return (
        <div className="auth-form-wrap">
            <div className="auth-title">Welcome back, <em>Stannies</em></div>
            <div className="auth-sub">Sign in to your collection</div>

            {error && <div className="auth-alert auth-alert--error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="auth-submit" type="submit" disabled={loading}>
                    {loading
                        ? <><div className="auth-spinner" /> Signing in...</>
                        : "Sign in"
                    }
                </button>
            </form>

            <div className="auth-switch">
                <button className="auth-switch-btn" onClick={onForgot}
                        style={{ display: "block", marginBottom: 10, color: "var(--text-faint)" }}>
                    Forgot password?
                </button>
                Don't have an account?{" "}
                <button className="auth-switch-btn" onClick={onSwitch}>Create one</button>
            </div>
        </div>
    );
}

// ─── Sign Up form ─────────────────────────────────────────────────────────────
function SignUpForm({ onSwitch }) {
    const { signUp } = useAuth();
    const [username, setUsername] = useState("");
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [error,    setError]    = useState("");
    const [success,  setSuccess]  = useState(false);
    const [loading,  setLoading]  = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
            setError("Username must be 3–20 characters: lowercase letters, numbers, underscores only");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        const { error } = await signUp(email, password, username);
        if (error) setError(error.message);
        else setSuccess(true);
        setLoading(false);
    }

    if (success) {
        return (
            <div className="auth-form-wrap">
                <div className="auth-title">Almost there <em>💜</em></div>
                <div className="auth-alert auth-alert--success" style={{ marginTop: 20 }}>
                    Check your email to confirm your account — then come back and sign in.
                </div>
                <button className="auth-submit" onClick={onSwitch} style={{ marginTop: 8 }}>
                    Back to sign in
                </button>
            </div>
        );
    }

    return (
        <div className="auth-form-wrap">
            <div className="auth-title">Join <em>Stanlore</em></div>
            <div className="auth-sub">Start building your collection</div>

            {error && <div className="auth-alert auth-alert--error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label className="auth-label">Username</label>
                    <input
                        className="auth-input"
                        type="text"
                        placeholder="army_collector"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        required
                        autoFocus
                    />
                    <div className="auth-input-hint">
                        Your public @handle — letters, numbers, underscores only.
                    </div>
                </div>
                <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="at least 6 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="auth-submit" type="submit" disabled={loading}>
                    {loading
                        ? <><div className="auth-spinner" /> Creating account...</>
                        : "Create account"
                    }
                </button>
            </form>

            <div className="auth-switch">
                Already have an account?{" "}
                <button className="auth-switch-btn" onClick={onSwitch}>Sign in</button>
            </div>
        </div>
    );
}


// ─── Set new password form (shown after clicking reset link in email) ─────────
function SetNewPasswordForm({ onDone }) {
    const [password,  setPassword]  = useState("");
    const [confirm,   setConfirm]   = useState("");
    const [saving,    setSaving]    = useState(false);
    const [done,      setDone]      = useState(false);
    const [error,     setError]     = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        if (password !== confirm)  { setError("Passwords don't match."); return; }
        setSaving(true); setError("");

        // supabase.auth.updateUser saves the new password — Supabase handles
        // the session automatically when user arrives via the recovery link
        const { error } = await supabase.auth.updateUser({ password });
        setSaving(false);
        if (error) setError(error.message);
        else setDone(true);
    }

    if (done) {
        return (
            <div className="auth-form-wrap">
                <div className="auth-title">Password updated <em>💜</em></div>
                <div className="auth-alert auth-alert--success" style={{ marginTop: 20 }}>
                    Your new password is saved. You can now sign in.
                </div>
                <button className="auth-submit" onClick={() => { window.location.hash = ""; onDone?.(); }} style={{ marginTop: 8 }}>
                    Go to sign in
                </button>
            </div>
        );
    }

    return (
        <div className="auth-form-wrap">
            <div className="auth-title">Set new <em>password</em></div>
            <div className="auth-sub">Choose a new password for your account</div>

            {error && <div className="auth-alert auth-alert--error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label className="auth-label">New password</label>
                    <input className="auth-input" type="password"
                           placeholder="at least 6 characters"
                           value={password} onChange={e => setPassword(e.target.value)}
                           required autoFocus />
                </div>
                <div className="auth-field">
                    <label className="auth-label">Confirm password</label>
                    <input className="auth-input" type="password"
                           placeholder="same password again"
                           value={confirm} onChange={e => setConfirm(e.target.value)}
                           required />
                </div>
                <button className="auth-submit" type="submit" disabled={saving}>
                    {saving ? <><div className="auth-spinner" /> Saving...</> : "Save new password"}
                </button>
            </form>
        </div>
    );
}

// ─── Forgot password form ─────────────────────────────────────────────────────
function ForgotPasswordForm({ onSwitch }) {
    const { resetPassword } = useAuth();
    const [email,   setEmail]   = useState("");
    const [sent,    setSent]    = useState(false);
    const [error,   setError]   = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const { error } = await resetPassword(email);
        if (error) setError(error.message);
        else setSent(true);
        setLoading(false);
    }

    if (sent) {
        return (
            <div className="auth-form-wrap">
                <div className="auth-title">Check your email <em>💜</em></div>
                <div className="auth-alert auth-alert--success" style={{ marginTop: 20 }}>
                    We sent a reset link to <strong>{email}</strong>. Tap it to set a new password.
                </div>
                <button className="auth-submit" onClick={() => onSwitch("signin")} style={{ marginTop: 8 }}>
                    Back to sign in
                </button>
            </div>
        );
    }

    return (
        <div className="auth-form-wrap">
            <div className="auth-title">Reset <em>password</em></div>
            <div className="auth-sub">Enter your email and we will send a reset link</div>
            {error && <div className="auth-alert auth-alert--error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <input className="auth-input" type="email"
                           placeholder="your@email.com"
                           value={email} onChange={e => setEmail(e.target.value)}
                           required autoFocus />
                </div>
                <button className="auth-submit" type="submit" disabled={loading}>
                    {loading ? <><div className="auth-spinner" /> Sending...</> : "Send reset link"}
                </button>
            </form>
            <div className="auth-switch">
                <button className="auth-switch-btn" onClick={() => onSwitch("signin")}>← Back to sign in</button>
            </div>
        </div>
    );
}

// ─── Auth page ────────────────────────────────────────────────────────────────
export default function AuthPage({ onBack, isRecovery = false, onRecoveryDone }) {
    const [mode, setMode] = useState("signin");

    return (
        <div className="auth-page">
            <AuthLeft />
            <div className="auth-right">
                {!isRecovery && onBack && (
                    <button className="auth-back" onClick={onBack}>← Back</button>
                )}
                <div className="auth-logo">
                    <div className="auth-logo-mark">S</div>
                    <span className="auth-logo-name">Stanlore</span>
                </div>
                {isRecovery ? (
                    <SetNewPasswordForm onDone={onRecoveryDone} />
                ) : (
                    <>
                        {mode === "signin" && <SignInForm onSwitch={() => setMode("signup")} onForgot={() => setMode("forgot")} />}
                        {mode === "signup" && <SignUpForm onSwitch={() => setMode("signin")} />}
                        {mode === "forgot" && <ForgotPasswordForm onSwitch={setMode} />}
                    </>
                )}
                <div className="auth-bottom-tagline">I purple your collection.</div>
            </div>
        </div>
    );
}