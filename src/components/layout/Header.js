import { AppStore } from "../../stores/appStore";
import { logout } from "../../services/authService";

const pageTitles = {
    dashboard: "Dashboard",
    allBreeds: "Todos los Breeds",
    inis: "INIs",
    mapsBosses: "Mapas & Bosses",
    serverMonitor: "Monitor Server",
    species: "Especies",
    users: "Usuarios",
    breeds: "Administrar Breeds",
    history: "Historial",
    statistics: "Estadísticas"
};

export function Header() {
    setTimeout(() => {
        const logoutButton = document.querySelector("#logoutBtn");

        if (!logoutButton) return;

        logoutButton.addEventListener("click", async () => {
            await logout();
            AppStore.clearAuth();
        });
    });

    return `
        <header class="header">
            <div class="header-title">
                <h3>${pageTitles[AppStore.currentPage] || "ArkBreed Manager"}</h3>
                <span>ArkBreed Manager</span>
            </div>

            <div class="header-user">
                <div class="header-user-info">
                    <strong>${AppStore.profile?.name || "Usuario"}</strong>
                    <small>${AppStore.profile?.role || ""}</small>
                </div>

                <button id="logoutBtn">
                    Cerrar sesión
                </button>
            </div>
        </header>
    `;
}