/**
 * v0.4.5 数据中台行为测试（vm 执行真实 data-center 应用脚本）
 *
 * ① 空数据治理：清除/未导入时，销售概览的全部图表画布必须被重置为占位
 *    （根治用户反馈「右上角清除后经销/销售概览图表和排行清不掉」——旧版只重写表格）；
 * ② 三月连导 KPI 锚定：先导 6、8 月再补导 7 月时，大字/高亮柱 = 最近导入的 7 月
 *    （而非字典序最大的 8 月），折线柱状 x 轴仍按月份升序；
 * ③ 柱线合一：compareTrendBar 单图双系列（bar + 环比 line），锚定月柱用高亮橙。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runInContext } from 'node:vm'
import { renderPanels } from '../scripts/test-support.ts'

test('v0.4.5 [空态治理] 无数据渲染销售视图：6 张图表全部占位 + 明细表显示导入提示', () => {
  const r = renderPanels(null, null, '30d', ['sales'])
  assert.equal(r.error, null, '空数据渲染不得抛错')
  for (const id of ['salesPie', 'storeSalesChart', 'productSalesChart', 'ovRefundBar', 'ovCategoryBar', 'ovPromoBar']) {
    const opt = r.charts[id]?.__option as { title?: { text?: string } } | null | undefined
    assert.ok(opt && opt.title && String(opt.title.text).includes('暂无数据'), `图表 #${id} 必须重置为「暂无数据」占位（清除后不得残留旧月份图形）`)
  }
  assert.ok(String(r.els['salesTbody']?.innerHTML ?? '').includes('暂无导入数据'), '明细表显示导入提示')
  assert.ok(String(r.els['moduleSummary']?.innerHTML ?? '') === '', '模块速览已清空')
})

test('v0.4.5 [空态治理] 有数据后再清空：重渲染同样全占位（模拟一键清除后的轮询刷新）', () => {
  const rep = {
    period: '2026-07-01~2026-07-28', month: '2026-07', updatedAt: '', shops: ['天猫店A'],
    platformLinks: [{ shop: '天猫店A', linkName: '链接甲', linkId: 'L1', linkCode: '', sales: 100000, salesCount: 100, netSales: 92000, grossProfit: 30000, grossMargin: 30, refundAmount: 8000, refundRate: 8, returnRate: 1, adSpend: 9000, views: 5000 }],
    systemProducts: [{ name: '货品X', code: 'P1', brand: 'B', category: '家居', sales: 100000, salesCount: 100, netSales: 92000, grossProfit: 30000, refundRate: 8, adSpend: 9000 }],
    systemSkus: [{ name: '货品X', specName: '规格1', code: 'S1', category: '家居', sales: 100000, salesCount: 100, netSales: 92000, grossProfit: 30000, refundAmount: 8000, refundRate: 8, adSpend: 9000 }],
    storeProfit: [{ store: '天猫店A', sales: 100000, positiveSales: 108000, refund: 8000, grossProfit: 30000, grossMargin: 30, logisticsCost: 5000, promoCost: 9000, feeRatio: 9 }],
  }
  // 第一轮：有数据（不抛错即可）
  const r = renderPanels(rep, null, '30d', ['sales'])
  assert.equal(r.error, null, '有数据渲染正常')
  // 第二轮：清空 → 与空态一致的占位治理（同一 renderPanels 无法注入 null 后再渲染，
  // 直接用 ctx 模拟：置空 APP_DATA.monthlyReport 并重走 renderView('sales')）
  runInContext('APP_DATA.monthlyReport = null; refreshMonthLabels(); renderView("sales");', r._ctx)
  for (const id of ['salesPie', 'ovRefundBar', 'ovCategoryBar', 'ovPromoBar']) {
    const opt = r.charts[id]?.__option as { title?: { text?: string } } | undefined
    assert.ok(opt && opt.title && String(opt.title.text).includes('暂无数据'), `清除后图表 #${id} 必须回到占位`)
  }
})

test('v0.4.5 [KPI 锚定] 乱序补导 7 月（已有 6、8 月）：大字=7月、高亮柱=7月、轴仍 6→7→8', () => {
  const r = renderPanels(null, null, '30d', ['sales'])
  runInContext(`
    APP_DATA.monthlyReport = { month:'2026-07', period:'2026-07-01~2026-07-28', shops:[] };
    compareTrendMetric = 'netSales';
    comparePayload = { showModule: true,
      trendMetrics: [{id:'netSales',label:'净销额',unit:'money'},{id:'skuCount',label:'产品规格数',unit:'number'}],
      trend: [
        { period:'p6', month:'2026-06', label:'6月', netSales:100000, skuCount:10 },
        { period:'p7', month:'2026-07', label:'7月', netSales:120000, skuCount:12 },
        { period:'p8', month:'2026-08', label:'8月', netSales:150000, skuCount:15 }
      ] };
    renderCompareTrend();
  `, r._ctx)
  const kpiHtml = String(r.els['compareTrendKpi']?.innerHTML ?? '')
  assert.ok(kpiHtml.includes('净销额 · 7月'), 'KPI 大字标题=最近导入月（7月），不是字典序最大的 8月')
  assert.ok(kpiHtml.includes('6月'), '小字相邻上月=6月')
  const opt = r.charts['compareTrendBar']?.__option as {
    xAxis?: { data?: string[] }
    series?: Array<{ type?: string; data?: Array<{ itemStyle?: { color?: string } } & { value?: number }> }>
  }
  // 注意：vm 数组与主上下文原型不同，跨 realm 断言一律走 JSON 序列化比较
  assert.equal(JSON.stringify(opt?.xAxis?.data), JSON.stringify(['6月', '7月', '8月']), '柱状 x 轴按月份升序（随月推进）')
  const bar = opt?.series?.find((s) => s.type === 'bar')
  const colors = (bar?.data ?? []).map((d) => (d as { itemStyle?: { color?: string } }).itemStyle?.color)
  assert.equal(colors[1], '#e67e22', '高亮橙柱=最近导入月（7月，index 1）')
  assert.notEqual(colors[2], '#e67e22', '8月非锚定不高亮（月份分色仍区分）')
  const line = opt?.series?.find((s) => s.type === 'line')
  assert.ok(line, '同一图内含环比折线系列（柱线合一）')
  assert.equal(JSON.stringify((line?.data ?? []).map((v) => (v as { value?: number })?.value ?? v)), JSON.stringify([null, 20, 25]), '环比增速%：(12-10)/10=20、(15-12)/12=25')
})
