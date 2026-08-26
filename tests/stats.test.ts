/**
 * 统计口径测试：overview / trend / top / category（企业数据 26/480 基准）
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'

async function makeStore(): Promise<EcommerceStore> {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-stats-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'),
    seedOnEmpty: true,
    lowStockThreshold: 10,
  })
  await store.init()
  return store
}

// 基准（企业数据 seed，与文档 §16 一致）：
// 总销售额 ¥154,699 / 359 单 / 客单价 ¥430.92 / 退款率 10.6% / 畅销 SKU-0014

test('overview：全时间总览口径正确', async () => {
  const store = await makeStore()
  const o = store.overview()
  assert.equal(o.revenue, 154699)
  assert.equal(o.orders, 359)
  assert.equal(o.avg_order_value, 430.92)
  assert.equal(o.top_selling_sku, 'SKU-0014')
  assert.ok(Math.abs(o.refund_rate - 10.6) < 0.1)
})

test('overview：日期范围过滤生效', async () => {
  const store = await makeStore()
  const august = store.overview({ date_from: '2026-08-01' })
  assert.equal(august.revenue, 47684)
  assert.equal(august.orders, 104)
  assert.ok(Math.abs(august.refund_rate - 11.6) < 0.1)

  const day = store.overview({ date_from: '2026-08-10', date_to: '2026-08-10' })
  assert.ok(day.orders > 0)
})

test('trend：按日/按月聚合与手工核算一致', async () => {
  const store = await makeStore()
  const monthly = store.trend({}, 'month')
  const byMonth = new Map(monthly.map((p) => [p.date, p.revenue]))
  assert.equal(byMonth.get('2026-06'), 49532)
  assert.equal(byMonth.get('2026-07'), 53021)
  assert.equal(byMonth.get('2026-08'), 47684)
})

test('topProducts：排行按销售额降序', async () => {
  const store = await makeStore()
  const tops = store.topProducts({}, 3)
  assert.equal(tops.length, 3)
  assert.equal(tops[0].sku, 'SKU-0014') // 全棉四件套
  assert.equal(tops[0].revenue, 15847)
  assert.equal(tops[0].units, 53)
  assert.ok(tops[0].revenue >= tops[1].revenue)
  assert.ok(tops[1].revenue >= tops[2].revenue)
})

test('categoryDistribution：占比合计 100%，按销售额降序', async () => {
  const store = await makeStore()
  const cats = store.categoryDistribution()
  const total = cats.reduce((s, c) => s + c.ratio, 0)
  assert.ok(Math.abs(total - 100) < 0.5)
  assert.ok(cats[0].revenue >= cats[1].revenue)
  const apparel = cats.find((c) => c.category === '服饰')
  assert.ok(apparel)
  assert.equal(apparel.ratio, 23.6)
})

test('金额精度：浮点运算使用整数分位，无精度丢失', async () => {
  const store = await makeStore()
  const created = await store.createProduct({
    name: '精度测试',
    price: 0.1 + 0.2, // 0.30000000000000004
    stock: 1,
    category: '测试',
  })
  assert.equal(created.price, 0.3)
})
