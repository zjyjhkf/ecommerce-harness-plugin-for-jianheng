/**
 * ecommerce-analyst-plugin — 侧边栏面板样式（内联注入，零外部依赖）
 *
 * 全部类名前缀 esd-（ecommerce shop desk），避免与宿主样式冲突。
 * 颜色走 dsh 主题 token（var(--dsw-alias-*)），缺省时回退到中性色，
 * 明暗模式由宿主主题自动切换。color-mix 声明后置作渐进增强。
 */

const CSS = `
.esd-root {
  pointer-events: none;
  font-family: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif);
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #1c1c1e);
  /* 统一品牌主调：白色 + 浅绿（覆盖 dsh 默认交互蓝） */
  --esd-accent: #2bb8a3;
  --esd-accent-strong: #16a085;
  --esd-accent-soft: rgba(43, 184, 163, 0.12);
  --esd-accent-soft-2: rgba(43, 184, 163, 0.20);
  --dsw-alias-interactive-primary: var(--esd-accent);
  --dsw-alias-interactive-bg: var(--esd-accent-soft);
  --dsw-alias-interactive-bg-hover: rgba(43, 184, 163, 0.10);
  --dsw-alias-state-success-primary: #16a085;
}

/* ── 右侧悬浮开关（竖排胶囊，始终可见） ── */
.esd-toggle {
  pointer-events: auto;
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 9400;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 14px 7px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.28));
  border-right: none;
  border-radius: 10px 0 0 10px;
  background: var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-base, #ffffff));
  color: var(--dsw-alias-label-primary, #1c1c1e);
  box-shadow: var(--dsw-shadow-lv1, 0 1px 4px rgba(0,0,0,.10));
  cursor: pointer;
  user-select: none;
  transition: background .15s ease;
}
.esd-toggle:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.10)); }
.esd-toggle-icon { font-size: 18px; line-height: 1; }
.esd-toggle-text {
  writing-mode: vertical-rl;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--dsw-alias-label-secondary, #555);
}
.esd-toggle-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--dsw-alias-state-error-primary, #e5484d);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 17px;
  text-align: center;
  box-shadow: 0 0 0 2px var(--dsw-alias-bg-base, #fff);
}

/* ── 面板容器（停靠右侧，推送会话列，不覆盖会话框） ──
   挂在 shell.overlay 层（host 绝对定位 inset:0），面板以 absolute 停靠在右缘，
   同时通过下方推送规则把中间会话列向右让出同等宽度，两者并排、互不遮挡。
   默认非全屏：数据展示面积 ≈ 全屏面板的 35%（clamp(320px, 35vw, 640px)）。
   开启容器查询，内部模块随面板宽度按比例缩放，避免拥挤/缺漏。 */
:has(> [data-shell-overlay]) {
  /* 面板宽度统一取值：停靠面板与「推送会话列」共享，避免两处漂移。 */
  --esd-panel-width: clamp(320px, 35vw, 640px);
}

.esd-panel {
  pointer-events: auto;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--esd-panel-width, clamp(320px, 35vw, 640px));
  z-index: 1;
  display: flex;
  flex-direction: column;
  background: var(--dsw-alias-bg-base, #ffffff);
  border-left: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.28));
  box-shadow: var(--dsw-shadow-lv3, 0 8px 32px rgba(0,0,0,.20));
  animation: esd-slide-in .18s ease-out;
  container-type: inline-size;
  container-name: esdpanel;
}
@keyframes esd-slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* 面板打开（非全屏）时，把中间会话列向右让出面板宽度，面板停靠在让出的空间内。
   AppFrame 三列 grid 的直接子节点顺序固定为 sidebarCol / centerCol / detailsCol /
   overlayLayer（React Fragment 不产生 DOM 节点），故 centerCol 恒为第 2 个子元素。
   会话内容按 max-width 居中，向右 padding 后整体左移，不再被面板遮挡。 */
:has(> [data-shell-overlay]):has(.esd-panel:not(.esd-panel-fullscreen)) > :nth-child(2) {
  padding-right: var(--esd-panel-width, clamp(320px, 35vw, 640px));
  transition: padding-right var(--ds-transition-duration-slow, 200ms) var(--ds-ease-in-out, ease);
}

.esd-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.16));
  flex: none;
}
.esd-header-logo { display: inline-flex; align-items: center; flex: none; line-height: 1; }
.esd-header-title { margin: 0; font-size: 15px; font-weight: 600; flex: 1; display: flex; align-items: center; gap: 8px; }
.esd-header-sub { font-size: 11px; color: var(--dsw-alias-label-tertiary, #999); font-weight: 400; margin-left: 6px; }
.esd-tab-title { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; }
.esd-tab-title-text { display: inline-flex; align-items: center; gap: 6px; }
.esd-icon-btn {
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: var(--esd-accent, #2bb8a3);
  font-size: 15px;
  padding: 4px 6px;
  border-radius: 6px;
  line-height: 1;
  transition: background .15s, border-color .15s, color .15s;
}
.esd-icon-btn:hover { background: var(--esd-accent-soft, rgba(43,184,163,.12)); border-color: var(--esd-accent-soft-2, rgba(43,184,163,.20)); }
.esd-icon-btn:active { background: var(--esd-accent); color: #fff; border-color: var(--esd-accent); }
.esd-refresh-btn {
  border: 1px solid var(--esd-accent, #2bb8a3);
  background: #fff;
  color: var(--esd-accent-strong, #16a085);
  font-size: 12px;
  padding: 3px 9px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s, color .15s, border-color .15s;
}
.esd-refresh-btn:hover { background: var(--esd-accent-soft, rgba(43,184,163,.12)); }
.esd-refresh-btn:active { background: var(--esd-accent); color: #fff; border-color: var(--esd-accent); }

.esd-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.esd-body::-webkit-scrollbar { width: 8px; }
.esd-body::-webkit-scrollbar-thumb {
  background: var(--dsw-alias-scrollbar-bg-l1, rgba(128,128,128,.28));
  border-radius: 4px;
}
.esd-body::-webkit-scrollbar-thumb:hover { background: var(--dsw-alias-scrollbar-hover-l1, rgba(128,128,128,.45)); }

.esd-section {
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.16));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #fafafa);
  overflow: hidden;
  flex: none;
}
.esd-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px 6px;
  font-size: 13px;
  font-weight: 600;
}
.esd-sec-icon { color: var(--esd-accent, #2bb8a3); display: inline-flex; align-items: center; flex: none; line-height: 1; }
.esd-sec-icon-svg { display: block; }
.esd-sec-meta { margin-left: auto; font-size: 11px; font-weight: 400; color: var(--dsw-alias-label-tertiary, #999); }
.esd-section-body { padding: 2px 10px 10px; }

/* ── 经营总览（精简版：删除与 BI 数据看板重复的 KPI 卡/趋势图/类目占比） ── */
.esd-overview-body { padding: 6px 2px 8px; }
.esd-overview-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-base, #ffffff);
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.12));
}
.esd-overview-label { font-size: 12px; color: var(--dsw-alias-label-secondary, #666); }
.esd-overview-value { font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-primary, #1c1c1e); margin-left: auto; }
.esd-overview-sku { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.esd-overview-hint {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary, #666);
  padding: 0 4px;
}

/* 原经营总览卡片已删除（与 BI 看板重复），相关旧类名保留兼容，实际不再渲染 */
.esd-stats { display: none; }

/* ── 今日待办 ── */
.esd-todo-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 9px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}
.esd-todo-row:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.08)); }
.esd-todo-row.esd-overdue {
  background: rgba(229, 72, 77, 0.08);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 8%, transparent);
  border-color: rgba(229, 72, 77, 0.35);
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 32%, transparent);
}
.esd-todo-icon { font-size: 15px; }
.esd-todo-label { flex: 1; font-size: 13px; }
.esd-todo-count {
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
  background: var(--dsw-alias-bg-layer-2, #ececec);
  color: var(--dsw-alias-label-secondary, #555);
  font-variant-numeric: tabular-nums;
}
.esd-todo-count.esd-danger-count { background: var(--dsw-alias-state-error-primary, #e5484d); color: #fff; }
.esd-todo-chevron { font-size: 10px; color: var(--dsw-alias-label-tertiary, #aaa); }

.esd-overdue-list { display: flex; flex-direction: column; gap: 3px; padding: 0 4px 6px; }
.esd-overdue-item {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #555);
  padding: 4px 7px;
  border-radius: 6px;
}
.esd-overdue-item:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.08)); }
.esd-overdue-id { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; color: var(--dsw-alias-label-primary, #1c1c1e); }
.esd-overdue-buyer { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90px; }
.esd-overdue-amount { margin-left: auto; font-variant-numeric: tabular-nums; color: var(--dsw-alias-state-error-primary, #e5484d); }

/* ── 商品分类树 ── */
.esd-cat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
.esd-cat:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.08)); }
.esd-cat.esd-cat-active {
  background: var(--dsw-alias-interactive-bg-active, rgba(0,0,0,.07));
  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2, rgba(128,128,128,.4));
}
.esd-cat-icon { font-size: 14px; }
.esd-cat-count { margin-left: auto; font-size: 11px; color: var(--dsw-alias-label-tertiary, #999); font-variant-numeric: tabular-nums; }
.esd-cat-revenue { font-size: 11px; color: var(--dsw-alias-label-tertiary, #999); margin-left: 8px; font-variant-numeric: tabular-nums; }

.esd-product-list { display: flex; flex-direction: column; gap: 4px; padding: 2px 2px 4px; }
.esd-product {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 12px;
}
.esd-product:nth-child(odd) { background: var(--dsw-alias-bg-layer-1, #f4f4f4); }
.esd-product-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.esd-product-price { color: var(--dsw-alias-label-secondary, #666); font-variant-numeric: tabular-nums; }
.esd-product-stock { color: var(--dsw-alias-label-secondary, #888); font-size: 11px; }
.esd-chip { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; line-height: 15px; }
.esd-chip-on { background: rgba(48, 164, 108, 0.16); color: #1f8a56; }
.esd-chip-off { background: var(--dsw-alias-bg-layer-2, #e8e8e8); color: var(--dsw-alias-label-secondary, #777); }

/* ── 销售排行 TOP5 ── */
.esd-top-item { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 6px; font-size: 12px; }
.esd-top-item:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.08)); }
.esd-rank {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: var(--dsw-alias-bg-layer-2, #e8e8e8);
  color: var(--dsw-alias-label-secondary, #666);
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  line-height: 18px;
  flex: none;
}
.esd-rank-1 { background: rgba(245, 165, 36, 0.25); color: #b45309; }
.esd-rank-2 { background: rgba(245, 165, 36, 0.16); color: #b45309; }
.esd-rank-3 { background: rgba(245, 165, 36, 0.10); color: #b45309; }
.esd-top-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.esd-top-revenue { font-weight: 600; font-variant-numeric: tabular-nums; }
.esd-top-units { color: var(--dsw-alias-label-tertiary, #999); font-size: 11px; }

/* ── 低库存清单 ── */
.esd-low-item { display: flex; gap: 8px; align-items: center; padding: 6px 8px; border-radius: 6px; font-size: 12px; }
.esd-low-item:nth-child(odd) { background: var(--dsw-alias-bg-layer-1, #f4f4f4); }
.esd-low-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.esd-low-sku { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; color: var(--dsw-alias-label-tertiary, #999); }
.esd-low-stock { font-variant-numeric: tabular-nums; font-weight: 600; }
.esd-low-stock.esd-zero { color: var(--dsw-alias-state-error-primary, #e5484d); }
.esd-low-threshold { color: var(--dsw-alias-label-tertiary, #999); font-size: 11px; }

/* ── 本地文件导入状态条 ── */
.esd-import {
  margin: 8px 12px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
  word-break: break-all;
}
.esd-import .esd-import-msg { flex: 1; }
.esd-import-ok {
  border: 1px solid rgba(48, 164, 108, 0.4);
  background: rgba(48, 164, 108, 0.08);
  color: var(--dsw-alias-state-success-primary, #1f8a56);
}
.esd-import-bad {
  border: 1px solid var(--dsw-alias-state-error-primary, #e5484d);
  background: rgba(229, 72, 77, 0.06);
  color: var(--dsw-alias-state-error-primary, #e5484d);
}

/* ── 状态 ── */
.esd-loading { padding: 26px 0; text-align: center; color: var(--dsw-alias-label-tertiary, #999); font-size: 12px; }
.esd-empty { padding: 12px 0; text-align: center; color: var(--dsw-alias-label-tertiary, #999); font-size: 12px; }
.esd-error {
  margin: 8px 12px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-state-error-primary, #e5484d);
  background: rgba(229, 72, 77, 0.06);
  color: var(--dsw-alias-state-error-primary, #e5484d);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}
.esd-error .esd-error-msg { flex: 1; word-break: break-all; }
.esd-footer {
  padding: 8px 12px;
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.16));
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #999);
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}
.esd-footer .esd-footer-dot { font-size: 10px; }
.esd-dot-mock { color: var(--dsw-alias-state-warn-primary, #f5a524); }
.esd-dot-rest { color: var(--dsw-alias-state-success-primary, #30a46c); }
.esd-boundary-error { padding: 12px; font-size: 12px; color: var(--dsw-alias-state-error-primary, #e5484d); }

/* ── 经营总览：30 天趋势迷你图 + 类目占比并排放置（各 50%） ── */
.esd-chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
.esd-chart-cell { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.esd-chart-title { font-size: 11px; font-weight: 500; color: var(--dsw-alias-label-tertiary, #999); }
.esd-trend { margin: 0; flex: 1; display: flex; align-items: stretch; }
.esd-trend-svg { width: 100%; height: 90px; display: block; }

/* ── 商品分类：类目占比紧凑横条（与趋势图并排） ── */
.esd-cat-bars-compact { display: flex; flex-direction: column; gap: 6px; padding: 2px 0; flex: 1; justify-content: center; }
.esd-cat-bar-row { display: flex; align-items: center; gap: 5px; }
.esd-cat-bar-name { width: 40px; flex: none; font-size: 11px; color: var(--dsw-alias-label-secondary, #555); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.esd-cat-bar-track { flex: 1; height: 10px; background: rgba(128,128,128,.12); border-radius: 5px; overflow: hidden; min-width: 0; }
.esd-cat-bar-fill { height: 100%; border-radius: 5px; transition: width .4s ease-out; }
.esd-cat-bar-val { width: 34px; flex: none; text-align: right; font-size: 10px; color: var(--dsw-alias-label-secondary, #666); font-variant-numeric: tabular-nums; }

/* ── 数据源标签（演示数据 / 导入数据 / 平台 API） ── */
.esd-mode-row { display: flex; gap: 6px; margin-bottom: 8px; }
.esd-mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 4px;
  font-size: 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.25));
  border-radius: 8px;
  background: var(--dsw-alias-bg-base, #fff);
  color: var(--dsw-alias-label-primary, #1c1c1e);
  cursor: pointer;
  user-select: none;
  transition: all .12s ease;
}
.esd-mode-btn:hover:not(:disabled) { border-color: var(--esd-accent, #2bb8a3); }
.esd-mode-active {
  border-color: var(--esd-accent, #2bb8a3);
  background: var(--esd-accent, #2bb8a3);
  color: #ffffff;
  font-weight: 600;
}
.esd-mode-disabled { opacity: .45; cursor: not-allowed; }
.esd-mode-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.esd-mode-link {
  padding: 5px 10px;
  font-size: 12px;
  border: 1px solid var(--esd-accent, #2bb8a3);
  border-radius: 7px;
  background: #fff;
  color: var(--esd-accent-strong, #16a085);
  cursor: pointer;
  user-select: none;
  transition: background .15s, color .15s, border-color .15s;
}
.esd-mode-link:hover:not(:disabled) { background: var(--esd-accent-soft, rgba(43,184,163,.12)); }
.esd-mode-link:active:not(:disabled) { background: var(--esd-accent); color: #fff; border-color: var(--esd-accent); }
.esd-mode-link:disabled { opacity: .5; cursor: not-allowed; }

/* === 中央顶部 dock 按钮（与 cockpit 「行动清单」 同款风格） === */
.esd-dock-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  background: var(--dsw-alias-bg-elevated, #ffffff);
  color: var(--dsw-alias-label-primary, #1c1c1e);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: background .15s, border-color .15s, color .15s;
}
.esd-dock-btn:hover { background: var(--esd-accent-soft, rgba(43,184,163,.10)); }
.esd-dock-btn-active {
  background: var(--esd-accent, #2bb8a3);
  border-color: var(--esd-accent, #2bb8a3);
  color: #ffffff;
}
.esd-dock-btn-icon { font-size: 14px; line-height: 1; }
.esd-dock-btn-text { font-weight: 500; }

/* === 侧边栏底部入口（插件启动按键：白底绿线 / 绿底白线） === */
.esd-footer-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid var(--esd-accent, #2bb8a3);
  background: #ffffff;
  color: var(--esd-accent, #2bb8a3);
  font-size: 16px;
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;
}
.esd-footer-btn:hover { background: var(--esd-accent-soft, rgba(43,184,163,.14)); }
.esd-footer-btn-active {
  background: var(--esd-accent, #2bb8a3);
  border-color: var(--esd-accent, #2bb8a3);
  color: #ffffff;
  box-shadow: 0 0 0 3px var(--esd-accent-soft, rgba(43,184,163,.22));
}

/* === 全屏模式 === */
.esd-panel-fullscreen {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  border-radius: 0 !important;
  z-index: 9999 !important;
  overflow: hidden !important;
}

/* === 全屏「电商数据中台」iframe（替换修改版 HTML 面板） === */
.esd-dc-frame {
  flex: 1;
  min-height: 0;
  position: relative;
  background: #e8f3f1;
}
.esd-dc-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background: #e8f3f1;
}

/* === BI 数据看板（统一字号阶梯 + 横条形 bar） === */
/* 字号阶梯：KPI标题 13 / KPI数值 26 / 卡片标题 15 / bar 名 14 / bar 数字 14 / bar 辅 12 */

.esd-bi { display: flex; flex-direction: column; gap: 12px; }
.esd-bi-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.esd-bi-kpi-card {
  background: var(--dsw-alias-bg-elevated, #ffffff);
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  border-radius: 10px;
  padding: 14px 16px 12px;
  transition: transform .2s, box-shadow .2s;
}
.esd-bi-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,.06); }
.esd-bi-kpi-title { font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-tertiary, #888); margin-bottom: 6px; }
.esd-bi-kpi-value { font-size: 24px; font-weight: 700; color: var(--dsw-alias-label-primary, #1a1a1a); line-height: 1.1; letter-spacing: -0.3px; }
.esd-bi-kpi-sub { font-size: 12px; margin-top: 6px; color: var(--dsw-alias-label-tertiary, #999); }
.esd-bi-kpi-sub.up { color: #e5484d; }
.esd-bi-kpi-sub.down { color: #22b573; }

/* 网格列宽：1 : 1 等宽（两个图都占满，更协调） */
.esd-bi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.esd-bi-card {
  background: var(--dsw-alias-bg-elevated, #ffffff);
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  border-radius: 10px;
  padding: 18px;
}
.esd-bi-card-title { font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary, #333); margin-bottom: 14px; }
.esd-bi-empty { font-size: 12px; color: var(--dsw-alias-label-tertiary, #999); padding: 14px 0; text-align: center; }

/* 趋势折线（充分展示，150px） */
.esd-bi-chart { display: flex; flex-direction: column; gap: 6px; }
.esd-bi-svg { width: 100%; height: 150px; display: block; }
.esd-bi-chart-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--dsw-alias-label-tertiary, #999); }

/* === 横条形 bar（类目占比 + TOP 排行，加大尺寸增强观感） === */
.esd-bi-bar { display: flex; flex-direction: column; gap: 20px; padding: 4px 0 6px; }
.esd-bi-bar-row { display: flex; align-items: center; gap: 12px; }
.esd-bi-bar-name {
  width: 96px;
  flex: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #555);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.esd-bi-bar-track {
  flex: 1;
  height: 22px;
  background: var(--dsw-alias-bg-subtle, #f0f2f5);
  border-radius: 11px;
  overflow: hidden;
}
.esd-bi-bar-fill {
  height: 100%;
  border-radius: 11px;
  transition: width .5s ease-out;
}
.esd-bi-bar-val {
  width: 96px;
  flex: none;
  text-align: right;
  font-size: 14px;
  font-weight: 700;
  color: var(--dsw-alias-label-primary, #333);
  font-variant-numeric: tabular-nums;
}

/* 库存健康度 */
.esd-bi-stock { display: flex; flex-direction: column; gap: 8px; }
.esd-bi-stock-line { display: flex; justify-content: space-between; font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-secondary, #555); }
.esd-bi-stock-line em { font-style: normal; font-weight: 700; color: #e5484d; }
.esd-bi-stock-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #333);
  padding: 4px 0;
}
.esd-bi-stock-row span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.esd-bi-stock-num {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin-left: 10px;
  flex: none;
  color: #e5484d;
}

/* === 商品管理 === */
.esd-pm { display: flex; flex-direction: column; gap: 10px; }
.esd-pm-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.esd-pm-search {
  flex: 1;
  min-width: 140px;
  height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  background: var(--dsw-alias-bg-elevated, #fff);
  color: var(--dsw-alias-label-primary, #1c1c1e);
  font-size: 12px;
}
.esd-pm-search:focus { outline: none; border-color: var(--dsw-alias-interactive-primary, #4f7cff); }
.esd-bi-btn {
  height: 30px;
  padding: 0 12px;
  border-radius: 7px;
  border: 1px solid var(--esd-accent, #2bb8a3);
  background: #fff;
  color: var(--esd-accent-strong, #16a085);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, border-color .15s, color .15s;
}
.esd-bi-btn:hover:not(:disabled) { background: var(--esd-accent-soft, rgba(43,184,163,.12)); }
.esd-bi-btn:disabled { opacity: .5; cursor: not-allowed; }
.esd-bi-btn-primary {
  background: var(--esd-accent, #2bb8a3);
  border-color: var(--esd-accent, #2bb8a3);
  color: #fff;
}
.esd-bi-btn-primary:hover:not(:disabled) { background: var(--esd-accent-strong, #16a085); }

.esd-pm-table-wrap { max-height: 380px; overflow: auto; border: 1px solid var(--dsw-alias-border-default, #e5e7eb); border-radius: 8px; }
.esd-pm-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.esd-pm-table thead th {
  position: sticky;
  top: 0;
  background: var(--dsw-alias-bg-subtle, #f7f8fa);
  color: var(--dsw-alias-label-secondary, #666);
  font-weight: 600;
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  white-space: nowrap;
}
.esd-pm-table tbody td { padding: 7px 10px; border-bottom: 1px solid var(--dsw-alias-border-subtle, #f0f2f5); color: var(--dsw-alias-label-primary, #333); }
.esd-pm-table tbody tr:hover { background: var(--dsw-alias-bg-hover, rgba(128,128,128,.05)); }
.esd-pm-table tbody tr.esd-pm-off { opacity: .55; }
.esd-pm-sku { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; color: var(--dsw-alias-label-tertiary, #888); }
.esd-pm-name { color: var(--dsw-alias-interactive-primary, #4f7cff); cursor: pointer; font-weight: 500; }
.esd-pm-name:hover { text-decoration: underline; }
.esd-pm-num { text-align: right; white-space: nowrap; }
.esd-pm-zero { color: #e5484d; font-weight: 700; }
.esd-pm-ops { white-space: nowrap; }
.esd-pm-ops button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  padding: 2px 3px;
  border-radius: 4px;
  line-height: 1;
}
.esd-pm-ops button:hover { background: var(--dsw-alias-bg-hover, rgba(128,128,128,.12)); }

/* 商品表单弹窗 */
.esd-bi-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.esd-bi-modal {
  background: var(--dsw-alias-bg-elevated, #fff);
  border-radius: 12px;
  padding: 20px;
  width: 360px;
  max-width: 92vw;
  box-shadow: 0 12px 40px rgba(0,0,0,.18);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.esd-bi-modal-title { font-size: 16px; font-weight: 600; color: var(--dsw-alias-label-primary, #1a1a1a); }
.esd-bi-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--dsw-alias-label-secondary, #666); }
.esd-bi-field input {
  height: 32px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  background: var(--dsw-alias-bg-elevated, #fff);
  color: var(--dsw-alias-label-primary, #1c1c1e);
  font-size: 13px;
}
.esd-bi-field input:focus { outline: none; border-color: var(--dsw-alias-interactive-primary, #4f7cff); }
.esd-bi-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.esd-bi-form-err { font-size: 12px; color: #e5484d; }
.esd-bi-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }

/* === 导入数据提示横幅（数据完全由导入决定时，引导用户导入） === */
.esd-import-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff7e6 0%, #fff5d9 100%);
  border: 1px solid #ffd591;
  color: #ad6800;
  font-size: 13px;
  line-height: 1.45;
}
.esd-import-banner-icon { font-size: 18px; line-height: 1; flex: none; }
.esd-import-banner-text { flex: 1; }
.esd-import-banner-text strong { color: #874d00; }
.esd-import-banner-text kbd {
  display: inline-block;
  margin: 0 2px;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid #f0c97a;
  background: #fff;
  color: #ad6800;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 12px;
}

/* 响应式：窄屏 KPI 2 列、图表单列 */
@media (max-width: 900px) {
  .esd-bi-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .esd-bi-grid { grid-template-columns: 1fr; }
}

/* ── 容器查询：面板本身变窄时（非全屏 35vw / 移动端）按比例缩放模块，避免拥挤与缺漏 ── */
@container esdpanel (max-width: 600px) {
  .esd-bi-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .esd-bi-kpi-card { padding: 10px 12px 9px; }
  .esd-bi-kpi-value { font-size: 20px; }
  .esd-bi-grid { grid-template-columns: 1fr; gap: 10px; }
  .esd-bi-card { padding: 14px; }
  .esd-bi-svg { height: 130px; }
  .esd-chart-row { grid-template-columns: 1fr; gap: 8px; }
  .esd-stats { grid-template-columns: 1fr 1fr; }
  .esd-stat-value { font-size: 15px; }
  .esd-section-title { font-size: 12.5px; }
  .esd-body { padding: 10px 10px 14px; gap: 10px; }
}

/* 全屏头部 Logo 间距微调（与参考图一致：左上为品牌徽标） */
.esd-panel-fullscreen .esd-header { padding: 14px 16px; }
.esd-panel-fullscreen .esd-header-logo { flex: none; }

/* === 技能模块横向按键条（7 个 skill，对话框下方 / 面板头部下方） === */
.esd-skillbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 10px;
}
.esd-skillbar-title {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--dsw-alias-label-tertiary, #999);
  letter-spacing: 1px;
  white-space: nowrap;
  flex: none;
}
.esd-skillbar-logo { display: inline-flex; align-items: center; flex: none; }
.esd-skillbar-name { display: inline-flex; align-items: center; }
.esd-skill-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  background: var(--dsw-alias-bg-elevated, #ffffff);
  color: var(--dsw-alias-label-primary, #1c1c1e);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: background .15s, border-color .15s, color .15s, transform .12s ease;
}
.esd-skill-btn:hover {
  background: var(--esd-accent-soft, rgba(43,184,163,.10));
  border-color: var(--esd-accent, #2bb8a3);
  color: var(--esd-accent-strong, #16a085);
  transform: translateY(-1px);
}
.esd-skill-btn:active {
  background: var(--esd-accent, #2bb8a3);
  border-color: var(--esd-accent, #2bb8a3);
  color: #ffffff;
}
.esd-skill-icon-svg { display: inline-flex; align-items: center; flex: none; color: var(--esd-accent, #2bb8a3); }
.esd-skill-label { font-weight: 500; }

/* dock 形态：紧凑 + 可横向滚动，不撑爆 composer 下方横条 */
.esd-skillbar-dock {
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 4px 6px;
  gap: 6px;
}
.esd-skillbar-dock::-webkit-scrollbar { height: 4px; }
.esd-skillbar-dock::-webkit-scrollbar-thumb { background: rgba(128,128,128,.25); border-radius: 2px; }
.esd-skillbar-dock .esd-skill-btn { height: 26px; padding: 0 10px; font-size: 11px; }

/* dock 技能条随侧边栏开关显隐：body 打可逆的 esd-cockpit-open 标记（由 cockpit-bus
   syncDockVisibility 在打开时添加、关闭时移除）。打开侧边栏「呼出」技能条，关闭后
   「归位」回初始隐藏状态。 */
body:not(.esd-cockpit-open) .esd-skillbar-dock { display: none; }

/* === 可点击视图（点击 → 会话框弹出对应数值） === */
.esd-clickable {
  cursor: pointer;
  border-radius: 8px;
  transition: background .15s ease, box-shadow .15s ease;
}
.esd-clickable:hover {
  background: var(--esd-accent-soft, rgba(43,184,163,.10));
  box-shadow: inset 0 0 0 1px var(--esd-accent-soft-2, rgba(43,184,163,.22));
}

/* === 技能/指令发送可见反馈 toast（点击技能按钮 / 视图弹值后） === */
#esd-toast-host {
  position: fixed;
  left: 50%;
  bottom: 96px;
  transform: translateX(-50%);
  z-index: 12000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}
.esd-toast {
  max-width: min(420px, 80vw);
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  box-shadow: var(--dsw-shadow-lv3, 0 8px 32px rgba(0,0,0,.20));
  color: #ffffff;
  animation: esd-toast-in .18s ease-out;
}
.esd-toast-info { background: var(--esd-accent-strong, #16a085); }
.esd-toast-error { background: var(--dsw-alias-state-error-primary, #e5484d); }
@keyframes esd-toast-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

let injected = false

/** 幂等注入面板样式（只执行一次；宿主主题 token 实时生效） */
export function injectStyles(): void {
  if (injected) return
  injected = true
  if (typeof document === 'undefined') return
  if (document.getElementById('esd-shop-desk-styles') !== null) return
  const el = document.createElement('style')
  el.id = 'esd-shop-desk-styles'
  el.textContent = CSS
  document.head.appendChild(el)
}
