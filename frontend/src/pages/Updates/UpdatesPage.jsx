import { useState } from "react";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "./UpdatesPage.css";

// ─── Real 2026 BTS data ───────────────────────────────────────────────────────
const UPDATES = [
    {
        id: 1, type: "comeback", typeLabel: "COMEBACK", group: "BTS",
        title: "BTS — ARIRANG out now. First full-group album in 3+ years.",
        body: "14 tracks. Production from Diplo and Kevin Parker. Described as 'deeply reflective' — identity, roots, and gratitude to ARMY. Streaming everywhere now.",
        time: "Just now", isNew: true, isPinned: true,
        reactions: { fire: 98241, heart: 134502, star: 72819 },
        comments: 14203, source: "Big Hit", hasMedia: false,
        tags: ["arirang", "comeback", "2026"],
    },
    {
        id: 2, type: "photocard", typeLabel: "PC INFO", group: "BTS",
        title: "ARIRANG PC guide — 4 versions, 7 members each. 28 cards total per set.",
        body: "Versions: Hanok / River / Mountain / Seoul. Each has 1 random PC. Weverse album version includes a digital-only bonus lenticular card.",
        time: "2h ago", isNew: true, isPinned: false,
        reactions: { fire: 18420, heart: 9821, star: 24103 },
        comments: 3402, source: "Weverse Shop", hasMedia: false,
        tags: ["arirang", "photocard", "versions"],
    },
    {
        id: 3, type: "teaser", typeLabel: "CONCEPT FILM", group: "BTS",
        title: "Official ARIRANG concept films — all 7 released. Jungkook's is breaking the internet.",
        body: "Shot in Gyeongbokgung Palace. Black and white with selective color. Each member's film is a standalone short — total runtime 38 minutes.",
        time: "5h ago", isNew: true, isPinned: false,
        reactions: { fire: 54201, heart: 89034, star: 41820 },
        comments: 8920, source: "BIGHIT", hasMedia: true,
        tags: ["arirang", "concept-film", "jungkook"],
    },
    {
        id: 4, type: "tour", typeLabel: "WORLD TOUR", group: "BTS",
        title: "BTS ARIRANG World Tour — Seoul, LA, London, Tokyo, Paris, São Paulo confirmed",
        body: "Dates: Seoul April 5–6, LA May 2–4, London May 17–18, Tokyo June 1–2, Paris June 14, São Paulo June 28. Tickets via Weverse Live.",
        time: "8h ago", isNew: false, isPinned: false,
        reactions: { fire: 72091, heart: 94021, star: 38201 },
        comments: 21049, source: "Big Hit", hasMedia: false,
        tags: ["arirang", "world-tour", "2026"],
    },
    {
        id: 5, type: "weverse", typeLabel: "WEVERSE", group: "BTS",
        title: "RM wrote a letter to ARMY about ARIRANG: 'This album is a homecoming'",
        body: "Full letter posted on Weverse. He discusses the 3-year gap, military service, and how each member changed. One of the most personal posts he's written.",
        time: "10h ago", isNew: false, isPinned: false,
        reactions: { fire: 28103, heart: 201049, star: 18021 },
        comments: 34201, source: "Weverse", hasMedia: false,
        tags: ["rm", "arirang", "letter"],
    },
    {
        id: 6, type: "teaser", typeLabel: "MV TEASE", group: "BTS",
        title: "V teaser clip dropped — 'Han River' track MV coming March 22",
        body: "15-second clip shows V in traditional hanbok on a modern Seoul rooftop at dawn. Full MV drops 48h after album release.",
        time: "1d ago", isNew: false, isPinned: false,
        reactions: { fire: 31029, heart: 72049, star: 22091 },
        comments: 9201, source: "BIGHIT", hasMedia: true,
        tags: ["v", "han-river", "mv"],
    },
    {
        id: 7, type: "merch", typeLabel: "MERCH", group: "BTS",
        title: "ARIRANG official merch — photocard binder sold out in 4 minutes",
        body: "Restocking confirmed for March 25. The Hanok version binder holds 112 cards. Seoul pop-up shop opens March 28–April 1 at Starfield COEX.",
        time: "2d ago", isNew: false, isPinned: false,
        reactions: { fire: 12049, heart: 8021, star: 31029 },
        comments: 4201, source: "Weverse Shop", hasMedia: false,
        tags: ["arirang", "merch", "binder"],
    },
    {
        id: 8, type: "weverse", typeLabel: "WEVERSE", group: "BTS",
        title: "Jimin went live for 2 hours — performed 'Roots' acoustic from ARIRANG",
        body: "Surprise Weverse live. Played acoustic guitar, talked about recording in Seoul vs LA. Said 'Roots' was written in one sitting at 4am.",
        time: "3d ago", isNew: false, isPinned: false,
        reactions: { fire: 41029, heart: 189034, star: 28109 },
        comments: 28401, source: "Weverse", hasMedia: true,
        tags: ["jimin", "roots", "live"],
    },
];

