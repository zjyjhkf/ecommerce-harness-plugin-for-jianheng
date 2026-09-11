/**
 * ecommerce-analyst-plugin — 本地数据适配器（MockAdapter）
 *
 * v0.4.0 起运行时**不携带任何示例数据**：默认空库，数据只能来自导入或 rest 平台。
 * （原 data/seed.json 已降级为测试专用 fixture：tests/fixtures/seed.json，
 *  由测试通过构造参数显式注入，不再影响生产会话。）
 * 只读：写操作返回明确错误，提示切换到真实平台适配器。
 */
import type {
  Order,
  OrderFilter,
  OrderMeta,
  OrderStatus,
  Product,
  ProductFilter,
} from '../types.ts'
import type { PlatformAdapter } from './adapter.ts'

/** 测试注入口：仅供 tests 用 fixture 数据构造；生产路径一律不传 → 空库。 */
export interface MockAdapterSeed {
  products: Product[]
  orders: Order[]
}

export class MockAdapter implements PlatformAdapter {
  readonly name = 'mock'
  readonly readOnly = true

  /** 深拷贝注入数据（缺省为空），避免 Store 写操作污染调用方持有的数组（测试隔离）。 */
  private products: Product[]
  private orders: Order[]

  constructor(seed?: MockAdapterSeed) {
    this.products = seed ? structuredClone(seed.products) : []
    this.orders = seed ? structuredClone(seed.orders) : []
  }

  async listProducts(filter: ProductFilter): Promise<Product[]> {
    return filterProducts(this.products, filter)
  }

  async listOrders(filter: OrderFilter): Promise<Order[]> {
    return filterOrders(this.orders, filter)
  }

  private writeDenied(operation: string): never {
    throw new Error(
      `[示例模式] 不支持「${operation}」写操作。示例数据为只读演示，如需真实读写，请配置电商平台 API 凭证（ecommerceAnalyst.platform.*）。`,
    )
  }

  async updateOrderStatus(
    _orderId: string,
    _status: OrderStatus,
    _meta?: OrderMeta,
  ): Promise<Order> {
    return this.writeDenied('更新订单状态')
  }
}

/** 商品筛选（纯函数，可复用） */
export function filterProducts(
  products: Product[],
  filter: ProductFilter,
): Product[] {
  let result = products
  if (filter.category) {
    result = result.filter((p) => p.category === filter.category)
  }
  if (filter.status) {
    result = result.filter((p) => p.status === filter.status)
  }
  if (filter.min_price !== undefined) {
    result = result.filter((p) => p.price >= (filter.min_price ?? 0))
  }
  if (filter.max_price !== undefined) {
    result = result.filter((p) => p.price <= (filter.max_price ?? Infinity))
  }
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) || p.sku.toLowerCase().includes(kw),
    )
  }
  return result
}

/** 订单筛选（纯函数，可复用） */
export function filterOrders(orders: Order[], filter: OrderFilter): Order[] {
  let result = orders
  if (filter.status) {
    result = result.filter((o) => o.status === filter.status)
  }
  if (filter.date_from) {
    result = result.filter((o) => o.created_at.slice(0, 10) >= (filter.date_from ?? ''))
  }
  if (filter.date_to) {
    result = result.filter((o) => o.created_at.slice(0, 10) <= (filter.date_to ?? ''))
  }
  if (filter.min_amount !== undefined) {
    result = result.filter((o) => o.amount >= (filter.min_amount ?? 0))
  }
  if (filter.max_amount !== undefined) {
    result = result.filter((o) => o.amount <= (filter.max_amount ?? Infinity))
  }
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase()
    result = result.filter(
      (o) =>
        o.buyer.toLowerCase().includes(kw) ||
        o.order_id.toLowerCase().includes(kw) ||
        o.product_name.toLowerCase().includes(kw),
    )
  }
  return result
}
