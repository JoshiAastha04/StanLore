import { usePublicCollection } from "../../hooks/useCollection";
import "../../styles/profile.css"

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 60)  return `${mins}m ago`;
    if (hours < 24)  return `${hours}h ago`;
    return `${days}d ago`;
}

function getInitials(name = "") {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Profile page ─────────────────────────────────────────────────────────────
export default function ProfilePage({ username, onHome }) {
    const { data, loading, error } = usePublicCollection(username);

    // ── Loading ──────────────────────────────────────────────────
    if (loading) {
        return (
                <div className="profile-not-found">
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#CECBF6" }}>
                        Loading...
                    </div>
                </div>
        );
    }

    // ── Not found ────────────────────────────────────────────────
    if (error || !data) {
        return (
                <div className="profile-not-found">
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#CECBF6" }}>
                        Profile not found
                    </div>
                    <div style={{ fontSize: 14 }}>This collection might be private or doesn't exist.</div>
                    <button
                        onClick={onHome}
                        style={{
                            marginTop: 16, background: "#534AB7", color: "#EEEDFE",
                            border: "none", borderRadius: 20, padding: "8px 20px",
                            fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}
                    >← Back to Stanlore</button>
                </div>
        );
    }

    const { profile, collection } = data;

    // ── Stats ────────────────────────────────────────────────────
    const owned     = collection.filter(c => c.status === "owned").length;
    const wishlist  = collection.filter(c => c.status === "wishlist").length;
    const dupes     = collection.filter(c => c.status === "duplicate").length;
    const total     = collection.length;
    const pct       = total > 0 ? Math.round((owned / total) * 100) : 0;

    // ── Recent activity ──────────────────────────────────────────
    const recent = [...collection]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8);

    // ── Group by member + era for binder ────────────────────────
    const byEra = collection.reduce((acc, item) => {
        const member = item.photocards.members.name;
        const era    = item.photocards.versions.albums.eras?.name ?? "Unknown";
        const key    = `${member}__${era}`;
        if (!acc[key]) acc[key] = { member, era, cards: [] };
        acc[key].cards.push(item);
        return acc;
    }, {});

    // ── Share ────────────────────────────────────────────────────
    function handleShare() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            const btn = document.getElementById("share-btn");
            if (btn) { btn.textContent = "Link copied ✓"; btn.classList.add("copied"); }
            setTimeout(() => {
                if (btn) { btn.textContent = "Share collection ↗"; btn.classList.remove("copied"); }
            }, 2000);
        });
    }

    const initials = getInitials(profile.display_name || profile.username);

    return (
            <div className="profile-page">

                {/* Nav */}
                <nav className="profile-nav">
                    <div className="profile-nav-logo" onClick={onHome} style={{ cursor: "pointer" }}>
                        <div className="profile-nav-mark">S</div>
                        <span className="profile-nav-name">Stanlore</span>
                    </div>
                </nav>

                {/* Hero */}
                <div className="profile-hero">
                    <div className="profile-avatar">
                        {profile.avatar_url
                            ? <img src={profile.avatar_url} alt={profile.username} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                            : initials
                        }
                    </div>
                    <div className="profile-info">
                        <div className="profile-display-name">
                            {profile.display_name || profile.username}
                        </div>
                        <div className="profile-username">@{profile.username}</div>
                        {profile.bio && <div className="profile-bio">{profile.bio}</div>}
                        <button id="share-btn" className="profile-share-btn" onClick={handleShare}>
                            Share collection ↗
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="profile-stats">
                    <div className="profile-stat">
                        <div className="profile-stat-val">{owned}</div>
                        <div className="profile-stat-label">Owned</div>
                    </div>
                    <div className="profile-stat">
                        <div className="profile-stat-val" style={{ color: "#F0997B" }}>{wishlist}</div>
                        <div className="profile-stat-label">Wishlist</div>
                    </div>
                    <div className="profile-stat">
                        <div className="profile-stat-val" style={{ color: "#AFA9EC" }}>{dupes}</div>
                        <div className="profile-stat-label">Dupes</div>
                    </div>
                    <div className="profile-stat">
                        <div className="profile-stat-val" style={{ color: "#9FE1CB" }}>{pct}%</div>
                        <div className="profile-stat-label">Complete</div>
                    </div>
                </div>

                <div className="profile-content">

                    {/* Recent activity */}
                    {recent.length > 0 && (
                        <>
                            <div className="profile-section-title">Recent activity</div>
                            <div className="activity-list">
                                {recent.map((item, i) => (
                                    <div key={i} className="activity-item">
                                        <div className={`activity-dot activity-dot--${item.status}`} />
                                        <div className="activity-text">
                                            <strong>{item.photocards.members.name}</strong>
                                            {" · "}{item.photocards.versions.albums.eras?.name} Era
                                            {" · "}{item.photocards.versions.name}
                                            {" "}
                                            <span style={{ color: item.status === "owned" ? "#7F77DD" : item.status === "wishlist" ? "#F0997B" : "#AFA9EC" }}>
                        marked as {item.status}
                      </span>
                                        </div>
                                        <div className="activity-time">{timeAgo(item.created_at)}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Binder */}
                    <div className="profile-section-title">Collection binder</div>
                    {Object.keys(byEra).length === 0 ? (
                        <div className="profile-empty">
                            No cards in this collection yet.
                        </div>
                    ) : (
                        <div className="binder-grid">
                            {Object.entries(byEra).map(([key, group]) => {
                                const ownedInGroup = group.cards.filter(c => c.status === "owned").length;
                                const pctGroup = Math.round((ownedInGroup / group.cards.length) * 100);
                                const initials = group.member.split(" ").pop().slice(0, 2).toUpperCase();
                                return (
                                    <div key={key} className="binder-era">
                                        <div className="binder-era-header">
                                            <div className="binder-era-avatar">{initials}</div>
                                            <div className="binder-era-member">{group.member}</div>
                                            <div className="binder-era-name">{group.era}</div>
                                            <div className="binder-era-count">{ownedInGroup}/{group.cards.length}</div>
                                        </div>
                                        <div className="binder-era-cards">
                                            {group.cards.map((c, i) => (
                                                <div key={i} className={`binder-era-tile binder-era-tile--${c.status}`}>
                                                    <div className="binder-era-tile-ver">{c.photocards.versions.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="binder-era-prog">
                                            <div className="prog-track">
                                                <div className="prog-fill" style={{ width: `${pctGroup}%` }} />
                                            </div>
                                            <span style={{ fontSize: 11, color: "#7F77DD" }}>{pctGroup}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>
    );
}
