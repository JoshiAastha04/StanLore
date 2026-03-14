import { useState } from "react";
import "../Home/Home.css";
import "../../styles/Components.css";
import "../../styles/globals.css";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MEMBERS = ["All", "RM", "Jin", "Suga", "J-Hope", "Jimin", "V", "Jungkook"];

const ERAS = [
    {
        id: 1, member: "Jungkook", era: "Butter", owned: 5, total: 8,
        cards: [
            { ver: "Ver. A", status: "owned" },   { ver: "Ver. B", status: "owned" },
            { ver: "Ver. C", status: "wishlist" }, { ver: "Ver. D", status: "missing" },
            { ver: "Ver. E", status: "owned" },   { ver: "Ver. F", status: "duplicate" },
            { ver: "Ver. G", status: "owned" },   { ver: "Ver. H", status: "missing" },
        ],
    },
    {
        id: 2, member: "Jimin", era: "Proof", owned: 3, total: 6,
        cards: [
            { ver: "Ver. A", status: "owned" },   { ver: "Ver. B", status: "wishlist" },
            { ver: "Ver. C", status: "owned" },   { ver: "Ver. D", status: "missing" },
            { ver: "Ver. E", status: "owned" },   { ver: "Ver. F", status: "missing" },
        ],
    },
    {
        id: 3, member: "V", era: "BE", owned: 2, total: 4,
        cards: [
            { ver: "Ver. A", status: "owned" },   { ver: "Ver. B", status: "missing" },
            { ver: "Ver. C", status: "owned" },   { ver: "Ver. D", status: "wishlist" },
        ],
    },
    {
        id: 4, member: "Suga", era: "Map of the Soul", owned: 6, total: 6,
        cards: [
            { ver: "Ver. A", status: "owned" }, { ver: "Ver. B", status: "owned" },
            { ver: "Ver. C", status: "owned" }, { ver: "Ver. D", status: "owned" },
            { ver: "Ver. E", status: "owned" }, { ver: "Ver. F", status: "owned" },
        ],
    },
];

// ─── Nav definitions ──────────────────────────────────────────────────────────
const BINDER_TABS = [
    { id: "collection", icon: "◫", label: "My binder" },
    { id: "wishlist",   icon: "◎", label: "Wishlist"  },
    { id: "trades",     icon: "⇄", label: "Trades"    },
    { id: "catalog",    icon: "✦", label: "Catalog"   },
];

