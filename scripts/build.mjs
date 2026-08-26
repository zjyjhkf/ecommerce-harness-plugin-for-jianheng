/**
 * ecommerce-analyst-plugin — 构建与部署脚本
 *
 * 产出（与 index.js 并列，遵循 dsh 客户端插件机制）：
 *   E:\plugins\ecommerce-analyst-plugin\index.js  服务端 bundle（external @deepseek-ai/*, node:*）
 *   E:\plugins\ecommerce-analyst-plugin\client.js  客户端 bundle（external react；ModuleLoader 包裹）
 *
 * esbuild 解析：默认从本仓库 node_modules 找；也可用环境变量 ESBUILD_REQUIRE
 * 指向 esbuild 包入口（例如独立构建目录）。
 *
 * 用法：node scripts/build.mjs
 */
import { createRequire } from 'node:module'
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '..')

/** 定位 esbuild */
function loadEsbuild() {
  const viaEnv = process.env.ESBUILD_REQUIRE
  if (viaEnv) {
    try { return require(viaEnv) } catch { /* 落到默认路径 */ }
  }
  try { return require('esbuild') } catch { /* 落到仓库外构建目录 */ }
  const fallback = 'E:/dsh/jianheng/plugins-ec/build-tools/node_modules/esbuild'
  return require(fallback)
}

const esbuild = loadEsbuild()
const OUT = process.env.ECOM_PLUGIN_OUT || 'E:/plugins/ecommerce-analyst-plugin'
mkdirSync(OUT, { recursive: true })

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

/** 3) 部署清单：package.json 用运行时模板（与源码 dev 清单分离），
 *  cordis.patch.yml / README.md 从源码复制 */
const deployManifest = {
  name: 'ecommerce-analyst-plugin',
  version: '0.3.0',
  private: false,
  description:
    'dsh 电商商单智能体插件：商品管理、订单处理、销售数据分析、库存预警（含桌面端「店铺工作台」侧边栏与 Excel 数据导入）',
  type: 'module',
  main: 'index.js',
  exports: {
    '.': './index.js',
    './client': './client.js',
    './package.json': './package.json',
  },
  dsh: {
    bundle: { patch: './cordis.patch.yml' },
    client: { platform: 'web', inject: [] },
  },
  files: ['index.js', 'client.js', 'cordis.patch.yml', 'README.md'],
  license: 'MIT',
  peerDependencies: {
    '@deepseek-ai/cordis': '^0.1.1-rc.2',
    '@deepseek-ai/dsh-tools': '^0.1.1-rc.2',
    '@deepseek-ai/schemastery': '^0.1.1-rc.2',
  },
}
writeFileSync(join(OUT, 'package.json'), JSON.stringify(deployManifest, null, 2) + '\n', 'utf8')
console.log('[build] 已部署 package.json（含 dsh.client 声明）')
for (const name of ['cordis.patch.yml', 'README.md']) {
  const src = join(repo, name)
  try {
    copyFileSync(src, join(OUT, name))
    console.log('[build] 已部署', name)
  } catch {
    console.warn('[build] 跳过缺失文件', name)
  }
}

/** 定位 dsh 全局 node_modules。
 * 插件部署在 E:\plugins 之外，Node 从 E:\plugins\... 向上解析找不到 @deepseek-ai/*；
 * 在 OUT/node_modules 下建立 junction 指向 dsh 全局 node_modules，确保 dsh 能正常加载。
 * 由于本机可能同时存在多个 npm（如 WorkBuddy 托管的 node 与用户 npm），这里多策略解析，
 * 命中「同时含 schemamastery 与 dsh-scope 的 @deepseek-ai 作用域」才认为有效。 */
function findDshModules() {
  const roots = []
  try {
    roots.push(execSync('npm root -g', { encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } }).trim())
  } catch {}
  const home = process.env.USERPROFILE || process.env.HOME || ''
  if (home) roots.push(join(home, 'AppData', 'Roaming', 'npm', 'node_modules'))
  try {
    const prefix = execSync('npm config get prefix', { encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } }).trim()
    if (prefix) roots.push(join(prefix, 'node_modules'))
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

/** 复制插件自身运行时依赖到 OUT/node_modules（esbuild external 的非 peer 依赖）。
 * 这些包不会被 dsh 全局 node_modules 提供，必须从源码 node_modules 带进部署目录。 */
function copyRuntimeDep(name) {
  const src = join(repo, 'node_modules', name)
  const dst = join(OUT, 'node_modules', name)
  if (!existsSync(src)) {
    console.warn('[build] runtime dep 未安装，跳过:', name)
    return
  }
  try { rmSync(dst, { recursive: true, force: true }) } catch {}
  try {
    cpSync(src, dst, { recursive: true, dereference: true })
    console.log('[build] runtime dep copied:', name)
  } catch (e) {
    console.warn('[build] runtime dep copy 失败:', name, e.message)
  }
}
for (const name of ['xlsx', 'pdfjs-dist']) copyRuntimeDep(name)

console.log('[build] 完成 →', OUT)
console.log('[build] index.js', readFileSync(join(OUT, 'index.js'), 'utf8').length, 'bytes')
console.log('[build] client.js', readFileSync(join(OUT, 'client.js'), 'utf8').length, 'bytes')
