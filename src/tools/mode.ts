/**
 * ecommerce-analyst-plugin — 数据源模式切换工具（对齐视频 commerce-cockpit Demo/Imported 双模式）
 *
 * ecommerce_set_mode：显式切换数据来源（demo=演示数据 / imported=导入数据 / rest=平台 API）。
 * ecommerce_reset_demo：一键重置为演示数据（自动备份当前数据，防误操作）。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import { asJsonObject } from './json.ts'

export function registerModeTools(ctx: Context, store: EcommerceStore): void {
  ctx.tools.register(defineTool({
    name: 'ecommerce_set_mode',
    description:
      '切换店铺数据源模式：demo=演示数据（示例种子）/ imported=导入数据（最近一次导入的备份）/ ' +
      'rest=平台 API（需启动时配置 rest 平台）。切换前自动备份当前数据；' +
      '切换后统计工具与店铺工作台立即反映新数据源。',
    parameters: {
      mode: {
        type: 'string',
        required: true,
        enum: ['demo', 'imported', 'rest'],
        description: '目标数据源：demo / imported / rest',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          mode: { type: 'string' },
          products: { type: 'number' },
          orders: { type: 'number' },
          snapshot: { type: 'string' },
          hint: { type: 'string' },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as { mode: string; products: number; orders: number; hint: string }
        return [{
          type: 'text',
          text: `已切换数据源为「${modeText(v.mode)}」：${v.products} 件商品、${v.orders} 笔订单。${v.hint ?? ''}`,
        }]
      },
    },
    async execute(args) {
      const mode = args.mode
      if (mode !== 'demo' && mode !== 'imported' && mode !== 'rest') {
        throw new Error(`未知数据源模式：${String(mode)}`)
      }
      try {
        const result = await store.switchMode(mode)
        return asJsonObject({
          ...result,
          mode,
          hint: mode === 'imported'
            ? '已恢复最近一次导入的数据'
            : mode === 'rest'
              ? '已从平台 API 重新拉取数据'
              : '已重置为演示数据（切换前数据已备份到 snapshot）',
        })
      } catch (err) {
        throw new Error(`切换失败，数据未变更：${err instanceof Error ? err.message : String(err)}`)
      }
    },
  }))

  ctx.tools.register(defineTool({
    name: 'ecommerce_reset_demo',
    description: '一键重置店铺数据为演示数据（示例种子 26 商品 / 480 订单）。重置前自动备份当前数据快照，防误操作。',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          products: { type: 'number' },
          orders: { type: 'number' },
          snapshot: { type: 'string' },
          hint: { type: 'string' },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as { products: number; orders: number; hint: string }
        return [{
          type: 'text',
          text: `已重置为演示数据：${v.products} 件商品、${v.orders} 笔订单。${v.hint ?? ''}`,
        }]
      },
    },
    async execute() {
      const result = await store.resetToDemo()
      return asJsonObject({
        ...result,
        hint: '重置前数据已备份到 snapshot 字段，可用 ecommerce_import_backup 恢复',
      })
    },
  }))
}

function modeText(mode: string): string {
  switch (mode) {
    case 'demo': return '演示数据'
    case 'imported': return '导入数据'
    case 'rest': return '平台 API'
    default: return mode
  }
}
