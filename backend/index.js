const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Роуты
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const tasksRoutes = require('./routes/tasks');
const adminRoutes = require('./routes/admin'); // <- подключаем админ роут

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/admin', adminRoutes); // <- добавляем админ роут

// Тестовый корневой маршрут
app.get('/', (req, res) => {
  res.send('Company Portal API работает!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
