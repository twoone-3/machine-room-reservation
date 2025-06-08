import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 初始化 Sequelize 实例
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);

// 用户模型
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('teachers', 'admin'), // 与 init.sql 一致
    defaultValue: 'teachers', // 与 init.sql 一致
  },
}, {
  timestamps: true,
  tableName: 'users', // 指定表名以匹配 init.sql
  underscored: true, // 添加此行，将驼峰字段名映射到下划线数据库列名
  updatedAt: false,  // 添加此行，因为 init.sql 中没有 updated_at 列
});

// 机房模型
const Room = sequelize.define('Room', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
  tableName: 'rooms', // 指定表名以匹配 init.sql
  underscored: true, // 添加此行
  updatedAt: false,  // 添加此行
});

// 预约模型
const Reservation = sequelize.define('Reservation', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time_slot: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
  tableName: 'reservations', // 指定表名以匹配 init.sql
  underscored: true, // 添加此行
  updatedAt: false,  // 添加此行
});

// 关联关系
User.hasMany(Reservation, { foreignKey: 'user_id' });
Reservation.belongsTo(User, { foreignKey: 'user_id' });

Room.hasMany(Reservation, { foreignKey: 'room_id' });
Reservation.belongsTo(Room, { foreignKey: 'room_id' });

// 同步模型到数据库
const syncModels = async () => {
  await sequelize.sync();
};

export { sequelize, User, Room, Reservation, syncModels };