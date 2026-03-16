import { useState, useEffect } from "react";
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
        cards: 247,
        era: "MOTS: 7",
        active: true,
        // BTS gets a warm golden accent — distinct from the purple base
        accentClass: "grpselect__card--bts",
    },
    {
        id: "stray-kids",
        name: "Stray Kids",
        hangul: "스트레이 키즈",
        members: ["Bang Chan", "Lee Know", "Changbin", "Hyunjin", "Han", "Felix", "Seungmin", "I.N"],
        cards: 189,
        era: "Rock-Star",
        active: false,
        accentClass: "grpselect__card--soon",
    },
    {
        id: "seventeen",
        name: "SEVENTEEN",
        hangul: "세븐틴",
        members: ["S.Coups","Jeonghan","Joshua","Jun","Hoshi","Wonwoo","Woozi","The8","Mingyu","DK","Seungkwan","Vernon","Dino"],
        cards: 312,
        era: "SPILL THE FEELS",
        active: false,
        accentClass: "grpselect__card--soon",
    },
    {
        id: "newjeans",
        name: "NewJeans",
        hangul: "뉴진스",
        members: ["Minji", "Hanni", "Danielle", "Haerin", "Hyein"],
        cards: 156,
        era: "How Sweet",
        active: false,
        accentClass: "grpselect__card--soon",
    },
    {
        id: "aespa",
        name: "aespa",
        hangul: "에스파",
        members: ["Karina", "Giselle", "Winter", "Ningning"],
        cards: 134,
        era: "Whiplash",
        active: false,
        accentClass: "grpselect__card--soon",
    },
    {
        id: "add",
        name: "Suggest a group",
        hangul: "",
        isAdd: true,
        active: false,
        accentClass: "",
    },
];

export default function GrpSelect({ onEnter, onLore, onUpdates, onCatalog, onSignIn, onSignOut, isGuest }) {
    const [hovered, setHovered]   = useState(null);
    const [showSuggest, setShowSuggest] = useState(false);
    const [entering, setEntering] = useState(null);
    const [mounted, setMounted]   = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    function handleSelect(group) {
        if (group.isAdd) { setShowSuggest(true); return; }
        if (!group.active) return;
        setEntering(group);
        // onEnter handles guest redirect to auth
        setTimeout(() => onEnter?.(group), entering ? 0 : 700);
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

                {/* Right side nav actions */}
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

            {/* ── Guest banner ── Fix #5 */}
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

            {/* ── Entering overlay ── */}
            {showSuggest && (
                <SuggestGroupModal
                    onClose={() => setShowSuggest(false)}
                    userId={null}
                />
            )}

            {entering && (
                <div className="grpselect__enter-overlay">
                    <div className="grpselect__enter-text">
                        <span className="grpselect__enter-mark">✦</span>
                        {isGuest ? "Create an account to enter →" : `Entering ${entering.name} Universe`}
                    </div>
                </div>
            )}
        </div>
    );
}

function GroupCard({ group, index, mounted, isHovered, isDimmed, isEntering, isGuest, onHover, onSelect }) {
    const classes = [
        "grpselect__card",
        group.accentClass,
        mounted    ? "grpselect__card--visible"  : "",
        isHovered  ? "grpselect__card--hovered"  : "",
        isDimmed   ? "grpselect__card--dimmed"   : "",
        isEntering ? "grpselect__card--entering" : "",
        group.isAdd              ? "grpselect__card--add"      : "",
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
                    {/* Status badge — Fix #1: coral for coming soon */}
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