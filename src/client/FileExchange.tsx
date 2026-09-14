/**
 * ecommerce-analyst-plugin — 「文件交换」面板组件(客户端)
 *
 * 承担「上传 → AI 处理 → 下载」里的传输环节:上传任意文件到服务器收件箱,
 * 列出收件箱(inbox)与结果箱(outbox),支持下载到本机与删除。AI 处理发生在
 * dsh 会话里(用户上传后去会话让 AI 处理,结果写到 outbox 后即可在此下载)。
 */
import * as React from 'react'
import { deleteFile, downloadFileUrl, listFiles, uploadFile, type FileEntry } from './data.ts'

function fmtSize(n: number): string {
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / 1024 / 1024).toFixed(2) + ' MB'
}

interface FileListProps {
  title: string
  entries: FileEntry[]
  dir: 'inbox' | 'outbox'
  busy: boolean
  onDelete: (dir: 'inbox' | 'outbox', name: string) => void
}

function FileList({ title, entries, dir, busy, onDelete }: FileListProps): React.ReactElement {
  return (
    <div className="esd-files-group">
      <div className="esd-files-group-title">
        {title}
        <span className="esd-files-count">{entries.length}</span>
      </div>
      {entries.length === 0 ? (
        <div className="esd-files-empty">{dir === 'inbox' ? '暂无上传文件' : '暂无处理结果'}</div>
      ) : (
        <ul className="esd-files-list">
          {entries.map((f) => (
            <li key={dir + ':' + f.name} className="esd-files-item">
              <span className="esd-files-name" title={f.name}>
                {f.name}
              </span>
              <span className="esd-files-size">{fmtSize(f.size)}</span>
              <a
                className="esd-files-act"
                href={downloadFileUrl(dir, f.name)}
                download={f.name}
                title="下载到本机"
              >
                下载
              </a>
              <button
                type="button"
                className="esd-files-act esd-files-del"
                title="删除"
                disabled={busy}
                onClick={() => onDelete(dir, f.name)}
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function FileExchange(): React.ReactElement {
  const [inbox, setInbox] = React.useState<FileEntry[]>([])
  const [outbox, setOutbox] = React.useState<FileEntry[]>([])
  const [busy, setBusy] = React.useState(false)
  const [msg, setMsg] = React.useState<{ ok: boolean; text: string } | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const mountedRef = React.useRef(true)

  const refresh = React.useCallback(async (): Promise<void> => {
    try {
      const [i, o] = await Promise.all([listFiles('inbox'), listFiles('outbox')])
      if (mountedRef.current) {
        setInbox(i)
        setOutbox(o)
      }
    } catch (err) {
      if (mountedRef.current) {
        setMsg({ ok: false, text: '刷新失败:' + (err instanceof Error ? err.message : String(err)) })
      }
    }
  }, [])

  React.useEffect(() => {
    mountedRef.current = true
    void refresh()
    return () => {
      mountedRef.current = false
    }
  }, [refresh])

  const onPick = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const files = Array.from(event.target.files ?? [])
      event.target.value = ''
      if (files.length === 0) return
      setBusy(true)
      setMsg(null)
      let done = 0
      try {
        for (const f of files) {
          await uploadFile(f)
          done++
        }
        if (mountedRef.current) setMsg({ ok: true, text: `已上传 ${done} 个文件到收件箱,去会话里让 AI 处理即可` })
        await refresh()
      } catch (err) {
        if (mountedRef.current) {
          setMsg({ ok: false, text: '上传失败:' + (err instanceof Error ? err.message : String(err)) })
        }
      } finally {
        if (mountedRef.current) setBusy(false)
      }
    },
    [refresh],
  )

  const onDelete = React.useCallback(
    async (dir: 'inbox' | 'outbox', name: string): Promise<void> => {
      setBusy(true)
      setMsg(null)
      try {
        await deleteFile(dir, name)
        if (mountedRef.current) setMsg({ ok: true, text: `已删除 ${name}` })
        await refresh()
      } catch (err) {
        if (mountedRef.current) setMsg({ ok: false, text: '删除失败:' + (err instanceof Error ? err.message : String(err)) })
      } finally {
        if (mountedRef.current) setBusy(false)
      }
    },
    [refresh],
  )

  return (
    <div className="esd-files">
      <div className="esd-files-head">
        <button type="button" className="esd-icon-btn esd-files-upload" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? '⏳' : '📤'} 上传文件
        </button>
        <button type="button" className="esd-icon-btn" disabled={busy} onClick={() => void refresh()} title="刷新">
          🔄
        </button>
        <span className="esd-files-tip">上传到收件箱 → 会话里让 AI 处理 → 结果从「处理结果」下载</span>
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => void onPick(e)} />
      </div>
      {msg !== null ? (
        <div className={'esd-import ' + (msg.ok ? 'esd-import-ok' : 'esd-import-bad')}>
          <span className="esd-import-msg">{msg.text}</span>
          <button type="button" className="esd-refresh-btn" onClick={() => setMsg(null)}>
            关闭
          </button>
        </div>
      ) : null}
      <FileList title="收件箱 inbox" entries={inbox} dir="inbox" busy={busy} onDelete={(d, n) => void onDelete(d, n)} />
      <FileList title="处理结果 outbox" entries={outbox} dir="outbox" busy={busy} onDelete={(d, n) => void onDelete(d, n)} />
    </div>
  )
}
