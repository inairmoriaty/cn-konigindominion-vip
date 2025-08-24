# 层级会话机制设计文档

## 概述

重新设计的密码守卫机制采用层级化会话管理，确保用户在不同层级的私密页面间导航时无需重复输入密码。

## 层级结构

```
page/private.html (入口页面)
    ↓
locked_files/ (密码验证页面)
    ↓
private/ (私密页面层级)
    ↓
article/private/ (文章页面层级)
```

## 会话类型

### 1. 层级会话 (Hierarchy Sessions)
- **private_hierarchy_session**: 解锁 private 文件夹下的所有页面
- **article_hierarchy_session**: 解锁 article/private 文件夹下的所有页面

### 2. 页面会话 (Page Sessions)
- **master_tab_session**: Master 页面的 Tab 会话
- **filet_o_fish_tab_session**: Filet-o-Fish 页面的 Tab 会话
- **master_access_granted**: Master 页面的长期会话
- **filet_o_fish_access_granted**: Filet-o-Fish 页面的长期会话

## 访问流程

### 正常流程 (通过 page/private.html)
1. **page/private.html** → 点击选项
2. **locked_files/xxx.html** → 输入密码验证
3. 保存 `xxx_tab_session` + `private_hierarchy_session`
4. **private/xxx.html** → 无需密码验证
5. 点击跳转到 article 页面时保存 `article_hierarchy_session`
6. **article/private/xxx.html** → 无需密码验证

### 直接访问 private 页面
1. **private/xxx.html** → 触发密码守卫
2. 输入密码验证
3. 保存 `xxx_access_granted` + `private_hierarchy_session`
4. 页面正常显示
5. 点击跳转到 article 页面时保存 `article_hierarchy_session`
6. **article/private/xxx.html** → 无需密码验证

### 直接访问 article 页面
1. **article/private/xxx.html** → 触发密码守卫
2. 输入密码验证
3. 保存 `xxx_access_granted` + `article_hierarchy_session`
4. 页面正常显示

## 认证逻辑

### 层级认证检查
```javascript
isHierarchyAuthenticatedForPage() {
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('/article/private/')) {
    // 检查 private 或 article 层级会话
    return this.isHierarchyAuthenticated('private') || 
           this.isHierarchyAuthenticated('article');
  } else if (currentPath.includes('/private/')) {
    // 检查 private 层级会话
    return this.isHierarchyAuthenticated('private');
  }
  
  // 其他页面使用原有认证逻辑
  return this.isAuthenticated();
}
```

### 会话保存逻辑
```javascript
// 密码验证成功后
if (accessPath === 'regular') {
  this.saveTabSession();
  
  if (currentPath.includes('/article/private/')) {
    this.saveHierarchySession('article');
  } else if (currentPath.includes('/private/')) {
    this.saveHierarchySession('private');
  }
} else {
  this.saveSession();
  
  if (currentPath.includes('/article/private/')) {
    this.saveHierarchySession('article');
  } else if (currentPath.includes('/private/')) {
    this.saveHierarchySession('private');
  }
}
```

## 实现细节

### 1. 密码保护系统增强
- 添加了层级会话管理方法
- 修改了认证检查逻辑
- 支持层级化的会话保存

### 2. locked_files 页面修改
- 保存页面会话 + private 层级会话
- 确保正常流程的层级解锁

### 3. private 页面修改
- 在跳转到 article 页面时保存 article 层级会话
- 支持触摸事件和移动端优化

### 4. 会话过期时间
- 层级会话：30分钟 (sessionStorage)
- 页面长期会话：24小时 (localStorage)
- 页面 Tab 会话：30分钟 (sessionStorage)

## 测试场景

### 场景1：正常流程测试
1. 访问 `page/private.html`
2. 点击 Master 选项
3. 在 `locked_files/master.html` 输入密码 `0524`
4. 验证是否保存了 `master_tab_session` 和 `private_hierarchy_session`
5. 进入 `private/master.html` 验证无需密码
6. 点击跳转到 `article/private/berlin.html` 验证无需密码

### 场景2：直接访问测试
1. 直接访问 `private/master.html`
2. 输入密码验证
3. 验证是否保存了 `master_access_granted` 和 `private_hierarchy_session`
4. 点击跳转到 article 页面验证无需密码

### 场景3：直接访问 article 测试
1. 直接访问 `article/private/berlin.html`
2. 输入密码验证
3. 验证是否保存了 `berlin_access_granted` 和 `article_hierarchy_session`

## 调试工具

### 测试页面
访问 `test-hierarchy-sessions.html` 可以：
- 查看当前所有会话状态
- 手动保存/清除会话
- 测试不同访问路径

### 控制台日志
系统会输出详细的认证和会话管理日志：
```
=== 密码保护系统初始化 ===
当前URL: ...
检测到的页面类型: ...
使用的密码: ...
会话键名: ...
========================
```

## 注意事项

1. **会话键名一致性**：确保所有页面使用相同的会话键名
2. **过期时间设置**：层级会话使用较短的过期时间以增强安全性
3. **移动端兼容**：所有修改都考虑了移动端优化
4. **向后兼容**：保留了原有的页面会话机制

## 文件修改清单

### 核心文件
- `js/password-protection.js` - 密码保护系统核心逻辑
- `locked_files/master.html` - Master 密码验证页面
- `locked_files/filet-o-fish.html` - Filet-o-Fish 密码验证页面

### 页面文件
- `private/master.html` - Master 主页面
- `private/filet-o-fish.html` - Filet-o-Fish 主页面

### 测试文件
- `test-hierarchy-sessions.html` - 层级会话测试页面

## 预期效果

✅ **正常流程**：一次密码验证解锁整个层级
✅ **直接访问**：按需触发密码守卫
✅ **层级共享**：上级解锁后下级无需验证
✅ **会话管理**：自动过期和清理
✅ **移动端优化**：支持触摸交互
