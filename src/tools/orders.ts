/**
 * ecommerce-analyst-plugin — 订单处理工具集（F2）
 *
 * 查询/统计/状态流转/发货/退款，含合法状态流转校验。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import type { OrderStatus } from '../types.ts'
import { asJsonObject, type OrderRow } from './json.ts'

const STATUS_TEXT: Record<OrderStatus, string> = {
  pending: '待付款',
  paid: '待发货',
  shipped: '已发货',
  completed: '已完成',
  refunded: '已退款',
  cancelled: '已取消',
}

function renderOrders(data: { total: number; items: OrderRow[] }, sourceMode: 'mock' | 'rest'): string {
  if (data.total === 0) return '没有符合条件的订单。'
  const lines = data.items.map((o) => {
    const tracking = o.tracking_no ? ` ｜ 运单 ${o.tracking_no}` : ''
    return `- ${o.order_id} ｜ ${o.buyer} ｜ ${o.product_name} ×${o.quantity} ｜ ¥${o.amount.toFixed(2)} ｜ ${STATUS_TEXT[o.status as OrderStatus] ?? o.status} ｜ ${o.created_at.slice(0, 10)}${tracking}`
  })
  const note = sourceMode === 'mock' ? '\n（当前为示例数据模式，仅作演示）' : ''
  return `共 ${data.total} 笔订单${data.total > data.items.length ? `，显示前 ${data.items.length} 笔` : ''}：\n${lines.join('\n')}${note}`
}

export function registerOrderTools(ctx: Context, store: EcommerceStore): void {
  const mode = store.sourceMode

  ctx.tools.register(defineTool({
    name: 'order_list',
    description: '查询订单列表，支持按状态、日期范围、金额区间、买家/订单号搜索，分页返回，按时间倒序。',
    parameters: {
      status: {
        type: 'string',
        enum: ['pending', 'paid', 'shipped', 'completed', 'refunded', 'cancelled'],
        description: '订单状态：待付款/待发货/已发货/已完成/已退款/已取消',
      },
      date_from: { type: 'string', description: '起始日期 YYYY-MM-DD' },
      date_to: { type: 'string', description: '结束日期 YYYY-MM-DD' },
      min_amount: { type: 'number', description: '最低金额（¥）' },
      max_amount: { type: 'number', description: '最高金额（¥）' },
      keyword: { type: 'string', description: '按买家昵称/订单号/商品名搜索' },
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
        const v = value as unknown as { total: number; items: OrderRow[] }
        return [{ type: 'text', text: renderOrders(v, mode) }]
      },
    },
    async execute(args) {
      return asJsonObject(store.listOrders({
        status: args.status,
        date_from: args.date_from,
        date_to: args.date_to,
        min_amount: args.min_amount,
        max_amount: args.max_amount,
        keyword: args.keyword,
        page: args.page ?? 1,
        page_size: args.page_size ?? 20,
      }))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'order_stats',
    description: '统计订单概览：订单量、销售额、客单价、退款率。销售额按已支付口径计算（待付款/已取消不计入）。',
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
          refund_rate: { type: 'number' },
          date_from: { type: 'string' },
          date_to: { type: 'string' },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as {
          revenue: number
          orders: number
          avg_order_value: number
          refund_rate: number
          date_from?: string
          date_to?: string
        }
        return [{
          type: 'text',
          text: [
            `订单统计${v.date_from ? `（${v.date_from} ~ ${v.date_to ?? '今天'}）` : '（全部时间）'}：`,
            `- 销售额：¥${v.revenue.toFixed(2)}`,
            `- 订单量：${v.orders} 笔`,
            `- 客单价：¥${v.avg_order_value.toFixed(2)}`,
            `- 退款率：${v.refund_rate}%`,
          ].join('\n'),
        }]
      },
    },
    async execute(args) {
      const overview = store.overview({ date_from: args.date_from, date_to: args.date_to })
      return asJsonObject({
        ...overview,
        date_from: args.date_from ?? '',
        date_to: args.date_to ?? '',
      })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'order_update_status',
    description: '更新订单状态。合法流转：待付款→待发货/已取消；待发货→已发货/已退款；已发货→已完成/已退款。非法流转会报错。',
    parameters: {
      order_id: { type: 'string', required: true, description: '订单号' },
      status: {
        type: 'string',
        required: true,
        enum: ['pending', 'paid', 'shipped', 'completed', 'refunded', 'cancelled'],
        description: '目标状态',
      },
      note: { type: 'string', description: '备注' },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => {
        const v = value as unknown as OrderRow
        return [{
          type: 'text',
          text: `订单 ${v.order_id} 状态已更新为「${STATUS_TEXT[v.status as OrderStatus] ?? v.status}」`,
        }]
      },
    },
    async execute(args) {
      return asJsonObject(store.updateOrderStatus(args.order_id, args.status as OrderStatus, {
        note: args.note,
      }))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'order_ship',
    description: '订单发货：仅待发货订单可发货，填写运单号和快递公司。',
    parameters: {
      order_id: { type: 'string', required: true, description: '订单号' },
      tracking_no: { type: 'string', required: true, description: '运单号' },
      carrier: { type: 'string', required: true, description: '快递公司，如 顺丰/圆通/中通' },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => {
        const v = value as unknown as OrderRow
        return [{
          type: 'text',
          text: `订单 ${v.order_id} 已发货（${v.carrier ?? ''} 运单 ${v.tracking_no ?? ''}）`,
        }]
      },
    },
    async execute(args) {
      if (!args.tracking_no.trim()) throw new Error('运单号不能为空')
      return asJsonObject(store.shipOrder(args.order_id, args.tracking_no.trim(), args.carrier.trim()))
    },
  }))

  ctx.tools.register(defineTool({
    name: 'order_refund',
    description: '订单退款/售后：待发货或已发货订单可退款，记录退款原因。',
    parameters: {
      order_id: { type: 'string', required: true, description: '订单号' },
      reason: { type: 'string', required: true, description: '退款原因' },
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => {
        const v = value as unknown as OrderRow
        return [{
          type: 'text',
          text: `订单 ${v.order_id} 已退款（原因：${v.refund_reason ?? ''}）`,
        }]
      },
    },
    async execute(args) {
      if (!args.reason.trim()) throw new Error('退款原因不能为空')
      return asJsonObject(store.refundOrder(args.order_id, args.reason.trim()))
    },
  }))
}
