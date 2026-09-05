/**
 * compare-test.ts — 数据对比端到端测试（真实 Excel 为上期 + 本地生成副本为当前 → 清理）
 *
 * 场景还原「连续两次导入」：
 *   1. 上期 = 桌面「月度数据」「周度数据」真实 Excel（只读不写，全流程校验 md5 未变）；
 *   2. 本期 = 以真实文件为底、用 mutateMonthly / mutateRankBuffer 本地生成的
 *      「同格式不同内容」副本（周期改早、factor 0.9、名称后缀 -CMP），写入系统临时目录；
 *   3. 两期依次导入同一临时 Store → 断言「导入新周期自动归档真实上期」、
 *      对比引擎产出（matched / delta 方向）、/ecommerce-api/compare 接口、数据中台对比视图渲染；
 *   4. 清理：删除临时目录与全部本地生成副本，确认桌面真实文件前后字节一致（数据来源仍是 Excel）。
 *
 * 运行：node --import tsx scripts/compare-test.ts
 */
import {
  readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, existsSync,
} from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join, basename } from 'node:path'
import { EventEmitter } from 'node:events'
import { parseMonthlyReportExcel } from '../src/monthly-report.ts'
import { parseWeeklyRankExcel } from '../src/weekly-report.ts'
import { registerShopApi } from '../src/shop-api.ts'
import { buildComparePayload } from '../src/compare-payload.ts'
import type { ComparePayload } from '../src/compare-payload.ts'
import type { EcommerceStore } from '../src/store.ts'
import {
  M_DIR, W_DIR, MONTHLY_FILES,
  ok, PASS, FAIL, failures,
  GroupOpts, mutateMonthly, mutateRankBuffer, makeStore, renderPanels,
} from './test-support.ts'

/* ───────────────────────── 模拟「本期」组参数（内容/周期与真实上期不同） ───────────────────────── */
const MONTH_CMP: GroupOpts = {
  period: '2026-06-01~2026-06-30', // 早于真实 7 月
  factor: 0.9,                     // 本期值 ≈ 上期 90% → delta 为负
  suffix: '-CMP',
  shops: ['对比测试旗舰店', '对比测试专营店'],
}
const WEEK_CMP: GroupOpts = {
  period: '2026-08-16~2026-08-22', // 早于真实周（08-23~29）
  factor: 0.9,
  suffix: '-CMP',
  shops: ['对比测试旗舰店', '对比测试专营店'],
}

function md5(buf: Buffer): string {
  return createHash('md5').update(buf).digest('hex')
}

/* ───────────────────────── 接口：mock webServer + fake req/res ───────────────────────── */
function makeHandler(store: EcommerceStore): (req: unknown, res: unknown) => void | Promise<void> {
  let handler: ((req: unknown, res: unknown) => void | Promise<void>) | null = null
  const webServer = {
    port: 0,
    register(r: { handler: (req: unknown, res: unknown) => void | Promise<void> }): () => void {
      handler = r.handler
      return () => {}
    },
    tapIndex(): () => void { return () => {} },
  }
  registerShopApi(webServer as never, store, {})
  if (!handler) throw new Error('未注册 /ecommerce-api handler')
  return handler
}
type FakeReq = EventEmitter & { url: string; method: string; headers: Record<string, string>; destroy: () => void }
async function getJson(
  handler: (req: unknown, res: unknown) => void | Promise<void>,
  url: string,
): Promise<{ status: number; json: Record<string, unknown> | null }> {
  const req = new EventEmitter() as FakeReq
  req.url = url
  req.method = 'GET'
  req.headers = {}
  req.destroy = () => {}
  queueMicrotask(() => req.emit('end'))
  const res = {
    statusCode: 0, headers: {} as Record<string, unknown>, body: '',
    writeHead(status: number, headers?: Record<string, unknown>): void { this.statusCode = status; if (headers) this.headers = headers },
    end(chunk?: unknown): void { this.body = String(chunk ?? '') },
  }
  await handler(req, res)
  let json: Record<string, unknown> | null = null
  try { json = JSON.parse(res.body) as Record<string, unknown> } catch { /* 非 JSON */ }
  return { status: res.statusCode, json }
}

