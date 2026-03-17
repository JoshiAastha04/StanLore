import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import TradeChat from "./TradesChat.jsx";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "./TradesPage.css";
import "../../styles/Mobile.css";

// ─── GROUP_CONFIG keeps bucket names in sync with CatalogPage ──────────────
const GROUP_CONFIG = {
    bts: { label: "BTS",       bucket: "bts-media"       },
    bp:  { label: "BLACKPINK", bucket: "BlackPink-media" },
};

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

// ─── User avatar ─────────────────────────────
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
function ComposeForm({ ownedCards, onPosted, username, userAvatar, groupId }) {
    const [have,       setHave]       = useState("");
    const [haveCardId, setHaveCardId] = useState(null); // integer photocard id
    const [want,       setWant]       = useState("");
    const [posting,    setPosting]    = useState(false);
    const [error,      setError]      = useState("");
    const [success,    setSuccess]    = useState(false);

    function handleCardSelect(e) {
        const idx = Number(e.target.value);
        if (idx === -1) { setHave(""); setHaveCardId(null); return; }
        const row    = ownedCards[idx];
        const pc     = row.photocards;
        const member = pc?.members?.stage_name || pc?.members?.name || "Unknown";
        const ver    = (pc?.versions?.name || "").replace(/Ver\.\s*/i, "Ver ").trim();
        const album  = pc?.versions?.albums?.title || "";
        setHave(`${member} - ${album} - ${ver}`);
        setHaveCardId(row.card_id);
    }

    async function handlePost(e) {
        e?.preventDefault();
        if (!have.trim())    { setError("Tell us what card you have."); return; }
        if (!want.trim())    { setError("Tell us what card you want."); return; }
        setPosting(true); setError(""); setSuccess(false);

        const { data: { user } } = await supabase.auth.getUser();
        const { error: err } = await supabase
            .from("trade_listings")
            .insert({
                user_id:      user?.id,
                username:     username,
                user_avatar:  userAvatar ?? null,
                have_card:    have.trim(),
                want_card:    want.trim(),
                have_card_id: haveCardId ?? null,
                group_id:     groupId,
            });

        setPosting(false);

        if (err) {
            setError("Couldn't post listing - try again.");
            console.error(err);
            return;
        }

        setHave(""); setWant(""); setHaveCardId(null); setSuccess(true);
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
                    {ownedCards.length > 0 ? (
                        <select
                            className="input"
                            defaultValue={-1}
                            onChange={handleCardSelect}
                        >
                            <option value={-1} disabled>Select a card…</option>
                            {ownedCards.map((row, idx) => {
                                const pc     = row.photocards;
                                const member = pc?.members?.stage_name || pc?.members?.name || "Unknown";
                                const ver    = pc?.versions?.name || "";
                                const album  = pc?.versions?.albums?.title || "";
                                const verClean = (pc?.versions?.name || "").replace(/Ver\.\s*/i, "Ver ").trim();
                                return (
                                    <option key={row.card_id} value={idx}>
                                        {`${member} - ${album} - ${verClean}`}
                                    </option>
                                );
                            })}
                        </select>
                    ) : (
                        <input
                            className="input"
                            placeholder="e.g. V - Proof - Ver. A"
                            value={have}
                            onChange={e => setHave(e.target.value)}
                        />
                    )}
                </div>

                <span className="trades__compose-arrow">⇄</span>

                <div className="trades__compose-field">
                    <label className="section-label">I WANT</label>
                    <input
                        className="input"
                        placeholder="e.g. Jimin - Butter - Ver A"
                        value={want}
                        onChange={e => setWant(e.target.value)}
                    />
                </div>

                <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 20, flexShrink: 0 }}
                    disabled={posting}
                    onClick={handlePost}
                >
                    {posting ? "Posting..." : "Post listing"}
                </button>
            </div>
        </div>
    );
}

