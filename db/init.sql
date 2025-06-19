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
('Wang', '666666', 'teacher'),
('Zhao', 'abc123', 'teacher'),
('Qian', 'pass789', 'teacher'),
('Sun', 'sunpwd', 'teacher'),
('Zhou', 'zhoupwd', 'teacher'),
('Wu', 'wupwd', 'teacher'),
('Zheng', 'zhengpwd', 'teacher'),
('Chen', 'chenpwd', 'teacher'),
('Yang', 'yangpwd', 'teacher'),
('Xu', 'xupwd', 'teacher');

-- 插入一些测试机房
INSERT INTO rooms (id, name, location, capacity, status, description)
VALUES
(1, '1号机房', '教学楼 A 区 328', 40, 'unavailable', '配备40台计算机，适合上机课程使用'),
(2, '2号机房', '教学楼 B 区 225', 30, 'unavailable', '用于基础编程教学，含投影设备'),
(3, '3号机房', '教学楼 C 区 101', 50, 'unavailable', '大容量机房，适合大型考试'),
(4, '4号机房', '教学楼 D 区 202', 35, 'available', '配备新型电脑，适合多媒体教学'),
(5, '5号机房', '教学楼 E 区 303', 20, 'unavailable', '小型机房，适合小班教学'),
(6, '6号机房', '教学楼 F 区 404', 45, 'unavailable', '配备高性能主机，适合图形处理'),
(7, '7号机房', '教学楼 G 区 505', 25, 'available', '适合基础课程'),
(8, '8号机房', '教学楼 H 区 606', 60, 'unavailable', '最大机房，适合全院大型活动'),
(9, '9号机房', '教学楼 I 区 707', 32, 'unavailable', '设备维护中'),
(10, '10号机房', '教学楼 J 区 808', 28, 'available', '新装修机房'),
(11, '11号机房', '教学楼 K 区 909', 36, 'available', '配备双显示器'),
(12, '12号机房', '教学楼 L 区 110', 40, 'available', '适合软件开发课程'),
(13, '13号机房', '教学楼 M 区 210', 30, 'unavailable', '设备升级中'),
(14, '14号机房', '教学楼 N 区 310', 42, 'available', '配备高速网络'),
(15, '15号机房', '教学楼 O 区 410', 38, 'unavailable', '空调维护中'),
(16, '16号机房', '教学楼 P 区 510', 27, 'available', '适合小组讨论'),
(17, '17号机房', '教学楼 Q 区 610', 33, 'unavailable', '投影仪损坏'),
(18, '18号机房', '教学楼 R 区 710', 44, 'available', '适合数据分析课程'),
(19, '19号机房', '教学楼 S 区 810', 29, 'available', '新购置电脑'),
(20, '20号机房', '教学楼 T 区 910', 31, 'unavailable', '网络维护中'),
(21, '21号机房', '教学楼 U 区 111', 35, 'available', '适合人工智能课程'),
(22, '22号机房', '教学楼 V 区 211', 26, 'available', '适合编程竞赛'),
(23, '23号机房', '教学楼 W 区 311', 39, 'unavailable', '设备老化'),
(24, '24号机房', '教学楼 X 区 411', 41, 'available', '配备多媒体设备'),
(25, '25号机房', '教学楼 Y 区 511', 37, 'available', '适合网络安全课程'),
(26, '26号机房', '教学楼 Z 区 611', 34, 'unavailable', '电源检修'),
(27, '27号机房', '教学楼 A2 区 711', 43, 'available', '适合大数据课程'),
(28, '28号机房', '教学楼 B2 区 811', 30, 'available', '适合云计算课程'),
(29, '29号机房', '教学楼 C2 区 911', 32, 'unavailable', '设备升级中'),
(30, '30号机房', '教学楼 D2 区 1010', 36, 'available', '适合物联网课程'),
(31, '31号机房', '教学楼 E2 区 1110', 40, 'available', '适合人工智能实验'),
(32, '32号机房', '教学楼 F2 区 1210', 28, 'unavailable', '设备维护中'),
(33, '33号机房', '教学楼 G2 区 1310', 35, 'available', '适合机器人课程'),
(34, '34号机房', '教学楼 H2 区 1410', 30, 'available', '适合嵌入式开发'),
(35, '35号机房', '教学楼 I2 区 1510', 38, 'unavailable', '空调检修'),
(36, '36号机房', '教学楼 J2 区 1610', 42, 'available', '配备3D打印机'),
(37, '37号机房', '教学楼 K2 区 1710', 33, 'available', '适合创新创业课程'),
(38, '38号机房', '教学楼 L2 区 1810', 27, 'unavailable', '网络升级中'),
(39, '39号机房', '教学楼 M2 区 1910', 44, 'available', '适合大数据分析'),
(40, '40号机房', '教学楼 N2 区 2010', 29, 'available', '新购置服务器'),
(41, '41号机房', '教学楼 O2 区 2110', 31, 'unavailable', '电源维护中'),
(42, '42号机房', '教学楼 P2 区 2210', 36, 'available', '适合云平台实验'),
(43, '43号机房', '教学楼 Q2 区 2310', 39, 'available', '配备多屏显示'),
(44, '44号机房', '教学楼 R2 区 2410', 32, 'unavailable', '设备老化'),
(45, '45号机房', '教学楼 S2 区 2510', 41, 'available', '适合网络编程'),
(46, '46号机房', '教学楼 T2 区 2610', 37, 'available', '适合信息安全课程'),
(47, '47号机房', '教学楼 U2 区 2710', 34, 'unavailable', '电源检修'),
(48, '48号机房', '教学楼 V2 区 2810', 43, 'available', '适合大数据课程'),
(49, '49号机房', '教学楼 W2 区 2910', 30, 'available', '适合云计算课程'),
(50, '50号机房', '教学楼 X2 区 3010', 32, 'unavailable', '设备升级中');

-- 插入测试预约记录
INSERT INTO reservations (user_id, room_id, date, start_time, end_time, status)
VALUES 
(1, 1, '2025-06-10', '10:00:00', '12:00:00', 'booked'),
(2, 2, '2025-06-11', '14:00:00', '16:00:00', 'completed'),
(3, 3, '2025-06-12', '09:00:00', '11:00:00', 'booked'),
(4, 4, '2025-06-13', '13:00:00', '15:00:00', 'cancelled'),
(5, 5, '2025-06-14', '15:00:00', '17:00:00', 'booked'),
(6, 6, '2025-06-15', '09:00:00', '11:00:00', 'booked'),
(7, 7, '2025-06-16', '10:00:00', '12:00:00', 'completed'),
(8, 8, '2025-06-17', '14:00:00', '16:00:00', 'booked'),
(9, 9, '2025-06-18', '08:00:00', '10:00:00', 'booked'),

(2, 2, '2025-06-21', '14:00:00', '16:00:00', 'booked'),
(2, 3, '2024-05-10', '09:00:00', '11:00:00', 'completed'),
(2, 4, '2024-04-15', '13:00:00', '15:00:00', 'completed'),
(2, 5, '2024-03-20', '10:00:00', '12:00:00', 'cancelled'),
(2, 6, '2024-02-25', '14:00:00', '16:00:00', 'completed');