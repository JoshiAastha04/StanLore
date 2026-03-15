import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "./LorePage.css";
import "../../styles/Mobile.css";

// ─── Seed threads shown as fallback if Supabase is empty ─────────────────────
const SEED_THREADS = [
    {
        id: 1, tag: "Theory", group: "BTS",
        title: "Which era is this concept photo from? The lighting is giving BE vibes but the outfits look HYYH",
        body: "Found this unreleased looking photo on Weverse. The aesthetic is confusing me — could be the transition era between Wings and LY.",
        author: "cosmicbora", time: "2h ago",
        votes: 847, comments: 62, views: "4.2K",
        hot: true, tags: ["concept-analysis", "BE", "HYYH"],
    },
    {
        id: 2, tag: "Fashion", group: "BTS",
        title: "Taehyung's airport look breakdown — Celine SS24 jacket, already sold out",
        body: "Full analysis with affordable dupes. The trousers are from a Korean indie brand that ships internationally.",
        author: "fashionpilled", time: "5h ago",
        votes: 1203, comments: 94, views: "8.7K",
        hot: true, tags: ["fashion", "taehyung", "airport-look"],
    },
    {
        id: 3, tag: "Photocard", group: "BTS",
        title: "Complete guide to identifying Butter Cream vs Peaches version photocards",
        body: "The Cream PCs have a slightly warmer tone and the signature is placed 2mm higher.",
        author: "pcdetective", time: "1d ago",
        votes: 2041, comments: 178, views: "15.3K",
        hot: false, tags: ["butter", "pc-guide"],
    },
    {
        id: 4, tag: "Theory", group: "BTS",
        title: "The WINGS short films hidden connections to Jungian archetypes — full thread",
        body: "Been rewatching these and the symbolism goes deep. Each member's film corresponds to a shadow archetype.",
        author: "lorekeeper99", time: "2d ago",
        votes: 3892, comments: 241, views: "28.1K",
        hot: false, tags: ["wings", "theory", "symbolism"],
    },
];

const TRENDING   = ["#BTSComeback2025", "#ButterPC", "#WINGSTheory", "#CelineTaehyung", "#GoldenJungkook"];
const CATEGORIES = [
    { id: "all",       label: "All",       count: null },
    { id: "theory",    label: "Theory",    count: null },
    { id: "fashion",   label: "Fashion",   count: null },
    { id: "photocard", label: "Photocard", count: null },
    { id: "question",  label: "Question",  count: null },
];
const TAG_BADGE = {
    Theory: "badge-owned", Fashion: "badge-wishlist",
    Photocard: "badge-missing", Question: "badge-duplicate",
};
const TAGS = ["Theory", "Fashion", "Photocard", "Question"];

