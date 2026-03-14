import { useState } from "react";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "./LorePage.css";

const THREADS = [
    {
        id: 1, tag: "Theory", group: "BTS",
        title: "Which era is this concept photo from? The lighting is giving BE vibes but the outfits look HYYH",
        body: "Found this unreleased looking photo on Weverse. The aesthetic is confusing me — could be the transition era between Wings and LY.",
        author: "cosmicbora", time: "2h ago",
        votes: 847, comments: 62, views: "4.2K",
        hot: true, hasImage: true,
        tags: ["concept-analysis", "BE", "HYYH"],
    },
    {
        id: 2, tag: "Fashion", group: "BTS",
        title: "Taehyung's airport look breakdown — Celine SS24 jacket, already sold out",
        body: "Full analysis with affordable dupes. The trousers are from a Korean indie brand that ships internationally.",
        author: "fashionpilled", time: "5h ago",
        votes: 1203, comments: 94, views: "8.7K",
        hot: true, hasImage: true,
        tags: ["fashion", "taehyung", "airport-look"],
    },
    {
        id: 3, tag: "Photocard", group: "BTS",
        title: "Complete guide to identifying Butter Cream vs Peaches version photocards",
        body: "The Cream PCs have a slightly warmer tone and the signature is placed 2mm higher. Here's my comparison chart.",
        author: "pcdetective", time: "1d ago",
        votes: 2041, comments: 178, views: "15.3K",
        hot: false, hasImage: false,
        tags: ["butter", "pc-guide", "version-diff"],
    },
    {
        id: 4, tag: "Theory", group: "BTS",
        title: "The WINGS short films hidden connections to Jungian archetypes — full thread",
        body: "Been rewatching these and the symbolism goes deep. Each member's film corresponds to a shadow archetype.",
        author: "lorekeeper99", time: "2d ago",
        votes: 3892, comments: 241, views: "28.1K",
        hot: false, hasImage: false,
        tags: ["wings", "theory", "symbolism"],
    },
    {
        id: 5, tag: "Question", group: "BTS",
        title: "Does anyone know the photographer behind the MOTS:7 On photocards?",
        body: "Trying to find the original shooter. The way light hits in these is unlike standard idol photography.",
        author: "grainwatcher", time: "3d ago",
        votes: 456, comments: 33, views: "2.1K",
        hot: false, hasImage: true,
        tags: ["mots7", "photography", "on"],
    },
    {
        id: 6, tag: "Fashion", group: "BTS",
        title: "Jimin's Dior ambassador looks — ranking all official campaign shots",
        body: "Opinion post. The black tux editorial is still unmatched. Let's discuss the full campaign arc.",
        author: "diortadict", time: "4d ago",
        votes: 789, comments: 55, views: "5.4K",
        hot: false, hasImage: true,
        tags: ["jimin", "dior", "fashion"],
    },
];

const TRENDING = ["#BTSComeback2025", "#ButterPC", "#WINGSTheory", "#CelineTaehyung", "#GoldenJungkook"];
const CATEGORIES = [
    { id: "all",       label: "All",       count: 1847 },
    { id: "theory",    label: "Theory",    count: 342  },
    { id: "fashion",   label: "Fashion",   count: 589  },
    { id: "photocard", label: "Photocard", count: 724  },
    { id: "question",  label: "Question",  count: 192  },
];
const SAMPLE_COMMENTS = [
    { author: "moonsunflower", text: "Looks like the Butter era to me, especially the warm tones." },
    { author: "armiverse99",   text: "I think it's from the Cream version album shoot." },
    { author: "jkstanforever",  text: "Nope that's definitely MOTS era. Look at the film grain." },
];
const TAG_BADGE = {
    Theory: "badge-owned", Fashion: "badge-wishlist",
    Photocard: "badge-missing", Question: "badge-duplicate",
};

