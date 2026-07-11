import { Layout } from "../components/layout/Layout";
import { AppStore } from "../stores/appStore";
import { showError, showSuccess, showWarning } from "../utils/feedback";
import {
    createMonitoredServer,
    deleteMonitoredServer,
    formatMinutes,
    formatServerAddress,
    getMonitoredServers,
    getServerActiveSessions,
    getServerPlayerAliases,
    getServerRecentAlerts,
    getServerTopPlayers,
    saveServerPlayerAlias,
    syncBattlemetricsServer,
    updateServerAlertSettings
} from "../services/serverMonitorService";

let selectedServerId = localStorage.getItem("selectedMonitorServerId") || null;
let topLimit = Number(localStorage.getItem("serverMonitorTopLimit") || 10);
let minHoursFilter = Number(localStorage.getItem("serverMonitorMinHours") || 0);
let serverMonitorSearch = localStorage.getItem("serverMonitorSearch") || "";
let addServerExpanded = localStorage.getItem("addServerExpanded") === "true";
let editingAliasPlayer = null;

export async function ServerMonitorPage() {
    const { data: servers, error } = await getMonitoredServers();

    if (error) {
        return Layout(`
            <div class="page-header">
                <h1>Monitor Server</h1>
                <p>No se pudieron cargar los servidores.</p>
            </div>
        `);
    }

    const serverList = servers || [];
    const filteredServerList = filterServersBySearch(serverList, serverMonitorSearch);
const showAddServerForm = AppStore.isAdmin() && (addServerExpanded || serverList.length === 0);

    if (!selectedServerId && serverList.length > 0) {
        selectedServerId = serverList[0].id;
        localStorage.setItem("selectedMonitorServerId", selectedServerId);
    }

    const selectedServer = serverList.find(server => server.id === selectedServerId) || serverList[0] || null;

    if (selectedServer) {
        selectedServerId = selectedServer.id;
        localStorage.setItem("selectedMonitorServerId", selectedServerId);
    }

    const activeSessionsResult = selectedServer
        ? await getServerActiveSessions(selectedServer.id)
        : { data: [] };

    const topPlayersResult = selectedServer
        ? await getServerTopPlayers(selectedServer.id, topLimit)
        : { data: [] };

    const aliasesResult = selectedServer
        ? await getServerPlayerAliases(selectedServer.id)
        : { data: [] };

    const recentAlertsResult = selectedServer
    ? await getServerRecentAlerts(selectedServer.id, 8)
    : { data: [] };

    const aliasMap = createAliasMap(aliasesResult.data || []);

    const activeSessions = applyAliases(activeSessionsResult.data || [], aliasMap);
    let topPlayers = applyAliases(topPlayersResult.data || [], aliasMap);

    const recentAlerts = recentAlertsResult.data || [];

    if (minHoursFilter > 0) {
        topPlayers = topPlayers.filter(player => player.total_minutes >= minHoursFilter * 60);
    }

    setTimeout(() => {
        initServerMonitorEvents();
    });

    return Layout(`
        <div class="page-header server-monitor-header">
            <div>
                <h1>Monitor Server</h1>
                <p>Agrega servidores ARK por IP, revisa jugadores online y guarda tiempo acumulado.</p>
            </div>

            <button id="refreshServerMonitorBtn" class="secondary-action-btn">
                Actualizar vista
            </button>
        </div>

       

        <section class="server-monitor-layout improved-monitor-layout">
    <aside class="server-list-card improved-server-list-card">
        <div class="section-title-row">
            <h2>Servidores</h2>
            <span>${serverList.length}</span>
        </div>

        <form id="serverSearchForm" class="server-search-form">
            <input
                id="serverSearchInput"
                type="search"
                placeholder="Buscar mapa, IP o nombre..."
                value="${escapeHtml(serverMonitorSearch)}"
            >

            <button type="submit">
                Buscar
            </button>
        </form>

        ${serverMonitorSearch ? `
            <button id="clearServerSearchBtn" class="clear-server-search-btn">
                Limpiar búsqueda
            </button>
        ` : ""}

        ${serverList.length === 0 ? `
            <div class="empty-monitor-box compact-empty">
                <strong>No hay servidores agregados.</strong>
                <p>Agrega una IP para empezar a monitorear.</p>
            </div>
        ` : filteredServerList.length === 0 ? `
            <div class="empty-monitor-box compact-empty">
                <strong>Sin resultados.</strong>
                <p>No hay servidores que coincidan con la búsqueda.</p>
            </div>
        ` : `
            <div class="server-list improved-server-list">
                ${filteredServerList.map(server => renderServerButton(server)).join("")}
            </div>
        `}
    </aside>

    <main class="server-monitor-main improved-server-monitor-main">
        ${AppStore.isAdmin() ? renderAddServerToolbar(showAddServerForm, serverList.length) : ""}

        ${showAddServerForm ? renderAddServerForm() : ""}

        ${selectedServer ? renderSelectedServer(selectedServer, activeSessions, topPlayers, recentAlerts) : renderEmptyState()}
    </main>
</section>

${editingAliasPlayer ? renderAliasModal(editingAliasPlayer) : ""}
    `);
}
function renderAddServerToolbar(showAddServerForm, serverCount) {
    if (serverCount === 0) {
        return "";
    }

    return `
        <section class="add-server-toolbar">
            <div>
                <strong>Agregar servidor</strong>
                <span>Guarda otra IP pública para monitorearla.</span>
            </div>

            <button id="toggleAddServerBtn" type="button">
                ${showAddServerForm ? "Ocultar formulario" : "Agregar IP"}
            </button>
        </section>
    `;
}
function renderAddServerForm() {
    return `
        <section class="server-form-card compact-add-server clean-add-server">
            <div class="compact-add-title">
                <strong>Agregar servidor</strong>
                <span>Guarda una IP pública para monitorearla.</span>
            </div>

            <form id="addServerForm" class="server-form compact-server-form">
                <div>
                    <label>Nombre interno</label>
                    <input
                        id="serverNameInput"
                        type="text"
                        placeholder="Ej: Fjordur PvP"
                        required
                    >
                </div>

                <div>
                    <label>IP pública + puerto</label>
                    <input
                        id="serverAddressInput"
                        type="text"
                        placeholder="Ej: 144.31.119.69:6894"
                        required
                    >
                </div>

                <button type="submit">
                    Guardar
                </button>
            </form>
        </section>
    `;
}

