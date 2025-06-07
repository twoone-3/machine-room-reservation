import express from 'express';
import { createUser, loginUser, createRoom, makeReservation } from '../controllers/index.js';

const router = express.Router();

// User routes
router.post('/users/register', createUser);
router.post('/users/login', loginUser);

// Room routes
router.post('/rooms', createRoom);

// Reservation routes
router.post('/reservations', makeReservation);

export default router;