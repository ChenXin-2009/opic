/**
 * 气象灾害监测 - Three.js 渲染器
 * 在 3D 地球表面绘制灾害事件点（圆形精灵 + 脉冲环）
 */

import * as THREE from 'three';

export interface DisasterPoint {
  id: string;
  lat: number;
  lon: number;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  time: string;
  source: string;
  description?: string;
  url?: string;
}

const EARTH_RADIUS = 0.0000426; // AU，与 Planet.ts 中地球真实半径一致

function latLonToVec3(lat: number, lon: number, radius: number = EARTH_RADIUS * 1.012): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta),
  );
}

// ── 颜色方案：色相差异最大化，避免相近色 ──────────────────────────────────────
const CATEGORY_COLOR: Record<string, string> = {
  earthquake: '#ff6600',  // 橙色
  typhoon:    '#dd44ff',  // 紫色
  wildfire:   '#ff2200',  // 红色
  flood:      '#0088ff',  // 蓝色
  volcano:    '#ff0044',  // 玫红
  tsunami:    '#00ccff',  // 青色
  storm:      '#ffdd00',  // 黄色
  drought:    '#cc8800',  // 棕黄
  multi:      '#00ff88',  // 绿色（综合）
};

// 严重程度 → 点大小（相对地球半径）
const SEVERITY_SIZE: Record<string, number> = {
  extreme: EARTH_RADIUS * 0.10,
  high:    EARTH_RADIUS * 0.075,
  medium:  EARTH_RADIUS * 0.055,
  low:     EARTH_RADIUS * 0.038,
};

// ── 圆形纹理生成（canvas → THREE.Texture）────────────────────────────────────

const textureCache = new Map<string, THREE.Texture>();

