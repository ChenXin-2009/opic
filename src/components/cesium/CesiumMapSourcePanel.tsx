'use client';

import { useState, useCallback } from 'react';
import { IMAGERY_SOURCES, ImagerySourceDef } from '@/lib/cesium/imageryProviders';

interface CesiumMapSourcePanelProps {
  earthPlanet?: any; // EarthPlanet 实例
  visible?: boolean;
}

export default function CesiumMapSourcePanel({ earthPlanet, visible = true }: CesiumMapSourcePanelProps) {
  const [activeId, setActiveId] = useState<string>('esri-world-imagery');
  const [loading, setLoading] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSelect = useCallback(async (source: ImagerySourceDef) => {
    if (!earthPlanet || loading) return;

    const ext = earthPlanet.getCesiumExtension?.();
    if (!ext) return;

    setLoading(source.id);
    try {
      const provider = await source.create();
      ext.setImageryProvider(provider);
      setActiveId(source.id);
    } catch (e) {
      console.error('[CesiumMapSourcePanel] Failed to set imagery provider:', e);
    } finally {
      setLoading(null);
    }
  }, [earthPlanet, loading]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      right: '10px',
      bottom: '80px',
      width: isCollapsed ? '140px' : '220px',
      backgroundColor: 'rgba(0,0,0,0.85)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '4px',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '11px',
      zIndex: 1000,
      transition: 'width 0.2s ease',
    }}>
      {/* 标题栏 */}
      <div
        onClick={() => setIsCollapsed(v => !v)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 10px',
          borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{ color: '#4a9eff', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}>
          🗺️ 地图源
        </span>
        <span style={{ color: '#999', fontSize: '12px' }}>{isCollapsed ? '▲' : '▼'}</span>
      </div>

      {!isCollapsed && (
        <div style={{ padding: '6px 0', maxHeight: '320px', overflowY: 'auto' }}>
          {IMAGERY_SOURCES.map(source => {
            const isActive = activeId === source.id;
            const isLoading = loading === source.id;
            return (
              <div
                key={source.id}
                onClick={() => handleSelect(source)}
                style={{
                  padding: '7px 10px',
                  cursor: loading ? 'wait' : 'pointer',
                  backgroundColor: isActive ? 'rgba(74,158,255,0.15)' : 'transparent',
                  borderLeft: isActive ? '2px solid #4a9eff' : '2px solid transparent',
                  transition: 'background 0.15s',
                  opacity: loading && !isLoading ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: isActive ? '#4a9eff' : '#fff', fontWeight: isActive ? 'bold' : 'normal' }}>
                    {source.name}
                  </span>
                  {isLoading && (
                    <span style={{ color: '#fbbf24', fontSize: '10px' }}>加载中…</span>
                  )}
                  {isActive && !isLoading && (
                    <span style={{ color: '#4ade80', fontSize: '10px' }}>✓</span>
                  )}
                </div>
                <div style={{ color: '#666', fontSize: '10px', marginTop: '2px' }}>
                  {source.description}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
