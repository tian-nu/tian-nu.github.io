---
layout: page
title: 备忘录
---

<!-- 右上角管理员状态 -->
<div id="admin-status" class="admin-status">
  <span id="login-text">访客模式 - 仅可查看</span>
  <button id="login-btn" onclick="showLoginModal()" class="admin-btn">管理员登录</button>
  <button id="logout-btn" onclick="logout()" class="admin-btn" style="display: none;">退出登录</button>
</div>

<!-- Toast 提示 -->
<div id="toast" class="toast"></div>

<div class="memo-container compact">
  <p class="memo-intro">记录待办事项、学习计划和重要提醒。</p>
  
  <!-- 登录弹窗 -->
  <div id="login-modal" class="login-modal" style="display: none;">
    <div class="login-content">
      <h3>管理员登录</h3>
      <input type="password" id="admin-password" placeholder="请输入密码" class="login-input">
      <div class="login-actions">
        <button onclick="login()" class="login-submit">登录</button>
        <button onclick="hideLoginModal()" class="login-cancel">取消</button>
      </div>
      <p class="login-hint">默认密码: admin123</p>
    </div>
  </div>
  
  <!-- 编辑弹窗 -->
  <div id="edit-modal" class="login-modal" style="display: none;">
    <div class="login-content">
      <h3>编辑备忘录</h3>
      <input type="hidden" id="edit-id">
      <div class="form-group">
        <textarea id="edit-text" placeholder="备忘录内容..." class="form-textarea" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>标签：</label>
        <select id="edit-category" class="memo-select">
        </select>
        <button onclick="showAddCategory()" class="btn-small">+ 新建</button>
      </div>
      <div class="form-group">
        <label>截止日期：</label>
        <input type="date" id="edit-date" class="memo-date">
        <button onclick="setTodayDate()" class="btn-small">今天</button>
        <button onclick="clearEditDate()" class="btn-small">清除</button>
      </div>
      <div class="login-actions">
        <button onclick="saveEditMemo()" class="login-submit">保存</button>
        <button onclick="hideEditModal()" class="login-cancel">取消</button>
      </div>
    </div>
  </div>
  
  <!-- 删除确认弹窗 -->
  <div id="delete-modal" class="login-modal" style="display: none;">
    <div class="login-content" style="max-width: 350px;">
      <h3>确认删除</h3>
      <p style="text-align: center; color: var(--text-secondary); margin-bottom: 1.5rem;">确定要删除这条备忘录吗？</p>
      <div class="login-actions">
        <button onclick="confirmDelete()" class="login-submit" style="background: linear-gradient(135deg, #ef4444, #dc2626);">删除</button>
        <button onclick="hideDeleteModal()" class="login-cancel">取消</button>
      </div>
    </div>
  </div>
  
  <!-- 添加标签弹窗 -->
  <div id="category-modal" class="login-modal" style="display: none;">
    <div class="login-content">
      <h3>新建标签</h3>
      <input type="text" id="new-category-name" placeholder="标签名称" class="login-input">
      <div class="form-group">
        <label>选择颜色：</label>
        <div class="color-picker">
          <button onclick="selectColor('#f59e0b')" class="color-btn" style="background:#f59e0b" data-color="#f59e0b"></button>
          <button onclick="selectColor('#3b82f6')" class="color-btn" style="background:#3b82f6" data-color="#3b82f6"></button>
          <button onclick="selectColor('#10b981')" class="color-btn" style="background:#10b981" data-color="#10b981"></button>
          <button onclick="selectColor('#ec4899')" class="color-btn" style="background:#ec4899" data-color="#ec4899"></button>
          <button onclick="selectColor('#8b5cf6')" class="color-btn" style="background:#8b5cf6" data-color="#8b5cf6"></button>
          <button onclick="selectColor('#06b6d4')" class="color-btn" style="background:#06b6d4" data-color="#06b6d4"></button>
          <button onclick="selectColor('#ef4444')" class="color-btn" style="background:#ef4444" data-color="#ef4444"></button>
          <button onclick="selectColor('#f97316')" class="color-btn" style="background:#f97316" data-color="#f97316"></button>
        </div>
      </div>
      <div class="login-actions">
        <button onclick="addNewCategory()" class="login-submit">添加</button>
        <button onclick="hideCategoryModal()" class="login-cancel">取消</button>
      </div>
    </div>
  </div>
  
  <!-- 新建按钮 (仅管理员可见) -->
  <div class="memo-add" id="memo-add-section" style="display: none;">
    <a href="/memo-new" class="memo-btn memo-new-btn">+ 新建备忘录</a>
  </div>
  
  <!-- 搜索和筛选 -->
  <div class="memo-toolbar">
    <div class="memo-search">
      <input type="text" id="memo-search" placeholder="搜索备忘录..." class="search-input" oninput="renderMemos()">
    </div>
    <div class="memo-sort">
      <select id="memo-sort" class="sort-select" onchange="renderMemos()">
        <option value="newest">最新添加</option>
        <option value="oldest">最早添加</option>
        <option value="deadline">截止日期</option>
      </select>
    </div>
  </div>
  
  <!-- 分类标签 -->
  <div class="memo-tabs" id="memo-tabs">
    <button class="memo-tab active" onclick="filterMemo('all')">全部 <span class="tab-count" id="count-all">0</span></button>
  </div>
  
  <!-- 备忘录列表 -->
  <div class="memo-list" id="memo-list">
    <div class="loading-state">
      <p>加载中...</p>
    </div>
  </div>
  
  <!-- 统计 -->
  <div class="memo-stats">
    <div class="stat-item">
      <span class="stat-number" id="total-count">0</span>
      <span class="stat-label">总计</span>
    </div>
    <div class="stat-item">
      <span class="stat-number" id="completed-count">0</span>
      <span class="stat-label">已完成</span>
    </div>
    <div class="stat-item">
      <span class="stat-number" id="pending-count">0</span>
      <span class="stat-label">待完成</span>
    </div>
    <div class="stat-item">
      <span class="stat-number" id="overdue-count">0</span>
      <span class="stat-label">已逾期</span>
    </div>
  </div>
  
  <!-- 数据操作 (仅管理员可见) -->
  <div class="memo-actions" id="memo-actions-section" style="display: none;">
    <button onclick="exportMemos()" class="action-btn">
      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
      导出数据
    </button>
    <button onclick="clearAllMemos()" class="action-btn danger">
      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      清空全部
    </button>
  </div>
