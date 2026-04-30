/**
 * 商业航天发射追踪 MOD 实现
 */

import type { ModLifecycleHooks, ModContext } from '@/lib/mod-manager/types';
import * as THREE from 'three';
import { spaceLaunchesManifest } from './manifest';
import { LaunchRenderer } from './LaunchRenderer';

export const spaceLaunchesHooks: ModLifecycleHooks = {
  onLoad: async (context: ModContext) => {
    context.logger.info('[Space Launches] MOD 加载中...');
  },

  onEnable: async (context: ModContext) => {
    context.logger.info('[Space Launches] MOD 启用');
    const renderer = new LaunchRenderer();
    try {
      const scene = context.render.getScene() as THREE.Scene;
      scene.add(renderer.getGroup());
    } catch {
      context.logger.warn('[Space Launches] 场景尚未就绪，将由 Overlay 挂载');
    }
    let lastTime = Date.now();
    const unsubscribeRender = context.render.onBeforeRender(() => {
      const now = Date.now();
      renderer.tick((now - lastTime) / 1000);
      lastTime = now;
    });
    context.setState({ renderer, unsubscribeRender });
  },

  onDisable: async (context: ModContext) => {
    context.logger.info('[Space Launches] MOD 禁用');
    const state = context.getState() as { renderer?: LaunchRenderer; unsubscribeRender?: () => void };
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
    context.logger.info('[Space Launches] MOD 卸载');
  },

  onError: (error: Error, context: ModContext) => {
    context.logger.error('[Space Launches] 错误:', error);
  },
  
  // 命令处理器
  handleToggle: (context: ModContext) => {
    context.logger.info('[Space Launches] 切换航天发射追踪显示');
    
    // 触发打开窗口的事件
    context.emit('mod:open-window', {
      modId: 'space-launches',
      windowId: 'space-launches-window',
      title: 'Space Launch Tracker',
      titleZh: '商业航天发射追踪',
    });
  },
};

export function getSpaceLaunchesMod() {
  return { manifest: spaceLaunchesManifest, hooks: spaceLaunchesHooks };
}

export { spaceLaunchesManifest } from './manifest';
export { LaunchRenderer } from './LaunchRenderer';
export type { LaunchPoint } from './LaunchRenderer';
