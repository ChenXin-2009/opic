# Implementation Plan: Performance Optimization

## Overview

本实施计划将网页加载速度优化分解为一系列可执行的任务。优化包括两个主要部分：字体优化和移除Bright Star Catalogue功能。每个任务都是独立的代码修改步骤，按照依赖关系顺序执行。

## Tasks

- [ ] 1. 字体优化
  - [x] 1.1 修改globals.css使用系统字体栈
    - 从 `src/app/globals.css` 中移除 `@font-face` 声明
    - 更新 `body` 规则的 `font-family` 为系统字体栈
    - 更新 `.font-mono` 规则的 `font-family` 为系统字体栈
    - 字体栈顺序：`'Source Han Serif CN', 'SimSun', serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [x] 1.2 删除字体文件
    - 删除 `public/fonts/SourceHanSerifCN-VF.otf.woff2` 文件
    - 如果 `public/fonts/` 目录为空，可以删除该目录
    - _Requirements: 1.1_
  
  - [ ]* 1.3 验证字体优化
    - 验证字体文件已删除
    - 验证CSS中不包含@font-face声明
    - 验证CSS中使用了正确的系统字体栈
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. 移除Bright Star Catalogue类文件
  - [x] 2.1 删除BrightStarCatalogue.ts
    - 删除 `src/lib/3d/BrightStarCatalogue.ts` 文件
    - _Requirements: 2.1_
  
  - [x] 2.2 删除BSC数据文件
    - 删除 `public/data/V_50/` 整个目录及其所有内容
    - 包括 `catalog/catalog` 数据文件、`notes/` 目录和 `ReadMe` 文件
    - _Requirements: 2.2_
  
  - [ ]* 2.3 验证文件删除
    - 验证BrightStarCatalogue.ts文件已删除
    - 验证V_50目录已删除
    - _Requirements: 2.1, 2.2_

- [ ] 3. 修改SceneManager移除BSC引用
  - [x] 3.1 移除BSC导入语句
    - 从 `src/lib/3d/SceneManager.ts` 中移除 `import { BrightStarCatalogue, BSC_CONFIG } from './BrightStarCatalogue';`
    - _Requirements: 2.3, 2.9_
  
  - [x] 3.2 移除brightStarCatalogue属性
    - 从 `SceneManager` 类中移除 `private brightStarCatalogue: BrightStarCatalogue | null = null;` 属性声明
    - _Requirements: 2.4_
  
  - [x] 3.3 移除BSC初始化代码
    - 从 `initializeMultiScaleView()` 方法中移除BSC初始化代码块：
      ```typescript
      if (BSC_CONFIG.enabled) {
        this.brightStarCatalogue = new BrightStarCatalogue();
        this.scene.add(this.brightStarCatalogue.getGroup());
      }
      ```
    - _Requirements: 2.5_
  
  - [x] 3.4 移除BSC对齐代码
    - 从 `applyStarsAlignment()` 方法中移除BSC对齐代码块：
      ```typescript
      if (this.brightStarCatalogue) {
        this.brightStarCatalogue.getGroup().quaternion.copy(combinedExtraQuat);
      }
      ```
    - _Requirements: 2.7_
  
  - [x] 3.5 移除BSC更新调用
    - 从 `updateMultiScaleView()` 方法中移除BSC更新代码块：
      ```typescript
      if (this.brightStarCatalogue) {
        this.brightStarCatalogue.update(cameraDistance, deltaTime);
      }
      ```
    - _Requirements: 2.6_
  
  - [x] 3.6 更新相机裁剪计算
    - 在 `updateCameraClipping()` 方法中，将 `const minFar = BSC_CONFIG.sphereRadius * 2;` 替换为 `const minFar = 1e6;`
    - 添加注释说明：`// 使用固定的大值（100万AU）确保远处物体不被裁剪`
    - _Requirements: 2.9_
  
  - [x] 3.7 移除BSC清理代码
    - 从 `dispose()` 方法中移除BSC清理代码块：
      ```typescript
      if (this.brightStarCatalogue) {
        this.brightStarCatalogue.dispose();
        this.brightStarCatalogue = null;
      }
      ```
    - _Requirements: 2.8_
  
  - [ ]* 3.8 验证SceneManager修改
    - 验证SceneManager中不包含BrightStarCatalogue导入
    - 验证SceneManager中不包含BSC_CONFIG导入
    - 验证SceneManager中不包含brightStarCatalogue属性
    - 验证SceneManager中不包含BSC相关方法调用
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [ ] 4. 清理注释和文档
  - [x] 4.1 清理SceneManager中的BSC注释
    - 从 `SceneManager.ts` 的注释中移除对BSC的引用
    - 更新 `initializeMultiScaleView()` 的文档注释，不再提及BSC
    - 更新 `applyStarsAlignment()` 的文档注释，将 "BSC/Gaia/NearbyStars" 改为 "Gaia/NearbyStars"
    - 更新 `updateCameraClipping()` 的文档注释，移除对BSC天球壳的引用
    - _Requirements: 4.1, 4.2_
  
  - [x] 4.2 检查其他文件中的BSC引用
    - 搜索整个代码库中的 "BrightStarCatalogue" 和 "BSC" 字符串
    - 移除或更新相关注释（保留git历史记录中的引用）
    - _Requirements: 4.1, 4.2_

- [ ] 5. Checkpoint - 编译和验证
  - [x] 5.1 运行TypeScript编译
    - 执行 `npm run build` 或 `tsc` 验证代码无编译错误
    - 修复任何编译错误
    - _Requirements: 4.5_
  
  - [x] 5.2 运行Linter
    - 执行 `npm run lint` 验证代码无lint错误
    - 修复任何未使用的导入或变量
    - _Requirements: 4.3, 4.4_
  
  - [ ]* 5.3 运行单元测试
    - 执行文件系统测试，验证文件已删除
    - 执行代码分析测试，验证BSC引用已移除
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [ ] 6. Checkpoint - 功能验证
  - 启动开发服务器，验证应用正常运行
  - 检查浏览器控制台，确认无错误
  - 验证GaiaStars、NearbyStars、GalaxyRenderer正常显示
  - 验证太阳系天体正常显示
  - 验证相机控制和时间控制正常工作
  - 使用浏览器开发者工具验证不再请求字体文件和BSC数据文件
  - 确认所有测试通过后，询问用户是否有问题

## Notes

- 任务标记 `*` 的为可选测试任务，可以跳过以加快实施速度
- 每个任务都引用了具体的需求编号，便于追溯
- Checkpoint任务确保增量验证，及时发现问题
- 建议按顺序执行任务，因为后续任务可能依赖前面的修改
- 字体优化和BSC移除可以并行进行，但建议先完成字体优化（影响范围较小）
