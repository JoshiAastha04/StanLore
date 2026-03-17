import { useState } from "react";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "./StylePage.css";

// ─── Mock data ────────────────────────────────────────────────────────────────
const LOOKS = [
    {
        id: 1,
        member: "V",
        occasion: "Airport",
        date: "Mar 14, 2026",
        location: "Incheon → Paris",
        headline: "V - Celine oversized blazer, Acne Studios turtleneck, custom trousers",
        items: [
            {
                name: "Celine Oversized Blazer",
                brand: "Celine",
                category: "Outerwear",
                price: "₩890,000",
                identified: true,
                dupes: [
                    { name: "H&M Oversized Blazer", price: "₩49,000", link: "#" },
                    { name: "ZARA Double-Breast Blazer", price: "₩89,000", link: "#" },
                ],
            },
            {
                name: "Acne Studios Ribbed Turtleneck",
                brand: "Acne Studios",
                category: "Knitwear",
                price: "₩280,000",
                identified: true,
                dupes: [
                    { name: "Uniqlo Extra-Fine Merino Turtleneck", price: "₩39,900", link: "#" },
                    { name: "COS Slim Turtleneck", price: "₩79,000", link: "#" },
                ],
            },
            {
                name: "Sunglasses",
                brand: "Unknown",
                category: "Accessories",
                price: "-",
                identified: false,
                dupes: [],
            },
        ],
        tags: ["v", "celine", "airport", "paris"],
        saves: 4821,
        hot: true,
    },
    {
        id: 2,
        member: "Jimin",
        occasion: "Dior Campaign",
        date: "Mar 10, 2026",
        location: "Official Campaign",
        headline: "Jimin- Dior SS26 black tuxedo, full look",
        items: [
            {
                name: "Dior SS26 Tuxedo",
                brand: "Dior",
                category: "Suit",
                price: "₩4,200,000",
                identified: true,
                dupes: [
                    { name: "Massimo Dutti Slim Tuxedo", price: "₩289,000", link: "#" },
                    { name: "H&M Premium Tuxedo Jacket", price: "₩129,000", link: "#" },
                ],
            },
        ],
        tags: ["jimin", "dior", "tuxedo", "campaign"],
        saves: 9204,
        hot: true,
    },
    {
        id: 3,
        member: "Jungkook",
        occasion: "Weverse Live",
        date: "Mar 12, 2026",
        location: "Online",
        headline: "Jungkook- vintage band tee, low-rise grey trousers, New Balance 9060",
        items: [
            {
                name: "Vintage Iron Maiden Tee",
                brand: "Vintage",
                category: "Top",
                price: "~₩80,000",
                identified: true,
                dupes: [
                    { name: "Amazon Vintage Band Tee (similar)", price: "₩18,000", link: "#" },
                    { name: "H&M Band Tee Collection", price: "₩25,000", link: "#" },
                ],
            },
            {
                name: "New Balance 9060",
                brand: "New Balance",
                category: "Footwear",
                price: "₩149,000",
                identified: true,
                dupes: [
                    { name: "New Balance 574 (similar silhouette)", price: "₩99,000", link: "#" },
                ],
            },
        ],
        tags: ["jungkook", "casual", "new-balance", "vintage"],
        saves: 6102,
        hot: false,
    },
    {
        id: 4,
        member: "RM",
        occasion: "Gallery Visit",
        date: "Mar 8, 2026",
        location: "Seoul, Leeum Museum",
        headline: "RM- Bottega Veneta knit, wide-leg linen trousers, minimalist loafers",
        items: [
            {
                name: "Bottega Veneta Ribbed Knit",
                brand: "Bottega Veneta",
                category: "Knitwear",
                price: "₩620,000",
                identified: true,
                dupes: [
                    { name: "Arket Ribbed Knit Sweater", price: "₩89,000", link: "#" },
                    { name: "Uniqlo Premium Linen Knit", price: "₩49,900", link: "#" },
                ],
            },
        ],
        tags: ["rm", "bottega", "gallery", "minimalist"],
        saves: 3201,
        hot: false,
    },
    {
        id: 5,
        member: "Suga",
        occasion: "Studio",
        date: "Mar 6, 2026",
        location: "Weverse post",
        headline: "Suga- Saint Laurent leather jacket, black on black",
        items: [
            {
                name: "Saint Laurent Classic Leather Jacket",
                brand: "Saint Laurent",
                category: "Outerwear",
                price: "₩2,100,000",
                identified: true,
                dupes: [
                    { name: "ZARA Faux Leather Biker Jacket", price: "₩119,000", link: "#" },
                    { name: "H&M Leather-Look Jacket", price: "₩79,000", link: "#" },
                ],
            },
        ],
        tags: ["suga", "saint-laurent", "leather", "allblack"],
        saves: 5820,
        hot: false,
    },
];

