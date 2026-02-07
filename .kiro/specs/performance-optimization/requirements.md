# Requirements Document

## Introduction

本文档定义了网页加载速度优化功能的需求。该功能旨在通过移除大型字体文件和删除Bright Star Catalogue功能来显著减少页面初始加载时间和资源消耗，从而提升用户体验。

## Glossary

- **System**: 指整个网页应用程序
- **Font_Stack**: 字体栈，定义字体的优先级顺序
- **BSC**: Bright Star Catalogue，亮星星表数据和渲染系统
- **Scene_Manager**: 场景管理器，负责3D场景的初始化和更新
- **Global_CSS**: 全局样式表文件（src/app/globals.css）
- **Font_File**: 字体文件（public/fonts/SourceHanSerifCN-VF.otf.woff2）

## Requirements

### Requirement 1: 字体优化

**User Story:** 作为用户，我希望网页加载速度更快，这样我可以更快地开始使用应用程序。

#### Acceptance Criteria

1. THE System SHALL 删除自定义字体文件 SourceHanSerifCN-VF.otf.woff2
2. THE System SHALL 从 Global_CSS 中移除 @font-face 声明
3. THE System SHALL 使用系统字体栈替代自定义字体
4. THE Font_Stack SHALL 按以下优先级定义：'Source Han Serif CN', 'SimSun', serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
5. THE System SHALL 在所有使用字体的位置应用新的 Font_Stack
6. WHEN 页面加载时，THEN THE System SHALL 不请求任何自定义字体文件

### Requirement 2: 移除Bright Star Catalogue功能

**User Story:** 作为用户，我希望减少页面加载的数据量，这样页面可以更快地完成初始加载。

#### Acceptance Criteria

1. THE System SHALL 删除 BrightStarCatalogue 类文件（src/lib/3d/BrightStarCatalogue.ts）
2. THE System SHALL 删除 BSC 数据文件（public/data/V_50/catalog/catalog）
3. THE System SHALL 从 Scene_Manager 中移除所有 BrightStarCatalogue 的导入语句
4. THE System SHALL 从 Scene_Manager 中移除 brightStarCatalogue 属性声明
5. THE System SHALL 从 Scene_Manager 中移除 BrightStarCatalogue 的初始化代码
6. THE System SHALL 从 Scene_Manager 中移除 BrightStarCatalogue 的更新调用
7. THE System SHALL 从 Scene_Manager 中移除 BrightStarCatalogue 的对齐旋转代码
8. THE System SHALL 从 Scene_Manager 中移除 BrightStarCatalogue 的清理代码
9. THE System SHALL 从 Scene_Manager 中移除 BSC_CONFIG 的导入和使用
10. WHEN 页面加载时，THEN THE System SHALL 不请求 BSC 数据文件

### Requirement 3: 保持其他功能完整性

**User Story:** 作为用户，我希望在优化后其他功能仍然正常工作，这样我可以继续使用应用的核心功能。

#### Acceptance Criteria

1. THE System SHALL 保留 GaiaStars 类及其功能
2. THE System SHALL 保留 NearbyStars 类及其功能
3. THE System SHALL 保留 GalaxyRenderer 类及其功能
4. THE System SHALL 保留所有太阳系天体的渲染功能
5. THE System SHALL 保留相机控制和交互功能
6. THE System SHALL 保留时间控制功能
7. WHEN 应用运行时，THEN THE System SHALL 正常显示所有保留的星图系统
8. WHEN 应用运行时，THEN THE System SHALL 正常显示所有太阳系天体

### Requirement 4: 代码清理

**User Story:** 作为开发者，我希望代码库保持整洁，这样未来的维护和开发更加容易。

#### Acceptance Criteria

1. THE System SHALL 移除所有对 BrightStarCatalogue 的注释引用
2. THE System SHALL 移除所有对 BSC_CONFIG 的注释引用
3. THE System SHALL 确保没有未使用的导入语句
4. THE System SHALL 确保没有悬空的代码引用
5. WHEN 代码编译时，THEN THE System SHALL 不产生任何与已删除功能相关的警告或错误

## Out of Scope

以下内容不在本次优化范围内：

- 其他星图系统的优化（GaiaStars、NearbyStars、GalaxyRenderer）
- 太阳系天体纹理的优化
- 代码分割和懒加载优化
- 其他性能优化措施（如图片压缩、缓存策略等）
- UI组件的性能优化
- 3D渲染性能优化（如LOD、视锥剔除等）
