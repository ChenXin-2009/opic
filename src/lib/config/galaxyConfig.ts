/**
 * galaxyConfig.ts - 银河系和近邻恒星配置
 */

// 导入统一的单位转换常量
import { LIGHT_YEAR_TO_AU, PARSEC_TO_LIGHT_YEAR, PARSEC_TO_AU } from '../constants/units';

// 重新导出以保持向后兼容
export { LIGHT_YEAR_TO_AU, PARSEC_TO_LIGHT_YEAR, PARSEC_TO_AU };

// ==================== 视图切换阈值配置 ====================
export const SCALE_VIEW_CONFIG = {
  solarSystemFadeStart: 500,
  solarSystemFadeEnd: 2000,
  nearbyStarsShowStart: 30000,                  // 系外恒星开始显示（AU）
  nearbyStarsShowFull: LIGHT_YEAR_TO_AU,        // 系外恒星完全显示（1光年）
  nearbyStarsFadeStart: 500 * LIGHT_YEAR_TO_AU,
  nearbyStarsFadeEnd: 1000 * LIGHT_YEAR_TO_AU,
  galaxyShowStart: 1000 * LIGHT_YEAR_TO_AU,     // 1000光年开始显示
  galaxyShowFull: 2000 * LIGHT_YEAR_TO_AU,      // 2000光年完全显示
  // 银河系背景（圆柱投影）在系外恒星显示时淡出
  milkyWayBackgroundFadeStart: 30000,           // 与系外恒星同时开始淡出
  milkyWayBackgroundFadeEnd: LIGHT_YEAR_TO_AU,  // 1光年时完全隐藏
};

// ==================== 近邻恒星配置 ====================
export const NEARBY_STARS_CONFIG = {
  enabled: true,
  maxDistance: 300,
  basePointSize: 6.0,
  brightnessScale: 2.0,
  useSpheres: false,
  sphereBaseRadius: 0.01 * LIGHT_YEAR_TO_AU,
  colorTemperatureEnabled: true,
  labelShowDistance: 500,   // 光年，相机在此距离内显示恒星名称标签
  twinkleEnabled: true,
  twinkleSpeed: 0.5,
  twinkleIntensity: 0.3,
};

// ==================== 银河系配置 ====================
export const GALAXY_CONFIG = {
  enabled: true,
  radius: 50000,
  thickness: 1000,
  diskThickness: 300,
  sunDistanceFromCenter: 26000,
  topViewTexturePath: '/textures/planets/Milky_Way_map_by_Gaia_labelled.jpg',
  topViewOpacity: 1.0,
  topViewScale: 1.0,
  // 立体厚度配置
  layerCount: 3,             // 层数（更多层减少分层感）
  layerThicknessLY: 2000,     // 总厚度（光年）
  layerOpacity: 0.3,         // 每层透明度
  bulgeFactor: 2,             // 凸起强度系数（相对于厚度）
  bulgeExponent: 4,           // 圆盘区域衰减指数
  coreRadius: 0.1,           // 核球半径（相对于银河系半径）
  coreThicknessFactor: 0.0001,   // 核球厚度倍数
  diskMinThickness: 0.2,     // 圆盘最小厚度（相对于最大厚度）
  layerJitter: 0,             // 层高度随机抖动（减少分层感）
  coreBrightness: 1,          // 核心亮度倍数
  // 翘曲配置（银河系边缘一侧向上翘，另一侧向下弯）
  warpEnabled: true,          // 是否启用翘曲
  warpAmplitude: 0.08,        // 翘曲幅度（相对于半径）
  warpStartRadius: 0.4,       // 翘曲开始位置（相对于半径）
  warpAngle: 0,               // 翘曲方向角度（度）
  // 侧视图配置
  sideViewEnabled: true,      // 是否启用侧视图
  sideViewTexturePath: '/textures/planets/MilkyWaySide_Gaia_5000_2.jpg',
  sideViewOpacity: 0.05,       // 侧视图透明度
  sideViewCount: 30,           // 侧视图数量（均匀分布）
  // 旋转配置（度）- 基于天文学精确计算
  rotationX: -60.2,  // 银道面相对于黄道面的精确倾角
  rotationY: 13.4,   // 银河中心方向（人马座）
  rotationZ: 103.0,  // 银道面滚转角度
  // 其他配置
  particleCount: 100000,
  particleBaseSize: 1.0,
  coreColor: '#fffaf0',
  armColor: '#aaccff',
  outerColor: '#8899bb',
  lodLevels: 4,
  lodDistances: [100, 500, 2000, 10000],
  lodParticleRatios: [1.0, 0.5, 0.2, 0.05],
  armCount: 4,
  armWindingAngle: 12,
  armWidth: 0.15,
  armBrightnessBoost: 1.5,
};

