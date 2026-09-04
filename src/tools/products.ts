/**
 * ecommerce-analyst-plugin — 商品查询工具（F1）
 *
 * 只读查询：按分类 / 关键词 / 上下架状态 / 价格区间筛选，分页返回。
 * （v0.x 起移除了单个商品的手工增删改查与上下架写工具——商品数据统一由
 *   Excel/CSV 导入维护，不再提供逐条写操作。）
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import { asJsonObject, type ProductRow } from './json.ts'

/** 商品渲染：结构化为模型可读文本 */
function renderProducts(data: { total: number; items: ProductRow[] }, sourceMode: 'mock' | 'rest'): string {
  if (data.total === 0) return '没有符合条件的商品。'
  const lines = data.items.map((p) => {
    const statusText = p.status === 'on_sale' ? '在售' : '下架'
    return `- ${p.sku} ｜ ${p.name} ｜ ¥${p.price.toFixed(2)} ｜ 库存 ${p.stock} ｜ ${p.category} ｜ ${statusText}`
  })
  const note = sourceMode === 'mock' ? '\n（当前为示例数据模式，仅作演示）' : ''
  return `共 ${data.total} 件商品${data.total > data.items.length ? `，显示前 ${data.items.length} 件` : ''}：\n${lines.join('\n')}${note}`
}

export function registerProductTools(ctx: Context, store: EcommerceStore): void {
  const mode = store.sourceMode

  ctx.tools.register(defineTool({
    name: 'product_list',
    description: '查询店铺商品列表，支持按分类、关键词、上下架状态、价格区间筛选，分页返回。',
    parameters: {
      category: { type: 'string', description: '商品分类，如「数码配件」' },
      keyword: { type: 'string', description: '按商品名称或 SKU 模糊搜索' },
      status: { type: 'string', enum: ['on_sale', 'off_sale'], description: '上下架状态' },
      min_price: { type: 'number', description: '最低价（¥）' },
      max_price: { type: 'number', description: '最高价（¥）' },
      page: { type: 'number', description: '页码，从 1 开始' },
      page_size: { type: 'number', description: '每页数量，默认 20' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          total: { type: 'number' },
          items: { type: 'array', items: { type: 'object', additionalProperties: true } },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as { total: number; items: ProductRow[] }
        return [{ type: 'text', text: renderProducts(v, mode) }]
      },
    },
    async execute(args) {
      return asJsonObject(store.listProducts({
        category: args.category,
        keyword: args.keyword,
        status: args.status,
        min_price: args.min_price,
        max_price: args.max_price,
        page: args.page ?? 1,
        page_size: args.page_size ?? 20,
      }))
    },
  }))
}
