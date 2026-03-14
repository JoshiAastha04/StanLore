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
            { ver: "Ver. A", status: "owned" },
            { ver: "Ver. B", status: "owned" },
            { ver: "Ver. C", status: "wishlist" },
            { ver: "Ver. D", status: "missing" },
            { ver: "Ver. E", status: "owned" },
            { ver: "Ver. F", status: "duplicate" },
            { ver: "Ver. G", status: "owned" },
            { ver: "Ver. H", status: "missing" },
        ],
    },
    {
        id: 2, member: "Jimin", era: "Proof", owned: 3, total: 6,
        cards: [
            { ver: "Ver. A", status: "owned" },
            { ver: "Ver. B", status: "wishlist" },
            { ver: "Ver. C", status: "owned" },
            { ver: "Ver. D", status: "missing" },
            { ver: "Ver. E", status: "owned" },
            { ver: "Ver. F", status: "missing" },
        ],
    },
    {
        id: 3, member: "V", era: "BE", owned: 2, total: 4,
        cards: [
            { ver: "Ver. A", status: "owned" },
            { ver: "Ver. B", status: "missing" },
            { ver: "Ver. C", status: "owned" },
            { ver: "Ver. D", status: "wishlist" },
        ],
    },
    {
        id: 4, member: "Suga", era: "Map of the Soul", owned: 6, total: 6,
        cards: [
            { ver: "Ver. A", status: "owned" },
            { ver: "Ver. B", status: "owned" },
            { ver: "Ver. C", status: "owned" },
            { ver: "Ver. D", status: "owned" },
            { ver: "Ver. E", status: "owned" },
            { ver: "Ver. F", status: "owned" },
        ],
    },
];

// ─── Nav items: inner binder tabs ─────────────────────────────────────────────
const BINDER_TABS = [
    { id: "collection", icon: "◫", label: "My binder" },
    { id: "wishlist",   icon: "◎", label: "Wishlist"  },
    { id: "trades",     icon: "⇄", label: "Trades"    },
    { id: "catalog",    icon: "✦", label: "Catalog"   },
];

// ─── Nav items: global pages ──────────────────────────────────────────────────
const GLOBAL_TABS = [
    { id: "updates", icon: "◈", label: "Updates"    },
    { id: "lore",    icon: "◉", label: "Lore Space" },
];

const BADGE_CLASS = {
    owned:     "badge-owned",
    wishlist:  "badge-wishlist",
    duplicate: "badge-duplicate",
    missing:   "badge-missing",
};

const MEMBER_INITIALS = {
    RM: "RM", Jin: "JN", Suga: "SG",
    "J-Hope": "JH", Jimin: "JM", V: "V", Jungkook: "JK",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
        <div
            className={`pc-tile pc-tile--${card.status}`}
            onClick={() => onClick(card)}
        >
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
                {era.cards.map((card, i) => (
                    <PcTile key={i} card={card} onClick={onCardClick} />
                ))}
            </div>

            <div className="era-card__footer">
                <span className="era-card__footer-label">{era.era} Era</span>
                <div className="progress-track">
                    <div
                        className={`progress-fill${isComplete ? " progress-fill--complete" : ""}`}
                        style={{ width: `${completion}%` }}
                    />
                </div>
                <span className="era-card__pct">{completion}%</span>
            </div>
        </div>
    );
}

// ─── Card status modal ────────────────────────────────────────────────────────
function CardModal({ card, onClose }) {
    if (!card) return null;
    const statuses = ["owned", "wishlist", "duplicate", "missing"];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card-modal" onClick={e => e.stopPropagation()}>
                <div className={`card-modal__preview pc-tile--${card.status}`}>
                    <span style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 22,
                        color: "var(--purple-pale)",
                        fontStyle: "italic",
                    }}>{card.ver}</span>
                </div>
                <div className="card-modal__title">{card.ver}</div>
                <div className="card-modal__statuses">
                    {statuses.map(st => (
                        <button
                            key={st}
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

// ─── Group pill (sidebar) ─────────────────────────────────────────────────────
function GroupPill({ group, onSwitch }) {
    return (
        <button className="sidebar__group-pill" onClick={onSwitch} title="Switch group">
            <div className="sidebar__group-dot" />
            <div>
                <div className="sidebar__group-name">{group?.name ?? "BTS"}</div>
                <div className="sidebar__group-era">{group?.era ?? "MOTS: 7"}</div>
            </div>
            <span className="sidebar__group-switch">↗</span>
        </button>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTabChange, onSignOut, onProfile, onLore, onUpdates, onGroupSwitch, activeGroup }) {
    return (
        <aside className="sidebar">

            <div className="sidebar__logo">
                <div className="logo-mark logo-mark--sm">S</div>
                <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
            </div>

            {/* Active group pill */}
            <GroupPill group={activeGroup} onSwitch={onGroupSwitch} />

            {/* Divider label */}
            <div className="sidebar__section-label">Binder</div>

            {/* Binder nav */}
            <nav className="sidebar__nav">
                {BINDER_TABS.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar__nav-item${activeTab === item.id ? " sidebar__nav-item--active" : ""}`}
                        onClick={() => onTabChange(item.id)}
                    >
                        <span className="sidebar__nav-icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Divider label */}
            <div className="sidebar__section-label" style={{ marginTop: 20 }}>Community</div>

            {/* Global page nav */}
            <nav className="sidebar__nav">
                {GLOBAL_TABS.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar__nav-item${activeTab === item.id ? " sidebar__nav-item--active" : ""}`}
                        onClick={() => {
                            if (item.id === "lore")    { onLore?.();    return; }
                            if (item.id === "updates") { onUpdates?.(); return; }
                            onTabChange(item.id);
                        }}
                    >
                        <span className="sidebar__nav-icon">{item.icon}</span>
                        {item.label}
                        {item.id === "updates" && (
                            <span className="sidebar__nav-badge">7</span>
                        )}
                    </button>
                ))}
            </nav>

            <div className="sidebar__spacer" />

            {/* User footer */}
            <div className="sidebar__user">
                <button
                    className="sidebar__user-row sidebar__user-row--btn"
                    onClick={() => onProfile?.("army_collector")}
                >
                    <div className="avatar avatar--sm" style={{ background: "rgba(127,119,221,0.3)" }}>K</div>
                    <div style={{ flex: 1 }}>
                        <div className="sidebar__user-name">@army_collector</div>
                        <div className="sidebar__user-tag">Early access</div>
                    </div>
                    <span style={{ fontSize: 10, color: "var(--text-faint)" }}>→</span>
                </button>
                <button className="sidebar__signout" onClick={onSignOut}>Sign out</button>
            </div>

        </aside>
    );
}