/* ───────────────────────── 主流程 ───────────────────────── */
async function main(): Promise<void> {
  console.log('══════════════════════════════════════════════════════════════')
  console.log('数据对比 e2e：真实 Excel（上期） vs 本地生成副本（本期） → 断言 → 清理')
  console.log('══════════════════════════════════════════════════════════════')

  const monthlyFiles = (['links', 'products', 'skus', 'profit'] as const).map((k) => MONTHLY_FILES[k])
  const weeklyFiles = existsSync(W_DIR) ? readdirSync(W_DIR).filter((n) => n.endsWith('.xlsx')).sort() : []
  if (monthlyFiles.some((f) => !existsSync(f)) || weeklyFiles.length === 0) {
    console.log('⚠ 桌面源文件（月度 4 份 / 周度 ≥1 份）缺失，终止')
    process.exitCode = 1
    return
  }

  // ── 0. 记录桌面真实文件 md5（断言全程未改动） ──
  const realPaths = [...monthlyFiles, ...weeklyFiles.map((f) => join(W_DIR, f))]
  const md5Before = new Map(realPaths.map((p) => [p, md5(readFileSync(p))]))

  // 本地生成副本目录（测试数据，最终删除）
  const tmpDir = join(tmpdir(), 'ecom-cmp-e2e-' + Date.now())
  mkdirSync(tmpDir, { recursive: true })
  const generated: string[] = []
  const generate = (p: string, buf: Buffer): string => { writeFileSync(p, buf); generated.push(p); return p }

  console.log('\n── 1. 上期 = 桌面真实 Excel；本期 = 本地生成副本 ──')
  // 生成本期月度 4 份 + 周度 3 份副本
  // keepIds=true：保留 链接ID/货品编号/商家编码/店铺 身份，仅缩放数值 —— 同一对象两期可比
  const mutMonthlyPaths = (['links', 'products', 'skus', 'profit'] as const).map((k) =>
    generate(join(tmpDir, `CMP月-${k}.xlsx`), mutateMonthly(readFileSync(MONTHLY_FILES[k]), k, MONTH_CMP, true)),
  )
  const mutWeeklyPaths = weeklyFiles.map((f, i) =>
    generate(join(tmpDir, `CMP周-${i + 1}.xlsx`), mutateRankBuffer(readFileSync(join(W_DIR, f)), WEEK_CMP, true)),
  )
  ok(generated.length === 4 + weeklyFiles.length, `生成本期副本 ${generated.length} 份（月 4 + 周 ${weeklyFiles.length}）`)
  ok(generated.every((p) => existsSync(p)), '副本已写入磁盘（临时目录）')

  /* ───────────────────────── 月度：真实(上期) → 副本(本期) ───────────────────────── */
  const mStoreDir = makeStore()
  const mStore = mStoreDir.store
  console.log('\n── 2. 月度对比（真实 7 月为上期 → 副本 6 月为本期）──')
  const realMonthParts: Awaited<ReturnType<typeof parseMonthlyReportExcel>>[] = []
  for (const key of ['links', 'products', 'skus', 'profit'] as const) {
    realMonthParts.push(await parseMonthlyReportExcel(readFileSync(MONTHLY_FILES[key])))
  }
  const realMonthPeriod = realMonthParts.find((p) => p?.kind === 'platformLinks')?.period ?? ''
  ok(realMonthPeriod === '2026-07-01~2026-07-31', `真实月度周期 ${realMonthPeriod}`)
  mStore.importMonthlyReport(realMonthParts as never)
  ok(mStore.getPreviousMonthlyReport() === null, '仅导入真实第一期 → 无上一期（可对比前提未建立）')

  const cmpMonthParts: Awaited<ReturnType<typeof parseMonthlyReportExcel>>[] = []
  for (const p of mutMonthlyPaths) cmpMonthParts.push(await parseMonthlyReportExcel(readFileSync(p)))
  mStore.importMonthlyReport(cmpMonthParts as never)
  const prevM = mStore.getPreviousMonthlyReport()
  const curM = mStore.getMonthlyReport()
  ok(prevM?.period === realMonthPeriod, `导入副本 6 月后自动归档真实 7 月为上期（${prevM?.period}）`)
  ok(curM?.period === MONTH_CMP.period, `当前月报 = 副本 6 月（${curM?.period}）`)
  ok((prevM?.storeProfit ?? []).length > 0 && (curM?.storeProfit ?? []).length > 0, '两期月度均含店铺利润章节')

  const payloadM = buildComparePayload(mStore, '30d')
  ok(payloadM.hasPrev && payloadM.result !== null, '月度对比负载 hasPrev=true 且有 result')
  const rM = payloadM.result!
  const linkAvail = payloadM.kinds.find((k) => k.kind === 'platformLinks')!
  ok(linkAvail.prev >= 2000 && linkAvail.curr >= 2000, `月度·平台链接 上期 ${linkAvail.prev} / 本期 ${linkAvail.curr} 行可对比`)
  ok(rM.summary.matched >= 1500, `月度·链接两期匹配 ${rM.summary.matched} 条（>1500）`)
  ok(rM.summary.currTotal < rM.summary.prevTotal, `月度·销售额整体下降（factor 0.9）：${rM.summary.prevTotal.toFixed(0)} → ${rM.summary.currTotal.toFixed(0)}`)
  ok(rM.summary.delta < 0 && rM.summary.deltaPct !== null && rM.summary.deltaPct < 0, '月度·summary delta/deltaPct 为负')
  ok(rM.rows.length > 0 && rM.rows.every((x) => typeof x.label === 'string' && x.label !== ''), '月度·对比明细含可读名称')
  const absDelta = rM.rows.map((x) => Math.abs(x.delta))
  ok(absDelta.every((v, i) => i === 0 || absDelta[i - 1] >= v), '月度·明细按 |增减| 降序排列')

  /* ───────────────────────── 周度：真实(上期) → 副本(本期) ───────────────────────── */
  const wStoreDir = makeStore()
  const wStore = wStoreDir.store
  console.log('\n── 3. 周度对比（真实周为上期 → 副本周为本期）──')
  const realWeekParts: Awaited<ReturnType<typeof parseWeeklyRankExcel>>[] = []
  for (const f of weeklyFiles) realWeekParts.push(await parseWeeklyRankExcel(readFileSync(join(W_DIR, f))))
  const realWeekPeriod = realWeekParts.find((p) => p?.platformLinks)?.period ?? ''
  ok(realWeekPeriod === '2026-08-23~2026-08-29', `真实周度周期 ${realWeekPeriod}`)
  for (const part of realWeekParts) wStore.mergeWeeklyReport(part as never)
  ok(wStore.getPreviousWeeklyReport() === null, '仅导入真实第一期周复盘 → 无上一期')
  const realWeekLinks = wStore.getWeeklyReport()?.platformLinks?.length ?? 0

  for (const p of mutWeeklyPaths) {
    const part = await parseWeeklyRankExcel(readFileSync(p))
    wStore.mergeWeeklyReport(part as never)
  }
  const prevW = wStore.getPreviousWeeklyReport()
  const curW = wStore.getWeeklyReport()
  ok(prevW?.period === realWeekPeriod, `导入副本周后自动归档真实周为上期（${prevW?.period}）`)
  ok(curW?.period === WEEK_CMP.period, `当前周报 = 副本周（${curW?.period}）`)

  const payloadW = buildComparePayload(wStore, '7d')
  ok(payloadW.hasPrev && payloadW.result !== null, '周度对比负载 hasPrev=true 且有 result')
  const rW = payloadW.result!
  const wLinkAvail = payloadW.kinds.find((k) => k.kind === 'platformLinks')!
  ok(wLinkAvail.prev === realWeekLinks && wLinkAvail.prev >= 1700, `周度·平台链接 上期 ${wLinkAvail.prev} 行（=真实 ${realWeekLinks}）`)
  ok(rW.summary.matched >= 1500, `周度·链接两期匹配 ${rW.summary.matched} 条（>1500）`)
  ok(rW.summary.currTotal < rW.summary.prevTotal, `周度·销售额整体下降（factor 0.9）`)
  ok(!payloadW.kinds.some((k) => k.kind === 'storeProfit'), '周度对比不含店铺利润层（7d 无该层）')
  ok((payloadW.metrics ?? []).length > 0, '周度·指标目录非空')

  /* ───────────────────────── 接口：/ecommerce-api/compare ───────────────────────── */
  console.log('\n── 4. /ecommerce-api/compare 接口 ──')
  const handler = makeHandler(mStore) // 月度 store（两期已导入）
  const monthRes = await getJson(handler, '/ecommerce-api/compare?cycle=30d')
  const mv = monthRes.json?.value as { hasPrev: boolean; prevPeriod: string; result: { summary: { matched: number; currTotal: number; prevTotal: number } } } | undefined
  ok(monthRes.status === 200 && monthRes.json?.ok === true, 'GET /compare?cycle=30d → 200 ok:true')
  ok(mv?.hasPrev === true && mv.prevPeriod === realMonthPeriod, `接口·30d hasPrev=true，上期=${mv?.prevPeriod}`)
  ok(typeof monthRes.json?.revision === 'number' && (monthRes.json?.revision as number) >= 2, `接口·返回 revision（${String(monthRes.json?.revision)}）`)
  ok((mv?.result?.summary.matched ?? 0) >= 1500, '接口·30d result 匹配两期链接（数据来自真实 Excel 的上期）')

  const handlerW = makeHandler(wStore)
  const weekRes = await getJson(handlerW, '/ecommerce-api/compare?cycle=7d&kind=platformLinks&metric=sales&limit=5')
  const wv = weekRes.json?.value as { hasPrev: boolean; prevPeriod: string; result: { rows: unknown[] } | null } | undefined
  ok(weekRes.status === 200 && weekRes.json?.ok === true, 'GET /compare?cycle=7d → 200 ok:true')
  ok(wv?.hasPrev === true && wv.prevPeriod === realWeekPeriod, `接口·7d hasPrev=true，上期=${wv?.prevPeriod}`)
  ok((wv?.result?.rows?.length ?? 0) <= 5, '接口·7d limit=5 生效')

  /* ───────────────────────── 渲染：数据中台「数据对比」视图 ───────────────────────── */
  console.log('\n── 5. 数据中台「数据对比」视图渲染 ──')
  const payloadRender = buildComparePayload(mStore, '30d', 'platformLinks', 'sales', 30)
  const rr = renderPanels(null, null, '30d', ['compare'], payloadRender as ComparePayload)
  ok(!rr.error, '「数据对比」视图渲染无异常' + (rr.error ? '：' + rr.error.message : ''))
  ok((rr.els['compareKpi']?.innerHTML ?? '').includes('up') || (rr.els['compareKpi']?.innerHTML ?? '').length > 100, 'KPI 卡片已渲染（含增减）')
  const cmpRows = (rr.els['compareTbody']?.innerHTML ?? '').match(/<tr>/g) ?? []
  ok(cmpRows.length > 0, `对比明细表渲染 ${cmpRows.length} 行`)
  const barSeries = ((rr.charts['compareBar']?.__option as { series?: unknown[] } | undefined)?.series ?? []).length
  ok(barSeries === 2, `对比条形图为双系列（上期/本期），series=${barSeries}`)
  ok(!(rr.els['compareEmpty']?.innerHTML ?? '').includes('不可比'), '非空态：未显示「不可比」占位')

  /* ───────────────────────── 6. 清理测试数据 ───────────────────────── */
  console.log('\n── 6. 清理：删除本地生成的测试数据 ──')
  rmSync(tmpDir, { recursive: true, force: true })
  ok(!existsSync(tmpDir), '临时目录已移除（本地生成副本全部删除）')
  ok(generated.every((p) => !existsSync(p)), '逐文件确认：副本均已不存在')
  rmSync(mStoreDir.dir, { recursive: true, force: true })
  rmSync(wStoreDir.dir, { recursive: true, force: true })
  ok(!existsSync(mStoreDir.dir) && !existsSync(wStoreDir.dir), '临时 Store 数据目录已移除')
  const changed = realPaths.filter((p) => md5(readFileSync(p)) !== md5Before.get(p))
  ok(changed.length === 0, `桌面真实 Excel 全程未改动（${realPaths.length} 份 md5 一致）——导入数据来源仍是原 Excel`)

  console.log('\n══════════════════════════════════════════════════════════════')
  console.log(`结果：通过 ${PASS} 项断言，失败 ${FAIL} 项`)
  if (failures.length) {
    console.log('\n失败明细：')
    for (const f of failures) console.log('  - ' + f)
    process.exitCode = 1
  } else {
    console.log('全部通过 ✓（测试数据已删除，桌面真实 Excel 未改动）')
  }
}

main().catch((e) => {
  console.error('数据对比 e2e 异常：', e)
  process.exitCode = 1
})
