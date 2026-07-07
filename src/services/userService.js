import { supabase } from "../config/supabase";

export async function getUsers() {
    return await supabase
        .from("users")
        .select("*")
        .order("name", { ascending: true });
}

export async function createUserProfile(user) {
    return await supabase
        .from("users")
        .insert(user)
        .select()
        .single();
}

export async function updateUserProfile(id, user) {
    return await supabase
        .from("users")
        .update(user)
        .eq("id", id)
        .select()
        .single();
}

export async function deleteUserProfile(id) {
    return await supabase
        .from("users")
        .delete()
        .eq("id", id);
}