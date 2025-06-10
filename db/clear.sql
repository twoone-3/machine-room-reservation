-- 清空所有表数据并重置自增主键

USE machine_reservation;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE reservations;
TRUNCATE TABLE rooms;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;