export class TaskList {
  static render(tasks, projects) {
    const statusFilters = [
      { id: 'all', label: '全部', count: tasks.length },
      { id: 'pending', label: '待完成', count: tasks.filter(t => !t.completed).length },
      { id: 'completed', label: '已完成', count: tasks.filter(t => t.completed).length }
    ]

    return `
      <div class="space-y-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">任务列表</h2>
          <p class="text-sm text-gray-500 mt-1">管理和追踪所有任务</p>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            ${statusFilters.map(filter => `
              <button class="task-filter-btn px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter.id === 'all' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }" data-filter="${filter.id}">
                ${filter.label} (${filter.count})
              </button>
            `).join('')}
          </div>
          <div class="flex-1"></div>
          <select id="task-sort-select" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="due_date">按截止日期排序</option>
            <option value="priority">按优先级排序</option>
            <option value="created_at">按创建时间排序</option>
          </select>
          <button id="btn-add-task" class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 4v16m8-8H4"></path>
            </svg>
            添加任务
          </button>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="grid grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <input id="select-all-tasks" type="checkbox" class="w-4 h-4 rounded border-gray-300 text-blue-600">
            </div>
            <div><span class="text-xs font-medium text-gray-500 uppercase">任务</span></div>
            <div><span class="text-xs font-medium text-gray-500 uppercase">项目</span></div>
            <div><span class="text-xs font-medium text-gray-500 uppercase">截止日期</span></div>
          </div>
          
          <div class="divide-y divide-gray-50">
            ${tasks.map(task => this.renderTaskItem(task, projects)).join('')}
          </div>
          
          ${tasks.length === 0 ? `
            <div class="p-12 text-center">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="9" cy="9" r="7"></circle>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
              <p class="text-gray-400">暂无任务</p>
              <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                创建第一个任务
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  static renderTaskItem(task, projects) {
    const project = projects.find(p => p.id === task.project_id)
    const priorityColors = { high: 'bg-red-100 text-red-600', medium: 'bg-amber-100 text-amber-600', low: 'bg-blue-100 text-blue-600', none: 'bg-gray-100 text-gray-600' }
    const priorityLabels = { high: '高', medium: '中', low: '低', none: '无' }

    return `
      <div class="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
        <div class="flex items-center gap-2">
          <button class="task-complete-btn w-4 h-4 rounded-full border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center" data-task-id="${task.id}">
            ${task.completed ? '<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </button>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-800 ${task.completed ? 'line-through text-gray-400' : ''}">${task.title}</span>
            ${task.priority !== 'none' ? `<span class="px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}">${priorityLabels[task.priority]}</span>` : ''}
          </div>
          ${task.description ? `<p class="text-xs text-gray-500 mt-1">${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</p>` : ''}
        </div>
        <div>
          ${project ? `<div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded" style="background: ${project.color};"></span>
            <span class="text-sm text-gray-600">${project.name}</span>
          </div>` : '<span class="text-sm text-gray-400">-</span>'}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"></path>
            </svg>
            <span class="text-sm text-gray-600">${task.due_date_time ? this.formatDate(new Date(task.due_date_time)) : '-'}</span>
          </div>
        </div>
      </div>
    `
  }

  static formatDate(date) {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}
