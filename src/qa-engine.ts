/**
 * ecommerce-analyst-plugin — 规则问答引擎（对齐视频 commerce-cockpit rule-based Q&A）
 *
 * 高频经营问题直接命中内置规则并返回结构化结果（复用 Store 统计逻辑，
 * 与 stats_*、inventory_*、order_* 工具同一口径），不依赖模型推理；
 * 未命中时 matched=false，由模型回退到常规工具继续分析。
 *
 * 覆盖规则：
 *   1. overview       经营总览（销售额/订单量/客单价/退款率）
 *   2. today_sales    今日销售（今日已支付销售额/订单量）
 *   3. top_products   畅销商品 TOP（销售额排行）
 *   4. low_stock      低库存清单
 *   5. pending_ship   待发货订单
 *   6. pending_pay    待付款/逾期订单
 *   7. refund         退款/售后
 *   8. category       类目销售占比
 */
import type { EcommerceStore } from './store.ts'
import { todayStr } from './store.ts'
import type { JsonValue } from '@deepseek-ai/dsh-tools'

/** 问答命中结果（确定性输出，模型直接引用 answer 即可） */
export interface QaResult {
  matched: boolean
  rule?: string
  rule_title?: string
  answer?: string
  data?: Record<string, JsonValue>
  chart?: 'line' | 'donut' | 'bar' | null
}

