# 银河系对齐最终配置

## 配置值

通过 `GalaxyReferenceDebugger` 调试工具确定的最终旋转偏移值：

```typescript
rotationOffsetX: 58.0°
rotationOffsetY: -21.0°
rotationOffsetZ: 59.5°
```

## 应用位置

这些值已应用到 `src/lib/3d/SceneManager.ts` 的构造函数中：

```typescript
constructor(container: HTMLElement) {
  this.container = container;
  
  // 创建宇宙尺度组（包含外部星团和蓝色圆圈）
  this.universeGroup = new THREE.Group();
  this.universeGroup.name = 'UniverseGroup';
  
  // 应用旋转偏移以对齐银河系和外部星团坐标系
  // 这些值通过 GalaxyReferenceDebugger 调试得出
  const degToRad = Math.PI / 180;
  this.universeGroup.rotation.order = 'YXZ';
  this.universeGroup.rotation.x = 58.0 * degToRad;
  this.universeGroup.rotation.y = -21.0 * degToRad;
  this.universeGroup.rotation.z = 59.5 * degToRad;
  
  // ... 其余代码
}
```

## 效果

应用这些配置后：

1. ✅ 蓝色圆圈（银河系平面标记）与银河系俯视图对齐
2. ✅ 从侧面观察时，蓝色圆圈与银河系侧视图平行
3. ✅ 外部星团的方向与银河系坐标系一致
4. ✅ 从任意角度观察都保持正确的对齐关系

## 坐标系说明

### 旋转顺序：YXZ

这意味着旋转按以下顺序应用：
1. 先绕 Y 轴旋转（偏航，Yaw）
2. 再绕 X 轴旋转（俯仰，Pitch）
3. 最后绕 Z 轴旋转（滚转，Roll）

### 各轴含义

- **X 轴旋转 (58.0°)**: 俯仰角度，控制上下倾斜
- **Y 轴旋转 (-21.0°)**: 偏航角度，控制左右转向
- **Z 轴旋转 (59.5°)**: 滚转角度，控制平面内旋转

## 物理意义

这些旋转值将外部星团坐标系（超银道坐标系）转换到与银河系坐标系（银道坐标系）对齐的方向。

### 银河系基础旋转

银河系图片本身已经有基础旋转（在 `galaxyConfig.ts` 中定义）：
```typescript
rotationX: -60.2°  // 银道面相对于黄道面的倾角
rotationY: 13.4°   // 银河中心方向（人马座）
rotationZ: 103.0°  // 银道面滚转角度
```

### 宇宙组旋转

宇宙组的旋转（58.0°, -21.0°, 59.5°）是在场景坐标系中应用的，用于：
- 将外部星团坐标系旋转到正确的方向
- 使蓝色圆圈（代表外部星团坐标系中的银河系位置）与银河系图片对齐

## 验证方法

### 1. 俯视角度验证
- 从银河系北极方向观察
- 蓝色圆圈应该与银河系俯视图重合
- 外部星团的分布应该合理

### 2. 侧视角度验证
- 从银河系平面侧面观察
- 蓝色圆圈应该与银河系侧视图平行
- 可以看到银河系的厚度

### 3. 银河中心方向验证
- 观察人马座方向（银河中心）
- 蓝色圆圈的方向应该指向正确的位置
- 外部星团的分布应该符合观测数据

### 4. 多角度验证
- 从不同角度旋转观察
- 对齐关系应该在所有角度都保持一致
- 没有明显的错位或扭曲

## 调试器使用

调试器已设置初始值为当前配置：
```typescript
<GalaxyReferenceDebugger 
  initialRotation={{ x: 58.0, y: -21.0, z: 59.5 }}
  onRotationChange={(x, y, z) => {
    sceneManager.setUniverseGroupRotationOffset(x, y, z);
  }}
/>
```

如果需要微调：
1. 打开调试器
2. 滑块会显示当前值（58.0°, -21.0°, 59.5°）
3. 调整滑块进行微调
4. 找到更好的值后，更新 `SceneManager.ts` 中的配置

## 技术细节

### 旋转矩阵

这些欧拉角会被转换为旋转矩阵：
```
R = Rz(59.5°) * Rx(58.0°) * Ry(-21.0°)
```

### 四元数表示

Three.js 内部使用四元数来避免万向节锁：
```typescript
const euler = new THREE.Euler(
  58.0 * Math.PI / 180,
  -21.0 * Math.PI / 180,
  59.5 * Math.PI / 180,
  'YXZ'
);
const quaternion = new THREE.Quaternion().setFromEuler(euler);
```

## 历史记录

- **2026-02-16**: 初始配置确定
  - X: 58.0°
  - Y: -21.0°
  - Z: 59.5°
  - 通过调试器手动调整得出
  - 验证通过，对齐效果良好

## 未来改进

如果需要更精确的对齐：
1. 使用天文观测数据计算理论值
2. 对比理论值和调试值
3. 分析差异原因
4. 可能需要调整银河系图片的基础旋转

## 参考资料

- [银道坐标系](https://en.wikipedia.org/wiki/Galactic_coordinate_system)
- [超银道坐标系](https://en.wikipedia.org/wiki/Supergalactic_coordinate_system)
- [欧拉角](https://en.wikipedia.org/wiki/Euler_angles)
- [Three.js 旋转文档](https://threejs.org/docs/#api/en/math/Euler)

## 维护说明

如果将来需要修改这些值：
1. 使用调试器进行调整
2. 从多个角度验证对齐效果
3. 更新 `SceneManager.ts` 中的配置
4. 更新 `SolarSystemCanvas3D.tsx` 中的初始值
5. 更新本文档记录新的配置值
6. 添加修改原因和日期到历史记录

## 联系方式

如有问题或建议，请：
- 查看 `docs/GALAXY_REFERENCE_ALIGNMENT_CN.md` 了解详细说明
- 查看 `docs/UNIVERSE_GROUP_ROTATION_FIX_CN.md` 了解实现原理
- 提交 GitHub Issue
