/**
 * 商业航天发射追踪 - Three.js 渲染器
 * 在 3D 地球表面绘制发射场、发射弧线和轨道插入点
 */

import * as THREE from 'three';

export interface LaunchPoint {
  id: string;
  name: string;
  siteName: string;
  lat: number;
  lon: number;
  status: string;
  net: string;
  vehicleName: string;
  orbitType?: string;
  orbitAltitude?: number;
  orbitInclination?: number;
  isPast: boolean;
}

// 地球半径（Three.js 场景单位 = AU），与 TrafficRenderer / DisasterRenderer 保持一致
const EARTH_RADIUS = 0.0000426;

function latLonToVec3(lat: number, lon: number, radius = EARTH_RADIUS * 1.01): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta),
  );
}

const STATUS_COLOR: Record<string, string> = {
  go:              '#44ff44',
  go_for_launch:   '#88ff44',
  in_flight:       '#44aaff',
  success:         '#44ff88',
  failure:         '#ff4444',
  partial_failure: '#ff8844',
  hold:            '#ffaa00',
  tbd:             '#888888',
};

const ORBIT_COLOR: Record<string, string> = {
  LEO:   '#4488ff',
  MEO:   '#44aaff',
  GEO:   '#ff8844',
  GTO:   '#ffaa44',
  SSO:   '#44ffaa',
  ISS:   '#ffffff',
  TLI:   '#aaaaff',
  HEO:   '#ff44aa',
  Sub:   '#888888',
  Other: '#666666',
};

export class LaunchRenderer {
  private group: THREE.Group;
  private sitePoints: THREE.Points | null = null;
  private arcGroup: THREE.Group;
  private pulseRings: THREE.Mesh[] = [];
  private pulseTime = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'SpaceLaunchLayer';
    this.group.renderOrder = 10;

