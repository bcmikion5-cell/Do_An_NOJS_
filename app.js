const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// --- CẤU HÌNH HỆ THỐNG ---

// 1. Cấu hình thư mục tĩnh (CSS, IMG, JS, LIB)
// Chỉ cần 1 dòng duy nhất là đủ
app.use(express.static(path.join(__dirname, 'public')));

// 2. Thiết lập View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3. Cấu hình Layout
app.use(expressLayouts);
app.set('layout', 'layouts/main'); // File này nằm ở views/layouts/main.ejs


// --- ĐỊNH NGHĨA CÁC ROUTE (PHẦN BẠN CẦN THÊM) ---

// Route cho trang chủ
app.get('/', (req, res) => {
    res.render('pages/index', { title: 'Trang chủ - BizNews' });
});

// Route cho trang danh mục
app.get('/category', (req, res) => {
    // Truyền thêm biến categoryName để tránh lỗi "not defined" mà bạn gặp lúc trước
    res.render('pages/category', { 
        title: 'Danh mục - BizNews',
        categoryName: 'Kinh doanh' 
    });
});

// Route cho trang chi tiết tin tức
app.get('/single', (req, res) => {
    // Đảm bảo file tồn tại tại: views/pages/single.ejs
    res.render('pages/single', { 
        title: 'Chi tiết tin tức - BizNews' 
    });
});

// Route cho trang liên hệ
app.get('/contact', (req, res) => {
    res.render('pages/contact', { title: 'Liên hệ - BizNews' });
});



app.use(express.urlencoded({ extended: true }));

// 2. Route hiển thị trang Login (GET)
app.get('/login', (req, res) => {
    res.render('pages/login'); // Giả sử bạn có file login.ejs
});

// 3. Route xử lý khi nhấn nút Đăng nhập (POST)
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Tạm thời log ra để kiểm tra xem đã nhận được data chưa
    console.log("Email:", email);
    console.log("Password:", password);

    // Logic kiểm tra đăng nhập (Ví dụ đơn giản)
    if (email === "admin@gmail.com" && password === "123") {
        res.redirect('/'); // Đăng nhập đúng thì về trang chủ
    } else {
        res.send("Sai tài khoản hoặc mật khẩu!");
    }
});
// --- XỬ LÝ LỖI 404 (Nên có) ---
app.use((req, res) => {
    res.status(404).send('Không tìm thấy trang!');
});


// --- KHỞI ĐỘNG SERVER ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});