/**
 * EarthLockButton.tsx - 地球锁定相机模式切换按钮（明日方舟风格）
 * 位于 Cesium 切换按钮上方，用于锁定相机相对于地球表面的位置
 */

'use client';

import { useState } from 'react';

const CONFIG = {
  colors: {
    primary: '#ffffff',
    dark: '#0a0a0a',
    darkLight: '#1a1a1a',
    border: '#333333',
    text: '#ffffff',
    textDim: '#999999',
    accent: '#f5a623', // 橙色（地球锁定主题）
  },
};

interface EarthLockButtonProps {
  onToggle?: (enabled: boolean) => void;
  initialEnabled?: boolean;
}

export default function EarthLockButton({ onToggle, initialEnabled = false }: EarthLockButtonProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    onToggle?.(newState);
  };

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
        background: enabled ? CONFIG.colors.accent : CONFIG.colors.dark,
        border: `2px solid ${isHovered ? CONFIG.colors.primary : (enabled ? CONFIG.colors.accent : CONFIG.colors.border)}`,
        clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
        transition: 'all 0.3s ease',
        boxShadow: isHovered ? `0 0 20px ${enabled ? CONFIG.colors.accent : CONFIG.colors.primary}80` : 'none',
        cursor: 'pointer',
      }}
      aria-label={enabled ? '解除地球锁定' : '锁定相机到地球'}
    >
      {/* 左上角菱形装饰 */}
      <div
        className="absolute"
        style={{
          top: '-1px', left: '-1px',
          width: '12px', height: '12px',
          background: CONFIG.colors.primary,
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />
      {/* 右下角菱形装饰 */}
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
        {/* 锁定图标 */}
        <svg
          fill="none"
          stroke={enabled ? CONFIG.colors.dark : CONFIG.colors.primary}
          viewBox="0 0 24 24"
          style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }}
        >
          {enabled ? (
            // 锁定状态：闭合锁
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          ) : (
            // 未锁定状态：开锁
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          )}
        </svg>

        <div className="flex flex-col items-start">
          <span
            className="text-xs font-bold uppercase tracking-wider leading-tight"
            style={{ color: enabled ? CONFIG.colors.dark : CONFIG.colors.primary }}
          >
            地球锁定
          </span>
          <span
            className="text-[10px] uppercase tracking-wide leading-tight"
            style={{ color: enabled ? CONFIG.colors.darkLight : CONFIG.colors.textDim }}
          >
            {enabled ? 'LOCKED' : 'FREE'}
          </span>
        </div>

        <div
          className="ml-auto"
          style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: enabled ? CONFIG.colors.dark : CONFIG.colors.accent,
            boxShadow: `0 0 8px ${enabled ? CONFIG.colors.dark : CONFIG.colors.accent}`,
          }}
        />
      </div>
    </button>
  );
}
