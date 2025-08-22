// 密码保护系统 - 支持不同页面使用不同密码
class PasswordProtection {
  constructor(pageConfig) {
    // 页面配置，包含密码和会话键名
    this.pageConfig = pageConfig || {
      password: '0524', // 默认密码
      sessionKey: 'private_access_granted',
      tabSessionKey: 'private_tab_session'
    };
    
    this.sessionExpiry = 24 * 60 * 60 * 1000; // 24小时过期
    this.tabSessionExpiry = 30 * 60 * 1000; // 30分钟过期（Tab会话）
  }

  // 检查是否已通过验证
  isAuthenticated() {
    console.log('检查认证状态...');
    
    // 首先检查Tab会话（优先级更高）
    const tabSession = this.getTabSession();
    if (tabSession && Date.now() <= tabSession.expiry) {
      console.log('✓ Tab会话有效，已通过认证');
      return true;
    } else if (tabSession) {
      console.log('✗ Tab会话已过期');
      this.clearTabSession();
    }
    
    // 然后检查长期会话
    const session = this.getSession();
    if (!session) {
      console.log('✗ 无有效会话，需要重新认证');
      return false;
    }
    
    // 检查会话是否过期
    if (Date.now() > session.expiry) {
      console.log('✗ 长期会话已过期');
      this.clearSession();
      return false;
    }
    
    console.log('✓ 长期会话有效，已通过认证');
    return true;
  }

