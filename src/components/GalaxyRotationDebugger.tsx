'use client';

import React, { useState, useEffect } from 'react';
import { GALAXY_CONFIG } from '@/lib/config/galaxyConfig';

interface GalaxyRotationDebuggerProps {
  onRotationChange?: (x: number, y: number, z: number) => void;
  onDebugModeChange?: (enabled: boolean) => void;
}

export function GalaxyRotationDebugger({ onRotationChange, onDebugModeChange }: GalaxyRotationDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rotationX, setRotationX] = useState(GALAXY_CONFIG.rotationX);
  const [rotationY, setRotationY] = useState(GALAXY_CONFIG.rotationY);
  const [rotationZ, setRotationZ] = useState(GALAXY_CONFIG.rotationZ);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showAxes, setShowAxes] = useState(false);
  const isFirstRender = React.useRef(true);

  useEffect(() => {
    // 跳过首次渲染，避免覆盖配置文件的值
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setIsInitialized(true);
      return;
    }
    
    if (onRotationChange) {
      console.log('🔧 银河系旋转调试: 更新旋转角度', { x: rotationX, y: rotationY, z: rotationZ });
      onRotationChange(rotationX, rotationY, rotationZ);
    }
  }, [rotationX, rotationY, rotationZ, onRotationChange]);

  useEffect(() => {
    if (onDebugModeChange) {
      onDebugModeChange(showAxes);
    }
  }, [showAxes, onDebugModeChange]);

  const handleReset = () => {
    setRotationX(-60.2);
    setRotationY(13.4);
    setRotationZ(103.0);
  };

  const copyToClipboard = () => {
    const config = `rotationX: ${rotationX},
rotationY: ${rotationY},
rotationZ: ${rotationZ},`;
    navigator.clipboard.writeText(config);
    alert('配置已复制到剪贴板！');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm"
      >
        🔧 银河系旋转调试
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 bg-opacity-95 text-white p-4 rounded-lg shadow-2xl z-50 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">银河系旋转调试器</h3>
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
            ✓ 已连接到银河系渲染器
          </div>
        )}
        
        {/* 坐标轴显示开关 */}
        <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
          <span className="text-sm">显示坐标轴</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showAxes}
              onChange={(e) => setShowAxes(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
          </label>
        </div>
        {showAxes && (
          <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-500">■</span> X 轴（红色）
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-500">■</span> Y 轴（绿色）
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">■</span> Z 轴（蓝色）
            </div>
          </div>
        )}
        
        {/* X 轴旋转 */}
        <div>
          <label className="block text-sm mb-1">
            X 轴旋转 (俯仰): {rotationX.toFixed(1)}°
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
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
            step="1"
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
            step="1"
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
          <p className="mb-1">调整后复制配置到 galaxyConfig.ts</p>
          <p className="text-gray-500">旋转顺序: YXZ</p>
          <p className="text-gray-500 mt-1">
            当前值: X={rotationX.toFixed(1)}° Y={rotationY.toFixed(1)}° Z={rotationZ.toFixed(1)}°
          </p>
        </div>
      </div>
    </div>
  );
}
