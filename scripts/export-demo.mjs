/**
 * v0.4.1 一键导出「电商数据中台」离线演示版（单文件 HTML，示例数据内嵌）。
 *
 * 数据全部来自 演示数据对比/ 的**模拟表**（绝不取真实经营数据），
 * 生成路径与线上完全一致：parseImportFile → store.importMonthlyReport/mergeWeeklyReport，
 * 因此面板每个模块（月度/周度复盘、数据对比、数据评价、退款明细等）都有可交互示例数据；
 * 层级/指标/周期切换由 demo-bridge 实时计算，行为与服务器面板一致。
 *
 * usage: node --import tsx scripts/export-demo.mjs [输出路径]
 */
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'esbuild'
import { parseImportFile } from '../src/import-parse.ts'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'

const BASE = 'C:/Users/31253/Desktop/file for jianheng/演示数据对比'
const MONTHLY_DIRS = [join(BASE, '月度对比', '第1组-2026-04'), join(BASE, '月度对比', '第2组-2026-05')]
const WEEKLY_DIRS = [join(BASE, '周度对比', '第1组-08-02'), join(BASE, '周度对比', '第2组-08-09'), join(BASE, '周度对比', '第3组-08-16')]
const OUT = process.argv[2] ?? 'C:/Users/31253/Desktop/电商数据中台-演示版.html'

const dir = mkdtempSync(join(tmpdir(), 'ecom-demo-'))
const store = new EcommerceStore(new MockAdapter(), {
  file: join(dir, 'store.json'), seedOnEmpty: true, lowStockThreshold: 10,
})
await store.init()

async function collectMonthly(dirPath) {
  const parts = []
  for (const f of readdirSync(dirPath).filter((x) => /\.xlsx?$/i.test(x))) {
    const p = await parseImportFile(f, readFileSync(join(dirPath, f)).toString('base64'), 'base64')
    if (p.monthlyPart) parts.push(p.monthlyPart)
    else console.warn('  ! 未识别月度文件（跳过）：', f, p.hint ?? '')
  }
  return parts
}
async function collectWeekly(dirPath) {
  const parts = []
  for (const f of readdirSync(dirPath).filter((x) => /\.xlsx?$/i.test(x))) {
    const p = await parseImportFile(f, readFileSync(join(dirPath, f)).toString('base64'), 'base64')
    if (p.weeklyReport) parts.push(p.weeklyReport)
    else console.warn('  ! 未识别周度文件（跳过）：', f, p.hint ?? '')
  }
  return parts
}

console.log('构建示例数据（模拟表 → 生产解析链路）…')
store.importMonthlyReport(await collectMonthly(MONTHLY_DIRS[0]))
store.importMonthlyReport(await collectMonthly(MONTHLY_DIRS[1])) // 自动归档上一期，数据对比可演示
for (const w of await collectWeekly(WEEKLY_DIRS[0])) store.mergeWeeklyReport(w)
for (const w of await collectWeekly(WEEKLY_DIRS[1])) store.mergeWeeklyReport(w)
for (const w of await collectWeekly(WEEKLY_DIRS[2])) store.mergeWeeklyReport(w) // 最新一期为本期

const demoData = {
  monthly: store.getMonthlyReport(),
  prevMonthly: store.getPreviousMonthlyReport(),
  weekly: store.getWeeklyReport(),
  prevWeekly: store.getPreviousWeeklyReport(),
}
if (demoData.monthly === null || demoData.weekly === null) {
  throw new Error('示例数据构建失败：monthly/weekly 报表为空，请检查模拟表格式')
}
console.log('  月度本期:', demoData.monthly.period, '| 上期:', demoData.prevMonthly?.period ?? '—',
  '| 周度本期:', demoData.weekly.period, '| 上期:', demoData.prevWeekly?.period ?? '—')

// —— bridge bundle（iife，纯逻辑，无 DOM 依赖，可在 node 自测） ——
import { fileURLToPath } from 'node:url'
const res = await build({
  entryPoints: ['scripts/demo-bridge.ts'],
  bundle: true, format: 'iife', globalName: 'DEMOBRIDGE',
  platform: 'browser',
  alias: { 'node:crypto': fileURLToPath(new URL('./crypto-stub.mjs', import.meta.url)) },
  target: 'es2020', minify: true, write: false,
})
const bundleJs = res.outputFiles[0].text

// —— fetch 拦截 glue（file:// 无后端时兜底，不阻断页面其余逻辑） ——
const glue = `(function(){var of=window.fetch?window.fetch.bind(window):null;
window.fetch=function(u,o){var s=typeof u==='string'?u:(u&&u.url)||'';var r=DEMOBRIDGE.handle(s);
if(r!==null&&r!==undefined){try{return Promise.resolve(new Response(r,{status:200,headers:{'content-type':'application/json'}}))}
catch(e){return Promise.resolve({ok:true,status:200,json:function(){return Promise.resolve(JSON.parse(r))}})}}
return of?of(u,o):Promise.reject(new Error('offline demo'))};})();`

let html = readFileSync('src/assets/data-center.html', 'utf8')
const inject = '<script>window.__DEMO__=' + JSON.stringify(demoData) + '</script>\n'
  + '<script>' + bundleJs + '</script>\n'
  + '<script>' + glue + '</script>\n'
if (!html.includes('</head>')) throw new Error('模板缺少 </head>')
html = html.replace('</head>', inject + '</head>')
writeFileSync(OUT, html, 'utf8')

// —— node 侧自测：直接调用 bundle 的 handle，断言 4 类端点 + 参数组合 ——
const g = { __DEMO__: demoData, Response: undefined, URL }
const fn = new Function('globalThis', 'window', 'URL', 'Response', bundleJs + ';return DEMOBRIDGE')
const bridge = fn(g, g, URL, undefined)
const cases = [
  ['/ecommerce-api/monthly-report', 'ok+period'],
  ['/ecommerce-api/weekly-report', 'ok+period'],
  ['/ecommerce-api/compare?cycle=30d&limit=120', 'kinds'],
  ['/ecommerce-api/compare?cycle=30d&kind=platformLinks&metric=refundAmount&limit=120', 'result'],
  ['/ecommerce-api/compare?cycle=7d&limit=120', 'kinds'],
  ['/ecommerce-api/evaluation?cycle=30d', 'evaluation'],
  ['/ecommerce-api/evaluation?cycle=7d', 'evaluation'],
]
let bad = 0
for (const [url, field] of cases) {
  const raw = bridge.handle(url)
  const j = raw === null ? null : JSON.parse(raw)
  const okv = j?.ok === true && JSON.stringify(j?.value ?? {}) !== '{}'
  const has = okv && (String(j.value[field]) !== 'undefined' || field === 'ok+period' || JSON.stringify(j.value).includes(field))
  if (!has) { bad += 1; console.error('  ✗', url, '→', String(raw).slice(0, 120)) }
  else console.log('  ✓', url)
}
const sizeMb = (Buffer.byteLength(html, 'utf8') / 1048576).toFixed(1)
if (bad > 0) throw new Error(`自测失败 ${bad} 项`)
console.log(`\n✅ 演示版已导出：${OUT}（${sizeMb} MB，含月/周复盘+数据对比+评价全部示例数据）`)
