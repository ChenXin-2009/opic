/**
 * EarthPlanet - 扩展 Planet 类的地球渲染器
 * 
 * 集成 Cesium 瓦片渲染，根据相机距离自动切换渲染模式
 */

import * as THREE from 'three';
import { Planet, PlanetConfig } from './Planet';
import { CesiumEarthExtension } from '../cesium/CesiumEarthExtension';
import { CesiumAdapterConfig } from '../cesium/CesiumAdapter';

/**
 * 地球行星配置接口
 */
export interface EarthPlanetConfig extends PlanetConfig {
  // Cesium 集成配置
  enableCesiumTiles?: boolean;
  cesiumConfig?: CesiumAdapterConfig;
  
  // 距离阈值配置（千米）
  cesiumVisibleDistance?: number; // Cesium 完全可见距离（默认 2000km）
  transitionStartDistance?: number; // 过渡开始距离（默认 1800km）
  transitionEndDistance?: number; // 过渡结束距离（默认 2500km）
}

/**
 * AU 到千米的转换常量
 */
const AU_TO_KM = 149597870.7;

/**
 * EarthPlanet - 地球行星类
 */
export class EarthPlanet extends Planet {
  private cesiumExtension: CesiumEarthExtension | null = null;
  private config: EarthPlanetConfig;
  private originalMaterial: THREE.Material | null = null; // 保存原始材质
  private cesiumEnabled: boolean = false; // 跟踪 Cesium 状态
  
  constructor(config: EarthPlanetConfig) {
    super(config);
    
    this.config = {
      cesiumVisibleDistance: 2000, // km - 恢复设计规范
      transitionStartDistance: 1800, // km
      transitionEndDistance: 2500, // km
      ...config
    };

    
    // 初始化 Cesium 扩展
    if (config.enableCesiumTiles && config.cesiumConfig) {
      try {
        this.cesiumExtension = new CesiumEarthExtension(config.cesiumConfig);
        
        // 保存原始材质
        const mesh = this.getMesh();
        if (mesh instanceof THREE.Mesh) {
          this.originalMaterial = mesh.material as THREE.Material;
        }
        
        // 监听错误
        this.cesiumExtension.onError((error) => {
          console.error('Cesium extension error:', error);
          this.fallbackToPlanetRendering();
        });
      } catch (error) {
        console.error('Failed to initialize Cesium extension:', error);
        this.fallbackToPlanetRendering();
      }
    }
  }
  
  /**
   * 更新地球渲染
   * 
   * @param camera - Three.js 相机
   * @param deltaTime - 时间增量（秒）
   */
  update(camera: THREE.Camera, deltaTime: number): void {
    // 调用父类更新（自转等）
    super.updateRotation(0, 1, true); // 使用默认参数
    
    // 计算相机到地球中心的距离(AU)
    const cameraDistance = camera.position.distanceTo(this.getMesh().position);
    
    // 获取地球半径(AU)
    const earthRadiusAU = this.getRealRadius();
    
    // 转换为千米
    const distanceToCenterKm = cameraDistance * AU_TO_KM;
    const earthRadiusKm = earthRadiusAU * AU_TO_KM;
    
    // 计算相机到地球表面的距离
    const distanceToSurfaceKm = distanceToCenterKm - earthRadiusKm;
    
    // 更新渲染模式（现在是空函数，不再根据距离控制）
    this.updateRenderMode(distanceToSurfaceKm);
    
    // 只有在 Cesium 启用时才更新 Cesium 扩展
    if (this.cesiumExtension && this.cesiumEnabled) {
      // 同步相机到 Cesium (必须在渲染前调用)
      if (camera instanceof THREE.PerspectiveCamera) {
        this.syncCamera(camera);
      }
      
      // 渲染 Cesium
      this.cesiumExtension.render();
      
      // 更新纹理
      this.cesiumExtension.updateTexture();
    }
  }
  
  /**
   * 同步时间到 Cesium
   */
  syncTime(date: Date): void {
    if (this.cesiumExtension) {
      this.cesiumExtension.syncTime(date);
    }
  }
  
  /**
   * 设置时间倍率
   */
  setTimeMultiplier(multiplier: number): void {
    if (this.cesiumExtension) {
      this.cesiumExtension.setTimeMultiplier(multiplier);
    }
  }
  
  /**
   * 同步相机到 Cesium
   */
  syncCamera(camera: THREE.PerspectiveCamera): void {
    if (this.cesiumExtension) {
      this.cesiumExtension.syncCamera(camera, this.getMesh().position);
    }
  }

  
  /**
   * 更新渲染模式（不再根据距离控制，完全由 setCesiumEnabled 控制）
   */
  private updateRenderMode(distanceKm: number): void {
    // 不再根据距离自动切换渲染模式
    // 渲染模式完全由用户通过 setCesiumEnabled() 控制
  }
  
  /**
   * 计算 Alpha 混合系数
   * 
   * @param distanceKm - 相机距离（千米）
   * @returns Alpha 值（0-1）
   */
  calculateAlphaBlend(distanceKm: number): number {
    const start = this.config.transitionStartDistance!;
    const end = this.config.transitionEndDistance!;
    
    if (distanceKm <= start) return 0.0;
    if (distanceKm >= end) return 1.0;
    
    // 线性插值
    return (distanceKm - start) / (end - start);
  }
  
