import { supabase } from "./supabase";

// Returns the public URL for an image in a given storage bucket.
// bucketName defaults to "bts-media" for backward compatibility.
export function getStorageImageUrl(path, bucketName = "bts-media") {
    if (!path) return null;
    const normalised = path.includes(".") ? path : `${path}.png`;
    const { data } = supabase.storage.from(bucketName).getPublicUrl(normalised);
    return data.publicUrl;
}

// ─── Fetch photocards for a specific group ────────────────────────────────────
// Uses the group's own storage bucket (e.g. "BlackPink-media").
// Filters photocards by group_id so each world only shows its own cards.
export async function getGroupPhotos(groupId = "bts", bucketName = null) {
    bucketName = bucketName ?? `${groupId}-media`;

    const { data, error } = await supabase
        .from("photocards")
        .select(`
            id, image_url, is_rare, star_cost, rarity,
            members   ( name, stage_name ),
            versions  ( name,
                albums ( title,
                    eras ( name, slug )
                )
            )
        `)
        .eq("group_id", groupId)
        .order("member_id", { ascending: true });

    if (error) throw error;

    return data.map(photo => ({
        ...photo,
        publicUrl: getStorageImageUrl(photo.image_url, bucketName),

        memberName:     photo.members?.stage_name || photo.members?.name || "Unknown",
        memberFullName: photo.members?.name ?? "",
        stageName:      photo.members?.stage_name ?? "",

        version: photo.versions?.name ?? "",
        album:   photo.versions?.albums?.title ?? "",
        era:     photo.versions?.albums?.eras?.name ?? "",
    }));
}

// ─── Backward-compatible alias ────────────────────────────────────────────────
// Existing code that calls getButterPhotos() still works - it just fetches BTS.
export async function getButterPhotos() {
    return getGroupPhotos("bts");
}