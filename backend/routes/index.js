import express from 'express';
import { createUser, loginUser, createRoom, makeReservation } from '../controllers/index.js';

const router = express.Router();

// 用户注册与登录
router.post('/users/register', createUser);
router.post('/users/login', loginUser);

// 机房管理
router.post('/rooms', createRoom);

// 预约管理
router.post('/reservations', makeReservation);

export default router;