import { useState } from "react";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "../Profile/profile.css";

// ─── Mock data ────────────────────────────────────────────────────────────────
const USER = {
    username: "stanqueen",
    displayName: "Kira",
    bio: "collecting since 2019 ✦ bts + skz + svt girlie ✦ dm for trades",
    initials: "K",
    joinDate: "March 2019",
    totalTrades: 34,
    points: 2840,
    groups: [
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
    ],
};

const STATUS_META = {
    owned:      { label: "Owned",     cls: "badge-owned" },
    duplicate:  { label: "Duplicate", cls: "badge-duplicate" },
    "for-trade":{ label: "For Trade", cls: "badge-wishlist" },
    wishlist:   { label: "Wishlist",  cls: "badge-missing" },
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProfilePage({ onHome }) {
    const [activeTab, setActiveTab] = useState("overview");
    const totalCards = USER.groups.reduce((s, g) => s + g.cards, 0);
    const totalWish  = USER.groups.reduce((s, g) => s + g.wishlist, 0);

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

                {/* Hero card */}
                <div className="profile-v2__hero card">
                    <div className="profile-v2__hero-glow" />

                    {/* Avatar */}
                    <div className="profile-v2__avatar-wrap">
                        <div className="avatar avatar--lg profile-v2__avatar"
                             style={{ width: 72, height: 72, fontSize: 26 }}>
                            {USER.initials}
                        </div>
                        <div className="profile-v2__group-ring">
                             {USER.groups.map((g) => (
                                <div key={g.id} className="profile-v2__group-dot" title={g.name} />
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="profile-v2__info">
                        <div className="profile-v2__name-row">
                            <span className="profile-v2__display-name">{USER.displayName}</span>
                            <span className="profile-v2__username">@{USER.username}</span>
                            <span className="badge badge-owned" style={{ fontSize: 10 }}>
                                ✦ {USER.points.toLocaleString()} pts
                            </span>
                        </div>
                        <p className="profile-v2__bio">{USER.bio}</p>
                        <div className="profile-v2__meta">
                            <span>Joined {USER.joinDate}</span>
                            <span className="profile-v2__sep">·</span>
                            <span>{USER.groups.length} fandoms</span>
                            <span className="profile-v2__sep">·</span>
                            <span>{USER.totalTrades} trades</span>
                        </div>
                    </div>

                    {/* Global stats */}
                    <div className="profile-v2__global-stats">
                        {[
                            { v: totalCards,         l: "Cards"   },
                            { v: totalWish,          l: "Wishlist"},
                            { v: USER.totalTrades,   l: "Trades"  },
                            { v: USER.groups.length, l: "Fandoms" },
                        ].map(({ v, l }) => (
                            <div key={l} className="profile-v2__gstat">
                                <div className="stat-card__value" style={{ fontSize: 28 }}>{v}</div>
                                <div className="stat-card__label">{l}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="profile-v2__tabs">
                    {["overview", "collection", "wishlist", "trades"].map(tab => (
                        <button
                            key={tab}
                            className={`profile-v2__tab${activeTab === tab ? " profile-v2__tab--active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {activeTab === "overview"   && <OverviewTab />}
                {activeTab === "collection" && <CollectionTab />}
                {activeTab === "wishlist"   && <WishlistTab />}
                {activeTab === "trades"     && <TradesTab />}

            </main>
        </div>
    );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab() {
    const allRecent = USER.groups.flatMap(g =>
        g.recentCards.map(c => ({ ...c, group: g }))
    );

    return (
        <div className="profile-v2__overview">

            <div>
                <div className="section-label">My Fandoms</div>
                <div className="profile-v2__fandom-list">
                    {USER.groups.map(g => (
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
                                        { v: g.cards, l: "cards" },
                                        { v: g.trades, l: "trades" },
                                        { v: `${g.wishlistPct}%`, l: "wish" },
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
function CollectionTab() {
    return (
        <div className="profile-v2__collection">
            {USER.groups.map(g => (
                <div key={g.id} className="profile-v2__col-section">
                    <div className="profile-v2__col-header">
                        <span className="eyebrow">{g.name}</span>
                        <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{g.cards} cards</span>
                    </div>
                    <div className="binder-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", padding: 0, marginTop: 12 }}>
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
                             style={{ border: "0.5px dashed var(--border-soft)", cursor: "pointer", alignItems: "center", justifyContent: "center", display: "flex" }}>
                            <span style={{ fontSize: 20, color: "var(--text-faint)" }}>+</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
function WishlistTab() {
    return (
        <div className="profile-v2__collection">
            {USER.groups.map(g => (
                <div key={g.id} className="profile-v2__col-section">
                    <div className="profile-v2__col-header">
                        <span className="eyebrow">{g.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{g.wishlistPct}% complete</span>
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

// ─── Trades ───────────────────────────────────────────────────────────────────
function TradesTab() {
    return (
        <div className="empty-state">
            <div className="stat-card__value" style={{ fontSize: 52, marginBottom: 8 }}>{USER.totalTrades}</div>
            trades completed<br />
            <span style={{ fontSize: 15 }}>Trade history and active offers will appear here.</span>
        </div>
    );
}
