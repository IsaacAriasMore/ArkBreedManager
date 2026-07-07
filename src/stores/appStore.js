export const AppStore = {
    currentPage: "dashboard",

    session: null,
    authUser: null,
    profile: null,

    loading: true,

    setPage(page) {
        this.currentPage = page;
        window.dispatchEvent(new Event("page-change"));
    },

    setAuth({ session, authUser, profile }) {
        this.session = session;
        this.authUser = authUser;
        this.profile = profile;
        this.loading = false;
        this.currentPage = "dashboard";

        window.dispatchEvent(new Event("auth-change"));
    },

    clearAuth() {
        this.session = null;
        this.authUser = null;
        this.profile = null;
        this.loading = false;
        this.currentPage = "dashboard";

        window.dispatchEvent(new Event("auth-change"));
    },

    isAdmin() {
        return this.profile?.role === "admin";
    },

    isBreeder() {
        return this.profile?.role === "breeder";
    }
};