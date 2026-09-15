/**
 * 定制导出:「电商数据中台」离线单文件 HTML
 *  - 数据源:Desktop/file for jianheng/月度数据/{7月度数据,8月度数据}(真实经营数据)
 *  - 面板主体 = 8月;数据对比 = 7月 vs 8月
 *  - 仅 30 天周期展示:不注入任何周度数据 + 隐藏前端 7天 切换按钮
 *  - 解析/合并/对比/评价全部走生产代码(parseImportFile → importMonthlyReport → demo-bridge)
 * usage: node --import tsx scripts/export-jul-aug.mjs [输出路径]
 */
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { parseImportFile } from '../src/import-parse.ts'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'

const BASE = 'C:/Users/31253/Desktop/file for jianheng/月度数据'
const JUL = join(BASE, '7月度数据')
const AUG = join(BASE, '8月度数据')
const OUT = process.argv[2] ?? 'C:/Users/31253/Desktop/电商数据中台-8月展示_7月8月对比.html'

for (const d of [JUL, AUG]) {
  if (!existsSync(d)) { console.error('目录不存在:' + d); process.exit(1) }
}

const store = new EcommerceStore(new MockAdapter(), {
  file: join(mkdtempSync(join(tmpdir(), 'ecom-ja-')), 'store.json'),
  seedOnEmpty: true, lowStockThreshold: 10,
})
await store.init()

async function partsOf(dir) {
  const parts = []
  for (const f of readdirSync(dir).filter((x) => /\.xlsx?$/i.test(x))) {
    const p = await parseImportFile(f, readFileSync(join(dir, f)).toString('base64'), 'base64')
    if (p.monthlyPart) parts.push(p.monthlyPart)
    else console.warn('  ! 未识别(跳过):', f, p.hint ?? '')
  }
  if (parts.length === 0) throw new Error('未解析到任何月度文件:' + dir)
  return parts
}

console.log('解析 7月(归档为对比上期)与 8月(面板本期)…')
store.importMonthlyReport(await partsOf(JUL))
store.importMonthlyReport(await partsOf(AUG))

const demoData = {
  monthly: store.getMonthlyReport(),
  prevMonthly: store.getPreviousMonthlyReport(),
  weekly: null,
  prevWeekly: null,
  history: store.getMonthlyHistory(),
}
if (!demoData.monthly || !demoData.prevMonthly) {
  throw new Error('归档异常: monthly=' + demoData.monthly?.period + ' prev=' + demoData.prevMonthly?.period)
}

const res = await build({
  entryPoints: ['scripts/demo-bridge.ts'],
  bundle: true, format: 'iife', globalName: 'DEMOBRIDGE',
  platform: 'browser',
  alias: { 'node:crypto': fileURLToPath(new URL('./crypto-stub.mjs', import.meta.url)) },
  target: 'es2020', minify: true, write: false,
})
const bundleJs = res.outputFiles[0].text

const glue = `(function(){var of=window.fetch?window.fetch.bind(window):null;
window.fetch=function(u,o){var s=typeof u==='string'?u:(u&&u.url)||'';var r=DEMOBRIDGE.handle(s);
if(r!==null&&r!==undefined){try{return Promise.resolve(new Response(r,{status:200,headers:{'content-type':'application/json'}}))}
catch(e){return Promise.resolve({ok:true,status:200,json:function(){return Promise.resolve(JSON.parse(r))}})}}
return of?of(u,o):Promise.reject(new Error('offline'))};})();`

let html = readFileSync('src/assets/data-center.html', 'utf8')
// 仅 30 天:隐藏周期切换按钮(默认即 30d),weekly 数据为空双保险
const style = '<style>#cycleToggle{display:none !important}</style>'
const inject = style + '\n<script>window.__DEMO__=' + JSON.stringify(demoData).replace(/<\//g, '<\\/')
  + '</script>\n<script>' + bundleJs + '</script>\n<script>' + glue + '</script>\n'
if (!html.includes('</head>')) throw new Error('模板缺少 </head>')
html = html.replace('</head>', inject + '</head>')
writeFileSync(OUT, html, 'utf8')

// —— 自测:bridge 响应与需求逐条对齐 ——
const g = { __DEMO__: demoData }
const bridge = new Function('globalThis', 'window', 'URL', 'Response', bundleJs + ';return DEMOBRIDGE')(g, g, URL, undefined)
const JH = (u) => { const r = bridge.handle(u); return r === null ? null : JSON.parse(r) }
let fail = 0
const chk = (name, ok, extra = '') => { if (!ok) fail++; console.log(`  ${ok ? '✓' : '✗'} ${name}${extra ? '  ' + extra : ''}`) }
console.log('自测:')
chk('月报本期=2026-08', JH('/ecommerce-api/monthly-report').value?.period === '2026-08-01~2026-08-31')
const cmp = JH('/ecommerce-api/compare?cycle=30d&limit=120')
chk('对比=7月 vs 8月', cmp.value?.prevPeriod === '2026-07-01~2026-07-31' && cmp.value?.currPeriod === '2026-08-01~2026-08-31', `${cmp.value?.prevPeriod} → ${cmp.value?.currPeriod}`)
chk('周报=空(7天无内容)', JH('/ecommerce-api/weekly-report').value === null)
chk('7天对比=不可用', JH('/ecommerce-api/compare?cycle=7d').value?.result == null)
const sp = demoData.monthly.storeProfit ?? []
console.log(`  · 8月 storeProfit ${sp.length} 店,销售额合计 ¥${sp.reduce((s, x) => s + (Number(x.sales) || 0), 0).toFixed(2)}`)
if (fail > 0) { console.error('EXPORT-JUL-AUG: FAIL'); process.exit(1) }
console.log(`\n✅ ${OUT}(${(Buffer.byteLength(html) / 1048576).toFixed(1)} MB) — 8月主体/7v8对比/仅30天`)
