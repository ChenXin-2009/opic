# 设计文档

## 概述

卫星详情模态框系统为用户提供了一个交互式界面,用于查看和探索选中卫星的详细信息。该系统采用模态框设计,在用户点击3D场景中的卫星时弹出,显示卫星的基本信息、轨道参数、实时位置、物理特性等数据。同时,系统会自动控制相机跟随卫星并高亮显示其轨道轨迹,提供沉浸式的观察体验。

设计遵循项目现有的明日方舟(Arknights)视觉风格,采用深色主题、几何切角和细线装饰,确保与现有UI组件保持一致的视觉语言。

## 架构

### 系统架构图

\`\`\`mermaid
graph TB
    subgraph "用户交互层"
        A[3D场景] --> B[卫星点击事件]
        C[模态框UI] --> D[关闭按钮]
        C --> E[背景遮罩]
    end
    
    subgraph "状态管理层"
        F[useSatelliteStore] --> G[selectedSatellite]
        F --> H[showOrbits]
        F --> I[satellites Map]
    end
    
    subgraph "数据层"
        J[TLE数据] --> K[轨道计算]
        K --> L[实时位置]
        M[扩展数据API] --> N[物理特性]
        M --> O[发射信息]
    end
    
    subgraph "渲染层"
        P[SatelliteDetailModal] --> Q[数据展示区]
        P --> R[骨架屏]
        S[相机控制器] --> T[跟随逻辑]
        U[轨道渲染器] --> V[高亮轨迹]
    end
    
    B --> F
    F --> P
    F --> S
    F --> U
    J --> F
    M --> P
\`\`\`

### 组件层次结构

\`\`\`
SatelliteDetailModal (容器组件)
├── Backdrop (背景遮罩)
├── ModalContainer (模态框容器)
│   ├── ModalHeader (头部)
│   │   ├── SatelliteName (卫星名称)
│   │   ├── OrbitTypeBadge (轨道类型标签)
│   │   └── CloseButton (关闭按钮)
│   ├── ModalBody (主体内容)
│   │   ├── BasicInfoSection (基本信息区)
│   │   ├── OrbitalParametersSection (轨道参数区)
│   │   ├── RealTimeDataSection (实时数据区)
│   │   ├── PhysicalPropertiesSection (物理特性区)
│   │   ├── LaunchInfoSection (发射信息区)
│   │   └── MissionInfoSection (任务信息区)
│   └── ModalFooter (底部)
│       └── OrbitToggleButton (轨道显示切换)
└── LoadingSkeleton (骨架屏)
\`\`\`

## 组件和接口

### 核心组件

#### 1. SatelliteDetailModal

主模态框组件,负责整体布局和状态管理。

**Props:**
\`\`\`typescript
interface SatelliteDetailModalProps {
  /** 语言设置 */
  lang?: 'zh' | 'en';
}
\`\`\`

**职责:**
- 监听Store中的selectedSatellite状态
- 控制模态框的显示/隐藏
- 管理数据加载状态
- 处理键盘事件(ESC关闭)
- 管理焦点陷阱(Focus Trap)

#### 2. useSatelliteDetail Hook

自定义Hook,封装卫星详情数据的获取和管理逻辑。

**接口:**
\`\`\`typescript
interface UseSatelliteDetailReturn {
  /** 基本TLE数据 */
  tleData: TLEData | null;
  /** 扩展详情数据 */
  detailData: SatelliteDetailData | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 重试加载 */
  retry: () => void;
}

function useSatelliteDetail(noradId: number | null): UseSatelliteDetailReturn;
\`\`\`

**职责:**
- 从Store获取TLE数据
- 异步加载扩展详情数据
- 处理加载错误和重试
- 管理AbortController取消请求

#### 3. useCameraFollow Hook

自定义Hook,封装相机跟随逻辑。

**接口:**
\`\`\`typescript
interface UseCameraFollowOptions {
  /** 目标卫星NORAD ID */
  targetNoradId: number | null;
  /** 是否启用跟随 */
  enabled: boolean;
  /** 跟随距离(km) */
  followDistance?: number;
  /** 平滑系数(0-1) */
  smoothFactor?: number;
}

function useCameraFollow(options: UseCameraFollowOptions): {
  /** 是否正在跟随 */
  isFollowing: boolean;
  /** 暂停跟随 */
  pause: () => void;
  /** 恢复跟随 */
  resume: () => void;
};
\`\`\`

**职责:**
- 监听卫星位置更新
- 计算相机目标位置
- 平滑插值相机移动
- 检测用户手动操作并暂停跟随

### 数据模型

#### SatelliteDetailData

扩展的卫星详情数据结构。

\`\`\`typescript
interface SatelliteDetailData {
  /** NORAD ID */
  noradId: number;
  
  /** 基本信息 */
  basicInfo: {
    name: string;
    noradId: number;
    cosparId?: string;  // COSPAR ID (国际编号)
    country?: string;   // 所属国家
    owner?: string;     // 所有者/运营商
    category: SatelliteCategory;
  };
  
  /** 轨道参数(从TLE计算) */
  orbitalParameters: {
    semiMajorAxis: number;      // 半长轴(km)
    eccentricity: number;       // 偏心率
    inclination: number;        // 倾角(度)
    raan: number;               // 升交点赤经(度)
    argumentOfPerigee: number;  // 近地点幅角(度)
    meanAnomaly: number;        // 平近点角(度)
    period: number;             // 轨道周期(分钟)
    apogee: number;             // 远地点高度(km)
    perigee: number;            // 近地点高度(km)
  };
  
  /** 实时位置数据(动态) */
  realTimeData: {
    latitude: number;   // 纬度(度)
    longitude: number;  // 经度(度)
    altitude: number;   // 高度(km)
    velocity: number;   // 速度(km/s)
    distance: number;   // 距离观察者(km)
  };
  
  /** 物理特性(可选) */
  physicalProperties?: {
    rcs?: number;       // 雷达截面积(m²)
    mass?: number;      // 质量(kg)
    size?: string;      // 尺寸描述
  };
  
  /** 发射信息(可选) */
  launchInfo?: {
    launchDate?: string;    // 发射日期
    launchSite?: string;    // 发射场
    launchVehicle?: string; // 运载火箭
  };
  
  /** 任务信息(可选) */
  missionInfo?: {
    type?: string;          // 卫星类型
    purpose?: string;       // 任务描述
    operator?: string;      // 操作者
    expectedLifetime?: string; // 预期寿命
  };
}
\`\`\`

### API接口

#### GET /api/satellites/[noradId]/details

获取指定卫星的详细信息。

**请求:**
\`\`\`
GET /api/satellites/25544/details
\`\`\`

**响应:**
\`\`\`typescript
{
  "noradId": 25544,
  "basicInfo": {
    "name": "ISS (ZARYA)",
    "noradId": 25544,
    "cosparId": "1998-067A",
    "country": "USA",
    "owner": "NASA/ROSCOSMOS",
    "category": "stations"
  },
  "physicalProperties": {
    "rcs": 1000.0,
    "mass": 419725,
    "size": "109m x 73m x 20m"
  },
  "launchInfo": {
    "launchDate": "1998-11-20",
    "launchSite": "Baikonur Cosmodrome",
    "launchVehicle": "Proton-K"
  },
  "missionInfo": {
    "type": "Space Station",
    "purpose": "International Space Station - Human spaceflight and research",
    "operator": "NASA/ROSCOSMOS/ESA/JAXA/CSA",
    "expectedLifetime": "2030+"
  }
}
\`\`\`

**错误响应:**
\`\`\`typescript
{
  "error": "NOT_FOUND",
  "message": "Satellite details not found",
  "statusCode": 404
}
\`\`\`

## 数据模型

### 数据流

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Scene as 3D场景
    participant Store as useSatelliteStore
    participant Modal as SatelliteDetailModal
    participant API as 详情API
    participant Camera as 相机控制器
    participant Orbit as 轨道渲染器
    
    User->>Scene: 点击卫星
    Scene->>Store: selectSatellite(noradId)
    Store->>Modal: 触发重新渲染
    Modal->>Modal: 显示骨架屏
    Modal->>API: 请求详情数据
    Modal->>Camera: 启动相机跟随
    Modal->>Orbit: 显示轨道高亮
    
    API-->>Modal: 返回详情数据
    Modal->>Modal: 渲染实际数据
    
    loop 每秒更新
        Store->>Modal: 更新实时位置数据
        Modal->>Modal: 更新动态数值
    end
    
    User->>Modal: 点击关闭/ESC/背景
    Modal->>Store: selectSatellite(null)
    Modal->>Camera: 停止相机跟随
    Modal->>Orbit: 隐藏轨道高亮
    Modal->>Modal: 隐藏模态框
\`\`\`

### 状态管理

使用现有的useSatelliteStore,扩展以下状态:

\`\`\`typescript
// 在useSatelliteStore中添加
interface SatelliteStore {
  // ... 现有状态
  
  /** 详情模态框是否显示 */
  showDetailModal: boolean;
  
  /** 设置详情模态框显示状态 */
  setShowDetailModal: (show: boolean) => void;
}
\`\`\`

## 正确性属性

*属性是一个特征或行为,应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: 模态框显示触发

*对于任何*卫星对象,当用户点击该卫星时,系统应该将selectedSatellite设置为该卫星的NORAD ID,并且模态框应该变为可见状态。

**验证需求: 1.1, 1.2**

### 属性 2: 背景遮罩点击关闭

*对于任何*显示中的模态框,当用户点击背景遮罩区域时,系统应该将selectedSatellite设置为null,并且模态框应该变为隐藏状态。

**验证需求: 1.6, 12.1**

### 属性 3: ESC键关闭

*对于任何*显示中的模态框,当用户按下ESC键时,系统应该将selectedSatellite设置为null,并且模态框应该变为隐藏状态。

**验证需求: 12.3**

### 属性 4: 相机跟随启动

*对于任何*选中的卫星,当模态框显示时,相机应该平滑移动到该卫星附近的观察位置,并持续跟随该卫星的运动。

**验证需求: 2.1, 2.2**

### 属性 5: 相机跟随停止

*对于任何*正在跟随的相机,当模态框关闭时,相机应该停止跟随并恢复自由控制模式。

**验证需求: 2.4**

### 属性 6: 轨道高亮显示

*对于任何*选中的卫星,当模态框显示时,该卫星的轨道轨迹应该以高亮颜色显示,并且在模态框关闭时应该隐藏。

**验证需求: 3.1, 3.2, 3.3**

### 属性 7: 切换卫星时轨道更新

*对于任何*两个不同的卫星A和B,当用户从选中卫星A切换到卫星B时,卫星A的轨道应该隐藏,卫星B的轨道应该显示。

**验证需求: 1.4, 3.4**

### 属性 8: 数据加载取消

*对于任何*正在加载详情数据的请求,当用户切换到另一个卫星或关闭模态框时,前一个加载请求应该被取消。

**验证需求: 10.5**

### 属性 9: 动态数据更新频率

*对于任何*显示中的模态框,实时位置数据(经度、纬度、高度、速度、距离)应该每秒更新一次。

**验证需求: 6.6**

### 属性 10: 焦点陷阱

*对于任何*显示中的模态框,当用户按Tab键导航时,焦点应该只在模态框内的可交互元素间循环,不应该移动到模态框外部的元素。

**验证需求: 15.3, 15.6**

### 属性 11: 资源清理

*对于任何*模态框组件,当组件卸载或模态框关闭时,所有定时器、订阅和事件监听器应该被清理,不应该存在内存泄漏。

**验证需求: 11.4, 14.4**

### 属性 12: 响应式宽度

*对于任何*屏幕宽度,模态框的宽度应该根据以下规则计算:
- 宽度 > 1024px: 固定600px
- 768px ≤ 宽度 ≤ 1024px: 屏幕宽度的80%
- 宽度 < 768px: 屏幕宽度的95%

**验证需求: 13.1, 13.2, 13.3**

### 属性 13: 模态框内容点击不关闭

*对于任何*显示中的模态框,当用户点击模态框内部内容区域时,模态框应该保持显示状态,不应该关闭。

**验证需求: 12.2**

## 错误处理

### 错误场景

#### 1. 详情数据加载失败

**场景:** API请求失败或超时

**处理策略:**
- 显示错误提示信息
- 提供"重试"按钮
- 保留已有的TLE基本数据显示
- 将不可用的数据字段标记为"数据不可用"

**用户体验:**
\`\`\`
┌─────────────────────────────┐
│ ⚠ 加载详情数据失败          │
│                             │
│ 无法获取卫星的扩展信息。    │
│ [重试] [仅显示基本信息]     │
└─────────────────────────────┘
\`\`\`

#### 2. 卫星不存在

**场景:** selectedSatellite指向的卫星在satellites Map中不存在

**处理策略:**
- 不显示模态框
- 在控制台记录警告
- 自动清除selectedSatellite状态

#### 3. 相机跟随失败

**场景:** 卫星位置数据无效或相机控制器不可用

**处理策略:**
- 禁用相机跟随功能
- 模态框正常显示
- 在控制台记录错误

#### 4. 轨道渲染失败

**场景:** 轨道计算失败或渲染器不可用

**处理策略:**
- 禁用轨道显示功能
- 隐藏"显示轨道"按钮
- 模态框正常显示

### 错误边界

使用React Error Boundary包裹模态框组件:

\`\`\`typescript
<ErrorBoundary
  fallback={<SatelliteDetailErrorFallback />}
  onError={(error) => {
    console.error('[SatelliteDetailModal] Error:', error);
    // 上报错误到监控系统
  }}
>
  <SatelliteDetailModal />
</ErrorBoundary>
\`\`\`

## 测试策略

### 单元测试

使用Jest和React Testing Library进行组件单元测试。

**测试用例:**

1. **模态框渲染测试**
   - 当selectedSatellite为null时,模态框不渲染
   - 当selectedSatellite有值时,模态框渲染
   - 骨架屏在数据加载时显示

2. **交互测试**
   - 点击关闭按钮调用selectSatellite(null)
   - 点击背景遮罩调用selectSatellite(null)
   - 按ESC键调用selectSatellite(null)
   - 点击模态框内容不触发关闭

3. **数据展示测试**
   - 基本信息正确显示
   - 轨道参数正确格式化
   - 实时数据正确更新
   - 缺失数据显示"数据不可用"

4. **Hook测试**
   - useSatelliteDetail正确加载数据
   - useSatelliteDetail正确处理错误
   - useSatelliteDetail正确取消请求
   - useCameraFollow正确跟随卫星
   - useCameraFollow正确暂停和恢复

### 集成测试

测试模态框与其他系统组件的集成。

**测试用例:**

1. **与Store集成**
   - 模态框正确订阅Store状态
   - 模态框正确更新Store状态
   - 模态框正确响应Store变化

2. **与3D场景集成**
   - 点击卫星正确触发模态框
   - 相机跟随正确工作
   - 轨道高亮正确显示

3. **与API集成**
   - 正确请求详情数据
   - 正确处理API错误
   - 正确取消请求

### 属性测试

使用fast-check进行属性测试,验证正确性属性。

**测试配置:**
- 每个属性测试运行100次迭代
- 使用随机生成的卫星数据
- 标签格式: `Feature: satellite-detail-panel, Property {N}: {property_text}`

**测试用例:**

1. **属性 1: 模态框显示触发**
   \`\`\`typescript
   // Feature: satellite-detail-panel, Property 1: 模态框显示触发
   fc.assert(
     fc.property(fc.integer({ min: 1, max: 99999 }), (noradId) => {
       // 生成随机卫星数据
       const satellite = generateRandomSatellite(noradId);
       // 模拟点击
       store.selectSatellite(noradId);
       // 验证状态
       expect(store.selectedSatellite).toBe(noradId);
       expect(isModalVisible()).toBe(true);
     }),
     { numRuns: 100 }
   );
   \`\`\`

2. **属性 8: 数据加载取消**
   \`\`\`typescript
   // Feature: satellite-detail-panel, Property 8: 数据加载取消
   fc.assert(
     fc.property(
       fc.integer({ min: 1, max: 99999 }),
       fc.integer({ min: 1, max: 99999 }),
       (noradId1, noradId2) => {
         fc.pre(noradId1 !== noradId2); // 确保两个ID不同
         
         // 开始加载第一个卫星
         const controller1 = startLoadingDetails(noradId1);
         
         // 切换到第二个卫星
         store.selectSatellite(noradId2);
         
         // 验证第一个请求被取消
         expect(controller1.signal.aborted).toBe(true);
       }
     ),
     { numRuns: 100 }
   );
   \`\`\`

3. **属性 12: 响应式宽度**
   \`\`\`typescript
   // Feature: satellite-detail-panel, Property 12: 响应式宽度
   fc.assert(
     fc.property(fc.integer({ min: 320, max: 3840 }), (screenWidth) => {
       // 设置屏幕宽度
       setScreenWidth(screenWidth);
       
       // 获取模态框宽度
       const modalWidth = getModalWidth();
       
       // 验证宽度规则
       if (screenWidth > 1024) {
         expect(modalWidth).toBe(600);
       } else if (screenWidth >= 768) {
         expect(modalWidth).toBe(screenWidth * 0.8);
       } else {
         expect(modalWidth).toBe(screenWidth * 0.95);
       }
     }),
     { numRuns: 100 }
   );
   \`\`\`

### 端到端测试

使用Playwright进行端到端测试。

**测试场景:**

1. **完整用户流程**
   - 用户打开应用
   - 用户点击卫星
   - 模态框显示详情
   - 用户查看各个数据区
   - 用户切换轨道显示
   - 用户关闭模态框

2. **错误恢复流程**
   - API失败时显示错误
   - 用户点击重试
   - 数据成功加载

3. **性能测试**
   - 模态框打开时间 < 200ms
   - 数据加载时间 < 1s
   - 动态数据更新不卡顿

### 可访问性测试

使用jest-axe和手动测试验证可访问性。

**测试项:**
- ARIA标签正确
- 键盘导航正常
- 焦点陷阱工作
- 屏幕阅读器兼容
- 颜色对比度符合WCAG AA标准
