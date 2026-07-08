import { supabase } from "../config/supabase";

export const INI_CATEGORIES = [
    "Farmeo",
    "PvP",
    "Hard",
    "FPS Boost",
    "Visibilidad",
    "Limpio / Clean",
    "general"
];

export async function getInis() {
    return await supabase
        .from("ini_presets")
        .select(`
            id,
            title,
            category,
            description,
            content,
            file_path,
            preview_image_path,
            copy_count,
            download_count,
            is_public,
            created_at,
            updated_at,
            creator:created_by (
                id,
                name,
                role
            )
        `)
        .order("created_at", { ascending: false });
}

export async function createIniPreset(payload) {
    return await supabase
        .from("ini_presets")
        .insert(payload)
        .select()
        .single();
}

export async function updateIniPreset(id, payload) {
    return await supabase
        .from("ini_presets")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
}

export async function deleteIniPreset(id) {
    return await supabase
        .from("ini_presets")
        .delete()
        .eq("id", id);
}

export async function uploadIniFile(file) {
    if (!file) return null;

    const isIniFile = file.name.toLowerCase().endsWith(".ini");

    if (!isIniFile) {
        throw new Error("Solo puedes subir archivos .ini");
    }

    const safeName = file.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "");

    const path = `files/${crypto.randomUUID()}-${safeName}`;

    const { error } = await supabase.storage
        .from("ini-files")
        .upload(path, file, {
            contentType: "text/plain",
            upsert: false
        });

    if (error) throw error;

    return path;
}

export async function uploadIniPreview(file) {
    if (!file) return null;

    if (!file.type.startsWith("image/")) {
        throw new Error("La preview debe ser una imagen.");
    }

    const extension = file.name.split(".").pop();
    const path = `previews/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
        .from("ini-previews")
        .upload(path, file, {
            contentType: file.type,
            upsert: false
        });

    if (error) throw error;

    return path;
}

export function getIniFileUrl(path) {
    if (!path) return null;

    const { data } = supabase.storage
        .from("ini-files")
        .getPublicUrl(path);

    return data.publicUrl;
}

export function getIniPreviewUrl(path) {
    if (!path) {
        return "https://placehold.co/600x360?text=INI+Preview";
    }

    const { data } = supabase.storage
        .from("ini-previews")
        .getPublicUrl(path);

    return data.publicUrl;
}

export async function incrementIniCopyCount(id) {
    return await supabase.rpc("increment_ini_copy_count", {
        p_ini_id: id
    });
}

export async function incrementIniDownloadCount(id) {
    return await supabase.rpc("increment_ini_download_count", {
        p_ini_id: id
    });
}

export async function notifyDiscordNewIni(iniId) {
    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !data?.session) {
        return {
            data: null,
            error: sessionError || new Error("No hay sesión activa.")
        };
    }

    return await supabase.functions.invoke("notify-discord-ini", {
        body: {
            iniId
        },
        headers: {
            Authorization: `Bearer ${data.session.access_token}`
        }
    });
}