/**
 * ecommerce-analyst-plugin — 月度复盘解析（对接「月度表」目录下 4 份文件）
 *
 * 结构：
 *   1) 三份「商品排名导出」（单 sheet，展示形式区分层级，日期为整月跨度）：
 *      - 平台货品（链接级，34 列）→ 与周表「平台货品」同构
 *      - 系统货品（货品级，13 列）→ 与周表「系统货品」同构
 *      - 系统规格（SKU 级，26 列）→ 比周表（29 列）少 平台服务费/平台运营费用/软件服务费 三列
 *   2) 一份「利润表」（sheet「利润表」，核算项目 × 逐店铺列）→ 逐店经销数据（供经销排行）
 *
 * 与周复盘「商品排名导出」的判别：日期跨度。周表为 7 天（如 2026-08-23~2026-08-29），
 * 月表为整月（如 2026-07-01~2026-07-31）。周表解析器据此把整月文件让渡给本模块。
 */
import type {
  MonthlyReport,
  MonthlySkuRow,
  MonthlyStoreProfit,
  WeeklyLinkRow,
  WeeklyProductRow,
} from './types.ts'

function toNum(v: unknown): number {
  if (v === undefined || v === null) return 0
  const s = String(v).replace(/[,，¥￥%\s]/g, '').trim()
  if (!s || s === '-' || s === '—' || s === '/' || s === '无') return 0
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

/** 比率解析：带 % 视为已是百分比，不带 % 视为小数 ×100（口径与周表一致） */
function toRate(v: unknown): number {
  if (v === undefined || v === null) return 0
  const s = String(v).replace(/[,，¥￥\s]/g, '').trim()
  if (!s || s === '-' || s === '—' || s === '/' || s === '无') return 0
  const hasPct = s.includes('%')
  const n = Number(s.replace(/%/g, ''))
  if (!Number.isFinite(n)) return 0
  return hasPct ? n : n * 100
}

/** 排名类数值：为空时按 0 */
function toRank(v: unknown): number {
  const n = toNum(v)
  return n > 0 ? Math.round(n) : 0
}

export type MonthlyRankKind = 'platformLinks' | 'systemProducts' | 'systemSkus'

/** 单份月度文件的解析结果（只含其对应章节/维度） */
export interface MonthlyParseResult {
  kind: MonthlyRankKind | 'storeProfit'
  period: string
  month: string
  shops: string[]
  platformLinks?: WeeklyLinkRow[]
  systemProducts?: WeeklyProductRow[]
  systemSkus?: MonthlySkuRow[]
  storeProfit?: MonthlyStoreProfit[]
}

/** 从日期跨度（"YYYY-MM-DD~YYYY-MM-DD"）算天数；解析失败返回 0 */
export function periodSpanDays(period: string): number {
  const m = String(period || '').match(/(\d{4})-(\d{2})-(\d{2})\s*[~～]\s*(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return 0
  const [, y1, mo1, d1, y2, mo2, d2] = m
  const t1 = new Date(`${y1}-${mo1}-${d1}T00:00:00Z`).getTime()
  const t2 = new Date(`${y2}-${mo2}-${d2}T00:00:00Z`).getTime()
  if (!Number.isFinite(t1) || !Number.isFinite(t2)) return 0
  return Math.round((t2 - t1) / 86400000) + 1
}

/** 由日期跨度派生月份标签（"2026-07-01~2026-07-31" → "2026-07"） */
function monthOf(period: string): string {
  const m = String(period || '').match(/(\d{4}-\d{2})-\d{2}/)
  return m ? m[1] : ''
}

/** 解析单份月度「商品排名导出」xlsx → 对应章节；非该结构返回 null */
export async function parseMonthlyRankExcel(
  buffer: Buffer | Uint8Array,
): Promise<MonthlyParseResult | null> {
  let xlsx: typeof import('xlsx')
  try {
    xlsx = await import('xlsx')
  } catch {
    return null
  }
  const wb = xlsx.read(buffer, { type: 'buffer', cellDates: true })
  const name =
    wb.SheetNames.find((n) => String(n).toLowerCase().includes('商品排名')) ?? wb.SheetNames[0]
  if (!name) return null
  const ws = wb.Sheets[name]
  if (!ws) return null
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false }) as unknown[][]

  // 子表头行：数值列名（含「销售额」）所在行。优先选前导列为空的行（真正的子表头），
  // 避免误把主表头行（其数值列常写作「销售订单」等）当作子表头。
  const hasSales = (r: unknown[]): boolean =>
    r.some((c) => String(c ?? '').trim() === '销售额')
  let subIdx = -1
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? []
    if (!hasSales(r)) continue
    if ([0, 1, 2].every((j) => String(r[j] ?? '').trim() === '')) {
      subIdx = i
      break
    }
  }
  if (subIdx === -1) {
    for (let i = 0; i < rows.length; i++) {
      if (hasSales(rows[i] ?? [])) {
        subIdx = i
        break
      }
    }
  }
  if (subIdx < 1) return null

  let period = ''
  let showForm = ''
  let shops: string[] = []
  for (let i = 0; i < subIdx - 1; i++) {
    const r = rows[i] ?? []
    const key = String(r?.[0] ?? '').trim()
    if (key === '日期') period = String(r?.[1] ?? '').trim()
    else if (key === '展示形式') showForm = String(r?.[1] ?? '').trim()
    else if (key === '店铺') {
      shops = String(r?.[1] ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }

  // 周期隔离：周表「商品排名导出」为 7 天跨度，月度解析器若不加日期跨度守卫会把
  // 周文件误判为月度，导致「只插入 7 日数据」时 30 天面板也出现数据。与周表解析器
  // （periodSpanDays >= 28 让渡给月度）对称：这里把明确 <28 天的跨度判为周表，拒绝解析。
  // 跨度无法识别（0，如日期为空/格式异常）时保持原行为，交由上层继续判定。
  const spanDays = periodSpanDays(period)
  if (spanDays >= 1 && spanDays < 28) return null

  const kind: MonthlyRankKind = showForm.includes('规格')
    ? 'systemSkus'
    : showForm.includes('平台')
      ? 'platformLinks'
      : showForm.includes('货品')
        ? 'systemProducts'
        : 'platformLinks'

  const data = (i: number, row: unknown[]): string => String(row[i] ?? '').trim()

  // 子表头行即数值列定义行：按列名取列索引，列顺序变化也能正确解析；找不到时回退到固定列位置。
  const sub = rows[subIdx] ?? []
  const colBy = (name: string, fallback: number): number => {
    const i = sub.findIndex((c) => String(c ?? '').trim() === name)
    return i >= 0 ? i : fallback
  }
  // 同名列（如 systemSkus 里多个「退款率」）按第 n 次出现取列
  const colNth = (name: string, n: number, fallback: number): number => {
    let seen = 0
    for (let i = 0; i < sub.length; i++) {
      if (String(sub[i] ?? '').trim() === name) {
        if (seen === n) return i
        seen++
      }
    }
    return fallback
  }
  // 主表头（子表头上一行）定义身份列（名称/编码/店铺等）
  const head = subIdx >= 1 ? (rows[subIdx - 1] ?? []) : []
  const headCol = (name: string, fallback: number): number => {
    const i = head.findIndex((c) => String(c ?? '').trim() === name)
    return i >= 0 ? i : fallback
  }

  if (kind === 'platformLinks') {
    const id = {
      shop: headCol('店铺', 0),
      linkName: headCol('链接名称', 1),
      linkId: headCol('链接ID', 2),
      linkCode: headCol('链接编码', 3),
      linkTag: headCol('链接标签', 4),
    }
    const c = {
      sales: colBy('销售额', 5),
      salesCount: colBy('销售件数', 6),
      salesCost: colBy('销售成本', 7),
      grossProfit: colBy('毛利额', 8),
      grossMargin: colBy('毛利率', 9),
      refundAmount: colBy('退款金额', 10),
      refundRate: colBy('退款率', 11),
      returnRate: colBy('退货比例', 12),
      netSales: colBy('净销售额', 13),
      adSpend: colBy('推广投放费用', 14),
      fullConv: colBy('全链路支付转化率', 15),
      realConv: colBy('真实支付转化率（扣除特殊单）', 16),
      views: colBy('浏览量', 17),
      visitors: colBy('访客数', 18),
      favCount: colBy('收藏人数', 19),
      favRate: colBy('收藏率', 20),
      cartCount: colBy('加购人数', 21),
      cartQty: colBy('加购件数', 22),
      cartRate: colBy('加购率', 23),
      orderCount: colBy('下单人数', 24),
      orderQty: colBy('下单件数', 25),
      orderRate: colBy('下单率', 26),
      payCount: colBy('支付人数', 27),
      payQty: colBy('支付件数', 28),
      payRate: colBy('支付率', 29),
      searchVisitors: colBy('搜索引导访客数', 30),
      searchPayCount: colBy('搜索引导支付人数', 31),
      searchConv: colBy('搜索引导支付转化率', 32),
      avgPrice: colBy('平均单价', 33),
    }
    const out: WeeklyLinkRow[] = []
    for (let r = subIdx + 1; r < rows.length; r++) {
      const row = rows[r] ?? []
      // 幽灵行：链接名称与链接ID同时为空（导出残留的占位/汇总行），无商品身份，剔除。
      // 这些行销售额/净销为 0，但常残留异常「退款率」（600%/500%/200%），
      // 若保留会在按退款率排行时以空商品名冲进 Top20（对应 1、2、3、5、7 位空白）。
      if (!data(id.linkName, row) && !data(id.linkId, row)) continue
      out.push({
        shop: data(id.shop, row),
        linkName: data(id.linkName, row),
        linkId: data(id.linkId, row),
        linkCode: data(id.linkCode, row),
        linkTag: data(id.linkTag, row),
        sales: toNum(row[c.sales]),
        salesCount: toNum(row[c.salesCount]),
        salesCost: toNum(row[c.salesCost]),
        grossProfit: toNum(row[c.grossProfit]),
        grossMargin: toRate(row[c.grossMargin]),
        refundAmount: toNum(row[c.refundAmount]),
        refundRate: toRate(row[c.refundRate]),
        returnRate: toRate(row[c.returnRate]),
        netSales: toNum(row[c.netSales]),
        adSpend: toNum(row[c.adSpend]),
        fullConv: toRate(row[c.fullConv]),
        realConv: toRate(row[c.realConv]),
        views: toNum(row[c.views]),
        visitors: toNum(row[c.visitors]),
        favCount: toNum(row[c.favCount]),
        favRate: toRate(row[c.favRate]),
        cartCount: toNum(row[c.cartCount]),
        cartQty: toNum(row[c.cartQty]),
        cartRate: toRate(row[c.cartRate]),
        orderCount: toNum(row[c.orderCount]),
        orderQty: toNum(row[c.orderQty]),
        orderRate: toRate(row[c.orderRate]),
        payCount: toNum(row[c.payCount]),
        payQty: toNum(row[c.payQty]),
        payRate: toRate(row[c.payRate]),
        searchVisitors: toNum(row[c.searchVisitors]),
        searchPayCount: toNum(row[c.searchPayCount]),
        searchConv: toRate(row[c.searchConv]),
        avgPrice: toNum(row[c.avgPrice]),
      })
      if (out.length >= 5000) break
    }
    return out.length ? { kind, period, month: monthOf(period), shops, platformLinks: out } : null
  }

  if (kind === 'systemProducts') {
    const id = {
      name: headCol('系统货品名称', 0),
      code: headCol('货品编号', 1),
      brand: headCol('品牌', 2),
      category: headCol('分类', 3),
    }
    const c = {
      sales: colBy('销售额', 4),
      grossProfit: colBy('毛利额', 5),
      grossMargin: colBy('毛利率', 6),
      refundRate: colBy('退款率', 7),
      returnRate: colBy('退货比例', 8),
      netSales: colBy('净销售额', 9),
      adSpend: colBy('推广投放费用', 10),
      avgPrice: colBy('平均单价', 11),
      singleRate: colBy('单件率', 12),
    }
    const out: WeeklyProductRow[] = []
    for (let r = subIdx + 1; r < rows.length; r++) {
      const row = rows[r] ?? []
      if (!data(id.name, row)) continue
      out.push({
        name: data(id.name, row),
        code: data(id.code, row),
        brand: data(id.brand, row),
        category: data(id.category, row),
        sales: toNum(row[c.sales]),
        grossProfit: toNum(row[c.grossProfit]),
        grossMargin: toRate(row[c.grossMargin]),
        refundRate: toRate(row[c.refundRate]),
        returnRate: toRate(row[c.returnRate]),
        netSales: toNum(row[c.netSales]),
        adSpend: toNum(row[c.adSpend]),
        avgPrice: toNum(row[c.avgPrice]),
        singleRate: toRate(row[c.singleRate]),
      })
      if (out.length >= 5000) break
    }
    return out.length ? { kind, period, month: monthOf(period), shops, systemProducts: out } : null
  }

  // systemSkus（月度 26 列，无平台服务费/平台运营费用/软件服务费）
  const id = {
    name: headCol('系统货品名称', 0),
    specName: headCol('系统规格名称', 1),
    code: headCol('商家编码', 2),
    brand: headCol('品牌', 3),
    category: headCol('分类', 4),
  }
  const c = {
    salesRank: colBy('排名（销售额）', 5),
    sales: colBy('销售额', 6),
    countRank: colBy('排名（销售件数）', 7),
    salesCount: colBy('销售件数', 8),
    salesCost: colBy('销售成本', 9),
    profitRank: colNth('排名', 0, 10),
    grossProfit: colBy('毛利额', 11),
    marginRank: colNth('排名', 1, 12),
    grossMargin: colBy('毛利率', 13),
    refundAmount: colBy('退款金额', 14),
    refundRate: colNth('退款率', 0, 15),
    returnRate: colBy('退货比例', 16),
    preShipRefundRate: colNth('退款率', 1, 17),
    postShipRefundRate: colNth('退款率', 2, 18),
    receivedRefundRate: colNth('退款率', 3, 19),
    netSales: colBy('净销售额', 20),
    netCost: colBy('净销售成本', 21),
    adSpend: colBy('推广投放费用', 22),
    offlineFee: colBy('线下费用', 23),
    otherFee: colBy('其他', 24),
    avgPrice: colBy('平均单价', 25),
  }
  const out: MonthlySkuRow[] = []
  for (let r = subIdx + 1; r < rows.length; r++) {
    const row = rows[r] ?? []
    if (!data(id.name, row) && !data(id.specName, row)) continue
    out.push({
      name: data(id.name, row),
      specName: data(id.specName, row),
      code: data(id.code, row),
      brand: data(id.brand, row),
      category: data(id.category, row),
      salesRank: toRank(row[c.salesRank]),
      sales: toNum(row[c.sales]),
      countRank: toRank(row[c.countRank]),
      salesCount: toNum(row[c.salesCount]),
      salesCost: toNum(row[c.salesCost]),
      profitRank: toRank(row[c.profitRank]),
      grossProfit: toNum(row[c.grossProfit]),
      marginRank: toRank(row[c.marginRank]),
      grossMargin: toRate(row[c.grossMargin]),
      refundAmount: toNum(row[c.refundAmount]),
      refundRate: toRate(row[c.refundRate]),
      returnRate: toRate(row[c.returnRate]),
      preShipRefundRate: toRate(row[c.preShipRefundRate]),
      postShipRefundRate: toRate(row[c.postShipRefundRate]),
      receivedRefundRate: toRate(row[c.receivedRefundRate]),
      netSales: toNum(row[c.netSales]),
      netCost: toNum(row[c.netCost]),
      adSpend: toNum(row[c.adSpend]),
      offlineFee: toNum(row[c.offlineFee]),
      otherFee: toNum(row[c.otherFee]),
      avgPrice: toNum(row[c.avgPrice]),
    })
    if (out.length >= 5000) break
  }
  return out.length ? { kind, period, month: monthOf(period), shops, systemSkus: out } : null
}

/** 解析「利润表」xlsx（sheet「利润表」）→ 逐店利润；非该结构返回 null */
export async function parseStoreProfitExcel(
  buffer: Buffer | Uint8Array,
): Promise<MonthlyStoreProfit[] | null> {
  let xlsx: typeof import('xlsx')
  try {
    xlsx = await import('xlsx')
  } catch {
    return null
  }
  const wb = xlsx.read(buffer, { type: 'buffer', cellDates: true })
  const name =
    wb.SheetNames.find((n) => String(n).toLowerCase().includes('利润表')) ?? wb.SheetNames[0]
  if (!name) return null
  const ws = wb.Sheets[name]
  if (!ws) return null
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false }) as unknown[][]

  // 表头行：含「核算项目名称」，其后列即店铺名
  let headerIdx = -1
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i] ?? []).some((c) => String(c ?? '').trim() === '核算项目名称')) {
      headerIdx = i
      break
    }
  }
  if (headerIdx === -1) return null
  const header = rows[headerIdx] ?? []
  // 店铺名 → 列索引（第 0 列为「核算项目名称」，跳过「合计」列；直接用列号避免 +1/+2 偏移）
  const storeCols: { store: string; col: number }[] = []
  for (let c = 1; c < header.length; c++) {
    const s = String(header[c] ?? '').trim()
    if (s && s !== '合计') storeCols.push({ store: s, col: c })
  }
  if (!storeCols.length) return null

  // 指标名 → 列键
  const metricKey = (m: string): keyof MonthlyStoreProfit | null => {
    const s = String(m ?? '').trim()
    if (s === '一、销售收入') return 'sales'
    if (s.includes('正向销售收入')) return 'positiveSales'
    if (s === '退款') return 'refund'
    if (s === '四、毛利') return 'grossProfit'
    if (s === '五、销售毛利率') return 'grossMargin'
    if (s === '六、仓库物流费用') return 'logisticsCost'
    if (s === '七、运营推广费用') return 'promoCost'
    return null
  }

  const acc = storeCols.map(({ store }) => {
    // store 为字符串列，数值指标稍后按行写入；先以 unknown 容纳混合初值，再断言为行类型
    const row: Record<string, unknown> = { store }
    return row as unknown as MonthlyStoreProfit & { store: string }
  })
  const isRate = (k: string): boolean => k === 'grossMargin'

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i] ?? []
    const key = metricKey(String(r[0] ?? ''))
    if (!key) continue
    storeCols.forEach(({ col }, si) => {
      const v = r[col]
      acc[si][key as keyof MonthlyStoreProfit] = (isRate(key) ? toRate(v) : toNum(v)) as never
    })
  }

  // 兜底：个别店铺「一、销售收入」可能为空但「正向销售收入」有值，这类店铺同样在销，
  // 按有效销售收入计算费比；两者皆空（如本表无数据的「积胜体育」列）则视为未在销，予以剔除。
  const out = acc
    .map((s) => {
      const sales = Number(s.sales) || 0
      const positiveSales = Number(s.positiveSales) || 0
      const effSales = sales > 0 ? sales : positiveSales
      return { ...s, sales, positiveSales, feeRatio: effSales > 0 ? (Number(s.promoCost) / effSales) * 100 : 0 }
    })
    .filter((s) => (Number(s.sales) || 0) > 0 || (Number(s.positiveSales) || 0) > 0)
  return out.length ? out : null
}

