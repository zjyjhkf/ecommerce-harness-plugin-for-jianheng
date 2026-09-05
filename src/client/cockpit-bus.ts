/**
 * 全局驾驶舱开关总线（驾驶舱 ↔ 侧边栏入口、dock 按钮、footer 入口联动）
 *
 * 跨组件状态共享：所有客户端入口（center dock / sidebar footer / shell.overlay
 * 中的 ShopDeskPanel）通过此总线共享 open 状态，任一节点 toggle 都会通知其他节点。
 *
 * 同时广播 window CustomEvent('ecommerce:cockpit-toggle')，便于脚本化操作。
 */

/** 当前驾驶舱 open 状态 */
let cockpitOpen = false

/** 是否曾打开过驾驶舱（点击右下角插件 logo 启动后置 true，永不回退）。
 *  仅用于「曾打开过」订阅通知；dock 技能条的显隐不再依赖此 latch，
 *  改由可逆的 body 类 `esd-cockpit-open` 控制（见 syncDockVisibility）。 */
let cockpitEverOpened = false

/** 订阅者集合 */
const subscribers = new Set<(open: boolean) => void>()

/** 「曾打开过」订阅者集合（一次从 false→true 后只通知一次） */
const openedSubscribers = new Set<() => void>()

function markOpened(): void {
  if (cockpitEverOpened) return
  cockpitEverOpened = true
  for (const fn of openedSubscribers) {
    try {
      fn()
    } catch {
      // 单个订阅者抛错不影响其他订阅者
    }
  }
}

/** 同步 <body> 的 `esd-cockpit-open` 标记（可逆）：侧边栏打开时加类、关闭时移除。
 *  dock 技能条据此显隐——打开侧边栏「呼出」技能条，关闭侧边栏后技能条「归位」
 *  回到初始隐藏状态（不再像旧的 esd-cockpit-opened latch 那样永久保留）。 */
function syncDockVisibility(open: boolean): void {
  if (typeof document === 'undefined') return
  document.body?.classList.toggle('esd-cockpit-open', open)
}

/** 切换 open 状态，通知所有订阅者 */
export function toggleCockpit(): void {
  cockpitOpen = !cockpitOpen
  if (cockpitOpen) markOpened()
  else resetFullscreen()
  syncDockVisibility(cockpitOpen)
  notify(cockpitOpen)
}

/** 设置 open 状态，必要时通知 */
export function setCockpitOpen(open: boolean): void {
  if (open === cockpitOpen) return
  cockpitOpen = open
  if (open) markOpened()
  else resetFullscreen()
  syncDockVisibility(open)
  notify(open)
}

/** 读取当前 open 状态 */
export function isCockpitOpen(): boolean {
  return cockpitOpen
}

/** 是否曾打开过驾驶舱（一旦为 true 不再回退） */
export function isCockpitEverOpened(): boolean {
  return cockpitEverOpened
}

/** 订阅「曾打开过」状态（若已打开过则立即同步回调一次） */
export function subscribeCockpitOpened(fn: () => void): () => void {
  openedSubscribers.add(fn)
  if (cockpitEverOpened) fn()
  return () => {
    openedSubscribers.delete(fn)
  }
}

/** 订阅 open 状态变化，返回取消订阅函数 */
export function subscribeCockpit(fn: (open: boolean) => void): () => void {
  subscribers.add(fn)
  return () => {
    subscribers.delete(fn)
  }
}

function notify(open: boolean): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<{ open: boolean }>('ecommerce:cockpit-toggle', { detail: { open } }),
    )
  }
  for (const fn of subscribers) {
    try {
      fn(open)
    } catch {
      // 单个订阅者抛错不影响其他订阅者
    }
  }
}

/* ────────────────────────── 会话指令注入 ────────────────────────── */

/** cordis 根 context 引用（点击时刻动态获取 sessions/conversation 服务，规避加载顺序问题） */
let clientCtx: { get?(name: string): unknown } | null = null

/**
 * 保存 cordis 根 context。client/index.tsx 在 apply 时调用，
 * 之后点击技能/商品时动态获取 sessions + conversation 服务（此时服务必然已就绪）。
 */
export function setClientContext(ctx: { get?(name: string): unknown } | null): void {
  clientCtx = ctx
}

/**
 * dsh 会话 scope（sessions.scope(id) 返回的 AgentContext）最小形状。
 * 它是 cordis Context：官方契约经 `scoped.get('conversation')` 取 scope-addressed
 * conversation 服务；部分 shell 直接以 `scoped.conversation` 暴露，二者都兼容。
 */
