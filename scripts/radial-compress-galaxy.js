const sharp = require('sharp');
const fs = require('fs');

const inputFile = 'public/textures/planets/MilkyWayTop_Gaia_q40.webp';
const outputDir = 'public/textures/planets/galaxy_layers';

// 太阳系在图片中的位置（像素）
const originalSize = 2100;
const sunXOriginal = 1050;
const sunYOriginal = 1480;

/**
 * 生成多层 ROI 压缩图片
 * 每层是一个独立的 WebP 文件，应用中可以叠加显示
 */
async function compressGalaxyImage() {
  console.log('开始生成多层 ROI 压缩图片...\n');
  
  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const image = sharp(inputFile);
  const metadata = await image.metadata();
  const { width, height } = metadata;
  
  const scale = width / originalSize;
  const sunX = Math.round(sunXOriginal * scale);
  const sunY = Math.round(sunYOriginal * scale);
  
  console.log(`原始图片尺寸: ${width}x${height}`);
  console.log(`太阳系位置: (${sunX}, ${sunY})\n`);
  
  // 获取原始图片数据
  const { data: originalData, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  // 定义层级（从内到外）
  const layers = [
    { name: 'core', radius: 1800, quality: 60, desc: '核心层' },
    { name: 'mid', radius: 3500, quality: 35, desc: '中间层' },
    { name: 'outer', radius: 6000, quality: 15, desc: '外围层' },
    { name: 'edge', radius: Infinity, quality: 8, desc: '边缘层' }
  ];
  
  console.log('生成层级:');
  layers.forEach((layer, i) => {
    console.log(`  ${layer.desc}: 半径 ${layer.radius === Infinity ? '∞' : layer.radius}px, 质量 ${layer.quality}`);
  });
  console.log();
  
  let totalSize = 0;
  
  // 为每一层生成独立的图片
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const prevRadius = i > 0 ? layers[i - 1].radius : 0;
    
    console.log(`生成 ${layer.desc} (${layer.name})...`);
    
    // 创建该层的 alpha 遮罩
    const layerData = Buffer.alloc(width * height * 4); // RGBA
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - sunX;
        const dy = y - sunY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const srcIdx = (y * width + x) * info.channels;
        const dstIdx = (y * width + x) * 4;
        
        // 复制 RGB
        layerData[dstIdx] = originalData[srcIdx];
        layerData[dstIdx + 1] = originalData[srcIdx + 1];
        layerData[dstIdx + 2] = originalData[srcIdx + 2];
        
        // 计算 alpha
        let alpha = 0;
        if (dist > prevRadius && dist <= layer.radius) {
          // 在当前层的范围内
          if (dist <= prevRadius + 300) {
            // 内边缘渐变
            const t = (dist - prevRadius) / 300;
            alpha = Math.round(255 * t);
          } else if (layer.radius !== Infinity && dist >= layer.radius - 300) {
            // 外边缘渐变
            const t = (layer.radius - dist) / 300;
            alpha = Math.round(255 * t);
          } else {
            alpha = 255;
          }
        }
        
        layerData[dstIdx + 3] = alpha;
      }
    }
    
    // 保存该层
    const outputFile = `${outputDir}/${layer.name}.webp`;
    await sharp(layerData, {
      raw: {
        width: width,
        height: height,
        channels: 4
      }
    })
    .webp({ quality: layer.quality, effort: 6 })
    .toFile(outputFile);
    
    const stats = fs.statSync(outputFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    totalSize += stats.size;
    console.log(`  ✓ ${outputFile} - ${sizeMB} MB`);
  }
  
  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
  
  console.log(`\n✓ 所有层级生成完成！`);
  console.log(`输出目录: ${outputDir}`);
  console.log(`总大小: ${totalMB} MB`);
  console.log(`\n使用方法: 在 Three.js 中按顺序叠加这些纹理，从 edge -> outer -> mid -> core`);
}

compressGalaxyImage().catch(console.error);
