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
    getServerTopPlayers,
    saveServerPlayerAlias,
    syncBattlemetricsServer
} from "../services/serverMonitorService";

let selectedServerId = localStorage.getItem("selectedMonitorServerId") || null;
let topLimit = Number(localStorage.getItem("serverMonitorTopLimit") || 10);
let minHoursFilter = Number(localStorage.getItem("serverMonitorMinHours") || 0);
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

    const aliasMap = createAliasMap(aliasesResult.data || []);

    const activeSessions = applyAliases(activeSessionsResult.data || [], aliasMap);
    let topPlayers = applyAliases(topPlayersResult.data || [], aliasMap);

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

        ${AppStore.isAdmin() ? renderAddServerForm() : ""}

        <section class="server-monitor-layout">
            <aside class="server-list-card">
                <div class="section-title-row">
                    <h2>Servidores</h2>
                    <span>${serverList.length}</span>
                </div>

                ${serverList.length === 0 ? `
                    <div class="empty-monitor-box">
                        <strong>No hay servidores agregados.</strong>
                        <p>Agrega una IP para empezar a monitorear.</p>
                    </div>
                ` : `
                    <div class="server-list">
                        ${serverList.map(server => renderServerButton(server)).join("")}
                    </div>
                `}
            </aside>

            <main class="server-monitor-main">
                ${selectedServer ? renderSelectedServer(selectedServer, activeSessions, topPlayers) : renderEmptyState()}
            </main>
        </section>

        ${editingAliasPlayer ? renderAliasModal(editingAliasPlayer) : ""}
    `);
}

function renderAddServerForm() {
    return `
        <details class="server-form-card compact-add-server">
            <summary>
                <div>
                    <strong>Agregar servidor</strong>
                    <span>Guarda una IP pública para monitorearla.</span>
                </div>

                <small>Mostrar formulario</small>
            </summary>

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
        </details>
    `;
}

function renderServerButton(server) {
    const activeClass = server.id === selectedServerId ? "active" : "";

    return `
        <button class="server-list-item ${activeClass}" data-server-id="${server.id}">
            <strong>${escapeHtml(server.name)}</strong>
            <span>${escapeHtml(formatServerAddress(server))}</span>
            <small>${escapeHtml(server.map_name || "Mapa pendiente")}</small>
        </button>
    `;
}

function renderSelectedServer(server, activeSessions, topPlayers) {
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
            notes: alias?.notes || null
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
        notes: player.notes || ""
    };

    return encodeURIComponent(JSON.stringify(payload));
}

function decodePlayerPayload(value) {
    return JSON.parse(decodeURIComponent(value));
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

        const { error } = await saveServerPlayerAlias({
            serverId,
            identityType,
            identityKey,
            detectedName,
            battlemetricsName,
            alias,
            notes
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