/**
 * CesiumAdapter - Cesium 适配器
 * 
 * 封装 Cesium 与 Three.js 的集成逻辑
 * 负责管理 Cesium Viewer、Canvas、纹理更新、时间同步、相机同步
 */

import * as THREE from 'three';

// 在导入 Cesium 之前设置基础 URL
if (typeof window !== 'undefined') {
  (window as any).CESIUM_BASE_URL = '/cesium';
}

import * as Cesium from 'cesium';
import { CameraSynchronizer } from './CameraSynchronizer';

/**
 * Cesium 适配器配置接口
 */
export interface CesiumAdapterConfig {
  // Cesium 配置
  cesiumContainerId: string;
  imageryProvider?: Cesium.ImageryProvider;
  terrainProvider?: Cesium.TerrainProvider;
  
  // 渲染配置
  canvasResolutionScale?: number; // Canvas 分辨率缩放（默认 1.0）
  maximumScreenSpaceError?: number; // 瓦片 LOD 控制（默认 2）
  maximumNumberOfLoadedTiles?: number; // 最大瓦片数量（默认 1000）
  
  // 深度合成策略
  depthCompositingStrategy?: 'render-order' | 'satellite-always-front';
  
  // 性能监控（可选）
  performanceMonitor?: any;
}

/**
 * Cesium 初始化错误
 */
export class CesiumInitializationError extends Error {
  override cause?: Error;
  
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'CesiumInitializationError';
    this.cause = cause;
  }
}

/**
 * Cesium 渲染错误
 */
export class CesiumRenderError extends Error {
  override cause?: Error;
  
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'CesiumRenderError';
    this.cause = cause;
  }
}

/**
 * WebGL Context Lost 错误
 */
export class WebGLContextLostError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebGLContextLostError';
  }
}

/**
 * CesiumAdapter - Cesium 适配器类
 */
export class CesiumAdapter {
  private viewer!: Cesium.Viewer;
  private container!: HTMLDivElement; // 改为 div 容器
  private cesiumCanvas!: HTMLCanvasElement; // Cesium 内部的 canvas
  private canvasTexture!: THREE.CanvasTexture;
  private config: CesiumAdapterConfig;
  private isAvailable: boolean = true;
  private needsTextureUpdate: boolean = false;
  private errorCallback?: (error: Error) => void;
  private performanceMonitor?: any;
  private logCallback?: (level: 'info' | 'warn' | 'error', message: string) => void;
  
  constructor(config: CesiumAdapterConfig) {
    this.config = this.validateConfig(config);
    this.performanceMonitor = config.performanceMonitor;
    
    try {
      this.initializeCesium();
      this.setupEventListeners();
      
      // 初始化完成后输出日志
      this.log('info', 'CesiumAdapter initialized successfully');
    } catch (error) {
      this.handleInitializationError(error);
    }
  }
  
  /**
   * 验证并规范化配置参数
   */
  private validateConfig(config: CesiumAdapterConfig): CesiumAdapterConfig {
    return {
      ...config,
      canvasResolutionScale: Math.max(0.1, Math.min(2.0, config.canvasResolutionScale ?? 1.0)),
      maximumScreenSpaceError: Math.max(1, config.maximumScreenSpaceError ?? 2),
      maximumNumberOfLoadedTiles: Math.max(100, config.maximumNumberOfLoadedTiles ?? 1000),
      depthCompositingStrategy: config.depthCompositingStrategy ?? 'render-order'
    };
  }
  
