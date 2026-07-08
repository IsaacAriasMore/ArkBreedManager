import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
        return jsonResponse({ error: "Método no permitido" }, 405);
    }

    try {
        const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!discordWebhookUrl || !supabaseUrl || !serviceRoleKey) {
            return jsonResponse(
                { error: "Faltan secrets de Supabase o Discord." },
                500
            );
        }

        const authHeader = req.headers.get("Authorization") || "";
        const token = authHeader.replace("Bearer ", "");

        if (!token) {
            return jsonResponse({ error: "No autorizado." }, 401);
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                persistSession: false
            }
        });

        const { data: userData, error: userError } =
            await supabaseAdmin.auth.getUser(token);

        if (userError || !userData?.user) {
            return jsonResponse({ error: "Token inválido." }, 401);
        }

        const { data: profile, error: profileError } = await supabaseAdmin
            .from("users")
            .select("id, name, role")
            .eq("id", userData.user.id)
            .single();

        if (profileError || !profile) {
            return jsonResponse({ error: "Perfil no encontrado." }, 403);
        }

        const body = await req.json();
        const breedId = body.breedId;

        if (!breedId) {
            return jsonResponse({ error: "Falta breedId." }, 400);
        }

        const { data: mutation, error: mutationError } = await supabaseAdmin
            .from("mutations")
            .select(`
                id,
                old_value,
                new_value,
                propagators_used,
                notes,
                created_at,
                breed:breed_id (
                    id,
                    breeder_id,
                    stat,
                    species:species_id (
                        id,
                        name
                    ),
                    breeder:breeder_id (
                        id,
                        name
                    )
                )
            `)
            .eq("breed_id", breedId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (mutationError || !mutation) {
            return jsonResponse({ error: "Mutación no encontrada." }, 404);
        }

        const breed = mutation.breed;

        if (
            profile.role !== "admin" &&
            breed?.breeder_id !== profile.id
        ) {
            return jsonResponse(
                { error: "No tienes permiso para notificar esta mutación." },
                403
            );
        }

        const speciesName = breed?.species?.name || "Sin especie";
        const statName = breed?.stat || "-";
        const breederName = breed?.breeder?.name || "Sin breeder";
        const propagators = Array.isArray(mutation.propagators_used)
            ? mutation.propagators_used.map((number) => `P${number}`).join(", ")
            : "No registrado";

        const discordPayload = {
            username: "ArkBreed",
            content: "🧬 Nueva mutación registrada",
            embeds: [
                {
                    title: `${speciesName} - ${statName}`,
                    description: mutation.notes || "Mutación registrada en ArkBreed.",
                    color: 5763719,
                    fields: [
                        {
                            name: "Valor",
                            value: `${mutation.old_value} → ${mutation.new_value}`,
                            inline: true
                        },
                        {
                            name: "Registrado por",
                            value: profile.name || "Usuario",
                            inline: true
                        },
                        {
                            name: "Breeder encargado",
                            value: breederName,
                            inline: true
                        },
                        {
                            name: "Propagators usados",
                            value: propagators || "-",
                            inline: false
                        }
                    ],
                    timestamp: new Date().toISOString()
                }
            ]
        };

        const discordResponse = await fetch(discordWebhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(discordPayload)
        });

        if (!discordResponse.ok) {
            const discordError = await discordResponse.text();

            return jsonResponse(
                {
                    error: "Discord rechazó el mensaje.",
                    details: discordError
                },
                500
            );
        }

        return jsonResponse({
            ok: true,
            message: "Notificación de mutación enviada."
        });
    } catch (error) {
        return jsonResponse(
            {
                error: error instanceof Error
                    ? error.message
                    : "Error interno."
            },
            500
        );
    }
});

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
        }
    });
}