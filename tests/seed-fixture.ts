/**
 * 测试专用 fixture：v0.4.0 起运行时不再携带示例数据，
 * 测试所需「26 商品/480 订单」样本从 tests/fixtures/seed.json 显式注入。
 * 生产代码永不 import 本文件。
 */
import seed from './fixtures/seed.json' with { type: 'json' }
import type { Order, Product } from '../src/types.ts'

export const seedFixture = seed as unknown as { products: Product[]; orders: Order[] }
