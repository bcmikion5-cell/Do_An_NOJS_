-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 12, 2026 lúc 03:37 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `csdl`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Tên danh mục',
  `description` text DEFAULT NULL COMMENT 'Mô tả danh mục',
  `status` tinyint(1) DEFAULT 1 COMMENT '1: Hiển thị, 0: Ẩn'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `status`) VALUES
(1, 'phuong', 'ko có', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL COMMENT 'ID Bài viết được bình luận',
  `email` varchar(100) NOT NULL COMMENT 'Email người bình luận',
  `content` text NOT NULL COMMENT 'Nội dung bình luận',
  `thoigianbinhluan` datetime DEFAULT current_timestamp() COMMENT 'Thời gian bình luận',
  `status` tinyint(1) DEFAULT 1 COMMENT '1: Hiện, 0: Ẩn/Chờ duyệt'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'Tên người liên hệ',
  `email` varchar(100) NOT NULL COMMENT 'Email liên hệ',
  `phone` varchar(20) DEFAULT NULL COMMENT 'Số điện thoại',
  `title` varchar(255) NOT NULL COMMENT 'Tiêu đề liên hệ',
  `content` text NOT NULL COMMENT 'Nội dung liên hệ',
  `status` tinyint(1) DEFAULT 0 COMMENT '0: Chưa duyệt, 1: Đã duyệt'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL COMMENT 'Tiêu đề bài viết',
  `image` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn hình ảnh đại diện',
  `summary` text DEFAULT NULL COMMENT 'Nội dung tóm tắt',
  `content` longtext NOT NULL COMMENT 'Nội dung chi tiết (HTML từ CKEditor)',
  `ngaydang` datetime DEFAULT current_timestamp() COMMENT 'Ngày đăng',
  `author_id` int(11) NOT NULL COMMENT 'ID Tác giả',
  `category_id` int(11) NOT NULL COMMENT 'ID Danh mục',
  `status` tinyint(1) DEFAULT 1 COMMENT '1: Đã xuất bản, 0: Bản nháp/Ẩn',
  `views` int(11) DEFAULT 0 COMMENT 'Lượt xem bài viết'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `subscribers`
--

CREATE TABLE `subscribers` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL COMMENT 'Email đăng ký',
  `ngaydangky` datetime DEFAULT current_timestamp() COMMENT 'Ngày đăng ký'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL COMMENT 'Tên đăng nhập',
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Mật khẩu',
  `vai_tro` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `vai_tro`) VALUES
(1, 'Phương', 'p@gmail.com', '123', ''),
(2, 'Nguyễn Văn A', 'a@gmail.com', '123', ''),
(6, 'b', 'b@gmail.com', '123', ''),
(7, 'b', 'b@gmail.com', '34213', ''),
(8, 'c', 'c@gmail.com', '123', ''),
(9, 'd', 'd@gmail.com', '123', ''),
(10, 'e', 'e@gmail.com', '123', '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `website_info`
--

CREATE TABLE `website_info` (
  `id` int(11) NOT NULL,
  `address` varchar(255) DEFAULT NULL COMMENT 'Địa chỉ liên hệ',
  `email` varchar(100) DEFAULT NULL COMMENT 'Email hiển thị ở Footer',
  `linkfacebook` varchar(255) DEFAULT NULL COMMENT 'Link Fanpage Facebook',
  `linkyoutube` varchar(255) DEFAULT NULL COMMENT 'Link Kênh Youtube',
  `thongtinbanquyen` varchar(255) DEFAULT NULL COMMENT 'Thông tin bản quyền'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `website_info`
--

INSERT INTO `website_info` (`id`, `address`, `email`, `linkfacebook`, `linkyoutube`, `thongtinbanquyen`) VALUES
(1, '123 Đường ABC, Quận 1, TP.HCM', 'lienhe@newsfeed.com', 'https://facebook.com/newsfeed', 'https://youtube.com/newsfeed', 'Bản quyền © 2026 thuộc về Newsfeed');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `subscribers`
--
ALTER TABLE `subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `website_info`
--
ALTER TABLE `website_info`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `subscribers`
--
ALTER TABLE `subscribers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `website_info`
--
ALTER TABLE `website_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
