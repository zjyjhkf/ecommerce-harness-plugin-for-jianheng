/**
 * ecommerce-analyst-plugin — 数据中台读取工具(模型侧唯一权威数据入口)
 *
 * 为什么单独做一个工具:面板上显示的每个数字都来自「已导入的复盘 Excel」,
 * 而商品/订单库是另一套域(空库时为空)。此前模型没有读取复盘数据的工具,
 * 只能自己去翻 data/store.json,既慢又容易读错口径、进而编造数字。
 * 本工具把复盘数据按面板同样的口径直接交给模型,保证「模型说的数 = 面板显示的
 * 数」,未导入时明确返回空,杜绝用示例/推测数字填充。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import { asJsonObject } from './json.ts'
import { buildComparePayload, isCompareKind } from '../compare-payload.ts'
import { formatCompareText } from './compare.ts'
import type { CompareCycle, CompareKind } from '../compare.ts'
import type { MonthlyReport } from '../types.ts'

const yuan = (v: number | undefined): string =>
  '¥' + (Number(v) || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = (v: number | undefined): string => (Number(v) || 0).toFixed(2) + '%'
const int = (v: number | undefined): string => Math.round(Number(v) || 0).toLocaleString('zh-CN')

type View = 'overview' | 'months' | 'storeProfit' | 'systemProducts' | 'platformLinks' | 'systemSkus' | 'compare'

const sum = <T>(rows: T[], pick: (r: T) => number): number => rows.reduce((s, r) => s + (Number(pick(r)) || 0), 0)

/** 数据来源声明:明确告诉模型「数从哪来、有没有数据」 */
function sourceLine(store: EcommerceStore, monthlies: MonthlyReport[]): string {
  const months = monthlies.map((m) => m.month).join('、')
  const weekly = store.getWeeklyReport()
  const parts = [
    `数据来源:已导入的复盘 Excel(与「电商数据中台」面板同源同口径,修订号 ${store.getReportRevision()})`,
    `已导入月度:${months || '(无)'}`,
    `已导入周度:${weekly ? weekly.period : '(无)'}`,
    '商品/订单库是另一套域,与复盘报表互不相通(未导入表格时为空)。',
    '未导入的周期一律返回「未导入」——不得用 0、示例值或推测值代替。',
  ]
  return parts.join(' | ')
}

function pickMonthly(store: EcommerceStore, month?: string): { report: MonthlyReport | null; note: string } {
  const history = store.getMonthlyHistory()
  const current = store.getMonthlyReport()
  if (history.length === 0) return { report: current, note: '尚无任何月度复盘数据。' }
  if (month === undefined || month.trim() === '') return { report: current, note: '' }
  const key = month.trim()
  const hit = history.find((r) => r.month === key || r.period.startsWith(key))
  if (hit === undefined) {
    return {
      report: null,
      note: `未导入月份「${key}」:已导入的月份只有 ${history.map((r) => r.month).join('、')}。请勿给出该月的任何数字。`,
    }
  }
  return { report: hit, note: '' }
}

function overviewText(store: EcommerceStore): string {
  const history = store.getMonthlyHistory()
  const current = store.getMonthlyReport()
  const L: string[] = ['【数据中台 · 导入总览】', sourceLine(store, history)]
  if (current === null) {
    L.push('当前没有任何已导入的月度复盘数据:面板各视图均为空白占位。若用户询问数据,请如实说明「未导入」并引导其用面板 📥 导入。')
    return L.join('\n')
  }
  const sp = current.storeProfit ?? []
  const links = current.platformLinks ?? []
  const prods = current.systemProducts ?? []
  const skus = current.systemSkus ?? []
  L.push('')
  L.push(`本期(最近导入):${current.period}  |  更新于 ${current.updatedAt}`)
  L.push(`- 店铺利润行:${sp.length} 家(导入表店铺清单 ${current.shops.length} 家,\`销售额为 0\`的店不进入利润行)`)
  if (sp.length > 0) {
    const sales = sum(sp, (r) => r.sales)
    const refund = sum(sp, (r) => r.refund)
    const gross = sum(sp, (r) => r.grossProfit)
    const promo = sum(sp, (r) => r.promoCost)
    L.push(`- 销售额合计 ${yuan(sales)}  |  退款合计 ${yuan(refund)}  |  毛利合计 ${yuan(gross)}  |  整体毛利率 ${sales > 0 ? pct((gross / sales) * 100) : '—'}  |  费比 ${sales > 0 ? pct((promo / sales) * 100) : '—'}`)
  }
  L.push(`- 平台货品(链接)${int(links.length)} 行  |  系统货品 ${int(prods.length)} 行  |  系统规格(SKU)${int(skus.length)} 行`)
  if (links.length > 0) {
    L.push(`- 链接口径 销售额 ${yuan(sum(links, (r) => r.sales))}  |  净销售额 ${yuan(sum(links, (r) => r.netSales))}  |  退款 ${yuan(sum(links, (r) => r.refundAmount))}`)
  }
  const prev = store.getPreviousMonthlyReport()
  L.push('')
  L.push(prev === null ? '上一期:无(仅导入一期,数据对比不可用)' : `上一期:${prev.period}(数据对比可用)`)
  L.push(`月度历史:${history.map((r) => r.month).join('、')}`)
  return L.join('\n')
}

