-- MySQL ���ݿ��ʼ���ű�
CREATE DATABASE IF NOT EXISTS machine_reservation DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;
USE machine_reservation;

-- ɾ����������ڣ�
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS users;

-- �����û���
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('teacher', 'admin') DEFAULT 'teacher',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ����������
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    capacity INT NOT NULL,
    status ENUM('available', 'unavailable') DEFAULT 'available', -- ����״̬��available ���ã�unavailable ������
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ����ԤԼ��
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('booked', 'completed', 'cancelled') NOT NULL DEFAULT 'booked', -- ����״̬���ԣ�Ĭ��Ϊ����ԤԼ��
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- ����һЩ�����û�
INSERT INTO users (username, password, role)
VALUES ('admin', '123456', 'admin'),
        ('Li', '123456', 'teacher'),
        ('Wang', '666666', 'teacher');

-- ����һЩ���Ի���
INSERT INTO rooms (name, location, capacity, status, description)
VALUES 
('һ�Ż���', '��ѧ¥ A �� 328', 40, 'available', '�䱸40̨��������ʺ��ϻ��γ�ʹ��'),
('���Ż���', '��ѧ¥ B �� 225', 30, 'available', '���ڻ�����̽�ѧ����ͶӰ�豸');

-- �������ԤԼ��¼����ѡ��
INSERT INTO reservations (user_id, room_id, date, start_time, end_time, status)
VALUES (1, 1, '2025-06-10', '10:00:00', '12:00:00', 'booked'),
        (2, 2, '2025-06-11', '14:00:00', '16:00:00', 'booked'),
        (1, 2, '2025-06-12', '09:00:00', '11:00:00', 'completed');
