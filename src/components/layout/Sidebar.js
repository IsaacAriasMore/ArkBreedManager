import { AppStore } from "../../stores/appStore";

export function Sidebar() {
    setTimeout(() => {
        bindSidebarButton("btnDashboard", "dashboard");
        bindSidebarButton("btnAllBreeds", "allBreeds");
        bindSidebarButton("btnInis", "inis");
        bindSidebarButton("btnMapsBosses", "mapsBosses");
        bindSidebarButton("btnServerMonitor", "serverMonitor");
        bindSidebarButton("btnHistory", "history");
        bindSidebarButton("btnStatistics", "statistics");

        if (AppStore.isAdmin()) {
            bindSidebarButton("btnSpecies", "species");
            bindSidebarButton("btnUsers", "users");
            bindSidebarButton("btnBreeds", "breeds");
        }
    });

    return `
        <aside class="sidebar">
            <div class="sidebar-brand">
                <span>🦖</span>
                <h2>ArkBreed</h2>
            </div>

            <nav class="sidebar-nav">
                ${navButton("btnDashboard", "dashboard", "Dashboard")}
                ${navButton("btnAllBreeds", "allBreeds", "Todos los Breeds")}
                ${navButton("btnInis", "inis", "INIs")}
                ${navButton("btnMapsBosses", "mapsBosses", "Mapas & Bosses")}
                ${navButton("btnServerMonitor", "serverMonitor", "Monitor Server")}

                ${AppStore.isAdmin() ? `
                    <div class="sidebar-section">Administración</div>

                    ${navButton("btnSpecies", "species", "Especies")}
                    ${navButton("btnUsers", "users", "Usuarios")}
                    ${navButton("btnBreeds", "breeds", "Administrar Breeds")}
                ` : ""}

                <div class="sidebar-section">Reportes</div>

                ${navButton("btnHistory", "history", "Historial")}
                ${navButton("btnStatistics", "statistics", "Estadísticas")}
            </nav>
        </aside>
    `;
}

function navButton(id, page, label) {
    const activeClass = AppStore.currentPage === page ? "active" : "";

    return `
        <button id="${id}" class="${activeClass}">
            ${label}
        </button>
    `;
}

function bindSidebarButton(id, page) {
    const button = document.querySelector(`#${id}`);

    if (!button) return;

    button.addEventListener("click", () => {
        AppStore.setPage(page);
    });
}