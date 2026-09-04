/**
 * 数据层测试：Store CRUD、订单状态机、库存预警、持久化（企业数据 26/480 基准）
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EcommerceStore } from '../src/store.ts'
import { isRevenueOrder } from '../src/types.ts'
import { buildSnapshot, buildBrief } from '../src/shop-api.ts'
import { MockAdapter } from '../src/platform/mock.ts'

function makeStore(): { store: EcommerceStore; dir: string } {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-test-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'),
    seedOnEmpty: true,
    lowStockThreshold: 10,
  })
  return { store, dir }
}

async function initStore(): Promise<{ store: EcommerceStore; dir: string }> {
  const env = makeStore()
  await env.store.init()
  return env
}

test('init：企业数据种子初始化（26 商品 / 480 订单）', async () => {
  const { store, dir } = await initStore()
  assert.equal(store.sourceMode, 'mock')
  assert.equal(store.listProducts({}).total, 26)
  assert.equal(store.listOrders({}).total, 480)
  rmSync(dir, { recursive: true, force: true })
})

test('商品筛选：分类 / 状态 / 价格区间 / 关键词', async () => {
  const { store, dir } = await initStore()
  assert.equal(store.listProducts({ category: '数码配件' }).total, 5)
  assert.equal(store.listProducts({ status: 'off_sale' }).total, 3)
  assert.equal(store.listProducts({ min_price: 100, max_price: 200 }).total, 11)
  assert.equal(store.listProducts({ keyword: '面膜' }).total, 1)
  rmSync(dir, { recursive: true, force: true })
})

test('订单状态机：合法流转成功，非法流转报错', async () => {
  const { store, dir } = await initStore()
  const id = 'ORD-20260822-075' // pending
  assert.equal(store.getOrder(id)?.status, 'pending')

  await store.updateOrderStatus(id, 'cancelled')
  assert.equal(store.getOrder(id)?.status, 'cancelled')

  await assert.rejects(
    () => store.updateOrderStatus(id, 'shipped'),
    /非法状态流转/,
  )
  rmSync(dir, { recursive: true, force: true })
})

test('发货与退款便捷操作', async () => {
  const { store, dir } = await initStore()
  const shipped = await store.shipOrder('ORD-20260823-469', 'SF0000000001', '顺丰')
  assert.equal(shipped.status, 'shipped')
  assert.equal(shipped.tracking_no, 'SF0000000001')

  const refunded = await store.refundOrder('ORD-20260823-469', '质量问题')
  assert.equal(refunded.status, 'refunded')
  assert.equal(refunded.refund_reason, '质量问题')

  // 已完成订单不可退款
  await assert.rejects(() => store.refundOrder('ORD-20260825-044', '测试'), /非法状态流转/)
  rmSync(dir, { recursive: true, force: true })
})

test('库存预警：阈值边界命中', async () => {
  const { store, dir } = await initStore()
  const low = store.lowStock(10)
  assert.equal(low.length, 8)
  assert.ok(low.some((p) => p.sku === 'SKU-0005' && p.stock === 0))
  assert.ok(low.some((p) => p.sku === 'SKU-0002' && p.stock === 1))

  // 阈值 5：仅命中 stock<=5（7 件）
  const low5 = store.lowStock(5)
  assert.equal(low5.length, 7)
  rmSync(dir, { recursive: true, force: true })
})

test('补货建议：基于近 30 天销量 × 1.5 安全系数', async () => {
  const { store, dir } = await initStore()
  // 复刻 restockSuggestions 的口径，用公共数据层独立重算期望值，
  // 避免种子数据固定日期随日历推进导致近 30 天窗口漂移、硬断言失准。
  const recent30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  const actualBySku = new Map(store.restockSuggestions(10).map((s) => [s.sku, s]))

  // 注意：listOrders / listProducts 默认分页（page_size=20），需拉全量以对齐 restockSuggestions 的口径
  const orders = store.listOrders({ page_size: 10000 }).items
  for (const p of store.listProducts({ page_size: 10000 }).items) {
    if (p.stock > 10) continue
    const sold = orders
      .filter((o) => isRevenueOrder(o.status) && o.created_at >= recent30 && o.sku === p.sku)
      .reduce((sum, o) => sum + o.quantity, 0)
    const expected = Math.max(0, Math.ceil(sold * 1.5 - p.stock))
    assert.equal(actualBySku.get(p.sku)?.suggest_qty, expected, `SKU ${p.sku} 补货量`)
    if (expected > 0) {
      assert.match(actualBySku.get(p.sku)!.reason, new RegExp(`近30天销量 ${sold}`))
    }
  }
  rmSync(dir, { recursive: true, force: true })
})

test('持久化：导入写操作落盘，重载后数据不丢失', async () => {
  const { store, dir } = await initStore()
  store.importFromFile(
    [{ sku: 'PERSIST-1', name: '持久化商品', price: 1, stock: 1, category: '测试', status: 'on_sale' }] as never,
    undefined,
  )
  assert.ok(existsSync(join(dir, 'store.json')))

  const reload = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'),
    seedOnEmpty: true,
    lowStockThreshold: 10,
  })
  await reload.init()
  const all = reload.listProducts({ keyword: '持久化' })
  assert.equal(all.total, 1)
  assert.equal(all.items[0].name, '持久化商品')
  rmSync(dir, { recursive: true, force: true })
})

test('备份导出/导入：格式正确且可恢复', async () => {
  const { store, dir } = await initStore()
  const backup = store.exportBackup()
  const parsed = JSON.parse(backup)
  assert.equal(parsed.products.length, 26)
  assert.equal(parsed.orders.length, 480)

  store.importData([], [])
  assert.equal(store.listProducts({ page_size: 10000 }).total, 0)
  const result = store.importBackup(backup)
  assert.equal(result.products, 26)
  assert.ok(store.getProduct('SKU-0001'))

  assert.throws(() => store.importBackup('{"bad": 1}'), /格式不正确/)
  rmSync(dir, { recursive: true, force: true })
})

test('今日待办：待发货 55 + 逾期 43 + 低库存 8', async () => {
  const { store, dir } = await initStore()
  const actions = store.todayActions()
  assert.equal(actions.shipments.length, 55)
  assert.equal(actions.overdues.length, 43)
  assert.equal(actions.lowStockCount, 8)
  rmSync(dir, { recursive: true, force: true })
})

// ───────────────────── 针对四项修复的回归测试 ─────────────────────

test('回归#1 importFromFile：仅订单导入全量替换 + 派生商品（杜绝演示商品残留）', async () => {
  const { store, dir } = await initStore()
  assert.equal(store.dataMode, 'demo')
  assert.equal(store.listProducts({ page_size: 10000 }).total, 26)

  const orders = [
    { order_id: 'IMP-1', sku: 'IMP-A', product_name: '导入A', buyer: 'x', quantity: 2, amount: 100, created_at: '2026-08-25T10:00:00Z', status: 'pending' },
    { order_id: 'IMP-2', sku: 'IMP-B', product_name: '导入B', buyer: 'y', quantity: 1, amount: 50, created_at: '2026-08-25T11:00:00Z', status: 'pending' },
    { order_id: 'IMP-3', sku: 'IMP-A', product_name: '导入A', buyer: 'z', quantity: 3, amount: 150, created_at: '2026-08-25T12:00:00Z', status: 'pending' },
  ]
  const r = store.importFromFile(undefined, orders as never)
  assert.equal(r.orders, 3)
  assert.equal(r.derivedProducts, 2) // 去重后 2 个 SKU
  assert.equal(store.dataMode, 'imported')
  // 派生商品完全替换演示商品，无任何演示 SKU 残留
  const products = store.listProducts({ page_size: 10000 }).items
  assert.equal(products.length, 2)
  assert.ok(products.every((p) => p.sku === 'IMP-A' || p.sku === 'IMP-B'))
  assert.ok(products.every((p) => p.category === '未分类' && p.stock === 11))
  rmSync(dir, { recursive: true, force: true })
})

test('回归#1 importFromFile：仅商品导入时清空演示订单（杜绝演示订单残留）', async () => {
  const { store, dir } = await initStore()
  assert.equal(store.listOrders({ page_size: 10000 }).total, 480)
  const products = [
    { sku: 'P-1', name: '新商品1', category: '类目', price: 9.9, stock: 5, status: 'on_sale' },
    { sku: 'P-2', name: '新商品2', category: '类目', price: 19.9, stock: 8, status: 'on_sale' },
  ]
  const r = store.importFromFile(products as never, undefined)
  assert.equal(r.products, 2)
  assert.equal(r.orders, 0) // 演示订单被清空
  assert.equal(store.dataMode, 'imported')
  rmSync(dir, { recursive: true, force: true })
})

test('回归#4 buildSnapshot：today.shipments 暴露待发货明细（今日待办可展开）', async () => {
  const { store, dir } = await initStore()
  const snap = buildSnapshot(store)
  assert.ok(Array.isArray(snap.today.shipments))
  assert.equal(snap.today.shipments.length, snap.today.shipmentsCount)
  assert.equal(snap.today.shipments.length, 55) // 与 todayActions().shipments 一致
  const s = snap.today.shipments[0]
  for (const k of ['order_id', 'buyer', 'product_name', 'quantity', 'amount', 'created_at', 'status'] as const) {
    assert.ok(k in s, `shipments 缺字段 ${k}`)
  }
  rmSync(dir, { recursive: true, force: true })
})

test('回归#2/#3 导入后快照与简报实时反映导入数据（修复：CSV 导入未实时响应 / 简报未更新）', async () => {
  const { store, dir } = await initStore()
  const orders = [
    { order_id: 'RT-1', sku: 'RT-A', product_name: '实时A', buyer: 'b', quantity: 4, amount: 200, created_at: '2026-08-25T10:00:00Z', status: 'paid' },
  ]
  store.importFromFile(undefined, orders as never)
  // 快照应实时反映导入订单（而非演示数据）
  const snap = buildSnapshot(store)
  assert.equal(snap.today.shipmentsCount, 1)
  assert.equal(snap.today.shipments[0].product_name, '实时A')
  // 经营简报应基于导入数据重新生成
  const brief = buildBrief(store)
  assert.match(brief, /实时A/)
  rmSync(dir, { recursive: true, force: true })
})
