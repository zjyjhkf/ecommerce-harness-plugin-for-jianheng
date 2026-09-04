/**
 * ecommerce-analyst-plugin — 技能模块注册表（基于 .dsh/skills/ 的 7 个跨境电商分析技能）
 *
 * 纯数据 + 提示词构建，无 DOM / React 依赖，便于单测与在任意入口（面板 / composer.dock）
 * 复用。技能 slug 与 .dsh/skills/<id>/SKILL.md 的 frontmatter `name` 一一对应：
 *   ad-traffic / competitor-analysis / comprehensive-research / keyword-research /
 *   listing / market-opportunity / review-insight
 */

/** 技能图标键（SVG 描边图标，由 brand.tsx 的 SkillIcon 渲染） */
export type SkillIconKey =
  | 'traffic'
  | 'competitor'
  | 'research'
  | 'keyword'
  | 'listing'
  | 'market'
  | 'review'

export interface SkillModule {
  /** 技能 slug（= SKILL.md 的 name） */
  id: string
  /** 中文名（按键主文案） */
  label: string
  /** 按键图标（SVG 描边图标键，参考插件面板绿色描边样式） */
  icon: SkillIconKey
  /** 一句话说明（按键 title / 副标题） */
  hint: string
  /** 分析任务描述（拼入会话提示词） */
  task: string
}

export const SKILL_MODULES: SkillModule[] = [
  {
    id: 'ad-traffic',
    label: '广告流量',
    icon: 'traffic',
    hint: 'ACOS / CPC / 流量来源 / 预算分配',
    task: '分析流量结构（自然 vs 广告）与广告效率指标（ACOS、CPC、CTR、CVR、广告花费占比），定位高花费低转化的浪费点，并给出竞价、预算、结构与否定词的优化建议。',
  },
  {
    id: 'competitor-analysis',
    label: '竞品分析',
    icon: 'competitor',
    hint: '对手 / ASIN / 差异化 / SWOT',
    task: '圈定核心竞品，对比价格、评分、评论数、卖点、流量与广告策略，做 SWOT 与差异化定位，并给出 1-3 个可打的差异点。',
  },
  {
    id: 'comprehensive-research',
    label: '综合研究',
    icon: 'research',
    hint: '全方位综合分析',
    task: '对研究对象做市场机会、竞品、关键词、评论、广告、Listing 的全方位综合分析，先给一句话结论，再给关键数据，最后输出 P0/P1/P2 可执行动作。',
  },
  {
    id: 'keyword-research',
    label: '关键词研究',
    icon: 'keyword',
    hint: '挖词 / 选词 / ABA',
    task: '从种子词挖掘长尾词，评估搜索量、竞争度与相关性，区分流量词与转化词，产出 Listing 埋词方案与广告词分组（精准/广泛/否定）。',
  },
  {
    id: 'listing',
    label: 'Listing优化',
    icon: 'listing',
    hint: '标题 / 五点 / 转化率',
    task: '对照关键词与评论洞察，优化标题、五点、描述、图片与后台关键词，定位点击率低还是转化率低，提升承接流量的能力。',
  },
  {
    id: 'market-opportunity',
    label: '市场机会',
    icon: 'market',
    hint: '类目 / 容量 / 选品',
    task: '评估市场容量、增长趋势、价格带分布、竞争集中度与进入门槛，输出「进入 / 谨慎 / 放弃」的判断与切入点建议。',
  },
  {
    id: 'review-insight',
    label: '评论洞察',
    icon: 'review',
    hint: '好评 / 差评 / 痛点卖点',
    task: '从用户评论挖掘高频好评卖点、差评痛点与使用场景，按 P0/P1/P2 给出反哺选品、Listing 与售后的改进动作。',
  },
]

export function findSkill(id: string): SkillModule | undefined {
  return SKILL_MODULES.find((s) => s.id === id)
}

/**
 * 构建「点击技能按键 → 会话框」的短链接形式。
 * 会话框只显示技能中文名（渲染为彩色链接，与其他内容区分度明显），
 * 不再塞入冗长提示词；后续点击视图弹值会追加到同一输入框，与技能拼合后一起分析。
 */
export function skillTagOf(skill: SkillModule): string {
  return `[${skill.label}](ecommerce-skill://${skill.id})`
}

/** 构建「点击视图 → 会话框弹出对应数值」的提示词 */
export function valuePromptOf(label: string, value: string, note?: string): string {
  const lines = [`当前店铺数据 · ${label}：${value}`]
  if (note !== undefined && note !== '') lines.push(note)
  lines.push('请结合店铺数据，对上述指标做简要分析并给出可执行建议。')
  return lines.join('\n')
}
