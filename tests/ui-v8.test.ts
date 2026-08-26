/**
 * v0.8 测试集：
 *  - analysisPromptOf 升级为 6 维度市场营销视角分析（包含商品全部信息）
 *  - BI 看板尺寸调整：趋势图/类目占比 bar 的 CSS 数值校验
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { analysisPromptOf } from '../src/client/data.ts'

const SRC = resolve(import.meta.dirname, '..', 'src')
const STYLES = readFileSync(resolve(SRC, 'client', 'styles.ts'), 'utf8')
const BI_DASH = readFileSync(resolve(SRC, 'client', 'BiDashboard.tsx'), 'utf8')

/* === analysisPromptOf 内容覆盖 === */

test('v0.8 [analysisPromptOf] 包含「市场营销视角」关键词', () => {
  const prompt = analysisPromptOf({
    sku: 'TEST-001',
    name: '便携充电宝',
    category: '数码配件',
    price: 99.9,
    stock: 200,
    status: 'on_sale',
  })
  assert.match(prompt, /市场营销视角/, '应明确提及「市场营销视角」')
})

test('v0.8 [analysisPromptOf] 包含商品的所有信息字段（SKU/名称/分类/售价/库存/状态）', () => {
  const prompt = analysisPromptOf({
    sku: 'TEST-001',
    name: '便携充电宝 20000mAh',
    category: '数码配件',
    price: 99.9,
    stock: 200,
    status: 'on_sale',
  })
  assert.match(prompt, /TEST-001/, '包含 SKU')
  assert.match(prompt, /便携充电宝 20000mAh/, '包含商品名称')
  assert.match(prompt, /数码配件/, '包含分类')
  assert.match(prompt, /¥99\.9/, '包含售价')
  assert.match(prompt, /200 件/, '包含库存')
  assert.match(prompt, /在售/, '包含状态')
})

test('v0.8 [analysisPromptOf] 包含 6 维度分析框架', () => {
  const prompt = analysisPromptOf({
    sku: 'A',
    name: 'B',
    category: 'C',
    price: 1,
    stock: 0,
    status: 'on_sale',
  })
  // 6 维度关键词检查
  assert.match(prompt, /1\) 目标客户画像/)
  assert.match(prompt, /2\) 市场竞争与差异化定位/)
  assert.match(prompt, /3\) 定价策略评估/)
  assert.match(prompt, /4\) 库存与供应链健康度/)
  assert.match(prompt, /5\) 营销渠道建议/)
  assert.match(prompt, /6\) 促销与上架时机/)
})

test('v0.8 [analysisPromptOf] 包含可执行营销行动清单（P0/P1/P2 优先级）', () => {
  const prompt = analysisPromptOf({
    sku: 'A',
    name: 'B',
    category: 'C',
    price: 1,
    stock: 0,
    status: 'on_sale',
  })
  assert.match(prompt, /可执行营销行动清单/)
  assert.match(prompt, /P0\/P1\/P2/)
})

test('v0.8 [analysisPromptOf] 下架商品映射为「下架」中文状态', () => {
  const prompt = analysisPromptOf({
    sku: 'A',
    name: 'B',
    category: 'C',
    price: 1,
    stock: 0,
    status: 'off_sale',
  })
  assert.match(prompt, /下架/, '下架状态应展示为中文')
  assert.doesNotMatch(prompt, /在售/, '不应误标「在售」')
})

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
