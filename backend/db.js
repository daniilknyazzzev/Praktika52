const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '5632',
  database: process.env.DB_NAME || 'company_portal'
});

// Подключаемся сразу
db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к MySQL:', err);
    } else {
        console.log('Подключение к MySQL успешно!');
    }
});

module.exports = db;
