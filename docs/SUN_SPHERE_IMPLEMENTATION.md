# 太阳实体球体与光球层效果实现

## 概述
为太阳添加了实体球体，使用正确的物理比例（0.00465 AU ≈ 696,340 km），并实现了真实的光球层视觉效果。

## 科学背景

### 太阳的真实颜色
- **色温**: 5778K（开尔文）
- **颜色**: 接近白色，略带黄色
- **RGB值**: (255, 249, 240) 或 #FFF9F0
- **常见误解**: 太阳看起来是黄色是因为地球大气层的散射效应，在太空中看太阳实际上是白色的

### 光球层特征
1. **边缘变暗（Limb Darkening）**
   - 太阳边缘比中心暗约 40%
   - 原因：边缘处观察到的是较冷的外层大气

2. **米粒组织（Granulation）**
   - 对流层产生的细小颗粒状结构
   - 典型尺寸：约 1000 km
   - 寿命：约 8-20 分钟

3. **表面扰动**
   - 对流运动产生的大尺度湍流
   - 动态变化的表面纹理

## 修改内容

### 1. Planet.ts - 太阳着色器材质
**位置**: `src/lib/3d/Planet.ts` (createSunShaderMaterial 方法)

**特性**:
- 科学的太阳颜色（#FFF9F0，色温5778K）
- 边缘变暗效果（limb darkening）
- 动态表面扰动（模拟对流层）
- 米粒组织纹理（granulation）
- 边缘发光效果
- 实时动画（表面缓慢变化）

**着色器实现**:
```glsl
// 边缘变暗
float limbDarkening = pow(fresnel, uLimbDarkeningStrength);

// 表面扰动（对流层）
float turbulence = fbm(uvDistorted) * uTurbulenceStrength;

// 米粒组织
float granules = noise(uvGranules) * uGranuleStrength;

// 组合效果
float brightness = limbDarkening + turbulence + granules;
```

### 2. visualConfig.ts - 太阳着色器配置
**位置**: `src/lib/config/visualConfig.ts` (SUN_SHADER_CONFIG)

**可调参数**:
```typescript
export const SUN_SHADER_CONFIG = {
  color: 0xFFF9F0,              // 科学色温5778K
  intensity: 1.2,                // 发光强度
  limbDarkeningStrength: 0.6,    // 边缘变暗强度
  turbulenceStrength: 0.15,      // 表面扰动强度
  granuleStrength: 0.08,         // 米粒组织强度
  animationSpeed: 0.05,          // 动画速度
};
```

### 3. 颜色统一更新
所有太阳相关的颜色都更新为科学的 #FFF9F0：
- 太阳球体着色器
- 太阳点光源（SUN_LIGHT_CONFIG）
- 太阳光晕（SUN_GLOW_CONFIG）

## 视觉效果

### 近距离观察
- 实体的白色光球（略带黄色）
- 中心明亮，边缘较暗（limb darkening）
- 表面有细微的颗粒感（米粒组织）
- 缓慢变化的表面纹理（对流运动）

### 中距离观察
- 光球与光晕的完美结合
- 真实的恒星外观
- 边缘发光效果

### 远距离观察
- 光晕效果增强
- 四芒星效果显示
- 类似望远镜观测的效果

## 技术细节

### 着色器技术
1. **噪声函数**: 使用 hash 和 noise 函数生成程序化纹理
2. **分形布朗运动（FBM）**: 创建多层次的表面细节
3. **菲涅尔效应**: 计算边缘发光
4. **实时动画**: 通过 uTime uniform 驱动表面变化

### 性能优化
- 使用简化的噪声算法
- FBM 只迭代 4 次
- 着色器在 GPU 上高效运行
- 64 分段数提供平滑外观但不过度消耗

### 物理准确性
- 色温基于黑体辐射理论
- 边缘变暗符合辐射传输理论
- 表面纹理模拟真实的对流模式

## 配置调整指南

### 增强边缘变暗
```typescript
limbDarkeningStrength: 0.8  // 更暗的边缘
```

### 增加表面活动
```typescript
turbulenceStrength: 0.25    // 更明显的对流
granuleStrength: 0.12       // 更明显的颗粒
animationSpeed: 0.1         // 更快的变化
```

### 调整亮度
```typescript
intensity: 1.5              // 更亮的太阳
```

### 改变颜色（不推荐）
```typescript
color: 0xFFFFFF             // 纯白色
color: 0xFFE4B5             // 更黄的色调
```

## 与其他效果的协同

### 光晕系统
- 球体提供实体感
- 光晕提供辉光效果
- 两者颜色统一（#FFF9F0）

### 点光源
- 照亮周围行星
- 颜色与球体一致
- 模拟真实的太阳光照

### 四芒星效果
- 远距离时显示
- 模拟望远镜衍射
- 增强恒星感

## 未来改进方向

### 高级特性
1. **太阳黑子**
   - 添加暗斑纹理
   - 11年周期变化

2. **日冕**
   - 外层大气效果
   - 日冕物质抛射（CME）

3. **耀斑**
   - 随机的亮斑
   - 动态闪烁效果

4. **色球层**
   - 边缘的红色层
   - 日珥效果

### 性能优化
1. **LOD系统**
   - 远距离简化着色器
   - 近距离增加细节

2. **贴图替代**
   - 使用预渲染的太阳贴图
   - 减少实时计算

## 参考资料

### 科学数据来源
- NASA Solar Dynamics Observatory (SDO)
- ESA/NASA Solar and Heliospheric Observatory (SOHO)
- IAU 太阳物理数据

### 视觉参考
- NASA 太阳图像库
- 专业天文摄影
- 科学可视化标准

## 测试建议

1. **颜色验证**
   - 对比真实太阳照片
   - 检查色温是否准确

2. **边缘变暗**
   - 观察中心与边缘的亮度差异
   - 应该有明显但自然的过渡

3. **表面细节**
   - 近距离观察颗粒感
   - 验证动画是否平滑

4. **整体效果**
   - 从不同距离观察
   - 检查与光晕的配合
