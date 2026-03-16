import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "./TradesPage.css";
import "../../styles/Mobile.css";

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

// ─── User avatar — emoji if set, SVG silhouette otherwise ─────────────────────
function UserAvatar({ avatar, size = 32 }) {
    if (avatar) {
        return (
            <div style={{
                width: size, height: size, borderRadius: "50%", flexShrink: 0,
                background: "rgba(38,33,92,0.8)",
                border: "1px solid rgba(175,169,236,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: size * 0.46,
            }}>
                {avatar}
            </div>
        );
    }
    return (
        <svg width={size} height={size} viewBox="0 0 72 72" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="36" cy="36" r="36" fill="rgba(38,33,92,0.8)" />
            <circle cx="36" cy="36" r="35" stroke="rgba(175,169,236,0.2)" strokeWidth="1" />
            <circle cx="36" cy="27" r="11" fill="rgba(175,169,236,0.55)" />
            <path d="M14 62 C14 48 22 42 36 42 C50 42 58 48 58 62" fill="rgba(175,169,236,0.55)" />
        </svg>
    );
}

// ─── Compose form ─────────────────────────────────────────────────────────────
function ComposeForm({ ownedCards, onPosted, username, userAvatar }) {
    const [have,    setHave]    = useState("");
    const [want,    setWant]    = useState("");
    const [posting, setPosting] = useState(false);
    const [error,   setError]   = useState("");
    const [success, setSuccess] = useState(false);

    // Build autocomplete options from owned cards
    const cardOptions = ownedCards.map(row => {
        const pc     = row.photocards;
        const member = pc?.members?.stage_name || pc?.members?.name || "Unknown";
        const ver    = pc?.versions?.name || "";
        const album  = pc?.versions?.albums?.title || "";
        return `${member} · ${album} · ${ver}`;
    });

    async function handlePost(e) {
        e?.preventDefault();
        if (!have.trim()) { setError("Tell us what card you have."); return; }
        if (!want.trim()) { setError("Tell us what card you want."); return; }
        setPosting(true); setError(""); setSuccess(false);

        const { data: { user } } = await supabase.auth.getUser();
        const { error: err } = await supabase
            .from("trade_listings")
            .insert({
                user_id:     user?.id,
                username:    username,
                user_avatar: userAvatar ?? null,
                have_card:   have.trim(),
                want_card:   want.trim(),
            });

        setPosting(false);

        if (err) {
            setError("Couldn't post listing — try again.");
            console.error(err);
            return;
        }

        setHave(""); setWant(""); setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        onPosted?.();
    }

    return (
        <div className="trades__compose card">
            <div className="trades__compose-title">Post a trade listing</div>

            {error && (
                <div className="trades__compose-msg trades__compose-msg--error">{error}</div>
            )}
            {success && (
                <div className="trades__compose-msg trades__compose-msg--ok">✦ Listing posted!</div>
            )}

            <div className="trades__compose-row">
                <div className="trades__compose-field">
                    <label className="section-label">I HAVE</label>
                    <input className="input" list="have-options"
                           placeholder="e.g. V · Proof · Ver. A"
                           value={have} onChange={e => setHave(e.target.value)} />
                    <datalist id="have-options">
                        {cardOptions.map((opt, i) => <option key={i} value={opt} />)}
                    </datalist>
                </div>

                <span className="trades__compose-arrow">⇄</span>

                <div className="trades__compose-field">
                    <label className="section-label">I WANT</label>
                    <input className="input" placeholder="e.g. Jimin · Butter · Ver. A"
                           value={want} onChange={e => setWant(e.target.value)} />
                </div>

                <button className="btn btn-primary btn-sm"
                        style={{ marginTop: 20, flexShrink: 0 }}
                        disabled={posting} onClick={handlePost}>
                    {posting ? "Posting..." : "Post listing"}
                </button>
            </div>
        </div>
    );
}

// ─── No cards empty state ────────────────────────────────────────────────────
function NoCardsState({ onCatalog }) {
    return (
        <div className="trades__no-cards card">
            <div className="trades__no-cards-icon">⇄</div>
            <h3 className="trades__no-cards-title">Get some cards first</h3>
            <p className="trades__no-cards-sub">
                You need at least one owned photocard before you can post a trade listing.
                Browse the catalog and claim your first card!
            </p>
            <button className="btn btn-primary" onClick={onCatalog}>
                Browse the catalog →
            </button>
        </div>
    );
}

