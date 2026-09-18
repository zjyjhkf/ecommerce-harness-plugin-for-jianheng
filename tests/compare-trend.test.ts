/**
 * v0.4.0 数据对比（多月份归档 + 趋势聚合 + 模块隔离）与报表导出回归测试
 *
 * 严格覆盖用户验收点：
 *  ① 连续导入两月（a、b）→ 数据对比模块必出现（showModule=true，趋势 ≥2 点，
 *     顶部 KPI 大字=最新月 A、小字=上一月 B，毛利与费比为独立指标）；
 *  ② 一键清除 → 归档/上一期/趋势全部归零，showModule=false，模块必隐藏（隔离）；
 *  ③ 导出：只有复盘报表（无商品/订单）时 CSV 必须含报表数据行（修复"空 CSV"）；
 *     完全无数据时返回明确 400 EXPORT_EMPTY，不再产出无意义空表。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EventEmitter } from 'node:events'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'
import { buildCompare, buildMonthTrend, buildMonthTrendPoint, COMPARE_METRICS, CORE_TREND_METRICS } from '../src/compare.ts'
import { buildComparePayload } from '../src/compare-payload.ts'
import { registerShopApi, type WebServerLike } from '../src/shop-api.ts'
import type { MonthlyReport } from '../src/types.ts'

/** 构造一份完整月报（三层级 + 利润表），factor 控制量级（模拟不同月份数据不同） */
function makeMonth(month: string, factor: number): MonthlyReport {
  const n = (v: number) => Math.round(v * factor)
  return {
    period: `2026-${month}-01~2026-${month}-28`,
    month: `2026-${month}`,
    updatedAt: '2026-09-14',
    shops: ['天猫店A', '拼多多店B'],
    platformLinks: [
      { shop: '天猫店A', linkName: '链接甲', linkId: 'L1', linkCode: 'C1', linkTag: '', sales: n(100000), salesCount: n(200), salesCost: n(60000), grossProfit: n(30000), grossMargin: 30, refundAmount: n(8000), refundRate: 8, returnRate: 2, netSales: n(92000), adSpend: n(9000), views: n(5000), avgPrice: n(500) },
      { shop: '拼多多店B', linkName: '链接乙', linkId: 'L2', linkCode: 'C2', linkTag: '', sales: n(50000), salesCount: n(100), salesCost: n(32000), grossProfit: n(14000), grossMargin: 28, refundAmount: n(5000), refundRate: 10, returnRate: 3, netSales: n(45000), adSpend: n(6000), views: n(2500), avgPrice: n(500) },
    ],
    systemProducts: [
      { name: '货品X', code: 'P1', brand: 'B1', category: '家居', sales: n(120000), salesCount: n(240), netSales: n(111000), grossProfit: n(36000), grossMargin: 30, refundRate: 8, adSpend: n(12000), avgPrice: n(500) },
      { name: '货品Y', code: 'P2', brand: 'B1', category: '数码', sales: n(30000), salesCount: n(60), netSales: n(26000), grossProfit: n(8000), grossMargin: 27, refundRate: 12, adSpend: n(3000), avgPrice: n(500) },
    ],
    systemSkus: [
      { name: '货品X', specName: '规格1', code: 'S1', brand: 'B1', category: '家居', salesRank: 1, sales: n(70000), countRank: 1, salesCount: n(140), salesCost: n(42000), profitRank: 1, grossProfit: n(21000), marginRank: 1, grossMargin: 30, refundAmount: n(5000), refundRate: 7, returnRate: 2, preShipRefundRate: 2, postShipRefundRate: 5, receivedRefundRate: 4, netSales: n(65000), netCost: n(39000) },
      { name: '货品X', specName: '规格2', code: 'S2', brand: 'B1', category: '家居', salesRank: 2, sales: n(50000), countRank: 2, salesCount: n(100), salesCost: n(30000), profitRank: 2, grossProfit: n(15000), marginRank: 2, grossMargin: 30, refundAmount: n(4000), refundRate: 8, returnRate: 2, preShipRefundRate: 2, postShipRefundRate: 6, receivedRefundRate: 4, netSales: n(46000), netCost: n(27600) },
      { name: '货品Y', specName: '黑色', code: 'S3', brand: 'B1', category: '数码', salesRank: 3, sales: n(30000), countRank: 3, salesCount: n(60), salesCost: n(20000), profitRank: 3, grossProfit: n(8000), marginRank: 3, grossMargin: 27, refundAmount: n(3000), refundRate: 10, returnRate: 3, preShipRefundRate: 3, postShipRefundRate: 7, receivedRefundRate: 5, netSales: n(27000), netCost: n(18000) },
    ],
    storeProfit: [
      { store: '天猫店A', sales: n(100000), positiveSales: n(108000), refund: n(8000), grossProfit: n(30000), grossMargin: 30, logisticsCost: n(5000), promoCost: n(9000), feeRatio: 9 },
      { store: '拼多多店B', sales: n(50000), positiveSales: n(55000), refund: n(5000), grossProfit: n(14000), grossMargin: 28, logisticsCost: n(2500), promoCost: n(6000), feeRatio: 12 },
    ],
  } as unknown as MonthlyReport
}

