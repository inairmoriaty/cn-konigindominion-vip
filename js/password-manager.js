// 密码管理工具
class PasswordManager {
  constructor() {
    this.passwordKey = 'private_password';
    this.defaultPassword = 'konigin2024';
  }

  // 获取当前密码
  getCurrentPassword() {
    return localStorage.getItem(this.passwordKey) || this.defaultPassword;
  }

  // 设置新密码
  setPassword(newPassword) {
    if (newPassword && newPassword.length >= 4) {
      localStorage.setItem(this.passwordKey, newPassword);
      return true;
    }
    return false;
  }

  // 重置为默认密码
  resetToDefault() {
    localStorage.removeItem(this.passwordKey);
    return this.defaultPassword;
  }

  // 清除所有密码相关数据
  clearAllData() {
    localStorage.removeItem(this.passwordKey);
    localStorage.removeItem('private_access_granted');
  }

  // 显示密码管理界面
  showManager() {
    const currentPassword = this.getCurrentPassword();
    
    const managerHTML = `
      <div id="password-manager-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: 'SimSun', '宋体', serif;
      ">
        <div style="
          background: rgba(20, 20, 20, 0.95);
          border: 2px solid #444;
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        ">
          <div style="
            font-size: 20px;
            color: #fff;
            margin-bottom: 20px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          ">
            🔐 密码管理
          </div>
          
          <div style="
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid #555;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: left;
          ">
            <div style="color: #ccc; font-size: 14px; margin-bottom: 5px;">当前密码:</div>
            <div style="color: #fff; font-size: 16px; font-family: monospace;">${currentPassword}</div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <input type="password" id="new-password-input" placeholder="输入新密码（至少4位）" style="
              width: 100%;
              padding: 12px;
              border: 2px solid #555;
              border-radius: 6px;
              background: rgba(255, 255, 255, 0.1);
              color: #fff;
              font-size: 14px;
              box-sizing: border-box;
              outline: none;
              margin-bottom: 10px;
            ">
            <div id="password-message" style="
              color: #ff6b6b;
              font-size: 12px;
              min-height: 16px;
              display: none;
            "></div>
          </div>
          
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="passwordManager.changePassword()" style="
              background: linear-gradient(135deg, #4a4a4a 0%, #2d2d2d 100%);
              border: none;
              border-radius: 6px;
              padding: 10px 20px;
              color: #fff;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
            ">修改密码</button>
            
            <button onclick="passwordManager.resetPassword()" style="
              background: linear-gradient(135deg, #6b4a4a 0%, #4d2d2d 100%);
              border: none;
              border-radius: 6px;
              padding: 10px 20px;
              color: #fff;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
            ">重置默认</button>
            
            <button onclick="passwordManager.closeManager()" style="
              background: linear-gradient(135deg, #4a6b4a 0%, #2d4d2d 100%);
              border: none;
              border-radius: 6px;
              padding: 10px 20px;
              color: #fff;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
            ">关闭</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', managerHTML);
    
    // 添加回车键支持
    document.getElementById('new-password-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        passwordManager.changePassword();
      }
    });
  }

  // 修改密码
  changePassword() {
    const newPassword = document.getElementById('new-password-input').value.trim();
    const messageDiv = document.getElementById('password-message');
    
    if (!newPassword) {
      this.showMessage('请输入新密码', 'error');
      return;
    }
    
    if (newPassword.length < 4) {
      this.showMessage('密码至少需要4位', 'error');
      return;
    }
    
    if (this.setPassword(newPassword)) {
      this.showMessage('密码修改成功！', 'success');
      document.getElementById('new-password-input').value = '';
      
      // 更新显示的当前密码
      setTimeout(() => {
        const currentPasswordDiv = document.querySelector('#password-manager-overlay div[style*="font-family: monospace"]');
        if (currentPasswordDiv) {
          currentPasswordDiv.textContent = newPassword;
        }
      }, 100);
    } else {
      this.showMessage('密码设置失败', 'error');
    }
  }

  // 重置密码
  resetPassword() {
    const defaultPassword = this.resetToDefault();
    this.showMessage(`密码已重置为默认密码: ${defaultPassword}`, 'success');
    
    // 更新显示的当前密码
    setTimeout(() => {
      const currentPasswordDiv = document.querySelector('#password-manager-overlay div[style*="font-family: monospace"]');
      if (currentPasswordDiv) {
        currentPasswordDiv.textContent = defaultPassword;
      }
    }, 100);
  }

  // 显示消息
  showMessage(message, type) {
    const messageDiv = document.getElementById('password-message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.style.color = type === 'success' ? '#6bff6b' : '#ff6b6b';
    
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }

  // 关闭管理器
  closeManager() {
    const overlay = document.getElementById('password-manager-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

// 创建全局实例
const passwordManager = new PasswordManager();

// 添加快捷键支持（Ctrl+Shift+P 打开密码管理器）
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    passwordManager.showManager();
  }
});

// 在控制台添加便捷方法
console.log('密码管理工具已加载！');
console.log('使用方法：');
console.log('1. 按 Ctrl+Shift+P 打开密码管理器');
console.log('2. 或在控制台输入: passwordManager.showManager()');
console.log('3. 当前密码:', passwordManager.getCurrentPassword());
