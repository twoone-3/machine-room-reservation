-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS machine_reservation DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;
USE machine_reservation;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建机房表
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    capacity INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建预约记录表
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL, -- 如 "08:00-10:00"
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 插入一个管理员用户（密码是明文，需加密后更新）
INSERT INTO users (username, password, role)
VALUES ('admin', 'admin123', 'admin');

-- 插入一些测试机房
INSERT INTO rooms (name, location, capacity, description)
VALUES 
('一号机房', '教学楼 A 区 3 层', 40, '配备40台计算机，适合上机课程使用'),
('二号机房', '教学楼 B 区 2 层', 30, '用于基础编程教学，含投影设备');

-- 插入测试预约记录（可选）
INSERT INTO reservations (user_id, room_id, date, time_slot, status)
VALUES (1, 1, '2025-06-10', '10:00-12:00', 'approved');
