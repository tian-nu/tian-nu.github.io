---
layout: page
title: 备忘录
---

<div class="memo-container">
  <p class="memo-intro">记录待办事项、学习计划和重要提醒。</p>
  
  <!-- 快速添加 -->
  <div class="memo-add">
    <input type="text" id="memo-input" placeholder="添加新事项..." class="memo-input">
    <select id="memo-category" class="memo-select">
      <option value="todo">待办</option>
      <option value="learning">学习</option>
      <option value="idea">想法</option>
      <option value="reminder">提醒</option>
    </select>
    <button onclick="addMemo()" class="memo-btn">添加</button>
  </div>
  
  <!-- 分类标签 -->
  <div class="memo-tabs">
    <button class="memo-tab active" onclick="filterMemo('all')">全部</button>
    <button class="memo-tab" onclick="filterMemo('todo')">待办</button>
    <button class="memo-tab" onclick="filterMemo('learning')">学习</button>
    <button class="memo-tab" onclick="filterMemo('idea')">想法</button>
    <button class="memo-tab" onclick="filterMemo('reminder')">提醒</button>
  </div>
  
  <!-- 备忘录列表 -->
  <div class="memo-list" id="memo-list">
    <!-- 示例数据 -->
    <div class="memo-item" data-category="todo">
      <div class="memo-checkbox">
        <input type="checkbox" id="memo-1" onchange="toggleMemo(this)">
        <label for="memo-1"></label>
      </div>
      <div class="memo-text">完善博客的响应式设计</div>
      <div class="memo-tag todo">待办</div>
      <button class="memo-delete" onclick="deleteMemo(this)">×</button>
    </div>
    
    <div class="memo-item" data-category="learning">
      <div class="memo-checkbox">
        <input type="checkbox" id="memo-2" onchange="toggleMemo(this)">
        <label for="memo-2"></label>
      </div>
      <div class="memo-text">学习 Jekyll 高级用法</div>
      <div class="memo-tag learning">学习</div>
      <button class="memo-delete" onclick="deleteMemo(this)">×</button>
    </div>
    
    <div class="memo-item" data-category="idea">
      <div class="memo-checkbox">
        <input type="checkbox" id="memo-3" onchange="toggleMemo(this)">
        <label for="memo-3"></label>
      </div>
      <div class="memo-text">添加一个照片墙页面</div>
      <div class="memo-tag idea">想法</div>
      <button class="memo-delete" onclick="deleteMemo(this)">×</button>
    </div>
    
    <div class="memo-item completed" data-category="reminder">
      <div class="memo-checkbox">
        <input type="checkbox" id="memo-4" checked onchange="toggleMemo(this)">
        <label for="memo-4"></label>
      </div>
      <div class="memo-text">购买域名</div>
      <div class="memo-tag reminder">提醒</div>
      <button class="memo-delete" onclick="deleteMemo(this)">×</button>
    </div>
  </div>
  
  <!-- 统计 -->
  <div class="memo-stats">
    <span>总计: <strong id="total-count">4</strong></span>
    <span>已完成: <strong id="completed-count">1</strong></span>
    <span>待完成: <strong id="pending-count">3</strong></span>
  </div>
</div>

<script>
// 添加备忘录
function addMemo() {
  const input = document.getElementById('memo-input');
  const category = document.getElementById('memo-category');
  const text = input.value.trim();
  
  if (!text) return;
  
  const list = document.getElementById('memo-list');
  const id = 'memo-' + Date.now();
  
  const item = document.createElement('div');
  item.className = 'memo-item';
  item.setAttribute('data-category', category.value);
  item.innerHTML = `
    <div class="memo-checkbox">
      <input type="checkbox" id="${id}" onchange="toggleMemo(this)">
      <label for="${id}"></label>
    </div>
    <div class="memo-text">${escapeHtml(text)}</div>
    <div class="memo-tag ${category.value}">${category.options[category.selectedIndex].text}</div>
    <button class="memo-delete" onclick="deleteMemo(this)">×</button>
  `;
  
  list.insertBefore(item, list.firstChild);
  input.value = '';
  updateStats();
  saveMemos();
}

