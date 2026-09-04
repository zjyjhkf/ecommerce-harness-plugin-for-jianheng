/**
 * ecommerce-analyst-plugin — 导入数据 AI 评价（月复盘 / 周复盘「数据评价」模块）
 *
 * 数据导入后，从「销售额 / 产品 / 推广 / 退款」四个角度对导入数据做一句总体评价，
 * 最终呈现 40~80 字的中文数据评价文本。评价优先走宿主 `ctx.llm`（真实 AI），
 * 模型未配置或调用失败时回退到基于聚合数据的规则模板，保证模块始终有内容。
 *
 * 本模块不直接依赖 dsh-llm / dsh-agent-default-model 包类型（避免引入额外 peer 依赖），
 * 统一通过 `ctx.get('llm')` / `ctx.get('agentDefaultModel')` 的结构化最小类型访问。
 */
import { randomUUID } from 'node:crypto'
import type { MonthlyReport, WeeklyReport } from './types.ts'

/** 评价维度聚合结果（四个角度：销售额 / 产品 / 推广 / 退款） */
export interface EvaluationSummary {
  cycle: '30d' | '7d'
  period: string
  totalSales: number
  totalNet: number
  totalAd: number
  feeRatio: number
  totalRefund: number
  refundRate: number
  itemCount: number
  topItem: string
  topShare: number
}

/** 金额缩写：≥1万 显示「¥x.x万」，否则保留整数元（千分位） */
function fmtMoney(v: number): string {
  const n = Number(v) || 0
  if (n >= 10000) return '¥' + (n / 10000).toFixed(1) + '万'
  return '¥' + Math.round(n).toLocaleString('zh-CN')
}

function sum(rows: Array<Record<string, number>>, field: string): number {
  return rows.reduce((s, r) => s + (Number(r[field]) || 0), 0)
}

/** 归一化行（平台货品 → 系统货品 → 系统规格），供统一聚合（两周期结构一致） */
function pickRows(rep: MonthlyReport | WeeklyReport | null | undefined): Array<Record<string, number | string>> {
  if (!rep) return []
  const links = (rep as { platformLinks?: Array<Record<string, number | string>> }).platformLinks
  if (links && links.length) {
    return links.map((l) => ({
      name: String((l as { linkName?: string; linkId?: string }).linkName ?? (l as { linkId?: string }).linkId ?? ''),
      sales: Number(l.sales) || 0,
      netSales: Number(l.netSales) || 0,
      adSpend: Number(l.adSpend) || 0,
      refundAmount: Number(l.refundAmount) || 0,
      refundRate: Number(l.refundRate) || 0,
    }))
  }
  const products = (rep as { systemProducts?: Array<Record<string, number | string>> }).systemProducts
  if (products && products.length) {
    return products.map((p) => ({
      name: String((p as { name?: string }).name ?? ''),
      sales: Number(p.sales) || 0,
      netSales: Number(p.netSales) || 0,
      adSpend: Number(p.adSpend) || 0,
      refundAmount: 0,
      refundRate: Number(p.refundRate) || 0,
    }))
  }
  const skus = (rep as { systemSkus?: Array<Record<string, number | string>> }).systemSkus
  if (skus && skus.length) {
    return skus.map((s) => ({
      name: String((s as { specName?: string; name?: string }).specName ?? (s as { name?: string }).name ?? ''),
      sales: Number(s.sales) || 0,
      netSales: Number(s.netSales) || 0,
      adSpend: Number(s.adSpend) || 0,
      refundAmount: Number(s.refundAmount) || 0,
      refundRate: Number(s.refundRate) || 0,
    }))
  }
  return []
}

/** 从周期对应报告聚合评价摘要；无数据时返回 null */
export function buildEvaluationSummary(
  cycle: '30d' | '7d',
  monthlyReport: MonthlyReport | null | undefined,
  weeklyReport: WeeklyReport | null | undefined,
): EvaluationSummary | null {
  const rep = cycle === '7d' ? weeklyReport : monthlyReport
  const rows = pickRows(rep)
  if (!rows.length) return null
  const totalSales = sum(rows, 'sales')
  const totalNet = sum(rows, 'netSales')
  const totalAd = sum(rows, 'adSpend')
  const totalRefund = sum(rows, 'refundAmount')
  const feeRatio = totalNet > 0 ? (totalAd / totalNet) * 100 : 0
  const refundRate = totalSales > 0 ? (totalRefund / totalSales) * 100 : sum(rows, 'refundRate') / rows.length
  const top = [...rows].sort((a, b) => (Number(b.netSales) || 0) - (Number(a.netSales) || 0))[0]
  const topShare = totalNet > 0 && top ? ((Number(top.netSales) || 0) / totalNet) * 100 : 0
  const period = String((rep as { period?: string }).period ?? (cycle === '7d' ? '本周' : '本月'))
  return {
    cycle,
    period,
    totalSales,
    totalNet,
    totalAd,
    feeRatio,
    totalRefund,
    refundRate,
    itemCount: rows.length,
    topItem: String((top as { name?: string } | undefined)?.name ?? ''),
    topShare,
  }
}

