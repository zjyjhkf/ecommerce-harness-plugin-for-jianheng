/**
 * 周期面板隔离回归测试（无外部依赖，内存构造 xlsx）
 *
 * 核心回归点：
 *   月复盘「商品排名导出」与周复盘「商品排名导出」结构完全相同（均含「销售额」子表头），
 *   唯一可靠判别是日期跨度：周表 7 天、月表整月（≥28 天）。
 *   修复前：月度解析器未加日期跨度守卫，会把 7 天周文件误判为月度，导致
 *   「只插入 7 日周期」时 30 天月复盘面板也出现数据。
 *   修复后：月度解析器对明确 <28 天的跨度返回 null（让渡给周表解析器），
 *   周表解析器对 ≥28 天的跨度返回 null（让渡给月度解析器），两者严格隔离。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EventEmitter } from 'node:events'
import * as XLSX from 'xlsx'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'
import { parseImportFile } from '../src/import-parse.ts'
import { parseMonthlyRankExcel } from '../src/monthly-report.ts'
import { parseWeeklyRankExcel } from '../src/weekly-report.ts'
import { registerShopApi, type WebServerLike } from '../src/shop-api.ts'

/** 构造一份最小「商品排名导出」xlsx（平台货品层级），日期跨度由 period 决定 */
function buildRankXlsx(period: string, showForm = '平台货品'): Buffer {
  const subHeader = [
    '', '', '', '', '',
    '销售额', '销售件数', '销售成本', '毛利额', '毛利率',
    '退款金额', '退款率', '退货比例', '净销售额', '推广投放费用',
    '全链路支付转化率', '真实支付转化率（扣除特殊单）', '浏览量', '访客数', '收藏人数',
    '收藏率', '加购人数', '加购件数', '加购率', '下单人数',
    '下单件数', '下单率', '支付人数', '支付件数', '支付率',
    '搜索引导访客数', '搜索引导支付人数', '搜索引导支付转化率', '平均单价',
  ]
  const mainHeader = ['店铺', '链接名称', '链接ID', '链接编码', '链接标签']
  const dataRow = [
    '测试旗舰店', '测试链接A', 'LINK-A', 'CODE-A', '标签A',
    '1000', '50', '600', '400', '40%',
    '100', '10%', '5%', '900', '200',
    '3%', '2%', '1000', '500', '100',
    '10%', '80', '90', '9%', '60',
    '70', '7%', '50', '55', '5%',
    '300', '40', '13%', '20',
  ]
  const rows = [
    ['日期', period],
    ['展示形式', showForm],
    ['店铺', '测试旗舰店,测试专营店'],
    mainHeader,
    subHeader,
    dataRow,
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '商品排名导出')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

const WEEK_BUF = buildRankXlsx('2026-09-07~2026-09-13') // 7 天
const MONTH_BUF = buildRankXlsx('2026-07-01~2026-07-31') // 31 天

test('周期隔离：7 天「商品排名导出」只被周表解析器认领，月表解析器拒收', async () => {
  const monthly = await parseMonthlyRankExcel(WEEK_BUF)
  assert.equal(monthly, null, '7 天跨度不应被月度解析器解析')

  const weekly = await parseWeeklyRankExcel(WEEK_BUF)
  assert.ok(weekly, '7 天跨度应被周表解析器解析')
  assert.equal(weekly!.kind, 'platformLinks')
  assert.equal(weekly!.period, '2026-09-07~2026-09-13')
  assert.equal(weekly!.platformLinks?.length, 1)
})

test('周期隔离：整月「商品排名导出」只被月表解析器认领，周表解析器拒收', async () => {
  const weekly = await parseWeeklyRankExcel(MONTH_BUF)
  assert.equal(weekly, null, '≥28 天跨度不应被周表解析器解析')

  const monthly = await parseMonthlyRankExcel(MONTH_BUF)
  assert.ok(monthly, '整月跨度应被月度解析器解析')
  assert.equal(monthly!.kind, 'platformLinks')
  assert.equal(monthly!.period, '2026-07-01~2026-07-31')
  assert.equal(monthly!.month, '2026-07')
  assert.equal(monthly!.platformLinks?.length, 1)
})

test('周期隔离：parseImportFile 把 7 天文件路由到 weeklyReport 而非 monthlyPart', async () => {
  const parsed = await parseImportFile('商品排名导出.xlsx', WEEK_BUF.toString('base64'), 'base64')
  assert.ok(parsed.weeklyReport, '7 天文件应产出 weeklyReport')
  assert.equal(parsed.monthlyPart, undefined, '7 天文件不应产出 monthlyPart')
  assert.equal(parsed.monthlyReport, undefined, '7 天文件不应产出 monthlyReport')
})

test('周期隔离：parseImportFile 把整月文件路由到 monthlyPart 而非 weeklyReport', async () => {
  const parsed = await parseImportFile('商品排名导出.xlsx', MONTH_BUF.toString('base64'), 'base64')
  assert.ok(parsed.monthlyPart, '整月文件应产出 monthlyPart')
  assert.equal(parsed.monthlyPart!.kind, 'platformLinks')
  assert.equal(parsed.weeklyReport, undefined, '整月文件不应产出 weeklyReport')
})

function makeTempStore(): { store: EcommerceStore; dir: string } {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-iso-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'), seedOnEmpty: false, lowStockThreshold: 10,
  })
  return { store, dir }
}

