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
    
    // 3. 获取 Three.js 相机的世界变换矩阵
    const worldMatrix = threeCamera.matrixWorld;
    
    // 4. 从世界矩阵提取方向向量（已经在世界空间）
    // Three.js 相机默认看向 -Z 方向
    const directionThree = new THREE.Vector3(0, 0, -1);
    const upThree = new THREE.Vector3(0, 1, 0);
    
    // 应用相机的旋转（不包括位置）
    directionThree.applyMatrix4(worldMatrix).sub(threeCamera.position).normalize();
    upThree.applyMatrix4(worldMatrix).sub(threeCamera.position).normalize();
    
    // 5. 坐标系转换：Three.js (Y-up, Z-backward) → Cesium ECEF (Z-up, Y-forward)
    // 转换矩阵：
    //   [1  0  0]   [x]
    //   [0  0  1] * [y]
    //   [0  1  0]   [z]
    // 即：Cesium(x,y,z) = Three(x, z, y)
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
    
    // 6. 设置 Cesium 相机方向（已归一化）
    cesiumCamera.direction = Cesium.Cartesian3.normalize(directionCesium, new Cesium.Cartesian3());
    cesiumCamera.up = Cesium.Cartesian3.normalize(upCesium, new Cesium.Cartesian3());
    
    // 调试日志（偶尔输出）
    if (Math.random() < 0.01) {
      console.log('[CameraSynchronizer] Camera sync:', {
        threeDir: { x: directionThree.x.toFixed(3), y: directionThree.y.toFixed(3), z: directionThree.z.toFixed(3) },
        cesiumDir: { x: cesiumCamera.direction.x.toFixed(3), y: cesiumCamera.direction.y.toFixed(3), z: cesiumCamera.direction.z.toFixed(3) },
        cesiumUp: { x: cesiumCamera.up.x.toFixed(3), y: cesiumCamera.up.y.toFixed(3), z: cesiumCamera.up.z.toFixed(3) }
      });
    }
    
    // 注意：不同步投影矩阵，让 Cesium 使用自己的投影矩阵和动态 near/far 裁剪面
  }
}