async function makeStore(): Promise<{ store: EcommerceStore; dir: string }> {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-trend-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'), seedOnEmpty: true, lowStockThreshold: 10,
  })
  await store.init()
  return { store, dir }
}

/* ─────────────── ① 多月份归档与趋势聚合 ─────────────── */

test('连续导入两月：归档升序含两期，getPreviousMonthlyReport 与 history 同步成立', async () => {
  const { store, dir } = await makeStore()
  store.setMonthlyReport(makeMonth('06', 1))
  store.setMonthlyReport(makeMonth('07', 1.1))
  const hist = store.getMonthlyHistory()
  assert.equal(hist.length, 2, '两月归档')
  assert.ok(hist[0].period < hist[1].period, '按 period 升序')
  assert.equal(store.getPreviousMonthlyReport()?.month, '2026-06')
  assert.equal(store.getMonthlyReport()?.month, '2026-07')
  rmSync(dir, { recursive: true, force: true })
})

test('同月重复导入：归档 upsert 覆盖当月，不产生重复月份', async () => {
  const { store, dir } = await makeStore()
  store.setMonthlyReport(makeMonth('07', 1))
  store.setMonthlyReport(makeMonth('07', 2)) // 同月修正重导
  const hist = store.getMonthlyHistory()
  assert.equal(hist.length, 1, '同月 upsert 不叠加')
  const pt = buildMonthTrend(hist)[0]
  assert.equal(pt.netSales, Math.round((150000 - 13000) * 2), '净销=收入-退款 按最新覆盖')
  rmSync(dir, { recursive: true, force: true })
})

test('buildMonthTrendPoint：以利润表（财务口径）为准，净销/毛利/推广/费比/规格数口径正确', () => {
  const rep = makeMonth('07', 1)
  const pt = buildMonthTrendPoint(rep)
  // 用户指定口径：销售额 = 正向销售额 = 利润表「销售收入」；净销售额 = 销售收入 − 退款
  assert.equal(pt.source, 'storeProfit', '有利润表 → 取数层级=财务口径，面板据此标注')
  assert.equal(pt.sales, 150000, '销售额=利润表销售收入合计（100000+50000）')
  assert.equal(pt.netSales, 137000, '净销额=销售收入−退款（150000−13000），不是排名表列')
  assert.equal(pt.grossProfit, 44000, '毛利=利润表毛利额合计')
  assert.equal(pt.promoCost, 15000, '推广费=利润表推广运营费用合计')
  assert.equal(pt.skuCount, 3, '产品规格数=系统SKU 行数')
  assert.equal(pt.feeRatio, Math.round((15000 / 150000) * 1000) / 10, '费比=推广费÷销售收入%（财务口径 10.0%）')
  assert.equal(pt.label, '7月', '短标签用于柱状 x 轴')
})

test('回归：净销售额恒等于 销售额 − 退款，绝不出现「净销额 > 销售额」', () => {
  const rep = makeMonth('07', 1)
  // 排名表净销售额列（92000+45000=137000）与其自算值一致，但排名表销售额（150000）里
  // 有 578.9万/428.4万 那类跨口径差，趋势头寸必须只认利润表
  const pt = buildMonthTrendPoint(rep)
  assert.equal(pt.netSales, (pt.sales ?? 0) - 13000, '净销额 = 销售额 − 退款')
  assert.ok((pt.netSales ?? 0) < (pt.sales ?? 0), '净销额必须小于销售额（退款为正）')
  // 指定排名层级也不改变头寸口径：利润表在就仍走财务口径（面板用 source 标注清楚）
  for (const kind of ['platformLinks', 'systemProducts', 'systemSkus'] as const) {
    assert.equal(buildMonthTrendPoint(rep, kind).source, 'storeProfit', kind + '：利润表在场时仍为财务口径')
  }
})

