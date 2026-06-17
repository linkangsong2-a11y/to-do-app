function renderDashboard() {
    renderStatsCards();
    renderCompletionSection();
    renderProjectProgress();
    renderRecentTasks();
    renderPriorityDist();
}

function renderStatsCards() {
    const s = AppState.stats || { total_tasks: 0, active_tasks: 0, completed_tasks: 0, projects: 0 };
    const cards = [
        { label: '总任务', value: s.total_tasks || 0, icon: '📋', color: 'blue' },
        { label: '进行中', value: s.active_tasks || 0, icon: '⚡', color: 'orange' },
        { label: '已完成', value: s.completed_tasks || 0, icon: '✅', color: 'green' },
        { label: '项目数', value: s.projects || 0, icon: '📁', color: 'purple' }
    ];
    document.getElementById('statsCards').innerHTML = cards.map(c => `
        <div class="stat">
            <div class="stat-icon ${c.color}">${c.icon}</div>
            <div class="stat-value">${c.value}</div>
            <div class="stat-label">${c.label}</div>
        </div>
    `).join('');
}

function renderCompletionSection() {
    const s = AppState.stats || { total_tasks: 0, active_tasks: 0, completed_tasks: 0, completion_rate: 0 };
    const rate = s.completion_rate || 0;
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (rate / 100) * circumference;

    document.getElementById('completionSection').innerHTML = `
        <div class="completion">
            <div class="ring-wrapper">
                <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" stroke="rgba(0,0,0,0.06)" stroke-width="8" fill="none"/>
                    <circle cx="60" cy="60" r="50" stroke="var(--accent)" stroke-width="8" fill="none"
                        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                        stroke-linecap="round" transform="rotate(-90 60 60)" style="transition:stroke-dashoffset 1s ease"/>
                </svg>
                <div class="ring-text">
                    <div style="font-size:28px;font-weight:600;">${rate}%</div>
                    <div style="font-size:11px;color:var(--text-muted);letter-spacing:0.5px;">完成率</div>
                </div>
            </div>
            <div style="flex:1;">
                <div class="info-row"><span class="info-label">总任务</span><span style="font-weight:500;">${s.total_tasks || 0}</span></div>
                <div class="info-row"><span class="info-label">进行中</span><span style="font-weight:500;color:var(--accent);">${s.active_tasks || 0}</span></div>
                <div class="info-row"><span class="info-label">已完成</span><span style="font-weight:500;color:var(--success);">${s.completed_tasks || 0}</span></div>
            </div>
        </div>
    `;
}

function renderProjectProgress() {
    const stats = AppState.projectStats || [];
    if (stats.length === 0) {
        document.getElementById('projectProgress').innerHTML = `<div class="empty-state"><div class="empty-icon">📁</div><div class="empty-subtitle">暂无项目</div></div>`;
        return;
    }
    document.getElementById('projectProgress').innerHTML = stats.slice(0, 6).map(p => `
        <div class="project-item">
            <div class="project-header">
                <div class="project-name">
                    <span class="project-dot" style="background:${escapeHtml(p.color || '#0071e3')};width:8px;height:8px;border-radius:50%;"></span>
                    ${escapeHtml(p.name)}
                </div>
                <div style="font-size:12px;color:var(--text-muted);">${p.total_tasks || 0} 个 · ${p.completion_rate || 0}%</div>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="height:100%;width:${p.completion_rate || 0}%;background:${escapeHtml(p.color || '#0071e3')};border-radius:2px;transition:width 0.6s ease;"></div></div>
        </div>
    `).join('');
}

function renderRecentTasks() {
    const recent = (AppState.tasks || [])
        .filter(t => !t.completed)
        .slice(0, 6);

    if (recent.length === 0) {
        document.getElementById('recentTasks').innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">全部完成了！</div><div class="empty-subtitle">没有进行中的任务</div></div>`;
        return;
    }
    document.getElementById('recentTasks').innerHTML = recent.map(t => {
        const overdue = !t.completed && isOverdue(t.due_date_time);
        return `
            <div class="task-item" data-edit-task="${escapeHtml(t.id)}">
                <div class="task-check ${t.completed ? 'done' : ''}" data-toggle-task="${escapeHtml(t.id)}">
                    ${t.completed ? '✓' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title ${t.completed ? 'done' : ''}">${escapeHtml(t.title)}</div>
                    <div class="task-meta">
                        ${overdue ? `<span style="color:var(--danger);">⚠ 已逾期</span> · ` : ''}
                        📅 ${formatDateTime(t.due_date_time)}
                        ${t.project_color ? ` · <span style="color:${escapeHtml(t.project_color)};">●</span> ${escapeHtml(t.project_name || '')}` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPriorityDist() {
    const s = (AppState.stats && AppState.stats.priority_distribution) || { high: 0, medium: 0, low: 0, none: 0 };
    const total = (s.high || 0) + (s.medium || 0) + (s.low || 0) + (s.none || 0);
    const items = [
        { key: '高', value: s.high || 0, color: '#ff3b30' },
        { key: '中', value: s.medium || 0, color: '#ff9500' },
        { key: '低', value: s.low || 0, color: '#0071e3' },
        { key: '无', value: s.none || 0, color: '#86868b' }
    ];
    document.getElementById('priorityDist').innerHTML = items.map(i => {
        const pct = total > 0 ? Math.round((i.value / total) * 100) : 0;
        return `
            <div style="padding:10px 0;border-bottom:1px solid var(--border);">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
                    <span style="color:${i.color};font-weight:500;">${i.key}优先级</span>
                    <span style="color:var(--text-secondary);font-feature-settings:'tnum';">${i.value} · ${pct}%</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="height:100%;width:${pct}%;background:${i.color};border-radius:2px;transition:width 0.6s ease;"></div></div>
            </div>
        `;
    }).join('');
}
