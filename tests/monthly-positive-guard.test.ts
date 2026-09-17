/**
 * 利润表「正向销售收入」口径守卫回归
 *
 * 背景（见桌面《电商数据中台-Excel修正方案.md》）：7/8 月两份模板的「利润表」把
 * 「正向销售收入(不含特殊单)」的公式写成了 销售收入 **+** 退款（应为 −），
 * 导致 8 月 正向销售收入 5,202,477.21 > 销售收入 4,283,936.79 —— 虚高整整一个退款额，
 * 且 17 家门店里 16 家中招。正向销售收入按定义是销售收入的子集，不可能大于销售收入。
 *
 * 插件侧不依赖用户去改 Excel：解析层识别到该违反即按「销售收入 − 退款」纠正，
 * 并把原值留在 positiveSalesRaw，供面板/AI 取数提示用户核对源表。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as XLSX from 'xlsx'
import { parseMonthlyReportExcel } from '../src/monthly-report.ts'

function buildProfitBuffer(rows: unknown[][]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '利润表')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

const HEAD = ['核算项目名称', '合计', '天猫店A', '京东店B']

type Row = {
  store: string
  sales: number
  positiveSales: number
  positiveSalesRaw?: number
  refund: number
  feeRatio: number
}

async function parseStores(rows: unknown[][]): Promise<Row[]> {
  const parsed = await parseMonthlyReportExcel(buildProfitBuffer(rows))
  assert.ok(parsed, '应识别为月度利润表')
  const part = parsed as unknown as { kind: string; storeProfit?: Row[] }
  assert.equal(part.kind, 'storeProfit')
  return part.storeProfit ?? []
}

test('口径守卫：正向销售收入 > 销售收入 → 按 销售收入−退款 纠正，并把原值留在 positiveSalesRaw', async () => {
  const stores = await parseStores([
    ['利润表名称：月度多店'],
    HEAD,
    ['一、销售收入', '4283936.79', '1161161', '24265'],
    // 公式笔误：写成 销售收入 + 退款（8 月实测值）
    ['正向销售收入(不含特殊单)', '5202477.21', '1306354', '25101'],
    ['退款', '918540.42', '145193', '837'],
    ['四、毛利', '2119602.60', '300000', '8000'],
    ['五、销售毛利率', '49.48%', '25.8%', '33.0%'],
    ['六、仓库物流费用', '167323.34', '5000', '100'],
    ['七、运营推广费用', '544785.16', '9000', '600'],
  ])
  assert.equal(stores.length, 2, '「合计」列不作为门店')
  const a = stores[0]
  assert.equal(a.store, '天猫店A')
  assert.equal(a.sales, 1161161)
  assert.equal(a.refund, 145193)
  assert.equal(a.positiveSales, 1161161 - 145193, '纠正为 销售收入 − 退款')
  assert.equal(a.positiveSalesRaw, 1306354, '原值必须留档，面板据此提示用户核对 Excel')
  assert.ok(a.positiveSales <= a.sales, '纠正后必须满足 正向销售收入 ≤ 销售收入')

  const b = stores[1]
  assert.equal(b.positiveSales, 24265 - 837)
  assert.equal(b.positiveSalesRaw, 25101)

  // 费比不受守卫影响：仍以销售收入为分母
  assert.ok(Math.abs(a.feeRatio - (9000 / 1161161) * 100) < 1e-6, '费比 = 推广费 ÷ 销售收入')
})

test('口径守卫：正向销售收入 ≤ 销售收入（正常源表）时原样保留，不产生 positiveSalesRaw', async () => {
  const stores = await parseStores([
    ['利润表名称：月度多店'],
    HEAD,
    ['一、销售收入', '1000000', '100000', '50000'],
    ['正向销售收入(不含特殊单)', '920000', '92000', '45000'],
    ['退款', '80000', '8000', '5000'],
    ['四、毛利', '500000', '30000', '14000'],
    ['五、销售毛利率', '50%', '30%', '28%'],
    ['六、仓库物流费用', '20000', '5000', '2500'],
    ['七、运营推广费用', '15000', '9000', '6000'],
  ])
  const a = stores[0]
  assert.equal(a.positiveSales, 92000, '正常值不得被改动')
  assert.equal(a.positiveSalesRaw, undefined, '正常数据不产生原值字段')
})

test('口径守卫：销售收入为 0 的店铺不误判（不得把 0 当成违反口径）', async () => {
  const stores = await parseStores([
    ['利润表名称：月度多店'],
    HEAD,
    ['一、销售收入', '1000000', '100000', '0'],
    ['正向销售收入(不含特殊单)', '920000', '92000', '0'],
    ['退款', '80000', '8000', '0'],
    ['四、毛利', '500000', '30000', '0'],
    ['五、销售毛利率', '50%', '30%', '0%'],
    ['六、仓库物流费用', '20000', '5000', '0'],
    ['七、运营推广费用', '15000', '9000', '0'],
  ])
  // 收入与正向收入都为 0 的门店会被「未在销」过滤掉；这里只断言不抛错且剩余行正常
  assert.ok(stores.every((s) => s.positiveSalesRaw === undefined), '0/0 不得被判为违反口径')
})
