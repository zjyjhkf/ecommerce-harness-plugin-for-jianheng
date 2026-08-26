# ecommerce-analyst-plugin — 电商商单智能体插件

> 基于 DeepSeek Harness（dsh）插件体系开发，对应视频《DeepSeek Harness 电商店铺数据分析智能体》的功能定位。
> 通过自然语言即可完成 **商品管理、订单处理、销售数据分析、库存预警**。

---

## 功能一览

| 模块 | 工具 | 说明 |
|---|---|---|
| 📦 商品管理 | `product_list` / `product_create` / `product_update` / `product_delete` / `product_stock_adjust` / `product_on_sale` / `product_off_sale` | 商品查询筛选、增删改查、库存调整、上下架 |
| 🧾 订单处理 | `order_list` / `order_stats` / `order_update_status` / `order_ship` / `order_refund` | 订单查询统计、状态流转（含合法性校验）、发货、退款 |
| 📊 销售数据分析 | `stats_overview` / `stats_trend` / `stats_top_products` / `stats_category` | 经营总览、趋势、TOP 排行、类目分布 |
| ⚠️ 库存预警 | `inventory_low_stock` / `inventory_suggest` | 低库存清单、补货建议（近 30 天销量 × 1.5） |
| 💾 数据备份 | `ecommerce_export_backup` / `ecommerce_import_backup` | JSON 备份导出/导入恢复 |
| 📥 表格导入 | `ecommerce_import_excel` | CSV/JSON 表格数据整体导入，字段级校验失败返回「行号/字段/原因」明细 |
| 💬 规则问答 | `ecommerce_qa` | 高频经营问题直接命中规则返回确定性答案（与统计工具同口径） |
| 📄 CSV 导出 | `ecommerce_export_csv` | 商品/订单导出 UTF-8 CSV（带 BOM，Excel 可直接打开） |
| 🔄 数据源切换 | `ecommerce_set_mode` / `ecommerce_reset_demo` | 演示数据 / 导入数据 / 平台 API 显式切换；一键重置演示数据（先备份） |

## 桌面端侧边栏「电商经营驾驶舱」（v0.3.0）

> 三插件整合：ecommerce-analyst（数据/工具）+ commerce-cockpit（驾驶舱 UI 参照）+ dsh-better-sidebar（侧边栏挂载）。
> 打开方式：**侧边栏模块启动**（better-sidebar 标签页 / 右侧悬浮「驾驶舱」按键 / shell.overlay 兜底），不再依赖对话顶部。

v0.3.0 新增能力：

- **行动清单 dock**（/ecommerce-api/actions）：逾期/待发货/低库存 → 待办 N 项 · 今天到期 N · 紧急 N，可展开
- **一页经营简报**（/ecommerce-api/brief）：Markdown 文本 + 一键复制（总览/TOP3/类目/待办/补货建议）
- 面板标题升级为「电商经营驾驶舱」，数据模式标签、折叠、刷新、导入、仪表盘页（/ecommerce-api/dashboard）全保留
- 数据全部来自同一 EcommerceStore，与 25 个工具同口径

## 桌面端侧边栏「店铺工作台」（v0.2.1+）

> 修复：插件 `inject` 声明补齐 `tools` 服务，修复真实 dsh 组合下店铺工作台数据
> API（/ecommerce-api）未注册的问题；API 增加 CORS 与 OPTIONS 预检支持
> （桌面端 file:// 跨源拉取）；通过 webServer.tapIndex 向页面注入 API base，
> 客户端无需猜测端口。

插件同时提供 dsh 客户端侧边栏面板（挂载于 `shell.overlay` 叠加插槽，不占用官方 sidebar）：

- 经营总览卡片（销售额/订单量/客单价/退款率）｜ 今日待办（逾期红置顶/待发货/低库存）
- 商品分类树（6 类点击筛选）｜ 销售排行 TOP5 ｜ 低库存预警清单（可展开）
- 数据来自同一 `EcommerceStore` 统计口径（`/ecommerce-api` 只读接口），与工具结果完全一致
- 面板可折叠、窄屏自动收起；构建与验证见 `docs/dev-sidebar.md`

## v0.3.0 新增能力（对齐视频 commerce-cockpit）

- **规则问答**（`ecommerce_qa`）：经营总览 / 今日销售 / 畅销 TOP / 低库存 / 待发货 / 待付款与逾期 / 退款率 / 类目占比 高频问题直接命中规则返回确定性答案；未命中才走模型推理（工具回退）。命中数据全部来自 Store 统计逻辑，与工具同口径。
- **数据源显式切换**：侧边栏「数据源」标签支持 演示数据 / 导入数据 / 平台 API 三态切换；「重置为演示数据」一键恢复种子数据（切换/重置前自动备份当前数据，可从备份恢复）。
- **独立仪表盘页**：`GET /ecommerce-api/dashboard` 返回内联 HTML（指标卡片 + 30 天趋势 SVG 折线 + 类目占比 SVG 环形图 + TOP10 表格 + 低库存清单），零外部依赖，侧边栏一键打开。
- **导入校验明细化**：`ecommerce_import_excel` 字段级校验逐行收集错误（行号/字段/原因，如「第 12 行 amount 非数字」）；任一错误即整体失败并返回明细，不写入脏数据。
- **CSV 导出**（`ecommerce_export_csv`）：商品/订单导出 UTF-8 CSV（带 BOM），与 JSON 备份并列。
- **侧边栏丰富**：经营总览卡片内嵌 30 天销售趋势迷你图；商品分类增加类目占比 SVG 横条；新增数据源标签与「打开仪表盘」入口。

