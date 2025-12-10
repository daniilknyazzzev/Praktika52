document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const messageBox = document.getElementById("message");

    if (!form) {
        console.error("Форма #login-form не найдена");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        messageBox.textContent = "";

        try {
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                messageBox.textContent = data.message || "Ошибка входа";
                messageBox.style.color = "red";
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            messageBox.textContent = "Успешный вход!";
            messageBox.style.color = "green";

            // Переход на главную страницу
            setTimeout(() => window.location.href = "index.html", 500);

        } catch (error) {
            console.error(error);
            messageBox.textContent = "Ошибка подключения к серверу";
            messageBox.style.color = "red";
        }
    });
});