function storesText(report: MonthlyReport, top: number): string {
  const rows = [...(report.storeProfit ?? [])].sort((a, b) => b.sales - a.sales)
  const L: string[] = [`【店铺利润 · ${report.period}】共 ${rows.length} 家(按销售额降序,显示前 ${Math.min(top, rows.length)})`]
  L.push(['门店', '销售收入', '正向收入', '退款', '毛利', '毛利率', '物流费', '推广费', '费比'].join(' | '))
  for (const r of rows.slice(0, top)) {
    L.push([r.store, yuan(r.sales), yuan(r.positiveSales), yuan(r.refund), yuan(r.grossProfit), pct(r.grossMargin), yuan(r.logisticsCost), yuan(r.promoCost), pct(r.feeRatio)].join(' | '))
  }
  const sales = sum(rows, (r) => r.sales)
  L.push(`合计:销售额 ${yuan(sales)} · 退款 ${yuan(sum(rows, (r) => r.refund))} · 毛利 ${yuan(sum(rows, (r) => r.grossProfit))}`)
  return L.join('\n')
}

function productsText(report: MonthlyReport, top: number): string {
  const rows = [...(report.systemProducts ?? [])].sort((a, b) => b.sales - a.sales)
  const L: string[] = [`【系统货品(货品级) · ${report.period}】共 ${rows.length} 行(按销售额降序,显示前 ${Math.min(top, rows.length)})`]
  L.push(['货品名称', '货品编号', '销售额', '毛利额', '毛利率', '退款率', '净销售额', '推广费', '平均单价'].join(' | '))
  for (const r of rows.slice(0, top)) {
    L.push([r.name, r.code, yuan(r.sales), yuan(r.grossProfit), pct(r.grossMargin), pct(r.refundRate), yuan(r.netSales), yuan(r.adSpend), yuan(r.avgPrice)].join(' | '))
  }
  L.push(`合计:销售额 ${yuan(sum(rows, (r) => r.sales))} · 毛利额 ${yuan(sum(rows, (r) => r.grossProfit))} · 净销售额 ${yuan(sum(rows, (r) => r.netSales))}`)
  return L.join('\n')
}

function linksText(report: MonthlyReport, top: number): string {
  const rows = [...(report.platformLinks ?? [])].sort((a, b) => b.sales - a.sales)
  const real = rows.filter((r) => !r.linkName.startsWith('（无身份占位行'))
  const L: string[] = [`【平台货品(链接级) · ${report.period}】共 ${rows.length} 行(按销售额降序,显示前 ${Math.min(top, rows.length)})`]
  L.push(['店铺', '链接名称', '链接ID', '销售额', '销售件数', '毛利额', '退款金额', '净销售额', '推广费'].join(' | '))
  for (const r of rows.slice(0, top)) {
    L.push([r.shop, r.linkName, r.linkId, yuan(r.sales), int(r.salesCount), yuan(r.grossProfit), yuan(r.refundAmount), yuan(r.netSales), yuan(r.adSpend)].join(' | '))
  }
  L.push(`合计(含占位行结转):销售额 ${yuan(sum(rows, (r) => r.sales))} · 净销售额 ${yuan(sum(rows, (r) => r.netSales))} · 退款 ${yuan(sum(rows, (r) => r.refundAmount))}`)
  L.push(`其中有身份链接 ${real.length} 行;另有无身份占位行已合并为 1 条标注行(其数值计入合计,不参与排行)。`)
  return L.join('\n')
}

function skusText(report: MonthlyReport, top: number): string {
  const rows = [...(report.systemSkus ?? [])].sort((a, b) => b.sales - a.sales)
  const L: string[] = [`【系统规格(SKU 级) · ${report.period}】共 ${rows.length} 行(按销售额降序,显示前 ${Math.min(top, rows.length)})`]
  L.push(['系统货品名称', '规格名称', '商家编码', '销售额', '销售件数', '毛利额', '毛利率', '退款金额', '净销售额'].join(' | '))
  for (const r of rows.slice(0, top)) {
    L.push([r.name, r.specName, r.code, yuan(r.sales), int(r.salesCount), yuan(r.grossProfit), pct(r.grossMargin), yuan(r.refundAmount), yuan(r.netSales)].join(' | '))
  }
  L.push(`合计:销售额 ${yuan(sum(rows, (r) => r.sales))} · 毛利额 ${yuan(sum(rows, (r) => r.grossProfit))} · 退款 ${yuan(sum(rows, (r) => r.refundAmount))}`)
  return L.join('\n')
}

