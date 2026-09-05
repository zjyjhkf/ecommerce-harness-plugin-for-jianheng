/**
 * ecommerce-analyst-plugin — 构建脚本（产物提交入库，git 安装开箱即用）
 *
 * 默认输出目录 = 仓库根本身（OUT=repo）：
 *   <repo>/index.js   服务端 bundle（external @deepseek-ai/*, node:*, xlsx, pdfjs-dist）
 *   <repo>/client.js  客户端 bundle（external react；ModuleLoader 包裹）
 *   <repo>/assets/data-center.html  数据中台页面（与 index.js 并列，data-center.ts 按 MODULE_DIR/assets 解析）
 * 仓库根 package.json 即部署清单（含 dsh.bundle / dsh.client 声明），不再另写 OUT/package.json；
 * cordis.patch.yml / README.md 就在仓库根，也无需复制。
 *
 * 环境变量：
 *   ECOM_PLUGIN_OUT   覆盖输出目录（构建到仓库外，如 E:/plugins/ecommerce-analyst-plugin）。
 *                     仅在这种模式下才会额外复制 xlsx 运行时文件到 OUT/node_modules。
 *   ESBUILD_REQUIRE   指定 esbuild 包入口（例如独立构建目录）。
 *   ECOM_LINK_PEERS=1 在 OUT/node_modules 下建立 @deepseek-ai 等 peer junction。
 *                     仅当同时 OUT≠仓库根 时生效；默认（含 OUT=仓库根）绝不执行，防止误删真实 node_modules。
 *
 * 用法：npm i && node scripts/build.mjs   （esbuild 来自 devDependencies）
 */
import { createRequire } from 'node:module'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '..')

/** 定位 esbuild：ESBUILD_REQUIRE 环境变量优先，其次本仓库 node_modules；找不到直接报错提示安装。 */
function loadEsbuild() {
  const viaEnv = process.env.ESBUILD_REQUIRE
  if (viaEnv) {
    try { return require(viaEnv) } catch { /* 落到本仓库 node_modules */ }
  }
  try {
    return require('esbuild')
  } catch {
    throw new Error(
      '[build] 未找到 esbuild。请先在本仓库执行 `npm install -D esbuild`（或 `pnpm install`），' +
        '或用环境变量 ESBUILD_REQUIRE 指向 esbuild 包入口。',
    )
  }
}

const esbuild = loadEsbuild()
// 默认产物直接落在仓库根（index.js / client.js / assets/ 提交入库，git 安装开箱即用）。
const OUT = resolve(process.env.ECOM_PLUGIN_OUT || repo)
// Windows 大小写不敏感：比较时归一化，防止不同大小写的 ECOM_PLUGIN_OUT 绕过「OUT=仓库根」保护。
function samePathLoose(a, b) {
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b
}
const OUT_IS_REPO = samePathLoose(OUT, repo)
// 字符串比较仍可被符号链接/junction/8.3 短名等「等价但拼写不同」的路径绕过：
// OUT 经中间链接实际落到仓库根时，junction 段的 rmSync(OUT/node_modules/@deepseek-ai)
// 会穿透链接递归清空真实 repo/node_modules（见下方 ⚠️ 防误删注释）。
// realpath 兜底：解析后的真实路径与仓库根真实路径相同，即视同 OUT=仓库根跳过危险段
// （与 copyXlsxEssential 的 isInsideRepoNodeModules 同一防御思路）。
function realpathOrSelf(p) {
  try { return realpathSync(p) } catch { return p }
}
const OUT_REAL_IS_REPO = samePathLoose(realpathOrSelf(OUT), realpathOrSelf(repo))
mkdirSync(OUT, { recursive: true })
if (OUT_IS_REPO) console.log('[build] OUT = 仓库根，产物将直接写入并随仓库提交')
else if (OUT_REAL_IS_REPO)
  console.warn('[build] ECOM_PLUGIN_OUT 拼写不同但 realpath 指向仓库根（链接/短名等价路径），按 OUT=仓库根保护处理')

const banner = [
  '/**',
  ' * ecommerce-analyst-plugin — 服务端 bundle（esbuild 构建）',
  ' * 源码：deepseek-harness-master/ecommerce-analyst-plugin/src',
  ' * 请勿直接编辑本文件；改动请回源码并运行 scripts/build.mjs',
  ' */',
].join('\n')

const isExternal = (id) =>
  id.startsWith('@deepseek-ai/') ||
  id.startsWith('node:') ||
  id === 'node:http' ||
  !id.startsWith('.')

