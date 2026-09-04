/**
 * 模拟数据导入 + 渲染 + 性能测试
 *
 * 目标：按照真实导入的周/月数据格式，生成「格式相同、文件数量相同、内容完全不同」
 * 的模拟数据组，走插件真实导入管线（parseImportFile → store 合并），并用 vm + DOM 桩
 * 驱动 data-center.html 的真实渲染函数，证明「插入不同数据后面板展示对应内容」，
 * 同时测量 解析/合并/序列化/渲染 各阶段性能。
 *
 * 运行：node --import tsx scripts/simulate-import.ts
 * 依赖：桌面「月度表」「周表2」源文件存在（缺失则自动跳过对应部分）。
 */
import { readFileSync, readdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { runInContext } from 'node:vm'
import { parseImportFile } from '../src/import-parse.ts'
import { parseMonthlyReportExcel } from '../src/monthly-report.ts'
import { parseWeeklyRankExcel } from '../src/weekly-report.ts'
import {
  M_DIR, W_DIR, MONTHLY_FILES,
  ok, PASS, FAIL, failures, time, timeAsync, parseMoneyList, isDescending, round2,
  GroupOpts, mutateRankBuffer, mutateMonthly, makeStore, renderPanels,
} from './test-support.ts'

/* ───────────────────────── 主流程 ───────────────────────── */

async function main(): Promise<void> {
  console.log('══════════════════════════════════════════════════════')
  console.log('模拟数据导入 + 渲染 + 性能测试（同格式/同数量/不同内容）')
  console.log('══════════════════════════════════════════════════════')

  const haveMonthly = Object.values(MONTHLY_FILES).every((f) => existsSync(f))
  const weeklyFiles = existsSync(W_DIR)
    ? readdirSync(W_DIR).filter((n) => n.endsWith('.xlsx')).sort()
    : []
  const haveWeekly = weeklyFiles.length >= 1

  // —— 基线：解析源文件（行数 / 首行数值）——
  interface Baseline {
    counts: Record<string, number>
    firstSales: Record<string, number>
    firstShop: string
  }
  const monthlyBase: Baseline = { counts: {}, firstSales: {}, firstShop: '' }
  const weeklyBase: Baseline = { counts: {}, firstSales: {}, firstShop: '' }
  if (haveMonthly) {
    for (const key of ['links', 'products', 'skus'] as const) {
      const part = await parseMonthlyReportExcel(readFileSync(MONTHLY_FILES[key]))
      if (!part) { console.log(`⚠ ${key} 基线解析失败`); continue }
      const arr = part.platformLinks ?? part.systemProducts ?? part.systemSkus ?? []
      monthlyBase.counts[key] = arr.length
      monthlyBase.firstSales[key] = round2(Number(arr[0]?.sales) || 0)
      if (key === 'links' && arr[0]) monthlyBase.firstShop = String(arr[0].shop ?? '')
    }
    const profit = await parseMonthlyReportExcel(readFileSync(MONTHLY_FILES.profit))
    if (profit?.storeProfit) monthlyBase.counts.profit = profit.storeProfit.length
  }
  if (haveWeekly) {
    for (const f of weeklyFiles) {
      const part = await parseWeeklyRankExcel(readFileSync(join(W_DIR, f)))
      if (!part) continue
      const key = part.kind === 'platformLinks' ? 'links' : part.kind === 'systemProducts' ? 'products' : 'skus'
      const arr = part.platformLinks ?? part.systemProducts ?? part.systemSkus ?? []
      weeklyBase.counts[key] = arr.length
      weeklyBase.firstSales[key] = round2(Number(arr[0]?.sales) || 0)
    }
  }
  console.log('\n基线行数（源文件）：')
  console.log('  月度 links=' + monthlyBase.counts.links + ' products=' + monthlyBase.counts.products +
    ' skus=' + monthlyBase.counts.skus + ' stores=' + monthlyBase.counts.profit)
  console.log('  周度 links=' + weeklyBase.counts.links + ' products=' + weeklyBase.counts.products +
    ' skus=' + weeklyBase.counts.skus)

  const simShops = ['模拟天猫一店', '模拟淘宝二店', '模拟京东三店', '模拟拼多多四店', '模拟抖音五店', '模拟小红书六店', '模拟得物七店', '模拟快手八店', '模拟唯品九店', '模拟微店十店']

  // 各组的渲染内容签名（用于证明「不同数据 → 不同面板内容」）
  const monthlySigs: string[] = []
  const weeklySigs: string[] = []

  // —— 月度模拟组（3 组：不同周期/缩放/后缀/店铺）——
  const monthlyGroups: GroupOpts[] = [
    { period: '2026-04-01~2026-04-30', factor: 0.62, suffix: '-S1', shops: simShops.slice(0, 10) },
    { period: '2026-05-01~2026-05-31', factor: 0.85, suffix: '-S2', shops: simShops.slice(0, 10).map((s) => s + '旗舰') },
    { period: '2026-09-01~2026-09-30', factor: 1.27, suffix: '-S3', shops: simShops.slice(0, 10).map((s) => s + '专卖') },
  ]

  if (haveMonthly) {
    for (let gi = 0; gi < monthlyGroups.length; gi++) {
      const g = monthlyGroups[gi]
      const dirs: string[] = []
      console.log(`\n── 月度模拟组 M${gi + 1}（${g.period} · factor=${g.factor} · 后缀${g.suffix}）──`)
      const { store, dir } = makeStore()
      dirs.push(dir)

      // 生成 + 解析
      const parseTimes: Record<string, number> = {}
      const parts: Awaited<ReturnType<typeof parseImportFile>>[] = []
      for (const key of ['links', 'products', 'skus', 'profit'] as const) {
        const buf = mutateMonthly(readFileSync(MONTHLY_FILES[key]), key, g)
        const b64 = buf.toString('base64')
        parseTimes[key] = await timeAsync(async () => {
          parts.push(await parseImportFile(`${key}.xlsx`, b64, 'base64'))
        })
      }
      const monthlyParts = parts.filter((p) => p.monthlyPart !== undefined).map((p) => p.monthlyPart!)
      const mergeMs = time(() => store.importMonthlyReport(monthlyParts))

      const rep = store.getMonthlyReport()!
      const serMs = time(() => { JSON.stringify(rep) })
      const serBytes = Buffer.byteLength(JSON.stringify(rep))

      // —— 报告内容断言（导入管线）——
      console.log('  [解析+导入管线]')
      ok(rep.period === g.period, `period=${rep.period} 与模拟一致`)
      ok(rep.month === g.period.slice(0, 7), `month=${rep.month} 与模拟一致`)
      ok((rep.platformLinks ?? []).length === monthlyBase.counts.links, `links 行数 ${(rep.platformLinks ?? []).length} = 源 ${monthlyBase.counts.links}`)
      ok((rep.platformLinks ?? []).every((l) => String(l.linkName ?? '').trim() !== ''), '月度·链接无空商品名（幽灵行已剔除）')
      ok((rep.systemProducts ?? []).length === monthlyBase.counts.products, `products 行数 ${(rep.systemProducts ?? []).length} = 源 ${monthlyBase.counts.products}`)
      ok((rep.systemSkus ?? []).length === monthlyBase.counts.skus, `skus 行数 ${(rep.systemSkus ?? []).length} = 源 ${monthlyBase.counts.skus}`)
      ok((rep.storeProfit ?? []).length === monthlyBase.counts.profit, `stores 行数 ${(rep.storeProfit ?? []).length} = 源 ${monthlyBase.counts.profit}`)
      const firstLink = rep.platformLinks?.[0]
      ok(!!firstLink && String(firstLink.linkName).includes(g.suffix), `首条链接名称含后缀「${g.suffix}」：${String(firstLink?.linkName ?? '').slice(0, 20)}`)
      const expSales = round2(monthlyBase.firstSales.links * g.factor)
      ok(round2(Number(firstLink?.sales) || 0) === expSales, `首条链接销售额 ${round2(Number(firstLink?.sales) || 0)} = 源×factor ${expSales}`)
      ok(firstLink!.sales !== monthlyBase.firstSales.links, `销售额与源数据不同（${monthlyBase.firstSales.links} → ${round2(Number(firstLink?.sales) || 0)}）`)
      const allStores = (rep.storeProfit ?? []).map((s) => s.store)
      ok(allStores.length > 0 && allStores.every((s) => s.includes(g.suffix)), `经销店铺全部带后缀（${allStores.length} 店）`)
      const expectShop = (g.shops as string[]).length === 0 ? '' : g.shops[0]
      void expectShop

      // —— 渲染面板断言（真实渲染函数）——
      console.log('  [渲染面板]')
      const r = renderPanels(rep, null, '30d', ['sales', 'product', 'link', 'newproduct', 'promo', 'refund', 'review'])
      ok(!r.error, '渲染 7 个视图无异常' + (r.error ? '：' + r.error.message : ''))
      ok((r.els['salesTbody']?.innerHTML ?? '').includes(g.suffix), '销售概览·数据明细含模拟店铺名')
      ok((r.els['salesProductTbody']?.innerHTML ?? '').includes(g.suffix), '销售概览·商品销售排行含模拟链接名')
      ok((r.els['productDetailTbody']?.innerHTML ?? '').includes(g.suffix), '产品概览·货品明细含模拟货品名')
      ok((r.els['linkTbody']?.innerHTML ?? '').includes(g.suffix), '商品明细·商品排行含模拟链接名')
      const shopCell = new RegExp(g.suffix + '</td><td>¥')
      ok(shopCell.test(r.els['linkTbody']?.innerHTML ?? ''), `商品明细·排行店铺列为模拟店铺名（源店铺${monthlyBase.firstShop}+${g.suffix}）`)
      // 平台销售排行榜 + 产品销售额统计图（销售概览顶图并排）：标题 + 柱状图 + 数据
      ok((r.els['salesPieTitle']?.innerHTML ?? '').includes('平台销售排行榜'), '销售概览顶图标题为「平台销售排行榜」')
      const pieOpt = (r.charts['salesPie']?.__option ?? null) as
        { series?: { type?: string }[]; yAxis?: { data?: unknown[] } } | null
      ok(!!pieOpt && pieOpt.series?.[0]?.type === 'bar' && (pieOpt.yAxis?.data?.length ?? 0) >= 1,
        `平台销售排行榜为柱状图且含 ${pieOpt?.yAxis?.data?.length ?? 0} 个平台`)
      ok((r.els['productSalesChartTitle']?.innerHTML ?? '').includes('产品销售额统计图'), '产品销售额统计图标题存在')
      const prodOpt = (r.charts['productSalesChart']?.__option ?? null) as
        { series?: { type?: string }[]; yAxis?: { data?: unknown[] } } | null
      ok(!!prodOpt && prodOpt.series?.[0]?.type === 'bar' && (prodOpt.yAxis?.data?.length ?? 0) === Math.min(15, monthlyBase.counts.products || 0),
        `产品销售额统计图为柱状图且含 ${prodOpt?.yAxis?.data?.length ?? 0} 个货品（TOP15）`)
      ok((r.els['promoTbody']?.innerHTML ?? '').includes(g.suffix), '推广分析·推广排行含模拟链接名')
      ok((r.els['npTbody']?.innerHTML ?? '').includes(g.suffix), 'SKU规格·明细含模拟规格名')
      ok((r.els['refundProductTbody']?.innerHTML ?? '').includes(g.suffix), '退款分析·退款商品明细（正常商品）含模拟链接名')
      ok((r.els['refundProductThead']?.innerHTML ?? '').includes('出现位置'), '退款分析·退款商品明细含「出现位置」列')
      ok((r.els['refundProductTitle']?.innerHTML ?? '').includes('退款商品明细'), '退款分析·退款商品明细标题存在')
      // 退款分析·失真商品：净销<2000 或 退款率>100% 判为失真数据，单列「失真产品数据」，从有效排行剔除
      ok((r.els['refundAbnormalTitle']?.innerHTML ?? '').includes('失真产品数据'),
        '退款分析·失真产品数据标题存在')
      const abnLive = r.els['refundAbnormalTbody']?.innerHTML ?? ''
      ok(abnLive.includes('净销失真') || abnLive.includes('退款率失真') || abnLive.includes('暂无失真产品数据'), '退款分析·失真商品表含「净销失真/退款率失真」标记或空态')
      ok(!(r.els['refundProductTbody']?.innerHTML ?? '').includes('abn-tag'), '失真商品已从有效退款商品明细中剔除')
      // 链接预警分析：分流函数（净销<2000 或 退款率>100% 判失真）+ 提示词构建函数（电商领域市场分析专家定位 + 真实字段）
      const classify = String(runInContext('classifyRefundLinks([{linkName:"A",netSales:5000,refundRate:150},{linkName:"B",netSales:5000,refundRate:80},{linkName:"C",netSales:5000,refundRate:100}]).abnormal.map(function(l){return l.linkName}).join(",")', r._ctx) ?? '')
      ok(classify === 'A', `classifyRefundLinks 仅退款率>100%（150%）判失真（${classify}）`)
      const prompt = String(runInContext('buildLinkWarningPrompt({linkName:"预警品P",shop:"天猫店",sales:1000,netSales:400,refundAmount:600,refundRate:150,returnRate:30,grossProfit:-50,grossMargin:-10,adSpend:200,avgPrice:88})', r._ctx) ?? '')
      ok(prompt.includes('电商领域市场分析专家') && prompt.includes('预警品P') && prompt.includes('出现位置'), '链接预警提示词含专家定位 + 商品名 + 出现位置')
      ok(prompt.includes('Markdown') && prompt.includes('文本形式'), '链接预警输出为会话内 Markdown 文本形式（不生成文件）')
      // 月度复盘：展板含周期；货品/商品/SKU 三张明细表（排行切换渲染进 tbodies，行数据不再内联于 reviewContent）
      ok((r.els['reviewContent']?.innerHTML ?? '').includes(g.period.slice(0, 7)), '月度复盘·展板含模拟周期')
      ok((r.els['mrProdTbody']?.innerHTML ?? '').includes(g.suffix), '月度复盘·货品明细含模拟货品名')
      ok((r.els['mrLinkTbody']?.innerHTML ?? '').includes(g.suffix), '月度复盘·商品明细含模拟链接名')
      ok((r.els['mrSkuTbody']?.innerHTML ?? '').includes(g.suffix), '月度复盘·SKU明细含模拟规格名')
      // 数据评价：月复盘展板含 AI 数据评价条（初始「生成中」占位，异步拉取后原地更新）
      ok((r.els['reviewContent']?.innerHTML ?? '').includes('dataEvaluationBar'), '月度复盘·数据评价条容器存在')
      ok((r.els['reviewContent']?.innerHTML ?? '').includes('数据评价'), '月度复盘·数据评价条标题存在')
      // 排行切换：货品/商品/SKU 三表共有的 3 个属性（净销/销售额/退款率）+ 按键 + 列头标记 + Top 20
      ok((r.els['reviewContent']?.innerHTML ?? '').includes('mrRankToggle'), '月复盘三张明细表含排行切换按键')
      for (const t of ['mrProd', 'mrLink', 'mrSku']) {
        const rows = (r.els[t + 'Tbody']?.innerHTML ?? '').split('<tr>').length - 1
        ok(rows === 20, `${t} 明细为 Top 20（行数=${rows}）`)
      }
      ok((r.els['mrProdThead']?.innerHTML ?? '').includes('净销 ▼'), '月复盘默认按净销排行且列头标记跟随')
      runInContext('switchMrRank("sales", null)', r._ctx)
      ok((r.els['mrProdThead']?.innerHTML ?? '').includes('销售额 ▼'), '切换「销售额」后货品列头标记跟随')
      const mrProdSales = parseMoneyList(r.els['mrProdTbody']?.innerHTML ?? '')
      ok(mrProdSales.length === 20 && isDescending(mrProdSales),
        `切换「销售额」后货品表按销售额降序（首行 ${mrProdSales[0] ?? 0} / 末行 ${mrProdSales[mrProdSales.length - 1] ?? 0}）`)
      const mrLinkSales = parseMoneyList(r.els['mrLinkTbody']?.innerHTML ?? '')
      ok(mrLinkSales.length === 20 && isDescending(mrLinkSales), `切换「销售额」后商品表按销售额降序（行数=${mrLinkSales.length}）`)
      const mrSkuSales = parseMoneyList(r.els['mrSkuTbody']?.innerHTML ?? '')
      ok(mrSkuSales.length === 20 && isDescending(mrSkuSales), `切换「销售额」后SKU表按销售额降序（行数=${mrSkuSales.length}）`)
      runInContext('switchMrRank("refundRate", null)', r._ctx)
      ok((r.els['mrSkuThead']?.innerHTML ?? '').includes('退款率 ▼'), '切换「退款率」后SKU列头标记跟随')
      // 经营洞察条由销售视图写入「月」标签，其它视图会覆盖为模块说明 → 独立渲染销售视图验证
      const expectMonth = `${Number(g.period.slice(5, 7))}月`
      const rSales = renderPanels(rep, null, '30d', ['sales'])
      ok(!rSales.error && (rSales.els['insightBar']?.innerHTML ?? '').includes(expectMonth), `经营洞察条显示模拟周期月份「${expectMonth}」`)
      monthlySigs.push(
        ((r.els['salesTbody']?.innerHTML ?? '') + '|' + (r.els['linkTbody']?.innerHTML ?? '') + '|' +
         (r.els['npTbody']?.innerHTML ?? '') + '|' + (r.els['overviewBar']?.innerHTML ?? '')).length > 20
          ? ((r.els['salesTbody']?.innerHTML ?? '') + (r.els['linkTbody']?.innerHTML ?? '') + (r.els['npTbody']?.innerHTML ?? '')).slice(0, 4000)
          : '',
      )

      // —— 性能 ——
      const parseSum = Object.values(parseTimes).reduce((s, v) => s + v, 0)
      console.log('  [性能]')
      console.log(`    解析4文件: ${parseSum.toFixed(1)}ms（links ${parseTimes.links.toFixed(1)} / products ${parseTimes.products.toFixed(1)} / skus ${parseTimes.skus.toFixed(1)} / profit ${parseTimes.profit.toFixed(1)}）`)
      console.log(`    合并重建: ${mergeMs.toFixed(2)}ms`)
      console.log(`    序列化月报: ${serMs.toFixed(2)}ms（${(serBytes / 1024).toFixed(0)} KB）`)
      const renderSum = Object.entries(r.timings).reduce((s, [, v]) => s + (v > 0 ? v : 0), 0)
      console.log(`    渲染7视图: ${renderSum.toFixed(1)}ms（` + Object.entries(r.timings).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(' / ') + '）')
      console.log(`    组内合计: ${(parseSum + mergeMs + serMs + renderSum).toFixed(1)}ms`)

      rmSync(dir, { recursive: true, force: true })
    }
  } else {
    console.log('\n⚠ 未找到「月度表」源文件，跳过月度模拟组')
  }

  // —— 周模拟组（3 组）——
  const weeklyGroups: GroupOpts[] = [
    { period: '2026-09-07~2026-09-13', factor: 0.7, suffix: '-W1', shops: simShops.slice(0, 10) },
    { period: '2026-09-14~2026-09-20', factor: 1.1, suffix: '-W2', shops: simShops.slice(0, 10).map((s) => s + '旗舰') },
    { period: '2026-09-21~2026-09-27', factor: 1.4, suffix: '-W3', shops: simShops.slice(0, 10).map((s) => s + '专卖') },
  ]
  if (haveWeekly) {
    // 识别每个周文件对应的层级
    const weeklyKinds: Record<string, string> = {}
    for (const f of weeklyFiles) {
      const part = await parseWeeklyRankExcel(readFileSync(join(W_DIR, f)))
      if (part) weeklyKinds[f] = part.kind
    }
    for (let gi = 0; gi < weeklyGroups.length; gi++) {
      const g = weeklyGroups[gi]
      console.log(`\n── 周模拟组 W${gi + 1}（${g.period} · factor=${g.factor} · 后缀${g.suffix}）──`)
      const { store, dir } = makeStore()
      const parseTimes: Record<string, number> = {}
      let mergeMs = 0
      for (const f of weeklyFiles) {
        const key = weeklyKinds[f] as string
        const buf = mutateRankBuffer(readFileSync(join(W_DIR, f)), g)
        const b64 = buf.toString('base64')
        let parsed: Awaited<ReturnType<typeof parseImportFile>>
        parseTimes[key] = await timeAsync(async () => { parsed = await parseImportFile(f, b64, 'base64') })
        parsed = parsed!
        if (parsed.weeklyReport) mergeMs += time(() => store.mergeWeeklyReport(parsed.weeklyReport!))
      }

      const rep = store.getWeeklyReport()!
      const serMs = time(() => { JSON.stringify(rep) })
      const serBytes = Buffer.byteLength(JSON.stringify(rep))

      console.log('  [解析+导入管线]')
      ok(rep.period === g.period, `period=${rep.period} 与模拟一致`)
      ok((rep.platformLinks ?? []).length === weeklyBase.counts.links, `links 行数 ${(rep.platformLinks ?? []).length} = 源 ${weeklyBase.counts.links}`)
      ok((rep.platformLinks ?? []).every((l) => String(l.linkName ?? '').trim() !== ''), '周度·链接无空商品名（幽灵行已剔除）')
      ok((rep.systemProducts ?? []).length === weeklyBase.counts.products, `products 行数 ${(rep.systemProducts ?? []).length} = 源 ${weeklyBase.counts.products}`)
      ok((rep.systemSkus ?? []).length === weeklyBase.counts.skus, `skus 行数 ${(rep.systemSkus ?? []).length} = 源 ${weeklyBase.counts.skus}`)
      const firstLink = rep.platformLinks?.[0]
      ok(!!firstLink && String(firstLink.linkName).includes(g.suffix), `首条链接名称含后缀「${g.suffix}」`)
      const expSales = round2(weeklyBase.firstSales.links * g.factor)
      ok(round2(Number(firstLink?.sales) || 0) === expSales, `首条链接销售额 ${round2(Number(firstLink?.sales) || 0)} = 源×factor ${expSales}`)
      ok(firstLink!.sales !== weeklyBase.firstSales.links, `销售额与源数据不同`)

      console.log('  [渲染面板]（7天周期 → 周复盘展板，含逐层级下钻）')
      const r = renderPanels(null, rep, '7d', ['sales', 'review'])
      ok(!r.error, '渲染无异常' + (r.error ? '：' + r.error.message : ''))
      ok((r.els['wkLinkTbody']?.innerHTML ?? '').includes(g.suffix), '周复盘·平台货品明细含模拟链接名')
      ok((r.els['reviewContent']?.innerHTML ?? '').includes(g.period), '周复盘展板含模拟周期')
      // 逐层级下钻：系统货品 / 系统规格 需 switchWeeklyTab 切换后渲染
      // 排行切换：三个层级共有的 3 个属性（净销/销售额/退款率）+ Top 20 + 列头标记 + 排序生效
      ok((r.els['reviewContent']?.innerHTML ?? '').includes('wkRankToggle'), '周复盘各层级含排行切换按键')
      const linkRowCount = (r.els['wkLinkTbody']?.innerHTML ?? '').split('<tr>').length - 1
      ok(linkRowCount === 20, `链接级明细为 Top 20（行数=${linkRowCount}）`)
      // 链接级（当前层级=platformLinks）：切「销售额」/「退款率」后列头标记跟随（switchWeeklyRank 作用于当前层级）
      runInContext('switchWeeklyRank("sales", null)', r._ctx)
      ok((r.els['wkLinkThead']?.innerHTML ?? '').includes('销售额 ▼'), '切换「销售额」后链接级列头标记跟随')
      runInContext('switchWeeklyRank("refundRate", null)', r._ctx)
      ok((r.els['wkLinkThead']?.innerHTML ?? '').includes('退款率 ▼'), '切换「退款率」后链接级列头标记跟随')
      // 货品级：切「销售额」后表格按销售额降序
      runInContext('switchWeeklyTab("systemProducts", null)', r._ctx)
      ok((r.els['wkProdTbody']?.innerHTML ?? '').includes(g.suffix), '周复盘·系统货品明细含模拟货品名')
      runInContext('switchWeeklyRank("sales", null)', r._ctx)
      const prodSales = parseMoneyList(r.els['wkProdTbody']?.innerHTML ?? '')
      ok(prodSales.length === 20 && isDescending(prodSales),
        `切换「销售额」后货品级表格按销售额降序（首行 ${prodSales[0] ?? 0} / 末行 ${prodSales[prodSales.length - 1] ?? 0}）`)
      runInContext('switchWeeklyTab("systemSkus", null)', r._ctx)
      ok((r.els['wkSkuTbody']?.innerHTML ?? '').includes(g.suffix), '周复盘·系统规格明细含模拟规格名')
      runInContext('switchWeeklyRank("sales", null)', r._ctx)
      const skuSales = parseMoneyList(r.els['wkSkuTbody']?.innerHTML ?? '')
      ok(skuSales.length === 20 && isDescending(skuSales), `切换「销售额」后SKU级表格按销售额降序（行数=${skuSales.length}）`)
      runInContext('switchWeeklyTab("overview", null)', r._ctx)
      ok((r.els['reviewContent']?.innerHTML ?? '').includes(g.period), '周复盘·周总览含模拟周期')
      // 数据评价：周复盘各层级（含周总览）展板含 AI 数据评价条
      ok((r.els['reviewContent']?.innerHTML ?? '').includes('dataEvaluationBar'), '周复盘·数据评价条容器存在')
      ok((r.els['reviewContent']?.innerHTML ?? '').includes('数据评价'), '周复盘·数据评价条标题存在')
      const sig = (r.els['wkLinkTbody']?.innerHTML ?? '') + (r.els['wkProdTbody']?.innerHTML ?? '') +
        (r.els['wkSkuTbody']?.innerHTML ?? '') + (r.els['reviewContent']?.innerHTML ?? '')
      weeklySigs.push(sig.length > 100 ? sig.slice(0, 4000) : '')

      const parseSum = Object.values(parseTimes).reduce((s, v) => s + v, 0)
      console.log('  [性能]')
      console.log(`    解析3文件: ${parseSum.toFixed(1)}ms（links ${(parseTimes['platformLinks'] ?? 0).toFixed(1)} / products ${(parseTimes['systemProducts'] ?? 0).toFixed(1)} / skus ${(parseTimes['systemSkus'] ?? 0).toFixed(1)}）`)
      console.log(`    合并3章节: ${mergeMs.toFixed(2)}ms`)
      console.log(`    序列化周报: ${serMs.toFixed(2)}ms（${(serBytes / 1024).toFixed(0)} KB）`)
      const renderSum = Object.entries(r.timings).reduce((s, [, v]) => s + (v > 0 ? v : 0), 0)
      console.log(`    渲染视图: ${renderSum.toFixed(1)}ms（` + Object.entries(r.timings).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(' / ') + '）')

      rmSync(dir, { recursive: true, force: true })
    }
  } else {
    console.log('\n⚠ 未找到「周表2」源文件，跳过周模拟组')
  }

  // —— 跨组内容唯一性：不同模拟数据组必须渲染出不同的面板内容 ——
  const allMonthlySame = monthlySigs.length > 1 && new Set(monthlySigs).size === 1
  const allWeeklySame = weeklySigs.length > 1 && new Set(weeklySigs).size === 1
  ok(monthlySigs.length === 0 || (!allMonthlySame && monthlySigs.every((s) => s.length > 0)),
    `月度 3 组面板内容各不相同（签名指纹：${monthlySigs.map((s) => s.slice(0, 32) + '…').join(' / ')}）`)
  ok(weeklySigs.length === 0 || (!allWeeklySame && weeklySigs.every((s) => s.length > 0)),
    `周度 3 组面板内容各不相同（签名指纹：${weeklySigs.map((s) => s.slice(0, 32) + '…').join(' / ')}）`)

  console.log('\n══════════════════════════════════════════════════════')
  console.log(`结果：通过 ${PASS} 项断言，失败 ${FAIL} 项`)
  if (failures.length) {
    console.log('\n失败明细：')
    for (const f of failures) console.log('  - ' + f)
    process.exitCode = 1
  } else {
    console.log('全部通过 ✓')
  }
}

main().catch((e) => {
  console.error('模拟测试异常：', e)
  process.exitCode = 1
})