// ==================== 恒星数据接口 ====================
export interface StarData {
  name: string;
  distance: number;
  ra: number;
  dec: number;
  apparentMagnitude: number;
  absoluteMagnitude: number;
  spectralType: string;
  color: number;
}



// ==================== 近邻恒星数据 ====================
export const NEARBY_STARS_DATA: StarData[] = [
  // 10光年内
  { name: '比邻星', distance: 4.24, ra: 217.42, dec: -62.68, apparentMagnitude: 11.13, absoluteMagnitude: 15.53, spectralType: 'M5.5Ve', color: 0xff6644 },
  { name: '半人马座α A', distance: 4.37, ra: 219.90, dec: -60.83, apparentMagnitude: -0.01, absoluteMagnitude: 4.38, spectralType: 'G2V', color: 0xfff4ea },
  { name: '半人马座α B', distance: 4.37, ra: 219.90, dec: -60.83, apparentMagnitude: 1.33, absoluteMagnitude: 5.71, spectralType: 'K1V', color: 0xffd2a1 },
  { name: '巴纳德星', distance: 5.96, ra: 269.45, dec: 4.69, apparentMagnitude: 9.54, absoluteMagnitude: 13.22, spectralType: 'M4Ve', color: 0xff7755 },
  { name: '鲁坦726-8 A', distance: 8.73, ra: 24.75, dec: -17.95, apparentMagnitude: 12.56, absoluteMagnitude: 15.40, spectralType: 'M5.5Ve', color: 0xff6644 },
  { name: '天狼星 A', distance: 8.60, ra: 101.29, dec: -16.72, apparentMagnitude: -1.46, absoluteMagnitude: 1.42, spectralType: 'A1V', color: 0xaaccff },
  { name: '天狼星 B', distance: 8.60, ra: 101.29, dec: -16.72, apparentMagnitude: 8.44, absoluteMagnitude: 11.34, spectralType: 'DA2', color: 0xffffff },
  { name: '罗斯154', distance: 9.68, ra: 283.82, dec: -23.83, apparentMagnitude: 10.44, absoluteMagnitude: 13.07, spectralType: 'M3.5Ve', color: 0xff7755 },
  { name: '罗斯248', distance: 10.32, ra: 355.49, dec: 44.18, apparentMagnitude: 12.29, absoluteMagnitude: 14.79, spectralType: 'M6Ve', color: 0xff6633 },
  // 10-20光年
  { name: '波江座ε', distance: 10.52, ra: 53.23, dec: -9.46, apparentMagnitude: 3.73, absoluteMagnitude: 6.19, spectralType: 'K2V', color: 0xffc78e },
  { name: '南河三 A', distance: 11.46, ra: 114.83, dec: 5.22, apparentMagnitude: 0.34, absoluteMagnitude: 2.66, spectralType: 'F5IV-V', color: 0xfff8f0 },
  { name: '南河三 B', distance: 11.46, ra: 114.83, dec: 5.22, apparentMagnitude: 10.70, absoluteMagnitude: 13.04, spectralType: 'DA', color: 0xffffff },
  { name: '鲸鱼座τ', distance: 11.91, ra: 26.02, dec: -15.94, apparentMagnitude: 3.50, absoluteMagnitude: 5.68, spectralType: 'G8.5V', color: 0xffe8c8 },
  { name: '罗斯128', distance: 11.01, ra: 176.92, dec: 0.80, apparentMagnitude: 11.13, absoluteMagnitude: 13.51, spectralType: 'M4V', color: 0xff7755 },
  { name: '天鹅座61 A', distance: 11.41, ra: 316.73, dec: 38.75, apparentMagnitude: 5.21, absoluteMagnitude: 7.49, spectralType: 'K5V', color: 0xffaa55 },
  { name: '天鹅座61 B', distance: 11.41, ra: 316.73, dec: 38.75, apparentMagnitude: 6.03, absoluteMagnitude: 8.31, spectralType: 'K7V', color: 0xff9944 },
  { name: '印第安座ε', distance: 11.83, ra: 330.84, dec: -56.79, apparentMagnitude: 4.69, absoluteMagnitude: 6.89, spectralType: 'K5Ve', color: 0xffaa55 },
  { name: '斯特鲁维2398 A', distance: 11.53, ra: 282.45, dec: 59.63, apparentMagnitude: 8.90, absoluteMagnitude: 11.16, spectralType: 'M3V', color: 0xff8866 },
  { name: '格鲁姆布里奇34 A', distance: 11.62, ra: 2.78, dec: 44.02, apparentMagnitude: 8.09, absoluteMagnitude: 10.32, spectralType: 'M1.5V', color: 0xff9977 },
  { name: 'DX巨蟹座', distance: 11.83, ra: 124.03, dec: 26.71, apparentMagnitude: 14.78, absoluteMagnitude: 16.98, spectralType: 'M6.5Ve', color: 0xff5522 },
  { name: '天仓五', distance: 11.91, ra: 26.02, dec: -15.94, apparentMagnitude: 3.50, absoluteMagnitude: 5.68, spectralType: 'G8.5V', color: 0xffe8c8 },
  { name: 'GJ1111', distance: 13.83, ra: 56.29, dec: 5.23, apparentMagnitude: 14.78, absoluteMagnitude: 16.76, spectralType: 'M6.5V', color: 0xff5522 },
  { name: '牛郎星', distance: 16.73, ra: 297.70, dec: 8.87, apparentMagnitude: 0.76, absoluteMagnitude: 2.21, spectralType: 'A7V', color: 0xddeeff },
  { name: '鲁坦星', distance: 12.37, ra: 113.19, dec: 5.23, apparentMagnitude: 9.86, absoluteMagnitude: 11.97, spectralType: 'M3.5V', color: 0xff8866 },
  { name: '卡普坦星', distance: 12.76, ra: 77.14, dec: -45.01, apparentMagnitude: 8.86, absoluteMagnitude: 10.87, spectralType: 'M1.5V', color: 0xff9977 },
  { name: 'AX微星座', distance: 12.94, ra: 311.29, dec: -31.34, apparentMagnitude: 6.67, absoluteMagnitude: 8.65, spectralType: 'K7V', color: 0xff9944 },
  { name: '天仓五', distance: 18.69, ra: 13.03, dec: 5.24, apparentMagnitude: 4.83, absoluteMagnitude: 5.92, spectralType: 'K0V', color: 0xffd4a8 },
  // 20-50光年
  { name: '织女星', distance: 25.04, ra: 279.23, dec: 38.78, apparentMagnitude: 0.03, absoluteMagnitude: 0.58, spectralType: 'A0V', color: 0xaaccff },
  { name: '北落师门', distance: 25.13, ra: 344.41, dec: -29.62, apparentMagnitude: 1.16, absoluteMagnitude: 1.72, spectralType: 'A4V', color: 0xccddff },
  { name: '南门二', distance: 4.37, ra: 219.90, dec: -60.83, apparentMagnitude: -0.27, absoluteMagnitude: 4.06, spectralType: 'G2V+K1V', color: 0xfff4ea },
  { name: '北河二', distance: 33.78, ra: 113.65, dec: 31.89, apparentMagnitude: 1.14, absoluteMagnitude: -0.49, spectralType: 'A2Vm', color: 0xccddff },
  { name: '北河三', distance: 33.78, ra: 116.33, dec: 28.03, apparentMagnitude: 1.93, absoluteMagnitude: 0.59, spectralType: 'K0III', color: 0xffd4a8 },
  { name: '大角星', distance: 36.66, ra: 213.92, dec: 19.18, apparentMagnitude: -0.05, absoluteMagnitude: -0.31, spectralType: 'K1.5III', color: 0xffb870 },
  { name: '五车二', distance: 42.92, ra: 79.17, dec: 45.99, apparentMagnitude: 0.08, absoluteMagnitude: -0.48, spectralType: 'G3III', color: 0xfff4d4 },
  { name: '南河三', distance: 11.46, ra: 114.83, dec: 5.22, apparentMagnitude: 0.34, absoluteMagnitude: 2.66, spectralType: 'F5IV-V', color: 0xfff8f0 },
  { name: '参宿五', distance: 243.00, ra: 81.28, dec: 6.35, apparentMagnitude: 1.64, absoluteMagnitude: -2.76, spectralType: 'B2III', color: 0x99aaff },
  { name: '天船三', distance: 44.00, ra: 76.96, dec: 41.23, apparentMagnitude: 1.65, absoluteMagnitude: -0.61, spectralType: 'A2IV', color: 0xccddff },
  { name: '五帝座一', distance: 36.20, ra: 194.01, dec: 38.32, apparentMagnitude: 2.37, absoluteMagnitude: 0.00, spectralType: 'A0V', color: 0xaaccff },
  // 50-100光年
  { name: '毕宿五', distance: 65.30, ra: 68.98, dec: 16.51, apparentMagnitude: 0.85, absoluteMagnitude: -0.63, spectralType: 'K5III', color: 0xffaa55 },
  { name: '轩辕十四', distance: 79.30, ra: 152.09, dec: 11.97, apparentMagnitude: 1.40, absoluteMagnitude: -0.52, spectralType: 'B8IVn', color: 0xaabbff },
  { name: '北极星', distance: 433.00, ra: 37.95, dec: 89.26, apparentMagnitude: 1.98, absoluteMagnitude: -3.64, spectralType: 'F7Ib', color: 0xfff8f0 },
  { name: '天枢', distance: 123.00, ra: 165.93, dec: 61.75, apparentMagnitude: 1.79, absoluteMagnitude: -1.08, spectralType: 'K0III', color: 0xffd4a8 },
  { name: '天璇', distance: 79.00, ra: 165.46, dec: 56.38, apparentMagnitude: 2.37, absoluteMagnitude: 0.41, spectralType: 'A1V', color: 0xccddff },
  { name: '天玑', distance: 84.00, ra: 178.46, dec: 53.69, apparentMagnitude: 2.44, absoluteMagnitude: 0.33, spectralType: 'A0Ve', color: 0xaaccff },
  { name: '天权', distance: 81.00, ra: 183.86, dec: 57.03, apparentMagnitude: 3.31, absoluteMagnitude: 1.33, spectralType: 'A3V', color: 0xccddff },
  { name: '玉衡', distance: 81.00, ra: 206.89, dec: 49.31, apparentMagnitude: 1.77, absoluteMagnitude: -0.22, spectralType: 'A0p', color: 0xaaccff },
  { name: '开阳', distance: 78.00, ra: 200.98, dec: 54.93, apparentMagnitude: 2.27, absoluteMagnitude: 0.33, spectralType: 'A2V', color: 0xccddff },
  { name: '摇光', distance: 101.00, ra: 206.89, dec: 49.31, apparentMagnitude: 1.86, absoluteMagnitude: -0.67, spectralType: 'B3V', color: 0x99aaff },
  { name: '河鼓二', distance: 16.73, ra: 297.70, dec: 8.87, apparentMagnitude: 0.76, absoluteMagnitude: 2.21, spectralType: 'A7V', color: 0xddeeff },
  // 100光年以上亮星
  { name: '角宿一', distance: 250.00, ra: 201.30, dec: -11.16, apparentMagnitude: 0.97, absoluteMagnitude: -3.55, spectralType: 'B1III-IV', color: 0x99aaff },
  { name: '心宿二', distance: 550.00, ra: 247.35, dec: -26.43, apparentMagnitude: 0.96, absoluteMagnitude: -5.28, spectralType: 'M1.5Iab', color: 0xff4422 },
  { name: '参宿四', distance: 700.00, ra: 88.79, dec: 7.41, apparentMagnitude: 0.42, absoluteMagnitude: -5.85, spectralType: 'M1-2Ia-ab', color: 0xff3311 },
  { name: '参宿七', distance: 860.00, ra: 78.63, dec: -8.20, apparentMagnitude: 0.13, absoluteMagnitude: -7.84, spectralType: 'B8Ia', color: 0xaabbff },
  { name: '天津四', distance: 2615.00, ra: 310.36, dec: 45.28, apparentMagnitude: 1.25, absoluteMagnitude: -8.38, spectralType: 'A2Ia', color: 0xccddff },
  { name: '老人星', distance: 310.00, ra: 95.99, dec: -52.70, apparentMagnitude: -0.74, absoluteMagnitude: -5.53, spectralType: 'A9II', color: 0xfff8f0 },
  { name: '水委一', distance: 139.00, ra: 24.43, dec: -57.24, apparentMagnitude: 0.46, absoluteMagnitude: -2.77, spectralType: 'B3Vpe', color: 0x99aaff },
  { name: '马腹一', distance: 390.00, ra: 210.96, dec: -60.37, apparentMagnitude: 0.61, absoluteMagnitude: -3.87, spectralType: 'B1III', color: 0x99aaff },
  { name: '十字架二', distance: 278.00, ra: 187.79, dec: -57.11, apparentMagnitude: 0.77, absoluteMagnitude: -3.02, spectralType: 'B0.5IV', color: 0x99aaff },
  { name: '十字架三', distance: 352.00, ra: 191.93, dec: -59.69, apparentMagnitude: 1.25, absoluteMagnitude: -3.59, spectralType: 'M3.5III', color: 0xff6633 },
  { name: '南十字座γ', distance: 88.00, ra: 187.47, dec: -57.11, apparentMagnitude: 1.59, absoluteMagnitude: 0.29, spectralType: 'M3.5III', color: 0xff8855 },
  { name: '弧矢七', distance: 430.00, ra: 111.02, dec: -29.30, apparentMagnitude: 1.50, absoluteMagnitude: -3.49, spectralType: 'F8Ia', color: 0xfff8f0 },
  { name: '井宿三', distance: 900.00, ra: 99.43, dec: 16.40, apparentMagnitude: 1.93, absoluteMagnitude: -4.14, spectralType: 'K0II-III', color: 0xffd4a8 },
  { name: '五车五', distance: 131.00, ra: 89.88, dec: 44.95, apparentMagnitude: 1.65, absoluteMagnitude: -1.37, spectralType: 'B7III', color: 0xaabbff },
  { name: '娄宿三', distance: 66.00, ra: 31.79, dec: 23.46, apparentMagnitude: 2.00, absoluteMagnitude: 0.48, spectralType: 'K2III', color: 0xffd4a8 },
  { name: '室宿一', distance: 196.00, ra: 346.19, dec: 15.21, apparentMagnitude: 2.49, absoluteMagnitude: -1.49, spectralType: 'B2IV', color: 0x99aaff },
  { name: '壁宿二', distance: 335.00, ra: 1.10, dec: 15.18, apparentMagnitude: 2.83, absoluteMagnitude: -2.31, spectralType: 'B0IV', color: 0x99aaff },
];

// ==================== 工具函数 ====================
export function getStarColorFromSpectralType(spectralType: string): number {
  const type = spectralType.charAt(0).toUpperCase();
  const colors: Record<string, number> = {
    'O': 0x9bb0ff, 'B': 0xaabfff, 'A': 0xcad7ff, 'F': 0xf8f7ff,
    'G': 0xfff4ea, 'K': 0xffd2a1, 'M': 0xffcc6f, 'L': 0xff8844,
    'T': 0xff6633, 'D': 0xffffff,
  };
  return colors[type] || 0xffffff;
}

export function equatorialToCartesian(ra: number, dec: number, distance: number): { x: number; y: number; z: number } {
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const distanceAU = distance * LIGHT_YEAR_TO_AU;
  // 坐标系：X 指向春分点，Y 轴向上（北天极），Z 轴完成右手系
  return {
    x: distanceAU * Math.cos(decRad) * Math.cos(raRad),
    y: distanceAU * Math.sin(decRad),              // Y 轴向上
    z: -distanceAU * Math.cos(decRad) * Math.sin(raRad),
  };
}