interface ScopedContextLike {
  get?(name: string): unknown
  conversation?: unknown
}

/** conversation 服务最小形状（IConversation：send + input 门面）。 */
interface ConversationServiceLike {
  send?: (text: string) => Promise<unknown> | unknown
  input?: {
    for?: (actx: unknown) => SessionInputLike | undefined
  }
}

/** SessionInput 门面最小形状（setDraft + notify + state.draft）。 */
interface SessionInputLike {
  setDraft?: (text: string) => void
  notify?: (level: 'info' | 'error', text: string) => void
  state?: { getSnapshot?: () => { draft?: string } }
}

type SessionResolveResult =
  | { ok: true; scoped: ScopedContextLike; conversation: ConversationServiceLike | null }
  | { ok: false; reason: string }

/**
 * 点击时刻按「当前会话」解析 sessions scope 与 conversation 服务。
 * 这是 dsh 官方发送契约（见 harness apply.ts scopedConversation）：
 *   ctx.sessions.list.getSnapshot().current → id
 *   ctx.sessions.scope(id) → AgentContext（cordis Context）
 *   scoped.get('conversation') → scope-addressed IConversation（send 走该会话）
 * 失败返回 { ok:false, reason }，reason 用于可见反馈与 console.error。
 */
function resolveCurrentSession(): SessionResolveResult {
  if (clientCtx === null || typeof clientCtx.get !== 'function') {
    return { ok: false, reason: '客户端 context 未注入' }
  }
  let sessions: SessionsLike | undefined
  try {
    sessions = clientCtx.get('sessions') as SessionsLike | undefined
  } catch (err) {
    console.error('[ecommerce-analyst] 获取 sessions 服务失败：', err)
    return { ok: false, reason: 'sessions 服务获取失败' }
  }
  if (sessions === undefined || sessions === null) return { ok: false, reason: 'sessions 服务不可用' }

  let currentId: string | null | undefined
  try {
    currentId = sessions.list?.getSnapshot?.()?.current
  } catch (err) {
    console.error('[ecommerce-analyst] 读取当前会话失败：', err)
    return { ok: false, reason: '当前会话快照读取失败' }
  }
  if (currentId === undefined || currentId === null || currentId === '') {
    return { ok: false, reason: '无当前会话' }
  }
  if (typeof sessions.scope !== 'function') return { ok: false, reason: 'sessions.scope 不可用' }

  let scoped: ScopedContextLike | undefined
  try {
    scoped = sessions.scope(currentId) as ScopedContextLike | undefined
  } catch (err) {
    console.error('[ecommerce-analyst] 获取会话 scope 失败：', err)
    return { ok: false, reason: '会话 scope 获取失败' }
  }
  if (scoped === undefined || scoped === null) return { ok: false, reason: '会话 scope 为空' }

  let conversation: ConversationServiceLike | null = null
  try {
    if (typeof scoped.get === 'function') {
      conversation = (scoped.get('conversation') as ConversationServiceLike | undefined) ?? null
    }
    if (conversation === null && scoped.conversation !== undefined && scoped.conversation !== null) {
      conversation = scoped.conversation as ConversationServiceLike
    }
  } catch (err) {
    console.error('[ecommerce-analyst] 获取 conversation 服务失败：', err)
  }

  return { ok: true, scoped, conversation }
}

/** 可见 toast（DOM 注入，无 React 依赖；渲染失败不影响发送主流程） */
function showToast(message: string, kind: 'info' | 'error' = 'info'): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  try {
    let host = document.getElementById('esd-toast-host')
    if (host === null) {
      host = document.createElement('div')
      host.id = 'esd-toast-host'
      document.body.appendChild(host)
    }
    const el = document.createElement('div')
    el.className = 'esd-toast esd-toast-' + kind
    el.textContent = message
    host.appendChild(el)
    window.setTimeout(() => {
      el.remove()
    }, 3200)
  } catch {
    /* toast 渲染失败不影响主流程 */
  }
}

/** 复制到剪贴板（仅在明确告知用户后才调用，绝不静默降级） */
function copyToClipboard(text: string): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function') {
      navigator.clipboard.writeText(text).catch(() => {})
    }
  } catch {
    /* ignore */
  }
}

