/**
 * ecommerce-analyst-plugin — 「新品追踪」聚合
 *
 * 只依赖已导入的月度复盘（系统货品表 / 系统规格表），不引入任何外部或写死数据：
 * 换一组导入数据，本模块输出的每一个数字都随之改变。
 *
 * 新品判据（按优先级，结果里用 basis 标明用了哪一条）：
 *   1) category —— 月度表「分类」列是「YY年M月」形式的上市月份标签时，
 *      取标签 == 本期报表月份的那批货品/规格（与业务口径一致：分类即上市月份）。
 *   2) newcomer —— 「分类」列是商品分组（如 货品周期/热销期/球类）而无月份标签时，
 *      回退为「上一期未出现、本期首次出现」的货品/规格，即首次上榜。
 *      ⚠ 两条判据用不同的键：单期内分新老品按「货品编号」，跨期查是否出现过按「货品名」
 *        （编号在相邻两期之间不可比），详见 prodNameKey。
 *   3) none     —— 两条都不成立（无数据 / 无往期可比）→ available=false，面板显示原因。
 *
 * 口径说明（与月度规格表字段一一对应，不做任何估算）：
 *   - 销售额/净销额/毛利额/退款率/退货比例：货品级取货品表，规格级取规格表。
 *   - 汇总比率一律按销售额加权，不用算术平均（避免小体量货品把比率带偏）。
 *   - 销售件数/销售成本/退款三段拆解只有规格表有 → 在新品规格集上汇总。
 *   - 「占全店」分母为同期全部货品销售额合计（货品级），与新品同源同表。
 */
import type { EcommerceStore } from './store.ts'
import type { MonthlyReport, MonthlySkuRow, WeeklyProductRow } from './types.ts'

/** 面板用的新品货品行（货品级 + 由规格表归并来的件数/成本/退款拆解） */
export interface NewProductItem {
  name: string
  code: string
  brand: string
  category: string
  specCount: number
  sales: number
  netSales: number
  grossProfit: number
  grossMargin: number
  salesCount: number
  salesCost: number
  refundRate: number
  returnRate: number
  postShipRefundRate: number
  adSpend: number
}

/** 新品规格行（直接来自规格表，不合并） */
export interface NewProductSpecRow {
  name: string
  specName: string
  code: string
  sales: number
  netSales: number
  grossProfit: number
  grossMargin: number
  salesCount: number
  salesCost: number
  refundRate: number
  returnRate: number
  preShipRefundRate: number
  postShipRefundRate: number
  receivedRefundRate: number
}

export interface NewProductPayload {
  /** 是否具备可展示的新品追踪结果 */
  available: boolean
  /** 不可用时的中文原因（面板直接展示） */
  reason: string
  /** 判据：category=分类上市月份 / newcomer=首次上榜 / none=未判定 */
  basis: 'category' | 'newcomer' | 'none'
  /** 判据中文说明（面板展示，说明这批数字是怎么算出来的） */
  basisLabel: string
  period: string
  prevPeriod: string
  hasPrev: boolean

  newCnt: number
  specCnt: number
  oldCnt: number

  newSales: number
  totalSales: number
  newShare: number
  newUnits: number
  newCost: number
  costRate: number

  newGm: number
  oldGm: number
  newRr: number
  oldRr: number
  newRt: number
  oldRt: number

  refundPre: number
  refundPost: number
  refundReceived: number

  top1Share: number
  top1Name: string

  top10: Array<{ name: string; sales: number; netSales: number }>
  donut: { newSales: number; oldSales: number }
  specTop10: Array<{ name: string; sales: number }>
  specPie: { prodName: string; items: Array<{ name: string; value: number }> }
  specDist: Array<{ name: string; cnt: number }>

  products: NewProductItem[]
  specs: NewProductSpecRow[]

  /**
   * 上一期的「新品概览」，供「数据对比 · 新品对比」做上期 vs 本期对照。
   * 与本期同判据同口径（同样由本模块现算），上一期无法判定时为 null。
   */
  prevSide: NewProductSide | null
}

