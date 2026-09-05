/**
 * ecommerce-analyst-plugin — 数据仓库（Store）
 *
 * 职责：
 * 1. 持有商品/订单领域数据（内存态）
 * 2. 从平台适配器加载初始数据；写操作优先平台，示例模式走本地
 * 3. 提供 CRUD、统计、库存预警等业务操作
 * 4. 本地 JSON 持久化（写操作落盘，跨会话保留）
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import {
  fromCents,
  isRevenueOrder,
  ORDER_TRANSITIONS,
  toCents,
  type CategoryStat,
  type MonthlyReport,
  type DateRange,
  type LowStockItem,
  type Order,
  type OrderFilter,
  type OrderMeta,
  type OrderStatus,
  type Page,
  type Product,
  type ProductFilter,
  type RestockSuggestion,
  type StatsOverview,
  type TopProduct,
  type TrendPoint,
  type WeeklyReport,
} from './types.ts'
import { mergeWeekly } from './weekly-report.ts'
import { mergeMonthly, type MonthlyParseResult } from './monthly-report.ts'
import { filterOrders, filterProducts } from './platform/mock.ts'
import type { PlatformAdapter } from './platform/adapter.ts'

export interface StoreConfig {
  /** 本地持久化文件路径 */
  file: string
  /** 空库时是否用适配器数据初始化 */
  seedOnEmpty: boolean
  /** 低库存默认阈值 */
  lowStockThreshold: number
}

const todayStr = (): string => new Date().toISOString().slice(0, 10)

export class EcommerceStore {
  readonly adapter: PlatformAdapter
  /** 数据源模式：mock=示例模式（只读平台+本地演示），rest=真实平台 */
  readonly sourceMode: 'mock' | 'rest'

  private products: Product[] = []
  private orders: Order[] = []
  private cfg: StoreConfig
  /** 数据来源模式：demo=演示数据（种子）/ imported=导入数据 / rest=平台 API */
  dataMode: 'demo' | 'imported' | 'rest' = 'demo'
  /** 商品/订单各自的数据来源（demo=演示种子 / imported=用户导入或派生）：用于导入时
   *  判定「另一张表是否仍是演示数据」，从而决定是否清空/派生，避免演示数据残留。 */
  private productsSource: 'demo' | 'imported' = 'demo'
  private ordersSource: 'demo' | 'imported' = 'demo'
  /** 最近一次导入的数据快照（深拷贝），供「切换回导入数据」使用 */
  private lastImported: { products: Product[]; orders: Order[] } | null = null
  /** 月度复盘（7月月度复盘.xlsx 导入）：30/60 天「月复盘」视图数据源 */
  private monthlyReport: MonthlyReport | null = null
  /** 周复盘（「周数据」三份「商品排名导出」导入，按展示形式合并）：7 天「周复盘」视图数据源 */
  private weeklyReport: WeeklyReport | null = null
  /** 上一期月度复盘（导入新周期时归档）：供「数据对比」用（上期 vs 本期）。随持久化保存/恢复，
   *  插件重启或重载后归档仍在，保证「两次导入之间进程被重建」也能继续对比。 */
  private previousMonthlyReport: MonthlyReport | null = null
  /** 上一期周复盘（导入新周期时归档）：同上 */
  private previousWeeklyReport: WeeklyReport | null = null
  /** 报表数据单调递增版本号：任一报表（月/周）导入或替换即 +1，供前端判断「数据是否真正变化」，
   *  避免仅靠行数/周期这类粗粒度指纹漏掉「数值变化但行数相同」的插入更新。 */
  private reportRevision = 0

  constructor(adapter: PlatformAdapter, cfg: StoreConfig) {
    this.adapter = adapter
    this.sourceMode = adapter.name === 'mock' ? 'mock' : 'rest'
    this.cfg = cfg
  }