test('无利润表的月份：趋势回退排名层级，且与同层级明细表净销额严格同源（回归：曾出现 ±112 万口径差）', () => {
  const rep = makeMonth('07', 1)
  delete (rep as { storeProfit?: unknown }).storeProfit // 只在这一条件下趋势才走排名口径
  for (const kind of ['platformLinks', 'systemProducts', 'systemSkus'] as const) {
    const pt = buildMonthTrendPoint(rep, kind)
    const r = buildCompare({ cycle: '30d', kind, metricId: 'netSales', prevReport: rep, currReport: rep, limit: 1000 })
    assert.equal(pt.source, kind, kind + ' 回退时趋势点层级正确')
    assert.equal(pt.netSales, Math.round(r!.summary.currTotal), kind + '：趋势 KPI 净销额必须等于同屏明细表总计')
  }
  // 换 kind 即换表：三个层级各自的合计不同，趋势点必须跟着变
  const a = buildMonthTrendPoint(rep, 'platformLinks').netSales
  const b = buildMonthTrendPoint(rep, 'systemProducts').netSales
  assert.equal(a, 137000)
  assert.equal(b, 137000, '本 fixture 两表恰好同额；重点在下方回归用不同额 fixture 验证')
})

test('回归：货品/规格层级的净销额取表内列，不得用「销售额−退款」反算（WeeklyProductRow 无 refundAmount）', () => {
  const rep = makeMonth('07', 1)
  // 货品表：销售额 150000、净销售额仅 100000（退款 5 万），且货品行根本没有 refundAmount 字段
  rep.systemProducts = [
    { name: '货品X', code: 'P1', brand: 'B1', category: '家居', sales: 150000, netSales: 100000, grossProfit: 30000, grossMargin: 30, refundRate: 33, returnRate: 5, adSpend: 9000, avgPrice: 500, singleRate: 80 },
  ] as never
  delete (rep as { platformLinks?: unknown }).platformLinks
  delete (rep as { storeProfit?: unknown }).storeProfit // 复现「只有排名表」的月份，才能验证排名层取数
  const pt = buildMonthTrendPoint(rep)
  assert.equal(pt.source, 'systemProducts')
  assert.equal(pt.sales, 150000)
  assert.equal(pt.netSales, 100000, '净销额=表内净销售额列；若用 销售额−退款 会因字段缺失得到 150000')
  assert.notEqual(pt.netSales, pt.sales, '不得出现「净销额=销售额」这种退款被吞掉的结果')
  assert.equal(pt.feeRatio, Math.round((9000 / 100000) * 1000) / 10, '费比=推广费÷净销售额')
})

test('缺利润表的月份：毛利/费比回退排名层级，费比可为 null 但趋势点不丢弃', () => {
  const rep = makeMonth('05', 1)
  delete (rep as { storeProfit?: unknown }).storeProfit
  const pt = buildMonthTrendPoint(rep)
  assert.equal(pt.source, 'platformLinks', '无利润表 → 回退平台链接层')
  assert.equal(pt.sales, 150000, '收入回退排名合计')
  assert.equal(pt.grossProfit, 44000, '毛利回退链接级合计')
  assert.equal(pt.skuCount, 3)
  assert.ok(pt.feeRatio !== null, '推广费/净销可算 → 费比存在')
})

test('趋势核心指标目录：净销额/产品规格数/推广费/毛利/费比 五键齐全，毛利与费比彼此独立', () => {
  const ids = CORE_TREND_METRICS.map((m) => m.id)
  assert.deepEqual(ids, ['netSales', 'skuCount', 'promoCost', 'grossProfit', 'feeRatio'])
})

