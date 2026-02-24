---
layout: page
title: 新建备忘录
---

<!-- 右上角管理员状态 -->
<div id="admin-status" class="admin-status">
  <span id="login-text">访客模式</span>
  <button id="login-btn" onclick="showLoginModal()" class="admin-btn">管理员登录</button>
  <button id="logout-btn" onclick="logout()" class="admin-btn" style="display: none;">退出登录</button>
</div>

<!-- Toast 提示 -->
<div id="toast" class="toast"></div>

<div class="memo-container compact">
  <div class="memo-form-page">
    <h2 class="form-title">✨ 新建备忘录</h2>
    
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
    
    <!-- 备忘录表单 -->
    <div class="memo-form" id="memo-form-section" style="display: none;">
      <div class="form-group">
        <label>📋 备忘录内容</label>
        <textarea id="memo-content" class="form-textarea" rows="6" placeholder="请输入备忘录内容..."></textarea>
      </div>
      
      <div class="form-group">
        <label>🏷️ 标签分类</label>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <select id="memo-category" class="memo-select" style="flex: 1;">
          </select>
          <button onclick="showAddCategory()" class="btn-small">+ 新建标签</button>
        </div>
      </div>
      
      <div class="form-group">
        <label>📅 截止日期</label>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input type="date" id="memo-date" class="memo-date" style="flex: 1;">
          <button onclick="setTodayDate()" class="btn-small">今天</button>
          <button onclick="clearDate()" class="btn-small">清除</button>
        </div>
      </div>
      
      <div class="login-actions" style="margin-top: 2rem;">
        <a href="/memo" class="login-cancel" style="text-align: center; text-decoration: none;">← 返回列表</a>
        <button onclick="saveMemo()" class="login-submit">💾 保存备忘录</button>
      </div>
    </div>
    
    <!-- 游客提示 -->
    <div id="guest-notice" class="guest-notice" style="display: none;">
      <p>⚠️ 游客模式只能查看，请先登录管理员账号</p>
      <a href="/memo" class="login-cancel" style="text-align: center; text-decoration: none; display: inline-block;">← 返回列表</a>
    </div>
  </div>
</div>

<script>
const ADMIN_PASSWORD = 'admin123';
let isAdmin = false;

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

function initCategorySelect() {
  const select = document.getElementById('memo-category');
  select.innerHTML = Object.entries(categories).map(([key, cat]) => 
    `<option value="${key}">${cat.name}</option>`
  ).join('');
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
  const formSection = document.getElementById('memo-form-section');
  const guestNotice = document.getElementById('guest-notice');
  
  if (isAdmin) {
    loginText.textContent = '管理员模式 - 可编辑';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    if (formSection) formSection.style.display = 'block';
    if (guestNotice) guestNotice.style.display = 'none';
  } else {
    loginText.textContent = '访客模式 - 仅可查看';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    if (formSection) formSection.style.display = 'none';
    if (guestNotice) guestNotice.style.display = 'block';
  }
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

function saveMemo() {
  if (!isAdmin) {
    showToast('请先登录管理员账号', 'warning');
    return;
  }
  
  const content = document.getElementById('memo-content').value.trim();
  const category = document.getElementById('memo-category').value;
  const date = document.getElementById('memo-date').value;
  
  if (!content) {
    showToast('请输入备忘录内容', 'warning');
    document.getElementById('memo-content').focus();
    return;
  }
  
  let savedData = localStorage.getItem('memos_data');
  let data = { memos: [] };
  if (savedData) {
    try {
      data = JSON.parse(savedData);
    } catch (e) {
      data = { memos: [] };
    }
  }
  
  const memo = {
    id: 'memo-' + Date.now(),
    text: content,
    category: category,
    completed: false,
    createdAt: new Date().toISOString(),
    deadline: date || null
  };
  
  data.memos.unshift(memo);
  localStorage.setItem('memos_data', JSON.stringify(data));
  
  showToast('备忘录添加成功！', 'success');
  
  document.getElementById('memo-content').value = '';
  document.getElementById('memo-date').value = '';
  
  setTimeout(() => {
    window.location.href = '/memo';
  }, 1000);
}

function setTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById('memo-date').value = `${yyyy}-${mm}-${dd}`;
}

function clearDate() {
  document.getElementById('memo-date').value = '';
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
  
  initCategorySelect();
  document.getElementById('memo-category').value = key;
  
  hideCategoryModal();
  showToast('标签添加成功！', 'success');
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
  loadCategories();
  initCategorySelect();
  checkLoginStatus();
  document.querySelector('.page-container')?.classList.add('memo-page');
  
  setTodayDate();
  
  document.getElementById('admin-password')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
  });
  
  document.getElementById('new-category-name')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addNewCategory();
  });
  
  document.getElementById('memo-content')?.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      saveMemo();
    }
  });
  
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('login-modal')) {
      e.target.style.display = 'none';
    }
  });
});
</script>

<style>
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

.memo-form-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--bg-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
}

.form-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
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
  min-height: 120px;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.memo-select {
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
}

.memo-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.memo-date {
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
}

.memo-date:focus {
  outline: none;
  border-color: var(--primary-color);
}

.memo-date::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.guest-notice {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.guest-notice p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
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
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.login-content {
  background-color: var(--bg-primary);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  max-width: 400px;
  width: 90%;
}

.login-content h3 {
  margin-bottom: 1rem;
  text-align: center;
  color: var(--text-primary);
}

.login-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 1rem;
}

.login-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.login-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.login-submit,
.login-cancel {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.login-submit {
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  color: white;
}

.login-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.login-cancel {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.login-cancel:hover {
  background-color: var(--border-color);
}

.login-hint {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.toast {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(-20px);
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  z-index: 1001;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  box-shadow: var(--shadow-md);
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.toast.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.toast.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.btn-small {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small:hover {
  background-color: var(--border-color);
  color: var(--text-primary);
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
  transition: transform 0.2s, border-color 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.selected {
  border-color: var(--text-primary);
  transform: scale(1.15);
}

@media (max-width: 768px) {
  .memo-form-page {
    padding: 1.5rem;
    margin: 0 -1rem;
    border-radius: 0;
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
