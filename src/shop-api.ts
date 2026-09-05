/**
 * ecommerce-analyst-plugin — 侧边栏数据 API（服务端）
 *
 * 为客户端「店铺工作台」面板提供 JSON 只读接口。所有数据直接委托给
 * EcommerceStore 的既有统计逻辑（overview / todayActions / lowStock /
 * topProducts / categoryDistribution / listProducts），与 stats_*、
 * inventory_* 等工具口径完全一致，不另造数据层。
 *
 * 路由（prefix /ecommerce-api）：
 *   GET /ecommerce-api/snapshot                  → 面板全量数据
 *   GET /ecommerce-api/products?category=<分类>  → 分类筛选商品
 *
 * 响应约定（与 dsh-office 一致）：{ ok: true, value } / { ok: false, error }
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { EcommerceStore } from './store.ts'
import { parseImportFile } from './import-parse.ts'
import { renderDashboard } from './dashboard.ts'
import { renderDataCenter } from './data-center.ts'
import { ordersToCsv, productsToCsv } from './csv-util.ts'
import type { MonthlyParseResult } from './monthly-report.ts'
import type { WeeklyParseResult } from './weekly-report.ts'
import type { MonthlyReport, Order, Product, TrendPoint } from './types.ts'
import { buildEvaluationSummary, callLlmForEvaluation, evaluationPrompt, ruleBasedEvaluation } from './data-evaluation.ts'
import type { EvaluationSummary } from './data-evaluation.ts'
import { buildComparePayload, isCompareCycle } from './compare-payload.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** webServer 服务（由 dsh-host-webserver 提供；本包不直接依赖其类型） */
    webServer: WebServerLike
  }
}

/** webServer.register 的最小结构类型（避免引入 host 包类型依赖） */
export interface WebServerLike {
  /** 当前监听端口（OS 分配时返回实际端口） */
  readonly port?: number
  register(route: {
    kind: 'prefix'
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
  }): () => void
  /** index.html 注入变换（用于向客户端广播 API base，跨 file:// 桌面端可用） */
  tapIndex?(transform: (html: string) => string): () => void
}

/** 面板快照（客户端一次拉取全部数据） */
export interface ShopSnapshot {
  overview: {
    revenue: number
    orders: number
    avg_order_value: number
    top_selling_sku: string
    refund_rate: number
  }
  today: {
    shipmentsCount: number
    overdueCount: number
    overdues: Array<{ order_id: string; buyer: string; amount: number; created_at: string }>
    /** 待发货订单明细（今日待办可展开查看） */
    shipments: Array<{ order_id: string; buyer: string; product_name: string; quantity: number; amount: number; created_at: string; status: string }>
    lowStockCount: number
  }
  categories: Array<{ category: string; count: number; revenue: number; ratio: number }>
  top: Array<{ sku: string; name: string; revenue: number; units: number }>
  lowStock: Array<{ sku: string; name: string; stock: number; category: string; threshold: number }>
  sourceMode: 'mock' | 'rest'
  /** 数据来源模式（demo/imported/rest）与可切换性（供侧边栏「数据源」标签） */
  mode: {
    mode: 'demo' | 'imported' | 'rest'
    sourceMode: 'mock' | 'rest'
    canDemo: boolean
    canImported: boolean
    canRest: boolean
  }
  /** 近 30 天日销售趋势（供总览卡片迷你图） */
  trend30: TrendPoint[]
  generatedAt: string
}

/** 统一响应头：JSON + 禁用缓存 + CORS（桌面端 file:// 跨源拉取 /ecommerce-api 必需） */
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'accept, content-type, origin',
  'access-control-max-age': '600',
} as const

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...CORS_HEADERS,
  })
  res.end(text)
}

/** OPTIONS 预检：跨源 fetch（尤其桌面端 file:// 页面）需要显式放行 */
function sendPreflight(res: ServerResponse): void {
  res.writeHead(204, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'accept, content-type, origin',
    'access-control-max-age': '600',
  })
  res.end()
}