const MEMBERS = ["All", "RM", "Jin", "Suga", "J-Hope", "Jimin", "V", "Jungkook"];
const OCCASIONS = ["All", "Airport", "Concert", "Campaign", "Weverse Live", "Gallery", "Studio"];

const MEMBER_INITIALS = {
    RM: "RM", Jin: "JN", Suga: "SG",
    "J-Hope": "JH", Jimin: "JM", V: "V", Jungkook: "JK",
};

export default function StylePage({ onBack, onSignIn, isGuest, onHome, onCatalog, onUpdates, onStyle, onLore }) {
    const [activeMember,   setActiveMember]   = useState("All");
    const [activeOccasion, setActiveOccasion] = useState("All");
    const [expandedId,     setExpandedId]     = useState(null);
    const [savedLooks,     setSavedLooks]     = useState(new Set([1, 2]));
    const [submitOpen,     setSubmitOpen]     = useState(false);

    const filtered = LOOKS.filter(l => {
        const memberOk   = activeMember   === "All" || l.member === activeMember;
        const occasionOk = activeOccasion === "All" || l.occasion === activeOccasion;
        return memberOk && occasionOk;
    });
    function toggleSave(id) {
        if (isGuest) { onSignIn?.(); return; }
        setSavedLooks(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    return (
        <>
            <div className="style-page">
                <div className="orb orb--1" />
                <div className="orb orb--3" />

                {/* Nav */}
                <nav className="style__nav">
                    <button className="style__back" onClick={onBack}>← Back</button>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="logo-mark logo-mark--sm">S</div>
                        <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                    </div>
                    <div className="style__nav-right">
                        {isGuest ? (
                            <button className="btn btn-primary btn-sm" onClick={onSignIn}>Sign up</button>
                        ) : (
                            <button className="btn btn-ghost btn-sm" onClick={() => setSubmitOpen(true)}>
                                + Submit a look
                            </button>
                        )}
                    </div>
                </nav>

                {isGuest && (
                    <div className="style__guest-banner">
                        <span>Browsing as guest.</span>
                        <button className="style__guest-cta" onClick={onSignIn}>
                            Sign up to save looks & submit outfit IDs →
                        </button>
                    </div>
                )}

                <main className="style__main">

                    <div className="style__page-header">
                        <div>
                            <div className="eyebrow" style={{ marginBottom: 12 }}>Idol Fits</div>
                            <h1 className="style__title">Style Archive</h1>
                            <p className="style__sub">
                                Identify idol outfits · find affordable dupes · submit your ID
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="style__filters">
                        <div className="style__filter-group">
                            <span className="section-label" style={{ marginBottom: 0 }}>Member</span>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {MEMBERS.map(m => (
                                    <button
                                        key={m}
                                        className={`filter-btn${activeMember === m ? " filter-btn--active" : ""}`}
                                        onClick={() => setActiveMember(m)}
                                    >{m}</button>
                                ))}
                            </div>
                        </div>
                        <div className="style__filter-group">
                            <span className="section-label" style={{ marginBottom: 0 }}>Occasion</span>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {OCCASIONS.map(o => (
                                    <button
                                        key={o}
                                        className={`filter-btn${activeOccasion === o ? " filter-btn--active" : ""}`}
                                        onClick={() => setActiveOccasion(o)}
                                    >{o}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Look cards */}
                    <div className="style__grid">
                        {filtered.map(look => (
                            <LookCard
                                key={look.id}
                                look={look}
                                expanded={expandedId === look.id}
                                onExpand={() => setExpandedId(expandedId === look.id ? null : look.id)}
                                saved={savedLooks.has(look.id)}
                                onSave={() => toggleSave(look.id)}
                                isGuest={isGuest}
                            />
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="empty-state">
                            No looks found for this filter.<br />
                            <span style={{ fontSize: 15 }}>Try a different member or occasion.</span>
                        </div>
                    )}

                </main>

                {/* Submit modal */}
                {submitOpen && (
                    <SubmitModal onClose={() => setSubmitOpen(false)} />
                )}
            </div>
            <MobileBottomNav
                activePage="style"
                onHome={onHome}
                onCatalog={onCatalog}
                onUpdates={onUpdates}
                onStyle={onStyle}
                onLore={onLore}
            />
        </>
    );
}

// ─── Look card ────────────────────────────────────────────────────────────────

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

function LookCard({ look, expanded, onExpand, saved, onSave, isGuest }) {
    const initials = MEMBER_INITIALS[look.member] || look.member.slice(0, 2).toUpperCase();

    return (
        <div className={`style__look-card${look.hot ? " style__look-card--hot" : ""}${expanded ? " style__look-card--expanded" : ""}`}>
            {look.hot && <div className="style__look-hotline" />}

            {/* Header */}
            <div className="style__look-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar avatar--sm">{initials}</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{look.member}</div>
                        <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{look.occasion} · {look.date}</div>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {look.hot && <span className="style__hot-badge">🔥 Trending</span>}
                    <button
                        className="style__save-btn"
                        onClick={e => { e.stopPropagation(); onSave(); }}
                        style={{ color: saved ? "var(--purple-light)" : "var(--text-faint)" }}
                    >
                        {saved ? "★" : "☆"}
                    </button>
                </div>
            </div>

            {/* Image placeholder */}
            <div className="style__look-img" onClick={onExpand}>
                <span style={{ fontSize: 28, opacity: 0.3 }}>🖼</span>
                <span style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>Photo</span>
            </div>

            {/* Headline */}
            <p className="style__look-headline" onClick={onExpand}>{look.headline}</p>

            {/* Tags */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {look.tags.map(t => (
                    <span key={t} className="style__tag">#{t}</span>
                ))}
            </div>

            {/* Footer */}
            <div className="style__look-footer">
                <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                    ✦ {look.saves.toLocaleString()} saves
                </span>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={onExpand}
                    style={{ fontSize: 11 }}
                >
                    {expanded ? "Hide items ↑" : `${look.items.length} items identified ↓`}
                </button>
            </div>

            {/* Expanded items + dupes */}
            {expanded && (
                <div className="style__items">
                    <div className="style__items-divider" />
                    {look.items.map((item, i) => (
                        <div key={i} className="style__item">
                            <div className="style__item-top">
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 2 }}>
                                        {item.name}
                                    </div>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <span className="badge badge-owned" style={{ fontSize: 9 }}>{item.category}</span>
                                        <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{item.brand}</span>
                                        <span style={{ fontSize: 11, color: "var(--coral)" }}>{item.price}</span>
                                    </div>
                                </div>
                                {!item.identified && (
                                    <span className="badge badge-missing" style={{ fontSize: 9, flexShrink: 0 }}>
                                        Help ID?
                                    </span>
                                )}
                            </div>

                            {item.dupes.length > 0 && (
                                <div className="style__dupes">
                                    <div className="section-label" style={{ marginBottom: 8, fontSize: 9 }}>
                                        Affordable dupes
                                    </div>
                                    {item.dupes.map((dupe, j) => (
                                        <div key={j} className="style__dupe-row">
                                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{dupe.name}</span>
                                            <span style={{ fontSize: 12, color: "var(--text-success)", fontWeight: 500 }}>{dupe.price}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {!isGuest && (
                        <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 8, fontSize: 11 }}>
                            + Submit an ID for an unidentified item
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Submit look modal ────────────────────────────────────────────────────────
function SubmitModal({ onClose }) {
    const [member, setMember]     = useState("");
    const [occasion, setOccasion] = useState("");
    const [notes, setNotes]       = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        // TODO: insert into `style_submissions` table in Supabase
        setSubmitted(true);
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
                {submitted ? (
                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--text-success)", marginBottom: 8 }}>✦</div>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--text-secondary)", marginBottom: 8 }}>
                            Submitted!
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 16 }}>
                            Our team will review and publish your look submission.
                        </p>
                        <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
                    </div>
                ) : (
                    <>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--text-secondary)", marginBottom: 4 }}>
                            Submit a look
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 20 }}>
                            Spotted an idol fit we haven't covered yet?
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div>
                                <div className="section-label">Member</div>
                                <select
                                    className="input"
                                    value={member}
                                    onChange={e => setMember(e.target.value)}
                                    required
                                >
                                    <option value="">Select member</option>
                                    {MEMBERS.filter(m => m !== "All").map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="section-label">Occasion</div>
                                <input
                                    className="input"
                                    placeholder="e.g. Airport, Weverse Live, Concert"
                                    value={occasion}
                                    onChange={e => setOccasion(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <div className="section-label">Details / source link</div>
                                <textarea
                                    className="input"
                                    style={{ resize: "vertical", minHeight: 80 }}
                                    placeholder="Paste a photo link or describe what you saw..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}