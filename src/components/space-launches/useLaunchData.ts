/**
 * 商业航天发射追踪 - 数据获取 Hook
 * 通过 /api/launches 服务端代理获取数据，避免 CORS 问题
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DataSourceId, DataSourceState, LaunchEvent } from './types';
import { DATA_SOURCE_MAP } from './dataSources';

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLaunchData(enabledSources: DataSourceId[]) {
  const [states, setStates] = useState<Record<string, DataSourceState>>({});
  const timersRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const fetchSource = useCallback(async (id: DataSourceId) => {
    setStates(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { id, enabled: true, launches: [] }), loading: true, error: null },
    }));

    try {
      const res = await fetch(`/api/launches?source=${id}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      const launches: LaunchEvent[] = json.launches || [];
      setStates(prev => ({
        ...prev,
        [id]: { id, enabled: true, loading: false, error: null, lastUpdated: Date.now(), launches },
      }));
    } catch (err: any) {
      setStates(prev => ({
        ...prev,
        [id]: { ...(prev[id] || { id, enabled: true, launches: [] }), loading: false, error: err.message || 'Fetch failed' },
      }));
    }
  }, []);

  useEffect(() => {
    const currentIds = new Set(enabledSources);

    // Remove disabled sources
    Object.keys(timersRef.current).forEach(id => {
      if (!currentIds.has(id as DataSourceId)) {
        clearInterval(timersRef.current[id]);
        delete timersRef.current[id];
        setStates(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    });

    // Add new sources
    enabledSources.forEach(id => {
      if (!timersRef.current[id]) {
        fetchSource(id);
        const source = DATA_SOURCE_MAP.get(id);
        const interval = (source?.updateInterval ?? 300) * 1000;
        timersRef.current[id] = setInterval(() => fetchSource(id), interval);
      }
    });

    return () => {
      Object.values(timersRef.current).forEach(clearInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledSources.join(',')]);

  useEffect(() => {
    return () => { Object.values(timersRef.current).forEach(clearInterval); };
  }, []);

  // Deduplicate by name+net across sources
  const allLaunches = Object.values(states).flatMap(s => s.launches);
  const seen = new Set<string>();
  const dedupedLaunches = allLaunches.filter(l => {
    const key = `${l.name}|${l.net}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const totalLoading = Object.values(states).some(s => s.loading);

  return { states, allLaunches: dedupedLaunches, totalLoading, refetch: fetchSource };
}
