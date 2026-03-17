import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGroupMembership } from "../../hooks/useGroupMembership";
import SuggestGroupModal from "./SuggestGrpModal";
import "../../styles/globals.css";
import "../../styles/Components.css";
import "./GrpSelect.css";

const GROUPS = [
    {
        id: "bts",
        name: "BTS",
        hangul: "방탄소년단",
        members: ["RM", "Jin", "Suga", "J-Hope", "Jimin", "V", "Jungkook"],
        cards: 60,
        era: "ARIRANG",
        active: true,
    },
    {
        id: "bp",
        name: "BlackPink",
        hangul: "블랙핑크",
        members: ["Kim Jisoo", "Kim Jennie", "Lalisa", "Park Chaeyong"],
        cards: 30,
        era: "DEADLINE",
        active: true,
    },
    {
        id: "seventeen",
        name: "SEVENTEEN",
        hangul: "세븐틴",
        members: ["S.Coups","Jeonghan","Joshua","Jun","Hoshi","Wonwoo","Woozi","The8","Mingyu","DK","Seungkwan","Vernon","Dino"],
        cards: 312,
        era: "SPILL THE FEELS",
        active: false,
    },
    {
        id: "newjeans",
        name: "NewJeans",
        hangul: "뉴진스",
        members: ["Minji", "Hanni", "Danielle", "Haerin", "Hyein"],
        cards: 156,
        era: "HOW SWEET",
        active: false,
    },
    {
        id: "aespa",
        name: "aespa",
        hangul: "에스파",
        members: ["Karina", "Giselle", "Winter", "Ningning"],
        cards: 134,
        era: "WHIPLASH",
        active: false,
    },
    {
        id: "add",
        name: "Suggest a group",
        hangul: "",
        isAdd: true,
        active: false,
    },
];

// ─── First-time welcome overlay ───────────────────────────────────────────────
function WelcomeOverlay({ group, onContinue }) {
    return (
        <div className="grpselect__enter-overlay grpselect__enter-overlay--welcome">
            <div className="grpselect__enter-text">
                <span className="grpselect__enter-mark">✦</span>
                <div style={{ marginTop: 16, fontSize: 22, fontWeight: 700 }}>
                    Welcome to {group.name} World
                </div>
                <div style={{ marginTop: 8, fontSize: 14, opacity: 0.7, fontStyle: "italic" }}>
                    You've been gifted <strong>20 ⭐ stars</strong> to start your collection
                </div>
                <button
                    className="btn btn-primary"
                    style={{ marginTop: 24 }}
                    onClick={onContinue}
                >
                    Start collecting →
                </button>
            </div>
        </div>
    );
}

