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

    // Header
    const headerHtml = `
        <div style="display:flex;background:var(--bg-subtle);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;">
            <div style="width:60px;min-width:60px;padding:12px 8px;border-right:1px solid var(--border);font-weight:600;font-size:12px;text-align:center;">✓</div>
            <div style="width:180px;min-width:180px;padding:12px 16px;border-right:1px solid var(--border);font-weight:600;font-size:13px;">任务 / 项目</div>
            ${dateCols.map(col => `
                <div style="flex:1;min-width:60px;padding:8px 4px;text-align:center;border-right:1px solid var(--border);${col.isToday ? 'background:rgba(0,113,227,0.08);' : ''}">
                    <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">${col.weekday}</div>
                    <div style="font-size:14px;font-weight:600;${col.isToday ? 'color:var(--accent);' : ''}">${col.label}</div>
                </div>
            `).join('')}
        </div>
    `;

    if (tasks.length === 0) {
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

    // Get unique projects for sidebar
    const uniqueProjects = [...new Map(tasks.map(t => [t.project_id || '__none__', {
        id: t.project_id || '__none__',
        name: t.project_name || '未分配',
        color: t.project_color || '#86868b'
    }])).values()];

    // Build task rows - each task on its own row
    const bodyHtml = tasks.map(t => {
        const project = projects.find(p => p.id === t.project_id) || { name: '未分配', color: '#86868b' };
        const overdue = !t.completed && isOverdue(t.due_date_time);
        
        // Check if task due date falls in current date range
        const taskDate = t.due_date_time ? new Date(t.due_date_time).toISOString().split('T')[0] : null;
        
        const dateCells = dateCols.map(col => {
            const isDueDay = taskDate === col.dateStr;
            return `
                <div style="flex:1;min-width:60px;padding:10px 4px;border-right:1px solid var(--border);text-align:center;${col.isToday ? 'background:rgba(0,113,227,0.03);' : ''}${isDueDay ? 'position:relative;' : ''}">
                    ${isDueDay ? `
                        <div style="width:24px;height:24px;border-radius:50%;background:${t.completed ? 'var(--success)' : (overdue ? '#ff3b30' : escapeHtml(project.color || '#0071e3'))};margin:0 auto;display:flex;align-items:center;justify-content:center;">
                            ${t.completed ? '<span style="color:white;font-size:12px;">✓</span>' : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="timeline-task-row" data-task-id="${escapeHtml(t.id)}" 
                 style="display:flex;align-items:center;border-bottom:1px solid var(--border);transition:background 0.15s;${t.completed ? 'opacity:0.5;' : ''}">
                <div style="width:60px;min-width:60px;padding:12px 8px;border-right:1px solid var(--border);text-align:center;">
                    <div class="task-check ${t.completed ? 'done' : ''}" data-toggle-task="${escapeHtml(t.id)}" 
                         style="width:22px;height:22px;border-radius:50%;border:2px solid ${t.completed ? 'var(--success)' : 'var(--border)'};background:${t.completed ? 'var(--success)' : 'transparent'};cursor:pointer;margin:0 auto;display:flex;align-items:center;justify-content:center;">
                        ${t.completed ? '<span style="color:white;font-size:11px;">✓</span>' : ''}
                    </div>
                </div>
                <div style="width:180px;min-width:180px;padding:10px 16px;border-right:1px solid var(--border);">
                    <div style="font-size:13px;font-weight:500;${t.completed ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${escapeHtml(t.title || '')}</div>
                    <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                        <span style="width:6px;height:6px;border-radius:50%;background:${escapeHtml(project.color || '#86868b')};flex-shrink:0;"></span>
                        <span style="font-size:11px;color:var(--text-muted);">${escapeHtml(project.name || '未分配')}</span>
                        ${overdue && !t.completed ? '<span style="font-size:10px;color:#ff3b30;margin-left:4px;">已逾期</span>' : ''}
                    </div>
                </div>
                ${dateCells}
            </div>
        `;
    }).join('');

    // Project sidebar
    const sidebarHtml = `
        <div style="position:sticky;left:0;background:white;border-right:1px solid var(--border);z-index:5;display:flex;flex-direction:column;min-height:100%;">
            <div style="padding:12px 16px;background:var(--bg-subtle);border-bottom:1px solid var(--border);font-weight:600;font-size:12px;color:var(--text-muted);">项目筛选</div>
            <div style="padding:8px;">
                <div class="timeline-filter-btn ${AppState.timelineProjectFilter === '' ? 'active' : ''}" 
                     data-timeline-filter="" 
                     style="padding:8px 12px;border-radius:6px;font-size:12px;cursor:pointer;margin-bottom:4px;${AppState.timelineProjectFilter === '' ? 'background:var(--accent);color:white;' : 'background:var(--bg-subtle);'}">
                    全部项目
                </div>
                ${uniqueProjects.map(p => `
                    <div class="timeline-filter-btn ${AppState.timelineProjectFilter === p.id ? 'active' : ''}" 
                         data-timeline-filter="${escapeHtml(p.id)}"
                         style="padding:8px 12px;border-radius:6px;font-size:12px;cursor:pointer;margin-bottom:4px;${AppState.timelineProjectFilter === p.id ? 'background:var(--accent);color:white;' : 'background:var(--bg-subtle);'}">
                        <span style="display:inline-flex;align-items:center;gap:6px;">
                            <span style="width:6px;height:6px;border-radius:50%;background:${escapeHtml(p.color)};flex-shrink:0;"></span>
                            ${escapeHtml(p.name)}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('timelineTable').innerHTML = `
        <div style="display:flex;min-height:500px;">
            <div style="width:200px;min-width:200px;background:white;border-right:1px solid var(--border);position:sticky;left:0;z-index:5;">${sidebarHtml}</div>
            <div style="flex:1;overflow-x:auto;">
                <div style="min-width:${days * 80}px;">
                    ${headerHtml}
                    ${bodyHtml}
                </div>
            </div>
        </div>
    `;
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
