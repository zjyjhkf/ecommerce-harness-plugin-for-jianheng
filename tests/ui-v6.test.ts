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
import { importLocalFile as _ } from '../src/import-parse.ts'

const SRC = resolve(import.meta.dirname, '..', 'src')
const CLIENT_INDEX = readFileSync(resolve(SRC, 'client', 'index.tsx'), 'utf8')
const SHOP_DESK = readFileSync(resolve(SRC, 'client', 'ShopDeskPanel.tsx'), 'utf8')
const STYLES = readFileSync(resolve(SRC, 'client', 'styles.ts'), 'utf8')

/* === 客户端入口（index.tsx）改动校验 === */

test('v0.6 [index.tsx] 删除 CockpitDockLauncher 函数（顶部 dock 长按键）', () => {
  assert.equal(
    CLIENT_INDEX.includes('function CockpitDockLauncher'),
    false,
    'CockpitDockLauncher 函数应当已被删除',
  )
})

test('v0.6 [index.tsx] 删除 conversation.input.dock 注册块', () => {
  assert.equal(
    CLIENT_INDEX.includes('conversation.input.dock'),
    false,
    'conversation.input.dock 注册应当已被删除',
  )
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

test('v0.6 [index.tsx] 注入 conversation 服务（点击商品 → 会话指令）', () => {
  assert.match(CLIENT_INDEX, /ctx\.get\(['"]conversation['"]/)
  assert.match(CLIENT_INDEX, /registerConversationSender/)
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

test('v0.6 [ShopDeskPanel] 保留主要模块：经营总览 / 打开仪表盘 / 商品分类 / BI 看板 / 商品管理 / 一页简报', () => {
  assert.match(SHOP_DESK, /BiDashboardSection/, 'BI 数据看板')
  assert.match(SHOP_DESK, /OverviewSection/, '经营总览')
  assert.match(SHOP_DESK, /CategorySection/, '商品分类')
  assert.match(SHOP_DESK, /TopSection/, '销售排行 TOP')
  assert.match(SHOP_DESK, /LowStockSection/, '低库存预警')
  assert.match(SHOP_DESK, /TodoSection/, '今日待办')
  assert.match(SHOP_DESK, /BriefSection/, '一页简报')
  assert.match(SHOP_DESK, /ProductManagerSection/, '商品管理表格')
  assert.match(SHOP_DESK, /openDashboard/, '打开仪表盘入口')
})

/* === demo 模式导入引导横幅 === */

test('v0.6 [ShopDeskPanel] demo 模式下显示导入引导横幅（v0.6 数据完全由导入决定）', () => {
  // ShopDeskTab 内应当有导入引导横幅（条件 d.snapshot.mode.mode === 'demo'）
  assert.match(
    SHOP_DESK,
    /d\.snapshot !== null && d\.snapshot\.mode\.mode === ['"]demo['"][\s\S]*?esd-import-banner/,
    'demo 模式应触发导入引导横幅',
  )
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
