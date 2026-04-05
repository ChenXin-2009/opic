/**
 * 全球货运与贸易路线 - Three.js 渲染器
 *
 * 坐标系说明：
 * - EARTH_RADIUS = 0.0000426 AU（与 Planet.ts 一致）
 * - latLonToLocal() 输出"未旋转地球本地坐标系"（Y 轴朝北极，X 轴朝本初子午线）
 *   公式与 Planet.ts createLatLonGrid 完全一致
 * - group.position = 地球世界位置，group.quaternion = 地球世界旋转
 * - 所有子 mesh 的坐标都在地球本地坐标系里，Three.js 自动应用 group 变换
 * - 这样静态数据只需构建一次，动态数据每次更新时也只需本地坐标
 */

import * as THREE from 'three';
import type { VesselPosition, FlightPosition, TradeRoute, Port } from './types';

const EARTH_RADIUS   = 0.0000426; // AU，与 Planet.ts 一致
const SURFACE_OFFSET = EARTH_RADIUS * 0.012;

/**
 * 经纬度 → 地球本地坐标系（Y 轴朝北极，X 轴朝本初子午线）
 * 与 Planet.ts createLatLonGrid 公式完全一致：
 *   x = r·cos(lat)·cos(lon)
 *   y = r·sin(lat)
 *   z = r·cos(lat)·sin(lon)
 */
function latLonToLocal(lat: number, lon: number, r: number): THREE.Vector3 {
  const φ = lat * (Math.PI / 180);
  const λ = lon * (Math.PI / 180);
  return new THREE.Vector3(
    r * Math.cos(φ) * Math.cos(λ),
    r * Math.sin(φ),
    r * Math.cos(φ) * Math.sin(λ),
  );
}

/** 球面大圆弧插值（地球本地坐标系） */
function greatCirclePoints(
  from: { lat: number; lon: number },
  to:   { lat: number; lon: number },
  segments: number,
  r: number,
): THREE.Vector3[] {
  const a = latLonToLocal(from.lat, from.lon, r);
  const b = latLonToLocal(to.lat,   to.lon,   r);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    pts.push(new THREE.Vector3().lerpVectors(a, b, i / segments).normalize().multiplyScalar(r));
  }
  return pts;
}

