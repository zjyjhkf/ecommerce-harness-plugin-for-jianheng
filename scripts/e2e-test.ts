/**
 * e2e-test.ts — 端到端测试（创建物理测试文件 + 功能测试 + 接口测试 + 清理）
 *
 * 对应「对整个插件进行全面的检索优化」后的验收：
 *   1. 创建测试文件：生成与源周数据(3份)/月度数据(4份)「格式相同、内容不同」的物理 .xlsx；
 *   2. 功能测试：对文件走真实解析/合并/渲染管线，多方位断言；
 *   3. 接口测试：mock webServer.register，直接驱动 /ecommerce-api 前缀 handler 验证各接口；
 *   4. 验证运行状态：插入内容不同文件后，解析→导入→渲染→接口全部跑通；
 *   5. 清理：删除创建的物理测试文件，并确认目录已移除。
 *
 * 运行：node --import tsx scripts/e2e-test.ts
 * 依赖：桌面「月度数据」「周度数据」源文件存在（缺失则自动跳过对应部分）。
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, basename } from 'node:path'
import { EventEmitter } from 'node:events'
import { parseMonthlyReportExcel } from '../src/monthly-report.ts'
import { parseWeeklyRankExcel } from '../src/weekly-report.ts'
import { registerShopApi } from '../src/shop-api.ts'
import {
  M_DIR, W_DIR, MONTHLY_FILES,
  ok, PASS, FAIL, failures,
  GroupOpts, mutateMonthly, mutateRankBuffer, makeStore, renderPanels,
} from './test-support.ts'

/* ───────────────────────── 模拟组参数（内容与原文件不同） ───────────────────────── */

const MONTH_G: GroupOpts = {
  period: '2026-03-01~2026-03-31',
  factor: 0.73,
  suffix: '-E2EM',
  shops: ['E2E测试旗舰店', 'E2E测试专营店'],
}
const WEEK_G: GroupOpts = {
  period: '2026-09-07~2026-09-13',
  factor: 1.18,
  suffix: '-E2EW',
  shops: ['E2E测试旗舰店', 'E2E测试专营店'],
}

/* ───────────────────────── 接口测试：mock webServer + fake req/res ───────────────────────── */

function makeMockWebServer(): {
  webServer: { port: number; register(r: unknown): () => void; tapIndex?(f: unknown): () => void }
  getHandler: () => ((req: unknown, res: unknown) => void | Promise<void>) | null
} {
  let handler: ((req: unknown, res: unknown) => void | Promise<void>) | null = null
  const webServer = {
    port: 0,
    register(r: { handler: (req: unknown, res: unknown) => void | Promise<void> }): () => void {
      handler = r.handler
      return () => {}
    },
    tapIndex(): () => void { return () => {} },
  }
  return { webServer, getHandler: () => handler }
}

type FakeReq = EventEmitter & { url: string; method: string; headers: Record<string, string>; destroy: () => void }
type FakeRes = {
  statusCode: number
  headers: Record<string, unknown>
  body: string
  writeHead(status: number, headers?: Record<string, unknown>): void
  end(chunk?: unknown): void
}

function makeReq(url: string, method: string, body?: unknown): FakeReq {
  const req = new EventEmitter() as FakeReq
  req.url = url
  req.method = method
  req.headers = {}
  req.destroy = () => {}
  // 异步派发 body，确保 handler 已挂好 readJsonBody 的 data/end 监听
  queueMicrotask(() => {
    if (method === 'POST') req.emit('data', Buffer.from(body === undefined ? '' : JSON.stringify(body)))
    req.emit('end')
  })
  return req
}

function makeRes(): FakeRes {
  const res = {
    statusCode: 0,
    headers: {} as Record<string, unknown>,
    body: '',
    writeHead(status: number, headers?: Record<string, unknown>): void {
      this.statusCode = status
      if (headers) this.headers = headers
    },
    end(chunk?: unknown): void {
      this.body = String(chunk ?? '')
    },
  } as FakeRes
  return res
}

