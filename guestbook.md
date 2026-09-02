---
layout: page
title: 留言板
---

<!-- 自定义提示 -->
<div id="toast" class="toast"></div>

<!-- 右上角管理员状态 -->
<div id="admin-status" class="admin-status">
  <span id="login-text">访客模式 - 仅可查看</span>
  <button id="login-btn" onclick="showLoginModal()" class="admin-btn">管理员登录</button>
  <button id="logout-btn" onclick="logout()" class="admin-btn" style="display: none;">退出登录</button>
</div>

<div class="guestbook-container">
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
  
  <!-- 删除确认弹窗 -->
  <div id="delete-modal" class="login-modal" style="display: none;">
    <div class="login-content" style="max-width: 350px;">
      <h3>确认删除</h3>
      <p style="text-align: center; color: var(--text-secondary); margin-bottom: 1.5rem;">确定要删除这条留言吗？</p>
      <div class="login-actions">
        <button onclick="confirmDelete()" class="login-submit" style="background: linear-gradient(135deg, #ef4444, #dc2626);">删除</button>
        <button onclick="hideDeleteModal()" class="login-cancel">取消</button>
      </div>
    </div>
  </div>
  
  <!-- 回复弹窗 -->
  <div id="reply-modal" class="login-modal" style="display: none;">
    <div class="login-content">
      <h3>回复留言</h3>
      <input type="hidden" id="reply-index">
      <div class="form-group">
        <label id="reply-label" style="font-size: 0.9rem; color: var(--text-secondary);">回复访客：</label>
        <textarea id="reply-text" class="form-textarea" rows="4" placeholder="输入你的回复..."></textarea>
      </div>
      <div class="login-actions">
        <button onclick="saveReply()" class="login-submit">保存</button>
        <button onclick="hideReplyModal()" class="login-cancel">取消</button>
      </div>
    </div>
  </div>
  
  <div class="guestbook-intro">
    <h2>欢迎留下你的足迹</h2>
    <p>有任何想法、建议或想聊的话题，都可以在这里留言。</p>
  </div>
  
  <!-- 留言表单 -->
  <div class="guestbook-form">
    <h3>写留言</h3>
    <div class="form-group">
      <input type="text" id="guestbook-name" placeholder="你的昵称" class="form-input">
    </div>
    <div class="form-group">
      <textarea id="guestbook-message" placeholder="写下你想说的话..." class="form-textarea" rows="4"></textarea>
    </div>
    <button onclick="addGuestbookMessage()" class="form-submit">发表留言</button>
  </div>
  
  <!-- 留言列表 -->
  <div class="guestbook-list" id="guestbook-list">
    <div class="empty-state">
      <p>加载中...</p>
    </div>
  </div>
</div>

<script>
let isAdmin = false;
const ADMIN_PASSWORD = 'admin123';
let deleteTargetIndex = null;
let replyTargetIndex = null;

// 检查登录状态
function checkLoginStatus() {
  const loginTime = localStorage.getItem('guestbook_admin_login_time');
  if (loginTime) {
    const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
    if (hoursSinceLogin < 24) {
      isAdmin = true;
    } else {
      localStorage.removeItem('guestbook_admin_login_time');
    }
  }
  updateAdminUI();
}

// 更新管理员界面
function updateAdminUI() {
  const loginText = document.getElementById('login-text');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (isAdmin) {
    loginText.textContent = '管理员模式 - 可编辑';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  } else {
    loginText.textContent = '访客模式 - 仅可查看';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }
  
  loadGuestbookMessages();
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
    localStorage.setItem('guestbook_admin_login_time', Date.now().toString());
    hideLoginModal();
    updateAdminUI();
    showToast('登录成功！', 'success');
  } else {
    showToast('密码错误！', 'error');
  }
}

// 退出登录
function logout() {
  isAdmin = false;
  localStorage.removeItem('guestbook_admin_login_time');
  updateAdminUI();
}

