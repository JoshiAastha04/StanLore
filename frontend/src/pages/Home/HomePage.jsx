import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/usecollection";
import { useGroupMembership } from "../../hooks/usegroupmembership.js";
import { supabase } from "../../lib/supabase";
import "../Home/Home.css";
import "../../styles/Components.css";
import "../../styles/globals.css";
import "../../styles/Mobile.css";

// ─── User avatar — emoji if set, SVG silhouette otherwise ─────────────────────
function UserAvatar({ avatar, size = 26 }) {
    if (avatar) {
        return (
            <div style={{
                width: size, height: size, borderRadius: "50%", flexShrink: 0,
                background: "rgba(38,33,92,0.8)",
                border: "1px solid rgba(175,169,236,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: size * 0.44,
            }}>
                {avatar}
            </div>
        );
    }
    return (
        <svg width={size} height={size} viewBox="0 0 72 72" fill="none"
             xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="36" fill="rgba(38,33,92,0.8)" />
            <circle cx="36" cy="36" r="35" stroke="rgba(175,169,236,0.3)" strokeWidth="1" />
            <circle cx="36" cy="27" r="11" fill="rgba(175,169,236,0.65)" />
            <path d="M14 62 C14 48 22 42 36 42 C50 42 58 48 58 62"
                  fill="rgba(175,169,236,0.65)" />
        </svg>
    );
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const BINDER_TABS = [
    { id: "collection", icon: "◫", label: "My binder" },
    { id: "wishlist",   icon: "◎", label: "Wishlist"  },
    { id: "trades",     icon: "⇄", label: "Trades"    },
];

const COMMUNITY_TABS = [
    { id: "catalog", icon: "✦", label: "Catalog"           },
    { id: "updates", icon: "◈", label: "Updates", badge: 7 },
    { id: "style",   icon: "✧", label: "Style"             },
    { id: "lore",    icon: "◉", label: "Lore"              },
];

const BADGE_CLASS = {
    owned: "badge-owned", wishlist: "badge-wishlist",
    duplicate: "badge-duplicate", missing: "badge-missing",
};

const MEMBER_INITIALS = {
    RM: "RM", Jin: "JN", Suga: "SG",
    "J-Hope": "JH", Jimin: "JM", V: "V", Jungkook: "JK",
};

const MEMBERS = ["All", "RM", "Jin", "Suga", "J-Hope", "Jimin", "V", "Jungkook"];
const pct = (owned, total) => total > 0 ? Math.round((owned / total) * 100) : 0;

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, accentColor }) {
    return (
        <div className="stat-card">
            <div className="stat-card__label">{label}</div>
            <div className="stat-card__value" style={accentColor ? { color: accentColor } : {}}>
                {value}
            </div>
        </div>
    );
}

// ─── Photocard tile — shows real image if available ──────────────────────────
function PcTile({ card, onClick }) {
    const [imgErr, setImgErr] = useState(false);
    return (
        <div className={`pc-tile pc-tile--${card.status}`}
             style={{ position: "relative", overflow: "hidden" }}
             onClick={() => onClick(card)}>
            {card.publicUrl && !imgErr ? (
                <>
                    <img
                        src={card.publicUrl}
                        alt={card.ver}
                        style={{ width: "100%", height: "100%", objectFit: "cover",
                            borderRadius: "inherit", display: "block",
                            position: "absolute", inset: 0 }}
                        onError={() => setImgErr(true)}
                        loading="lazy"
                    />
                    <span className={`badge ${BADGE_CLASS[card.status]}`}
                          style={{ position: "absolute", bottom: 6, left: 6, zIndex: 2 }}>
                        {card.status}
                    </span>
                </>
            ) : (
                <>
                    <div className="pc-tile__ver">{card.ver}</div>
                    <span className={`badge ${BADGE_CLASS[card.status]}`}>{card.status}</span>
                </>
            )}
        </div>
    );
}

