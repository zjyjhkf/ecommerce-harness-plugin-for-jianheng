/**
 * 净销售额口径回归（v0.4.14 用户口径）：**以源表「净销售额」列为准**
 *
 * 背景（用户反馈）：面板展示的「销售额」= 排名表「净销售订单 / 净销售额」列的合计；
 * 源表「销售订单 / 销售额」列（8 月 578.9 万）是含退款的订单额，改称「订单销售额（含退款）」。
 * 实测 8 月：产品表销售额列 5,788,518.93 / 净销售额列 4,492,466.32（449.2 万），
 * 链接表与规格表的净销售额列同为 449.2 万（三表一致），而 销售额 − 退款 = 449.5 万，
 * 两者差 2,629 元 —— 这是源表两列自身的不一致，不再由插件改写。
 *
 * 本文件锁死三条边界：
 *   ① 表内「净销售额」列有值 → 原样保留（不再改成 销售额 − 退款）；
 *   ② 表内列缺失/为 0 且销售额 > 0 → 用 销售额 − 退款金额 兜底；
 *   ③ 系统货品层不做任何推导（该表没有退款金额列，跨表补路实测不可靠）。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyNetSalesRule } from '../src/monthly-report.ts'
import type { MonthlyReport } from '../src/types.ts'

function rep(over: Partial<MonthlyReport>): MonthlyReport {
  return { period: '2026-08-01~2026-08-31', month: '2026-08', updatedAt: '', shops: [], ...over } as MonthlyReport
}

test('口径：平台链接 / 系统规格 保留源表「净销售额」列，不再改写为 销售额 − 退款', () => {
  const r = rep({
    platformLinks: [
      { sales: 1000, refundAmount: 300, netSales: 750 } as never, // 表内净销售额列 750（相减是 700）
      { sales: 500, refundAmount: 0, netSales: 500 } as never,
    ],
    systemSkus: [
      { name: 'A', specName: 's1', code: 'S1', sales: 800, refundAmount: 100, netSales: 690 } as never,
    ],
  })
  applyNetSalesRule(r)
  const l = r.platformLinks as Array<{ netSales: number }>
  const k = r.systemSkus as Array<{ netSales: number }>
  assert.equal(l[0].netSales, 750, '链接层：保留表内 750，不得用 1000−300=700 覆盖')
  assert.equal(l[1].netSales, 500, '无退款时不变')
  assert.equal(k[0].netSales, 690, '规格层：保留表内 690，不得用 800−100=700 覆盖')
})

test('兜底：整张表都没有「净销售额」列（旧模板）时，才用 销售额 − 退款金额 推导', () => {
  const r = rep({
    platformLinks: [
      { sales: 1000, refundAmount: 300, netSales: 0 } as never,      // 整列缺失 → 兜底
      { sales: 600, refundAmount: 100 } as never,                    // 字段缺失 → 兜底
      { sales: 0, refundAmount: 50, netSales: 0 } as never,          // 无销售额 → 不动
    ],
    systemSkus: [
      { name: 'A', specName: 's1', code: 'S1', sales: 800, refundAmount: 100, netSales: 0 } as never,
    ],
  })
  applyNetSalesRule(r)
  const l = r.platformLinks as Array<{ netSales: number }>
  const k = r.systemSkus as Array<{ netSales: number }>
  assert.equal(l[0].netSales, 700, '缺列兜底：1000 − 300')
  assert.equal(l[1].netSales, 500, '字段缺失兜底：600 − 100')
  assert.equal(l[2].netSales, 0, '销售额为 0 的行不做推导')
  assert.equal(k[0].netSales, 700, '规格层缺列兜底：800 − 100')
})

test('回归：只要表内列有值，个别空行不得逐行补（真实 8 月链接表会因此多出 57 元，三表就对不上）', () => {
  const r = rep({
    platformLinks: [
      { sales: 1000, refundAmount: 300, netSales: 750 } as never, // 表内列有值
      { sales: 57, refundAmount: 0, netSales: 0 } as never,       // 个别空行
      { sales: 0, refundAmount: 10, netSales: 0 } as never,
    ],
  })
  applyNetSalesRule(r)
  const l = r.platformLinks as Array<{ netSales: number }>
  assert.equal(l[0].netSales, 750, '有值的行保留')
  assert.equal(l[1].netSales, 0, '表内列存在 → 空行不得补成 57')
  assert.equal(l[2].netSales, 0)
})

test('边界：系统货品层不做任何推导（该表没有退款金额列，跨表补路不可靠）', () => {
  const r = rep({
    systemProducts: [
      { name: 'X', code: 'P1', sales: 1000, netSales: 750 } as never,
      { name: 'Y', code: 'P2', sales: 1000, netSales: 0 } as never,
    ],
    systemSkus: [{ name: 'X', specName: 's1', code: 'S1', sales: 1000, refundAmount: 300, netSales: 700 } as never],
  })
  applyNetSalesRule(r)
  const p = r.systemProducts as Array<{ netSales: number }>
  assert.equal(p[0].netSales, 750, '货品层保留表内净销售额列')
  assert.equal(p[1].netSales, 0, '货品层没有退款列 → 即使为 0 也不推导（不得按同名规格去扣）')
})

test('幂等：重复调用结果不变（分多次导入文件时会反复触发）', () => {
  const r = rep({
    platformLinks: [
      { sales: 1000, refundAmount: 300, netSales: 750 } as never,
      { sales: 1000, refundAmount: 300, netSales: 0 } as never,
    ],
  })
  applyNetSalesRule(r)
  const once = (r.platformLinks as Array<{ netSales: number }>).map((x) => x.netSales)
  applyNetSalesRule(r)
  applyNetSalesRule(r)
  assert.deepEqual((r.platformLinks as Array<{ netSales: number }>).map((x) => x.netSales), once)
  assert.deepEqual(once, [750, 0], '表内列已存在 → 不补空行')
  // 整列缺失的那张表才会被补，且重复调用不再变化
  const r2 = rep({ systemSkus: [{ name: 'A', specName: 's1', code: 'S1', sales: 800, refundAmount: 100, netSales: 0 } as never] })
  applyNetSalesRule(r2)
  const once2 = (r2.systemSkus as Array<{ netSales: number }>)[0].netSales
  applyNetSalesRule(r2)
  assert.equal(once2, 700)
  assert.equal((r2.systemSkus as Array<{ netSales: number }>)[0].netSales, 700)
})

test('关系：排名表「销售额」= 净销售额列恒 ≤ 「订单销售额（含退款）」= 销售额列', () => {
  const r = rep({
    platformLinks: [
      { sales: 100, refundAmount: 0, netSales: 100 } as never,
      { sales: 200, refundAmount: 150, netSales: 50 } as never,
    ],
    systemProducts: [
      { name: 'P', code: 'P1', sales: 500, netSales: 350 } as never,
    ],
  })
  applyNetSalesRule(r)
  for (const row of [...(r.platformLinks ?? []), ...(r.systemProducts ?? [])] as Array<{ sales: number; netSales: number }>) {
    assert.ok(row.netSales <= row.sales, '净销售额不得超过订单销售额（含退款）')
  }
})
