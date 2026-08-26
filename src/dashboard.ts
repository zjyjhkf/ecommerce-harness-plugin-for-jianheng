/**
 * ecommerce-analyst-plugin — 独立仪表盘 HTML 模板页（对齐视频 commerce-cockpit templates）
 *
 * 服务端渲染 /ecommerce-api/dashboard：指标卡片 + 30 天销售趋势（内联 SVG 折线）+
 * 类目占比（内联 SVG 环形图）+ TOP 商品表格 + 低库存清单。
 * 全部内联（样式/SVG/极小 JS），零外部依赖，无 CDN/字体/图表库。
 * 数据全部来自 Store 既有统计逻辑，与工具/侧边栏口径一致。
 */
import type { EcommerceStore } from './store.ts'
import { todayStr } from './store.ts'
import type { CategoryStat, TrendPoint } from './types.ts'

const MONEY = (v: number): string => '¥' + v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** HTML 转义（商品名/买家名等用户数据注入页面必须转义） */
function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 类目配色（6 大分类 + 回退色） */
const PALETTE = ['#4f7cff', '#22b573', '#f5a623', '#e5484d', '#8e5cf7', '#12a5b0', '#94a3b8']

/**
 * 30 天销售趋势 → SVG 折线（补零缺失日期，保证横轴连续）
 * 返回 { svg, points, max }
 */
function buildTrendSvg(trend: TrendPoint[]): { svg: string; max: number; days: number } {
  const W = 620
  const H = 190
  const PAD_L = 46
  const PAD_R = 12
  const PAD_T = 14
  const PAD_B = 26
  const now = new Date()
  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    days.push(d.toISOString().slice(0, 10))
  }
  const byDate = new Map(trend.map((t) => [t.date.slice(0, 10), t.revenue]))
  const values = days.map((d) => byDate.get(d) ?? 0)
  const max = Math.max(...values, 1)
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const x = (i: number): number => PAD_L + (i / (days.length - 1)) * innerW
  const y = (v: number): number => PAD_T + innerH - (v / max) * innerH
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${PAD_L},${PAD_T + innerH} ${pts} ${x(days.length - 1).toFixed(1)},${PAD_T + innerH}`
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const gy = PAD_T + innerH - f * innerH
    return `<line x1="${PAD_L}" y1="${gy.toFixed(1)}" x2="${W - PAD_R}" y2="${gy.toFixed(1)}" stroke="rgba(128,128,128,.14)" stroke-width="1"/>`
  }).join('')
  const xLabels = [days[0], days[14], days[29]].map((d, i) => {
    const xi = i === 0 ? 0 : i === 1 ? 14 : 29
    const anchor = i === 0 ? 'start' : i === 1 ? 'middle' : 'end'
    return `<text x="${x(xi).toFixed(1)}" y="${H - 8}" text-anchor="${anchor}" font-size="10" fill="rgba(128,128,128,.75)">${d.slice(5)}</text>`
  }).join('')
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="30 天销售趋势" style="width:100%;height:auto;display:block">
    <defs>
      <linearGradient id="esd-trend-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4f7cff" stop-opacity=".28"/>
        <stop offset="100%" stop-color="#4f7cff" stop-opacity=".02"/>
      </linearGradient>
    </defs>
    ${grid}
    <polygon points="${area}" fill="url(#esd-trend-fill)"/>
    <polyline points="${pts}" fill="none" stroke="#4f7cff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${xLabels}
  </svg>`
  return { svg, max, days: values.length }
}

