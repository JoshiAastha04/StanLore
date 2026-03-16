import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getButterPhotos } from "../../lib/Photos";
import { supabase } from "../../lib/supabase";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "./CatalogPage.css";

const STAR_COST = { common: 5, mid: 10, rare: 15 };

function getCardRarity(photo) {
    // Use rarity column from DB (common/mid/rare), fallback to is_rare bool
    if (photo.rarity) return photo.rarity.toLowerCase();
    if (photo.is_rare) return "rare";
    return "common";
}
function getStarCost(photo) {
    if (photo.star_cost) return photo.star_cost;
    return STAR_COST[getCardRarity(photo)];
}

function getRarityLabel(photo) {
    const r = getCardRarity(photo);
    if (r === "rare") return { label: "✦ Rare", cls: "catalog__rare--rare" };
    if (r === "mid")  return { label: "◈ Mid",  cls: "catalog__rare--uncommon" };
    return null;
}

function StarCost({ cost }) {
    return <span className="catalog__star-cost">⭐ {cost}</span>;
}

const MEMBERS = ["All", "RM", "Jin", "Suga", "J-Hope", "Jimin", "V", "Jungkook"];

const FILTER_TO_STAGE = {
    "RM":       ["RM"],
    "Jin":      ["Jin", "JN"],
    "Suga":     ["Suga", "SG"],
    "J-Hope":   ["J-Hope", "JH"],
    "Jimin":    ["Jimin", "JM"],
    "V":        ["V", "THV", "Thv"],
    "Jungkook": ["Jungkook", "JK"],
};

