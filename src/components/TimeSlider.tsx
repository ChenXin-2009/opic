/**
 * TimeSlider.tsx - 坐标轴式时间滑块组件
 */

'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useSolarSystemStore } from '@/lib/state';
import { TIME_SLIDER_CONFIG } from '@/lib/config/visualConfig';
import { usePlaybackControl, useDragListeners } from './TimeSlider.hooks';
import {
  calculateSpeed,
  formatSpeedLabel,
  normalizePosition,
} from './TimeSlider.helpers';

interface TimeSliderProps {
  width?: number;
  height?: number;
}

export default function TimeSlider({ 
  width = TIME_SLIDER_CONFIG.width, 
  height = TIME_SLIDER_CONFIG.height 
}: TimeSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0.5);
  
  const lang = useSolarSystemStore((state) => state.lang);

  const cfg = TIME_SLIDER_CONFIG;
  const sliderRadius = cfg.sliderRadius;
  const trackPadding = cfg.trackPadding;
  const trackWidth = width - trackPadding * 2;
  
  const sliderX = trackPadding + sliderPosition * trackWidth;

  const { speed, direction } = calculateSpeed(sliderPosition);
  const speedLabel = formatSpeedLabel(speed, lang);

  const centerY = height / 2;
  const arrowSize = 8;
  const arrowWidth = 1.5;
  const lineStartX = trackPadding;
  const lineEndX = width - trackPadding - arrowSize - 5;

  const handleDragStart = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const normalizedX = normalizePosition(clientX, rect, trackPadding, trackWidth);
    
    setSliderPosition(normalizedX);
    setIsDragging(true);
  }, [trackPadding, trackWidth]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const normalizedX = normalizePosition(clientX, rect, trackPadding, trackWidth);
    
    setSliderPosition(normalizedX);
  }, [isDragging, trackPadding, trackWidth]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0 && e.touches[0]) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  usePlaybackControl(isDragging, sliderPosition);
  useDragListeners(isDragging, handleDragMove, handleDragEnd);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id="axisGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={cfg.trackColorCenter} stopOpacity="1" />
            <stop offset="50%" stopColor={cfg.trackColorCenter} stopOpacity="1" />
            <stop offset="100%" stopColor={cfg.trackColorCenter} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="axisGradientActive" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={direction === 'forward' ? cfg.forwardColorCenter : cfg.backwardColorCenter} stopOpacity="1" />
            <stop offset="50%" stopColor={direction === 'forward' ? cfg.forwardColorCenter : cfg.backwardColorCenter} stopOpacity="1" />
            <stop offset="100%" stopColor={direction === 'forward' ? cfg.forwardColorCenter : cfg.backwardColorCenter} stopOpacity="1" />
          </linearGradient>
        </defs>
        
        {/* 坐标轴线 */}
        <line
          x1={lineStartX}
          y1={centerY}
          x2={lineEndX}
          y2={centerY}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={cfg.trackMaxWidth}
          strokeLinecap="butt"
        />
        
        {/* 坐标轴箭头 - 向右 */}
        <g>
          {/* 箭头主线（延伸到最右边） */}
          <line
            x1={lineEndX}
            y1={centerY}
            x2={width - trackPadding}
            y2={centerY}
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth={cfg.trackMaxWidth}
            strokeLinecap="butt"
          />
          {/* 箭头上半部分 - 90度夹角 */}
          <line
            x1={width - trackPadding}
            y1={centerY}
            x2={width - trackPadding - arrowSize}
            y2={centerY - arrowSize}
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth={arrowWidth}
            strokeLinecap="butt"
          />
          {/* 箭头下半部分 - 90度夹角 */}
          <line
            x1={width - trackPadding}
            y1={centerY}
            x2={width - trackPadding - arrowSize}
            y2={centerY + arrowSize}
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth={arrowWidth}
            strokeLinecap="butt"
          />
        </g>
      </svg>

      {/* 滑块 */}
      <div
        style={{
          position: 'absolute',
          left: `${sliderX - sliderRadius}px`,
          top: `${centerY - sliderRadius}px`,
          width: `${sliderRadius * 2}px`,
          height: `${sliderRadius * 2}px`,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          border: `${cfg.sliderBorderWidth}px solid ${isDragging 
            ? (direction === 'forward' ? cfg.sliderForwardColor : cfg.sliderBackwardColor)
            : cfg.sliderBorderColor}`,
          boxShadow: isDragging 
            ? `0 0 ${cfg.sliderGlowRadius}px ${direction === 'forward' ? cfg.sliderForwardColor : cfg.sliderBackwardColor}`
            : 'none',
          transition: isDragging ? 'none' : 'left 0.2s ease-out, border-color 0.2s',
          pointerEvents: 'none',
        }}
      />

      {/* 速度标签（像单位一样显示在右侧） */}
      <div
        style={{
          position: 'absolute',
          right: `${trackPadding - 10}px`,
          top: `${centerY + 15}px`,
          color: speed > 0 
            ? (direction === 'forward' ? cfg.speedTextForwardColor : cfg.speedTextBackwardColor)
            : cfg.trackColorCenter,
          fontSize: `${cfg.speedTextSize}px`,
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: speed > 0 ? 1 : 0.5,
        }}
      >
        {speed > 0 ? speedLabel : (lang === 'zh' ? '暂停' : 'Paused')}
      </div>
    </div>
  );
}
