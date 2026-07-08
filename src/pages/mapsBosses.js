import { Layout } from "../components/layout/Layout";
import {
    ARK_MAPS,
    DIFFICULTIES,
    DIFFICULTY_LABELS
} from "../data/arkBosses";
import { AppStore } from "../stores/appStore";

let currentLanguage = localStorage.getItem("bossLanguage") || "es";
let selectedMapSlug = localStorage.getItem("selectedBossMap") || "the-island";
let selectedDifficulty = localStorage.getItem("selectedBossDifficulty") || "gamma";

export async function MapsBossesPage() {
    const selectedMap =
        ARK_MAPS.find(map => map.slug === selectedMapSlug) ||
        ARK_MAPS[0];

    selectedMapSlug = selectedMap.slug;

    setTimeout(() => {
        initMapsBossesEvents();
    });

    return Layout(`
        <div class="page-header maps-bosses-header">
            <div>
                <h1>Mapas & Bosses</h1>
                <p>Consulta bosses, artefactos y tributos por mapa. Marca lo que ya tienes preparado.</p>
            </div>

            <div class="language-toggle">
                <button
                    id="langEsBtn"
                    class="${currentLanguage === "es" ? "active" : ""}"
                >
                    Español
                </button>

                <button
                    id="langEnBtn"
                    class="${currentLanguage === "en" ? "active" : ""}"
                >
                    English
                </button>
            </div>
        </div>

        <section class="maps-grid">
            ${ARK_MAPS.map(map => renderMapCard(map)).join("")}
        </section>

        <section class="map-detail-card">
            <div class="map-detail-banner">
                <img
                    src="${selectedMap.image}"
                    alt="${selectedMap.name}"
                >

                <div>
                    <h2>${selectedMap.name}</h2>
                    <p>${selectedMap.description[currentLanguage]}</p>
                    <span>${selectedMap.bosses.length} bosses</span>
                </div>
            </div>

            <div class="difficulty-tabs">
                ${DIFFICULTIES.map(difficulty => `
                    <button
                        class="difficulty-btn ${selectedDifficulty === difficulty ? "active" : ""}"
                        data-difficulty="${difficulty}"
                    >
                        ${DIFFICULTY_LABELS[currentLanguage][difficulty]}
                    </button>
                `).join("")}
            </div>

            <div class="bosses-grid">
                ${selectedMap.bosses.map((boss, bossIndex) => renderBossCard(boss, bossIndex)).join("")}
            </div>
        </section>
    `);
}

function renderMapCard(map) {
    const isActive = map.slug === selectedMapSlug;

    return `
        <button
            class="map-card ${isActive ? "active" : ""}"
            data-map-slug="${map.slug}"
        >
            <img
                src="${map.image}"
                alt="${map.name}"
            >

            <div>
                <h3>${map.name}</h3>
                <p>${map.bosses.length} bosses</p>
            </div>
        </button>
    `;
}

function renderBossCard(boss, bossIndex) {
    const requirements = boss.requirements?.[selectedDifficulty] || {
        artifacts: [],
        tributes: []
    };

   const allRequirements = [
    ...requirements.artifacts.map((item, itemIndex) => ({
        ...item,
        type: "artifact",
        itemIndex
    })),
    ...requirements.tributes.map((item, itemIndex) => ({
        ...item,
        type: "tribute",
        itemIndex
    }))
];

const total = allRequirements.length;

const completed = allRequirements.filter(item => {
    const key = getChecklistKey(
        bossIndex,
        item.type,
        item.en,
        item.itemIndex
    );

    return localStorage.getItem(key) === "true";
}).length;

    const progressPercent = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    return `
        <article class="boss-card">
            <img
                src="${boss.image}"
                alt="${boss.name}"
            >

            <div class="boss-body">
                <div class="boss-title-row">
                    <div>
                        <h3>${boss.name}</h3>
                        <p>${boss.description[currentLanguage]}</p>
                    </div>

                    <button
                        class="reset-checklist-btn"
                        data-boss-index="${bossIndex}"
                    >
                        ${currentLanguage === "es" ? "Reiniciar checklist" : "Reset checklist"}
                    </button>
                </div>

                <div class="boss-progress">
                    <div class="boss-progress-info">
                        <span>
                            ${currentLanguage === "es" ? "Progreso" : "Progress"}:
                            <strong>${completed} / ${total}</strong>
                        </span>

                        <small>${progressPercent}%</small>
                    </div>

                    <div class="boss-progress-bar">
                        <div style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <div class="requirements-grid">
                    <div class="requirement-box">
                        <h4>
                            ${currentLanguage === "es" ? "Artefactos" : "Artifacts"}
                        </h4>

                        ${renderRequirementList(requirements.artifacts, bossIndex, "artifact")}
                    </div>

                    <div class="requirement-box">
                        <h4>
                            ${currentLanguage === "es" ? "Tributos" : "Tributes"}
                        </h4>

                        ${renderRequirementList(requirements.tributes, bossIndex, "tribute")}
                    </div>
                </div>
            </div>
        </article>
    `;
}