</div>

<script>
let memos = [];
let currentFilter = 'all';
let isAdmin = false;
const ADMIN_PASSWORD = 'admin123';

let categories = {};

function loadCategories() {
  const saved = localStorage.getItem('memo_categories');
  if (saved) {
    categories = JSON.parse(saved);
  } else {
    categories = {
      todo: { name: '待办', color: '#f59e0b' },
      learning: { name: '学习', color: '#3b82f6' },
      idea: { name: '想法', color: '#10b981' },
      reminder: { name: '提醒', color: '#ec4899' },
      work: { name: '工作', color: '#8b5cf6' },
      life: { name: '生活', color: '#06b6d4' }
    };
    saveCategories();
  }
}

function saveCategories() {
  localStorage.setItem('memo_categories', JSON.stringify(categories));
}

function renderCategories() {
  const editSelect = document.getElementById('edit-category');
  if (editSelect) {
    editSelect.innerHTML = Object.entries(categories).map(([key, cat]) => 
      `<option value="${key}">${cat.name}</option>`
    ).join('');
  }
  
  const tabsContainer = document.getElementById('memo-tabs');
  if (tabsContainer) {
    const allTab = tabsContainer.querySelector('.memo-tab');
    tabsContainer.innerHTML = '';
    tabsContainer.appendChild(allTab);
    
    Object.entries(categories).forEach(([key, cat]) => {
      const btn = document.createElement('button');
      btn.className = 'memo-tab';
      btn.onclick = () => filterMemo(key);
      btn.innerHTML = `${cat.name} <span class="tab-count" id="count-${key}">0</span>`;
      tabsContainer.appendChild(btn);
    });
    
    if (currentFilter === 'all') {
      allTab.classList.add('active');
    } else {
      const tabs = tabsContainer.querySelectorAll('.memo-tab');
      tabs.forEach(tab => {
        if (tab.textContent.includes(categories[currentFilter]?.name)) {
          tab.classList.add('active');
        }
      });
    }
  }
}

