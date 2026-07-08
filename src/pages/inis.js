import { Layout } from "../components/layout/Layout";
import { AppStore } from "../stores/appStore";
import {
    INI_CATEGORIES,
    getInis,
    createIniPreset,
    updateIniPreset,
    deleteIniPreset,
    uploadIniFile,
    uploadIniPreview,
    getIniFileUrl,
    getIniPreviewUrl,
    incrementIniCopyCount,
    incrementIniDownloadCount,
    notifyDiscordNewIni
} from "../services/iniService";
import { showSuccess, showError, showWarning } from "../utils/feedback";

let iniList = [];

export async function InisPage() {
    const { data, error } = await getInis();

    if (error) {
        console.error(error);

        return Layout(`
            <h1>INIs</h1>
            <p>Error cargando INIs.</p>
        `);
    }

    iniList = data || [];

    setTimeout(() => {
        initIniEvents();
    });

    return Layout(`
        <div class="page-header">
            <div>
                <h1>INIs</h1>
                <p>Biblioteca de configuraciones .ini para ARK.</p>
            </div>
        </div>

        ${AppStore.isAdmin() ? renderIniForm() : ""}

        <div class="ini-filters">
            <input
                id="iniSearch"
                placeholder="Buscar INI..."
            >

            <select id="iniCategoryFilter">
                <option value="all">Todas las categorías</option>

                ${INI_CATEGORIES.map(category => `
                    <option value="${escapeAttr(category)}">
                        ${escapeHtml(category)}
                    </option>
                `).join("")}
            </select>
        </div>

        ${iniList.length === 0 ? `
            <div class="empty-card">
                Todavía no hay INIs publicados.
            </div>
        ` : `
            <div class="ini-grid">
                ${iniList.map(ini => renderIniCard(ini)).join("")}
            </div>
        `}
    `);
}

function renderIniForm() {
    return `
        <form id="iniForm" class="ini-form-card">
            <h2 id="iniFormTitle">Nuevo INI</h2>

            <input id="editingIniId" type="hidden">

            <input
                id="iniTitle"
                placeholder="Nombre del INI, ejemplo: INI Farmeo"
                required
            >

            <select id="iniCategory" required>
                <option value="">Selecciona categoría</option>

                ${INI_CATEGORIES.map(category => `
                    <option value="${escapeAttr(category)}">
                        ${escapeHtml(category)}
                    </option>
                `).join("")}
            </select>

            <textarea
                id="iniDescription"
                placeholder="Descripción corta del INI"
            ></textarea>

            <textarea
                id="iniContent"
                placeholder="Pega aquí el contenido del .ini"
            ></textarea>

            <label class="ini-upload-label">
                Archivo .ini opcional
                <input
                    id="iniFile"
                    type="file"
                    accept=".ini,text/plain"
                >
            </label>

            <label class="ini-upload-label">
                Imagen preview
                <input
                    id="iniPreview"
                    type="file"
                    accept="image/*"
                >
            </label>

            <label class="ini-check">
                <input
                    id="iniIsPublic"
                    type="checkbox"
                    checked
                >
                Publicar INI
            </label>

            <div class="form-actions">
                <button type="submit" id="saveIniBtn">
                    Guardar INI
                </button>

                <button type="button" id="cancelIniEditBtn" class="secondary-btn hidden">
                    Cancelar edición
                </button>
            </div>
        </form>
    `;
}

