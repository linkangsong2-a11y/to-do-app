function renderProjects() {
    const projects = AppState.projects || [];
    const stats = AppState.projectStats || [];

    if (projects.length === 0) {
        document.getElementById('projectsGrid').innerHTML = `
            <div class="card" style="grid-column:1/-1;">
                <div class="card-body" style="text-align:center;padding:60px 40px;">
                    <div class="empty-icon" style="font-size:48px;margin-bottom:16px;opacity:0.3;">📁</div>
                    <h3 style="font-size:20px;margin-bottom:8px;">还没有项目</h3>
                    <p style="color:var(--text-secondary);margin-bottom:24px;">创建你的第一个项目开始管理任务</p>
                    <button class="btn btn-primary" onclick="openCreateProjectModal()">+ 新建项目</button>
                </div>
            </div>
        `;
        return;
    }

    document.getElementById('projectsGrid').innerHTML = projects.map(p => {
        const ps = stats.find(s => s.id === p.id);
        const total = ps ? ps.total_tasks : 0;
        const completed = ps ? ps.completed_tasks : 0;
        const rate = ps ? ps.completion_rate : 0;
        return `
            <div class="project-card" data-show-tasks="${escapeHtml(p.id)}">
                <div class="project-icon" style="background:${escapeHtml(p.color || '#0071e3')};">${escapeHtml(getInitial(p.name))}</div>
                <h3 style="font-size:17px;font-weight:600;margin-bottom:6px;">${escapeHtml(p.name)}</h3>
                <p style="font-size:13px;color:var(--text-secondary);margin-bottom:20px;min-height:40px;">${escapeHtml(p.description || '暂无描述')}</p>
                <div style="display:flex;gap:24px;padding:16px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:16px;">
                    <div>
                        <div style="font-size:20px;font-weight:600;font-feature-settings:'tnum';">${total}</div>
                        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">总任务</div>
                    </div>
                    <div>
                        <div style="font-size:20px;font-weight:600;color:var(--success);font-feature-settings:'tnum';">${completed}</div>
                        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">已完成</div>
                    </div>
                    <div>
                        <div style="font-size:20px;font-weight:600;color:var(--accent);font-feature-settings:'tnum';">${rate}%</div>
                        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">完成率</div>
                    </div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-secondary" style="flex:1;padding:8px 12px;font-size:13px;" data-edit-project="${escapeHtml(p.id)}">编辑</button>
                    <button class="btn btn-danger" style="padding:8px 12px;font-size:13px;" data-delete-project="${escapeHtml(p.id)}">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function openCreateProjectModal() {
    AppState.editingProjectId = null;
    document.getElementById('projectModalTitle').textContent = '新建项目';
    document.getElementById('projectName').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectColor').value = '#0071e3';
    document.querySelectorAll('#colorPicker .color-swatch').forEach(s => s.classList.remove('active'));
    document.querySelector('#colorPicker .color-swatch').classList.add('active');
    showModal('projectModal');
}

function openEditProjectModal(id) {
    const project = (AppState.projects || []).find(p => p.id === id);
    if (!project) return;
    AppState.editingProjectId = id;
    document.getElementById('projectModalTitle').textContent = '编辑项目';
    document.getElementById('projectId').value = project.id;
    document.getElementById('projectName').value = project.name || '';
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectColor').value = project.color || '#0071e3';
    document.querySelectorAll('#colorPicker .color-swatch').forEach(s => {
        s.classList.toggle('active', s.dataset.color === project.color);
    });
    showModal('projectModal');
}

async function saveProject() {
    const name = document.getElementById('projectName').value.trim();
    if (!name) { showToast('请输入项目名称', 'error'); return; }

    const btn = document.getElementById('saveProjectBtn');
    setButtonLoading(btn, '保存中...');

    const description = document.getElementById('projectDescription').value.trim();
    const color = document.getElementById('projectColor').value;

    try {
        if (AppState.editingProjectId) {
            await ProjectAPI.update(AppState.editingProjectId, name, description, color);
            showToast('项目已更新');
        } else {
            await ProjectAPI.create(name, description, color);
            showToast('项目已创建');
        }
        hideModal('projectModal');
        await loadData();
        renderDashboard();
        renderProjects();
    } catch (e) {
        showToast(e.message || '保存失败', 'error');
    } finally {
        resetButton(btn);
        btn.textContent = '保存';
    }
}

function deleteProject(id) {
    const project = (AppState.projects || []).find(p => p.id === id);
    if (!project) return;
    showConfirm('删除项目', `确定要删除项目「${project.name}」吗？项目中的任务将移至默认项目。`, async () => {
        try {
            await ProjectAPI.delete(id);
            await loadData();
            renderDashboard();
            renderProjects();
            showToast('项目已删除');
        } catch(e) {
            showToast(e.message || '删除失败', 'error');
        }
    }, '删除');
}
