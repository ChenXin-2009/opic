/**
 * 场景模式切换集成示例
 * 
 * 本文件展示如何在 SolarSystemCanvas3D 中集成场景模式切换系统
 * 
 * 使用方法：
 * 1. 将相关代码复制到 SolarSystemCanvas3D.tsx
 * 2. 根据实际情况调整变量名和引用
 * 3. 测试切换效果
 */

import * as THREE from 'three';
import { SceneMode } from './SceneModeManager';

/**
 * 示例：在动画循环中添加场景模式更新
 */
export function exampleAnimationLoop() {
  // 假设这些引用已经在组件中定义
  const sceneManagerRef: any = { current: null };
  const planetsRef: any = { current: new Map() };
  const cameraRef: any = { current: null };
  const cameraControllerRef: any = { current: null };
  
  const animate = () => {
    // ... 现有的动画循环代码 ...
    
    // ========== 添加场景模式更新 ==========
    const earthPlanet = planetsRef.current.get('earth');
    const camera = cameraRef.current;
    const sceneManager = sceneManagerRef.current;
    
    if (earthPlanet && camera && sceneManager) {
      // 1. 计算相机到地球的距离
      const earthPos = earthPlanet.getMesh().position;
      const cameraPos = camera.position;
      const distanceToEarth = cameraPos.distanceTo(earthPos);
      
      // 2. 更新场景模式（自动检测是否需要切换）
      const modeChanged = sceneManager.updateSceneMode(distanceToEarth);
      
      // 3. 如果模式发生了切换，执行相应的处理
      if (modeChanged) {
        const currentMode = sceneManager
          .getSceneModeManager()
          .getCurrentMode();
        
        console.log(`[SceneMode] Switched to: ${currentMode}`);
        
        // 调用模式切换处理函数
        handleModeSwitch(currentMode, {
          earthPlanet,
          camera,
          cameraController: cameraControllerRef.current,
          sceneManager,
        });
      }
      
      // 4. 根据当前模式执行相应的相机同步
      const currentMode = sceneManager
        .getSceneModeManager()
        .getCurrentMode();
      
      if (currentMode === SceneMode.CESIUM_DOMINANT) {
        // Cesium 主导模式：从 Cesium 同步到 Three.js
        syncCameraFromCesium(earthPlanet, camera, earthPos);
      } else {
        // Three.js 主导模式：从 Three.js 同步到 Cesium
        syncCameraToCesium(earthPlanet, camera, earthPos);
      }
    }
    
    // ... 现有的动画循环代码 ...
    
    requestAnimationFrame(animate);
  };
  
  animate();
}

/**
 * 处理场景模式切换
 */
function handleModeSwitch(
  mode: SceneMode,
  context: {
    earthPlanet: any;
    camera: THREE.PerspectiveCamera;
    cameraController: any;
    sceneManager: any;
  }
) {
  const { earthPlanet, camera, cameraController, sceneManager } = context;
  
  if (mode === SceneMode.CESIUM_DOMINANT) {
    // ========== 切换到 Cesium 主导模式 ==========
    console.log('[SceneMode] Switching to CESIUM_DOMINANT mode');
    
    // 1. 确保 Cesium 渲染已启用
    if ('setCesiumEnabled' in earthPlanet) {
      earthPlanet.setCesiumEnabled(true, camera);
    }
    
    // 2. 启用 Cesium 原生相机控制
    if ('getCesiumExtension' in earthPlanet) {
      const cesiumExt = earthPlanet.getCesiumExtension();
      if (cesiumExt) {
        cesiumExt.setNativeCameraEnabled(true);
        console.log('[SceneMode] Cesium native camera enabled');
      }
    }
    
    // 3. 禁用 Three.js OrbitControls
    if (cameraController) {
      const controls = cameraController.getControls();
      controls.enabled = false;
      console.log('[SceneMode] Three.js OrbitControls disabled');
    }
    
    // 4. 调整 Three.js canvas 层级和事件处理
    const renderer = sceneManager.getRenderer();
    if (renderer) {
      // Three.js canvas 提升到上层，但不拦截事件
      renderer.domElement.style.zIndex = '1';
      renderer.domElement.style.pointerEvents = 'none';
      console.log('[SceneMode] Three.js canvas: z-index=1, pointerEvents=none');
    }
    
  } else {
    // ========== 切换回 Three.js 主导模式 ==========
    console.log('[SceneMode] Switching to THREE_DOMINANT mode');
    
    // 1. 禁用 Cesium 原生相机控制
    if ('getCesiumExtension' in earthPlanet) {
      const cesiumExt = earthPlanet.getCesiumExtension();
      if (cesiumExt) {
        cesiumExt.setNativeCameraEnabled(false);
        console.log('[SceneMode] Cesium native camera disabled');
      }
    }
    
    // 2. 启用 Three.js OrbitControls
    if (cameraController) {
      const controls = cameraController.getControls();
      controls.enabled = true;
      console.log('[SceneMode] Three.js OrbitControls enabled');
    }
    
    // 3. 恢复 Three.js canvas 层级和事件处理
    const renderer = sceneManager.getRenderer();
    if (renderer) {
      renderer.domElement.style.zIndex = '1';
      renderer.domElement.style.pointerEvents = 'auto';
      console.log('[SceneMode] Three.js canvas: z-index=1, pointerEvents=auto');
    }
    
    // 4. 可选：保持 Cesium 渲染启用（用于远距离观察）
    // 或者完全禁用以节省性能
    // if ('setCesiumEnabled' in earthPlanet) {
    //   earthPlanet.setCesiumEnabled(false);
    // }
  }
}

