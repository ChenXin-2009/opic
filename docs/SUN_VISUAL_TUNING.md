# 太阳视觉效果调整指南

## 快速调整

所有太阳相关的视觉参数都集中在 `src/lib/config/visualConfig.ts` 文件中，方便快速调整。

## 太阳球体效果 (SUN_SHADER_CONFIG)

### 基础参数

```typescript
export const SUN_SHADER_CONFIG = {
  color: 0xFFF9F0,              // 太阳颜色（科学色温5778K）
  intensity: 1.2,                // 发光强度
  limbDarkeningStrength: 0.6,    // 边缘变暗强度
  turbulenceStrength: 0.15,      // 表面扰动强度
  granuleStrength: 0.08,         // 米粒组织强度
  animationSpeed: 0.05,          // 动画速度
};
```

### 调整效果

#### 1. 改变太阳亮度
```typescript
intensity: 1.5  // 更亮
intensity: 1.0  // 标准
intensity: 0.8  // 更暗
```

#### 2. 调整边缘变暗
```typescript
limbDarkeningStrength: 0.8  // 边缘更暗（更明显的效果）
limbDarkeningStrength: 0.6  // 标准（推荐）
limbDarkeningStrength: 0.4  // 边缘较亮（不太真实）
```

#### 3. 表面活动程度
```typescript
// 平静的太阳
turbulenceStrength: 0.08
granuleStrength: 0.04
animationSpeed: 0.02

// 标准太阳（推荐）
turbulenceStrength: 0.15
granuleStrength: 0.08
animationSpeed: 0.05

// 活跃的太阳
turbulenceStrength: 0.25
granuleStrength: 0.15
animationSpeed: 0.1
```

#### 4. 颜色调整
```typescript
// 科学准确（推荐）
color: 0xFFF9F0  // RGB(255, 249, 240)

// 纯白色
color: 0xFFFFFF  // RGB(255, 255, 255)

// 更黄的色调（不太准确但可能更符合视觉习惯）
color: 0xFFE4B5  // RGB(255, 228, 181)

// 更橙的色调（日落效果）
color: 0xFFD700  // RGB(255, 215, 0)
```

## 太阳光晕效果 (SUN_GLOW_CONFIG)

### 基础参数

```typescript
export const SUN_GLOW_CONFIG = {
  enabled: true,
  radiusMultiplier: 1.5,         // 光晕大小（相对于太阳半径）
  color: 0xFFF9F0,               // 光晕颜色
  opacity: 0.6,                  // 光晕不透明度
  
  // 远距离增强
  farEnhanceStartDistance: 50,
  farEnhanceEndDistance: 200,
  farEnhanceSizeMultiplier: 3.0,
  farEnhanceOpacityMultiplier: 1.5,
};
```

### 调整效果

#### 1. 光晕大小
```typescript
radiusMultiplier: 2.0   // 更大的光晕
radiusMultiplier: 1.5   // 标准（推荐）
radiusMultiplier: 1.0   // 更小的光晕
```

#### 2. 光晕强度
```typescript
opacity: 0.8   // 更明显
opacity: 0.6   // 标准（推荐）
opacity: 0.4   // 更柔和
```

#### 3. 远距离效果
```typescript
// 更早开始增强
farEnhanceStartDistance: 30
farEnhanceEndDistance: 100

// 标准（推荐）
farEnhanceStartDistance: 50
farEnhanceEndDistance: 200

// 更晚开始增强
farEnhanceStartDistance: 100
farEnhanceEndDistance: 300
```

## 太阳点光源 (SUN_LIGHT_CONFIG)

### 基础参数

```typescript
export const SUN_LIGHT_CONFIG = {
  color: 0xFFF9F0,      // 光源颜色
  intensity: 3,         // 光照强度
  distance: 2000,       // 影响范围
  decay: 2,             // 衰减指数
  castShadow: false,    // 是否投射阴影
};
```

### 调整效果

#### 1. 光照强度
```typescript
intensity: 5    // 更亮的照明
intensity: 3    // 标准（推荐）
intensity: 2    // 更柔和的照明
```

