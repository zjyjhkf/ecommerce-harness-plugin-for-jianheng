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

// ─────────────────────────── 月度复盘（「月度表」4 份文件：3 份「商品排名导出」+ 1 份「利润表」） ───────────────────────────

/** 月度系统规格行（SKU 级，26 列）。与周表（29 列）相比少了「平台服务费/平台运营费用/软件服务费」三列，
 *  其余列顺序一致；费用结构仅「推广投放费用/线下费用/其他」三项。 */
export interface MonthlySkuRow {
  name: string // 系统货品名称（所属货品）
  specName: string // 系统规格名称
  code: string // 商家编码
  brand: string
  category: string
  salesRank: number // 排名（销售额）
  sales: number
  countRank: number // 排名（销售件数）
  salesCount: number
  salesCost: number
  profitRank: number // 排名（毛利额）
  grossProfit: number
  marginRank: number // 排名（毛利率）
  grossMargin: number // %
  refundAmount: number
  refundRate: number // %
  returnRate: number // 退货比例 %
  preShipRefundRate: number // 发货前退款率 %
  postShipRefundRate: number // 发货后退款率 %
  receivedRefundRate: number // 收货后退款率 %
  netSales: number
  netCost: number
  adSpend: number // 推广投放费用
  offlineFee: number // 线下费用
  otherFee: number // 其他
  avgPrice: number
}

/** 月度店铺利润行（「利润表」sheet：核算项目 × 逐店铺列，逐店抽取）。供「经销排行」用。 */
export interface MonthlyStoreProfit {
  store: string
  sales: number // 一、销售收入
  positiveSales: number // 正向销售收入(不含特殊单)
  refund: number // 退款
  grossProfit: number // 四、毛利
  grossMargin: number // 五、销售毛利率 %
  logisticsCost: number // 六、仓库物流费用
  promoCost: number // 七、运营推广费用
  /** 费比 = 运营推广费用 ÷ 销售收入 ×100（%） */
  feeRatio: number
}

/** 月度复盘报告（「月度表」合并结果）。三份「商品排名导出」按展示形式分章节，另加「利润表」逐店经销数据。 */
export interface MonthlyReport {
  /** 日期跨度，如 "2026-07-01~2026-07-31" */
  period: string
  /** 月份标签，如 "2026-07"（由 period 派生） */
  month: string
  updatedAt: string
  shops: string[]
  /** 最近一次导入的层级（分次导入不同「商品排名导出」文件时，主口径随之切换） */
  lastKind?: 'platformLinks' | 'systemProducts' | 'systemSkus'
  platformLinks?: WeeklyLinkRow[] // 平台货品（链接级）= 商品个体
  systemProducts?: WeeklyProductRow[] // 系统货品（货品级）= 货品归纳（同类商品总和）
  systemSkus?: MonthlySkuRow[] // 系统规格（SKU级）
  storeProfit?: MonthlyStoreProfit[] // 经销（利润表逐店铺）
}

// ─────────────────────────── 周复盘（「周数据」下三份「商品排名导出」文件） ───────────────────────────

/** 平台货品排行行（链接级，展示形式=平台货品） */
export interface WeeklyLinkRow {
  shop: string
  linkName: string
  linkId: string
  linkCode: string
  linkTag: string
  sales: number
  salesCount: number
  salesCost: number
  grossProfit: number
  grossMargin: number // %
  refundAmount: number
  refundRate: number // %
  returnRate: number // %
  netSales: number
  adSpend: number
  fullConv: number // 全链路支付转化率 %
  realConv: number // 真实支付转化率 %
  views: number // 浏览量
  visitors: number // 访客数
  favCount: number // 收藏人数
  favRate: number // 收藏率 %
  cartCount: number // 加购人数
  cartQty: number // 加购件数
  cartRate: number // 加购率 %
  orderCount: number // 下单人数
  orderQty: number // 下单件数
  orderRate: number // 下单率 %
  payCount: number // 支付人数
  payQty: number // 支付件数
  payRate: number // 支付率 %
  searchVisitors: number // 搜索引导访客数
  searchPayCount: number // 搜索引导支付人数
  searchConv: number // 搜索引导支付转化率 %
  avgPrice: number
}

/** 系统货品排行行（货品级，展示形式=系统货品） */
export interface WeeklyProductRow {
  name: string
  code: string
  brand: string
  category: string
  sales: number
  grossProfit: number
  grossMargin: number // %
  refundRate: number // %
  returnRate: number // %
  netSales: number
  adSpend: number
  avgPrice: number
  singleRate: number // 单件率 %
}

/** 系统规格排行行（SKU级，展示形式=系统规格） */
export interface WeeklySkuRow {
  name: string
  specName: string
  code: string
  brand: string
  category: string
  salesRank: number
  sales: number
  countRank: number
  salesCount: number
  salesCost: number
  profitRank: number
  grossProfit: number
  marginRank: number
  grossMargin: number // %
  refundAmount: number
  refundRate: number // %
  returnRate: number // %
  preShipRefundRate: number // 发货前退款率 %
  postShipRefundRate: number // 发货后退款率 %
  receivedRefundRate: number // 收货后退款率 %
  netSales: number
  netCost: number
  platformFee: number // 平台服务费
  platformOperFee: number // 平台运营费用
  softwareFee: number // 软件服务费
  adSpend: number // 推广投放费用
  offlineFee: number // 线下费用
  otherFee: number // 其他费用
  avgPrice: number
}

/** 周复盘报告（三份「商品排名导出」合并；按展示形式分章节） */
export interface WeeklyReport {
  period: string // 如 "2026-08-16~2026-08-22"
  updatedAt: string
  shops: string[]
  /** 最近一次导入的层级：分次导入不同「商品排名导出」文件时，主口径随之切换，
   *  前端据此把「销售概览」的主 KPI 切到最新文件对应层级，避免「导入不同文件面板不变」。 */
  lastKind?: 'platformLinks' | 'systemProducts' | 'systemSkus'
  platformLinks?: WeeklyLinkRow[] // 平台货品
  systemProducts?: WeeklyProductRow[] // 系统货品
  systemSkus?: WeeklySkuRow[] // 系统规格
}
