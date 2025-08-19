// 批量转换脚本：将现有HTML文件转换为使用统一CSS
// 使用方法：在Node.js环境中运行此脚本

const fs = require('fs');
const path = require('path');

// 要转换的文件列表
const filesToConvert = [
    '2049.html',
    'marrige.html', 
    'berlin.html',
    'domestication/chapter1.html',
    'domestication/chapter2.html',
    'domestication/chapter3.html',
    'domestication/chapter4.html',
    'domestication/chapter5.html',
    'domestication/chapter6.html',
    'domestication/chapter7.html',
    'domestication/chapter8.html',
    'domestication/chapter9.html',
    'domestication/tame10.html'
];

// 转换单个文件
function convertFile(filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // 检查是否已经使用了统一CSS
        if (content.includes('article.css')) {
            console.log(`跳过 ${filePath} - 已经使用统一CSS`);
            return;
        }
        
        // 移除内联样式
        const styleRegex = /<style>[\s\S]*?<\/style>/g;
        content = content.replace(styleRegex, '');
        
        // 在</head>前添加CSS引用
        const headCloseRegex = /<\/head>/;
        const cssLink = '    <link rel="stylesheet" href="article.css">\n';
        content = content.replace(headCloseRegex, cssLink + '</head>');
        
        // 保存文件
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✓ 已转换 ${filePath}`);
        
    } catch (error) {
        console.error(`✗ 转换失败 ${filePath}:`, error.message);
    }
}

// 主函数
function main() {
    console.log('开始批量转换到统一CSS...\n');
    
    filesToConvert.forEach(file => {
        convertFile(file);
    });
    
    console.log('\n转换完成！');
    console.log('\n使用说明：');
    console.log('1. 所有文件现在都使用 article.css 作为样式源');
    console.log('2. 要修改样式，只需编辑 article.css 文件');
    console.log('3. 所有页面会自动应用新的样式');
    console.log('4. 如果需要页面特定的样式，可以在HTML中添加额外的<style>标签');
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = { convertFile, filesToConvert };
