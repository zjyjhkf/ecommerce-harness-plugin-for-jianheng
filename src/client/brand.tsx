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
  /* 文件处理页专用（与上面同款：26×26 网格、currentColor 描边、圆头圆角） */
  | 'upload'
  | 'download'
  | 'refresh'
  | 'trash'
  | 'file'
  | 'folder'
  | 'inbox'
  | 'outbox'
  | 'dragexport'
  | 'process'

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
    /* ── 文件处理页：上传（箭头入托盘） ── */
    case 'upload':
      return (
        <>
          <path d="M13 17.5 V4.5" />
          <path d="M8.2 9.3 L13 4.5 L17.8 9.3" />
          <path d="M4.5 15.5 V19.5 A2 2 0 0 0 6.5 21.5 H19.5 A2 2 0 0 0 21.5 19.5 V15.5" />
        </>
      )
    /* ── 下载（箭头出托盘） ── */
    case 'download':
      return (
        <>
          <path d="M13 4.5 V17.5" />
          <path d="M8.2 12.7 L13 17.5 L17.8 12.7" />
          <path d="M4.5 15.5 V19.5 A2 2 0 0 0 6.5 21.5 H19.5 A2 2 0 0 0 21.5 19.5 V15.5" />
        </>
      )
    /* ── 刷新（环形箭头） ── */
    case 'refresh':
      return (
        <>
          <path d="M21 13 A8 8 0 1 1 18.4 7.2" />
          <path d="M21.5 3.5 V8.2 H16.8" />
        </>
      )
    /* ── 删除（垃圾桶） ── */
    case 'trash':
      return (
        <>
          <path d="M5 7.5 H21" />
          <path d="M10 7.5 V5.2 A1.2 1.2 0 0 1 11.2 4 H14.8 A1.2 1.2 0 0 1 16 5.2 V7.5" />
          <path d="M6.6 7.5 L7.7 20.2 A1.6 1.6 0 0 0 9.3 21.7 H16.7 A1.6 1.6 0 0 0 18.3 20.2 L19.4 7.5" />
          <path d="M11 11.5 V18" />
          <path d="M15 11.5 V18" />
        </>
      )
    /* ── 文件（单页折角） ── */
    case 'file':
      return (
        <>
          <path d="M6.5 3.5 H15 L20 8.5 V22.5 H6.5 Z" />
          <path d="M15 3.5 V8.5 H20" />
          <path d="M10 13 H17" />
          <path d="M10 17 H17" />
        </>
      )
    /* ── 文件夹 ── */
    case 'folder':
      return (
        <>
          <path d="M3.5 7.5 A1.6 1.6 0 0 1 5.1 5.9 H10.2 L12.4 8.6 H20.9 A1.6 1.6 0 0 1 22.5 10.2 V19.6 A1.6 1.6 0 0 1 20.9 21.2 H5.1 A1.6 1.6 0 0 1 3.5 19.6 Z" />
        </>
      )
    /* ── 收件箱（托盘 + 向下箭头） ── */
    case 'inbox':
      return (
        <>
          <path d="M3.5 14.5 H8.4 L9.8 17 H16.2 L17.6 14.5 H22.5" />
          <path d="M5.4 14.5 L7.6 5.4 A1.6 1.6 0 0 1 9.2 4.2 H16.8 A1.6 1.6 0 0 1 18.4 5.4 L20.6 14.5 V19.6 A1.6 1.6 0 0 1 19 21.2 H7 A1.6 1.6 0 0 1 5.4 19.6 Z" />
        </>
      )
    /* ── 结果箱（托盘 + 向上箭头） ── */
    case 'outbox':
      return (
        <>
          <path d="M3.5 14.5 H8.4 L9.8 17 H16.2 L17.6 14.5 H22.5" />
          <path d="M5.4 14.5 L7.6 5.4 A1.6 1.6 0 0 1 9.2 4.2 H16.8 A1.6 1.6 0 0 1 18.4 5.4 L20.6 14.5 V19.6 A1.6 1.6 0 0 1 19 21.2 H7 A1.6 1.6 0 0 1 5.4 19.6 Z" />
          <path d="M13 12.6 V6.4" />
          <path d="M10.4 9 L13 6.4 L15.6 9" />
        </>
      )
    /* ── 拖出到本地（方框 + 外指箭头） ── */
    case 'dragexport':
      return (
        <>
          <path d="M14.5 4.5 H6.4 A1.9 1.9 0 0 0 4.5 6.4 V19.6 A1.9 1.9 0 0 0 6.4 21.5 H19.6 A1.9 1.9 0 0 0 21.5 19.6 V11.5" />
          <path d="M15.5 3.5 H22.5 V10.5" />
          <path d="M22.5 3.5 L13.4 12.6" />
        </>
      )
    /* ── 处理（齿轮） ── */
    case 'process':
      return (
        <>
          <circle cx="13" cy="13" r="3.4" />
          <path d="M13 3.4 V6.2 M13 19.8 V22.6 M22.6 13 H19.8 M6.2 13 H3.4" />
          <path d="M19.8 6.2 L17.8 8.2 M8.2 17.8 L6.2 19.8 M19.8 19.8 L17.8 17.8 M8.2 8.2 L6.2 6.2" />
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

/* ────────────── 文件处理入口标记（与 BrandMark 同族：圆形按钮内的品牌色徽标） ────────────── */

/**
 * 左侧栏「文件处理」按钮的图标。
 * 与既有 BrandMark（健衡学园圆形 Logo）同族：同样是圆形按钮内的一枚徽标，
 * 但用品牌浅绿实底 + 白色描边的「文件互换」图形，避免与「数据查看」图标混淆；
 * 不使用 emoji（emoji 在不同系统渲染差异大、观感也偏"通用 AI 味"）。
 */
export function FileMark(props: { size?: number; className?: string }): React.ReactElement {
  const size = props.size ?? 16
  return (
    <svg
      className={props.className}
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="esd-filemark-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34c9b0" />
          <stop offset="100%" stopColor="#1aa085" />
        </linearGradient>
      </defs>
      {/* 圆形底色：与侧边栏圆形按钮同心，留 1px 视觉呼吸 */}
      <circle cx="16" cy="16" r="16" fill="url(#esd-filemark-g)" />
      {/* 两张交错的文件（上传 / 交付），白色描边 */}
      <g fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 8.5 H17.6 L20.4 11.3 V19.4 H11 Z" />
        <path d="M17.6 8.5 V11.3 H20.4" />
        <path d="M21 15.2 H14.4 L11.6 18 V23.5 H21 Z" opacity="0.95" />
      </g>
      {/* 双向箭头：表达"交给 AI 处理再取回" */}
      <g fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.2 14.6 V20.6" />
        <path d="M6.4 18.8 L8.2 20.6 L10 18.8" />
      </g>
    </svg>
  )
}