#### 2. 影响范围
```typescript
distance: 3000  // 更远的影响
distance: 2000  // 标准（推荐）
distance: 1000  // 更近的影响
```

## 四芒星效果 (SUN_STAR_SPIKES_CONFIG)

### 基础参数

```typescript
export const SUN_STAR_SPIKES_CONFIG = {
  enabled: true,
  showStartDistance: 30,    // 开始显示的距离
  showFullDistance: 80,     // 完全显示的距离
  spikeCount: 4,            // 尖峰数量
  rotationAngle: 45,        // 旋转角度
  lengthMultiplier: 2,      // 长度倍数
  spikeWidth: 8,            // 宽度
  color: '#FFFAF0',         // 颜色
  opacity: 0.6,             // 不透明度
};
```

### 调整效果

#### 1. 显示距离
```typescript
// 更早显示
showStartDistance: 20
showFullDistance: 50

// 标准（推荐）
showStartDistance: 30
showFullDistance: 80

// 更晚显示
showStartDistance: 50
showFullDistance: 120
```

#### 2. 尖峰样式
```typescript
// 更长的尖峰
lengthMultiplier: 3
spikeWidth: 6

// 标准（推荐）
lengthMultiplier: 2
spikeWidth: 8

// 更短更粗的尖峰
lengthMultiplier: 1.5
spikeWidth: 12
```

#### 3. 尖峰数量
```typescript
spikeCount: 4   // 四芒星（推荐）
spikeCount: 6   // 六芒星
spikeCount: 8   // 八芒星
```

## 预设配置

### 1. 科学准确模式（推荐）
```typescript
SUN_SHADER_CONFIG = {
  color: 0xFFF9F0,
  intensity: 1.2,
  limbDarkeningStrength: 0.6,
  turbulenceStrength: 0.15,
  granuleStrength: 0.08,
  animationSpeed: 0.05,
};
```

### 2. 视觉增强模式
```typescript
SUN_SHADER_CONFIG = {
  color: 0xFFE4B5,  // 更黄
  intensity: 1.5,    // 更亮
  limbDarkeningStrength: 0.5,
  turbulenceStrength: 0.2,
  granuleStrength: 0.12,
  animationSpeed: 0.08,
};
```

### 3. 柔和模式
```typescript
SUN_SHADER_CONFIG = {
  color: 0xFFF9F0,
  intensity: 1.0,
  limbDarkeningStrength: 0.4,
  turbulenceStrength: 0.1,
  granuleStrength: 0.05,
  animationSpeed: 0.03,
};
```

### 4. 活跃太阳模式
```typescript
SUN_SHADER_CONFIG = {
  color: 0xFFF9F0,
  intensity: 1.3,
  limbDarkeningStrength: 0.7,
  turbulenceStrength: 0.25,
  granuleStrength: 0.15,
  animationSpeed: 0.1,
};
```

## 调试技巧

### 1. 实时预览
修改配置后，刷新页面即可看到效果。

### 2. 对比测试
可以截图保存不同配置的效果，进行对比。

### 3. 距离测试
- 近距离（点击太阳聚焦）：查看球体细节
- 中距离（缩小到看到几个行星）：查看整体效果
- 远距离（缩小到看到整个太阳系）：查看光晕和四芒星

### 4. 性能监控
如果动画速度过快或表面细节过多，可能影响性能。可以适当降低：
- `animationSpeed`
- `turbulenceStrength`
- `granuleStrength`

## 常见问题

### Q: 太阳看起来太黄了
A: 调整 `color` 为更白的色调，如 `0xFFFFFF` 或 `0xFFFAF5`

### Q: 边缘太暗了
A: 降低 `limbDarkeningStrength` 到 0.4-0.5

### Q: 表面太平滑了
A: 增加 `turbulenceStrength` 和 `granuleStrength`

### Q: 动画太快/太慢
A: 调整 `animationSpeed`，推荐范围 0.02-0.1

### Q: 光晕太强/太弱
A: 调整 `SUN_GLOW_CONFIG.opacity` 和 `radiusMultiplier`

### Q: 四芒星不显示
A: 检查 `enabled: true` 并确保相机距离足够远（> showStartDistance）