/* —— 模拟 webServer.register，驱动真实 /ecommerce-api import-batch handler —— */

type FakeReq = EventEmitter & { url: string; method: string; headers: Record<string, string>; destroy: () => void }
type FakeRes = {
  statusCode: number
  headers: Record<string, unknown>
  body: string
  writeHead(s: number, h?: Record<string, unknown>): void
  end(c?: unknown): void
}

function makeReq(url: string, method: string, body?: unknown): FakeReq {
  const req = new EventEmitter() as FakeReq
  req.url = url
  req.method = method
  req.headers = {}
  req.destroy = () => {}
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

async function call(handler: (req: unknown, res: unknown) => void | Promise<void>, method: string, url: string, body?: unknown): Promise<{ status: number; json: Record<string, unknown> | null }> {
  const req = makeReq(url, method, body)
  const res = makeRes()
  await handler(req, res)
  let json: Record<string, unknown> | null = null
  try { json = JSON.parse(res.body) as Record<string, unknown> } catch { /* 非 JSON */ }
  return { status: res.statusCode, json }
}

test('周期隔离（端到端）：只插入 7 日周文件，30 天月报面板保持为空', async () => {
  const { store, dir } = makeTempStore()
  let handler: ((req: unknown, res: unknown) => void | Promise<void>) | null = null
  const webServer: WebServerLike = {
    port: 0,
    register(r) {
      // 断言放宽为 (req: unknown, res: unknown)：测试桩用 FakeReq/FakeRes 驱动真实 handler
      handler = r.handler as (req: unknown, res: unknown) => void | Promise<void>
      return () => {}
    },
    tapIndex(): () => void { return () => {} },
  }
  const disposer = registerShopApi(webServer, store, {})
  assert.ok(handler, '已注册 /ecommerce-api handler')

  // 只传 7 天周文件（不传任何月度文件）
  const files = [{ filename: '周-商品排名导出.xlsx', content: WEEK_BUF.toString('base64'), encoding: 'base64' }]
  const res = await call(handler!, 'POST', '/ecommerce-api/import-batch', { files })
  assert.equal(res.status, 200, 'import-batch 返回 200')
  assert.equal(res.json?.ok, true, 'import-batch ok:true')
  const value1 = res.json?.value as { weeklyReport?: boolean; monthlyReport?: boolean } | undefined
  assert.equal(value1?.weeklyReport, true, '周报已写入')
  assert.equal(value1?.monthlyReport, false, '只插入 7 日数据时，月报不应存在（隔离）')

  // 数据层双重确认：周报存在、月报为空
  assert.ok(store.getWeeklyReport(), 'store 周报非空')
  assert.equal(store.getMonthlyReport(), null, 'store 月报应为 null（不插入 30 天数据就不显示 30 天面板）')

  disposer()
  rmSync(dir, { recursive: true, force: true })
})

test('周期隔离（端到端）：只插入整月文件，7 天周报面板保持为空', async () => {
  const { store, dir } = makeTempStore()
  let handler: ((req: unknown, res: unknown) => void | Promise<void>) | null = null
  const webServer: WebServerLike = {
    port: 0,
    register(r) {
      // 断言放宽为 (req: unknown, res: unknown)：测试桩用 FakeReq/FakeRes 驱动真实 handler
      handler = r.handler as (req: unknown, res: unknown) => void | Promise<void>
      return () => {}
    },
    tapIndex(): () => void { return () => {} },
  }
  const disposer = registerShopApi(webServer, store, {})
  const files = [{ filename: '月-商品排名导出.xlsx', content: MONTH_BUF.toString('base64'), encoding: 'base64' }]
  const res = await call(handler!, 'POST', '/ecommerce-api/import-batch', { files })
  assert.equal(res.status, 200)
  const value2 = res.json?.value as { weeklyReport?: boolean; monthlyReport?: boolean } | undefined
  assert.equal(value2?.monthlyReport, true, '月报已写入')
  assert.equal(value2?.weeklyReport, false, '只插入整月数据时，周报不应存在（隔离）')

  assert.ok(store.getMonthlyReport(), 'store 月报非空')
  assert.equal(store.getWeeklyReport(), null, 'store 周报应为 null')

  disposer()
  rmSync(dir, { recursive: true, force: true })
})
