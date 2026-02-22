/**
 * SmartBufferManager.ts - 智能缓冲区管理器
 * 
 * 功能：
 * - 智能管理 GPU 缓冲区更新，避免不必要的上传
 * - 实现差异检测，只更新变化的缓冲区区域
 * - 跟踪脏区域（dirty ranges）
 * - 提供更新统计信息
 * 
 * 使用：
 * - 初始化时预分配固定大小的缓冲区
 * - 每帧调用 updateBuffers() 更新位置和颜色
 * - 通过 getStats() 获取更新统计信息
 */

import { Vector3, Color, BufferAttribute, BufferGeometry } from 'three';
import { satelliteConfig } from '../config/satelliteConfig';

/**
 * 缓冲区更新统计信息
 */
export interface BufferUpdateStats {
  /** 总更新次数 */
  totalUpdates: number;
  /** 跳过的更新次数 */
  skippedUpdates: number;
  /** 部分更新次数 */
  partialUpdates: number;
  /** 完整更新次数 */
  fullUpdates: number;
  /** 最后更新时间 */
  lastUpdateTime: number;
  /** 平均更新耗时（毫秒） */
  averageUpdateDuration: number;
}

/**
 * 脏区域范围
 */
export interface BufferDirtyRange {
  /** 起始索引 */
  start: number;
  /** 结束索引 */
  end: number;
}

/**
 * SmartBufferManager - 智能缓冲区管理器
 * 
 * 负责智能管理 Three.js BufferGeometry 的位置和颜色缓冲区。
 * 通过差异检测避免不必要的 GPU 上传，提升渲染性能。
 * 
 * 核心功能：
 * - 预分配固定大小的缓冲区（避免动态扩容）
 * - 差异检测（只更新变化超过阈值的位置）
 * - 部分缓冲区更新（使用 updateRange）
 * - 更新统计（跟踪性能指标）
 * 
 * @example
 * ```typescript
 * const bufferManager = new SmartBufferManager(geometry);
 * 
 * // 更新缓冲区
 * const didUpdate = bufferManager.updateBuffers(positions, colors);
 * 
 * // 获取统计信息
 * const stats = bufferManager.getStats();
 * ```
 */
export class SmartBufferManager {
  /** Three.js BufferGeometry 引用 */
  private geometry: BufferGeometry;
  
  /** 位置缓冲区 */
  private positionBuffer: Float32Array;
  
  /** 颜色缓冲区 */
  private colorBuffer: Float32Array;
  
  /** 上一帧的位置缓冲区（用于差异检测） */
  private previousPositions: Float32Array;
  
  /** 脏区域列表 */
  private dirtyRanges: BufferDirtyRange[];
  
  /** 位置变化阈值（AU） */
  private updateThreshold: number;
  
  /** 更新统计信息 */
  private stats: BufferUpdateStats;
  
  /** 更新耗时样本（用于计算平均值） */
  private updateDurationSamples: number[];
  
  /** 最大样本数量 */
  private readonly MAX_SAMPLES = 60;
  
  /** 最大卫星数量 */
  private readonly MAX_SATELLITES: number;
  
  /**
   * 创建智能缓冲区管理器实例
   * 
   * @param geometry - Three.js BufferGeometry 实例
   * @param updateThreshold - 位置变化阈值（AU），默认 0.0001
   */
  constructor(geometry: BufferGeometry, updateThreshold: number = 0.0001) {
    this.geometry = geometry;
    this.updateThreshold = updateThreshold;
    this.MAX_SATELLITES = satelliteConfig.rendering.maxSatellites;
    
    // 预分配固定大小的缓冲区
    this.positionBuffer = new Float32Array(this.MAX_SATELLITES * 3);
    this.colorBuffer = new Float32Array(this.MAX_SATELLITES * 3);
    this.previousPositions = new Float32Array(this.MAX_SATELLITES * 3);
    
    // 初始化脏区域列表
    this.dirtyRanges = [];
    
    // 初始化统计信息
    this.stats = {
      totalUpdates: 0,
      skippedUpdates: 0,
      partialUpdates: 0,
      fullUpdates: 0,
      lastUpdateTime: 0,
      averageUpdateDuration: 0
    };
    
    // 初始化耗时样本
    this.updateDurationSamples = [];
    
    // 设置 BufferGeometry 的缓冲区属性
    this.geometry.setAttribute(
      'position',
      new BufferAttribute(this.positionBuffer, 3)
    );
    this.geometry.setAttribute(
      'color',
      new BufferAttribute(this.colorBuffer, 3)
    );
  }
  