async function call(
  handler: (req: unknown, res: unknown) => void | Promise<void>,
  method: string,
  url: string,
  body?: unknown,
): Promise<{ status: number; json: Record<string, unknown> | null; text: string; headers: Record<string, unknown> }> {
  const req = makeReq(url, method, body)
  const res = makeRes()
  await handler(req, res)
  let json: Record<string, unknown> | null = null
  try { json = JSON.parse(res.body) as Record<string, unknown> } catch { /* 非 JSON（如 HTML） */ }
  return { status: res.statusCode, json, text: res.body, headers: res.headers }
}

/* ───────────────────────── 主流程 ───────────────────────── */

async function main(): Promise<void> {
  console.log('══════════════════════════════════════════════════════')
  console.log('端到端测试：物理测试文件 + 功能测试 + 接口测试 + 清理')
  console.log('══════════════════════════════════════════════════════')

  const haveMonthly = Object.values(MONTHLY_FILES).every((f) => existsSync(f))
  const weeklyFiles = existsSync(W_DIR)
    ? readdirSync(W_DIR).filter((n) => n.endsWith('.xlsx')).sort()
    : []
  const haveWeekly = weeklyFiles.length >= 1
  if (!haveMonthly && !haveWeekly) {
    console.log('⚠ 未找到源文件（月度/周度均缺失），终止')
    process.exitCode = 1
    return
  }

  // ── 1. 创建物理测试文件（格式相同、内容不同） ──
  const tmpDir = join(tmpdir(), 'ecom-e2e-' + Date.now())
  mkdirSync(tmpDir, { recursive: true })
  const created: string[] = []
  const monthlyPaths: Array<{ key: string; path: string }> = []
  const weeklyPaths: string[] = []

  if (haveMonthly) {
    for (const key of ['links', 'products', 'skus', 'profit'] as const) {
      const buf = mutateMonthly(readFileSync(MONTHLY_FILES[key]), key, MONTH_G)
      const path = join(tmpDir, `E2E月-${key}.xlsx`)
      writeFileSync(path, buf)
      created.push(path)
      monthlyPaths.push({ key, path })
    }
  }
  if (haveWeekly) {
    for (const [i, f] of weeklyFiles.entries()) {
      const buf = mutateRankBuffer(readFileSync(join(W_DIR, f)), WEEK_G)
      const path = join(tmpDir, `E2E周-${i + 1}-${f}`)
      writeFileSync(path, buf)
      created.push(path)
      weeklyPaths.push(path)
    }
  }
  const expectCount = (haveMonthly ? 4 : 0) + (haveWeekly ? weeklyFiles.length : 0)
  console.log(`\n── 1. 创建物理测试文件（月度 ${monthlyPaths.length} / 周度 ${weeklyPaths.length}）──`)
  ok(created.length === expectCount, `物理测试文件数量 ${created.length} = 源文件数量 ${expectCount}`)
  ok(created.every((p) => existsSync(p)), '全部物理测试文件已写入磁盘')

  // ── 2. 功能测试：解析 + 合并 + 渲染 ──
  console.log('\n── 2. 功能测试（解析→合并→渲染管线）──')
  if (haveMonthly) {
    const { store, dir } = makeStore()
    const parts = []
    for (const { key, path } of monthlyPaths) {
      const part = await parseMonthlyReportExcel(readFileSync(path))
      ok(!!part, `月度物理文件 ${key} 可解析为月度结构`)
      if (part) {
        const arr = part.platformLinks ?? part.systemProducts ?? part.systemSkus ?? part.storeProfit ?? []
        ok(arr.length > 0, `月度 ${key} 解析出 ${arr.length} 行`)
        parts.push(part)
      }
    }
    store.importMonthlyReport(parts)
    const rep = store.getMonthlyReport()
    ok(!!rep, '月度报告已合并（4 份文件聚合）')
    ok(rep?.period === MONTH_G.period, `月度报告周期 ${rep?.period} = 模拟 ${MONTH_G.period}`)
    ok((rep?.platformLinks ?? []).every((l) => String(l.linkName ?? '').trim() !== ''), '月度·链接无空商品名（幽灵行已剔除）')
    ok((rep?.platformLinks ?? []).some((l) => String(l.linkName ?? '').includes(MONTH_G.suffix)), '月度·内容含模拟后缀（与源不同）')
    const r = renderPanels(rep, null, '30d', ['sales', 'product', 'link', 'newproduct', 'promo', 'refund', 'review'])
    ok(!r.error, '月度渲染 7 个视图无异常' + (r.error ? '：' + r.error.message : ''))
    ok((r.els['linkTbody']?.innerHTML ?? '').includes(MONTH_G.suffix), '月度·商品明细渲染出模拟链接名')
    ok((r.els['reviewContent']?.innerHTML ?? '').includes('dataEvaluationBar'), '月度·复盘含数据评价条')
    rmSync(dir, { recursive: true, force: true })
  }

  if (haveWeekly) {
    const { store, dir } = makeStore()
    for (const path of weeklyPaths) {
      const part = await parseWeeklyRankExcel(readFileSync(path))
      ok(!!part, `周度物理文件 ${basename(path)} 可解析为周排名结构`)
      if (part) store.mergeWeeklyReport(part)
    }
    const rep = store.getWeeklyReport()
    ok(!!rep, '周度报告已合并（3 份文件聚合）')
    ok(rep?.period === WEEK_G.period, `周度报告周期 ${rep?.period} = 模拟 ${WEEK_G.period}`)
    ok((rep?.platformLinks ?? []).every((l) => String(l.linkName ?? '').trim() !== ''), '周度·链接无空商品名（幽灵行已剔除）')
    ok((rep?.platformLinks ?? []).some((l) => String(l.linkName ?? '').includes(WEEK_G.suffix)), '周度·内容含模拟后缀（与源不同）')
    const r = renderPanels(null, rep, '7d', ['sales', 'review'])
    ok(!r.error, '周度渲染无异常' + (r.error ? '：' + r.error.message : ''))
    ok((r.els['wkLinkTbody']?.innerHTML ?? '').includes(WEEK_G.suffix), '周度·平台货品明细渲染出模拟链接名')
    ok((r.els['reviewContent']?.innerHTML ?? '').includes('dataEvaluationBar'), '周度·复盘含数据评价条')
    rmSync(dir, { recursive: true, force: true })
  }

  // ── 3. 接口测试：mock webServer.register 驱动真实 handler ──
  console.log('\n── 3. 接口测试（/ecommerce-api 前缀 handler）──')
  const { store, dir } = makeStore()
  const { webServer, getHandler } = makeMockWebServer()
  const disposer = registerShopApi(webServer, store, {}) // ctx 无 LLM → 评价回退规则模板
  ok(typeof disposer === 'function', 'registerShopApi 返回 disposer')
  const handler = getHandler()
  ok(!!handler, '已注册 /ecommerce-api 前缀 handler')

  const files = [
    ...monthlyPaths.map(({ path }) => ({ filename: basename(path), content: readFileSync(path).toString('base64'), encoding: 'base64' })),
    ...weeklyPaths.map((p) => ({ filename: basename(p), content: readFileSync(p).toString('base64'), encoding: 'base64' })),
  ]

  // 批量导入（30 天周期 4 份 + 7 天周期 3 份，同一请求）
  let res = await call(handler!, 'POST', '/ecommerce-api/import-batch', { files })
  ok(res.status === 200 && res.json?.ok === true, 'POST /import-batch 返回 200 ok:true')
  ok(res.json?.value?.monthlyReport === true, '批量导入后 monthlyReport=true')
  ok(res.json?.value?.weeklyReport === true, '批量导入后 weeklyReport=true')
  ok(res.json?.value?.files === files.length, `批量导入收到 ${res.json?.value?.files} 个文件`)

  // 单文件导入（兼容旧入口）
  res = await call(handler!, 'POST', '/ecommerce-api/import', { filename: basename(monthlyPaths[0]?.path ?? weeklyPaths[0] ?? 'x'), content: readFileSync((monthlyPaths[0] ?? { path: weeklyPaths[0] }).path).toString('base64'), encoding: 'base64' })
  ok(res.status === 200 && res.json?.ok === true, 'POST /import（单文件）返回 200 ok:true')

  // 月报 / 周报查询
  res = await call(handler!, 'GET', '/ecommerce-api/monthly-report')
  ok(res.status === 200 && res.json?.ok === true && res.json?.value?.period === MONTH_G.period,
    'GET /monthly-report 返回模拟月度周期 ' + MONTH_G.period)
  res = await call(handler!, 'GET', '/ecommerce-api/weekly-report')
  ok(res.status === 200 && res.json?.ok === true && res.json?.value?.period === WEEK_G.period,
    'GET /weekly-report 返回模拟周度周期 ' + WEEK_G.period)

  // 数据评价（非阻塞：ctx 无 LLM → 规则模板，40~80 字）
  for (const cycle of ['30d', '7d'] as const) {
    res = await call(handler!, 'GET', `/ecommerce-api/evaluation?cycle=${cycle}`)
    const v = res.json?.value as Record<string, unknown> | undefined
    ok(res.status === 200 && res.json?.ok === true && typeof v?.evaluation === 'string' && (v.evaluation as string).length >= 20,
      `GET /evaluation?cycle=${cycle} 返回非空评价（${(v?.evaluation as string)?.length ?? 0} 字）`)
    ok(['ai', 'rule'].includes(String(v?.source)), `GET /evaluation?cycle=${cycle} source 合法（${String(v?.source)}）`)
    ok(typeof v?.pending === 'boolean', `GET /evaluation?cycle=${cycle} pending 为布尔值`)
  }

  // 快照 / 行动清单 / 简报 / 趋势 / 商品列表
  res = await call(handler!, 'GET', '/ecommerce-api/snapshot')
  ok(res.status === 200 && res.json?.ok === true && !!res.json?.value?.overview, 'GET /snapshot 返回 overview')
  res = await call(handler!, 'GET', '/ecommerce-api/actions')
  ok(res.status === 200 && res.json?.ok === true && !!res.json?.value?.dock, 'GET /actions 返回 dock 行动清单')
  res = await call(handler!, 'GET', '/ecommerce-api/brief')
  ok(res.status === 200 && res.json?.ok === true && typeof res.json?.value?.markdown === 'string', 'GET /brief 返回 markdown 简报')
  res = await call(handler!, 'GET', '/ecommerce-api/trend?days=30')
  ok(res.status === 200 && res.json?.ok === true && Array.isArray(res.json?.value?.points), 'GET /trend 返回趋势点数组')
  res = await call(handler!, 'GET', '/ecommerce-api/products')
  ok(res.status === 200 && res.json?.ok === true && !!res.json?.value, 'GET /products 返回商品列表')

  // 页面模板（HTML）
  res = await call(handler!, 'GET', '/ecommerce-api/data-center')
  ok(res.status === 200 && res.headers['content-type'] === 'text/html; charset=utf-8' && res.text.includes('function renderView'),
    'GET /data-center 返回数据中台 HTML 页面（含应用脚本）')

  // 未知路径 → 404
  res = await call(handler!, 'GET', '/ecommerce-api/does-not-exist')
  ok(res.status === 404 && res.json?.ok === false, '未知 /ecommerce-api 路径返回 404 ok:false')

  // ── 4. 验证运行状态：接口与渲染在插入不同内容文件后依然跑通 ──
  console.log('\n── 4. 验证运行状态（插入不同内容文件后插件仍跑通）──')
  const afterMonthly = store.getMonthlyReport()
  const afterWeekly = store.getWeeklyReport()
  ok(afterMonthly?.period === MONTH_G.period && afterWeekly?.period === WEEK_G.period,
    '导入不同内容文件后，月报/周报周期与模拟一致（数据层跑通）')
  const rCheck = renderPanels(afterMonthly, afterWeekly, '30d', ['review'])
  ok(!rCheck.error, '导入后仍可渲染复盘视图（渲染层跑通）')
  disposer()
  rmSync(dir, { recursive: true, force: true })

  // ── 5. 清理：删除创建的物理测试文件 ──
  console.log('\n── 5. 清理测试文件 ──')
  rmSync(tmpDir, { recursive: true, force: true })
  ok(!existsSync(tmpDir), '已删除全部创建的物理测试文件（临时目录已移除）')
  ok(created.every((p) => !existsSync(p)), '逐文件确认：测试文件均已不存在')

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
  console.error('端到端测试异常：', e)
  process.exitCode = 1
})
