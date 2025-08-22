# 密码保护系统说明

## 概述

本系统实现了两种访问模式的密码保护机制，确保私密内容的安全性同时提供良好的用户体验。

## 两种访问模式

### 1. 常规路径（推荐）
**流程**：`private.html` → 密码验证 → 目标页面

- 用户从 `page/private.html` 页面进入
- 点击门的热点区域，跳转到 `locked_files/master.html`
- 输入密码验证成功后，保存 **Tab 会话**（sessionStorage）
- 跳转到目标页面（如 `private/master.html`）
- **同一 Tab 内**访问其他受保护页面无需再次验证

### 2. 直接链接（临时访问）
**流程**：直接访问目标页面 → 密码验证

- 用户直接访问受保护的页面（如 `private/master.html`）
- 页面守卫脚本检测到无有效会话，弹出密码验证界面
- 验证成功后，保存 **长期会话**（localStorage）
- 显示原页面内容

## 安全特性

### 会话管理
- **Tab 会话**：存储在 `sessionStorage`，30分钟过期
  - 仅在同一 Tab 内有效
  - 关闭 Tab 或刷新页面后失效
  - 适用于常规路径访问

- **长期会话**：存储在 `localStorage`，24小时过期
  - 跨 Tab 有效
  - 浏览器关闭后仍有效
  - 适用于直接链接访问

### 访问路径检测
系统会自动检测访问路径类型：
- 来源页面包含 `private.html` → 常规路径
- 来源页面包含 `locked_files/` → 常规路径
- 无来源页面或直接访问 → 直接链接

## 文件结构

```
js/
├── password-protection.js    # 核心密码保护脚本
└── ...

private/
├── master.html              # 受保护页面1
├── filet-o-fish.html        # 受保护页面2
└── ...

locked_files/
├── master.html              # 密码验证页面
└── ...

page/
├── private.html             # 入口页面
└── ...
```

## 使用方法

### 1. 在受保护页面中引入脚本
```html
<script src="../js/password-protection.js"></script>
```

### 2. 在入口页面中设置跳转链接
```html
<a href="../locked_files/master.html">进入受保护区域</a>
```

### 3. 在密码验证页面中保存会话
```javascript
// 验证成功后保存Tab会话
function saveTabSession() {
  const session = {
    timestamp: Date.now(),
    expiry: Date.now() + (30 * 60 * 1000) // 30分钟
  };
  sessionStorage.setItem('private_tab_session', JSON.stringify(session));
}
```

## 测试

使用 `test-password-flow.html` 页面可以测试整个密码保护流程：

1. **常规路径测试**：点击"进入 Private 页面" → 点击门热点 → 验证密码
2. **直接链接测试**：直接点击受保护页面链接
3. **会话状态检查**：查看当前会话状态和过期时间
4. **清除会话**：清除所有会话进行重新测试

## 预期行为

- ✅ 常规路径：验证一次后，同一 Tab 内无需再次验证
- ✅ 直接链接：每次访问都需要重新验证
- ✅ 页面刷新：需要重新验证
- ✅ 新开 Tab：需要重新验证
- ✅ 会话过期：自动清除过期会话

## 技术细节

### 密码
- 默认密码：`0524`
- 可在 `password-protection.js` 中修改

### 会话键名
- Tab 会话：`private_tab_session`
- 长期会话：`private_access_granted`

### 过期时间
- Tab 会话：30分钟
- 长期会话：24小时

## 调试

打开浏览器开发者工具的控制台，可以看到详细的日志输出：
- 访问路径检测结果
- 会话状态检查
- 认证过程详情
