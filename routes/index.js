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



// 1. TRANG HIỂN THỊ CHI TIẾT BÀI VIẾT & BÌNH LUẬN
// ==========================================
router.get('/single/:id', (req, res) => {
    const postId = req.params.id;
    const isFromComment = req.query.commented;
    // Tăng lượt xem lên 1
    if (!isFromComment) {
    db.query("UPDATE posts SET views = views + 1 WHERE id = ?", [postId]);
    }
    // 1. Lấy chi tiết bài viết
    const sqlDetail = "SELECT * FROM posts WHERE id = ?";
    db.query(sqlDetail, [postId], (err, postResults) => {
        if (err || postResults.length === 0) {
            return res.status(404).send("Không tìm thấy bài viết này!");
        }

        const post = postResults[0];

        // 2. Lấy Bài Viết Liên Quan (Cùng danh mục, khác bài hiện tại)
        const sqlRelated = "SELECT * FROM posts WHERE category_id = ? AND id != ? AND status = 1 ORDER BY id DESC LIMIT 3";
        db.query(sqlRelated, [post.category_id, postId], (err, relatedResults) => {
            
            // 3. Lấy Danh Sách Bình Luận của bài viết này
            const sqlComments = "SELECT * FROM comment WHERE post_id = ? ORDER BY ngaybinhluan DESC";
            db.query(sqlComments, [postId], (err, commentResults) => {
                
                // Trả toàn bộ dữ liệu ra View
                res.render('pages/single', {
                    post: post,                 // Dữ liệu bài viết
                    relatedPosts: relatedResults, // Dữ liệu bài liên quan
                    comments: commentResults || [] // Dữ liệu bình luận
                });
            });
        });
    });
});

// ==========================================
// 2. XỬ LÝ LƯU BÌNH LUẬN VÀO DATABASE
// ==========================================
router.post('/comment', (req, res) => {
    // Lấy dữ liệu từ form gửi lên (Dùng đúng tên cột 'content' trong DB của bạn)
    const { post_id, email, content } = req.body;

    // Câu lệnh SQL thêm vào bảng comment
    const sqlInsert = "INSERT INTO comment (post_id, email, content) VALUES (?, ?, ?)";
    
    db.query(sqlInsert, [post_id, email, content], (err, result) => {
        if (err) {
            console.error("Lỗi lưu bình luận:", err);
            return res.send("Lỗi: Không thể gửi bình luận.");
        }
        // Thêm thành công thì tự động load lại đúng trang bài viết đó
        else
        {
            db.query("UPDATE posts SET comment = comment + 1 WHERE id = ?", [post_id]);
            
            res.redirect('/single/' + post_id + '?commented=true');
        }
        
    });
});

module.exports = router;