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
  private compositeMaterial: THREE.MeshBasicMaterial;
  private canvasTexture: THREE.CanvasTexture;
  private errorCallback?: (error: Error) => void;
  private logCallback?: (level: 'info' | 'warn' | 'error', message: string) => void;
  
  constructor(config: CesiumAdapterConfig) {
    // 创建 CesiumAdapter 实例
    this.adapter = new CesiumAdapter(config);
    
    // 获取 Canvas 纹理
    this.canvasTexture = this.adapter.getTexture();
    
    // 创建合成材质（使用 Cesium Canvas 纹理）
    this.compositeMaterial = new THREE.MeshBasicMaterial({
      map: this.canvasTexture,
      transparent: false, // 不透明
      opacity: 1.0,
      side: THREE.FrontSide,
      depthWrite: true,
      depthTest: true,
      toneMapped: false // 禁用色调映射，保持原始颜色
    });
    
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
   * 更新纹理
   */
  updateTexture(): void {
    this.adapter.updateTexture();
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
   * 设置透明度
   */
  setOpacity(opacity: number): void {
    this.compositeMaterial.opacity = Math.max(0, Math.min(1, opacity));
    this.compositeMaterial.transparent = opacity < 1.0;
    // 不要在这里修改 visible，让 setVisible 单独控制
  }
  
  /**
   * 获取透明度（用于测试）
   */
  getOpacity(): number {
    return this.compositeMaterial.opacity;
  }
  
  /**
   * 设置可见性
   */
  setVisible(visible: boolean): void {
    this.adapter.setVisible(visible);
    this.compositeMaterial.visible = visible;
  }
  
  /**
   * 获取合成材质
   */
  getMaterial(): THREE.Material {
    return this.compositeMaterial;
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
    
    // 清理材质
    this.compositeMaterial.dispose();
    
    // 注意：canvasTexture 由 CesiumAdapter 管理，不需要在这里释放
  }
}
