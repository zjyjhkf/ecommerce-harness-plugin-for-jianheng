/**
 * ecommerce-analyst-plugin — 数据对比引擎（连续两次导入 → 同期对比）
 *
 * 场景：月度数据连续导入两期（如 2026-07 与 2026-06）、周度数据连续导入两周，
 * Store 在导入新周期时把上一期归档（previousMonthlyReport / previousWeeklyReport）。
 * 本模块做「上一期 vs 本期」的**同层级同构对比**：
 *   - 按层级（平台货品链接 / 系统货品 / 系统规格 / 店铺利润）各自对齐行（身份键）；
 *   - 算每行/总体的增减（delta / deltaPct）与名次位移（rankShift，基于指标排序）；
 *   - 输出可直接用于视图排行、接口与模型工具的规范化 CompareResult。
 *
 * 纯函数、无 I/O、不依赖 dsh 上下文，便于单测与复用。
 */
import type { MonthlyReport, WeeklyReport } from './types.ts'

export type CompareCycle = '30d' | '7d'
export type CompareKind = 'platformLinks' | 'systemProducts' | 'systemSkus' | 'storeProfit'
export type CompareUnit = 'money' | 'number' | 'pct'
export type CompareRowState = 'shared' | 'added' | 'removed'

/** 指标定义：unit 决定金额/数值/百分比展示；wavg=true 表示汇总用加权平均（如毛利率、退款率、客单价） */
export interface CompareMetricDef {
  id: string
  label: string
  unit: CompareUnit
  /** 是否为比例/单价类（按销售额加权汇总，而非简单求和） */
  wavg?: boolean
  /** 加权汇总所用权数字段，缺省 sales（客单价用销售件数） */
  weight?: string
}

/** 单个对象（商品/链接/SKU/店铺）的对比行 */
export interface CompareRow {
  key: string
  label: string
  /** 上期该指标值；行在上期不存在（新上榜）为 null */
  prev: number | null
  /** 本期该指标值；行在本期退出为 null */
  curr: number | null
  /** 增减 = 本期 - 上期（比率类单位为百分点）；单边缺失时按另一侧视作 0 */
  delta: number
  /** 相对增减率 %（上期>0 时）；比率类指标/上期为 0 时为 null */
  deltaPct: number | null
  /** 上期名次（按该指标排序，1 开始）；本期退出为 null */
  rankPrev: number | null
  /** 本期名次；新上榜为 null */
  rankCurr: number | null
  /** 名次位移 = rankPrev - rankCurr（正 = 名次上升） */
  rankShift: number | null
  state: CompareRowState
  /** 品类（源表「分类」列；店铺层级无此列 → 空串，面板会据此剔除整列） */
  category: string
  /** 编号（链接用 linkCode/linkId，货品与规格用 code；店铺层级无此列 → 空串） */
  code: string
  /** 上期毛利率 %（= Σ毛利额 ÷ Σ净销售额，源表两列真实数据；上期不存在为 null） */
  prevMargin: number | null
  /** 本期毛利率 %（同上） */
  currMargin: number | null
}

export interface CompareSummary {
  prevTotal: number
  currTotal: number
  delta: number
  deltaPct: number | null
  /** 两期都存在的对象数（参与名次位移统计） */
  matched: number
  /** 本期新增（上期无） */
  added: number
  /** 本期退出（上期有） */
  removed: number
  /** 名次上升对象数 */
  rankUp: number
  /** 名次下降对象数 */
  rankDown: number
}

export interface CompareResult {
  cycle: CompareCycle
  kind: CompareKind
  kindLabel: string
  metric: string
  metricLabel: string
  unit: CompareUnit
  prevPeriod: string
  currPeriod: string
  summary: CompareSummary
  /** 按 |delta| 降序，已截取前 limit 行 */
  rows: CompareRow[]
}

export const COMPARE_KIND_LABELS: Record<CompareKind, string> = {
  platformLinks: '平台货品（链接）',
  systemProducts: '系统货品',
  systemSkus: '系统规格',
  storeProfit: '店铺利润',
}

