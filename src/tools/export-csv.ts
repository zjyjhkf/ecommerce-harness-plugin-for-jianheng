/**
 * ecommerce-analyst-plugin — CSV 导出工具（对齐视频 templates 的数据导出能力）
 *
 * ecommerce_export_csv：商品/订单导出为 UTF-8 CSV（带 BOM，Excel 可直接打开），
 * 与 ecommerce_export_backup 的 JSON 备份并列。零外部依赖。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import { ordersToCsv, productsToCsv } from '../csv-util.ts'
import { asJsonObject } from './json.ts'

export function registerExportCsvTool(ctx: Context, store: EcommerceStore): void {
  ctx.tools.register(defineTool({
    name: 'ecommerce_export_csv',
    description:
      '导出店铺数据为 CSV（商品/订单，UTF-8 带 BOM，Excel 可直接打开）。' +
      '与 JSON 备份并列的数据导出能力。',
    parameters: {
      scope: {
        type: 'string',
        enum: ['products', 'orders', 'all'],
        description: '导出范围：products=商品表，orders=订单表，all=两者（默认 all）',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          products: { type: 'number' },
          orders: { type: 'number' },
          products_csv: { type: 'string' },
          orders_csv: { type: 'string' },
          hint: { type: 'string' },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as {
          products: number
          orders: number
          products_csv?: string
          orders_csv?: string
          hint: string
        }
        const parts: string[] = [`已导出：${v.products} 件商品、${v.orders} 笔订单（UTF-8 带 BOM，Excel 可直接打开）`]
        if (v.products_csv !== undefined) {
          parts.push(`\n【商品 CSV】\n${v.products_csv}`)
        }
        if (v.orders_csv !== undefined) {
          parts.push(`\n【订单 CSV】\n${v.orders_csv}`)
        }
        parts.push('\n' + v.hint)
        return [{ type: 'text', text: parts.join('') }]
      },
    },
    async execute(args) {
      const scope = args.scope ?? 'all'
      const allProducts = store.listProducts({ page_size: 100000 }).items
      const allOrders = store.listOrders({ page_size: 100000 }).items
      const out: Record<string, unknown> = {
        products: allProducts.length,
        orders: allOrders.length,
        hint: '请将 csv 字段内容完整保存为 .csv 文件（UTF-8）',
      }
      if (scope === 'products' || scope === 'all') {
        out.products_csv = productsToCsv(allProducts)
      }
      if (scope === 'orders' || scope === 'all') {
        out.orders_csv = ordersToCsv(allOrders)
      }
      return asJsonObject(out)
    },
  }))
}
