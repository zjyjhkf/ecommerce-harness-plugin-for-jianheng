/**
 * v0.6 UI 改动测试集
 *
 * 覆盖 v0.6 的 UI 重构：
 *  1. 删除 conversation.input.dock 注册（CockpitDockLauncher）
 *  2. 保留 sidebar.footer.action 圆形总控
 *  3. 删除 panel header ✕ 关闭按钮
 *  4. 保留 panel header 全屏按钮
 *  5. 删除 overlay esd-toggle 浮动按钮
 *  6. 新增 demo 模式导入引导横幅
 *  7. 数据导入交互完整链路（端到端）
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// 注：曾在此 import { importLocalFile }（该 API 位于 client/data.ts 且 _ 从未使用），v0.3 起删除，
// 桌面端导入入口由 parseImportFile（src/import-parse.ts）承担。

const SRC = resolve(import.meta.dirname, '..', 'src')
const CLIENT_INDEX = readFileSync(resolve(SRC, 'client', 'index.tsx'), 'utf8')
const SHOP_DESK = readFileSync(resolve(SRC, 'client', 'ShopDeskPanel.tsx'), 'utf8')
const STYLES = readFileSync(resolve(SRC, 'client', 'styles.ts'), 'utf8')
const COCKPIT_BUS = readFileSync(resolve(SRC, 'client', 'cockpit-bus.ts'), 'utf8')

/* === 客户端入口（index.tsx）改动校验 === */

test('v0.6 [index.tsx] 删除 CockpitDockLauncher 函数（顶部 dock 长按键）', () => {
  assert.equal(
    CLIENT_INDEX.includes('function CockpitDockLauncher'),
    false,
    'CockpitDockLauncher 函数应当已被删除',
  )
})

