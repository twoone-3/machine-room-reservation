import express from 'express';
import { loginUser, createRoom, makeReservation, getAllRooms, getMyReservations, cancelReservation, getReservationsByRoomAndDate, getAllUsers, updateRoom, deleteRoom } from '../controllers/index.js';
import { verifyToken } from '../middlewares/index.js';

const router = express.Router();

// 用户登录
router.post('/login', loginUser);

// 机房管理
router.post('/rooms', createRoom);
router.get('/rooms', getAllRooms);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// 预约管理
router.post('/reservations', verifyToken, makeReservation);
router.get('/reservations/my', verifyToken, getMyReservations);
router.post('/reservations/:id/cancel', verifyToken, cancelReservation);

// 获取指定机房在某天的预约
router.get('/rooms/:roomId/reservations', getReservationsByRoomAndDate);

// 获取所有用户
router.get('/users', getAllUsers);

export default router;