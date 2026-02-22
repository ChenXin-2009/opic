/**
 * 测试脚本: 检查卫星Store中的数据结构
 * 
 * 用途: 验证Store中保存的velocity字段是否为Vector3对象
 */

import { useSatelliteStore } from '../src/lib/store/useSatelliteStore';

// 模拟检查Store数据
function checkStoreData() {
  const store = useSatelliteStore.getState();
  const satellites = store.satellites;
  
  console.log('=== 卫星Store数据检查 ===');
  console.log(`总卫星数: ${satellites.size}`);
  
  // 检查前5个卫星的数据结构
  let count = 0;
  satellites.forEach((state, noradId) => {
    if (count < 5) {
      console.log(`\n卫星 ${noradId} (${state.name}):`);
      console.log(`  position类型: ${typeof state.position}, 是否有length方法: ${typeof state.position?.length === 'function'}`);
      console.log(`  velocity类型: ${typeof state.velocity}, 是否有length方法: ${typeof state.velocity?.length === 'function'}`);
      console.log(`  altitude: ${state.altitude}`);
      
      // 尝试调用length()
      try {
        if (state.velocity && typeof state.velocity === 'object' && 'length' in state.velocity) {
          const velocityMag = (state.velocity as any).length();
          console.log(`  velocity.length(): ${velocityMag}`);
        }
      } catch (e) {
        console.error(`  velocity.length()调用失败:`, e);
      }
      
      count++;
    }
  });
}

// 导出供浏览器控制台使用
if (typeof window !== 'undefined') {
  (window as any).checkStoreData = checkStoreData;
  console.log('已加载测试函数: window.checkStoreData()');
}

export { checkStoreData };