/** 各层级默认的对比层级顺序（缺省 kind 时的自动选择优先级） */
export const COMPARE_KIND_ORDER: CompareKind[] = [
  'platformLinks',
  'systemProducts',
  'systemSkus',
  'storeProfit',
]

const metric = (id: string, label: string, unit: CompareUnit, wavg = false, weight = 'sales'): CompareMetricDef => ({
  id,
  label,
  unit,
  wavg,
  weight,
})

/** 各层级可选对比指标目录（字段名与 types.ts 行对象字段一致，缺失自动跳过）。
 *  v0.4.0 精简：删除正向销售收入/仓库物流费/毛利率/客单价/浏览量/销售件数等非核心按键，
 *  全层级统一保留核心五类——销售额 / 净销额 / 毛利 / 推广费 / 退款率（利润表层级再加费比）。 */
const CORE_ROW_METRICS: CompareMetricDef[] = [
  metric('sales', '销售额', 'money'),
  metric('netSales', '净销额', 'money'),
  metric('grossProfit', '毛利', 'money'),
  metric('adSpend', '推广费', 'money'),
  metric('refundRate', '退款率', 'pct', true),
]
export const COMPARE_METRICS: Record<CompareKind, CompareMetricDef[]> = {
  platformLinks: CORE_ROW_METRICS,
  systemProducts: CORE_ROW_METRICS,
  systemSkus: CORE_ROW_METRICS,
  storeProfit: [
    metric('sales', '销售收入', 'money'),
    metric('netSales', '净销额', 'money'),
    metric('grossProfit', '毛利', 'money'),
    metric('promoCost', '推广费', 'money'),
    metric('feeRatio', '费比', 'pct', true),
  ],
}

// ─────────────────────────── 月度趋势（数据对比：柱状按月对比 + 折线随月推进） ───────────────────────────

/** 趋势核心指标按键（用户指定：净销额/产品规格数/推广费 + 拆开的毛利与费比 + 销售额兜底） */
export interface TrendMetricDef {
  id: 'netSales' | 'skuCount' | 'promoCost' | 'grossProfit' | 'feeRatio' | 'sales'
  label: string
  unit: CompareUnit
}
export const CORE_TREND_METRICS: TrendMetricDef[] = [
  { id: 'netSales', label: '净销额', unit: 'money' },
  { id: 'skuCount', label: '产品规格数', unit: 'number' },
  { id: 'promoCost', label: '推广费', unit: 'money' },
  { id: 'grossProfit', label: '毛利', unit: 'money' },
  { id: 'feeRatio', label: '费比', unit: 'pct' },
]

/** 单个月份的趋势聚合点（缺失数据源的字段为 null，前端跳过该月柱/点） */
export interface MonthTrendPoint {
  period: string
  /** 月份标签，如 "2026-07" */
  month: string
  /** 展示短标签，如 "7月" */
  label: string
  sales: number | null
  netSales: number | null
  grossProfit: number | null
  promoCost: number | null
  feeRatio: number | null
  skuCount: number | null
  /** 该点取数的层级（与「对比明细」同一张排名表）；无排名表时为 null */
  source: CompareKind | null
}

const round1 = (n: number): number => Math.round(n * 10) / 10

/** 趋势点可聚合的排名表行（三层级的行结构在销售/净销/毛利/推广上同构） */
interface TrendRow {
  sales: number
  netSales: number
  grossProfit: number
  adSpend: number
}

