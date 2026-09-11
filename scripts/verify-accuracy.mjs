/**
 * v0.4.1 精确性验证：真实月度文件 → 生产导入链路（store.importMonthlyReport）
 * 得到的「面板数据」与用 xlsx 独立重算的「源表基线」逐指标对比。
 *
 * mode=dump   逐文件打印识别结果与结构（探查用）
 * mode=verify 对比并输出差异表，任何 FAIL 以退出码 1 结束（CI 可用）
 *
 * usage: node --import tsx scripts/verify-accuracy.mjs [dump|verify] [dirs...]
 */
import { readdirSync, readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as XLSX from 'xlsx'
import { parseImportFile } from '../src/import-parse.ts'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'

const args = process.argv.slice(2)
const mode = args[0] === 'dump' || args[0] === 'verify' ? args.shift() : 'dump'
const roots = args.length > 0 ? args : [
  'C:/Users/31253/Desktop/file for jianheng/月度数据/7月度数据',
  'C:/Users/31253/Desktop/file for jianheng/月度数据/8月度数据',
]

/** 与面板口径无关的独立数值解析：数字原样；"1,234.56" 字符串去逗号；百分比字符串按数值 */
function toNum(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v !== 'string') return null
  const s = v.replace(/[,，%\s]/g, '')
  if (s === '' || s === '-') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}
const TR = (rows) => rows.map((r) => r.map((c) => String(c ?? '').trim()))
const short = (v) => JSON.stringify(v, (k, x) => (Array.isArray(x) && x.length > 3 ? [`…共 ${x.length} 项`, x[0]] : x), 1)

/** 独立基线：利润表（storeProfit）。返回 指标→合计 + 店铺数 */
function baselineStoreProfit(file) {
  const wb = XLSX.read(readFileSync(file), { type: 'buffer' })
  const sheet = wb.SheetNames.find((n) => n.toLowerCase().includes('利润表')) ?? wb.SheetNames[0]
  const rows = TR(XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header: 1, raw: false, defval: '' }))
  let headerIdx = -1
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    if (rows[i].some((c) => c === '核算项目名称')) { headerIdx = i; break }
  }
  if (headerIdx === -1) return null
  const header = rows[headerIdx]
  const storeCols = []
  for (let c = 1; c < header.length; c++) {
    if (header[c] !== '' && header[c] !== '合计') storeCols.push(c)
  }
  const METRICS = {
    '一、销售收入': 'sales',
    '正向销售收入': 'positiveSales',
    '退款': 'refund',
    '四、毛利': 'grossProfit',
    '六、仓库物流费用': 'logisticsCost',
    '七、运营推广费用': 'promoCost',
  }
  const totals = {}
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const label = rows[i][0]
    let key = null
    if (label === '一、销售收入') key = 'sales'
    else if (label.includes('正向销售收入')) key = 'positiveSales'
    else if (label === '退款') key = 'refund'
    else if (label === '四、毛利') key = 'grossProfit'
    else if (label === '六、仓库物流费用') key = 'logisticsCost'
    else if (label === '七、运营推广费用') key = 'promoCost'
    if (key === null) continue
    let sum = 0
    for (const c of storeCols) {
      const n = toNum(rows[i][c])
      if (n !== null) sum += n
    }
    totals[key] = (totals[key] ?? 0) + sum
  }
  return { storeCount: storeCols.length, totals }
}

/** 独立基线：排名表（销售额/销售件数/退款金额/销售成本/毛利额列合计；剔除合计行） */
function baselineRank(file) {
  const wb = XLSX.read(readFileSync(file), { type: 'buffer', cellDates: true })
  const sheet = wb.SheetNames.find((n) => String(n).toLowerCase().includes('商品排名')) ?? wb.SheetNames[0]
  const rows = TR(XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header: 1, raw: false, defval: '' }))
  // 与解析器同款子表头判定：含「销售额」且前导 0/1/2 列为空（主表头前导列非空，不误判）
  const hasSales = (r) => r.some((c) => c === '销售额')
  let subIdx = -1
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? []
    if (!hasSales(r)) continue
    if ([0, 1, 2].every((j) => (r[j] ?? '') === '')) { subIdx = i; break }
  }
  if (subIdx < 1) {
    for (let i = 0; i < rows.length; i++) { if (hasSales(rows[i] ?? [])) { subIdx = i; break } }
  }
  if (subIdx < 1) return null
  const COLS = { 销售额: 'sales', 销售件数: 'salesCount', 退款金额: 'refundAmount', 销售成本: 'salesCost', 毛利额: 'grossProfit' }
  const idx = {}
  for (const [name, k] of Object.entries(COLS)) {
    const i = rows[subIdx].findIndex((c) => c === name)
    if (i >= 0) idx[k] = i
  }
  const totals = {}
  let dataRows = 0
  for (let i = subIdx + 1; i < rows.length; i++) {
    const r = rows[i] ?? []
    const first3 = [r[0] ?? '', r[1] ?? '', r[2] ?? '']
    if (first3.some((c) => c === '合计' || c === '总计')) continue
    const hasVal = Object.values(idx).some((c) => c !== undefined && toNum(r[c]) !== null)
    if (!hasVal) continue
    dataRows += 1
    for (const [k, c] of Object.entries(idx)) {
      const n = toNum(r[c])
      if (n !== null) totals[k] = (totals[k] ?? 0) + n
    }
  }
  return { dataRows, totals }
}