// ─── Collection tab ───────────────────────────────────────────────────────────
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
                    <button
                        key={m}
                        className={`filter-btn${activeMember === m ? " filter-btn--active" : ""}`}
                        onClick={() => setActiveMember(m)}
                    >{m}</button>
                ))}
            </div>

            {filtered.length > 0 ? (
                <div className="home__era-grid">
                    {filtered.map(era => (
                        <EraCard key={era.id} era={era} onCardClick={setSelectedCard} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    No eras added yet for {activeMember}.<br />
                    <span style={{ fontSize: 15 }}>Browse the catalog to start.</span>
                </div>
            )}

            <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        </>
    );
}

// ─── Wishlist tab ─────────────────────────────────────────────────────────────
function WishlistTab({ eras }) {
    const items = eras.flatMap(era =>
        era.cards
            .filter(c => c.status === "wishlist")
            .map(c => ({ ...c, member: era.member, era: era.era }))
    );

    if (items.length === 0) {
        return (
            <div className="empty-state">
                Your wishlist is empty.<br />
                <span style={{ fontSize: 15 }}>Start exploring the catalog.</span>
            </div>
        );
    }

    return (
        <div className="wishlist-grid">
            {items.map((item, i) => (
                <div key={i} className="wishlist-card">
                    <div className="wishlist-card__member">{item.member}</div>
                    <div className="wishlist-card__era">{item.era} Era</div>
                    <div className="wishlist-card__ver">{item.ver}</div>
                    <div style={{ marginTop: 10 }}>
                        <span className="badge badge-wishlist">wishlist</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Trades tab ───────────────────────────────────────────────────────────────
const EXAMPLE_TRADES = [
    { user: "@purple_collector", have: "Jungkook · Butter · Ver. C", want: "Jimin · Butter · Ver. A",  time: "2h ago" },
    { user: "@armybinder_",      have: "V · Proof · Ver. B",         want: "V · Proof · Ver. A",       time: "5h ago" },
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
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 22 }}>
                        Post listing
                    </button>
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

// ─── Catalog tab ──────────────────────────────────────────────────────────────
function CatalogTab() {
    return (
        <div className="empty-state">
            Full catalog coming soon.<br />
            <span style={{ fontSize: 15 }}>Starting with Butter and Proof eras.</span>
        </div>
    );
}

// ─── Page meta ────────────────────────────────────────────────────────────────
const PAGE_META = {
    collection: { title: "My binder",    sub: "Your photocard collection, every era."  },
    wishlist:   { title: "Wishlist",     sub: "Cards you're hunting."                  },
    trades:     { title: "Trade board",  sub: "Have dupes? Find what you want."        },
    catalog:    { title: "Catalog",      sub: "Browse all photocards."                 },
};

// ─── Home page ────────────────────────────────────────────────────────────────
export default function HomePage({ onSignOut, onProfile, onLore, onUpdates, onGroupSwitch, activeGroup }) {
    const [activeTab, setActiveTab] = useState("collection");
    const meta = PAGE_META[activeTab] ?? PAGE_META.collection;

    return (
        <div className="home">

            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSignOut={onSignOut}
                onProfile={onProfile}
                onLore={onLore}
                onUpdates={onUpdates}
                onGroupSwitch={onGroupSwitch}
                activeGroup={activeGroup}
            />

            <main className="home__main">

                {/* Group context bar */}
                <div className="home__group-bar">
                    <div className="home__group-pill">
                        <div className="home__group-dot" />
                        <span className="home__group-label">{activeGroup?.name ?? "BTS"}</span>
                        <span className="home__group-era">{activeGroup?.era ?? "MOTS: 7"}</span>
                    </div>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={onGroupSwitch}
                        style={{ fontSize: 11, padding: "4px 12px" }}
                    >
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

        </div>
    );
}
