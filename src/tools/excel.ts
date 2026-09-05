/**
 * ecommerce-analyst-plugin — Excel/表格数据导入工具（含字段级校验报告）
 *
 * ecommerce_import_excel：把商品/订单表格数据（CSV 文本或 JSON 行数组）整体
 * 导入店铺（整体替换，导入前自动备份当前数据快照）。Excel 导出 CSV 后可直接
 * 粘贴/传参，兼容常见电商后台导出的列名（sku/商品名/类目/售价/库存/状态，
 * order_id/买家/商品编码/数量/金额/状态/下单时间等）。
 *
 * 校验（对齐视频 commerce-cockpit 的 CSV 校验能力）：
 *  - 字段级校验逐行收集错误：失败行号 / 字段 / 原因（如「第 3 行 amount 非数字」）；
 *  - 任一错误即整体失败并返回明细，绝不写入脏数据；
 *  - 解析逻辑复用 src/import-parse.ts（与「店铺工作台」本地文件导入同一套实现）。
 */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { EcommerceStore } from '../store.ts'
import {
  csvToRows,
  jsonToRows,
  ORDER_COLUMNS,
  PRODUCT_COLUMNS,
  validateOrders,
  validateProducts,
  type FieldError,
} from '../import-parse.ts'
import { asJsonObject } from './json.ts'

/** 校验错误渲染：逐条列出「第 N 行｜字段｜原因」 */
function renderErrors(errors: FieldError[]): string {
  return errors
    .slice(0, 50)
    .map((e) => `- 第 ${e.row + 1} 行 ｜ ${e.field} ｜ ${e.reason}`)
    .join('\n') + (errors.length > 50 ? `\n…共 ${errors.length} 项错误` : '')
}

export function registerExcelTools(ctx: Context, store: EcommerceStore): void {
  ctx.tools.register(defineTool({
    name: 'ecommerce_import_excel',
    description:
      '从表格数据导入店铺商品与订单（整体替换当前数据）。支持 CSV 文本（带表头，' +
      '列名可为中文别名）或 JSON 行数组。products 必填；orders 可选。' +
      '导入前自动备份；导入前做字段级校验，失败返回「行号/字段/原因」明细且不写入数据。',
    parameters: {
      products_csv: {
        type: 'string',
        description:
          '商品 CSV（UTF-8，首行为表头）：sku/商品编码, name/商品名称, category/类目, price/售价, stock/库存, status/状态(在售|下架)',
      },
      products_json: {
        type: 'string',
        description: '商品 JSON 行数组字符串：[{sku,name,category,price,stock,status}]',
      },
      orders_csv: {
        type: 'string',
        description:
          '订单 CSV（UTF-8，首行为表头）：order_id/订单号, buyer/买家, sku/商品编码, product_name/商品名称, quantity/数量, amount/金额, status/状态, created_at/下单时间(YYYY-MM-DD HH:mm)',
      },
      orders_json: {
        type: 'string',
        description: '订单 JSON 行数组字符串：[{order_id,buyer,sku,product_name,quantity,amount,status,created_at}]',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: true,
        properties: {
          ok: { type: 'boolean' },
          products: { type: 'number' },
          orders: { type: 'number' },
          snapshot: { type: 'string' },
          hint: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: true,
              properties: {
                row: { type: 'number' },
                field: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
      render: (_args, value) => {
        const v = value as unknown as {
          ok?: boolean
          products: number
          orders: number
          hint?: string
          errors?: FieldError[]
        }
        if (v.ok === false && v.errors !== undefined && v.errors.length > 0) {
          return [{
            type: 'text',
            text: `表格导入校验失败，数据未写入（共 ${v.errors.length} 项错误）：\n${renderErrors(v.errors)}`,
          }]
        }
        return [{
          type: 'text',
          text: `表格导入完成：${v.products} 件商品、${v.orders} 笔订单。${v.hint ?? ''}（导入前数据已备份）`,
        }]
      },
    },
    async execute(args) {
      const snapshot = store.exportBackup()
      // 1) 解析为行对象（保留行号，供校验报告引用）
      let productRows: Record<string, unknown>[]
      if (typeof args.products_csv === 'string' && args.products_csv.trim()) {
        productRows = csvToRows(args.products_csv, PRODUCT_COLUMNS)
      } else if (typeof args.products_json === 'string' && args.products_json.trim()) {
        productRows = jsonToRows(JSON.parse(args.products_json), PRODUCT_COLUMNS)
      } else {
        throw new Error('请提供 products_csv 或 products_json（商品数据必填）')
      }

      let orderRows: Record<string, unknown>[] = []
      if (typeof args.orders_csv === 'string' && args.orders_csv.trim()) {
        orderRows = csvToRows(args.orders_csv, ORDER_COLUMNS)
      } else if (typeof args.orders_json === 'string' && args.orders_json.trim()) {
        orderRows = jsonToRows(JSON.parse(args.orders_json), ORDER_COLUMNS)
      }

      // 2) 字段级校验：收集全部错误（行号/字段/原因），任一错误即失败，不写入
      const vp = validateProducts(productRows)
      const knownSkus = new Set(vp.items.map((p) => p.sku))
      const vo = validateOrders(orderRows, knownSkus)
      const allErrors: FieldError[] = [...vp.errors, ...vo.errors]
      if (allErrors.length > 0) {
        return asJsonObject({
          ok: false,
          products: 0,
          orders: 0,
          errors: allErrors,
          snapshot,
          hint: `校验失败 ${allErrors.length} 项，数据未写入（可用 ecommerce_import_backup 恢复 snapshot）`,
        })
      }

      // 3) 全部通过 → 整体导入并落盘
      const result = store.importData(vp.items, vo.items)
      const hint = vo.items.length
        ? `商品类目：${[...new Set(vp.items.map((p) => p.category))].join('、')}`
        : '未提供订单数据，仅导入商品（统计工具按订单计算）'
      return asJsonObject({ ok: true, ...result, snapshot, hint })
    },
  }))
}
