const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-blue-100 text-blue-600',
  none: 'bg-gray-100 text-gray-600'
}

const PRIORITY_LABELS = { high: '高', medium: '中', low: '低', none: '无' }

const STATUS_COLORS = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600',
  delayed: 'bg-red-100 text-red-600'
}

const STATUS_LABELS = { not_started: '未开始', in_progress: '进行中', completed: '已完成', delayed: '已延迟' }

export class Dashboard {
  static render(tasks, projects) {
    const completedCount = tasks.filter(t => t.completed).length
    const pendingCount = tasks.filter(t => !t.completed).length
    const overdueCount = tasks.filter(t => !t.completed && t.due_date_time && new Date(t.due_date_time) < new Date()).length
    const todayTasks = tasks.filter(t => {
      if (!t.due_date_time) return false
      const dueDate = new Date(t.due_date_time)
      const today = new Date()
      return dueDate.toDateString() === today.toDateString()
    })

    return `
      <div class="space-y-6 animate-fade-in">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">仪表板</h2>
          <p class="text-sm text-gray-500 mt-1">欢迎回来，今天是 ${this.formatDate(new Date())}</p>
        </div>
        
        <div class="grid grid-cols-4 gap-4">
          ${this.renderStatCard('总任务', tasks.length, 'text-blue-600', 'bg-blue-50', 'task-total')}
          ${this.renderStatCard('已完成', completedCount, 'text-green-600', 'bg-green-50', 'task-completed')}
          ${this.renderStatCard('进行中', pendingCount, 'text-amber-600', 'bg-amber-50', 'task-progress')}
          ${this.renderStatCard('已逾期', overdueCount, 'text-red-600', 'bg-red-50', 'task-overdue')}
        </div>
        
        <div class="grid grid-cols-3 gap-6">
          <div class="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-150">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-800">项目进度</h3>
              <button id="view-all-projects" class="text-sm text-blue-600 hover:text-blue-700 transition-colors">查看全部</button>
            </div>
            <div class="space-y-4">
              ${projects.map(project => this.renderProjectProgress(project, tasks)).join('')}
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-150">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-800">今日任务</h3>
              <span class="text-xs text-gray-500">${todayTasks.length} 项</span>
            </div>
            <div class="space-y-3">
              ${todayTasks.length > 0 ? 
                todayTasks.map(task => this.renderTodayTask(task, projects)).join('') :
                this.renderEmptyState('今日暂无任务')
              }
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-150">
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-800">最近任务</h3>
              <button class="text-sm text-blue-600 hover:text-blue-700 transition-colors">查看全部</button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">任务</th>
                  <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">项目</th>
                  <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">截止日期</th>
                  <th class="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">状态</th>
                </tr>
              </thead>
              <tbody>
                ${tasks.slice(0, 5).map(task => this.renderTaskRow(task, projects)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `
  }

  static renderStatCard(title, value, textColor, bgColor, id) {
    return `
      <div id="${id}" class="${bgColor} rounded-xl p-5 hover:scale-[1.02] transition-transform duration-150">
        <p class="text-sm text-gray-600 mb-1">${title}</p>
        <p class="${textColor} text-2xl font-bold">${value}</p>
      </div>
    `
  }

  static renderProjectProgress(project, tasks) {
    const projectTasks = tasks.filter(t => t.project_id === project.id && !t.deleted)
    const completed = projectTasks.filter(t => t.completed).length
    const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0

    return `
      <div class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: ${project.color}20;">
          <span class="w-3 h-3 rounded-full" style="background: ${project.color};"></span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <span class="font-medium text-gray-800 truncate">${project.name}</span>
            <span class="text-sm text-gray-500">${completed}/${projectTasks.length}</span>
          </div>
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500 ease-out" style="width: ${progress}%; background: ${project.color};"></div>
          </div>
        </div>
      </div>
    `
  }

  static renderTodayTask(task, projects) {
    const project = projects.find(p => p.id === task.project_id)
    const isOverdue = task.due_date_time && new Date(task.due_date_time) < new Date()

    return `
      <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-150 cursor-pointer group">
            <button class="task-complete-btn w-5 h-5 rounded-full border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-blue-500'} flex items-center justify-center transition-colors" data-task-id="${task.id}">
              ${task.completed ? '<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
            </button>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-800 truncate ${task.completed ? 'line-through text-gray-400 transition-colors duration-150' : ''}">${task.title}</p>
          ${project ? `<p class="text-xs text-gray-500 mt-0.5">${project.name}</p>` : ''}
        </div>
        ${isOverdue && !task.completed ? '<span class="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">逾期</span>' : ''}
        <svg class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
    `
  }

  static renderTaskRow(task, projects) {
    const project = projects.find(p => p.id === task.project_id)
    const status = task.completed ? 'completed' : (task.due_date_time && new Date(task.due_date_time) < new Date() ? 'delayed' : 'in_progress')

    return `
      <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
        <td class="py-3 px-4">
          <div class="flex items-center gap-2">
            <button class="task-complete-btn w-4 h-4 rounded-full border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center" data-task-id="${task.id}">
              ${task.completed ? '<svg class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
            </button>
            <span class="text-sm text-gray-700 ${task.completed ? 'line-through text-gray-400' : ''}">${task.title}</span>
          </div>
        </td>
        <td class="py-3 px-4">
          ${project ? `<span class="inline-flex items-center gap-1">
            <span class="w-2 h-2 rounded-full" style="background: ${project.color};"></span>
            <span class="text-sm text-gray-600">${project.name}</span>
          </span>` : '-'}
        </td>
        <td class="py-3 px-4 text-sm text-gray-600">${task.due_date_time ? this.formatDate(new Date(task.due_date_time)) : '-'}
        </td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}">${STATUS_LABELS[status]}</span>
        </td>
      </tr>
    `
  }

  static renderEmptyState(message) {
    return `
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="9" r="7"></circle><path d="M9 12l2 2 4-4"></path>
          </svg>
        </div>
        <p class="text-sm text-gray-400">${message}</p>
      </div>
    `
  }

  static formatDate(date) {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })
  }
}
