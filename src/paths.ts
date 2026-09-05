/**
 * ecommerce-analyst-plugin — 运行期路径解析（跨机器 / 跨操作系统稳健化）
 *
 * 目的：把「相对持久化文件路径」锚定到插件自身目录，避免依赖进程 CWD。
 * 旧行为下 `./ecommerce-analyst-plugin/data/store.json` 是相对「dsh 启动目录」解析的：
 *  - 作者从仓库根启动恰好命中，别人从任意目录 `dsh web` → 数据落到意想不到的位置、
 *    多个 dsh 项目互相覆盖；
 *  - Windows 从受保护目录（Program Files / System32 / OneDrive 同步目录）启动时，
 *    写盘还会 EPERM / EACCES。
 * 锚定到插件根目录后，落点与启动目录无关（dsh plugin add 复制进的 profile 目录可写）。
 * 绝对路径原样返回。
 */
import { existsSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const MODULE_DIR = dirname(fileURLToPath(import.meta.url))

/** 向上找 package.json 所在目录 = 插件根（构建产物在根 index.js / 开发态在 src/ 均命中）。 */
function findPluginRoot(start: string): string {
  let dir = start
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, 'package.json'))) return dir
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return start
}

/** 插件根目录（持久化相对路径的锚点）。 */
export const PLUGIN_ROOT = findPluginRoot(MODULE_DIR)

/**
 * 把配置里的持久化路径解析成绝对路径。
 * 相对路径锚定到插件根；兼容历史默认值 `./ecommerce-analyst-plugin/data/store.json`
 * 的重复插件名前缀（剥掉后锚定，避免 `.../ecommerce-analyst-plugin/ecommerce-analyst-plugin/data`）。
 */
export function resolveStoreFile(raw: string): string {
  if (raw === '') return resolve(PLUGIN_ROOT, 'data', 'store.json')
  if (isAbsolute(raw)) return raw
  const cleaned = raw.replace(/^\.?\/?(?:ecommerce-analyst-plugin\/)+/, '')
  return resolve(PLUGIN_ROOT, cleaned)
}
