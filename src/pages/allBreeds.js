import { Layout } from "../components/layout/Layout";
import { getAllActiveBreedsWithPropagators } from "../services/breedService";
import { getSpeciesImage } from "../services/storageService";

let allBreedsCooldownInterval = null;

export async function AllBreedsPage() {
    const { data, error } = await getAllActiveBreedsWithPropagators();

    if (error) {
        console.error(error);

        return Layout(`
            <h1>Todos los Breeds</h1>
            <p>Error cargando todos los breeds activos.</p>
        `);
    }

    const breeds = data || [];

    setTimeout(() => {
        initAllBreedsFilters();
        startAllBreedsCooldownTimers();
    });

    const speciesOptions = [...new Set(
        breeds.map(breed => breed.species?.name).filter(Boolean)
    )];

    const breederOptions = [...new Set(
        breeds.map(breed => breed.breeder?.name).filter(Boolean)
    )];

    return Layout(`
        <div class="page-header">
            <div>
                <h1>Todos los Breeds</h1>
                <p>Vista general de todos los dinosaurios que se están breedeando actualmente.</p>
            </div>
        </div>

        <div class="filters-card">
            <input
                id="breedSearch"
                placeholder="Buscar por especie..."
            >

            <select id="speciesFilter">
                <option value="all">Todas las especies</option>

                ${speciesOptions.map(name => `
                    <option value="${name}">
                        ${name}
                    </option>
                `).join("")}
            </select>

            <select id="breederFilter">
                <option value="all">Todos los breeders</option>

                ${breederOptions.map(name => `
                    <option value="${name}">
                        ${name}
                    </option>
                `).join("")}
            </select>
        </div>

        ${breeds.length === 0 ? `
            <div class="empty-card">
                No hay breeds activos actualmente.
            </div>
        ` : `
            <div id="allBreedsGrid" class="all-breeds-grid">
                ${breeds.map(breed => renderAllBreedCard(breed)).join("")}
            </div>
        `}
    `);
}

function renderAllBreedCard(breed) {
    const propagators = [...breed.propagators].sort((a, b) => a.number - b.number);

    return `
        <div
            class="all-breed-card"
            data-species="${breed.species?.name || ""}"
            data-breeder="${breed.breeder?.name || ""}"
        >
            <img
                src="${getSpeciesImage(breed.species?.image_path)}"
                alt="${breed.species?.name || "Dino"}"
            >

            <div class="all-breed-body">
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

                <div class="read-only-propagators">
                    ${propagators.map(prop => renderReadOnlyPropagator(prop)).join("")}
                </div>
            </div>
        </div>
    `;
}

function renderReadOnlyPropagator(prop) {
    const available = isPropagatorAvailable(prop.cooldown_until);

    if (available) {
        return `
            <div class="readonly-prop available">
                P${prop.number}
                <small>Libre</small>
            </div>
        `;
    }

    return `
        <div
            class="readonly-prop cooldown"
            data-cooldown="${prop.cooldown_until}"
        >
            P${prop.number}
            <small>Calculando...</small>
        </div>
    `;
}

function isPropagatorAvailable(cooldownUntil) {
    if (!cooldownUntil) return true;

    return new Date(cooldownUntil) <= new Date();
}

function initAllBreedsFilters() {
    const search = document.querySelector("#breedSearch");
    const speciesFilter = document.querySelector("#speciesFilter");
    const breederFilter = document.querySelector("#breederFilter");

    if (!search || !speciesFilter || !breederFilter) return;

    const applyFilters = () => {
        const searchValue = search.value.toLowerCase().trim();
        const speciesValue = speciesFilter.value;
        const breederValue = breederFilter.value;

        document.querySelectorAll(".all-breed-card").forEach(card => {
            const species = card.dataset.species;
            const breeder = card.dataset.breeder;

            const matchesSearch = species.toLowerCase().includes(searchValue);
            const matchesSpecies = speciesValue === "all" || species === speciesValue;
            const matchesBreeder = breederValue === "all" || breeder === breederValue;

            card.style.display =
                matchesSearch && matchesSpecies && matchesBreeder
                    ? "block"
                    : "none";
        });
    };

    search.addEventListener("input", applyFilters);
    speciesFilter.addEventListener("change", applyFilters);
    breederFilter.addEventListener("change", applyFilters);
}

function startAllBreedsCooldownTimers() {
    if (allBreedsCooldownInterval) {
        clearInterval(allBreedsCooldownInterval);
    }

    updateAllBreedsCooldownTimers();

    allBreedsCooldownInterval = setInterval(() => {
        updateAllBreedsCooldownTimers();
    }, 1000);
}

function updateAllBreedsCooldownTimers() {
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