import { useState, useEffect } from "react";
import "../../styles/globals.css";
import "../Landing/Landing.css";

// ─── Floating card decoration ─────────────────────────────────────────────────
function FloatCard({ style, animClass = "float-card float-card--a" }) {
    return <div className={animClass} style={{ position: "absolute", pointerEvents: "none", borderRadius: 10, ...style }} />;
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label, last }) {
    return (
        <div className={`landing__stat-pill${last ? " landing__stat-pill--last" : ""}`}>
            <span className="landing__stat-value">{value}</span>
            <span className="landing__stat-label">{label}</span>
        </div>
    );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }) {
    return (
        <div
            className="landing__feature-card"
            style={{ animationDelay: delay }}
        >
            <div className="landing__feature-icon">{icon}</div>
            <div className="landing__feature-title">{title}</div>
            <div className="landing__feature-desc">{desc}</div>
        </div>
    );
}

// ─── Binder preview ───────────────────────────────────────────────────────────
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
        <div className="binder-frame">
            <div className="binder-header">
                <div className="avatar avatar--md">JK</div>
                <div className="binder-header__info">
                    <div className="binder-header__name">Jungkook</div>
                    <div className="binder-header__era">Butter Era</div>
                </div>
                <div className="binder-header__count">5 / 8 owned</div>
            </div>
            <div className="binder-grid">
                {PREVIEW_CARDS.map((c, i) => (
                    <div key={i} className="binder-tile" style={{ background: c.bg }}>
                        <div className="binder-tile__ver">{c.ver}</div>
                        <span style={{
                            fontSize: 7, fontWeight: 500,
                            padding: "2px 5px", borderRadius: 8,
                            background: c.statusBg, color: c.statusColor,
                            display: "inline-block",
                        }}>{c.status}</span>
                    </div>
                ))}
            </div>
            <div className="binder-footer">
                <span className="binder-footer__label">Butter Era</span>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: "63%" }} />
                </div>
                <span className="binder-footer__pct">63%</span>
            </div>
        </div>
    );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
