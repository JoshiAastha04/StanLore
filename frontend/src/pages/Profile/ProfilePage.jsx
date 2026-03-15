import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "./profile.css";

// ─── Avatar emoji ─────────────────────────────────────────────────────────────
const AVATAR_EMOJIS = ["🌙","⭐","🪐","🌸","🦋","🌊","🔮","🌺","✨","🎵",
    "🌟","🍀","🦄","🌈","🎭","🪷","💫","🎪","🦚","🎀"];

function getAvatarEmoji(username) {
    if (!username) return "✦";
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

function formatJoinDate(isoString) {
    if (!isoString) return "Recently";
    return new Date(isoString).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const STATUS_META = {
    owned:       { label: "Owned",     cls: "badge-owned"     },
    duplicate:   { label: "Duplicate", cls: "badge-duplicate" },
    "for-trade": { label: "For Trade", cls: "badge-wishlist"  },
    wishlist:    { label: "Wishlist",  cls: "badge-missing"   },
};

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
        if (bio.length > 160) { setError("Bio must be 160 characters or fewer."); return; }

        setSaving(true);
        const { error: saveError } = await onSave({
            display_name: displayName.trim() || null,
            username:     username.trim()    || profile?.username,
            bio:          bio.trim()         || null,
        });
        setSaving(false);
        if (saveError) {
            setError(saveError.message?.includes("unique") || saveError.code === "23505"
                ? "That username is already taken. Try another."
                : saveError.message || "Something went wrong.");
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
                {error && <div className="auth-alert auth-alert--error" style={{ marginBottom: 16 }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label">Display name</label>
                        <input className="auth-input" type="text" placeholder="How you want to be known"
                               value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={40} />
                        <div className="auth-input-hint">Shown on your profile. Can be anything.</div>
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Username</label>
                        <input className="auth-input" type="text" placeholder="your_handle"
                               value={username}
                               onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                               maxLength={20} />
                        <div className="auth-input-hint">Your @handle — lowercase, numbers, underscores.</div>
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">
                            Bio
                            <span style={{ marginLeft: 8, fontWeight: 400,
                                color: bio.length > 140 ? "var(--coral)" : "var(--text-faint)" }}>
                                {bio.length} / 160
                            </span>
                        </label>
                        <textarea className="auth-input" style={{ resize: "vertical", minHeight: 80 }}
                                  placeholder="Tell the community about your collection..."
                                  value={bio} onChange={e => setBio(e.target.value)} maxLength={160} />
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                            {saving ? <><div className="auth-spinner" style={{ width: 14, height: 14 }} /> Saving...</> : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Empty state for new users ────────────────────────────────────────────────
function NewUserState({ displayName, onCatalog, onEdit }) {
    return (
        <div className="profile-v2__new-user">
            <div className="profile-v2__new-user-icon">✦</div>
            <h2 className="profile-v2__new-user-title">
                Start making your own collection ♡
            </h2>
            <p className="profile-v2__new-user-sub">
                Your binder is empty right now — every great collection starts here.
                Head to the catalog, spend your ⭐ stars, and claim your first photocard.
            </p>
            <div className="profile-v2__new-user-actions">
                <button className="btn btn-primary" onClick={onCatalog}>
                    Browse the catalog →
                </button>
                <button className="btn btn-ghost" onClick={onEdit}>
                    Set up your profile
                </button>
            </div>
            {/* Ghost binder grid */}
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

    const [activeTab,  setActiveTab]  = useState("overview");
    const [editOpen,   setEditOpen]   = useState(false);
    const [collection, setCollection] = useState([]);  // real cards from Supabase
    const [loading,    setLoading]    = useState(true);

    const displayName = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "Stan";
    const username    = profile?.username     || user?.email?.split("@")[0] || "stan";
    const bio         = profile?.bio;
    const emoji       = getAvatarEmoji(username);
    const joinDate    = formatJoinDate(user?.created_at || profile?.created_at);
    const stars       = profile?.stars ?? 0;

    // ── Fetch real collection from Supabase ──────────────────────────────────
    useEffect(() => {
        if (!user) { setLoading(false); return; }

        async function loadCollection() {
            try {
                const { data, error } = await supabase
                    .from("collection")
                    .select(`
                        card_id, status,
                        photocards (
                            id, image_url,
                            members  ( name, stage_name ),
                            versions ( name,
                                albums ( title,
                                    eras ( name, slug )
                                )
                            )
                        )
                    `)
                    .eq("user_id", user.id);

                if (error) throw error;
                setCollection(data ?? []);
            } catch (err) {
                console.error("Failed to load collection:", err);
                setCollection([]);
            } finally {
                setLoading(false);
            }
        }

        loadCollection();
    }, [user]);

    const isNewUser   = !loading && collection.length === 0;
    const totalCards  = collection.length;
    const totalOwned  = collection.filter(c => c.status === "owned").length;
    const totalWish   = collection.filter(c => c.status === "wishlist").length;

    // Group by group name for collection tab
    const groupedByGroup = collection.reduce((acc, row) => {
        const pc    = row.photocards;
        const group = pc?.versions?.albums?.eras?.name || "BTS";
        if (!acc[group]) acc[group] = [];
        acc[group].push(row);
        return acc;
    }, {});

    // Recent cards for overview
    const recentCards = [...collection]
        .sort((a, b) => b.card_id - a.card_id)
        .slice(0, 6);

    return (
        <div className="profile-v2">
            <div className="orb orb--1" />
            <div className="orb orb--2" />

            <nav className="profile-v2__nav">
                <button className="profile-v2__back" onClick={onHome}>← Home</button>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="logo-mark logo-mark--sm">S</div>
                    <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                </div>
                <div />
            </nav>

            <main className="profile-v2__main">

                {/* Hero */}
                <div className="profile-v2__hero card">
                    <div className="profile-v2__hero-glow" />

                    <div className="profile-v2__avatar-wrap">
                        <div className="profile-v2__emoji-avatar">{emoji}</div>
                        {!isNewUser && (
                            <div className="profile-v2__group-ring">
                                <div className="profile-v2__group-dot" />
                            </div>
                        )}
                    </div>

                    <div className="profile-v2__info">
                        <div className="profile-v2__name-row">
                            <span className="profile-v2__display-name">{displayName}</span>
                            <span className="profile-v2__username">@{username}</span>
                            {stars > 0 && (
                                <span className="badge badge-owned" style={{ fontSize: 10 }}>
                                    ⭐ {stars.toLocaleString()} stars
                                </span>
                            )}
                            <button className="profile-v2__edit-btn"
                                    onClick={() => setEditOpen(true)}>
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
                            {!isNewUser && (
                                <>
                                    <span className="profile-v2__sep">·</span>
                                    <span>{totalCards} cards</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats — only when user has cards */}
                    {!isNewUser && !loading && (
                        <div className="profile-v2__global-stats">
                            {[
                                { v: totalOwned, l: "Owned"    },
                                { v: totalWish,  l: "Wishlist" },
                                { v: totalCards, l: "Cards"    },
                            ].map(({ v, l }) => (
                                <div key={l} className="profile-v2__gstat">
                                    <div className="stat-card__value" style={{ fontSize: 28 }}>{v}</div>
                                    <div className="stat-card__label">{l}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Loading state */}
                {loading && (
                    <div style={{ textAlign: "center", padding: "60px 0",
                        fontFamily: "var(--font-serif)", fontSize: 18,
                        color: "var(--text-faint)", fontStyle: "italic" }}>
                        Loading your collection...
                    </div>
                )}

                {/* New user empty state */}
                {!loading && isNewUser && (
                    <NewUserState
                        displayName={displayName}
                        onCatalog={() => { onHome(); onCatalog?.(); }}
                        onEdit={() => setEditOpen(true)}
                    />
                )}

                {/* Returning user — tabs + content */}
                {!loading && !isNewUser && (
                    <>
                        <div className="profile-v2__tabs">
                            {["overview", "collection", "wishlist", "trades"].map(tab => (
                                <button key={tab}
                                        className={`profile-v2__tab${activeTab === tab ? " profile-v2__tab--active" : ""}`}
                                        onClick={() => setActiveTab(tab)}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {activeTab === "overview"   && (
                            <OverviewTab recentCards={recentCards} groupedByGroup={groupedByGroup} />
                        )}
                        {activeTab === "collection" && (
                            <CollectionTab groupedByGroup={groupedByGroup} />
                        )}
                        {activeTab === "wishlist"   && (
                            <WishlistTab collection={collection} />
                        )}
                        {activeTab === "trades"     && (
                            <TradesTab />
                        )}
                    </>
                )}

            </main>

            {editOpen && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setEditOpen(false)}
                    onSave={async updates => updateProfile(updates)}
                />
            )}
        </div>
    );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ recentCards, groupedByGroup }) {
    return (
        <div className="profile-v2__overview">
            <div>
                <div className="section-label">My Fandoms</div>
                <div className="profile-v2__fandom-list">
                    {Object.entries(groupedByGroup).map(([group, cards]) => {
                        const owned = cards.filter(c => c.status === "owned").length;
                        return (
                            <div key={group} className="card-surface profile-v2__fandom-card">
                                <div className="profile-v2__fandom-row">
                                    <div style={{ flex: 1 }}>
                                        <p className="profile-v2__fandom-name">{group}</p>
                                    </div>
                                    <div className="profile-v2__fandom-nums">
                                        <div style={{ textAlign: "center" }}>
                                            <div className="profile-v2__fandom-num">{owned}</div>
                                            <div className="section-label" style={{ marginBottom: 0 }}>owned</div>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <div className="profile-v2__fandom-num">{cards.length}</div>
                                            <div className="section-label" style={{ marginBottom: 0 }}>total</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="progress-track" style={{ marginTop: 12 }}>
                                    <div className="progress-fill"
                                         style={{ width: `${Math.round((owned / cards.length) * 100)}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <div className="section-label">Recent Cards</div>
                <div className="profile-v2__activity">
                    {recentCards.map((row, i) => {
                        const pc  = row.photocards;
                        const sm  = STATUS_META[row.status] || STATUS_META.owned;
                        const name = pc?.members?.stage_name || pc?.members?.name || "Unknown";
                        const ver  = pc?.versions?.name || "";
                        const era  = pc?.versions?.albums?.eras?.name || pc?.versions?.albums?.title || "";
                        return (
                            <div key={i} className="profile-v2__activity-row">
                                <div className="avatar avatar--sm"
                                     style={{ background: "rgba(127,119,221,0.2)" }}>✦</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                                        {name} — {era}
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{ver}</div>
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
function CollectionTab({ groupedByGroup }) {
    return (
        <div className="profile-v2__collection">
            {Object.entries(groupedByGroup).map(([group, cards]) => (
                <div key={group} className="profile-v2__col-section">
                    <div className="profile-v2__col-header">
                        <span className="eyebrow">{group}</span>
                        <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{cards.length} cards</span>
                    </div>
                    <div className="binder-grid" style={{
                        gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                        padding: 0, marginTop: 12
                    }}>
                        {cards.map((row, i) => {
                            const pc  = row.photocards;
                            const sm  = STATUS_META[row.status] || STATUS_META.owned;
                            const name = pc?.members?.stage_name || "?";
                            const tileCls = row.status === "for-trade" ? "wishlist"
                                : row.status === "wishlist" ? "missing" : row.status;
                            return (
                                <div key={i} className={`binder-tile binder-tile--${tileCls}`}>
                                    <div className="binder-tile__ver">{name}</div>
                                    <span className={`badge ${sm.cls}`}>{sm.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
function WishlistTab({ collection }) {
    const items = collection.filter(c => c.status === "wishlist");
    if (!items.length) {
        return (
            <div className="empty-state">
                Your wishlist is empty.<br />
                <span style={{ fontSize: 15 }}>Browse the catalog to mark cards you want.</span>
            </div>
        );
    }
    return (
        <div className="profile-v2__collection">
            {items.map((row, i) => {
                const pc   = row.photocards;
                const name = pc?.members?.stage_name || "Unknown";
                const ver  = pc?.versions?.name || "";
                const era  = pc?.versions?.albums?.eras?.name || "";
                return (
                    <div key={i} className="profile-v2__activity-row">
                        <div className="avatar avatar--sm" style={{ background: "rgba(240,153,123,0.2)" }}>✦</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                                {name} — {era}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{ver}</div>
                        </div>
                        <span className="badge badge-wishlist">Wishlist</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Trades ───────────────────────────────────────────────────────────────────
function TradesTab() {
    return (
        <div className="empty-state">
            Trade history and active offers will appear here.<br />
            <span style={{ fontSize: 15 }}>Post a listing from the Trade board.</span>
        </div>
    );
}
