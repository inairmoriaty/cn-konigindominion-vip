// /js/footer.js
fetch('../components/footer.html')
  .then(res => res.text())
  .then(html => {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.innerHTML = html;
      console.log('Footer loaded successfully');
      // 加载侧边栏功能
      loadSidebar();
    } else {
      console.warn('Footer placeholder not found, footer not loaded');
    }
  })
  .catch(error => {
    console.error('Failed to load footer:', error);
  });

// 处理侧边栏点击事件
window.handleSidebarClick = function(event) {
  console.log('handleSidebarClick called');
  if (window.showSidebar) {
    event.preventDefault();
    console.log('Using sidebar overlay');
    window.showSidebar();
    return false;
  } else {
    console.log('Sidebar overlay not available, navigating to sidebar.html');
    return true; // 允许正常导航
  }
};

// 加载侧边栏功能
function loadSidebar() {
  // 动态加载CSS
  if (!document.querySelector('link[href*="sidebar.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../style/sidebar.css';
    document.head.appendChild(link);
  }
  
  // 动态加载JS
  if (!window.sidebarLoaded) {
    const script = document.createElement('script');
    script.src = '../js/sidebar.js';
    script.onload = function() {
      window.sidebarLoaded = true;
      console.log('Sidebar loaded successfully');
    };
    script.onerror = function() {
      console.error('Failed to load sidebar.js');
    };
    document.head.appendChild(script);
  }
  
  // 确保sidebar按钮事件绑定
  setTimeout(() => {
    const sidebarBtn = document.getElementById('sidebarBtn');
    if (sidebarBtn) {
      console.log('Sidebar button found in footer.js');
      // 移除可能存在的旧事件监听器
      sidebarBtn.removeEventListener('click', sidebarBtn.sidebarClickHandler);
      
      // 添加新的事件监听器
      sidebarBtn.sidebarClickHandler = function(e) {
        e.preventDefault();
        console.log('Sidebar button clicked from footer.js');
        if (window.showSidebar) {
          console.log('Calling showSidebar from footer.js');
          window.showSidebar();
        } else {
          console.log('showSidebar not available');
        }
      };
      
      sidebarBtn.addEventListener('click', sidebarBtn.sidebarClickHandler);
    } else {
      console.log('Sidebar button not found in footer.js');
    }
  }, 100);
}
