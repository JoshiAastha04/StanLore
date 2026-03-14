import { useState, useEffect } from "react";
import "../../styles/globals.css";

// ─── Floating card decoration ───────────────────────────────────────────────
function FloatCard({ style, className = "" }) {
    return (
        <div
            className={className}
            style={{
                position: "absolute",
                pointerEvents: "none",
                borderRadius: 10,
                ...style,
            }}
        />
    );
}


// ─── Stat pill ───────────────────────────────────────────────────────────────
function StatPill({ value, label }) {
    return (
        <div className="flex flex-col items-center px-6 py-3" style={{ borderRight: "0.5px solid rgba(175,169,236,0.2)" }}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "#CECBF6" }}>
        {value}
      </span>
            <span style={{ fontSize: 11, color: "#7F77DD", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </span>
        </div>
    );
}

// ─── Binder preview card ─────────────────────────────────────────────────────
const PREVIEW_CARDS = [
    { ver: "Ver. A", status: "owned",    statusBg: "#7F77DD", statusColor: "#EEEDFE", bg: "rgba(175,169,236,0.3)" },
    { ver: "Ver. B", status: "owned",    statusBg: "#7F77DD", statusColor: "#EEEDFE", bg: "rgba(175,169,236,0.3)" },
    { ver: "Ver. C", status: "wishlist", statusBg: "#F0997B", statusColor: "#4A1B0C", bg: "rgba(240,153,123,0.28)" },
    { ver: "Ver. D", status: "missing",  statusBg: "rgba(175,169,236,0.15)", statusColor: "rgba(175,169,236,0.55)", bg: "rgba(255,255,255,0.05)" },
    { ver: "Ver. E", status: "owned",    statusBg: "#7F77DD", statusColor: "#EEEDFE", bg: "rgba(175,169,236,0.3)" },
    { ver: "Ver. F", status: "×2 dupe",  statusBg: "#534AB7", statusColor: "#EEEDFE", bg: "rgba(83,74,183,0.45)" },
    { ver: "Ver. G", status: "owned",    statusBg: "#7F77DD", statusColor: "#EEEDFE", bg: "rgba(175,169,236,0.3)" },
    { ver: "Ver. H", status: "missing",  statusBg: "rgba(175,169,236,0.15)", statusColor: "rgba(175,169,236,0.55)", bg: "rgba(255,255,255,0.05)" },
];