  /**
   * 初始化 Cesium Viewer 和 Canvas
   */
  private initializeCesium(): void {
    // 创建独立的容器 div（Cesium 需要一个有尺寸的容器）
    this.container = document.createElement('div');
    this.container.id = this.config.cesiumContainerId;
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.pointerEvents = 'none'; // 不拦截鼠标事件
    this.container.style.opacity = '0'; // 透明但仍然渲染（用作纹理源）
    this.container.style.zIndex = '-1'; // 置于最底层
    
    // 设置容器尺寸（CSS 尺寸，Cesium 需要这个来确定 canvas 大小）
    const width = window.innerWidth * (this.config.canvasResolutionScale ?? 1.0);
    const height = window.innerHeight * (this.config.canvasResolutionScale ?? 1.0);
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
    
    document.body.appendChild(this.container);
    
    // 创建 Cesium Viewer
    this.viewer = new Cesium.Viewer(this.container, {
      // 基础配置
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      
      // 渲染配置
      scene3DOnly: true,
      orderIndependentTranslucency: false,
      contextOptions: {
        webgl: {
          alpha: false,
          depth: true,
          stencil: false,
          antialias: true,
          premultipliedAlpha: true,
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance'
        }
      },
      
      // 性能配置
      requestRenderMode: false, // 每帧渲染
      maximumRenderTimeChange: Infinity
    });
    
    console.log('[CesiumAdapter] Viewer created: scene=', !!this.viewer.scene, 'globe=', !!this.viewer.scene.globe);
    
    // 确保 Globe 显示
    this.viewer.scene.globe.show = true;
    
    // 配置 Globe
    this.viewer.scene.globe.maximumScreenSpaceError = this.config.maximumScreenSpaceError ?? 2;
    this.viewer.scene.globe.tileCacheSize = this.config.maximumNumberOfLoadedTiles ?? 1000;
    
    console.log('[CesiumAdapter] Globe configured: show=', this.viewer.scene.globe.show, 'SSE=', this.viewer.scene.globe.maximumScreenSpaceError, 'cache=', this.viewer.scene.globe.tileCacheSize);
    
    // 配置 ImageryProvider（如果提供）
    if (this.config.imageryProvider) {
      this.viewer.imageryLayers.removeAll();
      this.viewer.imageryLayers.addImageryProvider(this.config.imageryProvider);
      console.log('[CesiumAdapter] Custom imagery provider added');
    } else {
      console.log('[CesiumAdapter] Using default imagery provider, layers count:', this.viewer.imageryLayers.length);
    }
    
    // 配置 TerrainProvider（如果提供）
    if (this.config.terrainProvider) {
      this.viewer.terrainProvider = this.config.terrainProvider;
    }
    
    // 禁用大气效果（由 Three.js 场景控制）
    if (this.viewer.scene.skyAtmosphere) {
      this.viewer.scene.skyAtmosphere.show = false;
      console.log('[CesiumAdapter] Sky atmosphere disabled');
    }
    if (this.viewer.scene.sun) {
      this.viewer.scene.sun.show = false;
      console.log('[CesiumAdapter] Sun disabled');
    }
    if (this.viewer.scene.moon) {
      this.viewer.scene.moon.show = false;
      console.log('[CesiumAdapter] Moon disabled');
    }
    if (this.viewer.scene.skyBox) {
      this.viewer.scene.skyBox.show = false;
      console.log('[CesiumAdapter] SkyBox disabled');
    }
    
    // 设置场景背景色为黑色（而不是显示 skybox）
    this.viewer.scene.backgroundColor = Cesium.Color.BLACK;
    console.log('[CesiumAdapter] Scene background set to black');
    
    // 确保 globe 显示并且在前景
    this.viewer.scene.globe.show = true;
    this.viewer.scene.globe.depthTestAgainstTerrain = false;
    console.log('[CesiumAdapter] Globe show confirmed:', this.viewer.scene.globe.show);
    
    // 获取 Cesium 内部创建的 canvas
    this.cesiumCanvas = this.viewer.scene.canvas;
    
    // 手动调整 Cesium canvas 尺寸（Cesium 有时不能正确读取容器尺寸）
    const canvasWidth = window.innerWidth * (this.config.canvasResolutionScale ?? 1.0);
    const canvasHeight = window.innerHeight * (this.config.canvasResolutionScale ?? 1.0);
    this.cesiumCanvas.width = canvasWidth;
    this.cesiumCanvas.height = canvasHeight;
    
    // 通知 Cesium 场景尺寸已更改
    this.viewer.resize();
    
    // 创建 HTMLCanvasTexture（使用 Cesium 的 canvas）
    this.canvasTexture = new THREE.CanvasTexture(this.cesiumCanvas);
    this.canvasTexture.minFilter = THREE.LinearFilter;
    this.canvasTexture.magFilter = THREE.LinearFilter;
    this.canvasTexture.generateMipmaps = false;
    
    console.log('CesiumAdapter initialized successfully');
  }

  
  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听 WebGL Context Lost（使用 Cesium 的 canvas）
    this.cesiumCanvas.addEventListener('webglcontextlost', this.handleContextLost.bind(this), false);
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * 渲染 Cesium 场景
   */
  render(): void {
    if (!this.isAvailable) {
      return;
    }
    
    try {
      const startTime = performance.now();
      
      // 渲染 Cesium 场景到 Canvas
      this.viewer.render();
      
      // 标记纹理需要更新
      this.needsTextureUpdate = true;
      
      // 性能监控
      if (this.performanceMonitor) {
        const renderTime = performance.now() - startTime;
        this.performanceMonitor.recordCesiumRenderTime?.(renderTime);
      }
    } catch (error) {
      this.log('error', `Render error: ${error}`);
      this.handleRenderError(error);
    }
  }
  
  /**
   * 更新 Canvas 纹理
   */
  updateTexture(): void {
    if (this.needsTextureUpdate && this.canvasTexture) {
      const startTime = performance.now();
      
      this.canvasTexture.needsUpdate = true;
      this.needsTextureUpdate = false;
      
      // 性能监控
      if (this.performanceMonitor) {
        const uploadTime = performance.now() - startTime;
        this.performanceMonitor.recordTextureUploadTime?.(uploadTime);
      }
    }
  }
  