/**
 * 从 Three.js 同步相机到 Cesium（Three.js 主导模式）
 */
function syncCameraToCesium(
  earthPlanet: any,
  camera: THREE.PerspectiveCamera,
  earthPos: THREE.Vector3
) {
  if ('getCesiumExtension' in earthPlanet) {
    const cesiumExt = earthPlanet.getCesiumExtension();
    if (cesiumExt) {
      cesiumExt.syncCamera(camera, earthPos);
      cesiumExt.render();
    }
  }
}

/**
 * 从 Cesium 同步相机到 Three.js（Cesium 主导模式）
 */
function syncCameraFromCesium(
  earthPlanet: any,
  camera: THREE.PerspectiveCamera,
  earthPos: THREE.Vector3
) {
  if ('getCesiumExtension' in earthPlanet) {
    const cesiumExt = earthPlanet.getCesiumExtension();
    if (cesiumExt) {
      cesiumExt.syncCameraFromCesium(camera, earthPos);
    }
  }
}

/**
 * 示例：注册模式切换回调（在 useEffect 中）
 */
export function exampleRegisterCallback() {
  const sceneManagerRef: any = { current: null };
  
  // 在 useEffect 中注册
  const sceneManager = sceneManagerRef.current;
  if (!sceneManager) return;
  
  const sceneModeManager = sceneManager.getSceneModeManager();
  
  // 注册回调
  const unsubscribe = sceneModeManager.onModeChange((mode) => {
    console.log(`[SceneMode] Mode changed to: ${mode}`);
    
    // 可以在这里执行额外的处理
    // 例如：更新 UI、触发动画等
  });
  
  // 返回清理函数
  return () => {
    unsubscribe();
  };
}

/**
 * 示例：自定义配置
 */
export function exampleCustomConfig() {
  const sceneManagerRef: any = { current: null };
  
  const sceneManager = sceneManagerRef.current;
  if (!sceneManager) return;
  
  const sceneModeManager = sceneManager.getSceneModeManager();
  
  // 自定义阈值
  sceneModeManager.updateConfig({
    // 更近才切换到 Cesium 模式（0.00005 AU ≈ 7,500 km）
    cesiumModeDistanceThreshold: 0.00005,
    
    // 更近才切回 Three.js 模式（0.0001 AU ≈ 15,000 km）
    threeModeDistanceThreshold: 0.0001,
    
    // 启用自动切换
    autoSwitch: true,
    
    // 过渡动画时长
    transitionDuration: 1000,
  });
}

/**
 * 示例：手动切换模式
 */
export function exampleManualSwitch() {
  const sceneManagerRef: any = { current: null };
  
  const sceneManager = sceneManagerRef.current;
  if (!sceneManager) return;
  
  const sceneModeManager = sceneManager.getSceneModeManager();
  
  // 禁用自动切换
  sceneModeManager.updateConfig({
    autoSwitch: false
  });
  
  // 手动切换到 Cesium 模式
  sceneModeManager.switchMode(SceneMode.CESIUM_DOMINANT);
  
  // 或切换回 Three.js 模式
  // sceneModeManager.switchMode(SceneMode.THREE_DOMINANT);
}