  /** 初始化：加载持久化数据；为空时从适配器种子数据初始化 */
  async init(): Promise<void> {
    if (this.cfg.seedOnEmpty && existsSync(this.cfg.file)) {
      try {
        const raw = readFileSync(this.cfg.file, 'utf8')
        const data = JSON.parse(raw) as {
          products: Product[]
          orders: Order[]
          monthlyReport?: MonthlyReport | null
          weeklyReport?: WeeklyReport | null
          previousMonthlyReport?: MonthlyReport | null
          previousWeeklyReport?: WeeklyReport | null
          reportRevision?: number
          meta?: { dataMode?: string; updatedAt?: string }
        }
        if (Array.isArray(data.products) && Array.isArray(data.orders)) {
          this.products = data.products
          this.orders = data.orders
          // 报表（月/周复盘 + 上一期归档）随持久化恢复：数据对比依赖「连续导入两期」的
          // 上一期归档，若两次导入之间插件进程被重建（重启/热重载/新会话），归档会随内存丢失，
          // 导致「导入了两期却没有对比」。持久化报表与归档后，重启仍能恢复上期完成对比。
          this.monthlyReport = data.monthlyReport ?? null
          this.weeklyReport = data.weeklyReport ?? null
          this.previousMonthlyReport = data.previousMonthlyReport ?? null
          this.previousWeeklyReport = data.previousWeeklyReport ?? null
          if (Number.isFinite(data.reportRevision)) this.reportRevision = Number(data.reportRevision)
          const imported =
            this.adapter.name === 'rest'
              ? 'rest'
              : data.meta?.dataMode === 'imported'
                ? 'imported'
                : 'demo'
          this.dataMode = imported
          this.productsSource = imported === 'demo' ? 'demo' : 'imported'
          this.ordersSource = imported === 'demo' ? 'demo' : 'imported'
          return
        }
      } catch {
        // 持久化文件损坏 → 走种子初始化
      }
    }
    const [products, orders] = await Promise.all([
      this.adapter.listProducts({}),
      this.adapter.listOrders({}),
    ])
    this.products = products
    this.orders = orders
    this.dataMode = this.adapter.name === 'rest' ? 'rest' : 'demo'
    this.productsSource = 'demo'
    this.ordersSource = 'demo'
    this.save()
  }

  // v0.3 起商品增删改查已移除（数据由导入整体维护），SKU 计数器成为死代码：
  // 原 recomputeCounters()/nextSku 已删除，数据重载后不再需要刷新计数器。

  // ─────────────────────────── 持久化 ───────────────────────────

  save(): void {
    try {
      mkdirSync(dirname(this.cfg.file), { recursive: true })
      writeFileSync(
        this.cfg.file,
        JSON.stringify(
          {
            products: this.products,
            orders: this.orders,
            monthlyReport: this.monthlyReport,
            weeklyReport: this.weeklyReport,
            previousMonthlyReport: this.previousMonthlyReport,
            previousWeeklyReport: this.previousWeeklyReport,
            reportRevision: this.reportRevision,
            meta: { dataMode: this.dataMode, updatedAt: new Date().toISOString() },
          },
          null,
          2,
        ),
        'utf8',
      )
    } catch (err) {
      console.error('[ecommerce-analyst] 持久化失败：', err)
    }
  }

  /** 导出 JSON 备份 */
  exportBackup(): string {
    return JSON.stringify(
      {
        products: this.products,
        orders: this.orders,
        monthlyReport: this.monthlyReport,
        weeklyReport: this.weeklyReport,
        previousMonthlyReport: this.previousMonthlyReport,
        previousWeeklyReport: this.previousWeeklyReport,
      },
      null,
      2,
    )
  }

  /** 导入 JSON 备份（整体替换） */
  importBackup(json: string): { products: number; orders: number } {
    const data = JSON.parse(json) as {
      products: Product[]
      orders: Order[]
      monthlyReport?: MonthlyReport | null
      weeklyReport?: WeeklyReport | null
      previousMonthlyReport?: MonthlyReport | null
      previousWeeklyReport?: WeeklyReport | null
    }
    if (!Array.isArray(data.products) || !Array.isArray(data.orders)) {
      throw new Error('备份文件格式不正确：缺少 products/orders 数组')
    }
    this.products = data.products
    this.orders = data.orders
    this.monthlyReport = data.monthlyReport ?? null
    this.weeklyReport = data.weeklyReport ?? null
    this.previousMonthlyReport = data.previousMonthlyReport ?? null
    this.previousWeeklyReport = data.previousWeeklyReport ?? null
    this.dataMode = 'imported'
    this.productsSource = 'imported'
    this.ordersSource = 'imported'
    this.reportRevision += 1
    this.captureImported()
    this.save()
    return { products: this.products.length, orders: this.orders.length }
  }