/** 解析 xlsx → 月度解析结果（排名文件或利润表）；非月度结构返回 null */
export async function parseMonthlyReportExcel(
  buffer: Buffer | Uint8Array,
): Promise<MonthlyParseResult | null> {
  const rank = await parseMonthlyRankExcel(buffer)
  if (rank) return rank
  const profit = await parseStoreProfitExcel(buffer)
  if (profit) {
    return {
      kind: 'storeProfit',
      period: '',
      month: '',
      shops: profit.map((p) => p.store),
      storeProfit: profit,
    }
  }
  return null
}

/** 合并两份月度解析结果（用于把同一周期的多份文件聚成完整 MonthlyReport） */
export function mergeMonthly(
  base: MonthlyReport | null,
  part: MonthlyParseResult,
): MonthlyReport {
  const merged: MonthlyReport = base ?? {
    period: part.period,
    month: part.month,
    updatedAt: new Date().toISOString(),
    shops: part.shops ?? [],
  }
  if (part.period) merged.period = part.period
  if (part.month) merged.month = part.month
  if (part.shops && part.shops.length) merged.shops = part.shops
  // 新周期（日期与已有月报不同）：清空旧周期的全部章节，只保留当前文件对应章节
  if (base && part.period && base.period && base.period !== part.period) {
    delete merged.platformLinks
    delete merged.systemProducts
    delete merged.systemSkus
    delete merged.storeProfit
  }
  if (part.platformLinks) merged.platformLinks = part.platformLinks
  if (part.systemProducts) merged.systemProducts = part.systemProducts
  if (part.systemSkus) merged.systemSkus = part.systemSkus
  if (part.storeProfit) merged.storeProfit = part.storeProfit
  if (part.kind !== 'storeProfit') merged.lastKind = part.kind
  merged.updatedAt = new Date().toISOString()
  return merged
}

