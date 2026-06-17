const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function mapWithProject(task) {
    return {
        ...task,
        project_name: task.projects?.name || null,
        project_color: task.projects?.color || null
    };
}

router.get('/', authenticateToken, async (req, res) => {
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
        const safe = `%${search}%`;
        query = query.or(`title.ilike.${safe},description.ilike.${safe}`);
    }

    if (priority && priority !== 'all') {
        query = query.eq('priority', priority);
    }

    query = query.order('completed', { ascending: true }).order('due_date_time', { ascending: true });

    try {
        const { data, error } = await query;
        if (error) throw error;
        const result = (data || []).map(mapWithProject);
        res.json(result);
    } catch (err) {
        console.error('[Tasks list]', err.message);
        res.status(500).json({ error: '获取任务列表失败' });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
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

        if (error || !data) {
            return res.status(404).json({ error: '任务不存在' });
        }
        res.json(mapWithProject(data));
    } catch (err) {
        console.error('[Tasks get]', err.message);
        res.status(500).json({ error: '获取任务信息失败' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { title, description, category, priority, due_date_time, project_id } = req.body;
    const userId = req.user.id;

    if (!title || !title.trim()) {
        return res.status(400).json({ error: '任务标题不能为空' });
    }
    if (!due_date_time) {
        return res.status(400).json({ error: '截止时间不能为空' });
    }

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 6);
    const createdAt = new Date().toISOString();

    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                id,
                user_id: userId,
                project_id: project_id || null,
                title: title.trim(),
                description: description || '',
                category: category || 'other',
                priority: priority || 'none',
                due_date_time,
                created_at: createdAt,
                updated_at: createdAt
            })
            .select('*, projects(name, color)')
            .single();

        if (error) throw error;
        res.status(201).json(mapWithProject(data));
    } catch (err) {
        console.error('[Tasks create]', err.message);
        res.status(500).json({ error: '创建任务失败' });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
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

        if (error || !data) {
            return res.status(404).json({ error: '任务不存在' });
        }
        res.json(mapWithProject(data));
    } catch (err) {
        console.error('[Tasks update]', err.message);
        res.status(500).json({ error: '更新任务失败' });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const { error } = await supabase
            .from('tasks')
            .update({ deleted: 1, deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ message: '任务已移至回收站' });
    } catch (err) {
        console.error('[Tasks delete]', err.message);
        res.status(500).json({ error: '删除任务失败' });
    }
});

router.put('/:id/complete', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const userId = req.user.id;

    try {
        const { error } = await supabase
            .from('tasks')
            .update({ completed: completed ? 1 : 0, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ message: '任务状态已更新' });
    } catch (err) {
        console.error('[Tasks complete]', err.message);
        res.status(500).json({ error: '更新任务状态失败' });
    }
});

module.exports = router;
