# Todo App with MySQL

一个使用 Node.js + Express + MySQL 构建的待办事项管理应用。

## 技术栈

- **前端**: HTML5 + Tailwind CSS + Vanilla JavaScript
- **后端**: Node.js + Express
- **数据库**: MySQL
- **样式**: Tailwind CSS 3

## 项目结构

```
html_artifact/
├── todo-app.html          # 前端页面
├── backend/               # 后端服务
│   ├── server.js          # Express 服务器
│   ├── package.json       # 依赖配置
│   └── .env               # 环境变量配置
└── README.md              # 项目说明
```

## 安装与运行

### 1. 安装 MySQL

确保你的系统已安装 MySQL 数据库。

### 2. 创建数据库

```sql
CREATE DATABASE todo_db;
```

### 3. 配置环境变量

编辑 `backend/.env` 文件，填入你的 MySQL 配置：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=todo_db
DB_PORT=3306
SERVER_PORT=3001
```

### 4. 安装后端依赖

```bash
cd backend
npm install
```

### 5. 启动后端服务

```bash
cd backend
npm start
```

服务将在 `http://localhost:3001` 启动。

### 6. 打开前端页面

直接在浏览器中打开 `todo-app.html` 文件即可。

## API 接口

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/tasks` | 获取任务列表 |
| GET | `/api/tasks/:id` | 获取单个任务 |
| POST | `/api/tasks` | 创建新任务 |
| PUT | `/api/tasks/:id` | 更新任务 |
| DELETE | `/api/tasks/:id` | 删除任务（移至回收站） |
| PUT | `/api/tasks/:id/complete` | 切换任务完成状态 |
| GET | `/api/trash` | 获取回收站列表 |
| POST | `/api/trash/:id/restore` | 恢复任务 |
| DELETE | `/api/trash/:id` | 永久删除任务 |
| DELETE | `/api/trash` | 清空回收站 |
| GET | `/api/stats` | 获取任务统计 |

## 使用说明

1. 启动后端服务后，打开 `todo-app.html`
2. 在表单中输入任务标题、描述、优先级和截止日期
3. 点击「添加任务」按钮创建任务
4. 使用复选框标记任务完成状态
5. 点击编辑按钮修改任务
6. 点击删除按钮将任务移至回收站
7. 在回收站中可以恢复或永久删除任务

## 注意事项

- 确保 MySQL 服务正在运行
- 确保 `.env` 文件中的数据库配置正确
- 前端页面通过 `http://localhost:3001/api` 访问后端 API