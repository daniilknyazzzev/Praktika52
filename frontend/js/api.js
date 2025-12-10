// Простая обёртка для fetch с токеном
const API_BASE = 'http://localhost:3000/api';


async function apiFetch(path, opts = {}) 
{
const token = localStorage.getItem('token');
opts.headers = opts.headers || {};
if (token) opts.headers['Authorization'] = 'Bearer ' + token;
if (opts.body && !(opts.body instanceof FormData)) {
opts.headers['Content-Type'] = 'application/json';
opts.body = JSON.stringify(opts.body);
}
const res = await fetch(API_BASE + path, opts);
const text = await res.text();
try { return JSON.parse(text); } catch(e) { return text; }
}