// ─── Era card ─────────────────────────────────────────────────────────────────
function EraCard({ era, onCardClick }) {
    const completion = pct(era.owned, era.total);
    const isComplete = completion === 100;
    const initials   = MEMBER_INITIALS[era.member] || era.member.slice(0, 2).toUpperCase();
    const cols       = Math.min(era.cards.length, 4);

    return (
        <div className="era-card">
            <div className="era-card__header">
                <div className="avatar avatar--sm">{initials}</div>
                <div>
                    <div className="era-card__member-name">{era.member}</div>
                    <div className="era-card__era-name">{era.era} Era</div>
                </div>
                <div className={`era-card__count${isComplete ? " era-card__count--complete" : ""}`}>
                    {isComplete ? "✦ complete" : `${era.owned} / ${era.total}`}
                </div>
            </div>
            <div className="era-card__grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {era.cards.map((card, i) => <PcTile key={i} card={card} onClick={onCardClick} />)}
            </div>
            <div className="era-card__footer">
                <span className="era-card__footer-label">{era.era} Era</span>
                <div className="progress-track">
                    <div className={`progress-fill${isComplete ? " progress-fill--complete" : ""}`}
                         style={{ width: `${completion}%` }} />
                </div>
                <span className="era-card__pct">{completion}%</span>
            </div>
        </div>
    );
}

