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

/** 订阅者集合 */
const subscribers = new Set<(open: boolean) => void>()

/** 切换 open 状态，通知所有订阅者 */
export function toggleCockpit(): void {
  cockpitOpen = !cockpitOpen
  notify(cockpitOpen)
}

/** 设置 open 状态，必要时通知 */
export function setCockpitOpen(open: boolean): void {
  if (open === cockpitOpen) return
  cockpitOpen = open
  notify(open)
}

/** 读取当前 open 状态 */
export function isCockpitOpen(): boolean {
  return cockpitOpen
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

export function subscribeFullscreen(fn: (fs: boolean) => void): () => void {
  fullscreenSubscribers.add(fn)
  return () => {
    fullscreenSubscribers.delete(fn)
  }
}
