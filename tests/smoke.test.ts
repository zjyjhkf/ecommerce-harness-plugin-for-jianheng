/**
 * 插件入口冒烟测试：验证 apply 完整执行链路（v0.4.0 激活门控版）
 *  - silent（默认）：零工具注册、零系统提示注入——对会话零影响（反幻觉回归锚点）
 *  - active：全量注册 + 「今天要处理」注入（数据来自预置持久化文件，运行时不再带示例种子）
 *  - ECOM_ANALYST_ACTIVATION=active 环境变量等效切换
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply, name } from '../src/index.ts'
import { Config } from '../src/config.ts'
import { seedFixture } from './seed-fixture.ts'

interface FakeSection {
  name: string
  order: number
  text: () => string
}

function makeFakeCtx(sections: FakeSection[]) {
  const state = { toolsRegistered: 0 }
  return {
    state,
    systemPrompt: {
      section: (s: FakeSection) => {
        sections.push(s)
      },
    },
    tools: {
      register: () => {
        state.toolsRegistered += 1
      },
    },
    // fake webServer：避免 apply 内 250ms 等待
    get: () => ({ register: () => () => {} }),
    effect: () => {},
  }
}

/** 预置一个「已导入数据」的持久化库（active 用例的数据来源；生产不再有示例种子） */
function seededStoreFile(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  const file = join(dir, 'store.json')
  writeFileSync(
    file,
    JSON.stringify({
      products: seedFixture.products,
      orders: seedFixture.orders,
      meta: { dataMode: 'imported', updatedAt: new Date().toISOString() },
    }),
  )
  return file
}

type ApplyConfig = Partial<Config>
function runApply(ctx: unknown, config: ApplyConfig): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      void apply(ctx as never, config)
      // apply 内部 await store.init()，fake 注入下用超时等待完成
      setTimeout(resolve, 350)
    } catch (err) {
      reject(err)
    }
  })
}

test('插件元信息：name 与 Config 就位，默认激活模式为 silent', () => {
  assert.equal(name, 'ecommerce-analyst')
  assert.ok(Config, 'Config schema 必须存在')
  const parsed = Config({})
  assert.equal(parsed.activation, 'silent', '默认必须 silent：未显式启用不得影响会话')
})

test('apply（默认 silent）：零工具注册、零系统提示注入', async () => {
  const sections: FakeSection[] = []
  const ctx = makeFakeCtx(sections)
  await runApply(ctx, {
    storage: { file: seededStoreFile('ecom-silent-'), seedOnEmpty: true },
  })
  assert.equal(ctx.state.toolsRegistered, 0, 'silent 模式禁止注册任何工具')
  assert.equal(sections.length, 0, 'silent 模式禁止注入任何 systemPrompt section')
})

test('apply（active + 预置导入库）：注册工具并注入今日待办', async () => {
  const sections: FakeSection[] = []
  const ctx = makeFakeCtx(sections)
  await runApply(ctx, {
    activation: 'active',
    storage: { file: seededStoreFile('ecom-active-'), seedOnEmpty: true },
  })
  assert.ok(ctx.state.toolsRegistered > 10, 'active 模式必须全量注册工具')
  const today = sections.find((s) => s.name === 'ecommerce:today')
  assert.ok(today, '必须注册 ecommerce:today section')
  const text = today.text()
  assert.match(text, /今日要处理/)
  assert.match(text, /待发货订单 55 笔/)
  assert.match(text, /低库存商品 8 件/)
  assert.match(text, /逾期未处理订单 43 笔/)
})

test('apply（active + 自定义阈值）：阈值语义生效', async () => {
  const sections: FakeSection[] = []
  const ctx = makeFakeCtx(sections)
  await runApply(ctx, {
    activation: 'active',
    storage: { file: seededStoreFile('ecom-active2-'), seedOnEmpty: true },
    inventory: { lowStockThreshold: 0 },
  })
  const today = sections.find((s) => s.name === 'ecommerce:today')
  const text = today?.text() ?? ''
  // 阈值 0 时仅库存为 0 的 SKU 命中（stock <= threshold 的边界语义）
  assert.match(text, /低库存商品 3 件/)
})

test('apply（缺省配置 + ECOM_ANALYST_ACTIVATION=active）：环境变量覆盖生效', async () => {
  const sections: FakeSection[] = []
  const ctx = makeFakeCtx(sections)
  process.env.ECOM_ANALYST_ACTIVATION = 'active'
  try {
    await runApply(ctx, {
      storage: { file: seededStoreFile('ecom-env-'), seedOnEmpty: true },
    })
  } finally {
    delete process.env.ECOM_ANALYST_ACTIVATION
  }
  assert.ok(ctx.state.toolsRegistered > 0, 'env=active 必须触发注册')
  assert.ok(sections.find((s) => s.name === 'ecommerce:today'), 'env=active 必须注入今日待办')
})