function renderServerButton(server) {
    const activeClass = server.id === selectedServerId ? "active" : "";
    const displayName = server.name || server.server_name || "Servidor sin nombre";

    return `
        <button class="server-list-item improved-server-item ${activeClass}" data-server-id="${server.id}">
            <strong>${escapeHtml(displayName)}</strong>
            <span>${escapeHtml(formatServerAddress(server))}</span>
            <small>${escapeHtml(server.map_name || "Mapa pendiente")}</small>
        </button>
    `;
}

function renderSelectedServer(server, activeSessions, topPlayers, recentAlerts) {
    const longestOnline = getLongestActivePlayer(activeSessions);
    const topAccumulated = topPlayers[0] || null;
    const overEightHoursCount = getOverHoursCount(topPlayers, 8);

    return `
        <section class="server-hero-card compact-server-hero">
            <div class="server-hero-main">
                <span class="server-label">Servidor seleccionado</span>

                <h2>${escapeHtml(server.server_name || server.name)}</h2>
                <p>${escapeHtml(formatServerAddress(server))}</p>

                <div class="server-meta-pills">
                <span>
    <small>Alertas</small>
    <strong>
        ${server.alerts_enabled
            ? `${server.alert_from_time?.slice(0, 5) || "00:00"} - ${server.alert_to_time?.slice(0, 5) || "08:00"}`
            : "OFF"
        }
    </strong>
</span>
                    <span>
                        <small>Mapa</small>
                        <strong>${escapeHtml(server.map_name || "Pendiente")}</strong>
                    </span>

                    <span>
                        <small>Online</small>
                        <strong>${server.current_players || activeSessions.length} / ${server.max_players || "?"}</strong>
                    </span>

                    <span>
                        <small>Actualizado</small>
                        <strong>${escapeHtml(formatDateTime(server.last_synced_at))}</strong>
                    </span>
                </div>
            </div>

            <div class="server-hero-actions">
            ${AppStore.isAdmin() ? `
    <button
        class="server-alert-toggle ${server.alerts_enabled ? "active" : ""}"
        data-toggle-server-alerts="${server.id}"
        data-alerts-enabled="${server.alerts_enabled ? "true" : "false"}"
    >
        ${server.alerts_enabled ? "Alertas ON" : "Alertas OFF"}
    </button>
` : ""}
                ${AppStore.isAdmin() ? `
                    
                    <button
                        class="danger-outline-btn"
                        data-delete-server-id="${server.id}"
                    >
                        Eliminar
                    </button>
                ` : ""}

                <button
                    class="primary-action-btn"
                    id="syncServerBtn"
                    data-server-id="${server.id}"
                >
                    Sincronizar
                </button>
            </div>
        </section>

        <section class="monitor-compact-insights">
            <div>
                <span>Más tiempo ahora</span>
                <strong>
                    ${longestOnline
                        ? `${escapeHtml(getPlayerPrimaryName(longestOnline))} · ${formatMinutes(longestOnline.minutes_online)}`
                        : "Sin datos"
                    }
                </strong>
            </div>

            <div>
                <span>Top acumulado</span>
                <strong>
                    ${topAccumulated
                        ? `${escapeHtml(getPlayerPrimaryName(topAccumulated))} · ${formatMinutes(topAccumulated.total_minutes)}`
                        : "Sin datos"
                    }
                </strong>
            </div>

            <div>
                <span>Jugadores +8h</span>
                <strong>${overEightHoursCount}</strong>
            </div>

            <div>
                <span>Identificación</span>
                <strong>${escapeHtml(getIdentificationSummary(activeSessions))}</strong>
            </div>
        </section>

        ${renderIdentificationNotice(activeSessions)}

${renderRecentAlertsPanel(recentAlerts)}

<section class="monitor-panel">
            <div class="section-title-row">
                <div>
                    <h2>Jugadores online ahora</h2>
                    <p>Solo aparecen jugadores activos en este momento.</p>
                </div>

                <span>${activeSessions.length}</span>
            </div>

            ${activeSessions.length === 0 ? `
                <div class="empty-monitor-box">
                    <strong>Sin jugadores detectados todavía.</strong>
                    <p>Presiona Sincronizar para consultar BattleMetrics.</p>
                </div>
            ` : renderOnlineTable(server.id, activeSessions)}
        </section>

        <section class="monitor-panel">
            <div class="section-title-row top-controls-row">
                <div>
                    <h2>Top jugadores por tiempo acumulado</h2>
                    <p>Ranking desde que agregaste este servidor.</p>
                </div>

                <div class="top-controls">
                    <button class="top-limit-btn ${topLimit === 10 ? "active" : ""}" data-top-limit="10">Top 10</button>
                    <button class="top-limit-btn ${topLimit === 15 ? "active" : ""}" data-top-limit="15">Top 15</button>

                    <select id="minHoursFilter">
                        <option value="0" ${minHoursFilter === 0 ? "selected" : ""}>Todos</option>
                        <option value="1" ${minHoursFilter === 1 ? "selected" : ""}>+1h</option>
                        <option value="4" ${minHoursFilter === 4 ? "selected" : ""}>+4h</option>
                        <option value="8" ${minHoursFilter === 8 ? "selected" : ""}>+8h</option>
                        <option value="12" ${minHoursFilter === 12 ? "selected" : ""}>+12h</option>
                    </select>
                </div>
            </div>

            ${topPlayers.length === 0 ? `
                <div class="empty-monitor-box">
                    <strong>Top vacío.</strong>
                    <p>Cuando empecemos a sincronizar, aquí aparecerán los que más tiempo pasan en el mapa.</p>
                </div>
            ` : renderTopTable(topPlayers)}
        </section>
    `;
}

