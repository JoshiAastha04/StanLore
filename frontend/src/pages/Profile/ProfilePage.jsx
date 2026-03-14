import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "./profile.css";

// ─── Avatar emoji pool ────────────────────────────────────────────────────────
// Assigned deterministically from username so it's always the same for a user
// but never shows a letter that makes people think "who's K?"
const AVATAR_EMOJIS = ["🌙", "⭐", "🪐", "🌸", "🦋", "🌊", "🔮", "🌺", "✨", "🎵",
    "🌟", "🍀", "🦄", "🌈", "🎭", "🪷", "🌙", "💫", "🎪", "🦚"];

function getAvatarEmoji(username) {
    if (!username) return "✦";
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

// ─── Status meta ──────────────────────────────────────────────────────────────
const STATUS_META = {
    owned:      { label: "Owned",     cls: "badge-owned"     },
    duplicate:  { label: "Duplicate", cls: "badge-duplicate" },
    "for-trade":{ label: "For Trade", cls: "badge-wishlist"  },
    wishlist:   { label: "Wishlist",  cls: "badge-missing"   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatJoinDate(isoString) {
    if (!isoString) return "Recently";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─── Check if user is brand new (no cards yet) ────────────────────────────────
// Later: replace with real Supabase query — if collection table has 0 rows for user
function isNewUser(profile) {
    // For now: if profile has no bio set, treat as new user
    // Once you hook up real collection data, check cards.length === 0 instead
    return !profile?.bio && !profile?.display_name;
}

// ─── Edit profile modal ───────────────────────────────────────────────────────
function EditProfileModal({ profile, onClose, onSave }) {
    const [displayName, setDisplayName] = useState(profile?.display_name || "");
    const [username,    setUsername]    = useState(profile?.username     || "");
    const [bio,         setBio]         = useState(profile?.bio          || "");
    const [saving,      setSaving]      = useState(false);
    const [error,       setError]       = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (username && !/^[a-z0-9_]{3,20}$/.test(username)) {
            setError("Username: 3–20 chars, lowercase letters, numbers, underscores only.");
            return;
        }
        if (bio.length > 160) {
            setError("Bio must be 160 characters or fewer.");
            return;
        }

        setSaving(true);
        const { error: saveError } = await onSave({
            display_name: displayName.trim() || null,
            username:     username.trim()    || profile?.username,
            bio:          bio.trim()         || null,
        });
        setSaving(false);

        if (saveError) {
            if (saveError.message?.includes("unique") || saveError.code === "23505") {
                setError("That username is already taken. Try another.");
            } else {
                setError(saveError.message || "Something went wrong. Please try again.");
            }
        } else {
            onClose();
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="profile-edit-modal" onClick={e => e.stopPropagation()}>

                <div className="profile-edit-modal__header">
                    <h3 className="profile-edit-modal__title">Edit profile</h3>
                    <button className="profile-edit-modal__close" onClick={onClose}>✕</button>
                </div>

                {error && (
                    <div className="auth-alert auth-alert--error" style={{ marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label">Display name</label>
                        <input className="auth-input" type="text"
                               placeholder="How you want to be known"
                               value={displayName}
                               onChange={e => setDisplayName(e.target.value)}
                               maxLength={40} />
                        <div className="auth-input-hint">Shown on your profile. Can be anything.</div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Username</label>
                        <input className="auth-input" type="text"
                               placeholder="your_handle"
                               value={username}
                               onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                               maxLength={20} />
                        <div className="auth-input-hint">
                            Your @handle — lowercase, numbers, underscores.
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">
                            Bio
                            <span style={{
                                marginLeft: 8, fontWeight: 400,
                                color: bio.length > 140 ? "var(--coral)" : "var(--text-faint)"
                            }}>
                                {bio.length} / 160
                            </span>
                        </label>
                        <textarea className="auth-input"
                                  style={{ resize: "vertical", minHeight: 80 }}
                                  placeholder="Tell the community about your collection..."
                                  value={bio}
                                  onChange={e => setBio(e.target.value)}
                                  maxLength={160} />
                    </div>

                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                            {saving
                                ? <><div className="auth-spinner" style={{ width: 14, height: 14 }} /> Saving...</>
                                : "Save changes"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

// ─── Empty state — shown to brand new users ───────────────────────────────────
function NewUserState({ displayName, onCatalog, onEdit }) {
    return (
        <div className="profile-v2__new-user">
            <div className="profile-v2__new-user-icon">✦</div>

            <h2 className="profile-v2__new-user-title">
                Welcome, <em>{displayName}</em>
            </h2>

            <p className="profile-v2__new-user-sub">
                Your collection is empty — and that's exactly where every great binder starts.
                Head to the catalog to add your first photocard.
            </p>

            <div className="profile-v2__new-user-actions">
                <button className="btn btn-primary" onClick={onCatalog}>
                    Start your collection →
                </button>
                <button className="btn btn-ghost" onClick={onEdit}>
                    Set up your profile
                </button>
            </div>

            {/* Ghost binder preview */}
            <div className="profile-v2__empty-binder">
                <div className="profile-v2__empty-binder-label">Your binder is waiting</div>
                <div className="profile-v2__empty-binder-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="profile-v2__empty-tile" />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Profile page ─────────────────────────────────────────────────────────────
export default function ProfilePage({ onHome, onCatalog }) {
    const { user, profile, updateProfile } = useAuth();

    const [activeTab, setActiveTab] = useState("overview");
    const [editOpen,  setEditOpen]  = useState(false);

    // Real data from auth — no hardcoded fallbacks to "Kira"
    const displayName = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "Stan";
    const username    = profile?.username     || user?.email?.split("@")[0] || "stan";
    const bio         = profile?.bio;
    const emoji       = getAvatarEmoji(username);
    const joinDate    = formatJoinDate(user?.created_at || profile?.created_at);
    const points      = profile?.points ?? 0;
    const newUser     = isNewUser(profile);

    // These will come from Supabase collection query later
    // For now: new users see 0, returning users see demo data
    const GROUPS = newUser ? [] : DEMO_GROUPS;
    const totalCards  = GROUPS.reduce((s, g) => s + g.cards,   0);
    const totalWish   = GROUPS.reduce((s, g) => s + g.wishlist, 0);
    const totalTrades = GROUPS.reduce((s, g) => s + g.trades,   0);

    return (
        <div className="profile-v2">
            <div className="orb orb--1" />
            <div className="orb orb--2" />

            {/* Nav */}
            <nav className="profile-v2__nav">
                <button className="profile-v2__back" onClick={onHome}>← Home</button>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="logo-mark logo-mark--sm">S</div>
                    <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                </div>
                <div />
            </nav>

            <main className="profile-v2__main">

                {/* ── Hero ── */}
                <div className="profile-v2__hero card">
                    <div className="profile-v2__hero-glow" />

                    {/* Emoji avatar — generic, friendly, unique per username */}
                    <div className="profile-v2__avatar-wrap">
                        <div className="profile-v2__emoji-avatar">{emoji}</div>
                        {GROUPS.length > 0 && (
                            <div className="profile-v2__group-ring">
                                {GROUPS.map(g => (
                                    <div key={g.id} className="profile-v2__group-dot" title={g.name} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="profile-v2__info">
                        <div className="profile-v2__name-row">
                            <span className="profile-v2__display-name">{displayName}</span>
                            <span className="profile-v2__username">@{username}</span>
                            {points > 0 && (
                                <span className="badge badge-owned" style={{ fontSize: 10 }}>
                                    ✦ {points.toLocaleString()} pts
                                </span>
                            )}
                            <button className="profile-v2__edit-btn"
                                    onClick={() => setEditOpen(true)} title="Edit profile">
                                ✎ Edit
                            </button>
                        </div>

                        <p className="profile-v2__bio">
                            {bio || (
                                <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>
                                    No bio yet — tap Edit to add one ✦
                                </span>
                            )}
                        </p>

                        <div className="profile-v2__meta">
                            <span>Joined {joinDate}</span>
                            {GROUPS.length > 0 && (
                                <>
                                    <span className="profile-v2__sep">·</span>
                                    <span>{GROUPS.length} fandoms</span>
                                    <span className="profile-v2__sep">·</span>
                                    <span>{totalTrades} trades</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats — only shown if user has cards */}
                    {GROUPS.length > 0 && (
                        <div className="profile-v2__global-stats">
                            {[
                                { v: totalCards,   l: "Cards"   },
                                { v: totalWish,    l: "Wishlist"},
                                { v: totalTrades,  l: "Trades"  },
                                { v: GROUPS.length,l: "Fandoms" },
                            ].map(({ v, l }) => (
                                <div key={l} className="profile-v2__gstat">
                                    <div className="stat-card__value" style={{ fontSize: 28 }}>{v}</div>
                                    <div className="stat-card__label">{l}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── New user empty state ── */}
                {newUser ? (
                    <NewUserState
                        displayName={displayName}
                        onCatalog={() => { onHome(); onCatalog(); }}
                        onEdit={() => setEditOpen(true)}
                    />
                ) : (
                    <>
                        {/* Tabs — only for users with data */}
                        <div className="profile-v2__tabs">
                            {["overview", "collection", "wishlist", "trades"].map(tab => (
                                <button key={tab}
                                        className={`profile-v2__tab${activeTab === tab ? " profile-v2__tab--active" : ""}`}
                                        onClick={() => setActiveTab(tab)}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {activeTab === "overview"   && <OverviewTab   groups={GROUPS} />}
                        {activeTab === "collection" && <CollectionTab groups={GROUPS} />}
                        {activeTab === "wishlist"   && <WishlistTab   groups={GROUPS} />}
                        {activeTab === "trades"     && <TradesTab     totalTrades={totalTrades} />}
                    </>
                )}

            </main>

            {editOpen && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setEditOpen(false)}
                    onSave={async (updates) => updateProfile(updates)}
                />
            )}
        </div>
    );
}

// ─── Demo data — only shown to accounts that have a bio set (returning users)
// Replace this entirely with real Supabase data when you hook up the collection
const DEMO_GROUPS = [
    {
        id: "bts", name: "BTS", hangul: "방탄소년단",
        faveMembers: ["Jungkook", "V"],
        cards: 87, wishlist: 12, trades: 18, wishlistPct: 65, era: "MOTS: 7",
        recentCards: [
            { name: "Jungkook", album: "Butter",  ver: "Cream",   status: "owned" },
            { name: "V",        album: "BE",       ver: "Deluxe",  status: "owned" },
            { name: "Jimin",    album: "Face",     ver: "Weverse", status: "for-trade" },
            { name: "Jungkook", album: "Golden",   ver: "Solid",   status: "duplicate" },
        ],
    },
    {
        id: "stray-kids", name: "Stray Kids", hangul: "스트레이 키즈",
        faveMembers: ["Felix", "Hyunjin"],
        cards: 52, wishlist: 8, trades: 11, wishlistPct: 42, era: "Rock-Star",
        recentCards: [
            { name: "Felix",   album: "Oddinary", ver: "Scanning", status: "owned" },
            { name: "Hyunjin", album: "5-Star",   ver: "Standard", status: "for-trade" },
        ],
    },
    {
        id: "seventeen", name: "SEVENTEEN", hangul: "세븐틴",
        faveMembers: ["Wonwoo", "Mingyu"],
        cards: 34, wishlist: 15, trades: 5, wishlistPct: 30, era: "SPILL THE FEELS",
        recentCards: [
            { name: "Wonwoo", album: "Sector 17", ver: "Kit",      status: "owned" },
            { name: "Mingyu", album: "FML",       ver: "Standard", status: "wishlist" },
        ],
    },
];

// ─── Overview ───────
function OverviewTab({ groups }) {
    const allRecent = groups.flatMap(g => g.recentCards.map(c => ({ ...c, group: g })));

    return (
        <div className="profile-v2__overview">
            <div>
                <div className="section-label">My Fandoms</div>
                <div className="profile-v2__fandom-list">
                    {groups.map(g => (
                        <div key={g.id} className="card-surface profile-v2__fandom-card">
                            <div className="profile-v2__fandom-row">
                                <div style={{ flex: 1 }}>
                                    <p className="profile-v2__fandom-hangul">{g.hangul}</p>
                                    <p className="profile-v2__fandom-name">{g.name}</p>
                                    <p className="profile-v2__fandom-era">{g.era}</p>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    {g.faveMembers.map(m => (
                                        <span key={m} className="badge badge-missing" style={{ fontSize: 10 }}>{m}</span>
                                    ))}
                                </div>
                                <div className="profile-v2__fandom-nums">
                                    {[
                                        { v: g.cards,             l: "cards"  },
                                        { v: g.trades,            l: "trades" },
                                        { v: `${g.wishlistPct}%`, l: "wish"   },
                                    ].map(({ v, l }) => (
                                        <div key={l} style={{ textAlign: "center" }}>
                                            <div className="profile-v2__fandom-num">{v}</div>
                                            <div className="section-label" style={{ marginBottom: 0 }}>{l}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="progress-track" style={{ marginTop: 12 }}>
                                <div className="progress-fill" style={{ width: `${g.wishlistPct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="section-label">Recent Cards</div>
                <div className="profile-v2__activity">
                    {allRecent.slice(0, 6).map((item, i) => {
                        const sm = STATUS_META[item.status] || STATUS_META.owned;
                        return (
                            <div key={i} className="profile-v2__activity-row">
                                <div className="avatar avatar--sm" style={{ background: "rgba(127,119,221,0.2)" }}>✦</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                                        {item.name} — {item.album}
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                                        {item.ver} ver. · {item.group.name}
                                    </div>
                                </div>
                                <span className={`badge ${sm.cls}`}>{sm.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Collection ───────────────────────────────────────────────────────────────
function CollectionTab({ groups }) {
    return (
        <div className="profile-v2__collection">
            {groups.map(g => (
                <div key={g.id} className="profile-v2__col-section">
                    <div className="profile-v2__col-header">
                        <span className="eyebrow">{g.name}</span>
                        <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{g.cards} cards</span>
                    </div>
                    <div className="binder-grid" style={{
                        gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                        padding: 0, marginTop: 12,
                    }}>
                        {g.recentCards.map((card, i) => {
                            const sm = STATUS_META[card.status] || STATUS_META.owned;
                            const tileCls = card.status === "for-trade" ? "wishlist"
                                : card.status === "wishlist" ? "missing" : card.status;
                            return (
                                <div key={i} className={`binder-tile binder-tile--${tileCls}`}>
                                    <div className="binder-tile__ver">{card.name}</div>
                                    <span className={`badge ${sm.cls}`}>{sm.label}</span>
                                </div>
                            );
                        })}
                        <div className="binder-tile binder-tile--missing"
                             style={{ border: "0.5px dashed var(--border-soft)", cursor: "pointer",
                                 display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 20, color: "var(--text-faint)" }}>+</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
function WishlistTab({ groups }) {
    return (
        <div className="profile-v2__collection">
            {groups.map(g => (
                <div key={g.id} className="profile-v2__col-section">
                    <div className="profile-v2__col-header">
                        <span className="eyebrow">{g.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                                {g.wishlistPct}% complete
                            </span>
                            <div className="progress-track" style={{ width: 80 }}>
                                <div className="progress-fill" style={{ width: `${g.wishlistPct}%` }} />
                            </div>
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 8 }}>
                        {g.wishlist} cards on wishlist
                    </p>
                </div>
            ))}
        </div>
    );
}

// ─── Trades
function TradesTab({ totalTrades }) {
    return (
        <div className="empty-state">
            <div className="stat-card__value" style={{ fontSize: 52, marginBottom: 8 }}>
                {totalTrades}
            </div>
            trades completed<br />
            <span style={{ fontSize: 15 }}>Trade history and active offers will appear here.</span>
        </div>
    );
}
