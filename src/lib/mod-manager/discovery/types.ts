/**
 * MOD 发现和动态加载类型定义
 */

/**
 * MOD 包元数据（用于配置文件加载）
 */
export interface ModPackageMetadata {
  id: string;
  name: string;
  version: string;
  path: string;
  enabled: boolean;
}

/**
 * MOD 发现配置
 */
export interface ModDiscoveryConfig {
  modsDirectory: string;
  autoLoad: boolean;
  enabledMods: string[];
}

/**
 * MOD 包文件结构（用于ZIP包加载）
 */
export interface ModPackageFile {
  /** 包的唯一标识符 */
  id: string;
  /** 包的显示名称 */
  name: string;
  /** 语义化版本号 */
  version: string;
  /** 包的描述 */
  description?: string;
  /** 作者信息 */
  author?: string;
  /** 许可证 */
  license?: string;
  /** 主页URL */
  homepage?: string;
  /** 依赖的其他MOD */
  dependencies?: Record<string, string>;
  /** 需要的API版本 */
  apiVersion: string;
  /** 数字签名（用于验证完整性） */
  signature?: string;
  /** 包的哈希值 */
  hash?: string;
  /** 包大小（字节） */
  size?: number;
  /** 创建时间 */
  createdAt?: string;
}

/**
 * MOD 包验证结果
 */
export interface PackageValidationResult {
  /** 是否验证通过 */
  valid: boolean;
  /** 错误信息列表 */
  errors: string[];
  /** 警告信息列表 */
  warnings: string[];
}

/**
 * MOD 加载选项
 */
export interface ModLoadOptions {
  /** 是否验证签名 */
  verifySignature?: boolean;
  /** 是否检查版本兼容性 */
  checkVersion?: boolean;
  /** 是否检查依赖 */
  checkDependencies?: boolean;
  /** 最大包大小（字节），默认10MB */
  maxPackageSize?: number;
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * MOD 包下载进度
 */
export interface DownloadProgress {
  /** 已下载字节数 */
  loaded: number;
  /** 总字节数 */
  total: number;
  /** 下载百分比 (0-100) */
  percentage: number;
}

