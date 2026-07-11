import { supabase } from "../config/supabase";

export async function getActivityServers() {
    return await supabase
        .from("monitored_servers")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
}

export async function getServerActivitySessions(serverId, days = 7) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - Number(days));

    return await supabase
        .from("server_player_sessions")
        .select(`
            id,
            server_id,
            identity_type,
            identity_key,
            detected_name,
            battlemetrics_name,
            started_at,
            last_seen_at,
            ended_at,
            minutes_online,
            is_active,
            created_at
        `)
        .eq("server_id", serverId)
        .gte("started_at", fromDate.toISOString())
        .order("started_at", { ascending: false })
        .limit(300);
}

export async function getServerActivityAliases(serverId) {
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
            alert_enabled
        `)
        .eq("server_id", serverId);
}