/**
 * SettingsMenu.tsx - 设置菜单
 * 位于右下角，点击按钮弹出设置菜单
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSolarSystemStore } from '@/lib/state';

// ==================== 可调参数配置 ====================
// ⚙️ 以下参数可在文件顶部调整，影响设置菜单的显示效果

// 设置菜单配置
const SETTINGS_CONFIG = {
  // 🔧 按钮位置（相对于屏幕）
  position: {
    bottom: '2rem',
    right: '2rem',
  },
  
  // 🔧 按钮样式
  button: {
    size: '3rem',
    iconSize: '2rem',
  },
  
  // 🔧 菜单样式
  menu: {
    width: '18rem',
    maxHeight: '28rem',
    padding: '1rem',
    gap: '0.75rem',
  },
  
  // 🔧 切换开关样式
  toggle: {
    container: {
      padding: '0.125rem',
    },
    button: {
      paddingX: '0.5rem',
      paddingY: '0.375rem',
      minWidth: '2.5rem',
    },
    slider: {
      positionNormal: '0.125rem',
      positionWide: '2.625rem',
      width: '2.5rem',
      marginTop: '0.125rem',
      marginBottom: '0.125rem',
    },
    animation: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

interface SettingsMenuProps {
  cameraController: any;
}

export default function SettingsMenu({ cameraController }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isWideAngle, setIsWideAngle] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 从 store 获取状态
  const lang = useSolarSystemStore((state) => state.lang);
  const setLang = useSolarSystemStore((state) => state.setLang);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return undefined;
  }, [isOpen]);

  // 切换超广角模式
  const handleWideAngleToggle = (wide: boolean) => {
    setIsWideAngle(wide);
    if (cameraController) {
      const fov = wide ? 120 : 45;
      cameraController.setFov(fov, true);
    }
  };

  const sliderLeftNormal = SETTINGS_CONFIG.toggle.slider.positionNormal;
  const sliderLeftWide = SETTINGS_CONFIG.toggle.slider.positionWide;
  const sliderWidth = SETTINGS_CONFIG.toggle.slider.width;
  const sliderTop = SETTINGS_CONFIG.toggle.slider.marginTop;
  const sliderBottom = SETTINGS_CONFIG.toggle.slider.marginBottom;

  return (
    <>
      {/* 设置按钮 */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bg-black/90 backdrop-blur-md rounded-full shadow-2xl border border-white/20 hover:bg-black/95 transition-all duration-300 flex items-center justify-center"
        style={{
          bottom: SETTINGS_CONFIG.position.bottom,
          right: SETTINGS_CONFIG.position.right,
          width: SETTINGS_CONFIG.button.size,
          height: SETTINGS_CONFIG.button.size,
          zIndex: 99999,
        }}
        aria-label={lang === 'zh' ? '设置' : 'Settings'}
      >
        <svg
          className="text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ width: SETTINGS_CONFIG.button.iconSize, height: SETTINGS_CONFIG.button.iconSize }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* 设置菜单 */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-black/90 backdrop-blur-md rounded-lg shadow-2xl border border-white/20 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards] overflow-y-auto"
          style={{
            bottom: `calc(${SETTINGS_CONFIG.position.bottom} + ${SETTINGS_CONFIG.button.size} + 0.5rem)`,
            right: SETTINGS_CONFIG.position.right,
            width: SETTINGS_CONFIG.menu.width,
            maxHeight: SETTINGS_CONFIG.menu.maxHeight,
            padding: SETTINGS_CONFIG.menu.padding,
          }}
        >
          <div className="flex flex-col gap-4">
            {/* 菜单标题 */}
            <div className="text-white text-base font-semibold border-b border-white/10 pb-2">
              {lang === 'zh' ? '设置' : 'Settings'}
            </div>

            {/* 语言切换 */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/80 text-sm font-medium flex-shrink-0">
                {lang === 'zh' ? '语言' : 'Language'}
              </span>
              <div
                className="relative bg-white/10 rounded-full flex-shrink-0"
                style={{ padding: SETTINGS_CONFIG.toggle.container.padding }}
              >
                <div className="flex relative">
                  <div
                    className="absolute rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all ease-out shadow-lg"
                    style={{
                      left: lang === 'zh' ? sliderLeftNormal : sliderLeftWide,
                      width: sliderWidth,
                      top: sliderTop,
                      bottom: sliderBottom,
                      transition: `left ${SETTINGS_CONFIG.toggle.animation.duration}ms ${SETTINGS_CONFIG.toggle.animation.easing}`,
                    }}
                  />
                  <button
                    onClick={() => setLang('zh')}
                    className={`relative z-10 rounded-full text-xs font-semibold transition-all duration-300 ${
                      lang === 'zh'
                        ? 'text-white drop-shadow-lg'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    style={{
                      paddingLeft: SETTINGS_CONFIG.toggle.button.paddingX,
                      paddingRight: SETTINGS_CONFIG.toggle.button.paddingX,
                      paddingTop: SETTINGS_CONFIG.toggle.button.paddingY,
                      paddingBottom: SETTINGS_CONFIG.toggle.button.paddingY,
                      minWidth: SETTINGS_CONFIG.toggle.button.minWidth,
                    }}
                  >
                    中文
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`relative z-10 rounded-full text-xs font-semibold transition-all duration-300 ${
                      lang === 'en'
                        ? 'text-white drop-shadow-lg'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    style={{
                      paddingLeft: SETTINGS_CONFIG.toggle.button.paddingX,
                      paddingRight: SETTINGS_CONFIG.toggle.button.paddingX,
                      paddingTop: SETTINGS_CONFIG.toggle.button.paddingY,
                      paddingBottom: SETTINGS_CONFIG.toggle.button.paddingY,
                      minWidth: SETTINGS_CONFIG.toggle.button.minWidth,
                    }}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>

            {/* 相机视野切换 */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/80 text-sm font-medium flex-shrink-0">
                {lang === 'zh' ? '相机视野' : 'Camera FOV'}
              </span>
              <div
                className="relative bg-white/10 rounded-full flex-shrink-0"
                style={{ padding: SETTINGS_CONFIG.toggle.container.padding }}
              >
                <div className="flex relative">
                  <div
                    className="absolute rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all ease-out shadow-lg"
                    style={{
                      left: isWideAngle ? sliderLeftWide : sliderLeftNormal,
                      width: sliderWidth,
                      top: sliderTop,
                      bottom: sliderBottom,
                      transition: `left ${SETTINGS_CONFIG.toggle.animation.duration}ms ${SETTINGS_CONFIG.toggle.animation.easing}`,
                    }}
                  />
                  <button
                    onClick={() => handleWideAngleToggle(false)}
                    className={`relative z-10 rounded-full text-xs font-semibold transition-all duration-300 ${
                      !isWideAngle
                        ? 'text-white drop-shadow-lg'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    style={{
                      paddingLeft: SETTINGS_CONFIG.toggle.button.paddingX,
                      paddingRight: SETTINGS_CONFIG.toggle.button.paddingX,
                      paddingTop: SETTINGS_CONFIG.toggle.button.paddingY,
                      paddingBottom: SETTINGS_CONFIG.toggle.button.paddingY,
                      minWidth: SETTINGS_CONFIG.toggle.button.minWidth,
                    }}
                  >
                    {lang === 'zh' ? '正常' : 'Normal'}
                  </button>
                  <button
                    onClick={() => handleWideAngleToggle(true)}
                    className={`relative z-10 rounded-full text-xs font-semibold transition-all duration-300 ${
                      isWideAngle
                        ? 'text-white drop-shadow-lg'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    style={{
                      paddingLeft: SETTINGS_CONFIG.toggle.button.paddingX,
                      paddingRight: SETTINGS_CONFIG.toggle.button.paddingX,
                      paddingTop: SETTINGS_CONFIG.toggle.button.paddingY,
                      paddingBottom: SETTINGS_CONFIG.toggle.button.paddingY,
                      minWidth: SETTINGS_CONFIG.toggle.button.minWidth,
                    }}
                  >
                    {lang === 'zh' ? '超广角' : 'Wide'}
                  </button>
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-white/10"></div>

            {/* 关于信息 */}
            <div className="flex flex-col gap-1 text-xs text-white/60">
              <div className="flex items-center justify-between">
                <span>{lang === 'zh' ? '版本' : 'Version'}</span>
                <span className="font-mono">v4.6.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{lang === 'zh' ? '作者' : 'Author'}</span>
                <span>CXIN</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
