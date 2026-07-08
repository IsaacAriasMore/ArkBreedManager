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
        return jsonResponse(
            { error: "Método no permitido" },
            405
        );
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
            return jsonResponse(
                { error: "No autorizado." },
                401
            );
        }

        const supabaseAdmin = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    persistSession: false
                }
            }
        );

        const { data: userData, error: userError } =
            await supabaseAdmin.auth.getUser(token);

        if (userError || !userData?.user) {
            return jsonResponse(
                { error: "Token inválido." },
                401
            );
        }

        const { data: profile, error: profileError } = await supabaseAdmin
            .from("users")
            .select("id, name, role")
            .eq("id", userData.user.id)
            .single();

        if (profileError || profile?.role !== "admin") {
            return jsonResponse(
                { error: "Solo admin puede enviar notificaciones de INIs." },
                403
            );
        }

        const body = await req.json();
        const iniId = body.iniId;

        if (!iniId) {
            return jsonResponse(
                { error: "Falta iniId." },
                400
            );
        }

        const { data: ini, error: iniError } = await supabaseAdmin
            .from("ini_presets")
            .select(`
                id,
                title,
                category,
                description,
                is_public,
                created_at
            `)
            .eq("id", iniId)
            .single();

        if (iniError || !ini) {
            return jsonResponse(
                { error: "INI no encontrado." },
                404
            );
        }

        const uploaderName = profile?.name || "Admin";

        const discordPayload = {
            username: "ArkBreed",
            content: "📁 Nuevo INI publicado",
            embeds: [
                {
                    title: ini.title,
                    description: ini.description || "Nuevo INI disponible en ArkBreed.",
                    color: 3447003,
                    fields: [
                        {
                            name: "Tipo",
                            value: ini.category || "-",
                            inline: true
                        },
                        {
                            name: "Subido por",
                            value: uploaderName,
                            inline: true
                        },
                        {
                            name: "Estado",
                            value: ini.is_public ? "Publicado" : "Oculto",
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
            message: "Notificación enviada a Discord."
        });
    } catch (error) {
        return jsonResponse(
            {
                error: error instanceof Error
                    ? error.message
                    : "Error interno enviando notificación."
            },
            500
        );
    }
});

function jsonResponse(body: unknown, status = 200) {
    return new Response(
        JSON.stringify(body),
        {
            status,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            }
        }
    );
}