// /js/footer.js
// 根据当前页面位置确定footer组件的路径
const currentPath = window.location.pathname;
let footerPath = '../components/footer.html';

// 如果页面在 page/public/ 或 page/private/ 目录下，需要调整路径
if (currentPath.includes('/page/public/') || currentPath.includes('/page/private/')) {
  footerPath = '../../components/footer.html';
}
// 如果页面在 article/private/ 或 article/public/ 目录下，需要调整路径
else if (currentPath.includes('/article/private/') || currentPath.includes('/article/public/')) {
  footerPath = '../../../components/footer.html';
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
      else if (currentPath.includes('/article/private/') || currentPath.includes('/article/public/')) {
        // 将 ../page/ 替换为 ../../../page/
        adjustedHtml = html.replace(/\.\.\/page\//g, '../../../page/');
        // 将 ../img/ 替换为 ../../../img/
        adjustedHtml = html.replace(/\.\.\/img\//g, '../../../img/');
      }
      
      footerPlaceholder.innerHTML = adjustedHtml;
      console.log('Footer loaded successfully');
      console.log('Current path:', currentPath);
      console.log('Adjusted footer HTML:', adjustedHtml);
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

// 测试home按钮点击
window.testHomeButton = function() {
  const homeBtn = document.getElementById('homeBtn');
  if (homeBtn) {
    console.log('Home button found, testing click...');
    homeBtn.click();
  } else {
    console.log('Home button not found');
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
      : currentPath.includes('/article/private/') || currentPath.includes('/article/public/')
      ? '../../../style/sidebar.css'
      : '../style/sidebar.css';
    document.head.appendChild(link);
  }
  
  // 动态加载JS
  if (!window.sidebarLoaded) {
    const script = document.createElement('script');
    script.src = currentPath.includes('/page/public/') || currentPath.includes('/page/private/') 
      ? '../../js/sidebar.js' 
      : currentPath.includes('/article/private/') || currentPath.includes('/article/public/')
      ? '../../../js/sidebar.js'
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
    
    // 确保home按钮事件绑定
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
      console.log('Home button found in footer.js');
      // 移除可能存在的旧事件监听器
      homeBtn.removeEventListener('click', homeBtn.homeClickHandler);
      
      // 添加新的事件监听器
      homeBtn.homeClickHandler = function(e) {
        e.preventDefault();
        console.log('Home button clicked from footer.js');
        
        // 根据当前页面位置确定正确的home页面路径
        let homePath = '../page/home.html';
        if (currentPath.includes('/page/public/') || currentPath.includes('/page/private/')) {
          homePath = '../../page/home.html';
        }
        
        console.log('Navigating to home page:', homePath);
        window.location.href = homePath;
      };
      
      homeBtn.addEventListener('click', homeBtn.homeClickHandler);
    } else {
      console.log('Home button not found in footer.js');
    }
    
    // 确保notification按钮事件绑定
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
      console.log('Notification button found in footer.js');
      notificationBtn.removeEventListener('click', notificationBtn.notificationClickHandler);
      
      notificationBtn.notificationClickHandler = function(e) {
        e.preventDefault();
        console.log('Notification button clicked from footer.js');
        
        let notificationPath = '../page/notification.html';
        if (currentPath.includes('/page/public/') || currentPath.includes('/page/private/')) {
          notificationPath = '../../page/notification.html';
        }
        
        console.log('Navigating to notification page:', notificationPath);
        window.location.href = notificationPath;
      };
      
      notificationBtn.addEventListener('click', notificationBtn.notificationClickHandler);
    } else {
      console.log('Notification button not found in footer.js');
    }
    
    // 确保favourite按钮事件绑定
    const favouriteBtn = document.getElementById('favouriteBtn');
    if (favouriteBtn) {
      console.log('Favourite button found in footer.js');
      favouriteBtn.removeEventListener('click', favouriteBtn.favouriteClickHandler);
      
      favouriteBtn.favouriteClickHandler = function(e) {
        e.preventDefault();
        console.log('Favourite button clicked from footer.js');
        
        let favouritePath = '../page/favourite.html';
        if (currentPath.includes('/page/public/') || currentPath.includes('/page/private/')) {
          favouritePath = '../../page/favourite.html';
        }
        
        console.log('Navigating to favourite page:', favouritePath);
        window.location.href = favouritePath;
      };
      
      favouriteBtn.addEventListener('click', favouriteBtn.favouriteClickHandler);
    } else {
      console.log('Favourite button not found in footer.js');
    }
  }, 100);
}
