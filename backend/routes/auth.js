const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Введите email и пароль' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });

        if (results.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const user = results[0];

        // Проверка пароля (открытый текст)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Неверный пароль' });
        }

        // Генерация JWT токена
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1h' }
        );

        res.json({ token, role: user.role });
    });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Заполните все поля' });
    }

    // Проверяем, нет ли такого email
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });

        if (results.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const insertQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
        db.query(insertQuery, [email, password, role], (err, result) => {
            if (err) return res.status(500).json({ message: 'Ошибка регистрации', error: err });

            res.json({ message: 'Пользователь зарегистрирован', userId: result.insertId });
        });
    });
});

module.exports = router;
