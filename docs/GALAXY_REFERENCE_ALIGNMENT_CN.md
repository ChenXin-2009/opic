# 银河系参考系对齐指南

## 问题描述

在外部星团视图中，有一个蓝色圆圈标记代表银河系在外部星团坐标系中的位置。目前这个蓝色圆圈与银河系的俯视图和侧视图有大约90度的夹角，需要调整使其对齐。

## 重要理解

### 坐标系层级结构

```
Scene (场景)
├── SolarSystem (太阳系) - 黄道坐标系
├── NearbyStars (近邻恒星) - 赤道坐标系
├── GalaxyRenderer (银河系图片) - 银道坐标系
│   ├── TopView (俯视图)
│   └── SideView (侧视图)
└── UniverseGroup (宇宙组) ← 这是关键！
    ├── GalaxyPlaneDebugRenderer (蓝色圆圈)
    ├── LocalGroupRenderer (本星系群)
    ├── LaniakeaSuperclusterRenderer (拉尼亚凯亚超星系团)
    └── 其他外部星团渲染器...
```

### 关键点

1. **蓝色圆圈和外部星团在同一个父容器中** (`universeGroup`)
2. **调整 `universeGroup` 的旋转会同时影响蓝色圆圈和所有外部星团**
3. **银河系图片独立于 `universeGroup`，不会被调整影响**

这样设计的原因：
- 蓝色圆圈代表外部星团坐标系中的银河系位置
- 外部星团和蓝色圆圈必须保持相对位置不变
- 通过旋转整个 `universeGroup`，可以调整外部星团坐标系相对于银河系图片的方向

## 组件说明

### 1. 银河系图片（两张独立的图片）
- **俯视图** (`MilkyWayTop_Gaia_compressed.webp`): 银河系从上方看的视图
- **侧视图** (`MilkyWaySide_Gaia_5000_2.jpg`): 银河系从侧面看的视图
- 这两张图片使用 `GalaxyRenderer.ts` 渲染
- 旋转配置在 `galaxyConfig.ts` 中：
  - `rotationX: -60.2°` (银道面相对于黄道面的倾角)
  - `rotationY: 13.4°` (银河中心方向)
  - `rotationZ: 103.0°` (银道面滚转角度)

### 2. 蓝色圆圈（银河系平面标记）
- 使用 `GalaxyPlaneDebugRenderer.ts` 渲染
- 这是一个半透明的蓝色圆盘，代表外部星团坐标系中的银河系位置
- 位于 `universeGroup` 容器中
- 基础旋转与银河系图片相同（X=-60.2°, Y=13.4°, Z=103.0°）
- 额外的旋转偏移由父容器 `universeGroup` 控制
- 在本星系群尺度（200k-10M光年）时可见

### 3. 外部星团
- 使用 `LaniakeaSuperclusterRenderer.ts` 等渲染器渲染
- 所有外部星团渲染器都添加到 `universeGroup` 容器中
- 与蓝色圆圈在同一个坐标系中
- 坐标系统使用 Mpc（百万秒差距）

### 4. 宇宙组容器 (UniverseGroup)
- 这是一个 `THREE.Group` 容器
- 包含蓝色圆圈和所有外部星团渲染器
- 通过旋转这个容器，可以同时旋转蓝色圆圈和外部星团
- 这样可以调整外部星团坐标系相对于银河系图片的方向

## 调试工具使用

### 启动调试器

1. 打开网页应用
2. 放大到本星系群尺度（200,000 - 10,000,000 光年）
3. 点击右下角的 "🔵 银河系参考系调试" 按钮

### 调整角度

调试器提供三个滑块：
- **X 轴旋转偏移**: 控制俯仰角度（-180° 到 180°）
- **Y 轴旋转偏移**: 控制偏航角度（-180° 到 180°）
- **Z 轴旋转偏移**: 控制滚转角度（-180° 到 180°）

**重要**: 调整滑块时，蓝色圆圈和所有外部星团会一起旋转！

