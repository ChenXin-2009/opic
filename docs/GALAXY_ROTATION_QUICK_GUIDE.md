# 银河系旋转调整 - 快速指南

## 🎯 快速步骤

### 1. 打开调试器
```
1. 运行应用
2. 缩放到 1000+ 光年距离
3. 点击右下角 "🔧 银河系调试" 按钮
```

### 2. 调整角度
使用三个滑块实时调整：
- **X 轴（俯仰）**: 上下倾斜
- **Y 轴（偏航）**: 左右旋转  
- **Z 轴（翻滚）**: 滚动旋转

### 3. 保存配置
```
1. 点击 "复制配置" 按钮
2. 打开 src/lib/config/galaxyConfig.ts
3. 粘贴到 GALAXY_CONFIG 中的旋转配置部分
4. 保存文件
```

## 📐 参考值

### 天文参考
- 银河平面倾角：约 60° 相对黄道面
- 银河中心方向：人马座（RA ~266°, Dec ~-29°）
- 太阳距银心：~26,000 光年

### 当前默认值
```typescript
rotationX: -90  // 俯仰
rotationY: 30   // 偏航
rotationZ: 90   // 翻滚
```

## 🔧 调试技巧

### 找到正确方向
1. **先调 Y 轴**: 确定银河系的基本朝向
2. **再调 X 轴**: 调整银河平面的倾斜角度
3. **最后调 Z 轴**: 微调旋臂的展开方向

### 验证方法
- ✅ 银河平面应该倾斜，不是水平的
- ✅ 银河中心应该大致指向人马座方向
- ✅ 旋臂应该自然螺旋展开
- ✅ 太阳应该位于旋臂之间的区域

## 🎨 视觉效果调整

如果需要调整银河系的其他视觉效果，可以修改 `galaxyConfig.ts` 中的：

```typescript
// 透明度
topViewOpacity: 1.0      // 俯视图透明度
sideViewOpacity: 0.05    // 侧视图透明度

// 厚度
layerCount: 3            // 层数
layerThicknessLY: 2000   // 总厚度（光年）

// 翘曲效果
warpEnabled: true        // 启用边缘翘曲
warpAmplitude: 0.08      // 翘曲幅度
warpAngle: 0             // 翘曲方向
```

## 🐛 常见问题

**Q: 银河系看不见？**
- 确保相机距离 > 1000 光年
- 检查 `GALAXY_CONFIG.enabled = true`

**Q: 调试器按钮不显示？**
- 检查是否在 3D 视图模式
- 查看浏览器控制台错误

**Q: 旋转不生效？**
- 确认已点击 "复制配置" 并保存到文件
- 重新加载页面使配置生效

## 📝 配置文件位置
```
src/lib/config/galaxyConfig.ts
```

## 🔗 相关文件
- 调试器组件: `src/components/GalaxyRotationDebugger.tsx`
- 渲染器: `src/lib/3d/GalaxyRenderer.ts`
- 详细文档: `docs/GALAXY_ROTATION_ADJUSTMENT.md`
