import { User, Room, Reservation } from '../models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET 未设置，请检查 .env 文件');
}

// 用户注册（可选实现）
export const createUser = async (req, res) => { 
    // TODO: 实现用户注册
};

// 用户登录
export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    try {
        const user = await User.findOne({ where: { username } });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }
        // 生成JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '2h' }
        );
        res.json({ token, username: user.username, role: user.role });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ message: '登录失败', error: error.message });
    }
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
        console.error('获取机房信息出错:', error);
        res.status(500).json({ message: '获取机房信息出错', error: error.message });
    }
};

// 创建预约
export const makeReservation = async (req, res) => {
    // TODO: 实现预约
};