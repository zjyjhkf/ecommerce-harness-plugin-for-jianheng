/**
 * ecommerce-analyst-plugin — 电商商单智能体插件入口
 *
 * 功能：
 *  - 商品管理（product_*）：查询/筛选/增删改查/库存调整/上下架
 *  - 订单处理（order_*）：查询/统计/状态流转/发货/退款
 *  - 销售数据分析（stats_*）：总览/趋势/TOP 排行/类目分布
 *  - 库存预警（inventory_*）：低库存清单/补货建议
 *  - 数据备份（ecommerce_export_backup / ecommerce_import_backup）
 *  - 桌面端侧边栏（client 半）：/ecommerce-api 只读 JSON 接口，
 *    供「店铺工作台」面板复用 Store 统计口径（与工具结果一致）
 *
 * 加载方式（在 dsh 仓库根目录）：
 *   pnpm dsh web --patch ./ecommerce-analyst-plugin/cordis.yml
 *
 * 本工作台通过 WorkBuddy 资料库能力（library skill）搭建、存储和部署
 */
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import type { Context } from '@deepseek-ai/cordis'
import { defaultConfig, type Config as ConfigShape } from './config.ts'
import { resolveStoreFile } from './paths.ts'
import { EcommerceStore, todayStr } from './store.ts'
import { createAdapter } from './platform/adapter.ts'
import { registerProductTools } from './tools/products.ts'
import { registerOrderTools } from './tools/orders.ts'
import { registerStatsTools } from './tools/stats.ts'
import { registerInventoryTools } from './tools/inventory.ts'
import { registerBackupTools } from './tools/backup.ts'
import { injectApiBase, registerShopApi } from './shop-api.ts'
import { resolveFilesDirs } from './files.ts'
import { registerExcelTools } from './tools/excel.ts'
import { registerQaTool } from './tools/qa.ts'
import { registerExportCsvTool } from './tools/export-csv.ts'
import { registerModeTools } from './tools/mode.ts'
import { registerCompareTools } from './tools/compare.ts'
import { registerDataReportTools } from './tools/data-report.ts'
import { registerPluginSkills } from './skills.ts'
import { qaRuleDescription } from './qa-engine.ts'

export const name = 'ecommerce-analyst'
export const inject = ['systemPrompt', 'webServer', 'tools']

/**
 * 插件主体。cordis 会等待 inject 声明的服务全部就绪后再调用 apply，
 * 因此 apply 内可安全使用 ctx.tools / ctx.webServer / ctx.systemPrompt。
 * apply 支持 async：数据层初始化完成后才注册工具与路由。
 *
 * v0.4.0 激活门控（默认 silent）：
 *  - silent：不注册业务工具、不注入系统提示——模型上下文里不存在本插件的任何痕迹；
 *            仅保留技能目录（/name 显式调用入口）与工作台 API/侧边栏（纯 UI）。
 *  - active：全量注册（config.activation=active 或环境变量 ECOM_ANALYST_ACTIVATION=active）。
 */
