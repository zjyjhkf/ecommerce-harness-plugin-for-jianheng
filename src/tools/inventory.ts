/**
 * ecommerce-analyst-plugin — 库存预警工具集（F4）
 *
 * 低库存清单 + 补货建议（基于近 30 天销量 × 1.5 安全系数）。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import { asJsonObject, type LowStockRow, type RestockRow } from './json.ts'

export function registerInventoryTools(ctx: Context, store: EcommerceStore): void {
  const mode = store.sourceMode

  ctx.tools.register(defineTool({
    name: 'inventory_low_stock',
    description: '查询低库存商品清单（库存 ≤ 阈值），按库存升序排列。',
    parameters: {
      threshold: { type: 'number', description: '低库存阈值，默认取插件配置（10）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          threshold: { type: 'number' },
          items: { type: 'array', items: { type: 'object', additionalProperties: true } },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as { items: LowStockRow[]; threshold: number }
        if (v.items.length === 0) {
          return [{ type: 'text', text: `库存充足，没有低于阈值（${v.threshold}）的商品。` }]
        }
        const lines = v.items
          .map((p) => `- ${p.sku} ｜ ${p.name} ｜ 库存 ${p.stock} ｜ ${p.category}`)
          .join('\n')
        const note = mode === 'mock' ? '\n（当前为示例数据模式，仅作演示）' : ''
        return [{
          type: 'text',
          text: `⚠️ 有 ${v.items.length} 件商品库存低于阈值（${v.threshold}）：\n${lines}${note}`,
        }]
      },
    },
    async execute(args) {
      const items = store.lowStock(args.threshold)
      return asJsonObject({ items, threshold: args.threshold ?? 10 })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'inventory_suggest',
    description: '生成低库存商品的补货建议：基于近 30 天销量按 1.5 倍安全库存估算建议补货量。',
    parameters: {
      threshold: { type: 'number', description: '低库存阈值，默认取插件配置（10）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          items: { type: 'array', items: { type: 'object', additionalProperties: true } },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as { items: RestockRow[] }
        if (v.items.length === 0) return [{ type: 'text', text: '没有需要补货的商品。' }]
        const lines = v.items
          .map((p) => `- ${p.name}（${p.sku}）当前库存 ${p.stock} → 建议补货 ${p.suggest_qty}（${p.reason}）`)
          .join('\n')
        return [{ type: 'text', text: `补货建议：\n${lines}` }]
      },
    },
    async execute(args) {
      return asJsonObject({ items: store.restockSuggestions(args.threshold) })
    },
  }))
}
