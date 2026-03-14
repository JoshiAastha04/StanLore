import { useState } from "react";
import "../../styles/Home.css";
import "../../styles/Components.css";
import "../../styles/globals.css";

// ─── Mock data (replace with Supabase queries later) ──────────────────────────
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

const NAV_ITEMS = [
    { id: "collection", icon: "◫", label: "My binder" },
    { id: "wishlist",   icon: "◎", label: "Wishlist" },
    { id: "trades",     icon: "⇄", label: "Trades" },
    { id: "catalog",    icon: "✦", label: "Catalog" },
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
    const completion  = pct(era.owned, era.total);
    const isComplete  = completion === 100;
    const initials    = MEMBER_INITIALS[era.member] || era.member.slice(0, 2).toUpperCase();
    const cols        = Math.min(era.cards.length, 4);

    return (
        <div className="era-card">

            <div className="era-card__header">
                <div className="avatar avatar--sm">{initials}</div>
                <div>
                    <div className="era-card__member-name">{era.member}</div>
                    <div className="era-card__era-name">{era.era} Era</div>
                </div>
                <div className={`era-card__count ${isComplete ? "era-card__count--complete" : ""}`}>
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
                        className={`progress-fill ${isComplete ? "progress-fill--complete" : ""}`}
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
                            className={`card-modal__status-btn badge ${BADGE_CLASS[st]} ${card.status === st ? "card-modal__status-btn--active" : ""}`}
                            style={{
                                opacity: card.status === st ? 1 : 0.45,
                                cursor: "pointer",
                                border: "none",
                            }}
                        >{st}</button>
                    ))}
                </div>

                <button className="btn btn-ghost btn-sm" onClick={onClose}>
                    Close
                </button>

            </div>
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTabChange, onSignOut }) {
    return (
        <aside className="sidebar">

            <div className="sidebar__logo">
                <div className="logo-mark logo-mark--sm">S</div>
                <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
            </div>

            <nav className="sidebar__nav">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar__nav-item ${activeTab === item.id ? "sidebar__nav-item--active" : ""}`}
                        onClick={() => onTabChange(item.id)}
                    >
                        <span className="sidebar__nav-icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar__spacer" />

            <div className="sidebar__user">
                <div className="sidebar__user-row">
                    <div className="avatar avatar--sm" style={{ background: "rgba(127,119,221,0.3)" }}>✦</div>
                    <div>
                        <div className="sidebar__user-name">@army_collector</div>
                        <div className="sidebar__user-tag">Early access</div>
                    </div>
                </div>
                <button className="sidebar__signout" onClick={onSignOut}>
                    Sign out
                </button>
            </div>

        </aside>
    );
}

// ─── Collection tab ───────────────────────────────────────────────────────────
function CollectionTab({ eras }) {
    const [activeMember, setActiveMember] = useState("All");
    const [selectedCard, setSelectedCard] = useState(null);

    const filtered     = activeMember === "All" ? eras : eras.filter(e => e.member === activeMember);
    const totalOwned   = eras.reduce((s, e) => s + e.owned, 0);
    const totalCards   = eras.reduce((s, e) => s + e.total, 0);
    const totalWish    = eras.reduce((s, e) => s + e.cards.filter(c => c.status === "wishlist").length, 0);
    const totalDupes   = eras.reduce((s, e) => s + e.cards.filter(c => c.status === "duplicate").length, 0);
    const totalPct     = Math.round((totalOwned / totalCards) * 100);

    return (
        <>
            {/* Stats */}
            <div className="home__stats">
                <StatCard value={totalOwned}    label="Owned" />
                <StatCard value={totalWish}     label="Wishlist"  accentColor="var(--coral)" />
                <StatCard value={totalDupes}    label="Dupes"     accentColor="var(--purple-light)" />
                <StatCard value={`${totalPct}%`} label="Complete" accentColor="var(--text-success)" />
            </div>

            {/* Member filter */}
            <div className="home__filters">
                {MEMBERS.map(m => (
                    <button
                        key={m}
                        className={`filter-btn ${activeMember === m ? "filter-btn--active" : ""}`}
                        onClick={() => setActiveMember(m)}
                    >{m}</button>
                ))}
            </div>

            {/* Era grid */}
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
        return <div className="empty-state">Your wishlist is empty.<br /><span style={{ fontSize: 15 }}>Start exploring the catalog.</span></div>;
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
            {/* Compose */}
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

            {/* Listings */}
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

// ─── Page titles ──────────────────────────────────────────────────────────────
const PAGE_META = {
    collection: { title: "My binder",   sub: "Your photocard collection, every era." },
    wishlist:   { title: "Wishlist",    sub: "Cards you're hunting." },
    trades:     { title: "Trade board", sub: "Have dupes? Find what you want." },
    catalog:    { title: "Catalog",     sub: "Browse all photocards." },
};

// ─── Home page ────────────────────────────────────────────────────────────────
export default function HomePage({ onSignOut }) {
    const [activeTab, setActiveTab] = useState("collection");
    const { title, sub } = PAGE_META[activeTab];

    return (
        <div className="home">

            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSignOut={onSignOut}
            />

            <main className="home__main">

                <div className="home__header">
                    <h1 className="home__title">{title}</h1>
                    <p className="home__subtitle">{sub}</p>
                </div>

                {activeTab === "collection" && <CollectionTab eras={ERAS} />}
                {activeTab === "wishlist"   && <WishlistTab   eras={ERAS} />}
                {activeTab === "trades"     && <TradesTab />}
                {activeTab === "catalog"    && <CatalogTab />}

            </main>

        </div>
    );
}