export default function CatalogPage({ onBack, isGuest = false, onSignIn, onHome, onCatalog, onUpdates, onStyle, onLore }) {
    const { user, profile, spendStars } = useAuth();

    const [photos,       setPhotos]       = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState(null);
    const [activeMember, setActiveMember] = useState("All");
    const [selected,     setSelected]     = useState(null);
    const [collection,   setCollection]   = useState(new Set());
    const [buying,       setBuying]       = useState(false);
    const [wishlisted,   setWishlisted]   = useState(new Set());

    // Stars always come from profile in AuthContext — single source of truth.
    // When spendStars() runs it calls fetchProfile() → profile.stars updates
    // → this component re-renders with the new balance automatically.
    const stars = profile?.stars ?? 0;

    useEffect(() => {
        async function load() {
            try {
                const data = await getButterPhotos();
                setPhotos(data);

                if (user) {
                    // Owned cards — status = "owned" only
                    const { data: owned } = await supabase
                        .from("collection")
                        .select("card_id")
                        .eq("user_id", user.id)
                        .eq("status", "owned");
                    if (owned) setCollection(new Set(owned.map(r => r.card_id)));

                    // Wishlisted cards — status = "wishlist" only
                    const { data: wished } = await supabase
                        .from("collection")
                        .select("card_id")
                        .eq("user_id", user.id)
                        .eq("status", "wishlist");
                    if (wished) setWishlisted(new Set(wished.map(r => r.card_id)));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user]);

    // Re-sync OWNED set when stars change (purchase happened)
    useEffect(() => {
        if (!user) return;
        supabase.from("collection").select("card_id")
            .eq("user_id", user.id)
            .eq("status", "owned")   // ← only owned, not wishlist
            .then(({ data }) => {
                if (data) setCollection(new Set(data.map(r => r.card_id)));
            });
    }, [profile?.stars]);

    const filtered = activeMember === "All"
        ? photos
        : photos.filter(p => {
            const stage = p.stageName ?? p.members?.stage_name ?? "";
            const validStages = FILTER_TO_STAGE[activeMember] ?? [activeMember];
            return validStages.includes(stage);
        });

    async function handleAddCard(photo) {
        if (isGuest) { onSignIn?.(); return; }
        if (!user || buying) return;
        const cost = getStarCost(photo);

        if (stars < cost) {
            setSelected({ ...photo, notEnoughStars: true });
            return;
        }

        setBuying(true);
        const result = await spendStars(photo.id, cost);
        setBuying(false);

        if (result.success) {
            setCollection(prev => new Set([...prev, photo.id]));
            setWishlisted(prev => { const n = new Set(prev); n.delete(photo.id); return n; });
        } else {
            console.error("Purchase failed:", result.error);
        }
    }

    async function handleWishlist(photo, e) {
        e?.stopPropagation();
        if (isGuest) { onSignIn?.(); return; }
        if (!user) return;
        const isWished = wishlisted.has(photo.id);
        // Toggle wishlist in DB
        if (isWished) {
            await supabase.from("collection")
                .delete()
                .eq("user_id", user.id)
                .eq("card_id", photo.id)
                .eq("status", "wishlist");
            setWishlisted(prev => { const n = new Set(prev); n.delete(photo.id); return n; });
        } else {
            await supabase.from("collection")
                .upsert({ user_id: user.id, card_id: photo.id, status: "wishlist" },
                    { onConflict: "user_id,card_id" });
            setWishlisted(prev => new Set([...prev, photo.id]));
        }
    }

    return (
        <>
            <div className="catalog-page">
                <div className="orb orb--1" />
                <div className="orb orb--2" />

                <nav className="catalog__nav">
                    <button className="catalog__back" onClick={onBack}>← Back</button>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="logo-mark logo-mark--sm">S</div>
                        <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                    </div>
                    <div className="catalog__nav-stars">
                        <span>⭐</span>
                        <span className="catalog__nav-stars-count">{stars.toLocaleString()}</span>
                    </div>
                </nav>

                {/* Guest banner */}
                {isGuest && (
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 16, padding: "10px 24px",
                        background: "rgba(240,153,123,0.08)",
                        borderBottom: "0.5px solid rgba(240,153,123,0.18)",
                        fontSize: 13, color: "var(--text-muted)",
                        flexWrap: "wrap", textAlign: "center",
                    }}>
                        <span>You're browsing as a guest.</span>
                        <button onClick={onSignIn} style={{
                            background: "none", border: "none", color: "var(--coral)",
                            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500,
                            cursor: "pointer", textDecoration: "underline",
                        }}>
                            Sign up to collect cards →
                        </button>
                    </div>
                )}

                <main className="catalog__main">

                    <div className="catalog__header">
                        <div>
                            <div className="eyebrow" style={{ marginBottom: 10 }}>BTS · Butter Era</div>
                            <h1 className="catalog__title">Catalog</h1>
                            <p className="catalog__sub">
                                Spend ⭐ stars to collect photocards · common ⭐5 · mid ⭐10 · rare ⭐15
                            </p>
                        </div>
                        {!loading && (
                            <div className="catalog__count">
                                <div className="stat-card__value" style={{ fontSize: 32 }}>{filtered.length}</div>
                                <div className="stat-card__label">cards</div>
                            </div>
                        )}
                    </div>

                    <div className="home__filters" style={{ marginBottom: 28 }}>
                        {MEMBERS.map(m => (
                            <button key={m}
                                    className={`filter-btn${activeMember === m ? " filter-btn--active" : ""}`}
                                    onClick={() => setActiveMember(m)}>{m}</button>
                        ))}
                    </div>

                    {loading && (
                        <div className="catalog__skeleton-grid">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="catalog__skeleton"
                                     style={{ animationDelay: `${i * 0.05}s` }} />
                            ))}
                        </div>
                    )}

                    {error && !loading && (
                        <div className="empty-state">
                            Couldn't load cards.<br />
                            <span style={{ fontSize: 13, color: "var(--coral)" }}>{error}</span>
                        </div>
                    )}

                    {!loading && !error && (
                        filtered.length > 0 ? (
                            <div className="catalog__grid">
                                {filtered.map(photo => (
                                    <PhotoCard
                                        key={photo.id}
                                        photo={photo}
                                        owned={collection.has(photo.id)}
                                        wishlisted={wishlisted.has(photo.id)}
                                        onAdd={() => handleAddCard(photo)}
                                        onWishlist={e => handleWishlist(photo, e)}
                                        onDetail={() => setSelected(photo)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                No cards for {activeMember} yet.<br />
                                <span style={{ fontSize: 15 }}>More being added soon.</span>
                            </div>
                        )
                    )}

                </main>

                {selected && (
                    <CardDetailModal
                        photo={selected}
                        owned={collection.has(selected.id)}
                        stars={stars}
                        onAdd={async () => { await handleAddCard(selected); setSelected(null); }}
                        onClose={() => setSelected(null)}
                    />
                )}
            </div>
            <MobileBottomNav
                activePage="catalog"
                onHome={onHome}
                onCatalog={onCatalog}
                onUpdates={onUpdates}
                onStyle={onStyle}
                onLore={onLore}
            />
        </>
    );
}


// ─── Shared mobile bottom nav ─────────────────────────────────────────────────
function MobileBottomNav({ activePage, onHome, onCatalog, onUpdates, onStyle, onLore }) {
    const tabs = [
        { id: "home",    icon: "◫",  label: "Binder",  action: onHome    },
        { id: "catalog", icon: "✦",  label: "Catalog",  action: onCatalog },
        { id: "updates", icon: "◈",  label: "Updates",  action: onUpdates },
        { id: "style",   icon: "✧",  label: "Style",    action: onStyle   },
        { id: "lore",    icon: "◉",  label: "Lore",     action: onLore    },
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

// ─── Photo card tile ──────────────────────────────────────────────────────────
function PhotoCard({ photo, owned, wishlisted, onAdd, onWishlist, onDetail }) {
    const [imgError, setImgError] = useState(false);
    const rarity = getRarityLabel(photo);
    const cost   = getStarCost(photo);



    return (
        <div className={`catalog__card${owned ? " catalog__card--owned" : ""}`}>
            <div className="catalog__card-img-wrap" onClick={onDetail}>
                {!imgError && photo.publicUrl ? (
                    <img
                        src={photo.publicUrl}
                        alt={`${photo.memberName} ${photo.version}`}
                        className="catalog__card-img"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="catalog__card-placeholder">
                        {/* Shows member name as fallback */}
                        <span style={{
                            fontFamily: "var(--font-serif)", fontSize: 18,
                            color: "var(--purple-pale)", fontStyle: "italic",
                            textAlign: "center", padding: "0 8px",
                        }}>
                            {photo.memberName}
                        </span>
                    </div>
                )}

                {rarity && (
                    <div className={`catalog__rare-badge ${rarity.cls}`}>{rarity.label}</div>
                )}

                {/* Wishlist heart — top right */}
                {!owned && (
                    <button className="catalog__wish-btn"
                            onClick={onWishlist}
                            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            style={{ color: wishlisted ? "var(--coral)" : "rgba(255,255,255,0.5)" }}>
                        {wishlisted ? "♥" : "♡"}
                    </button>
                )}

                {owned && (
                    <div className="catalog__owned-overlay">
                        <span className="catalog__owned-check">✓ Owned</span>
                    </div>
                )}
            </div>

            <div className="catalog__card-info">
                <div className="catalog__card-member">{photo.memberName}</div>
                <div className="catalog__card-ver">{photo.version}</div>
                <div className="catalog__card-footer">
                    <StarCost cost={cost} />
                    {owned ? (
                        <span className="catalog__in-binder">In binder</span>
                    ) : (
                        <button
                            className="catalog__add-btn"
                            onClick={e => { e.stopPropagation(); onAdd(); }}
                            title={`Add to collection — ⭐${cost}`}
                        >+</button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Card detail modal ────────────────────────────────────────────────────────
function CardDetailModal({ photo, owned, stars, onAdd, onClose }) {
    const [imgError, setImgError] = useState(false);
    const cost      = getStarCost(photo);
    const rarity    = getCardRarity(photo);
    const canAfford = stars >= cost;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="catalog__detail-modal" onClick={e => e.stopPropagation()}>

                <div className="catalog__detail-img-wrap">
                    {!imgError && photo.publicUrl ? (
                        <img src={photo.publicUrl}
                             alt={`${photo.memberName} ${photo.version}`}
                             className="catalog__detail-img"
                             onError={() => setImgError(true)} />
                    ) : (
                        <div className="catalog__detail-placeholder">
                            <span style={{ fontFamily: "var(--font-serif)", fontSize: 28,
                                color: "var(--purple-pale)", fontStyle: "italic" }}>
                                {photo.memberName}
                            </span>
                        </div>
                    )}
                </div>

                <div className="catalog__detail-info">
                    <h3 className="catalog__detail-name">{photo.memberName}</h3>
                    <p className="catalog__detail-meta">
                        {photo.version} · {photo.era || photo.album}
                    </p>

                    <div className="catalog__detail-cost-row">
                        <span className="catalog__detail-rarity">{rarity}</span>
                        <span className="catalog__detail-cost">⭐ {cost} stars</span>
                    </div>

                    <div className="catalog__detail-balance">
                        Your balance: <strong>⭐ {stars.toLocaleString()}</strong>
                        {!canAfford && !owned && (
                            <span className="catalog__detail-insufficient"> — not enough stars</span>
                        )}
                    </div>

                    {!canAfford && !owned && (
                        <div className="catalog__earn-hint">
                            <p>Earn more ⭐ by:</p>
                            <ul>
                                <li>Daily login → ⭐1</li>
                                <li>Complete your profile → ⭐5</li>
                                <li>Complete an era → ⭐50</li>
                                <li>Make a trade → ⭐15</li>
                            </ul>
                        </div>
                    )}

                    {owned ? (
                        <div className="catalog__detail-owned-msg">✓ Already in your binder</div>
                    ) : (
                        <button
                            className={`btn ${canAfford ? "btn-primary" : "btn-ghost"}`}
                            style={{ width: "100%", marginTop: 16, opacity: canAfford ? 1 : 0.5 }}
                            disabled={!canAfford}
                            onClick={onAdd}
                        >
                            {canAfford ? `Add to binder — ⭐${cost}` : `Need ⭐${cost - stars} more stars`}
                        </button>
                    )}

                    <button className="btn btn-ghost btn-sm"
                            style={{ width: "100%", marginTop: 8 }} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}