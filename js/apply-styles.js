// 自动应用统一CSS样式的脚本
// 使用方法：在HTML文件的<head>部分添加这个脚本

(function() {
    'use strict';
    
    // 检查是否已经加载了统一的CSS
    function isArticleCSSLoaded() {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        for (let link of links) {
            if (link.href.includes('article.css')) {
                return true;
            }
        }
        return false;
    }
    
    // 动态加载CSS文件
    function loadArticleCSS() {
        if (isArticleCSSLoaded()) {
            return; // 已经加载过了
        }
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = '../style/article.css';
        link.id = 'article-unified-css';
        
        document.head.appendChild(link);
        
        console.log('Article统一CSS样式已加载');
    }
    
    // 移除内联样式（可选）
    function removeInlineStyles() {
        const styleTags = document.querySelectorAll('style');
        styleTags.forEach(style => {
            // 保留非article相关的样式
            if (!style.textContent.includes('.article-container') && 
                !style.textContent.includes('.chapter-title') &&
                !style.textContent.includes('.author-info') &&
                !style.textContent.includes('.content-area')) {
                return; // 保留这个style标签
            }
            
            // 移除article相关的内联样式
            style.remove();
            console.log('已移除内联article样式');
        });
    }
    
    // 初始化
    function init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                loadArticleCSS();
                // removeInlineStyles(); // 可选：移除内联样式
            });
        } else {
            loadArticleCSS();
            // removeInlineStyles(); // 可选：移除内联样式
        }
    }
    
    // 启动脚本
    init();
})();
