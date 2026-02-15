# 银河系旋转调整 - 完整总结

## 已完成的工作

### 1. 创建了实时调试工具
**文件：** `src/components/GalaxyRotationDebugger.tsx`

**功能：**
- 三个滑块控制 X/Y/Z 轴旋转（-180° 到 180°）
- 实时预览旋转效果
- 显示连接状态
- 一键复制配置
- 归零测试按钮
- 重置到默认值

### 2. 扩展了 GalaxyRenderer API
**文件：** `src/lib/3d/GalaxyRenderer.ts`

**新增方法：**
```typescript
setRotation(x: number, y: number, z: number): void
getRotation(): { x: number; y: number; z: number }
```

**改进：**
- 添加了 `updateMatrixWorld(true)` 强制更新变换矩阵
- 添加了详细的调试日志

### 3. 集成到主画布组件
**文件：** `src/components/canvas/3d/SolarSystemCanvas3D.tsx`

**改动：**
- 导入 `GalaxyRotationDebugger` 组件
- 添加 `showGalaxyDebugger` 状态
- 添加调试器开关按钮
- 连接调试器到 `GalaxyRenderer`
- 暴露 scene/camera/sceneManager 到 window 对象用于控制台调试

### 4. 创建了完整文档
- `docs/GALAXY_ROTATION_ADJUSTMENT.md` - 详细调整指南
- `docs/GALAXY_ROTATION_QUICK_GUIDE.md` - 快速参考
- `docs/GALAXY_DEBUG_STEPS.md` - 问题诊断步骤
- `docs/GALAXY_ROTATION_SUMMARY.md` - 本文档

## 使用方法

### 基本流程
1. 启动应用
2. 缩放到 1000+ 光年距离
3. 点击 "🔧 银河系调试" 按钮
4. 调整滑块观察效果
5. 点击 "复制配置" 保存结果
6. 粘贴到 `src/lib/config/galaxyConfig.ts`

### 快速测试
```typescript
// 在浏览器控制台中运行
const galaxy = window.scene?.children.find(obj => obj.name === 'Galaxy');
console.log('银河系:', galaxy);
console.log('旋转:', galaxy?.rotation);
console.log('子对象:', galaxy?.children.length);

// 手动设置旋转测试
if (galaxy) {
  galaxy.rotation.x = 0;
  galaxy.rotation.y = Math.PI / 2; // 90度
  galaxy.rotation.z = 0;
  galaxy.updateMatrixWorld(true);
}
```

## 问题排查

### 如果旋转没有变化

**检查清单：**
1. ✅ 银河系是否可见？（距离 > 1000 光年）
2. ✅ 调试器是否显示 "已连接到银河系渲染器"？
3. ✅ 控制台是否有日志输出？
4. ✅ 纹理是否加载成功？（检查 Network 标签）
5. ✅ 是否尝试了极端值（0°, 90°, 180°）？

**控制台调试：**
```javascript
// 检查银河系对象
const galaxy = window.scene?.children.find(obj => obj.name === 'Galaxy');
console.log('银河系存在:', !!galaxy);
console.log('银河系可见:', galaxy?.visible);
console.log('子对象数量:', galaxy?.children.length);
console.log('当前旋转（弧度）:', galaxy?.rotation);
console.log('当前旋转（度）:', {
  x: galaxy?.rotation.x * 180 / Math.PI,
  y: galaxy?.rotation.y * 180 / Math.PI,
  z: galaxy?.rotation.z * 180 / Math.PI
});

// 测试旋转
if (galaxy) {
  console.log('测试：设置 Y 轴旋转为 90 度');
  galaxy.rotation.y = Math.PI / 2;
  galaxy.updateMatrixWorld(true);
}
```

**检查 GalaxyRenderer：**
```javascript
const galaxyRenderer = window.sceneManager?.getGalaxyRenderer();
console.log('GalaxyRenderer:', galaxyRenderer);
console.log('是否可见:', galaxyRenderer?.getIsVisible());
console.log('透明度:', galaxyRenderer?.getOpacity());
console.log('当前旋转:', galaxyRenderer?.getRotation());

// 测试 setRotation
if (galaxyRenderer) {
  console.log('测试：设置旋转为 (0, 90, 0)');
  galaxyRenderer.setRotation(0, 90, 0);
  console.log('新旋转:', galaxyRenderer.getRotation());
}
```

