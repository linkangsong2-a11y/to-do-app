import { Sidebar } from './components/Sidebar.js'
import { Header } from './components/Header.js'
import { Dashboard } from './components/Dashboard.js'
import { TaskList } from './components/TaskList.js'
import { Timeline } from './components/Timeline.js'
import { Calendar } from './components/Calendar.js'
import { ProjectManager } from './components/ProjectManager.js'

export class App {
  constructor() {
    this.currentView = 'dashboard'
    this.tasks = []
    this.projects = []
    this.categories = ['工作', '个人', '学习', '其他']
    this.API_BASE = '/api'
    this.renderCache = new Map()
    this.taskIdMap = new Map()
    this.projectIdMap = new Map()
    this.showNewProjectModal = false
  }

  async init() {
    await this.loadData()
    this.buildIndexMaps()
    this.render()
    this.bindEvents()
  }

  async loadData() {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        fetch(`${this.API_BASE}/tasks`),
        fetch(`${this.API_BASE}/projects`)
      ])
      this.tasks = await tasksRes.json()
      this.projects = await projectsRes.json()
    } catch {
      this.loadMockData()
    }
  }

  loadMockData() {
    this.projects = [
      { id: '1', name: '港服项目', color: '#3B82F6' },
      { id: '2', name: '金融产品升级', color: '#8B5CF6' },
      { id: '3', name: '系统优化项目', color: '#10B981' }
    ]
    
    const now = new Date()
    this.tasks = [
      { id: '1', title: '市场调研分析', description: '分析市场竞争情况', due_date_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), completed: true, project_id: '1', category: '工作', priority: 'high' },
      { id: '2', title: '竞品分析报告', description: '撰写竞品分析报告', due_date_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), completed: false, project_id: '1', category: '工作', priority: 'medium' },
      { id: '3', title: '用户需求评估', due_date_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), completed: false, project_id: '1', category: '工作', priority: 'high' },
      { id: '4', title: '需求文档编写', due_date_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), completed: false, project_id: '2', category: '工作', priority: 'medium' },
      { id: '5', title: '技术方案设计', due_date_time: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(), completed: false, project_id: '2', category: '工作', priority: 'high' },
      { id: '6', title: '性能分析', due_date_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), completed: true, project_id: '3', category: '工作', priority: 'low' },
      { id: '7', title: '优化方案制定', due_date_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), completed: false, project_id: '3', category: '工作', priority: 'medium' }
    ]
  }

  buildIndexMaps() {
    this.taskIdMap.clear()
    this.projectIdMap.clear()
    
    this.tasks.forEach(task => {
      this.taskIdMap.set(task.id, task)
    })
    
    this.projects.forEach(project => {
      this.projectIdMap.set(project.id, project)
    })
  }

  getTaskById(taskId) {
    return this.taskIdMap.get(taskId)
  }

  getProjectById(projectId) {
    return this.projectIdMap.get(projectId)
  }

  getTasksByProject(projectId) {
    const cacheKey = `tasks-by-project-${projectId}`
    if (this.renderCache.has(cacheKey)) {
      return this.renderCache.get(cacheKey)
    }
    
    const result = this.tasks.filter(t => t.project_id === projectId && !t.deleted)
    this.renderCache.set(cacheKey, result)
    return result
  }

  invalidateCache() {
    this.renderCache.clear()
    this.buildIndexMaps()
  }

  render() {
    const app = document.getElementById('app')
    if (!app) return
    
    const cacheKey = `render-${this.currentView}`
    
    let content = ''
    switch (this.currentView) {
      case 'dashboard':
        content = Dashboard.render(this.tasks, this.projects)
        break
      case 'tasks':
        content = TaskList.render(this.tasks, this.projects)
        break
      case 'timeline':
        content = Timeline.render(this.tasks, this.projects)
        break
      case 'calendar':
        content = Calendar.render(this.tasks)
        break
      case 'projects':
        content = ProjectManager.render(this.projects, this.tasks)
        break
      default:
        content = Dashboard.render(this.tasks, this.projects)
    }

    app.innerHTML = `
      <div class="flex h-screen bg-gray-50">
        ${Sidebar.render(this.currentView)}
        <div class="flex-1 flex flex-col overflow-hidden">
          ${Header.render()}
          <main class="flex-1 overflow-auto p-6 transition-all duration-150">
            ${content}
          </main>
        </div>
      </div>
      ${this.renderNewProjectModal()}
    `
  }

  renderNewProjectModal() {
    if (!this.showNewProjectModal) return ''
    
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16']
    
    return `
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" id="modal-overlay">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">新建项目</h3>
            <button id="modal-close" class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label="关闭">
              <svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">项目名称</label>
              <input 
                id="project-name"
                type="text" 
                placeholder="请输入项目名称"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">项目颜色</label>
              <div class="flex gap-3">
                ${colors.map((color, index) => `
                  <button 
                    id="color-${index}"
                    class="w-10 h-10 rounded-full transition-transform hover:scale-110 ${index === 0 ? 'ring-2 ring-offset-2 ring-blue-500' : ''}"
                    style="background: ${color};"
                    data-color="${color}"
                    aria-label="选择颜色"
                  ></button>
                `).join('')}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">项目描述（可选）</label>
              <textarea 
                id="project-description"
                placeholder="请输入项目描述"
                rows="3"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              ></textarea>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50">
            <button id="modal-cancel" class="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              取消
            </button>
            <button id="modal-submit" class="px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
              创建项目
            </button>
          </div>
        </div>
      </div>
    `
  }

  bindEvents() {
    const handleNavClick = (e) => {
      const navItem = e.target.closest('.nav-item')
      if (navItem) {
        const view = navItem.dataset.view
        if (view && view !== this.currentView) {
          this.currentView = view
          this.invalidateCache()
          this.render()
        }
      }
    }

    const handleNewProjectClick = (e) => {
      const target = e.target.closest('#btn-new-project, #btn-new-project-pm')
      if (target) {
        this.showNewProjectModal = true
        this.render()
      }
    }

    const handleModalClose = (e) => {
      const target = e.target.closest('#modal-close, #modal-cancel, #modal-overlay')
      if (target) {
        this.showNewProjectModal = false
        this.render()
      }
    }

    const handleCreateProject = (e) => {
      const target = e.target.closest('#modal-submit')
      if (target) {
        this.createProject()
      }
    }

    const handleTaskComplete = (e) => {
      const target = e.target.closest('.task-complete-btn')
      if (target) {
        const taskId = target.dataset.taskId
        const task = this.tasks.find(t => t.id === taskId)
        if (task) {
          task.completed = !task.completed
          this.invalidateCache()
          this.render()
        }
      }
    }

    const handleViewAllProjects = (e) => {
      const target = e.target.closest('#view-all-projects')
      if (target) {
        this.currentView = 'projects'
        this.invalidateCache()
        this.render()
      }
    }

    const handleTaskFilter = (e) => {
      const target = e.target.closest('.task-filter-btn')
      if (target) {
        const filter = target.dataset.filter
        console.log('Filter tasks:', filter)
      }
    }

    const handleTaskSort = (e) => {
      const target = e.target.closest('#task-sort-select')
      if (target) {
        const sortBy = target.value
        console.log('Sort tasks by:', sortBy)
      }
    }

    const handleAddTask = (e) => {
      const target = e.target.closest('#btn-add-task')
      if (target) {
        this.showAddTaskModal = true
        this.render()
      }
    }

    const handleSelectAllTasks = (e) => {
      const target = e.target.closest('#select-all-tasks')
      if (target) {
        const checked = target.checked
        this.tasks.forEach(task => task.completed = checked)
        this.invalidateCache()
        this.render()
      }
    }

    const handleProjectView = (e) => {
      const target = e.target.closest('.project-view-btn')
      if (target) {
        const projectId = target.dataset.projectId
        console.log('View project:', projectId)
      }
    }

    const handleProjectEdit = (e) => {
      const target = e.target.closest('.project-edit-btn')
      if (target) {
        const projectId = target.dataset.projectId
        console.log('Edit project:', projectId)
      }
    }

    const handleProjectMenu = (e) => {
      const target = e.target.closest('.project-menu-btn')
      if (target) {
        const projectId = target.dataset.projectId
        console.log('Project menu:', projectId)
      }
    }

    const handleCalendarNav = (e) => {
      const target = e.target.closest('#calendar-prev-month, #calendar-next-month, #calendar-today')
      if (target) {
        const action = target.id.replace('calendar-', '')
        console.log('Calendar action:', action)
      }
    }

    const handleCalendarDayClick = (e) => {
      const target = e.target.closest('.calendar-day')
      if (target) {
        const date = target.dataset.date
        console.log('Calendar day clicked:', date)
      }
    }

    const handleTimelineNav = (e) => {
      const target = e.target.closest('#timeline-prev, #timeline-next, #timeline-today')
      if (target) {
        const action = target.id.replace('timeline-', '')
        console.log('Timeline action:', action)
      }
    }

    const handleTimelineView = (e) => {
      const target = e.target.closest('.timeline-view-btn')
      if (target) {
        const view = target.dataset.view
        console.log('Timeline view:', view)
      }
    }

    const handleProjectItemClick = (e) => {
      const target = e.target.closest('.project-item')
      if (target) {
        const projectId = target.dataset.projectId
        console.log('Project item clicked:', projectId)
      }
    }

    const handleGanttBarClick = (e) => {
      const target = e.target.closest('.gantt-bar')
      if (target) {
        const taskId = target.dataset.taskId
        console.log('Gantt bar clicked:', taskId)
      }
    }

    document.removeEventListener('click', handleNavClick)
    document.removeEventListener('click', handleNewProjectClick)
    document.removeEventListener('click', handleModalClose)
    document.removeEventListener('click', handleCreateProject)
    document.removeEventListener('click', handleTaskComplete)
    document.removeEventListener('click', handleViewAllProjects)
    document.removeEventListener('click', handleTaskFilter)
    document.removeEventListener('change', handleTaskSort)
    document.removeEventListener('click', handleAddTask)
    document.removeEventListener('change', handleSelectAllTasks)
    document.removeEventListener('click', handleProjectView)
    document.removeEventListener('click', handleProjectEdit)
    document.removeEventListener('click', handleProjectMenu)
    document.removeEventListener('click', handleCalendarNav)
    document.removeEventListener('click', handleCalendarDayClick)
    document.removeEventListener('click', handleTimelineNav)
    document.removeEventListener('click', handleTimelineView)
    document.removeEventListener('click', handleProjectItemClick)
    document.removeEventListener('click', handleGanttBarClick)
    
    document.addEventListener('click', handleNavClick)
    document.addEventListener('click', handleNewProjectClick)
    document.addEventListener('click', handleModalClose)
    document.addEventListener('click', handleCreateProject)
    document.addEventListener('click', handleTaskComplete)
    document.addEventListener('click', handleViewAllProjects)
    document.addEventListener('click', handleTaskFilter)
    document.addEventListener('change', handleTaskSort)
    document.addEventListener('click', handleAddTask)
    document.addEventListener('change', handleSelectAllTasks)
    document.addEventListener('click', handleProjectView)
    document.addEventListener('click', handleProjectEdit)
    document.addEventListener('click', handleProjectMenu)
    document.addEventListener('click', handleCalendarNav)
    document.addEventListener('click', handleCalendarDayClick)
    document.addEventListener('click', handleTimelineNav)
    document.addEventListener('click', handleTimelineView)
    document.addEventListener('click', handleProjectItemClick)
    document.addEventListener('click', handleGanttBarClick)
  }

  async createProject() {
    const nameInput = document.getElementById('project-name')
    const descriptionInput = document.getElementById('project-description')
    
    if (!nameInput) {
      return
    }
    
    const name = nameInput.value.trim()
    if (!name) {
      alert('请输入项目名称')
      return
    }

    const newProject = {
      id: Date.now().toString(),
      name: name,
      description: descriptionInput.value.trim(),
      color: '#3B82F6',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      const response = await fetch(`${this.API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProject)
      })
      
      if (response.ok) {
        const createdProject = await response.json()
        this.projects.push(createdProject)
      } else {
        this.projects.push(newProject)
      }
    } catch {
      this.projects.push(newProject)
    }

    this.invalidateCache()
    this.showNewProjectModal = false
    this.currentView = 'projects'
    this.render()
  }
}