  /**
   * 更新缓冲区（智能差异检测）
   * 
   * 比较新旧位置，只更新变化超过阈值的部分。
   * 使用 BufferAttribute.updateRange 优化 GPU 上传。
   * 
   * @param positions - 新的位置映射表
   * @param colors - 新的颜色映射表（可选）
   * @returns 是否发生了更新
   * 
   * @example
   * ```typescript
   * const positions = new Map<number, Vector3>();
   * const colors = new Map<number, Color>();
   * const didUpdate = bufferManager.updateBuffers(positions, colors);
   * ```
   */
  updateBuffers(
    positions: Map<number, Vector3>,
    colors?: Map<number, Color>
  ): boolean {
    const startTime = performance.now();
    
    // 如果没有位置数据，跳过更新
    if (positions.size === 0) {
      this.stats.skippedUpdates++;
      return false;
    }
    
    // 清空脏区域列表
    this.dirtyRanges = [];
    
    let hasChanges = false;
    let index = 0;
    let minDirtyIndex = this.MAX_SATELLITES;
    let maxDirtyIndex = 0;
    
    // 遍历所有位置
    positions.forEach((position, noradId) => {
      if (index >= this.MAX_SATELLITES) {
        return;
      }
      
      // 检查位置是否发生显著变化
      const hasSignificantChange = this.hasSignificantChange(index, position);
      
      if (hasSignificantChange) {
        // 更新位置缓冲区
        this.positionBuffer[index * 3] = position.x;
        this.positionBuffer[index * 3 + 1] = position.y;
        this.positionBuffer[index * 3 + 2] = position.z;
        
        // 更新上一帧位置
        this.previousPositions[index * 3] = position.x;
        this.previousPositions[index * 3 + 1] = position.y;
        this.previousPositions[index * 3 + 2] = position.z;
        
        // 更新颜色缓冲区（如果提供）
        if (colors) {
          const color = colors.get(noradId);
          if (color) {
            this.colorBuffer[index * 3] = color.r;
            this.colorBuffer[index * 3 + 1] = color.g;
            this.colorBuffer[index * 3 + 2] = color.b;
          }
        }
        
        // 跟踪脏区域
        minDirtyIndex = Math.min(minDirtyIndex, index);
        maxDirtyIndex = Math.max(maxDirtyIndex, index);
        
        hasChanges = true;
      }
      
      index++;
    });
    
    // 如果没有变化，跳过 GPU 上传
    if (!hasChanges) {
      this.stats.skippedUpdates++;
      return false;
    }
    
    // 标记需要更新
    this.markNeedsUpdate(minDirtyIndex, maxDirtyIndex);
    
    // 更新统计信息
    const duration = performance.now() - startTime;
    this.updateStats(duration, minDirtyIndex, maxDirtyIndex, index);
    
    return true;
  }
  