function renderIniCard(ini) {
    return `
        <article
            class="ini-card"
            data-id="${ini.id}"
            data-title="${escapeAttr(ini.title)}"
            data-category="${escapeAttr(ini.category)}"
        >
            <img
                src="${getIniPreviewUrl(ini.preview_image_path)}"
                alt="${escapeAttr(ini.title)}"
            >

            <div class="ini-card-body">
                <div class="ini-card-top">
                    <div>
                        <h3>${escapeHtml(ini.title)}</h3>
                        <span class="ini-category">
                            ${escapeHtml(ini.category)}
                        </span>
                    </div>

                    ${ini.is_public ? `
                        <span class="ini-public">Publicado</span>
                    ` : `
                        <span class="ini-private">Oculto</span>
                    `}
                </div>

                <p class="ini-description">
                    ${escapeHtml(ini.description || "Sin descripción.")}
                </p>

                <div class="ini-stats">
                    <span>
                        Copiado:
                        <strong class="copy-count">${ini.copy_count}</strong>
                    </span>

                    <span>
                        Descargas:
                        <strong class="download-count">${ini.download_count}</strong>
                    </span>
                </div>

                <details class="ini-details">
                    <summary>Ver contenido</summary>

                    <pre>${escapeHtml(ini.content)}</pre>
                </details>

                <div class="ini-actions">
                    <button
                        class="copy-ini-btn"
                        data-id="${ini.id}"
                    >
                        Copiar
                    </button>

                    <button
                        class="download-ini-btn"
                        data-id="${ini.id}"
                    >
                        Descargar
                    </button>
                </div>

                ${AppStore.isAdmin() ? `
                    <div class="ini-admin-actions">
                        <button
                            class="edit-ini-btn"
                            data-id="${ini.id}"
                        >
                            Editar
                        </button>

                        <button
                            class="delete-ini-btn"
                            data-id="${ini.id}"
                        >
                            Eliminar
                        </button>
                    </div>
                ` : ""}
            </div>
        </article>
    `;
}

function initIniEvents() {
    initIniFormEvents();
    initIniFilterEvents();
    initIniCardEvents();
}

function initIniFormEvents() {
    if (!AppStore.isAdmin()) return;

    const form = document.querySelector("#iniForm");
    const cancelButton = document.querySelector("#cancelIniEditBtn");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const editingId = document.querySelector("#editingIniId").value;

        const title = document.querySelector("#iniTitle").value.trim();
        const category = document.querySelector("#iniCategory").value;
        const description = document.querySelector("#iniDescription").value.trim();
        const contentInput = document.querySelector("#iniContent");
        const iniFile = document.querySelector("#iniFile").files[0];
        const previewFile = document.querySelector("#iniPreview").files[0];
        const isPublic = document.querySelector("#iniIsPublic").checked;

        try {
            let content = contentInput.value.trim();

            if (!content && iniFile) {
                content = await iniFile.text();
                content = content.trim();
            }

            if (title.length < 3) {
                showWarning("El nombre del INI debe tener al menos 3 caracteres.");
                return;
            }

            if (!category) {
                showWarning("Selecciona una categoría.");
                return;
            }

            if (!content) {
                showWarning("Debes pegar contenido o subir un archivo .ini.");
                return;
            }

            const currentIni = iniList.find(item => item.id === editingId);

            let filePath = currentIni?.file_path || null;
            let previewImagePath = currentIni?.preview_image_path || null;

            if (iniFile) {
                filePath = await uploadIniFile(iniFile);
            }

            if (previewFile) {
                previewImagePath = await uploadIniPreview(previewFile);
            }

            const payload = {
                title,
                category,
                description,
                content,
                file_path: filePath,
                preview_image_path: previewImagePath,
                is_public: isPublic,
                created_by: AppStore.profile?.id || null,
                updated_at: new Date().toISOString()
            };

            if (editingId) {
                const { error } = await updateIniPreset(editingId, payload);

                if (error) throw error;

                showSuccess("INI actualizado correctamente.");
            } else {
                const { data: createdIni, error } = await createIniPreset(payload);

if (error) throw error;

showSuccess("INI publicado correctamente.");

if (isPublic && createdIni?.id) {
    const { error: discordError } = await notifyDiscordNewIni(createdIni.id);

    if (discordError) {
        console.warn("Discord notification error:", discordError);
        showWarning("INI guardado, pero no se pudo avisar en Discord.");
    }
}
            }

            AppStore.setPage("inis");
        } catch (error) {
            console.error(error);
            showError(error.message || "Error guardando INI.");
        }
    });

    cancelButton.addEventListener("click", () => {
        resetIniForm();
    });
}

