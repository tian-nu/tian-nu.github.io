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

<!-- 自定义提示 -->
<div id="toast" class="toast"></div>

<div class="memo-container">
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
    <div class="memo-form" id="memo-form-section">
      <div class="form-section">
        <label class="form-label">📋 备忘录内容</label>
        <textarea id="memo-content" class="form-textarea-large" rows="6" placeholder="请输入备忘录内容..."></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-section flex-1">
          <label class="form-label">🏷️ 标签分类</label>
          <div class="form-row">
            <select id="memo-category" class="memo-select-large">
              <!-- 动态生成 -->
            </select>
            <button onclick="showAddCategory()" class="btn-secondary">+ 新建标签</button>
          </div>
        </div>
        
        <div class="form-section">
          <label class="form-label">📅 截止日期</label>
          <div class="date-picker-group">
            <input type="date" id="memo-date" class="memo-date-large">
            <button onclick="setTodayDate()" class="btn-small">今天</button>
            <button onclick="clearDate()" class="btn-small btn-gray">清除</button>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <a href="/memo" class="btn-cancel">← 返回列表</a>
        <button onclick="saveMemo()" class="btn-save" id="save-btn">💾 保存备忘录</button>
      </div>
    </div>
    
    <!-- 游客提示 -->
    <div id="guest-notice" class="guest-notice" style="display: none;">
      <p>⚠️ 游客模式只能查看，请先登录管理员账号</p>
      <a href="/memo" class="btn-cancel">← 返回列表</a>
    </div>
  </div>
</div>

<style>
/* 页面标题 */
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

/* 表单页面容器 */
.memo-form-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
}

.form-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  text-align: center;
}

/* 表单区块 */
.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 0.95rem;
}