// 显示提示
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// 加载留言
function loadGuestbookMessages() {
  const messages = JSON.parse(localStorage.getItem('guestbook_messages') || '[]');
  const list = document.getElementById('guestbook-list');
  
  if (messages.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <p>暂无留言，来发表第一条吧！</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = messages.map((msg, index) => `
    <div class="guestbook-item" data-index="${index}">
      <div class="guestbook-avatar">
        <span>${msg.name.charAt(0)}</span>
      </div>
      <div class="guestbook-content">
        <div class="guestbook-header">
          <span class="guestbook-name">${escapeHtml(msg.name)}</span>
          <span class="guestbook-time">${msg.time}</span>
        </div>
        <p class="guestbook-text">${escapeHtml(msg.text)}</p>
        ${msg.reply ? `<div class="guestbook-reply"><strong>博主回复：</strong>${escapeHtml(msg.reply)}</div>` : ''}
      </div>
      ${isAdmin ? `
        <div class="guestbook-actions">
          <button onclick="replyMessage(${index})" class="action-btn reply" title="回复">↩</button>
          <button onclick="deleteMessage(${index})" class="action-btn delete" title="删除">×</button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// 添加留言
function addGuestbookMessage() {
  const nameInput = document.getElementById('guestbook-name');
  const messageInput = document.getElementById('guestbook-message');
  const name = nameInput.value.trim() || '访客';
  const text = messageInput.value.trim();
  
  if (!text) {
    showToast('请输入留言内容', 'warning');
    messageInput.focus();
    return;
  }
  
  const messages = JSON.parse(localStorage.getItem('guestbook_messages') || '[]');
  const now = new Date();
  const time = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  
  messages.unshift({ name, text, time, reply: '' });
  localStorage.setItem('guestbook_messages', JSON.stringify(messages));
  
  nameInput.value = '';
  messageInput.value = '';
  
  showToast('留言发表成功！', 'success');
  
  loadGuestbookMessages();
}

// 删除留言 - 显示确认弹窗
function deleteMessage(index) {
  if (!isAdmin) {
    showToast('请先登录管理员账号', 'warning');
    return;
  }
  
  deleteTargetIndex = index;
  document.getElementById('delete-modal').style.display = 'flex';
}

// 隐藏删除确认弹窗
function hideDeleteModal() {
  deleteTargetIndex = null;
  document.getElementById('delete-modal').style.display = 'none';
}

// 确认删除
function confirmDelete() {
  if (deleteTargetIndex === null) return;
  
  const messages = JSON.parse(localStorage.getItem('guestbook_messages') || '[]');
  messages.splice(deleteTargetIndex, 1);
  localStorage.setItem('guestbook_messages', JSON.stringify(messages));
  
  showToast('留言已删除', 'success');
  hideDeleteModal();
  loadGuestbookMessages();
}

// 回复留言 - 显示回复弹窗
function replyMessage(index) {
  if (!isAdmin) {
    showToast('请先登录管理员账号', 'warning');
    return;
  }
  
  const messages = JSON.parse(localStorage.getItem('guestbook_messages') || '[]');
  const msg = messages[index];
  
  replyTargetIndex = index;
  document.getElementById('reply-label').textContent = '回复 ' + msg.name + '：';
  document.getElementById('reply-text').value = msg.reply || '';
  
  document.getElementById('reply-modal').style.display = 'flex';
  document.getElementById('reply-text').focus();
}

// 隐藏回复弹窗
function hideReplyModal() {
  replyTargetIndex = null;
  document.getElementById('reply-modal').style.display = 'none';
}

// 保存回复
function saveReply() {
  if (replyTargetIndex === null) return;
  
  const messages = JSON.parse(localStorage.getItem('guestbook_messages') || '[]');
  const reply = document.getElementById('reply-text').value.trim();
  
  messages[replyTargetIndex].reply = reply;
  localStorage.setItem('guestbook_messages', JSON.stringify(messages));
  
  showToast(reply ? '回复成功！' : '回复已删除', 'success');
  hideReplyModal();
  loadGuestbookMessages();
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  checkLoginStatus();
  loadGuestbookMessages();
  
  document.getElementById('guestbook-message')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addGuestbookMessage();
    }
  });
  
  document.getElementById('admin-password')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
  });
  
  document.getElementById('reply-text')?.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      saveReply();
    }
  });
  
  document.querySelector('.page-container')?.classList.add('guestbook-page');
  
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('login-modal')) {
      e.target.style.display = 'none';
    }
  });
});
</script>

<style>
.guestbook-container {
  max-width: 800px;
  margin: 0 auto;
}

.guestbook-intro {
  text-align: center;
  margin-bottom: 2rem;
}

.guestbook-intro h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.guestbook-intro p {
  color: var(--text-secondary);
}

/* 留言表单 */
.guestbook-form {
  background-color: var(--bg-primary);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.guestbook-form h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-submit {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.form-submit:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 留言列表 */
.guestbook-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.guestbook-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background-color: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s;
}

.guestbook-item:hover {
  transform: translateX(4px);
}

.guestbook-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.guestbook-content {
  flex: 1;
  min-width: 0;
}

.guestbook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.guestbook-name {
  font-weight: 600;
  color: var(--text-primary);
}

.guestbook-time {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.guestbook-text {
  color: var(--text-secondary);
  line-height: 1.6;
  word-break: break-word;
}

/* 博主回复 */
.guestbook-reply {
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: var(--primary-light);
  border-radius: 8px;
  border-left: 3px solid var(--primary-color);
  font-size: 0.95rem;
  color: var(--text-primary);
}

.guestbook-reply strong {
  color: var(--primary-color);
}

/* 管理员操作按钮 */
.guestbook-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.reply {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.action-btn.reply:hover {
  background-color: var(--primary-color);
  color: white;
}

.action-btn.delete {
  background-color: #fee2e2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background-color: #dc2626;
  color: white;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

/* Toast 提示 */
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
  box-sizing: border-box;
}

.login-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.login-actions {
  display: flex;
  gap: 1rem;
}

.login-submit,
.login-cancel {
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
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* 留言板页面标题优化 */
.guestbook-page .page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
  text-align: left;
}

.guestbook-page .page-container {
  padding-top: 1rem;
}

@media (max-width: 640px) {
  .guestbook-form {
    padding: 1rem;
  }
  
  .guestbook-item {
    padding: 1rem;
    flex-wrap: wrap;
  }
  
  .guestbook-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .guestbook-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
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
  
  .login-actions {
    flex-direction: column;
  }
}
</style>
