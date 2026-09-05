/**
 * 数据对比单测（无外部依赖）
 *
 * 覆盖两个层面：
 *   1. 对比引擎 src/compare.ts：buildCompare 的行对齐（id/code 与名称降级）、
 *      汇总（金额求和 vs 比率加权平均）、rank 名次位移、summary 计数、null 语义；
 *   2. Store 归档：导入新周期自动把上一期归档（importMonthlyReport /
 *      mergeWeeklyReport 周期变化才归档、同周期补文件不重复归档），
 *      以及 buildComparePayload + /ecommerce-api/compare 接口契约。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EventEmitter } from 'node:events'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'
import { buildCompare, type CompareResult } from '../src/compare.ts'
import { buildComparePayload } from '../src/compare-payload.ts'
import { registerShopApi, type WebServerLike } from '../src/shop-api.ts'

type Link = { linkId: string; linkName: string; shop: string; sales: number }
type Prod = { name: string; code: string; sales: number; grossMargin: number }

function weekly(period: string, links: Link[]): { period: string; platformLinks: Link[] } {
  return { period, platformLinks: links }
}
function monthlyProducts(period: string, products: Prod[]): { period: string; month: string; systemProducts: Prod[] } {
  return { period, month: period.slice(0, 7), systemProducts: products }
}

/* ───────────────────────── 1) 对比引擎语义 ───────────────────────── */

test('buildCompare：匹配/新增/退出 + 金额增减 + rank 位移（链接）', () => {
  const prev = weekly('2026-08-23~2026-08-29', [
    { linkId: 'A', linkName: '链接A', shop: '店1', sales: 100 },
    { linkId: 'B', linkName: '链接B', shop: '店1', sales: 200 },
  ])
  const curr = weekly('2026-08-30~2026-09-05', [
    { linkId: 'A', linkName: '链接A', shop: '店1', sales: 150 },
    { linkId: 'B', linkName: '链接B', shop: '店1', sales: 100 },
    { linkId: 'C', linkName: '链接C', shop: '店1', sales: 60 },
  ])
  const r = buildCompare({ cycle: '7d', kind: 'platformLinks', metricId: 'sales', prevReport: prev, currReport: curr })
  assert.ok(r, '两期均有链接 → 非 null')
  const s = r!.summary
  assert.equal(s.prevTotal, 300)
  assert.equal(s.currTotal, 310)
  assert.equal(s.delta, 10)
  assert.ok(s.deltaPct !== null && Math.abs(s.deltaPct - 10 / 3) < 0.01, '增减率 ≈ 3.33%')
  assert.equal(s.matched, 2)
  assert.equal(s.added, 1)
  assert.equal(s.removed, 0)
  assert.equal(s.rankUp, 1)
  assert.equal(s.rankDown, 1)
  // 名次：上期 B(200)>A(100)；本期 A(150)>B(100)>C(60)
  const byKey = new Map(r!.rows.map((x) => [x.key, x]))
  const a = byKey.get('id:A')
  assert.equal(a?.prev, 100)
  assert.equal(a?.curr, 150)
  assert.equal(a?.delta, 50)
  assert.equal(a?.rankPrev, 2)
  assert.equal(a?.rankCurr, 1)
  assert.equal(a?.rankShift, 1)
  const b = byKey.get('id:B')
  assert.equal(b?.delta, -100)
  assert.equal(b?.rankPrev, 1)
  assert.equal(b?.rankCurr, 2)
  assert.equal(b?.rankShift, -1)
  const c = byKey.get('id:C')
  assert.equal(c?.state, 'added')
  assert.equal(c?.prev, null)
  assert.equal(c?.curr, 60)
  assert.equal(c?.deltaPct, null, '上期为 0 → 无相对增减率')
  // rows 按 |增减| 降序：B(-100) → C(+60) → A(+50)
  assert.deepEqual(r!.rows.map((x) => x.key), ['id:B', 'id:C', 'id:A'])
  assert.equal(r!.prevPeriod, '2026-08-23~2026-08-29')
  assert.equal(r!.currPeriod, '2026-08-30~2026-09-05')
})