  /**
   * 检测位置变化是否超过阈值
   * 
   * 比较新旧位置的欧几里得距离，判断是否需要更新。
   * 
   * @param index - 缓冲区索引
   * @param newPosition - 新位置
   * @returns 是否超过阈值
   */
  private hasSignificantChange(index: number, newPosition: Vector3): boolean {
    const oldX = this.previousPositions[index * 3];
    const oldY = this.previousPositions[index * 3 + 1];
    const oldZ = this.previousPositions[index * 3 + 2];
    
    // 如果是首次更新（旧位置为 0），直接返回 true
    if (oldX === 0 && oldY === 0 && oldZ === 0) {
      return true;
    }
    
    // 计算欧几里得距离
    const dx = newPosition.x - oldX;
    const dy = newPosition.y - oldY;
    const dz = newPosition.z - oldZ;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // 判断是否超过阈值
    return distance > this.updateThreshold;
  }
  
  /**
   * 标记 GPU 缓冲区需要更新
   * 
   * 使用 BufferAttribute.updateRange 优化部分更新。
   * 
   * @param minIndex - 最小脏索引
   * @param maxIndex - 最大脏索引
   */
  private markNeedsUpdate(minIndex: number, maxIndex: number): void {
    const positionAttribute = this.geometry.getAttribute('position') as BufferAttribute;
    const colorAttribute = this.geometry.getAttribute('color') as BufferAttribute;
    
    // 设置更新范围（使用 addUpdateRange 方法）
    positionAttribute.addUpdateRange(minIndex * 3, (maxIndex - minIndex + 1) * 3);
    colorAttribute.addUpdateRange(minIndex * 3, (maxIndex - minIndex + 1) * 3);
    
    // 标记需要更新
    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
  }
  
  /**
   * 更新统计信息
   * 
   * @param duration - 更新耗时（毫秒）
   * @param minIndex - 最小脏索引
   * @param maxIndex - 最大脏索引
   * @param totalCount - 总卫星数量
   */
  private updateStats(
    duration: number,
    minIndex: number,
    maxIndex: number,
    totalCount: number
  ): void {
    this.stats.totalUpdates++;
    this.stats.lastUpdateTime = Date.now();
    
    // 判断是部分更新还是完整更新
    const dirtyCount = maxIndex - minIndex + 1;
    if (dirtyCount < totalCount) {
      this.stats.partialUpdates++;
    } else {
      this.stats.fullUpdates++;
    }
    
    // 更新平均耗时
    this.updateDurationSamples.push(duration);
    if (this.updateDurationSamples.length > this.MAX_SAMPLES) {
      this.updateDurationSamples.shift();
    }
    
    const sum = this.updateDurationSamples.reduce((a, b) => a + b, 0);
    this.stats.averageUpdateDuration = sum / this.updateDurationSamples.length;
  }
  
  /**
   * 获取更新统计信息
   * 
   * @returns 统计信息
   */
  getStats(): BufferUpdateStats {
    return { ...this.stats };
  }
  
  /**
   * 获取位置缓冲区
   * 
   * 用于验证缓冲区是否被重新分配。
   * 
   * @returns 位置缓冲区
   */
  getPositionBuffer(): Float32Array {
    return this.positionBuffer;
  }
  
  /**
   * 获取颜色缓冲区
   * 
   * @returns 颜色缓冲区
   */
  getColorBuffer(): Float32Array {
    return this.colorBuffer;
  }
  
  /**
   * 设置位置变化阈值
   * 
   * @param threshold - 新的阈值（AU）
   */
  setUpdateThreshold(threshold: number): void {
    this.updateThreshold = threshold;
  }
  
  /**
   * 获取位置变化阈值
   * 
   * @returns 阈值（AU）
   */
  getUpdateThreshold(): number {
    return this.updateThreshold;
  }
  
  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalUpdates: 0,
      skippedUpdates: 0,
      partialUpdates: 0,
      fullUpdates: 0,
      lastUpdateTime: 0,
      averageUpdateDuration: 0
    };
    this.updateDurationSamples = [];
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    // 清空缓冲区
    this.positionBuffer.fill(0);
    this.colorBuffer.fill(0);
    this.previousPositions.fill(0);
    this.dirtyRanges = [];
    this.updateDurationSamples = [];
  }
}