/**
 * 从单份月报聚合出趋势点。
 *
 * ⚠ 口径（必须与「对比明细」严格同源）：趋势 KPI 与下方明细表要来自**同一张排名表**。
 *   此前趋势优先取「利润表」、明细取排名表，同一个「净销额」在同一屏出现两个数
 *   （实测 8 月 3,365,396 vs 4,492,466，差 112.7 万），费比也随之从 12.19% 变成 16.19%。
 *   现统一为排名表：层级优先 平台链接 → 系统货品 → 系统规格，可由 kind 指定；
 *   利润表不参与本趋势（它是「发货口径」财务表，与排名表的商品口径本就不同，
 *   仅用于经销排行与概览条的店铺分支，那里费比=推广费÷销售收入）。
 *
 * ⚠ 净销额直接取表内「净销售额」列求和，**不再用 销售额−退款 反算**：
 *   WeeklyProductRow 根本没有 refundAmount 字段，反算会把退款当 0（货品/规格层级虚高）。
 *
 * ⚠ 费比 = 推广投放费用 ÷ 净销售额 ×100（分母是净销售额，不是销售额）。
 */
export function buildMonthTrendPoint(rep: MonthlyReport, kind?: CompareKind): MonthTrendPoint {
  const sum = function <T>(rows: T[] | undefined, f: (r: T) => number): number | null {
    if (!rows || rows.length === 0) return null
    let s = 0
    for (const r of rows) s += Number(f(r)) || 0
    return s
  }
  const month = rep.month || String(rep.period || '').slice(0, 7)
  const mm = Number(month.slice(5, 7))
  const label = Number.isFinite(mm) && mm > 0 ? mm + '月' : month
  const links = rep.platformLinks
  const products = rep.systemProducts
  const skus = rep.systemSkus
  const pick: { kind: CompareKind; rows: unknown[] | undefined } =
    kind === 'systemSkus' ? { kind: 'systemSkus', rows: skus }
      : kind === 'systemProducts' ? { kind: 'systemProducts', rows: products }
        : kind === 'platformLinks' ? { kind: 'platformLinks', rows: links }
          : links && links.length ? { kind: 'platformLinks', rows: links }
            : products && products.length ? { kind: 'systemProducts', rows: products }
              : skus && skus.length ? { kind: 'systemSkus', rows: skus }
                : { kind: 'platformLinks', rows: undefined }
  const rows = pick.rows as TrendRow[] | undefined
  const sales = sum(rows, (r) => r.sales)
  const netSales = sum(rows, (r) => r.netSales)
  const grossProfit = sum(rows, (r) => r.grossProfit)
  const promoCost = sum(rows, (r) => r.adSpend)
  const feeRatio = promoCost !== null && netSales !== null && netSales > 0 ? round1((promoCost / netSales) * 100) : null
  return {
    period: rep.period || '',
    month,
    label,
    sales,
    netSales,
    grossProfit,
    promoCost,
    feeRatio,
    skuCount: skus ? skus.length : null,
    source: rows ? pick.kind : null,
  }
}

/** 对多月份归档按升序产出趋势点序列（数据对比视图的柱状/折线数据源） */
export function buildMonthTrend(history: MonthlyReport[], kind?: CompareKind): MonthTrendPoint[] {
  return history
    .filter((r) => r !== null && typeof r.period === 'string' && r.period !== '')
    .slice()
    .sort((a, b) => (a.period < b.period ? -1 : a.period > b.period ? 1 : 0))
    .map((r) => buildMonthTrendPoint(r, kind))
}

export function listCompareMetrics(kind: CompareKind): CompareMetricDef[] {
  return COMPARE_METRICS[kind] ?? []
}

export function listCompareKinds(): CompareKind[] {
  return [...COMPARE_KIND_ORDER]
}

export function compareKindLabel(kind: CompareKind): string {
  return COMPARE_KIND_LABELS[kind] ?? kind
}

/** 读取周期内某层级章节（月报 storeProfit / 链接等；周报无 storeProfit） */
function chapterRows(report: unknown, kind: CompareKind): unknown[] | undefined {
  if (report === null || typeof report !== 'object') return undefined
  if (kind === 'storeProfit') {
    return (report as MonthlyReport).storeProfit
  }
  const arr = (report as unknown as Record<string, unknown>)[kind]
  return Array.isArray(arr) ? (arr as unknown[]) : undefined
}

