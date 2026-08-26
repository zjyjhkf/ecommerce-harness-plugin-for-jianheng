/**
 * ecommerce-analyst-plugin — BI 数据看板 + 商品管理（客户端）
 *
 * 参考 bi.html（九数云 BI 风格）：
 *  - 4 个核心 KPI 卡（销售额/订单量/客单价/退款率）
 *  - 近 30 天销售趋势折线（内联 SVG）
 *  - 类目占比环形图（内联 SVG donut）
 *  - TOP 商品销售排行横向条形图（内联 SVG）
 *  - 库存健康度（低库存 + 库存分布条形）
 *  - 商品管理表格：显示全部商品，支持增删改查、上下架、调库存，
 *    点击商品 → 向会话框生成分析指令
 *
 * 全部内联 SVG，零外部图表库依赖（echarts 由 bi.html 引入，这里用原生 SVG 代替，
 * 避免引入运行时依赖）。数据来自 /ecommerce-api，与工具口径一致。
 */
import * as React from 'react'
import { formatMoney, type ProductRow, type ShopSnapshot } from './data.ts'

/* ────────────── BI KPI 卡 ────────────── */

interface KpiDef {
  label: string
  value: string
  sub: string
  subTone: 'up' | 'down' | 'neutral'
}

function BiKpiGrid(props: { snapshot: ShopSnapshot }): React.ReactElement {
  const o = props.snapshot.overview
  const kpis: KpiDef[] = [
    { label: '累计销售额 (GMV)', value: formatMoney(o.revenue), sub: `${o.orders} 笔已支付订单`, subTone: 'neutral' },
    { label: '订单量', value: `${o.orders}`, sub: `客单价 ${formatMoney(o.avg_order_value)}`, subTone: 'neutral' },
    { label: '客单价 (AOV)', value: formatMoney(o.avg_order_value), sub: '已支付口径', subTone: 'neutral' },
    { label: '退款率监控', value: `${o.refund_rate.toFixed(2)}%`, sub: o.refund_rate >= 10 ? '偏高，需关注' : '正常范围', subTone: o.refund_rate >= 10 ? 'up' : 'down' },
  ]
  return (
    <div className="esd-bi-kpi-grid">
      {kpis.map((k) => (
        <div className="esd-bi-kpi-card" key={k.label}>
          <div className="esd-bi-kpi-title">{k.label}</div>
          <div className="esd-bi-kpi-value">{k.value}</div>
          <div className={'esd-bi-kpi-sub ' + k.subTone}>{k.sub}</div>
        </div>
      ))}
    </div>
  )
}

/* ────────────── 近 30 天趋势折线（内联 SVG） ────────────── */

