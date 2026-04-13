const express = require('express');
const router = express.Router();
const db = require('../csdl/database');

// ================= ROUTES =================

// Trang chủ
router.get('/', (req, res) => {
    // 1. Lấy tin mới nhất
    const sqlLatest = "SELECT * FROM posts WHERE status = 1 ORDER BY id DESC LIMIT 6";
    
    // 2. Lấy tin xem nhiều (Nhớ đảm bảo bảng posts của bạn có cột views nhé)
    const sqlTrending = "SELECT * FROM posts WHERE status = 1 ORDER BY views DESC LIMIT 6";

    db.query(sqlLatest, (err, latestPosts) => {
        if (err) {
            console.error("Lỗi truy vấn mới nhất:", err);
            return res.send("Lỗi cơ sở dữ liệu!");
        }

        db.query(sqlTrending, (err, trendingPosts) => {
            if (err) {
                console.error("Lỗi truy vấn trending:", err);
                return res.send("Lỗi cơ sở dữ liệu!");
            }

            // ĐÂY LÀ CHỖ QUAN TRỌNG NHẤT: Bắn dữ liệu sang EJS
            res.render('pages/index', { 
                title: 'Trang chủ - BizNews',
                latestPosts: latestPosts,     // Phải truyền biến này sang
                trendingPosts: trendingPosts  // Phải truyền cả biến này sang nữa
            });
        });
    });
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