---
layout: page
title: 备忘录
---

{% assign memos = site.data.memos | default: empty %}
{% assign total = memos | size %}
{% assign completed = memos | where: "completed", true | size %}
{% assign pending = total | minus: completed %}

<div class="memo-container">
  <p class="memo-intro">记录待办事项、学习计划和重要提醒。数据通过仓库管理。</p>
  
  <!-- 工具栏 -->
  <div class="memo-toolbar">
    <div class="memo-search">
      <input type="text" id="memo-search" placeholder="搜索备忘录..." class="search-input" oninput="filterMemos()">
    </div>
    <div class="memo-filters">
      <select id="category-filter" class="filter-select" onchange="filterMemos()">
        <option value="all">全部分类</option>
        <option value="todo">待办</option>
        <option value="learning">学习</option>
        <option value="idea">想法</option>
        <option value="reminder">提醒</option>
        <option value="work">工作</option>
        <option value="life">生活</option>
      </select>
      <select id="status-filter" class="filter-select" onchange="filterMemos()">
        <option value="all">全部状态</option>
        <option value="pending">待完成</option>
        <option value="completed">已完成</option>
      </select>
      <select id="priority-filter" class="filter-select" onchange="filterMemos()">
        <option value="all">全部优先级</option>
        <option value="high">高优先级</option>
        <option value="medium">中优先级</option>
        <option value="low">低优先级</option>
      </select>
      <select id="sort-by" class="filter-select" onchange="filterMemos()">
        <option value="priority">按优先级</option>
        <option value="deadline">按截止日期</option>
        <option value="category">按分类</option>
      </select>
    </div>
  </div>
  
  <!-- 备忘录列表 -->
  <div class="memo-list" id="memo-list">
    {% if memos.size == 0 %}
      <div class="empty-state">
        <svg viewBox="0 0 24 24" width="64" height="64">
          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <p>暂无备忘录</p>
        <p class="empty-hint">编辑 _data/memos.yml 文件添加备忘录</p>
      </div>
    {% else %}
      {% for memo in memos %}
        <div class="memo-item {% if memo.completed %}completed{% endif %} {% if memo.deadline and memo.completed == false %}{% assign deadline_date = memo.deadline | date: '%s' %}{% assign now_date = 'now' | date: '%s' %}{% if deadline_date < now_date %}overdue{% endif %}{% endif %}" 
             data-category="{{ memo.category }}" 
             data-status="{% if memo.completed %}completed{% else %}pending{% endif %}"
             data-priority="{{ memo.priority | default: 'medium' }}"
             data-deadline="{{ memo.deadline }}"
             data-text="{{ memo.text | downcase }}">
          
          <div class="memo-priority priority-{{ memo.priority | default: 'medium' }}">
            {% case memo.priority %}
              {% when 'high' %}!
              {% when 'medium' %}!!
              {% when 'low' %}!!!
              {% else %}!!
            {% endcase %}
          </div>
          
          <div class="memo-content">
            <div class="memo-text">{{ memo.text }}</div>
            <div class="memo-meta">
              {% assign cat_names = "todo:待办,learning:学习,idea:想法,reminder:提醒,work:工作,life:生活" | split: "," %}
              {% for cat in cat_names %}
                {% assign cat_pair = cat | split: ":" %}
                {% if cat_pair[0] == memo.category %}
                  <span class="memo-tag tag-{{ memo.category }}">{{ cat_pair[1] }}</span>
                {% endif %}
              {% endfor %}
              
              {% if memo.deadline %}
                {% assign deadline_date = memo.deadline | date: '%s' %}
                {% assign now_date = 'now' | date: '%s' %}
                <span class="memo-deadline {% if deadline_date < now_date and memo.completed == false %}overdue{% endif %}">
                  📅 {{ memo.deadline }}
                </span>
              {% endif %}
              
              {% if memo.completed %}
                <span class="memo-status status-completed">✓ 已完成</span>
              {% else %}
                <span class="memo-status status-pending">○ 待完成</span>
              {% endif %}
            </div>
          </div>
        </div>
      {% endfor %}
    {% endif %}
  </div>
  
  <!-- 统计 -->
  <div class="memo-stats">
    <div class="stat-item">
      <span class="stat-number">{{ total }}</span>
      <span class="stat-label">总计</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">{{ completed }}</span>
      <span class="stat-label">已完成</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">{{ pending }}</span>
      <span class="stat-label">待完成</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">{{ memos | where: "priority", "high" | size }}</span>
      <span class="stat-label">高优先级</span>
    </div>
  </div>
  
  <!-- 编辑提示 -->
  <div class="edit-hint">
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
    <p>编辑 <code>_data/memos.yml</code> 文件来管理备忘录，提交后自动更新</p>
  </div>
</div>

