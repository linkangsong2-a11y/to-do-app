const NAV_ITEMS = [
  { id: 'dashboard', label: '仪表板', icon: 'layout-dashboard' },
  { id: 'projects', label: '项目管理', icon: 'folder-open' },
  { id: 'tasks', label: '任务列表', icon: 'list-checks' },
  { id: 'timeline', label: '时间轴', icon: 'calendar-days' },
  { id: 'calendar', label: '日历视图', icon: 'calendar' },
  { id: 'files', label: '文件管理', icon: 'file-text' },
  { id: 'team', label: '团队管理', icon: 'users' },
  { id: 'analytics', label: '统计分析', icon: 'bar-chart-2' },
  { id: 'settings', label: '设置中心', icon: 'settings' }
]

const ICONS = {
  'layout-dashboard': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="仪表板图标">
    <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
  </svg>`,
  'folder-open': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="文件夹图标">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>`,
  'list-checks': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="任务列表图标">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4"></path>
  </svg>`,
  'calendar-days': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="时间轴图标">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>`,
  'calendar': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="日历图标">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>`,
  'file-text': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="文件图标">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
  </svg>`,
  'users': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="团队图标">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>`,
  'bar-chart-2': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="图表图标">
    <line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>`,
  'settings': `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="设置图标">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>
  </svg>`
}

export class Sidebar {
  static render(currentView) {
    return `
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div class="p-5 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="TaskFlow Logo">
                <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <div>
              <h1 class="font-semibold text-gray-800 text-lg">TaskFlow</h1>
              <p class="text-xs text-gray-500">项目管理与任务追踪</p>
            </div>
          </div>
        </div>
        
        <nav class="flex-1 p-3 space-y-1">
          ${NAV_ITEMS.map(item => this.renderNavItem(item, currentView)).join('')}
        </nav>
        
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-150 cursor-pointer group">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" class="w-9 h-9 rounded-full bg-gray-200" alt="用户头像">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">张小美</p>
              <p class="text-xs text-gray-500">产品经理</p>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="展开菜单">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
          </div>
        </div>
      </aside>
    `
  }

  static renderNavItem(item, currentView) {
    const isActive = currentView === item.id
    return `
      <button 
        class="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
          isActive 
            ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
        }"
        data-view="${item.id}"
        tabindex="0"
      >
        ${ICONS[item.icon] || ICONS['layout-dashboard']}
        <span>${item.label}</span>
      </button>
    `
  }
}
