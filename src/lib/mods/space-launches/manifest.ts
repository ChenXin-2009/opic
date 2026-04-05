/**
 * 商业航天发射追踪 MOD 清单
 */

import type { ModManifest } from '@/lib/mod-manager/types';

export const spaceLaunchesManifest: ModManifest = {
  id: 'space-launches',
  version: '1.0.0',
  name: 'Space Launch Tracker',
  nameZh: '商业航天发射追踪',
  description: 'Real-time commercial space launch tracking: launch schedules, orbital insertions, mission progress and trajectory data from multiple public sources',
  descriptionZh: '实时商业航天发射追踪：发射时间表、轨道插入、任务进度和轨道数据，支持多种公开数据源',
  author: 'CXIC Team',
  entryPoint: 'onLoad',
  hasConfig: true,
  defaultEnabled: false,
  apiVersion: '1.0.0',
  capabilities: [
    { name: 'render:3d', required: true },
    { name: 'network:fetch', required: false },
  ],
};
