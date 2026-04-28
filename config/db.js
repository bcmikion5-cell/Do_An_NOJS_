const mysql = require('mysql2/promise'); // Quan trọng: phải có /promise

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Mặc định XAMPP để trống
    database: 'ten_database_cua_ban', // Thay tên DB của bạn vào đây
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;