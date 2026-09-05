/**
 * gen-demo-data.ts — 基于桌面真实 Excel 生成「真机演示」测试数据（多组，写入桌面）
 *
 * 目的：给「数据对比 / 数据中台」做真机演示——需要同一口径连续导入两期。
 * 用户只有 7 月（月度）与一周（周度）真实文件，本脚本据此派生「多组、周期不同、
 * 内容不同但身份可比」的模拟文件，保证：
 *   - 身份可比：保留 链接ID/货品编号/商家编码/店铺名/商品名 不变（两期能对齐成同一对象）；
 *   - 内容不同：数值按「基准因子 × 逐行扰动」缩放、周期改成相邻月份/周，
 *     % 类比率列不变（分子分母同缩 → 口径自洽），由此两期会出现涨跌、排名位移；
 *   - 演示安全：只在桌面新建「演示数据对比」目录，不写不改动原始「月度数据/周度数据」。
 *
 * 用法：node --import tsx scripts/gen-demo-data.ts
 * 产物：C:/Users/31253/Desktop/file for jianheng/演示数据对比/{月度对比,周度对比}/…
 * 演示：任取同一口径相邻两组先后导入 → 进数据中台「数据对比」查看。
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as xlsx from 'xlsx'
import { M_DIR, W_DIR, MONTHLY_FILES } from './test-support.ts'

const OUT_ROOT = 'C:/Users/31253/Desktop/file for jianheng/演示数据对比'

/** 可复现伪随机：mulberry32（同一周期 → 同一结果） */
function rng(seedStr: string): () => number {
  let a = 0
  for (let i = 0; i < seedStr.length; i++) a = (a * 31 + seedStr.charCodeAt(i)) >>> 0
  return mulberry32(a)
}
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ───────── 组参数：周期依次相邻、基准因子渐进，便于按顺序导入演示 ───────── */
const MONTH_GROUPS = [
  { period: '2026-04-01~2026-04-30', base: 0.80, seed: 'demo-m4' },
  { period: '2026-05-01~2026-05-31', base: 0.92, seed: 'demo-m5' },
  { period: '2026-06-01~2026-06-30', base: 1.03, seed: 'demo-m6' },
]
const WEEK_GROUPS = [
  { period: '2026-08-02~2026-08-08', base: 0.85, seed: 'demo-w32' },
  { period: '2026-08-09~2026-08-15', base: 0.95, seed: 'demo-w33' },
  { period: '2026-08-16~2026-08-22', base: 1.02, seed: 'demo-w34' },
]

const MONTH_KIND_FILES: Array<{ kind: string; src: string; name: string }> = [
  { kind: 'links', src: MONTHLY_FILES.links, name: '模拟-链接销售表.xlsx' },
  { kind: 'products', src: MONTHLY_FILES.products, name: '模拟-货品销售表.xlsx' },
  { kind: 'skus', src: MONTHLY_FILES.skus, name: '模拟-货品规格销售表.xlsx' },
  { kind: 'profit', src: MONTHLY_FILES.profit, name: '模拟-店铺销售表.xlsx' },
]

/* ───────── 数值单元格：money/number 按 factor 缩放；% 保持（分子分母同缩 → 自洽） ───────── */
function rowFactor(base: number, rnd: () => number): number {
  return +(base * (0.88 + 0.24 * rnd())).toFixed(4)
}
function scaleDemoCell(v: unknown, f: number): unknown {
  const s = String(v ?? '').trim()
  if (s === '') return v
  const m = s.match(/^(-?\d[\d,]*(?:\.\d+)?)(%)?$/)
  if (!m) return v
  if (m[2]) return v // 比率列不动
  const hasDec = m[1].includes('.')
  const num = parseFloat(m[1].replace(/,/g, ''))
  let val = num * f
  val = hasDec ? Math.round(val * 100) / 100 : Math.round(val)
  return String(val)
}