test('buildCompare：身份键降级（链接无 linkId → linkName|shop；货品无 code → name）', () => {
  // 链接：本期/上期都只有名称+店铺（无链接ID）仍能对齐
  const prevL = weekly('W1', [
    { linkId: '', linkName: '无ID链接', shop: '店甲', sales: 100 },
  ])
  const currL = weekly('W2', [
    { linkId: '', linkName: '无ID链接', shop: '店甲', sales: 130 },
  ])
  const r1 = buildCompare({ cycle: '7d', kind: 'platformLinks', metricId: 'sales', prevReport: prevL, currReport: currL })
  assert.equal(r1?.summary.matched, 1, '名称+店铺对齐为同一链接')
  assert.equal(r1?.summary.delta, 30)

  // 货品：两期 code 均为空 → 用 name 对齐
  const prevP = monthlyProducts('2026-06-01~2026-06-30', [{ name: '货品X', code: '', sales: 100, grossMargin: 10 }])
  const currP = monthlyProducts('2026-07-01~2026-07-31', [{ name: '货品X', code: '', sales: 80, grossMargin: 10 }])
  const r2 = buildCompare({ cycle: '30d', kind: 'systemProducts', metricId: 'sales', prevReport: prevP, currReport: currP })
  assert.equal(r2?.summary.matched, 1)
  assert.equal(r2?.summary.delta, -20)
})

test('buildCompare：比率指标按销售额加权汇总（毛利率，pp 差值、无增减率）', () => {
  const prev = monthlyProducts('2026-06-01~2026-06-30', [
    { name: 'P1', code: 'P1', sales: 100, grossMargin: 10 },
    { name: 'P2', code: 'P2', sales: 300, grossMargin: 30 },
  ])
  const curr = monthlyProducts('2026-07-01~2026-07-31', [
    { name: 'P1', code: 'P1', sales: 100, grossMargin: 20 },
    { name: 'P2', code: 'P2', sales: 300, grossMargin: 30 },
    { name: 'P3', code: 'P3', sales: 100, grossMargin: 50 },
  ])
  const r = buildCompare({ cycle: '30d', kind: 'systemProducts', metricId: 'grossMargin', prevReport: prev, currReport: curr })
  assert.ok(r, '毛利率对比非 null')
  const s = r!.summary
  // 上期 (10*100+30*300)/400 = 25；本期 (20*100+30*300+50*100)/500 = 32
  assert.ok(Math.abs(s.prevTotal - 25) < 1e-9)
  assert.ok(Math.abs(s.currTotal - 32) < 1e-9)
  assert.ok(Math.abs(s.delta - 7) < 1e-9, '毛利率差值 7pp')
  assert.equal(s.deltaPct, null, '比率指标不输出相对增减率')
  assert.equal(r!.unit, 'pct')
})

test('buildCompare：退出识别（本期缺失 → removed，无名次位移）', () => {
  const prev = weekly('W1', [
    { linkId: 'X', linkName: '老品', shop: '店1', sales: 50 },
    { linkId: 'Y', linkName: 'Y', shop: '店1', sales: 80 },
  ])
  const curr = weekly('W2', [
    { linkId: 'X', linkName: '老品', shop: '店1', sales: 50 },
    { linkId: 'Z', linkName: '新品', shop: '店1', sales: 100 },
  ])
  const r = buildCompare({ cycle: '7d', kind: 'platformLinks', metricId: 'sales', prevReport: prev, currReport: curr })
  assert.equal(r?.summary.matched, 1)
  assert.equal(r?.summary.removed, 1)
  assert.equal(r?.summary.added, 1)
  const removed = r!.rows.find((x) => x.key === 'id:Y')
  assert.equal(removed?.state, 'removed')
  assert.equal(removed?.curr, null)
  assert.equal(removed?.rankCurr, null)
  assert.equal(removed?.rankShift, null, '退出对象无名次位移')
})

test('buildCompare：任一侧章节缺失 / 两侧皆空 → null；仅一侧有行 → 全退/全新增', () => {
  // 两期对象上都缺该章节 → null（无对比对象）
  assert.equal(buildCompare({ cycle: '30d', kind: 'storeProfit', metricId: 'sales', prevReport: { period: 'M1' }, currReport: { period: 'M2' } }), null)
  // 本期整章缺失（对象上无 platformLinks 键，非空数组）→ null：不能把上期全当「退出」
  const prev = weekly('W1', [{ linkId: 'A', linkName: 'A', shop: '店1', sales: 1 }])
  assert.equal(buildCompare({ cycle: '7d', kind: 'platformLinks', metricId: 'sales', prevReport: prev, currReport: { period: 'W2' } }), null,
    '一侧章节缺失 → 不可比返回 null')
  // 两侧章节皆为空数组 → null
  assert.equal(buildCompare({ cycle: '7d', kind: 'platformLinks', metricId: 'sales', prevReport: { period: 'W1', platformLinks: [] }, currReport: { period: 'W2', platformLinks: [] } }), null)
  // 一侧空数组、另一侧有行 → 有对比对象（全退出）
  const r = buildCompare({ cycle: '7d', kind: 'platformLinks', metricId: 'sales', prevReport: prev, currReport: { period: 'W2', platformLinks: [] } })
  assert.ok(r && r.summary.removed === 1 && r.summary.added === 0, '上期有行、本期空 → 全退出')
})

