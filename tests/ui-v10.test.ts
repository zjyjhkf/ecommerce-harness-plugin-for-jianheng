/**
 * v0.10 测试集：会话指令注入链路（点击商品 → 会话框生成指令）
 *
 * 覆盖 cockpit-bus.sendToConversation 的新三层 fallback（官方 session scope 发送契约）：
 *  ① 主路径：sessions.scope(id).get('conversation').send（点击时刻按当前会话直接发送）
 *  ② 兜底：conversation.input.for(scoped).setDraft（填入输入框 + notify + toast）
 *  ③ 全失败：可见 toast + console.error + 剪贴板（绝不静默）
 * 以及 openNewConversation 的会话分组新建/复用链路。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  openNewConversation,
  resetLinkWarnSessionForTest,
  sendToConversation,
  setClientContext,
} from '../src/client/cockpit-bus.ts'

test('v0.10 [cockpit-bus] 无 sessions 服务时全失败返回 sent=false（node 无 DOM，绝不静默）', async () => {
  setClientContext({ get: () => undefined })
  const result = await sendToConversation('测试指令')
  assert.equal(result.sent, false)
  setClientContext(null)
})

test('v0.10 [cockpit-bus] 主路径：点击时按当前会话直接发送（scoped.get("conversation").send）', async () => {
  const sent: string[] = []
  const scoped = {
    get: (name: string) => (name === 'conversation' ? { send: async (t: string) => { sent.push(t) } } : undefined),
  }
  const sessions = {
    list: { getSnapshot: () => ({ current: 'cur-session' }) },
    scope: () => scoped,
  }
  setClientContext({ get: (name: string) => (name === 'sessions' ? sessions : undefined) })
  const result = await sendToConversation('分析商品A')
  assert.equal(result.sent, true)
  assert.deepEqual(sent, ['分析商品A'])
  setClientContext(null)
})

test('v0.10 [cockpit-bus] 主路径：兼容 scoped.conversation 直接暴露（无 get）', async () => {
  const sent: string[] = []
  const sessions = {
    list: { getSnapshot: () => ({ current: 'cur-session' }) },
    scope: () => ({ conversation: { send: async (t: string) => { sent.push(t) } } }),
  }
  setClientContext({ get: (name: string) => (name === 'sessions' ? sessions : undefined) })
  const result = await sendToConversation('/keyword-research')
  assert.equal(result.sent, true)
  assert.deepEqual(sent, ['/keyword-research'])
  setClientContext(null)
})

test('v0.10 [cockpit-bus] 兜底：send 不可用时填入输入框（input.for.setDraft + notify）', async () => {
  const drafted: string[] = []
  const notified: string[] = []
  const facade = {
    setDraft: (t: string) => { drafted.push(t) },
    notify: (_level: string, t: string) => { notified.push(t) },
    state: { getSnapshot: () => ({ draft: '' }) },
  }
  const scoped = {
    get: (name: string) => (name === 'conversation' ? { input: { for: () => facade } } : undefined),
  }
  const sessions = { list: { getSnapshot: () => ({ current: 'cur-session' }) }, scope: () => scoped }
  setClientContext({ get: (name: string) => (name === 'sessions' ? sessions : undefined) })
  const result = await sendToConversation('/market-opportunity')
  assert.equal(result.sent, true)
  assert.deepEqual(drafted, ['/market-opportunity'])
  assert.equal(notified.length, 1)
  setClientContext(null)
})

test('v0.10 [cockpit-bus] send 抛错时降级填入输入框，不抛未捕获异常', async () => {
  const drafted: string[] = []
  const facade = {
    setDraft: (t: string) => { drafted.push(t) },
    notify: () => {},
    state: { getSnapshot: () => ({ draft: '' }) },
  }
  const scoped = {
    get: (name: string) => (name === 'conversation'
      ? { send: async () => { throw new Error('no session scope') }, input: { for: () => facade } }
      : undefined),
  }
  const sessions = { list: { getSnapshot: () => ({ current: 'cur-session' }) }, scope: () => scoped }
  setClientContext({ get: (name: string) => (name === 'sessions' ? sessions : undefined) })
  const result = await sendToConversation('/ad-traffic')
  assert.equal(result.sent, true, 'send 抛错后应降级填入输入框')
  assert.deepEqual(drafted, ['/ad-traffic'])
  setClientContext(null)
})

test('v0.10 [cockpit-bus] session scope 获取不到时全失败（不抛异常）', async () => {
  setClientContext({
    get: () => ({ list: { getSnapshot: () => ({ current: null }) }, scope: () => undefined }),
  })
  const result = await sendToConversation('x')
  assert.equal(result.sent, false)
  setClientContext(null)
})

test('v0.10 [cockpit-bus] 各种坏境不会抛出未捕获异常', async () => {
  setClientContext({ get: () => ({ send: () => { throw new Error('session') } }) })
  const result = await sendToConversation('安全测试')
  assert.equal(typeof result.sent, 'boolean')
  setClientContext(null)
})

test('v0.11 [cockpit-bus] openNewConversation 首次在当前会话分组新建会话并发送，后续点击复用不新建', async () => {
  resetLinkWarnSessionForTest()
  // 伪造 sessions + workspaces 服务：当前会话 cur-session 位于分组 ws-1（cwd=C:/shop）
  const byId: Record<string, { cwd?: string }> = { 'cur-session': { cwd: 'C:/shop' } }
  const created: Array<Record<string, string>> = []
  const opened: string[] = []
  const sent: string[] = []
  const sessions = {
    list: { getSnapshot: () => ({ current: 'cur-session', byId }) },
    create: async (opts?: { workspaceId?: string; cwd?: string }) => {
      created.push((opts ?? {}) as Record<string, string>)
      byId['new-session'] = { cwd: 'C:/shop' } // 模拟创建后落入列表
      return 'new-session'
    },
    open: (id: string) => {
      opened.push(id)
    },
    scope: () => ({ conversation: { send: async (text: string) => { sent.push(text) } } }),
  }
  const workspaces = {
    list: {
      getSnapshot: () => ({
        items: [{ workspaceId: 'ws-1', path: 'C:/shop', sessionIds: ['cur-session'] }],
        recentWorkspaceId: 'ws-1',
      }),
    },
  }
  setClientContext({
    get: (name: string) => (name === 'sessions' ? sessions : name === 'workspaces' ? workspaces : undefined),
  })

  // 首次：新建 + 发送，会话落在当前分组（workspaceId=ws-1）
  const r1 = await openNewConversation('提示词A')
  assert.equal(r1.newSession, true)
  assert.equal(r1.opened, true)
  assert.equal(created.length, 1)
  assert.deepEqual(created[0], { workspaceId: 'ws-1' })
  assert.deepEqual(sent, ['提示词A'])
  assert.deepEqual(opened, ['new-session'])

  // 再次：复用已有会话，不新建、不重发 create
  const r2 = await openNewConversation('提示词B')
  assert.equal(r2.newSession, false)
  assert.equal(r2.opened, true)
  assert.equal(created.length, 1)
  assert.deepEqual(sent, ['提示词A', '提示词B'])
  assert.equal(opened.length, 2, '复用时应再次 open 以指向既有会话')

  resetLinkWarnSessionForTest()
  setClientContext(null)
})

test('v0.11 [cockpit-bus] openNewConversation 无 sessions 服务时降级到 sendToConversation（无发送路径 → opened=false）', async () => {
  resetLinkWarnSessionForTest()
  setClientContext({ get: () => undefined })
  const r = await openNewConversation('降级指令')
  assert.equal(r.newSession, false)
  assert.equal(r.opened, false)
  setClientContext(null)
  resetLinkWarnSessionForTest()
})
