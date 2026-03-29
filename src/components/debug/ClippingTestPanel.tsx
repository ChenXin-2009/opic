'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { SceneManager } from '@/lib/3d/SceneManager';
import type { Planet } from '@/lib/3d/Planet';

interface ClippingTestPanelProps {
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  planetsRef: React.RefObject<Map<string, Planet>>;
  sceneManagerRef: React.RefObject<SceneManager | null>;
}

const EARTH_RADIUS_AU = 0.0000426;

const STRATEGIES = [
  {
    id: 'reset',
    label: '⟳ 重置（原始默认值）',
    color: '#94a3b8',
    desc: 'near=0.01 AU，far=1e12 AU（原始值，靠近时裁切）',
    dynamic: false,
    apply: (cam: THREE.PerspectiveCamera) => {
      cam.near = 0.01;
      cam.far = 1e12;
      cam.updateProjectionMatrix();
    },
  },
  {
    id: 'A1',
    label: 'A1. near = 距地表 × 0.1',
    color: '#60a5fa',
    desc: '每帧动态：near = distToSurface × 0.1',
    dynamic: true,
    apply: (cam: THREE.PerspectiveCamera, earthPos: THREE.Vector3) => {
      const d = Math.max(cam.position.distanceTo(earthPos) - EARTH_RADIUS_AU, 1e-12);
      cam.near = d * 0.1;
      cam.far = 1e12;
      cam.updateProjectionMatrix();
    },
  },
  {
    id: 'A2',
    label: 'A2. near = 距地表 × 0.01',
    color: '#38bdf8',
    desc: '每帧动态：near = distToSurface × 0.01',
    dynamic: true,
    apply: (cam: THREE.PerspectiveCamera, earthPos: THREE.Vector3) => {
      const d = Math.max(cam.position.distanceTo(earthPos) - EARTH_RADIUS_AU, 1e-12);
      cam.near = d * 0.01;
      cam.far = 1e12;
      cam.updateProjectionMatrix();
    },
  },
  {
    id: 'A3',
    label: 'A3. near = 距地表 × 0.001',
    color: '#22d3ee',
    desc: '每帧动态：near = distToSurface × 0.001，贴近地表也不裁切',
    dynamic: true,
    apply: (cam: THREE.PerspectiveCamera, earthPos: THREE.Vector3) => {
      const d = Math.max(cam.position.distanceTo(earthPos) - EARTH_RADIUS_AU, 1e-12);
      cam.near = d * 0.001;
      cam.far = 1e12;
      cam.updateProjectionMatrix();
    },
  },
  {
    id: 'B1',
    label: 'B1. near = 1e-8 AU（固定）',
    color: '#a78bfa',
    desc: '固定 near = 1e-8 AU（≈1500m），依赖对数深度缓冲',
    dynamic: false,
    apply: (cam: THREE.PerspectiveCamera) => {
      cam.near = 1e-8;
      cam.far = 1e12;
      cam.updateProjectionMatrix();
    },
  },
  {
    id: 'B2',
    label: 'B2. near = 1e-9 AU（更小）',
    color: '#c084fc',
    desc: '固定 near = 1e-9 AU（≈150m）',
    dynamic: false,
    apply: (cam: THREE.PerspectiveCamera) => {
      cam.near = 1e-9;
      cam.far = 1e12;
      cam.updateProjectionMatrix();
    },
  },
  {
    id: 'B3',
    label: 'B3. near = 1e-10 AU（极限）',
    color: '#e879f9',
    desc: '固定 near = 1e-10 AU（≈15m），对数深度缓冲极限测试',
    dynamic: false,
    apply: (cam: THREE.PerspectiveCamera) => {
      cam.near = 1e-10;
      cam.far = 1e12;
      cam.updateProjectionMatrix();
    },
  },
  {
    id: 'C1',
    label: 'C1. far 缩小到 1e6 AU',
    color: '#fb923c',
    desc: 'near=0.01 不变，far=1e6，far/near=1e8，减少精度压力',
    dynamic: false,
    apply: (cam: THREE.PerspectiveCamera) => {
      cam.near = 0.01;
      cam.far = 1e6;
      cam.updateProjectionMatrix();
    },
  },
  {
    id: 'D1',
    label: 'D1. 动态 near+far 双向收紧',
    color: '#4ade80',
    desc: '每帧动态：near=distToSurface×0.01，far=max(1e6, distToSun×10)',
    dynamic: true,
    apply: (cam: THREE.PerspectiveCamera, earthPos: THREE.Vector3) => {
      const d = Math.max(cam.position.distanceTo(earthPos) - EARTH_RADIUS_AU, 1e-12);
      cam.near = d * 0.01;
      cam.far = Math.max(1e6, cam.position.length() * 10);
      cam.updateProjectionMatrix();
    },
  },
  {
    id: 'D2',
    label: 'D2. 保持 far/near ≤ 1e8',
    color: '#86efac',
    desc: '每帧动态：near=distToSurface×0.01，far=near×1e8',
    dynamic: true,
    apply: (cam: THREE.PerspectiveCamera, earthPos: THREE.Vector3) => {
      const d = Math.max(cam.position.distanceTo(earthPos) - EARTH_RADIUS_AU, 1e-12);
      const near = d * 0.01;
      cam.near = near;
      cam.far = near * 1e8;
      cam.updateProjectionMatrix();
    },
  },
];