// ─── No cards state ───────────────────────────────────────────────────────────
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
function TradeListing({ listing, currentUser, onDm, onViewDms, dmCount }) {
    const isOwn = listing.user_id === currentUser?.id;
    const displayName = listing.username || "stan";

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
                {isOwn ? (
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onViewDms(listing)}
                    >
                        DMs {dmCount > 0 && <span className="trades__dm-badge">{dmCount}</span>}
                    </button>
                ) : (
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onDm(listing)}
                    >
                        DM to trade
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Mobile bottom nav ───────────────
function MobileBottomNav({ onHome, onCatalog, onUpdates, onStyle, onLore }) {
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
                <button
                    key={tab.id}
                    className={`mobile-bottom-nav__item${tab.id === "trades" ? " mobile-bottom-nav__item--active" : ""}`}
                    onClick={tab.action}
                >
                    <span className="mobile-bottom-nav__icon">{tab.icon}</span>
                    <span className="mobile-bottom-nav__label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}

// ─── Trades page ──────────────
export default function TradesPage({
                                       activeGroup,
                                       onBack, onHome, onCatalog, onUpdates, onStyle, onLore, onTrades,
                                   }) {
    const { user, profile } = useAuth();
    const groupId = activeGroup?.id ?? "bts";
    const config  = GROUP_CONFIG[groupId] ?? GROUP_CONFIG.bts;

    const [listings,     setListings]     = useState([]);
    const [ownedCards,   setOwnedCards]   = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [loadingOwned, setLoadingOwned] = useState(true);
    const [dmCounts,     setDmCounts]     = useState({}); // listingId → count
    const [chatListing,  setChatListing]  = useState(null); // listing being chatted
    const [chatIsOwner,  setChatIsOwner]  = useState(false);

    const username = profile?.username || profile?.display_name
        || user?.email?.split("@")[0] || "stan";

    const currentUser = {
        id:       user?.id,
        username: username,
        avatar:   profile?.avatar ?? null,
    };

    // ── Load trade listings ───────────────────────────────────────────────────
    async function loadListings() {
        setLoading(true);
        const { data, error } = await supabase
            .from("trade_listings")
            .select("*")
            .eq("group_id", groupId)
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) { console.error(error); }

        const rows = data ?? [];

        // Fetch live avatars
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

    // ── Load conversation counts for own listings ─────────────────────────────
    async function loadDmCounts(rows) {
        if (!user || !rows.length) return;
        const ownListingIds = rows
            .filter(l => l.user_id === user.id)
            .map(l => l.id);
        if (!ownListingIds.length) return;

        const { data } = await supabase
            .from("trade_conversations")
            .select("listing_id")
            .in("listing_id", ownListingIds)
            .neq("status", "cancelled");

        if (!data) return;
        const counts = {};
        data.forEach(row => {
            counts[row.listing_id] = (counts[row.listing_id] ?? 0) + 1;
        });
        setDmCounts(counts);
    }

    // ── Load user's owned cards ───────────────────────────────────────────────
    async function loadOwnedCards() {
        if (!user) { setLoadingOwned(false); return; }
        const { data, error } = await supabase
            .from("collection")
            .select(`
                card_id, status,
                photocards (
                    id, image_url,
                    members   ( name, stage_name ),
                    versions  ( name,
                        albums ( title )
                    )
                )
            `)
            .eq("user_id",  user.id)
            .eq("group_id", groupId)
            .eq("status",   "owned");

        if (error) { console.error(error); }
        setOwnedCards(data ?? []);
        setLoadingOwned(false);
    }

    useEffect(() => {
        loadListings().then(() => {
            // dmCounts need listings; grab them after state is set
        });
        loadOwnedCards();
    }, [user, groupId]); // eslint-disable-line react-hooks/exhaustive-deps

    // dm counts depend on listings being loaded
    useEffect(() => {
        if (listings.length > 0) loadDmCounts(listings);
    }, [listings]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Open chat ─────────────────────────────────────────────────────────────
    function handleDm(listing) {
        setChatListing(listing);
        setChatIsOwner(false);
    }
    function handleViewDms(listing) {
        setChatListing(listing);
        setChatIsOwner(true);
    }
    function closeChat() {
        setChatListing(null);
    }
    function onTradeComplete() {
        // Reload after successful trade
        loadListings();
        loadOwnedCards();
        closeChat();
    }

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
                        <div className="eyebrow" style={{ marginBottom: 10 }}>
                            {activeGroup?.name ?? "BTS"}
                        </div>
                        <h1 className="trades__title">Trade board</h1>
                        <p className="trades__sub">Have dupes? Find what you want.</p>
                    </div>

                    {!ready ? (
                        <div style={{
                            padding: "40px 0", textAlign: "center",
                            fontFamily: "var(--font-serif)", fontSize: 18,
                            color: "var(--text-faint)", fontStyle: "italic",
                        }}>
                            Loading...
                        </div>
                    ) : (
                        <>
                            {/* Compose */}
                            {hasOwnedCards ? (
                                <ComposeForm
                                    ownedCards={ownedCards}
                                    username={username}
                                    userAvatar={profile?.avatar ?? null}
                                    groupId={groupId}
                                    onPosted={loadListings}
                                />
                            ) : (
                                <NoCardsState onCatalog={onCatalog} />
                            )}

                            {/* Listings */}
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
                                            currentUser={currentUser}
                                            onDm={handleDm}
                                            onViewDms={handleViewDms}
                                            dmCount={dmCounts[listing.id] ?? 0}
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
            />

            {/* Trade Chat Drawer */}
            {chatListing && (
                <TradeChat
                    listing={chatListing}
                    currentUser={currentUser}
                    isOwner={chatIsOwner}
                    groupId={groupId}
                    bucket={config.bucket}
                    ownedCards={ownedCards}
                    onClose={closeChat}
                    onTradeComplete={onTradeComplete}
                />
            )}
        </>
    );
}