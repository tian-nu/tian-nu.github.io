---
layout: page
title: 备忘录
---

<link rel="stylesheet" href="{{ '/assets/css/memo.css' | relative_url }}">

<!-- Admin Status -->
<div id="admin-status" class="admin-status">
  <span id="login-text">访客模式</span>
  <button id="login-btn" onclick="showLoginModal()" class="admin-btn">登录</button>
  <button id="logout-btn" onclick="logout()" class="admin-btn" style="display: none;">退出</button>
</div>

<div class="memo-page">
  <div class="memo-container">
    <p class="memo-intro">记录待办事项、学习计划和重要提醒。</p>
    
    <!-- Toolbar -->
    <div class="memo-toolbar">
      <div class="memo-search">
        <input type="text" id="memo-search" placeholder="搜索备忘录..." class="form-input" oninput="renderMemos()">
      </div>
      <div class="memo-toolbar-right">
        <select id="memo-sort" class="sort-select" onchange="renderMemos()">
          <option value="newest">最新添加</option>
          <option value="oldest">最早添加</option>
          <option value="deadline">截止日期</option>
        </select>
        <button id="memo-add-btn" class="memo-add-btn" style="display: none;" onclick="showCreateModal()">+ 新建</button>
      </div>
    </div>
    
    <!-- Tabs -->
    <div class="memo-tabs" id="memo-tabs">
      <button class="memo-tab active" onclick="filterMemo('all')">全部 <span class="tab-count" id="count-all">0</span></button>
    </div>
    
    <!-- List -->
    <div class="memo-list" id="memo-list">
      <div class="empty-state"><p>加载中...</p></div>
    </div>
    
    <!-- Stats -->
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
    
    <!-- Actions -->
    <div class="memo-actions" id="memo-actions-section" style="display: none;">
      <!-- Export/Clear buttons can be re-implemented if needed, omitted for cleaner UI initially -->
    </div>
  </div>
</div>

<!-- Modals -->

<!-- Login Modal -->
<div id="login-modal" class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="modal-title">管理员登录</h3>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <input type="password" id="admin-password" placeholder="请输入密码" class="form-input">
        <p class="login-hint" style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted); text-align: center;">默认密码: admin123</p>
      </div>
    </div>
    <div class="modal-footer">
      <button onclick="hideLoginModal()" class="btn btn-secondary">取消</button>
      <button onclick="login()" class="btn btn-primary">登录</button>
    </div>
  </div>
</div>

<!-- Create Modal -->
<div id="create-modal" class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="modal-title">新建备忘录</h3>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">内容</label>
        <textarea id="create-text" placeholder="备忘录内容..." class="form-textarea" rows="4"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">标签</label>
        <select id="create-category" class="form-select"></select>
      </div>
      <div class="form-group">
        <label class="form-label">开始日期</label>
        <div style="display: flex; gap: 0.5rem;">
          <input type="date" id="create-start-date" class="form-input">
          <button onclick="setTodayStartDateCreate()" class="btn-small">今天</button>
          <button onclick="clearCreateStartDate()" class="btn-small">清除</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">截止日期</label>
        <div style="display: flex; gap: 0.5rem;">
          <input type="date" id="create-date" class="form-input">
          <button onclick="setTodayDateCreate()" class="btn-small">今天</button>
          <button onclick="clearCreateDate()" class="btn-small">清除</button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button onclick="hideCreateModal()" class="btn btn-secondary">取消</button>
      <button onclick="saveNewMemo()" class="btn btn-primary">保存</button>
    </div>
  </div>
</div>

<!-- Edit Modal -->
<div id="edit-modal" class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="modal-title">编辑备忘录</h3>
    </div>
    <div class="modal-body">
      <input type="hidden" id="edit-id">
      <div class="form-group">
        <label class="form-label">内容</label>
        <textarea id="edit-text" placeholder="备忘录内容..." class="form-textarea" rows="4"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">标签</label>
        <select id="edit-category" class="form-select"></select>
      </div>
      <div class="form-group">
        <label class="form-label">开始日期</label>
        <div style="display: flex; gap: 0.5rem;">
          <input type="date" id="edit-start-date" class="form-input">
          <button onclick="setTodayStartDate()" class="btn-small">今天</button>
          <button onclick="clearEditStartDate()" class="btn-small">清除</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">截止日期</label>
        <div style="display: flex; gap: 0.5rem;">
          <input type="date" id="edit-date" class="form-input">
          <button onclick="setTodayDate()" class="btn-small">今天</button>
          <button onclick="clearEditDate()" class="btn-small">清除</button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button onclick="hideEditModal()" class="btn btn-secondary">取消</button>
      <button onclick="saveEditMemo()" class="btn btn-primary">保存</button>
    </div>
  </div>
</div>

<script src="{{ '/assets/js/memo.js' | relative_url }}"></script>