/** 单期新品概览（「数据对比 · 新品对比」对照用，字段与本期负载一一对应） */
export interface NewProductSide {
  period: string
  basis: NewProductPayload['basis']
  basisLabel: string
  newCnt: number
  specCnt: number
  oldCnt: number
  newSales: number
  totalSales: number
  newShare: number
  newGm: number
  oldGm: number
  newRr: number
  oldRr: number
  top1Share: number
  top1Name: string
}

/** 从完整负载抽出一期概览；该期判不出新品时返回 null */
export function newProductSideOf(p: NewProductPayload): NewProductSide | null {
  if (!p.available) return null
  return {
    period: p.period,
    basis: p.basis,
    basisLabel: p.basisLabel,
    newCnt: p.newCnt,
    specCnt: p.specCnt,
    oldCnt: p.oldCnt,
    newSales: p.newSales,
    totalSales: p.totalSales,
    newShare: p.newShare,
    newGm: p.newGm,
    oldGm: p.oldGm,
    newRr: p.newRr,
    oldRr: p.oldRr,
    top1Share: p.top1Share,
    top1Name: p.top1Name,
  }
}

/** "2026-08" → "26年8月"（与月度表「分类」列的上市月份写法一致，不补前导零） */
function monthLabel(month: string): string {
  const m = String(month ?? '').match(/^(\d{4})-(\d{2})$/)
  if (!m) return ''
  return m[1].slice(2) + '年' + String(Number(m[2])) + '月'
}

/** 判断「分类」值是否为上市月份标签；是则返回归一化写法（26年07月 → 26年7月） */
function asMonthLabel(v: string): string {
  const m = String(v ?? '').trim().match(/^(\d{2})年(\d{1,2})月$/)
  return m ? m[1] + '年' + String(Number(m[2])) + '月' : ''
}

/** 销售额加权比率：Σ(值×权重)/Σ权重；权重为 0 时返回 0 */
function weighted(items: number[], weights: number[]): number {
  let sw = 0
  let sv = 0
  for (let i = 0; i < items.length; i++) {
    const w = Number(weights[i]) || 0
    sw += w
    sv += (Number(items[i]) || 0) * w
  }
  return sw > 0 ? sv / sw : 0
}

function sumBy<T>(arr: T[], f: (x: T) => number): number {
  let s = 0
  for (const x of arr) s += Number(f(x)) || 0
  return s
}

/** 货品唯一键：优先货品编号（实测 631 行 0 重复），缺失时退回货品名。
 *  ⚠ 不能用货品名：真实数据里有 17 组同名不同编号的货品（如「电动按摩轴」T-ddamz-25203 属 26年7月新品、
 *  T-ddanz-25050 属老品），按名字做集合会把这 3 个老品误划进新品。 */
function prodKey(p: { code?: string; name?: string }): string {
  const c = String(p.code ?? '').trim()
  return c || String(p.name ?? '').trim()
}

/**
 * 跨期比对键：只用「货品名 / 货品名+规格名」，绝不用编号。
 * ⚠ 相邻两期的货品编号是两套不同编码体系：同一个「空气压力波」7月是 Z-kqylb、8月是 T-KQB-001，
 *   实测 618 个 8 月货品里有 183 个是「同名不同编号」。跨期若按编号匹配，
 *   会把 85 个真新品虚报成 230 个 —— 新品追踪的核心口径就错了。
 */
function prodNameKey(p: { name?: string }): string {
  return String(p.name ?? '').trim()
}
function specNameKey(s: { name?: string; specName?: string }): string {
  return String(s.name ?? '').trim() + '\u0000' + String(s.specName ?? '').trim()
}

const EMPTY = (reason: string, period = '', prevPeriod = '', hasPrev = false): NewProductPayload => ({
  available: false,
  reason,
  basis: 'none',
  basisLabel: '',
  period,
  prevPeriod,
  hasPrev,
  newCnt: 0,
  specCnt: 0,
  oldCnt: 0,
  newSales: 0,
  totalSales: 0,
  newShare: 0,
  newUnits: 0,
  newCost: 0,
  costRate: 0,
  newGm: 0,
  oldGm: 0,
  newRr: 0,
  oldRr: 0,
  newRt: 0,
  oldRt: 0,
  refundPre: 0,
  refundPost: 0,
  refundReceived: 0,
  top1Share: 0,
  top1Name: '',
  top10: [],
  donut: { newSales: 0, oldSales: 0 },
  specTop10: [],
  specPie: { prodName: '', items: [] },
  specDist: [],
  products: [],
  specs: [],
  prevSide: null,
})

