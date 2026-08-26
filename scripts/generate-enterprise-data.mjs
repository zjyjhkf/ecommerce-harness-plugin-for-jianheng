/**
 * 生成企业级电商示例数据（确定性，可复现）
 * 背景：某品牌电商旗舰店，覆盖服饰/数码/家居/美妆/食品/运动 6 大分类
 * 时间窗：近 90 天（2026-05-27 ~ 2026-08-25），480 笔订单
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'data', 'seed.json')

// ── 确定性随机（mulberry32） ──
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260825)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const rint = (min, max) => Math.floor(rand() * (max - min + 1)) + min

// ── 商品池：24 SKU / 6 分类 ──
const categories = ['服饰', '数码配件', '家居生活', '美妆个护', '食品饮料', '运动户外']
const productDefs = [
  // 服饰
  ['冰丝防晒外套', '服饰', 159], ['高腰阔腿牛仔裤', '服饰', 189], ['纯棉短袖 T 恤', '服饰', 69],
  ['轻量羽绒服(预售)', '服饰', 399], ['复古帆布鞋', '服饰', 159],
  // 数码配件
  ['无线蓝牙耳机 Pro', '数码配件', 299], ['智能手环 5 代', '数码配件', 199], ['快充充电宝 20000mAh', '数码配件', 129],
  ['氮化镓 65W 充电器', '数码配件', 89], ['磁吸无线充电板', '数码配件', 119],
  // 家居生活
  ['记忆棉护颈枕', '家居生活', 99], ['懒人沙发豆袋', '家居生活', 259], ['香薰加湿器', '家居生活', 139],
  ['全棉四件套', '家居生活', 299], ['智能感应夜灯', '家居生活', 49],
  // 美妆个护
  ['氨基酸洁面乳', '美妆个护', 59], ['玻尿酸补水面膜(10片)', '美妆个护', 79], ['防晒霜 SPF50+', '美妆个护', 129],
  ['电动牙刷套装', '美妆个护', 199], ['护发精油 100ml', '美妆个护', 89],
  // 食品饮料
  ['每日坚果礼盒 30 包', '食品饮料', 89], ['冻干咖啡 2g×60', '食品饮料', 129], ['低糖气泡水(24瓶)', '食品饮料', 59],
  // 运动户外
  ['瑜伽垫加厚 8mm', '运动户外', 79], ['运动水壶 1L', '运动户外', 49], ['速干运动套装', '运动户外', 199],
]

const products = productDefs.map(([name, category, price], i) => {
  const lowStock = i % 5 === 1 // 每 5 个 1 个低库存
  const soldOut = i % 9 === 4   // 每 9 个 1 个售罄下架
  return {
    sku: `SKU-${String(i + 1).padStart(4, '0')}`,
    name,
    category,
    price,
    stock: soldOut ? 0 : lowStock ? rint(1, 8) : rint(40, 480),
    status: soldOut ? 'off_sale' : 'on_sale',
    created_at: `2026-0${rint(3, 5)}-${String(rint(1, 28)).padStart(2, '0')}T10:00:00.000Z`,
    updated_at: '2026-08-20T09:00:00.000Z',
  }
})

// ── 买家昵称池 ──
const buyers = [
  '小鹿乱撞', '阿豪', '晚风', '小林', '木木', '芳芳', '大鹏', '青青', '阿哲', 'Suki',
  '老王', '桃子', '可乐', '麦麦', '柚子', '橙子', '布丁', '奶盖', '芝芝', '毛毛',
  '阿杰', '小美', '程程', '阿凯', '莉莉', '阿南', '小满', '大熊', '雪莉', '阿荣',
]

// ── 状态分布 ──
const STATUS_WHEEL = [
  'completed', 'completed', 'completed', 'completed', 'completed',  // 50%
  'shipped', 'shipped', 'shipped',                                   // 30% → 15% (x2权重下调)
  'paid', 'paid',                                                     // 20% → 10%
  'pending',                                                          // 10% → 8% 向下调
  'refunded', 'refunded',                                             // 20% → 10%
  'cancelled', 'cancelled',                                           // 20% → 7%
]

// 修正权重：50% completed / 15% shipped / 10% paid / 8% pending / 10% refunded / 7% cancelled
function pickStatus() {
  const r = rand()
  if (r < 0.5) return 'completed'
  if (r < 0.65) return 'shipped'
  if (r < 0.75) return 'paid'
  if (r < 0.83) return 'pending'
  if (r < 0.93) return 'refunded'
  return 'cancelled'
}

// ── 订单生成：近 90 天 480 笔 ──
const orders = []
const today = new Date('2026-08-25T00:00:00Z')
for (let i = 0; i < 480; i++) {
  const p = pick(products)
  const qty = rint(1, 5)
  const amount = Math.round(p.price * qty * 100) / 100
  const daysAgo = rint(0, 89)
  const d = new Date(today)
  d.setUTCDate(d.getUTCDate() - daysAgo)
  d.setUTCHours(rint(8, 21), rint(0, 59), rint(0, 59), 0)
  const iso = d.toISOString()
  const status = pickStatus()
  const order = {
    order_id: `ORD-${iso.slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
    buyer: pick(buyers),
    sku: p.sku,
    product_name: p.name,
    quantity: qty,
    amount,
    status,
    created_at: iso,
  }
  if (status === 'shipped' || status === 'completed') {
    const ship = new Date(d)
    ship.setUTCDate(ship.getUTCDate() + rint(1, 3))
    order.shipped_at = ship.toISOString()
    order.tracking_no = `SF${String(rint(1000000000, 9999999999))}`
    order.carrier = pick(['顺丰', '圆通', '中通', '韵达', '京东'])
  }
  if (status === 'refunded') {
    order.refund_reason = pick(['七天无理由退货', '商品质量问题', '尺码不合适', '物流太慢申请退款', '拍错商品'])
  }
  orders.push(order)
}
orders.sort((a, b) => a.created_at.localeCompare(b.created_at))

const data = {
  products,
  orders,
  _meta: {
    source: 'enterprise-seed',
    description: `企业电商演示数据：${products.length} 商品 / ${orders.length} 订单（近 90 天，6 大分类），确定性生成 seed=20260825`,
    generated_at: new Date().toISOString(),
  },
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8')

// ── 汇总统计 ──
const byStatus = {}
for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1
const revenue = orders
  .filter((o) => ['paid', 'shipped', 'completed'].includes(o.status))
  .reduce((s, o) => s + Math.round(o.amount * 100), 0) / 100
console.log('已生成企业数据 →', OUT)
console.log('商品:', products.length, '| 订单:', orders.length)
console.log('状态分布:', JSON.stringify(byStatus))
console.log('已支付口径销售额: ¥' + revenue.toFixed(2), '| 订单量:', orders.filter((o) => ['paid', 'shipped', 'completed'].includes(o.status)).length)
