import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const IDENTITY_TYPES = {
    BATTLEMETRICS_ID: "battlemetrics_id",
    STEAM_NAME_UNIQUE: "steam_name_unique",
    NAME_ONLY: "name_only",
    TEMPORARY_SESSION: "temporary_session"
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
        return jsonResponse({ error: "Método no permitido." }, 405);
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        const cronSecret = Deno.env.get("SERVER_MONITOR_CRON_SECRET");

        if (!supabaseUrl || !serviceRoleKey) {
            return jsonResponse({ error: "Faltan secrets de Supabase." }, 500);
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false }
        });

        const receivedCronSecret = req.headers.get("x-cron-secret");
        const isCronRequest =
            Boolean(cronSecret) &&
            Boolean(receivedCronSecret) &&
            receivedCronSecret === cronSecret;

        if (!isCronRequest) {
            const authHeader = req.headers.get("Authorization") || "";
            const token = authHeader.replace("Bearer ", "");

            if (!token) {
                return jsonResponse({ error: "No autorizado." }, 401);
            }

            const { data: userData, error: userError } =
                await supabaseAdmin.auth.getUser(token);

            if (userError || !userData?.user) {
                return jsonResponse({ error: "Token inválido." }, 401);
            }
        }

        const body = await safeReadJson(req);
        const serverId = body?.serverId || null;

        if (isCronRequest && !serverId) {
            const { data: servers, error: serversError } = await supabaseAdmin
                .from("monitored_servers")
                .select("*")
                .eq("is_active", true);

            if (serversError) {
                return jsonResponse({
                    error: "No se pudieron cargar servidores activos.",
                    details: serversError.message
                }, 500);
            }

            const results = [];

            for (const server of servers || []) {
                try {
                    const result = await syncOneServer(supabaseAdmin, server);
                    results.push({
                        server_id: server.id,
                        ok: true,
                        result
                    });
                } catch (error) {
                    results.push({
                        server_id: server.id,
                        ok: false,
                        error: error instanceof Error ? error.message : "Error desconocido"
                    });
                }
            }

            return jsonResponse({
                ok: true,
                mode: "cron_all_servers",
                synced: results.filter(result => result.ok).length,
                failed: results.filter(result => !result.ok).length,
                results
            });
        }

        if (!serverId) {
            return jsonResponse({ error: "Falta serverId." }, 400);
        }

        const { data: server, error: serverError } = await supabaseAdmin
            .from("monitored_servers")
            .select("*")
            .eq("id", serverId)
            .single();

        if (serverError || !server) {
            return jsonResponse({ error: "Servidor no encontrado." }, 404);
        }

        const result = await syncOneServer(supabaseAdmin, server);

        return jsonResponse({
            ok: true,
            mode: isCronRequest ? "cron_single_server" : "manual",
            ...result
        });
    } catch (error) {
        return jsonResponse({
            error: error instanceof Error
                ? error.message
                : "Error interno sincronizando servidor."
        }, 500);
    }
});

async function syncOneServer(supabaseAdmin: any, server: any) {
    const battlemetricsDocument = await resolveBattlemetricsDocument(server);

    if (!battlemetricsDocument?.data) {
        throw new Error(`No se encontró coincidencia para ${server.ip}:${server.port}`);
    }

    const serverResource = battlemetricsDocument.data;
    const serverAttributes = serverResource.attributes || {};
    const included = battlemetricsDocument.included || [];

    const rawPlayers = getPlayersFromIncluded(included);
    const normalizedPlayers = normalizePlayers(rawPlayers);

    const currentPlayers =
        Number(serverAttributes.players) ||
        Number(serverAttributes.numPlayers) ||
        normalizedPlayers.length ||
        0;

    const maxPlayers =
        Number(serverAttributes.maxPlayers) ||
        Number(serverAttributes.maxplayers) ||
        0;

    const mapName = getMapName(serverAttributes);
    const serverName = serverAttributes.name || server.name;
    const battlemetricsServerId = String(serverResource.id);

    await supabaseAdmin
        .from("monitored_servers")
        .update({
            battlemetrics_server_id: battlemetricsServerId,
            server_name: serverName,
            map_name: mapName,
            current_players: currentPlayers,
            max_players: maxPlayers,
            last_synced_at: new Date().toISOString()
        })
        .eq("id", server.id);

    const syncResult = await syncPlayerSessions({
        supabaseAdmin,
        serverId: server.id,
        players: normalizedPlayers
    });

    return {
        server: {
            id: server.id,
            battlemetrics_server_id: battlemetricsServerId,
            name: serverName,
            map: mapName,
            current_players: currentPlayers,
            max_players: maxPlayers
        },
        players_detected: normalizedPlayers.length,
        sessions: syncResult,
        warning: normalizedPlayers.length === 0 && currentPlayers > 0
            ? "BattleMetrics detecta jugadores online, pero no devolvió lista pública de jugadores."
            : null
    };
}

