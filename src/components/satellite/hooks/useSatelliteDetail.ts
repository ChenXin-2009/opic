import { useState, useEffect, useCallback, useRef } from 'react';
import { useSatelliteStore } from '@/lib/store/useSatelliteStore';
import { TLEData, SatelliteDetailData } from '@/lib/types/satellite';

/**
 * useSatelliteDetail Hook返回值
 */
export interface UseSatelliteDetailReturn {
  /** 基本TLE数据 */
  tleData: TLEData | null;
  /** 扩展详情数据 */
  detailData: SatelliteDetailData | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 重试加载 */
  retry: () => void;
}

/**
 * 卫星详情数据Hook
 * 
 * 功能:
 * - 从Store获取TLE数据
 * - 异步加载扩展详情数据
 * - 处理加载错误和重试
 * - 管理AbortController取消请求
 * 
 * @param noradId 卫星NORAD ID
 * @returns 卫星详情数据和状态
 */
export function useSatelliteDetail(noradId: number | null): UseSatelliteDetailReturn {
  const [detailData, setDetailData] = useState<SatelliteDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 从Store获取TLE数据
  const tleData = useSatelliteStore((state) => 
    noradId ? state.tleData.get(noradId) || null : null
  );

  // 使用ref存储AbortController以便取消请求
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 加载详情数据
   */
  const loadDetailData = useCallback(async (id: number) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      console.log(`[useSatelliteDetail] 加载详情数据: NORAD ID=${id}`);

      const response = await fetch(`/api/satellites/${id}/details`, {
        signal: controller.signal,
      });

      // 检查请求是否被取消
      if (controller.signal.aborted) {
        console.log(`[useSatelliteDetail] 请求已取消: NORAD ID=${id}`);
        return;
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('卫星详情不存在');
        }
        throw new Error(`加载失败: ${response.status} ${response.statusText}`);
      }

      const data: SatelliteDetailData = await response.json();

      // 再次检查是否被取消
      if (controller.signal.aborted) {
        return;
      }

      console.log(`[useSatelliteDetail] 成功加载详情数据: ${data.basicInfo?.name}`);

      setDetailData(data);
      setLoading(false);
    } catch (err) {
      // 忽略取消错误
      if (err instanceof Error && err.name === 'AbortError') {
        console.log(`[useSatelliteDetail] 请求被取消`);
        return;
      }

      console.error('[useSatelliteDetail] 加载详情数据失败:', err);

      const errorObj = err instanceof Error ? err : new Error('未知错误');
      setError(errorObj);
      setLoading(false);
    }
  }, []);

  /**
   * 重试加载
   */
  const retry = useCallback(() => {
    if (noradId) {
      loadDetailData(noradId);
    }
  }, [noradId, loadDetailData]);

  /**
   * 当noradId变化时加载数据
   */
  useEffect(() => {
    if (noradId) {
      loadDetailData(noradId);
    } else {
      // 清空数据
      setDetailData(null);
      setError(null);
      setLoading(false);
    }

    // 清理函数：取消请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [noradId, loadDetailData]);

  return {
    tleData,
    detailData,
    loading,
    error,
    retry,
  };
}
