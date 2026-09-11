/**
 * ecommerce-analyst-plugin — 数据源模式切换工具
 *
 * ecommerce_set_mode：显式切换数据来源（imported=导入数据 / rest=平台 API）。
 * v0.4.0 起示例种子数据已移除：不再有 demo 演示数据模式，也无一键重置演示工具；
 * 需要「清空当前数据」请走 ecommerce_export_backup 备份后删除持久化文件，或用 rest 重新拉取。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import { asJsonObject } from './json.ts'

export function registerModeTools(ctx: Context, store: EcommerceStore): void {
  ctx.tools.register(defineTool({
    name: 'ecommerce_set_mode',
    description:
      '切换店铺数据源模式：imported=导入数据（最近一次导入的备份）/ ' +
      'rest=平台 API（需启动时配置 rest 平台）。切换前自动备份当前数据；' +
      '切换后统计工具与店铺工作台立即反映新数据源。',
    parameters: {
      mode: {
        type: 'string',
        required: true,
        enum: ['imported', 'rest'],
        description: '目标数据源：imported / rest',
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
      if (mode !== 'imported' && mode !== 'rest') {
        throw new Error(`未知数据源模式：${String(mode)}（示例数据模式已随 v0.4.0 移除，可用：imported / rest）`)
      }
      try {
        const result = await store.switchMode(mode)
        return asJsonObject({
          ...result,
          mode,
          hint: mode === 'imported'
            ? '已恢复最近一次导入的数据'
            : '已从平台 API 重新拉取数据',
        })
      } catch (err) {
        throw new Error(`切换失败，数据未变更：${err instanceof Error ? err.message : String(err)}`)
      }
    },
  }))
}

function modeText(mode: string): string {
  switch (mode) {
    case 'imported': return '导入数据'
    case 'rest': return '平台 API'
    default: return mode
  }
}
