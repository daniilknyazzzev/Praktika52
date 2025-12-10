const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Middleware для проверки JWT и роли admin
function adminAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Нет токена' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        if (decoded.role !== 'admin') return res.status(403).json({ message: 'Доступ запрещён' });
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Неверный токен', error: err });
    }
}

// Получить всех пользователей
router.get('/users', adminAuth, (req, res) => {
    const query = 'SELECT id, email, role FROM users ORDER BY id';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
        res.json(results);
    });
});

// Добавить нового пользователя
router.post('/users', adminAuth, async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'Заполните все поля' });

    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
        if (results.length > 0) return res.status(400).json({ message: 'Пользователь с таким email уже существует' });

        const hashedPass = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
        db.query(insertQuery, [email, hashedPass, role], (err, result) => {
            if (err) return res.status(500).json({ message: 'Ошибка создания пользователя', error: err });
            res.json({ message: 'Пользователь добавлен', userId: result.insertId });
        });
    });
});

// Изменить роль пользователя
router.put('/users/:id', adminAuth, (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'Укажите роль' });

    const query = 'UPDATE users SET role = ? WHERE id = ?';
    db.query(query, [role, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Ошибка обновления роли', error: err });
        res.json({ message: 'Роль пользователя обновлена' });
    });
});

// Удалить пользователя
router.delete('/users/:id', adminAuth, (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Ошибка удаления пользователя', error: err });
        res.json({ message: 'Пользователь удалён' });
    });
});

module.exports = router;
