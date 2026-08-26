/**
 * ecommerce-analyst-plugin — 示例数据适配器（MockAdapter）
 *
 * 默认启用：提供开箱即用的演示数据，用户无凭证时即可完整体验全部功能。
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
import rawSeed from '../../data/seed.json' with { type: 'json' }

/** seed.json 为 JSON 推断类型（status: string），此处断言为领域类型 */
const seedData = rawSeed as unknown as { products: Product[]; orders: Order[] }

export class MockAdapter implements PlatformAdapter {
  readonly name = 'mock'
  readonly readOnly = true

  /** 深拷贝 seed 数据，避免 Store 写操作污染模块级示例数据（测试隔离） */
  private products: Product[] = structuredClone(seedData.products)
  private orders: Order[] = structuredClone(seedData.orders)

  async listProducts(filter: ProductFilter): Promise<Product[]> {
    return filterProducts(this.products, filter)
  }

  async listOrders(filter: OrderFilter): Promise<Order[]> {
    return filterOrders(this.orders, filter)
  }

  /** 返回示例种子数据的深拷贝（供「重置为演示数据」使用） */
  seedSnapshot(): { products: Product[]; orders: Order[] } {
    return {
      products: structuredClone(seedData.products),
      orders: structuredClone(seedData.orders),
    }
  }

  private writeDenied(operation: string): never {
    throw new Error(
      `[示例模式] 不支持「${operation}」写操作。示例数据为只读演示，如需真实读写，请配置电商平台 API 凭证（ecommerceAnalyst.platform.*）。`,
    )
  }

  async updateProduct(_sku: string, _patch: Partial<Product>): Promise<Product> {
    return this.writeDenied('修改商品')
  }

  async createProduct(_product: Product): Promise<Product> {
    return this.writeDenied('新增商品')
  }

  async deleteProduct(_sku: string): Promise<void> {
    this.writeDenied('删除商品')
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
