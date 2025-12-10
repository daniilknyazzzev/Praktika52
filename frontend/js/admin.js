document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const usersTable = document.getElementById("usersTable");
    const createUserBtn = document.getElementById("createUserBtn");
    const userMessage = document.getElementById("userMessage");
    const logoutBtn = document.getElementById("logoutBtn");

    async function loadUsers() {
        usersTable.innerHTML = "";
        try {
            const res = await fetch("http://localhost:3000/api/users", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const users = await res.json();
            users.forEach(u => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${u.id}</td>
                    <td>${u.email}</td>
                    <td>
                        <select data-id="${u.id}">
                            <option value="user" ${u.role === "user" ? "selected" : ""}>Сотрудник</option>
                            <option value="admin" ${u.role === "admin" ? "selected" : ""}>Администратор</option>
                        </select>
                    </td>
                    <td>
                        <button class="delete" data-id="${u.id}">Удалить</button>
                    </td>
                `;
                usersTable.appendChild(tr);
            });

            // Смена роли
            document.querySelectorAll('select').forEach(sel => {
                sel.addEventListener('change', async e => {
                    const id = e.target.dataset.id;
                    const role = e.target.value;
                    try {
                        await fetch(`http://localhost:3000/api/users/${id}/role`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({ role })
                        });
                    } catch (err) { console.error(err); }
                });
            });

            // Удаление
            document.querySelectorAll('button.delete').forEach(btn => {
                btn.addEventListener('click', async e => {
                    if (!confirm("Удалить пользователя?")) return;
                    const id = e.target.dataset.id;
                    try {
                        await fetch(`http://localhost:3000/api/users/${id}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        loadUsers();
                    } catch (err) { console.error(err); }
                });
            });

        } catch (err) {
            console.error(err);
        }
    }

    // Создание нового пользователя
    createUserBtn.addEventListener("click", async () => {
        const email = document.getElementById("newEmail").value.trim();
        const password = document.getElementById("newPassword").value.trim();
        const role = document.getElementById("newRole").value;

        if (!email || !password) {
            userMessage.textContent = "Заполните все поля";
            userMessage.style.color = "red";
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ email, password, role })
            });
            const data = await res.json();
            userMessage.textContent = data.message;
            userMessage.style.color = "green";
            loadUsers();
        } catch (err) {
            console.error(err);
        }
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "login.html";
    });

    loadUsers();
});