test('对比指标目录精简：非核心按键（正向销售收入/仓库物流费等）已删除', () => {
  const all = Object.values(COMPARE_METRICS).flat().map((m) => m.id)
  assert.ok(!all.includes('positiveSales'), '正向销售收入已删')
  assert.ok(!all.includes('logisticsCost'), '仓库物流费已删')
  assert.ok(!all.includes('views') && !all.includes('avgPrice'), '浏览量/客单价已删')
  for (const rows of Object.values(COMPARE_METRICS)) {
    const ids = rows.map((m) => m.id)
    assert.ok(ids.includes('netSales') && ids.includes('grossProfit'), '每层级保留净销/毛利核心')
  }
})

/* ─────────────── ② showModule 隔离判定 ─────────────── */

test('payload：单月 showModule=false；连续两月 showModule=true 且 trend=2 点', async () => {
  const { store, dir } = await makeStore()
  store.setMonthlyReport(makeMonth('06', 1))
  const one = buildComparePayload(store, '30d')
  assert.equal(one.showModule, false, '仅一个月 → 数据对比模块不出现')
  assert.equal(one.trend.length, 1)
  store.setMonthlyReport(makeMonth('07', 1.1))
  const two = buildComparePayload(store, '30d')
  assert.equal(two.showModule, true, '两月 → 必出现')
  assert.equal(two.trend.length, 2)
  assert.equal(two.trend[1].month, '2026-07', '末点=最新月（KPI 大字取它）')
  assert.ok(two.result !== null, '实体对比结果可用')
  rmSync(dir, { recursive: true, force: true })
})

test('一键清除：归档/上一期/趋势/模块判定全部归零（清除后模块必隐藏）', async () => {
  const { store, dir } = await makeStore()
  store.setMonthlyReport(makeMonth('06', 1))
  store.setMonthlyReport(makeMonth('07', 1.1))
  assert.equal(buildComparePayload(store, '30d').showModule, true)
  store.clearAllData()
  assert.equal(store.getMonthlyHistory().length, 0, '归档清零')
  assert.equal(store.getPreviousMonthlyReport(), null)
  assert.equal(store.getMonthlyReport(), null)
  const after = buildComparePayload(store, '30d')
  assert.equal(after.showModule, false, '清除后 showModule=false → 菜单必隐藏')
  assert.equal(after.trend.length, 0)
  assert.equal(after.hasPrev, false)
  rmSync(dir, { recursive: true, force: true })
})

test('清除后重启语义：持久化恢复后归档仍为空（不残留旧对比数据）', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-trend-'))
  const file = join(dir, 'store.json')
  const s1 = new EcommerceStore(new MockAdapter(), { file, seedOnEmpty: true, lowStockThreshold: 10 })
  await s1.init()
  s1.setMonthlyReport(makeMonth('06', 1))
  s1.setMonthlyReport(makeMonth('07', 1.1))
  s1.clearAllData()
  const s2 = new EcommerceStore(new MockAdapter(), { file, seedOnEmpty: true, lowStockThreshold: 10 })
  await s2.init()
  assert.equal(s2.getMonthlyHistory().length, 0, '持久化清除彻底')
  rmSync(dir, { recursive: true, force: true })
})

/* ─────────────── ③ 导出接口：报表数据入 CSV / 空数据明确报错 ─────────────── */

type FakeReq = EventEmitter & { url: string; method: string; headers: Record<string, string>; destroy: () => void }
type FakeRes = {
  statusCode: number
  headers: Record<string, unknown>
  body: string
  writeHead(s: number, h?: Record<string, unknown>): void
  end(c?: unknown): void
}
function makeReq(url: string, method: string, body?: unknown): FakeReq {
  const req = new EventEmitter() as FakeReq
  req.url = url
  req.method = method
  req.headers = {}
  req.destroy = () => {}
  queueMicrotask(() => {
    if (method === 'POST') req.emit('data', Buffer.from(body === undefined ? '' : JSON.stringify(body)))
    req.emit('end')
  })
  return req
}
function makeRes(): FakeRes {
  return {
    statusCode: 0,
    headers: {} as Record<string, unknown>,
    body: '',
    writeHead(status: number, headers?: Record<string, unknown>): void {
      this.statusCode = status
      if (headers) this.headers = headers
    },
    end(chunk?: unknown): void {
      this.body = String(chunk ?? '')
    },
  } as FakeRes
}
async function call(handler: (req: unknown, res: unknown) => void | Promise<void>, method: string, url: string, body?: unknown) {
  const req = makeReq(url, method, body)
  const res = makeRes()
  await handler(req, res)
  let json: Record<string, unknown> | null = null
  try { json = JSON.parse(res.body) as Record<string, unknown> } catch { /* csv */ }
  return { status: res.statusCode, text: res.body, json }
}
function api(store: EcommerceStore): Promise<(req: unknown, res: unknown) => void | Promise<void>> {
  let handler: ((req: unknown, res: unknown) => void | Promise<void>) | null = null
  const webServer: WebServerLike = {
    port: 0,
    register(r) {
      handler = r.handler as (req: unknown, res: unknown) => void | Promise<void>
      return () => {}
    },
    tapIndex(): () => void { return () => {} },
  }
  registerShopApi(webServer, store, {})
  return new Promise((resolve) => setTimeout(() => resolve(handler!), 0))
}

