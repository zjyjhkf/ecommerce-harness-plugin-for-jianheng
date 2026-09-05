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
import type { Context } from '@deepseek-ai/cordis'
import { defaultConfig, type Config as ConfigShape } from './config.ts'
import { EcommerceStore, todayStr } from './store.ts'
import { createAdapter } from './platform/adapter.ts'
import { registerProductTools } from './tools/products.ts'
import { registerOrderTools } from './tools/orders.ts'
import { registerStatsTools } from './tools/stats.ts'
import { registerInventoryTools } from './tools/inventory.ts'
import { registerBackupTools } from './tools/backup.ts'
import { injectApiBase, registerShopApi } from './shop-api.ts'
import { registerExcelTools } from './tools/excel.ts'
import { registerQaTool } from './tools/qa.ts'
import { registerExportCsvTool } from './tools/export-csv.ts'
import { registerModeTools } from './tools/mode.ts'
import { registerCompareTools } from './tools/compare.ts'
import { registerPluginSkills } from './skills.ts'
import { qaRuleDescription } from './qa-engine.ts'

export const name = 'ecommerce-analyst'
export const inject = ['systemPrompt', 'webServer', 'tools']

/**
 * 插件主体。cordis 会等待 inject 声明的服务全部就绪后再调用 apply，
 * 因此 apply 内可安全使用 ctx.tools / ctx.webServer / ctx.systemPrompt。
 * apply 支持 async：数据层初始化完成后才注册工具与路由。
 */
export async function apply(ctx: Context, config: Partial<ConfigShape> = {}): Promise<void> {
  const resolved: ConfigShape = {
    platform: { ...defaultConfig.platform, ...config.platform },
    storage: { ...defaultConfig.storage, ...config.storage },
    inventory: { ...defaultConfig.inventory, ...config.inventory },
  }

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
  if (store.sourceMode === 'mock') {
    console.log('[ecommerce-analyst] 已启动：示例数据模式（配置电商平台 API 可切换真实数据）')
  } else {
    console.log(`[ecommerce-analyst] 已启动：对接平台 API（${adapter.name}）`)
  }

  // 工具层：四个业务模块 + 备份（ctx.tools 已由 inject 声明）
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
    const disposeApi = registerShopApi(webServer, store, ctx)
    ctx.effect(() => disposeApi, 'ecommerce: shop api routes')
    // 把 API base 注入 index.html（客户端无需猜测端口）
    const disposeBase = injectApiBase(webServer)
    if (disposeBase !== undefined) {
      ctx.effect(() => disposeBase, 'ecommerce: api base injection')
    }
  }

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