// 切换完成状态
function toggleMemo(checkbox) {
  const item = checkbox.closest('.memo-item');
  item.classList.toggle('completed', checkbox.checked);
  updateStats();
  saveMemos();
}

// 删除备忘录
function deleteMemo(btn) {
  const item = btn.closest('.memo-item');
  item.style.opacity = '0';
  item.style.transform = 'translateX(100px)';
  setTimeout(() => {
    item.remove();
    updateStats();
    saveMemos();
  }, 300);
}

// 筛选备忘录
function filterMemo(category) {
  const items = document.querySelectorAll('.memo-item');
  const tabs = document.querySelectorAll('.memo-tab');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
  
  items.forEach(item => {
    if (category === 'all' || item.getAttribute('data-category') === category) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// 更新统计
function updateStats() {
  const items = document.querySelectorAll('.memo-item');
  const completed = document.querySelectorAll('.memo-item.completed');
  
  document.getElementById('total-count').textContent = items.length;
  document.getElementById('completed-count').textContent = completed.length;
  document.getElementById('pending-count').textContent = items.length - completed.length;
}

// 保存到本地存储
function saveMemos() {
  const items = document.querySelectorAll('.memo-item');
  const memos = [];
  
  items.forEach(item => {
    memos.push({
      text: item.querySelector('.memo-text').textContent,
      category: item.getAttribute('data-category'),
      completed: item.classList.contains('completed')
    });
  });
  
  localStorage.setItem('memos', JSON.stringify(memos));
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 回车添加
document.getElementById('memo-input')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') addMemo();
});

// 初始化
updateStats();
</script>

<style>
.memo-container {
  max-width: 800px;
  margin: 0 auto;
}

.memo-intro {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

/* 添加区域 */
.memo-add {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.memo-input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.memo-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.memo-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
}

.memo-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.memo-btn:hover {
  background-color: var(--primary-hover);
}

/* 分类标签 */
.memo-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.memo-tab {
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

/* 列表 */
.memo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.memo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-primary);
  border-radius: 10px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.memo-item:hover {
  box-shadow: var(--shadow-md);
}

.memo-item.completed .memo-text {
  text-decoration: line-through;
  color: var(--text-muted);
}

/* 复选框 */
.memo-checkbox {
  position: relative;
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

.memo-text {
  flex: 1;
  font-size: 1rem;
  color: var(--text-primary);
}

/* 标签 */
.memo-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.memo-tag.todo {
  background-color: #fef3c7;
  color: #92400e;
}

.memo-tag.learning {
  background-color: #dbeafe;
  color: #1e40af;
}

.memo-tag.idea {
  background-color: #d1fae5;
  color: #065f46;
}

.memo-tag.reminder {
  background-color: #fce7f3;
  color: #9d174d;
}

[data-theme="dark"] .memo-tag.todo {
  background-color: rgba(251, 191, 36, 0.2);
}

[data-theme="dark"] .memo-tag.learning {
  background-color: rgba(59, 130, 246, 0.2);
}

[data-theme="dark"] .memo-tag.idea {
  background-color: rgba(16, 185, 129, 0.2);
}

[data-theme="dark"] .memo-tag.reminder {
  background-color: rgba(236, 72, 153, 0.2);
}

/* 删除按钮 */
.memo-delete {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.memo-delete:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

/* 统计 */
.memo-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: 10px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.memo-stats strong {
  color: var(--text-primary);
  font-size: 1.125rem;
}

@media (max-width: 640px) {
  .memo-add {
    flex-direction: column;
  }
  
  .memo-input,
  .memo-select,
  .memo-btn {
    width: 100%;
  }
  
  .memo-stats {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
