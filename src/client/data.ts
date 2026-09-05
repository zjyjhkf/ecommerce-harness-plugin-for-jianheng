/**
 * ecommerce-analyst-plugin — 侧边栏客户端数据层
 *
 * 面板只承载「电商数据中台」（复盘数据：月度 / 周度 / 数据对比），数据一律来自
 * 导入的 Excel 复盘报表。早期「店铺工作台 / BI 看板」的实时经营数据
 * （订单 / 商品）相关接口（快照 / 行动清单 / 简报 / 数据源切换 / 独立仪表盘）
 * 已随 BI 看板一并移除。
 */

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