/**
 * 由 Store 当前/上一期月度复盘生成「新品追踪」负载。
 * 纯函数式读取，不写 Store，可在接口与工具里复用。
 *
 * 除本期结果外，还会算出上一期的「新品概览」（prevSide）供「数据对比 · 新品对比」做对照 ——
 * 两期走的是同一个 computeNewProducts，口径不可能分叉。
 */
export function buildNewProductPayload(store: EcommerceStore): NewProductPayload {
  const curr: MonthlyReport | null = store.getMonthlyReport()
  const prev: MonthlyReport | null = store.getPreviousMonthlyReport()
  const payload = computeNewProducts(curr, prev)
  // 上一期的新品概览：用月份归档找到「上一期的上一期」，供其 newcomer 判据使用；
  // 归档里没有更早一期时该期只能走「分类上市月份」判据（判不出则为 null，面板会说明）。
  if (prev) {
    const history = store.getMonthlyHistory()
    const idx = history.findIndex((r) => r.period === prev.period)
    const before = idx > 0 ? history[idx - 1] : null
    const side = computeNewProducts(prev, before ?? null)
    payload.prevSide = newProductSideOf(side)
  }
  return payload
}

/** 由「本期 + 上一期」两份月度复盘现算新品追踪（纯函数，不读 Store，可对任意两期复用） */
function computeNewProducts(curr: MonthlyReport | null, prev: MonthlyReport | null): NewProductPayload {
  const period = (curr && curr.period) || ''
  const prevPeriod = (prev && prev.period) || ''
  const hasPrev = prev !== null

  if (!curr) return EMPTY('暂无导入数据：请先导入月度复盘（30 天周期）4 份文件。', period, prevPeriod, hasPrev)

  const allProd: WeeklyProductRow[] = Array.isArray(curr.systemProducts) ? curr.systemProducts : []
  const allSku: MonthlySkuRow[] = Array.isArray(curr.systemSkus) ? curr.systemSkus : []
  if (allProd.length === 0 && allSku.length === 0) {
    return EMPTY('本期月度复盘缺少系统货品表与系统规格表：无法判定新品，请重新导入月度复盘 4 份文件。', period, prevPeriod, hasPrev)
  }

  const label = monthLabel(curr.month)
  const prevProds: WeeklyProductRow[] = (prev && Array.isArray(prev.systemProducts)) ? prev.systemProducts : []
  const prevSkus: MonthlySkuRow[] = (prev && Array.isArray(prev.systemSkus)) ? prev.systemSkus : []

  // ── 判据一：分类列 == 本期上市月份 ──
  let basis: NewProductPayload['basis'] = 'none'
  let newProd: WeeklyProductRow[] = []
  let newSku: MonthlySkuRow[] = []
  let basisLabel = ''
  if (label) {
    newProd = allProd.filter((p) => asMonthLabel(p.category) === label)
    newSku = allSku.filter((s) => asMonthLabel(s.category) === label)
    if (newProd.length > 0 || newSku.length > 0) {
      basis = 'category'
      basisLabel = '新品 = 月度表「分类」列上市月份 = ' + label + '（与本期报表月份一致）'
    }
  }

  // ── 判据二：上期未出现、本期首次出现 ──
  if (basis === 'none' && prevProds.length > 0) {
    // 跨期按名称比（编号两期不可比），单期内分新老品才按编号 —— 两处键不同，切勿混用
    const seen = new Set(prevProds.map((p) => prodNameKey(p)))
    newProd = allProd.filter((p) => !seen.has(prodNameKey(p)))
    basis = 'newcomer'
    basisLabel = '本期表「分类」列无上市月份标签，改用「' + prevPeriod + ' 未出现、' + period + ' 首次出现」判定新品'
  }
  if (basis !== 'none' && newSku.length === 0 && prevSkus.length > 0) {
    const seenSku = new Set(prevSkus.map((s) => specNameKey(s)))
    newSku = allSku.filter((s) => !seenSku.has(specNameKey(s)))
  }
  // 判据一命中但规格表同判据为空（规格表分类列口径不同）时，用「所属货品在新品集合内」补齐
  if (basis === 'category' && newSku.length === 0 && allSku.length > 0) {
    const newNames = new Set(newProd.map((p) => String(p.name ?? '')))
    newSku = allSku.filter((s) => newNames.has(String(s.name ?? '')))
  }
  // ── 两个层级必须同集合 ──
  // 规格层若独立按「规格名首次出现」判定，会把大量老品的新规格也算成新品规格，
  // 屏幕上就会出现「新品销售成本 ¥108.8 万 > 新品销售额 ¥20.8 万」这种同屏自相矛盾的数字
  // （实测 8 月：规格层 236 行 / 销售额 203.7 万，而货品层只有 64 个新品 / 净销售额 20.8 万）。
  // 因此当货品层有结果时，规格层收敛到「所属货品属于本期新品」的那些规格行；
  // 收敛后若一行不剩（规格表货品名与货品表对不上），保留原结果，避免整块空白。
  if (newProd.length > 0 && newSku.length > 0) {
    const newProdNames = new Set(newProd.map((p) => String(p.name ?? '')))
    const narrowed = newSku.filter((s) => newProdNames.has(String(s.name ?? '')))
    if (narrowed.length > 0) newSku = narrowed
  }

  if (basis === 'none' || (newProd.length === 0 && newSku.length === 0)) {
    const why = hasPrev || label
      ? '本期未识别到新品：月度表「分类」列既无与本期月份一致的上市标签，也无可比上一期用于「首次上榜」判定。'
      : '本期未识别到新品：月度表「分类」列无上市月份标签，且尚未导入上一期，无法做「首次出现」判定。请再导入上一期月度复盘后查看。'
    return EMPTY(why, period, prevPeriod, hasPrev)
  }

  const newKeySet = new Set(newProd.map((p) => prodKey(p)))
  const oldProd = allProd.filter((p) => !newKeySet.has(prodKey(p)))

  // 口径（用户指定 v0.4.14）：面板展示的「销售额」= 源表「净销售额」列；
  // 源表「销售额」列（含退款订单额）在本模块称作「订单销售额（含退款）」。
  const newSales = sumBy(newProd, (p) => p.netSales)
  const totalSales = sumBy(allProd, (p) => p.netSales)
  const newSkuSales = sumBy(newSku, (s) => s.sales)

  // ── 规格维度汇总（件数/成本/退款三段拆解只有规格表有） ──
  const newUnits = sumBy(newSku, (s) => s.salesCount)
  const newCost = sumBy(newSku, (s) => s.salesCost)
  const costRate = newSkuSales > 0 ? (newCost / newSkuSales) * 100 : 0
  const refundPre = weighted(newSku.map((s) => s.preShipRefundRate), newSku.map((s) => s.sales))
  const refundPost = weighted(newSku.map((s) => s.postShipRefundRate), newSku.map((s) => s.sales))
  const refundReceived = weighted(newSku.map((s) => s.receivedRefundRate), newSku.map((s) => s.sales))

  // ── 货品级指标 ──
  // 毛利率口径：毛利额 ÷ 净销售额（与月度表内「毛利率」列一致；
  // 用销售额做分母会把比率整体压低十几个百分点，实测 43.6% vs 31.8%）。
  const oldSales = sumBy(oldProd, (p) => p.netSales)
  const newNet = sumBy(newProd, (p) => p.netSales)
  const oldNet = sumBy(oldProd, (p) => p.netSales)
  const newGm = newNet > 0 ? (sumBy(newProd, (p) => p.grossProfit) / newNet) * 100 : 0
  const oldGm = oldNet > 0 ? (sumBy(oldProd, (p) => p.grossProfit) / oldNet) * 100 : 0
  const newRr = weighted(newProd.map((p) => p.refundRate), newProd.map((p) => p.sales))
  const oldRr = weighted(oldProd.map((p) => p.refundRate), oldProd.map((p) => p.sales))
  const newRt = weighted(newProd.map((p) => p.returnRate), newProd.map((p) => p.sales))
  const oldRt = weighted(oldProd.map((p) => p.returnRate), oldProd.map((p) => p.sales))

  // ── 规格数分布 + TOP1 集中度 ──
  const specCntOf = new Map<string, number>()
  for (const s of newSku) {
    const k = String(s.name ?? '')
    specCntOf.set(k, (specCntOf.get(k) ?? 0) + 1)
  }
  const postShipOf = new Map<string, number[]>()
  const postShipW = new Map<string, number[]>()
  for (const s of newSku) {
    const k = String(s.name ?? '')
    if (!postShipOf.has(k)) { postShipOf.set(k, []); postShipW.set(k, []) }
    postShipOf.get(k)!.push(s.postShipRefundRate)
    postShipW.get(k)!.push(s.sales)
  }

  const products: NewProductItem[] = newProd
    .map((p) => ({
      name: String(p.name ?? ''),
      code: String(p.code ?? ''),
      brand: String(p.brand ?? ''),
      category: String(p.category ?? ''),
      specCount: specCntOf.get(String(p.name ?? '')) ?? 0,
      sales: p.sales,
      netSales: p.netSales,
      grossProfit: p.grossProfit,
      grossMargin: p.grossMargin,
      salesCount: sumBy(newSku.filter((s) => String(s.name ?? '') === String(p.name ?? '')), (s) => s.salesCount),
      salesCost: sumBy(newSku.filter((s) => String(s.name ?? '') === String(p.name ?? '')), (s) => s.salesCost),
      refundRate: p.refundRate,
      returnRate: p.returnRate,
      postShipRefundRate: weighted(postShipOf.get(String(p.name ?? '')) ?? [], postShipW.get(String(p.name ?? '')) ?? []),
      adSpend: p.adSpend,
    }))
    .sort((a, b) => b.sales - a.sales)

  const specs: NewProductSpecRow[] = newSku
    .map((s) => ({
      name: String(s.name ?? ''),
      specName: String(s.specName ?? ''),
      code: String(s.code ?? ''),
      sales: s.sales,
      netSales: s.netSales,
      grossProfit: s.grossProfit,
      grossMargin: s.grossMargin,
      salesCount: s.salesCount,
      salesCost: s.salesCost,
      refundRate: s.refundRate,
      returnRate: s.returnRate,
      preShipRefundRate: s.preShipRefundRate,
      postShipRefundRate: s.postShipRefundRate,
      receivedRefundRate: s.receivedRefundRate,
    }))
    .sort((a, b) => b.sales - a.sales)

  const top1 = products[0]
  const top1Share = top1 && newSales > 0 ? (top1.netSales / newSales) * 100 : 0
  const specDist = [...specCntOf.entries()]
    .map(([name, cnt]) => ({ name, cnt }))
    .sort((a, b) => b.cnt - a.cnt)
    .slice(0, 15)
    .reverse()

  const pieProd = top1 ? top1.name : ''
  const pieAll = specs.filter((s) => s.name === pieProd).slice(0, 8)
  const pieRest = specs.filter((s) => s.name === pieProd).slice(8)
  const specPieItems = pieAll.map((s) => ({ name: s.specName, value: s.netSales }))
  if (pieRest.length) specPieItems.push({ name: '其他规格', value: sumBy(pieRest, (s) => s.netSales) })

  return {
    available: true,
    reason: '',
    basis,
    basisLabel,
    period,
    prevPeriod,
    hasPrev,
    newCnt: products.length,
    specCnt: specs.length,
    oldCnt: oldProd.length,
    newSales,
    totalSales,
    newShare: totalSales > 0 ? (newSales / totalSales) * 100 : 0,
    newUnits,
    newCost,
    costRate,
    newGm,
    oldGm,
    newRr,
    oldRr,
    newRt,
    oldRt,
    refundPre,
    refundPost,
    refundReceived,
    top1Share,
    top1Name: pieProd,
    top10: products.slice(0, 10).reverse().map((p) => ({ name: p.name, sales: p.sales, netSales: p.netSales })),
    donut: { newSales, oldSales },
    specTop10: specs.slice(0, 10).reverse().map((s) => ({ name: s.specName, sales: s.netSales })),
    specPie: { prodName: pieProd, items: specPieItems },
    specDist,
    products,
    specs,
    prevSide: null, // 由 buildNewProductPayload 用上一期数据回填
  }
}