/** 1) 服务端 bundle：ESM，external @deepseek-ai/* 与 node:* */
await esbuild.build({
  entryPoints: [join(repo, 'src/index.ts')],
  outfile: join(OUT, 'index.js'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  external: ['@deepseek-ai/*', 'node:*', 'xlsx', 'pdfjs-dist'],
  banner: { js: banner },
  sourcemap: false,
  logLevel: 'info',
})

/** 2) 客户端 bundle：CJS + ModuleLoader 包裹，external react（宿主提供） */
const bundleResult = await esbuild.build({
  entryPoints: [join(repo, 'src/client/index.tsx')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  jsx: 'transform',
  external: ['react'],
  loader: { '.html': 'text' },
  write: false,
  logLevel: 'info',
})
const body = bundleResult.outputFiles[0].text

const clientBundle = [
  'window.__ModuleLoader__.load({',
  '  id: "ecommerce-analyst-plugin",',
  '  factory: (require) => {',
  '    var module = { exports: {} };',
  '    var exports = module.exports;',
  '    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
  body,
  '    return module.exports;',
  '  }',
  '});',
  '',
].join('\n')
writeFileSync(join(OUT, 'client.js'), clientBundle, 'utf8')

/** 3) 部署清单即仓库根 package.json（含 dsh.bundle / dsh.client / exports / dependencies），
 *  cordis.patch.yml、README.md 也在仓库根——默认构建（OUT=仓库根）不再向 OUT 复制任何清单。
 *  仅当显式指定 ECOM_PLUGIN_OUT 构建到仓库外时，把根清单与根级配套文件一并带过去。 */
if (!OUT_IS_REPO) {
  copyFileSync(join(repo, 'package.json'), join(OUT, 'package.json'))
  console.log('[build] 已部署 package.json（仓库根清单即部署清单）')
  for (const name of ['cordis.patch.yml', 'README.md']) {
    const src = join(repo, name)
    try {
      copyFileSync(src, join(OUT, name))
      console.log('[build] 已部署', name)
    } catch {
      console.warn('[build] 跳过缺失文件', name)
    }
  }
}

/** 数据中台页面资产：全屏面板 iframe 加载 /ecommerce-api/data-center（OUT=repo 时即根 assets/） */
try {
  const dcDir = join(OUT, 'assets')
  mkdirSync(dcDir, { recursive: true })
  copyFileSync(join(repo, 'src', 'assets', 'data-center.html'), join(dcDir, 'data-center.html'))
  console.log('[build] 已部署 assets/data-center.html')
} catch (e) {
  console.warn('[build] 跳过缺失数据中台资产:', e.message)
}

/** （可选，默认关闭）定位 dsh 全局 node_modules 并在 OUT/node_modules 下建立 junction。
 * 仅服务于「构建到仓库外目录（如 E:\plugins\...）、且该目录 Node 向上解析不到 @deepseek-ai/*」的本机特殊场景。
 * ⚠️ 防误删：junction 创建前的 rmSync 会清空链接目标内容，若 OUT=仓库根将直接删掉真实
 * repo/node_modules/@deepseek-ai。因此本段仅当 ECOM_LINK_PEERS=1 且 OUT≠仓库根 时执行，默认跳过；
 * OUT≠仓库根 以字符串比较 + realpath 双重判定（防链接/短名等价路径绕过），link 建立前还会做
 * isInsideRepoNodeModules 包含性检查兜底，命中即跳过并告警。
 * 由于本机可能同时存在多个 npm（如 WorkBuddy 托管的 node 与用户 npm），这里多策略解析，
 * 命中「同时含 schemastery 与 dsh-scope 的 @deepseek-ai 作用域」才认为有效。 */
function findDshModules() {
  const roots = []
  // 优先使用用户全局 npm（dsh web 实际运行的位置）；本机若在 WorkBuddy 托管 node 下执行，
  // npm root -g / npm config get prefix 会指向托管 node 根，必须排在最后作为兜底。
  const home = process.env.USERPROFILE || process.env.HOME || ''
  if (home) roots.push(join(home, 'AppData', 'Roaming', 'npm', 'node_modules'))
  try {
    const prefix = execSync('npm config get prefix', { encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } }).trim()
    if (prefix && prefix.toLowerCase().includes('roaming\\npm') === false) roots.push(join(prefix, 'node_modules'))
  } catch {}
  try {
    roots.push(execSync('npm root -g', { encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } }).trim())
  } catch {}
  for (const root of roots) {
    if (!root) continue
    const p = join(root, '@deepseek-ai', 'dsh', 'node_modules')
    if (existsSync(join(p, '@deepseek-ai', 'schemastery')) && existsSync(join(p, '@deepseek-ai', 'dsh-scope'))) {
      return p
    }
  }
  return null
}

