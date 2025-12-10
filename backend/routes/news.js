const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// --- AUTH MIDDLEWARE -----------
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Нет токена' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Неверный токен', error: err });
    }
}

// --- ADMIN ONLY MIDDLEWARE -----------------
function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Доступ запрещён! Только администратор.' });
    }
    next();
}


// --- get news -----------------------
router.get('/', (req, res) => {
    const query = 'SELECT * FROM news ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
        res.json(results);
    });
});


// --- create news user and admin--------
router.post('/', authMiddleware, (req, res) => {
    const { title, content } = req.body;
    const creator_id = req.user.id;

    if (!title || !content) {
        return res.status(400).json({ message: 'Не все поля заполнены' });
    }

    const query = 'INSERT INTO news (title, content, creator_id) VALUES (?, ?, ?)';
    db.query(query, [title, content, creator_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Ошибка создания новости', error: err });
        res.json({ message: 'Новость создана', newsId: result.insertId });
    });
});


// --- delete news ADMIN  -------
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM news WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Ошибка удаления новости', error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Новость не найдена' });
        }

        res.json({ message: 'Новость удалена' });
    });
});


module.exports = router;
