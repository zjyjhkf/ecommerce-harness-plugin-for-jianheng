/**
 * ecommerce-analyst-plugin — 「店铺工作台」侧边栏面板（客户端）
 *
 * 挂载点：shell.overlay（list 插槽，叠加式）——不占用官方 sidebar 单插槽，
 * 官方会话列表不受影响。面板以 fixed 定位悬浮于右侧，可折叠，窄屏自动收起。
 *
 * 数据流：mount / 打开面板 / 定时 / 手动刷新 → GET /ecommerce-api/snapshot
 * （服务端复用 EcommerceStore 统计口径）→ 本地 state 渲染。
 */
import * as React from 'react'
import {
  dashboardUrl,
  dataCenterUrl,
  exportData,
  fetchActions,
  fetchBrief,
  fetchCategoryProducts,
  fetchSnapshot,
  formatMoney,
  formatTime,
  importLocalFiles,
  modeLabelOf,
  resetToDemo,
  switchMode,
  type ModeInfo,
  type ProductRow,
  type ShopActions,
  type ShopBrief,
  type ShopSnapshot,
} from './data.ts'
import {
  appendToConversation,
  isCockpitOpen,
  isFullscreen,
  openNewConversation,
  subscribeCockpit,
  subscribeFullscreen,
  toggleCockpit,
  toggleFullscreen,
} from './cockpit-bus.ts'
import { BiDashboardSection } from './BiDashboard.tsx'
import { BrandBadge, SecIcon, type SecIconName } from './brand.tsx'
import { valuePromptOf } from './skills.ts'

/* ────────────── 渲染边界：面板内任何渲染错误不波及宿主 ────────────── */

interface BoundaryState {
  error: Error | null
}

class Boundary extends React.Component<{ children: React.ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }

  render(): React.ReactNode {
    if (this.state.error !== null) {
      return (
        <div className="esd-boundary-error">
          店铺工作台渲染出错：{String(this.state.error.message ?? this.state.error)}
        </div>
      )
    }
    return this.props.children
  }
}

/* ────────────── 小块组件（纯展示） ────────────── */

function Section(props: { icon: React.ReactNode; title: string; meta?: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="esd-section">
      <div className="esd-section-title">
        <span className="esd-sec-icon">{props.icon}</span>
        <span>{props.title}</span>
        {props.meta !== undefined ? <span className="esd-sec-meta">{props.meta}</span> : null}
      </div>
      <div className="esd-section-body">{props.children}</div>
    </div>
  )
}

/** 分类图标映射（6 大分类，未知分类回退 🏷️） */
const CATEGORY_ICONS: Record<string, string> = {
  服饰: '👕',
  数码配件: '🎧',
  家居生活: '🛋️',
  美妆个护: '💄',
  食品饮料: '🍹',
  运动户外: '🏃',
}

function categoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? '🏷️'
}

/* ────────────── 主面板 ────────────── */

const NARROW_QUERY = '(max-width: 900px)'
const STALE_MS = 30_000 // 打开面板时数据超过 30s 视为过期，自动刷新
const REFRESH_INTERVAL_MS = 60_000 // 面板打开期间每 60s 静默刷新

interface ExpandState {
  overdues: boolean
  shipments: boolean
  lowStock: boolean
  category: boolean
  actions: boolean
  brief: boolean
}

/** useShopDeskData：面板数据与交互逻辑（快照加载 / 分类筛选 / 本地文件导入）。
 *  供两种挂载形态复用：dsh-better-sidebar 标签页（ShopDeskTab）与
 *  shell.overlay 悬浮面板（ShopDeskPanel 兜底）。 */
export interface ShopDeskData {
  open: boolean
  setOpen: (v: boolean) => void
  toggle: () => void
  snapshot: ShopSnapshot | null
  loading: boolean
  error: string | null
  /** 行动清单（驾驶舱 dock，随快照一起拉取） */
  actions: ShopActions | null
  /** 一页经营简报（懒加载 + 复制） */
  brief: ShopBrief | null
  briefLoading: boolean
  briefCopied: boolean
  loadBrief: () => Promise<void>
  copyBrief: () => Promise<void>
  selectedCategory: string | null
  catProducts: ProductRow[] | null
  catLoading: boolean
  expanded: ExpandState
  importing: boolean
  importMsg: { ok: boolean; text: string } | null
  setImportMsg: (v: { ok: boolean; text: string } | null) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  dcIframeRef: React.RefObject<HTMLIFrameElement | null>
  overdueCount: number
  modeLabel: string
  modeDot: string
  switchingMode: boolean
  switchDataSource: (mode: 'demo' | 'imported' | 'rest') => Promise<void>
  resetDemo: () => Promise<void>
  openDashboard: () => void
  load: (force: boolean) => Promise<void>
  selectCategory: (category: string) => Promise<void>
  toggleExpand: (key: keyof ExpandState) => void
  openFilePicker: () => void
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  /** 全屏浏览 */
  fullscreen: boolean
  toggleFullscreen: () => void
  /** 数据导出 */
  doExport: (type: 'csv' | 'json', scope: 'products' | 'orders' | 'all') => void
  /** 点击任意视图 → 追加对应数值/指令到会话框（与已选技能拼合后一起分析） */
  emitValue: (text: string, okText?: string) => void
}

