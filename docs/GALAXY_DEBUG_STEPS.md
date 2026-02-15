# 银河系旋转调试步骤

## 问题诊断

如果调整旋转参数没有任何变化，请按以下步骤排查：

### 步骤 1: 确认银河系可见
1. 启动应用
2. 使用鼠标滚轮或触控板缩放相机
3. 缩放到距离太阳 **1000 光年以上**（左上角会显示距离）
4. 银河系应该开始显示（半透明的银河图像）

**如果看不到银河系：**
- 检查 `src/lib/config/galaxyConfig.ts` 中 `GALAXY_CONFIG.enabled` 是否为 `true`
- 检查浏览器控制台是否有纹理加载错误
- 确认纹理文件存在：
  - `/public/textures/planets/MilkyWayTop_Gaia_2100.jpg`
  - `/public/textures/planets/MilkyWaySide_Gaia_5000_2.jpg`

### 步骤 2: 打开调试器
1. 点击右下角的 "🔧 银河系调试" 按钮
2. 调试器面板应该出现
3. 查看是否显示 "✓ 已连接到银河系渲染器"

**如果没有显示连接状态：**
- 打开浏览器开发者工具（F12）
- 查看控制台是否有警告信息：
  - `⚠️ SceneManager 未找到`
  - `⚠️ GalaxyRenderer 未找到`

### 步骤 3: 测试旋转
1. 点击 "归零测试" 按钮，将所有旋转设为 0°
2. 观察银河系是否有明显变化
3. 尝试将 X 轴旋转设为 90°，观察变化
4. 尝试将 Y 轴旋转设为 90°，观察变化
5. 尝试将 Z 轴旋转设为 90°，观察变化

**预期效果：**
- X 轴旋转：银河系应该上下倾斜
- Y 轴旋转：银河系应该左右旋转
- Z 轴旋转：银河系应该滚动旋转

### 步骤 4: 检查控制台日志
打开浏览器控制台，移动滑块时应该看到：
```
🔧 银河系旋转调试: 更新旋转角度 {x: 0, y: 0, z: 0}
✅ 应用银河系旋转: {x: 0, y: 0, z: 0}
📐 当前银河系旋转: {x: 0, y: 0, z: 0}
```

**如果没有看到日志：**
- 调试器可能没有正确连接
- 检查 React 组件是否正确渲染

### 步骤 5: 检查 Three.js 场景
在浏览器控制台中运行以下命令来检查银河系对象：

```javascript
// 获取场景中的银河系 Group
const galaxy = window.scene?.children.find(obj => obj.name === 'Galaxy');
console.log('银河系 Group:', galaxy);
console.log('旋转:', galaxy?.rotation);
console.log('子对象数量:', galaxy?.children.length);
```

**预期输出：**
- `银河系 Group:` 应该显示一个 THREE.Group 对象
- `旋转:` 应该显示当前的旋转值（弧度）
- `子对象数量:` 应该 > 0（包含 topPlanes 和 sidePlanes）

## 常见问题

### 问题 1: 银河系不可见
**原因：** 相机距离不够远

**解决：**
- 继续缩放到 1000 光年以上
- 检查 `SCALE_VIEW_CONFIG.galaxyShowStart` 和 `galaxyShowFull` 配置

### 问题 2: 旋转没有视觉变化
**可能原因：**
1. 银河系纹理还未加载完成（异步加载）
2. 银河系的 planes 数量为 0（纹理加载失败）
3. 旋转角度变化太小，不明显

**解决：**
1. 等待几秒让纹理加载完成
2. 检查控制台是否有纹理加载错误
3. 尝试极端值（0°, 90°, 180°）来测试

### 问题 3: 调试器按钮不显示
**原因：** 组件未正确集成或 CSS 冲突

**解决：**
- 检查 `src/components/canvas/3d/SolarSystemCanvas3D.tsx` 是否导入了 `GalaxyRotationDebugger`
- 检查 `showGalaxyDebugger` 状态是否正确
- 检查 z-index 是否被其他元素覆盖

### 问题 4: 控制台显示警告
**`⚠️ GalaxyRenderer 未找到`**
- 检查 `GALAXY_CONFIG.enabled` 是否为 `true`
- 检查 `SceneManager` 是否正确初始化了 `GalaxyRenderer`

**`⚠️ SceneManager 未找到`**
- 场景可能还未初始化完成
- 等待场景加载完成后再打开调试器

## 高级调试

### 方法 1: 直接在控制台修改旋转
```javascript
// 获取银河系 Group
const galaxy = window.scene?.children.find(obj => obj.name === 'Galaxy');

// 直接设置旋转（弧度）
if (galaxy) {
  galaxy.rotation.x = 0;
  galaxy.rotation.y = 0;
  galaxy.rotation.z = 0;
  galaxy.updateMatrixWorld(true);
  console.log('已重置银河系旋转');
}
```

### 方法 2: 检查 Group 的变换矩阵
```javascript
const galaxy = window.scene?.children.find(obj => obj.name === 'Galaxy');
console.log('变换矩阵:', galaxy?.matrix);
console.log('世界矩阵:', galaxy?.matrixWorld);
```

### 方法 3: 检查子对象
```javascript
const galaxy = window.scene?.children.find(obj => obj.name === 'Galaxy');
console.log('顶视图平面数量:', galaxy?.children.filter(c => c.renderOrder >= 40).length);
console.log('侧视图平面数量:', galaxy?.children.filter(c => c.renderOrder === 39).length);
```

## 验证修复

修复后，应该能够：
1. ✅ 看到银河系图像
2. ✅ 打开调试器并看到连接状态
3. ✅ 移动滑块时银河系实时旋转
4. ✅ 控制台显示正确的日志
5. ✅ 点击"归零测试"后银河系明显变化

## 需要帮助？

如果以上步骤都无法解决问题，请提供：
1. 浏览器控制台的完整日志
2. 银河系是否可见的截图
3. 相机距离（左上角显示的值）
4. 使用的浏览器和版本
