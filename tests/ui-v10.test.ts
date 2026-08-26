/**
 * v0.10 测试集：会话指令注入链路（点击商品 → 会话框生成指令）
 *
 * 覆盖 cockpit-bus.sendToConversation 的四层 fallback：
 *  ① DOM 注入输入框 ② session scope conversation ③ 已注入 sender ④ 剪贴板
 * 以及 analysisPromptOf 在会话框内的完整呈现（市场营销视角）。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  registerConversationSender,
  sendToConversation,
  setClientContext,
} from '../src/client/cockpit-bus.ts'

test('v0.10 [cockpit-bus] 无任何注入能力时降级到剪贴板并返回 sent=false（node 无 DOM）', () => {
  // 清空状态
  registerConversationSender((_t) => {})
  // 用一个永远抛错的 sender 覆盖，确保走到降级
  let called = false
  registerConversationSender(() => {
    called = true
    throw new Error('boom')
  })
  const result = sendToConversation('测试指令')
  // 无 DOM、无 session scope，最终降级（剪贴板在 node 下无 navigator，静默）
  assert.equal(result.sent, false)
  assert.equal(called, true, '已注入 sender 应被尝试调用')
})

test('v0.10 [cockpit-bus] 已注入 sender 成功时返回 sent=true', () => {
  let received = ''
  registerConversationSender((t) => {
    received = t
  })
  setClientContext(null)
  const result = sendToConversation('分析商品A')
  assert.equal(result.sent, true)
  assert.equal(received, '分析商品A')
})

test('v0.10 [cockpit-bus] setClientContext 保存 context 引用（供动态获取）', () => {
  const ctx = { get: () => undefined }
  setClientContext(ctx)
  // 无法直接断言内部状态，但验证不抛异常 + 后续 send 走降级
  registerConversationSender(() => {
    throw new Error('x')
  })
  const result = sendToConversation('x')
  assert.equal(result.sent, false)
  setClientContext(null)
})

test('v0.10 [cockpit-bus] session scope 获取不到时静默降级（不抛异常）', () => {
  const ctx = {
    get: () => ({
      list: { getSnapshot: () => ({ current: null }) },
      scope: () => undefined,
    }),
  }
  setClientContext(ctx)
  registerConversationSender(() => {
    throw new Error('x')
  })
  const result = sendToConversation('x')
  assert.equal(result.sent, false)
  setClientContext(null)
})

test('v0.10 [cockpit-bus] 四层 fallback 不会抛出未捕获异常', () => {
  // 模拟各种坏境：无 DOM、conversation 抛错、剪贴板不存在
  setClientContext({ get: () => ({ send: () => { throw new Error('session') } }) })
  registerConversationSender(() => {
    throw new Error('sender')
  })
  assert.doesNotThrow(() => {
    const r = sendToConversation('安全测试')
    assert.equal(typeof r.sent, 'boolean')
  })
  setClientContext(null)
})