<script>
function filterMemos() {
  const searchText = document.getElementById('memo-search').value.toLowerCase();
  const categoryFilter = document.getElementById('category-filter').value;
  const statusFilter = document.getElementById('status-filter').value;
  const priorityFilter = document.getElementById('priority-filter').value;
  const sortBy = document.getElementById('sort-by').value;
  
  const items = document.querySelectorAll('.memo-item');
  let visibleItems = [];
  
  items.forEach(item => {
    const text = item.getAttribute('data-text');
    const category = item.getAttribute('data-category');
    const status = item.getAttribute('data-status');
    const priority = item.getAttribute('data-priority');
    
    const matchSearch = text.includes(searchText);
    const matchCategory = categoryFilter === 'all' || category === categoryFilter;
    const matchStatus = statusFilter === 'all' || status === statusFilter;
    const matchPriority = priorityFilter === 'all' || priority === priorityFilter;
    
    if (matchSearch && matchCategory && matchStatus && matchPriority) {
      item.style.display = 'flex';
      visibleItems.push(item);
    } else {
      item.style.display = 'none';
    }
  });
  
  // 排序
  const list = document.getElementById('memo-list');
  visibleItems.sort((a, b) => {
    switch(sortBy) {
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.getAttribute('data-priority')] - priorityOrder[b.getAttribute('data-priority')];
      case 'deadline':
        const deadlineA = a.getAttribute('data-deadline') || '9999-12-31';
        const deadlineB = b.getAttribute('data-deadline') || '9999-12-31';
        return deadlineA.localeCompare(deadlineB);
      case 'category':
        return a.getAttribute('data-category').localeCompare(b.getAttribute('data-category'));
      default:
        return 0;
    }
  });
  
  visibleItems.forEach(item => list.appendChild(item));
  
  // 显示/隐藏空状态
  const emptyState = document.querySelector('.empty-state');
  if (emptyState) {
    emptyState.style.display = visibleItems.length === 0 && items.length > 0 ? 'block' : 'none';
  }
}
</script>

<style>
.memo-container {
  max-width: 900px;
  margin: 0 auto;
}

.memo-intro {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

/* 工具栏 */
.memo-toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.memo-search {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.memo-filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* 列表 */
.memo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
  background-color: var(--bg-primary);
  border-radius: 16px;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-hint {
  font-size: 0.85rem;
  margin-top: 0.5rem;
  color: var(--text-secondary);
}

.memo-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
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
  opacity: 0.8;
}

.memo-item.overdue {
  border-left-color: #ef4444;
  background-color: rgba(239, 68, 68, 0.05);
}

/* 优先级 */
.memo-priority {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.priority-high {
  background-color: #fee2e2;
  color: #dc2626;
}

.priority-medium {
  background-color: #fef3c7;
  color: #d97706;
}

.priority-low {
  background-color: #dbeafe;
  color: #2563eb;
}

[data-theme="dark"] .priority-high {
  background-color: rgba(220, 38, 38, 0.2);
}

[data-theme="dark"] .priority-medium {
  background-color: rgba(217, 119, 6, 0.2);
}

[data-theme="dark"] .priority-low {
  background-color: rgba(37, 99, 235, 0.2);
}

.memo-content {
  flex: 1;
  min-width: 0;
}

.memo-text {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  line-height: 1.5;
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
  padding: 0.35rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.tag-todo { background-color: #fef3c7; color: #92400e; }
.tag-learning { background-color: #dbeafe; color: #1e40af; }
.tag-idea { background-color: #d1fae5; color: #065f46; }
.tag-reminder { background-color: #fce7f3; color: #9d174d; }
.tag-work { background-color: #ede9fe; color: #5b21b6; }
.tag-life { background-color: #cffafe; color: #155e75; }

[data-theme="dark"] .tag-todo { background-color: rgba(251, 191, 36, 0.2); }
[data-theme="dark"] .tag-learning { background-color: rgba(59, 130, 246, 0.2); }
[data-theme="dark"] .tag-idea { background-color: rgba(16, 185, 129, 0.2); }
[data-theme="dark"] .tag-reminder { background-color: rgba(236, 72, 153, 0.2); }
[data-theme="dark"] .tag-work { background-color: rgba(139, 92, 246, 0.2); }
[data-theme="dark"] .tag-life { background-color: rgba(6, 182, 212, 0.2); }

.memo-deadline {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.memo-deadline.overdue {
  color: #ef4444;
  font-weight: 600;
}

.memo-status {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.status-completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

[data-theme="dark"] .status-completed {
  background-color: rgba(16, 185, 129, 0.2);
}

[data-theme="dark"] .status-pending {
  background-color: rgba(251, 191, 36, 0.2);
}

/* 统计 */
.memo-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  border-radius: 16px;
  margin-bottom: 2rem;
  color: white;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
}

/* 编辑提示 */
.edit-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background-color: var(--bg-primary);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.edit-hint code {
  background-color: var(--bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-family: monospace;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .memo-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .memo-filters {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-select {
    width: 100%;
    min-width: auto;
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
  
  .edit-hint {
    flex-direction: column;
    text-align: center;
  }
}
</style>
