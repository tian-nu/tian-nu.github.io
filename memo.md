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

<div class="memo-container">
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
  
  <!-- 快速添加 (仅管理员可见) -->
  <div class="memo-add" id="memo-add-section" style="display: none;">
    <input type="text" id="memo-input" placeholder="添加新事项..." class="memo-input">
    <select id="memo-category" class="memo-select">
      <option value="todo">待办</option>
      <option value="learning">学习</option>
      <option value="idea">想法</option>
      <option value="reminder">提醒</option>
      <option value="work">工作</option>
      <option value="life">生活</option>
    </select>
    <input type="date" id="memo-date" class="memo-date">
    <button onclick="addMemo()" class="memo-btn">添加</button>
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
  <div class="memo-tabs">
    <button class="memo-tab active" onclick="filterMemo('all')">全部 <span class="tab-count" id="count-all">0</span></button>
    <button class="memo-tab" onclick="filterMemo('todo')">待办 <span class="tab-count" id="count-todo">0</span></button>
    <button class="memo-tab" onclick="filterMemo('learning')">学习 <span class="tab-count" id="count-learning">0</span></button>
    <button class="memo-tab" onclick="filterMemo('idea')">想法 <span class="tab-count" id="count-idea">0</span></button>
    <button class="memo-tab" onclick="filterMemo('reminder')">提醒 <span class="tab-count" id="count-reminder">0</span></button>
    <button class="memo-tab" onclick="filterMemo('work')">工作 <span class="tab-count" id="count-work">0</span></button>
    <button class="memo-tab" onclick="filterMemo('life')">生活 <span class="tab-count" id="count-life">0</span></button>
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
// 数据存储
let memos = [];
let currentFilter = 'all';
let isAdmin = false;
const ADMIN_PASSWORD = 'admin123';

// 分类配置
const categories = {
  todo: { name: '待办', color: '#f59e0b' },
  learning: { name: '学习', color: '#3b82f6' },
  idea: { name: '想法', color: '#10b981' },
  reminder: { name: '提醒', color: '#ec4899' },
  work: { name: '工作', color: '#8b5cf6' },
  life: { name: '生活', color: '#06b6d4' }
};

// 初始化
function init() {
  // 检查登录状态
  checkLoginStatus();
  
  // 加载备忘录数据
  loadMemos();
  
  // 设置默认日期为今天
  const dateInput = document.getElementById('memo-date');
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
  
  // 回车添加
  const memoInput = document.getElementById('memo-input');
  if (memoInput) {
    memoInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') addMemo();
    });
  }
  
  // 登录框回车
  const pwdInput = document.getElementById('admin-password');
  if (pwdInput) {
    pwdInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') login();
    });
  }
}

// 检查登录状态
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

// 更新管理员界面
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

// 显示登录弹窗
function showLoginModal() {
  document.getElementById('login-modal').style.display = 'flex';
  document.getElementById('admin-password').focus();
}

// 隐藏登录弹窗
function hideLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
  document.getElementById('admin-password').value = '';
}

// 登录
function login() {
  const password = document.getElementById('admin-password').value;
  if (password === ADMIN_PASSWORD) {
    isAdmin = true;
    localStorage.setItem('admin_login_time', Date.now().toString());
    hideLoginModal();
    updateAdminUI();
    alert('登录成功！');
  } else {
    alert('密码错误！');
  }
}

// 退出登录
function logout() {
  isAdmin = false;
  localStorage.removeItem('admin_login_time');
  updateAdminUI();
}

// 加载备忘录 - 优先从 localStorage 读取，如果没有则从 JSON 文件加载
function loadMemos() {
  // 首先尝试从 localStorage 加载
  const savedData = localStorage.getItem('memos_data');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      memos = data.memos || [];
      renderMemos();
      updateStats();
      updateTabCounts();
      return;
    } catch (e) {
      console.error('从 localStorage 加载失败:', e);
    }
  }
  
  // 如果 localStorage 没有数据，从 JSON 文件加载
  fetch('{{ site.baseurl }}/assets/data/memos.json')
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('加载失败');
    })
    .then(data => {
      memos = data.memos || [];
      // 保存到 localStorage
      saveMemos();
      renderMemos();
      updateStats();
      updateTabCounts();
    })
    .catch(e => {
      console.error('加载备忘录失败:', e);
      memos = [];
      renderMemos();
      updateStats();
      updateTabCounts();
    });
}