export default function LorePage({ onBack, onSignIn, isGuest }) {
    const [activeCategory, setActiveCategory] = useState("all");
    const [sort, setSort]                     = useState("hot");
    const [expandedId, setExpandedId]         = useState(null);

    const filtered = THREADS.filter(t =>
        activeCategory === "all" || t.tag.toLowerCase() === activeCategory
    );

    return (
        <div className="lore-page">
            <div className="orb orb--1" />
            <div className="orb orb--3" />

            {/* ── Nav — Fix #2: back button on every page ── */}
            <nav className="lore__nav">
                {/* Back button */}
                <button className="lore__back" onClick={onBack}>
                    ← Back
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="logo-mark logo-mark--sm">S</div>
                    <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                </div>

                <div className="lore__nav-right">
                    {isGuest && (
                        <button className="btn btn-primary btn-sm" onClick={onSignIn}>
                            Sign up
                        </button>
                    )}
                </div>
            </nav>

            {/* ── Guest prompt banner ── */}
            {isGuest && (
                <div className="lore__guest-banner">
                    <span>You're reading as a guest.</span>
                    <button className="lore__guest-cta" onClick={onSignIn}>
                        Sign up to post & vote →
                    </button>
                </div>
            )}

            <main className="lore__main">

                {/* Page header */}
                <div className="lore__page-header">
                    <div>
                        <div className="eyebrow" style={{ marginBottom: 12 }}>Community Threads</div>
                        <h1 className="lore__title">Lore Space</h1>
                        <p className="lore__sub">Theories · fashion analysis · photocard discussions</p>
                    </div>
                    {!isGuest && (
                        <button className="btn btn-primary lore__new-btn">+ New thread</button>
                    )}
                    {isGuest && (
                        <button className="btn btn-ghost lore__new-btn" onClick={onSignIn}>
                            Sign up to post
                        </button>
                    )}
                </div>

                <div className="lore__layout">

                    <div className="lore__feed-col">
                        {/* Filters */}
                        <div className="lore__filter-row">
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`filter-btn${activeCategory === cat.id ? " filter-btn--active" : ""}`}
                                        onClick={() => setActiveCategory(cat.id)}
                                    >
                                        {cat.label}
                                        <span className="lore__cat-count">{cat.count}</span>
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 4 }}>
                                {["hot", "new", "top"].map(s => (
                                    <button
                                        key={s}
                                        className={`btn btn-ghost btn-sm${sort === s ? " lore__sort--active" : ""}`}
                                        onClick={() => setSort(s)}
                                        style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
                                    >
                                        {s === "hot" ? "🔥" : s === "new" ? "✨" : "⬆"} {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="lore__threads">
                            {filtered.map(thread => (
                                <ThreadCard
                                    key={thread.id}
                                    thread={thread}
                                    expanded={expandedId === thread.id}
                                    onExpand={() => setExpandedId(expandedId === thread.id ? null : thread.id)}
                                    isGuest={isGuest}
                                    onSignIn={onSignIn}
                                />
                            ))}
                        </div>
                    </div>

                    <aside className="lore__sidebar">
                        <div className="card lore__side-card">
                            <div className="section-label" style={{ marginBottom: 14 }}>Trending Now</div>
                            {TRENDING.map((tag, i) => (
                                <div key={tag} className="lore__trend-item">
                                    <span className="lore__trend-rank">{i + 1}</span>
                                    <span className="lore__trend-tag">{tag}</span>
                                </div>
                            ))}
                        </div>
                        <div className="card lore__side-card">
                            <div className="section-label" style={{ marginBottom: 10 }}>Unanswered ❓</div>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
                                3 threads have been waiting 24+ hours. Help the community!
                            </p>
                            <button className="btn btn-ghost btn-sm" style={{ width: "100%" }}>View questions</button>
                        </div>
                        <div className="card lore__side-card">
                            <div className="section-label" style={{ marginBottom: 14 }}>Fashion This Week</div>
                            {["V – Celine Airport", "Jimin – Dior Campaign", "Jin – Louis Vuitton"].map((item, i) => (
                                <div key={i} className="lore__fashion-item">
                                    <span>{item}</span>
                                    <span style={{ color: "var(--coral)" }}>🔥</span>
                                </div>
                            ))}
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    );
}

function ThreadCard({ thread, expanded, onExpand, isGuest, onSignIn }) {
    const [voted, setVoted] = useState(false);

    function handleVote(e) {
        e.stopPropagation();
        if (isGuest) { onSignIn?.(); return; }
        setVoted(!voted);
    }

    return (
        <div
            className={`lore__thread${thread.hot ? " lore__thread--hot" : ""}${expanded ? " lore__thread--expanded" : ""}`}
            onClick={onExpand}
        >
            {thread.hot && <div className="lore__thread-hotline" />}

            <div className="lore__thread-top">
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className={`badge ${TAG_BADGE[thread.tag] || "badge-missing"}`}>{thread.tag}</span>
                    {thread.hot && <span className="lore__hot-label">🔥 Hot</span>}
                </div>
                <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{thread.time}</span>
            </div>

            <h3 className="lore__thread-title">{thread.title}</h3>
            <p className="lore__thread-body">{thread.body}</p>

            {thread.hasImage && (
                <div className="lore__thread-img-placeholder">🖼 Image attached</div>
            )}

            <div className="lore__thread-tags">
                {thread.tags.map(t => <span key={t} className="lore__thread-tag">#{t}</span>)}
            </div>

            <div className="lore__thread-footer">
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-faint)" }}>
                    <div className="avatar avatar--sm" style={{ background: "rgba(127,119,221,0.2)", width: 20, height: 20, fontSize: 9 }}>✦</div>
                    {thread.author}
                </div>
                <div className="lore__thread-stats">
                    <button
                        className="lore__stat-btn"
                        onClick={handleVote}
                        style={{ color: voted ? "var(--purple-light)" : undefined }}
                    >
                        ▲ {thread.votes + (voted ? 1 : 0)}
                    </button>
                    <span className="lore__stat-btn">💬 {thread.comments}</span>
                    <span className="lore__stat-btn">👁 {thread.views}</span>
                </div>
            </div>

            {expanded && (
                <div className="lore__comments" onClick={e => e.stopPropagation()}>
                    <div className="lore__comments-divider" />
                    <div className="section-label" style={{ marginBottom: 12 }}>Top Comments</div>
                    {SAMPLE_COMMENTS.map((c, i) => (
                        <div key={i} className="lore__comment">
                            <div className="avatar avatar--sm" style={{ background: "rgba(83,74,183,0.3)", fontSize: 10 }}>
                                {c.author[0].toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 2 }}>{c.author}</div>
                                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{c.text}</div>
                            </div>
                        </div>
                    ))}
                    {isGuest ? (
                        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: "100%" }} onClick={onSignIn}>
                            Sign up to reply
                        </button>
                    ) : (
                        <div className="lore__reply-row">
                            <input className="input" placeholder="Add a reply…" style={{ flex: 1 }} />
                            <button className="btn btn-primary btn-sm">Reply</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
