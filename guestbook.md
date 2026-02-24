---
layout: page
title: 留言板
---

<div class="guestbook-container">
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
    <!-- 示例留言 -->
    <div class="guestbook-item">
      <div class="guestbook-avatar">
        <span>访</span>
      </div>
      <div class="guestbook-content">
        <div class="guestbook-header">
          <span class="guestbook-name">访客</span>
          <span class="guestbook-time">2024-01-01</span>
        </div>
        <p class="guestbook-text">欢迎来到我的博客！期待与你交流。</p>
      </div>
    </div>
  </div>
</div>

<script>
// 加载留言
function loadGuestbookMessages() {
  const messages = JSON.parse(localStorage.getItem('guestbook_messages') || '[]');
  const list = document.getElementById('guestbook-list');
  
  if (messages.length > 0) {
    list.innerHTML = messages.map(msg => `
      <div class="guestbook-item">
        <div class="guestbook-avatar">
          <span>${msg.name.charAt(0)}</span>
        </div>
        <div class="guestbook-content">
          <div class="guestbook-header">
            <span class="guestbook-name">${escapeHtml(msg.name)}</span>
            <span class="guestbook-time">${msg.time}</span>
          </div>
          <p class="guestbook-text">${escapeHtml(msg.text)}</p>
        </div>
      </div>
    `).join('');
  }
}

// 添加留言
function addGuestbookMessage() {
  const nameInput = document.getElementById('guestbook-name');
  const messageInput = document.getElementById('guestbook-message');
  const name = nameInput.value.trim() || '访客';
  const text = messageInput.value.trim();
  
  if (!text) {
    alert('请输入留言内容');
    return;
  }
  
  const messages = JSON.parse(localStorage.getItem('guestbook_messages') || '[]');
  const now = new Date();
  const time = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  
  messages.unshift({ name, text, time });
  localStorage.setItem('guestbook_messages', JSON.stringify(messages));
  
  // 清空输入
  nameInput.value = '';
  messageInput.value = '';
  
  // 重新加载
  loadGuestbookMessages();
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 初始化
loadGuestbookMessages();
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
}

@media (max-width: 640px) {
  .guestbook-form {
    padding: 1rem;
  }
  
  .guestbook-item {
    padding: 1rem;
  }
  
  .guestbook-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
