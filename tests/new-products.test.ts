/**
 * 新品追踪单测（无外部依赖）
 *
 * 覆盖 src/new-products.ts 的判定与口径：
 *   1. 判据一「分类 = 本期上市月份」命中时按月份标签取新品；
 *   2. 判据二「上期未出现、本期首次出现」回退（分类列是商品分组、无月份标签的真实情况）；
 *   3. 新老划分必须按「货品编号」——真实数据里存在同名不同编号的货品，
 *      按名字做集合会把老品误划进新品（老品数因此少 3）；
 *   4. 毛利率分母是净销售额（用销售额做分母会整体压低十几个百分点）；
 *   5. 换一组导入数据，输出随之改变（不允许任何写死数据）；
 *   6. 无数据 / 无可比期时 available=false 且给出中文原因；
 *   7. /ecommerce-api/new-products 接口契约。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EventEmitter } from 'node:events'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'
import { seedFixture } from './seed-fixture.ts'
import { buildNewProductPayload } from '../src/new-products.ts'
import { registerShopApi, type WebServerLike } from '../src/shop-api.ts'

function makeStore() {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-np-'))
  const store = new EcommerceStore(new MockAdapter(seedFixture), {
    file: join(dir, 'store.json'),
    seedOnEmpty: true,
    lowStockThreshold: 10,
  })
  return { store, dir }
}

/** 造一份「系统货品」月度部件 */
function prodPart(period: string, products: unknown[]) {
  return { kind: 'systemProducts', period, month: period.slice(0, 7), shops: [], systemProducts: products } as never
}
/** 造一份「系统规格」月度部件 */
function skuPart(period: string, skus: unknown[]) {
  return { kind: 'systemSkus', period, month: period.slice(0, 7), shops: [], systemSkus: skus } as never
}

function prod(name: string, code: string, category: string, sales: number, netSales: number, grossProfit: number, refundRate = 0) {
  return { name, code, brand: 'B', category, sales, netSales, grossProfit, grossMargin: netSales > 0 ? (grossProfit / netSales) * 100 : 0, refundRate, returnRate: refundRate / 2, adSpend: 0, avgPrice: 0, singleRate: 0 }
}
function sku(name: string, specName: string, code: string, category: string, sales: number, salesCount: number, salesCost: number, pre = 10, post = 18, recv = 3) {
  return { name, specName, code, brand: 'B', category, sales, salesCount, salesCost, netSales: sales * 0.7, grossProfit: sales * 0.3, grossMargin: 30, refundRate: pre + post + recv, returnRate: post, preShipRefundRate: pre, postShipRefundRate: post, receivedRefundRate: recv, salesRank: 0, countRank: 0, profitRank: 0, marginRank: 0, refundAmount: 0, netCost: 0, adSpend: 0, offlineFee: 0, otherFee: 0, avgPrice: 0 }
}

/* ───────────── 1) 判据一：分类 = 本期上市月份 ───────────── */
test('新品追踪：分类列是「YY年M月」上市月份时，取与本期月份一致的那批', () => {
  const { store, dir } = makeStore()
  store.importMonthlyReport([prodPart('2026-07-01~2026-07-31', [
    prod('新品甲', 'C-1', '26年7月', 1000, 700, 300, 20),
    prod('新品乙', 'C-2', '26年7月', 500, 400, 200, 10),
    prod('老品丙', 'C-3', '26年6月', 2000, 1500, 900, 5),
    prod('老品丁', 'C-4', '无', 3000, 2000, 1200, 8),
  ])] as never)
  const p = buildNewProductPayload(store)
  assert.equal(p.available, true)
  assert.equal(p.basis, 'category')
  assert.ok(p.basisLabel.includes('26年7月'), '口径说明里带上月份标签：' + p.basisLabel)
  assert.equal(p.newCnt, 2)
  assert.equal(p.oldCnt, 2)
  assert.equal(p.newSales, 1500)
  assert.equal(p.totalSales, 6500)
  assert.ok(Math.abs(p.newShare - (1500 / 6500) * 100) < 0.01, '占全店 = 新品/全部')
  // 毛利率分母是净销售额：新品 (300+200)/(700+400) = 45.45%
  assert.ok(Math.abs(p.newGm - (500 / 1100) * 100) < 0.01, '毛利率 = 毛利额/净销售额，实算 ' + p.newGm.toFixed(2))
  // 退款率按销售额加权：(1000*20 + 500*10)/1500 = 16.67%
  assert.ok(Math.abs(p.newRr - (1000 * 20 + 500 * 10) / 1500) < 0.01, '退款率按销售额加权')
  rmSync(dir, { recursive: true, force: true })
})

