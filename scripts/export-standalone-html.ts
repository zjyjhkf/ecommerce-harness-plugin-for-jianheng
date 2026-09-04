/**
 * export-standalone-html.ts — 把 BI 面板前端导出为「离线 HTML」并内联已导入的参考数据。
 *
 * 用途：双击桌面 HTML 即可在浏览器直接查看面板，无需 dsh 后端 / iframe。
 * 做法：用真实解析器解析「月度数据」4 份 +「周度数据」3 份 Excel → 合并成 MonthlyReport / WeeklyReport，
 *       再用规则模板生成 30d/7d 数据评价，最终把数据以 fetch 桩内联注入 data-center.html 副本，
 *       使前端原有的 loadRealData / refreshEvaluation 代码路径照常工作。
 *
 * 运行：node --import tsx scripts/export-standalone-html.ts
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMonthlyReportExcel, mergeMonthly } from '../src/monthly-report.ts'
import { parseWeeklyRankExcel, mergeWeekly } from '../src/weekly-report.ts'
import { buildEvaluationSummary, ruleBasedEvaluation } from '../src/data-evaluation.ts'
import type { MonthlyReport, WeeklyReport } from '../src/types.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SRC_DC = join(ROOT, 'src', 'assets', 'data-center.html')

// 当前实际数据源（已移动到 Desktop\file for jianheng\ 下）
const M_DIR = 'C:/Users/31253/Desktop/file for jianheng/月度数据'
const W_DIR = 'C:/Users/31253/Desktop/file for jianheng/周度数据'
const OUT = 'C:/Users/31253/Desktop/电商数据中台看板_2026-09-02.html'

/** JSON 内联注入安全：转义 `</` 防止提前闭合 script 标签，转义 U+2028/2029 行分隔符 */
function safeJson(v: unknown): string {
  return JSON.stringify(v)
    .replace(/<\//g, '<\\/')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

function count(rows: unknown[] | undefined): number {
  return (rows && rows.length) || 0
}

async function main(): Promise<void> {
  console.log('══════════════════════════════════════════════════════')
  console.log('导出离线 HTML：解析源 Excel → 内联注入 → 生成看板文件')
  console.log('══════════════════════════════════════════════════════')

  // ── 1. 月度：目录内全部 .xlsx → parseMonthlyReportExcel → mergeMonthly ──
  let monthly: MonthlyReport | null = null
  if (existsSync(M_DIR)) {
    const files = readdirSync(M_DIR).filter((n) => n.endsWith('.xlsx')).sort()
    for (const f of files) {
      const part = await parseMonthlyReportExcel(readFileSync(join(M_DIR, f)))
      if (part) monthly = mergeMonthly(monthly, part)
      else console.log('  ⚠ 未识别为月报：' + f)
    }
  } else {
    console.log('  ⚠ 未找到月度数据目录：' + M_DIR)
  }

  // ── 2. 周度：目录内全部 .xlsx → parseWeeklyRankExcel → mergeWeekly ──
  let weekly: WeeklyReport | null = null
  if (existsSync(W_DIR)) {
    const files = readdirSync(W_DIR).filter((n) => n.endsWith('.xlsx')).sort()
    for (const f of files) {
      const part = await parseWeeklyRankExcel(readFileSync(join(W_DIR, f)))
      if (part) weekly = mergeWeekly(weekly, part)
      else console.log('  ⚠ 未识别为周报：' + f)
    }
  } else {
    console.log('  ⚠ 未找到周度数据目录：' + W_DIR)
  }

  if (!monthly && !weekly) {
    console.error('✗ 未能解析出任何月报/周报数据，终止')
    process.exitCode = 1
    return
  }

  console.log('\n── 解析结果 ──')
  console.log(
    '月度：period=' + (monthly?.period || '') + ' month=' + (monthly?.month || '') +
    ' · 链接 ' + count(monthly?.platformLinks) + ' / 货品 ' + count(monthly?.systemProducts) +
    ' / SKU ' + count(monthly?.systemSkus) + ' / 店铺 ' + count(monthly?.storeProfit),
  )
  console.log(
    '周度：period=' + (weekly?.period || '') +
    ' · 链接 ' + count(weekly?.platformLinks) + ' / 货品 ' + count(weekly?.systemProducts) +
    ' / SKU ' + count(weekly?.systemSkus),
  )

  // ── 3. 规则模板评价（离线无 LLM，用规则兜底保证 40~80 字有内容） ──
  const s30 = monthly ? buildEvaluationSummary('30d', monthly, weekly) : null
  const s7 = weekly ? buildEvaluationSummary('7d', monthly, weekly) : null
  const eval30 = s30 ? ruleBasedEvaluation(s30) : ''
  const eval7 = s7 ? ruleBasedEvaluation(s7) : ''
  console.log('评价(30d)：' + (eval30 || '（无）'))
  console.log('评价(7d)：' + (eval7 || '（无）'))

  // ── 4. 生成注入脚本（fetch 桩 + API_BASE 置为离线标记） ──
  const embedMonthly = monthly ? safeJson(monthly) : 'null'
  const embedWeekly = weekly ? safeJson(weekly) : 'null'
  const evalJson = (text: string) => (text ? safeJson({ evaluation: text, source: 'rule', pending: false }) : 'null')

  const bootstrap =
    '\n<script>\n' +
    '/* ===== 离线数据注入：保留已导入的月度 + 周度参考数据（无后端亦可查看） ===== */\n' +
    'API_BASE = "__EMBEDDED__";\n' +
    'var __EMBED__ = {\n' +
    '  monthly: ' + embedMonthly + ',\n' +
    '  weekly: ' + embedWeekly + ',\n' +
    '  eval30: ' + evalJson(eval30) + ',\n' +
    '  eval7: ' + evalJson(eval7) + '\n' +
    '};\n' +
    'var __origFetch = window.fetch;\n' +
    'window.fetch = function(url, opts) {\n' +
    '  var u = String(url);\n' +
    '  var okJson = function(v) { return { ok: true, json: function() { return Promise.resolve({ ok: true, value: v, revision: 1 }); } }; };\n' +
    '  if (u.indexOf("/ecommerce-api/monthly-report") !== -1) return Promise.resolve(okJson(__EMBED__.monthly));\n' +
    '  if (u.indexOf("/ecommerce-api/weekly-report") !== -1) return Promise.resolve(okJson(__EMBED__.weekly));\n' +
    '  if (u.indexOf("/ecommerce-api/evaluation") !== -1) {\n' +
    '    var v = (u.indexOf("cycle=7d") !== -1) ? __EMBED__.eval7 : __EMBED__.eval30;\n' +
    '    return Promise.resolve(okJson(v));\n' +
    '  }\n' +
    '  return __origFetch ? __origFetch.apply(window, arguments) : Promise.reject(new Error("offline"));\n' +
    '};\n' +
    '</script>\n'

  // ── 5. 读源 HTML，注入，写出 ──
  // 注意：data-center.html 内联的 ECharts 压缩代码里也含字符串 "</body>"（第 55 行），
  // 因此必须注入到【最后一个】 </body>（真正的闭合标签）之前，否则会破坏 echarts 脚本。
  const html = readFileSync(SRC_DC, 'utf8')
  const bodyIdx = html.lastIndexOf('</body>')
  if (bodyIdx < 0) {
    throw new Error('data-center.html 缺少 </body>，注入失败')
  }
  const injected = html.slice(0, bodyIdx) + bootstrap + html.slice(bodyIdx)
  writeFileSync(OUT, injected, 'utf8')

  console.log('\n── 输出 ──')
  console.log('已生成：' + OUT)
  console.log('HTML 大小：' + injected.length + ' 字节（源 ' + html.length + ' + 注入数据 ' + (injected.length - html.length) + '）')
  console.log('完成 ✓ 双击该 HTML 即可在浏览器查看（默认 30 天月报，可切「周复盘」查看 7 天数据）')
}

main().catch((e) => {
  console.error('导出失败：', e)
  process.exitCode = 1
})
