/**
 * ecommerce-analyst-plugin — 数据对比工具集（连续导入两期 → 上期 vs 本期）
 *
 * 供模型回答「这期跟上期比怎么样 / 销售额涨跌 / 排行变化 / 掉了哪些品」等经营对比问题。
 * 数据源 = 已导入的月度（30d）/周度（7d）复盘报告及其上一期归档，口径与数据中台「数据对比」一致。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import { asJsonObject } from './json.ts'
import { isCompareKind, buildComparePayload } from '../compare-payload.ts'
import type { CompareCycle, CompareKind, CompareResult, CompareUnit } from '../compare.ts'

const money = (v: number): string =>
  '¥' + v.toLocaleString('zh-CN', { maximumFractionDigits: v >= 10000 ? 0 : 2 })

function fmtValue(v: number, unit: CompareUnit): string {
  if (unit === 'pct') return v.toFixed(2) + '%'
  if (unit === 'number') return Math.round(v).toLocaleString('zh-CN')
  return money(v)
}

function fmtDelta(result: CompareResult, delta: number): string {
  const base = (delta >= 0 ? '+' : '') + fmtValue(delta, result.unit)
  const suffix = result.unit === 'pct' ? 'pp' : ''
  return base + suffix
}

/** 把 CompareResult 渲染成模型可直接阅读的经营对比文本 */
export function formatCompareText(result: CompareResult, limit = 20): string {
  const s = result.summary
  const L: string[] = []
  L.push(`【${result.cycle === '7d' ? '周' : '月'}度数据对比 · ${result.kindLabel}·${result.metricLabel}】`)
  L.push(`上期 ${result.prevPeriod || '—'}（上期）  vs  本期 ${result.currPeriod || '—'}`)
  L.push(`整体：${fmtValue(s.prevTotal, result.unit)} → ${fmtValue(s.currTotal, result.unit)}（${fmtDelta(result, s.delta)}${s.deltaPct !== null ? '，' + (s.deltaPct >= 0 ? '+' : '') + s.deltaPct.toFixed(1) + '%' : ''}）`)
  L.push(`对比对象：两期都在 ${s.matched} · 本期新增 ${s.added} · 本期退出 ${s.removed} · 名次上升/下降 ${s.rankUp}/${s.rankDown}`)
  const rows = result.rows.slice(0, limit)
  const head = ['#', '名称', '上期', '本期', '增减', '名次'].join(' | ')
  L.push('明细（按变化幅度排序）：')
  L.push(head)
  rows.forEach((r, i) => {
    const name = r.label || r.key
    const pv = r.prev === null ? '—' : fmtValue(r.prev, result.unit)
    const cv = r.curr === null ? '—' : fmtValue(r.curr, result.unit)
    const dv = r.state === 'added' ? '新上榜' : r.state === 'removed' ? '退出' : fmtDelta(result, r.delta) + (r.deltaPct !== null ? ' (' + (r.deltaPct >= 0 ? '+' : '') + r.deltaPct.toFixed(1) + '%)' : '')
    const rk =
      r.state === 'added'
        ? '新'
        : r.state === 'removed'
          ? '退'
          : (r.rankPrev ?? 0) + '→' + (r.rankCurr ?? 0) + (r.rankShift && r.rankShift !== 0 ? (r.rankShift > 0 ? ' ↑' + r.rankShift : ' ↓' + Math.abs(r.rankShift)) : '')
    L.push(`${i + 1} | ${name} | ${pv} | ${cv} | ${dv} | ${rk}`)
  })
  if (s.removed > 0) L.push('（提示：「退出」行本期已无销售/排名，多为下架或无成交）')
  L.push('说明：指标按' + (result.unit === 'pct' ? '销售额加权' : '汇总') + '口径对比；数据来自已导入 Excel 的两期复盘。')
  return L.join('\n')
}

export function registerCompareTools(ctx: Context, store: EcommerceStore): void {
  ctx.tools.register(defineTool({
    name: 'ecommerce_compare',
    description:
      '数据对比（导入两期后）：对比上一期与本期（月度30d 或 周度7d）某层级（链接/货品/SKU/店铺利润）某指标（销售额/净销/毛利/推广费/退款率/毛利率/客单价等）的增减与排行位移。需先连续导入两个周期才会生效。',
    parameters: {
      cycle: { type: 'string', enum: ['30d', '7d'], description: '周期：30d=月度复盘 / 7d=周复盘，默认 30d' },
      kind: {
        type: 'string',
        enum: ['platformLinks', 'systemProducts', 'systemSkus', 'storeProfit'],
        description: '对比层级：platformLinks=链接 / systemProducts=系统货品 / systemSkus=系统规格 / storeProfit=店铺利润；缺省自动选择',
      },
      metric: {
        type: 'string',
        description: '对比指标：sales/netSales/grossProfit/salesCount/grossMargin/refundAmount/refundRate/adSpend/avgPrice/views 等，默认销售额',
      },
      limit: { type: 'number', description: '返回明细条数，默认 20，最大 100' },
    },
    output: {
      schema: { type: 'object', additionalProperties: true, properties: {} },
      render: (_args, value) => {
        const v = value as unknown as { ok: boolean; message: string; result?: CompareResult }
        return [{
          type: 'text',
          text: v.ok ? (v.result ? formatCompareText(v.result) : v.message) : v.message,
        }]
      },
    },
    async execute(args) {
      const cycle: CompareCycle = args.cycle === '30d' || args.cycle === '7d' ? args.cycle : '30d'
      const kind = args.kind !== undefined && isCompareKind(args.kind) ? (args.kind as CompareKind) : undefined
      const limit = Math.min(Math.max(args.limit ?? 20, 1), 100)
      const payload = buildComparePayload(store, cycle, kind, args.metric, limit)
      const label = payload.result ? `${payload.result.kindLabel}·${payload.result.metricLabel}` : ''
      if (!payload.hasPrev) {
        return asJsonObject({
          ok: false,
          message: '暂无上一期数据可对比：请先在「店铺工作台」连续导入两期' + (cycle === '7d' ? '周' : '月') + '度复盘 Excel（当前期与上一期），再调用本工具。',
        })
      }
      if (!payload.result || !payload.result.rows.length) {
        return asJsonObject({
          ok: false,
          message: `已导入两期，但所选层级「${label || '该层级'}」在当前周期内两侧缺少可比数据（新增/退出均无），请换一个层级或周期再试。`,
        })
      }
      return asJsonObject({ ok: true, ...payload.result })
    },
  }))
}
