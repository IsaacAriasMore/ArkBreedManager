import { Layout } from "../components/layout/Layout";
import { AppStore } from "../stores/appStore";
import { formatMinutes, formatServerAddress } from "../services/serverMonitorService";
import {
    getActivityServers,
    getServerActivityAliases,
    getServerActivitySessions
} from "../services/serverActivityService";

let selectedActivityServerId = localStorage.getItem("selectedActivityServerId") || null;
let activityDays = Number(localStorage.getItem("serverActivityDays") || 7);
let activityTab = localStorage.getItem("serverActivityTab") || "summary";
let activitySearch = localStorage.getItem("serverActivitySearch") || "";

export async function ServerActivityPage() {
    const { data: servers, error } = await getActivityServers();

    if (error) {
        return Layout(`
            <div class="page-header">
                <h1>Actividad Server</h1>
                <p>No se pudieron cargar los servidores.</p>
            </div>
        `);
    }

    const serverList = servers || [];

    if (!selectedActivityServerId && serverList.length > 0) {
        selectedActivityServerId = serverList[0].id;
        localStorage.setItem("selectedActivityServerId", selectedActivityServerId);
    }

    const selectedServer =
        serverList.find(server => server.id === selectedActivityServerId) ||
        serverList[0] ||
        null;

    if (selectedServer) {
        selectedActivityServerId = selectedServer.id;
        localStorage.setItem("selectedActivityServerId", selectedActivityServerId);
    }

    const sessionsResult = selectedServer
        ? await getServerActivitySessions(selectedServer.id, activityDays)
        : { data: [] };

    const aliasesResult = selectedServer
        ? await getServerActivityAliases(selectedServer.id)
        : { data: [] };

    const aliasMap = createAliasMap(aliasesResult.data || []);
    const allSessions = applyAliasesToSessions(sessionsResult.data || [], aliasMap);
    const sessions = filterSessionsBySearch(allSessions, activitySearch);

    const insights = buildActivityInsights(sessions);
    const players = buildPlayerSummary(sessions);

    setTimeout(() => {
        initServerActivityEvents();
    });

    return Layout(`
        <div class="page-header server-activity-header compact">
            <div>
                <h1>Actividad Server</h1>
                <p>Resumen, patrones e historial de conexión por mapa.</p>
            </div>

            <button id="refreshActivityBtn" class="secondary-action-btn">
                Actualizar
            </button>
        </div>

        ${renderActivityControls(serverList)}

        ${selectedServer ? renderActivityContent(selectedServer, sessions, insights, players) : renderEmptyState()}
    `);
}

function renderActivityControls(servers) {
    return `
        <section class="activity-controls-card">
            <div class="activity-control-group wide">
                <label>Servidor</label>
                <select id="activityServerSelect">
                    ${servers.map(server => `
                        <option value="${server.id}" ${server.id === selectedActivityServerId ? "selected" : ""}>
                            ${escapeHtml(server.server_name || server.name)} — ${escapeHtml(server.map_name || "Mapa pendiente")}
                        </option>
                    `).join("")}
                </select>
            </div>

            <div class="activity-control-group">
                <label>Rango</label>
                <select id="activityDaysFilter">
                    <option value="1" ${activityDays === 1 ? "selected" : ""}>24h</option>
                    <option value="3" ${activityDays === 3 ? "selected" : ""}>3 días</option>
                    <option value="7" ${activityDays === 7 ? "selected" : ""}>7 días</option>
                    <option value="14" ${activityDays === 14 ? "selected" : ""}>14 días</option>
                    <option value="30" ${activityDays === 30 ? "selected" : ""}>30 días</option>
                </select>
            </div>

            <form id="activitySearchForm" class="activity-search-form">
                <label>Buscar</label>
                <div>
                    <input
                        id="activitySearchInput"
                        type="search"
                        placeholder="Alias, nombre ARK o BattleMetrics..."
                        value="${escapeHtml(activitySearch)}"
                    >

                    <button type="submit">Buscar</button>

                    ${activitySearch ? `
                        <button type="button" id="clearActivitySearchBtn" class="ghost-btn">
                            Limpiar
                        </button>
                    ` : ""}
                </div>
            </form>
        </section>
    `;
}

