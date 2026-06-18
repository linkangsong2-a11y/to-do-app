// ============== 时间轴工具函数 ==============

function tlGetDateKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
}

function tlParseDate(dateStr) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
}

function tlFormatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function tlAddDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function tlDiffDays(date1, date2) {
    const d1 = tlParseDate(date1);
    const d2 = tlParseDate(date2);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

// 获取任务的开始/结束日期（兼容旧数据）
function tlGetTaskDates(task) {
    let startDate = null;
    let endDate = null;
    if (task.start_date) startDate = tlParseDate(task.start_date);
    if (task.end_date) endDate = tlParseDate(task.end_date);
    // 兼容旧数据：只有 due_date_time 的任务
    if (!startDate && !endDate && task.due_date_time) {
        startDate = tlParseDate(task.due_date_time);
        endDate = tlParseDate(task.due_date_time);
    }
    return { startDate, endDate };
}

// 任务状态文字
const tlStatusLabels = {
    pending: '未开始',
    in_progress: '进行中',
    completed: '已完成'
};

// 获取任务状态（兼容 completed 字段）
function tlGetTaskStatus(task) {
    if (task.status) return task.status;
    if (task.completed) return 'completed';
    return 'in_progress';
}

// ============== 日期列生成 ==============

function tlGenerateDateColumns() {
    const cols = [];
    let start;
    if (AppState.timelineView === 'month') {
        // 月视图：显示整月
        start = new Date(AppState.timelineStartDate);
        start.setDate(1);
        // 调整到该月第一天所在的周一
        const day = start.getDay();
        const offset = day === 0 ? -6 : 1 - day;
        start.setDate(start.getDate() + offset);
    } else {
        // 周视图：以当前timelineStartDate为起点，显示14天
        start = new Date(AppState.timelineStartDate);
        start.setHours(0, 0, 0, 0);
    }
    const days = AppState.timelineView === 'month' ? 42 : 14;
    for (let i = 0; i < days; i++) {
        const d = tlAddDays(start, i);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        cols.push({
            date: d,
            key: tlGetDateKey(d),
            dayNum: d.getDate(),
            weekday: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
            isToday: d.getTime() === today.getTime(),
            isWeekend: d.getDay() === 0 || d.getDay() === 6
        });
    }
    return cols;
}

// ============== 任务过滤 ==============

function tlFilterTasks() {
    let tasks = AppState.tasks || [];
    // 项目筛选
    if (AppState.timelineProjectFilter) {
        tasks = tasks.filter(t => t.project_id === AppState.timelineProjectFilter);
    }
    // 搜索
    if (AppState.timelineSearch) {
        const q = AppState.timelineSearch.toLowerCase();
        tasks = tasks.filter(t =>
            (t.title && t.title.toLowerCase().includes(q)) ||
            (t.description && t.description.toLowerCase().includes(q)) ||
            (t.assignee && t.assignee.toLowerCase().includes(q))
        );
    }
    // 状态筛选
    if (AppState.timelineStatusFilter) {
        tasks = tasks.filter(t => tlGetTaskStatus(t) === AppState.timelineStatusFilter);
    }
    return tasks;
}

// ============== 项目分组 ==============

function tlGroupTasksByProject(tasks) {
    const groups = {};
    tasks.forEach(t => {
        const pid = t.project_id || '__none__';
        if (!groups[pid]) {
            const project = (AppState.projects || []).find(p => p.id === pid);
            groups[pid] = {
                projectId: pid,
                projectName: project ? project.name : '未分配',
                projectColor: project ? (project.color || '#86868b') : '#86868b',
                tasks: [],
                totalCount: 0,
                completedCount: 0
            };
        }
        groups[pid].tasks.push(t);
        groups[pid].totalCount++;
        if (tlGetTaskStatus(t) === 'completed') groups[pid].completedCount++;
    });
    return Object.values(groups).sort((a, b) => {
        if (a.projectId === '__none__') return 1;
        if (b.projectId === '__none__') return -1;
        return a.projectName.localeCompare(b.projectName);
    });
}

// ============== 主渲染函数 ==============

function renderTimeline() {
    const cols = tlGenerateDateColumns();
    const filteredTasks = tlFilterTasks();
    const groups = tlGroupTasksByProject(filteredTasks);

    // 生成日期表头
    const headerHtml = cols.map(c => `
        <div class="tl-date-cell ${c.isToday ? 'today' : ''} ${c.isWeekend ? 'weekend' : ''}"
             title="${tlFormatDate(c.date)}" data-date="${c.key}">
            <div class="tl-date-weekday">${c.weekday}</div>
            <div class="tl-date-num">${c.dayNum}</div>
        </div>
    `).join('');

    // 生成任务行
    let rowsHtml = '';
    if (groups.length === 0) {
        rowsHtml = `
            <div class="tl-empty-row" style="padding:60px 20px;text-align:center;">
                <div class="tl-empty-icon">📅</div>
                <div class="tl-empty-title">暂无任务</div>
                <div class="tl-empty-desc">点击上方"新建任务"按钮或直接点击日期空白格子创建任务</div>
            </div>
        `;
    } else {
        groups.forEach(g => {
            const collapsed = AppState.collapsedProjects[g.projectId];
            const rate = g.totalCount > 0 ? Math.round((g.completedCount / g.totalCount) * 100) : 0;

            // 项目分组头行
            rowsHtml += `
                <div class="tl-project-group" data-project-id="${escapeHtml(g.projectId)}">
                    <div class="tl-project-header" data-toggle-tl-project="${escapeHtml(g.projectId)}">
                        <span class="tl-chevron ${collapsed ? 'collapsed' : ''}">▶</span>
                        <span class="tl-project-dot" style="background:${escapeHtml(g.projectColor)};"></span>
                        <span class="tl-project-name">${escapeHtml(g.projectName)}</span>
                        <span class="tl-project-count">${g.completedCount}/${g.totalCount}</span>
                        <div class="tl-progress-bar"><div style="width:${rate}%;background:${escapeHtml(g.projectColor)};"></div></div>
                    </div>
            `;

            // 展开时才渲染任务行
            if (!collapsed) {
                // 按开始日期排序
                const sortedTasks = g.tasks.slice().sort((a, b) => {
                    const datesA = tlGetTaskDates(a);
                    const datesB = tlGetTaskDates(b);
                    return (datesA.startDate?.getTime() || 0) - (datesB.startDate?.getTime() || 0);
                });

                // 每一行显示一个任务，或者空的日期格子
                sortedTasks.forEach(task => {
                    const { startDate, endDate } = tlGetTaskDates(task);
                    const status = tlGetTaskStatus(task);
                    const overdue = status !== 'completed' && endDate && endDate < new Date();

                    // 计算任务在日期范围内的位置
                    let colStartIdx = -1;
                    let colEndIdx = -1;

                    if (startDate) {
                        const startKey = tlGetDateKey(startDate);
                        colStartIdx = cols.findIndex(c => c.key === startKey);
                    }
                    if (endDate) {
                        const endKey = tlGetDateKey(endDate);
                        colEndIdx = cols.findIndex(c => c.key === endKey);
                    }

                    // 如果任务不在当前日期范围内，也显示但仅在第一列
                    let outOfRange = false;
                    if (colStartIdx === -1 && colEndIdx === -1) {
                        outOfRange = true;
                    }
                    if (colStartIdx === -1) colStartIdx = 0;
                    if (colEndIdx === -1) colEndIdx = colStartIdx;
                    if (colStartIdx > cols.length - 1) colStartIdx = cols.length - 1;
                    if (colEndIdx > cols.length - 1) colEndIdx = cols.length - 1;
                    if (colStartIdx < 0) colStartIdx = 0;

                    const span = Math.max(1, colEndIdx - colStartIdx + 1);

                    // 生成任务行
                    rowsHtml += `
                        <div class="tl-task-row" data-task-id="${escapeHtml(task.id)}">
                            <div class="tl-task-info-cell" data-edit-task="${escapeHtml(task.id)}">
                                <div class="tl-task-title ${status === 'completed' ? 'done' : ''}" title="${escapeHtml(task.title)}">
                                    ${escapeHtml(task.title)}
                                </div>
                                ${task.assignee ? `<div class="tl-task-assignee">👤 ${escapeHtml(task.assignee)}</div>` : ''}
                            </div>
                    `;

                    // 日期格子 - 前 colStartIdx 个空格子，然后任务块，然后空格子
                    for (let i = 0; i < cols.length; i++) {
                        const col = cols[i];
                        if (i === colStartIdx) {
                            rowsHtml += `
                                <div class="tl-task-date-cell ${col.isToday ? 'today' : ''} ${col.isWeekend ? 'weekend' : ''}" 
                                     data-date="${col.key}" data-task-id="${escapeHtml(task.id)}"
                                     style="grid-column: span ${span};">
                                    <div class="tl-task-block 
                                                ${status === 'completed' ? 'done' : ''} 
                                                ${overdue ? 'overdue' : ''}
                                                ${outOfRange ? 'out-of-range' : ''}"
                                         style="background:${status === 'completed' ? 'rgba(134,134,139,0.5)' : escapeHtml(g.projectColor)};"
                                         data-task-id="${escapeHtml(task.id)}"
                                         data-drag-task="${escapeHtml(task.id)}"
                                         data-dates="${escapeHtml(JSON.stringify({ start: colStartIdx, end: colEndIdx, span }))}"
                                         title="${escapeHtml(task.title)}${startDate ? ' | ' + tlFormatDate(startDate) : ''}${endDate && (tlGetDateKey(startDate) !== tlGetDateKey(endDate)) ? ' ~ ' + tlFormatDate(endDate) : ''}${task.assignee ? ' | 负责人: ' + escapeHtml(task.assignee) : ''}${task.description ? ' | ' + escapeHtml(task.description.slice(0, 50)) : ''}">
                                        <span>${escapeHtml(task.title)}${status === 'completed' ? ' ✓' : ''}</span>
                                    </div>
                                </div>
                            `;
                            // 跳过已被任务块占用的格子
                            i += span - 1;
                        } else if (i > colStartIdx && i <= colEndIdx) {
                            // 这些格子已被任务块占用，不渲染
                            continue;
                        } else {
                            rowsHtml += `
                                <div class="tl-task-date-cell ${col.isToday ? 'today' : ''} ${col.isWeekend ? 'weekend' : ''}" 
                                     data-date="${col.key}" data-create-task="${col.key}" data-project-id="${escapeHtml(g.projectId)}">
                                </div>
                            `;
                        }
                    }

                    rowsHtml += `</div>`;
                });

                // 项目下无任务提示
                if (sortedTasks.length === 0) {
                    rowsHtml += `
                        <div class="tl-project-empty" style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px;">
                            该项目下暂无任务，点击空白日期格子快速创建任务
                        </div>
                    `;
                }
            }

            rowsHtml += `</div>`;
        });
    }

    // 组装完整HTML
    const colWidth = AppState.timelineView === 'month' ? 40 : 90;
    const totalColWidth = cols.length * colWidth;

    const html = `
        <div class="tl-toolbar">
            <div class="tl-toolbar-left">
                <button class="btn btn-secondary tl-nav-btn" id="tlPrevBtn">← ${AppState.timelineView === 'month' ? '上个月' : '上一周'}</button>
                <button class="btn btn-secondary tl-nav-btn" id="tlTodayBtn">今天</button>
                <button class="btn btn-secondary tl-nav-btn" id="tlNextBtn">${AppState.timelineView === 'month' ? '下个月' : '下一周'} →</button>
                <span class="tl-title-range">
                    ${cols.length ? `${tlFormatDate(cols[0].date)} ~ ${tlFormatDate(cols[cols.length - 1].date)}` : ''}
                </span>
            </div>
            <div class="tl-toolbar-right">
                <div class="tl-search-box">
                    <span>🔍</span>
                    <input type="text" id="tlSearchInput" placeholder="搜索任务/负责人..." value="${escapeHtml(AppState.timelineSearch)}">
                </div>
                <select id="tlStatusFilter" class="btn btn-secondary" style="cursor:pointer;min-width:100px;">
                    <option value="">全部状态</option>
                    <option value="pending" ${AppState.timelineStatusFilter === 'pending' ? 'selected' : ''}>未开始</option>
                    <option value="in_progress" ${AppState.timelineStatusFilter === 'in_progress' ? 'selected' : ''}>进行中</option>
                    <option value="completed" ${AppState.timelineStatusFilter === 'completed' ? 'selected' : ''}>已完成</option>
                </select>
                <div class="tl-view-switch">
                    <button class="btn btn-secondary ${AppState.timelineView === 'week' ? 'active' : ''}" data-tl-view="week">周视图</button>
                    <button class="btn btn-secondary ${AppState.timelineView === 'month' ? 'active' : ''}" data-tl-view="month">月视图</button>
                </div>
                <button class="btn btn-primary" id="tlNewTaskBtn">+ 新建任务</button>
            </div>
        </div>

        <div class="tl-project-sidebar" style="width:240px;min-width:240px;flex-shrink:0;border-right:1px solid var(--border);background:var(--bg-subtle);padding:16px;overflow-y:auto;">
            <div class="tl-sidebar-title">项目筛选</div>
            <div class="tl-project-filter-item ${AppState.timelineProjectFilter === '' ? 'active' : ''}" 
                 data-tl-project-filter="" 
                 style="padding:10px 12px;border-radius:8px;font-size:13px;cursor:pointer;margin-bottom:6px;transition:background 0.2s;${AppState.timelineProjectFilter === '' ? 'background:var(--accent);color:white;' : ''}">
                全部项目 (${AppState.tasks ? AppState.tasks.length : 0})
            </div>
            ${groups.length > 0 ? groups.map(g => `
                <div class="tl-project-filter-item ${AppState.timelineProjectFilter === g.projectId ? 'active' : ''}" 
                     data-tl-project-filter="${escapeHtml(g.projectId)}"
                     style="padding:10px 12px;border-radius:8px;font-size:13px;cursor:pointer;margin-bottom:6px;transition:background 0.2s;display:flex;align-items:center;gap:8px;${AppState.timelineProjectFilter === g.projectId ? 'background:var(--accent);color:white;' : ''}">
                    <span style="width:8px;height:8px;border-radius:50%;background:${escapeHtml(g.projectColor)};flex-shrink:0;"></span>
                    <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(g.projectName)}</span>
                    <span style="font-size:11px;opacity:0.7;">(${g.totalCount})</span>
                </div>
            `).join('') : ''}
        </div>

        <div class="tl-main-content" style="flex:1;overflow-x:auto;overflow-y:auto;min-width:0;">
            <div class="tl-grid" style="min-width:${totalColWidth}px;">
                <div class="tl-date-header-row" style="display:grid;grid-template-columns:240px repeat(${cols.length}, ${colWidth}px);background:var(--bg-subtle);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;">
                    <div class="tl-header-label" style="padding:12px 16px;font-size:13px;font-weight:600;color:var(--text);border-right:1px solid var(--border);position:sticky;left:0;background:var(--bg-subtle);z-index:11;">任务 / 项目</div>
                    ${headerHtml}
                </div>
                <div class="tl-body" style="position:relative;">
                    ${rowsHtml}
                </div>
            </div>
        </div>
    `;

    // 把渲染结果放入容器
    const container = document.getElementById('timelineTable');
    container.innerHTML = `<div class="tl-container" style="display:flex;height:calc(100vh - 280px);min-height:500px;background:white;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);">${html}</div>`;
}

// ============== 导航操作 ==============

function timelinePrev() {
    const days = AppState.timelineView === 'month' ? 30 : 7;
    AppState.timelineStartDate = tlAddDays(AppState.timelineStartDate, -days);
    renderTimeline();
}

function timelineNext() {
    const days = AppState.timelineView === 'month' ? 30 : 7;
    AppState.timelineStartDate = tlAddDays(AppState.timelineStartDate, days);
    renderTimeline();
}

function timelineToday() {
    const now = new Date();
    if (AppState.timelineView === 'month') {
        now.setDate(1);
    }
    AppState.timelineStartDate = now;
    renderTimeline();
}
