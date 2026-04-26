const express = require('express');
const router = express.Router();
const db = require('../csdl/database');
const bcrypt = require('bcrypt');//mã hoá mật khẩu


router.get('/dashboard', (req, res) => {

    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM posts) AS total_posts,
            (SELECT COUNT(*) FROM categories) AS total_categories,
            (SELECT COUNT(*) FROM contacts) AS total_contacts
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi đếm dữ liệu:", err);
            return res.send("Lỗi lấy dữ liệu thống kê!");
        }

        // results[0] sẽ chứa các con số đếm được
        const thongKe = results[0];

        // Gửi dữ liệu thongKe sang file giao diện
        res.render('admin/dashboard', { 
            layout: false, // (Nhớ giữ cái này nếu bạn đang dùng partials)
            thongKe: thongKe 
        });
    });
});

//quản lý người dùng
router.get('/users', (req, res) => {
    if (!req.session.admin) return res.redirect('/login');

    const sql = "SELECT id, username, email, password, vai_tro FROM users ORDER BY id DESC";
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

//reset mật khẩu
router.get('/users/reset/:id', (req, res) => {
    const id = req.params.id;
        const mahoaPassword = bcrypt.hashSync("1", 10);

    const sql = "UPDATE users SET password = ? WHERE id = ?";
    db.query(sql, [mahoaPassword, id], (err) => {
        if (err) throw err;
        res.redirect('/admin/users');

    });
});

// 1. HIỂN THỊ FORM THÊM USER
// ==========================================
// HIỂN THỊ FORM THÊM USER
router.get('/users/add', (req, res) => {
    return res.render('admin/add_users', {
        layout: false // <--- THÊM DÒNG NÀY ĐỂ TẮT GIAO DIỆN NGƯỜI DÙNG
    });
});
// ==========================================
// 2. XỬ LÝ LƯU USER VÀO DATABASE
// ==========================================
router.post('/users/add', (req, res) => {
    // Gán vai_tro mặc định là 0 nếu form không gửi lên
    const { username, email, password, vai_tro } = req.body;

    const mahoaPassword = bcrypt.hashSync(password, 10);

    const sql = "INSERT INTO `users` (`username`, `email`, `password`, `vai_tro`) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [username, email, mahoaPassword, vai_tro], (err, result) => {
        if (err) {
            console.error("Lỗi insert DB:", err);
            return res.send("❌ Lỗi thêm User!");
        }
        res.redirect('/admin/users'); // Thành công thì quay lại trang danh sách
    });
});


router.post('/users/edit/:id', (req, res) => {
    const userId = req.params.id;
    const { username, email, password, vai_tro } = req.body;

        const mahoaPassword = bcrypt.hashSync(password, 10);


    const sql = "UPDATE users SET username = ?, email = ?, password = ?, vai_tro = ? WHERE id = ?";
    
    db.query(sql, [username, email, mahoaPassword, vai_tro, userId], (err, result) => {
        if (err) {
            console.error("Lỗi cập nhật:", err);
            return res.send("❌ Lỗi không thể cập nhật User!");
        }
        // Lưu xong thì tải lại trang danh sách (Modal sẽ tự động đóng)
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
// SỬA LẠI ĐOẠN NÀY
router.get('/posts/add', (req, res) => {
    db.query("SELECT * FROM categories", (err, categories) => {
        if (err) throw err;
        res.render('admin/add_post', {
            title: 'Thêm bài viết',
            categories: categories,
            layout: false
        });
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