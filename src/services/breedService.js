import { supabase } from "../config/supabase";

const breedSelect = `
    id,
    stat,
    current_value,
    next_value,
    mutations,
    status,
    created_at,
    breeder_id,
    species_id,
    species:species_id (
        id,
        name,
        class,
        dlc,
        image_path
    ),
    breeder:breeder_id (
        id,
        name,
        role
    ),
    propagators (
        id,
        number,
        cooldown_until
    )
`;

export async function getBreeds() {
    return await supabase
        .from("breeds")
        .select(`
            id,
            species_id,
            breeder_id,
            stat,
            current_value,
            next_value,
            mutations,
            status,
            created_at,
            species:species_id (
                id,
                name,
                class,
                dlc,
                image_path
            ),
            breeder:breeder_id (
                id,
                name,
                role
            )
        `)
        .order("created_at", { ascending: false });
}

export async function getActiveBreedsWithPropagators({ breederId = null } = {}) {
    let query = supabase
        .from("breeds")
        .select(breedSelect)
        .eq("status", "active")
        .order("created_at", { ascending: false });

    if (breederId) {
        query = query.eq("breeder_id", breederId);
    }

    return await query;
}

export async function getAllActiveBreedsWithPropagators() {
    return await supabase
        .from("breeds")
        .select(breedSelect)
        .eq("status", "active")
        .order("created_at", { ascending: false });
}

export async function createBreed(breed) {
    return await supabase
        .from("breeds")
        .insert(breed)
        .select()
        .single();
}

export async function updateBreed(id, breed) {
    return await supabase
        .from("breeds")
        .update(breed)
        .eq("id", id)
        .select()
        .single();
}

export async function createBreedPropagators(breedId) {
    const propagators = [1, 2, 3, 4].map(number => ({
        breed_id: breedId,
        number,
        cooldown_until: null
    }));

    return await supabase
        .from("propagators")
        .insert(propagators);
}

export async function deleteBreed(id) {
    return await supabase
        .from("breeds")
        .delete()
        .eq("id", id);
}

export async function finishBreed(id) {
    return await supabase
        .from("breeds")
        .update({ status: "finished" })
        .eq("id", id)
        .select()
        .single();
}

export async function registerMutation({
    breed,
    propagatorsUsed,
    notes
}) {
    return await supabase.rpc("register_mutation_secure", {
        p_breed_id: breed.id,
        p_propagators_used: propagatorsUsed,
        p_notes: notes || null
    });
}
export async function notifyDiscordMutation(breedId) {
    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !data?.session) {
        return {
            data: null,
            error: sessionError || new Error("No hay sesión activa.")
        };
    }

    return await supabase.functions.invoke("notify-discord-mutation", {
        body: {
            breedId
        },
        headers: {
            Authorization: `Bearer ${data.session.access_token}`
        }
    });
}