function renderActivityContent(server, sessions, insights, players) {
    return `
        <section class="activity-selected-card">
            <div>
                <span>Servidor seleccionado</span>
                <h2>${escapeHtml(server.server_name || server.name)}</h2>
                <p>${escapeHtml(formatServerAddress(server))}</p>
            </div>

            <div class="activity-selected-meta">
                <span>Mapa: <strong>${escapeHtml(server.map_name || "Pendiente")}</strong></span>
                <span>Online: <strong>${server.current_players || 0} / ${server.max_players || "?"}</strong></span>
                <span>Actualizado: <strong>${escapeHtml(formatDateTime(server.last_synced_at))}</strong></span>
            </div>
        </section>

        ${renderCompactStats(insights)}

        ${renderActivityTabs()}

        <section class="activity-tab-panel">
            ${renderActiveTabContent(sessions, insights, players)}
        </section>
    `;
}

function renderCompactStats(insights) {
    return `
        <section class="activity-compact-stats">
            <div>
                <span>Sesiones</span>
                <strong>${insights.totalSessions}</strong>
            </div>

            <div>
                <span>Jugadores</span>
                <strong>${insights.uniquePlayers}</strong>
            </div>

            <div>
                <span>Tiempo total</span>
                <strong>${formatMinutes(insights.totalMinutes)}</strong>
            </div>

            <div>
                <span>Hora común</span>
                <strong>${insights.topHourLabel}</strong>
            </div>

            <div>
                <span>Día activo</span>
                <strong>${insights.topDayLabel}</strong>
            </div>
        </section>
    `;
}

function renderActivityTabs() {
    const tabs = [
        { id: "summary", label: "Resumen" },
        { id: "patterns", label: "Patrones" },
        { id: "history", label: "Historial" },
        { id: "players", label: "Jugadores" }
    ];

    return `
        <nav class="activity-tabs">
            ${tabs.map(tab => `
                <button
                    class="${activityTab === tab.id ? "active" : ""}"
                    data-activity-tab="${tab.id}"
                >
                    ${tab.label}
                </button>
            `).join("")}
        </nav>
    `;
}

function renderActiveTabContent(sessions, insights, players) {
    if (activityTab === "patterns") {
        return renderPatternsTab(insights);
    }

    if (activityTab === "history") {
        return renderHistoryTab(sessions);
    }

    if (activityTab === "players") {
        return renderPlayersTab(players);
    }

    return renderSummaryTab(insights, players);
}

function renderSummaryTab(insights, players) {
    const topPlayers = players.slice(0, 5);
    const importantPatterns = insights.patterns.slice(0, 3);

    return `
        <div class="activity-summary-grid">
            <section class="activity-panel clean">
                <div class="section-title-row">
                    <div>
                        <h2>Resumen rápido</h2>
                        <p>Vista limpia del movimiento reciente.</p>
                    </div>
                </div>

                <div class="summary-list">
                    <article>
                        <span>Promedio por sesión</span>
                        <strong>${formatMinutes(insights.averageSessionMinutes)}</strong>
                    </article>

                    <article>
                        <span>Sesiones nocturnas</span>
                        <strong>${insights.nightSessions}</strong>
                    </article>

                    <article>
                        <span>Sesiones activas</span>
                        <strong>${insights.activeSessions}</strong>
                    </article>

                    <article>
                        <span>Mayor duración</span>
                        <strong>${formatMinutes(insights.longestSessionMinutes)}</strong>
                    </article>
                </div>
            </section>

            <section class="activity-panel clean">
                <div class="section-title-row">
                    <div>
                        <h2>Top jugadores</h2>
                        <p>Más tiempo acumulado en este rango.</p>
                    </div>
                </div>

                ${topPlayers.length === 0 ? `
                    <div class="activity-empty compact">Sin jugadores en este rango.</div>
                ` : `
                    <div class="top-player-list">
                        ${topPlayers.map((player, index) => `
                            <article>
                                <strong>${index + 1}. ${escapeHtml(player.name)}</strong>
                                <span>${formatMinutes(player.totalMinutes)} · ${player.sessions} sesiones</span>
                            </article>
                        `).join("")}
                    </div>
                `}
            </section>
        </div>

        <section class="activity-panel clean">
            <div class="section-title-row">
                <div>
                    <h2>Patrones destacados</h2>
                    <p>Solo los más importantes para no cargar la pantalla.</p>
                </div>
            </div>

            ${importantPatterns.length === 0 ? `
                <div class="activity-empty compact">Aún no hay suficiente historial para detectar patrones.</div>
            ` : `
                <div class="smart-patterns-list compact">
                    ${importantPatterns.map(pattern => renderPatternCard(pattern)).join("")}
                </div>
            `}
        </section>
    `;
}

