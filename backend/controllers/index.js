// filepath: c:\Users\Administrator\dev\machine-room-reservation\backend\src\controllers\index.js
import { User, Room, Reservation } from '../models/index.js';

// 创建用户（注册）
export const createUser = async (req, res) => {
    // TODO: 实现用户注册
};

// 用户登录
export const loginUser = async (req, res) => {
    // TODO: 实现用户登录
};

// 创建机房
export const createRoom = async (req, res) => {
    // TODO: 实现机房创建
};

// 获取所有机房信息
export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll();
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Error fetching rooms', error: error.message });
    }
};

// 创建预约
export const makeReservation = async (req, res) => {
    // TODO: 实现预约
};