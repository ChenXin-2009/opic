/**
 * Cesium 影像图层源定义
 * 所有免费、无需 API key 的地图源
 */

export interface ImagerySourceDef {
  id: string;
  name: string;
  description: string;
  /** 创建 Cesium ImageryProvider 的工厂函数（懒加载，避免 SSR 问题） */
  create: () => Promise<any>;
}

export const IMAGERY_SOURCES: ImagerySourceDef[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    description: '开源街道地图',
    create: async () => {
      const Cesium = await import('cesium');
      return new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/',
      });
    },
  },
  {
    id: 'esri-world-imagery',
    name: 'ESRI 卫星影像',
    description: '高分辨率卫星图像',
    create: async () => {
      const Cesium = await import('cesium');
      return new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 19,
      });
    },
  },
  {
    id: 'esri-world-street',
    name: 'ESRI 街道地图',
    description: '详细街道和地名',
    create: async () => {
      const Cesium = await import('cesium');
      return new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 19,
      });
    },
  },
  {
    id: 'esri-natgeo',
    name: 'ESRI 国家地理',
    description: '国家地理风格地图',
    create: async () => {
      const Cesium = await import('cesium');
      return new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 16,
      });
    },
  },
  {
    id: 'stamen-toner',
    name: 'Stamen Toner',
    description: '黑白高对比度地图',
    create: async () => {
      const Cesium = await import('cesium');
      return new Cesium.UrlTemplateImageryProvider({
        url: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png',
        maximumLevel: 20,
        credit: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.',
      });
    },
  },
  {
    id: 'stamen-terrain',
    name: 'Stamen Terrain',
    description: '地形晕渲地图',
    create: async () => {
      const Cesium = await import('cesium');
      return new Cesium.UrlTemplateImageryProvider({
        url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.jpg',
        maximumLevel: 18,
        credit: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.',
      });
    },
  },
  {
    id: 'carto-dark',
    name: 'CartoDB 暗色',
    description: '深色背景地图',
    create: async () => {
      const Cesium = await import('cesium');
      return new Cesium.UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        maximumLevel: 19,
        credit: '© OpenStreetMap contributors © CARTO',
      });
    },
  },
  {
    id: 'carto-light',
    name: 'CartoDB 亮色',
    description: '浅色简洁地图',
    create: async () => {
      const Cesium = await import('cesium');
      return new Cesium.UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        maximumLevel: 19,
        credit: '© OpenStreetMap contributors © CARTO',
      });
    },
  },
];
