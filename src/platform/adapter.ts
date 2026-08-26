/**
 * ecommerce-analyst-plugin — 电商平台适配器接口
 *
 * 每个电商平台（淘宝/拼多多/抖店等）实现一个 PlatformAdapter，
 * 将平台原始数据统一映射为内部领域模型（Product/Order）。
 * 插件通过 Store 消费适配器，不感知具体平台差异。
 */
import type {
  Order,
  OrderFilter,
  OrderMeta,
  OrderStatus,
  Product,
  ProductFilter,
} from '../types.ts'

export interface PlatformAdapter {
  /** 平台名，如 'mock' | 'taobao' | 'pdd' | 'douyin' */
  readonly name: string
  /** 是否为只读演示适配器 */
  readonly readOnly: boolean

  listProducts(filter: ProductFilter): Promise<Product[]>
  listOrders(filter: OrderFilter): Promise<Order[]>

  /** 以下写操作仅在 readOnly=false 的适配器上实现；mock 适配器抛错提示 */
  updateProduct(sku: string, patch: Partial<Product>): Promise<Product>
  createProduct(product: Product): Promise<Product>
  deleteProduct(sku: string): Promise<void>
  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    meta?: OrderMeta,
  ): Promise<Order>

  /** 仅示例（mock）适配器实现：返回种子数据深拷贝，供「重置为演示数据」使用 */
  seedSnapshot?(): { products: Product[]; orders: Order[] }
}

/** 适配器配置 */
export interface AdapterConfig {
  name: 'mock' | 'rest'
  baseUrl?: string
  token?: string
  appKey?: string
  appSecret?: string
  /** 请求超时（毫秒） */
  timeoutMs?: number
}

/** 创建适配器（按配置名分发） */
export async function createAdapter(config: AdapterConfig): Promise<PlatformAdapter> {
  switch (config.name) {
    case 'mock':
      const { MockAdapter } = await import('./mock.ts')
      return new MockAdapter()
    case 'rest':
      const { RestAdapter } = await import('./rest.ts')
      return new RestAdapter(config)
    default:
      const { MockAdapter: fallback } = await import('./mock.ts')
      return new fallback()
  }
}
