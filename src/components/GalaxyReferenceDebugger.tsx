'use client';

import React, { useState, useEffect } from 'react';

interface GalaxyReferenceDebuggerProps {
  onRotationChange?: (x: number, y: number, z: number) => void;
  initialRotation?: { x: number; y: number; z: number };
}

export function GalaxyReferenceDebugger({ onRotationChange, initialRotation }: GalaxyReferenceDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rotationX, setRotationX] = useState(initialRotation?.x ?? 0);
  const [rotationY, setRotationY] = useState(initialRotation?.y ?? 0);
  const [rotationZ, setRotationZ] = useState(initialRotation?.z ?? 0);
  const isFirstRender = React.useRef(true);

  useEffect(() => {
    // 跳过首次渲染
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (onRotationChange) {
      console.log('🔧 银河系参考系调试: 更新旋转角度', { x: rotationX, y: rotationY, z: rotationZ });
      onRotationChange(rotationX, rotationY, rotationZ);
    }
  }, [rotationX, rotationY, rotationZ, onRotationChange]);

  const copyToClipboard = () => {
    const config = `宇宙组旋转偏移（蓝色圆圈和外部星团一起旋转）:
rotationOffsetX: ${rotationX.toFixed(1)},
rotationOffsetY: ${rotationY.toFixed(1)},
rotationOffsetZ: ${rotationZ.toFixed(1)},

完整配置代码：
// 在 SceneManager.ts 的 constructor 中，创建 universeGroup 后：
this.universeGroup.rotation.order = 'YXZ';
this.universeGroup.rotation.x = ${rotationX.toFixed(1)} * (Math.PI / 180);
this.universeGroup.rotation.y = ${rotationY.toFixed(1)} * (Math.PI / 180);
this.universeGroup.rotation.z = ${rotationZ.toFixed(1)} * (Math.PI / 180);`;
    navigator.clipboard.writeText(config);
    alert('配置已复制到剪贴板！\n\n你可以将这些值应用到 SceneManager.ts 中的 universeGroup');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm"
      >
        🔵 银河系参考系调试
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 bg-blue-900 bg-opacity-95 text-white p-4 rounded-lg shadow-2xl z-50 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">银河系参考系调试器</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div className="text-xs text-blue-300 mb-2 p-2 bg-blue-800 rounded">
          ⚠️ 这个工具会同时旋转蓝色圆圈和外部星团
        </div>
        
        <div className="text-xs text-gray-300 mb-2 p-2 bg-gray-800 rounded">
          📍 目标：让蓝色圆圈与银河系图片对齐
        </div>
        
        <div className="text-xs text-yellow-300 mb-2 p-2 bg-yellow-900 bg-opacity-30 rounded">
          💡 提示：放大到本星系群尺度（200k-10M光年）才能看到蓝色圆圈和外部星团
        </div>
        
        {/* X 轴旋转 */}
        <div>
          <label className="block text-sm mb-1">
            X 轴旋转偏移: {rotationX.toFixed(1)}°
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            step="0.5"
            value={rotationX}
            onChange={(e) => setRotationX(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>-180°</span>
            <span>0°</span>
            <span>180°</span>
          </div>
        </div>

        {/* Y 轴旋转 */}
        <div>
          <label className="block text-sm mb-1">
            Y 轴旋转偏移: {rotationY.toFixed(1)}°
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            step="0.5"
            value={rotationY}
            onChange={(e) => setRotationY(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>-180°</span>
            <span>0°</span>
            <span>180°</span>
          </div>
        </div>

        {/* Z 轴旋转 */}
        <div>
          <label className="block text-sm mb-1">
            Z 轴旋转偏移: {rotationZ.toFixed(1)}°
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            step="0.5"
            value={rotationZ}
            onChange={(e) => setRotationZ(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>-180°</span>
            <span>0°</span>
            <span>180°</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              setRotationX(0);
              setRotationY(0);
              setRotationZ(0);
            }}
            className="flex-1 bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded text-sm"
          >
            重置
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
          >
            复制配置
          </button>
        </div>

        {/* 说明 */}
        <div className="text-xs text-gray-400 pt-2 border-t border-blue-700">
          <p className="mb-1">调整宇宙组（蓝色圆圈和外部星团）的旋转角度</p>
          <p className="text-gray-500 mb-2">
            当前偏移: X={rotationX.toFixed(1)}° Y={rotationY.toFixed(1)}° Z={rotationZ.toFixed(1)}°
          </p>
          <p className="text-gray-500 text-xs">
            蓝色圆圈基础旋转: X=-60.2° Y=13.4° Z=103.0°
          </p>
          <p className="text-gray-500 text-xs">
            宇宙组最终旋转: X={rotationX.toFixed(1)}° Y={rotationY.toFixed(1)}° Z={rotationZ.toFixed(1)}°
          </p>
        </div>
      </div>
    </div>
  );
}