/** 解析侧聚合（来自面板真实数据源 MonthlyReport 的对应章节数组） */
function parsedTotals(rows, keys) {
  const t = {}
  for (const r of rows) for (const k of keys) t[k] = (t[k] ?? 0) + (typeof r[k] === 'number' ? r[k] : 0)
  return t
}

/** 容差：绝对 1 分（0.01）或相对 1e-9 取大——真·逐分对齐 */
const close = (a, b) => Math.abs(a - b) <= Math.max(0.011, Math.abs(b) * 1e-9)

let failures = 0
for (const root of roots) {
  console.log('\n########', root)
  const files = readdirSync(root).filter((f) => /\.(xlsx|xls)$/i.test(f))
  // —— 生产链路：逐文件 parseImportFile → store.importMonthlyReport → getMonthlyReport ——
  const dir = mkdtempSync(join(tmpdir(), 'ecom-verify-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'), seedOnEmpty: true, lowStockThreshold: 10,
  })
  await store.init()
  const parts = []
  for (const f of files) {
    const p = await parseImportFile(f, readFileSync(join(root, f)).toString('base64'), 'base64')
    if (p.monthlyPart) parts.push(p.monthlyPart)
  }
  store.importMonthlyReport(parts)
  const report = store.getMonthlyReport()
  if (report === null) { console.log('  ✗ 面板数据为空（月度章节未形成）'); failures += 1; continue }
  console.log(`  面板周期: ${report.period} | 店铺数: ${report.shops.length}`)
  for (const k of ['storeProfit', 'systemSkus', 'systemProducts', 'platformLinks']) {
    console.log(`  · ${k}: ${report[k] ? report[k].length + ' 行' : '—'}`)
  }
  if (mode !== 'verify') { console.log(short(report).slice(0, 1500)); rmSync(dir, { recursive: true, force: true }); continue }

  // —— 基线对比：逐文件 ——
  for (const f of files) {
    const full = join(root, f)
    const bp = baselineStoreProfit(full)
    if (bp && report.storeProfit) {
      const pt = parsedTotals(report.storeProfit, Object.keys(bp.totals))
      console.log(`  [storeProfit] ${f}  店铺数 解析=${report.storeProfit.length} 全量=${bp.storeCount}` +
        (report.storeProfit.length === bp.storeCount ? ' ✓' : ` （解析器剔除 ${bp.storeCount - report.storeProfit.length} 家未在销店铺）`))
      for (const [k, want] of Object.entries(bp.totals)) {
        const got = pt[k] ?? 0
        const ok = close(got, want)
        if (!ok) failures += 1
        console.log(`      ${k.padEnd(14)} 解析=${got.toFixed(2).padStart(14)} 基线=${want.toFixed(2).padStart(14)} Δ=${(got - want).toFixed(6).padStart(10)} ${ok ? '✓' : '✗'}`)
      }
      continue
    }
    const br = baselineRank(full)
    if (br) {
      const kind = br === null ? null : (f.includes('规格') ? 'systemSkus' : f.includes('链接') ? 'platformLinks' : 'systemProducts')
      const rows = report[kind]
      if (!rows || rows.length === 0) { console.log(`  ✗ ${f} 基线可读但报告缺章节 ${kind}`); failures += 1; continue }
      const keys = Object.keys(br.totals)
      const pt = parsedTotals(rows, keys)
      // 行数差异 = 解析器有意剔除「无身份幽灵行/无身份空行」的信息项，不判失败；
      // 真正要盯的是数值：幽灵行的指标必须被兜底计入，否则就是丢数。
      console.log(`  [${kind}] ${f}  行数 解析=${rows.length} 全量=${br.dataRows}` +
        (rows.length === br.dataRows ? ' ✓' : ` （解析器剔除 ${br.dataRows - rows.length} 行无身份行）`))
      for (const [k, want] of Object.entries(br.totals)) {
        const got = pt[k] ?? 0
        const ok = close(got, want)
        if (!ok) failures += 1
        console.log(`      ${k.padEnd(14)} 解析=${got.toFixed(2).padStart(16)} 基线=${want.toFixed(2).padStart(16)} Δ=${(got - want).toFixed(6).padStart(12)} ${ok ? '✓' : '✗'}`)
      }
    }
  }
  rmSync(dir, { recursive: true, force: true })
}
console.log(failures === 0 ? '\n✅ 全部指标与源表基线逐分一致' : `\n❌ 共 ${failures} 项不一致`)
process.exit(failures === 0 ? 0 : 1)