  // 获取Tab会话信息（sessionStorage）
  getTabSession() {
    try {
      const session = sessionStorage.getItem(this.pageConfig.tabSessionKey);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  // 保存Tab会话（sessionStorage）
  saveTabSession() {
    const session = {
      timestamp: Date.now(),
      expiry: Date.now() + this.tabSessionExpiry
    };
    sessionStorage.setItem(this.pageConfig.tabSessionKey, JSON.stringify(session));
  }

  // 清除Tab会话
  clearTabSession() {
    sessionStorage.removeItem(this.pageConfig.tabSessionKey);
  }

  // 获取长期会话信息（localStorage）
  getSession() {
    try {
      const session = localStorage.getItem(this.pageConfig.sessionKey);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  // 保存长期会话（localStorage）
  saveSession() {
    const session = {
      timestamp: Date.now(),
      expiry: Date.now() + this.sessionExpiry
    };
    localStorage.setItem(this.pageConfig.sessionKey, JSON.stringify(session));
  }

  // 清除长期会话
  clearSession() {
    localStorage.removeItem(this.pageConfig.sessionKey);
  }

  // 验证密码
  verifyPassword(inputPassword) {
    return inputPassword === this.pageConfig.password;
  }

  // 检测访问路径类型
  detectAccessPath() {
    const referrer = document.referrer;
    const currentUrl = window.location.href;
    
    console.log('检测访问路径类型:');
    console.log('- 当前URL:', currentUrl);
    console.log('- 来源页面:', referrer);
    
    // 检查是否来自private.html页面
    if (referrer && referrer.includes('private.html')) {
      console.log('- 检测结果: 常规路径 (来自private.html)');
      return 'regular'; // 常规路径
    }
    
    // 检查是否直接访问
    if (!referrer || referrer === '') {
      console.log('- 检测结果: 直接链接 (无来源页面)');
      return 'direct'; // 直接链接
    }
    
    // 检查是否来自locked_files目录
    if (referrer.includes('locked_files/')) {
      console.log('- 检测结果: 常规路径 (来自密码验证页面)');
      return 'regular'; // 从密码验证页面来的
    }
    
    // 默认认为是直接访问
    console.log('- 检测结果: 直接链接 (默认)');
    return 'direct';
  }

  // 显示密码输入界面（基于master.html设计）
  showPasswordPrompt() {
    // 隐藏原内容
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `
      <div id="password-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #000000;
        overflow: hidden;
        z-index: 9999;
        font-family: 'SimSun', '宋体', serif;
      ">
        <div style="
          width: 100vw;
          height: 100vh;
          max-width: 100vw;
          max-height: 100vh;
          position: relative;
          margin: 0;
          border-radius: 0;
          overflow: hidden;
          box-shadow: none;
          background: #000000;
          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          top: 0; left: 0; right: 0; bottom: 0;
          box-sizing: border-box;
        ">
          <!-- 背景 -->
          <div style="
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            height: 100%;
            background: url('../img/code_bg.png') center center/cover no-repeat;
            z-index: 1;
          "></div>
          
          <!-- 标题 -->
          <div style="
            position: absolute;
            top: -3%; left: 50%;
            transform: translateX(-50%);
            width: 750px; height: 300px;
            background: url('../img/master/master room.png') center center/contain no-repeat;
            z-index: 2;
            pointer-events: none;
          "></div>
          
          <!-- 密码提示 -->
          <div style="
            position: absolute;
            top: 27%; left: 50%;
            transform: translateX(-50%);
            color: #f0dbb8c1;
            font-family: 'SimSun', '宋体', serif;
            font-size: 18px;
            text-align: center;
            z-index: 2;
            pointer-events: none;
          ">输入密码以解锁此房间</div>
          
          <!-- 密码输入框 -->
          <input type="password" id="password-input" placeholder="请输入密码" maxlength="20" style="
            position: absolute;
            top: 35%; left: 50%;
            transform: translateX(-50%);
            width: 150px;
            height: 45px;
            background: white;
            border: none;
            border-radius: 12px;
            padding: 0 16px;
            font-size: 16px;
            color: #333;
            outline: none;
            z-index: 2;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            box-sizing: border-box;
          ">
          
          <!-- 错误信息 -->
          <div id="error-message" style="
            position: absolute;
            top: 42%; left: 50%;
            transform: translateX(-50%);
            color: #ff6b6b;
            font-size: 14px;
            text-align: center;
            z-index: 2;
            min-height: 20px;
            display: none;
          "></div>
          
          <!-- 进入按钮 -->
          <button id="enter-btn" style="
            position: absolute;
            top: 45%; left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 50px;
            background: url('../svg/code/enter.svg') center center/contain no-repeat;
            border: none;
            cursor: pointer;
            z-index: 2;
            transition: transform 0.2s ease;
          "></button>
          
          <!-- 底部遮罩 -->
          <div style="
            position: absolute;
            left: 0; bottom: 0;
            width: 100%;
            height: 92px;
            background: #000000;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            z-index: 3;
            pointer-events: none;
          "></div>
        </div>
      </div>
    `;

    // 保存原内容到隐藏字段
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.id = 'original-content';
    hiddenInput.value = originalContent;
    document.body.appendChild(hiddenInput);

    // 添加事件监听
    const passwordInput = document.getElementById('password-input');
    const enterBtn = document.getElementById('enter-btn');

    // Enter键验证
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSubmit();
      }
    });

    // 点击按钮验证
    enterBtn.addEventListener('click', () => {
      this.handleSubmit();
    });

    // 按钮悬停效果
    enterBtn.addEventListener('mouseenter', () => {
      enterBtn.style.transform = 'translateX(-50%) scale(1.05)';
    });

    enterBtn.addEventListener('mouseleave', () => {
      enterBtn.style.transform = 'translateX(-50%) scale(1)';
    });

    enterBtn.addEventListener('mousedown', () => {
      enterBtn.style.transform = 'translateX(-50%) scale(0.95)';
    });

    enterBtn.addEventListener('mouseup', () => {
      enterBtn.style.transform = 'translateX(-50%) scale(1.05)';
    });

    // 自动聚焦到密码输入框
    passwordInput.focus();
  }

  // 处理密码提交
  handleSubmit() {
    const input = document.getElementById('password-input');
    const errorDiv = document.getElementById('error-message');
    const password = input.value.trim();

    if (!password) {
      this.showError('请输入密码');
      return;
    }

    if (this.verifyPassword(password)) {
      // 密码正确，根据访问路径类型保存相应的会话
      const accessPath = this.detectAccessPath();
      
      if (accessPath === 'regular') {
        // 常规路径：保存Tab会话（sessionStorage）
        this.saveTabSession();
        console.log('常规路径验证成功，保存Tab会话');
      } else {
        // 直接链接：保存长期会话（localStorage）
        this.saveSession();
        console.log('直接链接验证成功，保存长期会话');
      }
      
      this.showOriginalContent();
    } else {
      // 密码错误
      this.showError('密码错误，请重试');
      input.value = '';
      input.focus();
    }
  }

  // 显示错误信息
  showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // 3秒后自动隐藏错误信息
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 3000);
  }

  // 显示原内容
  showOriginalContent() {
    const originalContent = document.getElementById('original-content').value;
    document.body.innerHTML = originalContent;
    
    // 重新初始化页面脚本
    this.reinitializeScripts();
  }

  // 重新初始化脚本
  reinitializeScripts() {
    // 重新执行所有脚本标签
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.src) {
        // 外部脚本，重新加载
        const newScript = document.createElement('script');
        newScript.src = script.src;
        document.head.appendChild(newScript);
      } else if (script.textContent) {
        // 内联脚本，重新执行
        try {
          eval(script.textContent);
        } catch (e) {
          console.log('Script re-execution error:', e);
        }
      }
    });
  }

  // 初始化密码保护
  init() {
    if (!this.isAuthenticated()) {
      this.showPasswordPrompt();
    } else {
      console.log('已通过验证，无需重新输入密码');
    }
  }
}

