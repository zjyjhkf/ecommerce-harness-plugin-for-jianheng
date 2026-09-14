/**
 * ecommerce-analyst-plugin — 「文件处理」整页（左：文件导入 / 右：结果导出）
 *
 * 闭环：把文件拖到左侧（或点「选择文件」）→ 落到服务器收件箱 → 在会话里让 AI 处理
 * → 处理结果出现在右侧，可**直接拖到桌面/文件夹**保存，也可点「下载」。
 *
 * 两个入口渲染同一个组件：
 *  - 左侧栏圆形按钮（sidebar.footer.action）→ 整页 overlay（variant='overlay'）
 *  - conversation.view 标签「文件处理」→ 面板内的整页（variant='page'）
 *
 * 图标一律用品牌 SVG（SecIcon / FileMark），不用 emoji。
 */
import * as React from 'react'
import { BrandBadge, SecIcon } from './brand.tsx'
import { deleteFile, downloadFileUrl, listFiles, uploadFile, type FileEntry } from './data.ts'
import { fillConversationInput } from './cockpit-bus.ts'
import { setFileDeskOpen } from './filedesk-bus.ts'

/** 拖出到本地时浏览器据 mime 决定落盘文件的类型；常见办公格式给准确值 */
const MIME: Record<string, string> = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  csv: 'text/csv',
  txt: 'text/plain',
  md: 'text/markdown',
  json: 'application/json',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  zip: 'application/zip',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  html: 'text/html',
  xml: 'application/xml',
  sql: 'text/plain',
  log: 'text/plain',
}

function mimeOf(name: string): string {
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : ''
  return MIME[ext] ?? 'application/octet-stream'
}

function fmtSize(n: number): string {
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / 1024 / 1024).toFixed(2) + ' MB'
}

function fmtTime(ms: number): string {
  try {
    const d = new Date(ms)
    const p = (v: number): string => String(v).padStart(2, '0')
    return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  } catch {
    return ''
  }
}

interface DeskMsg {
  ok: boolean
  text: string
}

export interface FileDeskProps {
  /** overlay = 左侧栏按钮打开的整页；page = conversation.view 标签页形态 */
  variant?: 'overlay' | 'page'
  /** overlay 形态下关闭整页（page 形态不需要） */
  onClose?: () => void
}