  /**
   * 导入规范化后的商品/订单数组（整体替换）。Excel/CSV 导入工具使用：
   * 先校验商品 SKU 唯一、订单引用存在、金额/数量合法，再整体替换并落盘。
   */
  importData(products: Product[], orders: Order[]): { products: number; orders: number } {
    // 商品：SKU 唯一性 + 基础字段
    const skus = new Set<string>()
    for (const p of products) {
      if (!p.sku || !String(p.sku).trim()) throw new Error('商品缺少 sku')
      if (skus.has(p.sku)) throw new Error(`商品 sku 重复：${p.sku}`)
      skus.add(p.sku)
      if (!p.name || !String(p.name).trim()) throw new Error(`商品 ${p.sku} 缺少 name`)
      if (!Number.isFinite(p.price) || p.price < 0) throw new Error(`商品 ${p.sku} 售价非法：${p.price}`)
      if (!Number.isInteger(p.stock) || p.stock < 0) throw new Error(`商品 ${p.sku} 库存非法：${p.stock}`)
      if (!p.category) throw new Error(`商品 ${p.sku} 缺少 category`)
      if (p.status !== 'on_sale' && p.status !== 'off_sale') throw new Error(`商品 ${p.sku} 状态非法：${p.status}`)
    }
    // 订单：必填字段 + 商品引用
    const orderIds = new Set<string>()
    for (const o of orders) {
      if (!o.order_id || !String(o.order_id).trim()) throw new Error('订单缺少 order_id')
      if (orderIds.has(o.order_id)) throw new Error(`订单号重复：${o.order_id}`)
      orderIds.add(o.order_id)
      if (!skus.has(o.sku)) throw new Error(`订单 ${o.order_id} 引用了不存在的商品 sku：${o.sku}`)
      if (!Number.isInteger(o.quantity) || o.quantity < 1) throw new Error(`订单 ${o.order_id} 数量非法：${o.quantity}`)
      if (!Number.isFinite(o.amount) || o.amount < 0) throw new Error(`订单 ${o.order_id} 金额非法：${o.amount}`)
      if (!o.buyer) throw new Error(`订单 ${o.order_id} 缺少 buyer`)
      if (!o.created_at) throw new Error(`订单 ${o.order_id} 缺少 created_at`)
    }
    this.products = products
    this.orders = orders
    this.dataMode = 'imported'
    this.productsSource = 'imported'
    this.ordersSource = 'imported'
    this.captureImported()
    this.save()
    return { products: this.products.length, orders: this.orders.length }
  }

  /**
   * 文件导入（「店铺工作台」本地文件导入）：以「导入文件」为准做整体替换，杜绝演示数据残留。
   * - 文件同时含商品+订单：整体替换两者（dataMode=imported）。
   * - 文件仅含订单：替换订单；若当前商品仍为演示数据，则从订单 distinct(sku, 商品名称)
   *   派生商品（category=未分类 / price=0 / stock=阈值+1，避免误报低库存），确保看板展示
   *   用户真实商品而非演示商品。
   * - 文件仅含商品：替换商品（dataMode=imported）；若当前订单仍为演示数据则清空，避免
   *   演示订单残留。
   */
  importFromFile(
    products?: Product[],
    orders?: Order[],
  ): { products: number; orders: number; derivedProducts?: number } {
    let finalProducts = this.products
    let finalOrders = this.orders
    let derivedProducts = 0
    if (products !== undefined) {
      const skus = new Set<string>()
      for (const p of products) {
        if (!p.sku || !String(p.sku).trim()) throw new Error('商品缺少 sku')
        if (skus.has(p.sku)) throw new Error(`商品 sku 重复：${p.sku}`)
        skus.add(p.sku)
        if (!p.name || !String(p.name).trim()) throw new Error(`商品 ${p.sku} 缺少 name`)
        if (!Number.isFinite(p.price) || p.price < 0) throw new Error(`商品 ${p.sku} 售价非法：${p.price}`)
        if (!Number.isInteger(p.stock) || p.stock < 0) throw new Error(`商品 ${p.sku} 库存非法：${p.stock}`)
        if (!p.category) throw new Error(`商品 ${p.sku} 缺少 category`)
        if (p.status !== 'on_sale' && p.status !== 'off_sale') throw new Error(`商品 ${p.sku} 状态非法：${p.status}`)
      }
      finalProducts = products
      this.productsSource = 'imported'
    }
    if (orders !== undefined) {
      const skus = new Set<string>()
      for (const o of orders) {
        if (!o.order_id || !String(o.order_id).trim()) throw new Error('订单缺少 order_id')
        if (skus.has(o.order_id)) throw new Error(`订单号重复：${o.order_id}`)
        skus.add(o.order_id)
        if (!o.sku) throw new Error(`订单 ${o.order_id} 缺少 sku`)
        if (!Number.isInteger(o.quantity) || o.quantity < 1) throw new Error(`订单 ${o.order_id} 数量非法：${o.quantity}`)
        if (!Number.isFinite(o.amount) || o.amount < 0) throw new Error(`订单 ${o.order_id} 金额非法：${o.amount}`)
        if (!o.buyer) throw new Error(`订单 ${o.order_id} 缺少 buyer`)
        if (!o.created_at) throw new Error(`订单 ${o.order_id} 缺少 created_at`)
      }
      finalOrders = orders
      this.ordersSource = 'imported'
      // 仅订单文件且当前商品仍为演示数据 → 从订单派生商品，杜绝演示商品残留
      if (products === undefined && this.productsSource === 'demo') {
        const now = new Date().toISOString()
        const bySku = new Map<string, string>()
        for (const o of orders) {
          if (!bySku.has(o.sku)) bySku.set(o.sku, o.product_name || o.sku)
        }
        finalProducts = [...bySku.entries()].map(([sku, name]) => ({
          sku,
          name,
          category: '未分类',
          price: 0,
          stock: this.cfg.lowStockThreshold + 1,
          status: 'on_sale',
          created_at: now,
          updated_at: now,
        }))
        this.productsSource = 'imported'
        derivedProducts = finalProducts.length
      }
    }
    // 仅商品文件且当前订单仍为演示数据 → 清空，避免演示订单残留
    if (products !== undefined && orders === undefined && this.ordersSource === 'demo') {
      finalOrders = []
      this.ordersSource = 'imported'
    }
    this.products = finalProducts
    this.orders = finalOrders
    this.dataMode = 'imported'
    this.captureImported()
    this.save()
    return { products: this.products.length, orders: this.orders.length, derivedProducts }
  }

