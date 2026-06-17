const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*, projects(name)')
            .eq('user_id', userId)
            .eq('deleted', 1)
            .order('deleted_at', { ascending: false });

        if (error) throw error;
        const result = (data || []).map(t => ({ ...t, project_name: t.projects?.name || null }));
        res.json(result);
    } catch (err) {
        console.error('[Trash list]', err.message);
        res.status(500).json({ error: '获取回收站失败' });
    }
});

router.post('/:id/restore', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const { error } = await supabase
            .from('tasks')
            .update({ deleted: 0, deleted_at: null })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ message: '任务已恢复' });
    } catch (err) {
        console.error('[Trash restore]', err.message);
        res.status(500).json({ error: '恢复任务失败' });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ message: '任务已永久删除' });
    } catch (err) {
        console.error('[Trash permanent-delete]', err.message);
        res.status(500).json({ error: '永久删除失败' });
    }
});

router.delete('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('user_id', userId)
            .eq('deleted', 1);

        if (error) throw error;
        res.json({ message: '回收站已清空' });
    } catch (err) {
        console.error('[Trash empty]', err.message);
        res.status(500).json({ error: '清空回收站失败' });
    }
});

module.exports = router;