/**
 * 通过 webServer.tapIndex 把 API base 注入 index.html，客户端无需猜测端口：
 *   <script>window.__ECOM_API_BASE__ = "http://127.0.0.1:PORT"</script>
 * 只对 webServer 渲染的 index 生效；file:// 桌面端若加载本地 index 则回退到
 * 客户端 origin 探测（见 src/client/data.ts）。
 */
export function injectApiBase(webServer: WebServerLike): (() => void) | undefined {
  if (typeof webServer.tapIndex !== 'function') return undefined
  const port = webServer.port
  const base = port ? `http://127.0.0.1:${port}` : ''
  return webServer.tapIndex((html: string) => {
    const tag = base
      ? `<script>window.__ECOM_API_BASE__ = ${JSON.stringify(base)};</script>`
      // 无 port 时注入空串（'' 是合法的「同源相对 fetch」值）；绝不能注入 null 字面量，
      // 以免下游 truthy 判断误伤（iframe 页面由 renderDataCenter 自行注入，见 data-center.ts）
      : '<script>window.__ECOM_API_BASE__ = "";</script>'
    if (html.includes('__ECOM_API_BASE__')) return html
    return html.replace('</head>', tag + '</head>')
  })
}

/** 构建面板快照：全部来自 Store 既有统计口径 */
export function buildSnapshot(store: EcommerceStore): ShopSnapshot {
  const overview = store.overview()
  const actions = store.todayActions()
  const lowStock = store.lowStock()
  const top = store.topProducts({}, 5)
  // 订单行缺 product_name 时，用商品表补齐（保持面板与商品口径一致）
  const nameBySku = new Map(store.listProducts({ page_size: 1000 }).items.map((p) => [p.sku, p.name]))
  for (const t of top) {
    if (!t.name) t.name = nameBySku.get(t.sku) ?? t.sku
  }
  const dist = new Map(store.categoryDistribution().map((c) => [c.category, c]))
  const productCounts = new Map<string, number>()
  for (const p of store.listProducts({ page_size: 1000 }).items) {
    productCounts.set(p.category, (productCounts.get(p.category) ?? 0) + 1)
  }
  const categories = [...productCounts.entries()]
    .map(([category, count]) => ({
      category,
      count,
      revenue: dist.get(category)?.revenue ?? 0,
      ratio: dist.get(category)?.ratio ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
  return {
    overview,
    today: {
      shipmentsCount: actions.shipments.length,
      overdueCount: actions.overdues.length,
      overdues: actions.overdues.map((o) => ({
        order_id: o.order_id,
        buyer: o.buyer,
        amount: o.amount,
        created_at: o.created_at,
      })),
      shipments: actions.shipments.map((o) => ({
        order_id: o.order_id,
        buyer: o.buyer,
        product_name: o.product_name,
        quantity: o.quantity,
        amount: o.amount,
        created_at: o.created_at,
        status: o.status,
      })),
      lowStockCount: actions.lowStockCount,
    },
    categories,
    top,
    lowStock,
    sourceMode: store.sourceMode,
    mode: store.getModeInfo(),
    trend30: store.trend(
      { date_from: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
      'day',
    ),
    generatedAt: new Date().toISOString(),
  }
}

/** 读取请求体 JSON（简单缓冲，限额 64MB） */
function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > 64 * 1024 * 1024) {
        reject(new Error('请求体过大（>64MB）'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve(text ? (JSON.parse(text) as Record<string, unknown>) : {})
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
    req.on('error', reject)
  })
}

/**
 * 评价缓存：key = cycle:revision，避免每次轮询重复调用 LLM。
 * `pending` 表示后台 AI 生成仍在进行（此刻缓存里是规则占位文本）。
 * 设计目标：数据评价生成不再阻塞复盘面板 —— 首次请求立即返回规则占位，
 * 后台异步调用 LLM，完成后写回缓存；客户端 4s 轮询自动把占位升级为 AI 评价。
 */
const evaluationCache = new Map<string, { text: string; source: 'ai' | 'rule'; pending: boolean }>()
/** 正在生成中的 cacheKey（防止并发重复调用 LLM） */
const evaluationPending = new Set<string>()

/** 后台生成一句 AI 评价并写回缓存；AI 不可用/不足 40 字时回退规则模板。
 *  cycle 已隐含在 cacheKey（cycle:revision）与 summary 中，无需单独传参。 */
async function generateEvaluation(
  cacheKey: string,
  summary: EvaluationSummary,
  ctx: { get?(name: string): unknown },
): Promise<void> {
  if (evaluationPending.has(cacheKey)) return
  evaluationPending.add(cacheKey)
  try {
    let text = await callLlmForEvaluation(ctx, evaluationPrompt(summary))
    let source: 'ai' | 'rule' = 'ai'
    if (text === null || text.length < 40) {
      text = ruleBasedEvaluation(summary)
      source = 'rule'
    }
    if (text.length > 80) text = text.slice(0, 80)
    evaluationCache.set(cacheKey, { text, source, pending: false })
  } catch (err) {
    evaluationCache.set(cacheKey, { text: ruleBasedEvaluation(summary), source: 'rule', pending: false })
  } finally {
    evaluationPending.delete(cacheKey)
  }
}

/**
 * 取评价（非阻塞）：命中且非 pending 直接返回；否则先落规则占位（即时返回），
 * 同时触发一次后台 AI 生成。返回当前应下发的内容与 pending 状态。
 */
function ensureEvaluation(
  cacheKey: string,
  summary: EvaluationSummary,
  ctx: { get?(name: string): unknown },
): { text: string; source: 'ai' | 'rule'; pending: boolean } {
  const cached = evaluationCache.get(cacheKey)
  if (cached && !cached.pending) return cached
  if (!cached) {
    evaluationCache.set(cacheKey, { text: ruleBasedEvaluation(summary), source: 'rule', pending: true })
  }
  void generateEvaluation(cacheKey, summary, ctx)
  return evaluationCache.get(cacheKey)!
}

/** 导入后预热：后台预生成两个周期的评价，用户进入复盘面板时 AI 结果通常已就绪 */
function prewarmEvaluations(store: EcommerceStore, ctx: { get?(name: string): unknown }): void {
  const revision = store.getReportRevision()
  const monthlyReport = store.getMonthlyReport()
  const weeklyReport = store.getWeeklyReport()
  for (const cycle of ['30d', '7d'] as const) {
    const summary = buildEvaluationSummary(cycle, monthlyReport, weeklyReport)
    if (summary === null) continue
    void generateEvaluation(cycle + ':' + revision, summary, ctx)
  }
}

/** 注册 /ecommerce-api 前缀路由，返回 disposer（随插件 fiber 卸载） */
export function registerShopApi(
  webServer: WebServerLike,
  store: EcommerceStore,
  ctx: { get?(name: string): unknown } = {},
): () => void {
  return webServer.register({
    kind: 'prefix',
    path: '/ecommerce-api',
    handler: async (req, res) => {
      const raw = String(req.url ?? '/')
      const pathname = raw.split('?')[0] ?? raw
      const query = new URL(raw, 'http://localhost').searchParams
      try {
        if (req.method === 'OPTIONS') {
          sendPreflight(res)
          return
        }
        if (pathname === '/ecommerce-api/import' && req.method === 'POST') {
          const body = await readJsonBody(req)
          const filename = String(body.filename ?? '')
          const content = String(body.content ?? '')
          const encoding = body.encoding === 'base64' ? 'base64' : 'utf8'
          const parsed = await parseImportFile(filename, content, encoding)
          const snapshot = store.exportBackup()
          const result = store.importFromFile(parsed.products, parsed.orders)
          // 月度完整月报（JSON，整体替换）：供 30 天「月复盘」使用
          if (parsed.monthlyReport !== undefined) {
            store.setMonthlyReport(parsed.monthlyReport)
          }
          // 月度单份文件（「月度表」3 份「商品排名导出」+ 1 份「利润表」，逐份合并）
          if (parsed.monthlyPart !== undefined) {
            store.mergeMonthlyReport(parsed.monthlyPart)
          }
          // 周复盘（「商品排名导出」三份，按展示形式合并）：供 7 天「周复盘」使用
          if (parsed.weeklyReport !== undefined) {
            store.mergeWeeklyReport(parsed.weeklyReport)
          }
          // 导入后预热：后台预生成两周期数据评价，进入复盘面板即见 AI 结果（不阻塞）
          prewarmEvaluations(store, ctx)
          sendJson(res, 200, {
            ok: true,
            value: {
              products: result.products,
              orders: result.orders,
              monthlyReport: store.getMonthlyReport() !== null,
              weeklyReport: store.getWeeklyReport() !== null,
              hint: parsed.hint,
              snapshot,
            },
          })
          return
        }
        if (pathname === '/ecommerce-api/import-batch' && req.method === 'POST') {
          // 批量导入：一次性接收多个文件（30 天周期的 4 份 Excel：利润表 + 三份「商品排名导出」），
          // 在同一请求内解析并整体重建月度复盘，保证 30 天面板的分析结果完全来自本次导入的文件。
          const body = await readJsonBody(req)
          const rawFiles = Array.isArray(body.files) ? body.files : []
          if (rawFiles.length === 0) {
            sendJson(res, 400, {
              ok: false,
              error: { code: 'NO_FILES', message: '未收到任何文件（files 为空）' },
            })
            return
          }
          const files = rawFiles.map((f) => {
            const o = (f ?? {}) as Record<string, unknown>
            return {
              filename: String(o.filename ?? ''),
              content: String(o.content ?? ''),
              encoding: o.encoding === 'base64' ? ('base64' as const) : ('utf8' as const),
            }
          })
          // 逐文件解析：单个文件失败（如误带的图片/损坏文件）不阻断整批导入，其余文件照常解析
          const parsedList = await Promise.all(
            files.map(async (f) => {
              try {
                return await parseImportFile(f.filename, f.content, f.encoding)
              } catch (e) {
                return { hint: '跳过文件 ' + f.filename + '：' + (e instanceof Error ? e.message : String(e)) }
              }
            }),
          )
          const snapshot = store.exportBackup()

          // 聚合各文件解析结果：月度单份文件 / 周复盘单份文件 / 商品订单
          const monthlyParts: MonthlyParseResult[] = []
          const weeklyParts: WeeklyParseResult[] = []
          let monthlyReport: MonthlyReport | undefined
          let products: Product[] | undefined
          let orders: Order[] | undefined
          for (const p of parsedList) {
            if (p.monthlyPart !== undefined) monthlyParts.push(p.monthlyPart)
            if (p.monthlyReport !== undefined) monthlyReport = p.monthlyReport
            if (p.weeklyReport !== undefined) weeklyParts.push(p.weeklyReport)
            if (p.products !== undefined) products = p.products
            if (p.orders !== undefined) orders = p.orders
          }

          // 商品/订单：仅当文件确实含商品/订单时才导入（月度 4 表不含商品/订单，不动既有店铺数据）
          let productCount = store.listProducts({ page_size: 1 }).total
          let orderCount = store.listOrders({ page_size: 1 }).total
          if (products !== undefined || orders !== undefined) {
            const r = store.importFromFile(products, orders)
            productCount = r.products
            orderCount = r.orders
          }
          // 月度复盘：以本次导入的月度文件从零整体重建（不继承旧周期，数据来源唯一）
          if (monthlyParts.length > 0) {
            store.importMonthlyReport(monthlyParts)
          } else if (monthlyReport !== undefined) {
            store.setMonthlyReport(monthlyReport)
          }
          // 周复盘：逐份合并
          for (const w of weeklyParts) {
            store.mergeWeeklyReport(w)
          }

          // 批量导入后预热：后台预生成两周期数据评价（不阻塞）
          prewarmEvaluations(store, ctx)
          sendJson(res, 200, {
            ok: true,
            value: {
              products: productCount,
              orders: orderCount,
              files: files.length,
              monthlyReport: store.getMonthlyReport() !== null,
              weeklyReport: store.getWeeklyReport() !== null,
              hint: `批量导入 ${files.length} 个文件：${parsedList.map((p) => p.hint).join('；')}`,
              snapshot,
            },
          })
          return
        }
        if (pathname === '/ecommerce-api/snapshot') {
          sendJson(res, 200, { ok: true, value: buildSnapshot(store) })
          return
        }
        if (pathname === '/ecommerce-api/monthly-report') {
          // 月度复盘（30/60 天「月复盘」数据源，来自 7月月度复盘.xlsx 导入）
          sendJson(res, 200, { ok: true, value: store.getMonthlyReport(), revision: store.getReportRevision() })
          return
        }
        if (pathname === '/ecommerce-api/weekly-report') {
          // 周复盘（7 天「周复盘」数据源，来自「周数据」三份「商品排名导出」导入）
          sendJson(res, 200, { ok: true, value: store.getWeeklyReport(), revision: store.getReportRevision() })
          return
        }
        if (pathname === '/ecommerce-api/compare') {
          // 数据对比（连续导入两期后）：上期 vs 本期某层级某指标的增减与排行位移。
          // 30d=月度复盘对比、7d=周复盘对比；kind/metric/limit 缺省自动选择。
          const rawCycle = String(query.get('cycle') ?? '30d')
          const cycle = isCompareCycle(rawCycle) ? rawCycle : '30d'
          const kind = query.get('kind') ?? undefined
          const metric = query.get('metric') ?? undefined
          const limit = Math.min(Math.max(Number(query.get('limit') ?? 100) || 100, 1), 1000)
          const payload = buildComparePayload(store, cycle, kind, metric, limit)
          sendJson(res, 200, { ok: true, value: payload, revision: store.getReportRevision() })
          return
        }
        if (pathname === '/ecommerce-api/evaluation') {
          // 数据评价（月复盘/周复盘）：AI 对导入数据从销售额/产品/推广/退款四角度做一句 40~80 字评价。
          // 非阻塞：首次请求即时返回规则占位（pending=true），后台生成 AI 后写回缓存，客户端轮询升级为 AI。
          const cycle = query.get('cycle') === '7d' ? '7d' : '30d'
          const revision = store.getReportRevision()
          const cacheKey = cycle + ':' + revision
          const summary = buildEvaluationSummary(cycle, store.getMonthlyReport(), store.getWeeklyReport())
          if (summary === null) {
            sendJson(res, 200, { ok: true, value: { cycle, evaluation: '', source: 'rule', pending: false } })
            return
          }
          const entry = ensureEvaluation(cacheKey, summary, ctx)
          sendJson(res, 200, {
            ok: true,
            value: { cycle, evaluation: entry.text, source: entry.source, pending: entry.pending },
          })
          return
        }
        if (pathname === '/ecommerce-api/actions') {
          // 行动清单（对齐视频 cockpit 的 dock）：逾期/待发货/低库存 → 待办、今天到期、紧急
          const actions = buildActions(store)
          sendJson(res, 200, { ok: true, value: actions })
          return
        }
        if (pathname === '/ecommerce-api/brief') {
          // 一页经营简报（Markdown 文本，可复制/导出）
          const brief = buildBrief(store)
          sendJson(res, 200, { ok: true, value: { markdown: brief } })
          return
        }
        if (pathname === '/ecommerce-api/trend') {
          const days = Math.min(Math.max(Number(query.get('days') ?? 30) || 30, 1), 366)
          const points = store.trend(
            { date_from: new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
            'day',
          )
          sendJson(res, 200, { ok: true, value: { days, points } })
          return
        }
        if (pathname === '/ecommerce-api/dashboard' && req.method === 'GET') {
          // 独立仪表盘模板页（HTML，内联样式/SVG，零外部依赖）
          const html = renderDashboard(store)
          res.writeHead(200, {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'no-store',
            ...CORS_HEADERS,
          })
          res.end(html)
          return
        }
        if (pathname === '/ecommerce-api/data-center' && req.method === 'GET') {
          // 电商数据中台（对接「电商数据中台.html」修改版，全屏面板 iframe 加载）
          // 传入 req：renderDataCenter 依据 host/referer 向 iframe 页面自身注入 __ECOM_API_BASE__
          const html = renderDataCenter(store, req)
          res.writeHead(200, {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'no-store',
            ...CORS_HEADERS,
          })
          res.end(html)
          return
        }
        if (pathname === '/ecommerce-api/mode') {
          if (req.method === 'GET') {
            sendJson(res, 200, { ok: true, value: store.getModeInfo() })
            return
          }
          if (req.method === 'POST') {
            const body = await readJsonBody(req)
            const mode = String(body.mode ?? '')
            if (mode !== 'demo' && mode !== 'imported' && mode !== 'rest') {
              sendJson(res, 400, { ok: false, error: { code: 'BAD_MODE', message: 'mode 需为 demo/imported/rest' } })
              return
            }
            try {
              const result = await store.switchMode(mode as 'demo' | 'imported' | 'rest')
              sendJson(res, 200, { ok: true, value: { ...result, mode, info: store.getModeInfo() } })
            } catch (err) {
              sendJson(res, 400, {
                ok: false,
                error: { code: 'SWITCH_FAILED', message: err instanceof Error ? err.message : String(err) },
              })
            }
            return
          }
        }
        if (pathname === '/ecommerce-api/reset-demo' && req.method === 'POST') {
          try {
            const result = await store.resetToDemo()
            sendJson(res, 200, { ok: true, value: { ...result, info: store.getModeInfo() } })
          } catch (err) {
            sendJson(res, 500, {
              ok: false,
              error: { code: 'RESET_FAILED', message: err instanceof Error ? err.message : String(err) },
            })
          }
          return
        }
        if (pathname === '/ecommerce-api/products') {
          const category = query.get('category') || undefined
          sendJson(res, 200, {
            ok: true,
            value: store.listProducts({ category, page_size: 100 }),
          })
          return
        }
        if (pathname === '/ecommerce-api/export' && req.method === 'GET') {
          // 数据导出：?type=csv&scope=products|orders|all（或 ?type=json）
          const type = query.get('type') ?? 'csv'
          const scope = query.get('scope') ?? 'all'
          try {
            const products = store.listProducts({ page_size: 10000 }).items
            const orders = store.listOrders({ page_size: 10000 }).items
            if (type === 'json') {
              sendJson(res, 200, { ok: true, value: { products, orders } })
              return
            }
            let csv = ''
            let filename = 'ecommerce-export.csv'
            if (scope === 'products') {
              csv = productsToCsv(products)
              filename = 'ecommerce-products.csv'
            } else if (scope === 'orders') {
              csv = ordersToCsv(orders)
              filename = 'ecommerce-orders.csv'
            } else {
              csv = productsToCsv(products) + '\r\n\r\n' + ordersToCsv(orders)
              filename = 'ecommerce-all.csv'
            }
            res.writeHead(200, {
              'content-type': 'text/csv; charset=utf-8',
              'content-disposition': `attachment; filename="${filename}"`,
              'cache-control': 'no-store',
              ...CORS_HEADERS,
            })
            res.end(csv)
            return
          } catch (err) {
            sendJson(res, 500, {
              ok: false,
              error: { code: 'EXPORT_FAILED', message: err instanceof Error ? err.message : String(err) },
            })
            return
          }
        }
        sendJson(res, 404, {
          ok: false,
          error: { code: 'NOT_FOUND', message: `unknown ecommerce-api path: ${pathname}` },
        })
      } catch (err) {
        sendJson(res, 500, {
          ok: false,
          error: {
            code: 'INTERNAL',
            message: err instanceof Error ? err.message : String(err),
          },
        })
      }
    },
  })
}

/** 行动清单（对齐视频 cockpit 的 dock：待办/今天到期/紧急） */
export interface ShopActions {
  mode: string
  dock: { open: number; dueToday: number; urgent: number }
  actions: Array<{
    id: string
    kind: 'overdue' | 'ship' | 'low_stock'
    title: string
    detail: string
    urgent: boolean
    dueToday?: boolean
  }>
}

export function buildActions(store: EcommerceStore): ShopActions {
  const t = store.todayActions()
  const today = new Date().toISOString().slice(0, 10)
  const actions: ShopActions['actions'] = []
  // 逾期订单（紧急）
  for (const o of t.overdues) {
    actions.push({
      id: `ov-${o.order_id}`,
      kind: 'overdue',
      title: `逾期订单 ${o.order_id}`,
      detail: `${o.buyer} · ¥${o.amount.toFixed(2)} · ${o.created_at.slice(0, 10)}`,
      urgent: true,
    })
  }
  // 待发货（今天到期按下单日期）
  for (const o of t.shipments) {
    actions.push({
      id: `ship-${o.order_id}`,
      kind: 'ship',
      title: `待发货 ${o.order_id}`,
      detail: `${o.buyer} · ${o.product_name} ×${o.quantity} · ¥${o.amount.toFixed(2)}`,
      urgent: false,
      dueToday: o.created_at.slice(0, 10) === today,
    })
  }
  // 低库存
  for (const p of store.lowStock()) {
    actions.push({
      id: `ls-${p.sku}`,
      kind: 'low_stock',
      title: `低库存 ${p.name}`,
      detail: `${p.category} · 库存 ${p.stock}`,
      urgent: p.stock === 0,
    })
  }
  const urgent = actions.filter((a) => a.urgent).length
  const dueToday = actions.filter((a) => a.dueToday === true).length
  return {
    mode: store.getModeInfo().mode,
    dock: { open: actions.length, dueToday, urgent },
    actions,
  }
}

/** 一页经营简报（Markdown，可复制/导出） */
export function buildBrief(store: EcommerceStore): string {
  const o = store.overview()
  const today = new Date().toISOString().slice(0, 10)
  const nameBySku = new Map(
    store.listProducts({ page_size: 1000 }).items.map((p) => [p.sku, p.name]),
  )
  const top3 = store.topProducts({}, 3).map((p) => ({
    ...p,
    name: p.name || nameBySku.get(p.sku) || p.sku,
  }))
  const cats = store.categoryDistribution()
  const t = store.todayActions()
  const suggest = store.restockSuggestions()
  const money = (v: number) =>
    '¥' + v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const lines: string[] = []
  lines.push(`# 📊 电商经营简报（${today}）`)
  lines.push('')
  lines.push('## 一、经营总览')
  lines.push(
    `- 销售额 **${money(o.revenue)}**（${o.orders} 单）｜ 客单价 ${money(o.avg_order_value)} ｜ 退款率 ${o.refund_rate}%`,
  )
  if (o.top_selling_sku) {
    lines.push(`- 畅销商品：${o.top_selling_sku}（${nameBySku.get(o.top_selling_sku) ?? o.top_selling_sku}）`)
  }
  lines.push('')
  lines.push('## 二、销售排行 TOP3')
  top3.forEach((p, i) => lines.push(`${i + 1}. ${p.name}（${p.sku}）${money(p.revenue)} / ${p.units} 件`))
  lines.push('')
  lines.push('## 三、类目占比')
  for (const c of cats) lines.push(`- ${c.category} ${c.ratio}%（${money(c.revenue)}）`)
  lines.push('')
  lines.push('## 四、今日待办')
  lines.push(
    `- ⚠️ 逾期订单 **${t.overdues.length}** 笔 ｜ 📦 待发货 **${t.shipments.length}** 笔 ｜ ⚠️ 低库存 **${t.lowStockCount}** 件`,
  )
  lines.push('')
  const toRestock = suggest.filter((x) => x.suggest_qty > 0).slice(0, 5)
  if (toRestock.length > 0) {
    lines.push('## 五、库存预警与补货建议')
    for (const s of toRestock) {
      lines.push(`- ${s.name}：库存 ${s.stock} → 建议补货 ${s.suggest_qty}`)
    }
    lines.push('')
  }
  lines.push('> 数据来源：ecommerce-analyst-plugin 电商商单数据（与工具同口径）')
  return lines.join('\n')
}
