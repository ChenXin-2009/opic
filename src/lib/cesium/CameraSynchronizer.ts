/**
 * CameraSynchronizer - 相机同步器
 * 
 * 负责将 Three.js 相机的视图矩阵同步到 Cesium 相机
 * 仅同步视图矩阵，不同步投影矩阵
 */

import * as THREE from 'three';
import * as Cesium from 'cesium';
import { CoordinateTransformer } from './CoordinateTransformer';

/**
 * CameraSynchronizer - 相机同步工具类
 */
export class CameraSynchronizer {
  /**
   * 同步视图矩阵
   * 
   * 将 Three.js 相机的位置和方向同步到 Cesium 相机
   * 仅同步视图矩阵，允许 Cesium 使用自己的投影矩阵和动态 near/far 裁剪面
   * 
   * @param threeCamera - Three.js 相机
   * @param cesiumCamera - Cesium 相机
   * @param earthPosition - 地球在 Solar System Frame 中的位置（AU）
   */
  static syncViewMatrix(
    threeCamera: THREE.PerspectiveCamera,
    cesiumCamera: Cesium.Camera,
    earthPosition: THREE.Vector3
  ): void {
    // 1. 计算相机在地球局部坐标系中的位置
    const cameraPositionLocal = threeCamera.position.clone().sub(earthPosition);
    
    // 2. 转换为 ECEF 坐标（米）
    const cameraECEF = CoordinateTransformer.solarSystemToECEF(
      threeCamera.position,
      earthPosition
    );
    
    // 3. 设置 Cesium 相机位置
    cesiumCamera.position = cameraECEF;
    
    // 4. 同步相机方向（从 Three.js 视图矩阵提取）
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(threeCamera.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(threeCamera.quaternion);
    
    // 5. 坐标系转换：Three.js (Y-up) → Cesium (Z-up)
    // Three.js: X-right, Y-up, Z-back
    // Cesium: X-right, Y-forward, Z-up
    // 转换: (x, y, z)_three → (x, z, y)_cesium
    cesiumCamera.direction = new Cesium.Cartesian3(direction.x, direction.z, -direction.y);
    cesiumCamera.up = new Cesium.Cartesian3(up.x, up.z, -up.y);
    
    // 注意：不同步投影矩阵，让 Cesium 使用自己的投影矩阵和动态 near/far 裁剪面
  }
}
