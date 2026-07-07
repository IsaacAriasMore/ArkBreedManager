import { Layout } from "../components/layout/Layout";
import {
    getUsers,
    createUserProfile,
    updateUserProfile,
    deleteUserProfile
} from "../services/userService";
import { AppStore } from "../stores/appStore";

let usersList = [];

export async function UsersPage() {
    const { data, error } = await getUsers();

    if (error) {
        console.error(error);

        return Layout(`
            <h1>Usuarios</h1>
            <p>Error cargando usuarios.</p>
        `);
    }

    usersList = data || [];

    setTimeout(() => {
        initUserEvents();
    });

    return Layout(`
        <div class="page-header">
            <div>
                <h1>Usuarios</h1>
                <p>Administra perfiles y roles dentro de ArkBreed.</p>
            </div>
        </div>

        <div class="notice-card">
            <strong>Importante:</strong>
            Para crear un usuario nuevo, primero créalo en Supabase Authentication.
            Luego copia su UUID y registra aquí su perfil.
        </div>

        <form id="userForm" class="form-card">
            <h2 id="userFormTitle">Nuevo Usuario</h2>

            <input id="editingUserId" type="hidden">

            <input
                id="userId"
                placeholder="UUID del usuario en Supabase Auth"
                required
            >

            <input
                id="userName"
                placeholder="Nombre del usuario"
                required
            >

            <select id="userRole" required>
                <option value="breeder">Breeder</option>
                <option value="admin">Admin</option>
            </select>

            <small class="form-help">
                Al editar un usuario, el UUID no se puede cambiar.
            </small>

            <div class="form-actions">
                <button type="submit" id="saveUserBtn">
                    Guardar Usuario
                </button>

                <button type="button" id="cancelUserEditBtn" class="secondary-btn hidden">
                    Cancelar edición
                </button>
            </div>
        </form>

        <input
            id="searchUsers"
            class="search-input"
            placeholder="Buscar usuario..."
        >

        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>UUID</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    ${usersList.length === 0 ? `
                        <tr>
                            <td colspan="4">
                                No hay usuarios registrados.
                            </td>
                        </tr>
                    ` : usersList.map(user => `
                        <tr class="user-row">
                            <td class="user-name-cell">
                                ${user.name}
                            </td>

                            <td>
                                <span class="role-badge ${user.role}">
                                    ${user.role}
                                </span>
                            </td>

                            <td class="uuid-cell">
                                ${user.id}
                            </td>

                            <td>
                                <div class="user-actions">
                                    <button
                                        class="edit-user-btn"
                                        data-id="${user.id}"
                                    >
                                        Editar
                                    </button>

                                    <button
                                        class="delete-user-btn"
                                        data-id="${user.id}"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `);
}

function initUserEvents() {
    const form = document.querySelector("#userForm");
    const cancelUserEditBtn = document.querySelector("#cancelUserEditBtn");
    const searchUsers = document.querySelector("#searchUsers");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const editingId = document.querySelector("#editingUserId").value;

        const id = document.querySelector("#userId").value.trim();
        const name = document.querySelector("#userName").value.trim();
        const role = document.querySelector("#userRole").value;

        try {
            if (editingId) {
                const { data, error } = await updateUserProfile(editingId, {
                    name,
                    role
                });

                if (error) throw error;

                if (AppStore.profile?.id === editingId) {
                    AppStore.profile = data;
                }
            } else {
                const { error } = await createUserProfile({
                    id,
                    name,
                    role
                });

                if (error) throw error;
            }

            AppStore.setPage("users");
        } catch (error) {
            console.error(error);
            alert("Error al guardar usuario. Revisa que el UUID exista en Authentication.");
        }
    });

    cancelUserEditBtn.addEventListener("click", () => {
        resetUserForm();
    });

    document.querySelectorAll(".edit-user-btn").forEach(button => {
        button.addEventListener("click", () => {
            const user = usersList.find(item => item.id === button.dataset.id);

            if (!user) return;

            document.querySelector("#editingUserId").value = user.id;
            document.querySelector("#userId").value = user.id;
            document.querySelector("#userName").value = user.name;
            document.querySelector("#userRole").value = user.role;

            document.querySelector("#userId").readOnly = true;

            document.querySelector("#userFormTitle").textContent = "Editar Usuario";
            document.querySelector("#saveUserBtn").textContent = "Actualizar Usuario";
            document.querySelector("#cancelUserEditBtn").classList.remove("hidden");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });

    document.querySelectorAll(".delete-user-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const userId = button.dataset.id;

            if (userId === AppStore.profile?.id) {
                alert("No puedes eliminar tu propio perfil mientras estás conectado.");
                return;
            }

            const confirmDelete = confirm("¿Eliminar este usuario de ArkBreed?");

            if (!confirmDelete) return;

            const { error } = await deleteUserProfile(userId);

            if (error) {
                console.error(error);
                alert("No se pudo eliminar el usuario.");
                return;
            }

            AppStore.setPage("users");
        });
    });

    searchUsers.addEventListener("input", () => {
        const value = searchUsers.value.toLowerCase().trim();

        document.querySelectorAll(".user-row").forEach(row => {
            const name = row.querySelector(".user-name-cell").textContent.toLowerCase();
            const uuid = row.querySelector(".uuid-cell").textContent.toLowerCase();

            row.style.display =
                name.includes(value) || uuid.includes(value)
                    ? "table-row"
                    : "none";
        });
    });
}

function resetUserForm() {
    document.querySelector("#editingUserId").value = "";
    document.querySelector("#userId").value = "";
    document.querySelector("#userName").value = "";
    document.querySelector("#userRole").value = "breeder";

    document.querySelector("#userId").readOnly = false;

    document.querySelector("#userFormTitle").textContent = "Nuevo Usuario";
    document.querySelector("#saveUserBtn").textContent = "Guardar Usuario";
    document.querySelector("#cancelUserEditBtn").classList.add("hidden");
}