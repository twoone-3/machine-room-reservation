import mysql from 'mysql2';

/**
 * 创建并连接到 MySQL 数据库
 * @returns {mysql.Connection} 数据库连接实例
 */
export const connectDB = () => {
  // 从环境变量读取数据库配置
  const db = mysql.createConnection({
    host: process.env.DB_HOST,      // 数据库主机地址
    user: process.env.DB_USER,      // 数据库用户名
    password: process.env.DB_PASSWORD, // 数据库密码
    database: process.env.DB_NAME,  // 数据库名
  });

  // 尝试连接数据库，并输出连接结果
  db.connect((err) => {
    if (err) {
      console.error('数据库连接失败:', err.stack);
      return;
    }
    console.log('成功连接到数据库.');
  });

  return db;
};