function useShopDeskData(): ShopDeskData {
  /* open 由全局 cockpit-bus 管理；多个客户端入口（dock/footer/本面板内部按钮）共享 */
  const [, force] = React.useState(0)
  React.useEffect(() => subscribeCockpit(() => force((n) => n + 1)), [])
  const open = isCockpitOpen()
  const setOpen = (next: boolean): void => {
    if (next !== isCockpitOpen()) toggleCockpit()
  }
  const [snapshot, setSnapshot] = React.useState<ShopSnapshot | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [narrow, setNarrow] = React.useState(false)

  /* 驾驶舱：行动清单（随快照拉取）+ 一页简报（懒加载） */
  const [actions, setActions] = React.useState<ShopActions | null>(null)
  const [brief, setBrief] = React.useState<ShopBrief | null>(null)
  const [briefLoading, setBriefLoading] = React.useState(false)
  const [briefCopied, setBriefCopied] = React.useState(false)

  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [catProducts, setCatProducts] = React.useState<ProductRow[] | null>(null)
  const [catLoading, setCatLoading] = React.useState(false)

  const [expanded, setExpanded] = React.useState<ExpandState>({
    overdues: false,
    shipments: false,
    lowStock: false,
    category: false,
    actions: false,
    brief: false,
  })

  /* 本地文件导入：importing=进行中；importMsg=结果/错误提示（ok=true 成功） */
  const [importing, setImporting] = React.useState(false)
  const [importMsg, setImportMsg] = React.useState<{ ok: boolean; text: string } | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  /* 数据中台 iframe：导入/切换数据源/重置后 postMessage 通知其刷新（面板数据动态联动，不依赖整页刷新） */
  const dcIframeRef = React.useRef<HTMLIFrameElement | null>(null)
  const notifyDcRefresh = React.useCallback((): void => {
    try {
      dcIframeRef.current?.contentWindow?.postMessage({ type: 'ecommerce:refresh' }, '*')
    } catch {
      /* 忽略跨域或 iframe 未就绪 */
    }
  }, [])

  /* 数据源切换：switchingMode=进行中（demo/imported/rest） */
  const [switchingMode, setSwitchingMode] = React.useState(false)

  /* 全屏浏览状态（由 cockpit-bus 共享，多入口同步） */
  const [, forceFs] = React.useState(0)
  React.useEffect(() => subscribeFullscreen(() => forceFs((n) => n + 1)), [])
  const fullscreen = isFullscreen()

  const snapRef = React.useRef<ShopSnapshot | null>(null)
  const lastUpdatedRef = React.useRef(0)
  const mountedRef = React.useRef(true)

  /* 窄屏检测：跨越断点时自动收起面板 */
  React.useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY)
    const update = (): void => {
      const next = mq.matches
      setNarrow(next)
      if (next) setOpen(false)
    }
    update()
    mq.addEventListener('change', update)
    return () => {
      mq.removeEventListener('change', update)
    }
  }, [])

  /* 数据加载：force=true 强制刷新；否则 30s 内不重复拉取 */
  const load = React.useCallback(async (force: boolean): Promise<void> => {
    const now = Date.now()
    if (!force && snapRef.current !== null && now - lastUpdatedRef.current < STALE_MS) return
    setLoading(true)
    setError(null)
    try {
      const [snap, act] = await Promise.all([fetchSnapshot(), fetchActions()])
      if (!mountedRef.current) return
      snapRef.current = snap
      lastUpdatedRef.current = Date.now()
      setSnapshot(snap)
      setActions(act)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  /* 一页经营简报：懒加载（首次展开时拉取） */
  const loadBrief = React.useCallback(async (): Promise<void> => {
    if (brief !== null || briefLoading) return
    setBriefLoading(true)
    try {
      const b = await fetchBrief()
      if (mountedRef.current) setBrief(b)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      if (mountedRef.current) setBriefLoading(false)
    }
  }, [brief, briefLoading])

  /* 复制简报到剪贴板 */
  const copyBrief = React.useCallback(async (): Promise<void> => {
    if (brief === null) return
    try {
      await navigator.clipboard.writeText(brief.markdown)
      setBriefCopied(true)
      setTimeout(() => {
        if (mountedRef.current) setBriefCopied(false)
      }, 2000)
    } catch {
      /* 剪贴板不可用时静默失败（用户可手动选择复制） */
    }
  }, [brief])

  React.useEffect(() => {
    mountedRef.current = true
    void load(true)
    return () => {
      mountedRef.current = false
    }
  }, [load])

  /* 打开面板：若数据过期则刷新；打开期间每 60s 静默刷新 */
  React.useEffect(() => {
    if (!open) return
    void load(false)
    const timer = window.setInterval(() => {
      void load(true)
    }, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [open, load])

  const toggle = React.useCallback(() => {
    toggleCockpit()
  }, [])

  const selectCategory = React.useCallback(async (category: string): Promise<void> => {
    setSelectedCategory(category)
    setExpanded((prev) => ({ ...prev, category: true }))
    setCatLoading(true)
    setCatProducts(null)
    try {
      const items = await fetchCategoryProducts(category)
      if (mountedRef.current) setCatProducts(items)
    } catch (err) {
      if (mountedRef.current) {
        setCatProducts([])
        setError(`分类 ${category} 商品加载失败：${err instanceof Error ? err.message : String(err)}`)
      }
    } finally {
      if (mountedRef.current) setCatLoading(false)
    }
  }, [])

  const toggleExpand = React.useCallback((key: keyof ExpandState): void => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  /* 触发本地文件选择（支持 csv/txt/json/xlsx/xls/sql/pdf） */
  const openFilePicker = React.useCallback((): void => {
    fileInputRef.current?.click()
  }, [])

  /* 选择文件后上传解析并导入（支持一次性多选 4 份 Excel，批量导入后统一刷新：
   *  30 天周期的「利润表 + 三份商品排名导出」在同一请求内解析并整体重建月度复盘，
   *  保证面板分析结果完全来自本次导入的文件）。 */
  const handleFileChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const files = Array.from(event.target.files ?? [])
      event.target.value = ''
      if (files.length === 0) return
      setImporting(true)
      setImportMsg(null)
      try {
        const result = await importLocalFiles(files)
        if (!mountedRef.current) return
        setImportMsg({
          ok: true,
          text: `导入完成（${files.length} 个文件）：${result.hint}`,
        })
        // 导入后实时刷新：重载快照 + 商品表 + 失效已缓存的简报（强制重新生成）
        setBrief(null)
        setBriefLoading(false)
        setCatProducts(null)
        setSelectedCategory(null)
        void load(true)
        // 通知数据中台 iframe 重新拉取导入的月度/周复盘数据（面板随插入数据动态更新）
        notifyDcRefresh()
      } catch (err) {
        if (!mountedRef.current) return
        setImportMsg({
          ok: false,
          text: `导入失败：${err instanceof Error ? err.message : String(err)}`,
        })
      } finally {
        if (mountedRef.current) setImporting(false)
      }
    },
    [load, notifyDcRefresh],
  )

  const overdueCount = snapshot?.today.overdueCount ?? 0
  const modeLabel = snapshot === null ? '' : snapshot.sourceMode === 'mock' ? '示例数据' : '真实平台'
  const modeDot = snapshot === null ? '' : snapshot.sourceMode === 'mock' ? 'esd-dot-mock' : 'esd-dot-rest'

  /* 切换数据源：demo=演示数据 / imported=导入数据 / rest=平台 API（服务端先备份） */
  const switchDataSource = React.useCallback(
    async (mode: 'demo' | 'imported' | 'rest'): Promise<void> => {
      if (mode === 'demo') {
        const ok = window.confirm('切换到演示数据会替换当前店铺数据（服务端会先自动备份当前数据）。确定继续？')
        if (!ok) return
      }
      setSwitchingMode(true)
      setImportMsg(null)
      try {
        const result = await switchMode(mode)
        if (!mountedRef.current) return
        setImportMsg({
          ok: true,
          text: `已切换到「${modeLabelOf(result.mode)}」：${result.products} 件商品 / ${result.orders} 笔订单`,
        })
        setBrief(null)
        setBriefLoading(false)
        setCatProducts(null)
        setSelectedCategory(null)
        void load(true)
        notifyDcRefresh()
      } catch (err) {
        if (!mountedRef.current) return
        setImportMsg({
          ok: false,
          text: `切换失败：${err instanceof Error ? err.message : String(err)}`,
        })
      } finally {
        if (mountedRef.current) setSwitchingMode(false)
      }
    },
    [load, notifyDcRefresh],
  )

  /* 一键重置为演示数据（服务端保留备份） */
  const resetDemo = React.useCallback(async (): Promise<void> => {
    const ok = window.confirm('将重置为演示数据（26 商品 / 480 订单）。当前数据会先在服务端备份，可从备份恢复。确定继续？')
    if (!ok) return
    setSwitchingMode(true)
    setImportMsg(null)
    try {
      const result = await resetToDemo()
      if (!mountedRef.current) return
        setImportMsg({
          ok: true,
          text: `已重置为演示数据：${result.products} 件商品 / ${result.orders} 笔订单（重置前数据已备份）`,
        })
        setBrief(null)
        setBriefLoading(false)
        setCatProducts(null)
        setSelectedCategory(null)
        void load(true)
        notifyDcRefresh()
    } catch (err) {
      if (!mountedRef.current) return
      setImportMsg({
        ok: false,
        text: `重置失败：${err instanceof Error ? err.message : String(err)}`,
      })
    } finally {
      if (mountedRef.current) setSwitchingMode(false)
    }
  }, [load, notifyDcRefresh])

  /* 一键打开独立仪表盘页面 */
  const openDashboard = React.useCallback((): void => {
    window.open(dashboardUrl(), '_blank', 'noopener')
  }, [])

  /* 链接预警分析：监听数据中台 iframe 的 postMessage（点击退款商品明细里的商品名触发）。
   *  收到后开启全新会话并把 AI 分析提示词自动输入到会话框。 */
  React.useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      const data = event.data as { type?: string; linkName?: string; prompt?: string; label?: string; value?: string } | null
      if (data === null || typeof data !== 'object') return

      /* 通用视图点击 → 追加对应数值到会话框（与已选技能拼合，不新建会话） */
      if (data.type === 'ecommerce:analyze-value') {
        const label = typeof data.label === 'string' ? data.label : ''
        const value = typeof data.value === 'string' ? data.value : ''
        if (label === '' || value === '') return
        const r = appendToConversation(valuePromptOf(label, value))
        setImportMsg({
          ok: r.sent,
          text: r.sent ? `已在会话框追加「${label}」：${value}` : '会话框未连接，已复制对应数值到剪贴板',
        })
        return
      }

      if (data.type !== 'ecommerce:analyze-link') return
      const prompt = typeof data.prompt === 'string' && data.prompt !== '' ? data.prompt : ''
      if (prompt === '') {
        setImportMsg({ ok: false, text: '链接预警分析失败：未收到分析提示词' })
        return
      }
      const name = typeof data.linkName === 'string' && data.linkName !== '' ? data.linkName : '该商品'
      void openNewConversation(prompt).then((r) => {
        setImportMsg({
          ok: r.opened,
          text: r.newSession
            ? r.opened
              ? `已在当前会话分组开启全新会话并发送链接预警分析指令：分析「${name}」`
              : `已新建会话，但发送失败，分析指令已复制到剪贴板（分析「${name}」）`
            : r.opened
              ? `已在当前会话中发送链接预警分析指令：分析「${name}」`
              : `会话服务未就绪，分析指令已复制到剪贴板（分析「${name}」）`,
        })
      })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  /* 数据导出 */
  const doExport = React.useCallback((type: 'csv' | 'json', scope: 'products' | 'orders' | 'all'): void => {
    exportData(type, scope)
  }, [])

  /* 点击任意视图 → 追加对应数值/指令到会话框（与已选技能拼合后一起发送分析） */
  const emitValue = React.useCallback((text: string, okText?: string): void => {
    const result = appendToConversation(text)
    setImportMsg({
      ok: result.sent,
      text: result.sent
        ? okText ?? '已在会话框追加对应数值'
        : '会话框未连接，分析指令已复制到剪贴板（请粘贴发送）',
    })
  }, [])

  const toggleFs = React.useCallback((): void => {
    toggleFullscreen()
  }, [])

  return {
    open,
    setOpen,
    toggle,
    snapshot,
    loading,
    error,
    actions,
    brief,
    briefLoading,
    briefCopied,
    loadBrief,
    copyBrief,
    selectedCategory,
    catProducts,
    catLoading,
    expanded,
    importing,
    importMsg,
    setImportMsg,
    fileInputRef,
    dcIframeRef,
    overdueCount,
    modeLabel,
    modeDot,
    switchingMode,
    switchDataSource,
    resetDemo,
    openDashboard,
    load,
    selectCategory,
    toggleExpand,
    openFilePicker,
    handleFileChange,
    fullscreen,
    toggleFullscreen: toggleFs,
    doExport,
    emitValue,
  }
}

/* ────────────── 挂载形态一：dsh-better-sidebar 标签页 ────────────── */

/**
 * ShopDeskTab：注册为 dsh-better-sidebar 的侧边栏标签页（推荐形态）。
 * better-sidebar 负责标签栏 / 面板 chrome，这里只渲染面板内容与工具行
 * （导入 / 刷新）。数据与工具结果同源（/ecommerce-api 快照）。
 */
export function ShopDeskTab(): React.ReactElement {
  const d = useShopDeskData()
  return (
    <div className="esd-root">
      <Boundary>
        <div className={'esd-tab-root' + (d.fullscreen ? ' esd-panel-fullscreen' : '')}>
          <div className="esd-tab-toolbar">
            <span className="esd-tab-title">
              <BrandBadge size={22} />
              <span className="esd-tab-title-text">数据查看{d.modeLabel !== '' ? <span className="esd-header-sub">{d.modeLabel}</span> : null}</span>
            </span>
            <button
              type="button"
              className="esd-icon-btn"
              title={d.fullscreen ? '退出全屏' : '全屏浏览'}
              aria-label={d.fullscreen ? '退出全屏' : '全屏浏览'}
              onClick={d.toggleFullscreen}
            >
              {d.fullscreen ? '🗗' : '⛶'}
            </button>
            <button
              type="button"
              className="esd-icon-btn"
              title="导出数据（CSV）"
              aria-label="导出数据"
              onClick={() => d.doExport('csv', 'all')}
            >
              ⬇
            </button>
            <button
              type="button"
              className="esd-icon-btn"
              title="导入本地数据（CSV / Excel / SQL / PDF / JSON）"
              aria-label="导入本地数据"
              onClick={d.openFilePicker}
              disabled={d.importing}
            >
              {d.importing ? '⏳' : '📥'}
            </button>
            <button
              type="button"
              className="esd-icon-btn"
              title="刷新数据"
              aria-label="刷新数据"
              onClick={() => void d.load(true)}
            >
              🔄
            </button>
            <input
              ref={d.fileInputRef}
              type="file"
              multiple
              accept=".csv,.txt,.json,.xlsx,.xls,.sql,.pdf"
              style={{ display: 'none' }}
              onChange={(e) => void d.handleFileChange(e)}
            />
          </div>

          {d.error !== null ? (
            <div className="esd-error">
              <span className="esd-error-msg">{d.error}</span>
              <button type="button" className="esd-refresh-btn" onClick={() => void d.load(true)}>
                重试
              </button>
            </div>
          ) : null}

          {d.importMsg !== null ? (
            <div className={'esd-import ' + (d.importMsg.ok ? 'esd-import-ok' : 'esd-import-bad')}>
              <span className="esd-import-msg">{d.importMsg.text}</span>
              <button type="button" className="esd-refresh-btn" onClick={() => d.setImportMsg(null)}>
                关闭
              </button>
            </div>
          ) : null}

          {d.loading && d.snapshot === null ? (
            <div className="esd-loading">正在加载店铺数据…</div>
          ) : d.snapshot !== null ? (
            <div className="esd-body">
              {d.snapshot !== null && d.snapshot.mode.mode === 'demo' ? (
                <div className="esd-import-banner">
                  <span className="esd-import-banner-icon">📥</span>
                  <span className="esd-import-banner-text">
                    当前展示<strong>演示数据</strong>。请在头部点击 <kbd>📥</kbd> 按钮导入 Excel/CSV
                    文件以分析您自己的店铺数据。
                  </span>
                </div>
              ) : null}
              <OverviewSection snapshot={d.snapshot} onValue={d.emitValue} />
              <BiDashboardSection snapshot={d.snapshot} onValue={d.emitValue} />
              <ActionsSection
                actions={d.actions}
                expanded={d.expanded.actions}
                onToggle={() => d.toggleExpand('actions')}
                onValue={d.emitValue}
              />
              <ModeSection
                mode={d.snapshot.mode}
                switching={d.switchingMode}
                onSwitch={d.switchDataSource}
                onReset={d.resetDemo}
                onOpenDashboard={d.openDashboard}
              />
              <TodoSection snapshot={d.snapshot} expanded={d.expanded} onToggle={d.toggleExpand} onValue={d.emitValue} />
              <CategorySection
                snapshot={d.snapshot}
                selected={d.selectedCategory}
                expanded={d.expanded.category}
                products={d.catProducts}
                loading={d.catLoading}
                onSelect={d.selectCategory}
                onToggle={() => d.toggleExpand('category')}
                onValue={d.emitValue}
              />
              <TopSection snapshot={d.snapshot} onValue={d.emitValue} />
              <LowStockSection snapshot={d.snapshot} expanded={d.expanded.lowStock} onToggle={() => d.toggleExpand('lowStock')} onValue={d.emitValue} />
              <BriefSection
                brief={d.brief}
                loading={d.briefLoading}
                copied={d.briefCopied}
                expanded={d.expanded.brief}
                onExpand={() => {
                  void d.loadBrief()
                  d.toggleExpand('brief')
                }}
                onCopy={() => void d.copyBrief()}
              />
            </div>
          ) : null}

          <footer className="esd-footer">
            <span className={'esd-footer-dot ' + d.modeDot}>●</span>
            <span>
              {d.snapshot === null
                ? '数据未加载'
                : d.snapshot.sourceMode === 'mock'
                  ? '示例数据模式（与工具口径一致）'
                  : '真实平台数据'}
            </span>
            <span style={{ marginLeft: 'auto' }}>
              {d.snapshot !== null ? `更新于 ${formatTime(d.snapshot.generatedAt)}` : ''}
            </span>
          </footer>
        </div>
      </Boundary>
    </div>
  )
}

/* ────────────── 挂载形态二：shell.overlay 悬浮面板（better-sidebar 缺失时兜底） ────────────── */

export function ShopDeskPanel(): React.ReactElement {
  const d = useShopDeskData()
  return (
    <div className="esd-root">
      <Boundary>
        {d.open ? (
          <aside className={'esd-panel' + (d.fullscreen ? ' esd-panel-fullscreen' : '')} role="complementary" aria-label="数据查看">
            <header className="esd-header">
              <span className="esd-header-logo"><BrandBadge size={24} /></span>
              <h3 className="esd-header-title">
                数据查看
                {d.modeLabel !== '' ? <span className="esd-header-sub">{d.modeLabel}</span> : null}
              </h3>
              <button
                type="button"
                className="esd-icon-btn"
                title={d.fullscreen ? '退出全屏' : '全屏浏览'}
                aria-label={d.fullscreen ? '退出全屏' : '全屏浏览'}
                onClick={d.toggleFullscreen}
              >
                {d.fullscreen ? '🗗' : '⛶'}
              </button>
              <button
                type="button"
                className="esd-icon-btn"
                title="导出数据（CSV）"
                aria-label="导出数据"
                onClick={() => d.doExport('csv', 'all')}
              >
                ⬇
              </button>
              <button
                type="button"
                className="esd-icon-btn"
                title="导入本地数据（CSV / Excel / SQL / PDF / JSON）"
                aria-label="导入本地数据"
                onClick={d.openFilePicker}
                disabled={d.importing}
              >
                {d.importing ? '⏳' : '📥'}
              </button>
              <button type="button" className="esd-icon-btn" title="刷新数据" aria-label="刷新数据" onClick={() => void d.load(true)}>
                🔄
              </button>
              <input
                ref={d.fileInputRef}
                type="file"
                multiple
                accept=".csv,.txt,.json,.xlsx,.xls,.sql,.pdf"
                style={{ display: 'none' }}
                onChange={(e) => void d.handleFileChange(e)}
              />
            </header>

            {d.error !== null ? (
              <div className="esd-error">
                <span className="esd-error-msg">{d.error}</span>
                <button type="button" className="esd-refresh-btn" onClick={() => void d.load(true)}>
                  重试
                </button>
              </div>
            ) : null}

            {d.importMsg !== null ? (
              <div className={'esd-import ' + (d.importMsg.ok ? 'esd-import-ok' : 'esd-import-bad')}>
                <span className="esd-import-msg">{d.importMsg.text}</span>
                <button
                  type="button"
                  className="esd-refresh-btn"
                  onClick={() => d.setImportMsg(null)}
                >
                  关闭
                </button>
              </div>
            ) : null}

            {/* 与标签页形态保持一致：BI 看板同样渲染（数据同源 d.snapshot，实时经营数据） */}
            {d.loading && d.snapshot === null ? (
              <div className="esd-loading">正在加载店铺数据…</div>
            ) : null}
            {d.snapshot !== null ? (
              <div className="esd-body">
                <BiDashboardSection snapshot={d.snapshot} onValue={d.emitValue} />
              </div>
            ) : null}

            {/* 复盘数据口径提示：iframe 内容父页面无法直接感知，仅以文案引导 */}
            <div className="esd-overview-hint" style={{ margin: 0, padding: '8px 12px 2px', flex: 'none' }}>
              下方「电商数据中台」展示复盘数据（月度 / 周度），需先导入对应 Excel 报表；未导入时为空属正常。上方 BI 看板与标签页同源，为实时经营数据（订单 / 商品）。
            </div>

            <div className="esd-dc-frame">
              <iframe
                ref={d.dcIframeRef}
                className="esd-dc-iframe"
                src={dataCenterUrl()}
                title="电商数据中台"
                loading="eager"
              />
            </div>

            <footer className="esd-footer">
              <span className={'esd-footer-dot ' + d.modeDot}>●</span>
              <span>
                {d.snapshot === null
                  ? '数据未加载'
                  : d.snapshot.sourceMode === 'mock'
                    ? '示例数据模式（与工具口径一致）'
                    : '真实平台数据'}
              </span>
              <span style={{ marginLeft: 'auto' }}>
                {d.snapshot !== null ? `更新于 ${formatTime(d.snapshot.generatedAt)}` : ''}
              </span>
            </footer>
          </aside>
        ) : null}
      </Boundary>
    </div>
  )
}

/* ────────────── 各区块 ────────────── */

function OverviewSection(props: { snapshot: ShopSnapshot; onValue: (text: string, okText?: string) => void }): React.ReactElement {
  const { overview } = props.snapshot
  const sku = overview.top_selling_sku || '--'
  return (
    <Section icon={<SecIcon name="overview" />} title="经营总览" meta={`畅销 ${sku}`}>
      <div className="esd-overview-body">
        <div
          className="esd-overview-line esd-clickable"
          title="点击发送到会话框"
          onClick={() => props.onValue(valuePromptOf('当前畅销 SKU', sku), '已在会话框弹出「当前畅销 SKU」')}
        >
          <span className="esd-overview-label">当前畅销 SKU</span>
          <span className="esd-overview-value esd-overview-sku">{sku}</span>
        </div>
        <div className="esd-overview-hint">
          销售额、订单量、客单价、退款率、近 30 天趋势、类目占比、库存健康度等详细数据，请查看下方的「BI 数据看板」。点击任意数值可弹出到会话框分析。
        </div>
      </div>
    </Section>
  )
}

/** 「数据源」标签：演示数据 / 导入数据 / 平台 API 显式切换 + 重置演示数据 + 打开仪表盘 */
function ModeSection(props: {
  mode: ModeInfo
  switching: boolean
  onSwitch: (mode: 'demo' | 'imported' | 'rest') => void
  onReset: () => void
  onOpenDashboard: () => void
}): React.ReactElement {
  const { mode } = props
  const modes: Array<{ key: 'demo' | 'imported' | 'rest'; label: string; icon: string; disabled?: boolean }> = [
    { key: 'demo', label: '演示数据', icon: '🧪' },
    { key: 'imported', label: '导入数据', icon: '📥', disabled: !mode.canImported },
    { key: 'rest', label: '平台 API', icon: '🔌' },
  ]
  return (
    <Section icon={<SecIcon name="mode" />} title="数据源" meta={`当前：${modeLabelOf(mode.mode)}`}>
      <div className="esd-mode-row">
        {modes.map((m) => {
          const active = mode.mode === m.key
          return (
            <button
              key={m.key}
              type="button"
              className={'esd-mode-btn' + (active ? ' esd-mode-active' : '') + (m.disabled ? ' esd-mode-disabled' : '')}
              disabled={m.disabled || props.switching}
              title={
                m.disabled
                  ? '暂无导入数据，请先导入文件'
                  : m.key === 'rest'
                    ? '从平台 API 拉取/刷新真实店铺数据'
                    : `切换到${m.label}`
              }
              onClick={() => props.onSwitch(m.key)}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          )
        })}
      </div>
      <div className="esd-mode-actions">
        <button type="button" className="esd-mode-link" disabled={props.switching} onClick={props.onReset} title="重置为演示数据（先备份当前数据）">
          ↩️ 重置为演示数据
        </button>
        <button type="button" className="esd-mode-link" onClick={props.onOpenDashboard} title="打开独立仪表盘页面（新标签页）">
          📊 打开仪表盘
        </button>
      </div>
    </Section>
  )
}

const TODO_SHOW_LIMIT = 10

function TodoSection(props: {
  snapshot: ShopSnapshot
  expanded: ExpandState
  onToggle: (key: keyof ExpandState) => void
  onValue: (text: string, okText?: string) => void
}): React.ReactElement {
  const { today, lowStock } = props.snapshot
  const overdue = today.overdueCount
  return (
    <Section icon={<SecIcon name="todo" />} title="今日待办" meta="逾期红色置顶">
      {/* 逾期未处理订单（可展开） */}
      <div className="esd-todo-row esd-overdue" onClick={() => props.onToggle('overdues')} title="点击展开/收起逾期订单">
        <span className="esd-todo-icon">⚠️</span>
        <span className="esd-todo-label">逾期未处理订单</span>
        <span className={'esd-todo-count' + (overdue > 0 ? ' esd-danger-count' : '')}>{overdue}</span>
        <span className="esd-todo-chevron">{props.expanded.overdues ? '▾' : '▸'}</span>
      </div>
      {props.expanded.overdues && overdue > 0 ? (
        <div className="esd-overdue-list">
          {today.overdues.slice(0, TODO_SHOW_LIMIT).map((o) => (
            <div
              className="esd-overdue-item esd-clickable"
              key={o.order_id}
              title={`${o.order_id} 创建于 ${o.created_at}（点击发送到会话框）`}
              onClick={() => props.onValue(valuePromptOf('逾期订单', `${o.order_id} · ${o.buyer} · ${formatMoney(o.amount)}`))}
            >
              <span className="esd-overdue-id">{o.order_id}</span>
              <span className="esd-overdue-buyer">{o.buyer}</span>
              <span className="esd-overdue-amount">{formatMoney(o.amount)}</span>
            </div>
          ))}
          {today.overdues.length > TODO_SHOW_LIMIT ? (
            <div className="esd-empty">…还有 {today.overdues.length - TODO_SHOW_LIMIT} 笔，可用 order_list 查询全部</div>
          ) : null}
        </div>
      ) : null}
      {/* 待发货订单（可展开） */}
      <div className="esd-todo-row" onClick={() => props.onToggle('shipments')} title="点击展开/收起待发货订单">
        <span className="esd-todo-icon">📦</span>
        <span className="esd-todo-label">待发货订单</span>
        <span className={'esd-todo-count' + (today.shipmentsCount > 0 ? ' esd-danger-count' : '')}>{today.shipmentsCount}</span>
        <span className="esd-todo-chevron">{props.expanded.shipments ? '▾' : '▸'}</span>
      </div>
      {props.expanded.shipments && today.shipmentsCount > 0 ? (
        <div className="esd-overdue-list">
          {today.shipments.slice(0, TODO_SHOW_LIMIT).map((o) => (
            <div
              className="esd-overdue-item esd-clickable"
              key={o.order_id}
              title={`${o.order_id} ｜ ${o.product_name} 创建于 ${o.created_at}（点击发送到会话框）`}
              onClick={() => props.onValue(valuePromptOf('待发货订单', `${o.order_id} · ${o.product_name} ×${o.quantity} · ${formatMoney(o.amount)}`))}
            >
              <span className="esd-overdue-id">{o.order_id}</span>
              <span className="esd-overdue-buyer">{o.buyer}</span>
              <span className="esd-overdue-amount">{o.product_name} ×{o.quantity}</span>
              <span className="esd-overdue-amount">{formatMoney(o.amount)}</span>
            </div>
          ))}
          {today.shipments.length > TODO_SHOW_LIMIT ? (
            <div className="esd-empty">…还有 {today.shipments.length - TODO_SHOW_LIMIT} 笔，可用 order_list 查询全部</div>
          ) : null}
        </div>
      ) : null}
      {/* 低库存商品（可展开，明细复用快照 lowStock） */}
      <div className="esd-todo-row" onClick={() => props.onToggle('lowStock')} title="点击展开/收起低库存商品">
        <span className="esd-todo-icon">📉</span>
        <span className="esd-todo-label">低库存商品</span>
        <span className={'esd-todo-count' + (today.lowStockCount > 0 ? ' esd-danger-count' : '')}>{today.lowStockCount}</span>
        <span className="esd-todo-chevron">{props.expanded.lowStock ? '▾' : '▸'}</span>
      </div>
      {props.expanded.lowStock && today.lowStockCount > 0 ? (
        <div className="esd-overdue-list">
          {lowStock.slice(0, TODO_SHOW_LIMIT).map((item) => (
            <div className="esd-overdue-item" key={item.sku} title={`${item.sku} ｜ ${item.category}`}>
              <span className="esd-overdue-id">{item.sku}</span>
              <span className="esd-overdue-buyer">{item.name}</span>
              <span className="esd-overdue-amount">{item.stock} / ≤{item.threshold}</span>
            </div>
          ))}
          {lowStock.length > TODO_SHOW_LIMIT ? (
            <div className="esd-empty">…还有 {lowStock.length - TODO_SHOW_LIMIT} 件，可在「低库存预警」查看全部</div>
          ) : null}
        </div>
      ) : null}
    </Section>
  )
}

function CategorySection(props: {
  snapshot: ShopSnapshot
  selected: string | null
  expanded: boolean
  products: ProductRow[] | null
  loading: boolean
  onSelect: (category: string) => void
  onToggle: () => void
  onValue: (text: string, okText?: string) => void
}): React.ReactElement {
  return (
    <Section icon={<SecIcon name="category" />} title="商品分类" meta={`${props.snapshot.categories.length} 类`}>
      {props.snapshot.categories.map((c) => {
        const active = props.selected === c.category
        return (
          <div
            key={c.category}
            className={'esd-cat' + (active ? ' esd-cat-active' : '')}
            onClick={() => props.onSelect(c.category)}
            title={`点击筛选${c.category}类商品（${c.count} 件）`}
          >
            <span className="esd-cat-icon">{categoryIcon(c.category)}</span>
            <span>{c.category}</span>
            <span className="esd-cat-revenue">{c.ratio > 0 ? c.ratio.toFixed(1) + '%' : ''}</span>
            <span className="esd-cat-count">{c.count} 件</span>
          </div>
        )
      })}
      {props.selected !== null && props.expanded ? (
        <div className="esd-product-list">
          {props.loading ? <div className="esd-loading">加载商品…</div> : null}
          {!props.loading && props.products !== null && props.products.length === 0 ? (
            <div className="esd-empty">该分类暂无商品</div>
          ) : null}
          {!props.loading && props.products !== null
            ? props.products.map((p) => (
                <div
                  className="esd-product esd-clickable"
                  key={p.sku}
                  title={`${p.sku} ｜ 库存 ${p.stock}（点击发送到会话框）`}
                  onClick={() => props.onValue(valuePromptOf('分类商品', `${p.name}（${p.sku}）· ${p.category} · ${formatMoney(p.price)} · 库存 ${p.stock}`))}
                >
                  <span className="esd-product-name">{p.name}</span>
                  <span className={'esd-chip ' + (p.status === 'on_sale' ? 'esd-chip-on' : 'esd-chip-off')}>
                    {p.status === 'on_sale' ? '在售' : '下架'}
                  </span>
                  <span className="esd-product-stock">库存 {p.stock}</span>
                  <span className="esd-product-price">{formatMoney(p.price)}</span>
                </div>
              ))
            : null}
        </div>
      ) : null}
      {props.selected !== null && !props.expanded ? (
        <div className="esd-cat" onClick={props.onToggle} title="展开商品列表">
          <span className="esd-todo-chevron">▸</span>
          <span className="esd-todo-label">{`展开 ${props.selected} 商品`}</span>
        </div>
      ) : null}
    </Section>
  )
}

/** 类目占比紧凑横条（HTML flex，适配侧边栏约 150px 宽单元格） */
function TopSection(props: { snapshot: ShopSnapshot; onValue: (text: string, okText?: string) => void }): React.ReactElement {
  const rankClass = (i: number): string => (i === 0 ? ' esd-rank-1' : i === 1 ? ' esd-rank-2' : i === 2 ? ' esd-rank-3' : '')
  return (
    <Section icon={<SecIcon name="top" />} title="销售排行 TOP5">
      {props.snapshot.top.length === 0 ? <div className="esd-empty">暂无销售数据</div> : null}
      {props.snapshot.top.map((t, i) => (
        <div
          className="esd-top-item esd-clickable"
          key={t.sku}
          title={`${t.sku}（点击发送到会话框）`}
          onClick={() => props.onValue(valuePromptOf(`销售排行 TOP${i + 1}`, `${t.name} · ${formatMoney(t.revenue)} · ${t.units} 件`))}
        >
          <span className={'esd-rank' + rankClass(i)}>{i + 1}</span>
          <span className="esd-top-name">{t.name}</span>
          <span className="esd-top-units">{t.units} 件</span>
          <span className="esd-top-revenue">{formatMoney(t.revenue)}</span>
        </div>
      ))}
    </Section>
  )
}

function LowStockSection(props: {
  snapshot: ShopSnapshot
  expanded: boolean
  onToggle: () => void
  onValue: (text: string, okText?: string) => void
}): React.ReactElement {
  const { lowStock } = props.snapshot
  return (
    <Section icon={<SecIcon name="lowstock" />} title="低库存预警" meta={`阈值 ≤ ${lowStock.length > 0 ? lowStock[0].threshold : 10}`}>
      <div className="esd-todo-row" onClick={props.onToggle} title="点击展开/收起清单">
        <span className="esd-todo-icon">{props.expanded ? '📂' : '📁'}</span>
        <span className="esd-todo-label">低库存清单（{lowStock.length} 件）</span>
        <span className="esd-todo-chevron">{props.expanded ? '▾' : '▸'}</span>
      </div>
      {props.expanded ? (
        lowStock.length === 0 ? (
          <div className="esd-empty">库存充足，没有低于阈值商品 🎉</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '0 2px 4px' }}>
            {lowStock.map((item) => (
              <div
                className="esd-low-item esd-clickable"
                key={item.sku}
                title={`${item.sku}（点击发送到会话框）`}
                onClick={() => props.onValue(valuePromptOf('低库存商品', `${item.name}（${item.sku}）· 库存 ${item.stock} / 阈值 ≤${item.threshold}`))}
              >
                <span className="esd-low-name">{item.name}</span>
                <span className="esd-low-sku">{item.sku}</span>
                <span className="esd-low-cat">{item.category}</span>
                <span className={'esd-low-stock' + (item.stock === 0 ? ' esd-zero' : '')}>{item.stock}</span>
                <span className="esd-low-threshold">/ ≤{item.threshold}</span>
              </div>
            ))}
          </div>
        )
      ) : null}
    </Section>
  )
}

/* ────────────── 驾驶舱：行动清单 dock（对齐视频 cockpit） ────────────── */

function ActionsSection(props: {
  actions: ShopActions | null
  expanded: boolean
  onToggle: () => void
  onValue: (text: string, okText?: string) => void
}): React.ReactElement {
  const { actions } = props
  const dock = actions?.dock
  return (
    <Section icon={<SecIcon name="actions" />} title="行动清单" meta={dock !== undefined ? `${dock.open} 项待办 · 今天到期 ${dock.dueToday} · 紧急 ${dock.urgent}` : undefined}>
      <div className="esd-todo-row" onClick={props.onToggle} title="点击展开/收起行动清单">
        <span className="esd-todo-icon">{props.expanded ? '📂' : '📁'}</span>
        <span className="esd-todo-label">
          {dock !== undefined ? `待办 ${dock.open} 项 · 今天到期 ${dock.dueToday} · 紧急 ${dock.urgent}` : '行动清单加载中…'}
        </span>
        <span className="esd-todo-chevron">{props.expanded ? '▾' : '▸'}</span>
      </div>
      {props.expanded ? (
        actions === null || actions.actions.length === 0 ? (
          <div className="esd-empty">暂无待办事项 🎉</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '0 2px 4px' }}>
            {actions.actions.map((a) => (
              <div
                className={'esd-low-item esd-clickable' + (a.urgent ? ' esd-zero' : '')}
                key={a.id}
                title={`${a.title}（点击发送到会话框）`}
                onClick={() => props.onValue(valuePromptOf('行动事项', `${a.title} · ${a.detail}${a.dueToday === true ? '（今天到期）' : ''}`))}
              >
                <span className="esd-low-name">
                  {a.kind === 'overdue' ? '⏰' : a.kind === 'ship' ? '📦' : '⚠️'} {a.title}
                  {a.dueToday === true ? <span style={{ color: '#e5484d', fontWeight: 600 }}>（今天到期）</span> : null}
                </span>
                <span className="esd-low-sku">{a.detail}</span>
              </div>
            ))}
          </div>
        )
      ) : null}
    </Section>
  )
}

