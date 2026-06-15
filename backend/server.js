const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, '..')));

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'todo-app.html'));
});

app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskFlow API</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
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
        .api-desc { color: #666; font-size: 13px; margin-top: 4px; }
        .links { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        .link-btn { display: inline-block; padding: 10px 20px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; margin-right: 10px; transition: all 0.2s; }
        .link-btn:hover { background: #2563eb; transform: translateY(-2px); }
        .link-btn.secondary { background: #f1f5f9; color: #333; }
        .link-btn.secondary:hover { background: #e2e8f0; }
        .db-info { background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 TaskFlow API</h1>
        <p class="subtitle">项目管理与任务追踪应用后端接口</p>
        
        <div class="db-info">
            <strong>数据库:</strong> Supabase Postgres | <strong>状态:</strong> 已集成用户认证
        </div>

        <div class="section">
            <h2>🔐 用户认证 API</h2>
            <ul class="api-list">
                <li class="api-item"><span class="api-method POST">POST</span><span class="api-path">/api/auth/register</span><p class="api-desc">用户注册</p></li>
                <li class="api-item"><span class="api-method POST">POST</span><span class="api-path">/api/auth/login</span><p class="api-desc">用户登录</p></li>
                <li class="api-item"><span class="api-method POST">POST</span><span class="api-path">/api/auth/logout</span><p class="api-desc">用户登出</p></li>
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/auth/user</span><p class="api-desc">获取当前用户信息</p></li>
            </ul>
        </div>

        <div class="section">
            <h2>📊 项目管理 API</h2>
            <ul class="api-list">
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/projects</span><p class="api-desc">获取当前用户的所有项目</p></li>
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/projects/:id</span><p class="api-desc">获取单个项目详情</p></li>
                <li class="api-item"><span class="api-method POST">POST</span><span class="api-path">/api/projects</span><p class="api-desc">创建新项目</p></li>
                <li class="api-item"><span class="api-method PUT">PUT</span><span class="api-path">/api/projects/:id</span><p class="api-desc">更新项目信息</p></li>
                <li class="api-item"><span class="api-method DELETE">DELETE</span><span class="api-path">/api/projects/:id</span><p class="api-desc">删除项目</p></li>
            </ul>
        </div>

        <div class="section">
            <h2>📋 任务管理 API</h2>
            <ul class="api-list">
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/tasks</span><p class="api-desc">获取任务列表（支持 project_id 过滤）</p></li>
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/tasks/:id</span><p class="api-desc">获取单个任务</p></li>
                <li class="api-item"><span class="api-method POST">POST</span><span class="api-path">/api/tasks</span><p class="api-desc">创建新任务</p></li>
                <li class="api-item"><span class="api-method PUT">PUT</span><span class="api-path">/api/tasks/:id</span><p class="api-desc">更新任务</p></li>
                <li class="api-item"><span class="api-method DELETE">DELETE</span><span class="api-path">/api/tasks/:id</span><p class="api-desc">删除任务（移至回收站）</p></li>
                <li class="api-item"><span class="api-method PUT">PUT</span><span class="api-path">/api/tasks/:id/complete</span><p class="api-desc">切换任务完成状态</p></li>
            </ul>
        </div>

        <div class="section">
            <h2>🗑️ 回收站 API</h2>
            <ul class="api-list">
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/trash</span><p class="api-desc">获取回收站列表</p></li>
                <li class="api-item"><span class="api-method POST">POST</span><span class="api-path">/api/trash/:id/restore</span><p class="api-desc">恢复任务</p></li>
                <li class="api-item"><span class="api-method DELETE">DELETE</span><span class="api-path">/api/trash/:id</span><p class="api-desc">永久删除任务</p></li>
                <li class="api-item"><span class="api-method DELETE">DELETE</span><span class="api-path">/api/trash</span><p class="api-desc">清空回收站</p></li>
            </ul>
        </div>

        <div class="section">
            <h2>📈 统计分析 API</h2>
            <ul class="api-list">
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/stats</span><p class="api-desc">获取总体统计数据</p></li>
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/stats/projects</span><p class="api-desc">获取各项目统计数据</p></li>
            </ul>
        </div>
        
        <div class="links">
            <a href="/app" class="link-btn">📱 任务管理应用</a>
            <a href="/api/projects" class="link-btn secondary">📁 查看项目</a>
        </div>
    </div>
</body>
</html>
  `;
    res.send(html);
});

async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
}

app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        if (data.user) {
            const userId = data.user.id;
            await supabase.from('projects').insert({
                id: Date.now().toString(),
                user_id: userId,
                name: '默认项目',
                description: '未分配到特定项目的任务将显示在这里',
                color: '#3B82F6'
            });
        }
        
        res.status(201).json({ 
            message: 'Registration successful', 
            user: data.user ? { id: data.user.id, email: data.user.email } : null 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            return res.status(401).json({ error: error.message });
        }
        
        const { user, session } = data;
        res.json({
            user: { id: user.id, email: user.email },
            token: session.access_token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/user', authenticateToken, async (req, res) => {
    res.json({ id: req.user.id, email: req.user.email });
});

app.get('/api/projects', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        if (!data) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
    const { name, description, color } = req.body;
    const userId = req.user.id;
    
    if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
    }
    
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    
    try {
        const { data, error } = await supabase
            .from('projects')
            .insert({
                id,
                user_id: userId,
                name,
                description: description || '',
                color: color || '#3B82F6',
                created_at: createdAt,
                updated_at: createdAt
            })
            .select()
            .single();
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const userId = req.user.id;
    
    try {
        const { data: existing, error: checkError } = await supabase
            .from('projects')
            .select('id, name')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        if (existing.name === '默认项目') {
            return res.status(400).json({ error: 'Cannot modify default project' });
        }
        
        const { data, error } = await supabase
            .from('projects')
            .update({
                name,
                description: description || '',
                color: color || '#3B82F6',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const { data: existing, error: checkError } = await supabase
            .from('projects')
            .select('id, name')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        
        if (checkError || !existing) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        if (existing.name === '默认项目') {
            return res.status(400).json({ error: 'Cannot delete default project' });
        }
        
        const { data: defaultProject, error: defaultError } = await supabase
            .from('projects')
            .select('id')
            .eq('name', '默认项目')
            .eq('user_id', userId)
            .single();
        
        if (defaultError || !defaultProject) {
            return res.status(500).json({ error: 'Default project not found' });
        }
        
        await supabase
            .from('tasks')
            .update({ project_id: defaultProject.id })
            .eq('project_id', id)
            .eq('user_id', userId);
        
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        res.json({ message: 'Project deleted and tasks moved to default' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/tasks', authenticateToken, async (req, res) => {
    const { completed, search, priority, project_id } = req.query;
    const userId = req.user.id;
    
    let query = supabase
        .from('tasks')
        .select('*, projects(name, color)')
        .eq('user_id', userId)
        .eq('deleted', 0);
    
    if (project_id) {
        query = query.eq('project_id', project_id);
    }
    
    if (completed !== undefined) {
        query = query.eq('completed', completed === 'true' ? 1 : 0);
    }
    
    if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (priority && priority !== 'all') {
        query = query.eq('priority', priority);
    }
    
    query = query.order('completed', { ascending: true }).order('due_date_time', { ascending: true });
    
    try {
        const { data, error } = await query;
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        const result = data.map(task => ({
            ...task,
            project_name: task.projects?.name || null,
            project_color: task.projects?.color || null
        }));
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/tasks/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*, projects(name, color)')
            .eq('id', id)
            .eq('user_id', userId)
            .eq('deleted', 0)
            .single();
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        if (!data) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({
            ...data,
            project_name: data.projects?.name || null,
            project_color: data.projects?.color || null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
    const { title, description, category, priority, due_date_time, project_id } = req.body;
    const userId = req.user.id;
    
    if (!title || !due_date_time) {
        return res.status(400).json({ error: 'Title and due date are required' });
    }
    
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    
    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                id,
                user_id: userId,
                project_id: project_id || null,
                title,
                description: description || '',
                category: category || 'other',
                priority: priority || 'none',
                due_date_time,
                created_at: createdAt,
                updated_at: createdAt
            })
            .select('*, projects(name, color)')
            .single();
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        res.status(201).json({
            ...data,
            project_name: data.projects?.name || null,
            project_color: data.projects?.color || null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, category, priority, due_date_time, completed, project_id } = req.body;
    const userId = req.user.id;
    
    try {
        const { data, error } = await supabase
            .from('tasks')
            .update({
                title,
                description: description || '',
                category: category || 'other',
                priority: priority || 'none',
                due_date_time,
                completed: completed ? 1 : 0,
                project_id: project_id || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select('*, projects(name, color)')
            .single();
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        if (!data) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({
            ...data,
            project_name: data.projects?.name || null,
            project_color: data.projects?.color || null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const { error } = await supabase
            .from('tasks')
            .update({
                deleted: 1,
                deleted_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', userId);
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        res.json({ message: 'Task moved to trash' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tasks/:id/complete', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const userId = req.user.id;
    
    try {
        const { error } = await supabase
            .from('tasks')
            .update({
                completed: completed ? 1 : 0,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', userId);
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        res.json({ message: 'Task status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/trash', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*, projects(name)')
            .eq('user_id', userId)
            .eq('deleted', 1)
            .order('deleted_at', { ascending: false });
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        const result = data.map(task => ({
            ...task,
            project_name: task.projects?.name || null
        }));
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/trash/:id/restore', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const { error } = await supabase
            .from('tasks')
            .update({
                deleted: 0,
                deleted_at: null
            })
            .eq('id', id)
            .eq('user_id', userId);
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        res.json({ message: 'Task restored successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/trash/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        res.json({ message: 'Task permanently deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/trash', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('user_id', userId)
            .eq('deleted', 1);
        
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        
        res.json({ message: 'Trash emptied' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    
    try {
        const { count: totalCount, error: totalError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('deleted', false);
        
        if (totalError) throw totalError;
        const total = totalCount || 0;
        
        const { count: completedCount, error: completedError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('deleted', false)
            .eq('completed', true);
        
        if (completedError) throw completedError;
        const completed = completedCount || 0;
        
        const { count: activeCount, error: activeError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('deleted', false)
            .eq('completed', false);
        
        if (activeError) throw activeError;
        
        const { count: trashCount, error: trashError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('deleted', true);
        
        if (trashError) throw trashError;
        
        const { count: projectCount, error: projectError } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        if (projectError) throw projectError;
        
        const { data: priorityData, error: priorityError } = await supabase
            .from('tasks')
            .select('priority')
            .eq('user_id', userId)
            .eq('deleted', false);
        
        if (priorityError) throw priorityError;
        
        const priorityStats = { high: 0, medium: 0, low: 0, none: 0 };
        priorityData.forEach(row => {
            if (row.priority in priorityStats) {
                priorityStats[row.priority]++;
            }
        });
        
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        res.json({
            total_tasks: total,
            completed_tasks: completed,
            active_tasks: activeCount || 0,
            in_trash: trashCount || 0,
            projects: projectCount || 0,
            completion_rate: completionRate,
            priority_distribution: priorityStats
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats/projects', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    
    try {
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, name, color, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (projectsError) {
            return res.status(500).json({ error: projectsError.message });
        }
        
        const { data: allTasks, error: tasksError } = await supabase
            .from('tasks')
            .select('project_id, completed')
            .eq('user_id', userId)
            .eq('deleted', false);
        
        if (tasksError) {
            return res.status(500).json({ error: tasksError.message });
        }
        
        const projectStats = projects.map(project => {
            const projectTasks = allTasks.filter(t => t.project_id === project.id);
            const total = projectTasks.length;
            const completedCount = projectTasks.filter(t => t.completed === true).length;
            
            return {
                id: project.id,
                name: project.name,
                color: project.color,
                total_tasks: total,
                completed_tasks: completedCount,
                active_tasks: total - completedCount,
                completion_rate: total > 0 ? Math.round((completedCount / total) * 100) : 0
        }));
        
        res.json(projectStats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`应用页面: http://localhost:${port}/app`);
});