/**
 * ecommerce-analyst-plugin — 数据对比接口/工具共享解析
 *
 * 把 Store 的「当前期 vs 上一期」组合成前端/模型统一的 ComparePayload：
 *  - hasPrev：是否已导入第二期（无上一期则对比无从谈起）
 *  - kinds：当前周期各层级的可对比概况（两期行数，供视图渲染切换钮）
 *  - metrics：所选层级的可选指标清单
 *  - result：buildCompare 的规范结果（含汇总 + 排行行）；所选层级两期仅一侧有数据时为 null
 *
 * 30d → 月度当前/上一期月报；7d → 周度当前/上一期周报。
 */
import type { EcommerceStore } from './store.ts'
import {
  buildCompare,
  buildMonthTrend,
  CORE_TREND_METRICS,
  listCompareMetrics,
  pickCompareKind,
  reportKindsAvail,
  type CompareCycle,
  type CompareKind,
  type CompareResult,
  type MonthTrendPoint,
  type TrendMetricDef,
} from './compare.ts'

export interface ComparePayload {
  hasPrev: boolean
  prevPeriod: string
  currPeriod: string
  kinds: Array<{ kind: CompareKind; label: string; prev: number; curr: number }>
  metrics: Array<{ id: string; label: string; unit: string }>
  result: CompareResult | null
  /** 月度趋势（30d）：多月份归档按升序聚合；7d 无月度趋势 → 空数组 */
  trend: MonthTrendPoint[]
  /** 趋势核心指标按键目录（净销额/产品规格数/推广费/毛利/费比） */
  trendMetrics: TrendMetricDef[]
  /** 是否满足「数据对比模块出现」条件：至少两期归档（连续导入两月） */
  showModule: boolean
}

const CYCLES: CompareCycle[] = ['30d', '7d']
const KINDS: CompareKind[] = ['platformLinks', 'systemProducts', 'systemSkus', 'storeProfit']

export function isCompareCycle(v: string): v is CompareCycle {
  return (CYCLES as string[]).indexOf(v) !== -1
}
export function isCompareKind(v: string): v is CompareKind {
  return (KINDS as string[]).indexOf(v) !== -1
}

/** 从 Store 当前/上一期报表生成对比负载（kind/metric 缺省自动选择） */
export function buildComparePayload(
  store: EcommerceStore,
  cycle: CompareCycle,
  kind?: string,
  metricId?: string,
  limit = 100,
): ComparePayload {
  const prevReport = cycle === '7d' ? store.getPreviousWeeklyReport() : store.getPreviousMonthlyReport()
  const currReport = cycle === '7d' ? store.getWeeklyReport() : store.getMonthlyReport()
  const kinds = reportKindsAvail(cycle, prevReport, currReport)
  // 有效 kind：显式给定且在该周期层级内；否则自动挑选两期都有数据的层级
  const effectiveKind: CompareKind = kind !== undefined && isCompareKind(kind) ? kind : pickCompareKind(cycle, prevReport, currReport)
  // 月度趋势仅 30d 有意义：多月份归档（含当前期）升序聚合；7d 返回空数组。
  // ⚠ 必须传 effectiveKind：趋势 KPI 与下方明细表取自同一张排名表，
  //   否则同一个「净销额」会在同一屏出现两个数（利润表口径 vs 排名表口径）。
  const trend: MonthTrendPoint[] = cycle === '30d' ? buildMonthTrend(store.getMonthlyHistory(), effectiveKind) : []
  const defs = listCompareMetrics(effectiveKind)
  const def = defs.find((m) => m.id === metricId) ?? defs[0]
  const result = buildCompare({
    cycle,
    kind: effectiveKind,
    metricId: def ? def.id : 'sales',
    prevReport,
    currReport,
    limit,
  })
  return {
    hasPrev: prevReport !== null,
    prevPeriod: (prevReport && prevReport.period) || '',
    currPeriod: (currReport && currReport.period) || '',
    kinds,
    metrics: defs.map((m) => ({ id: m.id, label: m.label, unit: m.unit })),
    result,
    trend,
    trendMetrics: CORE_TREND_METRICS,
    // 模块出现条件（严格隔离）：30d 需连续导入 ≥2 个月归档；7d 需存在上一期且两期有可比对象。
    // 一键清除后归档为空 → hasPrev=false、trend=[]、result=null → showModule=false，菜单必隐藏。
    showModule: cycle === '30d' ? trend.length >= 2 : prevReport !== null && result !== null,
  }
}

/** 判断某层级两侧是否都具备对比数据（供视图决定可切换层级） */
export function kindBothSides(payload: ComparePayload, kind: string): boolean {
  const k = payload.kinds.find((x) => x.kind === kind)
  return Boolean(k && k.prev > 0 && k.curr > 0)
}
