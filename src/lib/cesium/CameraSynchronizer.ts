/**
 * CameraSynchronizer - 相机同步器
 * 
 * 负责在 Three.js 相机和 Cesium 相机之间双向同步
 * 支持两种模式：
 * 1. Three.js → Cesium（当 Three.js 控制相机时）
 * 2. Cesium → Three.js（当 Cesium 控制相机时）
 */

import * as THREE from 'three';
import * as Cesium from 'cesium';
import { CoordinateTransformer, debugRotationOffset } from './CoordinateTransformer';

/**
 * CameraSynchronizer - 相机同步工具类
 */
export class CameraSynchronizer {
  /**
   * 同步视图矩阵（Three.js → Cesium）
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
    earthPosition: THREE.Vector3,
    currentTime?: Cesium.JulianDate
  ): void {
    // 完整变换链：黄道惯性系 → 赤道惯性系(ICRF) → ECEF(ITRF)
    //
    // 步骤一：黄道 → 赤道惯性系（绕 X 轴旋转 -ε，ε = 黄赤交角 23.4393°）
    //   x' = x
    //   y' = y * cos(ε) - z * sin(ε)
    //   z' = y * sin(ε) + z * cos(ε)
    //
    // 步骤二：赤道惯性系(ICRF) → ECEF(ITRF)（绕 Z 轴旋转 -GMST）
    //   使用 Cesium.Transforms.computeIcrfToFixedMatrix 精确计算
    //   GMST 随时间变化，必须用仿真当前时间计算

    const cosObl = Math.cos(23.4393 * Math.PI / 180);
    const sinObl = Math.sin(23.4393 * Math.PI / 180);

    // 获取 ICRF → ECEF 旋转矩阵（主要是绕 Z 轴的 GMST 旋转）
    const icrfToFixed = new Cesium.Matrix3();
    const time = currentTime ?? (cesiumCamera.frustum ? Cesium.JulianDate.now() : undefined);
    let hasIcrfMatrix = false;
    if (time) {
      const result = Cesium.Transforms.computeIcrfToFixedMatrix(time, icrfToFixed);
      hasIcrfMatrix = !!result;
    }

    // 辅助函数：把一个向量经过完整变换链转到 ECEF
    const transformToECEF = (v: THREE.Vector3): [number, number, number] => {
      // 步骤一：黄道 → 赤道惯性系
      const ix = v.x;
      const iy = v.y * cosObl - v.z * sinObl;
      const iz = v.y * sinObl + v.z * cosObl;

      if (hasIcrfMatrix) {
        // 步骤二：赤道惯性系 → ECEF（用 Cesium 精确矩阵）
        const inertial = new Cesium.Cartesian3(ix, iy, iz);
        const ecef = Cesium.Matrix3.multiplyByVector(icrfToFixed, inertial, new Cesium.Cartesian3());
        return [ecef.x, ecef.y, ecef.z];
      }
      // fallback：无时间信息时直接用惯性系坐标
      return [ix, iy, iz];
    };

    // 1. 转换相机位置（黄道 → ECEF）
    const localPosition = threeCamera.position.clone().sub(earthPosition);
    const [px, py, pz] = transformToECEF(localPosition);
    const cameraECEF = new Cesium.Cartesian3(
      px * 149597870700,
      py * 149597870700,
      pz * 149597870700
    );
    cesiumCamera.position = cameraECEF;

    // 2. 获取 Three.js 相机方向向量
    const directionThree = new THREE.Vector3();
    const upThree = new THREE.Vector3();
    threeCamera.getWorldDirection(directionThree);
    upThree.set(0, 1, 0).applyQuaternion(threeCamera.quaternion).normalize();

    // 3. 转换方向和上向量（黄道 → ECEF）
    const [dDirX, dDirY, dDirZ] = transformToECEF(directionThree);
    const [dUpX, dUpY, dUpZ] = transformToECEF(upThree);

    // 4. 应用调试旋转偏移
    let fDirX = dDirX, fDirY = dDirY, fDirZ = dDirZ;
    let fUpX = dUpX, fUpY = dUpY, fUpZ = dUpZ;
    if (debugRotationOffset.x !== 0) {
      const rx = debugRotationOffset.x * Math.PI / 180;
      const cy = Math.cos(rx), sy = Math.sin(rx);
      [fDirY, fDirZ] = [fDirY * cy - fDirZ * sy, fDirY * sy + fDirZ * cy];
      [fUpY, fUpZ] = [fUpY * cy - fUpZ * sy, fUpY * sy + fUpZ * cy];
    }
    if (debugRotationOffset.y !== 0) {
      const ry = debugRotationOffset.y * Math.PI / 180;
      const cx = Math.cos(ry), sx = Math.sin(ry);
      [fDirX, fDirZ] = [fDirX * cx + fDirZ * sx, -fDirX * sx + fDirZ * cx];
      [fUpX, fUpZ] = [fUpX * cx + fUpZ * sx, -fUpX * sx + fUpZ * cx];
    }
    if (debugRotationOffset.z !== 0) {
      const rz = debugRotationOffset.z * Math.PI / 180;
      const cz = Math.cos(rz), sz = Math.sin(rz);
      [fDirX, fDirY] = [fDirX * cz - fDirY * sz, fDirX * sz + fDirY * cz];
      [fUpX, fUpY] = [fUpX * cz - fUpY * sz, fUpX * sz + fUpY * cz];
    }

    const directionCesium = new Cesium.Cartesian3(fDirX, fDirY, fDirZ);
    const upCesium = new Cesium.Cartesian3(fUpX, fUpY, fUpZ);

    // 安全检查：方向/上向量不能是零向量或含 NaN（会导致 Cesium normalize 崩溃）
    const dirLen = Math.sqrt(fDirX*fDirX + fDirY*fDirY + fDirZ*fDirZ);
    const upLen  = Math.sqrt(fUpX*fUpX  + fUpY*fUpY  + fUpZ*fUpZ);
    if (!isFinite(dirLen) || dirLen < 1e-10 || !isFinite(upLen) || upLen < 1e-10) return;
    
    // 5. 设置 Cesium 相机方向（归一化）
    cesiumCamera.direction = Cesium.Cartesian3.normalize(directionCesium, new Cesium.Cartesian3());
    cesiumCamera.up = Cesium.Cartesian3.normalize(upCesium, new Cesium.Cartesian3());
    
    // 6. 计算 Cesium 相机的右向量（用于验证正交性）
    const rightCesium = new Cesium.Cartesian3();
    Cesium.Cartesian3.cross(cesiumCamera.direction, cesiumCamera.up, rightCesium);
    Cesium.Cartesian3.normalize(rightCesium, rightCesium);
    
    // 调试日志（偶尔输出）
    if (Math.random() < 0.01) {
      console.log('[CameraSynchronizer] Three.js → Cesium sync:', {
        threePos: { x: threeCamera.position.x.toFixed(6), y: threeCamera.position.y.toFixed(6), z: threeCamera.position.z.toFixed(6) },
        threeDir: { x: directionThree.x.toFixed(3), y: directionThree.y.toFixed(3), z: directionThree.z.toFixed(3) },
        threeUp: { x: upThree.x.toFixed(3), y: upThree.y.toFixed(3), z: upThree.z.toFixed(3) },
        cesiumPos: { x: cameraECEF.x.toFixed(0), y: cameraECEF.y.toFixed(0), z: cameraECEF.z.toFixed(0) },
        cesiumDir: { x: cesiumCamera.direction.x.toFixed(3), y: cesiumCamera.direction.y.toFixed(3), z: cesiumCamera.direction.z.toFixed(3) },
        cesiumUp: { x: cesiumCamera.up.x.toFixed(3), y: cesiumCamera.up.y.toFixed(3), z: cesiumCamera.up.z.toFixed(3) },
        hasIcrfMatrix,
        earthPos: { x: earthPosition.x.toFixed(6), y: earthPosition.y.toFixed(6), z: earthPosition.z.toFixed(6) },
        localPosAU: { x: localPosition.x.toFixed(8), y: localPosition.y.toFixed(8), z: localPosition.z.toFixed(8) },
        distToEarthAU: localPosition.length().toFixed(8),
      });
    }

    // 同步 FOV 和 near/far
    if (cesiumCamera.frustum instanceof Cesium.PerspectiveFrustum) {
      const vFovRad = THREE.MathUtils.degToRad(threeCamera.fov);
      const aspect = threeCamera.aspect;
      const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
      cesiumCamera.frustum.fov = hFovRad;
      
      // 根据相机到地球表面的实际距离动态计算 near/far
      // Three.js 的 near/far 是 AU 单位，不能直接换算（宇宙尺度 near 换算后会远超地球半径）
      // Cesium 坐标系单位是米，地球半径约 6,371,000 m
      const EARTH_RADIUS_M = 6371000;
      const cameraAltitude = Math.max(0, Cesium.Cartesian3.magnitude(cesiumCamera.position) - EARTH_RADIUS_M);
      
      // near = 相机高度的 0.1%，最小 1m，最大 10000m
      // far = 足够覆盖整个地球及大气层（地球直径约 12742km，取 1e8m 保证宇宙视角也能用）
      cesiumCamera.frustum.near = Math.max(1, Math.min(10000, cameraAltitude * 0.001));
      cesiumCamera.frustum.far = Math.max(1e8, cameraAltitude * 100);
    }
  }
  
  /**
   * 反向同步视图矩阵（Cesium → Three.js）
   * 
   * 将 Cesium 相机的位置和方向同步到 Three.js 相机
   * 用于当 Cesium 控制相机时，让 Three.js 场景跟随
   * 
   * @param cesiumCamera - Cesium 相机
   * @param threeCamera - Three.js 相机
   * @param earthPosition - 地球在 Solar System Frame 中的位置（AU）
   */
  static syncFromCesium(
    cesiumCamera: Cesium.Camera,
    threeCamera: THREE.PerspectiveCamera,
    earthPosition: THREE.Vector3
  ): void {
    // 1. 转换 Cesium 相机位置（ECEF 米）为 Solar System Frame（AU）
    const cameraSolarSystem = CoordinateTransformer.ecefToSolarSystem(
      cesiumCamera.position,
      earthPosition
    );
    
    // 2. 设置 Three.js 相机位置
    threeCamera.position.copy(cameraSolarSystem);
    
    // 3. 坐标系转换：Cesium ECEF (Z-up, Y-forward) → Three.js (Y-up, Z-backward)
    // Cesium ECEF: X-right(本初子午线), Y-forward(东经90°), Z-up(北极)  右手系
    // Three.js:    X-right,             Y-up,               Z-backward   右手系
    //
    // 保持右手系手性的正确映射：
    //   Three.x =  Cesium.x
    //   Three.y =  Cesium.z
    //   Three.z = -Cesium.y   ← 负号保持手性，否则左右镜像
    const directionThree = new THREE.Vector3(
      cesiumCamera.direction.x,
      cesiumCamera.direction.z,
      -cesiumCamera.direction.y
    ).normalize();
    
    const upThree = new THREE.Vector3(
      cesiumCamera.up.x,
      cesiumCamera.up.z,
      -cesiumCamera.up.y
    ).normalize();
    
    // 4. 计算 Three.js 相机的目标点（相机位置 + 方向）
    const target = new THREE.Vector3().addVectors(
      threeCamera.position,
      directionThree
    );
    
    // 5. 使用 lookAt 设置相机方向
    threeCamera.up.copy(upThree);
    threeCamera.lookAt(target);
    
    // 调试日志（偶尔输出）
    if (Math.random() < 0.01) {
      console.log('[CameraSynchronizer] Cesium → Three.js sync:', {
        cesiumPos: { x: cesiumCamera.position.x.toFixed(0), y: cesiumCamera.position.y.toFixed(0), z: cesiumCamera.position.z.toFixed(0) },
        cesiumDir: { x: cesiumCamera.direction.x.toFixed(3), y: cesiumCamera.direction.y.toFixed(3), z: cesiumCamera.direction.z.toFixed(3) },
        cesiumUp: { x: cesiumCamera.up.x.toFixed(3), y: cesiumCamera.up.y.toFixed(3), z: cesiumCamera.up.z.toFixed(3) },
        threePos: { x: threeCamera.position.x.toFixed(6), y: threeCamera.position.y.toFixed(6), z: threeCamera.position.z.toFixed(6) },
        threeDir: { x: directionThree.x.toFixed(3), y: directionThree.y.toFixed(3), z: directionThree.z.toFixed(3) },
        threeUp: { x: upThree.x.toFixed(3), y: upThree.y.toFixed(3), z: upThree.z.toFixed(3) }
      });
    }
  }
}