/** 类目占比 → SVG 环形图（stroke-dasharray 分段） */
function buildDonutSvg(categories: CategoryStat[]): string {
  const R = 62
  const C = 2 * Math.PI * R
  const CX = 90
  const CY = 90
  let acc = 0
  const segs = categories.map((c, i) => {
    const ratio = c.ratio / 100
    const dash = ratio * C
    const gap = C - dash
    const rotate = acc * 360
    acc += ratio
    const color = PALETTE[i % PALETTE.length]
    return `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${color}" stroke-width="22"
      stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" stroke-dashoffset="${(C / 4).toFixed(2)}"
      transform="rotate(${rotate.toFixed(1)} ${CX} ${CY})"/>`
  }).join('')
  const total = categories.reduce((s, c) => s + c.revenue, 0)
  const legend = categories.map((c, i) => `
    <div class="dash-legend-item">
      <span class="dash-legend-dot" style="background:${PALETTE[i % PALETTE.length]}"></span>
      <span class="dash-legend-name">${esc(c.category)}</span>
      <span class="dash-legend-val">${c.ratio}%</span>
    </div>`).join('')
  return `<div class="dash-donut-wrap">
    <div class="dash-donut">
      <svg viewBox="0 0 180 180" role="img" aria-label="类目销售占比" style="width:150px;height:150px">
        ${segs}
        <text x="${CX}" y="${CY - 4}" text-anchor="middle" font-size="13" font-weight="600" fill="var(--dash-text)">${MONEY(total)}</text>
        <text x="${CX}" y="${CY + 14}" text-anchor="middle" font-size="10" fill="rgba(128,128,128,.8)">总销售额</text>
      </svg>
    </div>
    <div class="dash-legend">${legend}</div>
  </div>`
}

