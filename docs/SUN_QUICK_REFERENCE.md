# 太阳效果快速参考

## 🎨 颜色

```typescript
// 科学准确（推荐）
color: 0xFFF9F0  // RGB(255, 249, 240) - 色温5778K

// 其他选项
color: 0xFFFFFF  // 纯白色
color: 0xFFE4B5  // 更黄（视觉习惯）
```

## 💡 亮度

```typescript
// 在 SUN_SHADER_CONFIG 中
intensity: 1.5   // 很亮
intensity: 1.2   // 标准（推荐）
intensity: 1.0   // 柔和
```

## 🌓 边缘变暗

```typescript
limbDarkeningStrength: 0.8   // 边缘很暗
limbDarkeningStrength: 0.6   // 标准（推荐）
limbDarkeningStrength: 0.4   // 边缘较亮
```

## 🌊 表面活动

```typescript
// 平静
turbulenceStrength: 0.08
granuleStrength: 0.04
animationSpeed: 0.02

// 标准（推荐）
turbulenceStrength: 0.15
granuleStrength: 0.08
animationSpeed: 0.05

// 活跃
turbulenceStrength: 0.25
granuleStrength: 0.15
animationSpeed: 0.1
```

## ✨ 光晕

```typescript
// 在 SUN_GLOW_CONFIG 中
radiusMultiplier: 1.5   // 光晕大小
opacity: 0.6            // 光晕强度
```

## ⭐ 四芒星

```typescript
// 在 SUN_STAR_SPIKES_CONFIG 中
enabled: true
showStartDistance: 30   // 开始显示距离（AU）
spikeCount: 4          // 尖峰数量
```

## 📍 配置文件位置

```
src/lib/config/visualConfig.ts
```

## 🔧 修改步骤

1. 打开 `src/lib/config/visualConfig.ts`
2. 找到 `SUN_SHADER_CONFIG`
3. 修改参数
4. 保存文件
5. 刷新浏览器

## 📊 效果对比

| 参数 | 低 | 标准 | 高 |
|------|-----|------|-----|
| intensity | 1.0 | 1.2 | 1.5 |
| limbDarkening | 0.4 | 0.6 | 0.8 |
| turbulence | 0.08 | 0.15 | 0.25 |
| granule | 0.04 | 0.08 | 0.15 |
| animation | 0.02 | 0.05 | 0.1 |

## 🎯 推荐设置

### 科学准确
```typescript
color: 0xFFF9F0
intensity: 1.2
limbDarkeningStrength: 0.6
turbulenceStrength: 0.15
granuleStrength: 0.08
animationSpeed: 0.05
```

### 视觉增强
```typescript
color: 0xFFE4B5
intensity: 1.5
limbDarkeningStrength: 0.5
turbulenceStrength: 0.2
granuleStrength: 0.12
animationSpeed: 0.08
```

### 性能优先
```typescript
color: 0xFFF9F0
intensity: 1.0
limbDarkeningStrength: 0.5
turbulenceStrength: 0.1
granuleStrength: 0.05
animationSpeed: 0.03
```

## 🐛 常见问题

| 问题 | 解决方案 |
|------|----------|
| 太黄 | `color: 0xFFFFFF` |
| 太暗 | `intensity: 1.5` |
| 边缘太暗 | `limbDarkeningStrength: 0.4` |
| 太平滑 | 增加 `turbulence` 和 `granule` |
| 动画太快 | 降低 `animationSpeed` |
| 光晕太强 | 降低 `SUN_GLOW_CONFIG.opacity` |

## 📚 详细文档

- 完整实现: `docs/SUN_SPHERE_IMPLEMENTATION.md`
- 调整指南: `docs/SUN_VISUAL_TUNING.md`
- 实现总结: `docs/SUN_IMPLEMENTATION_SUMMARY.md`
