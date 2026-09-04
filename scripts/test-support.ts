/**
 * 测试共享支撑（simulate-import / e2e-test 复用）
 *
 * 提供「格式相同、内容不同」模拟数据的生成器（改 日期/店铺 元数据 + 名称加后缀 + 数值缩放）、
 * 临时 Store 工厂、data-center 渲染 vm/DOM 桩，以及断言与数值解析工具。
 * 避免 simulate-import 与 e2e-test 重复实现同一套造数/渲染逻辑（检索优化：单一来源）。
 */
import { readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createContext, runInContext } from 'node:vm'
import * as xlsx from 'xlsx'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
export const SRC_DC = resolve(ROOT, 'src', 'assets', 'data-center.html')

export const M_DIR = 'C:/Users/31253/Desktop/file for jianheng/月度数据'
export const W_DIR = 'C:/Users/31253/Desktop/file for jianheng/周度数据'

export const MONTHLY_FILES = {
  links: `${M_DIR}/7月链接销售表新.xlsx`,
  products: `${M_DIR}/7月货品销售表新.xlsx`,
  skus: `${M_DIR}/7月货品规格销售表新.xlsx`,
  profit: `${M_DIR}/7月店铺销售表新.xlsx`,
}

/* ───────────────────────── 断言与输出工具 ───────────────────────── */

export let PASS = 0
export let FAIL = 0
export const failures: string[] = []
export function ok(cond: boolean, msg: string): void {
  if (cond) { PASS++ } else { FAIL++; failures.push(msg) }
  console.log((cond ? '  ✓ ' : '  ✗ ') + msg)
}
export function time(fn: () => void): number {
  const t0 = performance.now()
  fn()
  return performance.now() - t0
}
export async function timeAsync(fn: () => Promise<unknown>): Promise<number> {
  const t0 = performance.now()
  await fn()
  return performance.now() - t0
}
export const round2 = (n: number): number => Math.round(n * 100) / 100

/** 抽取周复盘明细表中「销售额」单元格（紧邻净销 trend-up 单元格前一个 <td>），返回数值序列 */
export function parseMoneyList(html: string): number[] {
  const out: number[] = []
  const re = /<\/td><td>¥([\d.,]+(?:万)?)<\/td><td class="trend-up">/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const s = m[1]
    out.push(s.endsWith('万') ? parseFloat(s.slice(0, -1)) * 10000 : parseFloat(s.replace(/,/g, '')))
  }
  return out
}
/** 校验数值序列为非递增（降序，允许并列） */
export function isDescending(arr: number[]): boolean {
  return arr.every((v, i) => i === 0 || arr[i - 1] >= v)
}

/* ───────────────────────── 模拟数据生成器 ───────────────────────── */

export interface GroupOpts {
  period: string
  factor: number
  suffix: string
  shops: string[]
}

/** 数值单元格按 factor 缩放；字符串（率/金额）保持原有 % 与小数位风格 */
function scaleCell(v: unknown, factor: number): unknown {
  const s = String(v ?? '').trim()
  if (s === '') return v
  const m = s.match(/^(-?\d[\d,]*(?:\.\d+)?)(%)?$/)
  if (!m) return v
  const num = parseFloat(m[1].replace(/,/g, ''))
  const hasDec = m[1].includes('.')
  let val = num * factor
  if (hasDec || m[2]) val = Math.round(val * 100) / 100
  else val = Math.round(val)
  return String(val) + (m[2] ? '%' : '')
}

