# 银河系旋转调试 - 测试清单

## 启动前检查

- [ ] 确认所有文件已保存
- [ ] 运行 `npm run dev` 启动开发服务器
- [ ] 打开浏览器开发者工具（F12）
- [ ] 切换到 Console 标签

## 基础功能测试

### 1. 场景初始化
- [ ] 页面加载完成
- [ ] 控制台显示：`🔍 调试对象已暴露到 window: scene, camera, sceneManager`
- [ ] 3D 场景正常渲染
- [ ] 可以看到太阳和行星

### 2. 银河系可见性
- [ ] 使用鼠标滚轮缩放相机
- [ ] 缩放到距离 > 1000 光年（左上角显示）
- [ ] 银河系图像开始显示
- [ ] 银河系图像完全显示（距离 > 2000 光年）

### 3. 调试器显示
- [ ] 右下角显示 "🔧 银河系调试" 按钮
- [ ] 点击按钮打开调试器面板
- [ ] 面板显示三个滑块（X/Y/Z 轴）
- [ ] 面板显示 "✓ 已连接到银河系渲染器"
- [ ] 面板显示当前旋转值

## 旋转功能测试

### 4. 归零测试
- [ ] 点击 "归零测试" 按钮
- [ ] 控制台显示：`🔧 银河系旋转调试: 更新旋转角度 {x: 0, y: 0, z: 0}`
- [ ] 控制台显示：`✅ 应用银河系旋转: {x: 0, y: 0, z: 0}`
- [ ] 控制台显示：`📐 当前银河系旋转: {x: 0, y: 0, z: 0}`
- [ ] 银河系视觉上有变化

### 5. X 轴旋转测试
- [ ] 将 X 轴滑块移动到 90°
- [ ] 控制台显示更新日志
- [ ] 银河系上下倾斜
- [ ] 将 X 轴滑块移动到 -90°
- [ ] 银河系反向倾斜

### 6. Y 轴旋转测试
- [ ] 将 Y 轴滑块移动到 90°
- [ ] 控制台显示更新日志
- [ ] 银河系左右旋转
- [ ] 将 Y 轴滑块移动到 -90°
- [ ] 银河系反向旋转

### 7. Z 轴旋转测试
- [ ] 将 Z 轴滑块移动到 90°
- [ ] 控制台显示更新日志
- [ ] 银河系滚动旋转
- [ ] 将 Z 轴滑块移动到 -90°
- [ ] 银河系反向滚动

### 8. 重置功能
- [ ] 点击 "重置" 按钮
- [ ] 所有滑块回到默认值（X:-90, Y:30, Z:90）
- [ ] 控制台显示更新日志
- [ ] 银河系回到默认方向

### 9. 复制配置
- [ ] 调整到满意的角度
- [ ] 点击 "复制配置" 按钮
- [ ] 显示 "配置已复制到剪贴板！" 提示
- [ ] 粘贴到文本编辑器验证格式正确

## 控制台调试测试

### 10. 检查场景对象
在控制台运行：
```javascript
const galaxy = window.scene?.children.find(obj => obj.name === 'Galaxy');
console.log('银河系:', galaxy);
```
- [ ] 输出显示 THREE.Group 对象
- [ ] Group.name 为 'Galaxy'
- [ ] Group.visible 为 true（当距离足够远时）

### 11. 检查旋转值
在控制台运行：
```javascript
const galaxy = window.scene?.children.find(obj => obj.name === 'Galaxy');
console.log('旋转（弧度）:', galaxy?.rotation);
console.log('旋转（度）:', {
  x: galaxy?.rotation.x * 180 / Math.PI,
  y: galaxy?.rotation.y * 180 / Math.PI,
  z: galaxy?.rotation.z * 180 / Math.PI
});
```
- [ ] 输出显示当前旋转值
- [ ] 弧度值与度数值对应正确

### 12. 检查子对象
在控制台运行：
```javascript
const galaxy = window.scene?.children.find(obj => obj.name === 'Galaxy');
console.log('子对象数量:', galaxy?.children.length);
console.log('子对象:', galaxy?.children);
```
- [ ] 子对象数量 > 0
- [ ] 包含 THREE.Mesh 对象
- [ ] Mesh 有纹理贴图

### 13. 手动旋转测试
在控制台运行：
```javascript
const galaxy = window.scene?.children.find(obj => obj.name === 'Galaxy');
if (galaxy) {
  galaxy.rotation.x = 0;
  galaxy.rotation.y = Math.PI / 2;
  galaxy.rotation.z = 0;
  galaxy.updateMatrixWorld(true);
  console.log('已设置旋转为 (0, 90°, 0)');
}
```
- [ ] 银河系立即旋转到新角度
- [ ] 视觉效果明显

### 14. GalaxyRenderer API 测试
在控制台运行：
```javascript
const renderer = window.sceneManager?.getGalaxyRenderer();
console.log('GalaxyRenderer:', renderer);
console.log('当前旋转:', renderer?.getRotation());
renderer?.setRotation(45, 45, 45);
console.log('新旋转:', renderer?.getRotation());
```
- [ ] GalaxyRenderer 对象存在
- [ ] getRotation() 返回正确值
- [ ] setRotation() 生效
- [ ] 银河系视觉上旋转

## 问题诊断

### 如果银河系不可见
- [ ] 检查距离是否 > 1000 光年
- [ ] 检查 `GALAXY_CONFIG.enabled` 是否为 true
- [ ] 检查控制台是否有纹理加载错误
- [ ] 检查纹理文件是否存在

### 如果旋转不生效
- [ ] 检查控制台是否有警告信息
- [ ] 检查 GalaxyRenderer 是否存在
- [ ] 检查 galaxy.children.length 是否 > 0
- [ ] 尝试手动在控制台设置旋转
- [ ] 检查是否等待纹理加载完成

### 如果调试器不显示
- [ ] 检查按钮是否被其他元素遮挡
- [ ] 检查 z-index 设置
- [ ] 检查 React 组件是否正确渲染
- [ ] 检查浏览器控制台是否有错误

## 最终验证

### 15. 完整流程测试
- [ ] 启动应用
- [ ] 缩放到银河系可见
- [ ] 打开调试器
- [ ] 调整到满意的角度
- [ ] 复制配置
- [ ] 粘贴到 `src/lib/config/galaxyConfig.ts`
- [ ] 保存文件
- [ ] 重新加载页面
- [ ] 验证银河系使用新角度

### 16. 性能测试
- [ ] 调整滑块时帧率稳定
- [ ] 没有明显卡顿
- [ ] 控制台没有性能警告

### 17. 浏览器兼容性
- [ ] Chrome/Edge 测试通过
- [ ] Firefox 测试通过
- [ ] Safari 测试通过（如果可用）

## 测试结果

### 通过标准
- ✅ 所有基础功能测试通过
- ✅ 所有旋转功能测试通过
- ✅ 至少一个控制台调试测试通过
- ✅ 完整流程测试通过

### 如果测试失败
1. 记录失败的测试项
2. 查看 `docs/GALAXY_DEBUG_STEPS.md`
3. 在控制台运行诊断命令
4. 提供详细的错误信息和截图

## 测试完成

- [ ] 所有测试项已完成
- [ ] 问题已解决或已记录
- [ ] 文档已更新（如有需要）
- [ ] 代码已提交（如果满意）

---

**测试日期：** ___________  
**测试人员：** ___________  
**测试结果：** ⬜ 通过 ⬜ 失败 ⬜ 部分通过  
**备注：** ___________
