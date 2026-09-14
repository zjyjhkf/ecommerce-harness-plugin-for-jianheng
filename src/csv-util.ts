/**
 * ecommerce-analyst-plugin — CSV 导出工具（纯函数，供 ecommerce_export_csv 与
 * 仪表盘模板复用）。RFC 4180 子集：含逗号/引号/换行的字段加引号包裹、引号转义。
 * 输出带 UTF-8 BOM（\uFEFF），Excel 直接双击打开中文不乱码。
 */
import type { MonthlyReport, Order, Product, WeeklyReport } from './types.ts'

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

/** 多个 CSV 块拼接为单个文件：各块自带 BOM 被剥除，块间空行分隔，全文只有一个 BOM。 */
export function joinCsvBlocks(blocks: string[]): string {
  const clean = blocks
    .filter((b) => b.length > 0)
    .map((b) => (b.charCodeAt(0) === 0xfeff ? b.slice(1) : b))
    .join('\r\n\r\n')
  return clean === '' ? '' : '﻿' + clean
}

/** 单份月报 → CSV 块（利润表 + 三层级排名）。period 标题行由调用方拼接。 */
export function monthlyReportToCsv(rep: MonthlyReport): string {
  const blocks: string[] = []
  if (rep.storeProfit && rep.storeProfit.length > 0) {
    blocks.push(toCsv(
      ['店铺', '销售收入', '退款', '净销', '毛利', '毛利率%', '推广费', '物流费', '费比%'],
      rep.storeProfit.map((s) => [s.store, s.sales, s.refund, (Number(s.sales) || 0) - (Number(s.refund) || 0), s.grossProfit, s.grossMargin, s.promoCost, s.logisticsCost, s.feeRatio]),
    ))
  }
  if (rep.platformLinks && rep.platformLinks.length > 0) {
    blocks.push(toCsv(
      ['店铺', '链接名称', '链接ID', '销售额', '销售件数', '净销', '毛利', '毛利率%', '退款额', '退款率%', '推广费', '客单价'],
      rep.platformLinks.map((l) => [l.shop, l.linkName, l.linkId, l.sales, l.salesCount, l.netSales, l.grossProfit, l.grossMargin ?? '', l.refundAmount, l.refundRate, l.adSpend, l.avgPrice ?? '']),
    ))
  }
  if (rep.systemProducts && rep.systemProducts.length > 0) {
    blocks.push(toCsv(
      ['货品名称', '商家编码', '品牌', '分类', '销售额', '销售件数', '净销', '毛利', '退款率%', '推广费'],
      rep.systemProducts.map((p) => [p.name, p.code, p.brand ?? '', p.category ?? '', p.sales, p.salesCount ?? '', p.netSales, p.grossProfit, p.refundRate, p.adSpend ?? '']),
    ))
  }
  if (rep.systemSkus && rep.systemSkus.length > 0) {
    blocks.push(toCsv(
      ['货品名称', '规格名称', '商家编码', '分类', '销售额', '销售件数', '净销', '毛利', '退款率%', '推广费'],
      rep.systemSkus.map((s) => [s.name, s.specName, s.code, s.category ?? '', s.sales, s.salesCount, s.netSales, s.grossProfit, s.refundRate, s.adSpend ?? '']),
    ))
  }
  return joinCsvBlocks(blocks)
}

/** 单份周报 → CSV 块（三层级排名） */
export function weeklyReportToCsv(rep: WeeklyReport): string {
  const blocks: string[] = []
  if (rep.platformLinks && rep.platformLinks.length > 0) {
    blocks.push(toCsv(
      ['店铺', '链接名称', '链接ID', '销售额', '销售件数', '净销', '退款额', '退款率%', '推广费'],
      rep.platformLinks.map((l) => [l.shop, l.linkName, l.linkId, l.sales, l.salesCount, l.netSales, l.refundAmount, l.refundRate, l.adSpend]),
    ))
  }
  if (rep.systemProducts && rep.systemProducts.length > 0) {
    blocks.push(toCsv(
      ['货品名称', '商家编码', '品牌', '销售额', '净销', '退款率%', '推广费'],
      rep.systemProducts.map((p) => [p.name, p.code, p.brand ?? '', p.sales, p.netSales, p.refundRate, p.adSpend ?? '']),
    ))
  }
  if (rep.systemSkus && rep.systemSkus.length > 0) {
    blocks.push(toCsv(
      ['货品名称', '规格名称', '商家编码', '销售额', '净销', '退款率%', '推广费'],
      rep.systemSkus.map((s) => [s.name, s.specName, s.code, s.sales, s.netSales, s.refundRate, s.adSpend ?? '']),
    ))
  }
  return joinCsvBlocks(blocks)
}

/** 全部复盘报表（多个月度归档 + 当前周报）→ 带「期间」标题行的 CSV 块 */
export function reportsToCsv(monthlyHistory: MonthlyReport[], weekly: WeeklyReport | null): string {
  const blocks: string[] = []
  for (const rep of monthlyHistory) {
    blocks.push(toCsv(['期间'], [[`月度复盘 ${rep.period || rep.month}`]]))
    const body = monthlyReportToCsv(rep)
    if (body) blocks.push(body)
  }
  if (weekly !== null) {
    blocks.push(toCsv(['期间'], [[`周复盘 ${weekly.period}`]]))
    const body = weeklyReportToCsv(weekly)
    if (body) blocks.push(body)
  }
  return joinCsvBlocks(blocks)
}

/** 报表所有层级是否一行数据都没有（决定「无数据可导出」） */
export function reportHasRows(monthlyHistory: MonthlyReport[], weekly: WeeklyReport | null): boolean {
  const anyMonthly = monthlyHistory.some((r) =>
    (r.storeProfit?.length ?? 0) + (r.platformLinks?.length ?? 0) + (r.systemProducts?.length ?? 0) + (r.systemSkus?.length ?? 0) > 0,
  )
  const anyWeekly =
    weekly !== null &&
    (weekly.platformLinks?.length ?? 0) + (weekly.systemProducts?.length ?? 0) + (weekly.systemSkus?.length ?? 0) > 0
  return anyMonthly || anyWeekly
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
