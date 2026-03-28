/**
 * EarthLightButton.tsx - 地球光照开关按钮（明日方舟风格）
 * 控制 Cesium 地球的昼夜光照效果
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
    accent: '#fbbf24', // 黄色（灯光主题）
  },
};

interface EarthLightButtonProps {
  onToggle?: (enabled: boolean) => void;
  initialEnabled?: boolean;
}

export default function EarthLightButton({ onToggle, initialEnabled = true }: EarthLightButtonProps) {
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
      aria-label={enabled ? '关闭地球光照' : '开启地球光照'}
    >
      {/* 左上角菱形装饰 */}
      <div className="absolute" style={{ top: '-1px', left: '-1px', width: '12px', height: '12px', background: CONFIG.colors.primary, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      {/* 右下角菱形装饰 */}
      <div className="absolute" style={{ bottom: '-1px', right: '-1px', width: '12px', height: '12px', background: CONFIG.colors.primary, clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />

      <div className="flex items-center justify-center gap-2 h-full px-3">
        {/* 灯泡图标 */}
        <svg fill="none" stroke={enabled ? CONFIG.colors.dark : CONFIG.colors.primary} viewBox="0 0 24 24"
          style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }}>
          {enabled ? (
            // 亮灯：实心灯泡
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          ) : (
            // 暗灯：带斜线的灯泡
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547zM3 3l18 18" />
          )}
        </svg>

        <div className="flex flex-col items-start">
          <span className="text-xs font-bold uppercase tracking-wider leading-tight"
            style={{ color: enabled ? CONFIG.colors.dark : CONFIG.colors.primary }}>
            地球光照
          </span>
          <span className="text-[10px] uppercase tracking-wide leading-tight"
            style={{ color: enabled ? CONFIG.colors.darkLight : CONFIG.colors.textDim }}>
            {enabled ? 'DAY/NIGHT' : 'ALL DAY'}
          </span>
        </div>

        <div className="ml-auto" style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: enabled ? CONFIG.colors.dark : CONFIG.colors.accent,
          boxShadow: `0 0 8px ${enabled ? CONFIG.colors.dark : CONFIG.colors.accent}`,
        }} />
      </div>
    </button>
  );
}