/** 行身份键：链接用链接ID（空则名称+店铺），货品用编号（空则名称），SKU 用商家编码（空则名称+规格），店铺用店名 */
function keyOf(kind: CompareKind, row: Record<string, unknown>): string {
  const s = (v: unknown): string => String(v ?? '').trim()
  if (kind === 'platformLinks') {
    const id = s(row.linkId)
    if (id) return 'id:' + id
    return 'nm:' + s(row.linkName) + '|' + s(row.shop)
  }
  if (kind === 'systemProducts') {
    const code = s(row.code)
    if (code) return 'code:' + code
    return 'nm:' + s(row.name)
  }
  if (kind === 'systemSkus') {
    const code = s(row.code)
    if (code) return 'code:' + code
    return 'nm:' + s(row.name) + '|' + s(row.specName)
  }
  return 'nm:' + s(row.store)
}

/** 行展示名（比键更可读） */
function labelOf(kind: CompareKind, row: Record<string, unknown>): string {
  const s = (v: unknown): string => String(v ?? '').trim()
  if (kind === 'platformLinks') return s(row.linkName) || s(row.linkId)
  if (kind === 'systemProducts') return s(row.name)
  if (kind === 'systemSkus') return s(row.name) ? s(row.name) + (s(row.specName) ? ' · ' + s(row.specName) : '') : s(row.specName)
  return s(row.store)
}

/** 数值提取（金额/数量/百分比均已由解析器归一为 number） */
function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** 归一化一章行为 {key,label,value,weight} 列表（身份键重复行按指标值求和聚合成一条） */
/** 归一化后的对比条目：指标值 + 身份列（品类/编号）+ 毛利率所需的两列分子分母 */
interface NormEntry {
  key: string
  label: string
  value: number
  weight: number
  category: string
  code: string
  /** Σ毛利额 / Σ净销售额：两列都来自源表，用于逐行毛利率（不是估算） */
  gp: number
  net: number
}

/** 身份列取值：链接层级用 linkCode/linkId，货品与规格用 code，店铺层级没有编号 */
function codeOf(kind: CompareKind, row: Record<string, unknown>): string {
  if (kind === 'storeProfit') return ''
  if (kind === 'platformLinks') return String(row.linkCode ?? row.linkId ?? '').trim()
  return String(row.code ?? '').trim()
}
/** 净销售额：有「净销售额」列就用它；没有（利润表逐店）才回退 销售额−退款 */
function netOf(row: Record<string, unknown>): number {
  if (row.netSales !== undefined && row.netSales !== null && String(row.netSales).trim() !== '') return num(row.netSales)
  const refund = row.refund ?? row.refundAmount ?? 0
  return num(row.sales) - num(refund)
}

function normalize(
  kind: CompareKind,
  rows: unknown[] | undefined,
  def: CompareMetricDef,
): NormEntry[] {
  const out = new Map<string, NormEntry>()
  for (const raw of rows ?? []) {
    if (raw === null || typeof raw !== 'object') continue
    const row = raw as Record<string, unknown>
    // 该层级所需的身份列至少一项非空才参与（字符串身份列不能被 Number() 判定，否则误杀全部行）
    const present = (...fields: unknown[]): boolean =>
      fields.some((f) => String(f ?? '').trim() !== '')
    if (kind === 'platformLinks' && !present(row.linkId, row.linkName, row.shop)) continue
    if (kind === 'systemProducts' && !present(row.code, row.name)) continue
    if (kind === 'systemSkus' && !present(row.code, row.name, row.specName)) continue
    if (kind === 'storeProfit' && !present(row.store)) continue
    const key = keyOf(kind, row)
    const value = num(row[def.id])
    // 加权因子：比例/单价类指标才需要；缺权数字段回退 sales
    const weightField = def.weight ?? 'sales'
    const weight = num(row[weightField])
    const category = String(row.category ?? '').trim()
    const code = codeOf(kind, row)
    const gp = num(row.grossProfit)
    const net = netOf(row)
    const cur = out.get(key)
    if (cur) {
      cur.value += value
      cur.weight += weight
      cur.gp += gp
      cur.net += net
      if (!cur.category && category) cur.category = category
      if (!cur.code && code) cur.code = code
    } else {
      out.set(key, { key, label: labelOf(kind, row) || key, value, weight, category, code, gp, net })
    }
  }
  return [...out.values()]
}