/* ───────────── 2) 同名不同编号：必须按编号划分 ───────────── */
test('新品追踪：同名不同编号的货品按「货品编号」划分，不按名字（回归：老品数曾少 3）', () => {
  const { store, dir } = makeStore()
  store.importMonthlyReport([prodPart('2026-07-01~2026-07-31', [
    prod('重名货', 'C-NEW', '26年7月', 1000, 800, 400),
    prod('重名货', 'C-OLD', '无', 500, 400, 100),
    prod('普通老品', 'C-2', '无', 500, 400, 100),
  ])] as never)
  const p = buildNewProductPayload(store)
  assert.equal(p.newCnt, 1, '只有编号 C-NEW 那行是新品')
  assert.equal(p.oldCnt, 2, '同名但编号不同的 C-OLD 必须留在老品侧')
  assert.equal(p.newSales, 1000, '新品销售额只算 C-NEW')
  rmSync(dir, { recursive: true, force: true })
})

/* ───────────── 2b) 跨期比对键：编号两期不可比，必须按名称 ───────────── */
test('新品追踪：跨期按「货品名」判首次出现，编号两期不同也不得误判为新品（回归：新品曾虚增 145 个）', () => {
  const { store, dir } = makeStore()
  // 7 月与 8 月是两套编码体系：同一个货品在两期的编号完全不同
  store.importMonthlyReport([prodPart('2026-07-01~2026-07-31', [
    prod('空气压力波', 'Z-kqylb', '热销期', 1000, 800, 400),
    prod('巫毒带', 'T-yld-0233-103-2', '货品周期', 500, 400, 200),
  ])] as never)
  store.importMonthlyReport([prodPart('2026-08-01~2026-08-31', [
    prod('空气压力波', 'T-KQB-001', '热销期', 1200, 900, 500),
    prod('巫毒带', 'T-WDD-001', '货品周期', 600, 450, 220),
    prod('真正的新货', 'T-NEW-001', '货品周期', 300, 200, 90),
  ])] as never)
  const p = buildNewProductPayload(store)
  assert.equal(p.basis, 'newcomer')
  assert.equal(p.newCnt, 1, '只有「真正的新货」是新品；换过编号的两个老货不算')
  assert.equal(p.oldCnt, 2)
  assert.equal(p.newSales, 300, '新品销售额不含换编号的老货')
  rmSync(dir, { recursive: true, force: true })
})

/* ───────────── 3) 判据二：回退「首次上榜」 ───────────── */
test('新品追踪：分类列无月份标签时回退为「上期未出现、本期首次出现」', () => {
  const { store, dir } = makeStore()
  store.importMonthlyReport([prodPart('2026-07-01~2026-07-31', [
    prod('老货A', 'A', '热销期', 1000, 800, 400),
    prod('老货B', 'B', '货品周期', 800, 600, 300),
  ])] as never)
  store.importMonthlyReport([prodPart('2026-08-01~2026-08-31', [
    prod('老货A', 'A', '热销期', 1200, 900, 500),
    prod('老货B', 'B', '货品周期', 700, 500, 200),
    prod('新货C', 'C', '货品周期', 900, 700, 400),
  ])] as never)
  const p = buildNewProductPayload(store)
  assert.equal(p.available, true)
  assert.equal(p.basis, 'newcomer', '无月份标签 → 走首次上榜判据')
  assert.ok(p.basisLabel.includes('首次出现'), p.basisLabel)
  assert.equal(p.newCnt, 1)
  assert.equal(p.newSales, 900)
  assert.equal(p.oldCnt, 2)
  rmSync(dir, { recursive: true, force: true })
})

/* ───────────── 4) 换数据 → 结果随之变 ───────────── */
test('新品追踪：换一组导入数据（只改数字）→ 输出全部随之变化，无写死值', () => {
  const { store, dir } = makeStore()
  const mk = (scale: number) => buildPayloadAfter(store, [
    prod('新品甲', 'C-1', '26年7月', 1000 * scale, 700 * scale, 300 * scale, 20),
    prod('老品丙', 'C-3', '26年6月', 2000 * scale, 1500 * scale, 900 * scale, 5),
  ])
  const a = mk(1)
  const b = mk(3)
  assert.notEqual(a.newSales, b.newSales, '换数据后新品销售额必须变')
  assert.equal(b.newSales, a.newSales * 3)
  assert.equal(a.newCnt, b.newCnt, '份数不变时新品个数不变')
  assert.equal(a.totalSales * 3, b.totalSales)
  rmSync(dir, { recursive: true, force: true })

  function buildPayloadAfter(s: EcommerceStore, products: unknown[]) {
    s.importMonthlyReport([prodPart('2026-07-01~2026-07-31', products)] as never)
    return buildNewProductPayload(s)
  }
})

