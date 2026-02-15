const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = 'public/textures/planets/The_best_Milky_Way_map_by_Gaia_labelled.png';
const outputDir = 'public/textures/planets';

// Quality levels to test
const qualities = [40, 50, 60, 70, 80];

async function convertToWebP() {
  console.log('Starting conversion...\n');
  
  for (const quality of qualities) {
    const outputFile = path.join(outputDir, `MilkyWayTop_Gaia_q${quality}.webp`);
    
    console.log(`Converting with quality ${quality}...`);
    
    await sharp(inputFile)
      .webp({ quality })
      .toFile(outputFile);
    
    const stats = fs.statSync(outputFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✓ Created: ${path.basename(outputFile)} (${sizeMB} MB)\n`);
  }
  
  console.log('Conversion complete!');
  console.log('\nGenerated files:');
  qualities.forEach(q => {
    const file = `MilkyWayTop_Gaia_q${q}.webp`;
    const filePath = path.join(outputDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  - ${file}: ${sizeMB} MB`);
    }
  });
}

convertToWebP().catch(console.error);