/** 汇总某期数值：求和或按权重平均 */
function aggregate(def: CompareMetricDef, entries: Array<{ value: number; weight: number }>): number {
  if (def.wavg) {
    const w = entries.reduce((s, e) => s + e.weight, 0)
    if (w <= 0) return 0
    return entries.reduce((s, e) => s + e.value * e.weight, 0) / w
  }
  return entries.reduce((s, e) => s + e.value, 0)
}

/** 排序名次（1 起）：排名类（退款率等费率列）与金额类同样降序——排行越靠前值越大 */
function rankOf(values: number[]): number[] {
  const order = values
    .map((v, i) => ({ v, i }))
    .sort((a, b) => b.v - a.v)
  const rank = new Array<number>(values.length)
  order.forEach((o, pos) => {
    rank[o.i] = pos + 1
  })
  return rank
}

export interface CompareInput {
  cycle: CompareCycle
  kind: CompareKind
  metricId: string
  prevReport: unknown
  currReport: unknown
  /** 返回行数上限（默认 100） */
  limit?: number
}

/**
 * 生成「上期 vs 本期」对比结果。任一侧对应章节为空/缺失 → null。
 * rows 按 |delta| 降序截取前 limit 行（变化最大者置顶）。
 */
export function buildCompare(input: CompareInput): CompareResult | null {
  const { cycle, kind, metricId, prevReport, currReport } = input
  const defs = COMPARE_METRICS[kind]
  if (!defs) return null
  const def = defs.find((m) => m.id === metricId) ?? defs[0]
  if (!def) return null
  const prevRows = chapterRows(prevReport, kind)
  const currRows = chapterRows(currReport, kind)
  if (!Array.isArray(prevRows) || !Array.isArray(currRows)) return null
  if (prevRows.length === 0 && currRows.length === 0) return null
  // 两期均无该层 → 无对比对象
  const prevEntries = normalize(kind, prevRows, def)
  const currEntries = normalize(kind, currRows, def)
  if (prevEntries.length === 0 && currEntries.length === 0) return null

  const prevMap = new Map(prevEntries.map((e) => [e.key, e]))
  const currMap = new Map(currEntries.map((e) => [e.key, e]))

  // 名次：基于各期内部该指标的取值（用归一化前的 value）
  const rankOfEntries = (entries: Array<{ key: string; value: number }>): Map<string, number> => {
    const values = entries.map((e) => e.value)
    const ranks = rankOf(values)
    const map = new Map<string, number>()
    entries.forEach((e, i) => map.set(e.key, ranks[i]))
    return map
  }
  const prevRank = rankOfEntries(prevEntries)
  const currRank = rankOfEntries(currEntries)

  const rows: CompareRow[] = []
  let matched = 0
  let added = 0
  let removed = 0
  let rankUp = 0
  let rankDown = 0
  const allKeys = new Set([...prevMap.keys(), ...currMap.keys()])
  for (const key of allKeys) {
    const p = prevMap.get(key)
    const c = currMap.get(key)
    let state: CompareRowState
    let prevV: number | null
    let currV: number | null
    if (p && c) {
      state = 'shared'
      matched++
      prevV = p.value
      currV = c.value
      const rp = prevRank.get(key)
      const rc = currRank.get(key)
      if (rp !== undefined && rc !== undefined && rp !== rc) {
        if (rc < rp) rankUp++
        else rankDown++
      }
    } else if (c) {
      state = 'added'
      added++
      prevV = null
      currV = c.value
    } else {
      state = 'removed'
      removed++
      prevV = p!.value
      currV = null
    }
    const a = prevV ?? 0
    const b = currV ?? 0
    const delta = b - a
    const deltaPct = def.unit === 'pct' || a === 0 ? null : (delta / a) * 100
    // 毛利率 = Σ毛利额 ÷ Σ净销售额（两列均来自源表，非估算）；缺一侧为 null，面板显示 "— → x%"
    const marginOf = (e: { gp: number; net: number } | undefined): number | null =>
      e && e.net > 0 ? round1((e.gp / e.net) * 100) : null
    rows.push({
      key,
      label: (p ?? c)!.label,
      prev: prevV,
      curr: currV,
      delta,
      deltaPct,
      rankPrev: p ? prevRank.get(key) ?? null : null,
      rankCurr: c ? currRank.get(key) ?? null : null,
      rankShift: p && c ? (prevRank.get(key) ?? 0) - (currRank.get(key) ?? 0) : null,
      state,
      category: (p ?? c)!.category,
      code: (p ?? c)!.code,
      prevMargin: marginOf(p),
      currMargin: marginOf(c),
    })
  }

  const prevTotal = aggregate(def, prevEntries)
  const currTotal = aggregate(def, currEntries)
  const delta = currTotal - prevTotal
  const deltaPct = def.unit === 'pct' || prevTotal === 0 ? null : (delta / prevTotal) * 100

  const limit = Math.max(1, Math.min(input.limit ?? 100, 1000))
  const sorted = rows.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta)).slice(0, limit)
  const prevPeriod = periodLabel(prevReport)
  const currPeriod = periodLabel(currReport)

  return {
    cycle,
    kind,
    kindLabel: compareKindLabel(kind),
    metric: def.id,
    metricLabel: def.label,
    unit: def.unit,
    prevPeriod,
    currPeriod,
    summary: { prevTotal, currTotal, delta, deltaPct, matched, added, removed, rankUp, rankDown },
    rows: sorted,
  }
}

