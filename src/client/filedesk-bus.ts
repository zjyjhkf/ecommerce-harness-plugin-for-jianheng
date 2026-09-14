/**
 * ecommerce-analyst-plugin — 「文件处理」整页开关总线
 *
 * 左侧栏圆形按钮（sidebar.footer.action）点一下进入整页的「文件处理」；
 * 与 cockpit-bus 同构：模块级状态 + 订阅者 + window 事件（便于脚本化与调试）。
 * 页面同时注册为 conversation.view 标签（与「数据查看」同族入口），
 * 两条路径渲染同一个组件。
 */

let open = false
const subscribers = new Set<(open: boolean) => void>()

function notify(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<{ open: boolean }>('ecommerce:filedesk-toggle', { detail: { open } }))
  }
  for (const fn of subscribers) {
    try {
      fn(open)
    } catch {
      /* 单个订阅者抛错不影响其他 */
    }
  }
}

export function isFileDeskOpen(): boolean {
  return open
}

export function toggleFileDesk(): void {
  open = !open
  notify()
}

export function setFileDeskOpen(next: boolean): void {
  if (next === open) return
  open = next
  notify()
}

export function subscribeFileDesk(fn: (open: boolean) => void): () => void {
  subscribers.add(fn)
  return () => {
    subscribers.delete(fn)
  }
}
