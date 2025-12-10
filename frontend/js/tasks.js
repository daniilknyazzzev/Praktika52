document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const payload = JSON.parse(atob(token.split('.')[1])); // получаем данные из JWT
    const userId = payload.id;

    const tasksContainer = document.getElementById("tasksContainer");
    const createTaskForm = document.getElementById("createTaskForm");
    const logoutBtn = document.getElementById("logoutBtn");

    // Получение списка задач
    async function loadTasks() {
        tasksContainer.innerHTML = "";
        try {
            const res = await fetch("http://localhost:3000/api/tasks", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const tasks = await res.json();

            tasks.forEach(task => {
                const card = document.createElement("div");
                card.className = "task-card";
                card.dataset.id = task.id;

                card.innerHTML = `
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <p>Статус: <span class="status-text">${task.status}</span></p>
                    <p>Исполнитель ID: ${task.assignee_id}</p>
                    <p>Дедлайн: ${task.deadline.split('T')[0]}</p>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button class="status-btn">Сменить статус</button>
                        <button class="delete-btn">Удалить задачу</button>
                    </div>
                `;

                // Смена статуса
                card.querySelector(".status-btn").addEventListener("click", async () => {
                    const newStatus = task.status === "не выполнена" ? "выполнена" : "не выполнена";
                    try {
                        const res = await fetch(`http://localhost:3000/api/tasks/${task.id}/status`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({ status: newStatus })
                        });
                        if (res.ok) {
                            task.status = newStatus;
                            card.querySelector(".status-text").textContent = newStatus;
                        } else {
                            const data = await res.json();
                            alert(data.message || "Ошибка при смене статуса");
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Ошибка при смене статуса");
                    }
                });

                // Удаление задачи
                card.querySelector(".delete-btn").addEventListener("click", async () => {
                    if (!confirm("Удалить эту задачу?")) return;
                    try {
                        const res = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (res.ok) {
                            loadTasks();
                        } else {
                            const data = await res.json();
                            alert(data.message || "Ошибка при удалении задачи");
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Ошибка при удалении задачи");
                    }
                });

                tasksContainer.appendChild(card);
            });
        } catch (err) {
            console.error(err);
            tasksContainer.textContent = "Ошибка загрузки задач";
        }
    }

    loadTasks();

    // Создание новой задачи
    createTaskForm.addEventListener("submit", async e => {
        e.preventDefault();
        const title = document.getElementById("t_title").value.trim();
        const description = document.getElementById("t_description").value.trim();
        const assignee_id = document.getElementById("t_assignee").value;
        const deadline = document.getElementById("t_deadline").value;

        if (!title || !assignee_id || !deadline) {
            alert("Пожалуйста, заполните все обязательные поля");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, assignee_id, deadline, creator_id: userId })
            });
            if (res.ok) {
                createTaskForm.reset();
                loadTasks();
            } else {
                const data = await res.json();
                alert(data.message || "Ошибка при создании задачи");
            }
        } catch (err) {
            console.error(err);
            alert("Ошибка подключения к серверу");
        }
    });

    // Выход
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "login.html";
    });
});
