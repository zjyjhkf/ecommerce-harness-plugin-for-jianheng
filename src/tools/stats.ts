/**
 * ecommerce-analyst-plugin — 销售数据分析工具集（F3）
 *
 * 对应视频「数据分析智能体」定位：经营总览、趋势、TOP 排行、类目分布。
 * 所有指标由订单原始数据在插件内统一计算，口径一致。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import type { DateRange } from '../types.ts'
import { asJsonObject } from './json.ts'

function rangeNote(range: DateRange): string {
  return range.date_from || range.date_to
    ? `（${range.date_from ?? '开始'} ~ ${range.date_to ?? '今天'}）`
    : '（全部时间）'
}

interface OverviewView {
  revenue: number
  orders: number
  avg_order_value: number
  top_selling_sku: string
  refund_rate: number
  date_from?: string
  date_to?: string
}

interface TrendView {
  date: string
  revenue: number
  orders: number
}

interface TopView {
  sku: string
  name: string
  revenue: number
  units: number
}

interface CategoryView {
  category: string
  revenue: number
  ratio: number
}

export function registerStatsTools(ctx: Context, store: EcommerceStore): void {
  const mode = store.sourceMode

  ctx.tools.register(defineTool({
    name: 'stats_overview',
    description: '店铺经营总览：销售额、订单量、客单价、畅销商品、退款率（已支付口径）。',
    parameters: {
      date_from: { type: 'string', description: '起始日期 YYYY-MM-DD' },
      date_to: { type: 'string', description: '结束日期 YYYY-MM-DD' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          revenue: { type: 'number' },
          orders: { type: 'number' },
          avg_order_value: { type: 'number' },
          top_selling_sku: { type: 'string' },
          refund_rate: { type: 'number' },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as OverviewView
        const top = v.top_selling_sku ? `\n- 畅销商品：${v.top_selling_sku}` : ''
        const note = mode === 'mock' ? '\n（当前为示例数据模式，仅作演示）' : ''
        return [{
          type: 'text',
          text: `经营总览${rangeNote(v)}\n- 销售额：¥${v.revenue.toFixed(2)}\n- 订单量：${v.orders} 笔\n- 客单价：¥${v.avg_order_value.toFixed(2)}\n- 退款率：${v.refund_rate}%${top}${note}`,
        }]
      },
    },
    async execute(args) {
      return asJsonObject({
        ...store.overview({ date_from: args.date_from, date_to: args.date_to }),
        date_from: args.date_from ?? '',
        date_to: args.date_to ?? '',
      })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'stats_trend',
    description: '销售趋势：按日/周/月聚合销售额与订单量，用于绘制折线图。',
    parameters: {
      date_from: { type: 'string', description: '起始日期 YYYY-MM-DD' },
      date_to: { type: 'string', description: '结束日期 YYYY-MM-DD' },
      granularity: { type: 'string', enum: ['day', 'week', 'month'], description: '聚合粒度，默认 day' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          granularity: { type: 'string' },
          points: { type: 'array', items: { type: 'object', additionalProperties: true } },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as { points: TrendView[]; granularity: string }
        const lines = v.points.map((p) => `- ${p.date}：¥${p.revenue.toFixed(2)}（${p.orders} 单）`).join('\n')
        return [{ type: 'text', text: `销售趋势（${v.granularity}）：\n${lines || '（无数据）'}` }]
      },
    },
    async execute(args) {
      const points = store.trend(
        { date_from: args.date_from, date_to: args.date_to },
        args.granularity ?? 'day',
      )
      return asJsonObject({ points, granularity: args.granularity ?? 'day' })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'stats_top_products',
    description: '商品销售排行 TOP N：按销售额排序，含销量。',
    parameters: {
      date_from: { type: 'string', description: '起始日期 YYYY-MM-DD' },
      date_to: { type: 'string', description: '结束日期 YYYY-MM-DD' },
      limit: { type: 'number', description: '返回条数，默认 10，最大 50' },
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
        const v = value as unknown as { items: TopView[] }
        const lines = v.items
          .map((p, i) => `${i + 1}. ${p.name}（${p.sku}）¥${p.revenue.toFixed(2)}，${p.units} 件`)
          .join('\n')
        return [{ type: 'text', text: `商品销售排行：\n${lines || '（无数据）'}` }]
      },
    },
    async execute(args) {
      const limit = Math.min(args.limit ?? 10, 50)
      return asJsonObject({ items: store.topProducts({ date_from: args.date_from, date_to: args.date_to }, limit) })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'stats_category',
    description: '类目销售分布：各分类销售额与占比，用于绘制饼图。',
    parameters: {
      date_from: { type: 'string', description: '起始日期 YYYY-MM-DD' },
      date_to: { type: 'string', description: '结束日期 YYYY-MM-DD' },
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
        const v = value as unknown as { items: CategoryView[] }
        const lines = v.items
          .map((c) => `- ${c.category}：¥${c.revenue.toFixed(2)}（${c.ratio}%）`)
          .join('\n')
        return [{ type: 'text', text: `类目销售分布：\n${lines || '（无数据）'}` }]
      },
    },
    async execute(args) {
      return asJsonObject({
        items: store.categoryDistribution({ date_from: args.date_from, date_to: args.date_to }),
      })
    },
  }))
}
