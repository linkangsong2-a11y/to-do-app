let trashTasks = [];

async function loadTrash() {
    try {
        trashTasks = await TrashAPI.getAll();
    } catch (e) {
        trashTasks = [];
    }
}

function renderTrash() {
    const items = Array.isArray(trashTasks) ? trashTasks : [];
    if (items.length === 0) {
        document.getElementById('trashList').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🗑</div>
                <div class="empty-title">回收站是空的</div>
                <div class="empty-subtitle">删除的任务会出现在这里</div>
            </div>
        `;
        return;
    }

    document.getElementById('trashList').innerHTML = items.map(t => `
        <div class="trash-item">
            <div class="trash-icon">🗑</div>
            <div class="trash-content">
                <div class="trash-title">${escapeHtml(t.title || '(无标题)')}</div>
                <div class="trash-meta">
                    ${t.project_name ? `${escapeHtml(t.project_name)} · ` : ''}
                    ${formatDateTime(t.deleted_at)} 删除
                </div>
            </div>
            <div style="display:flex;gap:8px;">
                <button class="btn btn-secondary" style="padding:8px 14px;font-size:13px;" data-restore-task="${escapeHtml(t.id)}">恢复</button>
                <button class="btn btn-danger" style="padding:8px 14px;font-size:13px;" data-perm-delete="${escapeHtml(t.id)}">永久删除</button>
            </div>
        </div>
    `).join('');
}

async function restoreTask(id) {
    try {
        await TrashAPI.restore(id);
        showToast('任务已恢复');
        await loadTrash();
        await loadData();
        renderTrash();
        renderDashboard();
        renderProjects();
        renderTasks();
    } catch (e) {
        showToast(e.message || '恢复失败', 'error');
    }
}

async function permanentDeleteTask(id) {
    showConfirm('永久删除', '此操作不可撤销，确定要永久删除这个任务吗？', async () => {
        try {
            await TrashAPI.permanentDelete(id);
            showToast('已永久删除');
            await loadTrash();
            renderTrash();
        } catch(e) {
            showToast(e.message || '删除失败', 'error');
        }
    }, '永久删除');
}

async function emptyTrash() {
    const items = Array.isArray(trashTasks) ? trashTasks : [];
    if (items.length === 0) { showToast('回收站是空的'); return; }
    showConfirm('清空回收站', `确定要永久删除 ${items.length} 个任务吗？此操作不可撤销。`, async () => {
        try {
            await TrashAPI.empty();
            showToast('回收站已清空');
            trashTasks = [];
            renderTrash();
        } catch(e) {
            showToast(e.message || '清空失败', 'error');
        }
    }, '清空');
}
