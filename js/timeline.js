function renderTimeline() {
    const tasks = AppState.tasks || [];
    const projects = AppState.projects || [];
    const days = 14;
    const startDate = new Date(AppState.timelineStartDate);
    startDate.setHours(0, 0, 0, 0);

    // Build date columns
    const dateCols = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isToday = d.getTime() === today.getTime();
        dateCols.push({
            date: d,
            dateStr: d.toISOString().split('T')[0],
            label: d.getDate(),
            weekday: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
            isToday
        });
    }

    // Header: Project column + Date columns
    const headerHtml = `
        <div style="display:flex;background:var(--bg-subtle);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;">
            <div style="width:180px;min-width:180px;padding:12px 16px;border-right:1px solid var(--border);font-weight:600;font-size:13px;">项目</div>
            ${dateCols.map(col => `
                <div style="flex:1;min-width:80px;padding:8px 4px;text-align:center;border-right:1px solid var(--border);${col.isToday ? 'background:rgba(0,113,227,0.08);' : ''}">
                    <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">${col.weekday}</div>
                    <div style="font-size:15px;font-weight:600;${col.isToday ? 'color:var(--accent);' : ''}">${col.label}</div>
                </div>
            `).join('')}
        </div>
    `;

    // Group tasks by project
    const projectGroups = {};
    (projects || []).forEach(p => { projectGroups[p.id] = { project: p, tasks: [] }; });
    (tasks || []).forEach(t => {
        const key = t.project_id || '__none__';
        if (!projectGroups[key]) {
            projectGroups[key] = { project: { id: key, name: '未分配', color: '#86868b' }, tasks: [] };
        }
        projectGroups[key].tasks.push(t);
    });

    const groups = Object.values(projectGroups).filter(g => g.tasks.length > 0);

    if (groups.length === 0) {
        document.getElementById('timelineTable').innerHTML = `
            <div class="card" style="margin-top:0;">
                <div class="card-body" style="text-align:center;padding:60px 40px;">
                    <div style="font-size:48px;margin-bottom:16px;opacity:0.3;">📅</div>
                    <h3 style="font-size:20px;margin-bottom:8px;">没有任务</h3>
                    <p style="color:var(--text-secondary);">创建任务后会在这里按日期显示</p>
                </div>
            </div>
        `;
        return;
    }

    const bodyHtml = groups.map(g => {
        const collapsed = AppState.collapsedProjects[g.project.id];
        const total = g.tasks.length;
        const completedCount = g.tasks.filter(t => t.completed).length;
        const rate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        // Build task cells - tasks shown under their due date
        const taskCells = dateCols.map(col => {
            const dayTasks = g.tasks.filter(t => {
                if (!t.due_date_time) return false;
                const dt = new Date(t.due_date_time);
                const taskDate = dt.toISOString().split('T')[0];
                return taskDate === col.dateStr;
            });
            return `
                <div style="flex:1;min-width:80px;padding:8px 4px;border-right:1px solid var(--border);min-height:44px;${col.isToday ? 'background:rgba(0,113,227,0.03);' : ''}">
                    ${dayTasks.map(t => {
                        const overdue = !t.completed && isOverdue(t.due_date_time);
                        return `
                            <div class="timeline-task ${t.completed ? 'done' : ''}" data-edit-task="${escapeHtml(t.id)}"
                                style="padding:5px 8px;background:${t.completed ? 'var(--bg-subtle)' : escapeHtml(g.project.color || '#0071e3')};color:${t.completed ? 'var(--text)' : 'white'};border-radius:6px;font-size:11px;font-weight:500;margin-bottom:4px;cursor:pointer;${t.completed ? 'opacity:0.6;text-decoration:line-through;' : ''}${overdue && !t.completed ? 'background:#ff3b30;' : ''}">
                                ${escapeHtml((t.title || '').slice(0, 15))}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }).join('');

        return `
            <div class="timeline-project-row" data-project-id="${escapeHtml(g.project.id)}" style="border-bottom:1px solid var(--border);">
                <div class="timeline-project-header ${collapsed ? '' : 'expanded'}" 
                     data-toggle-project="${escapeHtml(g.project.id)}"
                     style="display:flex;align-items:center;padding:10px 16px;cursor:pointer;background:var(--bg-subtle);transition:background 0.2s;gap:10px;">
                    <span class="chevron" style="transition:transform 0.2s;color:var(--text-muted);transform:rotate(${collapsed ? '-90deg' : '0'}deg);font-size:10px;">▼</span>
                    <span style="width:8px;height:8px;border-radius:50%;background:${escapeHtml(g.project.color || '#0071e3')};flex-shrink:0;"></span>
                    <span style="font-size:13px;font-weight:600;">${escapeHtml(g.project.name)}</span>
                    <span style="font-size:11px;color:var(--text-muted);margin-left:auto;">${completedCount}/${total}</span>
                    <div style="width:60px;height:3px;background:var(--border);border-radius:2px;overflow:hidden;margin-left:8px;">
                        <div style="width:${rate}%;height:100%;background:${escapeHtml(g.project.color || '#0071e3')};border-radius:2px;"></div>
                    </div>
                </div>
                ${!collapsed ? `
                <div style="display:flex;">
                    <div style="width:180px;min-width:180px;border-right:1px solid var(--border);"></div>
                    <div style="display:flex;flex:1;">${taskCells}</div>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');

    document.getElementById('timelineTable').innerHTML = headerHtml + bodyHtml;
}

function timelinePrev() {
    AppState.timelineStartDate = new Date(AppState.timelineStartDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    renderTimeline();
}

function timelineNext() {
    AppState.timelineStartDate = new Date(AppState.timelineStartDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    renderTimeline();
}

function timelineToday() {
    AppState.timelineStartDate = new Date();
    renderTimeline();
}
