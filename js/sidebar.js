// 侧边栏控制脚本
console.log('Sidebar.js loaded');

// 初始化侧边栏函数
function initSidebar() {
  console.log('Initializing sidebar');
  
  // 动态确定图标路径
  const currentPath = window.location.pathname;
  const iconPath = currentPath.includes('/page/public/') || currentPath.includes('/page/private/') 
    ? '../../svg/sidebar/' 
    : '../svg/sidebar/';
  
  console.log('Current path:', currentPath);
  console.log('Icon path:', iconPath);
  
  // 创建侧边栏HTML结构
  const sidebarHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay">
      <div class="sidebar-container" id="sidebarContainer">
        <div class="sidebar-content">
          <div class="sidebar-logo"></div>
          <div class="sidebar-buttons">
            <a href="public.html" class="sidebar-btn">
              <img src="${iconPath}public_btn.svg" alt="Public" />
              <span>公开篇目</span>
            </a>
            <a href="private.html" class="sidebar-btn">
              <img src="${iconPath}private_btn.svg" alt="Private" />
              <span>私密客单</span>
            </a>
            <a href="public/render.html" class="sidebar-btn">
              <img src="${iconPath}render_btn.svg" alt="Render" />
              <span>图集存放</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  // 将侧边栏添加到页面
  document.body.insertAdjacentHTML('beforeend', sidebarHTML);
  console.log('Sidebar HTML added to page');

  // 获取元素
  const sidebarBtn = document.getElementById('sidebarBtn');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarContainer = document.getElementById('sidebarContainer');

  // 显示侧边栏
  function showSidebar() {
    console.log('showSidebar called');
    sidebarOverlay.classList.add('active');
    sidebarContainer.classList.add('active');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
  }
  
  // 将showSidebar函数设为全局可用
  window.showSidebar = showSidebar;

  // 隐藏侧边栏
  function hideSidebar() {
    sidebarOverlay.classList.remove('active');
    sidebarContainer.classList.remove('active');
    document.body.style.overflow = ''; // 恢复滚动
  }

  // 绑定事件
  if (sidebarBtn) {
    console.log('Sidebar button found, adding event listener');
    sidebarBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Sidebar button clicked');
      showSidebar();
    });
  } else {
    console.log('Sidebar button not found');
  }



  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function(e) {
      if (e.target === sidebarOverlay) {
        hideSidebar();
      }
    });
  }

  // ESC键关闭侧边栏
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebarOverlay.classList.contains('active')) {
      hideSidebar();
    }
  });
}

// 如果DOM已经加载完成，立即初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSidebar);
} else {
  // DOM已经加载完成，立即初始化
  initSidebar();
}
