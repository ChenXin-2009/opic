/**
 * @module mods
 * @description 核心MOD模块导出
 */

import { registerMod } from '@/lib/mod-manager/init';
import { getSatelliteTrackingMod } from './satellite-tracking';
import { getCesiumIntegrationMod } from './cesium-integration';
import { getWeatherDisasterMod } from './weather-disaster';
import { getGlobalTrafficMod } from './global-traffic';
import { getSpaceLaunchesMod } from './space-launches';

/**
 * 注册所有核心MOD
 */
export function registerCoreMods(): void {
  // 注册卫星追踪MOD
  const satelliteMod = getSatelliteTrackingMod();
  registerMod(satelliteMod.manifest, satelliteMod.hooks);

  // 注册Cesium集成MOD
  const cesiumMod = getCesiumIntegrationMod();
  registerMod(cesiumMod.manifest, cesiumMod.hooks);

  // 注册气象灾害监测MOD
  const weatherMod = getWeatherDisasterMod();
  registerMod(weatherMod.manifest, weatherMod.hooks);

  // 注册全球货运与贸易路线MOD
  const trafficMod = getGlobalTrafficMod();
  registerMod(trafficMod.manifest, trafficMod.hooks);

  // 注册商业航天发射追踪MOD
  const spaceLaunchesMod = getSpaceLaunchesMod();
  registerMod(spaceLaunchesMod.manifest, spaceLaunchesMod.hooks);

  console.log('[MODs] 核心MOD注册完成');
}

// 导出各个MOD
export { getSatelliteTrackingMod } from './satellite-tracking';
export { getCesiumIntegrationMod } from './cesium-integration';
export { getWeatherDisasterMod } from './weather-disaster';
export { getGlobalTrafficMod } from './global-traffic';
export { getSpaceLaunchesMod } from './space-launches';
