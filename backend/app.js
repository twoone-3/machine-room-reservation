import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { connectDB } from './config/db.js';
import { sequelize, syncModels } from './models/index.js'; // 导入 sequelize 和 syncModels
import { completeReservations } from './tasks/completeReservations.js';

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
    console.log('Sequelize：数据库连接成功。');
    await syncModels(); // 同步模型到数据库
    console.log('Sequelize：所有模型已成功同步。');
  } catch (error) {
    console.error('Sequelize：无法连接到数据库或同步模型：', error);
  }
})();

// 路由挂载，所有接口统一加 /api 前缀
app.use('/api', routes);

// 启动服务
app.listen(PORT, () => {
  console.log(`服务器正在运行：http://localhost:${PORT}`);
});

setInterval(() => {
  completeReservations().catch(console.error);
}, 10 * 60 * 1000); // 每10分钟改变预约状态的任务