function timeAgo(isoString) {
    if (!isoString) return "";
    const diff = Date.now() - new Date(isoString).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

// ─── New thread modal ─────────────────────────────────────────────────────────
function NewThreadModal({ onClose, onPosted, username }) {
    const [tag,     setTag]     = useState("Theory");
    const [title,   setTitle]   = useState("");
    const [body,    setBody]    = useState("");
    const [posting, setPosting] = useState(false);
    const [error,   setError]   = useState("");

    async function handlePost(e) {
        e.preventDefault();
        if (!title.trim()) { setError("Title is required."); return; }
        if (!body.trim())  { setError("Body is required.");  return; }
        setPosting(true); setError("");

        const { data, error: err } = await supabase
            .from("lore_threads")
            .insert({
                tag,
                title:   title.trim(),
                body:    body.trim(),
                author:  username,
                group_id: "bts",
                votes:   0,
            })
            .select()
            .single();

        setPosting(false);

        if (err) {
            setError("Couldn't post — try again.");
            console.error(err);
            return;
        }

        onPosted(data);
        onClose();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="lore__new-thread-modal" onClick={e => e.stopPropagation()}>
                <div className="lore__modal-header">
                    <h3 className="lore__modal-title">New thread</h3>
                    <button className="lore__modal-close" onClick={onClose}>✕</button>
                </div>

                {error && (
                    <div style={{ background: "rgba(240,80,80,0.1)", border: "0.5px solid rgba(240,80,80,0.3)",
                        borderRadius: 8, padding: "10px 14px", marginBottom: 14,
                        fontSize: 13, color: "var(--coral)" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handlePost}>
                    <div className="auth-field">
                        <label className="auth-label">Category</label>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {TAGS.map(t => (
                                <button key={t} type="button"
                                        className={`filter-btn${tag === t ? " filter-btn--active" : ""}`}
                                        onClick={() => setTag(t)}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">
                            Title
                            <span style={{ marginLeft: 8, fontWeight: 400,
                                color: title.length > 120 ? "var(--coral)" : "var(--text-faint)" }}>
                                {title.length}/140
                            </span>
                        </label>
                        <input className="auth-input" type="text"
                               placeholder="What's your thread about?"
                               value={title} onChange={e => setTitle(e.target.value)}
                               maxLength={140} autoFocus />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">
                            Body
                            <span style={{ marginLeft: 8, fontWeight: 400,
                                color: body.length > 900 ? "var(--coral)" : "var(--text-faint)" }}>
                                {body.length}/1000
                            </span>
                        </label>
                        <textarea className="auth-input" style={{ resize: "vertical", minHeight: 120 }}
                                  placeholder="Share your theory, analysis, or question..."
                                  value={body} onChange={e => setBody(e.target.value)}
                                  maxLength={1000} />
                    </div>

                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={posting}>
                            {posting ? "Posting..." : "Post thread"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Lore page ────────────────────────────────────────────────────────────────
export default function LorePage({ onBack, onSignIn, isGuest, onHome, onCatalog, onUpdates, onStyle, onLore }) {
    const { profile } = useAuth();
    const [activeCategory, setActiveCategory] = useState("all");
    const [sort,           setSort]           = useState("hot");
    const [expandedId,     setExpandedId]     = useState(null);
    const [showNewThread,  setShowNewThread]  = useState(false);
    const [threads,        setThreads]        = useState([]);
    const [loading,        setLoading]        = useState(true);

    const username = profile?.username || profile?.display_name || "stan";

    // ── Load threads from Supabase — visible to ALL users ──────────────────────
    useEffect(() => {
        async function loadThreads() {
            const { data, error } = await supabase
                .from("lore_threads")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (error || !data || data.length === 0) {
                // Fall back to seed threads if table empty or doesn't exist
                setThreads(SEED_THREADS);
            } else {
                // Merge real threads with seed (seed shown at bottom)
                const real = data.map(t => ({
                    ...t,
                    time: timeAgo(t.created_at),
                    hot:  (t.votes ?? 0) > 100,
                    tags: t.tags || [t.tag?.toLowerCase()],
                }));
                setThreads([...real, ...SEED_THREADS]);
            }
            setLoading(false);
        }
        loadThreads();
    }, []);

    const filtered = threads.filter(t =>
        activeCategory === "all" || t.tag?.toLowerCase() === activeCategory
    );

    return (
        <>
            <div className="lore-page">
                <div className="orb orb--1" />
                <div className="orb orb--3" />

                <nav className="lore__nav">
                    <button className="lore__back" onClick={onBack}>← Back</button>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="logo-mark logo-mark--sm">S</div>
                        <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                    </div>
                    <div className="lore__nav-right">
                        {isGuest && (
                            <button className="btn btn-primary btn-sm" onClick={onSignIn}>Sign up</button>
                        )}
                    </div>
                </nav>

                {isGuest && (
                    <div className="lore__guest-banner">
                        <span>You're reading as a guest.</span>
                        <button className="lore__guest-cta" onClick={onSignIn}>
                            Sign up to post & vote →
                        </button>
                    </div>
                )}

                <main className="lore__main">
                    <div className="lore__page-header">
                        <div>
                            <div className="eyebrow" style={{ marginBottom: 12 }}>Community Threads</div>
                            <h1 className="lore__title">Lore Space</h1>
                            <p className="lore__sub">Theories · fashion analysis · photocard discussions</p>
                        </div>
                        {!isGuest ? (
                            <button className="btn btn-primary lore__new-btn"
                                    onClick={() => setShowNewThread(true)}>+ New thread</button>
                        ) : (
                            <button className="btn btn-ghost lore__new-btn" onClick={onSignIn}>
                                Sign up to post
                            </button>
                        )}
                    </div>

                    <div className="lore__layout">
                        <div className="lore__feed-col">
                            <div className="lore__filter-row">
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                    {CATEGORIES.map(cat => (
                                        <button key={cat.id}
                                                className={`filter-btn${activeCategory === cat.id ? " filter-btn--active" : ""}`}
                                                onClick={() => setActiveCategory(cat.id)}>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: 4 }}>
                                    {["hot","new","top"].map(s => (
                                        <button key={s}
                                                className={`btn btn-ghost btn-sm${sort === s ? " lore__sort--active" : ""}`}
                                                onClick={() => setSort(s)}
                                                style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                            {s === "hot" ? "🔥" : s === "new" ? "✨" : "⬆"} {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <div style={{ padding: "40px 0", textAlign: "center",
                                    fontFamily: "var(--font-serif)", fontSize: 18,
                                    color: "var(--text-faint)", fontStyle: "italic" }}>
                                    Loading threads...
                                </div>
                            ) : (
                                <div className="lore__threads">
                                    {filtered.map(thread => (
                                        <ThreadCard key={thread.id} thread={thread}
                                                    expanded={expandedId === thread.id}
                                                    onExpand={() => setExpandedId(expandedId === thread.id ? null : thread.id)}
                                                    isGuest={isGuest} onSignIn={onSignIn} />
                                    ))}
                                </div>
                            )}
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
                                    3 threads waiting 24+ hours. Help the community!
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

                {showNewThread && (
                    <NewThreadModal
                        username={username}
                        onClose={() => setShowNewThread(false)}
                        onPosted={thread => {
                            const formatted = {
                                ...thread,
                                time: "just now",
                                hot:  false,
                                tags: [thread.tag?.toLowerCase()],
                                isNew: true,
                            };
                            setThreads(prev => [formatted, ...prev]);
                        }}
                    />
                )}
            </div>

            {/* Mobile bottom nav — consistent across all pages */}
            <MobileBottomNav
                activePage="lore"
                onHome={onHome}
                onCatalog={onCatalog}
                onUpdates={onUpdates}
                onStyle={onStyle}
                onLore={onLore}
            />
        </>
    );
}

// ─── Thread card ──────────────────────────────────────────────────────────────
function ThreadCard({ thread, expanded, onExpand, isGuest, onSignIn }) {
    const [voted, setVoted] = useState(false);

    async function handleVote(e) {
        e.stopPropagation();
        if (isGuest) { onSignIn?.(); return; }
        setVoted(!voted);
        // Update vote count in Supabase for real threads
        if (thread.created_at) {
            await supabase.from("lore_threads")
                .update({ votes: (thread.votes ?? 0) + (voted ? -1 : 1) })
                .eq("id", thread.id);
        }
    }

    return (
        <div className={`lore__thread${thread.hot ? " lore__thread--hot" : ""}${expanded ? " lore__thread--expanded" : ""}`}
             onClick={onExpand}>
            {thread.hot && <div className="lore__thread-hotline" />}
            {thread.isNew && <div className="lore__thread-newline" />}

            <div className="lore__thread-top">
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className={`badge ${TAG_BADGE[thread.tag] || "badge-missing"}`}>{thread.tag}</span>
                    {thread.hot   && <span className="lore__hot-label">🔥 Hot</span>}
                    {thread.isNew && <span className="lore__hot-label" style={{ color: "var(--text-success)" }}>✦ New</span>}
                </div>
                <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{thread.time}</span>
            </div>

            <h3 className="lore__thread-title">{thread.title}</h3>
            <p className="lore__thread-body">{thread.body}</p>

            <div className="lore__thread-tags">
                {(thread.tags || []).map(t => (
                    <span key={t} className="lore__thread-tag">#{t}</span>
                ))}
            </div>

            <div className="lore__thread-footer">
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-faint)" }}>
                    <div className="avatar avatar--sm" style={{ background: "rgba(127,119,221,0.2)", width: 20, height: 20, fontSize: 9 }}>✦</div>
                    {thread.author}
                </div>
                <div className="lore__thread-stats">
                    <button className="lore__stat-btn" onClick={handleVote}
                            style={{ color: voted ? "var(--purple-light)" : undefined }}>
                        ▲ {(thread.votes ?? 0) + (voted ? 1 : 0)}
                    </button>
                    <span className="lore__stat-btn">💬 {thread.comments ?? 0}</span>
                    <span className="lore__stat-btn">👁 {thread.views ?? "0"}</span>
                </div>
            </div>

            {expanded && (
                <div className="lore__comments" onClick={e => e.stopPropagation()}>
                    <div className="lore__comments-divider" />
                    <div className="section-label" style={{ marginBottom: 12 }}>Comments</div>
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

// ─── Shared mobile bottom nav ─────────────────────────────────────────────────
function MobileBottomNav({ activePage, onHome, onCatalog, onUpdates, onStyle, onLore }) {
    const tabs = [
        { id: "home",    icon: "◫", label: "Binder",  action: onHome    },
        { id: "catalog", icon: "✦", label: "Catalog", action: onCatalog },
        { id: "updates", icon: "◈", label: "Updates", action: onUpdates },
        { id: "style",   icon: "✧", label: "Style",   action: onStyle   },
        { id: "lore",    icon: "◉", label: "Lore",    action: onLore    },
    ];
    return (
        <nav className="mobile-bottom-nav">
            {tabs.map(tab => (
                <button key={tab.id}
                        className={`mobile-bottom-nav__item${activePage === tab.id ? " mobile-bottom-nav__item--active" : ""}`}
                        onClick={tab.action}>
                    <span className="mobile-bottom-nav__icon">{tab.icon}</span>
                    <span className="mobile-bottom-nav__label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}