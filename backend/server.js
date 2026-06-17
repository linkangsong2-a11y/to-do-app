require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const trashRoutes = require('./routes/trash');
const statsRoutes = require('./routes/stats');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, '..')));

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>TaskFlow API</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        h1 { color: #333; margin-bottom: 10px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #3B82F6; margin-bottom: 15px; font-size: 1.2rem; }
        .api-list { list-style: none; padding: 0; }
        .api-item { margin-bottom: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; }
        .api-method { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 8px; }
        .GET { background: #d1fae5; color: #065f46; }
        .POST { background: #dbeafe; color: #1e40af; }
        .PUT { background: #fef3c7; color: #b45309; }
        .DELETE { background: #fee2e2; color: #991b1b; }
        .api-path { font-family: monospace; font-size: 14px; color: #3B82F6; }
        .links { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        .link-btn { display: inline-block; padding: 10px 20px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; margin-right: 10px; }
        .link-btn.secondary { background: #f1f5f9; color: #333; }
        .db-info { background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>TaskFlow API</h1>
        <p class="subtitle">项目管理与任务追踪应用后端接口</p>
        <div class="db-info"><strong>数据库:</strong> Supabase Postgres | <strong>状态:</strong> 已集成用户认证</div>
        <div class="section">
            <h2>用户认证</h2>
            <ul class="api-list">
                <li class="api-item"><span class="api-method POST">POST</span><span class="api-path">/api/auth/register</span><span>用户注册</span></li>
                <li class="api-item"><span class="api-method POST">POST</span><span class="api-path">/api/auth/login</span><span>用户登录</span></li>
                <li class="api-item"><span class="api-method POST">POST</span><span class="api-path">/api/auth/logout</span><span>用户登出</span></li>
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/auth/user</span><span>获取当前用户信息</span></li>
            </ul>
        </div>
        <div class="section">
            <h2>项目与任务</h2>
            <ul class="api-list">
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/projects</span><span>获取所有项目</span></li>
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/tasks</span><span>获取任务列表</span></li>
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/trash</span><span>回收站</span></li>
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/stats</span><span>统计数据</span></li>
            </ul>
        </div>
        <div class="links">
            <a href="/app" class="link-btn">任务管理应用</a>
            <a href="/api/projects" class="link-btn secondary">查看项目</a>
        </div>
    </div>
</body>
</html>
`;
    res.send(html);
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/trash', trashRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, req, res, next) => {
    console.error('[Unhandled error]', err);
    res.status(500).json({ error: '服务器内部错误' });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`应用页面: http://localhost:${port}/app`);
});