/** 归一化问题：去空白/标点/转小写（英文关键词可命中） */
function normalize(q: string): string {
  return q
    .toLowerCase()
    .replace(/[\s，。？！、；：""''（）()【】《》,.?!;:'"\[\]{}|\/\\-—_]+/g, '')
}

const money = (v: number): string => `¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/**
 * 规则表：按优先级排列（先命中先返回）。每条规则声明关键词与执行逻辑，
 * 执行结果全部来自 store（overview / trend / topProducts / lowStock /
 * pendingShipments / overduePending / categoryDistribution）。
 */
const RULES: Array<{
  id: string
  title: string
  keywords: string[]
  run: (store: EcommerceStore) => { answer: string; data: Record<string, JsonValue>; chart?: 'line' | 'donut' | 'bar' | null }
}> = [
  {
    id: 'today_sales',
    title: '今日销售',
    keywords: ['今天卖', '今日卖', '今日销售', '今天销售', '今日订单', '今天订单', '今日成交', '今天成交', '今日营收', '今天营收', '今天的销售', '今天流水', '今日流水', '今天多少钱', '今日多少钱'],
    run: (store) => {
      const today = todayStr()
      const o = store.overview({ date_from: today, date_to: today })
      const answer = [
        `今日销售（${today}，已支付口径）：`,
        `- 销售额：${money(o.revenue)}`,
        `- 订单量：${o.orders} 笔`,
        o.orders > 0 ? `- 客单价：${money(o.avg_order_value)}` : '- 今日暂无已支付订单',
      ].join('\n')
      return { answer, data: { date: today, overview: o } }
    },
  },
  {
    id: 'overview',
    title: '经营总览',
    keywords: ['总览', '概览', '整体情况', '经营情况', '店铺情况', '销售情况', '生意', '业绩', '营收情况', '经营状况', '概况'],
    run: (store) => {
      const o = store.overview()
      const answer = [
        '经营总览（全部时间，已支付口径）：',
        `- 销售额：${money(o.revenue)}`,
        `- 订单量：${o.orders} 笔`,
        `- 客单价：${money(o.avg_order_value)}`,
        `- 退款率：${o.refund_rate}%`,
        o.top_selling_sku ? `- 畅销商品：${o.top_selling_sku}` : '',
      ].filter(Boolean).join('\n')
      return { answer, data: { overview: o } }
    },
  },
  {
    id: 'top_products',
    title: '畅销商品 TOP',
    keywords: ['畅销', '排行', '排名', 'top', '最好卖', '卖得最好', '爆款', '热销', '明星商品'],
    run: (store) => {
      const top = store.topProducts({}, 10)
      const answer = top.length === 0
        ? '暂无销售数据'
        : '商品销售排行 TOP' + top.length + '：\n' + top.map((p, i) =>
            `${i + 1}. ${p.name}（${p.sku}）${money(p.revenue)}，${p.units} 件`,
          ).join('\n')
      return { answer, data: { items: top } }
    },
  },
  {
    id: 'low_stock',
    title: '低库存预警',
    keywords: ['低库存', '库存不足', '缺货', '没货', '补货', '库存预警', '库存告急', '库存低'],
    run: (store) => {
      const items = store.lowStock()
      const answer = items.length === 0
        ? '库存充足，没有低于阈值的商品 🎉'
        : '⚠️ 有 ' + items.length + ' 件商品库存低于阈值：\n' +
          items.map((p) => `- ${p.sku} ｜ ${p.name} ｜ 库存 ${p.stock} ｜ ${p.category}`).join('\n')
      return { answer, data: { threshold: items[0]?.threshold ?? 10, items } }
    },
  },
  {
    id: 'pending_ship',
    title: '待发货订单',
    keywords: ['待发货', '未发货', '没发货', '待发', '还没发', '要发货'],
    run: (store) => {
      const list = store.pendingShipments()
      const answer = list.length === 0
        ? '没有待发货订单 🎉'
        : '📦 待发货订单 ' + list.length + ' 笔：\n' +
          list.map((o) => `- ${o.order_id} ｜ ${o.buyer} ｜ ${money(o.amount)}`).slice(0, 20).join('\n') +
          (list.length > 20 ? '\n…共 ' + list.length + ' 笔' : '')
      return { answer, data: { count: list.length, items: list.slice(0, 50) } }
    },
  },
  {
    id: 'pending_pay',
    title: '待付款/逾期订单',
    keywords: ['待付款', '未付款', '未支付', '逾期', '欠款', '没付', '还没付', '催付', '待支付'],
    run: (store) => {
      const overdues = store.overduePending()
      const pend = store.listOrders({ status: 'pending', page_size: 500 }).total
      const answer = [
        `⏰ 待付款订单 ${pend} 笔`,
        `⚠️ 其中逾期（超过 24 小时未处理）${overdues.length} 笔：`,
        overdues.length === 0 ? '- 无逾期' :
          overdues.map((o) => `- ${o.order_id}（${o.buyer}，${money(o.amount)}）`).join('\n'),
      ].join('\n')
      return { answer, data: { pending: pend, overdueCount: overdues.length, overdues: overdues.slice(0, 50) } }
    },
  },
  {
    id: 'refund',
    title: '退款/售后',
    keywords: ['退款', '退货', '售后', '退单', '退款率'],
    run: (store) => {
      const o = store.overview()
      const refunded = store.listOrders({ status: 'refunded', page_size: 500 }).total
      const answer = [
        `退款率：${o.refund_rate}%（全部时间）`,
        `已退款订单：${refunded} 笔`,
        o.refund_rate >= 10 ? '⚠️ 退款率偏高，建议核查售后原因' : '✅ 退款率处于正常水平',
      ].join('\n')
      return { answer, data: { refund_rate: o.refund_rate, refunded_orders: refunded } }
    },
  },
  {
    id: 'category',
    title: '类目销售占比',
    keywords: ['类目', '分类', '占比', '结构', '分布', '品类'],
    run: (store) => {
      const items = store.categoryDistribution()
      const answer = items.length === 0
        ? '暂无销售数据'
        : '类目销售分布：\n' + items.map((c) => `- ${c.category}：${money(c.revenue)}（${c.ratio}%）`).join('\n')
      return { answer, data: { items }, chart: 'donut' }
    },
  },
]

/** 命中规则并生成确定性回答；未命中返回 matched=false */
export function answerQuestion(store: EcommerceStore, question: string): QaResult {
  const q = normalize(question)
  if (!q) {
    return { matched: false, answer: '问题为空，请描述你想了解的店铺经营信息。' }
  }
  for (const rule of RULES) {
    if (rule.keywords.some((k) => q.includes(k))) {
      const out = rule.run(store)
      return {
        matched: true,
        rule: rule.id,
        rule_title: rule.title,
        answer: out.answer,
        data: out.data,
        chart: out.chart ?? null,
      }
    }
  }
  return {
    matched: false,
    answer: '未命中内置高频规则，请改用 stats_overview / stats_trend / stats_top_products / stats_category / inventory_low_stock / order_list 等工具查询。',
  }
}

/** 规则能力说明（供系统提示注入，让模型知道命中即直答、未命中再走工具） */
export function qaRuleDescription(): string {
  return [
    '「规则问答」：高频经营问题可调用 ecommerce_qa 直接命中，返回确定性答案（与工具同口径）：',
    '- 经营总览 / 今日销售 / 畅销商品 TOP / 低库存 / 待发货 / 待付款与逾期 / 退款率 / 类目占比',
    '- 命中（matched=true）时直接引用 answer 回答用户，无需再调其他工具；',
    '- 未命中（matched=false）时改用 stats_*/inventory_*/order_* 工具查询。',
  ].join('\n')
}