/** 商品排名导出 xlsx：只改 日期 元数据 + 逐行扰动数值（身份列/比率列保留） */
function genRankBuf(buf: Buffer, period: string, base: number, rnd: () => number): Buffer {
  const wb = xlsx.read(buf, { type: 'buffer', cellDates: true })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false }) as unknown[][]
  const subIdx = rows.findIndex((r) => r.some((c) => String(c ?? '').trim() === '销售额'))
  if (subIdx < 1) throw new Error('未找到子表头（销售额）行')
  for (let i = 0; i < subIdx - 1; i++) {
    const r = rows[i] ?? []
    const k = String(r[0] ?? '').trim()
    if (k === '日期') r[1] = period
  }
  const head = rows[subIdx - 1] ?? []
  const idCols = new Set<number>()
  for (let j = 0; j < head.length; j++) {
    const h = String(head[j] ?? '').trim()
    if (/链接ID|链接编码|商家编码|货品编号|编码|编号/.test(h)) idCols.add(j)
  }
  for (let r = subIdx + 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.every((c) => String(c ?? '').trim() === '')) continue
    const f = rowFactor(base, rnd)
    for (let j = 0; j < row.length; j++) {
      if (idCols.has(j)) continue
      row[j] = scaleDemoCell(row[j], f)
    }
  }
  wb.Sheets[wb.SheetNames[0]] = xlsx.utils.aoa_to_sheet(rows)
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

/** 利润表 xlsx：每店（列）独立扰动数值，店铺名/项目名保留 */
function genProfitBuf(buf: Buffer, period: string, base: number, rnd: () => number): Buffer {
  const wb = xlsx.read(buf, { type: 'buffer', cellDates: true })
  const name = wb.SheetNames.find((n) => String(n).includes('利润表')) ?? wb.SheetNames[0]
  const ws = wb.Sheets[name]
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false }) as unknown[][]
  const headerIdx = rows.findIndex((r) => String(r[0] ?? '').trim() === '核算项目名称')
  if (headerIdx < 0) throw new Error('利润表未找到「核算项目名称」表头')
  // 周期写入元数据行（利润表同样有 日期/店铺 键值行）
  for (let i = 0; i < headerIdx; i++) {
    const k = String(rows[i]?.[0] ?? '').trim()
    if (k === '日期') rows[i][1] = period
  }
  for (let c = 2; c < (rows[headerIdx] ?? []).length; c++) {
    const f = rowFactor(base, rnd)
    for (let r = headerIdx + 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row) continue
      row[c] = scaleDemoCell(row[c], f)
    }
  }
  wb.Sheets[name] = xlsx.utils.aoa_to_sheet(rows)
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

