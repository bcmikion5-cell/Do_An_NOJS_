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

// Route cho trang liên hệ (Contact) - THÊM PHẦN NÀY
app.get('/contact', (req, res) => {
    // Nó sẽ render file views/pages/contact.ejs
    res.render('pages/contact', { title: 'Liên hệ - BizNews' });
});

// Route cho trang danh mục (Category) - THÊM PHẦN NÀY (Nếu bạn đã tách file)
app.get('/category', (req, res) => {
    res.render('pages/category', { title: 'Danh mục - BizNews' });
});

// Route cho trang chi tiết tin tức (Single News) - THÊM PHẦN NÀY
app.get('/single-news', (req, res) => {
    res.render('pages/single', { title: 'Chi tiết tin tức - BizNews' });
});

app.get('/category', (req, res) => {
    res.render('pages/category', { 
        title: 'Danh mục tin tức - BizNews' 
    });
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