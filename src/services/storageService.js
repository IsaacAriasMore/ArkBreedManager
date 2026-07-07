import { supabase } from "../config/supabase";

export async function uploadSpeciesImage(file) {
    if (!file) return null;

    const extension = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const path = `images/${fileName}`;

    const { error } = await supabase.storage
        .from("species")
        .upload(path, file);

    if (error) throw error;

    return path;
}

export function getSpeciesImage(path) {
    if (!path) return "https://placehold.co/400x250?text=Sin+Imagen";

    const { data } = supabase.storage
        .from("species")
        .getPublicUrl(path);

    return data.publicUrl;
}