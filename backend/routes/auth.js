const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: '邮箱格式不正确' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: '密码长度至少需要6位' });
    }

    try {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.user) {
            const userId = data.user.id;
            await supabase.from('projects').insert({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
                user_id: userId,
                name: '默认项目',
                description: '未分配到特定项目的任务将显示在这里',
                color: '#3B82F6'
            });
        }

        res.status(201).json({
            message: '注册成功',
            user: data.user ? { id: data.user.id, email: data.user.email } : null
        });
    } catch (err) {
        console.error('[Register]', err.message);
        res.status(500).json({ error: '注册失败，请稍后重试' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: '邮箱格式不正确' });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        const { user, session } = data;
        res.json({
            user: { id: user.id, email: user.email },
            token: session.access_token
        });
    } catch (err) {
        console.error('[Login]', err.message);
        res.status(500).json({ error: '登录失败，请稍后重试' });
    }
});

router.post('/logout', authenticateToken, async (req, res) => {
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

router.get('/user', authenticateToken, async (req, res) => {
    res.json({ id: req.user.id, email: req.user.email });
});

module.exports = router;
