/**
 * SolarSystemGrid.ts - 太阳系参考网格
 *
 * 在恒星层级显示以太阳系黄道平面为基准的参考网格。
 * 网格大小自适应相机距离，并提供当前网格间距信息供比例尺使用。
 *
 * 坐标系：黄道坐标系（场景默认坐标系）
 *   - X 轴：指向春分点
 *   - Y 轴：黄道平面内，垂直于 X 轴
 *   - Z 轴：黄道北极（垂直于黄道平面）
 * 因此网格在 XY 平面上（Z=0），即黄道面。
 */

import * as THREE from 'three';
import { LIGHT_YEAR_TO_AU } from '../config/galaxyConfig';
import { SCALE_VIEW_CONFIG } from '../config/galaxyConfig';

// 网格显示的距离阈值（AU）
const GRID_FADE_START = SCALE_VIEW_CONFIG.nearbyStarsShowStart * 0.5; // 15000 AU
const GRID_FADE_FULL = SCALE_VIEW_CONFIG.nearbyStarsShowStart;         // 30000 AU
const GRID_FADE_OUT_START = SCALE_VIEW_CONFIG.nearbyStarsFadeStart;    // 500 光年
const GRID_FADE_OUT_END = SCALE_VIEW_CONFIG.nearbyStarsFadeEnd;        // 1000 光年

// 网格颜色
const GRID_COLOR = new THREE.Color(0x4488cc);
const GRID_CENTER_COLOR = new THREE.Color(0x6699dd);

// 网格自适应：每个视口内保持约 8~16 条线
const TARGET_LINES = 10;

// 网格间距候选值（AU），按量级排列
const GRID_STEPS_AU = [
  0.1, 0.2, 0.5,
  1, 2, 5,
  10, 20, 50,
  100, 200, 500,
  1000, 2000, 5000,
  10000, 20000, 50000,
  100000, 200000, 500000,
  1 * LIGHT_YEAR_TO_AU,
  2 * LIGHT_YEAR_TO_AU,
  5 * LIGHT_YEAR_TO_AU,
  10 * LIGHT_YEAR_TO_AU,
  20 * LIGHT_YEAR_TO_AU,
  50 * LIGHT_YEAR_TO_AU,
  100 * LIGHT_YEAR_TO_AU,
  200 * LIGHT_YEAR_TO_AU,
  500 * LIGHT_YEAR_TO_AU,
  1000 * LIGHT_YEAR_TO_AU,
];

export interface GridInfo {
  /** 当前网格间距（AU） */
  cellSizeAU: number;
  /** 当前网格间距的可读标签（如 "1 光年"、"100 AU"） */
  label: string;
  /** 当前网格透明度 0~1 */
  opacity: number;
}

