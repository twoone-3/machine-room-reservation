// filepath: c:\Users\Administrator\dev\machine-room-reservation\backend\src\models\index.js
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

// Define User model
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
    type: DataTypes.ENUM('student', 'admin'),
    defaultValue: 'student',
  },
}, {
  timestamps: true,
});

// Define Room model
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
});

// Define Reservation model
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
});

// Define relationships
User.hasMany(Reservation, { foreignKey: 'user_id' });
Reservation.belongsTo(User, { foreignKey: 'user_id' });

Room.hasMany(Reservation, { foreignKey: 'room_id' });
Reservation.belongsTo(Room, { foreignKey: 'room_id' });

// Sync models with the database
const syncModels = async () => {
  await sequelize.sync();
};

module.exports = {
  sequelize,
  User,
  Room,
  Reservation,
  syncModels,
};