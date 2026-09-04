/**
 * ecommerce-analyst-plugin — 侧边栏客户端数据层
 *
 * 只读消费服务端 /ecommerce-api（与 src/shop-api.ts 对齐）。数据口径与
 * stats_overview / inventory_low_stock / todayActions 等工具完全一致——
 * 同一 EcommerceStore，同一统计逻辑，无客户端二次计算。
 */

/** 面板快照（服务端 buildSnapshot 的镜像） */
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
  /** 数据来源模式与可切换性（侧边栏「数据源」标签） */
  mode: {
    mode: 'demo' | 'imported' | 'rest'
    sourceMode: 'mock' | 'rest'
    canDemo: boolean
    canImported: boolean
    canRest: boolean
  }
  /** 近 30 天日销售趋势（总览卡片迷你图） */
  trend30: Array<{ date: string; revenue: number; orders: number }>
  generatedAt: string
}

/** 数据源模式信息 */
export interface ModeInfo {
  mode: 'demo' | 'imported' | 'rest'
  sourceMode: 'mock' | 'rest'
  canDemo: boolean
  canImported: boolean
  canRest: boolean
}

/** 商品行（分类筛选用） */
export interface ProductRow {
  sku: string
  name: string
  category: string
  price: number
  stock: number
  status: 'on_sale' | 'off_sale'
}

/** 行动清单（服务端 buildActions 镜像，对齐视频 cockpit dock） */
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

/** 一页经营简报（Markdown 文本） */
export interface ShopBrief {
  markdown: string
}

interface ApiEnvelope<T> {
  ok?: boolean
  value?: T
  error?: { code?: string; message?: string }
}

/**
 * 解析 /ecommerce-api 的访问基址，兼容三种形态：
 *  1. 服务端 tapIndex 注入的 window.__ECOM_API_BASE__（web 与任何经 webServer
 *     渲染的 index 页面）—— 端口由服务端权威提供；
 *  2. 页面本身由 webServer 提供（http://127.0.0.1:PORT）→ 同源相对路径；
 *  3. 兜底：相对路径（与页面同源）。
 * 桌面端若以 file:// 加载本地 index 且无注入，会优先尝试注入值；都没有则
 * 相对请求，面板会显示可读错误（可通过刷新按钮重试）。
 */
function resolveApiBase(): string | null {
  if (typeof window === 'undefined') return null
  const injected = (window as { __ECOM_API_BASE__?: unknown }).__ECOM_API_BASE__
  if (typeof injected === 'string' && injected) return injected.replace(/\/$/, '')
  const proto = window.location?.protocol
  if (proto === 'http:' || proto === 'https:') return window.location.origin
  return null
}

async function call<T>(path: string): Promise<T> {
  const base = resolveApiBase()
  const url = base ? base + path : path
  let res: Response
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
    })
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err))
  }
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!res.ok || body === null || body.ok !== true || body.value === undefined) {
    const message = body?.error?.message ?? `HTTP ${res.status}`
    throw new Error(message)
  }
  return body.value
}


/** 拉取行动清单（驾驶舱 dock） */
export function fetchActions(): Promise<ShopActions> {
  return call<ShopActions>('/ecommerce-api/actions')
}

/** 拉取面板全量快照 */
export function fetchSnapshot(): Promise<ShopSnapshot> {
  return call<ShopSnapshot>('/ecommerce-api/snapshot')
}

/** 拉取一页经营简报（Markdown） */
export function fetchBrief(): Promise<ShopBrief> {
  return call<ShopBrief>('/ecommerce-api/brief')
}

/** 按分类拉取商品（分类树点击筛选） */
export async function fetchCategoryProducts(category: string): Promise<ProductRow[]> {
  const page = await call<{ total: number; items: ProductRow[] }>(
    `/ecommerce-api/products?category=${encodeURIComponent(category)}`,
  )
  return page.items
}

