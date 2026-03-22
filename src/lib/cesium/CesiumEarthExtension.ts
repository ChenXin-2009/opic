/**
 * CesiumEarthExtension - Cesium 地球扩展模块
 * 
 * 封装 Cesium 集成逻辑，管理 CesiumAdapter 实例
 * 创建合成材质，处理 Alpha 混合过渡
 */

import * as THREE from 'three';
import { CesiumAdapter, CesiumAdapterConfig } from './CesiumAdapter';

/**
 * CesiumEarthExtension - Cesium 地球扩展类
 */
export class CesiumEarthExtension {
  private adapter: CesiumAdapter;
  private errorCallback?: (error: Error) => void;
  private logCallback?: (level: 'info' | 'warn' | 'error', message: string) => void;
  
  constructor(config: CesiumAdapterConfig) {
    // 创建 CesiumAdapter 实例
    this.adapter = new CesiumAdapter(config);
    
    // 监听 CesiumAdapter 错误
    this.adapter.onError((error) => {
      if (this.errorCallback) {
        this.errorCallback(error);
      }
    });
  }
  
  /**
   * 渲染 Cesium 场景
   */
  render(): void {
    this.adapter.render();
  }
  
  /**
   * 同步时间
   */
  syncTime(date: Date): void {
    this.adapter.syncTime(date);
  }
  
  /**
   * 设置时间倍率
   */
  setTimeMultiplier(multiplier: number): void {
    this.adapter.setTimeMultiplier(multiplier);
  }
  
  /**
   * 同步相机
   */
  syncCamera(threeCamera: THREE.PerspectiveCamera, earthPosition: THREE.Vector3): void {
    this.adapter.syncCamera(threeCamera, earthPosition);
  }
  
  /**
   * 反向同步相机（Cesium → Three.js）
   */
  syncCameraFromCesium(threeCamera: THREE.PerspectiveCamera, earthPosition: THREE.Vector3): void {
    this.adapter.syncCameraFromCesium(threeCamera, earthPosition);
  }
  
  /**
   * 设置可见性
   */
  setVisible(visible: boolean): void {
    this.adapter.setCanvasVisible(visible);
  }
  
  /**
   * 切换影像图层
   */
  setImageryProvider(provider: any): void {
    this.adapter.setImageryProvider(provider);
  }

  /**
   * 获取瓦片加载状态
   */
  getTileLoadingStats(): { loaded: number; loading: number } {
    return this.adapter.getTileLoadingStats();
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
    this.adapter.onLog(callback);
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    // 清理 CesiumAdapter
    this.adapter.dispose();
  }
}
