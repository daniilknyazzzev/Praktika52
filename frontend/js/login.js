document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form'); // id совпадает с HTML
    const messageEl = document.getElementById('message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        messageEl.textContent = '';

        if (!email || !password) {
            messageEl.textContent = 'Заполните все поля';
            messageEl.style.color = 'red';
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                messageEl.textContent = data.message || 'Ошибка входа';
                messageEl.style.color = 'red';
            } else {
    // Сохраняем токен, роль и имя пользователя
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('name', data.name);

    // Переход на главную страницу вместо профиля
    window.location.href = 'index.html';
            }
        } catch (err) {
            console.error(err);
            messageEl.textContent = 'Ошибка подключения к серверу';
            messageEl.style.color = 'red';
        }
    });
});