// 保存备忘录到 localStorage (临时存储)
function saveMemos() {
  const data = {
    memos: memos,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem('memos_data', JSON.stringify(data));
}

// 添加备忘录
function addMemo() {
  if (!isAdmin) {
    alert('请先登录管理员账号');
    return;
  }
  
  const input = document.getElementById('memo-input');
  const category = document.getElementById('memo-category');
  const dateInput = document.getElementById('memo-date');
  const text = input.value.trim();
  
  if (!text) {
    input.focus();
    return;
  }
  
  const memo = {
    id: 'memo-' + Date.now(),
    text: text,
    category: category.value,
    completed: false,
    createdAt: new Date().toISOString(),
    deadline: dateInput.value || null
  };
  
  memos.unshift(memo);
  saveMemos();
  
  input.value = '';
  dateInput.valueAsDate = new Date();
  
  renderMemos();
  updateStats();
  updateTabCounts();
}

// 渲染备忘录
function renderMemos() {
  const list = document.getElementById('memo-list');
  const searchText = document.getElementById('memo-search')?.value.toLowerCase() || '';
  
  let filtered = memos.filter(m => {
    const matchCategory = currentFilter === 'all' || m.category === currentFilter;
    const matchSearch = m.text.toLowerCase().includes(searchText);
    return matchCategory && matchSearch;
  });
  
  // 排序
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
    const isOverdue = memo.deadline && !memo.completed && new Date(memo.deadline) < new Date();
    const deadlineText = memo.deadline ? formatDate(memo.deadline) : '';
    const checkboxId = 'cb-' + memo.id.replace(/[^a-zA-Z0-9]/g, '-');
    
    return `
      <div class="memo-item ${memo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-id="${memo.id}">
        <div class="memo-checkbox">
          <input type="checkbox" id="${checkboxId}" ${memo.completed ? 'checked' : ''} 
                 onchange="toggleComplete('${memo.id}')" ${!isAdmin ? 'disabled' : ''}>
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

// 切换完成状态
function toggleComplete(id) {
  if (!isAdmin) {
    alert('请先登录管理员账号');
    renderMemos();
    return;
  }
  
  const memo = memos.find(m => m.id === id);
  if (memo) {
    memo.completed = !memo.completed;
    saveMemos();
    renderMemos();
    updateStats();
    updateTabCounts();
  }
}

// 删除备忘录
function deleteMemo(id) {
  if (!isAdmin) {
    alert('请先登录管理员账号');
    return;
  }
  
  if (!confirm('确定要删除这条备忘录吗？')) return;
  memos = memos.filter(m => m.id !== id);
  saveMemos();
  renderMemos();
  updateStats();
  updateTabCounts();
}

// 编辑备忘录
function editMemo(id) {
  if (!isAdmin) {
    alert('请先登录管理员账号');
    return;
  }
  
  const memo = memos.find(m => m.id === id);
  if (!memo) return;
  
  const newText = prompt('编辑备忘录:', memo.text);
  if (newText !== null && newText.trim()) {
    memo.text = newText.trim();
    saveMemos();
    renderMemos();
  }
}

// 筛选备忘录
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

// 更新统计
function updateStats() {
  const total = memos.length;
  const completed = memos.filter(m => m.completed).length;
  const pending = total - completed;
  const overdue = memos.filter(m => {
    return m.deadline && !m.completed && new Date(m.deadline) < new Date();
  }).length;
  
  document.getElementById('total-count').textContent = total;
  document.getElementById('completed-count').textContent = completed;
  document.getElementById('pending-count').textContent = pending;
  document.getElementById('overdue-count').textContent = overdue;
}

// 更新标签计数
function updateTabCounts() {
  document.getElementById('count-all').textContent = memos.length;
  Object.keys(categories).forEach(cat => {
    const count = memos.filter(m => m.category === cat).length;
    const el = document.getElementById('count-' + cat);
    if (el) el.textContent = count;
  });
}

// 导出数据
function exportMemos() {
  if (!isAdmin) {
    alert('请先登录管理员账号');
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

// 清空全部
function clearAllMemos() {
  if (!isAdmin) {
    alert('请先登录管理员账号');
    return;
  }
  
  if (!confirm('确定要清空所有备忘录吗？此操作不可恢复！')) return;
  memos = [];
  saveMemos();
  renderMemos();
  updateStats();
  updateTabCounts();
}

// 格式化日期
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 格式化时间
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

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 初始化
document.addEventListener('DOMContentLoaded', init);
</script>

<style>
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

/* 管理员状态 - 固定在右上角 */
.admin-status {
  position: fixed;
  top: 80px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg-primary);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  z-index: 100;
  font-size: 0.85rem;
}

#login-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.admin-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

#login-btn {
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  color: white;
}

#logout-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

/* 登录弹窗 */
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

/* 添加区域 */
.memo-add {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.memo-input {
  flex: 1;
  min-width: 200px;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.memo-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.memo-select,
.memo-date {
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
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

/* 工具栏 */
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

/* 分类标签 */
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

/* 列表 */
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

/* 复选框 */
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

.memo-checkbox input:disabled + label {
  opacity: 0.5;
  cursor: not-allowed;
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

/* 统计 */
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

/* 操作按钮 */
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

@media (max-width: 768px) {
  .memo-add {
    flex-direction: column;
  }
  
  .memo-add > * {
    width: 100%;
  }
  
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
}
</style>
