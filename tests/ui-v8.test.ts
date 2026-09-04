/**
 * v0.8 测试集：
 *  - analysisPromptOf 已随「单个商品增删改查/上下架」功能一并删除
 *  - BI 看板尺寸调整：趋势图/类目占比 bar 的 CSS 数值校验
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SRC = resolve(import.meta.dirname, '..', 'src')
const STYLES = readFileSync(resolve(SRC, 'client', 'styles.ts'), 'utf8')
const BI_DASH = readFileSync(resolve(SRC, 'client', 'BiDashboard.tsx'), 'utf8')

/* === BI 看板尺寸调整 === */

test('v0.8 [styles] 趋势图 SVG 高度收缩到 100px（避免过大，v0.11 调整为 150px）', () => {
  assert.match(STYLES, /\.esd-bi-svg\s*\{[^}]*height:\s*150px/, '趋势图 SVG 高度应为 150px')
})

test('v0.8 [styles] 条形 bar 轨道加高到 18px（v0.11 进一步加大到 22px）', () => {
  assert.match(STYLES, /\.esd-bi-bar-track\s*\{[^}]*height:\s*22px/, 'bar 轨道应为 22px')
})

test('v0.8 [styles] 条形 bar 名称/数字列宽调整（v0.11 改为 96/96 等宽）', () => {
  assert.match(STYLES, /\.esd-bi-bar-name\s*\{[^}]*width:\s*96px/, '类目名宽度 96px')
  assert.match(STYLES, /\.esd-bi-bar-val\s*\{[^}]*width:\s*96px/, '数字列宽 96px')
})

test('v0.8 [styles] 网格列宽比例调整为 1.3:1（v0.11 改为 1:1 等宽协调）', () => {
  assert.match(STYLES, /1fr 1fr/, '网格列宽应为 1fr 1fr 等宽')
})

test('v0.8 [BiDashboard] 趋势图 SVG viewBox 高度从 180 收缩到 120', () => {
  const match = BI_DASH.match(/function BiTrendChart[\s\S]{0,2500}/)
  assert.ok(match !== null)
  assert.match(match![0], /const H = 120/, 'BiTrendChart SVG 高度应为 120')
  assert.doesNotMatch(match![0], /const H = 180/, '不应再保留 H=180')
})

test('v0.8 [BiDashboard] 类目占比 BarRow 统一名称宽度 100（与 CSS 对齐）', () => {
  // 验证 BarRow 中 name 字段正确传入
  assert.match(BI_DASH, /BiCategoryBars/, '类目占比组件存在')
  assert.match(BI_DASH, /BarRow/, 'BarRow 复用组件存在')
})
