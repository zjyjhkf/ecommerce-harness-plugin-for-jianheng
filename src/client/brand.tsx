/**
 * ecommerce-analyst-plugin — 统一品牌 Logo 与图标（白色 + 浅绿色主调）
 *
 * 品牌标识使用用户提供的「健衡学园 ACTIVE&BALANCED ACADEMY」PNG 图片，
 * 以 Base64 内联到 client bundle，保证 web / desktop 环境显示完全一致。
 *
 * 设计约定：
 *  - 主色（浅绿/青）：#2bb8a3，深一档 #16a085，渐变 #34c9b0 → #1aa085
 *  - BrandBadge：面板/全屏左上角徽标，保持原尺寸（22–24px），圆角显示
 *  - BrandMark：侧边栏底部圆形启动按钮内的 Logo，圆形裁剪适配按钮
 *  - SecIcon：各模块小图标，统一浅绿色描边（currentColor）
 *
 * 全部零外部依赖；react 由宿主提供。
 */
import * as React from 'react'
import { LOGO_SRC } from './logo.ts'
import type { SkillIconKey } from './skills.ts'

/** 浅绿色主调（与参考图一致） */
export const ESD_ACCENT = '#2bb8a3'
export const ESD_ACCENT_STRONG = '#16a085'

/* ────────────── 品牌徽标（面板/全屏左上角 Logo） ────────────── */

export function BrandBadge(props: { size?: number; className?: string }): React.ReactElement {
  const size = props.size ?? 22
  return (
    <img
      className={props.className}
      src={LOGO_SRC}
      alt="健衡学园"
      width={size}
      height={size}
      style={{
        display: 'block',
        borderRadius: '18%',
        objectFit: 'contain',
        background: 'transparent',
      }}
    />
  )
}

/** 启动按键用的 Logo（圆形裁剪，适配 sidebar.footer.action 圆形按钮） */
export function BrandMark(props: { size?: number; className?: string }): React.ReactElement {
  const size = props.size ?? 16
  return (
    <img
      className={props.className}
      src={LOGO_SRC}
      alt="健衡学园"
      width={size}
      height={size}
      style={{
        display: 'block',
        borderRadius: '50%',
        objectFit: 'cover',
        background: 'transparent',
      }}
    />
  )
}

/* ────────────── 模块小图标（浅绿描边，继承 currentColor） ────────────── */

export type SecIconName =
  | 'overview'
  | 'todo'
  | 'category'
  | 'top'
  | 'lowstock'
  | 'actions'
  | 'brief'
  | 'mode'
  | 'product'

function SecIconPath(name: SecIconName): React.ReactElement {
  switch (name) {
    case 'overview':
      return (
        <>
          <path d="M4 20 V12" />
          <path d="M10 20 V6" />
          <path d="M16 20 V14" />
          <path d="M22 20 V9" />
        </>
      )
    case 'todo':
      return (
        <>
          <circle cx="13" cy="13" r="8" />
          <path d="M13 9 V13 L16 15" />
        </>
      )
    case 'category':
      return (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.4" />
          <rect x="15" y="4" width="7" height="7" rx="1.4" />
          <rect x="4" y="15" width="7" height="7" rx="1.4" />
          <rect x="15" y="15" width="7" height="7" rx="1.4" />
        </>
      )
    case 'top':
      return (
        <>
          <circle cx="13" cy="10" r="5" />
          <path d="M13 15 L15 21 L13 19 L11 21 Z" />
        </>
      )
    case 'lowstock':
      return (
        <>
          <path d="M13 3 L24 22 H2 Z" />
          <path d="M13 10 V15" />
          <path d="M13 18.5 V19" />
        </>
      )
    case 'actions':
      return (
        <>
          <path d="M5 7 H21" />
          <path d="M5 13 H21" />
          <path d="M5 19 H15" />
        </>
      )
    case 'brief':
      return (
        <>
          <path d="M7 3 H18 L24 9 V23 H7 Z" />
          <path d="M18 3 V9 H24" />
          <path d="M10 13 H21" />
          <path d="M10 17 H21" />
        </>
      )
    case 'mode':
      return (
        <>
          <path d="M13 3 V8" />
          <path d="M13 18 V23" />
          <path d="M3 13 H8" />
          <path d="M18 13 H23" />
          <path d="M6 6 L9.5 9.5" />
          <path d="M16.5 16.5 L20 20" />
          <path d="M20 6 L16.5 9.5" />
          <path d="M9.5 16.5 L6 20" />
        </>
      )
    case 'product':
      return (
        <>
          <path d="M13 3 L22 8 V18 L13 23 L4 18 V8 Z" />
          <path d="M4 8 L13 13 L22 8" />
          <path d="M13 13 V23" />
        </>
      )
    default:
      return <circle cx="13" cy="13" r="8" />
  }
}

export function SecIcon(props: { name: SecIconName; size?: number }): React.ReactElement {
  const size = props.size ?? 14
  return (
    <svg
      className="esd-sec-icon-svg"
      viewBox="0 0 26 26"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <SecIconPath name={props.name} />
    </svg>
  )
}

/* ────────────── 技能图标（与 SecIcon 同款浅绿描边，用于会话框下方技能条） ────────────── */

function SkillIconPath(name: SkillIconKey): React.ReactElement {
  switch (name) {
    case 'traffic':
      return (
        <>
          <path d="M4 19 L9 13 L13 16 L22 7" />
          <path d="M17 7 H22 V12" />
        </>
      )
    case 'competitor':
      return (
        <>
          <path d="M4 8 H22" />
          <path d="M5 8 L8 4 M5 8 L8 12" />
          <path d="M21 8 L18 4 M21 8 L18 12" />
        </>
      )
    case 'research':
      return (
        <>
          <circle cx="13" cy="13" r="8" />
          <path d="M17.5 8.5 L15.5 15.5 L8.5 17.5 L10.5 10.5 Z" />
        </>
      )
    case 'keyword':
      return (
        <>
          <circle cx="8.5" cy="8.5" r="3.5" />
          <path d="M11 11 L20 20" />
          <path d="M16 16 L20 20" />
          <path d="M18 14 L20 16" />
        </>
      )
    case 'listing':
      return (
        <>
          <path d="M6 4 H20 V22 H6 Z" />
          <path d="M10 9 H16" />
          <path d="M10 13 H16" />
          <path d="M10 17 H14" />
        </>
      )
    case 'market':
      return (
        <>
          <circle cx="13" cy="13" r="9" />
          <circle cx="13" cy="13" r="5" />
          <circle cx="13" cy="13" r="1.5" />
        </>
      )
    case 'review':
      return (
        <>
          <path d="M5 6 H21 V16 H14 L9 21 V16 H5 Z" />
        </>
      )
    default:
      return <circle cx="13" cy="13" r="8" />
  }
}

export function SkillIcon(props: { name: SkillIconKey; size?: number }): React.ReactElement {
  const size = props.size ?? 15
  return (
    <svg
      className="esd-skill-icon-svg"
      viewBox="0 0 26 26"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <SkillIconPath name={props.name} />
    </svg>
  )
}
