(function() {
  let memos = [];
  let currentFilter = 'all';
  let isAdmin = false;
  const ADMIN_PASSWORD = 'admin123';
  let categories = {};

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    init();
  });

  function init() {
    loadCategories();
    renderCategories();
    checkLoginStatus();
    loadMemos();
    
    // Bind enter key for login
    const pwdInput = document.getElementById('admin-password');
    if (pwdInput) {
      pwdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
      });
    }

    // Bind event listeners for modals
    bindModalEvents();
  }

  function bindModalEvents() {
    // Close modals when clicking outside
    window.onclick = function(event) {
      if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
      }
    };
  }

  // --- Category Management ---

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
    // Update select options in edit/create modals
    const selects = ['edit-category', 'create-category'];
    selects.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = Object.entries(categories).map(([key, cat]) => 
          `<option value="${key}">${cat.name}</option>`
        ).join('');
      }
    });
    
    // Update filter tabs
    const tabsContainer = document.getElementById('memo-tabs');
    if (tabsContainer) {
      const allTab = tabsContainer.querySelector('.memo-tab');
      tabsContainer.innerHTML = '';
      tabsContainer.appendChild(allTab); // Keep 'All' tab
      
      Object.entries(categories).forEach(([key, cat]) => {
        const btn = document.createElement('button');
        btn.className = 'memo-tab';
        if (currentFilter === key) btn.classList.add('active');
        btn.onclick = () => filterMemo(key);
        btn.innerHTML = `${cat.name} <span class="tab-count" id="count-${key}">0</span>`;
        tabsContainer.appendChild(btn);
      });
      
      // Restore active state
      updateActiveTab();
    }
  }

  window.filterMemo = function(category) {
    currentFilter = category;
    updateActiveTab();
    renderMemos();
  };

  function updateActiveTab() {
    document.querySelectorAll('.memo-tab').forEach(tab => {
      tab.classList.remove('active');
      if (currentFilter === 'all' && tab.textContent.includes('全部')) {
        tab.classList.add('active');
      } else if (categories[currentFilter] && tab.textContent.includes(categories[currentFilter].name)) {
        tab.classList.add('active');
      }
    });
  }

  // --- Login System ---

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
    const addBtn = document.getElementById('memo-add-btn');
    const actionsSection = document.getElementById('memo-actions-section');
    
    if (isAdmin) {
      if (loginText) loginText.textContent = '管理员模式';
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      if (addBtn) addBtn.style.display = 'inline-block';
      if (actionsSection) actionsSection.style.display = 'flex';
    } else {
      if (loginText) loginText.textContent = '访客模式';
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (addBtn) addBtn.style.display = 'none';
      if (actionsSection) actionsSection.style.display = 'none';
    }
    
    renderMemos();
  }

  window.showLoginModal = function() {
    openModal('login-modal');
    setTimeout(() => document.getElementById('admin-password').focus(), 100);
  };

  window.hideLoginModal = function() {
    closeModal('login-modal');
    document.getElementById('admin-password').value = '';
  };

  window.login = function() {
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
  };

  window.logout = function() {
    isAdmin = false;
    localStorage.removeItem('admin_login_time');
    updateAdminUI();
    showToast('已退出登录', 'info');
  };

  // --- Memo Data Management ---

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
    
    // Fallback/Initial load from JSON if local is empty (optional)
    if (memos.length === 0) {
      fetch('/assets/data/memos.json')
        .then(response => {
          if (response.ok) return response.json();
          throw new Error('No initial data');
        })
        .then(data => {
          if (data.memos && data.memos.length > 0) {
            memos = data.memos;
            saveMemos();
            renderMemos();
            updateStats();
            updateTabCounts();
          }
        })
        .catch(e => console.log('Init with empty memos'));
    } else {
      renderMemos();
      updateStats();
      updateTabCounts();
    }
  }

  function saveMemos() {
    const data = {
      memos: memos,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('memos_data', JSON.stringify(data));
  }

  window.renderMemos = function() {
    const list = document.getElementById('memo-list');
    if (!list) return;

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
          <p>${searchText ? '没有找到匹配的备忘录' : '暂无备忘录'}</p>
        </div>
      `;
      return;
    }
    
    list.innerHTML = filtered.map(memo => {
      const cat = categories[memo.category] || categories.todo;
      const isOverdue = memo.deadline && !memo.completed && new Date(memo.deadline + 'T23:59:59') < new Date();
      const deadlineText = memo.deadline ? formatDate(memo.deadline) : '';
      const startDateText = memo.startDate ? formatDate(memo.startDate) : '';
      const checkboxId = 'cb-' + memo.id.replace(/[^a-zA-Z0-9]/g, '-');
      
      return `
        <div class="memo-item ${memo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-id="${memo.id}">
          <div class="memo-checkbox">
            <input type="checkbox" id="${checkboxId}" ${memo.completed ? 'checked' : ''} 
                   onchange="toggleComplete('${memo.id}')">
            <label for="${checkboxId}"></label>
          </div>
          <div class="memo-content">
            <div class="memo-text">${escapeHtml(memo.text)}</div>
            <div class="memo-meta">
              <span class="memo-tag" style="background: ${cat.color}20; color: ${cat.color}">${cat.name}</span>
              ${startDateText ? `<span class="memo-start-date" title="开始日期">🚀 ${startDateText}</span>` : ''}
              ${deadlineText ? `<span class="memo-deadline ${isOverdue ? 'overdue' : ''}" title="截止日期">📅 ${deadlineText}</span>` : ''}
              <span class="memo-time" title="创建时间">${formatTime(memo.createdAt)}</span>
            </div>
          </div>
          ${isAdmin ? `
            <button class="memo-edit" onclick="editMemo('${memo.id}')" title="编辑">✎</button>
            <button class="memo-delete" onclick="deleteMemo('${memo.id}')" title="删除">×</button>
          ` : ''}
        </div>
      `;
    }).join('');
    
    updateStats();
    updateTabCounts();
  };

  // --- CRUD Operations ---

  window.showCreateModal = function() {
    if (!isAdmin) {
      showToast('请先登录管理员账号', 'warning');
      return;
    }
    renderCategories(); // Ensure options are up to date
    document.getElementById('create-text').value = '';
    document.getElementById('create-start-date').value = '';
    document.getElementById('create-date').value = '';
    openModal('create-modal');
    setTimeout(() => document.getElementById('create-text').focus(), 100);
  };

  window.hideCreateModal = function() {
    closeModal('create-modal');
  };

  window.saveNewMemo = function() {
    const text = document.getElementById('create-text').value.trim();
    const category = document.getElementById('create-category').value;
    const startDate = document.getElementById('create-start-date').value || null;
    const deadline = document.getElementById('create-date').value || null;
    
    if (!text) {
      showToast('请输入内容', 'warning');
      return;
    }
    
    const memo = {
      id: 'memo-' + Date.now(),
      text: text,
      category: category,
      completed: false,
      createdAt: new Date().toISOString(),
      startDate: startDate,
      deadline: deadline
    };
    
    memos.unshift(memo);
    saveMemos();
    renderMemos();
    hideCreateModal();
    showToast('添加成功', 'success');
  };

  window.toggleComplete = function(id) {
    if (!isAdmin) {
      // Revert checkbox visual state if not admin
      renderMemos(); 
      showToast('仅管理员可操作', 'warning');
      return;
    }
    
    const memo = memos.find(m => m.id === id);
    if (memo) {
      memo.completed = !memo.completed;
      saveMemos();
      renderMemos();
    }
  };

  window.editMemo = function(id) {
    if (!isAdmin) return;
    const memo = memos.find(m => m.id === id);
    if (!memo) return;
    
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-text').value = memo.text;
    document.getElementById('edit-category').value = memo.category;
    document.getElementById('edit-start-date').value = memo.startDate || '';
    document.getElementById('edit-date').value = memo.deadline || '';
    
    openModal('edit-modal');
  };

  window.saveEditMemo = function() {
    const id = document.getElementById('edit-id').value;
    const text = document.getElementById('edit-text').value.trim();
    
    if (!text) {
      showToast('内容不能为空', 'warning');
      return;
    }
    
    const memo = memos.find(m => m.id === id);
    if (memo) {
      memo.text = text;
      memo.category = document.getElementById('edit-category').value;
      memo.startDate = document.getElementById('edit-start-date').value || null;
      memo.deadline = document.getElementById('edit-date').value || null;
      saveMemos();
      renderMemos();
      closeModal('edit-modal');
      showToast('已更新', 'success');
    }
  };

  window.hideEditModal = function() {
    closeModal('edit-modal');
  };

  window.deleteMemo = function(id) {
    if (!isAdmin) return;
    if (confirm('确定删除这条备忘录吗？')) {
      memos = memos.filter(m => m.id !== id);
      saveMemos();
      renderMemos();
      showToast('已删除', 'success');
    }
  };

  // --- Helpers ---

  function updateStats() {
    const total = memos.length;
    const completed = memos.filter(m => m.completed).length;
    const pending = total - completed;
    const overdue = memos.filter(m => {
      return m.deadline && !m.completed && new Date(m.deadline + 'T23:59:59') < new Date();
    }).length;
    
    setText('total-count', total);
    setText('completed-count', completed);
    setText('pending-count', pending);
    setText('overdue-count', overdue);
  }

  function updateTabCounts() {
    setText('count-all', memos.length);
    Object.keys(categories).forEach(cat => {
      const count = memos.filter(m => m.category === cat).length;
      setText('count-' + cat, count);
    });
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  function formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
    
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- Modal Helpers ---
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex'; // Ensure display flex for centering
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.style.display = 'none', 300); // Wait for animation
    }
  }

  // Toast Notification
  window.showToast = function(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  };
  
  // Date helpers for modals
  window.setTodayDate = function(id) {
    const el = document.getElementById(id);
    if (el) el.value = new Date().toISOString().split('T')[0];
  };
  
  window.clearDate = function(id) {
    const el = document.getElementById(id);
    if (el) el.value = '';
  };
  
  // Create Modal Date Helpers
  window.setTodayDateCreate = () => setTodayDate('create-date');
  window.clearCreateDate = () => clearDate('create-date');
  window.setTodayStartDateCreate = () => setTodayDate('create-start-date');
  window.clearCreateStartDate = () => clearDate('create-start-date');
  
  // Edit Modal Date Helpers
  window.setTodayDate = () => setTodayDate('edit-date'); // Override specific for edit
  window.clearEditDate = () => clearDate('edit-date');
  window.setTodayStartDate = () => setTodayDate('edit-start-date');
  window.clearEditStartDate = () => clearDate('edit-start-date');

})();
