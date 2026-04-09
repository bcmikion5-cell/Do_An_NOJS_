


const mysql = require("mysql");
const express = require("express");
//const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express(); // ✅ khai báo trước

// middleware
app.use(bodyParser.urlencoded({ extended: true }));

// 👉 thêm dòng này SAU khi có app
app.use(express.static(__dirname)); // hoặc "public"

// DB
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "csdl"
});

// login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email=? AND password=?";
    db.query(sql, [email, password], (err, result) => {

        if (result.length > 0) {
            res.send(`
                <script>
                    alert("Đăng nhập thành công ✅");
                    window.location.href = "/index.html";
                </script>
            `);
        } else {
            res.send(`
                <script>
                    alert("Sai email hoặc password ❌");
                    window.location.href = "/login.html";
                </script>
            `);
        }
    });
});

app.listen(3000, () => {
    console.log("Server chạy http://localhost:3000");
});