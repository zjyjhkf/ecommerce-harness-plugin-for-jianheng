/**
 * ecommerce-analyst-plugin — 「电商数据中台」面板（客户端）
 *
 * 挂载点：conversation.view（标签页，推荐）与 shell.overlay（悬浮兜底层）。
 * 面板只承载「电商数据中台」iframe（复盘数据：月度 / 周度 / 数据对比）。
 * 早期「店铺工作台 / BI 看板」（实时经营数据：订单 / 商品）已移除，
 * 数据一律来自导入的 Excel 复盘报表。
 *
 * 数据流：导入本地 Excel（📥）→ POST /ecommerce-api/import-batch → 通知 iframe
 * 刷新（postMessage「ecommerce:refresh」）→ 数据中台重新拉取月度/周度复盘。
 */
import * as React from 'react'
import { dataCenterUrl, exportData, importLocalFiles } from './data.ts'
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
import { BrandBadge } from './brand.tsx'
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
          电商数据中台渲染出错：{String(this.state.error.message ?? this.state.error)}
        </div>
      )
    }
    return this.props.children
  }
}

/* ────────────── 面板数据与交互逻辑 ────────────── */

const NARROW_QUERY = '(max-width: 900px)'

/** useShopDeskData：面板数据与交互逻辑（本地文件导入 + 数据中台 iframe + 全屏/导出）。
 *  供两种挂载形态复用：conversation.view 标签页（ShopDeskTab）与
 *  shell.overlay 悬浮面板（ShopDeskPanel 兜底）。 */
export interface ShopDeskData {
  open: boolean
  importing: boolean
  importMsg: { ok: boolean; text: string } | null
  setImportMsg: (v: { ok: boolean; text: string } | null) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  dcIframeRef: React.RefObject<HTMLIFrameElement | null>
  openFilePicker: () => void
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  refreshDataCenter: () => void
  fullscreen: boolean
  toggleFullscreen: () => void
  doExport: (type: 'csv' | 'json', scope: 'products' | 'orders' | 'all') => void
}

function useShopDeskData(): ShopDeskData {
  /* open 由全局 cockpit-bus 管理；多个客户端入口（dock/footer/本面板内部按钮）共享 */
  const [, force] = React.useState(0)
  React.useEffect(() => subscribeCockpit(() => force((n) => n + 1)), [])
  const open = isCockpitOpen()
  const setOpen = React.useCallback((next: boolean): void => {
    if (next !== isCockpitOpen()) toggleCockpit()
  }, [])

  /* 本地文件导入：importing=进行中；importMsg=结果/错误提示（ok=true 成功） */
  const [importing, setImporting] = React.useState(false)
  const [importMsg, setImportMsg] = React.useState<{ ok: boolean; text: string } | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  /* 数据中台 iframe：导入后 postMessage 通知其刷新（面板数据动态联动，不依赖整页刷新） */
  const dcIframeRef = React.useRef<HTMLIFrameElement | null>(null)
  const notifyDcRefresh = React.useCallback((): void => {
    try {
      dcIframeRef.current?.contentWindow?.postMessage({ type: 'ecommerce:refresh' }, '*')
    } catch {
      /* 忽略跨域或 iframe 未就绪 */
    }
  }, [])

  /* 全屏浏览状态（由 cockpit-bus 共享，多入口同步） */
  const [, forceFs] = React.useState(0)
  React.useEffect(() => subscribeFullscreen(() => forceFs((n) => n + 1)), [])
  const fullscreen = isFullscreen()

  const mountedRef = React.useRef(true)
  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  /* 窄屏检测：跨越断点时自动收起面板 */
  React.useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY)
    const update = (): void => {
      if (mq.matches) setOpen(false)
    }
    update()
    mq.addEventListener('change', update)
    return () => {
      mq.removeEventListener('change', update)
    }
  }, [setOpen])

  /* 触发本地文件选择（支持 csv/txt/json/xlsx/xls/sql/pdf） */
  const openFilePicker = React.useCallback((): void => {
    fileInputRef.current?.click()
  }, [])

  /* 选择文件后上传解析并导入（支持一次性多选 4 份 Excel，批量导入后统一刷新：
   *  30 天周期的「利润表 + 三份商品排名导出」在同一请求内解析并整体重建月度复盘，
   *  保证数据中台分析结果完全来自本次导入的文件）。 */
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
        // 通知数据中台 iframe 重新拉取导入的月度/周复盘数据（面板随导入数据动态更新）
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
    [notifyDcRefresh],
  )

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

  const toggleFs = React.useCallback((): void => {
    toggleFullscreen()
  }, [])

  return {
    open,
    importing,
    importMsg,
    setImportMsg,
    fileInputRef,
    dcIframeRef,
    openFilePicker,
    handleFileChange,
    refreshDataCenter: notifyDcRefresh,
    fullscreen,
    toggleFullscreen: toggleFs,
    doExport,
  }
}

/* ────────────── 挂载形态一：conversation.view 标签页 ────────────── */

export function ShopDeskTab(): React.ReactElement {
  const d = useShopDeskData()
  return (
    <div className="esd-root">
      <Boundary>
        <div className={'esd-tab-root' + (d.fullscreen ? ' esd-panel-fullscreen' : '')}>
          <div className="esd-tab-toolbar">
            <span className="esd-tab-title">
              <BrandBadge size={22} />
              <span className="esd-tab-title-text">电商数据中台</span>
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
              onClick={d.refreshDataCenter}
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

          {d.importMsg !== null ? (
            <div className={'esd-import ' + (d.importMsg.ok ? 'esd-import-ok' : 'esd-import-bad')}>
              <span className="esd-import-msg">{d.importMsg.text}</span>
              <button type="button" className="esd-refresh-btn" onClick={() => d.setImportMsg(null)}>
                关闭
              </button>
            </div>
          ) : null}

          {/* 数据中台：唯一主体，展示复盘数据（月度 / 周度）与数据对比 */}
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
            <span>电商数据中台 · 复盘数据分析（月度 / 周度 / 数据对比）</span>
          </footer>
        </div>
      </Boundary>
    </div>
  )
}

/* ────────────── 挂载形态二：shell.overlay 悬浮面板（conversation.view 缺失时兜底） ────────────── */

export function ShopDeskPanel(): React.ReactElement {
  const d = useShopDeskData()
  return (
    <div className="esd-root">
      <Boundary>
        {d.open ? (
          <aside className={'esd-panel' + (d.fullscreen ? ' esd-panel-fullscreen' : '')} role="complementary" aria-label="电商数据中台">
            <header className="esd-header">
              <span className="esd-header-logo"><BrandBadge size={24} /></span>
              <h3 className="esd-header-title">电商数据中台</h3>
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
              <button type="button" className="esd-icon-btn" title="刷新数据" aria-label="刷新数据" onClick={d.refreshDataCenter}>
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

            {/* 数据中台：全屏面板唯一主体，展示复盘数据（月度 / 周度）与数据对比 */}
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
              <span>电商数据中台 · 复盘数据分析（月度 / 周度 / 数据对比）</span>
            </footer>
          </aside>
        ) : null}
      </Boundary>
    </div>
  )
}
