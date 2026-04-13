const db = require('./csdl/database')
const session = require('express-session');
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const app = express();

// Cấu hình Session
app.use(session({
    secret: 'biznews_secret_key', // Chuỗi bí mật bất kỳ
    resave: false,
    saveUninitialized: true,

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


// 2. NHẬP ROUTE
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');

//Sử Dụng ROUTE
app.use('/', indexRoutes);
app.use('/admin', adminRoutes); // Tất cả trang admin bắt đầu bằng /admin

// ================= 404 =================
app.use((req, res) => {
    res.status(404).send('Không tìm thấy trang!');
});

// ================= SERVER =================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});
