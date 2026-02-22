/**
 * 卫星详情骨架屏组件
 * 
 * 在数据加载时显示，提供视觉反馈
 */
export default function SatelliteDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 标题骨架 */}
      <div className="space-y-2">
        <div className="h-8 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
      </div>

      {/* 信息区块骨架 */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-3">
          {/* 区块标题 */}
          <div className="h-5 bg-white/10 rounded w-1/3" />
          
          {/* 数据行 */}
          <div className="space-y-2 pl-4">
            <div className="flex justify-between">
              <div className="h-4 bg-white/5 rounded w-1/4" />
              <div className="h-4 bg-white/5 rounded w-1/3" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-white/5 rounded w-1/3" />
              <div className="h-4 bg-white/5 rounded w-1/4" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-white/5 rounded w-1/5" />
              <div className="h-4 bg-white/5 rounded w-2/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
