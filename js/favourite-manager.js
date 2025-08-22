// 收藏管理器
class FavouriteManager {
  constructor() {
    this.storageKey = 'favourite_articles';
    this.favourites = this.loadFavourites();
  }

  // 加载收藏列表
  loadFavourites() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favourites:', error);
      return [];
    }
  }

  // 保存收藏列表
  saveFavourites() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.favourites));
    } catch (error) {
      console.error('Error saving favourites:', error);
    }
  }

  // 添加收藏
  addFavourite(articleInfo) {
    const existingIndex = this.favourites.findIndex(item => item.url === articleInfo.url);
    if (existingIndex === -1) {
      this.favourites.push(articleInfo);
      this.saveFavourites();
      return true; // 添加成功
    }
    return false; // 已经存在
  }

  // 移除收藏
  removeFavourite(url) {
    const index = this.favourites.findIndex(item => item.url === url);
    if (index !== -1) {
      this.favourites.splice(index, 1);
      this.saveFavourites();
      return true; // 移除成功
    }
    return false; // 不存在
  }

  // 检查是否已收藏
  isFavourited(url) {
    return this.favourites.some(item => item.url === url);
  }

  // 获取所有收藏
  getAllFavourites() {
    return this.favourites;
  }

  // 清空所有收藏
  clearAllFavourites() {
    this.favourites = [];
    this.saveFavourites();
  }
}

// 创建全局实例
window.favouriteManager = new FavouriteManager();

// 收藏按钮功能
function createFavouriteButton(articleInfo) {
  const button = document.createElement('button');
  button.className = 'favourite-btn';
  button.innerHTML = `
    <svg class="favourite-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
            fill="${window.favouriteManager.isFavourited(articleInfo.url) ? '#ff4757' : 'none'}" 
            stroke="${window.favouriteManager.isFavourited(articleInfo.url) ? '#ff4757' : '#666'}" 
            stroke-width="2"/>
    </svg>
  `;
  
  button.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const isFavourited = window.favouriteManager.isFavourited(articleInfo.url);
    
    if (isFavourited) {
      // 移除收藏
      window.favouriteManager.removeFavourite(articleInfo.url);
      button.innerHTML = `
        <svg class="favourite-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                fill="none" stroke="#666" stroke-width="2"/>
        </svg>
      `;
      showToast('已取消收藏');
    } else {
      // 添加收藏
      window.favouriteManager.addFavourite(articleInfo);
      button.innerHTML = `
        <svg class="favourite-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                fill="#ff4757" stroke="#ff4757" stroke-width="2"/>
        </svg>
      `;
      showToast('已添加到收藏');
    }
  });
  
  return button;
}

// 显示提示信息
function showToast(message) {
  // 移除现有的toast
  const existingToast = document.querySelector('.toast-message');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 10000;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // 3秒后自动消失
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 2000);
}
