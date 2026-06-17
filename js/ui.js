let toastTimeout = null;

function showToast(message, type = 'success') {
    if (toastTimeout) clearTimeout(toastTimeout);
    const old = document.querySelector('.toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    toastTimeout = setTimeout(() => toast.remove(), 3000);
}

function showConfirm(title, message, onConfirm, confirmText = '确认') {
    const modalHtml = `
        <div class="modal" id="confirmModal">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">${escapeHtml(title)}</div>
                    <button class="modal-close" id="confirmClose">✕</button>
                </div>
                <div class="modal-body">
                    <p class="confirm-message">${escapeHtml(message)}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="confirmCancel">取消</button>
                    <button class="btn btn-danger" id="confirmOk">${escapeHtml(confirmText)}</button>
                </div>
            </div>
        </div>
    `;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHtml;
    document.body.appendChild(wrapper);

    const modal = wrapper.querySelector('#confirmModal');
    const close = () => modal.remove();

    wrapper.querySelector('#confirmClose').onclick = close;
    wrapper.querySelector('#confirmCancel').onclick = close;
    wrapper.querySelector('#confirmOk').onclick = () => {
        close();
        if (onConfirm) onConfirm();
    };
    modal.onclick = (e) => { if (e.target === modal) close(); };
}

function showModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'flex';
}

function hideModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'none';
}

function showView(view) {
    AppState.currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const target = document.querySelector(`[data-view="${view}"]`);
    if (target) target.classList.add('active');

    if (view === 'dashboard') renderDashboard();
    else if (view === 'projects') renderProjects();
    else if (view === 'tasks') renderTasks();
    else if (view === 'trash') renderTrash();
    else if (view === 'timeline') renderTimeline();
}

// Loading state helpers
function setButtonLoading(btn, loadingText) {
    if (!btn) return;
    btn.dataset.originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span>${loadingText || '加载中...'}`;
}

function resetButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
}
