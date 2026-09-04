/**
 * ecommerce-analyst-plugin — 周复盘解析（对接「周数据」下三份「商品排名导出」文件）
 *
 * 三份文件均为单 sheet「商品排名导出」，通过元数据行「展示形式」区分：
 *   - 平台货品（链接级排名，34 列）
 *   - 系统货品（货品级排名，13 列）
 *   - 系统规格（SKU 级排名，29 列）
 * 结构固定：前 9 行是键值元数据（日期/退款计算/店铺/分类/品牌/展示数量/展示形式/排序类型），
 * 第 10 行分组表头 + 第 11 行子表头，第 12 行起为数据。数字统一去千分位/百分号，缺失按 0。
 * 每份文件解析后返回其对应章节（WeeklyParseResult），由 Store 合并成完整 WeeklyReport。
 */
import type { WeeklyLinkRow, WeeklyProductRow, WeeklyReport, WeeklySkuRow } from './types.ts'

function toNum(v: unknown): number {
  if (v === undefined || v === null) return 0
  const s = String(v).replace(/[,，¥￥%\s]/g, '').trim()
  if (!s || s === '-' || s === '—' || s === '/' || s === '无') return 0
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

/**
 * 比率解析：统一转为百分比数值。
 * 与月度复盘同理：带 %（如 "43.61%"）视为已是百分比，不带 %（如 "0.4361"）视为小数 ×100。
 * 当前周排名文件均以百分比格式存率，此归一保证口径稳定，且兼容同格式不同内容文件。
 */
function toRate(v: unknown): number {
  if (v === undefined || v === null) return 0
  const s = String(v).replace(/[,，¥￥\s]/g, '').trim()
  if (!s || s === '-' || s === '—' || s === '/' || s === '无') return 0
  const hasPct = s.includes('%')
  const n = Number(s.replace(/%/g, ''))
  if (!Number.isFinite(n)) return 0
  return hasPct ? n : n * 100
}

/** 排名类数值：排名为空（前几行常缺排名）时按 0 */
function toRank(v: unknown): number {
  const n = toNum(v)
  return n > 0 ? Math.round(n) : 0
}

/** 从日期跨度（"YYYY-MM-DD~YYYY-MM-DD"）算天数；解析失败返回 0 */
function periodSpanDays(period: string): number {
  const m = String(period || '').match(/(\d{4})-(\d{2})-(\d{2})\s*[~～]\s*(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return 0
  const [, y1, mo1, d1, y2, mo2, d2] = m
  const t1 = new Date(`${y1}-${mo1}-${d1}T00:00:00Z`).getTime()
  const t2 = new Date(`${y2}-${mo2}-${d2}T00:00:00Z`).getTime()
  if (!Number.isFinite(t1) || !Number.isFinite(t2)) return 0
  return Math.round((t2 - t1) / 86400000) + 1
}

export type WeeklyRankKind = 'platformLinks' | 'systemProducts' | 'systemSkus'

/** 单份「商品排名导出」文件的解析结果（只含其对应章节） */
export interface WeeklyParseResult {
  kind: WeeklyRankKind
  period: string
  shops: string[]
  platformLinks?: WeeklyLinkRow[]
  systemProducts?: WeeklyProductRow[]
  systemSkus?: WeeklySkuRow[]
}

/** 解析单份周排名 xlsx → 对应章节；非「商品排名导出」结构返回 null */
export async function parseWeeklyRankExcel(
  buffer: Buffer | Uint8Array,
): Promise<WeeklyParseResult | null> {
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

  // 子表头行：某单元格恰好等于「销售额」
  let subIdx = -1
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? []
    if (r.some((c) => String(c ?? '').trim() === '销售额')) {
      subIdx = i
      break
    }
  }
  if (subIdx < 1) return null

  // 元数据只取子表头之前的行（避免把分组表头的「店铺」列误当元数据键值）
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

  // 周期判别：周表为 7 天跨度，月表为整月（如 2026-07-01~2026-07-31）。
  // 整月跨度的「商品排名导出」属月度数据，交由月度解析器处理，避免误导入周复盘。
  if (periodSpanDays(period) >= 28) return null

  const kind: WeeklyRankKind = showForm.includes('规格')
    ? 'systemSkus'
    : showForm.includes('平台')
      ? 'platformLinks'
      : showForm.includes('货品')
        ? 'systemProducts'
        : 'platformLinks'

  const data = (i: number, row: unknown[]): string => String(row[i] ?? '').trim()

  if (kind === 'platformLinks') {
    const out: WeeklyLinkRow[] = []
    for (let r = subIdx + 1; r < rows.length; r++) {
      const row = rows[r] ?? []
      // 幽灵行：链接名称(1)与链接ID(2)同时为空 → 无商品身份，剔除（避免异常退款率冲进 Top20 造成空名）
      if (!data(1, row) && !data(2, row)) continue
      out.push({
        shop: data(0, row),
        linkName: data(1, row),
        linkId: data(2, row),
        linkCode: data(3, row),
        linkTag: data(4, row),
        sales: toNum(row[5]),
        salesCount: toNum(row[6]),
        salesCost: toNum(row[7]),
        grossProfit: toNum(row[8]),
        grossMargin: toRate(row[9]),
        refundAmount: toNum(row[10]),
        refundRate: toRate(row[11]),
        returnRate: toRate(row[12]),
        netSales: toNum(row[13]),
        adSpend: toNum(row[14]),
        fullConv: toRate(row[15]),
        realConv: toRate(row[16]),
        views: toNum(row[17]),
        visitors: toNum(row[18]),
        favCount: toNum(row[19]),
        favRate: toRate(row[20]),
        cartCount: toNum(row[21]),
        cartQty: toNum(row[22]),
        cartRate: toRate(row[23]),
        orderCount: toNum(row[24]),
        orderQty: toNum(row[25]),
        orderRate: toRate(row[26]),
        payCount: toNum(row[27]),
        payQty: toNum(row[28]),
        payRate: toRate(row[29]),
        searchVisitors: toNum(row[30]),
        searchPayCount: toNum(row[31]),
        searchConv: toRate(row[32]),
        avgPrice: toNum(row[33]),
      })
      if (out.length >= 5000) break
    }
    return out.length ? { kind, period, shops, platformLinks: out } : null
  }

  if (kind === 'systemProducts') {
    const out: WeeklyProductRow[] = []
    for (let r = subIdx + 1; r < rows.length; r++) {
      const row = rows[r] ?? []
      if (!data(0, row)) continue
      out.push({
        name: data(0, row),
        code: data(1, row),
        brand: data(2, row),
        category: data(3, row),
        sales: toNum(row[4]),
        grossProfit: toNum(row[5]),
        grossMargin: toRate(row[6]),
        refundRate: toRate(row[7]),
        returnRate: toRate(row[8]),
        netSales: toNum(row[9]),
        adSpend: toNum(row[10]),
        avgPrice: toNum(row[11]),
        singleRate: toRate(row[12]),
      })
      if (out.length >= 5000) break
    }
    return out.length ? { kind, period, shops, systemProducts: out } : null
  }

  // systemSkus
  const out: WeeklySkuRow[] = []
  for (let r = subIdx + 1; r < rows.length; r++) {
    const row = rows[r] ?? []
    if (!data(0, row) && !data(1, row)) continue
    out.push({
      name: data(0, row),
      specName: data(1, row),
      code: data(2, row),
      brand: data(3, row),
      category: data(4, row),
      salesRank: toRank(row[5]),
      sales: toNum(row[6]),
      countRank: toRank(row[7]),
      salesCount: toNum(row[8]),
      salesCost: toNum(row[9]),
      profitRank: toRank(row[10]),
      grossProfit: toNum(row[11]),
      marginRank: toRank(row[12]),
      grossMargin: toRate(row[13]),
      refundAmount: toNum(row[14]),
      refundRate: toRate(row[15]),
      returnRate: toRate(row[16]),
      preShipRefundRate: toRate(row[17]),
      postShipRefundRate: toRate(row[18]),
      receivedRefundRate: toRate(row[19]),
      netSales: toNum(row[20]),
      netCost: toNum(row[21]),
      platformFee: toNum(row[22]),
      platformOperFee: toNum(row[23]),
      softwareFee: toNum(row[24]),
      adSpend: toNum(row[25]),
      offlineFee: toNum(row[26]),
      otherFee: toNum(row[27]),
      avgPrice: toNum(row[28]),
    })
    if (out.length >= 5000) break
  }
  return out.length ? { kind, period, shops, systemSkus: out } : null
}

/** 合并两份解析结果（用于把同一周期的多份文件聚成完整 WeeklyReport） */
export function mergeWeekly(
  base: WeeklyReport | null,
  part: WeeklyParseResult,
): WeeklyReport {
  const merged: WeeklyReport = base ?? {
    period: part.period,
    updatedAt: new Date().toISOString(),
    shops: part.shops ?? [],
  }
  if (part.period) merged.period = part.period
  if (part.shops && part.shops.length) merged.shops = part.shops
  // 新周期（日期与已有周报不同）：清空旧周期的全部章节，只保留当前文件对应章节，
  // 等待后续同周期文件补齐——杜绝「插入新一周数据后残留上一周其它层级」的混搭。
  if (base && part.period && base.period && base.period !== part.period) {
    delete merged.platformLinks
    delete merged.systemProducts
    delete merged.systemSkus
  }
  if (part.platformLinks) merged.platformLinks = part.platformLinks
  if (part.systemProducts) merged.systemProducts = part.systemProducts
  if (part.systemSkus) merged.systemSkus = part.systemSkus
  // 记录最近一次导入的层级：分次导入不同文件时，前端「销售概览」主口径随之切换，
  // 保证「导入平台货品 → 主口径链接」「导入系统货品 → 主口径货品」等，面板可见变化。
  merged.lastKind = part.kind
  // 每次合并都刷新时间戳，便于前端/持久化识别「数据已更新」（三份文件分次导入，最后一份时间即整份周报时间）
  merged.updatedAt = new Date().toISOString()
  return merged
}
