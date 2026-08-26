/**
 * 工具层测试：注册完整性 + 工具执行委托正确性
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'
import { registerProductTools } from '../src/tools/products.ts'
import { registerOrderTools } from '../src/tools/orders.ts'
import { registerStatsTools } from '../src/tools/stats.ts'
import { registerInventoryTools } from '../src/tools/inventory.ts'
import { registerBackupTools } from '../src/tools/backup.ts'

interface RegisteredTool {
  name: string
  description: string
  parameters: Record<string, unknown>
  output: { schema: unknown; render: (args: unknown, value: unknown) => unknown[] }
  execute: (args: never) => Promise<unknown>
}

function makeCtx() {
  const tools: RegisteredTool[] = []
  return {
    tools: {
      register: (tool: RegisteredTool) => {
        tools.push(tool)
      },
    },
    registered: tools,
  }
}

async function makeStore(): Promise<EcommerceStore> {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-tools-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'),
    seedOnEmpty: true,
    lowStockThreshold: 10,
  })
  await store.init()
  return store
}

test('注册完整性：全部业务工具就位', async () => {
  const ctx = makeCtx()
  const store = await makeStore()
  registerProductTools(ctx as never, store)
  registerOrderTools(ctx as never, store)
  registerStatsTools(ctx as never, store)
  registerInventoryTools(ctx as never, store)
  registerBackupTools(ctx as never, store)

  const names = ctx.registered.map((t) => t.name).sort()
  assert.deepEqual(names, [
    'ecommerce_export_backup',
    'ecommerce_import_backup',
    'inventory_low_stock',
    'inventory_suggest',
    'order_list',
    'order_refund',
    'order_ship',
    'order_stats',
    'order_update_status',
    'product_create',
    'product_delete',
    'product_list',
    'product_off_sale',
    'product_on_sale',
    'product_stock_adjust',
    'product_update',
    'stats_category',
    'stats_overview',
    'stats_top_products',
    'stats_trend',
  ])
})

test('工具定义：必备字段齐全（schema 可被模型消费）', async () => {
  const ctx = makeCtx()
  const store = await makeStore()
  registerProductTools(ctx as never, store)
  registerOrderTools(ctx as never, store)
  registerStatsTools(ctx as never, store)
  registerInventoryTools(ctx as never, store)
  registerBackupTools(ctx as never, store)

  for (const t of ctx.registered) {
    assert.ok(t.name, '工具必须有 name')
    assert.ok(t.description.length > 10, `${t.name} description 过短`)
    assert.ok(t.parameters, `${t.name} 必须有 parameters`)
    assert.ok(t.output?.schema, `${t.name} 必须有 output.schema`)
    assert.equal(typeof t.execute, 'function', `${t.name} 必须有 execute`)
  }
})

test('product_list 执行：筛选委托正确', async () => {
  const ctx = makeCtx()
  const store = await makeStore()
  registerProductTools(ctx as never, store)

  const tool = ctx.registered.find((t) => t.name === 'product_list')
  assert.ok(tool)
  const result = await tool.execute({ category: '数码配件' } as never) as {
    total: number
    items: unknown[]
  }
  assert.equal(result.total, 5)
  assert.equal(result.items.length, 5)
})

test('product_create 执行：创建并返回新商品', async () => {
  const ctx = makeCtx()
  const store = await makeStore()
  registerProductTools(ctx as never, store)

  const tool = ctx.registered.find((t) => t.name === 'product_create')
  assert.ok(tool)
  const result = await tool.execute({
    name: '新商品 A',
    price: 66,
    stock: 8,
    category: '服饰',
  } as never) as { sku: string; name: string }
  assert.match(result.sku, /^SKU-\d{4}$/)
  assert.equal(result.name, '新商品 A')

  const listed = store.listProducts({ keyword: '新商品' })
  assert.equal(listed.total, 1)
})

test('order_list 执行：状态筛选与排序', async () => {
  const ctx = makeCtx()
  const store = await makeStore()
  registerOrderTools(ctx as never, store)

  const tool = ctx.registered.find((t) => t.name === 'order_list')
  assert.ok(tool)
  const result = await tool.execute({ status: 'pending' } as never) as {
    total: number
    items: { order_id: string }[]
  }
  assert.equal(result.total, 43)
  // 按时间倒序：ORD-20260822-012 在前
  assert.equal(result.items[0].order_id, 'ORD-20260822-075')
})

test('stats_overview 执行：返回经营总览', async () => {
  const ctx = makeCtx()
  const store = await makeStore()
  registerStatsTools(ctx as never, store)

  const tool = ctx.registered.find((t) => t.name === 'stats_overview')
  assert.ok(tool)
  const result = await tool.execute({} as never) as { revenue: number }
  assert.equal(result.revenue, 154699)
})

test('inventory_low_stock 执行：返回低库存清单', async () => {
  const ctx = makeCtx()
  const store = await makeStore()
  registerInventoryTools(ctx as never, store)

  const tool = ctx.registered.find((t) => t.name === 'inventory_low_stock')
  assert.ok(tool)
  const result = await tool.execute({ threshold: 10 } as never) as {
    items: unknown[]
    threshold: number
  }
  assert.equal(result.items.length, 8)
  assert.equal(result.threshold, 10)
})

test('错误处理：非法状态流转在执行层抛错', async () => {
  const ctx = makeCtx()
  const store = await makeStore()
  registerOrderTools(ctx as never, store)

  const tool = ctx.registered.find((t) => t.name === 'order_update_status')
  assert.ok(tool)
  await assert.rejects(
    () => tool.execute({ order_id: 'ORD-20260825-044', status: 'pending' } as never),
    /非法状态流转/,
  )
})
