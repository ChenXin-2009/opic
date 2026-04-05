/**
 * 气象灾害监测MOD清单
 */

import type { ModManifest } from '@/lib/mod-manager/types';

export const weatherDisasterManifest: ModManifest = {
  id: 'weather-disaster',
  version: '1.0.0',
  name: 'Weather & Disaster Monitor',
  nameZh: '气象灾害监测',
  description: 'Real-time weather data and disaster monitoring: typhoons, earthquakes, floods, wildfires and more',
  descriptionZh: '实时气象数据与灾害监测：台风、地震、洪水、野火等多源数据可视化',
  author: 'CXIC Team',
  entryPoint: 'onLoad',
  hasConfig: true,
  defaultEnabled: false,
  apiVersion: '1.0.0',
  capabilities: [
    { name: 'render:cesium', required: false },
    { name: 'render:3d', required: true },
  ],
};
