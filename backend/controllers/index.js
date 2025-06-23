import { User, Room, Reservation } from '../models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Op, fn, col } from 'sequelize'; // 修改：新增 fn 和 col

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
        // 为了反映机房的实时可用性，我们检查“明天”的预约情况
        // 注意：这是一个简化的实现，仅根据明天的预约数判断。
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().split('T')[0];

        // 查找明天所有状态为 'booked' 的预约，并按 room_id 分组计数
        const bookedCounts = await Reservation.findAll({
            where: {
                date: dateString,
                status: 'booked'
            },
            attributes: ['room_id', [fn('COUNT', col('id')), 'count']],
            group: ['room_id'],
            raw: true // 直接返回 JS 对象，提高效率
        });

        // 将预约计数转换为以 room_id 为键的 Map，方便快速查找
        const bookingCountsMap = bookedCounts.reduce((acc, item) => {
            acc[item.room_id] = item.count;
            return acc;
        }, {});

        const rooms = await Room.findAll();

        // 遍历所有机房，并根据预约数量动态附加其可用状态
        const roomsWithStatus = rooms.map(room => {
            const roomJson = room.toJSON();
            const count = bookingCountsMap[roomJson.id] || 0;
            
            // 系统中一天有6个预约时间段，如果预约数达到6，则认为该机房明天不可用
            if (count >= 6) {
                // 动态修改返回给前端的状态，此操作不影响数据库中的原始数据
                roomJson.status = 'unavailable'; 
            }
            return roomJson;
        });

        res.json(roomsWithStatus);
    } catch (error) {
        console.error('获取机房信息出错:', error);
        res.status(500).json({ message: '获取机房信息出错', error: error.message });
    }
};

// 获取当前用户的预约记录
export const getMyReservations = async (req, res) => {
    try {
        const userId = req.user.id;
        // 查询所有预约，按日期和时间降序
        const reservations = await Reservation.findAll({
            where: { user_id: userId },
            include: [{
                model: Room,
                attributes: ['name', 'location']
            }],
            order: [['date', 'DESC'], ['start_time', 'DESC']]
        });

        // 如果超过30条，删除多余的
        if (reservations.length > 30) {
            // 只保留前30条，后面的删除
            const toDelete = reservations.slice(30);
            const idsToDelete = toDelete.map(r => r.id);
            await Reservation.destroy({ where: { id: idsToDelete } });
            // 返回前30条
            res.json(reservations.slice(0, 30));
        } else {
            res.json(reservations);
        }
    } catch (error) {
        console.error('获取预约记录失败:', error);
        res.status(500).json({ message: '获取预约记录失败', error: error.message });
    }
};

// 创建预约
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
        // 检查该时间段是否已被预约
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

// 取消预约时无需更改 Room.status
export const cancelReservation = async (req, res) => {
    try {
        const userId = req.user.id;
        const reservationId = req.params.id;
        // 只允许本人取消自己的预约，且仅能取消booked状态
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