function safeName(s: string): string {
  return s.replace(/[\\/:*?"<>|~]/g, '-').replace(/\s+/g, '')
}

function writeTree(base: string): void {
  mkdirSync(base, { recursive: true })
  if (!existsSync(base)) throw new Error('无法创建输出目录：' + base)
}

async function main(): Promise<void> {
  console.log('════════════════════════════════════════════════════════════════')
  console.log('演示数据生成：真实 Excel → 多组模拟周期 → 桌面「演示数据对比」')
  console.log('════════════════════════════════════════════════════════════════')

  const haveMonthly = Object.values(MONTHLY_FILES).every((f) => existsSync(f))
  const weeklySrc = existsSync(W_DIR) ? readdirSync(W_DIR).filter((n) => n.endsWith('.xlsx')).sort() : []
  if (!haveMonthly && weeklySrc.length === 0) {
    console.log('⚠ 桌面源文件缺失，终止'); process.exitCode = 1; return
  }
  writeTree(OUT_ROOT)

  /* ───────── 月度：3 组（每组 4 份） ───────── */
  const monthOut = join(OUT_ROOT, '月度对比')
  writeTree(monthOut)
  const written: string[] = []
  if (haveMonthly) {
    console.log('\n── 月度：基于真实 7 月文件生成 3 组模拟月 ──')
    for (const [gi, g] of MONTH_GROUPS.entries()) {
      const rnd = rng(g.seed)
      const dir = join(monthOut, `第${gi + 1}组-${g.period.slice(0, 7)}`)
      writeTree(dir)
      for (const { kind, src, name } of MONTH_KIND_FILES) {
        const out = join(dir, name)
        const buf = kind === 'profit'
          ? genProfitBuf(readFileSync(src), g.period, g.base, rnd)
          : genRankBuf(readFileSync(src), g.period, g.base, rnd)
        writeFileSync(out, buf); written.push(out)
      }
      console.log(`  ✓ 月度组 ${gi + 1}（${g.period}）已生成 → ${dir}`)
    }
  }

  /* ───────── 周度：3 组（每组 3 份，按展示形式配对源文件） ───────── */
  const weekOut = join(OUT_ROOT, '周度对比')
  writeTree(weekOut)
  if (weeklySrc.length > 0) {
    // 用解析器识别每份真实周文件属于哪个层级（平台货品/系统货品/系统规格）
    const { parseWeeklyRankExcel } = await import('../src/weekly-report.ts')
    const kindOf: Array<{ kind: string; label: string; src: string }> = []
    for (const f of weeklySrc) {
      const p = await parseWeeklyRankExcel(readFileSync(join(W_DIR, f)))
      if (p?.platformLinks) kindOf.push({ kind: 'platformLinks', label: '平台货品链接', src: join(W_DIR, f) })
      else if (p?.systemProducts) kindOf.push({ kind: 'systemProducts', label: '系统货品', src: join(W_DIR, f) })
      else if (p?.systemSkus) kindOf.push({ kind: 'systemSkus', label: '系统规格', src: join(W_DIR, f) })
    }
    if (kindOf.length < 3) {
      console.log('⚠ 真实周度文件不足 3 类（平台货品/系统货品/系统规格），仅生成已有类')
    }
    console.log('\n── 周度：基于真实周文件生成 3 组模拟周 ──')
    const wkNames: Record<string, string> = { platformLinks: '模拟-平台货品链接.xlsx', systemProducts: '模拟-系统货品.xlsx', systemSkus: '模拟-系统规格.xlsx' }
    for (const [gi, g] of WEEK_GROUPS.entries()) {
      const rnd = rng(g.seed)
      const dir = join(weekOut, `第${gi + 1}组-${safeName(g.period.slice(5, 10))}`)
      writeTree(dir)
      for (const k of kindOf) {
        const out = join(dir, wkNames[k.kind] ?? `模拟-${k.kind}.xlsx`)
        const buf = genRankBuf(readFileSync(k.src), g.period, g.base, rnd)
        writeFileSync(out, buf); written.push(out)
      }
      console.log(`  ✓ 周度组 ${gi + 1}（${g.period}）已生成 → ${dir}`)
    }
  }

  /* ───────── 顶层说明 ───────── */
  const readme = [
    '# 数据对比 · 真机演示数据',
    '',
    '来源：桌面「月度数据」（7月真实 4 份）与「周度数据」（一周真实 3 份）。',
    '本目录文件为「同格式、周期不同、内容不同」的模拟数据（身份列保留 → 两期可比）。',
    '',
    '## 演示步骤（真机）',
    '',
    '1. 店铺工作台/导入入口，先导入【月度对比·第 1 组】，再导入【第 2 组】（同口径、相邻周期）；',
    '2. 打开数据中台 → 侧边栏「数据对比」：切换 层级/指标，看 上期→本期 KPI、条形图、排行表与名次位移；',
    '3. 也可直接问模型（ecommerce_compare）或 GET /ecommerce-api/compare?cycle=30d。',
    '',
    '说明：导入第 1 组时对比页为「暂无上一期」引导——需连续导入第 2 组后才出现对比结果。',
    '周度同理：依次导入【周度对比】第 1、2 组（cycle=7d）。',
    '',
    '> 本目录可随时删除，不影响原始「月度数据」「周度数据」。',
    '',
  ].join('\n')
  writeFileSync(join(OUT_ROOT, '说明.txt'), readme, 'utf8')

  console.log('\n════════════════════════════════════════════════════════════════')
  console.log(`结果：生成 ${written.length} 个演示文件`)
  console.log('输出目录：' + OUT_ROOT)
}

main().catch((e) => { console.error('演示数据生成异常：', e); process.exitCode = 1 })
