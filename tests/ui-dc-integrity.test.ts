/**
 * 数据中台页面（data-center.html）完整性回归测试
 *
 * 背景1：销售概览视图曾因「容器元素被移除，但 renderSalesPeriod 仍 getElementById('salesKpi')
 * 并直接写 innerHTML」抛 TypeError，导致 renderSalesPeriod 中断，趋势图/占比图/数据明细/
 * 商品销售排行等后续模块整体空白。
 *
 * 背景2：布局优化时删除了与排行榜重复的冗余柱状图（经销排行柱状图、商品净销 TOP15、
 * 货品销售额/毛利额/净销、退款金额 TOP10、退款率 vs 退货率 TOP10 等），并对 SKU 费用结构
 * 单扇区饼图做了替换；本测试必须同步更新「必须存在的渲染目标」清单，防止删图时误删仍在使用的容器。
 *
 * 本测试锁定两类不变量：
 *   1) 每个 getElementById('X') 引用的 X 都必须在页面中声明 id="X"；
 *   2) 各周期视图的关键渲染目标必须全部存在（用于防空白 + 防误删仍在用的容器）。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SRC = resolve(import.meta.dirname, '..', 'src')
const DC_HTML = readFileSync(resolve(SRC, 'assets', 'data-center.html'), 'utf8')

function declaredIds(html: string): Set<string> {
  const ids = new Set<string>()
  for (const m of html.matchAll(/id="([A-Za-z0-9_-]+)"/g)) ids.add(m[1])
  return ids
}

function getElementByIdRefs(html: string): Map<string, number> {
  const refs = new Map<string, number>()
  for (const m of html.matchAll(/getElementById\(["']([A-Za-z0-9_-]+)["']\)/g)) {
    refs.set(m[1], (refs.get(m[1]) ?? 0) + 1)
  }
  return refs
}

test('数据中台：每个 getElementById 引用都有对应的 id 元素（防止引用缺失容器导致渲染中断）', () => {
  const ids = declaredIds(DC_HTML)
  const refs = getElementByIdRefs(DC_HTML)
  const missing = [...refs.entries()].filter(([id]) => !ids.has(id))
  assert.deepEqual(
    missing.map(([id]) => id),
    [],
    `以下 getElementById 目标在页面中缺失对应 id 元素（会导致写 innerHTML 时抛 TypeError、整块渲染空白）：${missing.map(([id, c]) => `${id}×${c}`).join(', ')}`,
  )
})

test('数据中台：销售概览视图关键渲染目标全部存在（占比图/数据明细/商品销售排行）', () => {
  const ids = declaredIds(DC_HTML)
  const required = [
    'moduleSummary', // 经营总览模块卡（产品概览/商品明细/SKU规格/推广分析…）
    'salesPeriodToggle', // 周期切换
    'salesPieTitle', 'salesPie', // 平台销售排行榜（柱状图）
    'productSalesChartTitle', 'productSalesChart', // 产品销售额统计图（货品级 TOP15）
    'salesTableTitle', 'salesTable', 'salesThead', 'salesTbody', // 数据明细（经销排行明细表）
    'salesProductTitle', 'salesProductTable', 'salesProductThead', 'salesProductTbody', // 商品销售排行
  ]
  for (const id of required) {
    assert.ok(ids.has(id), `缺少销售概览渲染目标元素：id="${id}"`)
  }
})

test('数据中台：产品/商品/SKU/退款视图关键渲染目标全部存在', () => {
  const ids = declaredIds(DC_HTML)
  const required = [
    // 产品概览：KPI + 货品明细表
    'productPeriodToggle', 'productKpi',
    'productDetailTitle', 'productDetailTable', 'productDetailThead', 'productDetailTbody',
    // 商品明细：KPI + 费比分层图 + 商品排行（按键切换）
    'linkPeriodToggle', 'linkKpi', 'linkStatus',
    'linkRankToggle', 'linkTable', 'linkThead', 'linkTbody',
    // SKU 规格：KPI + 退款率vs退货率图 + SKU 明细表
    'newProductPeriodToggle', 'newProductKpi', 'newProductFunnel',
    'newProductTable', 'npThead', 'npTbody',
    // 退款分析：KPI + 退款商品明细（正常） + 异常产品数据（退款率>100% 剔除排行）
    'refundPeriodToggle', 'refundKpi',
    'refundProductTitle', 'refundProductTable', 'refundProductThead', 'refundProductTbody',
    'refundAbnormalTitle', 'refundAbnormalTable', 'refundAbnormalThead', 'refundAbnormalTbody',
    // 推广分析：KPI + 推广排行（按键切换）
    'promoPeriodToggle', 'promoKpi',
    'promoRankToggle', 'promoTable', 'promoThead', 'promoTbody',
  ]
  for (const id of required) {
    assert.ok(ids.has(id), `缺少视图渲染目标元素：id="${id}"`)
  }
})

test('数据中台：已删除的冗余柱状图容器不得残留（防止死代码/空引用）', () => {
  const ids = declaredIds(DC_HTML)
  const removed = [
    'salesKpi', // 曾为销售概览 KPI 容器（后统一由视图顶部 KPI 承担）
    'salesTrend', // 经销排行柱状图（与数据明细表重复）
    'salesProductBar', // 商品销售排行柱状图（与商品销售排行表重复）
    'categoryGrowth', 'productPie', 'productSalesTrend', // 货品销售额/毛利额/净销柱状图（与货品明细表重复）
    'linkVolatility', // 商品净销 TOP20 柱状图（与商品排行/商品明细表重复）
    'newProductTrend', // SKU 净销 TOP15 柱状图（与 SKU 明细表重复）
    'refundCompare', 'refundRateCompare', // 退款金额/退款率柱状图（与退款排行表重复）
    'salesGrowth', 'salesGrowthTag', // 已隐藏的增长模块
  ]
  for (const id of removed) {
    assert.ok(!ids.has(id), `冗余柱状图容器 id="${id}" 不应存在（已删除，若需要回退请同时恢复对应渲染逻辑）`)
  }
})

test('数据中台：平台销售排行榜 + 产品销售额统计图 + 周/月复盘排行切换功能存在（防误删仍在使用的逻辑）', () => {
  // 平台销售排行榜：默认标题 + 渲染函数；产品销售额统计图：货品级 TOP15 渲染函数（两图并排展示）
  assert.ok(DC_HTML.includes('平台销售排行榜'), '销售概览顶图默认标题含「平台销售排行榜」')
  assert.ok(DC_HTML.includes('function renderPlatformSalesBar'), '平台销售排行榜渲染函数存在')
  assert.ok(DC_HTML.includes('产品销售额统计图'), '销售概览含「产品销售额统计图」标题')
  assert.ok(DC_HTML.includes('function renderProductSalesBar'), '产品销售额统计图渲染函数存在')
  // 周复盘排行切换：3 个共有排行属性（净销/销售额/退款率）+ 按键 + 每层级 TOP20 明细渲染函数
  assert.ok(DC_HTML.includes('function switchWeeklyRank'), '周复盘排行切换函数存在')
  assert.ok(DC_HTML.includes('id="wkRankToggle"'), '周复盘排行切换按键容器存在')
  assert.ok(DC_HTML.includes('WEEKLY_RANK_MODES'), '周复盘 3 个排行属性定义存在')
  for (const f of ['renderWeeklyLinksRank', 'renderWeeklyProductsRank', 'renderWeeklySkusRank']) {
    assert.ok(DC_HTML.includes('function ' + f), `周复盘明细排行函数 ${f} 存在`)
  }
  // 月复盘排行切换：货品/商品/SKU 三张明细表共有 3 个排行属性（净销/销售额/退款率）+ 按键 + 渲染函数
  assert.ok(DC_HTML.includes('function switchMrRank'), '月复盘排行切换函数存在')
  assert.ok(DC_HTML.includes('MR_RANK_MODES'), '月复盘 3 个排行属性定义存在')
  for (const f of ['renderMrProductTable', 'renderMrLinkTable', 'renderMrSkuTable', 'renderMrRankTables']) {
    assert.ok(DC_HTML.includes('function ' + f), `月复盘明细排行函数 ${f} 存在`)
  }
  assert.ok(DC_HTML.includes('mrRankToggle'), '月复盘排行切换按键容器存在')
  assert.ok(DC_HTML.includes('TOP20'), '周/月复盘明细为 TOP20')
  assert.ok(!DC_HTML.includes('明细 TOP30'), '周复盘明细不再为 TOP30')
  // 退款分析·异常商品剔除 + 链接预警分析（点击商品名 → 全新会话 + 自动输入 AI 提示词）
  assert.ok(DC_HTML.includes('function classifyRefundLinks'), '退款分析·异常/正常分流函数存在')
  assert.ok(DC_HTML.includes('function buildLinkWarningPrompt'), '链接预警·分析提示词构建函数存在')
  assert.ok(DC_HTML.includes('function analyzeLinkWarn'), '链接预警·点击触发函数存在')
  assert.ok(DC_HTML.includes('异常产品数据'), '异常产品数据标签存在（退款率>100% 失真数据标记）')
  assert.ok(DC_HTML.includes("ecommerce:analyze-link"), '链接预警向父窗 postMessage 的消息类型存在')
  assert.ok(DC_HTML.includes('电商领域市场分析专家'), '链接预警提示词含「电商领域市场分析专家」分析定位')
})

test('数据中台：统计图数据点点击 → 会话框分析链路存在（30天销售概览 / 7天周复盘 / 30天月复盘）', () => {
  // 图表点击链路：注册表 + 通用点击绑定（getChart 统一绑定）+ 发父窗（dsh 会话框）
  assert.ok(DC_HTML.includes('const chartClickHooks'), '图表点击解析函数注册表 chartClickHooks 存在')
  assert.ok(DC_HTML.includes('function registerChartClick'), '图表点击解析注册函数 registerChartClick 存在')
  assert.ok(DC_HTML.includes('function postChartValue'), '点击后向父窗发送函数 postChartValue 存在')
  assert.ok(DC_HTML.includes("window.parent.postMessage({ type:'ecommerce:analyze-value'"), '点击统计图数据点复用 ecommerce:analyze-value 消息（父页追加会话框）')
  assert.ok(DC_HTML.includes("charts[id].on('click', function(params)"), 'getChart 为每个图表实例统一绑定 click')
  // 30天销售概览三张柱状图（点击柱体 → 店铺/平台/产品对应数值与提示词）
  for (const id of ['salesPie', 'storeSalesChart', 'productSalesChart']) {
    assert.ok(DC_HTML.includes("registerChartClick('" + id + "',"), `销售概览图 ${id} 已注册点击解析`)
  }
  // 7天周复盘图表（周总览柱状 / 链接净销柱状 / 店铺占比饼图 / 转化漏斗 / 货品净销与毛利率 / SKU净销与费用结构饼图）
  for (const id of ['wkOverviewCompare', 'wkLinkBar', 'wkShopPie', 'wkLinkFunnel', 'wkProdBar', 'wkProdMargin', 'wkSkuBar', 'wkSkuFee']) {
    assert.ok(DC_HTML.includes("registerChartClick('" + id + "',"), `周复盘图 ${id} 已注册点击解析`)
  }
  // 30天月复盘图表（店铺净销 / 货品占比饼图 / 毛利推广费 / 费比 / 全店经营指标）
  for (const id of ['mrOverviewBar', 'mrRatingPie', 'mrStoreBar', 'mrFeeBar', 'mrProfitBar']) {
    assert.ok(DC_HTML.includes("registerChartClick('" + id + "',"), `月复盘图 ${id} 已注册点击解析`)
  }
  // 独立打开（非 iframe）时降级为剪贴板复制
  assert.ok(DC_HTML.includes('clipboard.writeText'), '点击图表降级：剪贴板复制提示文本')
})

test('数据中台：数据评价（月/周复盘 AI 四角度评价）渲染与拉取逻辑存在', () => {
  const ids = declaredIds(DC_HTML)
  // 评价条容器：挂在月复盘 + 周复盘四个层级模块顶部，异步拉取后原地更新
  assert.ok(ids.has('dataEvaluationBar'), '数据评价条容器 id="dataEvaluationBar" 存在')
  // 客户端三件套：构造条 / 原地更新 / 异步拉取
  assert.ok(DC_HTML.includes('function evaluationBarHtml'), '评价条构造函数 evaluationBarHtml 存在')
  assert.ok(DC_HTML.includes('function updateEvaluationBar'), '评价条原地更新函数 updateEvaluationBar 存在')
  assert.ok(DC_HTML.includes('function refreshEvaluation'), '评价拉取函数 refreshEvaluation 存在')
  // 月复盘(30d)与周复盘(7d)均接入评价条
  assert.ok(DC_HTML.includes("evaluationBarHtml('30d')"), '月复盘视图接入 30d 数据评价条')
  assert.ok(DC_HTML.includes("evaluationBarHtml('7d')"), '周复盘视图接入 7d 数据评价条')
  // 数据变化后重新拉取（服务端按 revision 缓存，客户端缓存随之失效）
  assert.ok(DC_HTML.includes("refreshEvaluation('30d')"), '数据变化后刷新 30d 评价')
  assert.ok(DC_HTML.includes("refreshEvaluation('7d')"), '数据变化后刷新 7d 评价')
  // 非阻塞：服务端即时返回规则占位 + 后台生成 AI；客户端用 pending 标记判断是否继续轮询升级为 AI
  assert.ok(DC_HTML.includes('pending'), '客户端处理 pending 状态（规则占位 → 轮询升级为 AI）')
  // 拉取的评价接口地址
  assert.ok(DC_HTML.includes('/ecommerce-api/evaluation'), '客户端拉取 /ecommerce-api/evaluation 接口')
})
