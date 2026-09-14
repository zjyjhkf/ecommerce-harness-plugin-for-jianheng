/**
 * ecommerce-analyst-plugin — 插件配置（dsh Config）
 *
 * 配置通过 dsh Config 注入，凭证类信息建议使用环境变量：
 *   DSH_ECOM_TOKEN — 平台访问凭证
 */
import z from '@deepseek-ai/schemastery'

export interface Config {
  /**
   * 会话激活模式（v0.4.0 起）：
   *  - silent（默认）：不注册任何业务工具、不注入任何系统提示段落——对 dsh 会话零影响。
   *    插件仅保留「技能目录」（显式调用入口）与侧边栏/工作台 API（UI，不进模型上下文）。
   *  - active：全量注册（商品/订单/统计/库存等工具 + 今日待办与规则问答注入）。
   * 环境变量 ECOM_ANALYST_ACTIVATION=active 与配置 active 等效（服务器 pm2 侧免改配置切换）。
   */
  activation: 'silent' | 'active'
  platform: {
    /** mock=本地空库模式（默认，数据靠导入）；rest=对接电商平台 REST API */
    name: string
    /** REST 模式必填：平台 API 网关地址 */
    baseUrl: string
    /** 平台应用凭证 */
    appKey: string
    appSecret: string
  }
  storage: {
    /** 本地持久化文件路径（相对路径按插件目录解析；也可填绝对路径） */
    file: string
    /** 是否加载持久化文件（v0.4.0 起不再有任何示例种子；false=每次从适配器重新拉取） */
    seedOnEmpty: boolean
  }
  inventory: {
    /** 低库存默认阈值 */
    lowStockThreshold: number
  }
  /** 通用文件交换(上传→AI 处理→下载):inbox=收件箱(上传落点),outbox=结果箱(下载来源) */
  files: {
    /** 上传文件的收件目录(相对路径锚定插件根;部署时可指到共享工作区 /srv/dsh-share/inbox) */
    inboxDir: string
    /** 处理结果目录(相对路径锚定插件根;部署时可指到共享工作区 /srv/dsh-share/outbox) */
    outboxDir: string
    /** 单文件上传大小上限(字节) */
    maxBytes: number
  }
}

/** 插件运行时配置 schema（经 schemastery 校验后传入 apply） */
export const Config = z.object({
  activation: z.union([z.const('silent'), z.const('active')]).default('silent'),
  platform: z.object({
    name: z.string().default('mock'),
    baseUrl: z.string().default(''),
    appKey: z.string().default(''),
    appSecret: z.string().default(''),
  }),
  storage: z.object({
    // file：持久化路径；相对路径按插件自身目录解析（与 dsh 启动目录无关），绝对路径原样使用
    file: z.string().default('./data/store.json'),
    seedOnEmpty: z.boolean().default(true),
  }),
  inventory: z.object({
    lowStockThreshold: z.number().default(10),
  }),
  files: z.object({
    inboxDir: z.string().default('./data/files/inbox'),
    outboxDir: z.string().default('./data/files/outbox'),
    maxBytes: z.number().default(200 * 1024 * 1024),
  }),
})

export const defaultConfig: Config = {
  activation: 'silent',
  platform: { name: 'mock', baseUrl: '', appKey: '', appSecret: '' },
  storage: { file: './data/store.json', seedOnEmpty: true },
  inventory: { lowStockThreshold: 10 },
  files: {
    inboxDir: './data/files/inbox',
    outboxDir: './data/files/outbox',
    maxBytes: 200 * 1024 * 1024,
  },
}
