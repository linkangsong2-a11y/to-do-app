function checkAuth() {
    const token = localStorage.getItem('taskflow_token');
    return !!token;
}

function showAuth() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
}

function showApp() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    errorEl.classList.add('hidden');

    if (!email || !password) {
        errorEl.textContent = '请输入邮箱和密码';
        errorEl.classList.remove('hidden');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorEl.textContent = '邮箱格式不正确';
        errorEl.classList.remove('hidden');
        return;
    }

    setButtonLoading(btn, '登录中...');
    try {
        const data = await AuthAPI.login(email, password);
        if (data.token) localStorage.setItem('taskflow_token', data.token);
        if (data.user && data.user.email) {
            localStorage.setItem('taskflow_email', data.user.email);
        }
        showToast('登录成功');
        showApp();
        await loadData();
        renderDashboard();
    } catch (e) {
        errorEl.textContent = e.message;
        errorEl.classList.remove('hidden');
    } finally {
        resetButton(btn);
        btn.textContent = '登录';
    }
}

async function handleRegister() {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const errorEl = document.getElementById('registerError');
    const btn = document.getElementById('registerBtn');

    errorEl.classList.add('hidden');

    if (!email || !password) {
        errorEl.textContent = '请输入邮箱和密码';
        errorEl.classList.remove('hidden');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorEl.textContent = '邮箱格式不正确';
        errorEl.classList.remove('hidden');
        return;
    }
    if (password.length < 6) {
        errorEl.textContent = '密码长度至少需要6位';
        errorEl.classList.remove('hidden');
        return;
    }

    setButtonLoading(btn, '注册中...');
    try {
        await AuthAPI.register(email, password);
        showToast('注册成功，请登录');
        document.querySelector('[data-auth-tab="login"]').click();
        document.getElementById('loginEmail').value = email;
    } catch (e) {
        errorEl.textContent = e.message;
        errorEl.classList.remove('hidden');
    } finally {
        resetButton(btn);
        btn.textContent = '创建账号';
    }
}

async function handleLogout() {
    showConfirm('退出登录', '确定要退出当前账号吗？', async () => {
        try { await AuthAPI.logout(); } catch(e) {}
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_email');
        showAuth();
        showToast('已退出登录');
    }, '退出');
}

function initAuth() {
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    document.querySelectorAll('[data-auth-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.authTab;
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById(target === 'login' ? 'loginForm' : 'registerForm').classList.add('active');
            document.getElementById('loginError').classList.add('hidden');
            document.getElementById('registerError').classList.add('hidden');
        });
    });

    document.getElementById('toRegister').addEventListener('click', () =>
        document.querySelector('[data-auth-tab="register"]').click()
    );
    document.getElementById('toLogin').addEventListener('click', () =>
        document.querySelector('[data-auth-tab="login"]').click()
    );

    // Enter key submit
    document.getElementById('loginPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('registerPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
}
