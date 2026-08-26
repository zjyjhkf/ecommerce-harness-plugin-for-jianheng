/**
 * v0.3.0 新工具测试（§8.6/8.7/8.8/8.9）：表格导入校验、CSV 导出、数据源切换
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'
import { validateProducts, validateOrders } from '../src/import-parse.ts'
import { productsToCsv, ordersToCsv, toCsv } from '../src/csv-util.ts'

async function makeStore(): Promise<EcommerceStore> {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-v3tools-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'),
    seedOnEmpty: true,
    lowStockThreshold: 10,
  })
  await store.init()
  return store
}

/* ─────────── 表格导入校验（§9.3） ─────────── */

test('validateProducts：字段级错误收集（含行号、跨行唯一性）', () => {
  const rows = [
    { sku: 'P1', name: '商品一', price: '10', stock: '5', category: '测试' },
    // 不重复 sku，但存在字段错误：空名 + 非法价格 + 负库存 + 空类目
    { sku: 'P2', name: '', price: 'abc', stock: '-1', category: '' },
    // 重复 P1 的 sku：跨行唯一性优先，该行不再做字段校验
    { sku: 'P1', name: '重复商品', price: '20', stock: '5', category: '测试' },
  ]
  const v = validateProducts(rows)
  const reasons = v.errors.map((e) => e.reason).join('|')
  // P2 行字段错误（逐行收集全部）
  assert.match(reasons, /缺少名称/)
  assert.match(reasons, /售价非数字：abc/)
  assert.match(reasons, /库存为负：-1/)
  // P1 重复行：只报唯一性错误
  assert.match(reasons, /sku 重复：P1/)
  assert.equal(v.errors.filter((e) => e.reason.includes('sku 重复')).length, 1)
  // 行号从 1 开始（表头占第 1 行，数据行从第 2 行起）
  assert.ok(v.errors.every((e) => e.row >= 2))
})

test('validateProducts：合法数据通过', () => {
  const rows = [
    { sku: 'P1', name: '商品一', price: '10', stock: '5', category: '测试' },
    { sku: 'P2', name: '商品二', price: '19.9', stock: '0', category: '测试' },
  ]
  const v = validateProducts(rows)
  assert.equal(v.errors.length, 0)
  assert.equal(v.items.length, 2)
})

test('validateOrders：商品引用存在性校验', () => {
  const knownSkus = new Set(['P1'])
  const rows = [
    // 字段全部合法但 sku 不存在 → 触发引用错误
    { order_id: 'O1', buyer: '买家2', sku: 'PX', quantity: '1', amount: '10', created_at: '2026-08-01 10:00', status: '待付款' },
    // 字段错误行（不触发引用检查，只报字段错误）
    { order_id: 'O2', buyer: '买家3', sku: 'P1', quantity: '0', amount: '-5', created_at: 'bad', status: '未知状态' },
  ]
  const v = validateOrders(rows, knownSkus)
  const reasons = v.errors.map((e) => e.reason).join('|')
  assert.match(reasons, /引用了不存在的商品 sku：PX/)
  assert.match(reasons, /数量非法/)
  assert.match(reasons, /金额非法/)
  assert.match(reasons, /下单时间非法/)
  assert.match(reasons, /订单状态非法：未知状态/)
})

/* ─────────── CSV 导出（§11） ─────────── */

test('toCsv：UTF-8 BOM + CRLF + 字段转义', () => {
  const csv = toCsv(['a', 'b'], [['x', '含,逗号"和\n换行']])
  assert.ok(csv.startsWith('\uFEFF'), '应以 BOM 开头')
  assert.match(csv, /\r\n/)
  assert.match(csv, /"含,逗号""和\n换行"/)
})

test('productsToCsv / ordersToCsv：表头完整', async () => {
  const store = await makeStore()
  const products = store.listProducts({ page_size: 5 }).items
  const orders = store.listOrders({ page_size: 5 }).items
  const pc = productsToCsv(products)
  const oc = ordersToCsv(orders)
  assert.ok(pc.startsWith('\uFEFFsku,name,category,price,stock,status'))
  assert.ok(oc.startsWith('\uFEFForder_id,buyer,sku,product_name,quantity,amount,status'))
  assert.ok(pc.includes('SKU-0001'))
  assert.ok(oc.includes('ORD-'))
})

/* ─────────── 数据源切换（§6.3） ─────────── */

test('switchMode：demo → imported → demo 完整流转', async () => {
  const store = await makeStore()
  // 初始 demo
  assert.equal(store.getModeInfo().mode, 'demo')
  // 导入一批数据（importData → imported）
  const result = store.importData(
    [{ sku: 'IM1', name: '导入商品', price: 9.9, stock: 3, category: '测试', status: 'on_sale', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }],
    [],
  )
  assert.ok(result.products > 0)
  assert.equal(store.getModeInfo().mode, 'imported')
  assert.equal(store.getModeInfo().canImported, true)
  // 切回 demo（resetToDemo 自动备份）
  await store.resetToDemo()
  assert.equal(store.getModeInfo().mode, 'demo')
  // demo 数据恢复为种子规模
  assert.equal(store.listProducts({ page_size: 1000 }).total, 26)
})

test('switchToImported：无导入记录时抛错', async () => {
  const store = await makeStore()
  await assert.rejects(
    () => store.switchMode('imported'),
    /暂无导入数据/,
  )
})

test('reloadFromRest：非 rest 适配器抛错', async () => {
  const store = await makeStore()
  await assert.rejects(
    () => store.switchMode('rest'),
    /当前未配置平台 API/,
  )
})

test('getModeInfo：能力矩阵正确', async () => {
  const store = await makeStore()
  const info = store.getModeInfo()
  assert.equal(info.canDemo, true)
  assert.equal(info.canImported, false)
  assert.equal(info.canRest, false)
})