/** 解析 JSON（{monthlyReport:{...}} 或直接 MonthlyReport）→ MonthlyReport | null */
export function parseMonthlyReportJson(value: unknown): MonthlyReport | null {
  if (value === null || typeof value !== 'object') return null
  const obj = value as Record<string, unknown>
  const rep = (Array.isArray(obj.monthlyReport) ? null : obj.monthlyReport) as
    | Record<string, unknown>
    | null
  const src = (rep && typeof rep === 'object' ? rep : obj) as Record<string, unknown>
  if (!src || typeof src !== 'object') return null
  const has = (k: string): boolean => Array.isArray(src[k]) && (src[k] as unknown[]).length > 0
  if (!has('platformLinks') && !has('systemProducts') && !has('systemSkus') && !has('storeProfit')) {
    return null
  }
  return {
    period: String(src.period ?? ''),
    month: String(src.month ?? monthOf(String(src.period ?? ''))),
    updatedAt: String(src.updatedAt ?? new Date().toISOString()),
    shops: (src.shops as string[]) ?? [],
    lastKind: (src.lastKind as MonthlyReport['lastKind']) || undefined,
    platformLinks: (src.platformLinks as WeeklyLinkRow[]) ?? [],
    systemProducts: (src.systemProducts as WeeklyProductRow[]) ?? [],
    systemSkus: (src.systemSkus as MonthlySkuRow[]) ?? [],
    storeProfit: (src.storeProfit as MonthlyStoreProfit[]) ?? [],
  }
}