  // ─────────────────────────── 月度复盘 ───────────────────────────

  /** 写入月度复盘（来自 JSON 完整月报导入）。新周期写入时归档上一期。 */
  setMonthlyReport(report: MonthlyReport | null): void {
    this.adoptMonthly(report)
    this.reportRevision += 1
    this.save()
  }

  /** 合并月度复盘章节（「月度表」4 份文件分次导入，按展示形式/利润表覆盖对应章节）。
   *  合并结果周期与当前不同（新周期文件先到）时归档上一期，后续同周期文件继续补章节。 */
  mergeMonthlyReport(part: MonthlyParseResult): void {
    // ⚠ mergeMonthly 就地清空旧周期章节，归档必须先深拷贝再合并，否则上一期章节被抹掉
    const cur = this.monthlyReport
    if (part.period && cur !== null && cur.period !== '' && cur.period !== part.period) {
      this.previousMonthlyReport = structuredClone(cur)
    }
    const incoming = mergeMonthly(this.monthlyReport, part)
    this.monthlyReport = incoming
    this.reportRevision += 1
    this.save()
  }

  /**
   * 批量导入月度复盘（30 天周期）：以「这批文件」为唯一数据源，从零整体重建
   * MonthlyReport（不继承任何旧周期章节），保证 30 天面板的分析结果完全来自
   * 本次一次性导入的 4 份 Excel（利润表 + 三份「商品排名导出」），杜绝旧数据残留。
   */
  importMonthlyReport(parts: MonthlyParseResult[]): void {
    let report: MonthlyReport | null = null
    for (const part of parts) {
      report = mergeMonthly(report, part)
    }
    if (report === null) return
    // 归档上一期：当前已有其它周期月报（导入新一期）才归档；同周期补数据（同一期重复导入）不归档
    if (this.monthlyReport !== null && this.monthlyReport.period !== report.period) {
      this.previousMonthlyReport = this.monthlyReport
    }
    this.monthlyReport = report
    this.reportRevision += 1
    this.save()
  }

  /** 统一采纳月报：周期与当前不同时先把当前归档为上一期，再替换 */
  private adoptMonthly(report: MonthlyReport | null): void {
    if (
      report !== null &&
      report.period &&
      this.monthlyReport !== null &&
      this.monthlyReport.period !== '' &&
      this.monthlyReport.period !== report.period
    ) {
      this.previousMonthlyReport = this.monthlyReport
    }
    this.monthlyReport = report
  }