    this.arcGroup = new THREE.Group();
    this.arcGroup.name = 'LaunchArcs';
    this.group.add(this.arcGroup);
  }

  getGroup(): THREE.Group { return this.group; }

  /** 每帧同步地球公转位置，与 TrafficRenderer 保持一致 */
  setEarthPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  /** 同步地球完整变换（位置 + 旋转四元数），使标记点跟随地球自转 */
  setEarthTransform(x: number, y: number, z: number, quaternion: THREE.Quaternion): void {
    this.group.position.set(x, y, z);
    this.group.quaternion.copy(quaternion);
  }

  updatePoints(points: LaunchPoint[], opacity = 0.9): void {
    this.clearAll();
    if (!points.length) return;

    // ── Site dots ──────────────────────────────────────────────────────────
    const positions: number[] = [];
    const colors: number[] = [];

    for (const p of points) {
      const v = latLonToVec3(p.lat, p.lon);
      positions.push(v.x, v.y, v.z);
      const c = new THREE.Color(STATUS_COLOR[p.status] ?? '#888888');
      colors.push(c.r, c.g, c.b);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(colors), 3));

    const mat = new THREE.PointsMaterial({
      size: EARTH_RADIUS * 0.15,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.sitePoints = new THREE.Points(geo, mat);
    this.sitePoints.renderOrder = 11;
    this.group.add(this.sitePoints);

    // ── Pulse rings for upcoming / active launches ─────────────────────────
    const active = points.filter(p => !p.isPast && p.status !== 'tbd');
    this.addPulseRings(active.slice(0, 20), opacity);

    // ── Trajectory arcs for in-flight / go ────────────────────────────────
    const flying = points.filter(p =>
      p.status === 'in_flight' || p.status === 'go' || p.status === 'go_for_launch'
    );
    for (const p of flying.slice(0, 10)) {
      this.addTrajectoryArc(p, opacity);
    }
  }

  private addPulseRings(pts: LaunchPoint[], opacity: number): void {
    for (const p of pts) {
      const hex = STATUS_COLOR[p.status] ?? '#44ff44';
      const geo = new THREE.RingGeometry(EARTH_RADIUS * 0.12, EARTH_RADIUS * 0.17, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(hex),
        transparent: true,
        opacity: opacity * 0.7,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(geo, mat);
      const pos = latLonToVec3(p.lat, p.lon, EARTH_RADIUS * 1.015);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.rotateX(Math.PI / 2);
      ring.renderOrder = 12;
      ring.userData = { phase: Math.random() * Math.PI * 2 };
      this.group.add(ring);
      this.pulseRings.push(ring);
    }
  }

  private addTrajectoryArc(p: LaunchPoint, opacity: number): void {
    const orbitColor = ORBIT_COLOR[p.orbitType ?? 'Other'] ?? '#4488ff';
    const color = new THREE.Color(orbitColor);

    // Target altitude in AU: LEO ~400km, GEO ~35786km. Earth radius = 6371km.
    const altKm = p.orbitAltitude ?? (
      p.orbitType === 'GEO' || p.orbitType === 'GTO' ? 35786 :
      p.orbitType === 'MEO' ? 20200 : 400
    );
    const altAU = (altKm / 149597870.7) * 1000; // km → AU (approx)
    const targetRadius = EARTH_RADIUS + altAU;

    const launchPos = latLonToVec3(p.lat, p.lon, EARTH_RADIUS * 1.01);

    // Target: offset east + toward equator for GEO
    let targetLat = p.lat;
    let targetLon = p.lon + 30;
    if (p.orbitType === 'GEO' || p.orbitType === 'GTO') {
      targetLat = 0;
      targetLon = p.lon + 60;
    } else if (p.orbitType === 'SSO') {
      targetLat = p.lat + 10;
      targetLon = p.lon + 15;
    }

    const targetPos = latLonToVec3(targetLat, targetLon, targetRadius);

    const SEGMENTS = 40;
    const arcPositions: number[] = [];
    const startDir = launchPos.clone().normalize();
    const endDir   = targetPos.clone().normalize();

    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const dir = new THREE.Vector3().copy(startDir).lerp(endDir, t).normalize();
      const r = EARTH_RADIUS * 1.01 + t * altAU;
      const pt = dir.multiplyScalar(r);
      arcPositions.push(pt.x, pt.y, pt.z);
    }

    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arcPositions), 3));

    const arcMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: opacity * 0.8,
      depthWrite: false,
    });

    const line = new THREE.Line(arcGeo, arcMat);
    line.renderOrder = 11;
    this.arcGroup.add(line);

    // Orbit insertion dot
    const dotGeo = new THREE.SphereGeometry(EARTH_RADIUS * 0.04, 6, 6);
    const dotMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(targetPos);
    dot.renderOrder = 12;
    this.arcGroup.add(dot);
  }

  tick(delta: number): void {
    this.pulseTime += delta;
    for (const ring of this.pulseRings) {
      const phase = ring.userData.phase as number;
      const t = (Math.sin(this.pulseTime * 2.5 + phase) + 1) / 2;
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.1 + t * 0.7;
      ring.scale.setScalar(0.7 + t * 0.6);
    }
  }

  setOpacity(opacity: number): void {
    if (this.sitePoints) {
      (this.sitePoints.material as THREE.PointsMaterial).opacity = opacity;
    }
    this.arcGroup.children.forEach(child => {
      const mat = (child as any).material as THREE.Material & { opacity?: number };
      if (mat && mat.opacity !== undefined) mat.opacity = opacity * 0.8;
    });
    this.pulseRings.forEach(ring => {
      (ring.material as THREE.MeshBasicMaterial).opacity = opacity * 0.6;
    });
  }

  private clearAll(): void {
    if (this.sitePoints) {
      this.group.remove(this.sitePoints);
      this.sitePoints.geometry.dispose();
      (this.sitePoints.material as THREE.Material).dispose();
      this.sitePoints = null;
    }
    this.arcGroup.children.slice().forEach(child => {
      this.arcGroup.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) (child as any).material.dispose();
    });
    for (const ring of this.pulseRings) {
      this.group.remove(ring);
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
    }
    this.pulseRings = [];
  }

  dispose(): void { this.clearAll(); }
}
