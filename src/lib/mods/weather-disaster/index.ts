/**
 * 气象灾害监测 MOD
 */

import type { ModLifecycleHooks, ModContext } from '@/lib/mod-manager/types';
import * as THREE from 'three';
import { weatherDisasterManifest } from './manifest';
import { DisasterRenderer } from './DisasterRenderer';

export const weatherDisasterHooks: ModLifecycleHooks = {
  onLoad: async (context: ModContext) => {
    context.logger.info('[Weather Disaster] MOD 加载中...');
  },

  onEnable: async (context: ModContext) => {
    context.logger.info('[Weather Disaster] MOD 启用');

    const renderer = new DisasterRenderer();

    try {
      const scene = context.render.getScene() as THREE.Scene;
      scene.add(renderer.getGroup());
    } catch {
      context.logger.warn('[Weather Disaster] 无法获取场景');
    }

    // 注册每帧 tick 用于脉冲动画
    let lastTime = Date.now();
    const unsubscribeRender = context.render.onBeforeRender(() => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      renderer.tick(delta);
    });

    context.setState({ renderer, unsubscribeRender });
    context.logger.info('[Weather Disaster] 渲染器已挂载');
  },

  onDisable: async (context: ModContext) => {
    context.logger.info('[Weather Disaster] MOD 禁用');
    const state = context.getState() as {
      renderer?: DisasterRenderer;
      unsubscribeRender?: () => void;
    };

    if (state.unsubscribeRender) state.unsubscribeRender();

    if (state.renderer) {
      try {
        const scene = context.render.getScene() as THREE.Scene;
        scene.remove(state.renderer.getGroup());
      } catch { /* ignore */ }
      state.renderer.dispose();
    }
  },

  onUnload: async (context: ModContext) => {
    context.logger.info('[Weather Disaster] MOD 卸载');
  },

  onError: (error: Error, context: ModContext) => {
    context.logger.error('[Weather Disaster] 错误:', error);
  },
  
  // 命令处理器
  handleToggle: (context: ModContext) => {
    context.logger.info('[Weather Disaster] 切换气象灾害监测显示');
    
    // 触发打开窗口的事件
    context.emit('mod:open-window', {
      modId: 'weather-disaster',
      windowId: 'weather-disaster-window',
      title: 'Weather & Disaster Monitor',
      titleZh: '气象灾害监测',
    });
  },
};

export function getWeatherDisasterMod() {
  return {
    manifest: weatherDisasterManifest,
    hooks: weatherDisasterHooks,
  };
}

export { weatherDisasterManifest } from './manifest';
export { DisasterRenderer } from './DisasterRenderer';
export type { DisasterPoint } from './DisasterRenderer';
export { useDisasterData } from './useDisasterData';
export type { DataSourceId, SourceState } from './useDisasterData';
