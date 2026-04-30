/**
 * SettingsWindow.tsx - macOS 风格设置窗口
 * 
 * 将原有的 SettingsMenu 内容迁移到窗口中
 */

'use client';

import { useSolarSystemStore } from '@/lib/state';
import { useEarthControlStore } from '@/lib/state/earthControlStore';
import { useTranslation } from '@/hooks/useTranslation';

interface SettingsWindowProps {
  cameraController?: any;
}

export function SettingsWindow({ cameraController }: SettingsWindowProps) {
  const { t, lang } = useTranslation();
  const setLang = useSolarSystemStore((state) => state.setLang);
  
  // 从全局状态获取地球控制
  const {
    earthLockEnabled,
    setEarthLockEnabled,
  } = useEarthControlStore();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 语言设置 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
          {t('settings.language')}
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setLang('zh')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
              lang === 'zh'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            中文
          </button>
          <button
            onClick={() => setLang('en')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
              lang === 'en'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="h-px bg-white/10" />

      {/* 地球控制设置 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
          {lang === 'zh' ? '地球控制' : 'Earth Control'}
        </h3>
        
        {/* 地球锁定 */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-xl">🔒</div>
            <div>
              <div className="text-sm font-medium text-white">
                {lang === 'zh' ? '地球锁定' : 'Earth Lock'}
              </div>
              <div className="text-xs text-white/60">
                {lang === 'zh' ? '锁定地球自转' : 'Lock Earth rotation'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setEarthLockEnabled(!earthLockEnabled)}
            className={`relative w-14 h-8 rounded-full transition-all ${
              earthLockEnabled ? 'bg-blue-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                earthLockEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="h-px bg-white/10" />

      {/* 关于信息 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
          {t('common.about')}
        </h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-white/60">{t('common.version')}</span>
            <span className="font-mono font-semibold text-white">v4.6.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60">{t('common.author')}</span>
            <span className="font-mono font-semibold text-white">OPIC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