function renderPatternsTab(insights) {
    return `
        <section class="activity-panel clean">
            <div class="section-title-row">
                <div>
                    <h2>Patrones inteligentes</h2>
                    <p>Análisis automático de horarios, presencia y comportamiento.</p>
                </div>
            </div>

            ${insights.patterns.length === 0 ? `
                <div class="activity-empty compact">
                    Aún no hay suficiente historial para detectar patrones.
                </div>
            ` : `
                <div class="smart-patterns-list">
                    ${insights.patterns.map(pattern => renderPatternCard(pattern)).join("")}
                </div>
            `}
        </section>
    `;
}

function renderPatternCard(pattern) {
    return `
        <article class="smart-pattern-card ${pattern.type}">
            <strong>${escapeHtml(pattern.title)}</strong>
            <p>${escapeHtml(pattern.text)}</p>
        </article>
    `;
}

function renderHistoryTab(sessions) {
    return `
        <section class="activity-panel clean">
            <div class="section-title-row">
                <div>
                    <h2>Historial de sesiones</h2>
                    <p>Entradas, salidas y duración detectada.</p>
                </div>

                <span>${sessions.length}</span>
            </div>

            ${sessions.length === 0 ? `
                <div class="activity-empty compact">No hay sesiones en este rango.</div>
            ` : renderSessionsList(sessions)}
        </section>
    `;
}

function renderPlayersTab(players) {
    return `
        <section class="activity-panel clean">
            <div class="section-title-row">
                <div>
                    <h2>Jugadores</h2>
                    <p>Ranking compacto por tiempo y frecuencia.</p>
                </div>

                <span>${players.length}</span>
            </div>

            ${players.length === 0 ? `
                <div class="activity-empty compact">No hay jugadores en este rango.</div>
            ` : `
                <div class="player-summary-list">
                    ${players.map(player => `
                        <article class="player-summary-item">
                            <div>
                                <strong>${escapeHtml(player.name)}</strong>
                                <span>${escapeHtml(player.detectedName)} • ${escapeHtml(player.battlemetricsName)}</span>
                            </div>

                            <div class="player-summary-meta">
                                ${renderThreatPill(player.threatLevel)}
                                <span>${formatMinutes(player.totalMinutes)}</span>
                                <span>${player.sessions} sesiones</span>
                                <span>Última vez: ${escapeHtml(formatDateTime(player.lastSeenAt))}</span>
                            </div>
                        </article>
                    `).join("")}
                </div>
            `}
        </section>
    `;
}

