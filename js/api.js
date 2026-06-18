const API_BASE = '/api';

async function apiCall(endpoint, method = 'GET', data = null, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('taskflow_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : null
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(result.error || result.message || `请求失败 (${response.status})`);
    }
    return result;
}

// Auth
const AuthAPI = {
    login: (email, password) => apiCall('/auth/login', 'POST', { email, password }),
    register: (email, password) => apiCall('/auth/register', 'POST', { email, password }),
    logout: () => apiCall('/auth/logout', 'POST'),
    getUser: () => apiCall('/auth/user')
};

// Projects
const ProjectAPI = {
    getAll: () => apiCall('/projects'),
    get: (id) => apiCall(`/projects/${id}`),
    create: (name, description, color) => apiCall('/projects', 'POST', { name, description, color }),
    update: (id, name, description, color) => apiCall(`/projects/${id}`, 'PUT', { name, description, color }),
    delete: (id) => apiCall(`/projects/${id}`, 'DELETE')
};

// Tasks
const TaskAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.append(k, v); });
        const qs = params.toString();
        return apiCall(`/tasks${qs ? '?' + qs : ''}`);
    },
    get: (id) => apiCall(`/tasks/${id}`),
    create: (data) => apiCall('/tasks', 'POST', data),
    update: (id, data) => apiCall(`/tasks/${id}`, 'PUT', data),
    remove: (id) => apiCall(`/tasks/${id}`, 'DELETE'),
    toggleComplete: (id, completed) => apiCall(`/tasks/${id}/complete`, 'PUT', { completed })
};

// Trash
const TrashAPI = {
    getAll: () => apiCall('/trash'),
    restore: (id) => apiCall(`/trash/${id}/restore`, 'POST'),
    permanentDelete: (id) => apiCall(`/trash/${id}`, 'DELETE'),
    empty: () => apiCall('/trash', 'DELETE')
};

// Stats
const StatsAPI = {
    overview: () => apiCall('/stats'),
    projectStats: () => apiCall('/stats/projects')
};

function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = d - now;
    const dayDiff = Math.round(diff / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) return `今天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    if (dayDiff === 1) return `明天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    if (dayDiff === -1) return `昨天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function isOverdue(iso) {
    if (!iso) return false;
    return new Date(iso) < new Date();
}

function getInitial(name) {
    return (name || '?').charAt(0).toUpperCase();
}

// Global app state
const AppState = {
    projects: [],
    tasks: [],
    stats: null,
    projectStats: [],
    currentProjectFilter: '',
    currentStatusFilter: '',
    searchQuery: '',
    priorityFilter: 'all',
    collapsedProjects: {},
    currentView: 'dashboard',
    timelineStartDate: new Date(),
    timelineDays: 14,
    timelineMode: 'week',
    dayWidth: 100,
    editingTaskId: null,
    editingProjectId: null,
    timelineProjectFilter: ''
};
