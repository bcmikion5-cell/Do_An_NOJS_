const session = require('express-session');
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const db = require('./csdl/database')

const app = express();

// ================= CẤU HÌNH =================
// Cấu hình Session
app.use(session({
    secret: 'biznews_secret_key', // Chuỗi bí mật bất kỳ
    resave: false,
    saveUninitialized: true,
    //cookie: { maxAge: 3600000 } // Session tồn tại trong 1 giờ
}));

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

// admin
app.get('/dashboard', (req, res) => {
    res.render('admin/dashboard', {
        title: 'Liên hệ - BizNews'
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




// ================= ADMIN ROUTES (QUẢN TRỊ VÊN) =================

// Bảng điều khiển (Dashboard)
app.get('/admin/dashboard', (req, res) => {
    if (!req.session.admin) return res.redirect('/login');
    res.render('admin/dashboard', {
        title: 'Bảng điều khiển - Admin BizNews',
        layout: false
    });
});

//quản lý người dùng
app.get('/admin/users', (req, res) => {
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
app.get('/admin/users/delete/:id', (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [id], (err) => {
        if (err) throw err;
        res.redirect('/admin/users');
        
    });
});
//---------------- 1. QUẢN LÝ DANH MỤC ----------------

// Hiển thị danh sách danh mục
app.get('/admin/categories', (req, res) => {
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
app.post('/admin/categories/add', (req, res) => {
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
app.get('/admin/categories/delete/:id', (req, res) => {
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
app.post('/admin/categories/update/:id', (req, res) => {
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
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login'); 
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