export default function LandingPage({ onEnter, onBrowse, onCreateAccount }) {
    const [introPhase, setIntroPhase] = useState("blooming");
    const [menuOpen,   setMenuOpen]   = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setIntroPhase("fading"), 2600);
        const t2 = setTimeout(() => setIntroPhase("done"),   3500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return (
        <div className="landing">

            {/* ── Intro overlay ── */}
            {introPhase !== "done" && (
                <div className={`intro${introPhase === "fading" ? " intro--fading" : ""}`}>
                    <div className="intro__bloom">S</div>
                    <div className="intro__hello">Hello, Stannies</div>
                </div>
            )}

            <div className={`landing__page${introPhase === "done" ? " landing__page--visible" : ""}`}>

                {/* Ambient orbs */}
                <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                    <div className="orb orb--1" />
                    <div className="orb orb--2" />
                    <div className="orb orb--3" />
                </div>

                {/* Floating photocard decorations */}
                <FloatCard animClass="landing__fc landing__fc--1 float-card float-card--a" style={{ borderRadius: 10 }} />
                <FloatCard animClass="landing__fc landing__fc--2 float-card float-card--b" style={{ borderRadius: 8  }} />
                <FloatCard animClass="landing__fc landing__fc--3 float-card float-card--c" style={{ borderRadius: 8  }} />
                <FloatCard animClass="landing__fc landing__fc--4 float-card float-card--a" style={{ borderRadius: 9  }} />

                {/* NAV */}
                <nav className="landing__nav">
                    <div className="landing__nav-logo">
                        <div className="logo-mark logo-mark--md">S</div>
                        <span className="logo-wordmark logo-wordmark--md">Stanlore</span>
                    </div>

                    {/* Desktop nav */}
                    <div className="landing__nav-links landing__nav-links--desktop">
                        <button className="landing__nav-link" onClick={() => {
                            document.getElementById("landing-features")?.scrollIntoView({ behavior: "smooth" });
                        }}>Features</button>
                        <button className="landing__nav-link" onClick={onBrowse}>Browse app</button>
                        <button className="btn btn-ghost btn-sm" onClick={onEnter}>Sign in</button>
                        <button className="btn btn-primary btn-sm" onClick={onCreateAccount}>Create account</button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="landing__hamburger"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                    >
                        <span /><span /><span />
                    </button>
                </nav>

                {/* Mobile menu drawer */}
                {menuOpen && (
                    <div className="landing__mobile-menu">
                        <button className="landing__mobile-link" onClick={() => { onBrowse(); setMenuOpen(false); }}>Browse app</button>
                        <button className="landing__mobile-link" onClick={() => { onEnter(); setMenuOpen(false); }}>Sign in</button>
                        <button className="btn btn-primary" style={{ width: "100%", marginTop: 4 }} onClick={() => { onCreateAccount(); setMenuOpen(false); }}>
                            Create account
                        </button>
                    </div>
                )}

                {/* hero */}
                <section className="landing__hero">
                    <div className="landing__hero-eyebrow">
                        <span className="eyebrow">For K-pop Collectors</span>
                    </div>

                    <h1 className="landing__hero-title">
                        Your collection,<br />
                        <em>every era.</em>
                    </h1>

                    <p className="landing__hero-sub">
                        The digital binder built for the way Stannies actually collects.
                        Track every photocard you own, want, and have to trade - all in one place.
                    </p>

                    <div className="landing__hero-actions">
                        <button className="btn btn-primary" onClick={onCreateAccount}
                                style={{ padding: "13px 32px", fontSize: 15 }}>
                            Create account →
                        </button>
                        <button className="btn btn-ghost" onClick={onBrowse}
                                style={{ padding: "13px 32px", fontSize: 15 }}>
                            Browse the app →
                        </button>
                    </div>
                </section>

                {/* ── STats bar ── */}
                <div className="landing__stats">
                    <StatPill value="10+"  label="Groups" />
                    <StatPill value="50+" label="Eras" />
                    <StatPill value="∞"  label="Cards" last />
                </div>

                {/* ── Binder preview ── */}
                <div className="landing__binder-section">
                    <BinderPreview />
                </div>

                {/*  added real content so links scroll here */}
                <section id="landing-features" className="landing__features">
                    <div className="landing__features-heading">
                        <h2>Built for the way <em>Stans actually collect</em></h2>
                    </div>
                    <div className="landing__features-grid">
                        <FeatureCard icon="✦" title="Digital binder"
                                     desc="Every card, every version, every era, organized exactly the way collectors think."
                                     delay="0.15s" />
                        <FeatureCard icon="◎" title="Era progress"
                                     desc="See how close you are to completing each era per member. The satisfaction is real."
                                     delay="0.25s" />
                        <FeatureCard icon="⟡" title="Wishlist & dupes"
                                     desc="Mark cards you're hunting and flag duplicates ready to trade."
                                     delay="0.35s" />
                        <FeatureCard icon="↗" title="Trade board"
                                     desc="Post what you have. Find what you want. Connect with ARMY who collect like you."
                                     delay="0.45s" />
                        <FeatureCard icon="◈" title="Updates feed"
                                     desc="Teasers, comeback announcements, tour dates, all in one fandom radar feed."
                                     delay="0.55s" />
                        <FeatureCard icon="◉" title="Lore Space"
                                     desc="Theory threads, fashion analysis, photocard breakdowns, the full community in one place."
                                     delay="0.65s" />
                    </div>
                </section>

                {/* ── CTA ── */}
                <section id="landing-cta" className="landing__cta">
                    <p className="landing__cta-headline">I purple your collection.</p>
                    <p className="landing__cta-sub">Join collectors building their Digital Binder.</p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <button className="btn btn-primary" onClick={onCreateAccount}
                                style={{ padding: "13px 32px", fontSize: 15 }}>
                            Start your collection →
                        </button>
                        <button className="btn btn-ghost" onClick={onBrowse}
                                style={{ padding: "13px 32px", fontSize: 15 }}>
                            Browse first
                        </button>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="landing__footer">
                    <div className="landing__footer-logo">
                        <div className="logo-mark logo-mark--sm">S</div>
                        <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                    </div>
                    <span className="landing__footer-tagline">Collection, Lore & Combacks - All in One Place</span>
                    <span className="landing__footer-copy">© {new Date().getFullYear()} Aastha Joshi </span>
                </footer>

            </div>
        </div>
    );
}