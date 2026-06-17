const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('id, completed, deleted, priority')
            .eq('user_id', userId);

        if (tasksError) throw tasksError;

        const activeTasks = (tasksData || []).filter(t => t.deleted === 0 || t.deleted === false);
        const total = activeTasks.length;
        const completed = activeTasks.filter(t => t.completed === 1 || t.completed === true).length;
        const active = total - completed;
        const inTrash = (tasksData || []).filter(t => t.deleted === 1 || t.deleted === true).length;

        const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('id')
            .eq('user_id', userId);

        if (projectsError) throw projectsError;
        const projectsCount = (projectsData || []).length;

        const priorityStats = { high: 0, medium: 0, low: 0, none: 0 };
        activeTasks.forEach(t => {
            if (t.priority in priorityStats) priorityStats[t.priority]++;
        });

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        res.json({
            total_tasks: total,
            completed_tasks: completed,
            active_tasks: active,
            in_trash: inTrash,
            projects: projectsCount,
            completion_rate: completionRate,
            priority_distribution: priorityStats
        });
    } catch (err) {
        console.error('[Stats overview]', err.message);
        res.status(500).json({ error: '获取统计数据失败' });
    }
});

router.get('/projects', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, name, color, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        const { data: allTasks, error: tasksError } = await supabase
            .from('tasks')
            .select('project_id, completed')
            .eq('user_id', userId)
            .eq('deleted', 0);

        if (tasksError) throw tasksError;

        const projectStats = (projects || []).map(project => {
            const projectTasks = (allTasks || []).filter(t => t.project_id === project.id);
            const total = projectTasks.length;
            const completedCount = projectTasks.filter(t => t.completed === 1 || t.completed === true).length;

            return {
                id: project.id,
                name: project.name,
                color: project.color,
                total_tasks: total,
                completed_tasks: completedCount,
                active_tasks: total - completedCount,
                completion_rate: total > 0 ? Math.round((completedCount / total) * 100) : 0
            };
        });

        res.json(projectStats);
    } catch (err) {
        console.error('[Stats projects]', err.message);
        res.status(500).json({ error: '获取项目统计失败' });
    }
});

module.exports = router;
