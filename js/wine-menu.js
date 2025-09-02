// 酒单功能 - 左右滑动滚轮
class WineMenu {
  constructor() {
    this.drinksData = [];
    this.currentIndex = 0;
    this.isAnimating = false; // 防止动画期间重复触发
    this.init();
  }

  async init() {
    await this.loadDrinksData();
    this.bindEvents();
  }

  // 加载酒单数据
  async loadDrinksData() {
    try {
      const response = await fetch('../../json/drinks.json');
      this.drinksData = await response.json();
      console.log('Drinks data loaded:', this.drinksData);
    } catch (error) {
      console.error('Error loading drinks data:', error);
      // 如果加载失败，使用默认数据
      this.drinksData = [
        {
          "id": "konig",
          "label": "König",
          "subtitle": "男主人珍藏",
          "image": "../../img/public/konig.png",
          "link": "/reads/konig-public.html"
        },
        {
          "id": "konigin",
          "label": "Königin",
          "subtitle": "女主人精选",
          "image": "../../img/public/konig.png",
          "link": "/reads/konigin-public.html"
        },
        {
          "id": "guest",
          "label": "Guest",
          "subtitle": "客人专享",
          "image": "../../img/public/konig.png",
          "link": "/reads/guest-public.html"
        }
      ];
    }
  }

