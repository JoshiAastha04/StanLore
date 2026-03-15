import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getButterPhotos } from "../../lib/Photos";
import { supabase } from "../../lib/supabase";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "./CatalogPage.css";

// ─── Star cost per card rarity ────────────────────────────────────────────────
const STAR_COST = { common: 5, uncommon: 15, rare: 30 };

function getCardRarity(photo) {
    if (photo.is_rare)     return "rare";
    if (photo.is_uncommon) return "uncommon";
    return "common";
}
function getStarCost(photo) { return STAR_COST[getCardRarity(photo)]; }

function getRarityLabel(photo) {
    const r = getCardRarity(photo);
    if (r === "rare")     return { label: "✦ Rare",     cls: "catalog__rare--rare"     };
    if (r === "uncommon") return { label: "◈ Uncommon", cls: "catalog__rare--uncommon" };
    return null;
}

function StarCost({ cost }) {
    return <span className="catalog__star-cost">⭐ {cost}</span>;
}

// Filter labels must exactly match what's in the DB stage_name column.
// Our migration seeded: RM, Jin, Suga, J-Hope, Jimin, V, JK
// BUT the image paths use JK for Jungkook, so stage_name is "JK" not "Jungkook".
// We map display label → DB stage_name here so we can change either side easily.
const MEMBERS = ["All", "RM", "Jin", "Suga", "J-Hope", "Jimin", "V", "Jungkook"];

// Map from filter button label → what's actually stored in DB stage_name
// Check your Supabase members table and update this if your stage_names differ.
const FILTER_TO_STAGE = {
    "RM":       ["RM"],
    "Jin":      ["Jin", "JN"],
    "Suga":     ["Suga", "SG"],
    "J-Hope":   ["J-Hope", "JH"],
    "Jimin":    ["Jimin", "JM"],
    "V":        ["V", "THV", "Thv"],
    "Jungkook": ["Jungkook", "JK"],
};

export default function CatalogPage({ onBack }) {
    const { user, profile } = useAuth();

    const [photos,       setPhotos]       = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState(null);
    const [activeMember, setActiveMember] = useState("All");
    const [selected,     setSelected]     = useState(null);
    const [collection,   setCollection]   = useState(new Set());
    const [stars,        setStars]        = useState(profile?.stars ?? 0);

    useEffect(() => {
        setStars(profile?.stars ?? 0);

        async function load() {
            try {
                const data = await getButterPhotos();
                setPhotos(data);

                if (user) {
                    const { data: owned } = await supabase
                        .from("collection")
                        .select("card_id")
                        .eq("user_id", user.id);
                    if (owned) setCollection(new Set(owned.map(r => r.card_id)));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user, profile?.stars]);

    // Filter uses FILTER_TO_STAGE to match any possible stage_name variant in DB
    const filtered = activeMember === "All"
        ? photos
        : photos.filter(p => {
            const stage = p.stageName ?? p.members?.stage_name ?? "";
            const validStages = FILTER_TO_STAGE[activeMember] ?? [activeMember];
            return validStages.includes(stage);
        });

    async function handleAddCard(photo) {
        if (!user) return;
        const cost = getStarCost(photo);

        if (stars < cost) {
            setSelected({ ...photo, notEnoughStars: true });
            return;
        }

        const newStars = stars - cost;

        const { error: collErr } = await supabase
            .from("collection")
            .upsert({ user_id: user.id, card_id: photo.id, status: "owned" },
                { onConflict: "user_id,card_id" });
        if (collErr) { console.error(collErr); return; }

        const { error: starErr } = await supabase
            .from("profiles")
            .update({ stars: newStars })
            .eq("id", user.id);
        if (starErr) { console.error(starErr); return; }

        setCollection(prev => new Set([...prev, photo.id]));
        setStars(newStars);
    }

    return (
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

            <main className="catalog__main">

                <div className="catalog__header">
                    <div>
                        <div className="eyebrow" style={{ marginBottom: 10 }}>BTS · Butter Era</div>
                        <h1 className="catalog__title">Catalog</h1>
                        <p className="catalog__sub">
                            Spend ⭐ stars to collect photocards · common ⭐5 · uncommon ⭐15 · rare ⭐30
                        </p>
                    </div>
                    {!loading && (
                        <div className="catalog__count">
                            <div className="stat-card__value" style={{ fontSize: 32 }}>
                                {filtered.length}
                            </div>
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
                        <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>✦</span>
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
                                    onAdd={() => handleAddCard(photo)}
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
    );
}

// ─── Photo card tile ──────────────────────────────────────────────────────────
function PhotoCard({ photo, owned, onAdd, onDetail }) {
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
                        <span style={{ fontFamily: "var(--font-serif)", fontSize: 22,
                            color: "var(--purple-pale)", fontStyle: "italic" }}>
                            {photo.memberName || "✦"}
                        </span>
                    </div>
                )}

                {rarity && (
                    <div className={`catalog__rare-badge ${rarity.cls}`}>{rarity.label}</div>
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
                            <span style={{ fontFamily: "var(--font-serif)", fontSize: 36,
                                color: "var(--purple-pale)", fontStyle: "italic" }}>
                                {photo.memberName || "✦"}
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