/** 月度/周度「商品排名导出」xlsx：改 日期/店铺 元数据 + 名称加后缀 + 数值缩放 */
export function mutateRankBuffer(buf: Buffer, g: GroupOpts): Buffer {
  const wb = xlsx.read(buf, { type: 'buffer', cellDates: true })
  const name = wb.SheetNames[0]
  const ws = wb.Sheets[name]
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false }) as unknown[][]
  const subIdx = rows.findIndex((r) => r.some((c) => String(c ?? '').trim() === '销售额'))
  if (subIdx < 1) throw new Error('未找到子表头（销售额）行')
  // 元数据行：只改子表头前的键值行（日期/店铺）；注意分组表头行（subIdx-1，其首列也叫「店铺」）
  // 不能动，否则会覆盖「链接名称」等身份列名。
  for (let i = 0; i < subIdx - 1; i++) {
    const r = rows[i] ?? []
    const k = String(r[0] ?? '').trim()
    if (k === '日期') r[1] = g.period
    else if (k === '店铺') r[1] = g.shops.join(',')
  }
  const head = rows[subIdx - 1] ?? []
  const suffixCols = new Set<number>()
  for (let j = 0; j < head.length; j++) {
    const h = String(head[j] ?? '').trim()
    if (['店铺', '链接名称', '系统货品名称', '系统规格名称'].includes(h)) suffixCols.add(j)
  }
  for (let r = subIdx + 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.every((c) => String(c ?? '').trim() === '')) continue
    for (const j of suffixCols) {
      const v = row[j]
      if (v !== undefined && String(v).trim() !== '') row[j] = String(v) + g.suffix
    }
    for (let j = 0; j < row.length; j++) {
      if (suffixCols.has(j)) continue
      row[j] = scaleCell(row[j], g.factor)
    }
  }
  wb.Sheets[name] = xlsx.utils.aoa_to_sheet(rows)
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

/** 利润表 xlsx：店铺名加后缀 + 全部数值缩放 */
export function mutateProfitBuffer(buf: Buffer, g: GroupOpts): Buffer {
  const wb = xlsx.read(buf, { type: 'buffer', cellDates: true })
  const name = wb.SheetNames.find((n) => String(n).includes('利润表')) ?? wb.SheetNames[0]
  const ws = wb.Sheets[name]
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false }) as unknown[][]
  const headerIdx = rows.findIndex((r) => String(r[0] ?? '').trim() === '核算项目名称')
  if (headerIdx < 0) throw new Error('利润表未找到「核算项目名称」表头')
  const header = rows[headerIdx]
  for (let c = 2; c < header.length; c++) {
    const s = String(header[c] ?? '').trim()
    if (s && s !== '合计') header[c] = s + g.suffix
  }
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row) continue
    for (let c = 1; c < row.length; c++) row[c] = scaleCell(row[c], g.factor)
  }
  wb.Sheets[name] = xlsx.utils.aoa_to_sheet(rows)
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

export function mutateMonthly(buf: Buffer, key: 'links' | 'products' | 'skus' | 'profit', g: GroupOpts): Buffer {
  return key === 'profit' ? mutateProfitBuffer(buf, g) : mutateRankBuffer(buf, g)
}

/* ───────────────────────── 临时 Store ───────────────────────── */

export function makeStore(): { store: EcommerceStore; dir: string } {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-sim-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'), seedOnEmpty: true, lowStockThreshold: 10,
  })
  return { store, dir }
}

/* ───────────────────────── data-center 渲染（vm + DOM 桩） ───────────────────────── */

export class ShimEl {
  innerHTML = ''
  textContent = ''
  value = ''
  title = ''
  options: unknown[] = []
  style: Record<string, string> = {}
  dataset: Record<string, string> = {}
  _listeners: Record<string, Function[]> = {}
  classList = {
    add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false,
  }
  addEventListener(_ev: string, _fn: Function): void {}
  removeEventListener(_ev: string, _fn: Function): void {}
  querySelectorAll(): unknown[] { return [] }
  querySelector(): null { return null }
  getAttribute(): null { return null }
  setAttribute(): void {}
  appendChild(): void {}
  insertAdjacentHTML(): void {}
  remove(): void {}
}

export interface RenderResult {
  els: Record<string, ShimEl>
  timings: Record<string, number>
  error: Error | null
  /** echarts 桩按图表 id 记录的最近一次 setOption 选项 */
  charts: Record<string, { __option: unknown }>
  /** vm 上下文（供后续 runInContext 调用，如下钻周复盘层级） */
  _ctx: object
}