test('v0.6 [index.tsx] skill 条改注册到 conversation.input.dock（旧 CockpitDockLauncher 已删除）', () => {
  // v0.6 删除了旧顶部 dock 按钮；后续 skill 模块条重新占用 input.dock（含空白会话也会渲染）
  assert.match(CLIENT_INDEX, /slots\.inject\(['"]conversation\.input\.dock['"]/)
  assert.match(CLIENT_INDEX, /id:\s*['"]ecommerce-skill-dock['"]/)
})

test('v0.6 [cockpit-bus] skill 条随侧边栏开关「归位」（可逆 esd-cockpit-open 取代一次性 latch）', () => {
  // 打开侧边栏加 esd-cockpit-open、关闭时移除，使 dock 技能条能恢复到初始隐藏状态
  assert.match(COCKPIT_BUS, /classList\.toggle\(['"]esd-cockpit-open['"],\s*open\)/)
  assert.match(COCKPIT_BUS, /function syncDockVisibility/)
  // 关闭侧边栏时归位全屏状态，避免重开仍停留在全屏
  assert.match(COCKPIT_BUS, /else resetFullscreen\(\)/)
  assert.match(COCKPIT_BUS, /function resetFullscreen/)
  // 不再依赖旧的一次性 esd-cockpit-opened latch 驱动显隐
  assert.doesNotMatch(COCKPIT_BUS, /classList\.add\(['"]esd-cockpit-opened['"]\)/)
})

test('v0.6 [styles] dock 技能条显隐改用可逆的 esd-cockpit-open', () => {
  assert.match(STYLES, /body:not\(\.esd-cockpit-open\) \.esd-skillbar-dock\s*\{\s*display:\s*none;/)
  assert.doesNotMatch(STYLES, /body:not\(\.esd-cockpit-opened\)/)
})

test('v0.6 [index.tsx] 保留 sidebar.footer.action 圆形总控 + DataFooterLauncher', () => {
  assert.match(CLIENT_INDEX, /slots\.inject\(['"]sidebar\.footer\.action['"]/)
  assert.match(CLIENT_INDEX, /function DataFooterLauncher/)
  assert.match(CLIENT_INDEX, /slots\.register[\s\S]*?DataFooterLauncher/)
})

test('v0.6 [index.tsx] 保留 conversation.view + shell.overlay 注册', () => {
  assert.match(CLIENT_INDEX, /slots\.inject\(['"]conversation\.view['"]/)
  assert.match(CLIENT_INDEX, /slots\.inject\(['"]shell\.overlay['"]/)
})

test('v0.6 [index.tsx] 注入会话发送能力：保存 ctx，点击时按当前会话动态获取（官方 scope 契约）', () => {
  // v0.3.3：不再启动期一次性 registerConversationSender；改为保存 ctx，点击时动态取 sessions
  assert.match(CLIENT_INDEX, /setClientContext\(ctx\)/)
  assert.doesNotMatch(CLIENT_INDEX, /registerConversationSender/, '启动期一次性注册 sender 应已删除')
  // 官方发送契约落在 cockpit-bus：sessions.scope(id) 后 get('conversation').send
  assert.match(COCKPIT_BUS, /get\(['"]conversation['"]\)/)
  assert.match(COCKPIT_BUS, /sessions\.scope/)
})

/* === ShopDeskPanel 改动校验 === */

test('v0.6 [ShopDeskPanel] 删除 overlay 形态 esd-toggle 浮动开关按钮', () => {
  // ShopDeskPanel 里的 esd-toggle 浮动按钮已删除
  // (侧边栏底部圆形入口由 sidebar.footer.action 唯一负责)
  const shopDeskPanelSection = SHOP_DESK.split('export function ShopDeskPanel')[1] ?? ''
  assert.equal(
    shopDeskPanelSection.includes('className="esd-toggle"'),
    false,
    'ShopDeskPanel 形态下不应再有 esd-toggle 浮动开关按钮',
  )
})

test('v0.6 [ShopDeskPanel] 删除 panel header ✕ 关闭按钮（统一由 sidebar.footer.action 控制）', () => {
  // 仅看 panel header 部分（aside 内部）
  const panelHeaderMatch = SHOP_DESK.match(/<aside[\s\S]*?<\/aside>/)
  assert.ok(panelHeaderMatch !== null, '应能找到 panel aside 块')
  const panelHTML = panelHeaderMatch![0]
  assert.equal(
    panelHTML.includes('收起面板'),
    false,
    'panel header 不应再有「收起面板」关闭按钮',
  )
})

test('v0.6 [ShopDeskPanel] 保留 panel header 全屏按钮 ⛶', () => {
  const panelHeaderMatch = SHOP_DESK.match(/<aside[\s\S]*?<\/aside>/)
  assert.ok(panelHeaderMatch !== null)
  const panelHTML = panelHeaderMatch![0]
  assert.match(panelHTML, /title=\{d\.fullscreen \? ['"]退出全屏['"] : ['"]全屏浏览['"]\}/)
  // 全屏图标字符
  assert.ok(panelHTML.includes('⛶') || panelHTML.includes('🗗'), '应包含全屏图标')
})

test('v0.12 [ShopDeskPanel] 移除 BI 看板 / 经营总览 / 商品分类等演示面板，仅保留电商数据中台 iframe', () => {
  assert.doesNotMatch(SHOP_DESK, /BiDashboardSection/, 'BI 数据看板应已移除')
  assert.doesNotMatch(SHOP_DESK, /OverviewSection/, '经营总览应已移除')
  assert.doesNotMatch(SHOP_DESK, /CategorySection/, '商品分类应已移除')
  assert.doesNotMatch(SHOP_DESK, /TopSection/, '销售排行 TOP 应已移除')
  assert.doesNotMatch(SHOP_DESK, /LowStockSection/, '低库存预警应已移除')
  assert.doesNotMatch(SHOP_DESK, /TodoSection/, '今日待办应已移除')
  assert.doesNotMatch(SHOP_DESK, /BriefSection/, '一页简报应已移除')
  assert.doesNotMatch(SHOP_DESK, /openDashboard/, '打开仪表盘入口应已移除')
  assert.match(SHOP_DESK, /esd-dc-frame/, '数据中台 iframe 容器应保留')
  assert.match(SHOP_DESK, /dataCenterUrl\(\)/, '数据中台 iframe 地址应保留')
})

test('v0.6 [ShopDeskPanel] 删除商品管理表格（单个商品增删改查/上下架已由导入维护）', () => {
  assert.doesNotMatch(SHOP_DESK, /ProductManagerSection/, '商品管理表格组件应已删除')
  assert.doesNotMatch(SHOP_DESK, /onProductCreate|onProductDelete|onProductStatus|adjustStock/, '商品写操作处理器应已删除')
})

/* === demo 模式导入引导横幅 === */

test('v0.12 [ShopDeskPanel] 移除演示数据导入引导横幅（早期 BI 看板演示态已删除）', () => {
  // 早期「当前展示演示数据」引导横幅已随 BI 看板一并移除
  assert.doesNotMatch(SHOP_DESK, /esd-import-banner/, '演示数据导入引导横幅应已移除')
  assert.doesNotMatch(SHOP_DESK, /演示数据/, '不应再有「演示数据」文案')
})

test('v0.6 [styles] 新增导入引导横幅样式', () => {
  assert.match(STYLES, /\.esd-import-banner\s*\{/)
  assert.match(STYLES, /\.esd-import-banner-icon/)
  assert.match(STYLES, /\.esd-import-banner-text/)
})

/* === 端到端：导入 CSV/Excel 决定数据（数据完全由导入决定） === */

async function makeTempStore(): Promise<{ store: EcommerceStore; dir: string }> {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-v6-'))
  const store = new EcommerceStore(
    new MockAdapter(),
    { file: join(dir, 's.json'), seedOnEmpty: true, lowStockThreshold: 10 },
  )
  await store.init()
  return { store, dir }
}

test('v0.6 [e2e] 默认 mock 模式显示演示数据（26 商品 / 480 订单）', async () => {
  const { store, dir } = await makeTempStore()
  const products = store.listProducts({ page_size: 10000 }).items
  const orders = store.listOrders({ page_size: 10000 }).items
  assert.equal(products.length, 26, '默认演示数据应有 26 件商品')
  assert.equal(orders.length, 480, '默认演示数据应有 480 笔订单')
  rmSync(dir, { recursive: true, force: true })
})

test('v0.6 [e2e] 切换为 imported 模式后列表清空，等待用户导入', async () => {
  const { store, dir } = await makeTempStore()
  // 模拟导入空白数据
  await store.importData([], [])
  const products = store.listProducts({ page_size: 10000 }).items
  const orders = store.listOrders({ page_size: 10000 }).items
  assert.equal(products.length, 0, 'imported 模式下未导入应为空')
  assert.equal(orders.length, 0, 'imported 模式下未导入应为空')
  assert.equal(store.getModeInfo().mode, 'imported')
  rmSync(dir, { recursive: true, force: true })
})

test('v0.6 [e2e] 导入数据后视图与工具口径完全一致', async () => {
  const { store, dir } = await makeTempStore()
  await store.importData(
    [
      {
        sku: 'TEST-001',
        name: '测试商品 A',
        price: 199.5,
        stock: 50,
        category: '测试分类',
        status: 'on_sale',
        created_at: '2026-08-25T00:00:00.000Z',
        updated_at: '2026-08-25T00:00:00.000Z',
      } as never,
    ],
    [],
  )
  const products = store.listProducts({ page_size: 10000 }).items
  assert.equal(products.length, 1, '仅 1 件测试商品')
  assert.equal(products[0]?.name, '测试商品 A')
  rmSync(dir, { recursive: true, force: true })
})

test('v0.6 [e2e] importData 后 statistics 与工具统计口径一致', async () => {
  const { store, dir } = await makeTempStore()
  await store.importData(
    [
      {
        sku: 'X-1',
        name: '测试 X',
        price: 100,
        stock: 100,
        category: 'Cat1',
        status: 'on_sale',
        created_at: '2026-08-20T00:00:00.000Z',
        updated_at: '2026-08-20T00:00:00.000Z',
      } as never,
    ],
    [],
  )
  const overview = store.overview()
  // 仅 1 件商品，无订单 → 销售额 0/订单 0/客单价 0
  assert.equal(overview.revenue, 0)
  assert.equal(overview.orders, 0)
  rmSync(dir, { recursive: true, force: true })
})
