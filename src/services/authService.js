import { supabase } from "../config/supabase";

export async function login(email, password) {
    return await supabase.auth.signInWithPassword({
        email,
        password
    });
}

export async function logout() {
    return await supabase.auth.signOut();
}

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();

    return {
        session: data?.session || null,
        error
    };
}

export async function getCurrentAuthUser() {
    const { data, error } = await supabase.auth.getUser();

    return {
        authUser: data?.user || null,
        error
    };
}

export async function getUserProfile(userId) {
    return await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
}