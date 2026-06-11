const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// CORS配置 - 支持生产环境
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 静态文件服务 - serve前端HTML
app.use(express.static(path.join(__dirname, '..')));

// 前端页面路由
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
            <strong>数据库:</strong> SQLite | <strong>文件:</strong> backend/todo.db
        </div>

        <div class="section">
            <h2>📊 项目管理 API</h2>
            <ul class="api-list">
                <li class="api-item"><span class="api-method GET">GET</span><span class="api-path">/api/projects</span><p class="api-desc">获取所有项目</p></li>
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
            <a href="/admin" class="link-btn">🔍 数据库管理</a>
            <a href="http://localhost:3001/api/projects" class="link-btn secondary">📁 查看项目</a>
        </div>
    </div>
</body>
</html>
  `;
  res.send(html);
});

const dbPath = path.join(__dirname, 'todo.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err);
    return;
  }
  console.log('Connected to SQLite database');
  createTables();
});

function createTables() {
  const createProjectsTable = `
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3B82F6',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTasksTable = `
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'other',
      priority TEXT DEFAULT 'none',
      due_date_time TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `;

  db.run(createProjectsTable, (err) => {
    if (err) {
      console.error('Error creating projects table:', err);
    } else {
      console.log('Projects table created or already exists');
      createDefaultProject();
    }
  });

  db.run(createTasksTable, (err) => {
    if (err) {
      console.error('Error creating tasks table:', err);
    } else {
      console.log('Tasks table created or already exists');
    }
  });
}

function createDefaultProject() {
  db.get('SELECT id FROM projects WHERE name = ?', ['默认项目'], (err, row) => {
    if (!row) {
      const id = Date.now().toString();
      db.run('INSERT INTO projects (id, name, description) VALUES (?, ?, ?)', 
        [id, '默认项目', '未分配到特定项目的任务将显示在这里']);
    }
  });
}

// 项目管理 API
app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/projects', (req, res) => {
  const { name, description, color } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'Project name is required' });
    return;
  }
  
  const id = Date.now().toString();
  const createdAt = new Date().toISOString();
  
  db.run(
    'INSERT INTO projects (id, name, description, color, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, name, description || '', color || '#3B82F6', createdAt],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, color } = req.body;
  
  db.run(
    'UPDATE projects SET name = ?, description = ?, color = ?, updated_at = ? WHERE id = ?',
    [name, description || '', color || '#3B82F6', new Date().toISOString(), id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT id FROM projects WHERE name = ?', ['默认项目'], (err, defaultRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (id === defaultRow.id) {
      res.status(400).json({ error: 'Cannot delete default project' });
      return;
    }
    
    db.run('UPDATE tasks SET project_id = ? WHERE project_id = ?', [defaultRow.id, id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (this.changes === 0) {
          res.status(404).json({ error: 'Project not found' });
          return;
        }
        res.json({ message: 'Project deleted and tasks moved to default' });
      });
    });
  });
});

// 任务管理 API
app.get('/api/tasks', (req, res) => {
  const { completed, search, priority, project_id } = req.query;
  
  let query = 'SELECT t.*, p.name as project_name, p.color as project_color FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.deleted = 0';
  let params = [];
  
  if (project_id) {
    query += ' AND t.project_id = ?';
    params.push(project_id);
  }
  
  if (completed !== undefined) {
    query += ' AND t.completed = ?';
    params.push(completed === 'true' ? 1 : 0);
  }
  
  if (search) {
    query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (priority && priority !== 'all') {
    query += ' AND t.priority = ?';
    params.push(priority);
  }
  
  query += " ORDER BY t.completed ASC, t.due_date_time ASC";
  
  db.all(query, params, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT t.*, p.name as project_name, p.color as project_color FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = ? AND t.deleted = 0', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, category, priority, due_date_time, project_id } = req.body;
  
  if (!title || !due_date_time) {
    res.status(400).json({ error: 'Title and due date are required' });
    return;
  }
  
  const id = Date.now().toString();
  const createdAt = new Date().toISOString();
  
  db.run(
    'INSERT INTO tasks (id, project_id, title, description, category, priority, due_date_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, project_id || null, title, description || '', category || 'other', priority || 'none', due_date_time, createdAt],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get('SELECT t.*, p.name as project_name, p.color as project_color FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, category, priority, due_date_time, completed, project_id } = req.body;
  
  db.run(
    'UPDATE tasks SET title = ?, description = ?, category = ?, priority = ?, due_date_time = ?, completed = ?, project_id = ?, updated_at = ? WHERE id = ?',
    [title, description || '', category || 'other', priority || 'none', due_date_time, completed ? 1 : 0, project_id || null, new Date().toISOString(), id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      db.get('SELECT t.*, p.name as project_name, p.color as project_color FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  
  db.run(
    'UPDATE tasks SET deleted = 1, deleted_at = ? WHERE id = ?',
    [new Date().toISOString(), id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json({ message: 'Task moved to trash' });
    }
  );
});

app.get('/api/trash', (req, res) => {
  db.all('SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.deleted = 1 ORDER BY t.deleted_at DESC', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.post('/api/trash/:id/restore', (req, res) => {
  const { id } = req.params;
  
  db.run(
    'UPDATE tasks SET deleted = 0, deleted_at = NULL WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Task not found in trash' });
        return;
      }
      res.json({ message: 'Task restored successfully' });
    }
  );
});

app.delete('/api/trash/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ message: 'Task permanently deleted' });
  });
});

app.delete('/api/trash', (req, res) => {
  db.run('DELETE FROM tasks WHERE deleted = 1', function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: `Trash emptied, ${this.changes} tasks deleted` });
  });
});

app.put('/api/tasks/:id/complete', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  
  db.run(
    'UPDATE tasks SET completed = ?, updated_at = ? WHERE id = ?',
    [completed ? 1 : 0, new Date().toISOString(), id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.json({ message: 'Task status updated' });
    }
  );
});

// 统计分析 API
app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM tasks WHERE deleted = 0', (err, totalRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.get('SELECT COUNT(*) as completed FROM tasks WHERE deleted = 0 AND completed = 1', (err, completedRow) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get('SELECT COUNT(*) as active FROM tasks WHERE deleted = 0 AND completed = 0', (err, activeRow) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        db.get('SELECT COUNT(*) as in_trash FROM tasks WHERE deleted = 1', (err, trashRow) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          db.all(`
            SELECT priority, COUNT(*) as count 
            FROM tasks 
            WHERE deleted = 0 
            GROUP BY priority
          `, (err, priorityRows) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            
            db.get('SELECT COUNT(*) as projects FROM projects', (err, projectRow) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              
              const priorityStats = {};
              priorityRows.forEach(row => {
                priorityStats[row.priority] = row.count;
              });
              
              const total = totalRow.total || 0;
              const completed = completedRow.completed || 0;
              const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
              
              res.json({
                total_tasks: total,
                completed_tasks: completed,
                active_tasks: activeRow.active || 0,
                in_trash: trashRow.in_trash || 0,
                projects: projectRow.projects || 0,
                completion_rate: completionRate,
                priority_distribution: {
                  high: priorityStats.high || 0,
                  medium: priorityStats.medium || 0,
                  low: priorityStats.low || 0,
                  none: priorityStats.none || 0
                }
              });
            });
          });
        });
      });
    });
  });
});

app.get('/api/stats/projects', (req, res) => {
  db.all(`
    SELECT 
      p.id, 
      p.name, 
      p.color,
      COUNT(t.id) as total_tasks,
      SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN t.completed = 0 THEN 1 ELSE 0 END) as active_tasks
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id AND t.deleted = 0
    GROUP BY p.id, p.name, p.color
    ORDER BY p.created_at DESC
  `, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const projectStats = results.map(project => ({
      id: project.id,
      name: project.name,
      color: project.color,
      total_tasks: project.total_tasks || 0,
      completed_tasks: project.completed_tasks || 0,
      active_tasks: project.active_tasks || 0,
      completion_rate: project.total_tasks > 0 ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0
    }));
    
    res.json(projectStats);
  });
});

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

app.get('/admin', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, tasks) => {
    if (err) {
      res.status(500).send('Error fetching tasks');
      return;
    }
    
    db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, projects) => {
      if (err) {
        res.status(500).send('Error fetching projects');
        return;
      }
      
      const activeTasks = tasks.filter(t => t.deleted === 0);
      const deletedTasks = tasks.filter(t => t.deleted === 1);
      
      const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数据库管理 - TaskFlow</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .stat-card { transition: all 150ms ease; }
        .stat-card:hover { transform: translateY(-2px); }
        .status-completed { background-color: #d1fae5; color: #065f46; }
        .status-pending { background-color: #fef3c7; color: #b45309; }
        .status-deleted { background-color: #fee2e2; color: #991b1b; }
        .priority-high { background-color: rgba(239, 68, 68, 0.1); color: #dc2626; }
        .priority-medium { background-color: rgba(245, 158, 11, 0.1); color: #d97706; }
        .priority-low { background-color: rgba(59, 130, 246, 0.1); color: #2563eb; }
        .priority-none { background-color: #f3f4f6; color: #6b7280; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <span class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                            <i class="fa-solid fa-database"></i>
                        </span>
                        数据库管理
                    </h1>
                    <p class="text-gray-500 mt-1">实时查看和管理您的项目与任务数据</p>
                </div>
                <a href="/" class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <i class="fa-solid fa-arrow-left"></i> 返回任务管理
                </a>
            </div>
        </header>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="stat-card bg-white rounded-xl p-5 shadow-sm hover:shadow-md border border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <i class="fa-solid fa-list-alt text-white"></i>
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-gray-800">${tasks.length}</p>
                        <p class="text-sm text-gray-500">总任务数</p>
                    </div>
                </div>
            </div>
            <div class="stat-card bg-white rounded-xl p-5 shadow-sm hover:shadow-md border border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <i class="fa-solid fa-check-circle text-white"></i>
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-gray-800">${activeTasks.filter(t => t.completed === 1).length}</p>
                        <p class="text-sm text-gray-500">已完成</p>
                    </div>
                </div>
            </div>
            <div class="stat-card bg-white rounded-xl p-5 shadow-sm hover:shadow-md border border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                        <i class="fa-solid fa-clock text-white"></i>
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-gray-800">${activeTasks.filter(t => t.completed === 0).length}</p>
                        <p class="text-sm text-gray-500">待完成</p>
                    </div>
                </div>
            </div>
            <div class="stat-card bg-white rounded-xl p-5 shadow-sm hover:shadow-md border border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <i class="fa-solid fa-folder-open text-white"></i>
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-gray-800">${projects.length}</p>
                        <p class="text-sm text-gray-500">项目数</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="flex border-b border-gray-200 bg-gray-50">
                        <button onclick="showTab('tasks')" class="tab-btn flex-1 py-4 px-6 text-sm font-medium text-blue-600 border-b-2 border-blue-500 bg-white transition-all">
                            <i class="fa-solid fa-list-ul mr-2"></i>任务列表 <span class="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">${tasks.length}</span>
                        </button>
                        <button onclick="showTab('deleted')" class="tab-btn flex-1 py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700 transition-all">
                            <i class="fa-solid fa-trash mr-2"></i>回收站 <span class="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">${deletedTasks.length}</span>
                        </button>
                    </div>

                    <div id="tasks-tab" class="p-6">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-gray-200">
                                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">项目</th>
                                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">标题</th>
                                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">分类</th>
                                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">优先级</th>
                                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">截止时间</th>
                                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
                                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">创建时间</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    ${activeTasks.length > 0 ? activeTasks.map(task => {
                                      const project = projects.find(p => p.id === task.project_id);
                                      const categoryLabels = { defect: '缺陷解决', implementation: '实施配置', management: '管理', coordination: '协调', other: '其他' };
                                      const categoryColors = { 
                                        defect: 'bg-red-100 text-red-600', 
                                        implementation: 'bg-blue-100 text-blue-600', 
                                        management: 'bg-purple-100 text-purple-600', 
                                        coordination: 'bg-green-100 text-green-600',
                                        other: 'bg-gray-100 text-gray-600' 
                                      };
                                      return `
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        <td class="py-3 px-4">
                                          ${project ? `<span class="inline-flex items-center gap-2">
                                            <span class="w-3 h-3 rounded-full" style="background-color: ${project.color}"></span>
                                            <span class="text-sm text-gray-700">${escapeHtml(project.name)}</span>
                                          </span>` : '<span class="text-sm text-gray-400">未分配</span>'}
                                        </td>
                                        <td class="py-3 px-4 text-sm text-gray-800">${escapeHtml(task.title)}</td>
                                        <td class="py-3 px-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[task.category] || 'bg-gray-100 text-gray-600'}">${categoryLabels[task.category] || '其他'}</span></td>
                                        <td class="py-3 px-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium priority-${task.priority}">${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : task.priority === 'low' ? '低' : '无'}</span></td>
                                        <td class="py-3 px-4 text-sm text-gray-600">${formatDateTime(task.due_date_time)}</td>
                                        <td class="py-3 px-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium status-${task.completed ? 'completed' : 'pending'}">${task.completed ? '已完成' : '待完成'}</span></td>
                                        <td class="py-3 px-4 text-sm text-gray-600">${formatDateTime(task.created_at)}</td>
                                    </tr>
                                      `;
                                    }).join('') : `
                                    <tr><td colspan="7" class="py-12 text-center text-gray-400">暂无任务</td></tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div id="deleted-tab" class="p-6 hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-gray-200">
                                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">标题</th>
                                        <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">删除时间</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    ${deletedTasks.length > 0 ? deletedTasks.map(task => `
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        <td class="py-3 px-4 text-sm text-gray-800 line-through">${escapeHtml(task.title)}</td>
                                        <td class="py-3 px-4 text-sm text-gray-600">${formatDateTime(task.deleted_at)}</td>
                                    </tr>
                                    `).join('') : `
                                    <tr><td colspan="2" class="py-12 text-center text-gray-400">回收站为空</td></tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <i class="fa-solid fa-folder-tree text-blue-500"></i>项目列表
                    </h3>
                    <div class="space-y-3">
                        ${projects.length > 0 ? projects.map(project => {
                          const projectTasks = activeTasks.filter(t => t.project_id === project.id);
                          const completed = projectTasks.filter(t => t.completed === 1).length;
                          const total = projectTasks.length;
                          const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                          return `
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 rounded-full" style="background-color: ${project.color}"></span>
                                    <span class="font-medium text-gray-800">${escapeHtml(project.name)}</span>
                                </div>
                                <span class="text-xs text-gray-500">${completed}/${total}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-1.5">
                                <div class="h-1.5 rounded-full transition-all duration-500" style="width: ${rate}%; background-color: ${project.color}"></div>
                            </div>
                        </div>
                          `;
                        }).join('') : `
                        <p class="text-center text-gray-400 py-4">暂无项目</p>
                        `}
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <i class="fa-solid fa-chart-pie text-blue-500"></i>优先级分布
                    </h3>
                    <div class="space-y-3">
                        ${['high', 'medium', 'low', 'none'].map(p => {
                          const count = activeTasks.filter(t => t.priority === p).length;
                          const colors = { high: '#dc2626', medium: '#d97706', low: '#2563eb', none: '#6b7280' };
                          const labels = { high: '高', medium: '中', low: '低', none: '无' };
                          const total = activeTasks.length;
                          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                          return `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full" style="background-color: ${colors[p]}"></span>
                                    <span class="text-gray-600">${labels[p]}优先级</span>
                                </span>
                                <span class="text-gray-500">${count} (${percent}%)</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="h-2 rounded-full transition-all duration-500" style="width: ${percent}%; background-color: ${colors[p]}"></div>
                            </div>
                        </div>
                          `;
                        }).join('')}
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <i class="fa-solid fa-tags text-blue-500"></i>分类分布
                    </h3>
                    <div class="space-y-3">
                        ${['defect', 'implementation', 'management', 'coordination', 'other'].map(c => {
                          const count = activeTasks.filter(t => t.category === c).length;
                          const colors = { 
                            defect: '#ef4444', 
                            implementation: '#3b82f6', 
                            management: '#8b5cf6', 
                            coordination: '#10b981',
                            other: '#6b7280' 
                          };
                          const labels = { defect: '缺陷解决', implementation: '实施配置', management: '管理', coordination: '协调', other: '其他' };
                          const total = activeTasks.length;
                          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                          return `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full" style="background-color: ${colors[c]}"></span>
                                    <span class="text-gray-600">${labels[c]}</span>
                                </span>
                                <span class="text-gray-500">${count} (${percent}%)</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="h-2 rounded-full transition-all duration-500" style="width: ${percent}%; background-color: ${colors[c]}"></div>
                            </div>
                        </div>
                          `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>

        <footer class="mt-8 text-center text-sm text-gray-400">
            <p>Powered by SQLite | TaskFlow Admin Panel</p>
        </footer>
    </div>

    <script>
        function showTab(tabName) {
            document.querySelectorAll('.tab-btn').forEach(t => {
                t.classList.remove('border-blue-500', 'text-blue-600', 'bg-white');
                t.classList.add('text-gray-500');
            });
            document.querySelectorAll('[id$="-tab"]').forEach(c => c.classList.add('hidden'));
            
            event.target.classList.add('border-blue-500', 'text-blue-600', 'bg-white');
            document.getElementById(tabName + '-tab').classList.remove('hidden');
        }
    </script>
</body>
</html>
      `;
      
      res.send(html);
    });
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`管理页面: http://localhost:${port}/admin`);
  console.log(`应用页面: http://localhost:${port}/app`);
});