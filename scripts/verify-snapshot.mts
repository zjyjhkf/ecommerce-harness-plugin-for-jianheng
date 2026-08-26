/**
 * 验收数据校验：复用 Store + buildSnapshot，与企业数据口径对照
 */
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EcommerceStore, todayStr } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'
import { buildSnapshot } from '../src/shop-api.ts'

const dir = mkdtempSync(join(tmpdir(), 'ecom-verify-'))
const store = new EcommerceStore(new MockAdapter(), {
  file: join(dir, 'store.json'),
  seedOnEmpty: true,
  lowStockThreshold: 10,
})
await store.init()

const snap = buildSnapshot(store)
const ov = snap.overview
console.log('今日日期:', todayStr())
console.log('--- 经营总览 ---')
console.log('销售额:', ov.revenue, '| 订单量:', ov.orders, '| 客单价:', ov.avg_order_value, '| 退款率:', ov.refund_rate, '| 畅销:', ov.top_selling_sku)
console.log('--- 今日待办 ---')
console.log('逾期:', snap.today.overdueCount, '| 待发货:', snap.today.shipmentsCount, '| 低库存:', snap.today.lowStockCount)
console.log('逾期前3:', snap.today.overdues.slice(0, 3).map(o => o.order_id).join(', '))
console.log('--- 分类 ---')
console.log(snap.categories.map(c => c.category + '×' + c.count + ' ' + c.ratio + '%').join(' | '))
console.log('分类数:', snap.categories.length)
console.log('--- TOP5 ---')
snap.top.forEach((t, i) => console.log((i + 1) + '.', t.name, t.sku, '¥' + t.revenue, t.units + '件'))
console.log('--- 低库存 ---')
console.log('数量:', snap.lowStock.length)
snap.lowStock.forEach(l => console.log(' ', l.sku, l.name, '库存', l.stock, '/≤' + l.threshold, l.category))
console.log('--- 分类筛选 products?category=服饰 ---')
const page = store.listProducts({ category: '服饰', page_size: 100 })
console.log('服饰商品数:', page.total, '| 示例:', page.items.slice(0, 3).map(p => p.name).join(', '))
