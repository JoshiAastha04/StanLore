import { useState, useEffect } from "react";
import { submitGroupSuggestion, fetchGroupSuggestions } from "../../lib/supabase";
import "../../styles/globals.css";
import "../../styles/Components.css";

export default function SuggestGroupModal({ onClose, userId }) {
    const [groupName,    setGroupName]    = useState("");
    const [note,         setNote]         = useState("");
    const [email,        setEmail]        = useState("");
    const [loading,      setLoading]      = useState(false);
    const [submitted,    setSubmitted]    = useState(false);
    const [error,        setError]        = useState("");
    const [existing,     setExisting]     = useState([]);

    // Load existing suggestions so user can see what's already been asked for
    useEffect(() => {
        fetchGroupSuggestions().then(setExisting);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!groupName.trim()) return;
        setLoading(true);
        setError("");

        const ok = await submitGroupSuggestion({
            groupName: groupName.trim(),
            note:      note.trim() || null,
            userId:    userId || null,
            email:     !userId ? email : null,   // only ask for email if not logged in
        });

        setLoading(false);
        if (ok) {
            setSubmitted(true);
        } else {
            setError("Something went wrong. Please try again.");
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={{ width: 420, maxWidth: "calc(100vw - 32px)" }}
                onClick={e => e.stopPropagation()}
            >
                {submitted ? (
                    // ── Success state ──
                    <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                        <div style={{
                            fontFamily: "var(--font-serif)", fontSize: 36,
                            color: "var(--text-success)", marginBottom: 12
                        }}>✦</div>
                        <h3 style={{
                            fontFamily: "var(--font-serif)", fontSize: 22,
                            fontWeight: 300, color: "var(--text-secondary)", marginBottom: 8
                        }}>
                            Suggestion sent!
                        </h3>
                        <p style={{ fontSize: 13, color: "var(--text-faint)", lineHeight: 1.6, marginBottom: 20 }}>
                            We'll review it and add it to the vote count.
                            The most requested groups get added next.
                        </p>
                        <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
                    </div>
                ) : (
                    <>
                        {/* ── Header ── */}
                        <h3 style={{
                            fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 300,
                            color: "var(--text-secondary)", marginBottom: 4,
                        }}>
                            Suggest a group
                        </h3>
                        <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 20 }}>
                            Most-requested groups get added first. You can also upvote existing suggestions below.
                        </p>

                        {/* ── Existing suggestions (upvote) ── */}
                        {existing.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <div className="section-label" style={{ marginBottom: 10 }}>
                                    Already requested — click to upvote
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {existing.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setGroupName(s.group_name)}
                                            style={{
                                                padding: "5px 12px",
                                                borderRadius: "var(--radius-pill)",
                                                background: groupName === s.group_name
                                                    ? "var(--purple-main)" : "rgba(175,169,236,0.08)",
                                                border: "0.5px solid var(--border-soft)",
                                                color: groupName === s.group_name
                                                    ? "var(--bg-deep)" : "var(--text-muted)",
                                                fontSize: 12, cursor: "pointer",
                                                fontFamily: "var(--font-sans)",
                                                transition: "all var(--transition-fast)",
                                            }}
                                        >
                                            {s.group_name}
                                            <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 10 }}>
                                                {s.votes}↑
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Form ── */}
                        {error && (
                            <div className="auth-alert auth-alert--error" style={{ marginBottom: 14 }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div>
                                <div className="section-label">Group name *</div>
                                <input
                                    className="input"
                                    placeholder="e.g. BLACKPINK, aespa, TWICE..."
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <div className="section-label">Why should we add them? (optional)</div>
                                <input
                                    className="input"
                                    placeholder="e.g. huge photocard community, lots of versions..."
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                />
                            </div>

                            {/* Only ask for email if user isn't logged in */}
                            {!userId && (
                                <div>
                                    <div className="section-label">Your email (optional — we'll notify you when added)</div>
                                    <input
                                        className="input"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            )}

                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                    disabled={loading || !groupName.trim()}
                                >
                                    {loading ? "Sending..." : "Submit suggestion"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