test('导出修复：只有复盘报表（商品/订单为空）时，scope=all CSV 必须含报表数据行', async () => {
  const { store, dir } = await makeStore()
  store.clearAllData() // 商品/订单归零 → 复现用户场景：数据主体是导入的复盘 Excel
  store.setMonthlyReport(makeMonth('06', 1))
  store.setMonthlyReport(makeMonth('07', 1.1))
  const handler = await api(store)

  const all = await call(handler, 'GET', '/ecommerce-api/export?type=csv&scope=all')
  assert.equal(all.status, 200)
  assert.ok(all.text.startsWith('﻿'), 'BOM 开头')
  assert.ok(all.text.includes('月度复盘 2026-06'), '含 6 月归档区块')
  assert.ok(all.text.includes('月度复盘 2026-07'), '含 7 月当前区块')
  assert.ok(all.text.includes('链接名称'), '含链接级表头')
  assert.ok(all.text.includes('店铺'), '含利润表店铺列')
  const dataLines = all.text.split('\r\n').filter((l) => l.replace(/﻿/, '').trim() !== '').length
  assert.ok(dataLines > 20, `CSV 含实际数据行（当前 ${dataLines} 行），不是空表`)

  const reports = await call(handler, 'GET', '/ecommerce-api/export?type=csv&scope=reports')
  assert.equal(reports.status, 200)
  assert.ok(reports.text.includes('货品名称'), 'scope=reports 导出复盘层级明细')
  rmSync(dir, { recursive: true, force: true })
})

test('导出隔离：完全无数据 → 400 EXPORT_EMPTY 明确报错，不给空 CSV', async () => {
  const { store, dir } = await makeStore()
  store.clearAllData()
  const handler = await api(store)
  for (const url of ['/ecommerce-api/export?type=csv&scope=all', '/ecommerce-api/export?type=csv&scope=reports']) {
    const res = await call(handler, 'GET', url)
    assert.equal(res.status, 400, url + ' 应 400')
    assert.equal((res.json?.error as { code?: string } | undefined)?.code, 'EXPORT_EMPTY')
    assert.ok(String((res.json?.error as { message?: string } | undefined)?.message ?? '').includes('导入'), '提示先导入')
  }
  rmSync(dir, { recursive: true, force: true })
})

test('JSON 导出携带多月份归档（备份/恢复含 history）', async () => {
  const { store, dir } = await makeStore()
  store.clearAllData()
  store.setMonthlyReport(makeMonth('06', 1))
  store.setMonthlyReport(makeMonth('07', 1.1))
  const handler = await api(store)
  const res = await call(handler, 'GET', '/ecommerce-api/export?type=json')
  const v = res.json?.value as { monthlyHistory?: unknown[]; weekly?: unknown }
  assert.equal(v.monthlyHistory?.length, 2, 'JSON 导出含 2 个月归档')
  rmSync(dir, { recursive: true, force: true })
})

/* ─────────── ④ 真实 Excel 两月连导端到端（用户交付场景，桌面源文件缺失时自动跳过） ─────────── */

const { existsSync, readFileSync } = await import('node:fs')
const { MONTHLY_FILES, AUGUST_FILES } = await import('../scripts/test-support.ts')
const haveRealFiles =
  Object.values(MONTHLY_FILES).every((f) => existsSync(f)) && Object.values(AUGUST_FILES).every((f) => existsSync(f))