function makeCircleTexture(hexColor: string, glow = false): THREE.Texture {
  const key = `${hexColor}_${glow}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2, cy = size / 2, r = size / 2 - 2;

  if (glow) {
    // 发光晕圈
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0,   hexColor + 'ff');
    grad.addColorStop(0.4, hexColor + 'cc');
    grad.addColorStop(0.7, hexColor + '44');
    grad.addColorStop(1,   hexColor + '00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  } else {
    // 实心圆 + 白色描边
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0,   '#ffffff');
    grad.addColorStop(0.3, hexColor);
    grad.addColorStop(1,   hexColor + 'aa');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  textureCache.set(key, tex);
  return tex;
}

// ── 渲染器 ────────────────────────────────────────────────────────────────────

export class DisasterRenderer {
  private group: THREE.Group;
  private layerMeshes: Map<string, THREE.Points> = new Map();
  private pulseRings: THREE.Mesh[] = [];
  private pulseTime = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'DisasterLayer';
    this.group.renderOrder = 15;
  }

  getGroup(): THREE.Group { return this.group; }

  setEarthTransform(x: number, y: number, z: number, quaternion: THREE.Quaternion): void {
    this.group.position.set(x, y, z);
    this.group.quaternion.copy(quaternion);
  }

  setEarthPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  /** 更新所有灾害点 */
  updatePoints(points: DisasterPoint[], opacity = 0.9): void {
    this.clearAll();
    if (!points.length) return;

    // 按 category + severity 分组，每组一个 Points（不同纹理/大小）
    type GroupKey = string;
    const groups = new Map<GroupKey, { pts: DisasterPoint[]; cat: string; sev: string }>();

    for (const p of points) {
      const cat = p.category || 'multi';
      const sev = p.severity || 'low';
      const key = `${cat}__${sev}`;
      if (!groups.has(key)) groups.set(key, { pts: [], cat, sev });
      groups.get(key)!.pts.push(p);
    }

    groups.forEach(({ pts, cat, sev }) => {
      const colorHex = CATEGORY_COLOR[cat] || '#aaaaaa';
      const size = SEVERITY_SIZE[sev] || SEVERITY_SIZE.low;
      const tex = makeCircleTexture(colorHex, false);

      const positions = new Float32Array(pts.length * 3);
      pts.forEach((p, i) => {
        const v = latLonToVec3(p.lat, p.lon);
        positions[i * 3]     = v.x;
        positions[i * 3 + 1] = v.y;
        positions[i * 3 + 2] = v.z;
      });

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        size,
        map: tex,
        transparent: true,
        opacity,
        depthWrite: false,
        sizeAttenuation: true,
        alphaTest: 0.05,
      });

      const mesh = new THREE.Points(geo, mat);
      mesh.renderOrder = 16;
      this.group.add(mesh);
      // 用 cat 作为 key（同类别多个 severity 会覆盖，但 setLayerVisible 按 cat 控制）
      this.layerMeshes.set(`${cat}__${sev}`, mesh);
    });

    // extreme + high 事件加发光晕
    const glowPts = points.filter(p => p.severity === 'extreme' || p.severity === 'high');
    this.addGlowLayer(glowPts, opacity);

    // extreme 事件加脉冲环
    const extremePts = points.filter(p => p.severity === 'extreme');
    this.addPulseRings(extremePts);
  }

  /** 发光晕层（比主点稍大，半透明） */
  private addGlowLayer(pts: DisasterPoint[], opacity: number): void {
    if (!pts.length) return;

    // 按类别分组
    const byCat = new Map<string, DisasterPoint[]>();
    for (const p of pts) {
      const cat = p.category || 'multi';
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat)!.push(p);
    }

    byCat.forEach((catPts, cat) => {
      const colorHex = CATEGORY_COLOR[cat] || '#aaaaaa';
      const tex = makeCircleTexture(colorHex, true);

      const positions = new Float32Array(catPts.length * 3);
      catPts.forEach((p, i) => {
        const v = latLonToVec3(p.lat, p.lon);
        positions[i * 3]     = v.x;
        positions[i * 3 + 1] = v.y;
        positions[i * 3 + 2] = v.z;
      });

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const maxSev = catPts.some(p => p.severity === 'extreme') ? 'extreme' : 'high';
      const mat = new THREE.PointsMaterial({
        size: SEVERITY_SIZE[maxSev] * 2.2,
        map: tex,
        transparent: true,
        opacity: opacity * 0.35,
        depthWrite: false,
        sizeAttenuation: true,
        alphaTest: 0.01,
      });

      const mesh = new THREE.Points(geo, mat);
      mesh.renderOrder = 15;
      this.group.add(mesh);
      this.layerMeshes.set(`${cat}__glow`, mesh);
    });
  }

  private addPulseRings(pts: DisasterPoint[]): void {
    for (const p of pts.slice(0, 40)) {
      const colorHex = CATEGORY_COLOR[p.category] || '#ff4444';
      const innerR = EARTH_RADIUS * 0.022;
      const outerR = EARTH_RADIUS * 0.032;
      const geo = new THREE.RingGeometry(innerR, outerR, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(geo, mat);
      const pos = latLonToVec3(p.lat, p.lon, EARTH_RADIUS * 1.013);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.rotateX(Math.PI / 2);
      ring.renderOrder = 17;
      ring.userData = { phase: Math.random() * Math.PI * 2 };
      this.group.add(ring);
      this.pulseRings.push(ring);
    }
  }

  tick(delta: number): void {
    this.pulseTime += delta;
    for (const ring of this.pulseRings) {
      const t = (Math.sin(this.pulseTime * 2.5 + ring.userData.phase) + 1) / 2;
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.05 + t * 0.7;
      ring.scale.setScalar(0.7 + t * 0.6);
    }
  }

  setLayerVisible(category: string, visible: boolean): void {
    this.layerMeshes.forEach((mesh, key) => {
      if (key.startsWith(category + '__')) mesh.visible = visible;
    });
  }

  setOpacity(opacity: number): void {
    this.layerMeshes.forEach((mesh, key) => {
      const mat = mesh.material as THREE.PointsMaterial;
      mat.opacity = key.endsWith('__glow') ? opacity * 0.35 : opacity;
    });
  }

  private clearAll(): void {
    this.layerMeshes.forEach(mesh => {
      this.group.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.layerMeshes.clear();
    for (const ring of this.pulseRings) {
      this.group.remove(ring);
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
    }
    this.pulseRings = [];
  }

  dispose(): void {
    this.clearAll();
    textureCache.forEach(t => t.dispose());
    textureCache.clear();
  }
}