// ─── Trade listing row ────────────────────────────────────────────────────────
function TradeListing({ listing, currentUsername }) {
    const isOwn = (listing.username || listing.author) === currentUsername;
    const displayName = listing.username || listing.author || "stan";

    return (
        <div className={`trades__listing${isOwn ? " trades__listing--own" : ""}`}>
            {isOwn && <div className="trades__listing-own-line" />}
            <UserAvatar avatar={listing.user_avatar ?? null} size={32} />
            <div className="trades__listing-body">
                <span className="trades__listing-user">
                    @{displayName}
                    {isOwn && <span className="trades__listing-you">you</span>}
                </span>
                <div className="trades__listing-cards">
                    <span className="trades__listing-have">{listing.have_card}</span>
                    <span className="trades__listing-arrow">⇄</span>
                    <span className="trades__listing-want">{listing.want_card}</span>
                </div>
            </div>
            <div className="trades__listing-meta">
                <span className="trades__listing-time">{timeAgo(listing.created_at)}</span>
                {!isOwn && <button className="btn btn-ghost btn-sm">DM to trade</button>}
            </div>
        </div>
    );
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────
function MobileBottomNav({ onHome, onCatalog, onUpdates, onStyle, onLore, onTrades }) {
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
                        className={`mobile-bottom-nav__item${tab.id === "trades" ? " mobile-bottom-nav__item--active" : ""}`}
                        onClick={tab.action}>
                    <span className="mobile-bottom-nav__icon">{tab.icon}</span>
                    <span className="mobile-bottom-nav__label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}

// ─── Trades page ──────────────────────────────────────────────────────────────
export default function TradesPage({
                                       onBack, onHome, onCatalog, onUpdates, onStyle, onLore, onTrades,
                                   }) {
    const { user, profile } = useAuth();
    const [listings,   setListings]   = useState([]);
    const [ownedCards, setOwnedCards] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [loadingOwned, setLoadingOwned] = useState(true);

    const username = profile?.username || profile?.display_name
        || user?.email?.split("@")[0] || "stan";

    // ── Load all trade listings ───────────────────────────────────────────────
    async function loadListings() {
        const { data, error } = await supabase
            .from("trade_listings")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) { console.error(error); }

        const rows = data ?? [];

        // Fetch current avatars for all listing authors from profiles
        const userIds = [...new Set(rows.map(l => l.user_id).filter(Boolean))];
        const { data: profileRows } = userIds.length > 0
            ? await supabase.from("profiles").select("id, avatar").in("id", userIds)
            : { data: [] };
        const avatarMap = Object.fromEntries((profileRows ?? []).map(p => [p.id, p.avatar]));

        setListings(rows.map(l => ({
            ...l,
            user_avatar: avatarMap[l.user_id] ?? l.user_avatar ?? null,
        })));
        setLoading(false);
    }

    // ── Load user's owned cards (for autocomplete + gating) ───────────────────
    async function loadOwnedCards() {
        if (!user) { setLoadingOwned(false); return; }
        const { data, error } = await supabase
            .from("collection")
            .select(`
                card_id, status,
                photocards (
                    id,
                    members   ( name, stage_name ),
                    versions  ( name,
                        albums ( title )
                    )
                )
            `)
            .eq("user_id", user.id)
            .eq("status", "owned");

        if (error) { console.error(error); }
        setOwnedCards(data ?? []);
        setLoadingOwned(false);
    }

    useEffect(() => {
        loadListings();
        loadOwnedCards();
    }, [user]);

    const hasOwnedCards = ownedCards.length > 0;
    const ready = !loading && !loadingOwned;

    return (
        <>
            <div className="trades-page">
                <div className="orb orb--1" />
                <div className="orb orb--3" />

                {/* Nav */}
                <nav className="trades__nav">
                    <button className="trades__back" onClick={onBack}>← Back</button>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="logo-mark logo-mark--sm">S</div>
                        <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                    </div>
                    <div style={{ minWidth: 60 }} />
                </nav>

                <main className="trades__main">
                    {/* Header */}
                    <div className="trades__header">
                        <div className="eyebrow" style={{ marginBottom: 10 }}>Binder</div>
                        <h1 className="trades__title">Trade board</h1>
                        <p className="trades__sub">Have dupes? Find what you want.</p>
                    </div>

                    {!ready ? (
                        <div style={{ padding: "40px 0", textAlign: "center",
                            fontFamily: "var(--font-serif)", fontSize: 18,
                            color: "var(--text-faint)", fontStyle: "italic" }}>
                            Loading...
                        </div>
                    ) : (
                        <>
                            {/* Compose — gated behind owning at least 1 card */}
                            {hasOwnedCards ? (
                                <ComposeForm
                                    ownedCards={ownedCards}
                                    username={username}
                                    userAvatar={profile?.avatar ?? null}
                                    onPosted={loadListings}
                                />
                            ) : (
                                <NoCardsState onCatalog={onCatalog} />
                            )}

                            {/* Listings stack */}
                            <div className="trades__stack">
                                {listings.length === 0 ? (
                                    <div className="empty-state" style={{ marginTop: 32 }}>
                                        No listings yet.<br />
                                        <span style={{ fontSize: 15 }}>
                                            Be the first to post one above!
                                        </span>
                                    </div>
                                ) : (
                                    listings.map(listing => (
                                        <TradeListing
                                            key={listing.id}
                                            listing={listing}
                                            currentUsername={username}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>

            <MobileBottomNav
                onHome={onHome}
                onCatalog={onCatalog}
                onUpdates={onUpdates}
                onStyle={onStyle}
                onLore={onLore}
                onTrades={onTrades}
            />
        </>
    );
}