  // 绑定事件
  bindEvents() {
    // 点击遮罩关闭
    const overlay = document.getElementById('wineMenuOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeWineMenu();
        }
      });
    }

    // 绑定滑动事件
    this.bindSwipeEvents();
  }

  // 绑定滑动事件 - 循环滚动
  bindSwipeEvents() {
    const overlay = document.getElementById('wineMenuOverlay');
    if (!overlay) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let startTime = 0;
    let velocity = 0;
    let currentItem = null;

    // 触摸事件 - 循环滚动
    overlay.addEventListener('touchstart', (e) => {
      // 找到被触摸的item
      const item = e.target.closest('.wine-item');
      if (!item) return;
      
      currentItem = item;
      startX = e.touches[0].clientX;
      startTime = Date.now();
      isDragging = true;
      velocity = 0;
    }, { passive: false });

    overlay.addEventListener('touchmove', (e) => {
      if (!isDragging || !currentItem) return;
      e.preventDefault();
      currentX = e.touches[0].clientX;
      
      // 计算滑动速度
      const currentTime = Date.now();
      const timeDiff = currentTime - startTime;
      if (timeDiff > 0) {
        velocity = (startX - currentX) / timeDiff;
      }
      
      // 添加拖拽时的视觉反馈
      const diffX = startX - currentX;
      currentItem.style.transform = `translateX(${diffX * 0.3}px) scale(0.95)`;
    }, { passive: false });

    overlay.addEventListener('touchend', (e) => {
      if (!isDragging || !currentItem) return;
      isDragging = false;
      
      // 重置item样式
      currentItem.style.transform = '';
      
      const diffX = startX - currentX;
      const timeDiff = Date.now() - startTime;
      
      // 根据滑动距离和速度判断 - 支持循环滚动
      if (Math.abs(diffX) > 30 || Math.abs(velocity) > 0.5) {
        if (diffX > 0 || velocity > 0) {
          this.nextDrink(); // 向右滑动，下一个
        } else {
          this.prevDrink(); // 向左滑动，上一个
        }
      }
      
      currentItem = null;
    }, { passive: true });

    // 鼠标事件 - 循环滚动
    overlay.addEventListener('mousedown', (e) => {
      // 找到被点击的item
      const item = e.target.closest('.wine-item');
      if (!item) return;
      
      currentItem = item;
      startX = e.clientX;
      startTime = Date.now();
      isDragging = true;
      velocity = 0;
    });

    overlay.addEventListener('mousemove', (e) => {
      if (!isDragging || !currentItem) return;
      currentX = e.clientX;
      
      // 计算滑动速度
      const currentTime = Date.now();
      const timeDiff = currentTime - startTime;
      if (timeDiff > 0) {
        velocity = (startX - currentX) / timeDiff;
      }
      
      // 添加拖拽时的视觉反馈
      const diffX = startX - currentX;
      currentItem.style.transform = `translateX(${diffX * 0.3}px) scale(0.95)`;
    });

    overlay.addEventListener('mouseup', (e) => {
      if (!isDragging || !currentItem) return;
      isDragging = false;
      
      // 重置item样式
      currentItem.style.transform = '';
      
      const diffX = startX - currentX;
      const timeDiff = Date.now() - startTime;
      
      // 根据滑动距离和速度判断 - 支持循环滚动
      if (Math.abs(diffX) > 30 || Math.abs(velocity) > 0.5) {
        if (diffX > 0 || velocity > 0) {
          this.nextDrink(); // 向右滑动，下一个
        } else {
          this.prevDrink(); // 向左滑动，上一个
        }
      }
      
      currentItem = null;
    });

    // 防止拖拽时选中文本
    overlay.addEventListener('selectstart', (e) => {
      e.preventDefault();
    });
  }

  // 打开酒单
  openWineMenu() {
    const overlay = document.getElementById('wineMenuOverlay');
    overlay.classList.add('show');
    
    // 添加背景模糊效果
    document.body.classList.add('wine-menu-open');
    
    // 延迟渲染，确保动画流畅
    setTimeout(() => {
      this.renderWineList();
    }, 100);
  }

  // 关闭酒单
  closeWineMenu() {
    const overlay = document.getElementById('wineMenuOverlay');
    overlay.classList.remove('show');
    
    // 移除背景模糊效果
    document.body.classList.remove('wine-menu-open');
  }

  // 渲染酒单列表
  renderWineList() {
    const viewport = document.getElementById('wineListViewport');
    if (!viewport) return;

    viewport.innerHTML = '';
    
    this.drinksData.forEach((drink, index) => {
      const item = this.createWineItem(drink, index);
      viewport.appendChild(item);
    });

    // 确保第一个item（男主人珍藏）在屏幕正中
    this.currentIndex = 0;
    this.updateScrollPosition();
  }

  // 创建酒水选项
  createWineItem(drink, index) {
    const item = document.createElement('div');
    item.className = 'wine-item';
    item.dataset.index = index;
    
    item.innerHTML = `
      <div class="wine-top">
        ${drink.subtitle}
      </div>
      <div class="wine-image">
        <img src="${drink.image}" alt="${drink.label}" />
      </div>
      <div class="wine-bottom">
        <div class="wine-label">${drink.label}</div>
      </div>
    `;

    // 点击事件
    item.addEventListener('click', () => {
      this.selectDrink(index);
    });

    return item;
  }

  // 选择酒水
  selectDrink(index) {
    this.currentIndex = index;
    this.updateScrollPosition();
    
    // 延迟跳转，让用户看到选中效果
    setTimeout(() => {
      const drink = this.drinksData[index];
      if (drink && drink.link) {
        window.location.href = drink.link;
      }
    }, 300);
  }

  // 下一个酒水
  nextDrink() {
    if (this.isAnimating) return; // 防止动画期间重复触发
    this.currentIndex = (this.currentIndex + 1) % this.drinksData.length;
    this.updateScrollPosition();
  }

  // 上一个酒水
  prevDrink() {
    if (this.isAnimating) return; // 防止动画期间重复触发
    this.currentIndex = this.currentIndex === 0 ? this.drinksData.length - 1 : this.currentIndex - 1;
    this.updateScrollPosition();
  }

  // 更新滚动位置 - 循环滚动和完美居中
  updateScrollPosition() {
    const viewport = document.getElementById('wineListViewport');
    if (!viewport) return;

    this.isAnimating = true; // 开始动画

    const items = viewport.querySelectorAll('.wine-item');
    const itemWidth = 340; // 每个选项的宽度（包含间距）
    const viewportWidth = viewport.offsetWidth;
    
    // 计算完美居中的滚动位置
    const centerOffset = viewportWidth / 2 - itemWidth / 2;
    let scrollPosition = this.currentIndex * itemWidth - centerOffset;
    
    // 确保滚动位置不为负数，并且考虑padding
    scrollPosition = Math.max(0, scrollPosition);
    
    // 使用更丝滑的滚动动画
    viewport.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });

    // 更新选中状态
    items.forEach((item, index) => {
      const isActive = index === this.currentIndex;
      item.classList.toggle('active', isActive);
      
      // 添加缩放动画
      if (isActive) {
        item.style.transform = 'scale(1.05)';
        setTimeout(() => {
          item.style.transform = 'scale(1)';
        }, 200);
      }
    });

    // 动画结束后重置状态
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }
}

// 全局函数，供HTML调用
function openWineMenu() {
  if (window.wineMenu) {
    window.wineMenu.openWineMenu();
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  window.wineMenu = new WineMenu();
});
