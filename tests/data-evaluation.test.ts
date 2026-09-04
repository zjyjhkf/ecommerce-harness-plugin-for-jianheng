/**
 * 数据评价（月复盘 / 周复盘「数据评价」模块）——纯函数回归测试
 *
 * 覆盖 data-evaluation.ts 中不依赖宿主 ctx.llm 的纯逻辑：
 *  - buildEvaluationSummary：从月/周报告聚合「销售额/产品/推广/退款」四角度摘要
 *  - ruleBasedEvaluation：AI 不可用时的规则兜底（输出 40~80 字中文评价）
 *  - evaluationPrompt：生成给 AI 的提示词（含四角度 + 输出约束）
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildEvaluationSummary,
  ruleBasedEvaluation,
  evaluationPrompt,
  type EvaluationSummary,
} from '../src/data-evaluation.ts'
import type { MonthlyReport, WeeklyReport } from '../src/types.ts'

function mkWeekly(): WeeklyReport {
  return {
    period: '2026-08-16~2026-08-22',
    updatedAt: '2026-08-23',
    shops: ['旗舰店'],
    platformLinks: [
      { shop: '旗舰店', linkName: '链接A', linkId: 'L1', linkCode: '', linkTag: '', sales: 50000, salesCount: 100, salesCost: 30000, grossProfit: 20000, grossMargin: 40, refundAmount: 2000, refundRate: 4, returnRate: 1, netSales: 48000, adSpend: 5000, fullConv: 2, realConv: 3, views: 1000, visitors: 800, favCount: 100, favRate: 12.5, cartCount: 90, cartQty: 100, cartRate: 11, orderCount: 80, orderQty: 90, orderRate: 10, payCount: 70, payQty: 80, payRate: 8.75, searchVisitors: 50, searchPayCount: 10, searchConv: 20, avgPrice: 500 },
      { shop: '旗舰店', linkName: '链接B', linkId: 'L2', linkCode: '', linkTag: '', sales: 30000, salesCount: 60, salesCost: 20000, grossProfit: 10000, grossMargin: 33.3, refundAmount: 3000, refundRate: 10, returnRate: 2, netSales: 27000, adSpend: 8000, fullConv: 1, realConv: 2, views: 500, visitors: 400, favCount: 40, favRate: 10, cartCount: 30, cartQty: 40, cartRate: 7.5, orderCount: 25, orderQty: 30, orderRate: 6, payCount: 20, payQty: 25, payRate: 5, searchVisitors: 20, searchPayCount: 5, searchConv: 25, avgPrice: 500 },
    ],
  }
}

test('buildEvaluationSummary：无数据时返回 null', () => {
  assert.equal(buildEvaluationSummary('30d', null, null), null)
  assert.equal(buildEvaluationSummary('7d', undefined, undefined), null)
  assert.equal(buildEvaluationSummary('7d', null, { period: 'x', updatedAt: '', shops: [] }), null)
})

test('buildEvaluationSummary：周周期从 platformLinks 聚合四角度摘要', () => {
  const s = buildEvaluationSummary('7d', null, mkWeekly())
  assert.ok(s, '有数据应返回摘要')
  assert.equal(s!.cycle, '7d')
  assert.equal(s!.totalSales, 80000)
  assert.equal(s!.totalNet, 75000)
  assert.equal(s!.totalAd, 13000)
  assert.equal(s!.totalRefund, 5000)
  assert.equal(s!.itemCount, 2)
  // 费比 = 推广/净销；退款率 = 退款/销售额
  assert.ok(Math.abs(s!.feeRatio - (13000 / 75000) * 100) < 1e-6, '费比按净销口径')
  assert.ok(Math.abs(s!.refundRate - (5000 / 80000) * 100) < 1e-6, '退款率按销售额口径')
  assert.equal(s!.topItem, '链接A') // 净销最高者
  assert.ok(Math.abs(s!.topShare - (48000 / 75000) * 100) < 1e-6, '头部净销占比')
})

test('buildEvaluationSummary：月周期优先 platformLinks，回退 systemProducts', () => {
  const monthly: MonthlyReport = {
    period: '2026-07-01~2026-07-31',
    month: '2026-07',
    updatedAt: '2026-08-01',
    shops: ['旗舰店'],
    systemProducts: [
      { name: '货品X', code: 'C1', brand: 'B', category: 'C', sales: 20000, grossProfit: 8000, grossMargin: 40, refundRate: 5, returnRate: 1, netSales: 19000, adSpend: 3000, avgPrice: 400, singleRate: 90 },
    ],
  }
  const s = buildEvaluationSummary('30d', monthly, mkWeekly())
  assert.ok(s)
  assert.equal(s!.cycle, '30d')
  assert.equal(s!.totalSales, 20000)
  assert.equal(s!.itemCount, 1)
  assert.equal(s!.topItem, '货品X')
  assert.equal(s!.period, '2026-07-01~2026-07-31')
})

test('ruleBasedEvaluation：输出长度在 40~80 字且含关键指标', () => {
  const s = buildEvaluationSummary('7d', null, mkWeekly())!
  const text = ruleBasedEvaluation(s)
  assert.ok(text.length >= 40, `评价长度应 ≥40，实际 ${text.length}`)
  assert.ok(text.length <= 80, `评价长度应 ≤80，实际 ${text.length}`)
  assert.match(text, /本周/)
  assert.match(text, /退款率/)
})

test('ruleBasedEvaluation：退款率/费比异常时给出提示', () => {
  const s: EvaluationSummary = {
    cycle: '7d', period: '本周', totalSales: 100000, totalNet: 50000, totalAd: 20000,
    feeRatio: 40, totalRefund: 15000, refundRate: 15, itemCount: 10, topItem: 'A', topShare: 50,
  }
  const text = ruleBasedEvaluation(s)
  assert.match(text, /推广费比偏高/)
  assert.match(text, /退款率偏高/)
  assert.match(text, /头部商品占比过高/)
})

test('evaluationPrompt：包含销售额/产品/推广/退款四角度与 40~80 字约束', () => {
  const s = buildEvaluationSummary('7d', null, mkWeekly())!
  const p = evaluationPrompt(s)
  assert.match(p, /销售额/)
  assert.match(p, /产品/)
  assert.match(p, /推广/)
  assert.match(p, /退款/)
  assert.match(p, /40~80/)
})
