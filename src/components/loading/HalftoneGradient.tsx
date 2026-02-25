/**
 * HalftoneGradient Component - 半色调网点渐变效果
 * 
 * 使用Canvas动态绘制实现真正平滑的网点大小和颜色渐变
 * - 底部：大网点 + 浅蓝色
 * - 顶部：小网点 + 深蓝色 + 淡出
 */

'use client';

import { useEffect, useRef } from 'react';

interface HalftoneGradientProps {
  colors: {
    light: string;
    standard: string;
    dark: string;
    darker: string;
    darkest: string;
    deepest: string;
  };
}

export default function HalftoneGradient({ colors }: HalftoneGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸为窗口大小
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 600; // 渐变区域高度
      drawHalftone();
    };

    // 绘制半色调渐变
    const drawHalftone = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const spacing = 15; // 网点间距
      const rows = Math.ceil(canvas.height / spacing);
      const cols = Math.ceil(canvas.width / spacing);

      // 将hex颜色转换为RGB
      const hexToRgb = (hex: string): [number, number, number] => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
          : [0, 0, 0];
      };

      // RGB线性插值函数（带透明度渐变）
      const interpolateColor = (ratio: number): string => {
        // 定义颜色关键点（从底部到顶部）
        const colorStops: Array<{ pos: number; color: [number, number, number] }> = [
          { pos: 0, color: hexToRgb(colors.light) },      // 底部：浅色
          { pos: 0.2, color: hexToRgb(colors.standard) },
          { pos: 0.4, color: hexToRgb(colors.dark) },
          { pos: 0.6, color: hexToRgb(colors.darker) },
          { pos: 0.8, color: hexToRgb(colors.darkest) },
          { pos: 1, color: hexToRgb(colors.deepest) },    // 顶部：极深色
        ];

        // 找到当前ratio所在的两个颜色关键点
        let startStop = colorStops[0];
        let endStop = colorStops[1];

        for (let i = 0; i < colorStops.length - 1; i++) {
          if (ratio >= colorStops[i].pos && ratio <= colorStops[i + 1].pos) {
            startStop = colorStops[i];
            endStop = colorStops[i + 1];
            break;
          }
        }

        // 计算在两个关键点之间的插值比例
        const segmentRatio = (ratio - startStop.pos) / (endStop.pos - startStop.pos);

        // RGB线性插值
        const r = Math.round(startStop.color[0] + (endStop.color[0] - startStop.color[0]) * segmentRatio);
        const g = Math.round(startStop.color[1] + (endStop.color[1] - startStop.color[1]) * segmentRatio);
        const b = Math.round(startStop.color[2] + (endStop.color[2] - startStop.color[2]) * segmentRatio);

        // 透明度渐变：底部1.0（100%），顶部0.3（30%）
        const alpha = 1.0 - ratio * 0.7;

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      // 逐行绘制网点
      for (let row = 0; row < rows; row++) {
        const y = canvas.height - row * spacing;
        const ratio = row / rows;

        // 计算当前行的网点半径（线性渐变）
        const maxRadius = 10;
        const minRadius = 1;
        const radius = maxRadius - (maxRadius - minRadius) * ratio;

        // 获取当前行的颜色（RGB线性插值）
        const color = interpolateColor(ratio);

        // 绘制当前行的所有网点
        for (let col = 0; col < cols; col++) {
          const x = col * spacing + spacing / 2;

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [colors]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-0 pointer-events-none"
      style={{ zIndex: -2 }}
    />
  );
}