async function resolveBattlemetricsDocument(server: any) {
    if (server.battlemetrics_server_id) {
        const existingDocument = await getBattlemetricsServer(String(server.battlemetrics_server_id));

        if (existingDocument?.data) {
            return existingDocument;
        }
    }

    const foundServer = await findBattlemetricsServer(server.ip, Number(server.port));

    if (!foundServer) {
        return null;
    }

    const fullDocument = await getBattlemetricsServer(String(foundServer.id));

    if (fullDocument?.data) {
        return fullDocument;
    }

    return {
        data: foundServer,
        included: []
    };
}

async function findBattlemetricsServer(ip: string, port: number) {
    const search = `${ip}:${port}`;

    const arkResult = await battlemetricsFetch(
        `https://api.battlemetrics.com/servers?filter[search]=${encodeURIComponent(search)}&filter[game]=ark&page[size]=10`
    );

    let candidates = arkResult?.data || [];

    if (candidates.length === 0) {
        const fallbackResult = await battlemetricsFetch(
            `https://api.battlemetrics.com/servers?filter[search]=${encodeURIComponent(search)}&page[size]=10`
        );

        candidates = fallbackResult?.data || [];
    }

    if (candidates.length === 0) return null;

    const exactMatch = candidates.find((server: any) => {
        const attributes = server.attributes || {};
        const serverIp = attributes.ip || attributes.address;
        const serverPort = Number(attributes.port);

        return String(serverIp) === ip && serverPort === Number(port);
    });

    return exactMatch || candidates[0];
}

async function getBattlemetricsServer(id: string) {
    const result = await battlemetricsFetch(
        `https://api.battlemetrics.com/servers/${id}?include=player`
    );

    return result || null;
}

async function battlemetricsFetch(url: string) {
    const battlemetricsToken = Deno.env.get("BATTLEMETRICS_TOKEN");

    const headers: Record<string, string> = {
        "Accept": "application/json"
    };

    if (battlemetricsToken) {
        headers.Authorization = `Bearer ${battlemetricsToken}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`BattleMetrics error ${response.status}: ${text}`);
    }

    return await response.json();
}

function getPlayersFromIncluded(included: any[]) {
    return included
        .filter(item => item?.type === "player")
        .map(player => {
            const attributes = player.attributes || {};

            return {
                id: player.id ? String(player.id) : null,
                detected_name:
                    attributes.name ||
                    attributes.nickname ||
                    attributes.displayName ||
                    "Desconocido",
                battlemetrics_name:
                    attributes.name ||
                    attributes.nickname ||
                    attributes.displayName ||
                    "Desconocido"
            };
        });
}

function normalizePlayers(players: any[]) {
    const nameCounts = new Map<string, number>();

    players.forEach(player => {
        const nameKey = normalizeName(player.battlemetrics_name || player.detected_name);
        nameCounts.set(nameKey, (nameCounts.get(nameKey) || 0) + 1);
    });

    const seenNameIndexes = new Map<string, number>();

    return players.map(player => {
        const detectedName = player.detected_name || "Desconocido";
        const battlemetricsName = player.battlemetrics_name || detectedName;
        const nameKey = normalizeName(battlemetricsName);
        const nameCount = nameCounts.get(nameKey) || 1;

        if (player.id) {
            return {
                identity_type: IDENTITY_TYPES.BATTLEMETRICS_ID,
                identity_key: String(player.id),
                detected_name: detectedName,
                battlemetrics_name: battlemetricsName
            };
        }

        if (!isWeakName(battlemetricsName) && nameCount === 1) {
            return {
                identity_type: IDENTITY_TYPES.STEAM_NAME_UNIQUE,
                identity_key: nameKey,
                detected_name: detectedName,
                battlemetrics_name: battlemetricsName
            };
        }

        if (nameCount === 1) {
            return {
                identity_type: IDENTITY_TYPES.NAME_ONLY,
                identity_key: nameKey,
                detected_name: detectedName,
                battlemetrics_name: battlemetricsName
            };
        }

        const currentIndex = (seenNameIndexes.get(nameKey) || 0) + 1;
        seenNameIndexes.set(nameKey, currentIndex);

        return {
            identity_type: IDENTITY_TYPES.TEMPORARY_SESSION,
            identity_key: `${nameKey}:${currentIndex}`,
            detected_name: `${detectedName} #${currentIndex}`,
            battlemetrics_name: battlemetricsName
        };
    });
}

