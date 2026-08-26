/**
 * ecommerce-analyst-plugin — 数据导入解析（共享模块）
 *
 * 供两类入口复用同一套解析/规范化逻辑：
 *  1. ecommerce_import_excel 工具（CSV/JSON 文本）
 *  2. 「店铺工作台」本地文件导入（CSV / Excel(.xlsx) / SQL / PDF / JSON / TXT）
 *
 * 所有解析结果统一输出 { products, orders } 领域数组，由 Store 校验后写入。
 */
import type { Order, Product } from './types.ts'

export const PRODUCT_COLUMNS: Record<string, string> = {
  sku: 'sku',
  商品编码: 'sku',
  商品编号: 'sku',
  name: 'name',
  商品名称: 'name',
  商品名: 'name',
  名称: 'name',
  category: 'category',
  类目: 'category',
  分类: 'category',
  商品类目: 'category',
  price: 'price',
  售价: 'price',
  价格: 'price',
  单价: 'price',
  stock: 'stock',
  库存: 'stock',
  库存数量: 'stock',
  数量: 'stock',
  status: 'status',
  状态: 'status',
}

/** 订单表列名别名 */
export const ORDER_COLUMNS: Record<string, string> = {
  order_id: 'order_id',
  订单号: 'order_id',
  订单编号: 'order_id',
  单号: 'order_id',
  buyer: 'buyer',
  买家: 'buyer',
  买家昵称: 'buyer',
  客户: 'buyer',
  sku: 'sku',
  商品编码: 'sku',
  商品编号: 'sku',
  product_name: 'product_name',
  商品名称: 'product_name',
  商品: 'product_name',
  quantity: 'quantity',
  数量: 'quantity',
  件数: 'quantity',
  amount: 'amount',
  金额: 'amount',
  实付: 'amount',
  实付金额: 'amount',
  status: 'status',
  状态: 'status',
  订单状态: 'status',
  created_at: 'created_at',
  下单时间: 'created_at',
  创建时间: 'created_at',
  日期: 'created_at',
}

/** 简单 CSV 解析（RFC 4180 常用子集：引号包裹、转义引号、CRLF） */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      field = ''
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
    } else if (ch !== '\r') {
      field += ch
    }
  }
  row.push(field)
  if (row.some((c) => c.trim() !== '')) rows.push(row)
  return rows
}

/** 把 CSV 表格转成行对象（首行为列头，列名按别名映射） */
export function csvToRows(text: string, alias: Record<string, string>): Record<string, string>[] {
  const cells = parseCsv(text.trim())
  if (cells.length < 2) throw new Error('表格数据为空或缺少表头')
  const header = cells[0].map((h) => h.trim())
  const map: Record<string, string> = {}
  for (let i = 0; i < header.length; i++) {
    const key = alias[header[i]] ?? header[i]
    if (key) map[key] = map[key] ?? String(i)
  }
  const out: Record<string, string>[] = []
  for (let r = 1; r < cells.length; r++) {
    const rowCells = cells[r]
    const obj: Record<string, string> = {}
    for (const [key, idxStr] of Object.entries(map)) {
      const idx = Number(idxStr)
      if (idx < rowCells.length) obj[key] = rowCells[idx]?.trim() ?? ''
    }
    if (Object.values(obj).some((v) => v !== '')) out.push(obj)
  }
  return out
}

/** JSON 行数组（允许字段名别名） */
export function jsonToRows(value: unknown, alias: Record<string, string>): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw new Error('JSON 数据必须是数组')
  return value.map((row) => {
    if (row === null || typeof row !== 'object') throw new Error('JSON 行必须是对象')
    const obj: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
      obj[alias[k] ?? k] = v
    }
    return obj
  })
}

function pick<T>(row: Record<string, unknown>, key: string): T | undefined {
  return row[key] as T | undefined
}

