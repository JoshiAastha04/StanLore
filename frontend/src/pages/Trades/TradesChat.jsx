import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { getStorageImageUrl } from "../../lib/Photos";
import "./TradesChat.css";

// ─── helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function cardLabel(pc) {
    if (!pc) return "Unknown card";
    const member = pc.members?.stage_name || pc.members?.name || "Unknown";
    const album  = pc.versions?.albums?.title || "";
    // Normalise "Ver. A" → "Ver A" so it's easy to type/match
    const ver    = (pc.versions?.name || "").replace(/Ver\.\s*/i, "Ver ").trim();
    return [member, album, ver].filter(Boolean).join(" - ");
}

// ─── MiniCard — tiny card image + label ──────────────────────────────────────
function MiniCard({ photocard, bucket, label, highlight }) {
    const imgUrl = photocard
        ? getStorageImageUrl(photocard.image_url, bucket)
        : null;

    return (
        <div className={`tc-mini-card${highlight ? " tc-mini-card--highlight" : ""}`}>
            <div className="tc-mini-card__img-wrap">
                {imgUrl
                    ? <img src={imgUrl} alt={label} className="tc-mini-card__img" />
                    : <div className="tc-mini-card__placeholder">✦</div>
                }
            </div>
            <span className="tc-mini-card__label">{label}</span>
        </div>
    );
}

