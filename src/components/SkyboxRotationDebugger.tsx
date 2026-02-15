'use client';

import React, { useState, useEffect } from 'react';

// 当前配置的默认值（基于天文学精确计算）
const DEFAULT_ROTATION = {
  x: 180.0,
  y: 152.9,
  z: 87.1,
};

interface SkyboxRotationDebuggerProps {
  onRotationChange?: (x: number, y: number, z: number) => void;
}

export function SkyboxRotationDebugger({ onRotationChange }: SkyboxRotationDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rotationX, setRotationX] = useState(DEFAULT_ROTATION.x);
  const [rotationY, setRotationY] = useState(DEFAULT_ROTATION.y);
  const [rotationZ, setRotationZ] = useState(DEFAULT_ROTATION.z);
  const [isInitialized, setIsInitialized] = useState(false);
  const isFirstRender = React.useRef(true);

  useEffect(() => {
    // 跳过首次渲染，避免覆盖配置文件的值
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setIsInitialized(true);
      return;
    }
    
    if (onRotationChange) {
      console.log('🌠 天空盒旋转调试: 更新旋转角度', { x: rotationX, y: rotationY, z: rotationZ });
      onRotationChange(rotationX, rotationY, rotationZ);
    }
  }, [rotationX, rotationY, rotationZ, onRotationChange]);

  const handleReset = () => {
    setRotationX(DEFAULT_ROTATION.x);
    setRotationY(DEFAULT_ROTATION.y);
    setRotationZ(DEFAULT_ROTATION.z);
  };

  const copyToClipboard = () => {
    const config = `const MILKY_WAY_ORIENTATION = {
  rotationX: ${rotationX},
  rotationY: ${rotationY},
  rotationZ: ${rotationZ},
};`;
    navigator.clipboard.writeText(config);
    alert('天空盒配置已复制到剪贴板！\n请粘贴到 src/lib/3d/SceneManager.ts 中');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm"
      >
        🌠 天空盒旋转调试
      </button>
    );
  }

  return (
    <div className="fixed bottom-32 right-4 bg-gray-900 bg-opacity-95 text-white p-4 rounded-lg shadow-2xl z-50 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">天空盒旋转调试器</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* 状态指示 */}
        {isInitialized && (
          <div className="text-xs text-green-400 mb-2">
            ✓ 已连接到天空盒
          </div>
        )}
        
        <div className="text-xs text-yellow-400 bg-yellow-900 bg-opacity-30 p-2 rounded mb-2">
          ⚠️ 这是太阳系层级的银河系背景（天空盒）
        </div>

        {/* X 轴旋转 */}
        <div>
          <label className="block text-sm mb-1">
            X 轴旋转 (俯仰): {rotationX.toFixed(1)}°
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
            Y 轴旋转 (偏航): {rotationY.toFixed(1)}°
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
            Z 轴旋转 (翻滚): {rotationZ.toFixed(1)}°
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
            onClick={handleReset}
            className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm"
          >
            重置
          </button>
          <button
            onClick={() => {
              setRotationX(0);
              setRotationY(0);
              setRotationZ(0);
            }}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-sm"
          >
            归零测试
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-sm"
          >
            复制配置
          </button>
        </div>

        {/* 说明 */}
        <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
          <p className="mb-1">调整后复制配置到 SceneManager.ts</p>
          <p className="text-gray-500">位置: MILKY_WAY_ORIENTATION</p>
          <p className="text-gray-500 mt-1">
            当前值: X={rotationX.toFixed(1)}° Y={rotationY.toFixed(1)}° Z={rotationZ.toFixed(1)}°
          </p>
        </div>
      </div>
    </div>
  );
}