function BiTrendChart(props: { points: Array<{ date: string; revenue: number; orders: number }> }): React.ReactElement {
  const pts = props.points
  const W = 600
  const H = 120
  const PAD = 22
  if (pts.length < 2) {
    return <div className="esd-bi-empty">暂无趋势数据</div>
  }
  const max = Math.max(1, ...pts.map((p) => p.revenue))
  const xs = (i: number): number => PAD + (i * (W - PAD * 2)) / (pts.length - 1)
  const ys = (v: number): number => H - PAD - (v / max) * (H - PAD * 2)
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xs(i).toFixed(1)},${ys(p.revenue).toFixed(1)}`).join(' ')
  const area = `${line} L${xs(pts.length - 1).toFixed(1)},${H - PAD} L${xs(0).toFixed(1)},${H - PAD} Z`
  return (
    <div className="esd-bi-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="esd-bi-svg">
        <defs>
          <linearGradient id="esd-bi-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2bb8a3" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2bb8a3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#esd-bi-area)" />
        <path d={line} fill="none" stroke="#2bb8a3" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={p.date} cx={xs(i)} cy={ys(p.revenue)} r={i === pts.length - 1 ? 3.5 : 2} fill="#2bb8a3" />
        ))}
      </svg>
      <div className="esd-bi-chart-labels">
        <span>{pts[0]?.date?.slice(5)}</span>
        <span>{pts[Math.floor(pts.length / 2)]?.date?.slice(5)}</span>
        <span>{pts[pts.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  )
}

/* ────────────── 通用横条形 bar 行（类目占比 + TOP 排行复用） ────────────── */

const CAT_COLORS = ['#2bb8a3', '#3fcdb6', '#1f9e8a', '#6fdcc8', '#159c84', '#9be8da', '#0e8a76', '#5fcdb4']

interface BarRowItem {
  key: string
  name: string
  value: number
  display: string // 已格式化的右侧数字
  color: string
}

/** 统一横条形 bar：[色块+名] [bar 轨道] [数字]，与 BiTopBar 风格一致 */
function BarRow(props: { item: BarRowItem; max: number; ratio: number }): React.ReactElement {
  const { item, max, ratio } = props
  return (
    <div className="esd-bi-bar-row" key={item.key}>
      <span className="esd-bi-bar-name" title={item.name}>{item.name}</span>
      <div className="esd-bi-bar-track">
        <div
          className="esd-bi-bar-fill"
          style={{ width: `${ratio.toFixed(1)}%`, background: item.color }}
        />
      </div>
      <span className="esd-bi-bar-val">{item.display}</span>
    </div>
  )
}

/* ────────────── 类目占比（横条形 bar，比例按 ratio 计算，max=100） ────────────── */

function BiCategoryBars(props: { categories: Array<{ category: string; revenue: number; ratio: number }> }): React.ReactElement {
  const cats = props.categories.slice(0, 6)
  const items: BarRowItem[] = cats.map((c, i) => ({
    key: c.category,
    name: c.category,
    value: c.ratio,
    display: `${c.ratio.toFixed(1)}%`,
    color: CAT_COLORS[i % CAT_COLORS.length] ?? '#4f7cff',
  }))
  return (
    <div className="esd-bi-bar">
      {items.map((it) => (
        <BarRow key={it.key} item={it} max={100} ratio={it.value} />
      ))}
      {cats.length === 0 ? <div className="esd-bi-empty">暂无类目数据</div> : null}
    </div>
  )
}

/* ────────────── TOP 商品排行（横条形 bar，复用 BarRow） ────────────── */

function BiTopBar(props: { top: Array<{ sku: string; name: string; revenue: number }> }): React.ReactElement {
  const items = props.top.slice(0, 5)
  const max = Math.max(1, ...items.map((t) => t.revenue))
  const rows: BarRowItem[] = items.map((t, i) => ({
    key: t.sku,
    name: t.name,
    value: t.revenue,
    display: formatMoney(t.revenue),
    color: CAT_COLORS[i % CAT_COLORS.length] ?? '#4f7cff',
  }))
  return (
    <div className="esd-bi-bar">
      {rows.map((it) => (
        <BarRow key={it.key} item={it} max={max} ratio={(it.value / max) * 100} />
      ))}
      {items.length === 0 ? <div className="esd-bi-empty">暂无销售数据</div> : null}
    </div>
  )
}

/* ────────────── BI 看板整体（KPI + 图表网格） ────────────── */

export function BiDashboardSection(props: { snapshot: ShopSnapshot }): React.ReactElement {
  const s = props.snapshot
  return (
    <div className="esd-bi">
      <BiKpiGrid snapshot={s} />
      <div className="esd-bi-grid">
        <div className="esd-bi-card">
          <div className="esd-bi-card-title">近 30 天销售趋势</div>
          <BiTrendChart points={s.trend30} />
        </div>
        <div className="esd-bi-card">
          <div className="esd-bi-card-title">库存健康度</div>
          <div className="esd-bi-stock">
            <div className="esd-bi-stock-line">
              <span>低库存商品（≤阈值）</span>
              <em>{s.lowStock.length} 件</em>
            </div>
            {s.lowStock.slice(0, 6).map((p) => (
              <div className="esd-bi-stock-row" key={p.sku}>
                <span title={p.name}>{p.name}</span>
                <span className="esd-bi-stock-num">{p.stock} 件</span>
              </div>
            ))}
            {s.lowStock.length === 0 ? <div className="esd-bi-empty">库存健康，无低库存商品</div> : null}
          </div>
        </div>
      </div>
      <div className="esd-bi-grid">
        <div className="esd-bi-card">
          <div className="esd-bi-card-title">类目销售占比</div>
          <BiCategoryBars categories={s.categories} />
        </div>
        <div className="esd-bi-card">
          <div className="esd-bi-card-title">TOP 5 商品销售额排行</div>
          <BiTopBar top={s.top} />
        </div>
      </div>
    </div>
  )
}

/* ────────────── 商品管理表格（增删改查 + 点击分析） ────────────── */

interface ProductManagerProps {
  products: ProductRow[] | null
  loading: boolean
  onRefresh: () => void
  onCreate: (input: { name: string; price: number; stock: number; category: string }) => Promise<void>
  onUpdate: (sku: string, patch: Partial<Pick<ProductRow, 'name' | 'price' | 'stock' | 'category' | 'status'>>) => Promise<void>
  onDelete: (sku: string) => Promise<void>
  onStock: (sku: string, delta: number) => Promise<void>
  onStatus: (sku: string, status: 'on_sale' | 'off_sale') => Promise<void>
  onAnalyze: (product: ProductRow) => void
  onExport: (scope: 'products' | 'orders' | 'all') => void
}

interface ProductFormState {
  sku: string | null // null=新增，否则=编辑
  name: string
  category: string
  price: string
  stock: string
  busy: boolean
  error: string | null
}

function ProductForm(props: {
  initial: ProductFormState
  onClose: () => void
  onSubmit: (values: { name: string; category: string; price: number; stock: number }) => Promise<void>
}): React.ReactElement {
  const [name, setName] = React.useState(props.initial.name)
  const [category, setCategory] = React.useState(props.initial.category)
  const [price, setPrice] = React.useState(props.initial.price)
  const [stock, setStock] = React.useState(props.initial.stock)
  const [busy, setBusy] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const submit = async (): Promise<void> => {
    setBusy(true)
    setErr(null)
    try {
      await props.onSubmit({
        name: name.trim(),
        category: category.trim() || '未分类',
        price: Number(price),
        stock: Number(stock),
      })
      props.onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="esd-bi-modal-mask" onClick={props.onClose}>
      <div className="esd-bi-modal" onClick={(e) => e.stopPropagation()}>
        <div className="esd-bi-modal-title">{props.initial.sku === null ? '新增商品' : `编辑商品 ${props.initial.sku}`}</div>
        <label className="esd-bi-field">
          <span>商品名称</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：便携充电宝" autoFocus />
        </label>
        <label className="esd-bi-field">
          <span>分类</span>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="例如：数码配件" />
        </label>
        <div className="esd-bi-field-row">
          <label className="esd-bi-field">
            <span>售价（元）</span>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" min="0" />
          </label>
          <label className="esd-bi-field">
            <span>库存</span>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" min="0" />
          </label>
        </div>
        {err !== null ? <div className="esd-bi-form-err">{err}</div> : null}
        <div className="esd-bi-modal-actions">
          <button type="button" className="esd-bi-btn" onClick={props.onClose} disabled={busy}>取消</button>
          <button type="button" className="esd-bi-btn esd-bi-btn-primary" onClick={() => void submit()} disabled={busy}>
            {busy ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ProductManagerSection(props: ProductManagerProps): React.ReactElement {
  const [form, setForm] = React.useState<ProductFormState | null>(null)
  const [keyword, setKeyword] = React.useState('')
  const items = props.products ?? []
  const filtered = keyword.trim() === ''
    ? items
    : items.filter((p) => p.name.includes(keyword) || p.sku.toLowerCase().includes(keyword.toLowerCase()) || p.category.includes(keyword))

  return (
    <div className="esd-pm">
      <div className="esd-pm-toolbar">
        <input
          className="esd-pm-search"
          placeholder="搜索商品名称 / SKU / 分类…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="button" className="esd-bi-btn" onClick={props.onRefresh} disabled={props.loading}>
          {props.loading ? '加载中…' : '刷新'}
        </button>
        <button
          type="button"
          className="esd-bi-btn esd-bi-btn-primary"
          onClick={() => setForm({ sku: null, name: '', category: '', price: '', stock: '', busy: false, error: null })}
        >
          + 新增商品
        </button>
        <button type="button" className="esd-bi-btn" onClick={() => props.onExport('all')}>⬇ 导出</button>
      </div>

      {props.products === null && props.loading ? (
        <div className="esd-bi-empty">正在加载商品…</div>
      ) : filtered.length === 0 ? (
        <div className="esd-bi-empty">没有符合条件的商品</div>
      ) : (
        <div className="esd-pm-table-wrap">
          <table className="esd-pm-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>商品名称</th>
                <th>分类</th>
                <th className="esd-pm-num">售价</th>
                <th className="esd-pm-num">库存</th>
                <th>状态</th>
                <th className="esd-pm-ops">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.sku} className={p.status === 'off_sale' ? 'esd-pm-off' : ''}>
                  <td className="esd-pm-sku">{p.sku}</td>
                  <td className="esd-pm-name" title={`点击分析「${p.name}」`} onClick={() => props.onAnalyze(p)}>
                    {p.name}
                  </td>
                  <td>{p.category}</td>
                  <td className="esd-pm-num">{formatMoney(p.price)}</td>
                  <td className={'esd-pm-num' + (p.stock === 0 ? ' esd-pm-zero' : '')}>{p.stock}</td>
                  <td>{p.status === 'on_sale' ? '在售' : '下架'}</td>
                  <td className="esd-pm-ops">
                    <button type="button" title="分析该商品" onClick={() => props.onAnalyze(p)}>🔍</button>
                    <button
                      type="button"
                      title="编辑"
                      onClick={() => setForm({ sku: p.sku, name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), busy: false, error: null })}
                    >
                      ✏️
                    </button>
                    <button type="button" title="入库 +10" onClick={() => void props.onStock(p.sku, 10)}>➕</button>
                    <button type="button" title="出库 -10" onClick={() => void props.onStock(p.sku, -10)}>➖</button>
                    <button
                      type="button"
                      title={p.status === 'on_sale' ? '下架' : '上架'}
                      onClick={() => void props.onStatus(p.sku, p.status === 'on_sale' ? 'off_sale' : 'on_sale')}
                    >
                      {p.status === 'on_sale' ? '⏬' : '⏫'}
                    </button>
                    <button
                      type="button"
                      title="删除"
                      onClick={() => {
                        if (window.confirm(`确定删除商品「${p.name}」（${p.sku}）？此操作不可撤销。`)) void props.onDelete(p.sku)
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form !== null ? (
        <ProductForm
          initial={form}
          onClose={() => setForm(null)}
          onSubmit={async (values) => {
            if (form.sku === null) {
              await props.onCreate(values)
            } else {
              await props.onUpdate(form.sku, values)
            }
          }}
        />
      ) : null}
    </div>
  )
}
