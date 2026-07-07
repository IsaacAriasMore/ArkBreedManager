import { AppStore } from "./stores/appStore";

import { getSession, getUserProfile } from "./services/authService";

import { LoginPage } from "./pages/login";
import { DashboardPage } from "./pages/dashboard";
import { AllBreedsPage } from "./pages/allBreeds";
import { SpeciesPage } from "./pages/species";
import { UsersPage } from "./pages/users";
import { BreedsPage } from "./pages/breeds";
import { StatisticsPage } from "./pages/statistics";
import { HistoryPage } from "./pages/history";

const pages = {
    dashboard: {
        component: DashboardPage,
        roles: ["admin", "breeder"]
    },

    species: {
        component: SpeciesPage,
        roles: ["admin"]
    },

    users: {
        component: UsersPage,
        roles: ["admin"]
    },

    breeds: {
        component: BreedsPage,
        roles: ["admin"]
    },

    history: {
        component: HistoryPage,
        roles: ["admin", "breeder"]
    },

    statistics: {
        component: StatisticsPage,
        roles: ["admin", "breeder"]
    },
    allBreeds: {
    component: AllBreedsPage,
    roles: ["admin", "breeder"]
},
};

export async function initApp() {
    window.addEventListener("page-change", renderApp);
    window.addEventListener("auth-change", renderApp);

    await loadInitialSession();

    renderApp();
}

async function loadInitialSession() {
    const { session } = await getSession();

    if (!session) {
        AppStore.loading = false;
        return;
    }

    const authUser = session.user;

    const profileResult = await getUserProfile(authUser.id);

    if (profileResult.error) {
        AppStore.clearAuth();
        return;
    }

    AppStore.session = session;
    AppStore.authUser = authUser;
    AppStore.profile = profileResult.data;
    AppStore.loading = false;
}

export async function renderApp() {
    const app = document.querySelector("#app");

    if (AppStore.loading) {
        app.innerHTML = `
            <div class="loading-screen">
                Cargando ArkBreed...
            </div>
        `;

        return;
    }

    if (!AppStore.session || !AppStore.profile) {
        app.innerHTML = LoginPage();
        return;
    }

    const pageConfig = pages[AppStore.currentPage];

    if (!pageConfig) {
        AppStore.setPage("dashboard");
        return;
    }

    const userRole = AppStore.profile.role;

    if (!pageConfig.roles.includes(userRole)) {
        AppStore.setPage("dashboard");
        return;
    }

    app.innerHTML = await pageConfig.component();
}