/** 规则模板评价（AI 不可用时的兜底；保证 40~80 字） */
export function ruleBasedEvaluation(s: EvaluationSummary): string {
  const periodLabel = s.cycle === '7d' ? '本周' : '本月'
  const issues: string[] = []
  if (s.feeRatio > 20) issues.push('推广费比偏高')
  if (s.refundRate > 10) issues.push('退款率偏高')
  if (s.topShare > 40) issues.push('头部商品占比过高')
  const verdict = issues.length ? issues.join('、') + '，建议优化对应环节' : '销售与费效整体平稳'
  const text =
    `${periodLabel}销售额${fmtMoney(s.totalSales)}，在销商品${s.itemCount}个，费比${s.feeRatio.toFixed(1)}%，退款率${s.refundRate.toFixed(1)}%；${verdict}。`
  return text.length > 80 ? text.slice(0, 80) : text
}

/** 生成 AI 评价提示词（四个角度 + 输出约束） */
export function evaluationPrompt(s: EvaluationSummary): string {
  const periodLabel = s.cycle === '7d' ? '本周' : '本月'
  return [
    `请基于以下${periodLabel}电商经营数据，从「销售额、产品、推广、退款」四个角度做一句总体数据评价。`,
    `- 周期：${s.period}`,
    `- 销售额：${fmtMoney(s.totalSales)}（净销 ${fmtMoney(s.totalNet)}）`,
    `- 产品：在销商品 ${s.itemCount} 个，头部商品「${s.topItem}」净销占比 ${s.topShare.toFixed(1)}%`,
    `- 推广：推广费 ${fmtMoney(s.totalAd)}，整体费比 ${s.feeRatio.toFixed(1)}%`,
    `- 退款：退款金额 ${fmtMoney(s.totalRefund)}，退款率 ${s.refundRate.toFixed(1)}%`,
    '',
    '要求：仅输出一句 40~80 字的中文评价（含标点），不要标题、不要换行、不要列表符号、不要任何解释。',
  ].join('\n')
}

const EVAL_SYSTEM = '你是资深电商数据分析师，善于用一句话精准概括经营数据并给出可执行建议。'

/** dsh llm 服务结构化最小类型（延迟读取，规避加载顺序） */
interface LlmLike {
  stream(options: {
    provider: string
    model: string
    messages: Array<{
      id: string
      role: 'user' | 'system' | 'assistant'
      content: Array<{ type: 'text'; text: string }>
      source: { kind: 'plugin'; plugin: string }
    }>
    system?: string
    maxTokens?: number
    temperature?: number
  }): AsyncIterable<{
    type: string
    index?: number
    text?: string
    reason?: { kind?: string; failure?: { message?: string } }
  }>
}

/** 清洗 AI 输出：去首尾引号/冒号/换行，去「评价/结论：」前缀 */
function cleanEvaluationText(raw: string): string {
  return raw
    .replace(/^[\s"'“”「」：:]+/, '')
    .replace(/[\s"'“”「」：:]+$/, '')
    .replace(/^(数据评价|评价|结论)[：:]\s*/, '')
    .trim()
}

/**
 * 经宿主 `ctx.llm` 生成一句数据评价（真实 AI）。
 * 模型未配置 / 服务缺失 / 输出不足 40 字时返回 null，交由调用方回退规则模板。
 */
export async function callLlmForEvaluation(
  ctx: { get?(name: string): unknown } | null | undefined,
  prompt: string,
): Promise<string | null> {
  try {
    if (!ctx || typeof ctx.get !== 'function') return null
    const llm = ctx.get('llm') as LlmLike | undefined
    if (!llm || typeof llm.stream !== 'function') return null
    const dm = ctx.get('agentDefaultModel') as { currentSelection?: () => { provider: string; model: string } } | undefined
    const sel = dm?.currentSelection?.()
    if (!sel || !sel.provider || !sel.model) return null
    let text = ''
    for await (const chunk of llm.stream({
      provider: sel.provider,
      model: sel.model,
      system: EVAL_SYSTEM,
      messages: [
        {
          id: randomUUID(),
          role: 'user',
          content: [{ type: 'text', text: prompt }],
          source: { kind: 'plugin', plugin: 'ecommerce-analyst' },
        },
      ],
      maxTokens: 160,
      temperature: 0.6,
    })) {
      if (chunk.type === 'text-delta' && typeof chunk.text === 'string') text += chunk.text
      else if (chunk.type === 'finish' && chunk.reason && (chunk.reason.kind === 'error' || chunk.reason.kind === 'aborted')) return null
    }
    const cleaned = cleanEvaluationText(text)
    if (cleaned.length < 40) return null
    return cleaned.length > 80 ? cleaned.slice(0, 80) : cleaned
  } catch (err) {
    console.error('[ecommerce-analyst] AI 数据评价生成失败：', err)
    return null
  }
}
