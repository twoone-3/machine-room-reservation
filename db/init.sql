/*!40101 SET NAMES utf8 */;
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
VALUES 
('admin', '123456', 'admin'),
('Li', '123456', 'teacher'),
('Wang', '123456', 'teacher');

-- 插入一些测试机房
INSERT INTO rooms (id, name, location, capacity, status, description)
VALUES
(1, '1号机房', '教学楼 A 区 328', 40, 'available', '配备40台计算机，适合上机课程使用'),
(2, '2号机房', '教学楼 B 区 225', 30, 'available', '用于基础编程教学，含投影设备'),
(3, '3号机房', '教学楼 C 区 101', 50, 'available', '大容量机房，适合大型考试'),
(4, '4号机房', '教学楼 D 区 202', 35, 'available', '配备新型电脑，适合多媒体教学'),
(5, '5号机房', '教学楼 E 区 303', 20, 'available', '小型机房，适合小班教学'),
(6, '6号机房', '教学楼 F 区 404', 45, 'available', '配备高性能主机，适合图形处理'),
(7, '7号机房', '教学楼 G 区 505', 25, 'available', '适合基础课程'),
(8, '8号机房', '教学楼 H 区 606', 60, 'available', '最大机房，适合全院大型活动'),
(9, '9号机房', '教学楼 I 区 707', 32, 'unavailable', '设备维护中'),
(10, '10号机房', '教学楼 J 区 808', 28, 'available', '新装修机房'),
(11, '11号机房', '教学楼 K 区 909', 36, 'available', '配备双显示器'),
(12, '12号机房', '教学楼 L 区 110', 40, 'available', '适合软件开发课程'),
(13, '13号机房', '教学楼 M 区 210', 30, 'unavailable', '设备升级中'),
(14, '14号机房', '教学楼 N 区 310', 42, 'available', '配备高速网络'),
(15, '15号机房', '教学楼 O 区 410', 38, 'unavailable', '空调维护中');