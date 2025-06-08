import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { connectDB } from './config/db.js';
import { sequelize, syncModels } from './models/index.js'; // 导入 sequelize 和 syncModels

const app = express();
const PORT = process.env.PORT || 5000;

// 跨域中间件，允许前端请求
app.use(cors());
// 解析 JSON 请求体
app.use(express.json());
// 解析 URL 编码请求体
app.use(express.urlencoded({ extended: true }));

// 数据库连接
connectDB();

// Sequelize 初始化和模型同步
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize: Connection has been established successfully.');
    await syncModels(); // 同步模型到数据库
    console.log('Sequelize: All models were synchronized successfully.');
  } catch (error) {
    console.error('Sequelize: Unable to connect to the database or sync models:', error);
  }
})();

// 路由挂载，所有接口统一加 /api 前缀
app.use('/api', routes);

// 启动服务
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});