/**
 * ecommerce-analyst-plugin — 数据备份工具（铁律 2：备份必须有）
 *
 * 导出 JSON 备份 / 导入恢复，支持上千条数据无上限。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import { asJsonObject } from './json.ts'

export function registerBackupTools(ctx: Context, store: EcommerceStore): void {
  ctx.tools.register(defineTool({
    name: 'ecommerce_export_backup',
    description: '导出店铺数据 JSON 备份（商品 + 订单全量）。建议定期备份。',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          products: { type: 'number' },
          orders: { type: 'number' },
          json: { type: 'string' },
          hint: { type: 'string' },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as { products: number; orders: number; json: string; hint: string }
        return [{
          type: 'text',
          text: `已生成备份：${v.products} 件商品、${v.orders} 笔订单。请将以下 JSON 妥善保存：\n\n${v.json}\n\n${v.hint}`,
        }]
      },
    },
    async execute() {
      const json = store.exportBackup()
      const data = JSON.parse(json) as { products: unknown[]; orders: unknown[] }
      return asJsonObject({
        products: data.products.length,
        orders: data.orders.length,
        json,
        hint: '请将 json 字段完整保存作为备份',
      })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'ecommerce_import_backup',
    description: '从 JSON 备份恢复店铺数据（整体替换当前数据）。恢复前会自动导出当前数据快照以防误操作。',
    parameters: {
      json: { type: 'string', required: true, description: '备份 JSON 完整内容' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          products: { type: 'number' },
          orders: { type: 'number' },
          snapshot: { type: 'string' },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as { products: number; orders: number; snapshot: string }
        return [{
          type: 'text',
          text: `恢复完成：${v.products} 件商品、${v.orders} 笔订单。（恢复前数据已备份）`,
        }]
      },
    },
    async execute(args) {
      const snapshot = store.exportBackup()
      try {
        const result = store.importBackup(args.json)
        return asJsonObject({ ...result, snapshot })
      } catch (err) {
        throw new Error(`导入失败，数据未变更：${err instanceof Error ? err.message : String(err)}`)
      }
    },
  }))
}
