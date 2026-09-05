/**
 * ecommerce-analyst-plugin — 电商数据中台 API（服务端）
 *
 * 为客户端「电商数据中台」面板提供数据接口：Excel 导入 → 月度/周度复盘、
 * 数据对比、数据评价与导出。早期「店铺工作台 / BI 看板」的实时经营数据
 * （订单 / 商品）接口（快照 / 行动清单 / 简报 / 趋势 / 独立仪表盘 / 模式切换
 * / 商品列表 / 单文件导入）已随 BI 看板一并移除，数据一律来自导入的 Excel 复盘报表。
 *
 * 路由（prefix /ecommerce-api）：
 *   POST /ecommerce-api/import-batch  → 批量导入 Excel 复盘报表
 *   GET  /ecommerce-api/monthly-report → 月度复盘（30/60 天）
 *   GET  /ecommerce-api/weekly-report  → 周度复盘（7 天）
 *   GET  /ecommerce-api/compare        → 数据对比（连续导入两期）
 *   GET  /ecommerce-api/evaluation     → 数据评价（AI / 规则）
 *   GET  /ecommerce-api/data-center    → 数据中台 HTML 页面
 *   GET  /ecommerce-api/export         → 导出 CSV / JSON
 *
 * 响应约定（与 dsh-office 一致）：{ ok: true, value } / { ok: false, error }
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { EcommerceStore } from './store.ts'
import { parseImportFile } from './import-parse.ts'
import { renderDataCenter } from './data-center.ts'
import { ordersToCsv, productsToCsv } from './csv-util.ts'
import type { MonthlyParseResult } from './monthly-report.ts'
import type { WeeklyParseResult } from './weekly-report.ts'
import type { MonthlyReport, Order, Product } from './types.ts'
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

