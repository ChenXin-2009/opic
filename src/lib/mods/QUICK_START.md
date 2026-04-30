# MOD 快速开始 🚀

## 添加新MOD（3步）

```bash
# 1️⃣ 创建文件夹
mkdir src/lib/mods/my-mod

# 2️⃣ 创建文件（见下方模板）

# 3️⃣ 生成并重启
npm run generate-mods && npm run dev
```

## 最小MOD模板

### manifest.ts
```typescript
import type { ModManifest } from '@/lib/mod-manager/types';

export const myModManifest: ModManifest = {
  id: 'my-mod',
  name: 'My Mod',
  nameZh: '我的模组',
  version: '1.0.0',
  description: 'Description',
  author: 'Your Name',
  icon: '🎯',
  defaultEnabled: false,
};
```

### index.ts
```typescript
import type { ModLifecycleHooks } from '@/lib/mod-manager/types';
import { myModManifest } from './manifest';

export const myModHooks: ModLifecycleHooks = {
  onEnable: async (context) => {
    context.logger.info('启用');
  },
};

export function getMyModMod() {
  return { manifest: myModManifest, hooks: myModHooks };
}
```

## 常用命令

```bash
# 查看所有MOD
npm run generate-mods

# 开发模式
npm run dev

# 构建（自动生成注册表）
npm run build
```

## 删除MOD

```bash
rm -rf src/lib/mods/my-mod
npm run generate-mods
```

## 📚 完整文档

- [详细文档](../../../docs/MOD_AUTO_DISCOVERY.md)
- [开发指南](../../../docs/MOD_DEVELOPMENT_GUIDE.md)
