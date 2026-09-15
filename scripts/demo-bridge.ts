/**
 * v0.4.1 离线 Demo 桥：拦截「电商数据中台」页面的 4 个面板 API，
 * 用内嵌示例数据动态响应（层级/指标/周期切换依旧实时计算，与线上行为一致）。
 * 数据由 scripts/export-demo.mjs 以生产解析链路生成后内嵌为 window.__DEMO__。
 * bundle 后以 globalName=DEMOBRIDGE 暴露 handle()。
 */
import { buildComparePayload, isCompareCycle } from '../src/compare-payload.ts'
import { buildEvaluationSummary, ruleBasedEvaluation } from '../src/data-evaluation.ts'

interface DemoData {
  monthly: unknown
  prevMonthly: unknown
  weekly: unknown
  prevWeekly: unknown
}

const D = (globalThis as Record<string, unknown>).__DEMO__ as DemoData | undefined

const J = (v: unknown): string => JSON.stringify(v)

/** 返回 JSON 字符串；null 表示放行（非面板 API） */
export function handle(rawUrl: string): string | null {
  if (D === undefined) return null
  let u: URL
  try {
    u = new URL(rawUrl, 'http://demo.local')
  } catch {
    return null
  }
  const p = u.pathname
  const shim = {
    getMonthlyReport: () => D.monthly,
    getPreviousMonthlyReport: () => D.prevMonthly,
    getWeeklyReport: () => D.weekly,
    getPreviousWeeklyReport: () => D.prevWeekly,
    // v0.4.6 compare 新增依赖:多月趋势归档。导出器未提供 history 时按 [上期,本期] 推导。
    getMonthlyHistory: () => (Array.isArray((D as Record<string, unknown>).history)
      ? (D as unknown as { history: unknown[] }).history
      : [D.prevMonthly, D.monthly].filter((x) => x !== null && x !== undefined)),
    getReportRevision: () => 1,
  }
  if (p === '/ecommerce-api/monthly-report') return J({ ok: true, value: D.monthly ?? null })
  if (p === '/ecommerce-api/weekly-report') return J({ ok: true, value: D.weekly ?? null })
  if (p === '/ecommerce-api/compare') {
    const rawCycle = String(u.searchParams.get('cycle') ?? '30d')
    const cycle = isCompareCycle(rawCycle) ? rawCycle : '30d'
    const kind = u.searchParams.get('kind') ?? undefined
    const metric = u.searchParams.get('metric') ?? undefined
    const limit = Math.min(Math.max(Number(u.searchParams.get('limit') ?? 100) || 100, 1), 1000)
    try {
      const payload = buildComparePayload(shim as never, cycle as never, kind, metric, limit)
      return J({ ok: true, value: payload, revision: 1 })
    } catch {
      return J({ ok: false, error: { code: 'DEMO_COMPARE', message: '该组合暂无示例数据' } })
    }
  }
  if (p === '/ecommerce-api/evaluation') {
    const cycle = u.searchParams.get('cycle') === '7d' ? ('7d' as const) : ('30d' as const)
    const summary = buildEvaluationSummary(cycle, D.monthly as never, D.weekly as never)
    if (summary === null) return J({ ok: true, value: { cycle, evaluation: '', source: 'rule', pending: false } })
    return J({ ok: true, value: { cycle, evaluation: ruleBasedEvaluation(summary), source: 'rule', pending: false } })
  }
  return null
}