export class TrafficRenderer {
  private group: THREE.Group;
  private vesselMesh:  THREE.Points | null = null;
  private flightMesh:  THREE.Points | null = null;
  private routeLines:  THREE.LineSegments | null = null;
  private portMesh:    THREE.Points | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'GlobalTrafficLayer';
    this.group.renderOrder = 15;
  }

  getGroup(): THREE.Group { return this.group; }

  /**
   * 每帧由 Overlay 调用。
   * group.position = 地球世界位置
   * group.quaternion = 地球世界旋转（Three.js 自动应用到所有子 mesh）
   * 所有子 mesh 坐标在地球本地坐标系里，无需手动旋转
   */
  setEarthTransform(x: number, y: number, z: number, q: THREE.Quaternion): void {
    this.group.position.set(x, y, z);
    this.group.quaternion.copy(q);
  }

  setEarthPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  // ── 更新各图层（坐标均为地球本地坐标系，不需要手动旋转）────────────────────

  updateVessels(vessels: VesselPosition[], opacity = 0.9): void {
    this._dispose(this.vesselMesh); this.vesselMesh = null;
    if (!vessels.length) return;

    const colorMap: Record<string, THREE.Color> = {
      cargo:        new THREE.Color('#00aaff'),
      tanker:       new THREE.Color('#ff4400'),
      container:    new THREE.Color('#00ffaa'),
      bulk_carrier: new THREE.Color('#ffaa00'),
      passenger:    new THREE.Color('#ff88ff'),
      fishing:      new THREE.Color('#88ff88'),
      military:     new THREE.Color('#ff0000'),
      other:        new THREE.Color('#aaaaaa'),
    };

    const pos = new Float32Array(vessels.length * 3);
    const col = new Float32Array(vessels.length * 3);
    vessels.forEach((v, i) => {
      const p = latLonToLocal(v.lat, v.lon, EARTH_RADIUS + SURFACE_OFFSET);
      pos[i*3]=p.x; pos[i*3+1]=p.y; pos[i*3+2]=p.z;
      const c = colorMap[v.vesselType] ?? colorMap.other;
      col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
    });

    this.vesselMesh = this._makePoints(pos, col, EARTH_RADIUS * 0.08, opacity, 16);
    this.group.add(this.vesselMesh);
  }

  updateFlights(flights: FlightPosition[], opacity = 0.85): void {
    this._dispose(this.flightMesh); this.flightMesh = null;
    if (!flights.length) return;

    const fc  = new THREE.Color('#ffcc44');
    const pos = new Float32Array(flights.length * 3);
    const col = new Float32Array(flights.length * 3);

    flights.forEach((f, i) => {
      const altOffset = SURFACE_OFFSET + (f.altitude / 6_371_000) * EARTH_RADIUS;
      const p = latLonToLocal(f.lat, f.lon, EARTH_RADIUS + altOffset);
      pos[i*3]=p.x; pos[i*3+1]=p.y; pos[i*3+2]=p.z;
      col[i*3]=fc.r; col[i*3+1]=fc.g; col[i*3+2]=fc.b;
    });

    this.flightMesh = this._makePoints(pos, col, EARTH_RADIUS * 0.07, opacity, 17);
    this.group.add(this.flightMesh);
  }

  updateTradeRoutes(routes: TradeRoute[], opacity = 0.55): void {
    this._dispose(this.routeLines); this.routeLines = null;
    if (!routes.length) return;

    const allPos: number[] = [];
    const allCol: number[] = [];

    routes.forEach(route => {
      const altOffset = route.type === 'air' ? EARTH_RADIUS * 0.04 : 0;
      const segs      = route.type === 'air' ? 32 : 48;
      const r         = EARTH_RADIUS + SURFACE_OFFSET + altOffset;
      const color     = new THREE.Color(route.color);

      for (let i = 0; i < route.waypoints.length - 1; i++) {
        const pts = greatCirclePoints(route.waypoints[i], route.waypoints[i + 1], segs, r);
        for (let j = 0; j < pts.length - 1; j++) {
          allPos.push(pts[j].x, pts[j].y, pts[j].z, pts[j+1].x, pts[j+1].y, pts[j+1].z);
          allCol.push(color.r, color.g, color.b, color.r, color.g, color.b);
        }
      }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(allPos), 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(allCol), 3));
    this.routeLines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity, depthWrite: false,
    }));
    this.routeLines.renderOrder = 15;
    this.group.add(this.routeLines);
  }

  updatePorts(ports: Port[], opacity = 0.95): void {
    this._dispose(this.portMesh); this.portMesh = null;
    if (!ports.length) return;

    const seaC = new THREE.Color('#00ffcc');
    const airC = new THREE.Color('#ffaaff');
    const pos  = new Float32Array(ports.length * 3);
    const col  = new Float32Array(ports.length * 3);

    ports.forEach((p, i) => {
      const v = latLonToLocal(p.lat, p.lon, EARTH_RADIUS + SURFACE_OFFSET * 1.5);
      pos[i*3]=v.x; pos[i*3+1]=v.y; pos[i*3+2]=v.z;
      const c = p.type === 'sea' ? seaC : airC;
      col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
    });

    this.portMesh = this._makePoints(pos, col, EARTH_RADIUS * 0.12, opacity, 18);
    this.group.add(this.portMesh);
  }

  // ── 辅助 ─────────────────────────────────────────────────────────────────

  setOpacity(opacity: number): void {
    [this.vesselMesh, this.flightMesh, this.routeLines, this.portMesh].forEach(obj => {
      if (obj) (obj.material as THREE.Material & { opacity: number }).opacity = opacity;
    });
  }

  setLayerVisible(layer: 'vessels' | 'flights' | 'routes' | 'ports', visible: boolean): void {
    if (layer === 'vessels' && this.vesselMesh)  this.vesselMesh.visible  = visible;
    if (layer === 'flights' && this.flightMesh)  this.flightMesh.visible  = visible;
    if (layer === 'routes'  && this.routeLines)  this.routeLines.visible  = visible;
    if (layer === 'ports'   && this.portMesh)    this.portMesh.visible    = visible;
  }

  private _makePoints(
    pos: Float32Array, col: Float32Array,
    size: number, opacity: number, order: number,
  ): THREE.Points {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    const mesh = new THREE.Points(geo, new THREE.PointsMaterial({
      size, vertexColors: true, transparent: true, opacity,
      depthWrite: false, sizeAttenuation: true,
    }));
    mesh.renderOrder = order;
    return mesh;
  }

  private _dispose(obj: THREE.Object3D | null): void {
    if (!obj) return;
    this.group.remove(obj);
    (obj as any).geometry?.dispose();
    (obj as any).material?.dispose();
  }

  dispose(): void {
    [this.vesselMesh, this.flightMesh, this.routeLines, this.portMesh]
      .forEach(o => this._dispose(o));
    this.vesselMesh = this.flightMesh = this.routeLines = this.portMesh = null;
  }
}
