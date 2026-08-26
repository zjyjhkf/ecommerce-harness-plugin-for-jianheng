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
import { ordersToCsv, productsToCsv } from './csv-util.ts'
import type { TrendPoint } from './types.ts'

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
      : '<script>window.__ECOM_API_BASE__ = null;</script>'
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

/** 注册 /ecommerce-api 前缀路由，返回 disposer（随插件 fiber 卸载） */
export function registerShopApi(webServer: WebServerLike, store: EcommerceStore): () => void {
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
          sendJson(res, 200, {
            ok: true,
            value: {
              products: result.products,
              orders: result.orders,
              hint: parsed.hint,
              snapshot,
            },
          })
          return
        }
        if (pathname === '/ecommerce-api/snapshot') {
          sendJson(res, 200, { ok: true, value: buildSnapshot(store) })
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
        if (pathname === '/ecommerce-api/products/all' && req.method === 'GET') {
          // 全量商品列表（商品管理表格：不分页，含全部字段）
          const items = store.listProducts({ page_size: 10000 }).items
          sendJson(res, 200, { ok: true, value: { total: items.length, items } })
          return
        }
        if (pathname === '/ecommerce-api/product/create' && req.method === 'POST') {
          const body = await readJsonBody(req)
          try {
            const price = Number(body.price)
            const stock = Number(body.stock)
            if (!body.name || String(body.name).trim() === '') throw new Error('商品名称不能为空')
            if (!Number.isFinite(price) || price <= 0) throw new Error('售价必须大于 0')
            if (!Number.isFinite(stock) || stock < 0) throw new Error('库存不能为负')
            const product = await store.createProduct({
              name: String(body.name).trim(),
              price,
              stock,
              category: String(body.category ?? '未分类'),
              status: body.status === 'off_sale' ? 'off_sale' : 'on_sale',
            })
            sendJson(res, 200, { ok: true, value: product })
          } catch (err) {
            sendJson(res, 400, {
              ok: false,
              error: { code: 'CREATE_FAILED', message: err instanceof Error ? err.message : String(err) },
            })
          }
          return
        }
        if (pathname === '/ecommerce-api/product/update' && req.method === 'POST') {
          const body = await readJsonBody(req)
          try {
            const sku = String(body.sku ?? '')
            const patch: Record<string, unknown> = {}
            if (body.name !== undefined) patch.name = String(body.name).trim()
            if (body.category !== undefined) patch.category = String(body.category)
            if (body.status !== undefined) patch.status = body.status
            if (body.price !== undefined) {
              const price = Number(body.price)
              if (!Number.isFinite(price) || price <= 0) throw new Error('售价必须大于 0')
              patch.price = price
            }
            if (body.stock !== undefined) {
              const stock = Number(body.stock)
              if (!Number.isFinite(stock) || stock < 0) throw new Error('库存不能为负')
              patch.stock = stock
            }
            const product = await store.updateProduct(sku, patch)
            sendJson(res, 200, { ok: true, value: product })
          } catch (err) {
            sendJson(res, 400, {
              ok: false,
              error: { code: 'UPDATE_FAILED', message: err instanceof Error ? err.message : String(err) },
            })
          }
          return
        }
        if (pathname === '/ecommerce-api/product/delete' && req.method === 'POST') {
          const body = await readJsonBody(req)
          try {
            await store.deleteProduct(String(body.sku ?? ''))
            sendJson(res, 200, { ok: true, value: { deleted: true, sku: body.sku } })
          } catch (err) {
            sendJson(res, 400, {
              ok: false,
              error: { code: 'DELETE_FAILED', message: err instanceof Error ? err.message : String(err) },
            })
          }
          return
        }
        if (pathname === '/ecommerce-api/product/stock' && req.method === 'POST') {
          const body = await readJsonBody(req)
          try {
            const product = await store.adjustStock(String(body.sku ?? ''), Number(body.delta ?? 0))
            sendJson(res, 200, { ok: true, value: product })
          } catch (err) {
            sendJson(res, 400, {
              ok: false,
              error: { code: 'STOCK_FAILED', message: err instanceof Error ? err.message : String(err) },
            })
          }
          return
        }
        if (pathname === '/ecommerce-api/product/status' && req.method === 'POST') {
          const body = await readJsonBody(req)
          try {
            const product = await store.setProductStatus(
              String(body.sku ?? ''),
              body.status === 'off_sale' ? 'off_sale' : 'on_sale',
            )
            sendJson(res, 200, { ok: true, value: product })
          } catch (err) {
            sendJson(res, 400, {
              ok: false,
              error: { code: 'STATUS_FAILED', message: err instanceof Error ? err.message : String(err) },
            })
          }
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
