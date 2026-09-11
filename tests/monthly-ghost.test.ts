/**
 * v0.4.1 幽灵行数值结转回归：platformLinks 中无身份占位行
 *  - 不进明细排行（单独一行、明确标注、比率全 0）
 *  - 可加数值并入章节合计（不丢件数/金额）
 * 在测试内用 xlsx 即时生成最小「商品排名」工作簿，不依赖外部夹具。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as XLSX from 'xlsx'
import { parseMonthlyReportExcel } from '../src/monthly-report.ts'

function buildRankBuffer(rows: string[][]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '商品排名')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

test('platformLinks：幽灵行数值结转（合计不丢件数，占位行比率归零）', async () => {
  const buf = buildRankBuffer([
    ['日期', '2026-07-01~2026-07-31'],
    ['展示形式', '平台货品链接'],
    // 真实导出的双层表头：主表头行放身份列名，子表头行放数值列名（前导列为空）
    ['', '', '', '链接名称', '链接ID', '', '', ''],
    ['', '', '', '链接名称', '链接ID', '销售额', '销售件数', '退款率'],
    // 正常行 ×2
    ['', '', '', '商品A', 'ID1', '100', '5', '10%'],
    ['', '', '', '商品B', 'ID2', '200', '8', '5%'],
    // 幽灵行：名称+ID 全空，残留异常比率与销量 2 件
    ['', '', '', '', '', '0', '2', '600%'],
  ])
  const parsed = await parseMonthlyReportExcel(buf)
  assert.ok(parsed, '应识别为月度排名文件')
  const part = parsed as unknown as { kind: string; platformLinks?: Array<Record<string, number | string>> }
  assert.equal(part.kind, 'platformLinks')
  const rows = part.platformLinks ?? []
  assert.equal(rows.length, 3, '2 正常行 + 1 结转汇总行')
  assert.ok(String(rows[2].linkName).includes('占位行'), '结转行必须明确标注身份')
  assert.equal(rows[2].salesCount, 2, '幽灵行销量 2 件必须结转到合计')
  assert.equal(rows[2].refundRate, 0, '异常比率不得随结转进入排行')
  assert.equal(rows[2].grossMargin, 0)
  // 章节可加合计 = 源表全量（100+200+0 / 5+8+2）
  const sum = (k: string): number => rows.reduce((s, r) => s + (Number(r[k]) || 0), 0)
  assert.equal(sum('sales'), 300)
  assert.equal(sum('salesCount'), 15)
})

test('platformLinks：无幽灵行时不产生结转行', async () => {
  const buf = buildRankBuffer([
    ['日期', '2026-07-01~2026-07-31'],
    ['展示形式', '平台货品链接'],
    ['', '', '', '链接名称', '链接ID', '', '', ''],
    ['', '', '', '链接名称', '链接ID', '销售额', '销售件数', '退款率'],
    ['', '', '', '商品A', 'ID1', '100', '5', '10%'],
  ])
  const parsed = await parseMonthlyReportExcel(buf)
  const part = parsed as unknown as { platformLinks?: unknown[] }
  assert.equal(part.platformLinks?.length, 1)
})