export async function apply(ctx: Context, config: Partial<ConfigShape> = {}): Promise<void> {
  const envActivation =
    process.env.ECOM_ANALYST_ACTIVATION === 'active'
      ? ('active' as const)
      : process.env.ECOM_ANALYST_ACTIVATION === 'silent'
        ? ('silent' as const)
        : undefined
  const resolved: ConfigShape = {
    activation: envActivation ?? config.activation ?? defaultConfig.activation,
    platform: { ...defaultConfig.platform, ...config.platform },
    storage: { ...defaultConfig.storage, ...config.storage },
    inventory: { ...defaultConfig.inventory, ...config.inventory },
    files: { ...defaultConfig.files, ...config.files },
  }

  // 持久化路径：相对路径锚定到插件目录（与 dsh 启动 CWD 无关），并在此刻探测可写性。
  // 不可写（Windows 受保护目录 / OneDrive 同步目录等）→ 明确告警并回退到系统临时目录，
  // 保证「别人装完也能跑」，而不是导入数据时才静默 EPERM 崩溃。
  resolved.storage.file = ensureWritableStoreFile(resolved.storage.file)

  // 数据层：按配置创建适配器（mock 示例模式 / rest 真实平台）
  const adapter = await createAdapter({
    ...resolved.platform,
    name: resolved.platform.name === 'rest' ? 'rest' : 'mock',
  })
  const store = new EcommerceStore(adapter, {
    file: resolved.storage.file,
    seedOnEmpty: resolved.storage.seedOnEmpty,
    lowStockThreshold: resolved.inventory.lowStockThreshold,
  })
  await store.init()
  if (resolved.activation === 'active') {
    console.log(
      store.sourceMode === 'mock'
        ? '[ecommerce-analyst] 已启动：active 模式，本地空库（数据靠导入）；工具与提示注入已全量注册'
        : `[ecommerce-analyst] 已启动：active 模式，对接平台 API（${adapter.name}）`,
    )
  } else {
    console.log(
      '[ecommerce-analyst] 已启动：silent 模式——对会话零影响（未注册工具/未注入提示）。' +
        '需要电商工作台能力时：profile 补丁层设 config.activation=active，或环境变量 ECOM_ANALYST_ACTIVATION=active',
    )
  }

  // 工具层：仅在 active 下注册（silent = 模型上下文里看不到任何本插件工具）
  if (resolved.activation === 'active') {
    registerProductTools(ctx, store)
    registerOrderTools(ctx, store)
    registerStatsTools(ctx, store)
    registerInventoryTools(ctx, store)
    registerBackupTools(ctx, store)
    registerExcelTools(ctx, store)
    registerQaTool(ctx, store)
    registerExportCsvTool(ctx, store)
    registerModeTools(ctx, store)
    registerCompareTools(ctx, store)
    registerDataReportTools(ctx, store)
  }

  // 技能层：把仓库 skills/*/SKILL.md 注册进 dsh 技能目录（/name 可调用 + 模型可自动调用）。
  // ctx.skills 为可选服务，缺失（老版本 dsh）时跳过，不影响插件其余功能。
  const disposeSkills = registerPluginSkills(ctx)
  if (disposeSkills === undefined) {
    console.warn('[ecommerce-analyst] skills 服务不可用，跳过技能目录注册（/name 调用不可用）')
  } else {
    ctx.effect(() => disposeSkills, 'ecommerce: skills provider')
  }

  // 侧边栏数据 API：只读 JSON，复用同一 Store（与工具口径一致）
  // webServer 服务随 inject 注入；极端时序下（尚未提供）做一次短暂等待再注册
  let webServer = ctx.get('webServer')
  if (webServer === undefined) {
    await new Promise((r) => setTimeout(r, 250))
    webServer = ctx.get('webServer')
  }
  if (webServer === undefined) {
    console.warn('[ecommerce-analyst] webServer 服务不可用，跳过店铺工作台 API 注册')
  } else {
    const disposeApi = registerShopApi(webServer, store, ctx, resolveFilesDirs(resolved.files))
    ctx.effect(() => disposeApi, 'ecommerce: shop api routes')
    // 把 API base 注入 index.html（客户端无需猜测端口）
    const disposeBase = injectApiBase(webServer)
    if (disposeBase !== undefined) {
      ctx.effect(() => disposeBase, 'ecommerce: api base injection')
    }
  }

  // 系统提示注入：同样仅 active 下挂载（silent = 不往任何会话塞「今日待办」，杜绝幻觉源头）
  if (resolved.activation === 'active') {
    // 「今天要处理」：注入动态系统提示，模型开聊即知今日待办
    ctx.systemPrompt.section({
      name: 'ecommerce:today',
      order: -95,
      text: () => todayPrompt(store),
    })
    // 规则问答说明：高频问题命中即直答，未命中再走工具（对齐视频 rule-based Q&A）
    ctx.systemPrompt.section({
      name: 'ecommerce:qa-rules',
      order: -94,
      text: () => qaRuleDescription(),
    })
    // 数据来源纪律：把「面板数字只能来自导入文件、未导入不许编」写进系统提示，
    // 并指定 ecommerce_data_report 为唯一取数入口（避免模型自己去翻 store.json 或凭记忆作答）
    ctx.systemPrompt.section({
      name: 'ecommerce:data-source',
      order: -93,
      text: () => dataSourcePrompt(store),
    })
  }
}

