/**
 * CameraSynchronizer - 相机同步器
 * 
 * 负责将 Three.js 相机的位置和方向同步到 Cesium 相机
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
    // 1. 转换相机位置为 ECEF 坐标（米）
    const cameraECEF = CoordinateTransformer.solarSystemToECEF(
      threeCamera.position,
      earthPosition
    );
    
    // 2. 设置 Cesium 相机位置
    cesiumCamera.position = cameraECEF;
    
    // 3. 计算相机在地球局部坐标系中的位置（用于计算方向）
    const cameraLocalThree = threeCamera.position.clone().sub(earthPosition);
    
    // 4. 获取 Three.js 相机的方向向量（世界空间）
    const directionThree = new THREE.Vector3(0, 0, -1).applyQuaternion(threeCamera.quaternion);
    const upThree = new THREE.Vector3(0, 1, 0).applyQuaternion(threeCamera.quaternion);
    
    // 5. 坐标系转换：Three.js (Y-up) → Cesium (Z-up)
    // Three.js: X-right, Y-up, Z-backward
    // Cesium ECEF: X-right, Y-forward, Z-up
    // 转换公式：
    //   Cesium.x = Three.x
    //   Cesium.y = Three.z
    //   Cesium.z = Three.y
    const directionCesium = new Cesium.Cartesian3(
      directionThree.x,
      directionThree.z,
      directionThree.y
    );
    
    const upCesium = new Cesium.Cartesian3(
      upThree.x,
      upThree.z,
      upThree.y
    );
    
    // 6. 归一化方向向量
    cesiumCamera.direction = Cesium.Cartesian3.normalize(directionCesium, new Cesium.Cartesian3());
    cesiumCamera.up = Cesium.Cartesian3.normalize(upCesium, new Cesium.Cartesian3());
    
    // 调试日志（偶尔输出）
    if (Math.random() < 0.01) {
      console.log('[CameraSynchronizer] Camera sync:', {
        position: { x: cameraECEF.x.toFixed(0), y: cameraECEF.y.toFixed(0), z: cameraECEF.z.toFixed(0) },
        direction: { x: cesiumCamera.direction.x.toFixed(3), y: cesiumCamera.direction.y.toFixed(3), z: cesiumCamera.direction.z.toFixed(3) },
        up: { x: cesiumCamera.up.x.toFixed(3), y: cesiumCamera.up.y.toFixed(3), z: cesiumCamera.up.z.toFixed(3) }
      });
    }
    
    // 注意：不同步投影矩阵，让 Cesium 使用自己的投影矩阵和动态 near/far 裁剪面
  }
}