/** 在隔离 vm 上下文中加载 data-center 应用脚本并渲染指定视图 */
export function renderPanels(
  monthlyReport: unknown,
  weeklyReport: unknown,
  cycle: string,
  views: string[],
): RenderResult {
  const html = readFileSync(SRC_DC, 'utf8')
  // 文件含两个 <script>：echarts 库 + 应用脚本；取最后一个（应用脚本）
  const start = html.lastIndexOf('<script>')
  const end = html.indexOf('</script>', start)
  const appScript = html.slice(start + '<script>'.length, end)
  if (!appScript.includes('function renderView')) throw new Error('应用脚本提取失败')

  const els: Record<string, ShimEl> = {}
  const makeEl = (id: string): ShimEl => {
    const el = (els[id] ??= new ShimEl())
    el.__id = String(id)
    return el
  }
  const documentShim = {
    getElementById: (id: string): ShimEl => makeEl(String(id)),
    querySelectorAll: (): unknown[] => [],
    querySelector: (): null => null,
    addEventListener: (): void => {},
    createElement: (): ShimEl => new ShimEl(),
    body: makeEl('__body'),
  }
  const chartsById: Record<string, { __option: unknown }> = {}
  const echartsShim = {
    init: (el: { __id?: string }): { __option: unknown; setOption(o: unknown): void; dispose(): void; resize(): void; clear(): void } => {
      const id = (el && el.__id) || '__chart'
      const chart = {
        __option: null,
        setOption(o: unknown): void { this.__option = o },
        dispose: () => {}, resize: () => {}, clear: () => {},
        // echarts 事件绑定桩：data-center 的 getChart 会调用 .on('click', …)，
        // 缺失会导致 getChart 抛错 → setOption 未执行 → 图表 option 断言落空。
        on: () => {}, off: () => {},
      }
      chartsById[id] = chart
      return chart
    },
    graphic: { LinearGradient: class {} },
  }
  const bridge: Record<string, unknown> = { monthlyReport, weeklyReport, cycle }
  const ctx = createContext({
    document: documentShim,
    window: { parent: {}, addEventListener: () => {}, __ECOM_API_BASE__: '' },
    location: { search: '?d=30', origin: 'http://localhost', href: 'http://localhost/' },
    echarts: echartsShim,
    URLSearchParams, URL,
    console,
    performance: { now: () => Date.now() },
    setTimeout: (fn: Function): number => { try { fn() } catch (e) { console.warn('shim setTimeout', e) }; return 0 },
    setInterval: (): number => 0,
    clearTimeout: (): void => {},
    clearInterval: (): void => {},
    requestAnimationFrame: (): number => 0,
    fetch: async (): Promise<unknown> => ({ ok: false, json: async () => ({}) }),
    __bridge: bridge,
  })
  try {
    runInContext(appScript, ctx)
  } catch (e) {
    return { els, timings: {}, charts: chartsById, error: e instanceof Error ? e : new Error(String(e)), _ctx: ctx }
  }
  // 注入模拟数据（APP_DATA/cycle 为词法 const/let，不能直接写在 ctx 上，需经桥对象在上下文内赋值）
  // refreshMonthLabels() 对应真实 loadRealData 拉取报告后的月份标签刷新（否则 ML_CURR 停留在默认「7月」）
  runInContext('APP_DATA.monthlyReport = __bridge.monthlyReport; APP_DATA.weeklyReport = __bridge.weeklyReport; cycle = __bridge.cycle; weeklyTab = "platformLinks"; refreshMonthLabels();', ctx)
  const timings: Record<string, number> = {}
  let firstError: Error | null = null
  for (const v of views) {
    try {
      timings[v] = time(() => { runInContext(`renderView(${JSON.stringify(v)})`, ctx) })
    } catch (e) {
      firstError = firstError ?? (e instanceof Error ? e : new Error(String(e)))
      timings[v] = -1
    }
  }
  return { els, timings, charts: chartsById, error: firstError, _ctx: ctx }
}
