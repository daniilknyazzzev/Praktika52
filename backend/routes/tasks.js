const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Middleware для проверки JWT
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

// Получить все задачи
router.get('/', authMiddleware, (req, res) => {
    const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
        res.json(results);
    });
});

// Создать новую задачу
router.post('/', authMiddleware, (req, res) => {
    const { title, description, creator_id, assignee_id, deadline } = req.body;
    if (!title || !creator_id || !assignee_id || !deadline) {
        return res.status(400).json({ message: 'Не все поля заполнены' });
    }

    const query = 'INSERT INTO tasks (title, description, creator_id, assignee_id, deadline, status, created_at) VALUES (?, ?, ?, ?, ?, "не выполнена", NOW())';
    db.query(query, [title, description, creator_id, assignee_id, deadline], (err, result) => {
        if (err) return res.status(500).json({ message: 'Ошибка создания задачи', error: err });
        res.json({ message: 'Задача создана', taskId: result.insertId });
    });
});


// Изменить статус задачи
router.put('/:id/status', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // "не выполнена" или "выполнена"
    const query = 'UPDATE tasks SET status = ? WHERE id = ?';
    db.query(query, [status, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Ошибка обновления статуса', error: err });
        res.json({ message: 'Статус обновлён' });
    });
});

// Редактировать задачу
router.put('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { title, description, assignee_id, deadline } = req.body;
    const query = 'UPDATE tasks SET title = ?, description = ?, assignee_id = ?, deadline = ? WHERE id = ?';
    db.query(query, [title, description, assignee_id, deadline, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Ошибка обновления задачи', error: err });
        res.json({ message: 'Задача обновлена' });
    });
});

// Получить задачу по id
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM tasks WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
        if (results.length === 0) return res.status(404).json({ message: 'Задача не найдена' });
        res.json(results[0]);
    });
});

//удаленние задачи
router.delete('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM tasks WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Ошибка удаления задачи', error: err });
        res.json({ message: 'Задача удалена' });
    });
});


module.exports = router;