### 观察效果

1. 调整滑块时，蓝色圆圈和外部星团会实时一起旋转
2. 银河系图片（俯视图和侧视图）保持不变
3. 目标是让蓝色圆圈与银河系图片对齐
4. 外部星团的相对位置保持不变（因为它们和蓝色圆圈在同一个坐标系中）

### 保存配置

1. 找到正确的角度后，点击 "复制配置" 按钮
2. 配置会复制到剪贴板，包含：
   - 旋转偏移值
   - 完整的代码片段

## 应用配置

找到正确的角度后，需要将配置应用到代码中：

### 推荐方法：修改 SceneManager.ts

在 `SceneManager` 的构造函数中，创建 `universeGroup` 后添加旋转：

```typescript
constructor(container: HTMLElement) {
  this.container = container;
  
  // 创建宇宙尺度组（包含外部星团和蓝色圆圈）
  this.universeGroup = new THREE.Group();
  this.universeGroup.name = 'UniverseGroup';
  
  // 应用旋转偏移
  const degToRad = Math.PI / 180;
  this.universeGroup.rotation.order = 'YXZ';
  this.universeGroup.rotation.x = 偏移X * degToRad;
  this.universeGroup.rotation.y = 偏移Y * degToRad;
  this.universeGroup.rotation.z = 偏移Z * degToRad;
  
  // ... 其余代码
}
```

### 为什么不修改 GalaxyPlaneDebugRenderer？

因为蓝色圆圈和外部星团必须保持在同一个坐标系中。如果只修改蓝色圆圈的旋转，会导致：
- 蓝色圆圈与外部星团的相对位置错误
- 蓝色圆圈不再代表外部星团坐标系中的银河系位置

正确的做法是旋转整个 `universeGroup` 容器。

## 技术细节

### 坐标系统

1. **太阳系坐标系**: 黄道坐标系（X指向春分点，Y向上，Z完成右手系）
2. **银河系坐标系**: 相对于黄道面旋转
3. **外部星团坐标系**: Mpc坐标系，相对于宇宙中心

### 旋转顺序

- 使用 'YXZ' 旋转顺序（先Y轴，再X轴，最后Z轴）
- 这与天文学中的标准旋转顺序一致

### 可见性控制

蓝色圆圈的可见性由相机距离控制：
- 小于 200,000 光年：不可见
- 200,000 - 10,000,000 光年：渐显
- 大于 10,000,000 光年：完全可见

## 常见问题

### Q: 为什么看不到蓝色圆圈？
A: 需要放大到本星系群尺度（200k-10M光年）。使用鼠标滚轮或触摸手势放大。

### Q: 调整后蓝色圆圈还是不对齐？
A: 确保你在正确的视角观察。尝试从不同角度查看，特别是从侧面和俯视角度。

### Q: 外部星团为什么也在旋转？
A: 这是正确的行为！蓝色圆圈代表外部星团坐标系中的银河系位置，所以它们必须一起旋转。我们调整的是整个外部星团坐标系相对于银河系图片的方向。

### Q: 如何重置调整？
A: 点击调试器中的 "重置" 按钮，所有偏移值会归零。

### Q: 调整会影响银河系图片吗？
A: 不会。调试器只调整 `universeGroup` 的旋转，银河系图片独立于这个容器。

## 下一步

找到正确的角度后：
1. 复制配置
2. 应用到代码中
3. 测试验证
4. 提交代码更改

## 相关文件

- `src/components/GalaxyReferenceDebugger.tsx` - 调试器UI组件
- `src/lib/3d/GalaxyPlaneDebugRenderer.ts` - 蓝色圆圈渲染器
- `src/lib/3d/GalaxyRenderer.ts` - 银河系图片渲染器
- `src/lib/config/galaxyConfig.ts` - 银河系配置
- `src/lib/3d/SceneManager.ts` - 场景管理器
- `src/components/canvas/3d/SolarSystemCanvas3D.tsx` - 主画布组件