/* ───────────────────────── 2) Store 归档 + Payload + 接口 ───────────────────────── */

function makeStore(): { store: EcommerceStore; dir: string } {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-cmp-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'), seedOnEmpty: false, lowStockThreshold: 10,
  })
  return { store, dir }
}

function monthlyPart(period: string, kind: 'platformLinks', sales: number): unknown {
  return {
    kind,
    period,
    month: period.slice(0, 7),
    shops: ['店1'],
    platformLinks: [
      { linkId: 'A', linkName: '链接A', shop: '店1', sales },
      { linkId: 'B', linkName: '链接B', shop: '店1', sales: sales * 2 },
    ],
  }
}
function weeklyPart(period: string, sales: number): unknown {
  return {
    kind: 'platformLinks',
    period,
    shops: ['店1'],
    platformLinks: [
      { linkId: 'A', linkName: '链接A', shop: '店1', sales },
      { linkId: 'B', linkName: '链接B', shop: '店1', sales: sales * 2 },
    ],
  }
}

test('Store 归档：导入新周期自动归档上一期（月）', () => {
  const { store, dir } = makeStore()
  store.importMonthlyReport([monthlyPart('2026-06-01~2026-06-30', 'platformLinks', 100)] as never)
  assert.equal(store.getPreviousMonthlyReport(), null, '仅导入第一期 → 无上一期')
  store.importMonthlyReport([monthlyPart('2026-07-01~2026-07-31', 'platformLinks', 150)] as never)
  assert.equal(store.getPreviousMonthlyReport()?.period, '2026-06-01~2026-06-30', '导入 07 后归档 06')
  assert.equal(store.getMonthlyReport()?.period, '2026-07-01~2026-07-31')
  // 同周期补文件（同一期重导/再导）不重复覆盖上一期
  store.importMonthlyReport([monthlyPart('2026-07-01~2026-07-31', 'platformLinks', 200)] as never)
  assert.equal(store.getPreviousMonthlyReport()?.period, '2026-06-01~2026-06-30', '同周期重复导入不冲掉上一期')
  rmSync(dir, { recursive: true, force: true })
})

test('Store 归档：导入新周期自动归档上一期（周，mergeWeeklyReport 就地清空前先归档）', () => {
  const { store, dir } = makeStore()
  store.mergeWeeklyReport(weeklyPart('2026-08-16~2026-08-22', 100) as never)
  store.mergeWeeklyReport(weeklyPart('2026-08-23~2026-08-29', 120) as never)
  store.mergeWeeklyReport(weeklyPart('2026-08-30~2026-09-05', 140) as never)
  assert.equal(store.getPreviousWeeklyReport()?.period, '2026-08-23~2026-08-29', '上一期被归档，当前周期内再导入不覆盖')
  assert.equal(store.getWeeklyReport()?.period, '2026-08-30~2026-09-05')
  // 归档快照为深拷贝：即使上一期对象之后被 merge 就地修改，归档仍保有完整章节
  const archived = store.getPreviousWeeklyReport()!
  assert.ok((archived.platformLinks ?? []).length >= 2, '归档保留上一期完整章节')
  rmSync(dir, { recursive: true, force: true })
})

test('Store 持久化：报表 + 上一期归档跨 Store 重建恢复（重启后仍可对比）', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-cmp-persist-'))
  const file = join(dir, 'store.json')
  // 第一实例：seedOnEmpty=true → init 落盘 demo 数据，随后连续导入两期建立归档
  const s1 = new EcommerceStore(new MockAdapter(), { file, seedOnEmpty: true, lowStockThreshold: 10 })
  await s1.init()
  s1.importMonthlyReport([monthlyPart('2026-06-01~2026-06-30', 'platformLinks', 100)] as never)
  s1.importMonthlyReport([monthlyPart('2026-07-01~2026-07-31', 'platformLinks', 150)] as never)
  assert.equal(s1.getPreviousMonthlyReport()?.period, '2026-06-01~2026-06-30', '第一实例内归档已建立')

  // 第二实例：同一 file → 模拟插件重启/热重载/新会话，init 应恢复报表与归档
  const s2 = new EcommerceStore(new MockAdapter(), { file, seedOnEmpty: true, lowStockThreshold: 10 })
  await s2.init()
  assert.equal(s2.getMonthlyReport()?.period, '2026-07-01~2026-07-31', '重启后恢复当前月报')
  assert.equal(s2.getPreviousMonthlyReport()?.period, '2026-06-01~2026-06-30', '重启后恢复上一期归档')
  const payload = buildComparePayload(s2, '30d')
  assert.equal(payload.hasPrev, true, '重启后仍可对比（hasPrev=true）')
  assert.ok(payload.result && payload.result.summary.matched === 2, '重启后对比结果非空且匹配 2 链接')
  rmSync(dir, { recursive: true, force: true })
})