/* ────────────── 驾驶舱：一页经营简报（Markdown 导出） ────────────── */

function BriefSection(props: {
  brief: ShopBrief | null
  loading: boolean
  copied: boolean
  onExpand: () => void
  onCopy: () => void
  expanded: boolean
}): React.ReactElement {
  return (
    <Section icon={<SecIcon name="brief" />} title="一页经营简报" meta="Markdown · 可复制导出">
      <div className="esd-todo-row" onClick={props.onExpand} title="点击生成并展开简报">
        <span className="esd-todo-icon">{props.expanded ? '📂' : '📁'}</span>
        <span className="esd-todo-label">
          {props.loading ? '生成简报中…' : props.brief !== null ? '经营简报（生成于最近刷新）' : '点击生成一页经营简报'}
        </span>
        {props.brief !== null ? (
          <button
            type="button"
            className="esd-icon-btn"
            title="复制简报 Markdown"
            aria-label="复制简报"
            onClick={(e) => {
              e.stopPropagation()
              void props.onCopy()
            }}
          >
            {props.copied ? '✅' : '📋'}
          </button>
        ) : null}
        <span className="esd-todo-chevron">{props.expanded ? '▾' : '▸'}</span>
      </div>
      {props.expanded && props.brief !== null ? (
        <pre
          style={{
            margin: '4px 0 0',
            padding: 8,
            borderRadius: 8,
            background: 'rgba(127,127,127,0.07)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: 12,
            lineHeight: 1.55,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {props.brief.markdown}
        </pre>
      ) : null}
    </Section>
  )
}
