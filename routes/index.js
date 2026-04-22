const express = require('express');
const router = express.Router();
const db = require('../csdl/database');

// ================= ROUTES =================

// Trang chủ
router.get('/', (req, res) => {
    const sqlLatest = "SELECT * FROM posts WHERE status = 1 ORDER BY id DESC LIMIT 6";
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

            return res.render('pages/index', { 
                title: 'Trang chủ - BizNews',
                latestPosts: latestPosts,
                trendingPosts: trendingPosts
            });
        });
    });
});

/// Danh mục & Tìm kiếm
router.get('/category', (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const limit = 4; // Số lượng bài viết mỗi trang
    const offset = (page - 1) * limit;
    
    const keyword = req.query.search || ""; // Nhận từ khóa từ name="search" trong form
    const categoryId = req.query.id || ""; 

    // Điều kiện lọc bài viết theo status và từ khóa/danh mục
    let whereClause = "WHERE p.status = 1";
    let params = [];

    if (keyword) {
        whereClause += " AND p.title LIKE ?";
        params.push(`%${keyword}%`);
    }
    if (categoryId) {
        whereClause += " AND p.category_id = ?";
        params.push(categoryId);
    }

    // 1. Lấy tổng số lượng để hiển thị "Kết quả: X bài viết"
    const countSql = `SELECT COUNT(*) as total FROM posts p ${whereClause}`;
    
    db.query(countSql, params, (err, countResult) => {
        if (err) return res.send("Lỗi truy vấn đếm!");
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        // 2. Lấy danh sách bài viết thực tế
        const dataSql = `
            SELECT p.*, c.name as CategoryName 
            FROM posts p
            LEFT JOIN categories c ON p.category_id = c.id 
            ${whereClause} 
            ORDER BY p.id DESC LIMIT ? OFFSET ?`;
            
        db.query(dataSql, [...params, limit, offset], (err, results) => {
            if (err) return res.send("Lỗi lấy danh sách bài viết!");

            // Trả về giao diện kèm theo biến 'total' bạn đang thiếu
            res.render('pages/category', {
                title: 'Kết quả tìm kiếm',
                listTin: results,
                total: totalItems, // Biến này dùng để hiện: Kết quả: <%= total %> bài viết
                keyword: keyword,
                categoryId: categoryId,
                currentPage: page,
                totalPages: totalPages
            });
        });
    });
});
// Chi tiết
router.get('/single', (req, res) => {
    return res.render('pages/single', {
        title: 'Chi tiết tin tức - BizNews'
    });
});

// admin
router.get('/dashboard', (req, res) => {
    return res.render('admin/dashboard', {
        title: 'Liên hệ - BizNews'
    });
});

// Liên hệ
router.get('/contact', (req, res) => {
    return res.render('pages/contact', {
        title: 'Liên hệ - BizNews'
    });
});

// ================= LOGIN =================

router.get('/login', (req, res) => {
    return res.render('pages/login', {
        layout: false // <--- THÊM DÒNG NÀY ĐỂ TẮT GIAO DIỆN NGƯỜI DÙNG
    });
});

router.get('/register', (req, res) => {
    return res.render('pages/register');
});

// Xử lý login (MYSQL)
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email=? AND password=? AND vai_tro = 'admin'";
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("❌ Lỗi server!");
        }

        if (result.length > 0) {
            req.session.admin = result[0];
            return res.send(`
                <script>
                    alert("Đăng nhập thành công ✅");
                    window.location.href = "/admin/dashboard";
                </script>
            `);
        } else {
            return res.send(`
                <script>
                    alert("Sai email hoặc mật khẩu hoặc tài khoản không có quyền admin ❌");
                    window.location.href = "/login";
                </script>
            `);
        }
    });
});

//Xử lý đăng ký
router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const sql = "INSERT INTO `users` (`username`, `email`, `password`) VALUES (?,?,?)";
    db.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("❌ Lỗi server!");
        }

        if (result.affectedRows > 0) {
            return res.send(`
                <script>
                    alert("Đăng ký thành công ✅");
                    window.location.href = "/login";
                </script>
            `);
        } else {
            return res.send(`
                <script>
                    alert("Đăng ký thất bại ❌");
                    window.location.href = "/login";
                </script>
            `);
        }
    });
});

// 1. TRANG HIỂN THỊ CHI TIẾT BÀI VIẾT & BÌNH LUẬN
router.get('/single/:id', (req, res) => {
    const postId = req.params.id;
    const isFromComment = req.query.commented;

    // Hàm thực hiện lấy dữ liệu và render
    const loadContent = () => {
        const sqlDetail = "SELECT * FROM posts WHERE id = ?";
        db.query(sqlDetail, [postId], (err, postResults) => {
            if (err || postResults.length === 0) {
                return res.status(404).send("Không tìm thấy bài viết này!");
            }

            const post = postResults[0];
            const sqlRelated = "SELECT * FROM posts WHERE category_id = ? AND id != ? AND status = 1 ORDER BY id DESC LIMIT 3";
            
            db.query(sqlRelated, [post.category_id, postId], (err, relatedResults) => {
                const sqlComments = "SELECT * FROM comment WHERE post_id = ? ORDER BY ngaybinhluan DESC";
                db.query(sqlComments, [postId], (err, commentResults) => {
                    return res.render('pages/single', {
                        post: post,
                        relatedPosts: relatedResults,
                        comments: commentResults || []
                    });
                });
            });
        });
    };

    // Nếu không phải từ bình luận, tăng view xong mới loadContent
    if (!isFromComment) {
        db.query("UPDATE posts SET views = views + 1 WHERE id = ?", [postId], (err) => {
            loadContent(); // Gọi load sau khi update xong
        });
    } else {
        loadContent(); // Load luôn nếu quay lại từ bình luận
    }
});

// 2. XỬ LÝ LƯU BÌNH LUẬN VÀO DATABASE
router.post('/comment', (req, res) => {
    const { post_id, email, content } = req.body;
    const sqlInsert = "INSERT INTO comment (post_id, email, content) VALUES (?, ?, ?)";
    
    db.query(sqlInsert, [post_id, email, content], (err, result) => {
        if (err) {
            console.error("Lỗi lưu bình luận:", err);
            return res.send("Lỗi: Không thể gửi bình luận.");
        } else {
            // Cập nhật số lượng bình luận XONG MỚI redirect
            db.query("UPDATE posts SET comment = comment + 1 WHERE id = ?", [post_id], (err) => {
                return res.redirect('/single/' + post_id + '?commented=true');
            });
        }
    });
});

// ================= QUẢN LÝ BÀI VIẾT (ADMIN) =================
router.get('/admin/posts', (req, res) => {
    const sql = `SELECT posts.*, categories.name as category_name 
                 FROM posts 
                 LEFT JOIN categories ON posts.category_id = categories.id 
                 ORDER BY posts.id DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi lấy danh sách bài viết:", err);
            return res.status(500).send("Lỗi hệ thống!");
        }
        
        return res.render('admin/posts', { 
            title: 'Quản lý bài viết - Admin',
            posts: results ,
            layout: false
        });
    });
});

module.exports = router;