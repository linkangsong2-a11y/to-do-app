const categoryLabels = {
    defect: '缺陷',
    implementation: '实现',
    management: '管理',
    coordination: '协调',
    other: '其他'
};

const priorityLabels = {
    high: { label: '高', color: '#ff3b30' },
    medium: { label: '中', color: '#ff9500' },
    low: { label: '低', color: '#0071e3' },
    none: { label: '无', color: '#86868b' }
};

function renderTasks() {
    updateProjectFilterBar();
    let tasks = AppState.tasks || [];

    if (AppState.currentProjectFilter) {
        tasks = tasks.filter(t => t.project_id === AppState.currentProjectFilter);
    }
    if (AppState.currentStatusFilter !== '' && AppState.currentStatusFilter !== undefined) {
        const wantCompleted = AppState.currentStatusFilter === 'true';
        tasks = tasks.filter(t => !!t.completed === wantCompleted);
    }
    if (AppState.searchQuery) {
        const q = AppState.searchQuery.toLowerCase();
        tasks = tasks.filter(t =>
            (t.title && t.title.toLowerCase().includes(q)) ||
            (t.description && t.description.toLowerCase().includes(q))
        );
    }
    if (AppState.priorityFilter !== 'all' && AppState.priorityFilter) {
        tasks = tasks.filter(t => t.priority === AppState.priorityFilter);
    }

    if (tasks.length === 0) {
        document.getElementById('tasksGrid').innerHTML = `
            <div class="card" style="grid-column:1/-1;">
                <div class="card-body" style="text-align:center;padding:60px 40px;">
                    <div style="font-size:48px;margin-bottom:16px;opacity:0.3;">📋</div>
                    <h3 style="font-size:20px;margin-bottom:8px;">没有任务</h3>
                    <p style="color:var(--text-secondary);margin-bottom:24px;">点击"新建任务"按钮开始添加</p>
                    <button class="btn btn-primary" onclick="openCreateTaskModal()">+ 新建任务</button>
                </div>
            </div>
        `;
        return;
    }

    document.getElementById('tasksGrid').innerHTML = tasks.map(t => {
        const overdue = !t.completed && isOverdue(t.due_date_time);
        const catCls = t.category && t.category !== 'other' ? `cat-${t.category}` : '';
        const priColor = priorityLabels[t.priority] ? priorityLabels[t.priority].color : '#86868b';
        const tags = [];
        if (t.project_name) tags.push(`<span class="tag project">${escapeHtml(t.project_name)}</span>`);
        if (t.category && t.category !== 'other') tags.push(`<span class="tag ${catCls}">${categoryLabels[t.category] || t.category}</span>`);
        if (t.priority && t.priority !== 'none') tags.push(`<span class="tag priority-${t.priority}">${priorityLabels[t.priority].label}优先级</span>`);
        if (overdue) tags.push(`<span class="tag overdue">已逾期</span>`);
        return `
            <div class="task-card" data-edit-task="${escapeHtml(t.id)}">
                <div class="task-card-top">
                    <div class="task-check ${t.completed ? 'done' : ''}" data-toggle-task="${escapeHtml(t.id)}">
                        ${t.completed ? '<span style="color:white;font-size:11px;">✓</span>' : ''}
                    </div>
                    <div class="task-content" style="flex:1;min-width:0;">
                        <div class="task-title ${t.completed ? 'done' : ''}" style="font-size:15px;font-weight:500;margin-bottom:6px;white-space:normal;line-height:1.4;">${escapeHtml(t.title)}</div>
                        ${t.description ? `<div style="font-size:13px;color:var(--text-secondary);line-height:1.5;">${escapeHtml(t.description.slice(0, 80))}${t.description.length > 80 ? '...' : ''}</div>` : ''}
                    </div>
                </div>
                ${tags.length ? `<div class="task-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 12px 34px;">${tags.join('')}</div>` : ''}
                <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);margin-left:34px;">
                    <div class="task-date ${overdue ? 'overdue' : ''}" style="font-size:12px;color:${overdue ? 'var(--danger)' : 'var(--text-muted)'};font-feature-settings:'tnum';">
                        📅 ${formatDateTime(t.due_date_time)}
                    </div>
                    <button class="task-delete" data-delete-task="${escapeHtml(t.id)}" style="width:28px;height:28px;border-radius:6px;background:transparent;border:none;color:var(--text-muted);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;font-size:14px;">✕</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateProjectFilterBar() {
    const projects = AppState.projects || [];
    const buttons = [{ id: '', name: '全部' }, ...projects.map(p => ({ id: p.id, name: p.name }))];
    document.getElementById('projectFilterBar').innerHTML = buttons.map(p =>
        `<button class="filter-chip ${AppState.currentProjectFilter === p.id ? 'active' : ''}" data-filter-project="${escapeHtml(p.id)}">${escapeHtml(p.name)}</button>`
    ).join('');
}

function updateProjectSelect() {
    const projects = AppState.projects || [];
    const select = document.getElementById('taskProjectSelect');
    select.innerHTML = `<option value="">未分配</option>` +
        projects.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`).join('');
}

function openCreateTaskModal(preDate) {
    document.getElementById('taskModalTitle').textContent = '新建任务';
    AppState.editingTaskId = null;
    document.getElementById('taskId').value = '';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskProjectSelect').value = AppState.currentProjectFilter || '';
    document.getElementById('taskPriority').value = 'none';
    document.getElementById('taskStatus').value = 'in_progress';
    document.getElementById('taskAssignee').value = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = preDate ? new Date(preDate) : new Date(today.getTime() + 24 * 60 * 60 * 1000);
    end.setHours(0, 0, 0, 0);

    document.getElementById('taskStartDate').value = tlFormatDate(end);
    document.getElementById('taskEndDate').value = tlFormatDate(end);

    updateProjectSelect();
    showModal('taskModal');
}

function openEditTaskModal(id) {
    const task = (AppState.tasks || []).find(t => t.id === id);
    if (!task) return;
    AppState.editingTaskId = id;
    document.getElementById('taskModalTitle').textContent = '编辑任务';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title || '';
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskPriority').value = task.priority || 'none';
    document.getElementById('taskAssignee').value = task.assignee || '';

    const { startDate, endDate } = tlGetTaskDates(task);
    document.getElementById('taskStartDate').value = startDate ? tlFormatDate(startDate) : '';
    document.getElementById('taskEndDate').value = endDate ? tlFormatDate(endDate) : '';
    document.getElementById('taskStatus').value = tlGetTaskStatus(task);

    updateProjectSelect();
    document.getElementById('taskProjectSelect').value = task.project_id || '';
    showModal('taskModal');
}

async function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const endDate = document.getElementById('taskEndDate').value;
    const btn = document.getElementById('saveTaskBtn');

    if (!title) { showToast('请输入任务名称', 'error'); return; }
    if (!endDate) { showToast('请选择结束日期', 'error'); return; }

    setButtonLoading(btn, '保存中...');

    const startDate = document.getElementById('taskStartDate').value || endDate;
    const description = document.getElementById('taskDescription').value.trim();
    const status = document.getElementById('taskStatus').value;

    const payload = {
        title,
        description,
        priority: document.getElementById('taskPriority').value,
        assignee: document.getElementById('taskAssignee').value.trim(),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        due_date_time: new Date(endDate).toISOString(),
        status: status,
        completed: status === 'completed',
        project_id: document.getElementById('taskProjectSelect').value || null
    };

    try {
        if (AppState.editingTaskId) {
            await TaskAPI.update(AppState.editingTaskId, payload);
            showToast('任务已更新');
        } else {
            await TaskAPI.create(payload);
            showToast('任务已创建');
        }
        hideModal('taskModal');
        await loadData();
        renderDashboard();
        renderProjects();
        renderTasks();
        if (AppState.currentView === 'timeline') renderTimeline();
    } catch (e) {
        showToast(e.message || '保存失败', 'error');
    } finally {
        resetButton(btn);
        btn.textContent = '保存';
    }
}

async function toggleTaskComplete(id) {
    const task = (AppState.tasks || []).find(t => t.id === id);
    if (!task) return;
    try {
        await TaskAPI.toggleComplete(id, !task.completed);
        await loadData();
        renderDashboard();
        renderTasks();
        renderProjects();
    } catch (e) {
        showToast(e.message || '更新失败', 'error');
    }
}

function deleteTask(id) {
    showConfirm('删除任务', '确定要删除这个任务吗？任务会移到回收站。', async () => {
        try {
            await TaskAPI.remove(id);
            await loadData();
            renderDashboard();
            renderProjects();
            renderTasks();
            showToast('任务已删除');
        } catch (e) {
            showToast(e.message || '删除失败', 'error');
        }
    }, '删除');
}

function clearCompletedTasks() {
    const completed = (AppState.tasks || []).filter(t => t.completed);
    if (completed.length === 0) { showToast('没有已完成的任务'); return; }
    showConfirm('清空已完成', `确定要删除 ${completed.length} 个已完成任务吗？`, async () => {
        for (const t of completed) {
            try { await TaskAPI.remove(t.id); } catch(e) {}
        }
        await loadData();
        renderDashboard();
        renderProjects();
        renderTasks();
        showToast('已清空');
    }, '清空');
}
