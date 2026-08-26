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

/* ────────────────────────── 商品 CRUD（增删改查） ────────────────────────── */

/** 全量商品列表（商品管理表格用） */
export async function fetchAllProducts(): Promise<ProductRow[]> {
  const page = await call<{ total: number; items: ProductRow[] }>('/ecommerce-api/products/all')
  return page.items
}

/** 新增商品 */
export async function createProduct(input: {
  name: string
  price: number
  stock: number
  category: string
  status?: 'on_sale' | 'off_sale'
}): Promise<ProductRow> {
  return post<ProductRow>('/ecommerce-api/product/create', input as unknown as Record<string, unknown>)
}

/** 修改商品 */
export async function updateProduct(
  sku: string,
  patch: Partial<Pick<ProductRow, 'name' | 'price' | 'stock' | 'category' | 'status'>>,
): Promise<ProductRow> {
  return post<ProductRow>('/ecommerce-api/product/update', { sku, ...patch } as unknown as Record<string, unknown>)
}

/** 删除商品 */
export async function deleteProduct(sku: string): Promise<{ deleted: boolean }> {
  return post<{ deleted: boolean }>('/ecommerce-api/product/delete', { sku })
}

/** 调整库存（delta 正为入库，负为出库） */
export async function adjustStock(sku: string, delta: number): Promise<ProductRow> {
  return post<ProductRow>('/ecommerce-api/product/stock', { sku, delta })
}

/** 上下架切换 */
export async function setProductStatus(sku: string, status: 'on_sale' | 'off_sale'): Promise<ProductRow> {
  return post<ProductRow>('/ecommerce-api/product/status', { sku, status })
}

/** 导出数据（CSV 或 JSON）——触发浏览器下载 */
export function exportData(type: 'csv' | 'json' = 'csv', scope: 'products' | 'orders' | 'all' = 'all'): void {
  if (typeof window === 'undefined') return
  const base = resolveApiBase()
  const url = (base ? base : '') + `/ecommerce-api/export?type=${type}&scope=${scope}`
  window.open(url, '_blank')
}

/** 生成「点击商品 → 会话框分析指令」（市场营销视角） */
export function analysisPromptOf(product: ProductRow): string {
  const statusLabel = product.status === 'on_sale' ? '在售' : '下架'
  return [
    `请基于以下商品信息，以市场营销视角对该产品进行系统化分析，并给出可执行的营销建议：`,
    ``,
    `【商品基础信息】`,
    `- 商品名称：${product.name}`,
    `- SKU：${product.sku}`,
    `- 商品分类：${product.category}`,
    `- 售价：¥${product.price}`,
    `- 当前库存：${product.stock} 件`,
    `- 上架状态：${statusLabel}`,
    ``,
    `请从以下 6 个维度分析：`,
    `1) 目标客户画像（年龄段/性别/消费场景/购买力）`,
    `2) 市场竞争与差异化定位（同品类对比、卖点提炼）`,
    `3) 定价策略评估（与品类均价对比、利润空间、性价比）`,
    `4) 库存与供应链健康度（动销预测、断货/积压风险、补货建议）`,
    `5) 营销渠道建议（适合哪些投放平台、投放素材方向）`,
    `6) 促销与上架时机（大促节点、搭配销售、引流策略）`,
    ``,
    `输出格式：先给出 6 个维度的结构化分析（每项 2-4 句），最后给一份"本月可执行营销行动清单"（含优先级 P0/P1/P2）。`,
  ].join('\n')
}
