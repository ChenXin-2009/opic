/**
 * 卫星追踪MOD清单
 */

import type { ModManifest } from '@/lib/mod-manager/types';

export const satelliteTrackingManifest: ModManifest = {
  id: 'satellite-tracking',
  version: '2.0.0',
  name: 'Satellite Tracking',
  nameZh: '卫星追踪',
  description: 'Real-time satellite tracking with live position, ground track, pass predictions, orbit visualization and coverage areas. Data from Celestrak TLE + UCS metadata.',
  descriptionZh: '实时卫星追踪：实时位置（经纬度/高度/速度）、地面轨迹、过境预测、3D轨道可视化、服务覆盖区域。数据来源：Celestrak TLE + UCS卫星数据库。',
  author: 'CXIC Team',
  entryPoint: 'onLoad',
  hasConfig: true,
  defaultEnabled: true,
  apiVersion: '1.0.0',
  capabilities: [
    { name: 'satellite:tracking', required: true },
    { name: 'satellite:realtime', required: true },
    { name: 'satellite:passes', required: false },
    { name: 'satellite:groundtrack', required: false },
    { name: 'render:3d', required: true },
  ],
};