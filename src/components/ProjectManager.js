export class ProjectManager {
  static render(projects, tasks) {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">项目管理</h2>
            <p class="text-sm text-gray-500 mt-1">管理和追踪所有项目</p>
          </div>
          <button id="btn-new-project-pm" class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 4v16m8-8H4"></path>
            </svg>
            新建项目
          </button>
        </div>
        
        <div class="grid grid-cols-3 gap-6">
          ${projects.map(project => this.renderProjectCard(project, tasks)).join('')}
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">项目列表</h3>
          </div>
          <div class="divide-y divide-gray-50">
            ${projects.map(project => this.renderProjectRow(project, tasks)).join('')}
          </div>
        </div>
      </div>
    `
  }

  static renderProjectCard(project, tasks) {
    const projectTasks = tasks.filter(t => t.project_id === project.id && !t.deleted)
    const completed = projectTasks.filter(t => t.completed).length
    const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0
    const pendingCount = projectTasks.filter(t => !t.completed && t.due_date_time && new Date(t.due_date_time) < new Date()).length

    return `
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: ${project.color}20;">
              <span class="w-4 h-4 rounded" style="background: ${project.color};"></span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">${project.name}</h3>
              <p class="text-sm text-gray-500">${projectTasks.length} 个任务</p>
            </div>
          </div>
          <button class="project-menu-btn p-2 hover:bg-gray-100 rounded-lg transition-colors" data-project-id="${project.id}">
            <svg class="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4"></path>
            </svg>
          </button>
        </div>
        
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">完成进度</span>
            <span class="text-sm font-medium text-gray-800">${progress}%</span>
          </div>
          <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" style="width: ${progress}%; background: ${project.color};"></div>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <div>
            <p class="text-2xl font-bold text-gray-800">${completed}</p>
            <p class="text-xs text-gray-500">已完成</p>
          </div>
          <div class="w-px h-8 bg-gray-100"></div>
          <div>
            <p class="text-2xl font-bold text-gray-800">${projectTasks.length - completed}</p>
            <p class="text-xs text-gray-500">进行中</p>
          </div>
          <div class="w-px h-8 bg-gray-100"></div>
          <div>
            <p class="text-2xl font-bold ${pendingCount > 0 ? 'text-red-500' : 'text-gray-800'}">${pendingCount}</p>
            <p class="text-xs text-gray-500">已逾期</p>
          </div>
        </div>
      </div>
    `
  }

  static renderProjectRow(project, tasks) {
    const projectTasks = tasks.filter(t => t.project_id === project.id && !t.deleted)
    const completed = projectTasks.filter(t => t.completed).length
    const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0

    return `
      <div class="px-6 py-4 hover:bg-gray-50 transition-colors">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: ${project.color}20;">
            <span class="w-3 h-3 rounded" style="background: ${project.color};"></span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="font-medium text-gray-800">${project.name}</h4>
            </div>
            <div class="flex items-center gap-4 mt-2">
              <div class="flex-1 max-w-xs">
                <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full" style="width: ${progress}%; background: ${project.color};"></div>
                </div>
              </div>
              <span class="text-sm text-gray-500">${completed}/${projectTasks.length} 完成</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="project-view-btn px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors" data-project-id="${project.id}">
              查看
            </button>
            <button class="project-edit-btn px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" data-project-id="${project.id}">
              编辑
            </button>
          </div>
        </div>
      </div>
    `
  }
}