  /** 读取月度复盘（无导入记录返回 null） */
  getMonthlyReport(): MonthlyReport | null {
    return this.monthlyReport
  }

  /** 读取上一期月度复盘（未连续导入第二期返回 null）：供数据对比用 */
  getPreviousMonthlyReport(): MonthlyReport | null {
    return this.previousMonthlyReport
  }

  /** 合并周复盘章节（三份「商品排名导出」分次导入，按展示形式覆盖对应章节）。
   *  新周期文件先到时归档上一期，后续同周期文件继续补章节（不重复归档）。 */
  mergeWeeklyReport(part: import('./weekly-report.ts').WeeklyParseResult): void {
    // ⚠ mergeWeekly 就地清空旧周期章节，归档必须先深拷贝再合并，否则上一期章节被抹掉
    const cur = this.weeklyReport
    if (part.period && cur !== null && cur.period !== '' && cur.period !== part.period) {
      this.previousWeeklyReport = structuredClone(cur)
    }
    const incoming = mergeWeekly(this.weeklyReport, part)
    this.weeklyReport = incoming
    this.reportRevision += 1
    this.save()
  }

  /** 读取周复盘（无导入记录返回 null） */
  getWeeklyReport(): WeeklyReport | null {
    return this.weeklyReport
  }

  /** 读取上一期周复盘（未连续导入第二期返回 null）：供数据对比用 */
  getPreviousWeeklyReport(): WeeklyReport | null {
    return this.previousWeeklyReport
  }

  /** 报表数据版本号（单调递增），供 /ecommerce-api/*-report 接口返回给前端做变更检测 */
  getReportRevision(): number {
    return this.reportRevision
  }

  // ─────────────────────────── 数据源模式切换 ───────────────────────────

  /** 深拷贝当前数据为「最近导入快照」（避免后续 CRUD 就地修改污染快照） */
  private captureImported(): void {
    this.lastImported = {
      products: structuredClone(this.products),
      orders: structuredClone(this.orders),
    }
  }

  /**
   * 重置为演示数据：先导出当前数据快照（防误操作），再从示例种子重新初始化。
   * 返回 { products, orders, snapshot }，snapshot 为重置前的备份 JSON。
   */
  async resetToDemo(): Promise<{ products: number; orders: number; snapshot: string }> {
    const snapshot = this.exportBackup()
    if (typeof this.adapter.seedSnapshot === 'function') {
      const seed = this.adapter.seedSnapshot()
    this.products = seed.products
    this.orders = seed.orders
  } else {
    const [products, orders] = await Promise.all([
      this.adapter.listProducts({}),
      this.adapter.listOrders({}),
    ])
    this.products = products
    this.orders = orders
  }
    this.dataMode = 'demo'
    this.productsSource = 'demo'
    this.ordersSource = 'demo'
    this.save()
    return { products: this.products.length, orders: this.orders.length, snapshot }
  }

  /** 切换回最近一次导入的数据（无导入记录时报错） */
  switchToImported(): { products: number; orders: number } {
    if (this.lastImported === null) {
      throw new Error('暂无导入数据，请先通过 ecommerce_import_excel / ecommerce_import_backup 或工作台导入文件')
    }
    this.products = structuredClone(this.lastImported.products)
    this.orders = structuredClone(this.lastImported.orders)
    this.dataMode = 'imported'
    this.productsSource = 'imported'
    this.ordersSource = 'imported'
    this.save()
    return { products: this.products.length, orders: this.orders.length }
  }

  /** 从平台 API 重新拉取数据（仅 rest 适配器可用） */
  async reloadFromRest(): Promise<{ products: number; orders: number }> {
    if (this.adapter.name !== 'rest') {
      throw new Error('当前未配置平台 API（启动时 ecommerceAnalyst.platform.name 需为 rest）')
    }
    const [products, orders] = await Promise.all([
      this.adapter.listProducts({}),
      this.adapter.listOrders({}),
    ])
    this.products = products
    this.orders = orders
    this.dataMode = 'rest'
    this.productsSource = 'imported'
    this.ordersSource = 'imported'
    this.save()
    return { products: this.products.length, orders: this.orders.length }
  }