test('buildComparePayload：30d/7d 各有可对比负载（缺省层级/指标自动选）', () => {
  const { store, dir } = makeStore()
  // 月度两期
  store.importMonthlyReport([monthlyPart('2026-06-01~2026-06-30', 'platformLinks', 100)] as never)
  store.importMonthlyReport([monthlyPart('2026-07-01~2026-07-31', 'platformLinks', 150)] as never)
  const m = buildComparePayload(store, '30d')
  assert.equal(m.hasPrev, true)
  assert.equal(m.prevPeriod, '2026-06-01~2026-06-30')
  assert.equal(m.currPeriod, '2026-07-01~2026-07-31')
  assert.ok(m.kinds.some((k) => k.kind === 'platformLinks' && k.prev >= 2 && k.curr >= 2), 'kinds 含平台链接两侧计数')
  assert.ok(m.metrics.some((x) => x.id === 'sales'), 'metrics 默认含销售额')
  assert.ok(m.result && m.result.summary.matched === 2, '自动层级结果两期匹配 2 链接')

  // 周度两期
  store.mergeWeeklyReport(weeklyPart('2026-08-16~2026-08-22', 100) as never)
  store.mergeWeeklyReport(weeklyPart('2026-08-23~2026-08-29', 150) as never)
  const w = buildComparePayload(store, '7d')
  assert.equal(w.hasPrev, true)
  assert.ok(w.result && w.result.summary.matched === 2)
  // 周度无「店铺利润」层（不在 kinds 里）
  assert.ok(!w.kinds.some((k) => k.kind === 'storeProfit'), '7d 周度对比不含 storeProfit')
  rmSync(dir, { recursive: true, force: true })
})

/** 注册 /ecommerce-api handler，返回非空可调用句柄（register 闭包捕获后统一收口，规避 TS 空值收窄） */
function registeredHandler(store: EcommerceStore): (req: unknown, res: unknown) => void | Promise<void> {
  let handler: ((req: unknown, res: unknown) => void | Promise<void>) | null = null
  const webServer: WebServerLike = {
    port: 0,
    register(r) { handler = r.handler as (req: unknown, res: unknown) => void | Promise<void>; return () => {} },
    tapIndex(): () => void { return () => {} },
  }
  registerShopApi(webServer, store, {})
  if (handler === null) throw new Error('未注册 /ecommerce-api handler')
  return handler
}

test('/ecommerce-api/compare 接口：导入两期后返回对比负载', async () => {
  const { store, dir } = makeStore()
  store.importMonthlyReport([monthlyPart('2026-06-01~2026-06-30', 'platformLinks', 100)] as never)
  store.importMonthlyReport([monthlyPart('2026-07-01~2026-07-31', 'platformLinks', 150)] as never)

  const handler = registeredHandler(store)
  const req = new EventEmitter() as EventEmitter & { url: string; method: string; headers: Record<string, string>; destroy: () => void }
  req.url = '/ecommerce-api/compare?cycle=30d'
  req.method = 'GET'
  req.headers = {}
  req.destroy = () => {}
  const res = {
    statusCode: 0, headers: {} as Record<string, unknown>, body: '',
    writeHead(status: number, headers?: Record<string, unknown>) { this.statusCode = status; if (headers) this.headers = headers },
    end(chunk?: unknown) { this.body = String(chunk ?? '') },
  }
  queueMicrotask(() => req.emit('end'))
  await handler(req, res)
  assert.equal(res.statusCode, 200)
  const json = JSON.parse(res.body) as { ok: boolean; value: { hasPrev: boolean; prevPeriod: string; result: CompareResult | null } }
  assert.equal(json.ok, true)
  assert.equal(json.value.hasPrev, true, '已导入两期 → hasPrev')
  assert.equal(json.value.prevPeriod, '2026-06-01~2026-06-30')
  assert.ok(json.value.result && json.value.result.summary.matched === 2)
  assert.ok(typeof res.headers['content-type'] === 'string' && String(res.headers['content-type']).includes('json'), '返回 application/json')
  rmSync(dir, { recursive: true, force: true })
})
