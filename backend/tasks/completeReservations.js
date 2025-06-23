import { Reservation } from '../models/index.js';
import { Op } from 'sequelize';

const completeReservations = async () => {
  const now = new Date();
  // 查找所有已结束但还未完成的预约
  const reservations = await Reservation.findAll({
    where: {
      status: 'booked',
      [Op.and]: [
        { date: { [Op.lte]: now.toISOString().slice(0, 10) } },
        { end_time: { [Op.lte]: now.toTimeString().slice(0, 8) } }
      ]
    }
  });
  for (const res of reservations) {
    res.status = 'completed';
    await res.save();
  }
};

export default completeReservations;