function renderTimeline() {
    const tasks = AppState.tasks || [];
    const projects = AppState.projects || [];
    const days = 14;
    const startDate = new Date(AppState.timelineStartDate);
    startDate.setHours(0, 0, 0, 0);

    // Build date header columns
    const dateCols = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isToday = d.getTime() === today.getTime();
        dateCols.push({
            date: d,
            label: d.getDate(),
            weekday: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
            isToday
        });
    }

    const headerHtml = `
        <div style="display:flex;background:var(--bg-subtle);border-bottom:1px solid var(--border);">
            <div style="width:240px;min-width:240px;padding:14px 20px;border-right:1px solid var(--border);font-weight:600;font-size:13px;">项目 / 任务</div>
            <div style="display:flex;flex:1;">
                <div style="width:240px;min-width:240px;padding:14px 20px;border-right:1px solid var(--border);font-weight:600;font-size:13px;">任务名称</div>
                ${dateCols.map(col => `
                    <div style="flex:1;min-width:80px;padding:10px 4px;text-align:center;border-right:1px solid var(--border);${col.isToday ? 'background:rgba(0,113,227,0.05);' : ''}">
                        <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${col.weekday}</div>
                        <div style="font-size:16px;font-weight:600;${col.isToday ? 'color:var(--accent);' : ''}">${col.label}</div>
                    </div>
                `).join('')}
            </div>
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

    // Filter to projects with tasks
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

        // Build task cells by date
        const taskCells = dateCols.map(col => {
            const dayTasks = g.tasks.filter(t => {
                if (!t.due_date_time) return false;
                const dt = new Date(t.due_date_time);
                return dt.getFullYear() === col.date.getFullYear() &&
                    dt.getMonth() === col.date.getMonth() &&
                    dt.getDate() === col.date.getDate();
            });
            if (dayTasks.length === 0) return `<div style="flex:1;min-width:80px;padding:8px;border-right:1px solid var(--border);min-height:50px;"></div>`;
            return `
                <div style="flex:1;min-width:80px;padding:8px;border-right:1px solid var(--border);min-height:50px;">
                    ${dayTasks.map(t => `
                        <div class="timeline-task ${t.completed ? 'done' : ''}" data-edit-task="${escapeHtml(t.id)}"
                            style="padding:6px 10px;background:var(--bg-subtle);border:1px solid var(--border);border-radius:6px;font-size:12px;font-weight:500;margin-bottom:4px;cursor:pointer;transition:all 0.2s;${t.completed ? 'opacity:0.5;text-decoration:line-through;' : ''}${!t.completed && isOverdue(t.due_date_time) ? 'border-color:#ff3b30;color:#ff3b30;' : ''}">
                            ${escapeHtml((t.title || '').slice(0, 20))}
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');

        return `
            <div>
                <div class="timeline-row" data-project-id="${escapeHtml(g.project.id)}" ${collapsed ? 'class="collapsed"' : ''} style="display:flex;border-bottom:1px solid var(--border);">
                    <div class="timeline-row-header" style="width:240px;min-width:240px;padding:16px 20px;display:flex;align-items:center;gap:12px;cursor:pointer;background:var(--bg-subtle);transition:background 0.2s;border-right:1px solid var(--border);">
                        <span class="chevron" style="transition:transform 0.2s;color:var(--text-muted);transform:rotate(${collapsed ? '-90deg' : '0'}deg);">▼</span>
                        <span class="timeline-project-dot" style="width:10px;height:10px;border-radius:50%;background:${escapeHtml(g.project.color || '#0071e3')};"></span>
                        <span class="timeline-project-name" style="font-size:14px;font-weight:600;">${escapeHtml(g.project.name)}</span>
                        <span style="font-size:12px;color:var(--text-muted);margin-left:auto;font-feature-settings:'tnum';">
                            ${completedCount}/${total} · ${rate}%
                        </span>
                        <div class="timeline-progress-mini" style="width:100px;height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-left:8px;">
                            <div style="width:${rate}%;height:100%;background:${escapeHtml(g.project.color || '#0071e3')};border-radius:2px;"></div>
                        </div>
                    </div>
                    <div style="display:flex;flex:1;">
                        <div style="width:240px;min-width:240px;padding:12px 20px;border-right:1px solid var(--border);background:white;">
                            ${g.tasks.map(t => `
                                <div class="timeline-task ${t.completed ? 'done' : ''}" data-edit-task="${escapeHtml(t.id)}"
                                    style="padding:6px 10px;background:var(--bg-subtle);border:1px solid var(--border);border-radius:6px;font-size:12px;font-weight:500;margin-bottom:4px;cursor:pointer;transition:all 0.2s;${t.completed ? 'opacity:0.5;text-decoration:line-through;' : ''}">
                                    ${escapeHtml((t.title || '').slice(0, 30))}
                                </div>
                            `).join('')}
                        </div>
                        <div style="display:flex;flex:1;">${taskCells}</div>
                    </div>
                </div>
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