// ─── GrpSelect ────────────────────────────────────────────────────────────────
export default function GrpSelect({ onEnter, onLore, onUpdates, onCatalog, onSignIn, onSignOut, isGuest }) {
    const { user } = useAuth();

    const [hovered,      setHovered]     = useState(null);
    const [showSuggest,  setShowSuggest] = useState(false);
    const [entering,     setEntering]    = useState(null);    // group being entered
    const [pendingGroup, setPendingGroup] = useState(null);   // group waiting for membership check
    const [showWelcome,  setShowWelcome] = useState(false);   // first-time welcome screen
    const [mounted,      setMounted]     = useState(false);

    // Check membership for whichever group the user clicked
    const { isNewMember, loading: membershipLoading, joinGroup, checked } =
        useGroupMembership(user?.id, pendingGroup?.id ?? null);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    // ── Once membership check completes, decide what to show ────────────────
    useEffect(() => {
        if (!pendingGroup || !checked || membershipLoading) return;

        if (isNewMember) {
            // First time! Create membership row (gives 20 stars) then show welcome
            joinGroup().then(() => {
                setEntering(null);
                setShowWelcome(true);
            });
        } else {
            // Returning user — just enter
            setShowWelcome(false);
            onEnter?.(pendingGroup);
            setPendingGroup(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checked, membershipLoading, isNewMember, pendingGroup]);

    function handleSelect(group) {
        if (group.isAdd)    { setShowSuggest(true); return; }
        if (!group.active)  return;
        if (isGuest)        { onEnter?.(group); return; } // guest: let App handle redirect

        setEntering(group);
        setPendingGroup(group);   // triggers membership hook + useEffect above
    }

    function handleWelcomeContinue() {
        setShowWelcome(false);
        onEnter?.(pendingGroup);
        setPendingGroup(null);
        setEntering(null);
    }

    return (
        <div className="grpselect">
            <div className="orb orb--1" />
            <div className="orb orb--2" />

            {/* ── Nav ── */}
            <nav className="grpselect__nav">
                <div className="grpselect__logo">
                    <div className="logo-mark logo-mark--sm">S</div>
                    <span className="logo-wordmark logo-wordmark--sm">Stanlore</span>
                </div>
                <div className="grpselect__nav-right">
                    <button className="grpselect__nav-link" onClick={onCatalog}>Catalog</button>
                    <button className="grpselect__nav-link" onClick={onUpdates}>Updates</button>
                    <button className="grpselect__nav-link" onClick={onLore}>Lore</button>
                    {isGuest ? (
                        <button className="btn btn-primary btn-sm" onClick={onSignIn}>
                            Sign in / Sign up
                        </button>
                    ) : (
                        <button className="btn btn-ghost btn-sm" onClick={onSignOut}>
                            Sign out
                        </button>
                    )}
                </div>
            </nav>

            {/* ── Guest banner ── */}
            {isGuest && (
                <div className="grpselect__guest-banner">
                    <span>You're browsing as a guest.</span>
                    <button className="grpselect__guest-cta" onClick={onSignIn}>
                        Sign up free to track your collection →
                    </button>
                </div>
            )}

            {/* ── Header ── */}
            <div className={`grpselect__header${mounted ? " grpselect__header--visible" : ""}`}>
                <div className="eyebrow" style={{ marginBottom: 20 }}>Choose your fandom</div>
                <h1 className="grpselect__title">
                    Who are you <em>stanning today?</em>
                </h1>
                <p className="grpselect__sub">
                    Select a group to enter their photocard universe
                </p>
            </div>

            {/* ── Group grid ── */}
            <div className="grpselect__grid">
                {GROUPS.map((group, i) => (
                    <GroupCard
                        key={group.id}
                        group={group}
                        index={i}
                        mounted={mounted}
                        isHovered={hovered === group.id}
                        isDimmed={hovered !== null && hovered !== group.id}
                        isEntering={entering?.id === group.id}
                        isGuest={isGuest}
                        onHover={setHovered}
                        onSelect={handleSelect}
                    />
                ))}
            </div>

            <p className="grpselect__hint">More groups coming soon · Suggest yours →</p>

            {/* ── Modals / overlays ── */}
            {showSuggest && (
                <SuggestGroupModal
                    onClose={() => setShowSuggest(false)}
                    userId={user?.id ?? null}
                />
            )}

            {/* Entering animation (while membership check runs) */}
            {entering && !showWelcome && (
                <div className="grpselect__enter-overlay">
                    <div className="grpselect__enter-text">
                        <span className="grpselect__enter-mark">✦</span>
                        {isGuest
                            ? "Create an account to enter →"
                            : `Entering ${entering.name} Universe`}
                    </div>
                </div>
            )}

            {/* First-time welcome screen */}
            {showWelcome && pendingGroup && (
                <WelcomeOverlay
                    group={pendingGroup}
                    onContinue={handleWelcomeContinue}
                />
            )}
        </div>
    );
}

// ─── GroupCard ────────────────────────────────────────────────────────────────
function GroupCard({ group, index, mounted, isHovered, isDimmed, isEntering, isGuest, onHover, onSelect }) {
    const classes = [
        "grpselect__card",
        // live groups get golden accent; "soon" groups get the coral accent
        group.active && !group.isAdd  ? "grpselect__card--live"     : "",
        !group.active && !group.isAdd ? "grpselect__card--soon"     : "",
        mounted    ? "grpselect__card--visible"  : "",
        isHovered  ? "grpselect__card--hovered"  : "",
        isDimmed   ? "grpselect__card--dimmed"   : "",
        isEntering ? "grpselect__card--entering" : "",
        group.isAdd                   ? "grpselect__card--add"      : "",
        !group.active && !group.isAdd ? "grpselect__card--inactive" : "",
    ].filter(Boolean).join(" ");

    return (
        <div
            className={classes}
            style={{ animationDelay: `${index * 0.07}s` }}
            onMouseEnter={() => onHover(group.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(group)}
        >
            {group.isAdd ? (
                <div className="grpselect__add-inner">
                    <div className="grpselect__add-icon">+</div>
                    <p className="grpselect__add-label">Suggest a group</p>
                    <p className="grpselect__add-sub">Help us expand</p>
                </div>
            ) : (
                <>
                    <div className={`grpselect__badge${group.active ? " grpselect__badge--live" : " grpselect__badge--soon"}`}>
                        {group.active ? "✦ Live" : "Coming soon"}
                    </div>

                    <div className="grpselect__card-body">
                        {group.hangul && <p className="grpselect__hangul">{group.hangul}</p>}
                        <h2 className="grpselect__group-name">{group.name}</h2>
                        <p className="grpselect__era">{group.era}</p>
                    </div>

                    <div className="grpselect__stats">
                        <div className="grpselect__stat">
                            <span className="grpselect__stat-val">{group.cards}</span>
                            <span className="grpselect__stat-lbl">cards</span>
                        </div>
                        <div className="grpselect__stat-divider" />
                        <div className="grpselect__stat">
                            <span className="grpselect__stat-val">{group.members.length}</span>
                            <span className="grpselect__stat-lbl">members</span>
                        </div>
                    </div>

                    <div className="grpselect__dots">
                        {group.members.slice(0, 7).map((m, i) => (
                            <div key={i} className="grpselect__dot" title={m} />
                        ))}
                        {group.members.length > 7 && (
                            <span className="grpselect__dot-more">+{group.members.length - 7}</span>
                        )}
                    </div>

                    {group.active && (
                        <div className="grpselect__cta">
                            {isGuest ? "Sign up to enter →" : "Enter universe →"}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}