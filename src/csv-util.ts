/**
 * ecommerce-analyst-plugin — CSV 导出工具（纯函数，供 ecommerce_export_csv 与
 * 仪表盘模板复用）。RFC 4180 子集：含逗号/引号/换行的字段加引号包裹、引号转义。
 * 输出带 UTF-8 BOM（\uFEFF），Excel 直接双击打开中文不乱码。
 */
import type { Order, Product } from './types.ts'

/** 单个字段转义：含分隔符/引号/换行时用双引号包裹并转义内部引号 */
function escapeField(value: unknown): string {
  const s = String(value ?? '')
  if (/[",\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

/** 行数组 → CSV 文本（带 BOM） */
export function toCsv(header: string[], rows: Array<Array<unknown>>): string {
  const lines = [header.map(escapeField).join(',')]
  for (const row of rows) {
    lines.push(row.map(escapeField).join(','))
  }
  return '\uFEFF' + lines.join('\r\n')
}

/** 商品导出列 */
export function productsToCsv(products: Product[]): string {
  return toCsv(
    ['sku', 'name', 'category', 'price', 'stock', 'status', 'created_at', 'updated_at'],
    products.map((p) => [p.sku, p.name, p.category, p.price, p.stock, p.status, p.created_at, p.updated_at]),
  )
}

/** 订单导出列 */
export function ordersToCsv(orders: Order[]): string {
  return toCsv(
    ['order_id', 'buyer', 'sku', 'product_name', 'quantity', 'amount', 'status', 'created_at', 'shipped_at', 'tracking_no', 'carrier', 'refund_reason'],
    orders.map((o) => [
      o.order_id,
      o.buyer,
      o.sku,
      o.product_name,
      o.quantity,
      o.amount,
      o.status,
      o.created_at,
      o.shipped_at ?? '',
      o.tracking_no ?? '',
      o.carrier ?? '',
      o.refund_reason ?? '',
    ]),
  )
}
