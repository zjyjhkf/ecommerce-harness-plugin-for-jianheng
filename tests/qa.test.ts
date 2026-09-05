/**
 * 规则问答引擎测试（§10）：8 规则命中、未命中、归一化
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'
import { answerQuestion } from '../src/qa-engine.ts'

async function makeStore(): Promise<EcommerceStore> {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-qa-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'),
    seedOnEmpty: true,
    lowStockThreshold: 10,
  })
  await store.init()
  return store
}

test('overview 规则命中：经营总览', async () => {
  const store = await makeStore()
  const r = answerQuestion(store, '帮我看看店铺经营总览')
  assert.equal(r.matched, true)
  assert.equal(r.rule, 'overview')
  assert.match(r.answer!,/¥154,699/)
  assert.match(r.answer!,/359/)
})

test('today_sales 规则命中：今日销售', async () => {
  const store = await makeStore()
  const r = answerQuestion(store, '今天卖了多少？')
  assert.equal(r.matched, true)
  assert.equal(r.rule, 'today_sales')
  assert.match(r.answer!,/今日销售/)
})

test('top_products 规则命中：畅销 TOP', async () => {
  const store = await makeStore()
  const r = answerQuestion(store, '哪个商品卖得最好？')
  assert.equal(r.matched, true)
  assert.equal(r.rule, 'top_products')
  assert.match(r.answer!,/全棉四件套|SKU-0014/)
})

test('low_stock 规则命中：低库存预警', async () => {
  const store = await makeStore()
  const r = answerQuestion(store, '有哪些低库存商品？')
  assert.equal(r.matched, true)
  assert.equal(r.rule, 'low_stock')
  assert.match(r.answer!,/8 件商品库存低于阈值/)
})

test('pending_ship 规则命中：待发货', async () => {
  const store = await makeStore()
  const r = answerQuestion(store, '看看待发货的订单')
  assert.equal(r.matched, true)
  assert.equal(r.rule, 'pending_ship')
  assert.match(r.answer!,/待发货订单 54 笔|待发货订单 55 笔/)
})

test('pending_pay 规则命中：待付款/逾期', async () => {
  const store = await makeStore()
  const r = answerQuestion(store, '有多少逾期订单？')
  assert.equal(r.matched, true)
  assert.equal(r.rule, 'pending_pay')
  assert.match(r.answer!,/待付款订单 43 笔/)
  assert.match(r.answer!,/逾期/)
})

test('refund 规则命中：退款率', async () => {
  const store = await makeStore()
  const r = answerQuestion(store, '退款率是多少？')
  assert.equal(r.matched, true)
  assert.equal(r.rule, 'refund')
  assert.match(r.answer!,/退款率：10.6%|退款率：10\.6/)
})

test('category 规则命中：类目占比（含图表数据）', async () => {
  const store = await makeStore()
  const r = answerQuestion(store, '统计一下类目销售分布')
  assert.equal(r.matched, true)
  assert.equal(r.rule, 'category')
  assert.equal(r.chart, 'donut')
  assert.match(r.answer!,/类目销售分布/)
})

test('未命中：回退提示', async () => {
  const store = await makeStore()
  const r = answerQuestion(store, '帮我写一首关于电商的诗')
  assert.equal(r.matched, false)
  assert.match(r.answer!,/未命中内置规则|改用/)
})

test('空问题：友好提示', async () => {
  const store = await makeStore()
  const r = answerQuestion(store, '   ')
  assert.equal(r.matched, false)
  assert.match(r.answer!,/问题为空/)
})

test('归一化：标点/空白不影响命中', async () => {
  const store = await makeStore()
  const r = answerQuestion(store, '今天卖了多少钱？？？')
  assert.equal(r.matched, true)
  assert.equal(r.rule, 'today_sales')
})
