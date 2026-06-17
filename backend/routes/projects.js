const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        console.error('[Projects list]', err.message);
        res.status(500).json({ error: '获取项目列表失败' });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: '项目不存在' });
        }
        res.json(data);
    } catch (err) {
        console.error('[Projects get]', err.message);
        res.status(500).json({ error: '获取项目信息失败' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { name, description, color } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: '项目名称不能为空' });
    }

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 6);
    const createdAt = new Date().toISOString();

    try {
        const { data, error } = await supabase
            .from('projects')
            .insert({
                id,
                user_id: userId,
                name: name.trim(),
                description: description || '',
                color: color || '#3B82F6',
                created_at: createdAt,
                updated_at: createdAt
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('[Projects create]', err.message);
        res.status(500).json({ error: '创建项目失败' });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
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
            return res.status(404).json({ error: '项目不存在' });
        }

        if (existing.name === '默认项目') {
            return res.status(400).json({ error: '不能修改默认项目' });
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

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('[Projects update]', err.message);
        res.status(500).json({ error: '更新项目失败' });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
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
            return res.status(404).json({ error: '项目不存在' });
        }

        if (existing.name === '默认项目') {
            return res.status(400).json({ error: '不能删除默认项目' });
        }

        const { data: defaultProject, error: defaultError } = await supabase
            .from('projects')
            .select('id')
            .eq('name', '默认项目')
            .eq('user_id', userId)
            .single();

        if (defaultError || !defaultProject) {
            return res.status(500).json({ error: '找不到默认项目' });
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

        if (error) throw error;
        res.json({ message: '项目已删除，相关任务已移至默认项目' });
    } catch (err) {
        console.error('[Projects delete]', err.message);
        res.status(500).json({ error: '删除项目失败' });
    }
});

module.exports = router;
