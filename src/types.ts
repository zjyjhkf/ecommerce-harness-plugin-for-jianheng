/**
 * ecommerce-analyst-plugin — 领域类型定义
 *
 * 所有类型均为只读/值对象，遵循 dsh 插件契约（canonical JSON value）。
 */

/** 商品状态 */
export type ProductStatus = 'on_sale' | 'off_sale'

/** 商品 */
export interface Product {
  sku: string
  name: string
  category: string
  price: number
  stock: number
  status: ProductStatus
  created_at: string
  updated_at: string
}

/** 订单状态 */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'completed'
  | 'refunded'
  | 'cancelled'

/** 订单 */
export interface Order {
  order_id: string
  buyer: string
  sku: string
  product_name: string
  quantity: number
  amount: number
  status: OrderStatus
  created_at: string
  shipped_at?: string
  tracking_no?: string
  carrier?: string
  refund_reason?: string
}

/** 商品筛选条件 */
export interface ProductFilter {
  category?: string
  keyword?: string
  status?: ProductStatus
  min_price?: number
  max_price?: number
  page?: number
  page_size?: number
}

/** 订单筛选条件 */
export interface OrderFilter {
  status?: OrderStatus
  date_from?: string
  date_to?: string
  min_amount?: number
  max_amount?: number
  keyword?: string
  page?: number
  page_size?: number
}

/** 日期范围（YYYY-MM-DD） */
export interface DateRange {
  date_from?: string
  date_to?: string
}

/** 分页结果 */
export interface Page<T> {
  total: number
  items: T[]
}

/** 经营总览 */
export interface StatsOverview {
  revenue: number
  orders: number
  avg_order_value: number
  top_selling_sku: string
  refund_rate: number
}

/** 趋势点 */
export interface TrendPoint {
  date: string
  revenue: number
  orders: number
}

/** TOP 商品条目 */
export interface TopProduct {
  sku: string
  name: string
  revenue: number
  units: number
}

/** 类目分布条目 */
export interface CategoryStat {
  category: string
  revenue: number
  ratio: number
}

/** 低库存条目 */
export interface LowStockItem {
  sku: string
  name: string
  stock: number
  category: string
  threshold: number
}

/** 补货建议条目 */
export interface RestockSuggestion {
  sku: string
  name: string
  stock: number
  suggest_qty: number
  reason: string
}

/** 订单状态流转元数据 */
export interface OrderMeta {
  note?: string
  tracking_no?: string
  carrier?: string
  refund_amount?: number
  refund_reason?: string
}

/** 合法状态流转表 */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'refunded'],
  shipped: ['completed', 'refunded'],
  completed: [],
  refunded: [],
  cancelled: [],
}

/** 订单金额校验：金额使用整数分位，避免浮点误差 */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

export function fromCents(cents: number): number {
  return cents / 100
}

/** 是否为「已支付口径」订单（参与销售额统计） */
export function isRevenueOrder(status: OrderStatus): boolean {
  return status === 'paid' || status === 'shipped' || status === 'completed'
}