if (process.env.ECOM_LINK_PEERS === '1' && !OUT_IS_REPO && !OUT_REAL_IS_REPO) {
try {
  const dshModules = findDshModules()
  if (!dshModules) {
    console.warn('[build] 未找到 dsh 全局 node_modules，跳过 peer dep symlinks（请手动确认 E:\\plugins\\ecommerce-analyst-plugin\\node_modules）')
  } else {
    const nm = join(OUT, 'node_modules')
    mkdirSync(nm, { recursive: true })
    for (const name of ['@deepseek-ai', '@standard-schema']) {
      const target = join(dshModules, name)
      const link = join(nm, name)
      if (!existsSync(target)) {
        console.warn('[build] peer dep 目标不存在，跳过:', target)
        continue
      }
      // 双保险：即便 OUT 字符串与 realpath 都不等于仓库根，若该 link 位置经 realpath
      // 实际落在 repo/node_modules 内（如 OUT/node_modules 本身是指回仓库的链接），
      // rmSync 同样会穿透清空真实依赖——isInsideRepoNodeModules 命中即跳过并告警。
      // （函数声明提升，可在下方定义前调用。）
      if (existsSync(link) && isInsideRepoNodeModules(link)) {
        console.warn('[build] link 实际指向 repo/node_modules，跳过以防误删真实依赖:', link)
        continue
      }
      try { rmSync(link, { recursive: true, force: true }) } catch {}
      try {
        symlinkSync(target, link, 'junction')
        console.log('[build] peer dep link:', link, '->', target)
      } catch (e) {
        console.warn('[build] peer dep link 失败:', link, e.message)
      }
    }
  }
} catch (e) {
  console.warn('[build] 创建 peer dep symlinks 失败:', e.message)
}
} else {
  console.log(
    '[build] 跳过 peer dep junction 创建（默认行为；需 ECOM_LINK_PEERS=1 且 ECOM_PLUGIN_OUT 指向仓库外目录（字符串与 realpath 双重判定）才执行）',
  )
}

/** 只复制 xlsx 运行时必需文件：主入口 xlsx.js（CJS）+ package.json + 老版编码页
 *  cpexcel.js（xlsx.js 内 require('./dist/cpexcel.js')）。跳过 dist/*.min.*、xlsx.mjs、
 *  图片、README、types 等非必需内容，约省 6MB。 */
function isInsideRepoNodeModules(p) {
  try {
    const root = realpathSync(join(repo, 'node_modules'))
    const real = realpathSync(p)
    return real === root || real.startsWith(root + sep)
  } catch {
    return false
  }
}

function copyXlsxEssential() {
  // OUT=仓库根时 node_modules/xlsx 已由 npm/pnpm 按 dependencies 安装管理，绝不 rm 重写。
  if (OUT_IS_REPO) {
    console.log('[build] OUT=仓库根，跳过 xlsx 手工复制（由包管理器安装管理）')
    return
  }
  const src = join(repo, 'node_modules', 'xlsx')
  const dst = join(OUT, 'node_modules', 'xlsx')
  if (!existsSync(src)) {
    console.warn('[build] xlsx 未安装，跳过')
    return
  }
  if (existsSync(dst) && isInsideRepoNodeModules(dst)) {
    console.warn('[build] OUT 下的 xlsx 实际指向 repo/node_modules，跳过以防误删真实依赖')
    return
  }
  try { rmSync(dst, { recursive: true, force: true }) } catch {}
  mkdirSync(join(dst, 'dist'), { recursive: true })
  for (const rel of ['xlsx.js', 'package.json']) {
    copyFileSync(join(src, rel), join(dst, rel))
  }
  copyFileSync(join(src, 'dist', 'cpexcel.js'), join(dst, 'dist', 'cpexcel.js'))
  console.log('[build] runtime dep copied (essential): xlsx')
}

// pdfjs-dist（约 37MB）仅用于 PDF 导入，非核心功能，不再随包部署；
// 解析器已做优雅降级，导入 PDF 时会提示改用 CSV/Excel。
copyXlsxEssential()

console.log('[build] 完成 →', OUT)
console.log('[build] index.js', readFileSync(join(OUT, 'index.js'), 'utf8').length, 'bytes')
console.log('[build] client.js', readFileSync(join(OUT, 'client.js'), 'utf8').length, 'bytes')