function BinderPreview() {
    return (
        <div style={{
            background: "rgba(38,33,92,0.55)",
            border: "0.5px solid rgba(175,169,236,0.2)",
            borderRadius: 20,
            overflow: "hidden",
            maxWidth: 520,
            margin: "0 auto",
        }}>
            {/* header */}
            <div style={{
                background: "rgba(83,74,183,0.3)",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom: "0.5px solid rgba(175,169,236,0.15)",
            }}>
                <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "#7F77DD", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 500, color: "#EEEDFE",
                }}>JK</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#CECBF6" }}>Jungkook</div>
                    <div style={{ fontSize: 11, color: "#7F77DD" }}>Butter Era</div>
                </div>
                <div style={{ fontSize: 11, color: "#AFA9EC" }}>5 / 8 owned</div>
            </div>

            {/* grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: 16 }}>
                {PREVIEW_CARDS.map((c, i) => (
                    <div
                        key={i}
                        style={{
                            background: c.bg,
                            borderRadius: 9,
                            aspectRatio: "2/3",
                            display: "flex",
                            alignItems: "flex-end",
                            padding: 6,
                            cursor: "default",
                            transition: "transform 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 500, color: "#CECBF6", marginBottom: 3 }}>{c.ver}</div>
                            <div style={{
                                fontSize: 8, fontWeight: 500,
                                padding: "2px 6px", borderRadius: 10,
                                background: c.statusBg, color: c.statusColor,
                                display: "inline-block",
                            }}>{c.status}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* footer progress */}
            <div style={{
                padding: "10px 20px",
                borderTop: "0.5px solid rgba(175,169,236,0.15)",
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(38,33,92,0.4)",
            }}>
                <span style={{ fontSize: 11, color: "#7F77DD" }}>Butter Era</span>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(175,169,236,0.15)" }}>
                    <div style={{ width: "63%", height: 3, borderRadius: 2, background: "#7F77DD" }} />
                </div>
                <span style={{ fontSize: 11, color: "#AFA9EC", fontWeight: 500 }}>63%</span>
            </div>
        </div>
    );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }) {
    return (
        <div
            style={{
                background: "rgba(38,33,92,0.45)",
                border: "0.5px solid rgba(175,169,236,0.15)",
                borderRadius: 16,
                padding: "1.5rem",
                animation: `fadeUp 0.7s ease forwards`,
                animationDelay: delay,
                opacity: 0,
                transition: "border-color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(175,169,236,0.4)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(175,169,236,0.15)"}
        >
            <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#CECBF6", marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 13, color: "#7F77DD", lineHeight: 1.6 }}>{desc}</div>
        </div>
    );
}

// ─── Main landing page ────────────────────────────────────────────────────────
export default function LandingPage({ onEnter }) {
    const [introPhase, setIntroPhase] = useState("blooming"); // blooming | fading | done
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // bloom holds for 2s, then fades out
        const t1 = setTimeout(() => setIntroPhase("fading"), 2600);
        const t2 = setTimeout(() => setIntroPhase("done"), 3500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    const handleWaitlist = (e) => {
        e.preventDefault();
        if (email) setSubmitted(true);
    };

    return (
        <div style={{
            fontFamily: "'DM Sans', sans-serif",
            background: "#1a1830",
            color: "#F1EFE8",
            minHeight: "100vh",
            position: "relative",
            overflowX: "hidden",
        }}>

            {/* ══════════════════════════════════════════
          INTRO OVERLAY
      ══════════════════════════════════════════ */}
            {introPhase !== "done" && (
                <div style={{
                    position: "fixed", inset: 0,
                    background: "#1a1830",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    zIndex: 200,
                    opacity: introPhase === "fading" ? 0 : 1,
                    transition: "opacity 0.9s ease",
                }}>
                    {/* S mark that blooms */}
                    <div style={{
                        width: 88, height: 88,
                        borderRadius: 22,
                        background: "#534AB7",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 48, fontWeight: 400, color: "#EEEDFE",
                        animation: "bloom 2.4s cubic-bezier(0.16,1,0.3,1) forwards",
                        transformOrigin: "center",
                    }}>S</div>

                    {/* Hello, ARMY */}
                    <div style={{
                        marginTop: 28,
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 30, fontWeight: 300, fontStyle: "italic",
                        color: "#AFA9EC", letterSpacing: "0.1em",
                        animation: "helloArmy 0.8s ease forwards",
                        animationDelay: "0.6s",
                        opacity: 0,
                    }}>Hello, ARMY</div>
                </div>
            )}

            {/* ══════════════════════════════════════════
          MAIN PAGE
      ══════════════════════════════════════════ */}
            <div style={{
                opacity: introPhase === "done" ? 1 : 0,
                transition: "opacity 1s ease",
                minHeight: "100vh",
            }}>

                {/* Ambient orbs */}
                <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                    <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(127,119,221,0.12) 0%, transparent 70%)", top: -150, right: -100 }} />
                    <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(83,74,183,0.1) 0%, transparent 70%)", bottom: 0, left: -80 }} />
                    <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,153,123,0.08) 0%, transparent 70%)", top: "40%", right: "5%" }} />
                </div>

                {/* Floating photocard decorations */}
                <FloatCard className="float-a" style={{ width: 52, height: 78, background: "rgba(175,169,236,0.15)", borderRadius: 10, top: 120, left: "6%", zIndex: 1 }} />
                <FloatCard className="float-b" style={{ width: 42, height: 63, background: "rgba(127,119,221,0.18)", borderRadius: 8, top: 200, right: "7%", zIndex: 1 }} />
                <FloatCard className="float-c" style={{ width: 34, height: 51, background: "rgba(240,153,123,0.15)", borderRadius: 8, top: "45%", left: "4%", zIndex: 1 }} />
                <FloatCard className="float-a" style={{ width: 44, height: 66, background: "rgba(83,74,183,0.2)", borderRadius: 9, bottom: 180, right: "5%", zIndex: 1 }} />

                {/* ── NAV ─────────────────────────────────── */}
                <nav style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 48px",
                    borderBottom: "0.5px solid rgba(175,169,236,0.12)",
                    position: "relative", zIndex: 10,
                    animation: "fadeUp 0.5s ease forwards",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 9,
                            background: "#534AB7",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 19, color: "#EEEDFE",
                        }}>S</div>
                        <span style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 21, fontWeight: 400, color: "#CECBF6", letterSpacing: "0.02em",
                        }}>Stanlore</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                        {["Features", "About", "Roadmap"].map(l => (
                            <span key={l} className="nav-link" style={{
                                fontSize: 13, color: "#7F77DD",
                                cursor: "pointer", letterSpacing: "0.02em",
                                transition: "color 0.2s",
                            }}>{l}</span>
                        ))}
                        <button
                            className="btn-primary"
                            onClick={onEnter}
                            style={{
                                background: "#7F77DD", color: "#1a1830",
                                border: "none", borderRadius: 24,
                                padding: "8px 20px", fontSize: 13, fontWeight: 500,
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                transition: "background 0.2s, transform 0.15s",
                            }}
                        >Sign in</button>
                    </div>
                </nav>

                {/* ── HERO ────────────────────────────────── */}
                <section style={{
                    padding: "28px 48px 48px",
                    textAlign: "center",
                    position: "relative", zIndex: 10,
                    maxWidth: 900, margin: "0 auto",
                }}>
                    <div style={{
                        display: "inline-block",
                        fontSize: 11, fontWeight: 500,
                        letterSpacing: "0.2em", textTransform: "uppercase",
                        color: "#7F77DD",
                        border: "0.5px solid rgba(127,119,221,0.4)",
                        borderRadius: 20, padding: "5px 16px",
                        marginBottom: 28,
                        animation: "fadeUp 0.6s ease forwards 0.1s", opacity: 0,
                    }}>For ARMY collectors</div>

                    <h1 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(44px, 7vw, 76px)",
                        fontWeight: 300, lineHeight: 1.08,
                        color: "#F1EFE8", marginBottom: 20,
                        animation: "fadeUp 0.7s ease forwards 0.2s", opacity: 0,
                    }}>
                        Your collection,<br />
                        <em style={{ fontStyle: "italic", color: "#AFA9EC" }}>every era.</em>
                    </h1>

                    <p style={{
                        fontSize: 17, fontWeight: 300,
                        color: "#7F77DD", lineHeight: 1.75,
                        maxWidth: 480, margin: "0 auto 40px",
                        animation: "fadeUp 0.7s ease forwards 0.35s", opacity: 0,
                    }}>
                        The digital binder built for the way ARMY actually collects.
                        Track every photocard you own, want, and have to trade — all in one place.
                    </p>

                    {/* Waitlist form */}
                    <div style={{
                        animation: "fadeUp 0.7s ease forwards 0.5s", opacity: 0,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                    }}>
                        {!submitted ? (
                            <form onSubmit={handleWaitlist} style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    style={{
                                        background: "rgba(38,33,92,0.6)",
                                        border: "0.5px solid rgba(175,169,236,0.3)",
                                        borderRadius: 24, padding: "11px 20px",
                                        fontSize: 14, color: "#F1EFE8",
                                        fontFamily: "'DM Sans', sans-serif",
                                        width: 260, outline: "none",
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{
                                        background: "#7F77DD", color: "#1a1830",
                                        border: "none", borderRadius: 24,
                                        padding: "11px 26px", fontSize: 14, fontWeight: 500,
                                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                        transition: "background 0.2s, transform 0.15s",
                                    }}
                                >Join the waitlist</button>
                            </form>
                        ) : (
                            <div style={{
                                background: "rgba(127,119,221,0.15)",
                                border: "0.5px solid rgba(127,119,221,0.4)",
                                borderRadius: 24, padding: "12px 28px",
                                fontSize: 14, color: "#CECBF6",
                                fontFamily: "'Cormorant Garamond', serif",
                                fontStyle: "italic",
                            }}>
                                You're on the list. We purple you ✦
                            </div>
                        )}
                        <button
                            className="btn-ghost"
                            onClick={onEnter}
                            style={{
                                background: "transparent", color: "#7F77DD",
                                border: "0.5px solid rgba(127,119,221,0.35)",
                                borderRadius: 24, padding: "11px 26px",
                                fontSize: 14, cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                transition: "border-color 0.2s, color 0.2s",
                            }}
                        >Preview the app →</button>
                    </div>
                </section>

                {/* ── STATS BAR ───────────────────────────── */}
                <div style={{
                    display: "flex", justifyContent: "center",
                    margin: "0 auto 64px",
                    maxWidth: 520,
                    border: "0.5px solid rgba(175,169,236,0.15)",
                    borderRadius: 16,
                    overflow: "hidden",
                    animation: "fadeUp 0.7s ease forwards 0.65s", opacity: 0,
                    position: "relative", zIndex: 10,
                }}>
                    <StatPill value="7" label="Members" />
                    <StatPill value="5+" label="Eras" />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 24px" }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "#CECBF6" }}>∞</span>
                        <span style={{ fontSize: 11, color: "#7F77DD", letterSpacing: "0.1em", textTransform: "uppercase" }}>Cards</span>
                    </div>
                </div>

                {/* ── BINDER PREVIEW ──────────────────────── */}
                <div style={{
                    padding: "0 48px 72px",
                    position: "relative", zIndex: 10,
                    animation: "fadeUp 0.8s ease forwards 0.7s", opacity: 0,
                }}>
                    <BinderPreview />
                </div>

                {/* ── FEATURES ────────────────────────────── */}
                <section style={{
                    padding: "0 48px 80px",
                    position: "relative", zIndex: 10,
                    maxWidth: 900, margin: "0 auto",
                }}>
                    <div style={{
                        textAlign: "center", marginBottom: 40,
                        animation: "fadeUp 0.6s ease forwards 0.1s", opacity: 0,
                    }}>
                        <h2 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 38, fontWeight: 300, color: "#F1EFE8",
                        }}>
                            Built for the way <em style={{ fontStyle: "italic", color: "#AFA9EC" }}>stans actually collect</em>
                        </h2>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                        <FeatureCard
                            icon="✦" title="Digital binder"
                            desc="Every card, every version, every era — organized exactly the way collectors think."
                            delay="0.15s"
                        />
                        <FeatureCard
                            icon="◎" title="Era progress"
                            desc="See how close you are to completing each era per member. The satisfaction is real."
                            delay="0.25s"
                        />
                        <FeatureCard
                            icon="⟡" title="Wishlist & dupes"
                            desc="Mark cards you're hunting and flag duplicates ready to trade."
                            delay="0.35s"
                        />
                        <FeatureCard
                            icon="↗" title="Trade listings"
                            desc="Post what you have. Find what you want. Connect with ARMY who collect like you do."
                            delay="0.45s"
                        />
                        <FeatureCard
                            icon="◈" title="Public profile"
                            desc="Share your collection page. Let your binder speak for itself on Twitter and TikTok."
                            delay="0.55s"
                        />
                        <FeatureCard
                            icon="✧" title="Comeback tracker"
                            desc="New album, new cards. Get notified the moment your era expands."
                            delay="0.65s"
                        />
                    </div>
                </section>

                {/* ── CTA BANNER ──────────────────────────── */}
                <section style={{
                    margin: "0 48px 80px",
                    background: "rgba(83,74,183,0.25)",
                    border: "0.5px solid rgba(127,119,221,0.25)",
                    borderRadius: 24,
                    padding: "48px",
                    textAlign: "center",
                    position: "relative", zIndex: 10,
                    animation: "fadeUp 0.7s ease forwards", opacity: 0,
                }}>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 36, fontWeight: 300, fontStyle: "italic",
                        color: "#CECBF6", marginBottom: 8,
                    }}>I purple your collection.</p>
                    <p style={{ fontSize: 14, color: "#7F77DD", marginBottom: 28 }}>
                        Join ARMY collectors who are done with spreadsheets.
                    </p>
                    <button
                        className="btn-primary"
                        onClick={onEnter}
                        style={{
                            background: "#7F77DD", color: "#1a1830",
                            border: "none", borderRadius: 24,
                            padding: "13px 32px", fontSize: 15, fontWeight: 500,
                            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                            transition: "background 0.2s, transform 0.15s",
                        }}
                    >Start your collection →</button>
                </section>

                {/* ── FOOTER ──────────────────────────────── */}
                <footer style={{
                    padding: "24px 48px",
                    borderTop: "0.5px solid rgba(175,169,236,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    position: "relative", zIndex: 10,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 26, height: 26, borderRadius: 7,
                            background: "#534AB7",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 14, color: "#EEEDFE",
                        }}>S</div>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "#7F77DD" }}>
              Stanlore
            </span>
                    </div>
                    <span style={{ fontSize: 12, color: "rgba(127,119,221,0.4)" }}>
            Built for ARMY, by ARMY · {new Date().getFullYear()}
          </span>
                </footer>

            </div>
        </div>
    );
}