export function FileDesk(props: FileDeskProps): React.ReactElement {
  const variant = props.variant ?? 'page'
  const [inbox, setInbox] = React.useState<FileEntry[]>([])
  const [outbox, setOutbox] = React.useState<FileEntry[]>([])
  const [busy, setBusy] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)
  const [msg, setMsg] = React.useState<DeskMsg | null>(null)
  const [loaded, setLoaded] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const mountedRef = React.useRef(true)

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const refresh = React.useCallback(async (): Promise<void> => {
    try {
      const [i, o] = await Promise.all([listFiles('inbox'), listFiles('outbox')])
      if (!mountedRef.current) return
      setInbox(i)
      setOutbox(o)
      setLoaded(true)
    } catch (err) {
      if (!mountedRef.current) return
      setLoaded(true)
      setMsg({ ok: false, text: '读取文件列表失败：' + (err instanceof Error ? err.message : String(err)) })
    }
  }, [])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const doUpload = React.useCallback(
    async (files: File[]): Promise<void> => {
      if (files.length === 0) return
      setBusy(true)
      setMsg(null)
      const done: string[] = []
      const failed: string[] = []
      for (const f of files) {
        try {
          await uploadFile(f)
          done.push(f.name)
        } catch (err) {
          failed.push(f.name + '（' + (err instanceof Error ? err.message : String(err)) + '）')
        }
      }
      if (!mountedRef.current) return
      setBusy(false)
      if (failed.length === 0) {
        setMsg({ ok: true, text: `已导入 ${done.length} 个文件到收件箱：${done.join('、')}。下一步在会话里让 AI 处理，结果会出现在右侧。` })
      } else {
        setMsg({
          ok: done.length > 0,
          text: `成功 ${done.length} 个${done.length > 0 ? '（' + done.join('、') + '）' : ''}；失败 ${failed.length} 个：${failed.join('；')}`,
        })
      }
      await refresh()
    },
    [refresh],
  )

  const onPick = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const files = Array.from(event.target.files ?? [])
      event.target.value = ''
      await doUpload(files)
    },
    [doUpload],
  )

  const onDrop = React.useCallback(
    async (event: React.DragEvent<HTMLDivElement>): Promise<void> => {
      event.preventDefault()
      // 阻止冒泡：否则同一次拖放还会被会话输入框的全局 drop 处理，文件被额外挂成会话附件
      event.stopPropagation()
      setDragOver(false)
      // 只处理"从本机拖进来"的文件；页面内拖出用的是 DownloadURL，不带 files
      const files = Array.from(event.dataTransfer?.files ?? [])
      if (files.length > 0) await doUpload(files)
    },
    [doUpload],
  )

  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>): void => {
    // 必须 preventDefault，否则浏览器不会派发 drop（并且会拒绝该拖放）
    if (Array.from(event.dataTransfer?.types ?? []).includes('Files')) {
      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = 'copy'
      setDragOver(true)
    }
  }, [])

  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLDivElement>): void => {
    // 只在真正离开投放区时取消高亮（子元素间移动会冒泡出 leave）
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setDragOver(false)
  }, [])

  const onDragStart = React.useCallback((event: React.DragEvent<HTMLLIElement>, file: FileEntry): void => {
    if (typeof window === 'undefined') return
    const abs = new URL(downloadFileUrl(file.dir, file.name), window.location.origin).href
    // Chrome/Edge：把文件"拖出浏览器"落盘到资源管理器/桌面的约定载荷
    event.dataTransfer.setData('DownloadURL', `${mimeOf(file.name)}:${file.name}:${abs}`)
    event.dataTransfer.effectAllowed = 'copy'
  }, [])

  const doDelete = React.useCallback(
    async (dir: 'inbox' | 'outbox', name: string): Promise<void> => {
      setBusy(true)
      setMsg(null)
      try {
        await deleteFile(dir, name)
        if (mountedRef.current) setMsg({ ok: true, text: `已删除 ${name}` })
        await refresh()
      } catch (err) {
        if (mountedRef.current) setMsg({ ok: false, text: '删除失败：' + (err instanceof Error ? err.message : String(err)) })
      } finally {
        if (mountedRef.current) setBusy(false)
      }
    },
    [refresh],
  )

  /** 把「处理这个文件」的指令填进会话输入框（不直接发送，用户可再补充要求） */
  const handToAi = React.useCallback(async (name: string): Promise<void> => {
    const r = await fillConversationInput(`请处理 inbox/${name}，并把处理结果写到 outbox/`)
    setMsg({
      ok: r.sent,
      text: r.sent
        ? `已把「处理 inbox/${name}」填进会话输入框，补充要求后回车发送`
        : '会话输入框未就绪，指令已复制到剪贴板',
    })
  }, [])

  const head = (
    <header className="esd-fd-head">
      <span className="esd-fd-title">
        <BrandBadge size={22} />
        <span className="esd-fd-title-text">文件处理</span>
      </span>
      <span className="esd-fd-sub">导入到收件箱 → 会话里让 AI 处理 → 结果从这里取回</span>
      <span className="esd-fd-head-actions">
        <button type="button" className="esd-fd-btn" title="刷新文件列表" aria-label="刷新文件列表" disabled={busy} onClick={() => void refresh()}>
          <SecIcon name="refresh" size={14} />
          <span>刷新</span>
        </button>
        {variant === 'overlay' ? (
          <button
            type="button"
            className="esd-fd-btn"
            title="关闭"
            aria-label="关闭文件处理"
            onClick={() => (props.onClose ? props.onClose() : setFileDeskOpen(false))}
          >
            <span>关闭</span>
          </button>
        ) : null}
      </span>
    </header>
  )

  const body = (
    <div className="esd-fd-body">
      {/* ── 左：文件导入 ── */}
      <section className="esd-fd-col" aria-label="文件导入">
        <div className="esd-fd-col-title">
          <SecIcon name="inbox" size={15} />
          <span>文件导入</span>
          <span className="esd-fd-count">{inbox.length}</span>
        </div>
        <div
          className={'esd-fd-drop' + (dragOver ? ' esd-fd-drop-over' : '')}
          onDrop={(e) => void onDrop(e)}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          aria-label="把文件拖到这里导入，或点击选择文件"
        >
          <SecIcon name="upload" size={26} />
          <div className="esd-fd-drop-main">{dragOver ? '松开鼠标即可导入' : '把文件拖到这里'}</div>
          <div className="esd-fd-drop-sub">或点击选择文件 · 支持任意格式</div>
        </div>
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => void onPick(e)} />

        <div className="esd-fd-list-head">
          <span>收件箱 inbox</span>
          <span className="esd-fd-list-hint">{busy ? '处理中…' : '待处理文件'}</span>
        </div>
        {!loaded ? (
          <div className="esd-fd-empty">读取中…</div>
        ) : inbox.length === 0 ? (
          <div className="esd-fd-empty">暂无文件。拖入文件或点击上方区域导入。</div>
        ) : (
          <ul className="esd-fd-list">
            {inbox.map((f) => (
              <li key={'in:' + f.name} className="esd-fd-item" draggable onDragStart={(e) => onDragStart(e, f)}>
                <SecIcon name="file" size={14} />
                <span className="esd-fd-name" title={f.name}>
                  {f.name}
                </span>
                <span className="esd-fd-meta">{fmtSize(f.size)}</span>
                <span className="esd-fd-meta">{fmtTime(f.modified)}</span>
                <button type="button" className="esd-fd-act" title="把处理指令填进会话输入框" disabled={busy} onClick={() => void handToAi(f.name)}>
                  <SecIcon name="process" size={13} />
                  <span>交给 AI</span>
                </button>
                <button type="button" className="esd-fd-act esd-fd-act-danger" title="删除" disabled={busy} onClick={() => void doDelete('inbox', f.name)}>
                  <SecIcon name="trash" size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── 右：结果导出 ── */}
      <section className="esd-fd-col" aria-label="结果导出">
        <div className="esd-fd-col-title">
          <SecIcon name="outbox" size={15} />
          <span>处理结果</span>
          <span className="esd-fd-count">{outbox.length}</span>
        </div>
        <div className="esd-fd-tip">
          <SecIcon name="dragexport" size={16} />
          <span>
            把右侧文件<strong>直接拖到桌面或文件夹</strong>即可保存到本机；也可点「下载」。
          </span>
        </div>

        <div className="esd-fd-list-head">
          <span>结果箱 outbox</span>
          <span className="esd-fd-list-hint">{busy ? '处理中…' : 'AI 处理产出'}</span>
        </div>
        {!loaded ? (
          <div className="esd-fd-empty">读取中…</div>
        ) : outbox.length === 0 ? (
          <div className="esd-fd-empty">暂无处理结果。左侧导入文件并在会话里让 AI 处理后，结果会出现在这里。</div>
        ) : (
          <ul className="esd-fd-list">
            {outbox.map((f) => (
              <li key={'out:' + f.name} className="esd-fd-item esd-fd-item-out" draggable onDragStart={(e) => onDragStart(e, f)}>
                <SecIcon name="file" size={14} />
                <span className="esd-fd-name" title={f.name}>
                  {f.name}
                </span>
                <span className="esd-fd-meta">{fmtSize(f.size)}</span>
                <span className="esd-fd-meta">{fmtTime(f.modified)}</span>
                <a
                  className="esd-fd-act"
                  href={downloadFileUrl('outbox', f.name)}
                  download={f.name}
                  title="下载到本机"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SecIcon name="download" size={13} />
                  <span>下载</span>
                </a>
                <button type="button" className="esd-fd-act esd-fd-act-danger" title="删除" disabled={busy} onClick={() => void doDelete('outbox', f.name)}>
                  <SecIcon name="trash" size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="esd-fd-path">服务器共享目录：/srv/dsh-share/outbox（也可经 /share/outbox/ 浏览）</div>
      </section>
    </div>
  )

  return (
    <div className={'esd-fd esd-fd-' + variant}>
      <div className="esd-fd-card">
        {head}
        {msg !== null ? (
          <div className={'esd-fd-msg ' + (msg.ok ? 'esd-fd-msg-ok' : 'esd-fd-msg-bad')}>
            <span>{msg.text}</span>
            <button type="button" className="esd-fd-act" onClick={() => setMsg(null)}>
              关闭
            </button>
          </div>
        ) : null}
        {body}
      </div>
    </div>
  )
}
