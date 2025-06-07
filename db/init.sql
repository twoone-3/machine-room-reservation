-- �������ݿ⣨��������ڣ�
CREATE DATABASE IF NOT EXISTS machine_reservation DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;
USE machine_reservation;

-- �����û���
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ����������
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    capacity INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ����ԤԼ��¼��
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL, -- �� "08:00-10:00"
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- ����һ������Ա�û������������ģ�����ܺ���£�
INSERT INTO users (username, password, role)
VALUES ('admin', 'admin123', 'admin');

-- ����һЩ���Ի���
INSERT INTO rooms (name, location, capacity, description)
VALUES 
('һ�Ż���', '��ѧ¥ A �� 3 ��', 40, '�䱸40̨��������ʺ��ϻ��γ�ʹ��'),
('���Ż���', '��ѧ¥ B �� 2 ��', 30, '���ڻ�����̽�ѧ����ͶӰ�豸');

-- �������ԤԼ��¼����ѡ��
INSERT INTO reservations (user_id, room_id, date, time_slot, status)
VALUES (1, 1, '2025-06-10', '10:00-12:00', 'approved');