// Style sits between Updates and Lore — fixes the gap and adds the page
const COMMUNITY_TABS = [
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

const pct = (owned, total) => Math.round((owned / total) * 100);

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

// ─── Photocard tile ───────────────────────────────────────────────────────────
function PcTile({ card, onClick }) {
    return (
        <div className={`pc-tile pc-tile--${card.status}`} onClick={() => onClick(card)}>
            <div className="pc-tile__ver">{card.ver}</div>
            <span className={`badge ${BADGE_CLASS[card.status]}`}>{card.status}</span>
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

// ─── Card modal ───────────────────────────────────────────────────────────────
function CardModal({ card, onClose }) {
    if (!card) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card-modal" onClick={e => e.stopPropagation()}>
                <div className={`card-modal__preview pc-tile--${card.status}`}>
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: 22,
                        color: "var(--purple-pale)", fontStyle: "italic" }}>{card.ver}</span>
                </div>
                <div className="card-modal__title">{card.ver}</div>
                <div className="card-modal__statuses">
                    {["owned","wishlist","duplicate","missing"].map(st => (
                        <button key={st}
                                className={`card-modal__status-btn badge ${BADGE_CLASS[st]}`}
                                style={{ opacity: card.status === st ? 1 : 0.45, cursor: "pointer", border: "none" }}
                        >{st}</button>
                    ))}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

// ─── Sidebar (desktop only) ───────────────────────────────────────────────────
// Fix #1: profile button moves to TOP of sidebar (top-right of the page on desktop)
// Fix #2: Style tab added between Updates and Lore
function Sidebar({ activeTab, onTabChange, onSignOut, onProfile,
                     onLore, onUpdates, onStyle, onGroupSwitch, activeGroup }) {

    function handleCommunity(id) {
        if (id === "lore")    { onLore?.();    return; }
        if (id === "updates") { onUpdates?.(); return; }
        if (id === "style")   { onStyle?.();   return; }
        onTabChange(id);
    }

    return (
        <aside className="sidebar">

            {/* Logo + profile avatar in one row — profile always top-right */}
            <div className="sidebar__toprow">
                <div className="sidebar__logo" style={{ marginBottom: 0 }}>
                    <div className="logo-mark logo-mark--sm">S</div>
                    <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                </div>
                {/* Fix #1: profile button top-right on desktop */}
                <button className="sidebar__profile-btn" onClick={() => onProfile?.("stan_collector")}
                        title="My profile">
                    <div className="sidebar__profile-avatar">✦</div>
                </button>
            </div>

            {/* Active group pill */}
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
                            onClick={() => onTabChange(item.id)}>
                        <span className="sidebar__nav-icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar__section-label" style={{ marginTop: 20 }}>Community</div>
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

            {/* Sign out only at bottom — profile moved to top */}
            <div className="sidebar__user">
                <div className="sidebar__user-row">
                    <div className="avatar avatar--sm" style={{ background: "rgba(127,119,221,0.2)", fontSize: 14 }}>✦</div>
                    <div style={{ flex: 1 }}>
                        <div className="sidebar__user-name">@stan_collector</div>
                        <div className="sidebar__user-tag">Early access</div>
                    </div>
                </div>
                <button className="sidebar__signout" onClick={onSignOut}>Sign out</button>
            </div>

        </aside>
    );
}

// ─── Mobile top bar ───────────────────────────────────────────────────────────
// Fix #1: profile avatar always top-right on mobile too
function MobileTopBar({ activeGroup, onGroupSwitch, onProfile }) {
    return (
        <div className="mobile-topbar">
            <button className="mobile-topbar__group" onClick={onGroupSwitch}>
                <div className="mobile-topbar__dot" />
                <span className="mobile-topbar__group-name">{activeGroup?.name ?? "BTS"}</span>
                <span className="mobile-topbar__era">{activeGroup?.era ?? "MOTS: 7"}</span>
                <span style={{ fontSize: 10, color: "var(--text-faint)", marginLeft: 2 }}>↗</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="logo-mark logo-mark--sm">S</div>
            </div>

            {/* Fix #1: always top-right, always tappable */}
            <button className="mobile-topbar__profile" onClick={() => onProfile?.("stan_collector")}>
                <div className="mobile-topbar__avatar">✦</div>
            </button>
        </div>
    );
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────
// Fix #2: Style sits between Updates and Lore — no gap
// Tab order: My binder | Wishlist | Trades | Catalog | Updates | Style | Lore
function MobileBottomNav({ activeTab, onTabChange, onLore, onUpdates, onStyle }) {
    const ALL_TABS = [...BINDER_TABS, ...COMMUNITY_TABS];

    function handleTab(id) {
        if (id === "lore")    { onLore?.();    return; }
        if (id === "updates") { onUpdates?.(); return; }
        if (id === "style")   { onStyle?.();   return; }
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

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function CollectionTab({ eras }) {
    const [activeMember, setActiveMember] = useState("All");
    const [selectedCard, setSelectedCard] = useState(null);

    const filtered   = activeMember === "All" ? eras : eras.filter(e => e.member === activeMember);
    const totalOwned = eras.reduce((s, e) => s + e.owned, 0);
    const totalCards = eras.reduce((s, e) => s + e.total, 0);
    const totalWish  = eras.reduce((s, e) => s + e.cards.filter(c => c.status === "wishlist").length, 0);
    const totalDupes = eras.reduce((s, e) => s + e.cards.filter(c => c.status === "duplicate").length, 0);
    const totalPct   = Math.round((totalOwned / totalCards) * 100);

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
                    No eras for {activeMember}.<br />
                    <span style={{ fontSize: 15 }}>Browse the catalog to start.</span>
                </div>
            )}
            <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        </>
    );
}

function WishlistTab({ eras }) {
    const items = eras.flatMap(era =>
        era.cards.filter(c => c.status === "wishlist").map(c => ({ ...c, member: era.member, era: era.era }))
    );
    if (!items.length) return (
        <div className="empty-state">Your wishlist is empty.<br />
            <span style={{ fontSize: 15 }}>Start exploring the catalog.</span></div>
    );
    return (
        <div className="wishlist-grid">
            {items.map((item, i) => (
                <div key={i} className="wishlist-card">
                    <div className="wishlist-card__member">{item.member}</div>
                    <div className="wishlist-card__era">{item.era} Era</div>
                    <div className="wishlist-card__ver">{item.ver}</div>
                    <div style={{ marginTop: 10 }}><span className="badge badge-wishlist">wishlist</span></div>
                </div>
            ))}
        </div>
    );
}

const EXAMPLE_TRADES = [
    { user: "@purple_collector", have: "Jungkook · Butter · Ver. C", want: "Jimin · Butter · Ver. A",  time: "2h ago" },
    { user: "@binder_stan",      have: "V · Proof · Ver. B",         want: "V · Proof · Ver. A",       time: "5h ago" },
    { user: "@sevenpc",          have: "RM · BE · Ver. A",           want: "Jin · BE · Ver. A",         time: "1d ago" },
];

function TradesTab() {
    return (
        <>
            <div className="trades-compose">
                <div className="trades-compose__title">Post a trade listing</div>
                <div className="trades-compose__row">
                    <div className="trades-compose__field">
                        <div className="section-label">I have</div>
                        <input className="input" placeholder="e.g. V · Proof · Ver. A" />
                    </div>
                    <div className="trades-compose__arrow">⇄</div>
                    <div className="trades-compose__field">
                        <div className="section-label">I want</div>
                        <input className="input" placeholder="e.g. Jimin · Proof · Ver. B" />
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 22 }}>Post listing</button>
                </div>
            </div>
            {EXAMPLE_TRADES.map((l, i) => (
                <div key={i} className="trade-listing">
                    <div className="avatar avatar--sm" style={{ background: "rgba(127,119,221,0.2)", color: "var(--text-muted)" }}>✦</div>
                    <div style={{ flex: 1 }}>
                        <div className="trade-listing__user">{l.user}</div>
                        <div className="trade-listing__cards">
                            <span className="trade-listing__have">{l.have}</span>
                            <span className="trade-listing__arrow">⇄</span>
                            <span className="trade-listing__want">{l.want}</span>
                        </div>
                    </div>
                    <div className="trade-listing__meta">
                        <span className="trade-listing__time">{l.time}</span>
                        <button className="btn btn-ghost btn-sm">DM to trade</button>
                    </div>
                </div>
            ))}
        </>
    );
}