## 快速开始

### 1. 加载插件

在 dsh 仓库根目录执行（`--patch` 挂载本地插件）：

```sh
pnpm dsh web --patch ./ecommerce-analyst-plugin/cordis.yml
```

> 首次使用即内置企业演示数据（26 商品 + 480 订单：总览 ¥154,699 / 359 单 / 客单价 ¥430.92 / 退款率 10.6%，含逾期 43 笔、待发货 55 笔、低库存 8 件），开箱即可演示。

### 2. 对话示例

- 「帮我查一下今天的经营总览」
- 「把库存低于 10 的商品列出来」
- 「给订单 ORD-20260810-007 发货，运单号 SF123，顺丰」
- 「新增一个商品：便携榨汁杯，售价 89 元，库存 50，分类 厨房电器」
- 「统计 8 月份的销售趋势」
- 「哪个商品卖得最好？」

### 2.5 导入 Excel 表格数据

`ecommerce_import_excel` 支持把 Excel 导出的 CSV（或 JSON 行数组）整体导入商品与订单：

- 商品表头（支持中文别名）：`sku/商品编码, name/商品名称, category/类目, price/售价, stock/库存, status/状态(在售|下架)`
- 订单表头（支持中文别名）：`order_id/订单号, buyer/买家, sku/商品编码, product_name/商品名称, quantity/数量, amount/金额, status/状态, created_at/下单时间`
- 导入前自动备份当前数据；导入后「店铺工作台」侧边栏与统计工具立即反映新数据（同一 Store）

### 3. 对接真实电商平台（rest 模式）

默认使用内置示例数据（`mock`）。接入真实电商平台 API：

```yaml
# dsh 配置（用户配置文件 / cordis.yml 均可）
ecommerceAnalyst:
  platform:
    name: rest
    baseUrl: "https://openapi.your-platform.com"   # 平台开放平台网关
    appKey: ""                                      # 应用凭证
    appSecret: ""                                   # 应用密钥
  storage:
    file: "./ecommerce-analyst-plugin/data/store.json"
  inventory:
    lowStockThreshold: 10
```

- **凭证安全**：访问 token 建议通过环境变量 `DSH_ECOM_TOKEN` 注入，不写入配置文件
- **平台签名**：`src/platform/rest.ts` 中的 `signParams()` 为各平台签名钩子，接入淘宝/拼多多/抖店时按平台文档实现
- **降级机制**：API 不可用时自动回退示例数据模式，页面/结果中标注「示例数据」

## 开发与测试

```sh
# 单元测试（28 项：CRUD、状态机、统计口径、库存预警、持久化、工具注册、入口冒烟）
pnpm --dir ecommerce-analyst-plugin test

# 类型检查
pnpm --dir ecommerce-analyst-plugin typecheck
```

## 架构

```
src/
├── index.ts            # 插件入口：适配器→Store→工具注册→「今天要处理」提示
├── config.ts           # 配置 Schema（schemastery）
├── types.ts            # 领域类型 + 订单状态机 + 金额分位工具
├── store.ts            # 数据仓库：CRUD / 统计口径 / 库存预警 / 持久化
├── platform/
│   ├── adapter.ts      # PlatformAdapter 接口 + 适配器工厂
│   ├── mock.ts         # 示例数据适配器（默认，只读）
│   └── rest.ts         # 通用 REST 电商平台适配器
└── tools/
    ├── products.ts     # 商品管理工具集
    ├── orders.ts       # 订单处理工具集
    ├── stats.ts        # 数据分析工具集
    ├── inventory.ts    # 库存预警工具集
    ├── backup.ts       # 数据备份工具集
    └── json.ts         # 输出类型适配
data/seed.json          # 预置示例数据
tests/                  # 28 项单元测试
docs/functional-spec.md # 功能规范文档
```

## 设计要点

- **统计口径统一**：销售额 = 已支付订单（paid/shipped/completed）实付金额；退款率 = 退款单/总单
- **金额精度**：内部整数分位运算，杜绝浮点误差（¥0.1+0.2 = ¥0.3）
- **状态机约束**：`pending→paid→shipped→completed`，`paid/shipped→refunded`，`pending→cancelled`，非法流转报错
- **「今天要处理」置顶**：系统提示动态注入今日待办（逾期订单/待发货/低库存），模型开聊即知
- **数据安全**：本地 JSON 持久化 + 导出/导入备份 + 恢复前自动快照

## 兼容性

- dsh 版本：`0.1.1-rc.2`
- Node.js：≥ 22.19
- 零外部运行时依赖（仅 peer 依赖 dsh 内置包）