export class SolarSystemGrid {
  private group: THREE.Group;
  private gridLines: THREE.LineSegments | null = null;
  private currentCellSize: number = 0;
  private currentOpacity: number = 0;
  private gridInfo: GridInfo = { cellSizeAU: 0, label: '', opacity: 0 };

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'SolarSystemGrid';
    // 网格在黄道平面（XY 平面），不需要旋转
  }

  getGroup(): THREE.Group {
    return this.group;
  }

  getGridInfo(): GridInfo {
    return this.gridInfo;
  }

  /**
   * 每帧更新，根据相机距离和视野计算网格
   */
  update(camera: THREE.PerspectiveCamera, cameraDistance: number): void {
    // 计算目标透明度
    const targetOpacity = this.calcOpacity(cameraDistance);

    // 平滑过渡透明度
    this.currentOpacity += (targetOpacity - this.currentOpacity) * 0.08;

    if (this.currentOpacity < 0.005) {
      this.group.visible = false;
      this.gridInfo = { cellSizeAU: 0, label: '', opacity: 0 };
      return;
    }

    this.group.visible = true;

    // 计算合适的网格间距
    const cellSize = this.calcCellSize(camera, cameraDistance);

    // 如果间距变化超过 10%，重建网格
    if (Math.abs(cellSize - this.currentCellSize) / (this.currentCellSize || 1) > 0.1) {
      this.rebuildGrid(cellSize, cameraDistance);
      this.currentCellSize = cellSize;
    }

    // 更新透明度
    if (this.gridLines) {
      const mat = this.gridLines.material as THREE.LineBasicMaterial;
      mat.opacity = this.currentOpacity * 0.5;
    }

    this.gridInfo = {
      cellSizeAU: cellSize,
      label: this.formatLabel(cellSize),
      opacity: this.currentOpacity,
    };
  }

  dispose(): void {
    this.clearGrid();
  }

  // ==================== 私有方法 ====================

  private calcOpacity(cameraDistance: number): number {
    if (cameraDistance < GRID_FADE_START) return 0;
    if (cameraDistance < GRID_FADE_FULL) {
      return (cameraDistance - GRID_FADE_START) / (GRID_FADE_FULL - GRID_FADE_START);
    }
    if (cameraDistance < GRID_FADE_OUT_START) return 1;
    if (cameraDistance < GRID_FADE_OUT_END) {
      return 1 - (cameraDistance - GRID_FADE_OUT_START) / (GRID_FADE_OUT_END - GRID_FADE_OUT_START);
    }
    return 0;
  }

  /**
   * 根据相机视野和距离计算合适的网格间距
   * 目标：视口内约 TARGET_LINES 条线
   */
  private calcCellSize(camera: THREE.PerspectiveCamera, cameraDistance: number): number {
    // 估算视口在黄道平面上的可见范围（半宽）
    const fovRad = (camera.fov * Math.PI) / 180;
    const aspect = camera.aspect;
    // 相机到黄道平面的投影距离（近似用 cameraDistance）
    const halfHeight = Math.tan(fovRad / 2) * cameraDistance;
    const halfWidth = halfHeight * aspect;
    const visibleRange = Math.max(halfWidth, halfHeight) * 2;

    // 目标间距
    const targetStep = visibleRange / TARGET_LINES;

    // 从候选值中找最接近的
    let best = GRID_STEPS_AU[0];
    for (const step of GRID_STEPS_AU) {
      if (step >= targetStep * 0.5) {
        best = step;
        break;
      }
      best = step;
    }
    return best;
  }

  private rebuildGrid(cellSize: number, cameraDistance: number): void {
    this.clearGrid();

    // 网格范围：视口可见范围的 2 倍，以相机在黄道面的投影为中心
    const halfExtent = cameraDistance * 3;
    // 对齐到 cellSize 的整数倍
    const minCoord = Math.floor(-halfExtent / cellSize) * cellSize;
    const maxCoord = Math.ceil(halfExtent / cellSize) * cellSize;

    const positions: number[] = [];
    const colors: number[] = [];

    const addLine = (x1: number, y1: number, x2: number, y2: number, isCenter: boolean) => {
      const c = isCenter ? GRID_CENTER_COLOR : GRID_COLOR;
      positions.push(x1, y1, 0, x2, y2, 0);
      colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
    };

    // 沿 X 方向的线（平行于 X 轴）
    for (let y = minCoord; y <= maxCoord + cellSize * 0.01; y += cellSize) {
      const snapped = Math.round(y / cellSize) * cellSize;
      addLine(minCoord, snapped, maxCoord, snapped, Math.abs(snapped) < cellSize * 0.01);
    }

    // 沿 Y 方向的线（平行于 Y 轴）
    for (let x = minCoord; x <= maxCoord + cellSize * 0.01; x += cellSize) {
      const snapped = Math.round(x / cellSize) * cellSize;
      addLine(snapped, minCoord, snapped, maxCoord, Math.abs(snapped) < cellSize * 0.01);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });

    this.gridLines = new THREE.LineSegments(geometry, material);
    this.gridLines.renderOrder = -100;
    this.group.add(this.gridLines);
  }

  private clearGrid(): void {
    if (this.gridLines) {
      this.group.remove(this.gridLines);
      this.gridLines.geometry.dispose();
      (this.gridLines.material as THREE.Material).dispose();
      this.gridLines = null;
    }
  }

  private formatLabel(au: number): string {
    if (au >= LIGHT_YEAR_TO_AU) {
      const ly = au / LIGHT_YEAR_TO_AU;
      if (ly >= 1000) return `${(ly / 1000).toFixed(0)} 千光年`;
      if (ly >= 1) return `${ly % 1 === 0 ? ly.toFixed(0) : ly.toFixed(1)} 光年`;
    }
    if (au >= 1) {
      return `${au % 1 === 0 ? au.toFixed(0) : au.toFixed(1)} AU`;
    }
    return `${(au * 1000).toFixed(0)} mAU`;
  }
}
