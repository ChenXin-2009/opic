/**
 * CesiumToggleButton.tsx - Cesium 渲染切换按钮（明日方舟风格）
 * 位于左下角，用于切换地球渲染模式（Planet 球体 / Cesium 瓦片）
 */

'use client';

import { useState } from 'react';

// 明日方舟风格配置
const ARKNIGHTS_CONFIG = {
  position: {
    bottom: '2rem',
    left: '2rem',
    // 移动端位置
    bottomMobile: '10rem',
    leftMobile: '1rem',
  },
  
  button: {
    width: '11rem',
    height: '3rem',
  },
  
  colors: {
    primary: '#ffffff',
    dark: '#0a0a0a',
    darkLight: '#1a1a1a',
    border: '#333333',
    text: '#ffffff',
    textDim: '#999999',
    accent: '#4a9eff', // 蓝色高光（地球主题）
  },
};

interface CesiumToggleButtonProps {
  onToggle?: (enabled: boolean) => void;
  initialEnabled?: boolean;
}

export default function CesiumToggleButton({ onToggle, initialEnabled = false }: CesiumToggleButtonProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    onToggle?.(newState);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          display: 'block',
          width: ARKNIGHTS_CONFIG.button.width,
          height: ARKNIGHTS_CONFIG.button.height,
          background: enabled ? ARKNIGHTS_CONFIG.colors.accent : ARKNIGHTS_CONFIG.colors.dark,
          border: `2px solid ${isHovered ? ARKNIGHTS_CONFIG.colors.primary : (enabled ? ARKNIGHTS_CONFIG.colors.accent : ARKNIGHTS_CONFIG.colors.border)}`,
          clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
          transition: 'all 0.3s ease',
          boxShadow: isHovered ? `0 0 20px ${enabled ? ARKNIGHTS_CONFIG.colors.accent : ARKNIGHTS_CONFIG.colors.primary}80` : 'none',
          cursor: 'pointer',
        }}
        aria-label={enabled ? 'Disable Cesium' : 'Enable Cesium'}
      >
        {/* 左上角菱形装饰 */}
        <div 
          className="absolute"
          style={{
            top: '-1px',
            left: '-1px',
            width: '12px',
            height: '12px',
            background: enabled ? ARKNIGHTS_CONFIG.colors.primary : ARKNIGHTS_CONFIG.colors.primary,
            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          }}
        />
        
        {/* 右下角菱形装饰 */}
        <div 
          className="absolute"
          style={{
            bottom: '-1px',
            right: '-1px',
            width: '12px',
            height: '12px',
            background: enabled ? ARKNIGHTS_CONFIG.colors.primary : ARKNIGHTS_CONFIG.colors.primary,
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          }}
        />
        
        {/* 内容 */}
        <div className="flex items-center justify-center gap-2 h-full px-3">
          {/* 地球图标 */}
          <svg
            fill="none"
            stroke={enabled ? ARKNIGHTS_CONFIG.colors.dark : ARKNIGHTS_CONFIG.colors.primary}
            viewBox="0 0 24 24"
            style={{ 
              width: '1.25rem', 
              height: '1.25rem',
              flexShrink: 0,
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          
          {/* 文字 */}
          <div className="flex flex-col items-start">
            <span 
              className="text-xs font-bold uppercase tracking-wider leading-tight"
              style={{ 
                color: enabled ? ARKNIGHTS_CONFIG.colors.dark : ARKNIGHTS_CONFIG.colors.primary,
              }}
            >
              CESIUM 地球
            </span>
            <span 
              className="text-[10px] uppercase tracking-wide leading-tight"
              style={{ 
                color: enabled ? ARKNIGHTS_CONFIG.colors.darkLight : ARKNIGHTS_CONFIG.colors.textDim,
              }}
            >
              {enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
          
          {/* 状态指示器 */}
          <div 
            className="ml-auto"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: enabled ? ARKNIGHTS_CONFIG.colors.dark : ARKNIGHTS_CONFIG.colors.accent,
              boxShadow: enabled ? `0 0 8px ${ARKNIGHTS_CONFIG.colors.dark}` : `0 0 8px ${ARKNIGHTS_CONFIG.colors.accent}`,
            }}
          />
        </div>
      </button>
    </>
  );
}