/** 金额格式化：¥1,234.56 */
export function formatMoney(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** 时刻格式化：HH:MM:SS */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '--'
  const p = (n: number): string => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/** 本地文件导入结果 */
export interface ImportResult {
  products: number
  orders: number
  /** 本次导入的文件数（批量导入时 >1） */
  files?: number
  /** 是否已重建月度复盘（30 天面板数据源） */
  monthlyReport?: boolean
  /** 是否已有周复盘 */
  weeklyReport?: boolean
  hint: string
  snapshot?: string
}

/** base64 编码（分块，避免大文件调用栈溢出） */
function toBase64(bytes: Uint8Array): string {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

/** 把本地文件上传到 /ecommerce-api/import 解析并导入店铺数据 */
export async function importLocalFile(file: File): Promise<ImportResult> {
  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  const isText = ['csv', 'txt', 'json', 'sql'].includes(ext)
  let content: string
  let encoding: 'utf8' | 'base64'
  if (isText) {
    content = await file.text()
    encoding = 'utf8'
  } else {
    const bytes = new Uint8Array(await file.arrayBuffer())
    content = toBase64(bytes)
    encoding = 'base64'
  }
  const base = resolveApiBase()
  const url = (base ? base : '') + '/ecommerce-api/import'
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ filename: file.name, content, encoding }),
    })
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err))
  }
  const body = (await res.json().catch(() => null)) as ApiEnvelope<ImportResult> | null
  if (!res.ok || body === null || body.ok !== true || body.value === undefined) {
    const message = body?.error?.message ?? `HTTP ${res.status}`
    throw new Error(message)
  }
  return body.value
}

/** 把多个本地文件一次性批量上传到 /ecommerce-api/import-batch（30 天周期的 4 份 Excel
 *  在同一请求内解析并整体重建月度复盘，保证分析结果完全来自这些文件）。 */
export async function importLocalFiles(files: File[]): Promise<ImportResult> {
  const items = await Promise.all(
    files.map(async (file) => {
      const ext = (file.name.split('.').pop() ?? '').toLowerCase()
      const isText = ['csv', 'txt', 'json', 'sql'].includes(ext)
      let content: string
      let encoding: 'utf8' | 'base64'
      if (isText) {
        content = await file.text()
        encoding = 'utf8'
      } else {
        const bytes = new Uint8Array(await file.arrayBuffer())
        content = toBase64(bytes)
        encoding = 'base64'
      }
      return { filename: file.name, content, encoding }
    }),
  )
  const base = resolveApiBase()
  const url = (base ? base : '') + '/ecommerce-api/import-batch'
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ files: items }),
    })
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err))
  }
  const body = (await res.json().catch(() => null)) as ApiEnvelope<ImportResult> | null
  if (!res.ok || body === null || body.ok !== true || body.value === undefined) {
    const message = body?.error?.message ?? `HTTP ${res.status}`
    throw new Error(message)
  }
  return body.value
}

/** 数据源模式切换结果 */
export interface ModeSwitchResult {
  products: number
  orders: number
  mode: string
  info: ModeInfo
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const base = resolveApiBase()
  const url = (base ? base : '') + path
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(body),
    })
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err))
  }
  const data = (await res.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!res.ok || data === null || data.ok !== true || data.value === undefined) {
    const message = data?.error?.message ?? `HTTP ${res.status}`
    throw new Error(message)
  }
  return data.value
}

/** 切换数据源模式（demo / imported / rest） */
export function switchMode(mode: 'demo' | 'imported' | 'rest'): Promise<ModeSwitchResult> {
  return post<ModeSwitchResult>('/ecommerce-api/mode', { mode })
}

/** 一键重置为演示数据（服务端先备份当前数据） */
export function resetToDemo(): Promise<ModeSwitchResult> {
  return post<ModeSwitchResult>('/ecommerce-api/reset-demo', {})
}

/** 数据源模式中文标签 */
export function modeLabelOf(mode: string): string {
  switch (mode) {
    case 'demo': return '演示数据'
    case 'imported': return '导入数据'
    case 'rest': return '平台 API'
    default: return mode
  }
}

/** 独立仪表盘页面地址（供侧边栏一键打开） */
export function dashboardUrl(): string {
  const base = resolveApiBase()
  return (base ? base : '') + '/ecommerce-api/dashboard'
}

/** 电商数据中台页面地址（全屏面板 iframe 加载「电商数据中台.html」修改版）。
 *  带 ?v= 版本号强制 iframe 每次发版后走全新 URL，绕过桌面端 WebView 对旧 HTML 的激进缓存。 */
export function dataCenterUrl(): string {
  const base = resolveApiBase()
  return (base ? base : '') + '/ecommerce-api/data-center?v=20260904-r18'
}

/** 导出数据（CSV 或 JSON）——触发浏览器下载 */
export function exportData(type: 'csv' | 'json' = 'csv', scope: 'products' | 'orders' | 'all' = 'all'): void {
  if (typeof window === 'undefined') return
  const base = resolveApiBase()
  const url = (base ? base : '') + `/ecommerce-api/export?type=${type}&scope=${scope}`
  window.open(url, '_blank')
}