// ─── CardPicker — for initiator to choose a card to offer ────────────────────
function CardPicker({ ownedCards, bucket, onPick, disabled }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="tc-card-picker">
            <button
                className="tc-card-picker__toggle"
                onClick={() => setOpen(o => !o)}
                disabled={disabled}
            >
                {open ? "▲ Hide my cards" : "▼ Offer one of my cards"}
            </button>

            {open && (
                <div className="tc-card-picker__grid">
                    {ownedCards.length === 0 && (
                        <p className="tc-card-picker__empty">
                            You have no cards in this group to offer.
                        </p>
                    )}
                    {ownedCards.map(row => {
                        const pc    = row.photocards;
                        const label = cardLabel(pc);
                        const imgUrl = pc
                            ? getStorageImageUrl(pc.image_url, bucket)
                            : null;
                        return (
                            <button
                                key={row.card_id}
                                className="tc-card-picker__item"
                                onClick={() => { onPick(row); setOpen(false); }}
                            >
                                <div className="tc-card-picker__thumb">
                                    {imgUrl
                                        ? <img src={imgUrl} alt={label} />
                                        : <span>✦</span>
                                    }
                                </div>
                                <span className="tc-card-picker__name">{label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, isMine, senderName, bucket }) {
    if (msg.msg_type === "system") {
        return (
            <div className="tc-msg tc-msg--system">
                <span>{msg.body}</span>
            </div>
        );
    }

    if (msg.msg_type === "proposal") {
        const pc    = msg.proposed_card;
        const label = cardLabel(pc);
        return (
            <div className={`tc-msg tc-msg--proposal${isMine ? " tc-msg--mine" : ""}`}>
                <div className="tc-msg__proposal-header">
                    <span className="tc-msg__proposal-tag">Card Offer</span>
                </div>
                <MiniCard photocard={pc} bucket={bucket} label={label} highlight />
                {msg.body && msg.body !== label && (
                    <p className="tc-msg__proposal-note">{msg.body}</p>
                )}
                <span className="tc-msg__time">{timeAgo(msg.created_at)}</span>
            </div>
        );
    }

    // regular text
    return (
        <div className={`tc-msg tc-msg--text${isMine ? " tc-msg--mine" : ""}`}>
            {!isMine && <span className="tc-msg__sender">{senderName}</span>}
            <p className="tc-msg__body">{msg.body}</p>
            <span className="tc-msg__time">{timeAgo(msg.created_at)}</span>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TradeChat — the full slide-in drawer
//  Props:
//    listing       — the trade_listings row
//    currentUser   — { id, username, avatar }
//    isOwner       — bool: is currentUser the listing author?
//    groupId       — e.g. "bts" | "bp"
//    bucket        — storage bucket name
//    ownedCards    — array of collection rows (for initiator's card picker)
//    onClose       — fn
// ═══════════════════════════════════════════════════════════════════════════════
export default function TradeChat({
                                      listing,
                                      currentUser,
                                      isOwner,
                                      groupId,
                                      bucket,
                                      ownedCards,
                                      onClose,
                                      onTradeComplete,
                                  }) {
    const [conversation,   setConversation]   = useState(null);
    const [messages,       setMessages]       = useState([]);
    const [text,           setText]           = useState("");
    const [sending,        setSending]        = useState(false);
    const [loading,        setLoading]        = useState(true);
    const [proposedCard,   setProposedCard]   = useState(null); // row from ownedCards
    const [accepting,      setAccepting]      = useState(false);
    const [error,          setError]          = useState("");
    const [conversations,  setConversations]  = useState([]); // owner: all convos for listing
    const [activeConvoId,  setActiveConvoId]  = useState(null);

    const bottomRef = useRef(null);
    const channelRef = useRef(null);

    // ── scroll to bottom on new messages ─────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ── fetch or create conversation ──────────────────────────────────────────
    const loadOrCreateConversation = useCallback(async () => {
        setLoading(true);
        setError("");

        if (isOwner) {
            // Owner sees all conversations for this listing
            const { data, error: err } = await supabase
                .from("trade_conversations")
                .select("*")
                .eq("listing_id", listing.id)
                .order("updated_at", { ascending: false });

            if (err) { setError("Couldn't load conversations: " + err.message); setLoading(false); return; }

            const convos = data ?? [];

            // Separately fetch profiles for each initiator
            // (can't join through auth.users in PostgREST public schema)
            const initiatorIds = [...new Set(convos.map(c => c.initiator_id).filter(Boolean))];
            let profileMap = {};
            if (initiatorIds.length > 0) {
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("id, username, display_name, avatar")
                    .in("id", initiatorIds);
                profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));
            }

            const convosWithProfiles = convos.map(c => ({
                ...c,
                initiator: { profiles: profileMap[c.initiator_id] ?? null },
            }));

            setConversations(convosWithProfiles);
            if (convosWithProfiles.length > 0 && !activeConvoId) {
                setActiveConvoId(convosWithProfiles[0].id);
            }
            setLoading(false);
        } else {
            // Initiator: get or create their convo
            const { data: existing, error: fetchErr } = await supabase
                .from("trade_conversations")
                .select("*")
                .eq("listing_id",   listing.id)
                .eq("initiator_id", currentUser.id)
                .maybeSingle();

            if (fetchErr) { setError("Couldn't load chat."); setLoading(false); return; }

            if (existing) {
                setConversation(existing);
            } else {
                // Create
                const { data: created, error: createErr } = await supabase
                    .from("trade_conversations")
                    .insert({ listing_id: listing.id, initiator_id: currentUser.id })
                    .select()
                    .single();

                if (createErr) { setError("Couldn't start conversation."); setLoading(false); return; }
                setConversation(created);
            }
            setLoading(false);
        }
    }, [listing.id, currentUser.id, isOwner, activeConvoId]);

    useEffect(() => {
        loadOrCreateConversation();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── resolve the active conversation object ────────────────────────────────
    const activeConvo = isOwner
        ? conversations.find(c => c.id === activeConvoId) ?? null
        : conversation;

    // ── load messages whenever active convo changes ───────────────────────────
    useEffect(() => {
        if (!activeConvo) return;

        async function loadMessages() {
            const { data, error: err } = await supabase
                .from("trade_messages")
                .select(`
                    *,
                    proposed_card:proposed_card_id (
                        id, image_url,
                        members  ( name, stage_name ),
                        versions ( name,
                            albums ( title )
                        )
                    )
                `)
                .eq("conversation_id", activeConvo.id)
                .order("created_at", { ascending: true });

            if (err) { setError("Couldn't load messages."); return; }
            setMessages(data ?? []);
        }

        loadMessages();

        // ── Realtime subscription ──────────────────────────────────────────
        channelRef.current?.unsubscribe();

        const channel = supabase
            .channel(`trade-chat-${activeConvo.id}`)
            .on("postgres_changes", {
                event:  "INSERT",
                schema: "public",
                table:  "trade_messages",
                filter: `conversation_id=eq.${activeConvo.id}`,
            }, payload => {
                // Fetch full row with proposed_card join
                supabase
                    .from("trade_messages")
                    .select(`
                        *,
                        proposed_card:proposed_card_id (
                            id, image_url,
                            members  ( name, stage_name ),
                            versions ( name, albums ( title ) )
                        )
                    `)
                    .eq("id", payload.new.id)
                    .single()
                    .then(({ data }) => {
                        if (data) setMessages(prev => [...prev, data]);
                    });
            })
            .subscribe();

        channelRef.current = channel;

        return () => { channel.unsubscribe(); };
    }, [activeConvo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── refresh convo status ──────────────────────────────────────────────────
    const refreshConvoStatus = useCallback(async () => {
        if (!activeConvo) return;
        const { data } = await supabase
            .from("trade_conversations")
            .select("*")
            .eq("id", activeConvo.id)
            .single();
        if (data) {
            if (isOwner) {
                setConversations(prev => prev.map(c => c.id === data.id ? data : c));
            } else {
                setConversation(data);
            }
        }
    }, [activeConvo?.id, isOwner]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── send plain text ───────────────────────────────────────────────────────
    async function handleSend(e) {
        e?.preventDefault();
        if (!text.trim() || !activeConvo) return;
        setSending(true);

        const { error: err } = await supabase
            .from("trade_messages")
            .insert({
                conversation_id: activeConvo.id,
                sender_id:       currentUser.id,
                body:            text.trim(),
                msg_type:        "text",
            });

        setSending(false);
        if (err) { setError("Couldn't send message."); return; }
        setText("");
    }

    // ── send card proposal ────────────────────────────────────────────────────
    async function handlePropose(cardRow) {
        if (!activeConvo) return;
        const pc    = cardRow.photocards;
        const label = cardLabel(pc);

        setSending(true);

        // 1. Update conversation with offered_card_id
        const { error: convErr } = await supabase
            .from("trade_conversations")
            .update({
                offered_card_id: cardRow.card_id,
                status:          "proposed",
                updated_at:      new Date().toISOString(),
            })
            .eq("id", activeConvo.id);

        if (convErr) { setSending(false); setError("Couldn't send proposal."); return; }

        // 2. Insert proposal message
        const { error: msgErr } = await supabase
            .from("trade_messages")
            .insert({
                conversation_id:  activeConvo.id,
                sender_id:        currentUser.id,
                body:             label,
                msg_type:         "proposal",
                proposed_card_id: cardRow.card_id,
            });

        setSending(false);
        if (msgErr) { setError("Couldn't send proposal."); return; }

        setProposedCard(cardRow);
        await refreshConvoStatus();
    }

    // ── owner: accept trade ───────────────────────────────────────────────────
    async function handleAccept() {
        if (!activeConvo) return;
        setAccepting(true);
        setError("");

        const { error: err } = await supabase.rpc("execute_trade", {
            p_conversation_id: activeConvo.id,
        });

        setAccepting(false);

        if (err) {
            setError("Trade failed: " + err.message);
            return;
        }

        await refreshConvoStatus();
        onTradeComplete?.();
    }

    // ── owner: decline trade ─────────────────────────────────────────────────
    async function handleDecline() {
        if (!activeConvo) return;

        await supabase
            .from("trade_conversations")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("id", activeConvo.id);

        await supabase.from("trade_messages").insert({
            conversation_id: activeConvo.id,
            sender_id:       currentUser.id,
            body:            "✗ Offer declined.",
            msg_type:        "system",
        });

        await refreshConvoStatus();
    }

    // ── helpers ───────────────────────────────────────────────────────────────
    const convoStatus  = activeConvo?.status ?? "open";
    const isCompleted  = convoStatus === "completed";
    const isCancelled  = convoStatus === "cancelled";
    const isClosed     = isCompleted || isCancelled;
    const hasProposal  = convoStatus === "proposed";

    // Initiator name from owner side
    function initiatorName(convo) {
        const p = convo?.initiator?.profiles;
        if (!p) return "someone";
        return p.username || p.display_name || "stan";
    }

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Backdrop */}
            <div className="tc-backdrop" onClick={onClose} />

            {/* Drawer */}
            <aside className="tc-drawer">
                {/* Header */}
                <div className="tc-header">
                    <div className="tc-header__listing">
                        <span className="tc-header__have">{listing.have_card}</span>
                        <span className="tc-header__arrow">⇄</span>
                        <span className="tc-header__want">{listing.want_card}</span>
                    </div>
                    <div className="tc-header__meta">
                        <span className="tc-header__owner">
                            {isOwner ? "Your listing" : `@${listing.username || "stan"}'s listing`}
                        </span>
                        {isCompleted && <span className="tc-status tc-status--done">✦ Traded</span>}
                        {isCancelled  && <span className="tc-status tc-status--off">Cancelled</span>}
                    </div>
                    <button className="tc-close" onClick={onClose}>✕</button>
                </div>

                {loading ? (
                    <div className="tc-loading">Loading…</div>
                ) : isOwner ? (
                    /* ── OWNER VIEW ─────────────────────────────────────── */
                    <div className="tc-owner-layout">
                        {/* Sidebar: list of initiators */}
                        <div className="tc-sidebar">
                            <div className="tc-sidebar__label">Interested</div>
                            {conversations.length === 0 && (
                                <p className="tc-sidebar__empty">No DMs yet</p>
                            )}
                            {conversations.map(convo => {
                                const name = initiatorName(convo);
                                const active = convo.id === activeConvoId;
                                return (
                                    <button
                                        key={convo.id}
                                        className={`tc-sidebar__item${active ? " tc-sidebar__item--active" : ""}`}
                                        onClick={() => setActiveConvoId(convo.id)}
                                    >
                                        <div className="tc-sidebar__avatar">
                                            {convo.initiator?.profiles?.avatar || "👤"}
                                        </div>
                                        <div className="tc-sidebar__info">
                                            <span className="tc-sidebar__name">@{name}</span>
                                            <span className={`tc-sidebar__status tc-sidebar__status--${convo.status}`}>
                                                {convo.status}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Chat pane */}
                        <div className="tc-chat-pane">
                            {!activeConvo ? (
                                <div className="tc-empty">Select a conversation</div>
                            ) : (
                                <>
                                    <ChatMessages
                                        messages={messages}
                                        currentUserId={currentUser.id}
                                        bucket={bucket}
                                    />

                                    {/* Accept / Decline if there's a pending proposal */}
                                    {hasProposal && !isClosed && (
                                        <div className="tc-accept-bar">
                                            <p className="tc-accept-bar__label">
                                                @{initiatorName(activeConvo)} offered a card —
                                                accept to complete the trade?
                                            </p>
                                            <div className="tc-accept-bar__btns">
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={handleAccept}
                                                    disabled={accepting}
                                                >
                                                    {accepting ? "Swapping…" : "✓ Accept trade"}
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={handleDecline}
                                                    disabled={accepting}
                                                >
                                                    ✕ Decline
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {error && <p className="tc-error">{error}</p>}

                                    {!isClosed && (
                                        <ChatInput
                                            text={text}
                                            onChange={setText}
                                            onSend={handleSend}
                                            sending={sending}
                                        />
                                    )}
                                    {isClosed && (
                                        <div className="tc-closed-banner">
                                            {isCompleted ? "✦ Trade completed!" : "This conversation is closed."}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ── INITIATOR VIEW ─────────────────────────────────── */
                    <div className="tc-initiator-layout">
                        {/* Listing owner's card */}
                        <div className="tc-listing-summary">
                            <div className="tc-listing-summary__row">
                                <div className="tc-listing-summary__block">
                                    <span className="tc-listing-summary__lbl">They have</span>
                                    <span className="tc-listing-summary__val">{listing.have_card}</span>
                                </div>
                                <span className="tc-listing-summary__arrow">⇄</span>
                                <div className="tc-listing-summary__block">
                                    <span className="tc-listing-summary__lbl">They want</span>
                                    <span className="tc-listing-summary__val">{listing.want_card}</span>
                                </div>
                            </div>
                        </div>

                        <ChatMessages
                            messages={messages}
                            currentUserId={currentUser.id}
                            bucket={bucket}
                        />

                        {error && <p className="tc-error">{error}</p>}

                        {/* Card picker — only shown if not yet completed/cancelled */}
                        {!isClosed && !hasProposal && (
                            <CardPicker
                                ownedCards={ownedCards}
                                bucket={bucket}
                                onPick={handlePropose}
                                disabled={sending}
                            />
                        )}

                        {hasProposal && !isClosed && (
                            <div className="tc-waiting-banner">
                                ⏳ Offer sent — waiting for the owner to accept or decline.
                            </div>
                        )}

                        {!isClosed && (
                            <ChatInput
                                text={text}
                                onChange={setText}
                                onSend={handleSend}
                                sending={sending}
                            />
                        )}
                        {isClosed && (
                            <div className="tc-closed-banner">
                                {isCompleted ? "✦ Trade completed! Check your binder." : "This conversation is closed."}
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}
            </aside>
        </>
    );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function ChatMessages({ messages, currentUserId, bucket }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="tc-messages">
            {messages.length === 0 && (
                <p className="tc-messages__empty">No messages yet. Say hi!</p>
            )}
            {messages.map(msg => (
                <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMine={msg.sender_id === currentUserId}
                    senderName="them"
                    bucket={bucket}
                />
            ))}
            <div ref={bottomRef} />
        </div>
    );
}

function ChatInput({ text, onChange, onSend, sending }) {
    function handleKey(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    }

    return (
        <form className="tc-input-bar" onSubmit={onSend}>
            <textarea
                className="tc-input-bar__field"
                placeholder="Type a message…"
                value={text}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
            />
            <button
                type="submit"
                className="tc-input-bar__send"
                disabled={sending || !text.trim()}
            >
                ↑
            </button>
        </form>
    );
}