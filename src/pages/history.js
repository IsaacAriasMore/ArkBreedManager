import { Layout } from "../components/layout/Layout";
import { getMutations } from "../services/mutationService";
import { getSpeciesImage } from "../services/storageService";

export async function HistoryPage() {
    const { data, error } = await getMutations();

    if (error) {
        console.error(error);

        return Layout(`
            <h1>Historial</h1>
            <p>Error cargando historial de mutaciones.</p>
        `);
    }

    const mutations = data || [];

    return Layout(`
        <div class="page-header">
            <div>
                <h1>Historial de Mutaciones</h1>
                <p>Registro completo de mutaciones realizadas en ArkBreed.</p>
            </div>
        </div>

        <div class="history-list">
            ${mutations.length === 0 ? `
                <div class="empty-card">
                    Aún no hay mutaciones registradas.
                </div>
            ` : mutations.map(mutation => renderMutationCard(mutation)).join("")}
        </div>
    `);
}

function renderMutationCard(mutation) {
    const breed = mutation.breed;
    const species = breed?.species;
    const breeder = breed?.breeder;
    const user = mutation.user;

    const date = new Date(mutation.created_at).toLocaleString("es-ES", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    const propagators = mutation.propagators_used?.length
        ? mutation.propagators_used.map(number => `P${number}`).join(", ")
        : "No registrado";

    return `
        <div class="history-card">
            <img
                src="${getSpeciesImage(species?.image_path)}"
                alt="${species?.name || "Dino"}"
            >

            <div class="history-content">
                <div class="history-top">
                    <div>
                        <h3>${species?.name || "Sin especie"}</h3>
                        <p>
                            <strong>Breeder encargado:</strong>
                            ${breeder?.name || "Sin asignar"}
                        </p>
                    </div>

                    <span class="history-date">
                        ${date}
                    </span>
                </div>

                <div class="history-values">
                    <div>
                        <span>Stat</span>
                        <strong>${breed?.stat || "-"}</strong>
                    </div>

                    <div>
                        <span>Antes</span>
                        <strong>${mutation.old_value}</strong>
                    </div>

                    <div>
                        <span>Después</span>
                        <strong>${mutation.new_value}</strong>
                    </div>

                    <div>
                        <span>Propagators</span>
                        <strong>${propagators}</strong>
                    </div>
                </div>

                <p class="history-user">
                    Registrado por:
                    <strong>${user?.name || "Usuario no identificado"}</strong>
                </p>

                ${mutation.notes ? `
                    <p class="history-notes">
                        ${mutation.notes}
                    </p>
                ` : ""}
            </div>
        </div>
    `;
}