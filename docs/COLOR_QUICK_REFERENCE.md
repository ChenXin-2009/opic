# 颜色主题快速参考

## 🎨 当前配色方案

### 主色调
- **背景**: 黑色 (#000000)
- **主要元素**: 白色 (#FFFFFF)
- **次要元素**: 灰色 (#9CA3AF, #6B7280, #4B5563)

### 功能色
- **前进/未来**: 蓝色 (#3B82F6, #60A5FA)
- **后退/过去**: 红色 (#EF4444), 橙色 (#FB923C)
- **警告**: 黄色 (#FACC15)
- **成功**: 绿色 (调试器状态)

## 📍 主要组件颜色

### 加载页面
```
几何元素: white/10 - white/80
进度条: white/20 (背景), white (填充)
加载点: white/60
文字: white/80
```

### 时间控制
```
前进指示: blue (#3B82F6)
后退指示: red (#EF4444)
"现在"按钮: blue (#3B82F6)
时间差文字（未来）: blue (#60A5FA)
时间差文字（过去）: orange (#FB923C)
```

### 按钮
```
调试按钮: gray-600 (#4B5563)
悬停: gray-700 (#374151)
错误按钮: gray-500 (#6B7280)
```

## 🔧 快速修改

### 改变加载动画颜色
文件: `src/components/loading/LoadingSpinner.tsx`
```tsx
// 将 white 替换为其他颜色
border-white/20 → border-blue-500/20
```

### 改变时间控制颜色
文件: `src/lib/config/visualConfig.ts`
```typescript
// TIME_SLIDER_CONFIG
forwardColorCenter: 'rgba(59, 130, 246, 0.6)'  // 蓝色前进
backwardColorCenter: 'rgba(239, 68, 68, 0.6)'  // 红色后退
```

### 改变按钮颜色
文件: `src/components/GalaxyRotationDebugger.tsx`
```tsx
bg-gray-600 hover:bg-gray-700
```

## 📊 不透明度层次

| 用途 | 不透明度 | 示例 |
|------|----------|------|
| 背景元素 | 10-20% | white/10, white/20 |
| 装饰元素 | 25-40% | white/30, white/40 |
| 次要元素 | 50-60% | white/50, white/60 |
| 主要元素 | 80-100% | white/80, white |

## 🎯 设计原则

1. **高对比度**: 白色在黑色背景上
2. **层次分明**: 使用不透明度区分重要性
3. **简洁优雅**: 避免过多颜色
4. **功能明确**: 蓝色=前进/未来，红色=后退/过去

## 📝 相关文档

- 完整说明: `docs/COLOR_THEME_UPDATE.md`
- 太阳颜色: `docs/SUN_QUICK_REFERENCE.md`
