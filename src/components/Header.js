export class Header {
  static render() {
    return `
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-4">
          <div class="relative w-80">
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="搜索图标">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="搜索任务、项目..." 
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
            />
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button class="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-150" aria-label="通知">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"></path>
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button class="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-150" aria-label="消息">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>
          <button id="btn-new-project" class="px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 hover:shadow-md transition-all duration-150 flex items-center gap-2" aria-label="新建项目">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 4v16m8-8H4"></path>
            </svg>
            新建项目
          </button>
        </div>
      </header>
    `
  }
}
