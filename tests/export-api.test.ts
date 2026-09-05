/**
 * 数据导出接口回归测试：/ecommerce-api/export（JSON / CSV，products / orders / all）
 *
 * 覆盖「插入 → 导出」闭环中的导出侧：演示种子数据落库后，导出接口应返回
 * 与 Store 口径一致的商品/订单数据，CSV 带 UTF-8 BOM 与正确表头、CRLF 换行，
 * 供用户在插件内一键导出原始数据。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EventEmitter } from 'node:events'
import { EcommerceStore } from '../src/store.ts'
import { MockAdapter } from '../src/platform/mock.ts'
import { registerShopApi, type WebServerLike } from '../src/shop-api.ts'

type FakeReq = EventEmitter & { url: string; method: string; headers: Record<string, string>; destroy: () => void }
type FakeRes = {
  statusCode: number
  headers: Record<string, unknown>
  body: string
  writeHead(s: number, h?: Record<string, unknown>): void
  end(c?: unknown): void
}

function makeReq(url: string, method: string): FakeReq {
  const req = new EventEmitter() as FakeReq
  req.url = url
  req.method = method
  req.headers = {}
  req.destroy = () => {}
  queueMicrotask(() => req.emit('end'))
  return req
}

function makeRes(): FakeRes {
  const res = {
    statusCode: 0,
    headers: {} as Record<string, unknown>,
    body: '',
    writeHead(status: number, headers?: Record<string, unknown>): void {
      this.statusCode = status
      if (headers) this.headers = headers
    },
    end(chunk?: unknown): void {
      this.body = String(chunk ?? '')
    },
  } as FakeRes
  return res
}

async function call(handler: (req: unknown, res: unknown) => void | Promise<void>, method: string, url: string): Promise<{ status: number; headers: Record<string, unknown>; text: string; json: Record<string, unknown> | null }> {
  const req = makeReq(url, method)
  const res = makeRes()
  await handler(req, res)
  let json: Record<string, unknown> | null = null
  try { json = JSON.parse(res.body) as Record<string, unknown> } catch { /* 非 JSON */ }
  return { status: res.statusCode, headers: res.headers, text: res.body, json }
}

test('导出接口：JSON 返回与 Store 口径一致的商品/订单', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-export-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'), seedOnEmpty: true, lowStockThreshold: 10,
  })
  await store.init() // 演示种子：26 商品 / 480 订单

  let handler: ((req: unknown, res: unknown) => void | Promise<void>) | null = null
  const webServer: WebServerLike = {
    port: 0,
    register(r) {
      // 断言放宽为 (req: unknown, res: unknown)：测试桩用 FakeReq/FakeRes 驱动真实 handler
      handler = r.handler as (req: unknown, res: unknown) => void | Promise<void>
      return () => {}
    },
    tapIndex(): () => void { return () => {} },
  }
  const disposer = registerShopApi(webServer, store, {})

  const res = await call(handler!, 'GET', '/ecommerce-api/export?type=json')
  assert.equal(res.status, 200)
  const v = res.json?.value as { products?: unknown[]; orders?: unknown[] } | undefined
  assert.equal(v?.products?.length, 26, 'JSON 导出商品 26 件')
  assert.equal(v?.orders?.length, 480, 'JSON 导出订单 480 笔')

  disposer()
  rmSync(dir, { recursive: true, force: true })
})

test('导出接口：CSV 带 BOM + 正确表头 + CRLF，scope 分流', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ecom-export-'))
  const store = new EcommerceStore(new MockAdapter(), {
    file: join(dir, 'store.json'), seedOnEmpty: true, lowStockThreshold: 10,
  })
  await store.init()

  let handler: ((req: unknown, res: unknown) => void | Promise<void>) | null = null
  const webServer: WebServerLike = {
    port: 0,
    register(r) {
      // 断言放宽为 (req: unknown, res: unknown)：测试桩用 FakeReq/FakeRes 驱动真实 handler
      handler = r.handler as (req: unknown, res: unknown) => void | Promise<void>
      return () => {}
    },
    tapIndex(): () => void { return () => {} },
  }
  const disposer = registerShopApi(webServer, store, {})

  // products
  const products = await call(handler!, 'GET', '/ecommerce-api/export?type=csv&scope=products')
  assert.equal(products.status, 200)
  assert.equal(products.headers['content-type'], 'text/csv; charset=utf-8')
  assert.ok(products.text.startsWith('﻿'), 'CSV 以 UTF-8 BOM 开头')
  assert.ok(products.text.includes('sku,name,category,price,stock,status'), '商品 CSV 表头正确')
  assert.equal(products.text.split('\r\n').length, 27, '商品 CSV 26 行数据 + 1 表头')

  // orders
  const orders = await call(handler!, 'GET', '/ecommerce-api/export?type=csv&scope=orders')
  assert.equal(orders.status, 200)
  assert.ok(orders.text.includes('order_id,buyer,sku,product_name,quantity,amount,status'), '订单 CSV 表头正确')
  assert.equal(orders.text.split('\r\n').length, 481, '订单 CSV 480 行数据 + 1 表头')

  // all（商品 + 订单拼接，含两个 BOM/表头）
  const all = await call(handler!, 'GET', '/ecommerce-api/export?type=csv&scope=all')
  assert.equal(all.status, 200)
  assert.ok(all.text.includes('sku,name,category'), 'all 导出含商品表头')
  assert.ok(all.text.includes('order_id,buyer,sku'), 'all 导出含订单表头')

  disposer()
  rmSync(dir, { recursive: true, force: true })
})
