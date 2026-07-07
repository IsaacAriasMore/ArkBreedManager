import { login, getUserProfile } from "../services/authService";
import { AppStore } from "../stores/appStore";

export function LoginPage() {
    setTimeout(() => {
        initLoginEvents();
    });

    return `
        <main class="auth-page">
            <section class="auth-card">
                <div class="auth-logo">
                    🦖
                </div>

                <h1>ArkBreed</h1>

                <p>
                    Inicia sesión para administrar tus breeds.
                </p>

                <form id="loginForm" class="auth-form">
                    <input
                        id="email"
                        type="email"
                        placeholder="Correo"
                        autocomplete="email"
                        required
                    >

                    <input
                        id="password"
                        type="password"
                        placeholder="Contraseña"
                        autocomplete="current-password"
                        required
                    >

                    <button type="submit">
                        Iniciar sesión
                    </button>
                </form>

                <small id="loginError" class="auth-error"></small>
            </section>
        </main>
    `;
}

function initLoginEvents() {
    const form = document.querySelector("#loginForm");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value.trim();
        const errorText = document.querySelector("#loginError");

        errorText.textContent = "";

        const { data, error } = await login(email, password);

        if (error) {
            errorText.textContent = "Correo o contraseña incorrectos.";
            return;
        }

        const authUser = data.user;
        const session = data.session;

        const profileResult = await getUserProfile(authUser.id);

        if (profileResult.error) {
            errorText.textContent = "Este usuario no tiene perfil asignado en ArkBreed.";
            return;
        }

        AppStore.setAuth({
            session,
            authUser,
            profile: profileResult.data
        });
    });
}