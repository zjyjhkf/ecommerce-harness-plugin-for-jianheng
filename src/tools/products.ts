/**
 * ecommerce-analyst-plugin — 商品管理工具集（F1）
 *
 * 查询/筛选/新增/修改/删除/库存调整/上下架。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import type { ProductStatus } from '../types.ts'
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

  ctx.tools.register(defineTool({
    name: 'product_create',
    description: '新增商品。自动生成 SKU 编号，默认上架。',
    parameters: {
      name: { type: 'string', required: true, description: '商品名称' },
      price: { type: 'number', required: true, description: '售价（¥），大于 0' },
      stock: { type: 'number', required: true, description: '初始库存，非负整数' },
      category: { type: 'string', required: true, description: '商品分类' },
      status: { type: 'string', enum: ['on_sale', 'off_sale'], description: '初始状态，默认 on_sale' },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => {
        const v = value as unknown as ProductRow
        return [{ type: 'text', text: `已新增商品 ${v.sku}「${v.name}」（¥${v.price.toFixed(2)}，库存 ${v.stock}）` }]
      },
    },
    async execute(args) {
      if (!args.name.trim()) throw new Error('商品名称不能为空')
      if (args.price <= 0) throw new Error('售价必须大于 0')
      if (!Number.isInteger(args.stock) || args.stock < 0) throw new Error('库存必须是非负整数')
      return asJsonObject(store.createProduct({
        name: args.name.trim(),
        price: args.price,
        stock: args.stock,
        category: args.category,
        status: args.status as ProductStatus | undefined,
      }))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'product_update',
    description: '修改商品信息（名称/价格/库存/分类/状态），仅传入需要修改的字段。',
    parameters: {
      sku: { type: 'string', required: true, description: '商品 SKU' },
      name: { type: 'string', description: '新的商品名称' },
      price: { type: 'number', description: '新的售价（¥）' },
      stock: { type: 'number', description: '新的库存数' },
      category: { type: 'string', description: '新的分类' },
      status: { type: 'string', enum: ['on_sale', 'off_sale'], description: '新的状态' },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => {
        const v = value as unknown as ProductRow
        return [{
          type: 'text',
          text: `已更新商品 ${v.sku}「${v.name}」（¥${v.price.toFixed(2)}，库存 ${v.stock}，${v.status === 'on_sale' ? '在售' : '下架'}）`,
        }]
      },
    },
    async execute(args) {
      if (args.price !== undefined && args.price <= 0) throw new Error('售价必须大于 0')
      if (args.stock !== undefined && (!Number.isInteger(args.stock) || args.stock < 0)) throw new Error('库存必须是非负整数')
      return asJsonObject(store.updateProduct(args.sku, {
        name: args.name,
        price: args.price,
        stock: args.stock,
        category: args.category,
        status: args.status as ProductStatus | undefined,
      }))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'product_delete',
    description: '删除商品。此操作不可恢复，删除前请确认。',
    parameters: {
      sku: { type: 'string', required: true, description: '商品 SKU' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          deleted: { type: 'boolean' },
          sku: { type: 'string' },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as { deleted: boolean; sku: string }
        return [{ type: 'text', text: v.deleted ? `已删除商品 ${v.sku}` : `删除失败：商品 ${v.sku} 不存在` }]
      },
    },
    async execute(args) {
      const exists = store.getProduct(args.sku)
      if (!exists) return { deleted: false, sku: args.sku }
      await store.deleteProduct(args.sku)
      return { deleted: true, sku: args.sku }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'product_stock_adjust',
    description: '调整商品库存：delta 为正数表示入库/盘点增加，负数表示出库/销售减少。库存降至 0 时自动下架。',
    parameters: {
      sku: { type: 'string', required: true, description: '商品 SKU' },
      delta: { type: 'number', required: true, description: '库存变化量（整数，正加负减）' },
      reason: { type: 'string', description: '调整原因，如「入库」「出库」「盘点」「售罄」' },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => {
        const v = value as unknown as ProductRow
        return [{
          type: 'text',
          text: `已调整 ${v.sku}「${v.name}」库存至 ${v.stock}（${v.status === 'on_sale' ? '在售' : '已下架'}）`,
        }]
      },
    },
    async execute(args) {
      return asJsonObject(store.adjustStock(args.sku, args.delta, args.reason))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'product_on_sale',
    description: '将指定 SKU 的商品上架，使其重新出现在店铺前台可售。',
    parameters: { sku: { type: 'string', required: true, description: '商品 SKU' } },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => {
        const v = value as unknown as ProductRow
        return [{ type: 'text', text: `商品 ${v.sku}「${v.name}」已上架` }]
      },
    },
    async execute(args) {
      return asJsonObject(store.setProductStatus(args.sku, 'on_sale'))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'product_off_sale',
    description: '将指定 SKU 的商品下架暂停售卖，通常用于库存售罄或临时停售场景。',
    parameters: { sku: { type: 'string', required: true, description: '商品 SKU' } },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => {
        const v = value as unknown as ProductRow
        return [{ type: 'text', text: `商品 ${v.sku}「${v.name}」已下架` }]
      },
    },
    async execute(args) {
      return asJsonObject(store.setProductStatus(args.sku, 'off_sale'))
    },
  }))
}
