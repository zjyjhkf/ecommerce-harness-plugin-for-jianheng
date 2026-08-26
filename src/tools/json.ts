/**
 * ecommerce-analyst-plugin — 工具输出类型适配
 *
 * dsh 的 defineTool 从 output.schema 推断 canonical 返回类型（含 index signature）。
 * 领域 interface（如 Product/Order）缺少 index signature，直接返回会类型不兼容。
 * 本 helper 在类型层将领域对象视为 JSON 视图（运行时零转换——数据本身即 JSON-safe），
 * render 内再断言为具体视图类型使用。
 */
import type { JsonValue } from '@deepseek-ai/dsh-tools'

/** 将领域返回对象视为工具 canonical 输出（Record<string, JsonValue>） */
export function asJsonObject(value: unknown): Record<string, JsonValue> {
  return value as Record<string, JsonValue>
}

/** 商品行视图（render 使用） */
export interface ProductRow {
  sku: string
  name: string
  price: number
  stock: number
  category: string
  status: string
}

/** 订单行视图（render 使用） */
export interface OrderRow {
  order_id: string
  buyer: string
  product_name: string
  quantity: number
  amount: number
  status: string
  created_at: string
  tracking_no?: string
  carrier?: string
  refund_reason?: string
}

/** 低库存行视图 */
export interface LowStockRow {
  sku: string
  name: string
  stock: number
  category: string
  threshold: number
}

/** 补货建议行视图 */
export interface RestockRow {
  sku: string
  name: string
  stock: number
  suggest_qty: number
  reason: string
}
