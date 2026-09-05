/**
 * ecommerce-analyst-plugin — 电商数据中台页面（对接「电商数据中台.html」修改版）
 *
 * 全屏面板通过 <iframe src="/ecommerce-api/data-center"> 加载本页面：
 *   - 页面为自包含 HTML（内联样式/脚本），数据为该页面内置的确定性演示数据；
 *   - 若需接入真实店铺数据，可让页面 fetch /ecommerce-api/snapshot 后替换；
 *   - 资产文件 src/assets/data-center.html 由 scripts/build.mjs 随构建拷贝到
 *     部署目录 assets/data-center.html；本模块用 import.meta.url 定位模块所在
 *     目录后读取（源码 src/ 与部署 OUT/ 结构一致）。
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage } from 'node:http'
import type { EcommerceStore } from './store.ts'

const MODULE_DIR = dirname(fileURLToPath(import.meta.url))

/**
 * 从请求头推导 API origin，注入到数据中台页面（window.__ECOM_API_BASE__）。
 * 说明：本页面通常经 <iframe src="/ecommerce-api/data-center"> 由服务端「同源」提供，
 * 此时页面侧解析链会用 ''（相对路径 fetch）即可工作，注入绝对 origin 只是为了覆盖
 * location.origin 不可靠的 webview/代理场景；host 头缺失时回退 referer 的 host；
 * 两者都拿不到则注入空串（页面侧会再走同源探测，绝不可注入 null 字面量）。
 */
function apiBaseFromRequest(req?: IncomingMessage): string {
  const host = String(req?.headers?.host || '').trim()
  if (host) {
    // 反代终止 TLS 时尊重 x-forwarded-proto，避免注入 http:// 造成 mixed-content；
    // 残余失败模式：反代不透传 x-forwarded-proto 时这里仍会注入 http://host，
    // 由页面侧（data-center.html resolveApiBase 步骤1 的 __protoMismatch 守卫）做协议校验，
    // 发现与 location.protocol 相反时拒绝 adopt、降回 ''（同源相对 fetch）
    const fwdProto = String(req?.headers?.['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase()
    const proto = fwdProto === 'https' ? 'https:' : 'http:'
    return `${proto}//${host}`
  }
  const referer = String(req?.headers?.referer || '').trim()
  if (referer) {
    try {
      const u = new URL(referer)
      if (u.host) return `${u.protocol}//${u.host}`
    } catch {
      // referer 非法：忽略，走空串兜底
    }
  }
  return ''
}

/**
 * 返回数据中台页面 HTML（每次读盘，始终返回最新构建的资产，含内联 echarts 等）。
 * 传入 req 时在 </head> 前注入 window.__ECOM_API_BASE__（无 host 时注入 ""），
 * 使 file:// 桌面端与 webview 场景也能拿到接口地址。
 */
export function renderDataCenter(_store: EcommerceStore, req?: IncomingMessage): string {
  let html: string
  try {
    html = readFileSync(join(MODULE_DIR, 'assets', 'data-center.html'), 'utf8')
  } catch (err) {
    // 资产缺失兜底页：保持原样（无 </head> 可注入，也不涉及接口）
    return (
      '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>电商数据中台</title></head>' +
      '<body style="font-family:sans-serif;background:#e8f3f1;color:#16343b;padding:40px;line-height:1.8">' +
      '<h2>⚠️ 电商数据中台加载失败</h2><p>' +
      (err instanceof Error ? String(err.message) : String(err)) +
      '</p><p>请确认部署目录存在 <code>assets/data-center.html</code>（在插件源码目录运行 <code>node scripts/build.mjs</code> 重新构建）。</p>' +
      '</body></html>'
    )
  }
  const base = apiBaseFromRequest(req)
  const tag = `<script>window.__ECOM_API_BASE__ = ${JSON.stringify(base)};</script>`
  // 注入到 iframe 页面自身 window（非 parent）；无 </head> 时前置兜底
  return html.includes('</head>') ? html.replace('</head>', tag + '</head>') : tag + html
}
