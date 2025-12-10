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

module.exports = router;
