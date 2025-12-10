const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// --- LOGIN --------------------------------------------------------
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

        // Генерация JWT токена с email
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.email },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '4h' }
        );

        res.json({ 
            token, 
            role: user.role,
            name: user.email // отправляем фронту email
        });
    });
});

// --- REGISTER --------------------------------------------------------
router.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Пользовательская роль всегда "user"
    const role = "user";

    if (!email || !password) {
        return res.status(400).json({ message: 'Заполните все поля' });
    }

    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });

        if (results.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const insertQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
        db.query(insertQuery, [email, password, role], (err, result) => {
            if (err) return res.status(500).json({ message: 'Ошибка регистрации', error: err });

            res.json({ 
                message: 'Пользователь зарегистрирован', 
                userId: result.insertId,
                role: "user"
            });
        });
    });
});

module.exports = router;
