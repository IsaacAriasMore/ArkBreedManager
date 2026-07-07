let toastContainer = null;

function createToastContainer() {
    if (toastContainer) return toastContainer;

    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    document.body.appendChild(toastContainer);

    return toastContainer;
}

export function showToast(message, type = "info", duration = 3500) {
    const container = createToastContainer();

    const toast = document.createElement("div");
    toast.className = `app-toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 20);

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 250);
    }, duration);
}

export function showSuccess(message) {
    showToast(message, "success");
}

export function showError(message) {
    showToast(message, "error", 4500);
}

export function showWarning(message) {
    showToast(message, "warning", 4000);
}

export function setupFeedback() {
    window.alert = (message) => {
        showError(String(message));
    };

    window.showToast = showToast;
}