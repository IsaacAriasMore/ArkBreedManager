import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
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
        const cronSecret = Deno.env.get("PROPAGATOR_CRON_SECRET");

        if (!discordWebhookUrl || !supabaseUrl || !serviceRoleKey || !cronSecret) {
            return jsonResponse(
                { error: "Faltan secrets necesarios." },
                500
            );
        }

        const receivedSecret =
            req.headers.get("x-cron-secret") ||
            req.headers.get("authorization")?.replace("Bearer ", "");

        if (receivedSecret !== cronSecret) {
            return jsonResponse({ error: "No autorizado." }, 401);
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                persistSession: false
            }
        });

        const { data: alerts, error: alertsError } = await supabaseAdmin
            .from("propagator_cooldown_alerts")
            .select(`
                id,
                propagator_number,
                notify_at,
                breed:breed_id (
                    id,
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
            .is("notified_at", null)
            .lte("notify_at", new Date().toISOString())
            .order("notify_at", { ascending: true })
            .limit(25);

        if (alertsError) {
            return jsonResponse(
                {
                    error: "Error buscando alertas.",
                    details: alertsError.message
                },
                500
            );
        }

        if (!alerts || alerts.length === 0) {
            return jsonResponse({
                ok: true,
                message: "No hay propagators pendientes."
            });
        }

        const sentIds: string[] = [];

        for (const alert of alerts) {
            const breed = alert.breed;

            const speciesName = breed?.species?.name || "Sin especie";
            const statName = breed?.stat || "-";
            const breederName = breed?.breeder?.name || "Sin breeder";

            const discordPayload = {
                username: "ArkBreed",
                content: "🟢 Propagator disponible",
                embeds: [
                    {
                        title: `${speciesName} - ${statName}`,
                        description: `El propagator P${alert.propagator_number} ya está disponible nuevamente.`,
                        color: 5763719,
                        fields: [
                            {
                                name: "Propagator",
                                value: `P${alert.propagator_number}`,
                                inline: true
                            },
                            {
                                name: "Breeder encargado",
                                value: breederName,
                                inline: true
                            },
                            {
                                name: "Estado",
                                value: "Disponible",
                                inline: true
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

            if (discordResponse.ok) {
                sentIds.push(alert.id);
            }
        }

        if (sentIds.length > 0) {
            await supabaseAdmin
                .from("propagator_cooldown_alerts")
                .update({
                    notified_at: new Date().toISOString()
                })
                .in("id", sentIds);
        }

        return jsonResponse({
            ok: true,
            notified: sentIds.length
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