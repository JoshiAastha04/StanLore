import { supabase } from "./supabase";

export function getStorageImageUrl(path) {
    if (!path) return null;
    const normalised = path.includes(".") ? path : `${path}.png`;
    const { data } = supabase.storage.from("bts-media").getPublicUrl(normalised);
    return data.publicUrl;
}

// ─── Fetch all photocards with full joins ─────────────────────────────────────
export async function getButterPhotos() {
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
        .order("member_id", { ascending: true });

    if (error) throw error;

    return data.map(photo => ({
        ...photo,
        publicUrl: getStorageImageUrl(photo.image_url),

        // Use stage_name as the display name shown on the card (Jin, RM, Suga...)
        // Fall back to full name only if stage_name is missing
        memberName: photo.members?.stage_name || photo.members?.name || "Unknown",

        // Keep full name accessible separately if needed
        memberFullName: photo.members?.name ?? "",
        stageName:      photo.members?.stage_name ?? "",

        version: photo.versions?.name ?? "",
        album:   photo.versions?.albums?.title ?? "",
        era:     photo.versions?.albums?.eras?.name ?? "",
    }));
}