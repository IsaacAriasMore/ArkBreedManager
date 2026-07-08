import { Layout } from "../components/layout/Layout";
import { getSpeciesImage } from "../services/storageService";
import { isPropagatorAvailable } from "../utils/validation";
import { showSuccess, showError, showWarning } from "../utils/feedback";
import {
    getActiveBreedsWithPropagators,
    registerMutation,
    notifyDiscordMutation
} from "../services/breedService";
import { AppStore } from "../stores/appStore";

let cooldownInterval = null;

export async function DashboardPage() {
    const isAdmin = AppStore.isAdmin();

    const { data, error } = await getActiveBreedsWithPropagators({
        breederId: isAdmin ? null : AppStore.profile?.id
    });

    if (error) {
        console.error(error);

        return Layout(`
            <h1>Dashboard</h1>
            <p>Error cargando breeds.</p>
        `);
    }

    const breeds = data || [];

    setTimeout(() => {
        initDashboardEvents(breeds);
        startCooldownTimers();
    });

    return Layout(`
        <div class="page-header">
            <div>
                <h1>Dashboard</h1>
                <p>
                    ${isAdmin
                        ? "Vista general de todos los breeds activos."
                        : "Estos son los breeds asignados a ti."
                    }
                </p>
            </div>
        </div>

        <div class="dashboard-summary">
            <div class="summary-card">
                <span>${isAdmin ? "Breeds activos" : "Mis breeds activos"}</span>
                <strong>${breeds.length}</strong>
            </div>

            <div class="summary-card">
                <span>Mutaciones visibles</span>
                <strong>${breeds.reduce((total, breed) => total + breed.mutations, 0)}</strong>
            </div>

            <div class="summary-card">
                <span>Rol actual</span>
                <strong>${AppStore.profile?.role || "-"}</strong>
            </div>
        </div>

        ${breeds.length === 0 ? `
            <div class="empty-card">
                ${isAdmin
                    ? "No hay breeds activos todavía."
                    : "No tienes breeds activos asignados."
                }
            </div>
        ` : `
            <div class="dashboard-grid">
                ${breeds.map(breed => renderBreedCard(breed)).join("")}
            </div>
        `}
    `);
}

function renderBreedCard(breed) {
    const propagators = [...breed.propagators].sort((a, b) => a.number - b.number);

    const hasAvailablePropagators = propagators.some(prop =>
        isPropagatorAvailable(prop.cooldown_until)
    );

    return `
        <div class="dashboard-breed-card">
            <img
                src="${getSpeciesImage(breed.species?.image_path)}"
                alt="${breed.species?.name || "Dino"}"
            >

            <div class="dashboard-breed-body">
                <div class="breed-title-row">
                    <h3>${breed.species?.name || "Sin especie"}</h3>
                    <span class="status-badge active">
                        Activo
                    </span>
                </div>

                <p>
                    <strong>Encargado:</strong>
                    ${breed.breeder?.name || "Sin asignar"}
                </p>

                <p>
                    <strong>Stat objetivo:</strong>
                    ${breed.stat}
                </p>

                <div class="breed-values">
                    <div>
                        <span>Actual</span>
                        <strong>${breed.current_value}</strong>
                    </div>

                    <div>
                        <span>Próxima</span>
                        <strong>${breed.next_value}</strong>
                    </div>

                    <div>
                        <span>Mutaciones</span>
                        <strong>${breed.mutations}</strong>
                    </div>
                </div>

                <div class="propagator-row">
                    ${propagators.map(prop => renderPropagator(prop)).join("")}
                </div>

                <button
                    class="open-mutation-btn"
                    data-breed-id="${breed.id}"
                    ${!hasAvailablePropagators ? "disabled" : ""}
                >
                    ${hasAvailablePropagators ? "Registrar Mutación" : "Todos en cooldown"}
                </button>

                <form
                    class="mutation-form hidden"
                    data-breed-id="${breed.id}"
                >
                    <h4>Propagators usados</h4>

                    <div class="mutation-propagators">
                        ${propagators.map(prop => renderPropagatorCheckbox(prop)).join("")}
                    </div>

                    <textarea
                        class="mutation-notes"
                        placeholder="Notas opcionales"
                    ></textarea>

                    <button type="submit">
                        Guardar Mutación
                    </button>
                </form>
            </div>
        </div>
    `;
}

function renderPropagator(prop) {
    const available = isPropagatorAvailable(prop.cooldown_until);

    if (available) {
        return `
            <div class="propagator available">
                P${prop.number}
                <small>Libre</small>
            </div>
        `;
    }

    return `
        <div
            class="propagator cooldown"
            data-cooldown="${prop.cooldown_until}"
        >
            P${prop.number}
            <small>Calculando...</small>
        </div>
    `;
}

function renderPropagatorCheckbox(prop) {
    const available = isPropagatorAvailable(prop.cooldown_until);

    return `
        <label class="prop-checkbox ${!available ? "disabled" : ""}">
            <input
                type="checkbox"
                value="${prop.number}"
                ${!available ? "disabled" : ""}
            >
            P${prop.number}
        </label>
    `;
}

function initDashboardEvents(breeds) {
    document.querySelectorAll(".open-mutation-btn").forEach(button => {
        button.addEventListener("click", () => {
            if (button.disabled) return;

            const breedId = button.dataset.breedId;
            const form = document.querySelector(`.mutation-form[data-breed-id="${breedId}"]`);

            if (!form) return;

            form.classList.toggle("hidden");
        });
    });

    document.querySelectorAll(".mutation-form").forEach(form => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const breedId = form.dataset.breedId;
            const breed = breeds.find(item => item.id === breedId);

            if (!breed) {
                alert("No se encontró este breed.");
                return;
            }

            const availableInputs = Array.from(
                form.querySelectorAll("input[type='checkbox']:not(:disabled)")
            );

          if (availableInputs.length === 0) {
    showWarning("Todos los propagators están en cooldown.");
    return;
}

            const selectedPropagators = Array.from(
                form.querySelectorAll("input[type='checkbox']:checked")
            ).map(input => Number(input.value));

            if (selectedPropagators.length === 0) {
    showWarning("Selecciona al menos un propagator.");
    return;
}
            const notes = form.querySelector(".mutation-notes").value.trim();

            const { error } = await registerMutation({
                breed,
                propagatorsUsed: selectedPropagators,
                notes
            });

           if (error) {
    console.error(error);
    showError(error.message || "Error registrando mutación.");
    return;
}

showSuccess("Mutación registrada correctamente.");

const { error: discordError } = await notifyDiscordMutation(breed.id);

if (discordError) {
    console.warn("Discord mutation notification error:", discordError);
    showWarning("Mutación guardada, pero no se pudo avisar en Discord.");
}

AppStore.setPage("dashboard");

            AppStore.setPage("dashboard");
        });
    });
}

function startCooldownTimers() {
    if (cooldownInterval) {
        clearInterval(cooldownInterval);
    }

    updateCooldownTimers();

    cooldownInterval = setInterval(() => {
        updateCooldownTimers();
    }, 1000);
}

function updateCooldownTimers() {
    document.querySelectorAll("[data-cooldown]").forEach(element => {
        const cooldownUntil = new Date(element.dataset.cooldown);
        const now = new Date();

        const diff = cooldownUntil - now;

        if (diff <= 0) {
            element.classList.remove("cooldown");
            element.classList.add("available");
            element.querySelector("small").textContent = "Libre";
            return;
        }

        const hours = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        element.querySelector("small").textContent =
            `${hours}h ${minutes}m ${seconds}s`;
    });
}