function batchFiles(set: { links: string; products: string; skus: string; profit: string }) {
  return (['links', 'products', 'skus', 'profit'] as const).map((k) => ({
    filename: set[k].split('/').pop()!,
    content: readFileSync(set[k]).toString('base64'),
    encoding: 'base64',
  }))
}

test('真实源文件：连续导入 7月+8月 → /compare showModule=true 且趋势两点；清除 → 必隐藏；重导 → 再现', { skip: !haveRealFiles, timeout: 60_000 }, async () => {
  const { store, dir } = await makeStore()
  const handler = await api(store)

  // 第一期：7 月四份
  let res = await call(handler, 'POST', '/ecommerce-api/import-batch', { files: batchFiles(MONTHLY_FILES) })
  assert.equal(res.status, 200, '7 月批量导入 200')
  assert.equal(res.json?.value?.monthlyReport, true, '7 月导入形成月报')
  let cmp = await call(handler, 'GET', '/ecommerce-api/compare?cycle=30d')
  assert.equal((cmp.json?.value as { showModule?: boolean }).showModule, false, '仅 1 个月 → 对比模块不出现')

  // 第二期：8 月四份（连续导入两月 → 数据对比必现）
  res = await call(handler, 'POST', '/ecommerce-api/import-batch', { files: batchFiles(AUGUST_FILES) })
  assert.equal(res.json?.value?.monthlyReport, true, '8 月批量导入形成月报')
  cmp = await call(handler, 'GET', '/ecommerce-api/compare?cycle=30d')
  const v1 = cmp.json?.value as { showModule?: boolean; trend?: { period: string; month: string; label: string; netSales: number | null; skuCount: number | null }[]; hasPrev?: boolean }
  assert.equal(v1.showModule, true, '★ 连续导入两月 → 数据对比模块必出现')
  assert.equal(v1.hasPrev, true)
  assert.equal(v1.trend?.length, 2, '趋势两点（7月/8月）')
  const [t0, t1] = v1.trend!
  assert.ok(t0.period < t1.period, '趋势按 period 升序（末点=最新月 → KPI 大字）')
  assert.ok(t0.netSales !== null && t1.netSales !== null, '两月净销额均可算')
  assert.ok((t0.skuCount ?? 0) > 0 && (t1.skuCount ?? 0) > 0, '两月产品规格数均可算')

  // 一键清除 → 模块必隐藏（隔离）
  await call(handler, 'POST', '/ecommerce-api/clear-data')
  cmp = await call(handler, 'GET', '/ecommerce-api/compare?cycle=30d')
  const v2 = cmp.json?.value as { showModule?: boolean; trend?: unknown[]; hasPrev?: boolean }
  assert.equal(v2.showModule, false, '★ 清除后数据对比模块必隐藏')
  assert.equal(v2.trend?.length, 0, '清除后趋势归零')

  // 重新连导两月 → 再次必现（可重复、幂等）
  await call(handler, 'POST', '/ecommerce-api/import-batch', { files: batchFiles(MONTHLY_FILES) })
  await call(handler, 'POST', '/ecommerce-api/import-batch', { files: batchFiles(AUGUST_FILES) })
  cmp = await call(handler, 'GET', '/ecommerce-api/compare?cycle=30d')
  const v3 = cmp.json?.value as { showModule?: boolean }
  assert.equal(v3.showModule, true, '★ 清除后重新连导两月 → 对比再次必现')

  // 导出闭环：两月归档都要进 CSV（含 7月与 8月 区块）
  const exp = await call(handler, 'GET', '/ecommerce-api/export?type=csv&scope=reports')
  assert.equal(exp.status, 200)
  assert.ok(exp.text.includes('月度复盘'), '报表 CSV 含月度区块')
  const cmpFinal = await call(handler, 'GET', '/ecommerce-api/compare?cycle=30d')
  const trendFinal = (cmpFinal.json?.value as { trend?: { month: string }[] }).trend ?? []
  assert.ok(trendFinal.length >= 2)
  for (const t of trendFinal) assert.ok(exp.text.includes('月度复盘 ' + t.month), `CSV 含归档月份 ${t.month}`)
  rmSync(dir, { recursive: true, force: true })
})
