/**
 * ecommerce-analyst-plugin — 技能模块横向按键条
 *
 * 7 个跨境电商分析技能（来自 .dsh/skills/）横置排列成一行。
 * 两种形态：
 *  - variant="panel"：面板头部下方（ShopDeskPanel / ShopDeskTab），正常尺寸
 *  - variant="dock" ：会话 composer.dock 下方横条，紧凑可横向滚动
 */
import * as React from 'react'
import { SKILL_MODULES, type SkillModule } from './skills.ts'
import { BrandBadge, SkillIcon } from './brand.tsx'

export interface SkillBarProps {
  /** 点击某个技能按键时回调（由宿主决定如何送入会话框） */
  onInvoke: (skill: SkillModule) => void
  variant?: 'panel' | 'dock'
}

export function SkillBar(props: SkillBarProps): React.ReactElement {
  const variant = props.variant ?? 'panel'
  return (
    <div className={'esd-skillbar' + (variant === 'dock' ? ' esd-skillbar-dock' : '')}>
      <span className="esd-skillbar-title">
        <BrandBadge size={16} className="esd-skillbar-logo" />
        <span className="esd-skillbar-name">技能分析</span>
      </span>
      {SKILL_MODULES.map((s) => (
        <button
          key={s.id}
          type="button"
          className="esd-skill-btn"
          title={`${s.label} · ${s.hint}`}
          aria-label={`调用「${s.label}」技能`}
          onClick={() => props.onInvoke(s)}
        >
          <SkillIcon name={s.icon} size={15} />
          <span className="esd-skill-label">{s.label}</span>
        </button>
      ))}
    </div>
  )
}
