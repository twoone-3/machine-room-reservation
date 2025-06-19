
# 🏫 机房预约系统 Machine Room Reservation System

本项目是一个基于 Vue + Node.js + MySQL 的全栈机房预约平台，支持教师用户预约、管理员管理机房和预约情况。

---

## 🛠 技术栈

- **前端**：Vue 3 + Vite + Element Plus + Axios
- **后端**：Node.js + Express + MySQL + JWT
- **数据库**：MySQL 8+
- **开发工具**：VS Code（Windows 环境）

---

## 📁 项目结构

```plaintext

machine-room-reservation/
├── frontend/      # Vue 前端项目
├── backend/       # Node.js 后端项目
├── db/            # 数据库初始化脚本
├── .gitignore     # Git 忽略规则
└── README.md      # 项目说明文件

```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/machine-room-reservation.git
cd machine-room-reservation
```

### 2. 安装依赖

```bat
npm_install.bat
```

### 3. 配置数据库

1. 确保已安装 [MySQL](https://dev.mysql.com/downloads/mysql/)
2. 下载 [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) 或使用命令行创建数据库 `machine_reservation`，并设置 root 用户密码为 `123456`。
3. 将 `db/init.sql` 脚本导入数据库，如果需要清除数据，可以运行 `db/clear.sql` 脚本。
4. 在 `backend/` 中创建 `.env` 文件：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=machine_reservation
JWT_SECRET=your_jwt_secret
```

### 4. 启动项目

在项目根目录下，双击或运行 `run.bat`，即可自动分别启动后端和前端服务：

```bat
run.bat
```

## 📌 功能模块

### 用户端

- 用户注册 / 登录
- 查看机房列表
- 预约机房
- 查看和取消预约记录

### 管理员端

- 添加 / 删除 / 编辑机房
- 查看机房列表
- 管理用户

## 📄 License

本项目仅用于学习用途，禁止商业使用。