/* ───────────── 5) 空态与原因 ───────────── */
test('新品追踪：无数据 / 无可比期时 available=false 且给中文原因', () => {
  const { store, dir } = makeStore()
  ;(store as unknown as { monthlyReport: unknown }).monthlyReport = null
  ;(store as unknown as { previousMonthlyReport: unknown }).previousMonthlyReport = null
  const empty = buildNewProductPayload(store)
  assert.equal(empty.available, false)
  assert.ok(empty.reason.includes('暂无导入数据'), empty.reason)

  // 只有本期、分类无月份标签、无上一期 → 无法判定
  store.importMonthlyReport([prodPart('2026-08-01~2026-08-31', [
    prod('货A', 'A', '热销期', 1000, 800, 400),
  ])] as never)
  const noPrev = buildNewProductPayload(store)
  assert.equal(noPrev.available, false)
  assert.ok(noPrev.reason.includes('上一期'), '应提示需要上一期：' + noPrev.reason)
  rmSync(dir, { recursive: true, force: true })
})

/* ───────────── 6) 规格维度（件数/成本/退款三段） ───────────── */
test('新品追踪：规格维度汇总件数/成本/退款三段，并按货品归并出规格数', () => {
  const { store, dir } = makeStore()
  store.importMonthlyReport([
    prodPart('2026-07-01~2026-07-31', [
      prod('新品甲', 'C-1', '26年7月', 1000, 700, 300),
      prod('老品丙', 'C-3', '26年6月', 500, 400, 100),
    ]),
    skuPart('2026-07-01~2026-07-31', [
      sku('新品甲', '规格一', 'S-1', '26年7月', 600, 60, 300, 10, 20, 2),
      sku('新品甲', '规格二', 'S-2', '26年7月', 400, 40, 200, 8, 16, 4),
      sku('老品丙', '规格三', 'S-3', '26年6月', 500, 50, 250, 5, 10, 1),
    ]),
  ] as never)
  const p = buildNewProductPayload(store)
  assert.equal(p.specCnt, 2, '新品规格 2 个')
  assert.equal(p.newUnits, 100, '销售件数 = 60+40')
  assert.equal(p.newCost, 500, '销售成本 = 300+200')
  assert.ok(Math.abs(p.costRate - 50) < 0.01, '成本率 = 500/1000')
  assert.ok(Math.abs(p.refundPre - (600 * 10 + 400 * 8) / 1000) < 0.01, '发货前退款率按销售额加权')
  assert.ok(Math.abs(p.refundPost - (600 * 20 + 400 * 16) / 1000) < 0.01, '发货后退款率按销售额加权')
  assert.equal(p.products.length, 1)
  assert.equal(p.products[0].specCount, 2, '货品行带出规格数')
  assert.equal(p.products[0].salesCount, 100)
  rmSync(dir, { recursive: true, force: true })
})

/* ───────────── 7) 接口契约 ───────────── */
test('/ecommerce-api/new-products：返回现算负载（含判定依据与货品明细）', async () => {
  const { store, dir } = makeStore()
  store.importMonthlyReport([prodPart('2026-07-01~2026-07-31', [
    prod('新品甲', 'C-1', '26年7月', 1000, 700, 300),
    prod('老品丙', 'C-3', '26年6月', 500, 400, 100),
  ])] as never)
  let handler: ((req: unknown, res: unknown) => void | Promise<void>) | null = null
  const webServer: WebServerLike = {
    port: 0,
    register(r) { handler = r.handler as (req: unknown, res: unknown) => void | Promise<void>; return () => {} },
    tapIndex(): () => void { return () => {} },
  }
  registerShopApi(webServer, store, {})
  assert.ok(handler, '已注册 /ecommerce-api handler')

  const req = new EventEmitter() as EventEmitter & { url: string; method: string; headers: Record<string, string>; destroy: () => void }
  req.url = '/ecommerce-api/new-products'
  req.method = 'GET'
  req.headers = {}
  req.destroy = () => {}
  const res = {
    statusCode: 0, headers: {} as Record<string, unknown>, body: '',
    writeHead(status: number, headers?: Record<string, unknown>) { this.statusCode = status; if (headers) this.headers = headers },
    end(chunk?: unknown) { this.body = String(chunk ?? '') },
  }
  queueMicrotask(() => req.emit('end'))
  await (handler as unknown as (a: unknown, b: unknown) => Promise<void>)(req, res)
  assert.equal(res.statusCode, 200)
  const out = JSON.parse(res.body) as { ok: boolean; value: { newCnt: number; basis: string; products: unknown[] } }
  assert.equal(out.ok, true)
  assert.equal(out.value.newCnt, 1)
  assert.equal(out.value.basis, 'category')
  assert.equal(out.value.products.length, 1)
  rmSync(dir, { recursive: true, force: true })
})
