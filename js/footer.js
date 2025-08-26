// /js/footer.js
// 根据当前页面位置确定footer组件的路径
const currentPath = window.location.pathname;
let footerPath = '../components/footer.html';

// 如果页面在 page/public/ 或 page/private/ 目录下，需要调整路径
if (currentPath.includes('/page/public/') || currentPath.includes('/page/private/')) {
  footerPath = '../../components/footer.html';
}

fetch(footerPath)
  .then(res => res.text())
  .then(html => {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      // 根据当前页面位置调整路径
      let adjustedHtml = html;
      
      if (currentPath.includes('/page/public/') || currentPath.includes('/page/private/')) {
        // 将 ../page/ 替换为 ../../page/
        adjustedHtml = html.replace(/\.\.\/page\//g, '../../page/');
        // 将 ../img/ 替换为 ../../img/
        adjustedHtml = html.replace(/\.\.\/img\//g, '../../img/');
      }
      
      footerPlaceholder.innerHTML = adjustedHtml;
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
    link.href = currentPath.includes('/page/public/') || currentPath.includes('/page/private/') 
      ? '../../style/sidebar.css' 
      : '../style/sidebar.css';
    document.head.appendChild(link);
  }
  
  // 动态加载JS
  if (!window.sidebarLoaded) {
    const script = document.createElement('script');
    script.src = currentPath.includes('/page/public/') || currentPath.includes('/page/private/') 
      ? '../../js/sidebar.js' 
      : '../js/sidebar.js';
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
