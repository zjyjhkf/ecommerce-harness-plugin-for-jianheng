/**
 * v0.12 测试集：
 *  - 移除早期 BI 数据看板（BiDashboard.tsx）与演示数据面板，
 *    全屏/标签页面板只保留「电商数据中台」iframe（复盘数据：月度 / 周度 / 数据对比）。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const SRC = resolve(import.meta.dirname, '..', 'src')
const CLIENT = resolve(SRC, 'client')
const SHOP_DESK = readFileSync(resolve(CLIENT, 'ShopDeskPanel.tsx'), 'utf8')

/* === BI 看板与演示数据面板已移除 === */

test('v0.12 [BiDashboard] BiDashboard.tsx 已删除（早期 BI 看板模块移除）', () => {
  assert.equal(existsSync(resolve(CLIENT, 'BiDashboard.tsx')), false, 'BiDashboard.tsx 应已删除')
})

test('v0.12 [ShopDeskPanel] 全屏/标签页面板只渲染电商数据中台 iframe（无 BI 看板演示数据）', () => {
  assert.doesNotMatch(SHOP_DESK, /BiDashboardSection/, '不应引用 BI 看板组件')
  assert.match(SHOP_DESK, /esd-dc-frame/, '应保留数据中台 iframe 容器')
  assert.match(SHOP_DESK, /电商数据中台/, '面板标题应为「电商数据中台」')
  assert.doesNotMatch(SHOP_DESK, /示例数据/, '不应再出现「示例数据」文案')
  assert.doesNotMatch(SHOP_DESK, /演示数据/, '不应再出现「演示数据」文案')
})

test('v0.12 [ShopDeskPanel] 保留数据中台核心交互：导入 / 全屏 / 刷新 / 导出', () => {
  assert.match(SHOP_DESK, /importLocalFiles/, '应保留本地 Excel 导入')
  assert.match(SHOP_DESK, /dataCenterUrl/, '应保留数据中台地址')
  assert.match(SHOP_DESK, /toggleFullscreen/, '应保留全屏切换')
  assert.match(SHOP_DESK, /refreshDataCenter/, '应保留刷新数据中台入口')
})
