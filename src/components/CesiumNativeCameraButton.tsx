/**
 * CesiumNativeCameraButton.tsx - Cesium 原生摄像机切换按钮（明日方舟风格）
 *
 * @description 仅在 Cesium 地球模式开启时显示，允许用户切换到 Cesium 原生摄像机系统，
 *   直接通过鼠标/触摸操作地球（旋转、缩放、平移）。
 */

'use client';

import { useState } from 'react';
import { useSolarSystemStore } from '@/lib/state';

const CONFIG = {
  colors: {
    primary: '#ffffff',
    dark: '#0a0a0a',
    darkLight: '#1a1a1a',
    border: '#333333',
    textDim: '#999999',
    accent: '#00d4aa', // 青绿色，区别于其他按钮
  },
};

interface CesiumNativeCameraButtonProps {
  onToggle?: (enabled: boolean) => void;
  initialEnabled?: boolean;
}

export default function CesiumNativeCameraButton({
  onToggle,
  initialEnabled = false,
}: CesiumNativeCameraButtonProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isHovered, setIsHovered] = useState(false);
  const lang = useSolarSystemStore((state) => state.lang);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    onToggle?.(newState);
  };

  const accent = CONFIG.colors.accent;

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'block',
        width: '11rem',
        height: '3rem',
        background: enabled ? accent : CONFIG.colors.dark,
        border: `2px solid ${isHovered ? CONFIG.colors.primary : enabled ? accent : CONFIG.colors.border}`,
        clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
        transition: 'all 0.3s ease',
        boxShadow: isHovered ? `0 0 20px ${enabled ? accent : CONFIG.colors.primary}80` : 'none',
        cursor: 'pointer',
      }}
      aria-label={
        lang === 'zh'
          ? enabled ? '关闭 Cesium 原生摄像机' : '启用 Cesium 原生摄像机'
          : enabled ? 'Disable Native Camera' : 'Enable Native Camera'
      }
    >
      {/* 左上角切角装饰 */}
      <div
        className="absolute"
        style={{
          top: '-1px', left: '-1px',
          width: '12px', height: '12px',
          background: CONFIG.colors.primary,
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />
      {/* 右下角切角装饰 */}
      <div
        className="absolute"
        style={{
          bottom: '-1px', right: '-1px',
          width: '12px', height: '12px',
          background: CONFIG.colors.primary,
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        }}
      />

      <div className="flex items-center justify-center gap-2 h-full px-3">
        {/* 摄像机图标 */}
        <svg
          fill="none"
          stroke={enabled ? CONFIG.colors.dark : CONFIG.colors.primary}
          viewBox="0 0 24 24"
          style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
          />
        </svg>

        <div className="flex flex-col items-start">
          <span
            className="text-xs font-bold uppercase tracking-wider leading-tight"
            style={{ color: enabled ? CONFIG.colors.dark : CONFIG.colors.primary }}
          >
            {lang === 'zh' ? '原生摄像机' : 'NATIVE CAM'}
          </span>
          <span
            className="text-[10px] uppercase tracking-wide leading-tight"
            style={{ color: enabled ? CONFIG.colors.darkLight : CONFIG.colors.textDim }}
          >
            {enabled ? 'CESIUM' : 'THREE.JS'}
          </span>
        </div>

        {/* 状态指示灯 */}
        <div
          className="ml-auto"
          style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: enabled ? CONFIG.colors.dark : accent,
            boxShadow: `0 0 8px ${enabled ? CONFIG.colors.dark : accent}`,
          }}
        />
      </div>
    </button>
  );
}
