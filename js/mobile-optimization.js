// 移动端触摸优化脚本
class MobileOptimization {
  constructor() {
    this.lastTouchEnd = 0;
    this.touchStartTime = 0;
    this.isInitialized = false;
  }

  // 初始化移动端优化
  init() {
    if (this.isInitialized) {
      console.log('移动端优化已初始化，跳过重复初始化');
      return;
    }

    // 暂时只启用触摸反馈，避免与现有功能冲突
    this.addTouchFeedback();
    
    this.isInitialized = true;
    console.log('移动端优化已初始化（简化版）');
  }

  // 防止页面缩放和滚动
  preventZoomAndScroll() {
    // 暂时禁用，避免与现有功能冲突
    console.log('防止缩放功能已禁用，避免冲突');
  }

  // 防止双击缩放
  preventDoubleTapZoom() {
    // 暂时禁用，避免与现有功能冲突
    console.log('防止双击缩放功能已禁用，避免冲突');
  }

  // 添加触摸反馈
  addTouchFeedback() {
    const interactiveElements = document.querySelectorAll('.interaction-btn, .guest-item, .logo-btn, button, a, .btn-bed, .btn-desk');
    
    interactiveElements.forEach(element => {
      // 跳过已经有触摸反馈的元素
      if (element.dataset.touchOptimized) return;
      
      element.dataset.touchOptimized = 'true';
      
      element.addEventListener('touchstart', function() {
        const currentTransform = this.style.transform || '';
        this.style.transform = currentTransform + ' scale(0.95)';
      }, { passive: true });
      
      element.addEventListener('touchend', function() {
        const currentTransform = this.style.transform || '';
        this.style.transform = currentTransform.replace(' scale(0.95)', '');
      }, { passive: true });
    });
  }

  // 优化触摸事件
  optimizeTouchEvents() {
    // 为所有可点击元素添加触摸事件支持
    const clickableElements = document.querySelectorAll('[onclick], .clickable, .btn, button, a');
    
    clickableElements.forEach(element => {
      if (element.dataset.touchEventAdded) return;
      
      element.dataset.touchEventAdded = 'true';
      
      // 获取现有的点击事件处理函数
      const clickHandler = element.onclick;
      if (clickHandler) {
        // 同时绑定触摸事件
        element.addEventListener('touchend', (e) => {
          e.preventDefault();
          e.stopPropagation();
          clickHandler.call(element, e);
        }, { passive: false });
      }
    });
  }

  // 优化滑动事件
  optimizeSwipeEvents(element, options = {}) {
    const {
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      minSwipeDistance = 50,
      maxSwipeTime = 300
    } = options;

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      if (deltaTime > maxSwipeTime) return;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < minSwipeDistance) return;
      
      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight(e);
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft(e);
        }
      } else {
        // 垂直滑动
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown(e);
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp(e);
        }
      }
    }, { passive: true });
  }

  // 防止快速点击误触
  preventRapidClicks(element, minInterval = 300) {
    let lastClickTime = 0;
    
    const originalClickHandler = element.onclick;
    const originalTouchHandler = element.ontouchend;
    
    element.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastClickTime < minInterval) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      lastClickTime = now;
      
      if (originalClickHandler) {
        originalClickHandler.call(element, e);
      }
    });
    
    element.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastClickTime < minInterval) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      lastClickTime = now;
      
      if (originalTouchHandler) {
        originalTouchHandler.call(element, e);
      }
    });
  }

  // 检测设备类型
  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // 检测触摸设备
  static isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // 获取设备像素比
  static getDevicePixelRatio() {
    return window.devicePixelRatio || 1;
  }

  // 检测网络状态
  static isSlowConnection() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      return connection.effectiveType === 'slow-2g' || 
             connection.effectiveType === '2g' || 
             connection.effectiveType === '3g';
    }
    return false;
  }
}

// 创建全局实例
window.mobileOptimization = new MobileOptimization();

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', function() {
  // 只在移动端或触摸设备上初始化
  if (MobileOptimization.isMobile() || MobileOptimization.isTouchDevice()) {
    window.mobileOptimization.init();
  }
});

// 导出类供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileOptimization;
}
