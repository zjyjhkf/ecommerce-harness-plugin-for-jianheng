/**
 * 宿主端技能 Provider 集成测试：验证 registerPluginSkills 能读盘注册 7 个技能，
 * 且 list()/get() 产出的定义绑定到插件自身数据工具（主数据源），外部采集器降级为可选。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerPluginSkills } from '../src/skills.ts'

const EXPECTED_SLUGS = [
  'ad-traffic',
  'competitor-analysis',
  'comprehensive-research',
  'keyword-research',
  'listing',
  'market-opportunity',
  'review-insight',
]

/** 构造一个仅含 skills 服务的假 ctx，捕获 provider 与 disposer 供断言 */
function makeCtx(withSkills = true) {
  let provider: any
  let disposed = false
  const registry = {
    registerProvider(create: (control: unknown) => unknown) {
      provider = create({ signal: new AbortController().signal, invalidate() {} })
      return () => {
        disposed = true
      }
    },
  }
  const ctx = {
    get(service: string) {
      return service === 'skills' && withSkills ? registry : undefined
    },
  } as unknown as Parameters<typeof registerPluginSkills>[0]
  return { ctx, getProvider: () => provider, getDisposed: () => disposed }
}

test('registerPluginSkills：有 skills 服务时注册并返回 disposer', () => {
  const { ctx, getProvider } = makeCtx(true)
  const dispose = registerPluginSkills(ctx)
  assert.equal(typeof dispose, 'function', '应返回反注册 disposer')
  assert.ok(getProvider(), '应已构造 provider')
})

test('registerPluginSkills：无 skills 服务时优雅跳过（不阻塞插件激活）', () => {
  const { ctx } = makeCtx(false)
  assert.equal(registerPluginSkills(ctx), undefined)
})

test('list()：恰好 7 个技能，slug 与 skills/ 目录一一对应', async () => {
  const { ctx, getProvider } = makeCtx(true)
  registerPluginSkills(ctx)
  const list = await getProvider().list({})
  const names = list.map((c: any) => c.name)
  assert.deepEqual(names, EXPECTED_SLUGS)
})

test('list()：候选元数据完整（source/provider/rank/invocation/locator）', async () => {
  const { ctx, getProvider } = makeCtx(true)
  registerPluginSkills(ctx)
  const list = await getProvider().list({})
  for (const c of list) {
    assert.equal(c.source, 'custom')
    assert.equal(c.provider, 'ecommerce-analyst')
    assert.equal(c.rank, 600)
    assert.equal(c.invocation.modelInvocable, true, `${c.name} 应可被模型自动调用`)
    assert.equal(c.invocation.userInvocable, true, `${c.name} 应可被 /name 调用`)
    assert.ok(c.description.length > 0)
    assert.ok(String(c.locator).endsWith('SKILL.md'))
  }
})

test('get()：正文非空，主数据源绑定插件自身工具', async () => {
  const { ctx, getProvider } = makeCtx(true)
  registerPluginSkills(ctx)
  const list = await getProvider().list({})
  for (const c of list) {
    const def = await getProvider().get(c, {})
    assert.ok(def, `${c.name} 应能读到定义`)
    assert.ok(def.content.length > 100, `${c.name} 正文应非空`)
    assert.match(def.content, /本插件/, `${c.name} 应标注主数据源为「本插件」`)
    assert.match(
      def.content,
      /product_|stats_|inventory_|order_|ecommerce_export/,
      `${c.name} 应引用插件自身工具`,
    )
  }
})
