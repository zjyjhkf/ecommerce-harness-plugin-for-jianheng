/**
 * ecommerce-analyst-plugin — 规则问答工具（对齐视频 commerce-cockpit rule-based Q&A）
 *
 * ecommerce_qa：高频经营问题直接命中内置规则返回确定性答案（复用 Store 统计，
 * 与 stats_*、inventory_*、order_* 工具同口径）；未命中时 matched=false，
 * 模型回退到常规工具继续分析。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import { answerQuestion } from '../qa-engine.ts'
import { asJsonObject } from './json.ts'

export function registerQaTool(ctx: Context, store: EcommerceStore): void {
  const mode = store.sourceMode
  ctx.tools.register(defineTool({
    name: 'ecommerce_qa',
    description:
      '规则问答：高频经营问题直接命中内置规则返回确定性答案（经营总览/今日销售/' +
      '畅销TOP/低库存/待发货/待付款与逾期/退款率/类目占比），与 stats_* 等工具同口径。' +
      '命中（matched=true）直接引用 answer；未命中（matched=false）请改用 stats_*/inventory_*/order_* 工具。',
    parameters: {
      question: { type: 'string', required: true, description: '自然语言经营问题，如「店铺今天卖了多少」「低库存有哪些」「畅销TOP5」' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          matched: { type: 'boolean' },
          rule: { type: 'string' },
          rule_title: { type: 'string' },
          answer: { type: 'string' },
          data: { type: 'object', additionalProperties: true },
          chart: { type: 'string' },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as { matched: boolean; rule_title?: string; answer: string; rule?: string }
        const head = v.matched ? `[规则命中：${v.rule_title ?? v.rule ?? ''}]` : '[未命中内置规则，请改用工具查询]'
        const note = mode === 'mock' ? '\n（当前为示例数据模式，仅作演示）' : ''
        return [{ type: 'text', text: `${head}\n${v.answer}${note}` }]
      },
    },
    async execute(args) {
      if (!args.question || !String(args.question).trim()) {
        throw new Error('question 不能为空')
      }
      return asJsonObject(answerQuestion(store, String(args.question).trim()))
    },
  }))
}
