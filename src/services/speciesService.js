import { supabase } from "../config/supabase";

export async function getSpecies() {
    return await supabase
        .from("species")
        .select("*")
        .order("name", { ascending: true });
}

export async function createSpecies(species) {
    return await supabase
        .from("species")
        .insert(species)
        .select()
        .single();
}

export async function updateSpecies(id, species) {
    return await supabase
        .from("species")
        .update(species)
        .eq("id", id)
        .select()
        .single();
}

export async function deleteSpecies(id) {
    return await supabase
        .from("species")
        .delete()
        .eq("id", id);
}