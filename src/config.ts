/**
 * ecommerce-analyst-plugin — 插件配置（dsh Config）
 *
 * 配置通过 dsh Config 注入，凭证类信息建议使用环境变量：
 *   DSH_ECOM_TOKEN — 平台访问凭证
 */
import z from '@deepseek-ai/schemastery'

export interface Config {
  platform: {
    /** mock=示例数据模式（默认）；rest=对接电商平台 REST API */
    name: string
    /** REST 模式必填：平台 API 网关地址 */
    baseUrl: string
    /** 平台应用凭证 */
    appKey: string
    appSecret: string
  }
  storage: {
    /** 本地持久化文件路径（相对仓库根或绝对路径） */
    file: string
    /** 空库时自动写入示例数据 */
    seedOnEmpty: boolean
  }
  inventory: {
    /** 低库存默认阈值 */
    lowStockThreshold: number
  }
}

/** 插件运行时配置 schema（经 schemastery 校验后传入 apply） */
export const Config = z.object({
  platform: z.object({
    name: z.string().default('mock'),
    baseUrl: z.string().default(''),
    appKey: z.string().default(''),
    appSecret: z.string().default(''),
  }),
  storage: z.object({
    file: z
      .string()
      .default('./ecommerce-analyst-plugin/data/store.json'),
    seedOnEmpty: z.boolean().default(true),
  }),
  inventory: z.object({
    lowStockThreshold: z.number().default(10),
  }),
})

export const defaultConfig: Config = {
  platform: { name: 'mock', baseUrl: '', appKey: '', appSecret: '' },
  storage: { file: './ecommerce-analyst-plugin/data/store.json', seedOnEmpty: true },
  inventory: { lowStockThreshold: 10 },
}
