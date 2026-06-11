export class Calendar {
  static render(tasks) {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    return `
      <div class="grid grid-cols-3 gap-6">
        <div class="col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-semibold text-gray-800">日历视图</h2>
                <p class="text-sm text-gray-500 mt-1">${currentYear}年${currentMonth + 1}月</p>
              </div>
              <div class="flex items-center gap-2">
                <button id="calendar-prev-month" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <button id="calendar-today" class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                  今天
                </button>
                <button id="calendar-next-month" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-7 gap-1 mb-2">
              ${['日', '一', '二', '三', '四', '五', '六'].map(day => `
                <div class="text-center py-2 text-xs font-medium text-gray-500">${day}</div>
              `).join('')}
            </div>
            
            <div class="grid grid-cols-7 gap-1">
              ${this.renderCalendarDays(currentYear, currentMonth, tasks)}
            </div>
          </div>
        </div>
        
        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-800 mb-4">今日任务</h3>
            <div class="space-y-3">
              ${this.renderTodayTasks(tasks)}
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-800 mb-4">任务统计</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">本月任务</span>
                <span class="text-lg font-bold text-gray-800">${this.getMonthTaskCount(tasks, currentYear, currentMonth)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">已完成</span>
                <span class="text-lg font-bold text-green-600">${this.getMonthCompletedCount(tasks, currentYear, currentMonth)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">进行中</span>
                <span class="text-lg font-bold text-blue-600">${this.getMonthPendingCount(tasks, currentYear, currentMonth)}</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full" style="width: ${this.getMonthProgress(tasks, currentYear, currentMonth)}%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  static renderCalendarDays(year, month, tasks) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year
    const todayDate = today.getDate()

    let html = ''
    
    for (let i = 0; i < firstDay; i++) {
      html += '<div></div>'
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayTasks = tasks.filter(t => {
        if (!t.due_date_time) return false
        const dueDate = new Date(t.due_date_time)
        return dueDate.getDate() === day && dueDate.getMonth() === month && dueDate.getFullYear() === year
      })
      const isToday = isCurrentMonth && day === todayDate
      const hasTasks = dayTasks.length > 0
      const completedCount = dayTasks.filter(t => t.completed).length

      html += `
        <div class="relative aspect-square p-1">
          <div class="calendar-day h-full rounded-lg ${isToday ? 'bg-blue-100' : 'hover:bg-gray-50'} flex flex-col items-center justify-center cursor-pointer transition-colors" data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}">
            <span class="${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'} text-sm">${day}</span>
            ${hasTasks ? `
              <div class="flex gap-0.5 mt-1">
                ${dayTasks.slice(0, 3).map(task => `<span class="w-1.5 h-1.5 rounded-full" style="background: ${task.completed ? '#10B981' : '#3B82F6'};"></span>`).join('')}
                ${dayTasks.length > 3 ? `<span class="text-xs text-gray-500">+${dayTasks.length - 3}</span>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      `
    }

    return html
  }

  static renderTodayTasks(tasks) {
    const today = new Date()
    const todayTasks = tasks.filter(t => {
      if (!t.due_date_time) return false
      const dueDate = new Date(t.due_date_time)
      return dueDate.toDateString() === today.toDateString()
    })

    if (todayTasks.length === 0) {
      return '<p class="text-sm text-gray-400 text-center py-4">今日暂无任务</p>'
    }

    return todayTasks.map(task => `
      <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <button class="task-complete-btn w-5 h-5 rounded-full border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center" data-task-id="${task.id}">
          ${task.completed ? '<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
        </button>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-800 truncate ${task.completed ? 'line-through text-gray-400' : ''}">${task.title}</p>
        </div>
      </div>
    `).join('')
  }

  static getMonthTaskCount(tasks, year, month) {
    return tasks.filter(t => {
      if (!t.due_date_time) return false
      const dueDate = new Date(t.due_date_time)
      return dueDate.getMonth() === month && dueDate.getFullYear() === year
    }).length
  }

  static getMonthCompletedCount(tasks, year, month) {
    return tasks.filter(t => {
      if (!t.due_date_time || !t.completed) return false
      const dueDate = new Date(t.due_date_time)
      return dueDate.getMonth() === month && dueDate.getFullYear() === year
    }).length
  }

  static getMonthPendingCount(tasks, year, month) {
    return this.getMonthTaskCount(tasks, year, month) - this.getMonthCompletedCount(tasks, year, month)
  }

  static getMonthProgress(tasks, year, month) {
    const total = this.getMonthTaskCount(tasks, year, month)
    const completed = this.getMonthCompletedCount(tasks, year, month)
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }
}
