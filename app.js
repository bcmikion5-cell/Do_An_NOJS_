const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mysql = require('mysql');

const app = express();

// ================= CẤU HÌNH =================

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// layout
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// body parser (CHỈ CẦN 1 cái)
app.use(express.urlencoded({ extended: true }));

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

// ================= ROUTES =================

// Trang chủ
app.get('/', (req, res) => {
    res.render('pages/index', { title: 'Trang chủ - BizNews' });
});

// Danh mục
app.get('/category', (req, res) => {
    res.render('pages/category', {
        title: 'Danh mục - BizNews',
        categoryName: 'Kinh doanh'
    });
});

// Chi tiết
app.get('/single', (req, res) => {
    // Đảm bảo file tồn tại tại: views/pages/single.ejs
    res.render('pages/single', {
        title: 'Chi tiết tin tức - BizNews'
    });
});

// Liên hệ
app.get('/contact', (req, res) => {
    res.render('pages/contact', {
        title: 'Liên hệ - BizNews'
    });
});

// ================= LOGIN =================

// Trang login
app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});


// Xử lý login (MYSQL)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email=? AND password=?";
    db.query(sql, [email, password], (err, result) => {

        if (err) {
            console.error(err);
            return res.send("❌ Lỗi server!");
        }

        if (result.length > 0) {
            res.send(`
                <script>
                    alert("Đăng nhập thành công ✅");
                    window.location.href = "/";
                </script>
            `);
        } else {
            res.send(`
                <script>
                    alert("Sai email hoặc mật khẩu ❌");
                    window.location.href = "/login";
                </script>
            `);
        }
    });
});


//Xử lý đăng ký
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    const sql = "INSERT INTO `users` (`username`, `email`, `password`) VALUES (?,?,?)";
    db.query(sql, [username, email, password], (err, result) => {

        if (err) {
            console.error(err);
            return res.send("❌ Lỗi server!");
        }

        if (result.affectedRows > 0) {
            res.send(`
                <script>
                    alert("Đăng ký thành công ✅");
                    
                </script>
            `);
        } else {
            res.send(`
                <script>
                    alert("Đăng ký thất bại ❌");
                    
                </script>
            `);
        }
    });
});


// ================= 404 =================
app.use((req, res) => {
    res.status(404).send('Không tìm thấy trang!');
});

// ================= SERVER =================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});