  /** 显式切换数据源模式（demo/imported/rest） */
  async switchMode(
    mode: 'demo' | 'imported' | 'rest',
  ): Promise<{ products: number; orders: number; snapshot?: string }> {
    switch (mode) {
      case 'demo':
        return this.resetToDemo()
      case 'imported':
        return this.switchToImported()
      case 'rest':
        return this.reloadFromRest()
      default:
        throw new Error(`未知数据源模式：${String(mode)}`)
    }
  }

  /** 数据源模式信息（供侧边栏「数据源」标签渲染） */
  getModeInfo(): {
    mode: 'demo' | 'imported' | 'rest'
    sourceMode: 'mock' | 'rest'
    canDemo: boolean
    canImported: boolean
    canRest: boolean
  } {
    return {
      mode: this.dataMode,
      sourceMode: this.sourceMode,
      canDemo: true,
      canImported: this.lastImported !== null,
      canRest: this.adapter.name === 'rest',
    }
  }

  // ─────────────────────────── 商品查询 ───────────────────────────

  listProducts(filter: ProductFilter): Page<Product> {
    const pageSize = filter.page_size ?? 20
    const page = filter.page ?? 1
    const filtered = filterProducts(this.products, filter)
    return {
      total: filtered.length,
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
    }
  }

  getProduct(sku: string): Product | undefined {
    return this.products.find((p) => p.sku === sku)
  }

  // ─────────────────────────── 订单处理 ───────────────────────────

