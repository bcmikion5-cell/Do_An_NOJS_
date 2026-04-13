const express = require('express');
const router = express.Router();
const db = require('../csdl/database');

// ================= ROUTES =================

// Trang chủ
router.get('/', (req, res) => {
    res.render('pages/index', { title: 'Trang chủ - BizNews' });
});

// Danh mục
router.get('/category', (req, res) => {
    res.render('pages/category', {
        title: 'Danh mục - BizNews',
        categoryName: 'Kinh doanh'
    });
});

// Chi tiết
router.get('/single', (req, res) => {
    // Đảm bảo file tồn tại tại: views/pages/single.ejs
    res.render('pages/single', {
        title: 'Chi tiết tin tức - BizNews'
    });
});

// admin
router.get('/dashboard', (req, res) => {
    res.render('admin/dashboard', {
        title: 'Liên hệ - BizNews'
    });
});



// Liên hệ
router.get('/contact', (req, res) => {
    res.render('pages/contact', {
        title: 'Liên hệ - BizNews'
    });
});

// ================= LOGIN =================

// Trang login
router.get('/login', (req, res) => {
    
    res.render('pages/login');
});

router.get('/register', (req, res) => {
    res.render('pages/register');
});


// Xử lý login (MYSQL)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email=? AND password=?";
    db.query(sql, [email, password], (err, result) => {

        if (err) {
            console.error(err);
            return res.send("❌ Lỗi server!");
        }

        if (result.length > 0) {
            req.session.admin = result[0];
            res.send(`
                <script>
                    alert("Đăng nhập thành công ✅");
                    window.location.href = "/admin/dashboard";
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
router  .post('/register', (req, res) => {
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
                    window.location.href = "/login";
                </script>
            `);
        } else {
            res.send(`
                <script>
                    alert("Đăng ký thất bại ❌");
                    window.location.href = "/login";
                </script>
            `);
        }
    });
});


module.exports = router;