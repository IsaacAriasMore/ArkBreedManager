import { supabase } from "../config/supabase";

export async function getStats() {
    const mutationsResult = await supabase
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
                breeder:breeder_id (
                    id,
                    name
                ),
                species:species_id (
                    id,
                    name,
                    image_path
                )
            )
        `)
        .order("created_at", { ascending: false });

    if (mutationsResult.error) {
        return {
            data: null,
            error: mutationsResult.error
        };
    }

    const breedsResult = await supabase
        .from("breeds")
        .select(`
            id,
            status,
            mutations,
            breeder:breeder_id (
                id,
                name
            ),
            species:species_id (
                id,
                name,
                image_path
            )
        `);

    if (breedsResult.error) {
        return {
            data: null,
            error: breedsResult.error
        };
    }

    const mutations = mutationsResult.data || [];
    const breeds = breedsResult.data || [];

    const totalMutations = mutations.length;

    const activeBreeds = breeds.filter(breed => breed.status === "active").length;

    const finishedBreeds = breeds.filter(breed => breed.status === "finished").length;

    const breederRanking = buildBreederRanking(mutations);

    const speciesRanking = buildSpeciesRanking(mutations);

    const recentMutations = mutations.slice(0, 5);

    return {
        data: {
            totalMutations,
            activeBreeds,
            finishedBreeds,
            breederRanking,
            speciesRanking,
            recentMutations
        },
        error: null
    };
}

function buildBreederRanking(mutations) {
    const ranking = {};

    mutations.forEach(mutation => {
        const name =
            mutation.user?.name ||
            mutation.breed?.breeder?.name ||
            "Sin usuario";

        if (!ranking[name]) {
            ranking[name] = 0;
        }

        ranking[name]++;
    });

    return Object.entries(ranking)
        .map(([name, total]) => ({
            name,
            total
        }))
        .sort((a, b) => b.total - a.total);
}

function buildSpeciesRanking(mutations) {
    const ranking = {};

    mutations.forEach(mutation => {
        const name = mutation.breed?.species?.name || "Sin especie";

        if (!ranking[name]) {
            ranking[name] = 0;
        }

        ranking[name]++;
    });

    return Object.entries(ranking)
        .map(([name, total]) => ({
            name,
            total
        }))
        .sort((a, b) => b.total - a.total);
}