import { Layout } from "../components/layout/Layout";
import { getStats } from "../services/statsService";

export async function StatisticsPage() {
    const { data, error } = await getStats();

    if (error) {
        console.error(error);

        return Layout(`
            <h1>Estadísticas</h1>
            <p>Error cargando estadísticas.</p>
        `);
    }

    return Layout(`
        <div class="page-header">
            <div>
                <h1>Estadísticas</h1>
                <p>Resumen general del progreso de breeding.</p>
            </div>
        </div>

        <div class="stats-summary-grid">
            <div class="stats-card">
                <span>Mutaciones totales</span>
                <strong>${data.totalMutations}</strong>
            </div>

            <div class="stats-card">
                <span>Breeds activos</span>
                <strong>${data.activeBreeds}</strong>
            </div>

            <div class="stats-card">
                <span>Breeds finalizados</span>
                <strong>${data.finishedBreeds}</strong>
            </div>

            <div class="stats-card">
                <span>Top breeder</span>
                <strong>${data.breederRanking[0]?.name || "-"}</strong>
            </div>
        </div>

        <div class="stats-sections">
            <section class="stats-panel">
                <h2>Ranking de Breeders</h2>

                ${data.breederRanking.length === 0 ? `
                    <p class="empty-text">Aún no hay mutaciones registradas.</p>
                ` : `
                    <div class="ranking-list">
                        ${data.breederRanking.map((item, index) => `
                            <div class="ranking-item">
                                <span class="ranking-position">#${index + 1}</span>

                                <div>
                                    <strong>${item.name}</strong>
                                    <p>${item.total} mutaciones</p>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                `}
            </section>

            <section class="stats-panel">
                <h2>Ranking de Especies</h2>

                ${data.speciesRanking.length === 0 ? `
                    <p class="empty-text">Aún no hay especies con mutaciones.</p>
                ` : `
                    <div class="ranking-list">
                        ${data.speciesRanking.map((item, index) => `
                            <div class="ranking-item">
                                <span class="ranking-position">#${index + 1}</span>

                                <div>
                                    <strong>${item.name}</strong>
                                    <p>${item.total} mutaciones</p>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                `}
            </section>
        </div>

        <section class="stats-panel recent-panel">
            <h2>Últimas mutaciones</h2>

            ${data.recentMutations.length === 0 ? `
                <p class="empty-text">Todavía no hay mutaciones recientes.</p>
            ` : `
                <div class="recent-list">
                    ${data.recentMutations.map(mutation => renderRecentMutation(mutation)).join("")}
                </div>
            `}
        </section>
    `);
}

function renderRecentMutation(mutation) {
    const speciesName = mutation.breed?.species?.name || "Sin especie";

    const userName =
        mutation.user?.name ||
        mutation.breed?.breeder?.name ||
        "Sin usuario";

    const date = new Date(mutation.created_at).toLocaleString("es-ES", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    return `
        <div class="recent-item">
            <div>
                <strong>${speciesName}</strong>
                <p>
                    ${userName} registró ${mutation.old_value} → ${mutation.new_value}
                </p>
            </div>

            <span>${date}</span>
        </div>
    `;
}