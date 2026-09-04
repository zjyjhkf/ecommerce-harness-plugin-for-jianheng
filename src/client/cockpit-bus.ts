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

/** 会话发送函数（由 client/index.tsx 在 apply 时注入 dsh conversation 服务） */
let conversationSender: ((text: string) => void) | null = null

/** cordis 根 context 引用（延迟动态获取 conversation 服务，规避加载顺序问题） */
let clientCtx: { get?(name: string): unknown } | null = null

/**
 * 保存 cordis 根 context。client/index.tsx 在 apply 时调用，
 * 之后点击商品时动态获取 conversation 服务（此时服务必然已就绪）。
 */
export function setClientContext(ctx: { get?(name: string): unknown } | null): void {
  clientCtx = ctx
}

/**
 * 注入会话发送能力。client/index.tsx 拿到 ctx.get('conversation') 后调用，
 * 之后 ShopDeskPanel 点击商品即可通过 sendToConversation 向会话框发送指令。
 */
export function registerConversationSender(sender: (text: string) => void): void {
  conversationSender = sender
}

/** React 受控组件兼容：用原生 setter 设置 value 并触发 input 事件 */
function setNativeValue(el: HTMLTextAreaElement, value: string): void {
  const proto = Object.getPrototypeOf(el)
  const desc = Object.getOwnPropertyDescriptor(proto, 'value')
  if (desc?.set !== undefined) {
    desc.set.call(el, value)
  } else {
    el.value = value
  }
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

/** 找到 dsh 会话输入框（textarea 优先，contenteditable 兜底） */
function findComposerTextarea(): HTMLTextAreaElement | null {
  if (typeof document === 'undefined') return null
  const tas = Array.from(document.querySelectorAll('textarea'))
  if (tas.length === 0) return null
  // 优先：placeholder 含「描述/输入/message/prompt」的输入框（dsh 会话 composer）
  const byPlaceholder = tas.find((t) => {
    const ph = (t.getAttribute('placeholder') ?? '').toLowerCase()
    return ph.includes('描述') || ph.includes('输入') || ph.includes('message') || ph.includes('prompt') || ph.includes('问')
  })
  if (byPlaceholder !== undefined) return byPlaceholder as HTMLTextAreaElement
  // 兜底：第一个 textarea
  return tas[0] as HTMLTextAreaElement
}

/** 通过 DOM 直接注入会话输入框（React 受控组件兼容） */
function insertIntoComposer(text: string): boolean {
  const ta = findComposerTextarea()
  if (ta === null) return false
  try {
    setNativeValue(ta, text)
    ta.focus()
    return true
  } catch {
    return false
  }
}

/** 通过 session scope 的 conversation 服务发送（直接发送，作为 DOM 注入失败时的备选） */
function sendViaSessionScope(text: string): boolean {
  if (clientCtx === null || typeof clientCtx.get !== 'function') return false
  try {
    const sessions = clientCtx.get('sessions') as {
      list?: { getSnapshot?: () => { current?: string | null } }
      scope?: (id: string) => unknown
    } | undefined
    const currentId = sessions?.list?.getSnapshot?.()?.current
    if (currentId !== undefined && currentId !== null && typeof sessions?.scope === 'function') {
      const scoped = sessions.scope(currentId) as {
        conversation?: { send?: (t: string) => unknown }
        get?: (name: string) => unknown
      }
      const conv = scoped?.conversation ?? (typeof scoped?.get === 'function' ? scoped.get('conversation') : undefined) as
        | { send?: (t: string) => unknown }
        | undefined
      if (conv !== undefined && typeof conv.send === 'function') {
        void conv.send(text)
        return true
      }
    }
  } catch (err) {
    console.error('[ecommerce-analyst] session scope 发送失败：', err)
  }
  return false
}

/** 向会话框发送一条指令（点击商品 → 生成分析指令）。
 *  优先级：① DOM 注入输入框（填充指令，用户可见可编辑） ② session scope conversation.send
 *  ③ 已注入的 sender ④ 剪贴板兜底 */
export function sendToConversation(text: string): { sent: boolean } {
  // ① DOM 直接注入会话输入框（首选：填充指令到输入框，符合「生成指令」语义）
  if (insertIntoComposer(text)) {
    return { sent: true }
  }
  // ② 通过 session scope 的 conversation 服务发送
  if (sendViaSessionScope(text)) {
    return { sent: true }
  }
  // ③ 已注入的 conversation sender（apply 时成功获取）
  if (conversationSender !== null) {
    try {
      conversationSender(text)
      return { sent: true }
    } catch (err) {
      console.error('[ecommerce-analyst] 发送会话指令失败：', err)
    }
  }
  // ④ 降级：复制到剪贴板
  if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function') {
    navigator.clipboard.writeText(text).catch(() => {})
  }
  return { sent: false }
}

/**
 * 向会话框「追加」一条内容（用于点击视图弹值：与已选中的 skill 短链接/其他指标
 * 拼合到同一输入框，实现「skill + 数据」组合后一起发送分析）。
 * 优先级同 sendToConversation；DOM 输入框存在时追加，否则退回覆盖式发送。
 */
export function appendToConversation(text: string): { sent: boolean } {
  if (typeof document !== 'undefined') {
    const ta = findComposerTextarea()
    if (ta !== null) {
      try {
        const cur = ta.value ?? ''
        const sep = cur.trim() === '' ? '' : '\n'
        setNativeValue(ta, cur + sep + text)
        ta.focus()
        return { sent: true }
      } catch {
        /* 落到覆盖式发送 */
      }
    }
  }
  return sendToConversation(text)
}

/**
 * sessions 服务运行时形状（dsh 客户端 SessionRuntime，仅用所需成员；延迟读取规避加载顺序）。
 * 发送提示词走 scope 会话的 conversation 服务（scope-addressed）——这是 dsh 官方契约：
 *   ctx.sessions.scope(id).conversation.send(text)
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
  scope?: (id: string) => { conversation?: { send?: (text: string) => Promise<unknown> } } | undefined
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
    const conversation = scoped?.conversation
    if (conversation === undefined || typeof conversation.send !== 'function') return false
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
    const r = sendToConversation(text)
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
    const r = sendToConversation(text)
    return { opened: r.sent, newSession: false }
  }

  const sent = await sendToSession(sessions, id, text)
  if (sent) return { opened: true, newSession }
  // 直接发送失败：降级 DOM 注入/剪贴板
  const r = sendToConversation(text)
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
