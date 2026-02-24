---
layout: page
title: 备忘录
---

<div class="memo-container">
  <p class="memo-intro">记录待办事项、学习计划和重要提醒。</p>
  
  <!-- 管理员登录状态 -->
  <div id="admin-status" class="admin-status">
    <span id="login-text">访客模式 - 仅可查看</span>
    <button id="login-btn" onclick="showLoginModal()" class="admin-btn">管理员登录</button>
    <button id="logout-btn" onclick="logout()" class="admin-btn" style="display: none;">退出登录</button>
  </div>
  
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
</div>

<script>
// 数据存储在 _data/memos.json 文件中
// 通过 GitHub Actions 自动部署更新
let memos = [];
let currentFilter = 'all';
let isAdmin = false;
const ADMIN_PASSWORD_HASH = '21232f297a57a5a743894a0e4a801fc3'; // admin123 的 MD5

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
async function init() {
  // 检查登录状态
  checkLoginStatus();
  
  // 加载备忘录数据
  await loadMemos();
  
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
      updateAdminUI();
    } else {
      localStorage.removeItem('admin_login_time');
    }
  }
}

// 更新管理员界面
function updateAdminUI() {
  const loginText = document.getElementById('login-text');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const addSection = document.getElementById('memo-add-section');
  
  if (isAdmin) {
    loginText.textContent = '管理员模式 - 可编辑';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    if (addSection) addSection.style.display = 'flex';
  } else {
    loginText.textContent = '访客模式 - 仅可查看';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    if (addSection) addSection.style.display = 'none';
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

// MD5 简单实现
function md5(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }
  function f(x, y, z) { return (x & y) | ((~x) & z); }
  function g(x, y, z) { return (x & z) | (y & (~z)); }
  function h(x, y, z) { return (x ^ y ^ z); }
  function i(x, y, z) { return (y ^ (x | (~z))); }
  function ff(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function gg(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function hh(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function ii(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWordsTemp1 = lMessageLength + 8;
    var lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
    var lWordArray = new Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue) {
    var wordToHexValue = '', wordToHexValueTemp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValueTemp = '0' + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
    }
    return wordToHexValue;
  }
  var x = [];
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  string = unescape(encodeURIComponent(string));
  x = convertToWordArray(string);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = ff(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = ff(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = ff(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = ff(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = ff(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = ff(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = ff(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = ff(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = ff(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = ff(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = ff(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = ff(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = ff(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = ff(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = ff(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = ff(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = gg(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = gg(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = gg(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = gg(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = gg(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = gg(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = gg(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = gg(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = gg(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = gg(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = gg(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = gg(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = gg(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = gg(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = gg(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = gg(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = hh(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = hh(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = hh(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = hh(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = hh(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = hh(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = hh(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = hh(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = hh(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = hh(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = hh(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = hh(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = hh(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = hh(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = hh(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = hh(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = ii(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = ii(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = ii(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = ii(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = ii(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = ii(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = ii(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = ii(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = ii(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = ii(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = ii(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = ii(b, c, d, a, x[k + 13], S44, 4E0811A1);
    a = ii(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = ii(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = ii(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = ii(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  return tempValue.toLowerCase();
}

// 登录
function login() {
  const password = document.getElementById('admin-password').value;
  if (md5(password) === ADMIN_PASSWORD_HASH) {
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

// 加载备忘录 - 从 JSON 文件
async function loadMemos() {
  try {
    // 从 _data/memos.json 加载
    const response = await fetch('{{ site.baseurl }}/assets/data/memos.json?t=' + Date.now());
    if (response.ok) {
      const data = await response.json();
      memos = data.memos || [];
    } else {
      // 如果文件不存在，使用空数组
      memos = [];
    }
  } catch (e) {
    console.error('加载备忘录失败:', e);
    memos = [];
  }
  renderMemos();
  updateStats();
  updateTabCounts();
}

// 保存备忘录到仓库 (通过 GitHub API)
async function saveMemosToRepo() {
  if (!isAdmin) {
    alert('请先登录管理员账号');
    return false;
  }
  
  // 由于静态网站无法直接修改文件，这里提供下载更新文件的方式
  const data = {
    memos: memos,
    updatedAt: new Date().toISOString()
  };
  
  // 保存到 localStorage 作为临时存储
  localStorage.setItem('memos_pending', JSON.stringify(data));
  
  // 提供下载
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'memos.json';
  a.click();
  URL.revokeObjectURL(url);
  
  alert('备忘录数据已下载，请将文件上传到仓库的 assets/data/ 目录下覆盖原文件');
  return true;
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
  
  input.value = '';
  dateInput.valueAsDate = new Date();
  
  renderMemos();
  updateStats();
  updateTabCounts();
  
  // 提示保存到仓库
  saveMemosToRepo();
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
    
    return `
      <div class="memo-item ${memo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-id="${memo.id}">
        <div class="memo-checkbox">
          <input type="checkbox" id="cb-${memo.id}" ${memo.completed ? 'checked' : ''} 
                 onchange="toggleComplete('${memo.id}')" ${!isAdmin ? 'disabled' : ''}>
          <label for="cb-${memo.id}"></label>
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
    // 恢复复选框状态
    renderMemos();
    return;
  }
  
  const memo = memos.find(m => m.id === id);
  if (memo) {
    memo.completed = !memo.completed;
    renderMemos();
    updateStats();
    updateTabCounts();
    saveMemosToRepo();
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
  renderMemos();
  updateStats();
  updateTabCounts();
  saveMemosToRepo();
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
    renderMemos();
    saveMemosToRepo();
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

/* 管理员状态 */
.admin-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-primary);
  border-radius: 10px;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
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