// ─── Card status modal ────────────────────────────────────────────────────────
function CardModal({ card, onClose, onTrades }) {
    const [imgErr, setImgErr] = useState(false);
    if (!card) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card-modal" onClick={e => e.stopPropagation()}>
                {/* Real image or colour fallback */}
                {card.publicUrl && !imgErr ? (
                    <img src={card.publicUrl}
                         alt={card.ver}
                         className="card-modal__preview"
                         style={{ objectFit: "cover", borderRadius: "var(--radius-md)" }}
                         onError={() => setImgErr(true)} />
                ) : (
                    <div className={`card-modal__preview pc-tile--${card.status}`}>
                        <span style={{ fontFamily: "var(--font-serif)", fontSize: 22,
                            color: "var(--purple-pale)", fontStyle: "italic" }}>{card.ver}</span>
                    </div>
                )}

                <div className="card-modal__title">{card.ver}</div>

                <div className="card-modal__statuses">
                    {["owned","wishlist","duplicate","missing"].map(st => (
                        <button key={st}
                                className={`card-modal__status-btn badge ${BADGE_CLASS[st]}`}
                                style={{ opacity: card.status === st ? 1 : 0.45, cursor: "pointer", border: "none" }}>
                            {st}
                        </button>
                    ))}
                </div>

                {/* Trade option — only show for owned cards */}
                {card.status === "owned" && (
                    <button className="btn btn-ghost btn-sm"
                            style={{ width: "100%", marginTop: 4, borderColor: "rgba(127,119,221,0.3)" }}
                            onClick={() => { onClose(); onTrades?.(); }}>
                        ⇄ List for trade
                    </button>
                )}

                <button className="btn btn-ghost btn-sm"
                        style={{ width: "100%", marginTop: 6 }} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTabChange, onSignOut, onProfile, onLore,
                     onUpdates, onStyle, onCatalog, onTrades, onGroupSwitch, activeGroup, stars, username, avatar }) {

    function handleCommunity(id) {
        if (id === "lore")    { onLore?.();    return; }
        if (id === "updates") { onUpdates?.(); return; }
        if (id === "style")   { onStyle?.();   return; }
        if (id === "catalog") { onCatalog?.(); return; }
        onTabChange(id);
    }

    function handleBinder(id) {
        if (id === "trades") { onTrades?.(); return; }
        onTabChange(id);
    }

    return (
        <aside className="sidebar">
            <div className="sidebar__toprow">
                <div className="sidebar__logo" style={{ marginBottom: 0 }}>
                    <div className="logo-mark logo-mark--sm">S</div>
                    <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                </div>
                <button className="sidebar__profile-btn"
                        onClick={() => onProfile?.(username)} title="My profile">
                    <UserAvatar avatar={avatar} size={30} />
                </button>
            </div>

            <div className="sidebar__stars">
                <span className="sidebar__stars-icon">⭐</span>
                <span className="sidebar__stars-count">{(stars ?? 0).toLocaleString()}</span>
                <span className="sidebar__stars-label">stars</span>
            </div>

            <button className="sidebar__group-pill" onClick={onGroupSwitch}>
                <div className="sidebar__group-dot" />
                <div>
                    <div className="sidebar__group-name">{activeGroup?.name ?? "BTS"}</div>
                    <div className="sidebar__group-era">{activeGroup?.era ?? "MOTS: 7"}</div>
                </div>
                <span className="sidebar__group-switch">↗</span>
            </button>

            <div className="sidebar__section-label">Binder</div>
            <nav className="sidebar__nav">
                {BINDER_TABS.map(item => (
                    <button key={item.id}
                            className={`sidebar__nav-item${activeTab === item.id ? " sidebar__nav-item--active" : ""}`}
                            onClick={() => handleBinder(item.id)}>
                        <span className="sidebar__nav-icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar__section-label" style={{ marginTop: 20 }}>Explore</div>
            <nav className="sidebar__nav">
                {COMMUNITY_TABS.map(item => (
                    <button key={item.id}
                            className={`sidebar__nav-item${activeTab === item.id ? " sidebar__nav-item--active" : ""}`}
                            onClick={() => handleCommunity(item.id)}>
                        <span className="sidebar__nav-icon">{item.icon}</span>
                        {item.label}
                        {item.badge && <span className="sidebar__nav-badge">{item.badge}</span>}
                    </button>
                ))}
            </nav>

            <div className="sidebar__spacer" />

            <div className="sidebar__user">
                <button className="sidebar__signout" onClick={onSignOut}>Sign out</button>
            </div>
        </aside>
    );
}

// ─── Mobile top bar ───────────────────────────────────────────────────────────
function MobileTopBar({ activeGroup, onGroupSwitch, onProfile, stars, username, avatar }) {
    return (
        <div className="mobile-topbar">
            <button className="mobile-topbar__group" onClick={onGroupSwitch}>
                <div className="mobile-topbar__dot" />
                <span className="mobile-topbar__group-name">{activeGroup?.name ?? "BTS"}</span>
                <span className="mobile-topbar__era">{activeGroup?.era ?? "MOTS: 7"}</span>
                <span style={{ fontSize: 10, color: "var(--text-faint)", marginLeft: 2 }}>↗</span>
            </button>
            <div className="mobile-topbar__stars">
                <span>⭐</span>
                <span style={{ fontSize: 12, color: "var(--purple-light)", fontWeight: 500 }}>
                    {(stars ?? 0).toLocaleString()}
                </span>
            </div>
            <button className="mobile-topbar__profile" onClick={() => onProfile?.(username)}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer",
                        display: "flex", alignItems: "center" }}>
                <UserAvatar avatar={avatar} size={30} />
            </button>
        </div>
    );
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────
function MobileBottomNav({ activeTab, onTabChange, onLore, onUpdates, onStyle, onCatalog, onTrades }) {
    const ALL_TABS = [...BINDER_TABS, ...COMMUNITY_TABS];

    function handleTab(id) {
        if (id === "lore")    { onLore?.();    return; }
        if (id === "updates") { onUpdates?.(); return; }
        if (id === "style")   { onStyle?.();   return; }
        if (id === "catalog") { onCatalog?.(); return; }
        if (id === "trades")  { onTrades?.();  return; }
        onTabChange(id);
    }

    return (
        <nav className="mobile-bottom-nav">
            {ALL_TABS.map(item => (
                <button key={item.id}
                        className={`mobile-bottom-nav__item${activeTab === item.id ? " mobile-bottom-nav__item--active" : ""}`}
                        onClick={() => handleTab(item.id)}>
                    <span className="mobile-bottom-nav__icon">{item.icon}</span>
                    <span className="mobile-bottom-nav__label">{item.label}</span>
                    {item.badge && <span className="mobile-bottom-nav__badge">{item.badge}</span>}
                </button>
            ))}
        </nav>
    );
}

// ─── Empty binder state ───────────────────────────────────────────────────────
function EmptyBinderState({ onCatalog }) {
    return (
        <div className="binder-empty">
            {/* Ghost card grid */}
            <div className="binder-empty__ghost-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="binder-empty__ghost-card"
                         style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
            </div>

            <div className="binder-empty__text">
                <h2 className="binder-empty__title">
                    Start making your own collection ♡
                </h2>
                <p className="binder-empty__sub">
                    Your binder is empty — and that's the best place to start.
                    Head to the catalog, spend your ⭐ stars, and claim your first photocard.
                </p>
                <button className="btn btn-primary" onClick={onCatalog}>
                    Browse the catalog →
                </button>
            </div>
        </div>
    );
}

// ─── Collection tab ───────────────────────────────────────────────────────────
function CollectionTab({ eras, loading, onCatalog, onTrades }) {
    const [activeMember, setActiveMember] = useState("All");
    const [selectedCard, setSelectedCard] = useState(null);

    if (loading) {
        return (
            <div className="binder-loading">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="binder-loading__card"
                         style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
            </div>
        );
    }

    // Real new user — no cards at all
    if (eras.length === 0) {
        return <EmptyBinderState onCatalog={onCatalog} />;
    }

    const filtered   = activeMember === "All" ? eras : eras.filter(e => e.member === activeMember);
    const totalOwned = eras.reduce((s, e) => s + e.owned, 0);
    const totalCards = eras.reduce((s, e) => s + e.total, 0);
    const totalWish  = eras.reduce((s, e) => s + e.cards.filter(c => c.status === "wishlist").length, 0);
    const totalDupes = eras.reduce((s, e) => s + e.cards.filter(c => c.status === "duplicate").length, 0);
    const totalPct   = pct(totalOwned, totalCards);

    return (
        <>
            <div className="home__stats">
                <StatCard value={totalOwned}     label="Owned" />
                <StatCard value={totalWish}      label="Wishlist"  accentColor="var(--coral)" />
                <StatCard value={totalDupes}     label="Dupes"     accentColor="var(--purple-light)" />
                <StatCard value={`${totalPct}%`} label="Complete"  accentColor="var(--text-success)" />
            </div>
            <div className="home__filters">
                {MEMBERS.map(m => (
                    <button key={m}
                            className={`filter-btn${activeMember === m ? " filter-btn--active" : ""}`}
                            onClick={() => setActiveMember(m)}>{m}</button>
                ))}
            </div>
            {filtered.length > 0 ? (
                <div className="home__era-grid">
                    {filtered.map(era => <EraCard key={era.id} era={era} onCardClick={setSelectedCard} />)}
                </div>
            ) : (
                <div className="empty-state">
                    No cards for {activeMember} yet.<br />
                    <span style={{ fontSize: 15 }}>Browse the catalog to add some.</span>
                </div>
            )}
            <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} onTrades={onTrades} />
        </>
    );
}

// ─── Wishlist tab ─────────────────────────────────────────────────────────────
function WishlistTab({ eras, loading }) {
    if (loading) return null;

    const items = eras.flatMap(era =>
        era.cards
            .filter(c => c.status === "wishlist")
            .map(c => ({ ...c, member: era.member, era: era.era }))
    );

    if (!items.length) {
        return (
            <div className="empty-state">
                Your wishlist is empty.<br />
                <span style={{ fontSize: 15 }}>
                    Go to the catalog and tap ♡ on any card to add it here.
                </span>
            </div>
        );
    }

    return (
        <div className="wishlist-real-grid">
            {items.map((item, i) => {
                const [imgErr, setImgErr] = React.useState(false);
                return (
                    <div key={i} className="wishlist-real-card">
                        <div className="wishlist-real-card__img">
                            {item.publicUrl && !imgErr ? (
                                <img src={item.publicUrl}
                                     alt={item.ver}
                                     style={{ width:"100%", height:"100%",
                                         objectFit:"cover", borderRadius:"inherit" }}
                                     onError={() => setImgErr(true)}
                                     loading="lazy" />
                            ) : (
                                <div style={{ display:"flex", alignItems:"center",
                                    justifyContent:"center", height:"100%",
                                    fontFamily:"var(--font-serif)", fontSize:18,
                                    color:"var(--purple-pale)", fontStyle:"italic" }}>
                                    {item.member}
                                </div>
                            )}
                        </div>
                        <div className="wishlist-real-card__info">
                            <div style={{ fontSize:13, fontWeight:500,
                                color:"var(--text-secondary)" }}>{item.member}</div>
                            <div style={{ fontSize:11, color:"var(--text-faint)" }}>
                                {item.ver} · {item.era}
                            </div>
                            <span className="badge badge-wishlist" style={{ marginTop:6, display:"inline-block" }}>
                                ♡ wishlist
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// TradesTab removed — trades now live on their own TradesPage.

const PAGE_META = {
    collection: { title: "My binder", sub: "Your photocard collection, every era." },
    wishlist:   { title: "Wishlist",  sub: "Cards you're hunting."                 },
};

// ─── Home page ────────────────────────────────────────────────────────────────
export default function HomePage({
                                     onSignOut, onProfile, onLore, onUpdates, onStyle, onCatalog,
                                     onTrades, onGroupSwitch, activeGroup, initialTab = "collection",
                                 }) {
    const { user, profile } = useAuth();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [eras,    setEras]    = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Per-group stars (replaces global profile.stars) ──────────────────────
    const groupId = activeGroup?.id ?? "bts";
    const { stars: groupStars } = useGroupMembership(user?.id, groupId);

    const meta  = PAGE_META[activeTab] ?? PAGE_META.collection;
    const stars = groupStars;
    const username = profile?.username || user?.email?.split("@")[0] || "stan_collector";

    // ── Fetch real collection from Supabase ──────────────────────────────────
    useEffect(() => {
        if (!user) { setLoading(false); return; }
        setEras([]);   // clear previous group's cards immediately on switch
        setLoading(true);

        async function loadCollection() {
            try {
                const { data, error } = await supabase
                    .from("collection")
                    .select(`
                        card_id, status,
                        photocards (
                            id, image_url,
                            members   ( name, stage_name ),
                            versions  ( name,
                                albums ( title,
                                    eras ( name, slug )
                                )
                            )
                        )
                    `)
                    .eq("user_id", user.id)
                    .eq("group_id", groupId);  // ← only this group's cards

                if (error) throw error;
                if (!data || data.length === 0) {
                    setEras([]);
                    setLoading(false);
                    return;
                }

                // Group by member + era — include all statuses
                const grouped = {};
                data.forEach(row => {
                    const pc        = row.photocards;
                    const member    = pc?.members?.stage_name || pc?.members?.name || "Unknown";
                    const era       = pc?.versions?.albums?.eras?.name || pc?.versions?.albums?.title || "Unknown";
                    const version   = pc?.versions?.name || "Ver. A";
                    const imagePath = pc?.image_url;
                    const cleanPath = imagePath
                        ? (imagePath.includes(".") ? imagePath : imagePath + ".png")
                        : null;
                    const bucket  = `${groupId}-media`;   // e.g. "bts-media", "BlackPink-media"
                    const fullUrl = cleanPath
                        ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanPath}`
                        : null;
                    const key = `${member}__${era}`;

                    if (!grouped[key]) {
                        grouped[key] = { id: key, member, era, owned: 0, total: 0, cards: [] };
                    }
                    grouped[key].cards.push({ ver: version, status: row.status, publicUrl: fullUrl, cardId: row.card_id });
                    if (row.status === "owned") grouped[key].owned += 1;
                    grouped[key].total += 1;
                });

                setEras(Object.values(grouped));
            } catch (err) {
                console.error("Failed to load collection:", err);
                setEras([]);
            } finally {
                setLoading(false);
            }
        }

        loadCollection();
    }, [user, groupId]);  // ← re-fetch whenever the active group changes

    return (
        <>
            <div className="home">
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onSignOut={onSignOut}
                    onProfile={onProfile}
                    onLore={onLore}
                    onUpdates={onUpdates}
                    onStyle={onStyle}
                    onCatalog={onCatalog}
                    onTrades={onTrades}
                    onGroupSwitch={onGroupSwitch}
                    activeGroup={activeGroup}
                    stars={stars}
                    username={username}
                    avatar={profile?.avatar ?? null}
                />

                <main className="home__main">
                    <MobileTopBar
                        activeGroup={activeGroup}
                        onGroupSwitch={onGroupSwitch}
                        onProfile={onProfile}
                        stars={stars}
                        username={username}
                        avatar={profile?.avatar ?? null}
                    />
                    <div className="home__group-bar">
                        <div className="home__group-pill">
                            <div className="home__group-dot" />
                            <span className="home__group-label">{activeGroup?.name ?? "BTS"}</span>
                            <span className="home__group-era">{activeGroup?.era ?? "MOTS: 7"}</span>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={onGroupSwitch}
                                style={{ fontSize: 11, padding: "4px 12px" }}>
                            Switch group ↗
                        </button>
                    </div>

                    <div className="home__header">
                        <h1 className="home__title">{meta.title}</h1>
                        <p className="home__subtitle">{meta.sub}</p>
                    </div>

                    {activeTab === "collection" && (
                        <CollectionTab eras={eras} loading={loading} onCatalog={onCatalog} onTrades={onTrades} />
                    )}
                    {activeTab === "wishlist" && <WishlistTab eras={eras} loading={loading} />}
                </main>

            </div>
            <MobileBottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLore={onLore}
                onUpdates={onUpdates}
                onStyle={onStyle}
                onCatalog={onCatalog}
                onTrades={onTrades}
            />
        </>
    );
}