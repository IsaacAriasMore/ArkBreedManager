import { Layout } from "../components/layout/Layout";
import { normalizeText } from "../utils/validation";
import {
    getSpecies,
    createSpecies,
    updateSpecies,
    deleteSpecies
} from "../services/speciesService";
import {
    uploadSpeciesImage,
    getSpeciesImage
} from "../services/storageService";
import { AppStore } from "../stores/appStore";

let speciesList = [];

export async function SpeciesPage() {
    const { data, error } = await getSpecies();

    if (error) {
        console.error(error);

        return Layout(`
            <h1>Especies</h1>
            <p>Error cargando especies.</p>
        `);
    }

    speciesList = data || [];

    setTimeout(() => {
        initSpeciesEvents();
    });

    return Layout(`
        <div class="page-header">
            <div>
                <h1>Especies</h1>
                <p>Administra los dinosaurios disponibles para breeding.</p>
            </div>
        </div>

        <form id="speciesForm" class="form-card">
            <h2 id="speciesFormTitle">Nueva Especie</h2>

            <input id="editingSpeciesId" type="hidden">

            <input
                id="name"
                placeholder="Nombre, ejemplo: Rex"
                required
            >

            <input
                id="class"
                placeholder="Clase, ejemplo: Carnívoro"
                required
            >

            <input
                id="dlc"
                placeholder="DLC, ejemplo: The Island"
            >

            <input
                id="image"
                type="file"
                accept="image/*"
            >

            <small class="form-help">
                Si estás editando y no eliges nueva imagen, se conserva la imagen actual.
            </small>

            <div class="form-actions">
                <button type="submit" id="saveSpeciesBtn">
                    Guardar Especie
                </button>

                <button type="button" id="cancelEditBtn" class="secondary-btn hidden">
                    Cancelar edición
                </button>
            </div>
        </form>

        <input
            id="searchSpecies"
            class="search-input"
            placeholder="Buscar especie..."
        >

        <div class="species-grid">
            ${speciesList.length === 0 ? `
                <div class="empty-card">
                    No hay especies registradas todavía.
                </div>
            ` : speciesList.map(species => `
                <div class="species-card">
                    <img
                        src="${getSpeciesImage(species.image_path)}"
                        alt="${species.name}"
                    >

                    <div class="species-info">
                        <h3>${species.name}</h3>

                        <p>
                            <strong>Clase:</strong>
                            ${species.class}
                        </p>

                        <small>
                            ${species.dlc || "Sin DLC"}
                        </small>

                        <div class="species-actions">
                            <button
                                class="edit-btn"
                                data-id="${species.id}"
                            >
                                Editar
                            </button>

                            <button
                                class="delete-btn"
                                data-id="${species.id}"
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

function initSpeciesEvents() {
    const form = document.querySelector("#speciesForm");
    const cancelEditBtn = document.querySelector("#cancelEditBtn");
    const searchInput = document.querySelector("#searchSpecies");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const editingId = document.querySelector("#editingSpeciesId").value;
        const name = document.querySelector("#name").value.trim();
        const speciesClass = document.querySelector("#class").value.trim();
        const dlc = document.querySelector("#dlc").value.trim();
        const imageFile = document.querySelector("#image").files[0];
        const normalizedName = normalizeText(name);

if (name.length < 2) {
    alert("El nombre de la especie debe tener al menos 2 caracteres.");
    return;
}

if (speciesClass.length < 2) {
    alert("La clase debe tener al menos 2 caracteres.");
    return;
}

const duplicatedSpecies = speciesList.find(item =>
    normalizeText(item.name) === normalizedName &&
    item.id !== editingId
);

if (duplicatedSpecies) {
    alert("Ya existe una especie con ese nombre.");
    return;
}

        try {
            let imagePath = null;

            if (imageFile) {
                imagePath = await uploadSpeciesImage(imageFile);
            }

            if (editingId) {
                const currentSpecies = speciesList.find(item => item.id === editingId);

                const payload = {
                    name,
                    search_name: normalizedName,
                    class: speciesClass,
                    dlc,
                    image_path: imagePath || currentSpecies.image_path
                };

                const { error } = await updateSpecies(editingId, payload);

                if (error) throw error;
            } else {
                const payload = {
                    name,
                    search_name: normalizedName,
                    class: speciesClass,
                    dlc,
                    image_path: imagePath
                };

                const { error } = await createSpecies(payload);

                if (error) throw error;
            }

            AppStore.setPage("species");
        } catch (error) {
            console.error(error);
            if (error.code === "23505") {
    alert("Ya existe una especie con ese nombre.");
    return;
}

alert("Error al guardar la especie.");
        }
    });

    cancelEditBtn.addEventListener("click", () => {
        resetSpeciesForm();
    });

    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", () => {
            const species = speciesList.find(item => item.id === button.dataset.id);

            if (!species) return;

            document.querySelector("#editingSpeciesId").value = species.id;
            document.querySelector("#name").value = species.name;
            document.querySelector("#class").value = species.class;
            document.querySelector("#dlc").value = species.dlc || "";

            document.querySelector("#speciesFormTitle").textContent = "Editar Especie";
            document.querySelector("#saveSpeciesBtn").textContent = "Actualizar Especie";
            document.querySelector("#cancelEditBtn").classList.remove("hidden");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const confirmDelete = confirm("¿Eliminar esta especie?");

            if (!confirmDelete) return;

            const { error } = await deleteSpecies(button.dataset.id);

            if (error) {
                console.error(error);
                alert("No se pudo eliminar la especie.");
                return;
            }

            AppStore.setPage("species");
        });
    });

    searchInput.addEventListener("input", () => {
        const value = searchInput.value.toLowerCase().trim();

        document.querySelectorAll(".species-card").forEach(card => {
            const name = card.querySelector("h3").textContent.toLowerCase();

            card.style.display = name.includes(value) ? "block" : "none";
        });
    });
}

function resetSpeciesForm() {
    document.querySelector("#editingSpeciesId").value = "";
    document.querySelector("#name").value = "";
    document.querySelector("#class").value = "";
    document.querySelector("#dlc").value = "";
    document.querySelector("#image").value = "";

    document.querySelector("#speciesFormTitle").textContent = "Nueva Especie";
    document.querySelector("#saveSpeciesBtn").textContent = "Guardar Especie";
    document.querySelector("#cancelEditBtn").classList.add("hidden");
}