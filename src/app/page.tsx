// src/app/page.tsx 或 src/app/solar-system/page.tsx
'use client';

import { useState, useEffect, useRef } from "react";
import SolarSystemCanvas3D from "@/components/canvas/3d/SolarSystemCanvas3D";
import TimeControl from "@/components/TimeControl";
import InfoModal from "@/components/InfoModal";
import { SatelliteMenu } from "@/components/satellite";
import { HEADER_CONFIG } from "@/lib/config/visualConfig";
import EphemerisStatusPanel from "@/components/EphemerisStatusPanel";
import CesiumToggleButton from "@/components/CesiumToggleButton";
import CesiumMapSourcePanel from "@/components/cesium/CesiumMapSourcePanel";
import EarthLockButton from "@/components/EarthLockButton";
import EarthLightButton from "@/components/EarthLightButton";

/**
 * Info button component for top-right corner.
 * Arknights-style design matching the settings button.
 */
function InfoButton({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed"
      style={{
        top: '2rem',
        right: '2rem',
        zIndex: 1001,
        background: '#0a0a0a',
        border: `2px solid ${isHovered ? '#ffffff' : '#333333'}`,
        cursor: 'pointer',
        padding: '8px 16px',
        transition: 'all 0.3s ease',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
        boxShadow: isHovered ? '0 0 20px rgba(255, 255, 255, 0.5)' : 'none',
      }}
      aria-label="关于"
    >
      {/* 左上角菱形装饰 */}
      <div 
        style={{
          position: 'absolute',
          top: '-1px',
          left: '-1px',
          width: '12px',
          height: '12px',
          background: '#ffffff',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />
      
      {/* 右下角菱形装饰 */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-1px',
          right: '-1px',
          width: '12px',
          height: '12px',
          background: '#ffffff',
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        }}
      />
      
      关于
    </button>
  );
}

/**
 * Ephemeris Status button component for top-right corner.
 * Arknights-style design matching other buttons.
 */
function EphemerisButton({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed"
      style={{
        top: '5.5rem',
        right: '2rem',
        zIndex: 1001,
        background: '#0a0a0a',
        border: `2px solid ${isHovered ? '#ffffff' : '#333333'}`,
        cursor: 'pointer',
        padding: '8px 16px',
        transition: 'all 0.3s ease',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
        boxShadow: isHovered ? '0 0 20px rgba(255, 255, 255, 0.5)' : 'none',
      }}
      aria-label="星历状态"
    >
      {/* 左上角菱形装饰 */}
      <div 
        style={{
          position: 'absolute',
          top: '-1px',
          left: '-1px',
          width: '12px',
          height: '12px',
          background: '#ffffff',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />
      
      {/* 右下角菱形装饰 */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-1px',
          right: '-1px',
          width: '12px',
          height: '12px',
          background: '#ffffff',
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        }}
      />
      
      星历状态
    </button>
  );
}

export default function SolarSystemPage() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isEphemerisStatusOpen, setIsEphemerisStatusOpen] = useState(false);
  const [cesiumEnabled, setCesiumEnabled] = useState(true); // 默认启用 Cesium
  const [earthLockEnabled, setEarthLockEnabled] = useState(true);
  const [earthLightEnabled, setEarthLightEnabled] = useState(true);
  const [earthPlanet, setEarthPlanet] = useState<any>(null);
  const [camera, setCamera] = useState<any>(null);
  // 地球是否可见（相机足够近时显示按钮）
  const [earthVisible, setEarthVisible] = useState(false);

  // 每帧检测相机到地球的距离，控制按钮显隐
  // 距离阈值：10 AU 以内认为"可以看见地球"
  const EARTH_VISIBLE_THRESHOLD = 10;
  const cameraRef = useRef(camera);
  const earthPlanetRef = useRef(earthPlanet);
  useEffect(() => { cameraRef.current = camera; }, [camera]);
  useEffect(() => { earthPlanetRef.current = earthPlanet; }, [earthPlanet]);

  useEffect(() => {
    let rafId: number;
    const check = () => {
      const cam = cameraRef.current;
      const ep = earthPlanetRef.current;
      if (cam && ep) {
        const earthPos = ep.getMesh?.()?.position;
        if (earthPos) {
          const dist = cam.position.distanceTo(earthPos);
          setEarthVisible(dist < EARTH_VISIBLE_THRESHOLD);
        }
      }
      rafId = requestAnimationFrame(check);
    };
    rafId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // 计算顶部偏移（Header高度）- 漂浮模式下不需要预留空间
  const headerHeight = (HEADER_CONFIG.enabled && !HEADER_CONFIG.floatingMode) ? HEADER_CONFIG.height : 0;

  return (
    <div 
      className="w-screen flex flex-col overflow-hidden relative"
      style={{ 
        height: '100vh',
        // 使用 dvh 适配移动端动态视口
        // @ts-ignore - dvh 是较新的 CSS 单位
        height: '100dvh',
      }}
    >
      <InfoButton onClick={() => setIsInfoModalOpen(true)} />
      <EphemerisButton onClick={() => setIsEphemerisStatusOpen(true)} />
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
      <EphemerisStatusPanel isOpen={isEphemerisStatusOpen} onClose={() => setIsEphemerisStatusOpen(false)} />
      
      {/* Cesium 切换按钮 + 地球锁定按钮 — 右侧中间，仅地球可见时显示 */}
      <div
        style={{
          position: 'fixed',
          right: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          opacity: earthVisible ? 1 : 0,
          pointerEvents: earthVisible ? 'auto' : 'none',
          transition: 'opacity 0.6s ease',
        }}
      >
        <CesiumToggleButton onToggle={setCesiumEnabled} initialEnabled={cesiumEnabled} />
        <EarthLockButton onToggle={setEarthLockEnabled} initialEnabled={earthLockEnabled} />
        <EarthLightButton
          initialEnabled={earthLightEnabled}
          onToggle={(enabled) => {
            setEarthLightEnabled(enabled);
            const ext = earthPlanet?.getCesiumExtension?.();
            ext?.setEnableLighting?.(enabled);
          }}
        />
        <SatelliteMenu lang="zh" />
      </div>
      
      {/* Cesium 地图源切换面板（仅 Cesium 模式下显示） */}
      <CesiumMapSourcePanel earthPlanet={earthPlanet} visible={cesiumEnabled} />
      
      {/* 主容器，漂浮模式下不需要留出Header高度空间 */}
      <div 
        className="flex-1 relative min-h-0 flex flex-col"
        style={{ 
          marginTop: `${headerHeight}px`,
          isolation: 'isolate',
          // 确保不超出父容器
          maxHeight: '100%',
        }}
      >
        <div className="flex-1 relative min-h-0" style={{ isolation: 'isolate', maxHeight: '100%' }}>
          <SolarSystemCanvas3D 
            cesiumEnabled={cesiumEnabled}
            earthLockEnabled={earthLockEnabled}
            onEarthPlanetReady={setEarthPlanet}
            onCameraReady={setCamera}
          />
        </div>
        <TimeControl />
      </div>
    </div>
  );
}