export default function ClippingTestPanel({ cameraRef, planetsRef, sceneManagerRef }: ClippingTestPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeId, setActiveId] = useState('reset');
  const [liveInfo, setLiveInfo] = useState({ distKm: 0, near: 0, far: 0, ratio: 0 });
  const rafRef = useRef<number | null>(null);

  // 获取地球位置的辅助函数
  const getEarthPos = useCallback((): THREE.Vector3 => {
    const earth = planetsRef.current?.get('earth');
    return (earth as any)?.getMesh?.()?.position ?? new THREE.Vector3();
  }, [planetsRef]);

  // 执行方案
  const applyStrategy = useCallback((id: string) => {
    const cam = cameraRef.current;
    if (!cam) {
      console.warn('[ClippingTestPanel] camera not ready yet');
      return;
    }
    const s = STRATEGIES.find(s => s.id === id);
    if (!s) return;

    // 锁定/解锁 SceneManager 的 clipping 覆盖
    const sm = sceneManagerRef.current as any;
    if (sm) sm.clippingLocked = id !== 'reset';

    s.apply(cam, getEarthPos());
    setActiveId(id);
  }, [cameraRef, sceneManagerRef, getEarthPos]);

  // 动态方案：每帧持续应用
  useEffect(() => {
    const active = STRATEGIES.find(s => s.id === activeId);
    if (!active?.dynamic) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const loop = () => {
      const cam = cameraRef.current;
      if (cam) active.apply(cam, getEarthPos());
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [activeId, cameraRef, getEarthPos]);

  // 实时状态读取
  useEffect(() => {
    const interval = setInterval(() => {
      const cam = cameraRef.current;
      if (!cam) return;
      const earthPos = getEarthPos();
      const distToCenter = cam.position.distanceTo(earthPos);
      const distToSurface = Math.max(distToCenter - EARTH_RADIUS_AU, 0);
      setLiveInfo({
        distKm: distToSurface * 149597870.7,
        near: cam.near,
        far: cam.far,
        ratio: cam.near > 0 ? cam.far / cam.near : 0,
      });
    }, 150);
    return () => clearInterval(interval);
  }, [cameraRef, getEarthPos]);

  const nearWarn = liveInfo.near > 0 && liveInfo.distKm > 0 && liveInfo.near * 149597870700 > liveInfo.distKm * 1000;
  const ratioWarn = liveInfo.ratio > 1e7;

  if (collapsed) {
    return (
      <div style={{ position: 'fixed', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 9999 }}>
        <button onClick={() => setCollapsed(false)} style={{ background: 'rgba(8,12,24,0.92)', border: '1px solid rgba(100,160,255,0.4)', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer', padding: '6px 10px', fontSize: '11px', fontFamily: 'monospace' }}>
          ✂️
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', left: '10px', top: '50%', transform: 'translateY(-50%)',
      width: '268px', maxHeight: '88vh', overflowY: 'auto',
      background: 'rgba(8,12,24,0.95)', border: '1px solid rgba(100,160,255,0.3)',
      borderRadius: '8px', padding: '10px', fontFamily: 'monospace', fontSize: '11px',
      color: '#ccc', zIndex: 9999, backdropFilter: 'blur(8px)', boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
        <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>✂️ 裁切方案测试</span>
        <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '13px' }}>◀</button>
      </div>

      {/* 实时状态 */}
      <div style={{ marginBottom: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', padding: '6px', fontSize: '10px' }}>
        <Row label="到地表" value={`${liveInfo.distKm.toFixed(0)} km`} warn={liveInfo.distKm < 50000} />
        <Row label="camera.near" value={liveInfo.near.toExponential(2)} warn={nearWarn} />
        <Row label="camera.far" value={liveInfo.far.toExponential(2)} />
        <Row label="far/near" value={liveInfo.ratio.toExponential(2)} warn={ratioWarn} />
        {nearWarn && <div style={{ color: '#f87171', marginTop: '3px', fontSize: '10px' }}>⚠ near &gt; 到地表距离 → 裁切！</div>}
        {ratioWarn && <div style={{ color: '#fbbf24', marginTop: '3px', fontSize: '10px' }}>⚠ far/near &gt; 1e7 → 深度精度不足</div>}
      </div>

      <div style={{ color: '#475569', fontSize: '10px', marginBottom: '5px' }}>点击立即应用 · 标 ⟳ 的每帧持续更新</div>

      {STRATEGIES.map(s => {
        const isActive = activeId === s.id;
        return (
          <div key={s.id} style={{ marginBottom: '3px' }}>
            <button
              onClick={() => applyStrategy(s.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '5px 8px',
                background: isActive ? `${s.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? s.color + '88' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '4px', cursor: 'pointer',
                color: isActive ? s.color : '#aaa',
                fontSize: '11px', fontFamily: 'monospace',
              }}
            >
              {s.dynamic ? '⟳ ' : '  '}{s.label.replace(/^[⟳] /, '')}
            </button>
            {isActive && (
              <div style={{ padding: '3px 8px 4px', fontSize: '10px', color: '#64748b', lineHeight: '1.5' }}>
                {s.desc}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
      <span style={{ color: '#475569' }}>{label}:</span>
      <span style={{ color: warn ? '#f87171' : '#e2e8f0' }}>{value}</span>
    </div>
  );
}
