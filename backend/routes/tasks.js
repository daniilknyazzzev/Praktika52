const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// --- AUTH MIDDLEWARE ----------------------------------------------------
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

// --- ADMIN ONLY ---------------------------------------------------------
function adminOnly(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Доступ запрещён! Только администратор." });
    }
    next();
}


// --- GET ALL TASKS (user + admin) --------------------------------------
router.get('/', authMiddleware, (req, res) => {
    const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
        res.json(results);
    });
});


// --- CREATE TASK (user + admin) ----------------------------------------
router.post('/', authMiddleware, (req, res) => {
    const { title, description, assignee_id, deadline } = req.body;

    if (!title || !assignee_id || !deadline) {
        return res.status(400).json({ message: 'Не все поля заполнены' });
    }

    const creator_id = req.user.id;

    const query = `INSERT INTO tasks 
        (title, description, creator_id, assignee_id, deadline, status, created_at) 
        VALUES (?, ?, ?, ?, ?, "не выполнена", NOW())`;

    db.query(query, [title, description, creator_id, assignee_id, deadline], (err, result) => {
        if (err) return res.status(500).json({ message: 'Ошибка создания задачи', error: err });
        res.json({ message: 'Задача создана', taskId: result.insertId });
    });
});


// --- UPDATE STATUS (user can update own, admin can update all) ----------
router.put('/:id/status', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== "выполнена" && status !== "не выполнена") {
        return res.status(400).json({ message: "Некорректный статус" });
    }

    // сотрудник может менять только задачи где он assignee
    const queryOwnerCheck = "SELECT * FROM tasks WHERE id = ?";
    db.query(queryOwnerCheck, [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Ошибка проверки задачи", error: err });

        if (results.length === 0) return res.status(404).json({ message: "Задача не найдена" });

        const task = results[0];

        if (req.user.role !== "admin" && task.assignee_id !== req.user.id) {
            return res.status(403).json({ message: "Вы не можете менять статус чужой задачи" });
        }

        const updateQuery = 'UPDATE tasks SET status = ? WHERE id = ?';
        db.query(updateQuery, [status, id], (err) => {
            if (err) return res.status(500).json({ message: 'Ошибка обновления статуса', error: err });
            res.json({ message: 'Статус обновлён' });
        });
    });
});


// --- EDIT TASK (admin + creator) ---------------------------------------
router.put('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { title, description, assignee_id, deadline } = req.body;

    const queryCheck = "SELECT * FROM tasks WHERE id = ?";
    db.query(queryCheck, [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Ошибка проверки", error: err });
        if (results.length === 0) return res.status(404).json({ message: "Задача не найдена" });

        const task = results[0];

        if (req.user.role !== "admin" && task.creator_id !== req.user.id) {
            return res.status(403).json({ message: "Вы не можете редактировать чужую задачу" });
        }

        const updateQuery = `UPDATE tasks SET 
            title = ?, description = ?, assignee_id = ?, deadline = ? 
            WHERE id = ?`;

        db.query(updateQuery, [title, description, assignee_id, deadline, id], (err) => {
            if (err) return res.status(500).json({ message: 'Ошибка обновления задачи', error: err });
            res.json({ message: 'Задача обновлена' });
        });
    });
});


// --- GET TASK BY ID -----------------------------------------------------
router.get('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM tasks WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
        if (results.length === 0) return res.status(404).json({ message: 'Задача не найдена' });
        res.json(results[0]);
    });
});


// --- DELETE TASK (ADMIN ONLY) ------------------------------------------
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM tasks WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Ошибка удаления', error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Задача не найдена' });
        }

        res.json({ message: 'Задача удалена' });
    });
});


module.exports = router;
