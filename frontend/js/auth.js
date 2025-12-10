// логика входа
const loginForm = document.getElementById('loginForm');
if (loginForm) {
loginForm.addEventListener('submit', async (e) => {
e.preventDefault();
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
const resp = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
if (resp && resp.token) {
localStorage.setItem('token', resp.token);
localStorage.setItem('role', resp.role || 'user');
// redirect
window.location.href = 'index.html';
} else {
alert(resp.message || 'Ошибка входа');
}
});
}