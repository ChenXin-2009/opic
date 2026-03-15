/**
 * CoordinateTransformer - 坐标转换器
 * 
 * 负责 Solar System Frame ↔ ECEF 坐标转换
 * 提供 LLA ↔ ECEF 双向转换
 */

import * as THREE from 'three';
import * as Cesium from 'cesium';

/**
 * 坐标转换常量
 */
export class CoordinateConstants {
  /** 1 AU（天文单位）= 149,597,870,700 米 */
  static readonly AU_TO_METERS = 149597870700;
  
  /** 地球半径（米） */
  static readonly EARTH_RADIUS_METERS = 6371000;
  
  /** 地球半径（AU） */
  static readonly EARTH_RADIUS_AU = CoordinateConstants.EARTH_RADIUS_METERS / CoordinateConstants.AU_TO_METERS;
}

/**
 * CoordinateTransformer - 坐标转换工具类
 */
export class CoordinateTransformer {
  /**
   * Solar System Frame → Cesium Camera Position
   * 
   * 将太阳系坐标系中的相机位置转换为 Cesium 相机位置
   * 使用球面坐标系,确保相机高度在合理范围内
   * 
   * @param cameraPosition - 相机在 Solar System Frame 中的位置（AU）
   * @param earthPosition - 地球在 Solar System Frame 中的位置（AU）
   * @returns Cesium 相机位置 (ECEF 坐标,米)
   */
  static solarSystemToCesiumCamera(
    cameraPosition: THREE.Vector3,
    earthPosition: THREE.Vector3
  ): Cesium.Cartesian3 {
    // 1. 计算相机相对于地球的位置（局部坐标系）
    const localPosition = cameraPosition.clone().sub(earthPosition);
    
    // 2. 转换为球面坐标
    const distance = localPosition.length(); // AU
    
    // 防止除以零
    if (distance < 0.0000001) {
      console.warn('[CoordinateTransformer] Camera too close to Earth center, using default position');
      return new Cesium.Cartesian3(
        CoordinateConstants.EARTH_RADIUS_METERS * 2,
        0,
        0
      );
    }
    
    const distanceMeters = distance * CoordinateConstants.AU_TO_METERS;
    
    // 3. 计算经纬度
    // 注意：Three.js 使用 Y-up,需要转换为球面坐标
    const longitude = Math.atan2(localPosition.x, localPosition.z); // 弧度
    const latitude = Math.asin(Math.max(-1, Math.min(1, localPosition.y / distance))); // 弧度，限制在 [-1, 1]
    
    // 4. 计算高度（相机到地球表面的距离）
    const height = distanceMeters - CoordinateConstants.EARTH_RADIUS_METERS;
    
    // 5. 转换为 ECEF 坐标
    const longitudeDegrees = Cesium.Math.toDegrees(longitude);
    const latitudeDegrees = Cesium.Math.toDegrees(latitude);
    
    // 调试日志（每 60 次输出一次）
    if (Math.random() < 0.016) {
      console.log('[CoordinateTransformer] Camera conversion:', {
        localPos: { x: localPosition.x.toFixed(6), y: localPosition.y.toFixed(6), z: localPosition.z.toFixed(6) },
        distanceAU: distance.toFixed(6),
        lon: longitudeDegrees.toFixed(2),
        lat: latitudeDegrees.toFixed(2),
        heightKm: (height / 1000).toFixed(0)
      });
    }
    
    const cartographic = Cesium.Cartographic.fromDegrees(
      longitudeDegrees,
      latitudeDegrees,
      height
    );
    
    return Cesium.Cartographic.toCartesian(cartographic);
  }
  
  /**
   * Solar System Frame → ECEF
   * 
   * 将太阳系黄道坐标系（AU）转换为地心地固坐标系（meters）
   * 
   * @param position - Solar System Frame 坐标（AU）
   * @param earthPosition - 地球在 Solar System Frame 中的位置（AU）
   * @returns ECEF 坐标（meters）
   */
  static solarSystemToECEF(
    position: THREE.Vector3,
    earthPosition: THREE.Vector3
  ): Cesium.Cartesian3 {
    // 使用新的球面坐标转换方法
    return CoordinateTransformer.solarSystemToCesiumCamera(position, earthPosition);
  }
  
  /**
   * ECEF → Solar System Frame
   * 
   * 将地心地固坐标系（meters）转换为太阳系黄道坐标系（AU）
   * 
   * @param ecef - ECEF 坐标（meters）
   * @param earthPosition - 地球在 Solar System Frame 中的位置（AU）
   * @returns Solar System Frame 坐标（AU）
   */
  static ecefToSolarSystem(
    ecef: Cesium.Cartesian3,
    earthPosition: THREE.Vector3
  ): THREE.Vector3 {
    // 1. 坐标系转换：Cesium ECEF (Z-up) → Three.js (Y-up)
    const xMeters = ecef.x;
    const yMeters = ecef.z;
    const zMeters = ecef.y;
    
    // 2. 转换单位：meters → AU
    const localPosition = new THREE.Vector3(
      xMeters / CoordinateConstants.AU_TO_METERS,
      yMeters / CoordinateConstants.AU_TO_METERS,
      zMeters / CoordinateConstants.AU_TO_METERS
    );
    
    // 3. 转换为 Solar System Frame（加上地球位置）
    return localPosition.add(earthPosition);
  }
  
  /**
   * LLA → ECEF
   * 
   * 将经纬度高度坐标转换为地心地固坐标系
   * 
   * @param longitude - 经度（度）
   * @param latitude - 纬度（度）
   * @param height - 高度（米）
   * @returns ECEF 坐标（meters）
   */
  static llaToECEF(
    longitude: number,
    latitude: number,
    height: number
  ): Cesium.Cartesian3 {
    const cartographic = Cesium.Cartographic.fromDegrees(longitude, latitude, height);
    return Cesium.Cartographic.toCartesian(cartographic);
  }
  
  /**
   * ECEF → LLA
   * 
   * 将地心地固坐标系转换为经纬度高度坐标
   * 
   * @param ecef - ECEF 坐标（meters）
   * @returns { longitude, latitude, height }
   */
  static ecefToLLA(ecef: Cesium.Cartesian3): {
    longitude: number;
    latitude: number;
    height: number;
  } {
    const cartographic = Cesium.Cartographic.fromCartesian(ecef);
    return {
      longitude: Cesium.Math.toDegrees(cartographic.longitude),
      latitude: Cesium.Math.toDegrees(cartographic.latitude),
      height: cartographic.height
    };
  }
}
