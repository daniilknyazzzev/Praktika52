const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Получение всех новостей
router.get('/', (req, res) => {
    const query = 'SELECT * FROM news ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
        res.json(results);
    });
});

// Создание новой новости
router.post('/', (req, res) => {
    const { title, content, creator_id } = req.body;
    const query = 'INSERT INTO news (title, content, creator_id) VALUES (?, ?, ?)';
    db.query(query, [title, content, creator_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Ошибка создания новости', error: err });
        res.json({ newsId: result.insertId, message: 'Новость создана' });
    });
});

// Удаление новости (только админ)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Нет токена' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') return res.status(403).json({ message: 'Только админ может удалять новости' });

        const query = 'DELETE FROM news WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Ошибка удаления новости', error: err });
            res.json({ message: 'Новость удалена' });
        });
    } catch (err) {
        return res.status(401).json({ message: 'Неверный токен', error: err });
    }
});

module.exports = router;
