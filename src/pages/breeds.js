import { Layout } from "../components/layout/Layout";
import { getSpeciesImage } from "../services/storageService";
import { getSpecies } from "../services/speciesService";
import { getUsers } from "../services/userService";
import { isValidNonNegativeInteger } from "../utils/validation";
import {
    getBreeds,
    createBreed,
    updateBreed,
    createBreedPropagators,
    deleteBreed
} from "../services/breedService";
import { AppStore } from "../stores/appStore";

let breedsList = [];

export async function BreedsPage() {
    const speciesResult = await getSpecies();
    const usersResult = await getUsers();
    const breedsResult = await getBreeds();

    const species = speciesResult.data || [];
    const users = usersResult.data || [];
    const breeds = breedsResult.data || [];

    breedsList = breeds;

    const breeders = users.filter(user => user.role === "breeder");

    setTimeout(() => {
        initBreedEvents();
    });

    return Layout(`
        <div class="page-header">
            <div>
                <h1>Administrar Breeds</h1>
                <p>Crea, edita y administra los dinosaurios que se están breedeando.</p>
            </div>
        </div>

        <form id="breedForm" class="form-card">
            <h2 id="breedFormTitle">Nuevo Breed</h2>

            <input id="editingBreedId" type="hidden">

            <select id="breedSpecies" required>
                <option value="">Selecciona una especie</option>

                ${species.map(item => `
                    <option value="${item.id}">
                        ${item.name}
                    </option>
                `).join("")}
            </select>

            <select id="breedBreeder" required>
                <option value="">Selecciona un breeder</option>

                ${breeders.map(user => `
                    <option value="${user.id}">
                        ${user.name}
                    </option>
                `).join("")}
            </select>

            <select id="breedStat" required>
                <option value="">Estadística objetivo</option>
                <option value="Vida">Vida</option>
                <option value="Stamina">Stamina</option>
                <option value="Oxígeno">Oxígeno</option>
                <option value="Comida">Comida</option>
                <option value="Peso">Peso</option>
                <option value="Daño">Daño</option>
                <option value="Velocidad">Velocidad</option>
            </select>

            <input
                id="breedCurrentValue"
                type="number"
                placeholder="Valor actual de la estadística"
                required
            >

            <input
                id="breedMutations"
                type="number"
                placeholder="Mutaciones acumuladas"
                value="0"
                min="0"
                required
            >

            <select id="breedStatus">
                <option value="active">Activo</option>
                <option value="finished">Finalizado</option>
            </select>

            <div class="form-actions">
                <button type="submit" id="saveBreedBtn">
                    Crear Breed
                </button>

                <button type="button" id="cancelBreedEditBtn" class="secondary-btn hidden">
                    Cancelar edición
                </button>
            </div>
        </form>

        <div class="breed-grid">
            ${breeds.length === 0 ? `
                <div class="empty-card">
                    No hay breeds registrados todavía.
                </div>
            ` : breeds.map(breed => `
                <div class="breed-card">
                    <img
                        src="${getSpeciesImage(breed.species?.image_path)}"
                        alt="${breed.species?.name || "Dino"}"
                    >

                    <div class="breed-info">
                        <div class="breed-title-row">
                            <h3>${breed.species?.name || "Sin especie"}</h3>

                            <span class="status-badge ${breed.status}">
                                ${breed.status}
                            </span>
                        </div>

                        <p>
                            <strong>Breeder:</strong>
                            ${breed.breeder?.name || "Sin asignar"}
                        </p>

                        <p>
                            <strong>Stat:</strong>
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

                        <div class="breed-actions">
                            <button
                                class="edit-breed-btn"
                                data-id="${breed.id}"
                            >
                                Editar
                            </button>

                            <button
                                class="delete-breed-btn"
                                data-id="${breed.id}"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    `);
}

function initBreedEvents() {
    const form = document.querySelector("#breedForm");
    const cancelBreedEditBtn = document.querySelector("#cancelBreedEditBtn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const editingId = document.querySelector("#editingBreedId").value;

        const speciesId = document.querySelector("#breedSpecies").value;
        const breederId = document.querySelector("#breedBreeder").value;
        const stat = document.querySelector("#breedStat").value;
        const currentValue = Number(document.querySelector("#breedCurrentValue").value);
        const mutations = Number(document.querySelector("#breedMutations").value);
        const status = document.querySelector("#breedStatus").value;
        if (!isValidNonNegativeInteger(currentValue)) {
    alert("El valor actual debe ser un número entero mayor o igual a 0.");
    return;
}

if (!isValidNonNegativeInteger(mutations)) {
    alert("Las mutaciones deben ser un número entero mayor o igual a 0.");
    return;
}

        const payload = {
            species_id: speciesId,
            breeder_id: breederId,
            stat,
            current_value: currentValue,
            next_value: currentValue + 2,
            mutations,
            status
        };

        try {
            if (editingId) {
                const { error } = await updateBreed(editingId, payload);

                if (error) throw error;
            } else {
                const { data: breed, error } = await createBreed(payload);

                if (error) throw error;

                const { error: propagatorError } = await createBreedPropagators(breed.id);

                if (propagatorError) throw propagatorError;
            }

            AppStore.setPage("breeds");
        } catch (error) {
            console.error(error);
            if (error.code === "23514") {
    alert("El breed tiene valores inválidos. Revisa que no haya números negativos.");
    return;
}

alert("Error al guardar el breed.");
        }
    });

    cancelBreedEditBtn.addEventListener("click", () => {
        resetBreedForm();
    });

    document.querySelectorAll(".edit-breed-btn").forEach(button => {
        button.addEventListener("click", () => {
            const breed = breedsList.find(item => item.id === button.dataset.id);

            if (!breed) return;

            document.querySelector("#editingBreedId").value = breed.id;
            document.querySelector("#breedSpecies").value = breed.species_id;
            document.querySelector("#breedBreeder").value = breed.breeder_id;
            document.querySelector("#breedStat").value = breed.stat;
            document.querySelector("#breedCurrentValue").value = breed.current_value;
            document.querySelector("#breedMutations").value = breed.mutations;
            document.querySelector("#breedStatus").value = breed.status;

            document.querySelector("#breedFormTitle").textContent = "Editar Breed";
            document.querySelector("#saveBreedBtn").textContent = "Actualizar Breed";
            document.querySelector("#cancelBreedEditBtn").classList.remove("hidden");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });

    document.querySelectorAll(".delete-breed-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const confirmDelete = confirm("¿Eliminar este breed?");

            if (!confirmDelete) return;

            const { error } = await deleteBreed(button.dataset.id);

            if (error) {
                console.error(error);
                alert("No se pudo eliminar el breed.");
                return;
            }

            AppStore.setPage("breeds");
        });
    });
}

function resetBreedForm() {
    document.querySelector("#editingBreedId").value = "";
    document.querySelector("#breedSpecies").value = "";
    document.querySelector("#breedBreeder").value = "";
    document.querySelector("#breedStat").value = "";
    document.querySelector("#breedCurrentValue").value = "";
    document.querySelector("#breedMutations").value = "0";
    document.querySelector("#breedStatus").value = "active";

    document.querySelector("#breedFormTitle").textContent = "Nuevo Breed";
    document.querySelector("#saveBreedBtn").textContent = "Crear Breed";
    document.querySelector("#cancelBreedEditBtn").classList.add("hidden");
}