function renderSessionsList(sessions) {
    return `
        <div class="session-list">
            ${sessions.map(session => `
                <article class="session-item">
                    <div class="session-player">
                        <strong>${escapeHtml(getPlayerName(session))}</strong>
                        <span>${escapeHtml(session.detected_name || "Desconocido")} • ${escapeHtml(session.battlemetrics_name || "Desconocido")}</span>
                    </div>

                    <div class="session-meta">
                        ${renderThreatPill(session.threat_level)}
                        <span>Entró: ${escapeHtml(formatDateTime(session.started_at))}</span>
                        <span>${session.ended_at ? `Salió: ${escapeHtml(formatDateTime(session.ended_at))}` : "Online ahora"}</span>
                        <strong>${formatMinutes(getSessionMinutes(session))}</strong>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

function renderEmptyState() {
    return `
        <section class="activity-panel clean">
            <div class="activity-empty compact">
                Agrega un servidor en Monitor Server para ver su actividad.
            </div>
        </section>
    `;
}

function createAliasMap(aliases) {
    const map = new Map();

    aliases.forEach(alias => {
        map.set(`${alias.identity_type}:${alias.identity_key}`, alias);
    });

    return map;
}

function applyAliasesToSessions(sessions, aliasMap) {
    return sessions.map(session => {
        const alias = aliasMap.get(`${session.identity_type}:${session.identity_key}`);

        return {
            ...session,
            alias: alias?.alias || null,
            notes: alias?.notes || null,
            threat_level: alias?.threat_level || "known",
            alert_enabled: Boolean(alias?.alert_enabled)
        };
    });
}

function filterSessionsBySearch(sessions, searchText) {
    const query = String(searchText || "").trim().toLowerCase();

    if (!query) {
        return sessions;
    }

    return sessions.filter(session => {
        return [
            session.alias,
            session.detected_name,
            session.battlemetrics_name,
            session.notes,
            session.identity_key
        ]
            .filter(Boolean)
            .some(value => String(value).toLowerCase().includes(query));
    });
}

function buildActivityInsights(sessions) {
    const totalSessions = sessions.length;
    const uniquePlayersSet = new Set();
    const hourMap = new Map();
    const dayMap = new Map();
    const playerMinutes = new Map();

    let totalMinutes = 0;
    let nightSessions = 0;
    let enemySessions = 0;
    let activeSessions = 0;
    let longestSessionMinutes = 0;

    sessions.forEach(session => {
        const key = `${session.identity_type}:${session.identity_key}`;
        uniquePlayersSet.add(key);

        const minutes = getSessionMinutes(session);
        totalMinutes += minutes;
        longestSessionMinutes = Math.max(longestSessionMinutes, minutes);

        const startedAt = new Date(session.started_at);
        const hour = startedAt.getHours();
        const day = startedAt.getDay();

        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
        dayMap.set(day, (dayMap.get(day) || 0) + minutes);
        playerMinutes.set(key, (playerMinutes.get(key) || 0) + minutes);

        if (hour >= 0 && hour < 8) {
            nightSessions++;
        }

        if (session.threat_level === "enemy") {
            enemySessions++;
        }

        if (session.is_active) {
            activeSessions++;
        }
    });

    const topHour = getTopMapKey(hourMap);
    const topDay = getTopMapKey(dayMap);
    const averageSessionMinutes = totalSessions > 0
        ? Math.round(totalMinutes / totalSessions)
        : 0;

    const topPlayer = getTopPlayerByMinutes(sessions, playerMinutes);

    const patterns = buildPatterns({
        totalSessions,
        totalMinutes,
        averageSessionMinutes,
        nightSessions,
        enemySessions,
        topHour,
        topDay,
        topPlayer,
        uniquePlayers: uniquePlayersSet.size,
        activeSessions,
        longestSessionMinutes
    });

    return {
        totalSessions,
        uniquePlayers: uniquePlayersSet.size,
        totalMinutes,
        averageSessionMinutes,
        nightSessions,
        enemySessions,
        activeSessions,
        longestSessionMinutes,
        topHour,
        topHourLabel: topHour === null ? "Sin datos" : `${String(topHour).padStart(2, "0")}:00`,
        topDay,
        topDayLabel: topDay === null ? "Sin datos" : getDayName(topDay),
        patterns
    };
}

function buildPatterns({
    totalSessions,
    totalMinutes,
    averageSessionMinutes,
    nightSessions,
    enemySessions,
    topHour,
    topDay,
    topPlayer,
    uniquePlayers,
    activeSessions,
    longestSessionMinutes
}) {
    const patterns = [];

    if (totalSessions === 0) {
        return patterns;
    }

    if (topHour !== null) {
        patterns.push({
            type: "info",
            title: "Hora común de conexión",
            text: `La mayor cantidad de entradas ocurre cerca de las ${String(topHour).padStart(2, "0")}:00.`
        });
    }

    if (topDay !== null) {
        patterns.push({
            type: "info",
            title: "Día más activo",
            text: `${getDayName(topDay)} concentra más tiempo conectado en este rango.`
        });
    }

    if (nightSessions >= Math.max(2, Math.ceil(totalSessions * 0.35))) {
        patterns.push({
            type: "warning",
            title: "Actividad nocturna relevante",
            text: `${nightSessions} sesiones empezaron entre 12:00 a.m. y 8:00 a.m.`
        });
    }

    if (enemySessions > 0) {
        patterns.push({
            type: "danger",
            title: "Jugadores marcados como enemigos",
            text: `Se detectaron ${enemySessions} sesiones de jugadores marcados como enemigos.`
        });
    }

    if (topPlayer) {
        patterns.push({
            type: "info",
            title: "Jugador con más tiempo",
            text: `${topPlayer.name} acumula ${formatMinutes(topPlayer.minutes)} en este rango.`
        });
    }

    if (averageSessionMinutes >= 180) {
        patterns.push({
            type: "warning",
            title: "Sesiones largas",
            text: `El promedio por sesión es de ${formatMinutes(averageSessionMinutes)}. Puede ser farmeo, vigilancia o preparación.`
        });
    }

    if (longestSessionMinutes >= 240) {
        patterns.push({
            type: "warning",
            title: "Sesión muy larga detectada",
            text: `La sesión más larga registrada fue de ${formatMinutes(longestSessionMinutes)}.`
        });
    }

    if (activeSessions > 0) {
        patterns.push({
            type: "info",
            title: "Actividad actual",
            text: `${activeSessions} sesiones siguen activas en este momento.`
        });
    }

    if (uniquePlayers >= 10) {
        patterns.push({
            type: "info",
            title: "Mapa con bastante movimiento",
            text: `Se detectaron ${uniquePlayers} jugadores únicos en el rango seleccionado.`
        });
    }

    if (totalMinutes >= 720) {
        patterns.push({
            type: "warning",
            title: "Alta presencia acumulada",
            text: `El servidor acumula ${formatMinutes(totalMinutes)} de actividad en el rango seleccionado.`
        });
    }

    return patterns;
}

function buildPlayerSummary(sessions) {
    const map = new Map();

    sessions.forEach(session => {
        const key = `${session.identity_type}:${session.identity_key}`;
        const current = map.get(key) || {
            key,
            name: getPlayerName(session),
            detectedName: session.detected_name || "Desconocido",
            battlemetricsName: session.battlemetrics_name || "Desconocido",
            threatLevel: session.threat_level || "known",
            totalMinutes: 0,
            sessions: 0,
            lastSeenAt: null
        };

        current.name = getPlayerName(session);
        current.detectedName = session.detected_name || current.detectedName;
        current.battlemetricsName = session.battlemetrics_name || current.battlemetricsName;
        current.threatLevel = session.threat_level || current.threatLevel;
        current.totalMinutes += getSessionMinutes(session);
        current.sessions += 1;

        const lastSeen = session.ended_at || session.last_seen_at || session.started_at;

        if (!current.lastSeenAt || new Date(lastSeen) > new Date(current.lastSeenAt)) {
            current.lastSeenAt = lastSeen;
        }

        map.set(key, current);
    });

    return [...map.values()].sort((a, b) => {
        return Number(b.totalMinutes || 0) - Number(a.totalMinutes || 0);
    });
}

function getTopPlayerByMinutes(sessions, playerMinutes) {
    if (playerMinutes.size === 0) return null;

    let topKey = null;
    let topMinutes = 0;

    playerMinutes.forEach((minutes, key) => {
        if (minutes > topMinutes) {
            topKey = key;
            topMinutes = minutes;
        }
    });

    const session = sessions.find(item => {
        return `${item.identity_type}:${item.identity_key}` === topKey;
    });

    if (!session) return null;

    return {
        name: getPlayerName(session),
        minutes: topMinutes
    };
}

function getTopMapKey(map) {
    if (!map || map.size === 0) return null;

    let topKey = null;
    let topValue = -1;

    map.forEach((value, key) => {
        if (value > topValue) {
            topKey = key;
            topValue = value;
        }
    });

    return topKey;
}

function getSessionMinutes(session) {
    if (Number(session.minutes_online || 0) > 0) {
        return Number(session.minutes_online || 0);
    }

    const start = new Date(session.started_at);
    const end = session.ended_at
        ? new Date(session.ended_at)
        : new Date(session.last_seen_at || new Date());

    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
}

function getPlayerName(session) {
    return session.alias ||
        session.battlemetrics_name ||
        session.detected_name ||
        "Desconocido";
}

function renderThreatPill(threatLevel) {
    const labels = {
        known: "Conocido",
        suspect: "Sospechoso",
        enemy: "Enemigo",
        ally: "Aliado"
    };

    const className = {
        known: "known",
        suspect: "suspect",
        enemy: "enemy",
        ally: "ally"
    }[threatLevel] || "known";

    return `
        <span class="activity-threat ${className}">
            ${labels[threatLevel] || "Conocido"}
        </span>
    `;
}

function formatDateTime(value) {
    if (!value) return "Pendiente";

    return new Date(value).toLocaleString("es-CR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getDayName(day) {
    const days = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado"
    ];

    return days[day] || "Sin datos";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function initServerActivityEvents() {
    document.querySelector("#refreshActivityBtn")?.addEventListener("click", () => {
        AppStore.setPage("serverActivity");
    });

    document.querySelector("#activityServerSelect")?.addEventListener("change", event => {
        selectedActivityServerId = event.target.value;
        localStorage.setItem("selectedActivityServerId", selectedActivityServerId);
        AppStore.setPage("serverActivity");
    });

    document.querySelector("#activityDaysFilter")?.addEventListener("change", event => {
        activityDays = Number(event.target.value);
        localStorage.setItem("serverActivityDays", String(activityDays));
        AppStore.setPage("serverActivity");
    });

    document.querySelector("#activitySearchForm")?.addEventListener("submit", event => {
        event.preventDefault();

        activitySearch = document.querySelector("#activitySearchInput")?.value || "";
        localStorage.setItem("serverActivitySearch", activitySearch);

        AppStore.setPage("serverActivity");
    });

    document.querySelector("#clearActivitySearchBtn")?.addEventListener("click", () => {
        activitySearch = "";
        localStorage.removeItem("serverActivitySearch");

        AppStore.setPage("serverActivity");
    });

    document.querySelectorAll("[data-activity-tab]").forEach(button => {
        button.addEventListener("click", () => {
            activityTab = button.dataset.activityTab;
            localStorage.setItem("serverActivityTab", activityTab);

            AppStore.setPage("serverActivity");
        });
    });
}