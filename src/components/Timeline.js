const STATUS_COLORS = {
  not_started: '#9CA3AF',
  in_progress: '#3B82F6',
  completed: '#10B981',
  delayed: '#F87171'
}

export class Timeline {
  static render(tasks, projects) {
    const dayWidth = 80
    const timelineDays = 14
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 2)

    return `
      <div class="h-[calc(100vh-220px)] flex gap-4 animate-fade-in">
        <div class="w-64 flex-shrink-0">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 class="font-semibold text-gray-800">项目列表</h3>
            </div>
            <div class="flex-1 overflow-y-auto p-2 scrollbar-thin">
              ${projects.map(project => this.renderProjectItem(project, tasks)).join('')}
            </div>
          </div>
        </div>
        
        <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center gap-2">
              <button id="timeline-prev" class="p-1.5 hover:bg-gray-200 rounded-lg transition-colors" aria-label="上一页">
                <svg class="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <span class="text-sm font-medium text-gray-700">${this.formatDateRange(startDate, timelineDays)}</span>
              <button id="timeline-next" class="p-1.5 hover:bg-gray-200 rounded-lg transition-colors" aria-label="下一页">
                <svg class="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              <button id="timeline-today" class="ml-4 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                今天
              </button>
            </div>
            <div class="flex items-center gap-1 bg-gray-200 rounded-lg p-0.5">
              <button class="timeline-view-btn px-2.5 py-1.5 text-xs font-medium rounded-md bg-white shadow-sm" data-view="day">日</button>
              <button class="timeline-view-btn px-2.5 py-1.5 text-xs font-medium rounded-md hover:bg-gray-300 transition-colors" data-view="week">周</button>
              <button class="timeline-view-btn px-2.5 py-1.5 text-xs font-medium rounded-md hover:bg-gray-300 transition-colors" data-view="month">月</button>
            </div>
          </div>
          
          <div class="flex border-b border-gray-200 bg-gray-50">
            <div class="w-64 px-4 py-3 flex-shrink-0 border-r border-gray-200 bg-white">
              <span class="text-xs font-medium text-gray-500">项目 / 任务</span>
            </div>
            <div class="flex-1 overflow-x-auto scrollbar-thin">
              <div style="width: ${timelineDays * dayWidth}px; display: flex;">
                ${this.renderDateHeader(startDate, timelineDays, dayWidth, today)}
              </div>
            </div>
          </div>
          
          <div class="flex-1 overflow-auto scrollbar-thin">
            <div style="width: ${timelineDays * dayWidth}px;">
              ${this.renderTimelineContent(startDate, timelineDays, dayWidth, tasks, projects, today)}
            </div>
          </div>
        </div>
      </div>
    `
  }

  static renderProjectItem(project, tasks) {
    const projectTasks = tasks.filter(t => t.project_id === project.id && !t.deleted)
    const completed = projectTasks.filter(t => t.completed).length
    const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0

    return `
      <div class="project-item p-3 rounded-lg hover:bg-gray-50 transition-all duration-150 cursor-pointer mb-1" data-project-id="${project.id}">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" style="background: ${project.color};"></span>
            <span class="font-medium text-sm text-gray-800 truncate">${project.name}</span>
          </div>
          <span class="text-xs text-gray-500">${projectTasks.length} 个任务</span>
        </div>
        ${projectTasks.length > 0 ? `
          <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" style="width: ${progress}%; background: ${project.color};"></div>
          </div>
        ` : ''}
      </div>
    `
  }

  static renderDateHeader(startDate, days, width, today) {
    let html = ''
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const isToday = date.getTime() === today.getTime()
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      
      html += `
        <div style="width: ${width}px; text-align: center; padding: 8px 2px; border-right: 1px solid #F3F4F6;">
          <div style="font-size: 10px; color: ${isWeekend ? '#9CA3AF' : '#6B7280'};">${date.toLocaleDateString('zh-CN', { weekday: 'short' })}</div>
          <div style="font-size: 13px; font-weight: ${isToday ? '700' : '500'}; color: ${isToday ? '#3B82F6' : '#374151'}; margin-top: 2px;">${date.getDate()}</div>
          ${isToday ? '<div style="height: 2px; background: #EF4444; margin-top: 4px;"></div>' : ''}
        </div>
      `
    }
    return html
  }

  static renderTimelineContent(startDate, days, width, tasks, projects, today) {
    const todayOffset = (today - startDate) / (1000 * 60 * 60 * 24) * width
    
    let html = `
      <div style="position: relative;">
        ${today >= startDate && today <= new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000) ? 
          `<div style="position: absolute; left: ${todayOffset}px; top: 0; bottom: 0; width: 2px; background: #EF4444; opacity: 0.6; z-index: 5;"></div>` : ''
        }
    `

    for (let i = 0; i < days; i++) {
      html += `<div style="position: absolute; top: 0; bottom: 0; left: ${i * width}px; width: 1px; background: #F3F4F6;"></div>`
    }

    const projectTasksMap = new Map()
    projects.forEach(project => {
      projectTasksMap.set(project.id, tasks.filter(t => !t.deleted && t.project_id === project.id && t.due_date_time))
    })

    const rowHeight = 56

    projects.forEach(project => {
      const projectTasks = projectTasksMap.get(project.id) || []
      if (projectTasks.length === 0) return

      html += `
        <div style="position: relative; height: ${projectTasks.length * rowHeight}px; border-bottom: 1px solid #E5E7EB;">
          <div style="position: absolute; left: -256px; top: 0; width: 240px; height: ${rowHeight}px; display: flex; align-items: center; padding: 0 12px; background: ${project.color}15;">
            <span class="w-3 h-3 rounded-full mr-3" style="background: ${project.color};"></span>
            <span class="font-semibold text-gray-800">${project.name}</span>
          </div>
      `

      const dayOccupancy = {}
      projectTasks.forEach(task => {
        const dueDate = new Date(task.due_date_time)
        const dayIndex = Math.floor((dueDate - startDate) / (1000 * 60 * 60 * 24))
        if (dayIndex < 0 || dayIndex >= days) return
        if (!dayOccupancy[dayIndex]) dayOccupancy[dayIndex] = []
        dayOccupancy[dayIndex].push(task)
      })

      projectTasks.forEach(task => {
        const dueDate = new Date(task.due_date_time)
        const dayIndex = Math.floor((dueDate - startDate) / (1000 * 60 * 60 * 24))
        if (dayIndex < 0 || dayIndex >= days) return

        const dayTasks = dayOccupancy[dayIndex] || []
        const taskIndex = dayTasks.indexOf(task)
        const totalDayTasks = dayTasks.length

        const status = task.completed ? 'completed' : (dueDate < new Date() ? 'delayed' : 'in_progress')
        const statusColor = STATUS_COLORS[status]

        const rowSpan = rowHeight / totalDayTasks - 4
        const barTop = taskIndex * (rowHeight / totalDayTasks)

        html += `
          <div style="position: absolute; left: -256px; top: ${rowHeight + taskIndex * rowHeight}px; width: 240px; height: ${rowHeight}px; display: flex; align-items: center; padding: 0 12px;">
            <span class="w-2 h-2 rounded-full mr-3" style="background: ${statusColor};"></span>
            <span class="text-sm text-gray-700 truncate">${task.title}</span>
          </div>
          
          <div 
            class="gantt-bar cursor-pointer hover:shadow-md transition-all duration-150"
            style="position: absolute; left: ${dayIndex * width + 6}px; top: ${rowHeight + barTop}px; width: ${width - 12}px; height: ${rowSpan}px; background: ${statusColor}; border-radius: 4px; padding: 4px 6px; overflow: hidden; user-select: none;"
            data-task-id="${task.id}"
          >
            <span style="font-size: 11px; font-weight: 500; color: white; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${task.title.substring(0, 18)}</span>
            ${task.completed ? '<svg class="w-3 h-3 text-white float-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </div>
        `
      })

      html += '</div>'
    })

    html += '</div>'
    return html
  }

  static formatDateRange(startDate, days) {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + days - 1)
    return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`
  }
}