function renderRequirementList(items, bossIndex, type) {
    if (!items || items.length === 0) {
        return `
            <p class="empty-requirements">
                ${currentLanguage === "es"
                    ? "No requiere items en esta sección."
                    : "No items required in this section."
                }
            </p>
        `;
    }

    return `
        <ul class="requirement-list checklist-list">
            ${items.map((item, itemIndex) => {
                const key = getChecklistKey(bossIndex, type, item.en, itemIndex);
                const checked = localStorage.getItem(key) === "true";

                return `
                    <li class="${checked ? "completed" : ""}">
                        <label>
                            <input
                                type="checkbox"
                                class="requirement-checkbox"
                                data-check-key="${key}"
                                ${checked ? "checked" : ""}
                            >

                            <span>${item[currentLanguage]}</span>
                        </label>

                        <strong>x${item.amount}</strong>
                    </li>
                `;
            }).join("")}
        </ul>
    `;
}

function getChecklistKey(bossIndex, type, itemName, itemIndex) {
    return [
        "arkbreedBossChecklist",
        selectedMapSlug,
        bossIndex,
        selectedDifficulty,
        type,
        itemIndex,
        itemName
    ].join(":");
}

function getBossChecklistPrefix(bossIndex) {
    return [
        "arkbreedBossChecklist",
        selectedMapSlug,
        bossIndex,
        selectedDifficulty
    ].join(":");
}

function initMapsBossesEvents() {
    document.querySelector("#langEsBtn")?.addEventListener("click", () => {
        currentLanguage = "es";
        localStorage.setItem("bossLanguage", currentLanguage);
        AppStore.setPage("mapsBosses");
    });

    document.querySelector("#langEnBtn")?.addEventListener("click", () => {
        currentLanguage = "en";
        localStorage.setItem("bossLanguage", currentLanguage);
        AppStore.setPage("mapsBosses");
    });

    document.querySelectorAll(".map-card").forEach(card => {
        card.addEventListener("click", () => {
            selectedMapSlug = card.dataset.mapSlug;
            localStorage.setItem("selectedBossMap", selectedMapSlug);
            AppStore.setPage("mapsBosses");
        });
    });

    document.querySelectorAll(".difficulty-btn").forEach(button => {
        button.addEventListener("click", () => {
            selectedDifficulty = button.dataset.difficulty;
            localStorage.setItem("selectedBossDifficulty", selectedDifficulty);
            AppStore.setPage("mapsBosses");
        });
    });

    document.querySelectorAll(".requirement-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            const key = checkbox.dataset.checkKey;

            if (!key) return;

            localStorage.setItem(key, checkbox.checked ? "true" : "false");
            AppStore.setPage("mapsBosses");
        });
    });

    document.querySelectorAll(".reset-checklist-btn").forEach(button => {
        button.addEventListener("click", () => {
            const bossIndex = button.dataset.bossIndex;

            if (bossIndex === undefined) return;

            const prefix = getBossChecklistPrefix(bossIndex);

            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(prefix)) {
                    localStorage.removeItem(key);
                }
            });

            AppStore.setPage("mapsBosses");
        });
    });
}