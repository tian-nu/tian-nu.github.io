// ========================================
// 主题切换
// ========================================
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    html.setAttribute('data-theme', 'dark');
  }
};

// 切换主题
const toggleTheme = () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  // Sync with Giscus
  const iframe = document.querySelector('iframe.giscus-frame');
  if (iframe) {
    iframe.contentWindow.postMessage({
      giscus: {
        setConfig: {
          theme: newTheme === 'dark' ? 'dark' : 'light'
        }
      }
    }, 'https://giscus.app');
  }
};

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

// ========================================
// 移动端菜单
// ========================================
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // 切换汉堡菜单动画
    const spans = navToggle.querySelectorAll('span');
    navToggle.classList.toggle('active');
    
    if (navToggle.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });
  
  // 点击菜单项后关闭菜单
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });
}

// ========================================
// 搜索功能
// ========================================
const searchToggle = document.querySelector('.search-toggle');
const searchOverlay = document.getElementById('search-overlay');
const searchClose = document.querySelector('.search-close');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

// 打开搜索
if (searchToggle && searchOverlay) {
  searchToggle.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    searchInput.focus();
  });
}

// 关闭搜索
const closeSearch = () => {
  searchOverlay.classList.remove('active');
  searchInput.value = '';
  searchResults.innerHTML = '';
};

if (searchClose) {
  searchClose.addEventListener('click', closeSearch);
}

// 点击遮罩关闭
if (searchOverlay) {
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
      closeSearch();
    }
  });
}

// ESC键关闭
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
    closeSearch();
  }
});

// 搜索功能（简单的本地搜索）
let searchData = [];

// 加载搜索数据
const loadSearchData = async () => {
  try {
    const response = await fetch('/search.json');
    if (response.ok) {
      searchData = await response.json();
    }
  } catch (error) {
    console.log('搜索数据加载失败');
  }
};

// 执行搜索
const performSearch = (query) => {
  if (!query.trim()) {
    searchResults.innerHTML = '';
    return;
  }
  
  const results = searchData.filter(item => {
    const titleMatch = item.title && item.title.toLowerCase().includes(query.toLowerCase());
    const contentMatch = item.content && item.content.toLowerCase().includes(query.toLowerCase());
    return titleMatch || contentMatch;
  }).slice(0, 10);
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item">没有找到相关文章</div>';
    return;
  }
  
  searchResults.innerHTML = results.map(item => `
    <a href="${item.url}" class="search-result-item" onclick="closeSearch()">
      <div class="search-result-title">${item.title}</div>
      <div class="search-result-excerpt">${item.excerpt || ''}</div>
    </a>
  `).join('');
};

// 搜索输入
if (searchInput) {
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(e.target.value);
    }, 300);
  });
}

// ========================================
// 返回顶部
// ========================================
const backToTop = document.getElementById('back-to-top');

const toggleBackToTop = () => {
  if (window.scrollY > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
};

if (backToTop) {
  window.addEventListener('scroll', toggleBackToTop);
  
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ========================================
// 文章目录生成
// ========================================
const generateTOC = () => {
  const content = document.getElementById('post-content');
  const toc = document.getElementById('toc');
  
  if (!content || !toc) return;
  
  const headings = content.querySelectorAll('h2, h3, h4');
  
  if (headings.length === 0) {
    toc.parentElement.style.display = 'none';
    return;
  }
  
  let tocHTML = '<ul>';
  let currentLevel = 2; // Start with h2
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const id = heading.id || `heading-${index}`;
    heading.id = id;
    
    if (level > currentLevel) {
      // Add nested list
      for (let i = 0; i < level - currentLevel; i++) {
        tocHTML += '<ul>';
      }
    } else if (level < currentLevel) {
      // Close nested list
      for (let i = 0; i < currentLevel - level; i++) {
        tocHTML += '</ul>';
      }
    }
    
    tocHTML += `<li><a href="#${id}" class="toc-link" data-id="${id}">${heading.textContent}</a></li>`;
    currentLevel = level;
  });
  
  // Close any remaining open lists
  for (let i = 0; i < currentLevel - 2; i++) {
    tocHTML += '</ul>';
  }
  
  tocHTML += '</ul>';
  toc.innerHTML = tocHTML;

  // Setup Intersection Observer for highlighting
  const observerOptions = {
    root: null,
    // Top margin: -90px (intersection starts 90px from top, accommodating the 100px scroll-margin)
    // Bottom margin: -70% (active zone is the top chunk of the screen)
    rootMargin: '-90px 0px -70% 0px', 
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        // Remove active class from all links
        document.querySelectorAll('.toc-link').forEach(link => {
          link.classList.remove('active');
        });
        // Add active class to current link
        const activeLink = document.querySelector(`.toc-link[data-id="${id}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
          // Auto-scroll the TOC container to keep active link in view
          const tocContainer = document.querySelector('.toc-container');
          if (tocContainer) {
             const linkRect = activeLink.getBoundingClientRect();
             const containerRect = tocContainer.getBoundingClientRect();
             if (linkRect.top < containerRect.top || linkRect.bottom > containerRect.bottom) {
                activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' });
             }
          }
        }
      }
    });
  }, observerOptions);

  headings.forEach(heading => observer.observe(heading));
};

// ========================================
// 分享功能
// ========================================
const shareToWeibo = () => {
  const title = document.title;
  const url = window.location.href;
  window.open(`http://service.weibo.com/share/share.php?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('链接已复制到剪贴板');
  }).catch(() => {
    // 降级方案
    const input = document.createElement('input');
    input.value = window.location.href;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert('链接已复制到剪贴板');
  });
};

// ========================================
// 站点运行天数
// ========================================
const calculateSiteDays = () => {
  const startDate = new Date('2024-01-01'); // 可以根据实际情况修改
  const now = new Date();
  const diff = now - startDate;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  const daysElement = document.getElementById('site-days');
  if (daysElement) {
    daysElement.textContent = days;
  }
};

// ========================================
// 初始化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadSearchData();
  generateTOC();
  calculateSiteDays();
});
