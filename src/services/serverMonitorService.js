import { supabase } from "../config/supabase";

export function parseServerAddress(address) {
    const cleanAddress = String(address || "").trim();

    if (!cleanAddress.includes(":")) {
        throw new Error("Debes escribir la IP con puerto. Ejemplo: 144.31.119.69:6894");
    }

    const [ip, portText] = cleanAddress.split(":");
    const port = Number(portText);

    if (!ip || !Number.isInteger(port) || port <= 0 || port > 65535) {
        throw new Error("IP o puerto inválido.");
    }

    return {
        ip: ip.trim(),
        port
    };
}

export function formatServerAddress(server) {
    return `${server.ip}:${server.port}`;
}

export function formatMinutes(totalMinutes = 0) {
    const safeMinutes = Math.max(0, Number(totalMinutes) || 0);
    const hours = Math.floor(safeMinutes / 60);
    const minutes = safeMinutes % 60;

    if (hours <= 0) {
        return `${minutes} min`;
    }

    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export async function getMonitoredServers() {
    return await supabase
        .from("monitored_servers")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
}

export async function createMonitoredServer({
    name,
    address,
    queryPort,
    directQueryEnabled = true
}) {
    const { ip, port } = parseServerAddress(address);
    const normalizedQueryPort = normalizeOptionalPort(queryPort);

    return await supabase
        .from("monitored_servers")
        .insert({
            name: name.trim(),
            ip,
            port,
            query_port: normalizedQueryPort,
            direct_query_enabled: Boolean(directQueryEnabled)
        })
        .select()
        .single();
}

export async function deleteMonitoredServer(id) {
    return await supabase
        .from("monitored_servers")
        .update({ is_active: false })
        .eq("id", id);
}

export async function updateServerAlertSettings({
    serverId,
    alertsEnabled,
    alertFromTime = "00:00",
    alertToTime = "08:00"
}) {
    return await supabase
        .from("monitored_servers")
        .update({
            alerts_enabled: Boolean(alertsEnabled),
            alert_from_time: alertFromTime,
            alert_to_time: alertToTime
        })
        .eq("id", serverId)
        .select()
        .single();
}

export async function getServerTopPlayers(serverId, limit = 10) {
    return await supabase
        .from("server_player_totals")
        .select(`
            id,
            identity_type,
            identity_key,
            detected_name,
            battlemetrics_name,
            total_minutes,
            last_seen_at
        `)
        .eq("server_id", serverId)
        .order("total_minutes", { ascending: false })
        .limit(limit);
}

export async function getServerActiveSessions(serverId) {
    return await supabase
        .from("server_player_sessions")
        .select(`
            id,
            identity_type,
            identity_key,
            detected_name,
            battlemetrics_name,
            started_at,
            last_seen_at,
            minutes_online,
            is_active
        `)
        .eq("server_id", serverId)
        .eq("is_active", true)
        .order("minutes_online", { ascending: false });
}

export async function getServerPlayerAliases(serverId) {
    return await supabase
        .from("server_player_aliases")
        .select(`
            id,
            server_id,
            identity_type,
            identity_key,
            detected_name,
            battlemetrics_name,
            alias,
            notes,
            threat_level,
            alert_enabled,
            alert_channel,
            alert_cooldown_minutes,
            last_alert_sent_at,
            updated_at
        `)
        .eq("server_id", serverId);
}

export async function saveServerPlayerAlias({
    serverId,
    identityType,
    identityKey,
    detectedName,
    battlemetricsName,
    alias,
    notes,
    threatLevel,
    alertEnabled,
    alertChannel,
    alertCooldownMinutes
}) {
    return await supabase
        .from("server_player_aliases")
        .upsert(
            {
                server_id: serverId,
                identity_type: identityType,
                identity_key: identityKey,
                detected_name: detectedName,
                battlemetrics_name: battlemetricsName,
                alias: alias?.trim() || null,
                notes: notes?.trim() || null,
                threat_level: threatLevel || "known",
                alert_enabled: Boolean(alertEnabled),
                alert_channel: alertChannel || "discord",
                alert_cooldown_minutes: Number(alertCooldownMinutes) || 30
            },
            {
                onConflict: "server_id,identity_type,identity_key"
            }
        )
        .select()
        .single();
}

export async function getServerRecentAlerts(serverId, limit = 8) {
    return await supabase
        .from("server_player_alerts")
        .select(`
            id,
            server_id,
            identity_type,
            identity_key,
            detected_name,
            battlemetrics_name,
            alias,
            threat_level,
            channel,
            message,
            sent_at,
            created_at
        `)
        .eq("server_id", serverId)
        .order("sent_at", { ascending: false })
        .limit(limit);
}

export async function syncBattlemetricsServer(serverId) {
    try {
        const accessToken = await getFreshAccessToken();

        const result = await supabase.functions.invoke("sync-battlemetrics-server", {
            body: {
                serverId
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (result.error) {
            return {
                data: result.data,
                error: await normalizeFunctionError(result.error)
            };
        }

        return result;
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error
                ? error
                : new Error("No se pudo sincronizar el servidor.")
        };
    }
}

export async function updateServerQuerySettings({
    serverId,
    queryPort,
    directQueryEnabled
}) {
    const normalizedQueryPort = normalizeOptionalPort(queryPort);

    return await supabase
        .from("monitored_servers")
        .update({
            query_port: normalizedQueryPort,
            direct_query_enabled: Boolean(directQueryEnabled)
        })
        .eq("id", serverId)
        .select()
        .single();
}

export async function testServerDirectQuery({ serverId, queryPort }) {
    try {
        const normalizedQueryPort = normalizeOptionalPort(queryPort);

        if (!normalizedQueryPort) {
            return {
                data: null,
                error: new Error("Escribe un query port válido antes de probar.")
            };
        }

        const accessToken = await getFreshAccessToken();

        const result = await supabase.functions.invoke("sync-battlemetrics-server", {
            body: {
                action: "testDirectQuery",
                serverId,
                queryPort: normalizedQueryPort
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (result.error) {
            return {
                data: result.data,
                error: await normalizeFunctionError(result.error)
            };
        }

        return result;
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error
                ? error
                : new Error("No se pudo probar el query directo.")
        };
    }
}

async function getFreshAccessToken() {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session) {
        throw error || new Error("No hay sesión activa. Cierra sesión e inicia sesión otra vez.");
    }

    let session = data.session;

    const expiresAtMs = session.expires_at
        ? session.expires_at * 1000
        : 0;

    const expiresSoon = !expiresAtMs || expiresAtMs - Date.now() < 60_000;

    if (expiresSoon) {
        const { data: refreshedData, error: refreshError } =
            await supabase.auth.refreshSession();

        if (refreshError || !refreshedData?.session) {
            throw refreshError || new Error("La sesión expiró. Cierra sesión e inicia sesión otra vez.");
        }

        session = refreshedData.session;
    }

    if (!session.access_token) {
        throw new Error("No se pudo obtener token de sesión.");
    }

    return session.access_token;
}

async function normalizeFunctionError(error) {
    let message = error?.message || "No se pudo sincronizar con BattleMetrics.";

    try {
        if (error?.context) {
            const response = typeof error.context.clone === "function"
                ? error.context.clone()
                : error.context;

            const body = await response.json();

            message =
                body?.error ||
                body?.message ||
                body?.details ||
                message;
        }
    } catch {
        // Si no se puede leer el JSON del error, dejamos el mensaje original.
    }

    return new Error(message);
}

function normalizeOptionalPort(value) {
    if (value === null || value === undefined || String(value).trim() === "") {
        return null;
    }

    const port = Number(value);

    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        throw new Error("Query port inválido.");
    }

    return port;
}