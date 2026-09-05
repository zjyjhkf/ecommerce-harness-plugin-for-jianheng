/**
 * 跨机器路径 / API 基址稳健化测试
 *
 * 覆盖两条「别人机器 / 非本机访问」修复：
 *  A. resolveStoreFile：相对持久化路径锚定到插件目录（与进程 CWD 无关），
 *     绝对路径原样返回，历史默认值前缀不重复嵌套；
 *  B. data.ts resolveApiBase（经 dataCenterUrl 间接验证）：http(s) 同源优先用
 *     location.origin，绝不采用服务端注入的 127.0.0.1（局域网 / 远程访问会指向访问者本机）。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isAbsolute, join, resolve } from 'node:path'
import { PLUGIN_ROOT, resolveStoreFile } from '../src/paths.ts'
import { dataCenterUrl } from '../src/client/data.ts'

/* ───────────────── A. 持久化路径锚定 ───────────────── */

test('paths: 绝对路径原样返回（不被锚定改写）', () => {
  const abs = resolve(PLUGIN_ROOT, '..', 'somewhere', 'store.json')
  assert.equal(resolveStoreFile(abs), abs)
})

test('paths: 相对路径解析为绝对且落在插件目录下', () => {
  const out = resolveStoreFile('./data/store.json')
  assert.ok(isAbsolute(out), '结果必须是绝对路径')
  assert.ok(out.startsWith(PLUGIN_ROOT), `应锚定到插件根 ${PLUGIN_ROOT}，实际 ${out}`)
})

test('paths: 历史默认值 ./ecommerce-analyst-plugin/data/store.json 不再重复嵌套插件名', () => {
  const out = resolveStoreFile('./ecommerce-analyst-plugin/data/store.json')
  assert.equal(out, join(PLUGIN_ROOT, 'data', 'store.json'))
  assert.ok(!out.includes(join('ecommerce-analyst-plugin', 'ecommerce-analyst-plugin')), '不得出现重复插件目录名')
})

test('paths: 空串回退到插件目录默认 data/store.json', () => {
  assert.equal(resolveStoreFile(''), join(PLUGIN_ROOT, 'data', 'store.json'))
})

/* ───────────────── B. 客户端 API 基址（http(s) 同源优先） ───────────────── */

interface WinStub {
  location: { protocol: string; origin?: string }
  __ECOM_API_BASE__?: string
}

function withWindow(win: WinStub | null, fn: () => void): void {
  const g = globalThis as unknown as { window?: unknown }
  const prev = g.window
  if (win === null) delete g.window
  else g.window = win
  try {
    fn()
  } finally {
    if (prev === undefined) delete g.window
    else g.window = prev
  }
}

test('data: http(s) 页面用 location.origin，忽略服务端注入的 127.0.0.1（局域网/远程修复）', () => {
  withWindow(
    {
      location: { protocol: 'http:', origin: 'http://192.168.1.5:3080' },
      // 服务端 tapIndex 注入的本机地址：非本机访问时必须被忽略
      __ECOM_API_BASE__: 'http://127.0.0.1:3080',
    },
    () => {
      const url = dataCenterUrl()
      assert.ok(url.startsWith('http://192.168.1.5:3080/ecommerce-api/data-center'), `应走访问者实际 origin，实际 ${url}`)
      assert.ok(!url.includes('127.0.0.1'), '不得采用注入的 127.0.0.1')
    },
  )
})

test('data: file:// 桌面端回退到服务端注入的绝对地址', () => {
  withWindow(
    {
      location: { protocol: 'file:' },
      __ECOM_API_BASE__: 'http://127.0.0.1:3080',
    },
    () => {
      const url = dataCenterUrl()
      assert.ok(url.startsWith('http://127.0.0.1:3080/ecommerce-api/data-center'), `file:// 下应采用注入地址，实际 ${url}`)
    },
  )
})

test('data: 无 window（node）时退回相对路径', () => {
  withWindow(null, () => {
    const url = dataCenterUrl()
    assert.ok(url.startsWith('/ecommerce-api/data-center'), `无 window 应为相对路径，实际 ${url}`)
  })
})
