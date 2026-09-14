/**
 * v0.4.0 UI 完整性回归（数据中台 data-center.html + 客户端接线）
 *
 * 锁定本轮修复的结构不变量：
 *  ① 数据对比菜单「必现/必隐」接线：数据变化后主动 compareRefresh()，显隐以 showModule 为权威；
 *  ② 数据对比视图新增月度趋势区（KPI/按键/柱状/折线容器齐全），旧冗余指标按键不再出现在前端；
 *  ③ 销售概览「排行上方」退款/品类/推广三核心柱状容器存在且在明细表之前；
 *  ④ 清除联动：renderSidebarStats 同步顶部日期展示（清除后不留残影）；
 *  ⑤ 构建版本戳 r20（data-center 与 data.ts 一致，绕开 WebView 旧缓存）。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const DC = readFileSync(resolve(ROOT, 'src', 'assets', 'data-center.html'), 'utf8')
const DATA_TS = readFileSync(resolve(ROOT, 'src', 'client', 'data.ts'), 'utf8')

test('v0.4.0 [对比菜单必现] 数据变化后主动拉取对比并走 showModule 判定（打破旧鸡生蛋死锁）', () => {
  assert.match(DC, /comparePayload = null; compareError = '';\s*\n\s*updateCompareMenu\(\);\s*\n\s*if \(typeof compareRefresh === 'function'\) void compareRefresh\(\);/, 'loadRealData 变化分支必须立即 compareRefresh()')
  assert.match(DC, /p\.showModule !== undefined\s*\?\s*p\.showModule/, 'updateCompareMenu 以服务端 showModule 为权威')
})

test('v0.4.0 [对比视图容器] 趋势 KPI/指标按键/按月柱状/随月折线容器全部声明', () => {
  for (const id of ['compareTrendKpi', 'compareTrendToggle', 'compareTrendBarRow', 'compareTrendBar', 'compareTrendLineRow', 'compareTrendLine']) {
    assert.ok(DC.includes(`id="${id}"`), `容器 #${id} 必须存在`)
  }
  assert.match(DC, /function renderCompareTrend\(\)/, 'renderCompareTrend 存在')
  assert.match(DC, /function compareFrame\(\)\{[\s\S]{0,120}renderCompareTrend\(\);/, 'compareFrame 渲染链包含趋势')
})

test('v0.4.0 [趋势设计] 每月不同色柱状 + 最新月高亮；KPI 大字=最新月小字=上一月；毛利与费比独立卡', () => {
  assert.match(DC, /function cmpMonthColor\(/, '按月取色函数存在')
  assert.match(DC, /if \(isLast\) return '#e67e22'/, '最新月柱形高亮橙）')
  assert.ok(DC.includes("kpi-label\">' + d.label + ' · ' + escAttr(last.label)"), 'KPI 标题=指标+最新月')
  assert.ok(DC.includes("kpi-sub\">' + escAttr(prev.label)"), 'KPI 小字=上一月数值')
  assert.match(DC, /feeRatio:'teal'/, '费比为独立指标卡（与毛利分开）')
})

test('v0.4.0 [销售概览] 排行上方核心速览行：退款/品类/推广 三柱状容器，且位于数据明细表之前', () => {
  const row = DC.indexOf('id="salesCoreRow"')
  const detail = DC.indexOf('id="salesTableTitle"')
  assert.ok(row > 0, 'salesCoreRow 容器存在')
  assert.ok(row < detail, '核心速览位于明细排行之前（排行上方）')
  for (const id of ['ovRefundBar', 'ovCategoryBar', 'ovPromoBar', 'ovRefundTitle', 'ovCategoryTitle', 'ovPromoTitle']) {
    assert.ok(DC.includes(`id="${id}"`), `容器 #${id} 必须存在`)
  }
  assert.match(DC, /function renderSalesCoreBars\(\)/, 'renderSalesCoreBars 存在')
  assert.match(DC, /renderSalesCoreBars\(\);\s*\n\s*\/\/ ── 商品销售排行/, 'renderSalesPeriod 调用核心速览渲染')
})

test('v0.4.0 [清除不残留] renderSidebarStats 同步顶部日期展示，清除后回到「待导入月度数据」', () => {
  assert.match(DC, /const td = document\.getElementById\('topDateDisplay'\);[\s\S]{0,160}dataRangeLabel\(\)/, '侧栏统计函数联动顶部日期')
  assert.match(DC, /无月报（含一键清除后）也要走一遍标签\/筛选\/侧栏刷新/, 'loadRealData 清除态仍刷新标签')
})

test('v0.4.0 [版本戳] data-center 与客户端 iframe URL 同步 r20，绕开 WebView 旧缓存', () => {
  assert.ok(DC.includes("DC_VERSION = '2026-09-14.r20'"), 'DC_VERSION 已 bump')
  assert.ok(DATA_TS.includes('?v=20260914-r20'), 'dataCenterUrl 版本参数同步')
})
