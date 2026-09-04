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
import type { EcommerceStore } from './store.ts'

const MODULE_DIR = dirname(fileURLToPath(import.meta.url))

/** 返回数据中台页面 HTML（每次读盘，始终返回最新构建的资产，含内联 echarts 等） */
export function renderDataCenter(_store: EcommerceStore): string {
  try {
    return readFileSync(join(MODULE_DIR, 'assets', 'data-center.html'), 'utf8')
  } catch (err) {
    return (
      '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>电商数据中台</title></head>' +
      '<body style="font-family:sans-serif;background:#e8f3f1;color:#16343b;padding:40px;line-height:1.8">' +
      '<h2>⚠️ 电商数据中台加载失败</h2><p>' +
      (err instanceof Error ? String(err.message) : String(err)) +
      '</p><p>请确认部署目录存在 <code>assets/data-center.html</code>（在插件源码目录运行 <code>node scripts/build.mjs</code> 重新构建）。</p>' +
      '</body></html>'
    )
  }
}
