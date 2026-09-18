/**
 * 净销售额口径统一回归：**净销售额 = 销售额 − 退款**
 *
 * 背景（用户反馈）：面板同时存在「利润表（财务口径）」与「排名表（商品口径）」两套数字，
 * 跨模块一比会出现「净销额 > 销售额」这种口径上不可能的关系。
 * 现统一为商品口径，且凡是在同一行能拿到销售额与退款的层级都改为推导式。
 *
 * 源表两列本身并不相等（实测 8 月差 2,620 元、7 月差 3,431~3,454 元），
 * 因此这里同时锁死「系统货品不推导」这条边界 —— 该表没有退款金额列，
 * 两条跨表补路（按货品名 / 按商家编码前缀）都实测不可靠。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { enforceNetSalesRule } from '../src/monthly-report.ts'
import type { MonthlyReport } from '../src/types.ts'

function rep(over: Partial<MonthlyReport>): MonthlyReport {
  return { period: '2026-08-01~2026-08-31', month: '2026-08', updatedAt: '', shops: [], ...over } as MonthlyReport
}

test('口径统一：平台链接 / 系统规格 的净销售额改为 销售额 − 退款金额', () => {
  const r = rep({
    platformLinks: [
      { sales: 1000, refundAmount: 300, netSales: 750 } as never, // 源表净销售额列 750（与相减 700 不符）
      { sales: 500, refundAmount: 0, netSales: 500 } as never,
    ],
    systemSkus: [
      { name: 'A', specName: 's1', code: 'S1', sales: 800, refundAmount: 100, netSales: 690 } as never,
    ],
  })
  enforceNetSalesRule(r)
  const l = r.platformLinks as Array<{ netSales: number }>
  const k = r.systemSkus as Array<{ netSales: number }>
  assert.equal(l[0].netSales, 700, '链接层：1000 − 300 = 700（覆盖表内 750）')
  assert.equal(l[1].netSales, 500, '无退款时不变')
  assert.equal(k[0].netSales, 700, '规格层：800 − 100 = 700（覆盖表内 690）')
})

test('口径统一：系统货品层不推导（该表没有退款金额列，跨表补路不可靠）', () => {
  const r = rep({
    systemProducts: [{ name: 'X', code: 'P1', sales: 1000, netSales: 750 } as never],
    systemSkus: [{ name: 'X', specName: 's1', code: 'S1', sales: 1000, refundAmount: 300, netSales: 700 } as never],
  })
  enforceNetSalesRule(r)
  const p = r.systemProducts as Array<{ netSales: number }>
  assert.equal(p[0].netSales, 750, '货品层保留表内净销售额列，不得用同名规格去推（同名不同编号会重复扣减）')
})

test('口径统一：幂等 —— 重复调用结果不变（分多次导入文件时会反复触发）', () => {
  const r = rep({
    platformLinks: [{ sales: 1000, refundAmount: 300, netSales: 750 } as never],
  })
  enforceNetSalesRule(r)
  const once = (r.platformLinks as Array<{ netSales: number }>)[0].netSales
  enforceNetSalesRule(r)
  enforceNetSalesRule(r)
  assert.equal((r.platformLinks as Array<{ netSales: number }>)[0].netSales, once)
  assert.equal(once, 700)
})

test('口径统一：净销售额恒 ≤ 销售额（杜绝「净销额 > 销售额」）', () => {
  const r = rep({
    platformLinks: [
      { sales: 100, refundAmount: 0, netSales: 100 } as never,
      { sales: 200, refundAmount: 150, netSales: 50 } as never,
    ],
  })
  enforceNetSalesRule(r)
  for (const l of r.platformLinks as Array<{ sales: number; netSales: number }>) {
    assert.ok(l.netSales <= l.sales, '净销售额不得超过销售额')
  }
})