  /**
   * 同步时间到 Cesium.Clock
   */
  syncTime(date: Date): void {
    if (!this.isAvailable) return;
    
    const julianDate = Cesium.JulianDate.fromDate(date);
    this.viewer.clock.currentTime = julianDate;
  }
  
  /**
   * 设置时间倍率
   */
  setTimeMultiplier(multiplier: number): void {
    if (!this.isAvailable) return;
    
    // 转换为秒/秒（Cesium 使用秒作为单位）
    this.viewer.clock.multiplier = multiplier * 86400;
  }
  
  /**
   * 同步相机到 Cesium
   */
  syncCamera(threeCamera: THREE.PerspectiveCamera, earthPosition: THREE.Vector3): void {
    if (!this.isAvailable) return;
    
    try {
      CameraSynchronizer.syncViewMatrix(threeCamera, this.viewer.camera, earthPosition);
    } catch (error) {
      console.error('[CesiumAdapter] Camera sync error:', error);
    }
  }
  
  /**
   * 设置可见性
   */
  setVisible(visible: boolean): void {
    this.isAvailable = visible;
  }
  
  /**
   * 获取 Canvas 纹理
   */
  getTexture(): THREE.CanvasTexture {
    return this.canvasTexture;
  }
  
  /**
   * 获取瓦片加载状态
   */
  getTileLoadingStats(): { loaded: number; loading: number } {
    if (!this.isAvailable || !this.viewer) {
      return { loaded: 0, loading: 0 };
    }
    
    try {
      const surface = (this.viewer.scene.globe as any)._surface;
      if (!surface) {
        return { loaded: 0, loading: 0 };
      }
      
      const tilesToRender = surface._tilesToRender || [];
      const tileLoadQueueHigh = surface._tileLoadQueueHigh || [];
      const tileLoadQueueMedium = surface._tileLoadQueueMedium || [];
      const tileLoadQueueLow = surface._tileLoadQueueLow || [];
      
      return {
        loaded: tilesToRender.length,
        loading: tileLoadQueueHigh.length + tileLoadQueueMedium.length + tileLoadQueueLow.length
      };
    } catch (error) {
      return { loaded: 0, loading: 0 };
    }
  }
  
  /**
   * 获取配置
   */
  getConfig(): CesiumAdapterConfig {
    return this.config;
  }
  
  /**
   * 注册错误回调
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }
  
  /**
   * 注册日志回调
   */
  onLog(callback: (level: 'info' | 'warn' | 'error', message: string) => void): void {
    this.logCallback = callback;
  }
  
  /**
   * 输出日志
   */
  private log(level: 'info' | 'warn' | 'error', message: string): void {
    if (this.logCallback) {
      this.logCallback(level, message);
    }
  }
  
  /**
   * 处理初始化错误
   */
  private handleInitializationError(error: unknown): void {
    console.error('[CesiumAdapter] Initialization error:', error);
    
    const cesiumError = new CesiumInitializationError(
      'Failed to initialize Cesium Viewer',
      error instanceof Error ? error : undefined
    );
    
    console.error(cesiumError);
    
    if (this.errorCallback) {
      this.errorCallback(cesiumError);
    }
    
    this.isAvailable = false;
  }
  
  /**
   * 处理渲染错误
   */
  private handleRenderError(error: unknown): void {
    const renderError = new CesiumRenderError(
      'Cesium render failed',
      error instanceof Error ? error : undefined
    );
    
    console.error(renderError);
    
    if (this.errorCallback) {
      this.errorCallback(renderError);
    }
  }
  
  /**
   * 处理 WebGL Context Lost
   */
  private handleContextLost(event: Event): void {
    event.preventDefault();
    
    const error = new WebGLContextLostError('WebGL context lost');
    console.error(error);
    
    // 完全重启引擎
    this.dispose();
    
    // 尝试重新初始化
    setTimeout(() => {
      try {
        this.initializeCesium();
        this.setupEventListeners();
      } catch (reinitError) {
        console.error('Failed to reinitialize Cesium after context loss:', reinitError);
        this.isAvailable = false;
      }
    }, 1000);
  }
  
  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    if (!this.isAvailable) return;
    
    const width = window.innerWidth * (this.config.canvasResolutionScale ?? 1.0);
    const height = window.innerHeight * (this.config.canvasResolutionScale ?? 1.0);
    
    // 更新容器尺寸
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    // 停止渲染循环
    this.isAvailable = false;
    
    // 销毁 Cesium Viewer（自动清理所有资源）
    if (this.viewer) {
      this.viewer.destroy();
    }
    
    // 释放容器
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // 释放纹理
    if (this.canvasTexture) {
      this.canvasTexture.dispose();
    }
    
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    console.log('CesiumAdapter disposed');
  }
}
