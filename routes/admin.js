const express = require('express');
const router = express.Router();
const db = require('../csdl/database');

// Bảng điều khiển (Dashboard)
router.get('/dashboard', (req, res) => {
    if (!req.session.admin) return res.redirect('/login');
    res.render('admin/dashboard', {
        title: 'Bảng điều khiển - Admin BizNews',
        layout: false
    });
});

//quản lý người dùng
router.get('/users', (req, res) => {
    if (!req.session.admin) return res.redirect('/login');

    const sql = "SELECT id, username, email FROM users ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('admin/users', {
            title: 'Quản lý người dùng',
            users: results,
            adminName: req.session.admin.username,
            layout: false
        });
    });
});

//Xoá Users
router.get('/users/delete/:id', (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [id], (err) => {
        if (err) throw err;
        res.redirect('/admin/users');

    });
});

//---------------- 1. QUẢN LÝ DANH MỤC ----------------

// Hiển thị danh sách danh mục
router.get('/categories', (req, res) => {
    const sql = "SELECT * FROM categories ORDER BY id DESC";

    db.query(sql, (err, categories) => {
        if (err) {
            console.error(err);
            return res.send("❌ Lỗi tải danh sách danh mục!");
        }
        res.render('admin/categories', {
            title: 'Quản lý danh mục - Admin',
            categories: categories,
            layout: false
        });
    });
});

// Xử lý thêm danh mục
router.post('/categories/add', (req, res) => {
    const { name, description, status } = req.body;

    const sql = "INSERT INTO categories (name, description, status) VALUES (?, ?, ?)";
    db.query(sql, [name, description, status || 1], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("❌ Lỗi thêm danh mục!");
        }
        res.redirect('/admin/categories'); // Thành công thì quay lại trang danh sách
    });
});


// Xử lý xóa danh mục
router.get('/categories/delete/:id', (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM categories WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.send(`
                <script>
                    alert("❌ Không thể xóa! (Có thể danh mục đang chứa bài viết)");
                    window.location.href = "/admin/categories";
                </script>
            `);
        }
        res.redirect('/admin/categories');
    });
});

// Xử lý sửa danh mục
router.post('/categories/update/:id', (req, res) => {
    const id = req.params.id;
    const { name, description, status } = req.body;

    if (!name) {
        return res.send("Tên danh mục không được để trống");
    }

    const statusValue = parseInt(status) || 0;

    const sql = "UPDATE categories SET name=?, description=?, status=? WHERE id=?";
    db.query(sql, [name, description, statusValue, id], (err) => {
        if (err) {
            console.error(err);
            return res.send("Lỗi cập nhật danh mục");
        }

        res.redirect('/admin/categories');
    });
});

// // ---------------- 2. QUẢN LÝ BÀI VIẾT ----------------

// // Hiển thị danh sách bài viết
// app.get('/admin/posts', (req, res) => {
//     // Dùng LEFT JOIN để lấy tên danh mục hiển thị cùng bài viết
//     const sql = `
//         SELECT posts.*, categories.name AS category_name 
//         FROM posts 
//         LEFT JOIN categories ON posts.category_id = categories.id 
//         ORDER BY posts.id DESC
//     `;

//     db.query(sql, (err, posts) => {
//         if (err) {
//             console.error(err);
//             return res.send("❌ Lỗi tải danh sách bài viết!");
//         }
//         res.render('admin/posts', {
//             title: 'Quản lý bài viết - Admin',
//             posts: posts
//         });
//     });
// });

// // Xóa bài viết
// app.get('/admin/posts/delete/:id', (req, res) => {
//     const id = req.params.id;

//     const sql = "DELETE FROM posts WHERE id = ?";
//     db.query(sql, [id], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.send("❌ Lỗi xóa bài viết!");
//         }
//         res.redirect('/admin/posts');
//     });
// });


// Route Đăng xuất
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});
// Giả sử API của bạn trả về danh sách bài viết
// ---------------- 2. QUẢN LÝ BÀI VIẾT ----------------

// Hiển thị danh sách bài viết
// --- QUẢN LÝ BÀI VIẾT ---

// 1. Trang danh sách bài viết
router.get('/posts', (req, res) => {
    if (!req.session.admin) return res.redirect('/login');

    const sql = `
        SELECT posts.*, categories.name AS category_name 
        FROM posts 
        LEFT JOIN categories ON posts.category_id = categories.id 
        ORDER BY posts.id DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('admin/posts', {
            title: 'Danh sách bài viết',
            posts: results,
            adminName: req.session.admin.username,
            layout: false
        });
    });
});

// 2. Trang form thêm bài viết
router.get('/posts/add', (req, res) => {
    db.query("SELECT * FROM categories", (err, categories) => {
        if (err) throw err;
        res.render('admin/add_post', { 
            title: 'Thêm bài viết',
            categories: categories,
            layout: false 
        });
        res.redirect('/admin/posts');
    });
});

// 3. Xử lý lưu bài viết (POST)
router.post('/posts/add', (req, res) => {
    const { title, content, image, category_id, status } = req.body;
    const sql = "INSERT INTO posts (title, content, image, category_id, status) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [title, content, image, category_id, status || 1], (err) => {
        if (err) {
            console.error(err);
            return res.send("Lỗi lưu database!");
        }
        res.redirect('/admin/posts');
    });
});
// Xóa bài viết
router.get('/posts/delete/:id', (req, res) => {
    if (!req.session.admin) return res.redirect('/login');

    const id = req.params.id;
    const sql = "DELETE FROM posts WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("❌ Lỗi xóa bài viết!");
        }
        res.redirect('/admin/posts');
    });
});


module.exports = router;