/** 取报告周期标签：月报 period（如 2026-07-01~2026-07-31），周报 period 同理；缺省回退显示名 */
function periodLabel(report: unknown): string {
  if (report === null || typeof report !== 'object') return ''
  const rep = report as { period?: unknown; month?: unknown }
  return String(rep.period ?? rep.month ?? '')
}

/** 自动挑选当前周期内「两期都有数据」的对比层级（缺省 kind 用）；无可用层级返回第一个有层级顺序 */
export function pickCompareKind(cycle: CompareCycle, prevReport: unknown, currReport: unknown): CompareKind {
  const kinds = cycle === '7d' ? COMPARE_KIND_ORDER.filter((k) => k !== 'storeProfit') : COMPARE_KIND_ORDER
  for (const k of kinds) {
    const p = chapterRows(prevReport, k)
    const c = chapterRows(currReport, k)
    if (Array.isArray(p) && Array.isArray(c) && p.length > 0 && c.length > 0) return k
  }
  // 两期仅一侧有数据的层（此时 buildCompare 结果缺一侧 → 上层置 hasCompare=false / 提示）
  for (const k of kinds) {
    const p = chapterRows(prevReport, k)
    const c = chapterRows(currReport, k)
    if (Array.isArray(p) && p.length > 0 && Array.isArray(c) && c.length > 0) continue
    if ((Array.isArray(p) && p.length > 0) || (Array.isArray(c) && c.length > 0)) return k
  }
  return kinds[0]
}

/** 报告 → 各层级可用性（供视图/接口渲染层级切换钮） */
export function reportKindsAvail(
  cycle: CompareCycle,
  prevReport: unknown,
  currReport: unknown,
): Array<{ kind: CompareKind; label: string; prev: number; curr: number }> {
  const kinds = cycle === '7d' ? COMPARE_KIND_ORDER.filter((k) => k !== 'storeProfit') : COMPARE_KIND_ORDER
  return kinds.map((k) => {
    const p = chapterRows(prevReport, k)
    const c = chapterRows(currReport, k)
    return {
      kind: k,
      label: compareKindLabel(k),
      prev: Array.isArray(p) ? p.length : 0,
      curr: Array.isArray(c) ? c.length : 0,
    }
  })
}

export type { MonthlyReport, WeeklyReport }
