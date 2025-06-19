-- MySQL 数据库初始化脚本
CREATE DATABASE IF NOT EXISTS machine_reservation DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;
USE machine_reservation;

-- 删除表（如果存在）
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS users;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('teacher', 'admin') DEFAULT 'teacher',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建机房表
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    capacity INT NOT NULL,
    status ENUM('available', 'unavailable') DEFAULT 'available', -- 机房状态：available 可用，unavailable 不可用
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建预约表
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('booked', 'completed', 'cancelled') NOT NULL DEFAULT 'booked', -- 新增状态属性，默认为“已预约”
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 插入一些测试用户
INSERT INTO users (username, password, role)
VALUES ('admin', '123456', 'admin'),
        ('Li', '123456', 'teacher'),
        ('Wang', '666666', 'teacher');

-- 插入一些测试机房
INSERT INTO rooms (name, location, capacity, status, description)
VALUES 
('1号机房', '教学楼 A 区 328', 40, 'available', '配备40台计算机，适合上机课程使用'),
('2号机房', '教学楼 B 区 225', 30, 'unavailable', '用于基础编程教学，含投影设备');

-- 插入测试预约记录（可选）
INSERT INTO reservations (user_id, room_id, date, start_time, end_time, status)
VALUES (1, 1, '2025-06-10', '10:00:00', '12:00:00', 'booked'),
        (2, 2, '2025-06-11', '14:00:00', '16:00:00', 'booked'),
        (1, 2, '2025-06-12', '09:00:00', '11:00:00', 'completed');
