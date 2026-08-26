/**
 * ecommerce-analyst-plugin — 通用 REST 电商平台适配器（RestAdapter）
 *
 * 对接电商平台开放平台的 REST API。各平台签名/鉴权机制不同，
 * 本适配器提供统一骨架：`signRequest()` 为平台签名钩子，
 * 接入具体平台（淘宝/拼多多/抖店）时实现该钩子即可。
 *
 * 启用条件（dsh Config）：
 *   ecommerceAnalyst.platform.name = "rest"
 *   ecommerceAnalyst.platform.baseUrl = "https://openapi.example.com"
 *   token 优先从环境变量 DSH_ECOM_TOKEN 读取
 */
import type {
  Order,
  OrderFilter,
  OrderMeta,
  OrderStatus,
  Product,
  ProductFilter,
} from '../types.ts'
import type { AdapterConfig, PlatformAdapter } from './adapter.ts'

export class RestAdapter implements PlatformAdapter {
  readonly name = 'rest'
  readonly readOnly = false

  private baseUrl: string
  private token: string
  private appKey: string | undefined
  private appSecret: string | undefined
  private timeoutMs: number

  constructor(config: AdapterConfig) {
    if (!config.baseUrl) {
      throw new Error('[RestAdapter] 缺少 baseUrl，请配置 ecommerceAnalyst.platform.baseUrl')
    }
    this.baseUrl = config.baseUrl.replace(/\/+$/, '')
    this.token = config.token || process.env.DSH_ECOM_TOKEN || ''
    this.appKey = config.appKey
    this.appSecret = config.appSecret
    this.timeoutMs = config.timeoutMs ?? 15_000
  }

  /**
   * 平台签名钩子：各平台在此注入签名参数（如 sign / timestamp / nonce）。
   * 默认返回空签名参数；接入具体平台时覆盖。
   */
  protected signParams(): Record<string, string> {
    return {}
  }

  /** 统一请求入口：组装鉴权头 + 签名参数 + 超时 */
  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
        ...(this.appKey ? { 'x-app-key': this.appKey } : {}),
        ...(this.appSecret ? { 'x-app-secret': this.appSecret } : {}),
      }
      const url = new URL(this.baseUrl + path)
      for (const [k, v] of Object.entries(this.signParams())) {
        url.searchParams.set(k, v)
      }
      const res = await fetch(url, {
        ...init,
        headers: { ...headers, ...(init?.headers ?? {}) },
        signal: controller.signal,
      })
      if (!res.ok) {
        throw new Error(`[RestAdapter] ${path} 请求失败：HTTP ${res.status} ${res.statusText}`)
      }
      return (await res.json()) as T
    } finally {
      clearTimeout(timer)
    }
  }

  async listProducts(filter: ProductFilter): Promise<Product[]> {
    const params = new URLSearchParams()
    if (filter.category) params.set('category', filter.category)
    if (filter.status) params.set('status', filter.status)
    const data = await this.request<{ products?: Product[] }>(
      `/products?${params.toString()}`,
    )
    return data.products ?? []
  }

  async listOrders(filter: OrderFilter): Promise<Order[]> {
    const params = new URLSearchParams()
    if (filter.status) params.set('status', filter.status)
    if (filter.date_from) params.set('date_from', filter.date_from)
    if (filter.date_to) params.set('date_to', filter.date_to)
    const data = await this.request<{ orders?: Order[] }>(
      `/orders?${params.toString()}`,
    )
    return data.orders ?? []
  }

  async updateProduct(sku: string, patch: Partial<Product>): Promise<Product> {
    const data = await this.request<{ product: Product }>(`/products/${sku}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return data.product
  }

  async createProduct(product: Product): Promise<Product> {
    const data = await this.request<{ product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
    return data.product
  }

  async deleteProduct(sku: string): Promise<void> {
    await this.request<unknown>(`/products/${sku}`, { method: 'DELETE' })
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    meta?: OrderMeta,
  ): Promise<Order> {
    const data = await this.request<{ order: Order }>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...meta }),
    })
    return data.order
  }
}
