/**
 * 检查卫星名称格式
 * 用于改进国家推断逻辑
 */

async function checkSatelliteNames() {
  try {
    // 获取活跃卫星数据
    const response = await fetch('http://localhost:3000/api/satellites?category=active');
    const data = await response.json();
    
    if (data.satellites && data.satellites.length > 0) {
      // 显示前20个卫星的名称
      const samples = data.satellites.slice(0, 20);
      
      samples.forEach((sat: any) => {
        const name = sat.name;
        const noradId = sat.noradId;
        
        // 尝试推断国家
        let country = 'Unknown';
        const nameLower = name.toLowerCase();
        
        if (nameLower.includes('usa') || nameLower.includes('noaa') || 
            nameLower.includes('goes') || nameLower.includes('gps') ||
            nameLower.includes('navstar') || nameLower.includes('starlink')) {
          country = 'US';
        } else if (nameLower.includes('china') || nameLower.includes('tiangong') ||
                   nameLower.includes('beidou') || nameLower.includes('fengyun')) {
          country = 'China';
        } else if (nameLower.includes('cosmos') || nameLower.includes('glonass') ||
                   nameLower.includes('molniya')) {
          country = 'Russia';
        }
        
        console.log(`${noradId}: ${name} -> ${country}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSatelliteNames();