function init() {
  loadCategories();
  renderCategories();
  checkLoginStatus();
  loadMemos();
  
  const pwdInput = document.getElementById('admin-password');
  if (pwdInput) {
    pwdInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') login();
    });
  }
}

function checkLoginStatus() {
  const loginTime = localStorage.getItem('admin_login_time');
  if (loginTime) {
    const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
    if (hoursSinceLogin < 24) {
      isAdmin = true;
    } else {
      localStorage.removeItem('admin_login_time');
    }
  }
  updateAdminUI();
}

function updateAdminUI() {
  const loginText = document.getElementById('login-text');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const addSection = document.getElementById('memo-add-section');
  const actionsSection = document.getElementById('memo-actions-section');
  
  if (isAdmin) {
    loginText.textContent = '管理员模式 - 可编辑';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    if (addSection) addSection.style.display = 'flex';
    if (actionsSection) actionsSection.style.display = 'flex';
  } else {
    loginText.textContent = '访客模式 - 仅可查看';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    if (addSection) addSection.style.display = 'none';
    if (actionsSection) actionsSection.style.display = 'none';
  }
  
  renderMemos();
}

function showLoginModal() {
  document.getElementById('login-modal').style.display = 'flex';
  document.getElementById('admin-password').focus();
}

function hideLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
  document.getElementById('admin-password').value = '';
}

function login() {
  const password = document.getElementById('admin-password').value;
  if (password === ADMIN_PASSWORD) {
    isAdmin = true;
    localStorage.setItem('admin_login_time', Date.now().toString());
    hideLoginModal();
    updateAdminUI();
    showToast('登录成功！', 'success');
  } else {
    showToast('密码错误！', 'error');
  }
}

function logout() {
  isAdmin = false;
  localStorage.removeItem('admin_login_time');
  updateAdminUI();
}

function loadMemos() {
  const savedData = localStorage.getItem('memos_data');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      memos = data.memos || [];
    } catch (e) {
      memos = [];
    }
  }
  
  fetch('{{ site.baseurl }}/assets/data/memos.json')
    .then(response => response.json())
    .then(data => {
      if (memos.length === 0) {
        memos = data.memos || [];
        saveMemos();
      }
    })
    .catch(e => {
      console.error('加载备忘录失败:', e);
    })
    .finally(() => {
      renderMemos();
      updateStats();
      updateTabCounts();
    });
}