function summaryCard(label, value) {
    return `
        <div class="server-summary-card">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(String(value))}</strong>
        </div>
    `;
}

function renderOnlineTable(serverId, players) {
    return `
        <div class="monitor-table-wrapper">
            <table class="monitor-table monitor-players-table">
                <thead>
                    <tr>
                        <th>Nombre en juego</th>
                        <th>Nombre BattleMetrics</th>
                        <th>Sobrenombre ArkBreed</th>
                        <th>Identificación</th>
                        <th>Tiempo actual</th>
                        <th>Acción</th>
                    </tr>
                </thead>

                <tbody>
                    ${players.map(player => `
                        <tr>
                            <td>
                                <strong>${escapeHtml(player.detected_name || "Desconocido")}</strong>
                                <small>ARK name</small>
                            </td>

                            <td>
                                <strong>${escapeHtml(player.battlemetrics_name || "Desconocido")}</strong>
                                <small>BattleMetrics</small>
                            </td>

                            <td class="alias-column">
                                ${player.alias ? `
                                    <strong>${escapeHtml(player.alias)}</strong>
                                    <small>${escapeHtml(getSubName(player))}</small>
                                ` : `
                                    <strong class="no-alias">Sin sobrenombre</strong>
                                    <small>${escapeHtml(getSubName(player))}</small>
                                `}

                                ${player.notes ? `<em>${escapeHtml(player.notes)}</em>` : ""}
                                ${renderPlayerAlertMiniStatus(player)}
                            </td>

                            <td>
                                ${renderIdentityBadge(player.identity_type)}
                            </td>

                            <td>
                                <strong>${formatMinutes(player.minutes_online)}</strong>
                            </td>

                            <td>
                                ${AppStore.isAdmin() ? `
                                    <button
                                        class="small-action-btn edit-alias-btn"
                                        data-player="${encodePlayerPayload(serverId, player)}"
                                    >
                                        Editar alias
                                    </button>
                                ` : `
                                    <button class="small-action-btn" disabled>
                                        Solo admin
                                    </button>
                                `}
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderTopTable(players) {
    return `
        <div class="monitor-table-wrapper">
            <table class="monitor-table monitor-top-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre en juego</th>
                        <th>Nombre BattleMetrics</th>
                        <th>Sobrenombre ArkBreed</th>
                        <th>Identificación</th>
                        <th>Tiempo total</th>
                    </tr>
                </thead>

                <tbody>
                    ${players.map((player, index) => `
                        <tr>
                            <td>
                                <strong class="rank-number">${index + 1}</strong>
                            </td>

                            <td>
                                <strong>${escapeHtml(player.detected_name || "Desconocido")}</strong>
                                <small>ARK name</small>
                            </td>

                            <td>
                                <strong>${escapeHtml(player.battlemetrics_name || "Desconocido")}</strong>
                                <small>BattleMetrics</small>
                            </td>

                            <td class="alias-column">
                                ${player.alias ? `
                                    <strong>${escapeHtml(player.alias)}</strong>
                                    <small>${escapeHtml(getSubName(player))}</small>
                                ` : `
                                    <strong class="no-alias">Sin sobrenombre</strong>
                                    <small>${escapeHtml(getSubName(player))}</small>
                                `}

                                ${player.notes ? `<em>${escapeHtml(player.notes)}</em>` : ""}
                                ${renderPlayerAlertMiniStatus(player)}
                            </td>

                            <td>
                                ${renderIdentityBadge(player.identity_type)}
                            </td>

                            <td>
                                <strong>${formatMinutes(player.total_minutes)}</strong>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderAliasModal(player) {
    return `
        <div class="alias-modal-backdrop">
            <div class="alias-modal">
                <div class="alias-modal-header">
                    <div>
                        <h2>Editar sobrenombre</h2>
                        <p>${escapeHtml(getSubName(player))}</p>
                    </div>

                    <button id="closeAliasModalBtn">×</button>
                </div>

                <div class="alias-warning ${player.identity_type === "battlemetrics_id" ? "verified" : ""}">
                    ${getAliasWarning(player.identity_type)}
                </div>

                <form id="aliasForm">
                    <input type="hidden" id="aliasServerId" value="${escapeHtml(player.serverId)}">
                    <input type="hidden" id="aliasIdentityType" value="${escapeHtml(player.identity_type)}">
                    <input type="hidden" id="aliasIdentityKey" value="${escapeHtml(player.identity_key)}">
                    <input type="hidden" id="aliasDetectedName" value="${escapeHtml(player.detected_name || "")}">
                    <input type="hidden" id="aliasBattlemetricsName" value="${escapeHtml(player.battlemetrics_name || "")}">

                    <div class="alias-form-grid">
                        <div>
                            <label>Nombre en juego</label>
                            <input value="${escapeHtml(player.detected_name || "")}" disabled>
                        </div>

                        <div>
                            <label>Nombre BattleMetrics</label>
                            <input value="${escapeHtml(player.battlemetrics_name || "")}" disabled>
                        </div>
                    </div>

                    <div>
                        <label>Sobrenombre ArkBreed</label>
                        <input
                            id="aliasInput"
                            type="text"
                            placeholder="Ej: Enemigo base norte"
                            value="${escapeHtml(player.alias || "")}"
                        >
                    </div>

                    <div class="alias-form-grid">
                        <div>
                            <label>Nivel del jugador</label>
                            <select id="aliasThreatLevel">
                                <option value="known" ${player.threat_level === "known" || !player.threat_level ? "selected" : ""}>Conocido</option>
                                <option value="suspect" ${player.threat_level === "suspect" ? "selected" : ""}>Sospechoso</option>
                                <option value="enemy" ${player.threat_level === "enemy" ? "selected" : ""}>Enemigo</option>
                                <option value="ally" ${player.threat_level === "ally" ? "selected" : ""}>Aliado</option>
                            </select>
                        </div>

                        <div>
                            <label>Canal de alerta</label>
                            <select id="aliasAlertChannel">
                                <option value="discord" ${player.alert_channel === "discord" || !player.alert_channel ? "selected" : ""}>Discord</option>
                                <option value="whatsapp" ${player.alert_channel === "whatsapp" ? "selected" : ""} disabled>WhatsApp próximamente</option>
                                <option value="both" ${player.alert_channel === "both" ? "selected" : ""} disabled>Ambos próximamente</option>
                            </select>
                        </div>
                    </div>

                    <label class="alias-checkbox-row">
                        <input
                            id="aliasAlertEnabled"
                            type="checkbox"
                            ${player.alert_enabled ? "checked" : ""}
                        >

                        <span>
                            Notificar si este jugador se une al mapa
                            <small>Usa el horario del servidor: 12:00 a.m. - 8:00 a.m. por defecto.</small>
                        </span>
                    </label>

                    <div>
                        <label>Cooldown de alerta</label>
                        <input
                            id="aliasAlertCooldown"
                            type="number"
                            min="5"
                            step="5"
                            value="${escapeHtml(player.alert_cooldown_minutes || 30)}"
                        >
                    </div>

                    <div>
                        <label>Notas</label>
                        <textarea
                            id="aliasNotesInput"
                            rows="4"
                            placeholder="Ej: entra de noche, vive cerca de lava..."
                        >${escapeHtml(player.notes || "")}</textarea>
                    </div>

                    <div class="alias-modal-actions">
                        <button type="button" id="cancelAliasBtn" class="secondary-action-btn">
                            Cancelar
                        </button>

                        <button type="submit" class="primary-action-btn">
                            Guardar sobrenombre
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
function renderPlayerAlertMiniStatus(player) {
    if (!player.alert_enabled) {
        return "";
    }

    return `
        <span class="player-alert-mini active">
            🔔 Notificación activa
        </span>
    `;
}

function renderRecentAlertsPanel(alerts) {
    return `
        <details class="recent-alerts-card">
            <summary>
                <div>
                    <strong>Últimas alertas Discord</strong>
                    <span>${alerts.length > 0 ? `${alerts.length} recientes` : "Sin alertas todavía"}</span>
                </div>

                <small>Ver alertas</small>
            </summary>

            ${alerts.length === 0 ? `
                <div class="recent-alerts-empty">
                    Aún no hay alertas enviadas para este servidor.
                </div>
            ` : `
                <div class="recent-alerts-list">
                    ${alerts.map(alert => `
                        <article class="recent-alert-item">
                            <div>
                                <strong>${escapeHtml(alert.alias || "Sin sobrenombre")}</strong>
                                <span>${escapeHtml(alert.detected_name || "Desconocido")} • ${escapeHtml(alert.battlemetrics_name || "Desconocido")}</span>
                            </div>

                            <div class="recent-alert-meta">
                                ${renderThreatPill(alert.threat_level)}
                                <span>${escapeHtml(alert.channel || "discord")}</span>
                                <time>${escapeHtml(formatDateTime(alert.sent_at))}</time>
                            </div>
                        </article>
                    `).join("")}
                </div>
            `}
        </details>
    `;
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
        <span class="threat-pill ${className}">
            ${labels[threatLevel] || "Conocido"}
        </span>
    `;
}

function renderIdentificationNotice(players) {
    if (!players || players.length === 0) {
        return "";
    }

    const nameOnlyCount = players.filter(player => player.identity_type === "name_only").length;
    const temporaryCount = players.filter(player => player.identity_type === "temporary_session").length;

    const hasWeakIdentification = temporaryCount > 0 || nameOnlyCount > 0;

    if (!hasWeakIdentification) {
        return "";
    }

    return `
        <section class="identity-notice compact warning">
            <strong>Identificación parcial</strong>
            <span>
                Algunos jugadores no tienen ID único. Los alias pueden depender del nombre visible o de la sesión actual.
            </span>
        </section>
    `;
}

function getLongestActivePlayer(players) {
    if (!players || players.length === 0) {
        return null;
    }

    return [...players].sort((a, b) => {
        return Number(b.minutes_online || 0) - Number(a.minutes_online || 0);
    })[0];
}

function getOverHoursCount(players, hours) {
    const minMinutes = hours * 60;

    return (players || []).filter(player => {
        return Number(player.total_minutes || 0) >= minMinutes;
    }).length;
}

function getPlayerPrimaryName(player) {
    return player?.alias ||
        player?.battlemetrics_name ||
        player?.detected_name ||
        "Desconocido";
}

function renderEmptyState() {
    return `
        <section class="monitor-panel">
            <div class="empty-monitor-box">
                <strong>Selecciona o agrega un servidor.</strong>
                <p>Cuando agregues una IP, aquí aparecerá el monitor.</p>
            </div>
        </section>
    `;
}

function renderIdentityBadge(identityType) {
    const labels = {
        battlemetrics_id: "ID único",
        steam_name_unique: "Nombre único",
        name_only: "Nombre visible",
        temporary_session: "Temporal"
    };

    const className = {
        battlemetrics_id: "verified",
        steam_name_unique: "partial",
        name_only: "warning",
        temporary_session: "danger"
    }[identityType] || "warning";

    return `
        <span class="identity-badge ${className}">
            ${labels[identityType] || "No verificado"}
        </span>
    `;
}

function getDisplayName(player) {
    return player.alias || player.battlemetrics_name || player.detected_name || "Desconocido";
}

function getSubName(player) {
    const detectedName = player.detected_name || "?";
    const battlemetricsName = player.battlemetrics_name || "?";

    if (detectedName === battlemetricsName) {
        return detectedName;
    }

    return `${detectedName} • ${battlemetricsName}`;
}

function getAliasWarning(identityType) {
    if (identityType === "battlemetrics_id") {
        return "Identificación verificada por ID único. Este sobrenombre debería aplicarse correctamente cuando vuelva a conectarse.";
    }

    if (identityType === "steam_name_unique") {
        return "No hay ID único, pero el nombre parece único. El sobrenombre se asociará a ese nombre.";
    }

    if (identityType === "name_only") {
        return "No hay ID único. Este sobrenombre se asociará al nombre visible y puede aplicarse a otros jugadores con el mismo nombre.";
    }

    return "Identificación temporal. Este sobrenombre puede no reconocer al mismo jugador si se desconecta y vuelve a entrar.";
}

function getIdentificationSummary(players) {
    if (!players || players.length === 0) return "Pendiente";

    const hasVerified = players.some(player => player.identity_type === "battlemetrics_id");
    const hasTemporary = players.some(player => player.identity_type === "temporary_session");

    if (hasVerified && !hasTemporary) return "ID único";
    if (hasVerified && hasTemporary) return "Mixta";
    if (hasTemporary) return "Temporal";
    return "Nombre visible";
}

function formatDateTime(value) {
    if (!value) return "Pendiente";

    return new Date(value).toLocaleString("es-CR", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit"
    });
}

function createAliasMap(aliases) {
    const map = new Map();

    aliases.forEach(alias => {
        map.set(getIdentityKey(alias), alias);
    });

    return map;
}

function applyAliases(players, aliasMap) {
    return players.map(player => {
        const alias = aliasMap.get(getIdentityKey(player));

        return {
            ...player,
            alias: alias?.alias || null,
            notes: alias?.notes || null,
            threat_level: alias?.threat_level || "known",
            alert_enabled: Boolean(alias?.alert_enabled),
            alert_channel: alias?.alert_channel || "discord",
            alert_cooldown_minutes: alias?.alert_cooldown_minutes || 30,
            last_alert_sent_at: alias?.last_alert_sent_at || null
        };
    });
}

function getIdentityKey(player) {
    return `${player.identity_type}:${player.identity_key}`;
}

function encodePlayerPayload(serverId, player) {
    const payload = {
        serverId,
        identity_type: player.identity_type,
        identity_key: player.identity_key,
        detected_name: player.detected_name,
        battlemetrics_name: player.battlemetrics_name,
        alias: player.alias || "",
        notes: player.notes || "",
        threat_level: player.threat_level || "known",
        alert_enabled: Boolean(player.alert_enabled),
        alert_channel: player.alert_channel || "discord",
        alert_cooldown_minutes: player.alert_cooldown_minutes || 30
    };

    return encodeURIComponent(JSON.stringify(payload));
}

function decodePlayerPayload(value) {
    return JSON.parse(decodeURIComponent(value));
}
function filterServersBySearch(servers, searchText) {
    const query = String(searchText || "").trim().toLowerCase();

    if (!query) {
        return servers;
    }

    return servers.filter(server => {
        return [
            server.name,
            server.server_name,
            server.map_name,
            server.ip,
            server.port
        ]
            .filter(Boolean)
            .some(value => String(value).toLowerCase().includes(query));
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function closeAliasModal() {
    editingAliasPlayer = null;
    AppStore.setPage("serverMonitor");
}

function initServerMonitorEvents() {
        document.querySelector("#serverSearchForm")?.addEventListener("submit", event => {
        event.preventDefault();

        serverMonitorSearch = document.querySelector("#serverSearchInput")?.value || "";
        localStorage.setItem("serverMonitorSearch", serverMonitorSearch);

        AppStore.setPage("serverMonitor");
    });

    document.querySelector("#clearServerSearchBtn")?.addEventListener("click", () => {
        serverMonitorSearch = "";
        localStorage.removeItem("serverMonitorSearch");

        AppStore.setPage("serverMonitor");
    });

    document.querySelector("#toggleAddServerBtn")?.addEventListener("click", () => {
        addServerExpanded = !addServerExpanded;
        localStorage.setItem("addServerExpanded", String(addServerExpanded));

        AppStore.setPage("serverMonitor");
    });
    document.querySelectorAll("[data-toggle-server-alerts]").forEach(button => {
    button.addEventListener("click", async () => {
        const serverId = button.dataset.toggleServerAlerts;
        const currentValue = button.dataset.alertsEnabled === "true";
        const newValue = !currentValue;

        const { error } = await updateServerAlertSettings({
            serverId,
            alertsEnabled: newValue,
            alertFromTime: "00:00",
            alertToTime: "08:00"
        });

        if (error) {
            showError("No se pudo actualizar las alertas del servidor.");
            return;
        }

        showSuccess(newValue
            ? "Alertas del mapa activadas."
            : "Alertas del mapa desactivadas."
        );

        AppStore.setPage("serverMonitor");
    });
});
    document.querySelector("#refreshServerMonitorBtn")?.addEventListener("click", () => {
        AppStore.setPage("serverMonitor");
    });

    document.querySelector("#addServerForm")?.addEventListener("submit", async event => {
        event.preventDefault();

        const name = document.querySelector("#serverNameInput")?.value;
        const address = document.querySelector("#serverAddressInput")?.value;

        try {
            const { data, error } = await createMonitoredServer({
                name,
                address
            });

            if (error) throw error;

            selectedServerId = data.id;
            localStorage.setItem("selectedMonitorServerId", selectedServerId);

            showSuccess("Servidor agregado correctamente.");
            AppStore.setPage("serverMonitor");
        } catch (error) {
            showError(error.message || "No se pudo agregar el servidor.");
        }
    });

    document.querySelectorAll(".server-list-item").forEach(button => {
        button.addEventListener("click", () => {
            selectedServerId = button.dataset.serverId;
            localStorage.setItem("selectedMonitorServerId", selectedServerId);
            AppStore.setPage("serverMonitor");
        });
    });

    document.querySelectorAll("[data-delete-server-id]").forEach(button => {
        button.addEventListener("click", async () => {
            const confirmed = confirm("¿Eliminar este servidor del monitor?");

            if (!confirmed) return;

            const { error } = await deleteMonitoredServer(button.dataset.deleteServerId);

            if (error) {
                showError("No se pudo eliminar el servidor.");
                return;
            }

            selectedServerId = null;
            localStorage.removeItem("selectedMonitorServerId");

            showSuccess("Servidor eliminado.");
            AppStore.setPage("serverMonitor");
        });
    });

    document.querySelector("#syncServerBtn")?.addEventListener("click", async () => {
        const button = document.querySelector("#syncServerBtn");
        const serverId = button?.dataset.serverId;

        if (!serverId) return;

        button.disabled = true;
        button.textContent = "Sincronizando...";

        const { data, error } = await syncBattlemetricsServer(serverId);

        if (error) {
            console.error("BattleMetrics sync error:", error);
            showError(error.message || "No se pudo sincronizar con BattleMetrics.");

            button.disabled = false;
            button.textContent = "Detectar / sincronizar";
            return;
        }

        if (data?.warning) {
            showWarning(data.warning);
        } else {
            showSuccess("Servidor sincronizado correctamente.");
        }

        AppStore.setPage("serverMonitor");
    });

    document.querySelectorAll(".edit-alias-btn").forEach(button => {
        button.addEventListener("click", () => {
            editingAliasPlayer = decodePlayerPayload(button.dataset.player);
            AppStore.setPage("serverMonitor");
        });
    });

    document.querySelector("#closeAliasModalBtn")?.addEventListener("click", closeAliasModal);
    document.querySelector("#cancelAliasBtn")?.addEventListener("click", closeAliasModal);

    document.querySelector("#aliasForm")?.addEventListener("submit", async event => {
        event.preventDefault();

        const serverId = document.querySelector("#aliasServerId")?.value;
        const identityType = document.querySelector("#aliasIdentityType")?.value;
        const identityKey = document.querySelector("#aliasIdentityKey")?.value;
        const detectedName = document.querySelector("#aliasDetectedName")?.value;
        const battlemetricsName = document.querySelector("#aliasBattlemetricsName")?.value;
        const alias = document.querySelector("#aliasInput")?.value;
        const notes = document.querySelector("#aliasNotesInput")?.value;
        const threatLevel = document.querySelector("#aliasThreatLevel")?.value;
const alertEnabled = document.querySelector("#aliasAlertEnabled")?.checked;
const alertChannel = document.querySelector("#aliasAlertChannel")?.value;
const alertCooldownMinutes = document.querySelector("#aliasAlertCooldown")?.value;

        const { error } = await saveServerPlayerAlias({
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
});
        if (error) {
            showError("No se pudo guardar el sobrenombre.");
            return;
        }

        editingAliasPlayer = null;

        showSuccess("Sobrenombre guardado correctamente.");
        AppStore.setPage("serverMonitor");
    });

    document.querySelectorAll(".top-limit-btn").forEach(button => {
        button.addEventListener("click", () => {
            topLimit = Number(button.dataset.topLimit);
            localStorage.setItem("serverMonitorTopLimit", String(topLimit));
            AppStore.setPage("serverMonitor");
        });
    });

    document.querySelector("#minHoursFilter")?.addEventListener("change", event => {
        minHoursFilter = Number(event.target.value);
        localStorage.setItem("serverMonitorMinHours", String(minHoursFilter));
        AppStore.setPage("serverMonitor");
    });
}