function monthsText(store: EcommerceStore): string {
  const history = store.getMonthlyHistory()
  const L: string[] = ['【已导入周期清单】', sourceLine(store, history)]
  if (history.length === 0) return L.join('\n')
  const cur = store.getMonthlyReport()
  const prev = store.getPreviousMonthlyReport()
  L.push('')
  L.push(['月份', '周期', '店铺行', '货品', '链接', '规格', '角色'].join(' | '))
  for (const m of history) {
    const role = cur && m.period === cur.period ? '本期' : prev && m.period === prev.period ? '上一期' : '历史归档'
    L.push([m.month, m.period, int((m.storeProfit ?? []).length), int((m.systemProducts ?? []).length), int((m.platformLinks ?? []).length), int((m.systemSkus ?? []).length), role].join(' | '))
  }
  return L.join('\n')
}

export function registerDataReportTools(ctx: Context, store: EcommerceStore): void {
  ctx.tools.register(defineTool({
    name: 'ecommerce_data_report',
    description:
      '读取「电商数据中台」当前已导入的复盘数据(面板上每个数字的唯一来源,口径完全一致):店铺利润/系统货品/平台链接/系统规格/周期对比/已导入月份清单。回答任何「销售额/退款/毛利/排行/某月数据」问题前应先调用本工具取数;未导入的周期会明确返回「未导入」,不得用 0 或推测值代替。',
    parameters: {
      view: {
        type: 'string',
        enum: ['overview', 'months', 'storeProfit', 'systemProducts', 'platformLinks', 'systemSkus', 'compare'],
        description: '要读的视图:overview=总览(默认)/months=已导入月份清单/storeProfit=店铺利润/systemProducts=系统货品/platformLinks=平台链接/systemSkus=系统规格/compare=周期对比',
      },
      month: { type: 'string', description: '指定月份(如 2026-07);缺省=最近导入的一期。未导入的月份会明确报「未导入」' },
      top: { type: 'number', description: '明细行数,默认 20,最大 200' },
      cycle: { type: 'string', enum: ['30d', '7d'], description: '仅 compare 视图使用:30d=月度对比(默认)/7d=周度对比' },
      kind: { type: 'string', enum: ['platformLinks', 'systemProducts', 'systemSkus', 'storeProfit'], description: '仅 compare 视图使用:对比层级' },
      metric: { type: 'string', description: '仅 compare 视图使用:对比指标,如 sales/netSales/grossProfit/refundRate/grossMargin/adSpend' },
    },
    output: {
      schema: { type: 'object', additionalProperties: true, properties: {} },
      render: (args, value) => {
        const v = value as unknown as { ok: boolean; text: string }
        const view = (args as { view?: string }).view ?? 'overview'
        return [{ type: 'text', text: v.ok ? v.text : `[${view}] ${v.text}` }]
      },
    },
    async execute(args) {
      const view: View = (['overview', 'months', 'storeProfit', 'systemProducts', 'platformLinks', 'systemSkus', 'compare'] as const).includes(args.view as View)
        ? (args.view as View)
        : 'overview'
      const top = Math.min(Math.max(args.top ?? 20, 1), 200)
      const history = store.getMonthlyHistory()

      if (view === 'months') return asJsonObject({ ok: true, text: monthsText(store) })
      if (view === 'overview') {
        return asJsonObject({ ok: true, text: overviewText(store) })
      }
      if (view === 'compare') {
        const cycle: CompareCycle = args.cycle === '7d' ? '7d' : '30d'
        const kind = args.kind !== undefined && isCompareKind(args.kind) ? (args.kind as CompareKind) : undefined
        const payload = buildComparePayload(store, cycle, kind, args.metric, top)
        const head = sourceLine(store, history) + '\n\n'
        if (!payload.hasPrev) {
          return asJsonObject({ ok: false, text: head + '暂无上一期数据可对比:需连续导入两个周期(上期+本期)的复盘 Excel 后,「数据对比」才可用。请勿编造上期数字。' })
        }
        if (!payload.result || payload.result.rows.length === 0) {
          return asJsonObject({ ok: false, text: head + '已导入两期,但所选层级/指标两侧缺少可比数据,请换层级或指标再试。' })
        }
        return asJsonObject({ ok: true, text: head + formatCompareText(payload.result, top) })
      }

      const { report, note } = pickMonthly(store, args.month)
      const head = sourceLine(store, history) + '\n\n'
      if (report === null) {
        return asJsonObject({ ok: false, text: head + (note || '未找到对应月份的已导入数据。') })
      }
      const prefix = note === '' ? head : head + note + '\n\n'
      if (view === 'storeProfit') return asJsonObject({ ok: true, text: prefix + storesText(report, top) })
      if (view === 'systemProducts') return asJsonObject({ ok: true, text: prefix + productsText(report, top) })
      if (view === 'platformLinks') return asJsonObject({ ok: true, text: prefix + linksText(report, top) })
      return asJsonObject({ ok: true, text: prefix + skusText(report, top) })
    },
  }))
}