function saveMemos() {
  const data = {
    memos: memos,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem('memos_data', JSON.stringify(data));
}

function renderMemos() {
  const list = document.getElementById('memo-list');
  const searchText = document.getElementById('memo-search')?.value.toLowerCase() || '';
  
  let filtered = memos.filter(m => {
    const matchCategory = currentFilter === 'all' || m.category === currentFilter;
    const matchSearch = m.text.toLowerCase().includes(searchText);
    return matchCategory && matchSearch;
  });
  
  const sortType = document.getElementById('memo-sort')?.value || 'newest';
  filtered.sort((a, b) => {
    switch(sortType) {
      case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
      case 'deadline': 
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      default: return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
  
  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" width="64" height="64">
          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <p>${searchText ? '没有找到匹配的备忘录' : '暂无备忘录，添加一个吧！'}</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = filtered.map(memo => {
    const cat = categories[memo.category] || categories.todo;
    const isOverdue = memo.deadline && !memo.completed && new Date(memo.deadline + 'T23:59:59') < new Date();
    const deadlineText = memo.deadline ? formatDate(memo.deadline) : '';
    const checkboxId = 'cb-' + memo.id.replace(/[^a-zA-Z0-9]/g, '-');
    
    return `
      <div class="memo-item ${memo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-id="${memo.id}">
        <div class="memo-checkbox">
          <input type="checkbox" id="${checkboxId}" ${memo.completed ? 'checked' : ''} 
                 onclick="return toggleComplete('${memo.id}', event)">
          <label for="${checkboxId}"></label>
        </div>
        <div class="memo-content">
          <div class="memo-text">${escapeHtml(memo.text)}</div>
          <div class="memo-meta">
            <span class="memo-tag" style="background: ${cat.color}20; color: ${cat.color}">${cat.name}</span>
            ${deadlineText ? `<span class="memo-deadline ${isOverdue ? 'overdue' : ''}">📅 ${deadlineText}</span>` : ''}
            <span class="memo-time">${formatTime(memo.createdAt)}</span>
          </div>
        </div>
        ${isAdmin ? `
          <button class="memo-edit" onclick="editMemo('${memo.id}')" title="编辑">✎</button>
          <button class="memo-delete" onclick="deleteMemo('${memo.id}')" title="删除">×</button>
        ` : ''}
      </div>
    `;
  }).join('');
}

function toggleComplete(id, event) {
  if (!isAdmin) {
    event.preventDefault();
    showTooltip('非管理员无法更改', event);
    return false;
  }
  
  const memo = memos.find(m => m.id === id);
  if (memo) {
    memo.completed = !memo.completed;
    saveMemos();
    renderMemos();
    updateStats();
    updateTabCounts();
  }
  return true;
}

function showTooltip(message, event) {
  const tooltip = document.createElement('div');
  tooltip.className = 'mini-tooltip';
  tooltip.textContent = message;
  tooltip.style.cssText = `
    position: fixed;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    font-size: 0.8rem;
    z-index: 10000;
    pointer-events: none;
    white-space: nowrap;
  `;
  document.body.appendChild(tooltip);
  
  const x = event.clientX;
  const y = event.clientY;
  tooltip.style.left = (x - tooltip.offsetWidth / 2) + 'px';
  tooltip.style.top = (y - tooltip.offsetHeight - 10) + 'px';
  
  setTimeout(() => {
    tooltip.remove();
  }, 1500);
}

let deleteTargetId = null;

function showDeleteModal(id) {
  deleteTargetId = id;
  document.getElementById('delete-modal').style.display = 'flex';
}

function hideDeleteModal() {
  deleteTargetId = null;
  document.getElementById('delete-modal').style.display = 'none';
}

function confirmDelete() {
  if (!deleteTargetId) return;
  memos = memos.filter(m => m.id !== deleteTargetId);
  saveMemos();
  renderMemos();
  updateStats();
  updateTabCounts();
  showToast('删除成功！', 'success');
  hideDeleteModal();
}

function deleteMemo(id) {
  if (!isAdmin) {
    showToast('请先登录管理员账号', 'warning');
    return;
  }
  showDeleteModal(id);
}

function editMemo(id) {
  if (!isAdmin) {
    showToast('请先登录管理员账号', 'warning');
    return;
  }
  
  const memo = memos.find(m => m.id === id);
  if (!memo) return;
  
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-text').value = memo.text;
  document.getElementById('edit-category').value = memo.category;
  document.getElementById('edit-date').value = memo.deadline || '';
  
  document.getElementById('edit-modal').style.display = 'flex';
  document.getElementById('edit-text').focus();
}

function saveEditMemo() {
  const id = document.getElementById('edit-id').value;
  const text = document.getElementById('edit-text').value.trim();
  const category = document.getElementById('edit-category').value;
  const deadline = document.getElementById('edit-date').value || null;
  
  if (!text) {
    showToast('请输入备忘录内容', 'warning');
    return;
  }
  
  const memo = memos.find(m => m.id === id);
  if (memo) {
    memo.text = text;
    memo.category = category;
    memo.deadline = deadline;
    saveMemos();
    renderMemos();
    updateStats();
    updateTabCounts();
    showToast('保存成功！', 'success');
  }
  
  hideEditModal();
}

function hideEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

function clearEditDate() {
  document.getElementById('edit-date').value = '';
}

function setTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById('edit-date').value = `${yyyy}-${mm}-${dd}`;
}

let selectedColor = '#f59e0b';
function showAddCategory() {
  if (!isAdmin) {
    showToast('请先登录管理员账号', 'warning');
    return;
  }
  document.getElementById('category-modal').style.display = 'flex';
  document.getElementById('new-category-name').value = '';
  document.getElementById('new-category-name').focus();
  document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelector('.color-btn[data-color="#f59e0b"]')?.classList.add('selected');
  selectedColor = '#f59e0b';
}

function hideCategoryModal() {
  document.getElementById('category-modal').style.display = 'none';
}

function selectColor(color) {
  selectedColor = color;
  document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.color-btn[data-color="${color}"]`)?.classList.add('selected');
}

function addNewCategory() {
  const name = document.getElementById('new-category-name').value.trim();
  if (!name) {
    showToast('请输入标签名称', 'warning');
    return;
  }
  
  const key = 'cat_' + Date.now();
  categories[key] = { name, color: selectedColor };
  saveCategories();
  renderCategories();
  document.getElementById('edit-category').value = key;
  hideCategoryModal();
  showToast('标签添加成功！', 'success');
}

function filterMemo(category) {
  currentFilter = category;
  
  document.querySelectorAll('.memo-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.textContent.toLowerCase().includes(categories[category]?.name.toLowerCase()) || 
        (category === 'all' && tab.textContent.includes('全部'))) {
      tab.classList.add('active');
    }
  });
  
  renderMemos();
}

function updateStats() {
  const total = memos.length;
  const completed = memos.filter(m => m.completed).length;
  const pending = total - completed;
  const overdue = memos.filter(m => {
    return m.deadline && !m.completed && new Date(m.deadline + 'T23:59:59') < new Date();
  }).length;
  
  document.getElementById('total-count').textContent = total;
  document.getElementById('completed-count').textContent = completed;
  document.getElementById('pending-count').textContent = pending;
  document.getElementById('overdue-count').textContent = overdue;
}

function updateTabCounts() {
  document.getElementById('count-all').textContent = memos.length;
  Object.keys(categories).forEach(cat => {
    const count = memos.filter(m => m.category === cat).length;
    const el = document.getElementById('count-' + cat);
    if (el) el.textContent = count;
  });
}

function exportMemos() {
  if (!isAdmin) {
    showToast('请先登录管理员账号', 'warning');
    return;
  }
  
  const data = {
    memos: memos,
    updatedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'memos.json';
  a.click();
  URL.revokeObjectURL(url);
}

function clearAllMemos() {
  if (!isAdmin) {
    showToast('请先登录管理员账号', 'warning');
    return;
  }
  
  if (!confirm('确定要清空所有备忘录吗？此操作不可恢复！')) return;
  memos = [];
  saveMemos();
  renderMemos();
  updateStats();
  updateTabCounts();
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const isCurrentYear = date.getFullYear() === now.getFullYear();
  
  if (isCurrentYear) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  } else {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
  
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

document.addEventListener('DOMContentLoaded', function() {
  init();
  document.querySelector('.page-container')?.classList.add('memo-page');
  
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('login-modal')) {
      e.target.style.display = 'none';
    }
  });
});
</script>

<style>
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(-20px);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1001;
  pointer-events: none;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.toast.success { background: linear-gradient(135deg, #10b981, #059669); }
.toast.error { background: linear-gradient(135deg, #ef4444, #dc2626); }
.toast.warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.toast.info { background: linear-gradient(135deg, #3b82f6, #2563eb); }

.memo-container {
  max-width: 900px;
  margin: 0 auto;
}

.memo-intro {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.admin-status {
  position: fixed;
  top: 80px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background-color: var(--bg-primary);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  z-index: 100;
  font-size: 0.8rem;
  transform: scale(0.9);
  opacity: 0.7;
  transition: all 0.3s ease;
}

.admin-status:hover {
  transform: scale(1);
  opacity: 1;
  box-shadow: var(--shadow-md);
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

#login-text {
  color: var(--text-secondary);
  font-size: inherit;
  white-space: nowrap;
}

.admin-btn {
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: inherit;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.admin-status:hover .admin-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

#login-btn {
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  color: white;
}

#logout-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.login-content {
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 400px;
}

.login-content h3 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.login-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.login-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.login-actions {
  display: flex;
  gap: 1rem;
}

.login-actions button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.login-submit {
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  color: white;
}

.login-cancel {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.login-hint {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.memo-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  margin-right: 0.5rem;
}

.memo-date {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  margin-right: 0.5rem;
}

.memo-date::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.btn-small {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 0.25rem;
}

.btn-small:hover {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.color-picker {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.color-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.selected {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--text-primary);
}

.memo-add {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.memo-btn {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.memo-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.memo-new-btn {
  display: inline-block;
  text-decoration: none;
  text-align: center;
}

.memo-toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.memo-search {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.sort-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
}

.memo-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.memo-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.memo-tab:hover {
  background-color: var(--border-color);
}

.memo-tab.active {
  background-color: var(--primary-color);
  color: white;
}

.tab-count {
  font-size: 0.75rem;
  background: rgba(0,0,0,0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
}

.memo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  min-height: 200px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.memo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.memo-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.memo-item.completed {
  border-left-color: #10b981;
}

.memo-item.overdue {
  border-left-color: #ef4444;
  background-color: rgba(239, 68, 68, 0.05);
}

.memo-checkbox {
  position: relative;
  flex-shrink: 0;
}

.memo-checkbox input {
  display: none;
}

.memo-checkbox label {
  display: block;
  width: 22px;
  height: 22px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.memo-checkbox input:checked + label {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.memo-checkbox input:checked + label::after {
  content: '✓';
  display: block;
  text-align: center;
  color: white;
  font-size: 14px;
  line-height: 18px;
}

.memo-content {
  flex: 1;
  min-width: 0;
}

.memo-text {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  word-break: break-word;
}

.memo-item.completed .memo-text {
  text-decoration: line-through;
  color: var(--text-muted);
}

.memo-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.memo-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.memo-deadline {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.memo-deadline.overdue {
  color: #ef4444;
  font-weight: 600;
}

.memo-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.memo-edit,
.memo-delete {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background-color: transparent;
  color: var(--text-muted);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.memo-edit:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.memo-delete:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.memo-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.memo-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-btn.danger:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.memo-container.compact .memo-list {
  gap: 0.5rem;
}

.memo-container.compact .memo-item {
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  gap: 0.75rem;
}

.memo-container.compact .memo-text {
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
}

.memo-container.compact .memo-meta {
  gap: 0.5rem;
}

.memo-container.compact .memo-tag {
  padding: 0.15rem 0.5rem;
  font-size: 0.7rem;
}

.memo-container.compact .memo-deadline,
.memo-container.compact .memo-time {
  font-size: 0.75rem;
}

.memo-container.compact .memo-edit,
.memo-container.compact .memo-delete {
  width: 28px;
  height: 28px;
  font-size: 0.9rem;
}

.memo-container.compact .memo-stats {
  padding: 1rem;
  gap: 0.75rem;
}

.memo-container.compact .stat-number {
  font-size: 1.5rem;
}

.memo-container.compact .stat-label {
  font-size: 0.75rem;
}

.memo-container.compact .memo-tabs {
  gap: 0.4rem;
}

.memo-container.compact .memo-tab {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.memo-container.compact .tab-count {
  font-size: 0.7rem;
  padding: 0.05rem 0.3rem;
}

.memo-container.compact .memo-add {
  gap: 0.5rem;
}

.memo-page .page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
  text-align: left;
}

.memo-page .page-container {
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .memo-toolbar {
    flex-direction: column;
  }
  
  .memo-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }
  
  .memo-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .memo-item {
    flex-wrap: wrap;
  }
  
  .memo-meta {
    width: 100%;
  }
  
  .login-actions {
    flex-direction: column;
  }
  
  .admin-status {
    position: relative;
    top: auto;
    right: auto;
    margin-bottom: 1rem;
    justify-content: center;
  }
  
  .toast {
    top: 20px;
    width: 80%;
    text-align: center;
  }
}
</style>
