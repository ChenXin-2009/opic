/**
 * 全球货运与贸易路线追踪 MOD 清单
 */

import type { ModManifest } from '@/lib/mod-manager/types';

export const globalTrafficManifest: ModManifest = {
  id: 'global-traffic',
  version: '1.0.0',
  name: 'Global Traffic & Trade Routes',
  nameZh: '全球货运与贸易路线',
  description: 'Real-time tracking of global shipping lanes, flight routes, and trade corridors with multiple public data sources',
  descriptionZh: '实时追踪全球船舶航道、航班路线和贸易走廊，支持多种公开数据源',
  author: 'CXIC Team',
  entryPoint: 'onLoad',
  hasConfig: true,
  configComponent: 'GlobalTrafficConfig',
  defaultEnabled: false,
  apiVersion: '1.0.0',
  capabilities: [
    { name: 'render:3d', required: true },
    { name: 'network:fetch', required: false },
  ],
};
