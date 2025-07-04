import { sequelize, User, Room, Reservation } from '../models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Op, fn, col } from 'sequelize';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 未设置，请检查 .env 文件');
}

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
  try {
    const { name, location, capacity } = req.body;
    if (!name || !location || !capacity) {
      return res.status(400).json({ message: '参数不完整' });
    }
    // 检查机房名称是否已存在
    const exists = await Room.findOne({ where: { name } });
    if (exists) {
      return res.status(400).json({ message: '机房名称已存在' });
    }
    const room = await Room.create({ name, location, capacity });
    res.status(201).json({ message: '机房创建成功', room });
  } catch (error) {
    console.error('创建机房失败:', error);
    res.status(500).json({ message: '创建机房失败', error: error.message });
  }
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
  const t = await sequelize.transaction();
  try {
    const { room_id, date, start_time, end_time } = req.body;
    if (!room_id || !date || !start_time || !end_time) {
      return res.status(400).json({ message: '参数不完整' });
    }
    // 检查机房是否存在
    const room = await Room.findByPk(room_id, { transaction: t });
    if (!room) {
      await t.rollback();
      return res.status(400).json({ message: '机房不存在' });
    }
    // 检查时间段冲突，并使用行级锁防止并发问题
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
      },
      lock: t.LOCK.UPDATE, // 在事务中锁定查询到的行
      transaction: t
    });
    if (conflict) {
      await t.rollback();
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
    }, { transaction: t });

    await t.commit(); // 提交事务
    res.json({ message: '预约成功', reservation });
  } catch (error) {
    await t.rollback(); // 发生错误时回滚事务
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

// 获取所有用户
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role'] // 去掉 'contact'
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
};

// 编辑机房
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, capacity, status, description } = req.body;
    const room = await Room.findByPk(id);
    if (!room) return res.status(404).json({ message: '机房不存在' });
    await room.update({ name, location, capacity, status, description });
    res.json({ message: '机房更新成功', room });
  } catch (error) {
    res.status(500).json({ message: '机房更新失败', error: error.message });
  }
};

// 删除机房
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);
    if (!room) return res.status(404).json({ message: '机房不存在' });
    await room.destroy();
    res.json({ message: '机房已删除' });
  } catch (error) {
    res.status(500).json({ message: '删除机房失败', error: error.message });
  }
};