function CatalogTab() {
    return (
        <div className="empty-state">
            Full catalog coming soon.<br />
            <span style={{ fontSize: 15 }}>Starting with ARIRANG and Butter eras.</span>
        </div>
    );
}

const PAGE_META = {
    collection: { title: "My binder",   sub: "Your photocard collection, every era." },
    wishlist:   { title: "Wishlist",    sub: "Cards you're hunting."                 },
    trades:     { title: "Trade board", sub: "Have dupes? Find what you want."       },
    catalog:    { title: "Catalog",     sub: "Browse all photocards."                },
};

// ─── Home page ────────────────────────────────────────────────────────────────
export default function HomePage({
                                     onSignOut, onProfile, onLore, onUpdates, onStyle,
                                     onGroupSwitch, activeGroup, initialTab = "collection",
                                 }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const meta = PAGE_META[activeTab] ?? PAGE_META.collection;

    return (
        <div className="home">

            {/* Desktop sidebar — hidden on mobile */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSignOut={onSignOut}
                onProfile={onProfile}
                onLore={onLore}
                onUpdates={onUpdates}
                onStyle={onStyle}
                onGroupSwitch={onGroupSwitch}
                activeGroup={activeGroup}
            />

            {/* Mobile top bar — profile always top-right */}
            <MobileTopBar
                activeGroup={activeGroup}
                onGroupSwitch={onGroupSwitch}
                onProfile={onProfile}
            />

            <main className="home__main">
                {/* Desktop group context bar */}
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

                {activeTab === "collection" && <CollectionTab eras={ERAS} />}
                {activeTab === "wishlist"   && <WishlistTab   eras={ERAS} />}
                {activeTab === "trades"     && <TradesTab />}
                {activeTab === "catalog"    && <CatalogTab />}
            </main>

            {/* Mobile bottom nav — hidden on desktop */}
            <MobileBottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLore={onLore}
                onUpdates={onUpdates}
                onStyle={onStyle}
            />
        </div>
    );
}
