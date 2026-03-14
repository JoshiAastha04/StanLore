import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl);
console.log("KEY:", supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
}

//fetch updates
export async function fetchUpdates(groupId) {
    const { data, error } = await supabase
        .from("updates")
        .select("*")
        .eq("group_id", groupId)
        .order("published_at", { ascending: false })
        .limit(20);

    if (error) { console.error("fetchUpdates:", error); return []; }
    return data;
}

export async function fetchPinnedUpdate(groupId) {
    const { data, error } = await supabase
        .from("updates")
        .select("*")
        .eq("group_id", groupId)
        .eq("is_pinned", true)
        .single();

    if (error) return null;
    return data;
}


//Fetch upcoming updates
export async function fetchUpcoming(groupId) {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
        .from("upcoming_events")
        .select("*")
        .eq("group_id", groupId)
        .gte("event_date", today)                    // only future events
        .order("event_date", { ascending: true })
        .limit(8);

    if (error) { console.error("fetchUpcoming:", error); return []; }
    return data;
}


// Fetching user profile
export async function fetchUserCollection(userId) {
    const { data, error } = await supabase
        .from("collection")
        .select(`
            id, status, quantity,
            photocards (
                id, image_url, is_rare,
                versions ( id, name,
                    albums ( id, title, release_date,
                        eras ( id, name, slug )
                    )
                ),
                members ( id, name, stage_name )
            )
        `)
        .eq("user_id", userId);

    if (error) { console.error("fetchUserCollection:", error); return []; }
    return data;
}

export async function upsertCollectionItem(userId, cardId, status) {
    const { error } = await supabase
        .from("collection")
        .upsert({
            user_id: userId,
            card_id: cardId,
            status,
            updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,card_id" });

    if (error) console.error("upsertCollectionItem:", error);
    return !error;
}

// Catalog (all photocards
export async function fetchCatalog(eraSlug) {
    const { data, error } = await supabase
        .from("photocards")
        .select(`
            id, image_url, is_rare,
            members ( name, stage_name ),
            versions ( name,
                albums ( title,
                    eras ( name, slug )
                )
            )
        `)
        .eq("versions.albums.eras.slug", eraSlug);

    if (error) { console.error("fetchCatalog:", error); return []; }
    return data;
}


// Trade Listings
export async function fetchTradeListings() {
    const { data, error } = await supabase
        .from("trade_listings")
        .select(`
            id, note, created_at,
            profiles ( username ),
            have_card:photocards!have_card_id (
                members ( name ), versions ( name, albums ( title ) )
            ),
            want_card:photocards!want_card_id (
                members ( name ), versions ( name, albums ( title ) )
            )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) { console.error("fetchTradeListings:", error); return []; }
    return data;
}

export async function postTradeListing(userId, haveCardId, wantCardId, note = "") {
    const { error } = await supabase
        .from("trade_listings")
        .insert({ user_id: userId, have_card_id: haveCardId, want_card_id: wantCardId, note });

    if (error) console.error("postTradeListing:", error);
    return !error;
}


// Fetch Profile
export async function fetchProfile(username) {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

    if (error) { console.error("fetchProfile:", error); return null; }
    return data;
}

export async function updateProfile(userId, updates) {
    const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId);

    if (error) console.error("updateProfile:", error);
    return !error;
}

//Submit Grp Suggestions
export async function submitGroupSuggestion({ groupName, note, userId = null, email = null }) {
    const { error } = await supabase
        .from("group_suggestions")
        .insert({
            group_name:   groupName,
            note:         note || null,
            submitted_by: userId || null,
            email:        email || null,
        });

    if (error) { console.error("submitGroupSuggestion:", error); return false; }
    return true;
}

// Fetch existing suggestions so users can upvote instead of duplicating
export async function fetchGroupSuggestions() {
    const { data, error } = await supabase
        .from("group_suggestions")
        .select("id, group_name, votes, status")
        .in("status", ["pending", "reviewing"])
        .order("votes", { ascending: false });

    if (error) return [];
    return data;
}

export async function upvoteGroupSuggestion(id) {
    const { error } = await supabase.rpc("increment_suggestion_votes", { suggestion_id: id });
    if (error) console.error("upvoteGroupSuggestion:", error);
    return !error;
}

// fashion - styele
export async function fetchStyleLooks(groupId, memberName = null) {
    let query = supabase
        .from("style_looks")
        .select(`
            id, member_name, occasion, location, headline, look_date,
            image_url, tags, saves_count, is_hot,
            style_items (
                id, item_name, brand, category, price, is_identified,
                style_dupes ( name, price, link )
            )
        `)
        .eq("group_id", groupId)
        .order("look_date", { ascending: false });

    if (memberName) query = query.eq("member_name", memberName);

    const { data, error } = await query;
    if (error) { console.error("fetchStyleLooks:", error); return []; }
    return data;
}

export async function submitStyleLook({ userId, memberName, occasion, notes, sourceLink }) {
    const { error } = await supabase
        .from("style_submissions")
        .insert({
            submitted_by: userId,
            member_name:  memberName,
            occasion,
            notes,
            source_link: sourceLink,
        });

    if (error) { console.error("submitStyleLook:", error); return false; }
    return true;
}


//real time subscriptions
export function subscribeToUpdates(groupId, onNew) {
    return supabase
        .channel(`updates:${groupId}`)
        .on("postgres_changes", {
            event:  "INSERT",
            schema: "public",
            table:  "updates",
            filter: `group_id=eq.${groupId}`,
        }, payload => onNew(payload.new))
        .subscribe();
}

export function subscribeToCollection(userId, onChange) {
    return supabase
        .channel(`collection:${userId}`)
        .on("postgres_changes", {
            event:  "*",          // INSERT, UPDATE, DELETE
            schema: "public",
            table:  "collection",
            filter: `user_id=eq.${userId}`,
        }, payload => onChange(payload))
        .subscribe();
}


export const supabase = createClient(supabaseUrl, supabaseKey);