/** 主路径：点击时刻按当前会话直接发送（官方 scope-addressed conversation.send）。 */
async function sendViaCurrentSession(text: string): Promise<{ sent: boolean; reason: string }> {
  const res = resolveCurrentSession()
  if (!res.ok) return { sent: false, reason: res.reason }
  const conv = res.conversation
  if (conv === null || typeof conv.send !== 'function') {
    return { sent: false, reason: 'conversation.send 不可用' }
  }
  try {
    await conv.send(text)
    return { sent: true, reason: '' }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    console.error('[ecommerce-analyst] 技能命令发送失败：', err)
    return { sent: false, reason }
  }
}

/** 兜底路径：填入当前会话输入框并聚焦（官方 input 门面 setDraft + notify），用户回车发送。 */
function fillCurrentInput(text: string): boolean {
  const res = resolveCurrentSession()
  if (!res.ok) return false
  const input = res.conversation?.input
  if (input === undefined || input === null || typeof input.for !== 'function') return false
  try {
    const facade = input.for(res.scoped)
    if (facade === undefined || facade === null || typeof facade.setDraft !== 'function') return false
    facade.setDraft(text)
    if (typeof facade.notify === 'function') facade.notify('info', '已填入命令，回车发送')
    showToast('命令已填入输入框，回车发送')
    return true
  } catch (err) {
    console.error('[ecommerce-analyst] 填入输入框失败：', err)
    return false
  }
}

/**
 * 向会话框发送一条指令（点击技能 → 生成 /slug 触发技能注入；点击商品 → 生成分析指令）。
 * 优先级：
 *  ① 主路径：点击时按「当前会话」直接发送（官方 sessions.scope(id).get('conversation').send）
 *  ② 兜底：填入输入框并聚焦（官方 input 门面 setDraft + notify + toast）
 *  ③ 全失败：可见 toast + console.error + 复制到剪贴板（绝不静默）
 * 禁止再依赖对输入框 placeholder 的字符串猜测，或悄悄复制到剪贴板。
 */
export async function sendToConversation(text: string): Promise<{ sent: boolean }> {
  // ① 主路径：当前会话直接发送
  const viaSession = await sendViaCurrentSession(text)
  if (viaSession.sent) return { sent: true }

  // ② 兜底：填入输入框（官方 input 门面）
  if (fillCurrentInput(text)) return { sent: true }

  // ③ 全失败：可见反馈 + 剪贴板兜底（告知用户，绝不静默）
  const skillId = text.startsWith('/') ? text.slice(1) : text
  console.error('[ecommerce-analyst] 技能命令发送失败：', { text, reason: viaSession.reason })
  showToast(`未能发送「${skillId}」，已复制到剪贴板，请手动粘贴发送`, 'error')
  copyToClipboard(text)
  return { sent: false }
}

/**
 * 仅把指令填入当前会话输入框（**不发送**）。
 * 用于「技能条点击」：填入 /slug 后等待用户继续点击视图追加数据，
 * 最后由用户手动回车发送，实现「skill + 数据」组合分析（而非点击即直接发送）。
 * 填入成功返回 { sent: true }（语义 = 已填入待发送）；失败走可见反馈 + 剪贴板。
 */
export async function fillConversationInput(text: string): Promise<{ sent: boolean }> {
  if (fillCurrentInput(text)) return { sent: true }
  const skillId = text.startsWith('/') ? text.slice(1) : text
  console.error('[ecommerce-analyst] 技能命令填入失败：', { text })
  showToast(`未能填入「${skillId}」，已复制到剪贴板，请手动粘贴`, 'error')
  copyToClipboard(text)
  return { sent: false }
}

/**
 * 向会话框「追加」一条内容（用于点击视图弹值：与已选中的 skill 短链接/其他指标
 * 拼合到同一输入框，实现「skill + 数据」组合后一起发送分析）。
 * 读当前草稿 → setDraft(旧草稿 + '\n' + text) + notify + toast（官方 input 门面）；
 * 无 input 门面时退回覆盖式发送（sendToConversation）。
 */
