/**
 * 插件入口冒烟测试：验证 apply 完整执行链路
 * （适配器创建 → store 初始化 → 工具注册 → systemPrompt「今天要处理」注入）
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply, name } from '../src/index.ts'
import { Config } from '../src/config.ts'

interface FakeSection {
  name: string
  order: number
  text: () => string
}

function makeFakeCtx(sections: FakeSection[]) {
  return {
    systemPrompt: {
      section: (s: FakeSection) => {
        sections.push(s)
      },
    },
    tools: {
      register: () => {},
    },
    // fake webServer：避免 apply 内 250ms 等待
    get: () => ({ register: () => () => {} }),
    effect: () => {},
  }
}

test('插件元信息：name 与 Config 就位', () => {
  assert.equal(name, 'ecommerce-analyst')
  assert.ok(Config, 'Config schema 必须存在')
})

test('apply：示例模式下完整执行，注册今日待办提示', async () => {
  const sections: FakeSection[] = []
  const dir = mkdtempSync(join(tmpdir(), 'ecom-smoke-'))
  const ctx = makeFakeCtx(sections)

  await new Promise<void>((resolve, reject) => {
    try {
      apply(ctx as never, {
        storage: { file: join(dir, 'store.json'), seedOnEmpty: true },
      })
      // inject 回调是同步执行（fake），但内部 await store.init() 需要微任务
      setTimeout(resolve, 350)
    } catch (err) {
      reject(err)
    }
  })

  assert.ok(sections.length >= 1, '必须注册 systemPrompt section')
  const today = sections.find((s) => s.name === 'ecommerce:today')
  assert.ok(today, '必须注册 ecommerce:today section')
  const text = today.text()
  assert.match(text, /今日要处理/)
  assert.match(text, /待发货订单 55 笔/)
  assert.match(text, /低库存商品 8 件/)
  assert.match(text, /逾期未处理订单 43 笔/)
})

test('apply：自定义阈值生效', async () => {
  const sections: FakeSection[] = []
  const dir = mkdtempSync(join(tmpdir(), 'ecom-smoke2-'))
  const ctx = makeFakeCtx(sections)

  await new Promise<void>((resolve) => {
    apply(ctx as never, {
      storage: { file: join(dir, 'store.json'), seedOnEmpty: true },
      inventory: { lowStockThreshold: 0 },
    })
    setTimeout(resolve, 350)
  })

  const today = sections.find((s) => s.name === 'ecommerce:today')
  const text = today?.text() ?? ''
  // 阈值 0 时仅库存为 0 的 SKU-0005 命中（stock <= threshold 的边界语义）
  assert.match(text, /低库存商品 3 件/)
})
