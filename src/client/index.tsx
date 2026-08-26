/**
 * ecommerce-analyst-plugin — 客户端入口（数据查看）
 *
 * UI 策略（v0.5 起）：
 *  - 不再占用顶部对话 dock 入口，避免与 cockpit 的「行动清单」并排造成冗余；
 *  - 只注册 sidebar.footer.action 一个圆形总控按钮，同时负责打开 / 关闭 / 收起；
 *  - 保留 conversation.view 对话 Tab（点击即可打开）和 shell.overlay 兜底层；
 *  - 所有入口共享 cockpit-bus 中的 open 状态，任一节点 toggle 全局同步。
 *
 * 依赖：仅 react（宿主提供）。零外部运行时依赖。
 */
import * as React from 'react'
import { ShopDeskPanel, ShopDeskTab } from './ShopDeskPanel.tsx'
import { injectStyles } from './styles.ts'
import { BrandMark } from './brand.tsx'
import {
  isCockpitOpen,
  registerConversationSender,
  setClientContext,
  subscribeCockpit,
  toggleCockpit,
} from './cockpit-bus.ts'

/** 客户端插件依赖的 cordis 服务（与 commerce-cockpit 0.1.2 一致） */
export const inject = ['slots']

/** 最小 slots 服务形状（宿主运行时提供；避免引入运行时类型依赖） */
interface SlotsLike {
  inject(key: string, callback: () => unknown): unknown
  register(
    options: {
      name: string
      id: string
      order?: number
      label?: string | (() => string)
    },
    component: unknown,
  ): () => void
}

interface ClientContext {
  slots: SlotsLike
  get?(name: string): unknown
  effect?(disposer: () => unknown, label?: string): unknown
}

/** 唯一圆形总控按钮：sidebar.footer.action（无论打开/关闭状态，唯一入口） */
function DataFooterLauncher(): React.ReactElement {
  const [, force] = React.useState(0)
  React.useEffect(() => subscribeCockpit(() => force((n) => n + 1)), [])
  const open = isCockpitOpen()
  return React.createElement(
    'button',
    {
      type: 'button',
      className: 'esd-footer-btn' + (open ? ' esd-footer-btn-active' : ''),
      title: open ? '收起数据查看' : '展开数据查看',
      'aria-label': open ? '收起数据查看' : '展开数据查看',
      onClick: (): void => {
        toggleCockpit()
      },
    },
    React.createElement(BrandMark, { size: 16 }),
  )
}

/** 会话发送服务（点击商品生成分析指令时注入到 cockpit-bus） */
interface ConversationLike {
  send?(text: string): unknown
}

/**
 * 客户端插件主体：注册 3 个形态的入口（统一由 sidebar.footer.action 圆形总控开关控制）。
 * - sidebar.footer.action ：DSH Desktop 侧边栏底部唯一圆形入口（打开/关闭/收起）
 * - conversation.view     ：对话 Tab（点击直接打开数据查看 Tab）
 * - shell.overlay         ：兜底层（若以上插槽在某些版本不被识别）
 *
 * 同时注入 conversation 服务供「点击商品 → 会话指令」使用。
 */
export function apply(ctx: ClientContext): void {
  try {
    injectStyles()
  } catch (err) {
    console.error('[ecommerce-analyst] 样式注入失败：', err)
  }

  /* 注入会话发送能力：保存 ctx 引用，点击商品时动态获取 conversation 服务 */
  setClientContext(ctx)
  if (typeof ctx.get === 'function') {
    const conv = ctx.get('conversation') as ConversationLike | undefined
    if (conv !== undefined && typeof conv.send === 'function') {
      registerConversationSender((text: string) => {
        void conv.send!(text)
      })
    }
  }

  /* 唯一圆形总控入口（sidebar.footer.action）——桌面端侧边栏底部唯一开关按钮 */
  ctx.slots.inject('sidebar.footer.action', () =>
    ctx.slots.register(
      {
        name: 'sidebar.footer.action',
        id: 'ecommerce-cockpit-footer',
        order: 100,
        label: (): string => '数据查看',
      },
      DataFooterLauncher,
    ),
  )

  /* 对话视图 Tab（点击直接进入数据查看面板） */
  ctx.slots.inject('conversation.view', () =>
    ctx.slots.register(
      {
        name: 'conversation.view',
        id: 'ecommerce-cockpit-view',
        order: 25,
        label: (): string => '数据查看',
      },
      ShopDeskTab,
    ),
  )

  /* 兜底 shell.overlay（若以上插槽在某些版本不被识别，ShopDeskPanel 内部 d.open 控制显隐） */
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: 'ecommerce-shop-desk',
        order: 110,
        label: '数据查看',
      },
      ShopDeskPanel,
    ),
  )
}