  /**
   * 设置网格透明度
   */
  private setMeshOpacity(opacity: number): void {
    const mesh = this.getMesh();
    if (mesh instanceof THREE.Mesh && mesh.material) {
      const material = mesh.material as THREE.Material;
      if ('opacity' in material) {
        (material as any).opacity = opacity;
        material.transparent = opacity < 1.0;
        material.visible = opacity > 0;
      }
    }
  }
  
  /**
   * 降级到 Planet 球体渲染
   */
  private fallbackToPlanetRendering(): void {
    console.warn('Falling back to Planet sphere rendering');
    
    // 清理 Cesium 扩展
    if (this.cesiumExtension) {
      this.cesiumExtension.dispose();
      this.cesiumExtension = null;
    }
    
    // 确保 Planet 球体可见
    this.setMeshOpacity(1.0);
  }
  
  /**
   * 获取 Cesium 扩展（用于测试）
   */
  getCesiumExtension(): CesiumEarthExtension | null {
    return this.cesiumExtension;
  }
  
  /**
   * 获取 Cesium 透明度（用于测试）
   */
  getCesiumOpacity(): number {
    return this.cesiumExtension?.getOpacity() ?? 0.0;
  }
  
  /**
   * 获取网格透明度（用于测试）
   */
  getMeshOpacity(): number {
    const mesh = this.getMesh();
    if (mesh instanceof THREE.Mesh && mesh.material) {
      const material = mesh.material as THREE.Material;
      if ('opacity' in material) {
        return (material as any).opacity;
      }
    }
    return 1.0;
  }
  
  /**
   * 启用或禁用 Cesium 渲染
   * 当启用时，在任何距离都使用 Cesium 渲染
   * 当禁用时，使用 Planet 球体渲染
   */
  setCesiumEnabled(enabled: boolean): void {
    console.log(`[EarthPlanet] setCesiumEnabled called with: ${enabled}`);
    
    if (!this.cesiumExtension) {
      console.warn('[EarthPlanet] No Cesium extension available');
      this.cesiumEnabled = false;
      return;
    }
    
    const mesh = this.getMesh();
    if (!(mesh instanceof THREE.Mesh)) {
      console.warn('[EarthPlanet] Mesh is not a THREE.Mesh');
      return;
    }
    
    this.cesiumEnabled = enabled;
    
    if (enabled) {
      // 启用 Cesium: 将材质替换为 Cesium 材质
      if (!this.originalMaterial) {
        this.originalMaterial = mesh.material as THREE.Material;
        console.log('[EarthPlanet] Saved original material:', this.originalMaterial);
      }
      
      const cesiumMaterial = this.cesiumExtension.getMaterial();
      console.log('[EarthPlanet] Switching to Cesium material:', cesiumMaterial);
      
      // 先设置可见性和透明度，再切换材质
      this.cesiumExtension.setVisible(true);
      this.cesiumExtension.setOpacity(1.0);
      
      console.log('[EarthPlanet] After setVisible/setOpacity:');
      console.log('[EarthPlanet] Cesium material visible:', cesiumMaterial.visible);
      console.log('[EarthPlanet] Cesium material opacity:', (cesiumMaterial as any).opacity);
      
      mesh.material = cesiumMaterial;
      mesh.material.needsUpdate = true;
      
      console.log('[EarthPlanet] Cesium enabled, material switched');
    } else {
      // 禁用 Cesium: 恢复 Planet 球体的原始材质
      if (this.originalMaterial) {
        console.log('[EarthPlanet] Restoring original material:', this.originalMaterial);
        mesh.material = this.originalMaterial;
        mesh.material.needsUpdate = true;
      } else {
        console.warn('[EarthPlanet] No original material to restore');
      }
      
      this.cesiumExtension.setVisible(false);
      this.cesiumExtension.setOpacity(0.0);
      
      console.log('[EarthPlanet] Cesium disabled, material restored');
    }
  }
  
  /**
   * 清理资源
   */
  override dispose(): void {
    if (this.cesiumExtension) {
      this.cesiumExtension.dispose();
      this.cesiumExtension = null;
    }
    
    super.dispose();
  }
  
  /**
   * 重写 applyTexture - 始终应用纹理到 Planet 球体
   * 无论 Cesium 是否存在，Planet 球体都需要纹理作为 fallback
   */
  override applyTexture(texture: THREE.Texture | null, bodyId: string): void {
    // 始终应用纹理到 Planet 球体（作为 fallback）
    super.applyTexture(texture, bodyId);
    
    // 应用纹理后，保存当前材质作为原始材质
    const mesh = this.getMesh();
    if (mesh instanceof THREE.Mesh && !this.cesiumEnabled) {
      this.originalMaterial = mesh.material as THREE.Material;
    }
  }
  
  /**
   * 重写 applyNightTexture - 始终应用夜间纹理到 Planet 球体
   * 无论 Cesium 是否存在，Planet 球体都需要夜间纹理作为 fallback
   */
  override applyNightTexture(texture: THREE.Texture | null): void {
    // 始终应用夜间纹理到 Planet 球体（作为 fallback）
    super.applyNightTexture(texture);
  }
}
