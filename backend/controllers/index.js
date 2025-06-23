import { User, Room, Reservation } from '../models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Op, fn, col } from 'sequelize';

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

// 获取当前用户的预约记录（只保留前30条）
export const getMyReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const reservations = await Reservation.findAll({
      where: { user_id: userId },
      include: [{ model: Room, attributes: ['name', 'location'] }],
      order: [['date', 'DESC'], ['start_time', 'DESC']]
    });

    // 超过30条则删除多余的
    if (reservations.length > 30) {
      const toDelete = reservations.slice(30);
      const idsToDelete = toDelete.map(r => r.id);
      await Reservation.destroy({ where: { id: idsToDelete } });
      res.json(reservations.slice(0, 30));
    } else {
      res.json(reservations);
    }
  } catch (error) {
    console.error('获取预约记录失败:', error);
    res.status(500).json({ message: '获取预约记录失败', error: error.message });
  }
};

// 获取指定机房某天的预约（仅返回已预约的时间段）
export const getReservationsByRoomAndDate = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: '必须提供日期' });
    }
    const reservations = await Reservation.findAll({
      where: { room_id: roomId, date, status: 'booked' },
      attributes: ['start_time']
    });
    res.json(reservations);
  } catch (error) {
    console.error('获取机房预约信息失败:', error);
    res.status(500).json({ message: '服务器内部错误', error: error.message });
  }
};

// 创建预约（防止时间段冲突）
export const makeReservation = async (req, res) => {
  try {
    const { room_id, date, start_time, end_time } = req.body;
    if (!room_id || !date || !start_time || !end_time) {
      return res.status(400).json({ message: '参数不完整' });
    }
    // 检查机房是否存在
    const room = await Room.findByPk(room_id);
    if (!room) {
      return res.status(400).json({ message: '机房不存在' });
    }
    // 检查时间段冲突
    const conflict = await Reservation.findOne({
      where: {
        room_id,
        date,
        status: 'booked',
        [Op.or]: [
          {
            start_time: { [Op.lt]: end_time },
            end_time: { [Op.gt]: start_time }
          }
        ]
      }
    });
    if (conflict) {
      return res.status(400).json({ message: '该时间段已被预约' });
    }
    // 创建预约
    const reservation = await Reservation.create({
      user_id: req.user.id,
      room_id,
      date,
      start_time,
      end_time,
      status: 'booked'
    });
    res.json({ message: '预约成功', reservation });
  } catch (error) {
    console.error('预约失败:', error);
    res.status(500).json({ message: '预约失败', error: error.message });
  }
};

// 取消预约（仅允许本人取消自己的预约且状态为booked）
export const cancelReservation = async (req, res) => {
  try {
    const userId = req.user.id;
    const reservationId = req.params.id;
    const reservation = await Reservation.findOne({
      where: { id: reservationId, user_id: userId }
    });
    if (!reservation) {
      return res.status(404).json({ message: '预约不存在' });
    }
    if (reservation.status !== 'booked') {
      return res.status(400).json({ message: '该预约无法取消' });
    }
    reservation.status = 'cancelled';
    await reservation.save();
    res.json({ message: '预约已取消' });
  } catch (error) {
    console.error('取消预约失败:', error);
    res.status(500).json({ message: '取消预约失败', error: error.message });
  }
};