export async function appendToConversation(text: string): Promise<{ sent: boolean }> {
  const res = resolveCurrentSession()
  if (res.ok) {
    const input = res.conversation?.input
    if (input !== undefined && input !== null && typeof input.for === 'function') {
      try {
        const facade = input.for(res.scoped)
        if (facade !== undefined && facade !== null && typeof facade.setDraft === 'function') {
          const current = (typeof facade.state?.getSnapshot === 'function' ? facade.state.getSnapshot().draft : undefined) ?? ''
          const sep = current.trim() === '' ? '' : '\n'
          facade.setDraft(current + sep + text)
          if (typeof facade.notify === 'function') facade.notify('info', '已追加到输入框，回车发送')
          showToast('已追加到输入框，回车发送')
          return { sent: true }
        }
      } catch (err) {
        console.error('[ecommerce-analyst] 追加到输入框失败：', err)
      }
    }
  }
  // 退回覆盖式发送
  return sendToConversation(text)
}

/**
 * sessions 服务运行时形状（dsh 客户端 SessionRuntime，仅用所需成员；延迟读取规避加载顺序）。
 * 发送提示词走 scope 会话的 conversation 服务（scope-addressed）——这是 dsh 官方契约：
 *   ctx.sessions.scope(id).get('conversation').send(text)
 * 直接以用户消息形式送入该会话并触发 AI 分析，无需 DOM 注入会话输入框。
 */
interface SessionsLike {
  list?: {
    getSnapshot?: () => {
      current?: string | null
      byId?: Record<string, { cwd?: string }>
    }
  }
  create?: (opts?: { workspaceId?: string; cwd?: string; sessionId?: string }) => Promise<string>
  open?: (id: string) => void
  scope?: (id: string) => ScopedContextLike | undefined
}

/** workspaces 服务运行时形状（dsh WorkspaceService，仅用 list 快照定位当前分组）。 */
interface WorkspacesLike {
  list?: {
    getSnapshot?: () => {
      items?: Array<{ workspaceId?: string; path?: string; sessionIds?: string[] }>
      recentWorkspaceId?: string | undefined
    }
  }
}

function getSessions(): SessionsLike | null {
  if (clientCtx === null || typeof clientCtx.get !== 'function') return null
  try {
    return (clientCtx.get('sessions') as SessionsLike | undefined) ?? null
  } catch {
    return null
  }
}

/** 读取当前会话的 cwd（目录=分组），供无 workspaces 服务时兜底新建同分组会话 */
function currentSessionCwd(sessions: SessionsLike): string | undefined {
  try {
    const snap = sessions.list?.getSnapshot?.()
    const cur = snap?.current
    if (cur !== null && cur !== undefined && snap?.byId !== undefined) {
      const cwd = snap.byId[cur]?.cwd
      if (typeof cwd === 'string' && cwd !== '') return cwd
    }
  } catch {
    /* ignore */
  }
  return undefined
}

/** 定位当前会话所在的「会话分组」workspaceId（多级兜底） */
function currentWorkspaceId(sessions: SessionsLike): string | undefined {
  try {
    if (clientCtx === null || typeof clientCtx.get !== 'function') return undefined
    const workspaces = clientCtx.get('workspaces') as WorkspacesLike | undefined
    const wsSnap = workspaces?.list?.getSnapshot?.()
    const items = wsSnap?.items ?? []
    if (items.length === 0) return undefined
    const sessionsSnap = sessions.list?.getSnapshot?.()
    const current = sessionsSnap?.current
    if (current !== null && current !== undefined) {
      // 优先：分组 account 含当前会话
      const byMember = items.find((w) => (w.sessionIds ?? []).includes(current))?.workspaceId
      if (byMember !== undefined) return byMember
      // 兜底：分组 path 与当前会话 cwd 一致
      const cwd = sessionsSnap?.byId?.[current]?.cwd
      if (typeof cwd === 'string' && cwd !== '') {
        const byPath = items.find((w) => w.path === cwd)?.workspaceId
        if (byPath !== undefined) return byPath
      }
    }
    // 最后：最近使用的分组
    const recent = wsSnap?.recentWorkspaceId
    if (typeof recent === 'string' && recent !== '') return recent
  } catch {
    /* ignore */
  }
  return undefined
}

/**
 * 在当前会话分组内新建一个会话并选中。优先用 workspaceId（官方「新建会话」口径），
 * 缺失时用 cwd 兜底，再退化为默认 create({})。返回新会话 id（失败 null）。
 */
async function createSessionInCurrentGroup(sessions: SessionsLike): Promise<string | null> {
  try {
    if (typeof sessions.create !== 'function') return null
    const workspaceId = currentWorkspaceId(sessions)
    const cwd = workspaceId === undefined ? currentSessionCwd(sessions) : undefined
    const opts = workspaceId !== undefined ? { workspaceId } : cwd !== undefined ? { cwd } : {}
    const id = await sessions.create(opts)
    if (typeof id !== 'string' || id === '') return null
    if (typeof sessions.open === 'function') sessions.open(id)
    return id
  } catch (err) {
    console.error('[ecommerce-analyst] 新建会话失败：', err)
    return null
  }
}