async function syncPlayerSessions({
    supabaseAdmin,
    serverId,
    players
}: {
    supabaseAdmin: any;
    serverId: string;
    players: any[];
}) {
    const now = new Date();
    const nowIso = now.toISOString();

    const { data: activeSessions } = await supabaseAdmin
        .from("server_player_sessions")
        .select("*")
        .eq("server_id", serverId)
        .eq("is_active", true);

    const activeSessionList = activeSessions || [];
    const currentKeys = new Set(
        players.map(player => `${player.identity_type}:${player.identity_key}`)
    );

    let created = 0;
    let updated = 0;
    let closed = 0;

    for (const player of players) {
        const sessionKey = `${player.identity_type}:${player.identity_key}`;

        const existingSession = activeSessionList.find((session: any) => {
            return `${session.identity_type}:${session.identity_key}` === sessionKey;
        });

        if (existingSession) {
            const startedAt = new Date(existingSession.started_at);
            const minutesOnline = minutesBetween(startedAt, now);

            await supabaseAdmin
                .from("server_player_sessions")
                .update({
                    detected_name: player.detected_name,
                    battlemetrics_name: player.battlemetrics_name,
                    last_seen_at: nowIso,
                    minutes_online: minutesOnline
                })
                .eq("id", existingSession.id);

            updated++;
        } else {
            await supabaseAdmin
                .from("server_player_sessions")
                .insert({
                    server_id: serverId,
                    identity_type: player.identity_type,
                    identity_key: player.identity_key,
                    detected_name: player.detected_name,
                    battlemetrics_name: player.battlemetrics_name,
                    started_at: nowIso,
                    last_seen_at: nowIso,
                    minutes_online: 0,
                    is_active: true
                });

            created++;
        }

        await updatePlayerTotal({
            supabaseAdmin,
            serverId,
            player,
            now
        });
    }

    for (const session of activeSessionList) {
        const sessionKey = `${session.identity_type}:${session.identity_key}`;

        if (currentKeys.has(sessionKey)) continue;

        const startedAt = new Date(session.started_at);
        const minutesOnline = minutesBetween(startedAt, now);

        await supabaseAdmin
            .from("server_player_sessions")
            .update({
                ended_at: nowIso,
                last_seen_at: nowIso,
                minutes_online: minutesOnline,
                is_active: false
            })
            .eq("id", session.id);

        await updateClosedPlayerTotal({
            supabaseAdmin,
            session,
            now
        });

        closed++;
    }

    return { created, updated, closed };
}

async function updatePlayerTotal({
    supabaseAdmin,
    serverId,
    player,
    now
}: {
    supabaseAdmin: any;
    serverId: string;
    player: any;
    now: Date;
}) {
    const { data: total } = await supabaseAdmin
        .from("server_player_totals")
        .select("*")
        .eq("server_id", serverId)
        .eq("identity_type", player.identity_type)
        .eq("identity_key", player.identity_key)
        .maybeSingle();

    const nowIso = now.toISOString();

    if (!total) {
        await supabaseAdmin
            .from("server_player_totals")
            .insert({
                server_id: serverId,
                identity_type: player.identity_type,
                identity_key: player.identity_key,
                detected_name: player.detected_name,
                battlemetrics_name: player.battlemetrics_name,
                total_minutes: 0,
                last_seen_at: nowIso
            });

        return;
    }

    const lastSeen = total.last_seen_at ? new Date(total.last_seen_at) : now;
    const deltaMinutes = Math.max(0, minutesBetween(lastSeen, now));

    await supabaseAdmin
        .from("server_player_totals")
        .update({
            detected_name: player.detected_name,
            battlemetrics_name: player.battlemetrics_name,
            total_minutes: Number(total.total_minutes || 0) + deltaMinutes,
            last_seen_at: nowIso,
            updated_at: nowIso
        })
        .eq("id", total.id);
}

async function updateClosedPlayerTotal({
    supabaseAdmin,
    session,
    now
}: {
    supabaseAdmin: any;
    session: any;
    now: Date;
}) {
    const { data: total } = await supabaseAdmin
        .from("server_player_totals")
        .select("*")
        .eq("server_id", session.server_id)
        .eq("identity_type", session.identity_type)
        .eq("identity_key", session.identity_key)
        .maybeSingle();

    if (!total) return;

    const nowIso = now.toISOString();
    const lastSeen = total.last_seen_at ? new Date(total.last_seen_at) : now;
    const deltaMinutes = Math.max(0, minutesBetween(lastSeen, now));

    await supabaseAdmin
        .from("server_player_totals")
        .update({
            total_minutes: Number(total.total_minutes || 0) + deltaMinutes,
            last_seen_at: nowIso,
            updated_at: nowIso
        })
        .eq("id", total.id);
}

function getMapName(attributes: any) {
    const details = attributes.details || {};

    return (
        details.map ||
        details.Map ||
        details.mapName ||
        details.world ||
        attributes.map ||
        "Mapa desconocido"
    );
}

function normalizeName(value: string) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function isWeakName(value: string) {
    const normalized = normalizeName(value);

    return [
        "",
        "?",
        "123",
        "human",
        "survivor",
        "player",
        "unknown",
        "desconocido"
    ].includes(normalized);
}

function minutesBetween(start: Date, end: Date) {
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
}

async function safeReadJson(req: Request) {
    try {
        return await req.json();
    } catch {
        return {};
    }
}

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
        }
    });
}