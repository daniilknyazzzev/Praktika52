document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");
    const messageBox = document.getElementById("message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        messageBox.textContent = "";

        if (!email || !password) {
            messageBox.textContent = "Заполните все поля";
            messageBox.style.color = "red";
            return;
        }

        try {
            // Всегда создаем нового пользователя с ролью 'sotrudnik'
            const response = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role: "sotrudnik" })
            });

            const data = await response.json();

            if (!response.ok) {
                messageBox.textContent = data.message || "Ошибка регистрации";
                messageBox.style.color = "red";
                return;
            }

            messageBox.textContent = "Регистрация успешна! Перенаправление на вход...";
            messageBox.style.color = "green";

            setTimeout(() => window.location.href = "login.html", 1000);

        } catch (error) {
            console.error(error);
            messageBox.textContent = "Ошибка подключения к серверу";
            messageBox.style.color = "red";
        }
    });
});
