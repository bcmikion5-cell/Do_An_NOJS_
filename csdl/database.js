const mysql = require('mysql');
// ================= DATABASE =================
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "csdl"
});

// connect DB
db.connect((err) => {
    if (err) {
        console.error("❌ Kết nối DB lỗi:", err);
    } else {
        console.log("✅ Kết nối MySQL thành công!");
    }
});

module.exports = db;