import { supabase } from "../config/supabase";

export async function getMutations() {
    return await supabase
        .from("mutations")
        .select(`
            id,
            old_value,
            new_value,
            propagators_used,
            notes,
            created_at,
            user:user_id (
                id,
                name,
                role
            ),
            breed:breed_id (
                id,
                stat,
                species:species_id (
                    id,
                    name,
                    image_path
                ),
                breeder:breeder_id (
                    id,
                    name
                )
            )
        `)
        .order("created_at", { ascending: false });
}