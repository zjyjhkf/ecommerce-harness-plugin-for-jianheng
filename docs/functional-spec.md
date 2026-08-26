# dsh 电商商单智能体插件 — 功能规范文档

> 版本：v1.0.0 ｜ 日期：2026-08-25 ｜ 目标平台：DeepSeek Harness (dsh) v0.1.1-rc.2
>
> 本插件基于视频《DeepSeek Harness 电商店铺数据分析智能体》的功能演示开发，核心目标：
> **优化电商商单操作，让用户通过自然语言即可完成商品管理、订单处理与销售数据分析。**

---

## 目录

1. [视频功能分析](#1-视频功能分析)
2. [可行性分析与技术挑战](#2-可行性分析与技术挑战)
3. [总体设计方案](#3-总体设计方案)
4. [功能模块规范](#4-功能模块规范)
5. [数据模型规范](#5-数据模型规范)
6. [API 对接规范](#6-api-对接规范)
7. [测试与验收标准](#7-测试与验收标准)
8. [迭代计划](#8-迭代计划)

---

## 1. 视频功能分析

### 1.1 信息来源与限制说明

| 项 | 说明 |
|---|---|
| 视频链接 | https://weixin.qq.com/sph/AaiAzcIGll（微信视频号） |
| 可获取元数据 | 标题：**DeepSeek Harness 电商店铺数据分析智能体**；发布时间：2026-08-23；标签：#AI #DeepSeekHarness #电商 #电商运营 #数据分析 |
| 限制 | 微信视频号视频流无法被外部程序解析播放，因此无法逐帧提取演示细节；以下功能清单基于 **标题 + 标签 + dsh 生态公开资料 + 用户确认需求** 交叉推断，并已与用户逐项确认。 |

### 1.2 功能推断清单（已确认）

| # | 功能域 | 具体能力 | 来源依据 |
|---|---|---|---|
| F1 | 商品管理 | 商品信息查询、**商品分类**、**数据筛选**、**商品增删改查** | 用户确认 + 视频标题 |
| F2 | 订单处理 | 订单查询（按状态/时间/金额筛选）、订单统计、发货状态更新、售后标记 | 用户确认 + 电商场景最佳实践 |
| F3 | 销售数据分析 | 销售额/订单量统计、时间趋势、TOP 商品排行、类目分布 | 视频标题「数据分析」定位 |
| F4 | 库存预警 | 低库存自动提醒、补货建议 | 用户确认 |
| F5 | 交互界面 | **侧边栏展开交互**、数据可视化展示 | 用户确认 |
| F6 | 数据接入 | **对接电商平台 API** 实时取数 | 用户确认 |

### 1.3 用户核心诉求

> 「所有数据均可在侧边栏展开实现交互，能够实现商品分类，根据数据筛选，以及商品的增删改查等操作，保证插件成品和视频内容功能基本相同。」

---

## 2. 可行性分析与技术挑战

### 2.1 可行性结论

**总体可行。** dsh 采用「一切皆插件」架构，提供完整的工具注册（`defineTool`）、插槽 UI（`ctx.slots`）、对话业务节点（`ConversationNodeDefinition`）扩展点。经对仓库源码（`packages/core/tools`、`packages/client`、`docs/cookbook`）的核实，F1–F6 均可在 dsh v0.1.1-rc.2 实现。

### 2.2 技术挑战与对策

| # | 挑战 | 风险等级 | 对策 |
|---|---|---|---|
| C1 | **电商平台 API 差异大**：淘宝/拼多多/抖店等签名机制、接口命名、鉴权流程各不相同，无法一套代码通吃 | 高 | 采用**平台适配器模式**（`PlatformAdapter` 接口 + 逐平台实现），统一为内部领域模型；首版内置「通用 REST 适配器」与「示例数据适配器」，真实平台适配器按需逐个接入 |
| C2 | **凭证安全**：API Key / Token 若硬编码进插件，存在泄露风险 | 高 | 凭证一律通过 dsh `Config` 配置（存于用户本地配置文件），插件代码不包含任何真实凭证；文档明示安全边界 |
| C3 | **实时数据 vs 演示可用性**：无凭证时插件应能开箱演示 | 中 | 双数据源架构：配置了平台 API 凭证 → 走真实数据；未配置 → 自动降级为内置示例数据并标注「示例模式」，保证首次使用即有完整体验 |
| C4 | **dsh 版本快速迭代**：官方声明存在破坏性变更 | 中 | 锁定兼容基线 dsh v0.1.1-rc.2，独立成包不侵入源码仓库；升级 dsh 时仅需验证工具注册契约 |
| C5 | **统计口径一致性**：销售额/订单量等指标在不同平台定义不同 | 中 | 统计逻辑集中在 `stats.ts` 单一模块，所有指标由订单原始数据在插件内统一计算，不依赖平台侧预聚合 |
| C6 | **数据持久化**：工具执行产生的变更（如库存调整、发货更新）需要跨会话保留 | 中 | 本地 JSON 文件持久化 + 内存缓存；导出/导入能力（JSON 备份）；未来升级为 dsh 自带持久化服务 |
| C7 | **侧边栏 UI**：dsh Web 客户端侧边栏插槽尚在演进 | 低 | 首版以 **对话流业务卡片**（`ConversationNodeDefinition`，官方稳定扩展点）承载交互式数据展示；侧边栏插槽随 dsh 官方文档明确后迭代接入 |

### 2.3 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 运行环境 | Node.js ≥ 22.19 | dsh 引擎要求 |
| 插件框架 | Cordis（`@deepseek-ai/cordis`） | dsh 底层插件内核 |
| 工具契约 | `@deepseek-ai/dsh-tools` 的 `defineTool` | 参数校验 + 结构化输出 + 渲染 |
| 类型系统 | TypeScript 5.x | 全仓库类型安全 |
| 存储 | 本地 JSON 文件（`node:fs`） | 零依赖，离线可用 |
| 测试 | Node 内置 `node:test` | 零额外依赖，符合插件轻量原则 |
| 图表 | 内联 SVG（UI 卡片内手写） | 遵循 dsh 无外部依赖惯例 |

---

## 3. 总体设计方案

### 3.1 架构图

```
┌────────────────────────────────────────────────────────┐
│                    用户（自然语言）                       │
│  "帮我查一下今天卖了多少" / "把库存低于10的商品列出来"      │
└────────────────────────┬───────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────┐
│                   dsh Agent 核心                        │
│   （模型调用 → 工具路由 → 工具执行 → 结果渲染）            │
└───────────────┬────────────────────┬───────────────────┘
                ▼                    ▼
┌──────────────────────┐  ┌─────────────────────────────┐
│  工具层（本插件）      │  │  UI 层（本插件）              │
│  products / orders   │  │  对话流业务卡片               │
│  stats / alerts      │  │  （分类、筛选、增删改查交互）    │
└───────────┬──────────┘  └─────────────┬───────────────┘
            ▼                           │
┌───────────────────────────────────────┴──┐
│              数据层（本插件）               │
│  Store：统一领域模型 + CRUD + 统计           │
├──────────────────┬───────────────────────┤
│  PlatformAdapter │  本地持久化（JSON）     │
│  ├─ MockAdapter  │  导出/导入备份          │
│  └─ RestAdapter  │                       │
└──────────────────┴───────────────────────┘
```

### 3.2 模块划分（严格控制在 4 个核心模块 + 支撑层）

| 模块 | 工具组 | 说明 |
|---|---|---|
| 商品管理 | `product_*` | 查询/筛选/新增/修改/删除/分类/库存调整 |
| 订单处理 | `order_*` | 查询/统计/状态更新/发货/售后 |
| 销售数据分析 | `stats_*` | 总览/趋势/TOP排行/类目分布 |
| 库存预警 | `inventory_*` | 低库存清单/补货建议 |
| 支撑层 | store / adapter / ui | 数据、适配、展示（不单独算业务模块） |

### 3.3 目录结构

```
ecommerce-analyst-plugin/
├── package.json          # 插件包定义
├── tsconfig.json
├── cordis.yml            # dsh --patch 加载配置
├── README.md             # 使用说明
├── docs/
│   └── functional-spec.md# 功能规范文档（本文档）
├── src/
│   ├── index.ts          # 插件入口（注册工具 + UI）
│   ├── types.ts          # 领域类型（Product/Order/Stats）
│   ├── store.ts          # 数据仓库（CRUD + 统计 + 持久化）
│   ├── config.ts         # 插件配置项（Schema）
│   ├── platform/
│   │   ├── adapter.ts    # PlatformAdapter 接口
│   │   ├── mock.ts       # 示例数据适配器
│   │   └── rest.ts       # 通用 REST 电商 API 适配器
│   └── tools/
│       ├── products.ts   # 商品管理工具集
│       ├── orders.ts     # 订单处理工具集
│       ├── stats.ts      # 数据分析工具集
│       └── inventory.ts  # 库存预警工具集
├── data/
│   └── seed.json         # 预置示例数据（含异常条目）
└── tests/
    ├── store.test.ts
    ├── stats.test.ts
    └── tools.test.ts
```

---

## 4. 功能模块规范

### 4.1 模块一：商品管理（F1）

**目标**：让用户通过自然语言完成商品信息的全生命周期管理。

| 工具名 | 参数 | 返回 | 说明 |
|---|---|---|---|
| `product_list` | `category?`（按分类筛选）、`keyword?`（名称/ID 模糊搜索）、`status?`（on_sale/off_sale）、`min_price?`/`max_price?`、`page?`/`page_size?` | `{ total, items: Product[] }` | 商品查询与多维筛选，支持分页 |
| `product_create` | `name`、`price`、`stock`、`category`、`status?` | `Product` | 新增商品（生成唯一 SKU） |
| `product_update` | `sku`、`name?`、`price?`、`stock?`、`category?`、`status?` | `Product` | 修改商品信息 |
| `product_delete` | `sku` | `{ deleted: boolean }` | 删除商品 |
| `product_stock_adjust` | `sku`、`delta`（正加负减）、`reason?` | `Product` | 库存调整（入库/出库/盘点） |
| `product_on_sale` / `product_off_sale` | `sku` | `Product` | 上下架操作 |

**交互要求**：商品列表结果渲染为业务卡片，支持按分类标签展开、按状态/价格筛选（满足「侧边栏展开交互」等价能力）。

### 4.2 模块二：订单处理（F2）

**目标**：让用户随时掌握订单状态并快速处理发货、售后。

| 工具名 | 参数 | 返回 | 说明 |
|---|---|---|---|
| `order_list` | `status?`（pending/paid/shipped/completed/refunded/cancelled）、`date_from?`/`date_to?`、`min_amount?`/`max_amount?`、`keyword?`（买家/订单号）、`page?/page_size?` | `{ total, items: Order[] }` | 订单查询与多维筛选 |
| `order_stats` | `date_from?`/`date_to?` | `{ count, revenue, avg_amount, refund_rate }` | 订单统计概览 |
| `order_update_status` | `order_id`、`status`、`note?` | `Order` | 状态流转（含校验合法流转） |
| `order_ship` | `order_id`、`tracking_no`、`carrier` | `Order` | 发货处理 |
| `order_refund` | `order_id`、`amount`、`reason` | `Order` | 售后/退款处理 |

**状态流转约束**：`pending → paid → shipped → completed`，`paid/shipped → refunded`，`pending → cancelled`；非法流转直接返回错误。

### 4.3 模块三：销售数据分析（F3）

**目标**：对应视频「数据分析智能体」定位，提供直观的经营洞察。

| 工具名 | 参数 | 返回 | 说明 |
|---|---|---|---|
| `stats_overview` | `date_from?`/`date_to?` | `{ revenue, orders, avg_order_value, top_selling_sku, refund_rate }` | 经营总览 |
| `stats_trend` | `date_from?`/`date_to?`、`granularity?`（day/week/month） | `{ points: [{ date, revenue, orders }] }` | 销售趋势（折线图数据） |
| `stats_top_products` | `date_from?`/`date_to?`、`limit?`（默认 10） | `{ items: [{ sku, name, revenue, units }] }` | TOP 商品排行 |
| `stats_category` | `date_from?`/`date_to?` | `{ items: [{ category, revenue, ratio }] }` | 类目销售分布（饼图数据） |

**口径定义**：销售额 = 已支付订单（status ∈ {paid, shipped, completed}）的实付金额合计；订单量 = 同口径订单数；退款率 = refunded 订单数 / 全部订单数。

### 4.4 模块四：库存预警（F4）

| 工具名 | 参数 | 返回 | 说明 |
|---|---|---|---|
| `inventory_low_stock` | `threshold?`（默认 10） | `{ items: [{ sku, name, stock, category, days_left? }] }` | 低库存清单（红色高亮） |
| `inventory_suggest` | `threshold?` | `{ items: [{ sku, name, stock, suggest_qty, reason }] }` | 补货建议（基于近 30 天销量估算） |

**预警规则**：`stock <= threshold` 视为低库存；补货建议量 = `max(0, 近30天销量×1.5 - 当前库存)`。

---

## 5. 数据模型规范

```ts
/** 商品 */
interface Product {
  sku: string              // 唯一标识，如 "SKU-0001"
  name: string             // 商品名称
  category: string         // 分类，如 "数码配件"
  price: number            // 单价（¥）
  stock: number            // 当前库存
  status: 'on_sale' | 'off_sale'
  created_at: string       // ISO 日期
  updated_at: string
}

/** 订单 */
interface Order {
  order_id: string         // 唯一标识，如 "ORD-20260801-001"
  buyer: string            // 买家昵称
  sku: string              // 关联商品
  product_name: string     // 冗余商品名（快照）
  quantity: number
  amount: number           // 实付金额（¥）
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'refunded' | 'cancelled'
  created_at: string       // 下单时间
  shipped_at?: string
  tracking_no?: string
  carrier?: string
  refund_reason?: string
}
```

**约定**：
- 货币单位 ¥，金额保留 2 位小数
- 日期格式 `YYYY-MM-DD`（对外展示）/ ISO 8601（存储）
- 金额为 `number`，运算使用整数分位防浮点误差

---

## 6. API 对接规范

### 6.1 适配器接口

```ts
interface PlatformAdapter {
  readonly name: string                 // 平台名，如 'mock' | 'taobao' | 'pdd'
  listProducts(filter: ProductFilter): Promise<Product[]>
  listOrders(filter: OrderFilter): Promise<Order[]>
  updateProduct(sku: string, patch: Partial<Product>): Promise<Product>
  updateOrderStatus(orderId: string, status: OrderStatus, meta?: OrderMeta): Promise<Order>
}
```

### 6.2 内置适配器

| 适配器 | 用途 | 启用条件 |
|---|---|---|
| `MockAdapter` | 开箱演示（内置 5 商品 + 12 订单，含低库存与售后异常条目） | 默认 |
| `RestAdapter` | 对接电商平台开放平台 REST API | 配置 `ecommerceAnalyst.platform.*` |

### 6.3 配置项（dsh Config）

```yaml
ecommerceAnalyst:
  platform:
    name: mock              # mock | rest
    baseUrl: ""             # 电商平台 API 网关地址（rest 模式必填）
    token: ""               # 访问凭证（通过环境变量注入，不写入 yaml）
    appKey: ""              # 平台应用凭证
    appSecret: ""
  storage:
    file: "./data/store.json"   # 本地持久化路径
    seedOnEmpty: true           # 空库时自动写入示例数据
  inventory:
    lowStockThreshold: 10
```

**安全边界**：凭证支持从环境变量读取（如 `DSH_ECOM_TOKEN`），dsh Config 中留空即回退环境变量，双保险。

### 6.4 对接流程（以抖店开放平台为例，落地时按平台文档实现）

```
1. 在平台开放平台创建应用，获取 appKey/appSecret
2. 完成商家授权，获取 token（有效期管理 + 刷新）
3. 在插件 Config 填入凭证（或环境变量）
4. 插件启动 → RestAdapter 初始化 → 调用平台商品/订单接口 → 映射为内部领域模型
5. 工具执行 → Store → 优先走平台 API，失败降级本地缓存/示例数据
```

---

## 7. 测试与验收标准

| 测试面 | 用例 | 验收标准 |
|---|---|---|
| 数据层 CRUD | 商品增删改查、库存调整、上下架 | 全部通过，删除不可恢复（返回确认） |
| 状态机 | 订单合法/非法流转 | 合法流转成功，非法流转返回明确错误 |
| 统计口径 | overview/trend/top/category 在固定数据集上计算 | 与手工核算结果一致（误差 < 0.01） |
| 库存预警 | 阈值边界（stock == threshold） | 边界值正确命中预警 |
| 持久化 | 变更后重载 | 数据不丢失，文件格式合法 JSON |
| 工具注册 | 插件加载后工具可见 | 全部工具注册成功，schema 合法 |
| 降级 | 配置无效 API 时 | 自动回退示例模式，无未捕获异常 |

---

## 8. 迭代计划

| 版本 | 内容 | 状态 |
|---|---|---|
| v0.1.0 | 本版：4 大模块工具集 + 示例数据 + 本地持久化 + 测试 | ✅ 本文档对应 |
| v0.2.0 | 对话流业务卡片 UI（分类/筛选/增删改查交互） | 待开发 |
| v0.3.0 | 接入第一个真实电商平台适配器（需用户提供平台与凭证） | 待开发 |
| v0.4.0 | 侧边栏插槽（随 dsh 官方文档演进） | 待开发 |

---

## 附录 A：兼容性基线

- dsh 版本：`0.1.1-rc.2`（本仓库 checkout）
- 依赖：`@deepseek-ai/cordis`、`@deepseek-ai/dsh-tools`（均以 workspace 版本对齐）
- Node.js：≥ 22.19.0
- 加载方式：`pnpm dsh web --patch ./ecommerce-analyst-plugin/cordis.yml`

## 附录 B：风险登记册

| 风险 | 影响 | 缓解 |
|---|---|---|
| 视频细节与推断功能存在偏差 | 功能可能超出/少于视频展示 | 本规范已与用户逐项确认，迭代中可随时调整 |
| 电商平台 API 政策变化 | 适配器失效 | 适配器隔离，失效仅影响对应平台 |
| 演示数据与真实数据混淆 | 用户误判数据真实性 | 示例模式在工具结果中明确标注「示例数据」 |
