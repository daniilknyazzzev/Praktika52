document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // Роль текущего пользователя
    const createNewsForm = document.getElementById("createNewsForm");
    const newsMessage = document.getElementById("newsMessage");
    const newsContainer = document.getElementById("newsContainer");
    const logoutBtn = document.getElementById("logoutBtn");

    // Загрузка списка новостей
    async function loadNews() {
        newsContainer.innerHTML = "";
        try {
            const res = await fetch("http://localhost:3000/api/news");
            const news = await res.json();

            news.forEach(n => {
                const div = document.createElement("div");
                div.className = "news-card";

                div.innerHTML = `
                    <h3>${n.title}</h3>
                    <p>${n.content}</p>
                    <small>Создано: ${new Date(n.created_at).toLocaleString()}</small>
                `;

                // Если роль admin, добавляем кнопку удаления
                if (role === "admin") {
                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "Удалить";
                    deleteBtn.style.marginTop = "10px";
                    deleteBtn.style.background = "#ff3b30";
                    deleteBtn.style.color = "#fff";
                    deleteBtn.style.border = "none";
                    deleteBtn.style.padding = "8px 12px";
                    deleteBtn.style.borderRadius = "8px";
                    deleteBtn.style.cursor = "pointer";

                    deleteBtn.addEventListener("click", async () => {
                        if (!confirm("Удалить эту новость?")) return;
                        try {
                            const res = await fetch(`http://localhost:3000/api/news/${n.id}`, {
                                method: "DELETE",
                                headers: { "Authorization": `Bearer ${token}` }
                            });
                            if (res.ok) {
                                loadNews();
                            } else {
                                const data = await res.json();
                                alert(data.message || "Ошибка при удалении новости");
                            }
                        } catch (err) {
                            console.error(err);
                            alert("Ошибка при удалении новости");
                        }
                    });

                    div.appendChild(deleteBtn);
                }

                newsContainer.appendChild(div);
            });
        } catch (err) {
            console.error(err);
            newsContainer.textContent = "Ошибка загрузки новостей";
        }
    }

    // Создание новости
    createNewsForm.addEventListener("submit", async e => {
        e.preventDefault();
        const title = document.getElementById("news_title").value.trim();
        const content = document.getElementById("news_content").value.trim();
        newsMessage.textContent = "";

        if (!title || !content) {
            newsMessage.textContent = "Заполните все поля";
            newsMessage.style.color = "red";
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/news", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })
            });

            const data = await res.json();

            if (!res.ok) {
                newsMessage.textContent = data.message || "Ошибка публикации";
                newsMessage.style.color = "red";
            } else {
                newsMessage.textContent = "Новость опубликована!";
                newsMessage.style.color = "green";
                createNewsForm.reset();
                loadNews();
            }
        } catch (err) {
            console.error(err);
            newsMessage.textContent = "Ошибка подключения к серверу";
            newsMessage.style.color = "red";
        }
    });

    // Кнопка выхода
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "login.html";
    });

    loadNews();
});