  listOrders(filter: OrderFilter): Page<Order> {
    const pageSize = filter.page_size ?? 20
    const page = filter.page ?? 1
    const filtered = filterOrders(this.orders, filter)
    const sorted = [...filtered].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    )
    return {
      total: sorted.length,
      items: sorted.slice((page - 1) * pageSize, page * pageSize),
    }
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.find((o) => o.order_id === orderId)
  }

  /** 校验并执行订单状态流转 */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    meta?: OrderMeta,
  ): Promise<Order> {
    const order = this.getOrder(orderId)
    if (!order) throw new Error(`订单不存在：${orderId}`)
    if (order.status === status) return order
    const allowed = ORDER_TRANSITIONS[order.status]
    if (!allowed.includes(status)) {
      throw new Error(
        `非法状态流转：${order.status} → ${status}（允许：${allowed.join('、') || '无'}）`,
      )
    }
    order.status = status
    if (meta?.note) {
      ;(order as Order & { note?: string }).note = meta.note
    }
    if (status === 'shipped' && meta?.tracking_no) {
      order.shipped_at = new Date().toISOString()
      order.tracking_no = meta.tracking_no
      order.carrier = meta.carrier
    }
    if (status === 'refunded') {
      order.refund_reason = meta?.refund_reason ?? '用户申请退款'
    }
    this.save()
    return order
  }

  /** 发货便捷操作 */
  async shipOrder(orderId: string, trackingNo: string, carrier: string): Promise<Order> {
    return this.updateOrderStatus(orderId, 'shipped', {
      tracking_no: trackingNo,
      carrier,
    })
  }

  /** 退款便捷操作 */
  async refundOrder(orderId: string, reason: string): Promise<Order> {
    return this.updateOrderStatus(orderId, 'refunded', { refund_reason: reason })
  }

  /** 待发货订单（今日要处理） */
  pendingShipments(): Order[] {
    return this.orders.filter((o) => o.status === 'paid')
  }

  /** 逾期未处理订单：pending 超过 24 小时 */
  overduePending(): Order[] {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    return this.orders.filter(
      (o) => o.status === 'pending' && new Date(o.created_at).getTime() < cutoff,
    )
  }

  // ─────────────────────────── 统计口径 ───────────────────────────

  private inRange(order: Order, range: DateRange): boolean {
    const d = order.created_at.slice(0, 10)
    if (range.date_from && d < range.date_from) return false
    if (range.date_to && d > range.date_to) return false
    return true
  }

  private revenueOrders(range: DateRange): Order[] {
    return this.orders.filter((o) => isRevenueOrder(o.status) && this.inRange(o, range))
  }

  overview(range: DateRange = {}): StatsOverview {
    const revOrders = this.revenueOrders(range)
    const revenue = revOrders.reduce((sum, o) => sum + toCents(o.amount), 0)
    const revenueYuan = fromCents(revenue)
    const total = this.orders.filter((o) => this.inRange(o, range)).length
    const refunded = this.orders.filter(
      (o) => o.status === 'refunded' && this.inRange(o, range),
    ).length
    const top = this.topProducts(range, 1)[0]
    return {
      revenue: revenueYuan,
      orders: revOrders.length,
      avg_order_value: revOrders.length
        ? fromCents(Math.round(revenue / revOrders.length))
        : 0,
      top_selling_sku: top?.sku ?? '',
      refund_rate: total ? Math.round((refunded / total) * 1000) / 10 : 0,
    }
  }

  trend(range: DateRange = {}, granularity: 'day' | 'week' | 'month' = 'day'): TrendPoint[] {
    const orders = this.revenueOrders(range)
    const buckets = new Map<string, { revenue: number; orders: number }>()
    for (const o of orders) {
      const date = o.created_at.slice(0, 10)
      const key =
        granularity === 'month'
          ? date.slice(0, 7)
          : granularity === 'week'
            ? weekKey(date)
            : date
      const bucket = buckets.get(key) ?? { revenue: 0, orders: 0 }
      bucket.revenue += toCents(o.amount)
      bucket.orders += 1
      buckets.set(key, bucket)
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, revenue: fromCents(v.revenue), orders: v.orders }))
  }

  topProducts(range: DateRange = {}, limit = 10): TopProduct[] {
    const orders = this.revenueOrders(range)
    const agg = new Map<string, { revenue: number; units: number; name: string }>()
    for (const o of orders) {
      const item = agg.get(o.sku) ?? { revenue: 0, units: 0, name: o.product_name }
      item.revenue += toCents(o.amount)
      item.units += o.quantity
      agg.set(o.sku, item)
    }
    return [...agg.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, limit)
      .map(([sku, v]) => ({
        sku,
        name: v.name,
        revenue: fromCents(v.revenue),
        units: v.units,
      }))
  }

  categoryDistribution(range: DateRange = {}): CategoryStat[] {
    const orders = this.revenueOrders(range)
    const nameBySku = new Map(this.products.map((p) => [p.sku, p.category]))
    const agg = new Map<string, number>()
    for (const o of orders) {
      const cat = nameBySku.get(o.sku) ?? '未分类'
      agg.set(cat, (agg.get(cat) ?? 0) + toCents(o.amount))
    }
    const total = [...agg.values()].reduce((a, b) => a + b, 0)
    return [...agg.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, revenue]) => ({
        category,
        revenue: fromCents(revenue),
        ratio: total ? Math.round((revenue / total) * 1000) / 10 : 0,
      }))
  }

  // ─────────────────────────── 库存预警 ───────────────────────────

  lowStock(threshold?: number): LowStockItem[] {
    const t = threshold ?? this.cfg.lowStockThreshold
    return this.products
      .filter((p) => p.stock <= t)
      .sort((a, b) => a.stock - b.stock)
      .map((p) => ({
        sku: p.sku,
        name: p.name,
        stock: p.stock,
        category: p.category,
        threshold: t,
      }))
  }

  restockSuggestions(threshold?: number): RestockSuggestion[] {
    const t = threshold ?? this.cfg.lowStockThreshold
    const recent30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
    const range: DateRange = { date_from: recent30 }
    const salesBySku = new Map<string, number>()
    for (const o of this.revenueOrders(range)) {
      salesBySku.set(o.sku, (salesBySku.get(o.sku) ?? 0) + o.quantity)
    }
    return this.products
      .filter((p) => p.stock <= t)
      .map((p) => {
        const sold = salesBySku.get(p.sku) ?? 0
        const suggest = Math.max(0, Math.ceil(sold * 1.5 - p.stock))
        return {
          sku: p.sku,
          name: p.name,
          stock: p.stock,
          suggest_qty: suggest,
          reason: suggest > 0
            ? `近30天销量 ${sold}，按 1.5 倍安全库存建议补货`
            : '近30天无销量，暂不需要补货',
        }
      })
      .sort((a, b) => a.stock - b.stock)
  }

  /** 今日概览文本（供「今天要处理」区域使用） */
  todayActions(): { shipments: Order[]; overdues: Order[]; lowStockCount: number } {
    return {
      shipments: this.pendingShipments(),
      overdues: this.overduePending(),
      lowStockCount: this.lowStock().length,
    }
  }
}

/** 按周聚合：取 ISO 周一的日期 */
function weekKey(date: string): string {
  const d = new Date(`${date}T00:00:00Z`)
  const day = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - day)
  return d.toISOString().slice(0, 10)
}

export { todayStr }