## 天文参考

### 银河系方向
- **银河平面倾角：** 约 60° 相对于黄道面
- **银河中心方向：** 人马座（RA ~266°, Dec ~-29°）
- **太阳位置：** 距银心约 26,000 光年
- **银河系直径：** 约 100,000 光年

### 坐标系
- **X 轴：** 指向春分点（赤经 0°）
- **Y 轴：** 指向北天极（赤纬 +90°）
- **Z 轴：** 完成右手坐标系

### 旋转顺序
**YXZ** 欧拉角顺序：
1. 先绕 Y 轴旋转（偏航 - Yaw）
2. 再绕 X 轴旋转（俯仰 - Pitch）
3. 最后绕 Z 轴旋转（翻滚 - Roll）

## 配置文件

### 位置
`src/lib/config/galaxyConfig.ts`

### 旋转配置
```typescript
export const GALAXY_CONFIG = {
  // ... 其他配置
  
  // 旋转配置（度）
  rotationX: -90,  // 俯仰角度
  rotationY: 30,   // 偏航角度
  rotationZ: 90,   // 翻滚角度
  
  // ... 其他配置
};
```

### 其他相关配置
```typescript
// 透明度
topViewOpacity: 1.0      // 俯视图透明度
sideViewOpacity: 0.05    // 侧视图透明度

// 显示阈值（在 SCALE_VIEW_CONFIG 中）
galaxyShowStart: 1000 * LIGHT_YEAR_TO_AU  // 开始显示距离
galaxyShowFull: 2000 * LIGHT_YEAR_TO_AU   // 完全显示距离
```

## 技术细节

### 实现原理
1. 银河系由一个 `THREE.Group` 容器管理
2. Group 包含多个 `THREE.Mesh` 平面（俯视图和侧视图）
3. 旋转应用于 Group 级别，影响所有子对象
4. 使用欧拉角（Euler Angles）表示旋转
5. 旋转顺序为 YXZ

### 性能考虑
- 旋转操作非常轻量，不影响性能
- 纹理异步加载，不阻塞主线程
- 使用 `updateMatrixWorld(true)` 确保变换立即生效

### 已知限制
1. 调试器仅在开发时使用
2. 配置需要手动复制到文件
3. 需要重新加载页面使配置生效

## 下一步

### 如果旋转正常工作
1. 使用调试器找到合适的角度
2. 复制配置到 `galaxyConfig.ts`
3. 保存并重新加载页面
4. 验证效果
5. 可以隐藏或删除调试器按钮

### 如果仍有问题
1. 查看 `docs/GALAXY_DEBUG_STEPS.md` 进行详细诊断
2. 在浏览器控制台运行调试命令
3. 检查纹理文件是否存在
4. 确认 `GALAXY_CONFIG.enabled = true`
5. 提供控制台日志和截图以获取帮助

## 相关文件

### 核心代码
- `src/lib/3d/GalaxyRenderer.ts` - 银河系渲染器
- `src/lib/3d/SceneManager.ts` - 场景管理器
- `src/components/GalaxyRotationDebugger.tsx` - 调试器组件
- `src/components/canvas/3d/SolarSystemCanvas3D.tsx` - 主画布组件

### 配置文件
- `src/lib/config/galaxyConfig.ts` - 银河系配置

### 文档
- `docs/GALAXY_ROTATION_ADJUSTMENT.md` - 详细指南
- `docs/GALAXY_ROTATION_QUICK_GUIDE.md` - 快速参考
- `docs/GALAXY_DEBUG_STEPS.md` - 调试步骤
- `docs/GALAXY_ROTATION_SUMMARY.md` - 本文档

## 更新日志

### 2024-02-14
- ✅ 创建 GalaxyRotationDebugger 组件
- ✅ 添加 setRotation/getRotation 方法
- ✅ 集成到 SolarSystemCanvas3D
- ✅ 添加调试日志
- ✅ 暴露对象到 window
- ✅ 创建完整文档
- ✅ 添加控制台调试命令
- ✅ 修复重复代码问题