// 页面配置映射
const PAGE_CONFIGS = {
  'master': {
    password: '0524',
    sessionKey: 'master_access_granted',
    tabSessionKey: 'master_tab_session'
  },
  'filet-o-fish': {
    password: '1024',
    sessionKey: 'filet_o_fish_access_granted',
    tabSessionKey: 'filet_o_fish_tab_session'
  },
  'berlin': {
    password: '0524', // 使用默认密码
    sessionKey: 'berlin_access_granted',
    tabSessionKey: 'berlin_tab_session'
  },
  'cage': {
    password: '0524', // 使用默认密码
    sessionKey: 'cage_access_granted',
    tabSessionKey: 'cage_tab_session'
  },
  '2049': {
    password: '0524', // 使用默认密码
    sessionKey: '2049_access_granted',
    tabSessionKey: '2049_tab_session'
  },
  'vampire': {
    password: '0524', // 使用默认密码
    sessionKey: 'vampire_access_granted',
    tabSessionKey: 'vampire_tab_session'
  },
  'domestication': {
    password: '0524', // 使用默认密码
    sessionKey: 'domestication_access_granted',
    tabSessionKey: 'domestication_tab_session'
  }
};

// 根据当前页面URL自动检测页面类型
function detectPageType() {
  const currentUrl = window.location.href;
  const pathname = window.location.pathname;
  
  console.log('检测页面类型:', pathname);
  
  // 检测各种页面类型
  if (pathname.includes('master.html')) {
    return 'master';
  } else if (pathname.includes('filet-o-fish.html')) {
    return 'filet-o-fish';
  } else if (pathname.includes('berlin.html')) {
    return 'berlin';
  } else if (pathname.includes('cage.html')) {
    return 'cage';
  } else if (pathname.includes('2049.html')) {
    return '2049';
  } else if (pathname.includes('vampire.html')) {
    return 'vampire';
  } else if (pathname.includes('domestication/')) {
    return 'domestication';
  }
  
  // 默认返回master配置
  return 'master';
}

// 创建全局实例
const pageType = detectPageType();
const pageConfig = PAGE_CONFIGS[pageType] || PAGE_CONFIGS['master'];
window.passwordProtection = new PasswordProtection(pageConfig);

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('页面类型:', pageType, '密码:', pageConfig.password);
  window.passwordProtection.init();
});
