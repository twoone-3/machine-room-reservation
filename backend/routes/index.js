import express from 'express';
import { createUser, loginUser, createRoom, makeReservation, getAllRooms } from '../controllers/index.js'; // 引入 getAllRooms

const router = express.Router();

// 用户注册与登录
router.post('/users/register', createUser);
router.post('/users/login', loginUser);

// 机房管理
router.post('/rooms', createRoom);
router.get('/rooms', getAllRooms); // 新增：获取所有机房信息的路由

// 预约管理
router.post('/reservations', makeReservation);

export default router;