function initIniFilterEvents() {
    const search = document.querySelector("#iniSearch");
    const categoryFilter = document.querySelector("#iniCategoryFilter");

    if (!search || !categoryFilter) return;

    const applyFilters = () => {
        const searchValue = search.value.toLowerCase().trim();
        const categoryValue = categoryFilter.value;

        document.querySelectorAll(".ini-card").forEach(card => {
            const title = card.dataset.title.toLowerCase();
            const category = card.dataset.category;

            const matchesSearch = title.includes(searchValue);
            const matchesCategory =
                categoryValue === "all" || category === categoryValue;

            card.style.display =
                matchesSearch && matchesCategory
                    ? "block"
                    : "none";
        });
    };

    search.addEventListener("input", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);
}

function initIniCardEvents() {
    document.querySelectorAll(".copy-ini-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const id = button.dataset.id;
            const ini = iniList.find(item => item.id === id);

            if (!ini) return;

            try {
                await navigator.clipboard.writeText(ini.content);

                await incrementIniCopyCount(id);

                incrementCardCount(button, ".copy-count");

                showSuccess("INI copiado al portapapeles.");
            } catch (error) {
                console.error(error);
                showError("No se pudo copiar el INI.");
            }
        });
    });

    document.querySelectorAll(".download-ini-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const id = button.dataset.id;
            const ini = iniList.find(item => item.id === id);

            if (!ini) return;

            try {
                await incrementIniDownloadCount(id);

                incrementCardCount(button, ".download-count");

                downloadIni(ini);

                showSuccess("Descarga iniciada.");
            } catch (error) {
                console.error(error);
                showError("No se pudo descargar el INI.");
            }
        });
    });

    document.querySelectorAll(".edit-ini-btn").forEach(button => {
        button.addEventListener("click", () => {
            const ini = iniList.find(item => item.id === button.dataset.id);

            if (!ini) return;

            document.querySelector("#editingIniId").value = ini.id;
            document.querySelector("#iniTitle").value = ini.title;
            document.querySelector("#iniCategory").value = ini.category;
            document.querySelector("#iniDescription").value = ini.description || "";
            document.querySelector("#iniContent").value = ini.content;
            document.querySelector("#iniIsPublic").checked = ini.is_public;

            document.querySelector("#iniFormTitle").textContent = "Editar INI";
            document.querySelector("#saveIniBtn").textContent = "Actualizar INI";
            document.querySelector("#cancelIniEditBtn").classList.remove("hidden");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });

    document.querySelectorAll(".delete-ini-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const confirmDelete = confirm("¿Eliminar este INI?");

            if (!confirmDelete) return;

            const { error } = await deleteIniPreset(button.dataset.id);

            if (error) {
                console.error(error);
                showError("No se pudo eliminar el INI.");
                return;
            }

            showSuccess("INI eliminado correctamente.");

            AppStore.setPage("inis");
        });
    });
}

function downloadIni(ini) {
    if (ini.file_path) {
        const url = getIniFileUrl(ini.file_path);

        const link = document.createElement("a");
        link.href = url;
        link.download = buildIniFileName(ini.title);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        link.remove();

        return;
    }

    const blob = new Blob([ini.content], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = buildIniFileName(ini.title);
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function buildIniFileName(title) {
    const safeTitle = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "");

    return `${safeTitle || "ark-ini"}.ini`;
}

function incrementCardCount(button, selector) {
    const card = button.closest(".ini-card");
    const countElement = card.querySelector(selector);

    countElement.textContent = String(Number(countElement.textContent) + 1);
}

function resetIniForm() {
    document.querySelector("#editingIniId").value = "";
    document.querySelector("#iniTitle").value = "";
    document.querySelector("#iniCategory").value = "";
    document.querySelector("#iniDescription").value = "";
    document.querySelector("#iniContent").value = "";
    document.querySelector("#iniFile").value = "";
    document.querySelector("#iniPreview").value = "";
    document.querySelector("#iniIsPublic").checked = true;

    document.querySelector("#iniFormTitle").textContent = "Nuevo INI";
    document.querySelector("#saveIniBtn").textContent = "Guardar INI";
    document.querySelector("#cancelIniEditBtn").classList.add("hidden");
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
    return escapeHtml(value);
}