/* 大文本框 */
.form-textarea-large {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-textarea-large:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* 表单行布局 */
.form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.flex-1 {
  flex: 1;
}

/* 大号选择器 */
.memo-select-large {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.memo-select-large:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* 大号日期选择器 */
.memo-date-large {
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.memo-date-large:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* 日期选择器在暗色模式下的样式 */
.memo-date-large::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.memo-date-large:hover::-webkit-calendar-picker-indicator {
  opacity: 0.8;
}

/* 日期选择组 */
.date-picker-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* 按钮样式 */
.btn-secondary {
  padding: 0.875rem 1rem;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-secondary:hover {
  background-color: var(--border-color);
}

.btn-small {
  padding: 0.875rem 1rem;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-small:hover {
  background-color: var(--border-color);
  color: var(--text-primary);
}

.btn-gray {
  background-color: transparent;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn-cancel {
  padding: 0.875rem 1.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel:hover {
  color: var(--primary-color);
}

.btn-save {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-save:disabled {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 游客提示 */
.guest-notice {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.guest-notice p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

/* 颜色选择器 */
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

/* 管理员状态 - 固定在右上角 */
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

/* 登录弹窗 */
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

/* Toast 提示 */
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

/* 响应式 */
@media (max-width: 768px) {
  .memo-form-page {
    padding: 1.5rem;
    margin: 0 -1rem;
    border-radius: 0;
  }
  
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 1rem;
  }
  
  .btn-cancel,
  .btn-save {
    width: 100%;
    justify-content: center;
  }
  
  .date-picker-group {
    flex-wrap: wrap;
  }
  
  .memo-date-large {
    flex: 1;
    min-width: 140px;
  }
}
</style>

<script>
// 管理员密码
const ADMIN_PASSWORD = 'admin123';
let isAdmin = false;

// 分类配置
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

// 初始化分类选择器
function initCategorySelect() {
  const select = document.getElementById('memo-category');
  select.innerHTML = Object.entries(categories).map(([key, cat]) => 
    `<option value="${key}">${cat.name}</option>`
  ).join('');
}

// 检查登录状态
function checkLoginStatus() {
  const saved = localStorage.getItem('memo_admin');
  if (saved === 'true') {
    isAdmin = true;
    document.getElementById('login-text').textContent = '管理员模式';
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'inline-block';
    document.getElementById('memo-form-section').style.display = 'block';
    document.getElementById('guest-notice').style.display = 'none';
  } else {
    isAdmin = false;
    document.getElementById('login-text').textContent = '访客模式';
    document.getElementById('login-btn').style.display = 'inline-block';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('memo-form-section').style.display = 'none';
    document.getElementById('guest-notice').style.display = 'block';
  }
}

// 显示登录弹窗
function showLoginModal() {
  document.getElementById('login-modal').style.display = 'flex';
  document.getElementById('admin-password').value = '';
  setTimeout(() => document.getElementById('admin-password').focus(), 100);
}

// 隐藏登录弹窗
function hideLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
}

// 登录
function login() {
  const password = document.getElementById('admin-password').value;
  if (password === ADMIN_PASSWORD) {
    isAdmin = true;
    localStorage.setItem('memo_admin', 'true');
    hideLoginModal();
    checkLoginStatus();
    showToast('登录成功！', 'success');
  } else {
    showToast('密码错误', 'error');
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-password').focus();
  }
}

// 退出登录
function logout() {
  isAdmin = false;
  localStorage.removeItem('memo_admin');
  checkLoginStatus();
  showToast('已退出登录', 'success');
}

// 保存备忘录
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
  
  // 从 localStorage 获取现有备忘录
  let memos = JSON.parse(localStorage.getItem('memos_data') || '[]');
  
  const memo = {
    id: 'memo-' + Date.now(),
    text: content,
    category: category,
    completed: false,
    createdAt: new Date().toISOString(),
    deadline: date || null
  };
  
  memos.unshift(memo);
  localStorage.setItem('memos_data', JSON.stringify(memos));
  
  showToast('备忘录添加成功！', 'success');
  
  // 清空表单
  document.getElementById('memo-content').value = '';
  document.getElementById('memo-date').value = '';
  
  // 延迟返回列表页
  setTimeout(() => {
    window.location.href = '/memo';
  }, 1000);
}

// 设为今天日期
function setTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById('memo-date').value = `${yyyy}-${mm}-${dd}`;
}

// 清除日期
function clearDate() {
  document.getElementById('memo-date').value = '';
}

// 显示添加标签弹窗
let selectedColor = '#f59e0b';
function showAddCategory() {
  if (!isAdmin) {
    showToast('请先登录管理员账号', 'warning');
    return;
  }
  document.getElementById('category-modal').style.display = 'flex';
  document.getElementById('new-category-name').value = '';
  // 重置颜色选择
  document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelector('.color-btn[data-color="#f59e0b"]').classList.add('selected');
  selectedColor = '#f59e0b';
  setTimeout(() => document.getElementById('new-category-name').focus(), 100);
}

// 隐藏添加标签弹窗
function hideCategoryModal() {
  document.getElementById('category-modal').style.display = 'none';
}

// 选择颜色
function selectColor(color) {
  selectedColor = color;
  document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.color-btn[data-color="${color}"]`).classList.add('selected');
}

// 添加新标签
function addNewCategory() {
  const name = document.getElementById('new-category-name').value.trim();
  if (!name) {
    showToast('请输入标签名称', 'warning');
    return;
  }
  
  const key = 'cat-' + Date.now();
  categories[key] = { name, color: selectedColor };
  saveCategories();
  
  // 刷新选择器
  initCategorySelect();
  document.getElementById('memo-category').value = key;
  
  hideCategoryModal();
  showToast('标签添加成功！', 'success');
}

// Toast 提示
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// 回车登录
document.addEventListener('DOMContentLoaded', function() {
  loadCategories();
  initCategorySelect();
  checkLoginStatus();
  
  // 设置默认日期为今天
  setTodayDate();
  
  document.getElementById('admin-password')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
  });
  
  document.getElementById('new-category-name')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addNewCategory();
  });
  
  // Ctrl+Enter 保存
  document.getElementById('memo-content')?.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      saveMemo();
    }
  });
});

// 点击弹窗外部关闭
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('login-modal')) {
    e.target.style.display = 'none';
  }
});
</script>