/**
 * 把配置的持久化路径解析为绝对路径并保证可写：
 *  - 相对路径锚定到插件目录（见 paths.ts），与 dsh 启动 CWD 无关；
 *  - 提前 mkdir 探测可写性，不可写则回退系统临时目录并 console.warn（启动即告警，
 *    而非导入数据时才 EPERM 崩溃）。返回最终使用的绝对路径。
 */
function ensureWritableStoreFile(raw: string): string {
  const target = resolveStoreFile(raw)
  try {
    mkdirSync(dirname(target), { recursive: true })
    return target
  } catch (err) {
    const fallback = join(tmpdir(), 'ecommerce-analyst-plugin', 'data', 'store.json')
    console.warn(
      `[ecommerce-analyst] 持久化目录不可写，回退系统临时目录：${target} → ${fallback}（`,
      err instanceof Error ? err.message : String(err),
      ')',
    )
    try {
      mkdirSync(dirname(fallback), { recursive: true })
      return fallback
    } catch (err2) {
      console.error(
        '[ecommerce-analyst] 临时目录亦不可写，数据将仅存内存（重启丢失）：',
        err2 instanceof Error ? err2.message : String(err2),
      )
      return target
    }
  }
}

/** 动态生成「今天要处理」提示（铁律 5：逾期/待办置顶，昨天没做完的自动顺延） */
function todayPrompt(store: EcommerceStore): string {
  const { shipments, overdues, lowStockCount } = store.todayActions()
  const date = todayStr()
  const parts: string[] = [`今天是 ${date}，电商店铺今日要处理：`]
  if (overdues.length > 0) {
    const list = overdues
      .map((o) => `${o.order_id}（${o.buyer}，¥${o.amount.toFixed(2)}）`)
      .join('、')
    parts.push(`- ⚠️ 逾期未处理订单 ${overdues.length} 笔：${list}（建议尽快跟进）`)
  }
  if (shipments.length > 0) {
    parts.push(`- 📦 待发货订单 ${shipments.length} 笔（可用 order_list 查询 status=paid 后逐一发货）`)
  }
  if (lowStockCount > 0) {
    parts.push(`- ⚠️ 低库存商品 ${lowStockCount} 件（可用 inventory_low_stock 查看）`)
  }
  if (parts.length === 1) {
    parts.push('- 今日无待办，店铺状态正常。')
  }
  parts.push(
    '用户询问店铺情况时，优先汇报以上待办；处理动作（发货/改库存/退款）执行前向用户确认。',
  )
  return parts.join('\n')
}
/**
 * 「数据来源纪律」系统提示（铁律：面板上的一切数字只能来自导入的文件）。
 * 与数据中台面板同源同口径；未导入的周期一律如实说明，禁止用 0/示例/推测值填充。
 * 取数唯一入口 = ecommerce_data_report（不要自己去解析 data/store.json，也不要凭记忆作答）。
 */
function dataSourcePrompt(store: EcommerceStore): string {
  const history = store.getMonthlyHistory()
  const weekly = store.getWeeklyReport()
  const parts: string[] = ['【经营数据来源纪律】']
  parts.push(
    '「电商数据中台」面板上显示的每一个数字，都只来自用户导入的复盘 Excel（利润表 + 商品排名导出），' +
      '没有任何内置示例数据。商品/订单库是另一套域，未导入表格时为空。',
  )
  if (history.length === 0 && weekly === null) {
    parts.push('当前**尚未导入任何复盘数据**：面板各视图为空白占位。此时任何金额/排行都必须回答「未导入」，严禁给出具体数字或示例值。')
  } else {
    parts.push(
      `当前已导入：月度 ${history.map((m) => m.month).join('、') || '（无）'}` +
        `；周度 ${weekly ? weekly.period : '（无）'}。未列出的周期即「未导入」，不得给出其数字。`,
    )
  }
  parts.push(
    '回答任何销售额/退款/毛利/排行/门店/某月数据的问题前，**先调用 ecommerce_data_report** 取数（它返回的与面板同源同口径）；' +
      '不要自己去解析 data/store.json，也不要依据记忆或估算作答。',
  )
  parts.push('工具的返回里会带「数据来源」行与已导入月份清单；若该工具说某月未导入，就照实转达，不得改用 0 或推测值。')
  return parts.join('\n')
}