/** 数值：支持 "1,299.00" / "1299" / 1299 */
export function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'number') return value
  const n = Number(String(value).replace(/[,\s¥￥]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

export function toInt(value: unknown): number | undefined {
  const n = toNumber(value)
  if (n === undefined) return undefined
  return Math.trunc(n)
}

export function toIsoDate(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const s = String(value).trim()
  // 兼容 "2026/8/1 10:00"、"2026-08-01 10:00"、"2026-08-01"、ISO
  const m = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
  if (m) {
    const [ , y, mo, d, h = '0', mi = '0', se = '0' ] = m
    const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T${h.padStart(2, '0')}:${mi.padStart(2, '0')}:${se.padStart(2, '0')}.000Z`
    const t = new Date(iso).getTime()
    if (!Number.isNaN(t)) return new Date(t).toISOString()
  }
  const t = new Date(s).getTime()
  if (Number.isNaN(t)) return undefined
  return new Date(t).toISOString()
}

/** 商品状态：on_sale/在售/上架 → on_sale；其余 → off_sale */
function toProductStatus(value: unknown): 'on_sale' | 'off_sale' {
  const s = String(value ?? '').trim().toLowerCase()
  if (s === 'on_sale' || s === '在售' || s === '上架' || s === '在架' || s === '销售中') return 'on_sale'
  return 'off_sale'
}

const ORDER_STATUSES = new Set([
  'pending', 'paid', 'shipped', 'completed', 'refunded', 'cancelled',
])

function toOrderStatus(value: unknown): Order['status'] {
  const s = String(value ?? '').trim().toLowerCase()
  const alias: Record<string, Order['status']> = {
    '待付款': 'pending', '待发货': 'paid', '已付款': 'paid', '已支付': 'paid',
    '已发货': 'shipped', '已完成': 'completed', '交易完成': 'completed',
    '已退款': 'refunded', '退款': 'refunded', '已取消': 'cancelled', '取消': 'cancelled',
  }
  const mapped = alias[s] ?? s
  if (!ORDER_STATUSES.has(mapped)) throw new Error(`订单状态非法：${String(value)}`)
  return mapped as Order['status']
}

/** 字段级校验错误（供导入校验报告使用） */
export interface FieldError {
  /** 数据行号（1 起始；CSV 表头为第 1 行，数据从第 2 行起） */
  row: number
  /** 字段名（如 sku/name/price/stock/amount/quantity/created_at/status） */
  field: string
  /** 失败原因（中文） */
  reason: string
}

/** 校验结果：errors 非空即不可导入；items 为通过字段级校验的行构建的领域对象 */
export interface ValidationResult<T> {
  errors: FieldError[]
  items: T[]
}

/** 单行商品字段校验（收集该行全部字段错误，不抛异常） */
function productErrorsForRow(row: Record<string, unknown>, rowNo: number): FieldError[] {
  const errs: FieldError[] = []
  const sku = String(pick(row, 'sku') ?? '').trim()
  const name = String(pick(row, 'name') ?? '').trim()
  const price = toNumber(pick(row, 'price'))
  const stock = toInt(pick(row, 'stock'))
  if (!sku) errs.push({ row: rowNo, field: 'sku', reason: '缺少 sku（商品编码）列' })
  if (!name) errs.push({ row: rowNo, field: 'name', reason: '缺少名称列' })
  if (price === undefined) errs.push({ row: rowNo, field: 'price', reason: `售价非数字：${String(pick(row, 'price'))}` })
  else if (price < 0) errs.push({ row: rowNo, field: 'price', reason: `售价为负：${price}` })
  if (stock === undefined) errs.push({ row: rowNo, field: 'stock', reason: `库存非整数：${String(pick(row, 'stock'))}` })
  else if (stock < 0) errs.push({ row: rowNo, field: 'stock', reason: `库存为负：${stock}` })
  return errs
}

/** 由通过校验的行构建商品（假定字段合法，不重复校验） */
function buildProductFromRow(row: Record<string, unknown>, now: string): Product {
  return {
    sku: String(pick(row, 'sku') ?? '').trim(),
    name: String(pick(row, 'name') ?? '').trim(),
    category: String(pick(row, 'category') ?? '').trim() || '未分类',
    price: toNumber(pick(row, 'price')) as number,
    stock: toInt(pick(row, 'stock')) as number,
    status: toProductStatus(pick(row, 'status')),
    created_at: now,
    updated_at: now,
  }
}

/** 商品表字段级校验：收集全部行/字段错误 + 跨行 sku 唯一性；无错误时返回全部商品 */
export function validateProducts(rows: Record<string, unknown>[]): ValidationResult<Product> {
  const errors: FieldError[] = []
  const seen = new Set<string>()
  const items: Product[] = []
  const now = new Date().toISOString()
  rows.forEach((row, i) => {
    const rowNo = i + 1
    const sku = String(pick(row, 'sku') ?? '').trim()
    // 跨行 sku 唯一性：与字段错误无关，任何行先出现过的 sku 再次出现即报重复
    if (sku !== '' && seen.has(sku)) {
      errors.push({ row: rowNo, field: 'sku', reason: `sku 重复：${sku}` })
      return
    }
    if (sku !== '') seen.add(sku)
    const rowErrs = productErrorsForRow(row, rowNo)
    if (rowErrs.length > 0) {
      errors.push(...rowErrs)
      return
    }
    items.push(buildProductFromRow(row, now))
  })
  return { errors, items }
}

export function buildProducts(rows: Record<string, unknown>[]): Product[] {
  const now = new Date().toISOString()
  return rows.map((row, i) => {
    const sku = String(pick(row, 'sku') ?? '').trim()
    const errs = productErrorsForRow(row, i + 1)
    if (errs.length > 0) {
      const e = errs[0]
      if (e.field === 'sku') throw new Error('商品缺少 sku（商品编码）列')
      if (e.field === 'name') throw new Error(`商品 ${sku} 缺少名称列`)
      if (e.field === 'price') throw new Error(`商品 ${sku} 售价非法：${String(pick(row, 'price'))}`)
      throw new Error(`商品 ${sku} 库存非法：${String(pick(row, 'stock'))}`)
    }
    return buildProductFromRow(row, now)
  })
}

/** 订单状态别名 → 枚举（校验用，非法返回 null 而非抛错） */
function tryOrderStatus(value: unknown): Order['status'] | null {
  const s = String(value ?? '').trim().toLowerCase()
  if (s === '') return 'pending'
  const alias: Record<string, Order['status']> = {
    '待付款': 'pending', '待发货': 'paid', '已付款': 'paid', '已支付': 'paid',
    '已发货': 'shipped', '已完成': 'completed', '交易完成': 'completed',
    '已退款': 'refunded', '退款': 'refunded', '已取消': 'cancelled', '取消': 'cancelled',
  }
  const mapped = alias[s] ?? s
  return ORDER_STATUSES.has(mapped) ? (mapped as Order['status']) : null
}

/** 单行订单字段校验（收集该行全部字段错误，不抛异常） */
function orderErrorsForRow(row: Record<string, unknown>, rowNo: number): FieldError[] {
  const errs: FieldError[] = []
  const order_id = String(pick(row, 'order_id') ?? '').trim()
  const sku = String(pick(row, 'sku') ?? '').trim()
  const buyer = String(pick(row, 'buyer') ?? '').trim()
  const quantity = toInt(pick(row, 'quantity'))
  const amount = toNumber(pick(row, 'amount'))
  const created_at = toIsoDate(pick(row, 'created_at'))
  const status = tryOrderStatus(pick(row, 'status'))
  if (!order_id) errs.push({ row: rowNo, field: 'order_id', reason: '缺少 order_id（订单号）列' })
  if (!sku) errs.push({ row: rowNo, field: 'sku', reason: '缺少商品编码（sku）列' })
  if (!buyer) errs.push({ row: rowNo, field: 'buyer', reason: '缺少买家列' })
  if (quantity === undefined || quantity < 1) {
    errs.push({ row: rowNo, field: 'quantity', reason: `数量非法：${String(pick(row, 'quantity'))}（需 ≥1 的整数）` })
  }
  if (amount === undefined || amount < 0) {
    errs.push({ row: rowNo, field: 'amount', reason: `金额非法：${String(pick(row, 'amount'))}（需 ≥0 的数字）` })
  }
  if (!created_at) {
    errs.push({ row: rowNo, field: 'created_at', reason: `下单时间非法：${String(pick(row, 'created_at'))}（需 YYYY-MM-DD HH:mm）` })
  }
  if (status === null) {
    errs.push({ row: rowNo, field: 'status', reason: `订单状态非法：${String(pick(row, 'status'))}` })
  }
  return errs
}

/** 由通过校验的行构建订单（假定字段合法） */
function buildOrderFromRow(row: Record<string, unknown>): Order {
  const order_id = String(pick(row, 'order_id') ?? '').trim()
  return {
    order_id,
    buyer: String(pick(row, 'buyer') ?? '').trim(),
    sku: String(pick(row, 'sku') ?? '').trim(),
    product_name: String(pick(row, 'product_name') ?? '').trim(),
    quantity: toInt(pick(row, 'quantity')) as number,
    amount: toNumber(pick(row, 'amount')) as number,
    status: tryOrderStatus(pick(row, 'status')) ?? 'pending',
    created_at: toIsoDate(pick(row, 'created_at')) as string,
  }
}

/**
 * 订单表字段级校验：收集全部行/字段错误 + 跨行订单号唯一性 + 商品引用存在性；
 * 无错误时返回全部订单。knownSkus 为商品表已校验通过的 sku 集合。
 */
export function validateOrders(
  rows: Record<string, unknown>[],
  knownSkus?: Set<string>,
): ValidationResult<Order> {
  const errors: FieldError[] = []
  const seen = new Set<string>()
  const items: Order[] = []
  rows.forEach((row, i) => {
    const rowNo = i + 1
    const order_id = String(pick(row, 'order_id') ?? '').trim()
    // 跨行订单号唯一性：与字段错误无关
    if (order_id !== '' && seen.has(order_id)) {
      errors.push({ row: rowNo, field: 'order_id', reason: `订单号重复：${order_id}` })
      return
    }
    if (order_id !== '') seen.add(order_id)
    const rowErrs = orderErrorsForRow(row, rowNo)
    if (rowErrs.length > 0) {
      errors.push(...rowErrs)
      return
    }
    const sku = String(pick(row, 'sku') ?? '').trim()
    if (knownSkus !== undefined && !knownSkus.has(sku)) {
      errors.push({ row: rowNo, field: 'sku', reason: `引用了不存在的商品 sku：${sku}` })
      return
    }
    items.push(buildOrderFromRow(row))
  })
  return { errors, items }
}

export function buildOrders(rows: Record<string, unknown>[]): Order[] {
  return rows.map((row, i) => {
    const order_id = String(pick(row, 'order_id') ?? '').trim()
    const errs = orderErrorsForRow(row, i + 1)
    if (errs.length > 0) {
      const e = errs[0]
      if (e.field === 'order_id') throw new Error('订单缺少 order_id（订单号）列')
      if (e.field === 'sku') throw new Error(`订单 ${order_id} 缺少商品编码（sku）列`)
      if (e.field === 'buyer') throw new Error(`订单 ${order_id} 缺少买家列`)
      if (e.field === 'quantity') throw new Error(`订单 ${order_id} 数量非法：${String(pick(row, 'quantity'))}`)
      if (e.field === 'amount') throw new Error(`订单 ${order_id} 金额非法：${String(pick(row, 'amount'))}`)
      if (e.field === 'created_at') throw new Error(`订单 ${order_id} 下单时间非法：${String(pick(row, 'created_at'))}`)
      throw new Error(`订单 ${order_id} 状态非法：${String(pick(row, 'status'))}`)
    }
    return buildOrderFromRow(row)
  })
}


﻿
// ─────────────────────────── 便捷入口 ───────────────────────────

export function parseProductsCsv(text: string): Product[] {
  return buildProducts(csvToRows(text, PRODUCT_COLUMNS))
}
export function parseOrdersCsv(text: string): Order[] {
  return buildOrders(csvToRows(text, ORDER_COLUMNS))
}
export function parseProductsJson(value: unknown): Product[] {
  return buildProducts(jsonToRows(value, PRODUCT_COLUMNS))
}
export function parseOrdersJson(value: unknown): Order[] {
  return buildOrders(jsonToRows(value, ORDER_COLUMNS))
}

/** 解析 CSV 文件 → { products?, orders? }（按表头自动识别是商品表还是订单表） */
export function parseCsvFile(text: string): { products?: Product[]; orders?: Order[] } {
  const rows = parseCsv(text.trim())
  if (rows.length < 2) throw new Error('CSV 缺少表头或数据为空')
  const header = rows[0].map((h) => h.trim().toLowerCase())
  // 订单表独有的确定性信号：订单号 / 买家；商品表独有的确定性信号：售价 / 库存
  const hasOrderKey = header.some((h) => /订单号|order_id|买家|buyer/.test(h))
  const hasProductKey = header.some((h) => /售价|price|库存|stock/.test(h))
  // 订单表天然含有「商品编码 / 商品名称」列，不能仅凭出现「商品」就判定为商品表；
  // 因此优先以订单确定性信号判定为订单表，避免误判后按商品解析抛「售价非法」。
  let kind: 'order' | 'product' = 'product'
  if (hasOrderKey && !hasProductKey) kind = 'order'
  else if (hasProductKey && !hasOrderKey) kind = 'product'
  else if (hasOrderKey && hasProductKey) kind = 'order'
  if (kind === 'order') {
    return { orders: buildOrders(csvToRows(text, ORDER_COLUMNS)) }
  }
  return { products: buildProducts(csvToRows(text, PRODUCT_COLUMNS)) }
}

/** 解析 JSON 文件：支持 {products, orders} 备份结构 或 商品/订单行数组 */
export function parseJsonFile(text: string): { products?: Product[]; orders?: Order[] } {
  const data = JSON.parse(text) as unknown
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.products) || Array.isArray(obj.orders)) {
      return {
        products: Array.isArray(obj.products) ? buildProducts(jsonToRows(obj.products, PRODUCT_COLUMNS)) : undefined,
        orders: Array.isArray(obj.orders) ? buildOrders(jsonToRows(obj.orders, ORDER_COLUMNS)) : undefined,
      }
    }
    throw new Error('JSON 备份结构需包含 products/orders 数组')
  }
  // 数组：按行字段自动识别
  return parseRowsArray(data)
}

/** 按行字段自动识别是商品数组还是订单数组 */
export function parseRowsArray(data: unknown): { products?: Product[]; orders?: Order[] } {
  if (!Array.isArray(data) || data.length === 0) throw new Error('JSON 数组为空')
  const first = data[0] as Record<string, unknown>
  const keys = Object.keys(first ?? {}).map((k) => k.toLowerCase())
  const isOrder = keys.some((k) => /order|buyer|amount/.test(k))
  const isProduct = keys.some((k) => /sku|price|stock/.test(k)) && !isOrder
  if (isOrder) return { orders: buildOrders(jsonToRows(data, ORDER_COLUMNS)) }
  if (isProduct) return { products: buildProducts(jsonToRows(data, PRODUCT_COLUMNS)) }
  throw new Error('无法识别 JSON 行数组字段（商品需 sku/price/stock；订单需 order_id/buyer/amount）')
}

// ─────────────────────────── Excel(.xlsx) 解析 ───────────────────────────

/** 解析 Excel 二进制（.xlsx）。xlsx 库按工作表名识别商品/订单表，表头命中即导入。 */
export async function parseExcelBuffer(
  buffer: Buffer | Uint8Array,
): Promise<{ products?: Product[]; orders?: Product[]; orders2?: Order[]; __order?: Order[]; ordersArr?: Order[] } & { products?: Product[]; orders?: Order[] }> {
  let xlsx: typeof import('xlsx')
  try {
    xlsx = await import('xlsx')
  } catch {
    throw new Error('Excel 解析库未安装（node_modules/xlsx 缺失）')
  }
  const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true })
  const sheets = workbook.SheetNames
  if (!Array.isArray(sheets) || sheets.length === 0) {
    throw new Error('无法读取 Excel 文件（文件损坏或格式不支持，请另存为 .xlsx 后重试）')
  }
  const result: { products?: Product[]; orders?: Order[] } = {}
  const findSheet = (names: string[]) => sheets.find((n) => names.some((k) => n.toLowerCase().includes(k)))
  const productSheetName = findSheet(['product', '商品', '库存', 'spu'])
  const orderSheetName = findSheet(['order', '订单', '交易', 'sales'])
  const productSheet = productSheetName ?? (orderSheetName ? undefined : sheets[0])
  const orderSheet = orderSheetName ?? (productSheetName ? undefined : sheets[0])
  if (productSheet && productSheet !== orderSheet) {
    const rows = sheetToRows(xlsx.utils, workbook, productSheet, false)
    if (rows.length > 0) result.products = buildProducts(rows)
  }
  if (orderSheet && orderSheet !== productSheet) {
    const rows = sheetToRows(xlsx.utils, workbook, orderSheet, true)
    if (rows.length > 0) result.orders = buildOrders(rows)
  }
  if (productSheet && orderSheet && productSheet === orderSheet) {
    const rows = sheetToRows(workbook, productSheet)
    if (rows.length > 0) {
      const firstRow = rows[0] as Record<string, unknown>
      const isOrder = Object.keys(firstRow ?? {}).some((k) => /order|buyer|amount/.test(k))
      if (isOrder) result.orders = buildOrders(rows)
      else result.products = buildProducts(rows)
    }
  }
  if (!result.products && !result.orders) {
    throw new Error('Excel 中没有可识别的商品/订单工作表（表头需含 sku/商品/售价 或 订单号/买家/金额）')
  }
  return result
}

function sheetToRows(
  utils: { sheet_to_json: (sheet: unknown, opts: { header: 1; defval: unknown; raw: boolean }) => unknown[][] },
  workbook: { Sheets?: Record<string, unknown> },
  sheetName: string,
  isOrder: boolean,
): Record<string, unknown>[] {
  const sheet = workbook.Sheets?.[sheetName]
  if (!sheet) throw new Error('找不到工作表：' + sheetName)
  const matrix = utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false }) as unknown[][]
  if (matrix.length < 2) return []
  const header = (matrix[0] ?? []).map((h) => String(h ?? '').trim())
  const out: Record<string, unknown>[] = []
  for (let r = 1; r < matrix.length; r++) {
    const rowCells = matrix[r] ?? []
    const obj: Record<string, unknown> = {}
    let has = false
    for (let c = 0; c < header.length; c++) {
      const key = header[c]
      if (!key) continue
      const val = rowCells[c]
      if (val !== '' && val !== undefined && val !== null) {
        obj[(isOrder ? ORDER_COLUMNS : PRODUCT_COLUMNS)[key] ?? key] = val
        has = true
      }
    }
    if (has) out.push(obj)
  }
  return out
}

// ─────────────────────────── SQL 解析 ───────────────────────────

/** 解析 SQL 导出：支持 CREATE TABLE + INSERT INTO products/orders（多行 VALUES、单引号转义）。 */
export function parseSqlText(text: string): { products?: Product[]; orders?: Order[] } {
  const cleaned = text
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
  const result: { products?: Product[]; orders?: Order[] } = {}
  const inserts = [...cleaned.matchAll(/INSERT\s+INTO\s+["'\x60]?([a-zA-Z_][a-zA-Z0-9_]*)["'\x60]?\s*\(([^)]*)\)\s*VALUES\s*([\s\S]*?)(?:;|$)/gi)]
  if (inserts.length === 0) throw new Error('SQL 中未找到 INSERT INTO 语句（需 products/orders 表）')
  for (const m of inserts) {
    const table = m[1].toLowerCase()
    const cols = m[2].split(',').map((c) => c.trim().replace(/["'\x60]/g, ''))
    const alias = table.includes('order') ? ORDER_COLUMNS : PRODUCT_COLUMNS
    const mappedCols = cols.map((c) => alias[c] ?? c)
    const rows = parseSqlValues(m[3])
    const built: Record<string, unknown>[] = rows.map((vals) => {
      const obj: Record<string, unknown> = {}
      mappedCols.forEach((c, i) => { if (c && vals[i] !== undefined) obj[c] = vals[i] })
      return obj
    })
    if (table.includes('order') && built.length) {
      result.orders = buildOrders(built)
    } else if (!table.includes('order') && built.length) {
      result.products = buildProducts(built)
    }
  }
  if (!result.products && !result.orders) throw new Error('SQL 未解析出商品/订单数据')
  return result
}

function parseSqlValues(block: string): unknown[][] {
  const tuples: unknown[][] = []
  let current: unknown[] = []
  let field = ''
  let inStr = false
  let depth = 0
  for (let i = 0; i < block.length; i++) {
    const ch = block[i]
    if (inStr) {
      if (ch === "'") {
        if (block[i + 1] === "'") { field += "'"; i++ } else inStr = false
      } else field += ch
      continue
    }
    if (ch === "'") { inStr = true; continue }
    if (ch === '(') { depth++; if (depth === 1) { current = []; field = '' } continue }
    if (ch === ')') { depth--; if (depth === 0) { current.push(parseSqlValue(field)); tuples.push(current); current = [] } continue }
    if (ch === ',' && depth === 1) { current.push(parseSqlValue(field)); field = ''; continue }
    if (ch === '\n' || ch === '\r') continue
    field += ch
  }
  return tuples
}

function parseSqlValue(raw: string): unknown {
  const s = raw.trim()
  if (s === 'NULL' || s === 'null' || s === '') return ''
  if (s.startsWith("'")) return s.slice(1, -1).replace(/''/g, "'")
  const n = Number(s)
  return Number.isFinite(n) ? n : s
}

// ─────────────────────────── PDF 解析 ───────────────────────────

/** 解析 PDF（文本型，非扫描件）：提取文本后按表头关键词做表格启发式识别。 */
export async function parsePdfBuffer(
  buffer: Buffer | Uint8Array,
): Promise<{ products?: Product[]; orders?: Order[] }> {
  let getDocument: (src: { data: Uint8Array; useWorkerFetch: boolean; isEvalSupported: boolean; disableFontFace: boolean }) => Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: Array<{ str: string }> }> }> }>
  try {
    const mod = await import('pdfjs-dist/legacy/build/pdf.mjs')
    getDocument = mod.getDocument
  } catch {
    throw new Error('PDF 解析库未安装（node_modules/pdfjs-dist 缺失）')
  }
  // pdfjs 4.x：getDocument() 返回加载任务（thenable），必须取 .promise 才能拿到文档代理
  const doc = await getDocument({
    data: new Uint8Array(Buffer.from(buffer)),
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  }).promise
  // 按 y 坐标把文本项归组成表格行（同一行的项按 x 排序拼接），
  // 兼容真实报表导出（每行一个 Td/TJ）与扁平流式 PDF。
  const rowsByPage: string[][] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    type Item = { str: string; transform?: number[] }
    const bands = new Map<number, Array<{ x: number; str: string }>>()
    for (const raw of content.items as unknown as Item[]) {
      if (!raw.str) continue
      const tr = raw.transform
      const y = tr?.[5] ?? 0
      const x = tr?.[4] ?? 0
      const list = bands.get(y) ?? []
      list.push({ x, str: raw.str })
      bands.set(y, list)
    }
    const pageRows = [...bands.entries()]
      .sort((a, b) => b[0] - a[0]) // y 越大越靠上（PDF 坐标系）
      .map(([, items]) => items.sort((a, b) => a.x - b.x).map((i) => i.str).join(' '))
    rowsByPage.push(...pageRows)
  }
  const lines = rowsByPage.map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) throw new Error('PDF 未提取到文本（可能是扫描件/图片型 PDF，请改用 CSV/Excel）')
  const productHeaderIdx = lines.findIndex((l) => /sku|product|商品|售价|price|库存|stock/.test(l) && !/订单|order_id|买家|buyer/.test(l))
  const orderHeaderIdx = lines.findIndex((l) => /订单号|order_id|买家|buyer|金额|amount|实付/.test(l))
  /** 智能行解析：pdfjs 会把行内多空格归一为单空格，按列拆分可能失效。
   *  改为按字段特征识别（sku/订单号/日期/数字），剩余 token 归入名称/买家。 */
  const smartParseLine = (line: string, isOrder: boolean): Record<string, unknown> | null => {
    const tokens = line.split(/\s+/).filter(Boolean)
    if (tokens.length < 2) return null
    const obj: Record<string, unknown> = {}
    if (isOrder) {
      let rest: string[] = [...tokens]
      // order_id：ORD-xxx / 纯字母数字混合
      const oi = rest.findIndex((t) => /^(ORD|ORDER)?[-_]?[A-Za-z0-9]{6,}$/i.test(t))
      if (oi !== -1) { obj.order_id = rest[oi]; rest = rest.filter((_, i) => i !== oi) }
      // created_at：2026-08-20 或 2026/8/20 或 2026.08.20
      const di = rest.findIndex((t) => /^\d{4}[/.\-]\d{1,2}[/.\-]\d{1,2}/.test(t))
      if (di !== -1) { obj.created_at = rest[di]; rest = rest.filter((_, i) => i !== di) }
      // 金额（含小数）与数量（整数）
      const nums = rest.map((t, i) => ({ t, i, n: Number(t.replace(/[,¥￥]/g, '')) }))
        .filter((x) => Number.isFinite(x.n) && x.t !== '')
      if (nums.length >= 2) {
        const amount = nums[nums.length - 1]
        const qty = nums[nums.length - 2]
        obj.amount = amount.t
        obj.quantity = qty.t
        rest = rest.filter((_, i) => i !== amount.i && i !== qty.i)
      }
      if (obj.order_id && obj.amount !== undefined && obj.quantity !== undefined && rest.length > 0) {
        obj.buyer = rest.join(' ')
        return obj
      }
      return null
    }
    // 商品行：sku（可选）+ 名称 + 末尾两个数字（售价/库存）
    let rest: string[] = [...tokens]
    const si = rest.findIndex((t) => /^[A-Za-z0-9]{1,8}[-_][A-Za-z0-9-]{1,12}$/.test(t))
    if (si !== -1) { obj.sku = rest[si]; rest = rest.filter((_, i) => i !== si) }
    const nums = rest.map((t, i) => ({ t, i, n: Number(t.replace(/[,¥￥]/g, '')) }))
      .filter((x) => Number.isFinite(x.n) && x.t !== '')
    if (nums.length >= 2) {
      const stock = nums[nums.length - 1]
      const price = nums[nums.length - 2]
      obj.stock = stock.t
      obj.price = price.t
      rest = rest.filter((_, i) => i !== stock.i && i !== price.i)
    }
    if (rest.length > 0) {
      obj.name = rest.join(' ')
      if (obj.sku || (obj.price !== undefined && obj.stock !== undefined)) return obj
    }
    return null
  }

  const parseTable = (headerIdx: number, isOrder: boolean): Record<string, unknown>[] => {
    if (headerIdx === -1) return []
    const headerCells = lines[headerIdx].split(/\t| {2,}|，|,|\|/).map((c) => c.trim()).filter(Boolean)
    const out: Record<string, unknown>[] = []
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      if (/^第?\d+\s*页|^\s*[-=]{3,}|^合计|^总计/i.test(line)) continue
      // 策略 1：按列拆分（2+ 空格 / 制表符 / 逗号 / 竖线）
      const cells = line.split(/\t| {2,}|，|,|\|/).map((c) => c.trim()).filter(Boolean)
      if (cells.length >= headerCells.length && headerCells.length >= 2) {
        const obj: Record<string, unknown> = {}
        headerCells.forEach((h, c) => {
          const key = (isOrder ? ORDER_COLUMNS : PRODUCT_COLUMNS)[h] ?? h
          if (key && cells[c] !== undefined) obj[key] = cells[c]
        })
        if (Object.keys(obj).length >= 2) { out.push(obj); if (out.length >= 500) break; continue }
      }
      // 策略 2：智能字段识别（单空格归一化场景）
      const smart = smartParseLine(line, isOrder)
      if (smart !== null) { out.push(smart); if (out.length >= 500) break }
    }
    return out
  }
  const productRows = parseTable(productHeaderIdx, false)
  const orderRows = parseTable(orderHeaderIdx, true)
  if (productRows.length === 0 && orderRows.length === 0) {
    throw new Error('PDF 中未识别到商品/订单表格（表头需含 sku/商品/售价 或 订单号/买家/金额）')
  }
  const result: { products?: Product[]; orders?: Order[] } = {}
  if (productRows.length) result.products = buildProducts(productRows)
  if (orderRows.length) result.orders = buildOrders(orderRows)
  return result
}

// ─────────────────────────── 文件入口 ───────────────────────────

export interface ParsedImport {
  products?: Product[]
  orders?: Order[]
  hint: string
}

/** 根据文件名扩展名解析上传内容（content 为 utf8 文本或 base64 二进制） */
export async function parseImportFile(
  filename: string,
  content: string,
  encoding: 'utf8' | 'base64' = 'utf8',
): Promise<ParsedImport> {
  const ext = (filename.split('.').pop() ?? '').toLowerCase()
  const decode = (): string => (encoding === 'base64' ? Buffer.from(content, 'base64').toString('utf8') : content)
  switch (ext) {
    case 'csv':
    case 'txt': {
      const r = parseCsvFile(decode())
      return { ...r, hint: 'CSV 导入：' + (r.products?.length ?? 0) + ' 件商品 / ' + (r.orders?.length ?? 0) + ' 笔订单' }
    }
    case 'json': {
      const r = parseJsonFile(decode())
      return { ...r, hint: 'JSON 导入：' + (r.products?.length ?? 0) + ' 件商品 / ' + (r.orders?.length ?? 0) + ' 笔订单' }
    }
    case 'xlsx':
    case 'xls': {
      const buf = encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content, 'utf8')
      const r = await parseExcelBuffer(buf)
      return { ...r, hint: 'Excel 导入：' + (r.products?.length ?? 0) + ' 件商品 / ' + (r.orders?.length ?? 0) + ' 笔订单' }
    }
    case 'sql': {
      const r = parseSqlText(decode())
      return { ...r, hint: 'SQL 导入：' + (r.products?.length ?? 0) + ' 件商品 / ' + (r.orders?.length ?? 0) + ' 笔订单' }
    }
    case 'pdf': {
      const buf = encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content, 'utf8')
      const r = await parsePdfBuffer(buf)
      return { ...r, hint: 'PDF 导入：' + (r.products?.length ?? 0) + ' 件商品 / ' + (r.orders?.length ?? 0) + ' 笔订单' }
    }
    default:
      throw new Error('暂不支持的文件类型：.' + ext + '（支持 csv/txt/json/xlsx/xls/sql/pdf）')
  }
}