/** 经 scope 会话的 conversation 服务直接发送提示词（触发 AI 以文字形式输出分析） */
async function sendToSession(sessions: SessionsLike, id: string, text: string): Promise<boolean> {
  try {
    if (typeof sessions.scope !== 'function') return false
    const scoped = sessions.scope(id)
    if (scoped === undefined || scoped === null) return false
    let conversation: ConversationServiceLike | null = null
    if (typeof scoped.get === 'function') {
      conversation = (scoped.get('conversation') as ConversationServiceLike | undefined) ?? null
    }
    if (conversation === null && scoped.conversation !== undefined && scoped.conversation !== null) {
      conversation = scoped.conversation as ConversationServiceLike
    }
    if (conversation === null || typeof conversation.send !== 'function') return false
    await conversation.send(text)
    return true
  } catch (err) {
    console.error('[ecommerce-analyst] 会话发送失败：', err)
    return false
  }
}

/** 链接预警分析会话：首次点击新建，后续点击复用同一会话（不重复新建） */
let linkWarnSessionId: string | null = null

/** 测试专用：重置链接预警会话跟踪（保证用例间隔离） */
export function resetLinkWarnSessionForTest(): void {
  linkWarnSessionId = null
}

/**
 * 开启全新会话并自动输入指令（点击退款商品名 → 链接预警分析）。
 * 首次点击：在当前会话分组内新建一个会话并选中；后续点击：复用已开启的会话，
 * 不再新建。提示词经 scope 会话的 conversation 服务直接发送（AI 以文字交流形式输出分析）。
 * 返回 { opened, newSession }：opened=是否已发送；newSession=本次是否新建了会话。
 */
export async function openNewConversation(text: string): Promise<{ opened: boolean; newSession: boolean }> {
  const sessions = getSessions()
  if (sessions === null) {
    const r = await sendToConversation(text)
    return { opened: r.sent, newSession: false }
  }

  // 已开启的链接预警会话仍在列表则复用，否则新建
  let id = linkWarnSessionId
  let stillExists = false
  try {
    const snap = sessions.list?.getSnapshot?.()
    stillExists = id !== null && snap?.byId !== undefined && Object.prototype.hasOwnProperty.call(snap.byId, id)
  } catch {
    /* ignore */
  }

  let newSession = false
  if (!stillExists) {
    id = await createSessionInCurrentGroup(sessions)
    newSession = id !== null
    if (id !== null) linkWarnSessionId = id
  } else if (id !== null && typeof sessions.open === 'function') {
    sessions.open(id) // 确保当前指向复用会话
  }

  if (id === null) {
    // 新建失败：降级到当前会话注入/剪贴板
    const r = await sendToConversation(text)
    return { opened: r.sent, newSession: false }
  }

  const sent = await sendToSession(sessions, id, text)
  if (sent) return { opened: true, newSession }
  // 直接发送失败：降级 DOM 注入/剪贴板
  const r = await sendToConversation(text)
  return { opened: r.sent, newSession }
}

/* ────────────────────────── 全屏状态 ────────────────────────── */

let fullscreen = false
const fullscreenSubscribers = new Set<(fs: boolean) => void>()

export function isFullscreen(): boolean {
  return fullscreen
}

export function toggleFullscreen(): void {
  fullscreen = !fullscreen
  for (const fn of fullscreenSubscribers) {
    try {
      fn(fullscreen)
    } catch {
      // ignore
    }
  }
}

/** 关闭侧边栏时归位全屏状态：避免「进入全屏 → 关闭侧边栏 → 重新打开」时面板仍停留在
 *  全屏、覆盖会话与 skill 条。仅在 fullscreen=true 时重置并通知订阅者。 */
function resetFullscreen(): void {
  if (!fullscreen) return
  fullscreen = false
  for (const fn of fullscreenSubscribers) {
    try {
      fn(fullscreen)
    } catch {
      // ignore
    }
  }
}

export function subscribeFullscreen(fn: (fs: boolean) => void): () => void {
  fullscreenSubscribers.add(fn)
  return () => {
    fullscreenSubscribers.delete(fn)
  }
}