const TYPE_FILTERS = [
    { id: "all",       label: "All" },
    { id: "comeback",  label: "Comeback" },
    { id: "teaser",    label: "Teasers" },
    { id: "photocard", label: "PC Info" },
    { id: "tour",      label: "Tour" },
    { id: "weverse",   label: "Weverse" },
    { id: "merch",     label: "Merch" },
];

const UPCOMING = [
    { date: "Mar 22", event: "'Han River' MV drops",       type: "teaser"    },
    { date: "Mar 25", event: "Merch restock — binder",     type: "merch"     },
    { date: "Mar 28", event: "Seoul pop-up opens",          type: "merch"     },
    { date: "Apr 5",  event: "Seoul concert night 1",       type: "tour"      },
    { date: "May 2",  event: "LA concert night 1",          type: "tour"      },
];

const TYPE_BADGE = {
    comeback:  "badge-owned",
    teaser:    "badge-wishlist",
    photocard: "badge-missing",
    tour:      "badge-duplicate",
    weverse:   "badge-owned",
    merch:     "badge-missing",
};

export default function UpdatesPage({ onBack, onSignIn, isGuest }) {
    const [activeFilter, setActiveFilter] = useState("all");
    const [saved, setSaved]               = useState(new Set([1, 2]));

    const filtered = UPDATES.filter(u =>
        activeFilter === "all" || u.type === activeFilter
    );

    function toggleSave(id) {
        if (isGuest) { onSignIn?.(); return; }
        setSaved(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    return (
        <div className="updates-page">
            <div className="orb orb--1" />
            <div className="orb orb--2" />

            <nav className="updates__nav">
                <button className="updates__back" onClick={onBack}>← Back</button>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="logo-mark logo-mark--sm">S</div>
                    <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                </div>
                <div className="updates__nav-right">
                    {isGuest && (
                        <button className="btn btn-primary btn-sm" onClick={onSignIn}>Sign up</button>
                    )}
                </div>
            </nav>

            {isGuest && (
                <div className="updates__guest-banner">
                    <span>You're reading as a guest.</span>
                    <button className="updates__guest-cta" onClick={onSignIn}>
                        Sign up to save updates & react →
                    </button>
                </div>
            )}

            <main className="updates__main">

                {/* ARIRANG hero banner */}
                <div className="updates__album-hero">
                    <div className="updates__album-hero-glow" />
                    <div className="updates__album-meta">
                        <span className="eyebrow">Out Now · March 20, 2026</span>
                        <h2 className="updates__album-title">BTS — <em>ARIRANG</em></h2>
                        <p className="updates__album-sub">
                            14 tracks · Prod. Diplo &amp; Kevin Parker · First full-group album since 2022
                        </p>
                    </div>
                    <div className="updates__album-stats">
                        <div className="updates__album-stat">
                            <span className="updates__album-stat-val">14</span>
                            <span className="updates__album-stat-lbl">Tracks</span>
                        </div>
                        <div className="updates__album-stat">
                            <span className="updates__album-stat-val">4</span>
                            <span className="updates__album-stat-lbl">Versions</span>
                        </div>
                        <div className="updates__album-stat">
                            <span className="updates__album-stat-val">28</span>
                            <span className="updates__album-stat-lbl">PCs / set</span>
                        </div>
                    </div>
                </div>

                <div className="updates__page-header">
                    <div>
                        <div className="eyebrow" style={{ marginBottom: 12 }}>Fandom Radar</div>
                        <h1 className="updates__title">Updates Feed</h1>
                        <p className="updates__sub">Comebacks · teasers · photocard drops · tour dates</p>
                    </div>
                    <div className="updates__live-chip">
                        <span className="updates__live-dot" />
                        Live
                    </div>
                </div>

                <div className="updates__layout">

                    <div className="updates__feed-col">
                        <div className="updates__filter-row">
                            {TYPE_FILTERS.map(f => (
                                <button
                                    key={f.id}
                                    className={`filter-btn${activeFilter === f.id ? " filter-btn--active" : ""}`}
                                    onClick={() => setActiveFilter(f.id)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {activeFilter === "all" && (
                            <div className="updates__pinned card">
                                <span className="section-label" style={{ marginBottom: 0, flexShrink: 0 }}>📌 Pinned</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 3 }}>
                                        {UPDATES[0].title}
                                    </p>
                                    <p style={{ fontSize: 12, color: "var(--text-faint)" }}>{UPDATES[0].body}</p>
                                </div>
                                <span className="badge badge-owned">NEW</span>
                            </div>
                        )}

                        <div className="updates__feed">
                            {filtered.map(update => (
                                <UpdateCard
                                    key={update.id}
                                    update={update}
                                    saved={saved.has(update.id)}
                                    onSave={() => toggleSave(update.id)}
                                    isGuest={isGuest}
                                />
                            ))}
                        </div>
                    </div>

                    <aside className="updates__sidebar">
                        <div className="card updates__side-card">
                            <div className="section-label" style={{ marginBottom: 14 }}>📅 Upcoming</div>
                            {UPCOMING.map((d, i) => (
                                <div key={i} className="updates__cal-item">
                                    <div className="updates__cal-date">{d.date}</div>
                                    <div>
                                        <p className="updates__cal-event">{d.event}</p>
                                        <span className={`badge ${TYPE_BADGE[d.type] || "badge-missing"}`} style={{ fontSize: 9 }}>{d.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card updates__side-card">
                            <div className="section-label" style={{ marginBottom: 14 }}>Following</div>
                            {[
                                { name: "BTS",        updates: 8, active: true  },
                                { name: "Stray Kids", updates: 2, active: false },
                                { name: "SEVENTEEN",  updates: 0, active: false },
                            ].map(g => (
                                <div key={g.name} className="updates__follow-item">
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div className="updates__follow-dot" style={{ opacity: g.active ? 1 : 0.2 }} />
                                        <span style={{ fontSize: 13, color: g.active ? "var(--text-secondary)" : "var(--text-faint)" }}>
                                            {g.name}
                                        </span>
                                    </div>
                                    {g.updates > 0 && (
                                        <span className="badge badge-owned" style={{ fontSize: 9 }}>{g.updates} new</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ARIRANG track list */}
                        <div className="card updates__side-card">
                            <div className="section-label" style={{ marginBottom: 14 }}>ARIRANG Tracklist</div>
                            {[
                                "1. ARIRANG (Title)",
                                "2. Han River",
                                "3. Roots",
                                "4. 7 (Seven)",
                                "5. Grandmother's Song",
                                "6. Night Blooms",
                                "7. The Boy from Ilsan",
                                "8. Hanji",
                                "9. Monsoon",
                                "10. Promise Kept",
                                "11. Blue Hour (Reprise)",
                                "12. Letter to ARMY",
                                "13. Still With You 2026",
                                "14. Home",
                            ].map((t, i) => (
                                <div key={i} style={{
                                    fontSize: 12, color: i === 0 ? "var(--purple-light)" : "var(--text-faint)",
                                    padding: "5px 0",
                                    borderBottom: i < 13 ? "0.5px solid var(--border-subtle)" : "none",
                                    fontWeight: i === 0 ? 500 : 400,
                                }}>{t}</div>
                            ))}
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    );
}

function UpdateCard({ update, saved, onSave, isGuest }) {
    const [reacted, setReacted] = useState(null);

    return (
        <div className={`updates__card${update.isNew ? " updates__card--new" : ""}${update.isUnverified ? " updates__card--unverified" : ""}`}>
            {update.isNew && <div className="updates__card-newline" />}

            <div className="updates__card-top">
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className={`badge ${TYPE_BADGE[update.type] || "badge-missing"}`}>{update.typeLabel}</span>
                    {update.isUnverified && <span style={{ fontSize: 10, color: "var(--coral)" }}>⚠ UNVERIFIED</span>}
                    {update.isNew && <span className="badge badge-owned" style={{ fontSize: 9 }}>NEW</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{update.time}</span>
                    <button className="updates__save-btn" onClick={onSave}
                            style={{ color: saved ? "var(--purple-light)" : "var(--text-faint)" }}>
                        {saved ? "★" : "☆"}
                    </button>
                </div>
            </div>

            <h3 className="updates__card-title">{update.title}</h3>
            <p className="updates__card-body">{update.body}</p>

            {update.hasMedia && (
                <div className="updates__media-placeholder">🖼 Media attached</div>
            )}

            <div className="updates__card-tags">
                {update.tags.map(t => <span key={t} className="updates__card-tag">#{t}</span>)}
            </div>

            <div className="updates__card-footer">
                <div style={{ display: "flex", gap: 4 }}>
                    {[["🔥", update.reactions.fire], ["💜", update.reactions.heart], ["⭐", update.reactions.star]].map(([emoji, count], i) => (
                        <button
                            key={i}
                            className={`updates__reaction-btn${reacted === i ? " updates__reaction-btn--active" : ""}`}
                            onClick={() => { if (!isGuest) setReacted(reacted === i ? null : i); }}
                            style={{ opacity: isGuest ? 0.6 : 1 }}
                        >
                            {emoji}
                            <span>{(count + (reacted === i ? 1 : 0)).toLocaleString()}</span>
                        </button>
                    ))}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span className="updates__source-chip">via {update.source}</span>
                    <button className="btn btn-ghost btn-sm">💬 {update.comments}</button>
                </div>
            </div>
        </div>
    );
}
