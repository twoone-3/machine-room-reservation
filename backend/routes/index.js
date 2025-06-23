import express from 'express';
import { createUser, loginUser, createRoom, makeReservation, getAllRooms, getMyReservations, cancelReservation, getReservationsByRoomAndDate } from '../controllers/index.js';
import { verifyToken } from '../middlewares/index.js';

const router = express.Router();

// 用户注册与登录
router.post('/users/register', createUser);
router.post('/login', loginUser); // 修改为 /api/login

// 机房管理
router.post('/rooms', createRoom);
router.get('/rooms', getAllRooms);

// 预约管理
router.post('/reservations', verifyToken, makeReservation);
router.get('/reservations/my', verifyToken, getMyReservations);
router.post('/reservations/:id/cancel', verifyToken, cancelReservation);

// 获取指定机房在某天的预约
router.get('/rooms/:roomId/reservations', getReservationsByRoomAndDate);

export default router;