/** 仪表盘页面（完整 HTML，服务端渲染） */
export function renderDashboard(store: EcommerceStore): string {
  const o = store.overview()
  const actions = store.todayActions()
  const trend = store.trend({ date_from: new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10) }, 'day')
  const cats = store.categoryDistribution()
  const top = store.topProducts({}, 10)
  const low = store.lowStock()
  const trendSvg = buildTrendSvg(trend)
  const donutSvg = buildDonutSvg(cats)
  const modeInfo = store.getModeInfo()
  const modeLabel = modeInfo.sourceMode === 'rest'
    ? '平台 API'
    : modeInfo.mode === 'imported'
      ? '导入数据'
      : '演示数据'
  const topRows = top.length === 0
    ? '<tr><td colspan="5" class="dash-empty">暂无销售数据</td></tr>'
    : top.map((p, i) => `<tr>
        <td class="dash-rank">${i + 1}</td>
        <td>${esc(p.name)}</td>
        <td class="dash-mono">${esc(p.sku)}</td>
        <td class="dash-num">${p.units} 件</td>
        <td class="dash-num dash-mono">${MONEY(p.revenue)}</td>
      </tr>`).join('')
  const lowRows = low.length === 0
    ? '<div class="dash-empty">库存充足 🎉</div>'
    : low.map((p) => `<div class="dash-low-item">
        <span class="dash-low-name">${esc(p.name)}</span>
        <span class="dash-mono">${esc(p.sku)}</span>
        <span class="dash-low-stock">${p.stock}</span>
      </div>`).join('')

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>电商店铺经营仪表盘</title>
<style>
  :root {
    --dash-bg: #f6f7f9;
    --dash-card: #ffffff;
    --dash-text: #1c1c1e;
    --dash-muted: #6b7280;
    --dash-border: #e5e7eb;
    --dash-accent: #4f7cff;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --dash-bg: #14161a;
      --dash-card: #1e2228;
      --dash-text: #e8eaed;
      --dash-muted: #9aa3af;
      --dash-border: #2d333b;
      --dash-accent: #6f9bff;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 24px;
    background: var(--dash-bg);
    color: var(--dash-text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 14px;
  }
  .dash-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
  .dash-head h1 { font-size: 20px; margin: 0; }
  .dash-badge {
    font-size: 12px; padding: 3px 10px; border-radius: 999px;
    background: color-mix(in srgb, var(--dash-accent) 14%, transparent);
    color: var(--dash-accent); border: 1px solid color-mix(in srgb, var(--dash-accent) 35%, transparent);
  }
  .dash-meta { margin-left: auto; font-size: 12px; color: var(--dash-muted); display: flex; gap: 12px; align-items: center; }
  .dash-refresh { cursor: pointer; border: 1px solid var(--dash-border); background: var(--dash-card); color: var(--dash-text); border-radius: 6px; padding: 4px 12px; font-size: 12px; }
  .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 14px; }
  .dash-card {
    background: var(--dash-card); border: 1px solid var(--dash-border); border-radius: 12px;
    padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.05);
  }
  .dash-metric-label { font-size: 12px; color: var(--dash-muted); margin-bottom: 6px; }
  .dash-metric-value { font-size: 22px; font-weight: 650; letter-spacing: .2px; }
  .dash-metric-danger { color: #e5484d; }
  .dash-cols { display: grid; grid-template-columns: 1.6fr 1fr; gap: 12px; margin-bottom: 14px; }
  @media (max-width: 860px) { .dash-cols { grid-template-columns: 1fr; } }
  .dash-card h2 { font-size: 14px; margin: 0 0 10px; display: flex; align-items: center; gap: 6px; }
  .dash-donut-wrap { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .dash-legend { display: flex; flex-direction: column; gap: 5px; font-size: 12px; flex: 1; min-width: 130px; }
  .dash-legend-item { display: flex; align-items: center; gap: 6px; }
  .dash-legend-dot { width: 9px; height: 9px; border-radius: 3px; flex: none; }
  .dash-legend-name { flex: 1; }
  .dash-legend-val { color: var(--dash-muted); }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--dash-border); }
  th { color: var(--dash-muted); font-weight: 500; font-size: 12px; }
  .dash-rank { width: 28px; font-weight: 600; color: var(--dash-muted); }
  .dash-num { text-align: right; }
  .dash-mono { font-family: ui-monospace, "Cascadia Mono", Consolas, monospace; font-size: 12px; }
  .dash-low-list { display: flex; flex-direction: column; gap: 6px; }
  .dash-low-item { display: flex; align-items: center; gap: 10px; font-size: 13px; }
  .dash-low-name { flex: 1; }
  .dash-low-stock { font-weight: 700; color: #e5484d; }
  .dash-empty { color: var(--dash-muted); padding: 10px 0; text-align: center; }
  .dash-foot { margin-top: 16px; font-size: 12px; color: var(--dash-muted); display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
</style>
</head>
<body>
  <div class="dash-head">
    <h1>🛍️ 电商店铺经营仪表盘</h1>
    <span class="dash-badge">数据源：${modeLabel}</span>
    <div class="dash-meta">
      <span>更新于 ${new Date().toLocaleString('zh-CN', { hour12: false })}</span>
      <button class="dash-refresh" onclick="location.reload()">🔄 刷新</button>
    </div>
  </div>

  <div class="dash-grid">
    <div class="dash-card"><div class="dash-metric-label">销售额（已支付）</div><div class="dash-metric-value">${MONEY(o.revenue)}</div></div>
    <div class="dash-card"><div class="dash-metric-label">订单量</div><div class="dash-metric-value">${o.orders} 笔</div></div>
    <div class="dash-card"><div class="dash-metric-label">客单价</div><div class="dash-metric-value">${MONEY(o.avg_order_value)}</div></div>
    <div class="dash-card"><div class="dash-metric-label">退款率</div><div class="dash-metric-value ${o.refund_rate >= 10 ? 'dash-metric-danger' : ''}">${o.refund_rate}%</div></div>
  </div>

  <div class="dash-cols">
    <div class="dash-card">
      <h2>📈 30 天销售趋势（峰值 ${MONEY(trendSvg.max)}）</h2>
      ${trendSvg.svg}
    </div>
    <div class="dash-card">
      <h2>🧩 类目销售占比（${cats.length} 类）</h2>
      ${donutSvg}
    </div>
  </div>

  <div class="dash-cols">
    <div class="dash-card">
      <h2>🏆 TOP10 商品</h2>
      <table>
        <thead><tr><th>#</th><th>商品</th><th>SKU</th><th class="dash-num">销量</th><th class="dash-num">销售额</th></tr></thead>
        <tbody>${topRows}</tbody>
      </table>
    </div>
    <div class="dash-card">
      <h2>⚠️ 低库存预警（${low.length} 件）</h2>
      <div class="dash-low-list">${lowRows}</div>
      <h2 style="margin-top:16px">⏰ 今日待办</h2>
      <table>
        <tbody>
          <tr><td>逾期未处理订单</td><td class="dash-num" style="color:#e5484d;font-weight:700">${actions.overdues.length} 笔</td></tr>
          <tr><td>待发货订单</td><td class="dash-num">${actions.shipments.length} 笔</td></tr>
          <tr><td>低库存商品</td><td class="dash-num">${actions.lowStockCount} 件</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="dash-foot">
    <span>ecommerce-analyst-plugin · 数据口径与 stats_*/inventory_*/order_* 工具一致（同一 Store）</span>
    <span>今日 ${todayStr()}</span>
  </div>
  <script>setInterval(() => location.reload(), 120000);</script>
</body>
</html>`
  return html
}
