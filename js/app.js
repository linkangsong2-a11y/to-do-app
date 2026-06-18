async function loadData() {
    try {
        const [projects, tasks, stats, projectStats, trashItems] = await Promise.all([
            ProjectAPI.getAll().catch(() => []),
            TaskAPI.getAll().catch(() => []),
            StatsAPI.overview().catch(() => null),
            StatsAPI.projectStats().catch(() => []),
            TrashAPI.getAll().catch(() => [])
        ]);

        AppState.projects = projects || [];
        AppState.tasks = tasks || [];
        AppState.stats = stats || { total_tasks: 0, active_tasks: 0, completed_tasks: 0, projects: 0, completion_rate: 0, priority_distribution: { high: 0, medium: 0, low: 0, none: 0 } };
        AppState.projectStats = projectStats || [];
        trashTasks = trashItems || [];
    } catch (e) {
        console.error('loadData failed', e);
        showToast('加载数据失败', 'error');
    }
}

function initApp() {
    try {
        initAuth();
    } catch (e) {
        console.error('initAuth error:', e);
    }

    try {
        // Navigation tabs
        document.querySelectorAll('[data-view]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                showView(view);
            });
        });

        // Project & task buttons
        const addProjectBtns = document.querySelectorAll('#addProjectBtn, [id="addProjectBtn"]');
        addProjectBtns.forEach(btn => btn.addEventListener('click', openCreateProjectModal));
        document.getElementById('saveProjectBtn').addEventListener('click', saveProject);

        const addTaskBtns = document.querySelectorAll('#addTaskBtn, #dashAddTaskBtn, #timelineAddBtn');
        addTaskBtns.forEach(btn => btn.addEventListener('click', openCreateTaskModal));
        document.getElementById('saveTaskBtn').addEventListener('click', saveTask);
        document.getElementById('clearCompletedBtn').addEventListener('click', clearCompletedTasks);
        document.getElementById('emptyTrashBtn').addEventListener('click', emptyTrash);

        // Timeline nav
        document.getElementById('timelinePrevBtn').addEventListener('click', timelinePrev);
        document.getElementById('timelineNextBtn').addEventListener('click', timelineNext);
        document.getElementById('timelineTodayBtn').addEventListener('click', timelineToday);

        // Color swatches in project modal
        document.querySelectorAll('#colorPicker .color-swatch').forEach(sw => {
            sw.addEventListener('click', () => {
                document.querySelectorAll('#colorPicker .color-swatch').forEach(s => s.classList.remove('active'));
                sw.classList.add('active');
                document.getElementById('projectColor').value = sw.dataset.color;
            });
        });

        // Search input
        const searchInput = document.getElementById('taskSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                AppState.searchQuery = e.target.value;
                renderTasks();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                AppState.currentStatusFilter = e.target.value;
                renderTasks();
            });
        }

        // Priority filter
        const priorityFilter = document.getElementById('priorityFilter');
        if (priorityFilter) {
            priorityFilter.addEventListener('change', (e) => {
                AppState.priorityFilter = e.target.value;
                renderTasks();
            });
        }

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        });

        // Global click delegation (task completion, delete, edit, etc.)
        document.addEventListener('click', async (e) => {
            // Close modal buttons
            const closeModal = e.target.closest('[data-close-modal]');
            if (closeModal) {
                e.stopPropagation();
                hideModal(closeModal.dataset.closeModal);
                return;
            }

            const taskToggle = e.target.closest('[data-toggle-task]');
            if (taskToggle) {
                e.stopPropagation();
                await toggleTaskComplete(taskToggle.dataset.toggleTask);
                return;
            }

            const taskEdit = e.target.closest('[data-edit-task]');
            if (taskEdit) {
                e.stopPropagation();
                openEditTaskModal(taskEdit.dataset.editTask);
                return;
            }

            const projectEdit = e.target.closest('[data-edit-project]');
            if (projectEdit) {
                e.stopPropagation();
                openEditProjectModal(projectEdit.dataset.editProject);
                return;
            }

            const projectDelete = e.target.closest('[data-delete-project]');
            if (projectDelete) {
                e.stopPropagation();
                deleteProject(projectDelete.dataset.deleteProject);
                return;
            }

            const taskDelete = e.target.closest('[data-delete-task]');
            if (taskDelete) {
                e.stopPropagation();
                deleteTask(taskDelete.dataset.deleteTask);
                return;
            }

            const showTasks = e.target.closest('[data-show-tasks]');
            if (showTasks) {
                e.stopPropagation();
                AppState.currentProjectFilter = showTasks.dataset.showTasks;
                showView('tasks');
                if (document.getElementById('statusFilter')) document.getElementById('statusFilter').value = '';
                if (document.getElementById('priorityFilter')) document.getElementById('priorityFilter').value = 'all';
                return;
            }

            const filterProject = e.target.closest('[data-filter-project]');
            if (filterProject) {
                e.stopPropagation();
                AppState.currentProjectFilter = filterProject.dataset.filterProject;
                renderTasks();
                return;
            }

            const timelineProjectHeader = e.target.closest('[data-toggle-project]');
            if (timelineProjectHeader) {
                e.stopPropagation();
                const id = timelineProjectHeader.dataset.toggleProject;
                AppState.collapsedProjects[id] = !AppState.collapsedProjects[id];
                renderTimeline();
                return;
            }

            const restoreBtn = e.target.closest('[data-restore-task]');
            if (restoreBtn) {
                e.stopPropagation();
                await restoreTask(restoreBtn.dataset.restoreTask);
                return;
            }

            const permDeleteBtn = e.target.closest('[data-perm-delete]');
            if (permDeleteBtn) {
                e.stopPropagation();
                await permanentDeleteTask(permDeleteBtn.dataset.permDelete);
                return;
            }
        });
    } catch (e) {
        console.error('Event binding error:', e);
    }

    // Auto init: if logged in, load data
    if (checkAuth()) {
        showApp();
        (async () => {
            let email = localStorage.getItem('taskflow_email');
            if (!email) {
                try {
                    const userData = await AuthAPI.getUser();
                    if (userData.email) {
                        email = userData.email;
                        localStorage.setItem('taskflow_email', email);
                    }
                } catch (e) {
                    console.warn('Failed to fetch user email', e);
                }
            }
            if (email) {
                const userEl = document.getElementById('userEmail');
                if (userEl) userEl.textContent = email;
            }
            await loadData();
            renderDashboard();
        })();
    } else {
        showAuth();
    }
}

// Color swatch styles (inject once)
(function injectStyles() {
    const css = `
        .color-swatch { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
        .color-swatch.active { border-color: var(--text); transform: scale(1.15); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
})();

// Init app immediately since scripts are loaded at end of body
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
