# ecommerce-analyst-plugin — 电商商单智能体插件

> 基于 DeepSeek Harness（dsh）插件体系开发的电商店铺数据分析智能体。
> 通过自然语言即可完成 **订单处理、销售数据分析、库存预警**，并支持 **Excel 月度/周度复盘数据导入与数据中台分析**。
>
> 商品/订单数据**完全由「数据导入」或「平台 API」决定**，不再提供手动增删改查工具（早期设计的单个商品增删改查/上下架功能已删除，避免与导入数据冲突）。

---

## 下载与使用（GitHub 获取后）

### 1. 获取源码

```sh
git clone https://github.com/zjyjhkf/ecommerce-harness-plugin-for-jianheng.git   # 或直接下载 zip 解压
```

将插件目录放入 dsh（deepseek-harness）仓库内，例如：

```
deepseek-harness-master/
└── ecommerce-analyst-plugin/   # 本插件
```

### 2. 安装依赖

在 dsh 仓库根目录执行（插件依赖 `@deepseek-ai/*` 等 workspace peer 包，由 dsh 仓库统一提供）：

```sh
pnpm install
```

> 插件的运行时依赖仅 `xlsx`（Excel 解析，构建/导入时使用）与 `pdfjs-dist`（PDF 导入，可选，缺省自动降级）。
>
> **独立 clone**（不在 dsh 仓库 workspace 内）：仅加载已入库产物无需安装；若要自行**构建或跑测试**，需先在插件目录执行 `npm install`——`esbuild`/`tsx` 在 devDependencies 中，缺了无法构建。

### 3. 加载插件（开发/演示，推荐）

编辑 [cordis.yml](cordis.yml)，把占位路径替换为你的本机绝对路径：

```yaml
- insert:
    - id: ecommerce-analyst
      name: '/你的绝对路径/deepseek-harness-master/ecommerce-analyst-plugin/src/index.ts'
```

然后在 dsh 仓库根目录执行：

```sh
pnpm dsh web --patch ./ecommerce-analyst-plugin/cordis.yml
```

> 首次启动即内置企业演示数据（26 商品 + 480 订单：总览 ¥154,699 / 359 单 / 客单价 ¥430.92 / 退款率 10.6%，含逾期 43 笔、待发货 55 笔、低库存 8 件），开箱即可演示。

### 4. 构建部署（生产 bundle）

**产物已随仓库提交，git 安装可直接加载，无需构建。** 通过 `git clone` 或

```sh
dsh plugin --profile web add git+https://github.com/zjyjhkf/ecommerce-harness-plugin-for-jianheng.git
```

获取本仓库后，`index.js` / `client.js` / `assets/data-center.html` 已在仓库根就位，加载阶段不执行任何构建。只有**改动 `src/` 源码后**才需要重新构建：

```sh
cd ecommerce-analyst-plugin
npm i              # 独立 clone 首次构建需要（esbuild 在 devDependencies）
npm run build      # 即 node scripts/build.mjs
```

> **默认输出目录 = 仓库根本身**：`index.js`（服务端 bundle）+ `client.js`（客户端 bundle）+ `assets/data-center.html` 直接写入仓库根并随仓库提交；仓库根 `package.json` 即部署清单（含 `dsh.bundle`/`dsh.client` 声明），`cordis.patch.yml` 也在仓库根，默认构建不向别处复制任何清单。

如需构建到仓库外目录（如独立的插件部署位），显式设置 `ECOM_PLUGIN_OUT`，**仅这种模式下**才会把 `package.json` / `cordis.patch.yml` / `README.md` 复制到输出目录，并把 `xlsx` 运行时必需文件复制到 `OUT/node_modules`：

```sh
ECOM_PLUGIN_OUT=/your/plugins/ecommerce-analyst-plugin npm run build
```

可选环境变量：

| 变量 | 作用 |
|---|---|
| `ECOM_PLUGIN_OUT` | 覆盖输出目录（默认 = 仓库根）。仅当指向仓库外目录时触发上述复制行为 |
| `ESBUILD_REQUIRE` | 指定 esbuild 包入口（esbuild 定位：此变量优先，其次本仓库 `node_modules`；两者都没有则直接报错，提示 `npm install -D esbuild`） |
| `ECOM_LINK_PEERS=1` | 在 `OUT/node_modules` 下为 `@deepseek-ai/*` 等 peer 包建立 junction。仅当 `ECOM_PLUGIN_OUT` 指向仓库外目录时才生效；**默认跳过**（防止误删真实 node_modules） |

---

## 附带技能包（skills）：安装与联合使用

仓库根目录 `skills/` 附带 7 个**跨境电商品类分析 skill**（DeepSeek Harness 标准 `.dsh` 技能格式，每个含一个 `SKILL.md`），与插件配套使用：**插件负责「取数」**（订单/销售/库存/中台数据），**skills 负责「决策」**（选品/竞品/关键词/Listing/广告/评论的经营判断）。

### 1. 技能包内容

| skill | 用途 | 典型触发问题 |
| --- | --- | --- |
| `market-opportunity` | 市场容量/趋势/竞争/进入门槛评估 | 「这个类目值不值得做」「怎么切入」 |
| `competitor-analysis` | 识别核心竞品，价格/评分/评论/流量/广告 SWOT | 「竞品是谁」「对标某 ASIN/某店」 |
| `keyword-research` | 挖词、评估搜索量/竞争度，输出埋词方案 | 「挖词/选词」「用户搜什么词」 |
| `listing` | 标题/五点/描述/图片/A+ 优化，埋词提转化 | 「优化 Listing」「为什么转化差」 |
| `ad-traffic` | 广告结构与流量分析，降 ACOS、预算分配 | 「广告效果」「怎么降 ACOS」 |
| `review-insight` | 从评论挖掘好评卖点/差评痛点/改进机会 | 「评价怎么样」「评论里发现了什么」 |
| `comprehensive-research` | 跨市场/竞品/关键词/评论/广告/Listing 的端到端综合研究 | 「帮我把这个品/店/类目系统分析一遍」 |

### 2. 安装到本地 dsh

把 `skills/` 下各 skill 目录合并进 dsh 的技能装载目录（不存在则自动新建）：

```sh
# Linux / macOS
mkdir -p ~/.dsh/skills
cp -r skills/* ~/.dsh/skills/

# Windows（PowerShell）
$dst = "$env:USERPROFILE\.dsh\skills"
New-Item -ItemType Directory -Force -Path $dst
Copy-Item "skills\*" $dst -Recurse -Force
```

> 或直接放入 dsh 项目内：把 `skills/` 下 7 个目录复制到 `<dsh项目根>/.dsh/skills/` 即可。重启 dsh（`pnpm dsh web`）后技能即生效。

### 3. 与 ecommerce-analyst-plugin 联合使用

插件与 skills 形成「数据 → 洞察 → 决策」闭环：

1. **插件取数**：启动 `ecommerce-analyst-plugin` 后，用对话或「店铺工作台」完成订单/销售/库存管理，或导入月度/周度复盘 Excel，进入数据中台；
2. **导出数据**：用 `ecommerce_export_csv` 把商品/订单导出为 UTF-8 CSV（带 BOM，Excel 可直接打开）；
3. **喂给 skills**：把 CSV / 中台面板数据作为输入交给对应 skill，输出经营结论——
   - `market-opportunity`：用销量/类目分布判断该细分市场是否值得进入；
   - `competitor-analysis`：结合订单中的在售商品与价格带，做竞品对比与差异化定位；
   - `keyword-research` / `listing`：从销售 TOP 商品提炼关键词与卖点，优化标题/五点；
   - `ad-traffic`：用订单退款率/客单价定位广告浪费点，给出降 ACOS 建议；
   - `review-insight`：对评论类商品做卖点/痛点挖掘，反哺选品与售后；
   - `comprehensive-research`：汇总以上为一份可执行经营决策报告。

**典型流水线**：`market-opportunity`（选类目）→ `keyword-research`（选词）→ `competitor-analysis`（看对手）→ `listing`（写页面）→ `ad-traffic`（控广告）→ `review-insight`（盯反馈）→ `comprehensive-research`（出决策报告）。

---

## 功能一览

| 模块 | 工具 | 说明 |
|---|---|---|
| 📦 商品查询 | `product_list` | 商品查询筛选（只读；商品数据由导入/平台 API 决定，无手动增删改查） |
| 🧾 订单处理 | `order_list` / `order_stats` / `order_update_status` / `order_ship` / `order_refund` | 订单查询统计、状态流转（含合法性校验）、发货、退款 |
| 📊 销售数据分析 | `stats_overview` / `stats_trend` / `stats_top_products` / `stats_category` | 经营总览、趋势、TOP 排行、类目分布 |
| ⚠️ 库存预警 | `inventory_low_stock` / `inventory_suggest` | 低库存清单、补货建议（近 30 天销量 × 1.5） |
| 💾 数据备份 | `ecommerce_export_backup` / `ecommerce_import_backup` | JSON 备份导出/导入恢复 |
| 📥 表格导入 | `ecommerce_import_excel` | CSV/JSON 表格数据整体导入，字段级校验失败返回「行号/字段/原因」明细 |
| 💬 规则问答 | `ecommerce_qa` | 高频经营问题直接命中规则返回确定性答案（与统计工具同口径） |
| 📄 CSV 导出 | `ecommerce_export_csv` | 商品/订单导出 UTF-8 CSV（带 BOM，Excel 可直接打开） |
| 🔄 数据源切换 | `ecommerce_set_mode` / `ecommerce_reset_demo` | 演示数据 / 导入数据 / 平台 API 显式切换；一键重置演示数据（先备份） |

## 月度/周度复盘导入 + 数据中台（核心新能力）

插件内置「电商数据中台」，把电商平台导出的**月度表（4 份 Excel）** 与**周度数据（3 份 Excel）** 解析成经营分析面板：

- **月度复盘（30/60 天「月复盘」）**：一次性导入 4 份 Excel —— 三份「商品排名导出」（平台货品/系统货品/系统规格）+ 一份「利润表」。
- **周复盘（7 天「周复盘」）**：导入 3 份「商品排名导出」（平台货品/系统货品/系统规格）。
- **周期严格隔离**：7 天与 30 天数据分开存放与展示。**只导入 7 日周数据时，30 天面板保持为空**（不插入数据就不显示对应面板）；反之亦然。
- **数据评价**：对导入数据自动生成一句 40~80 字 AI 经营评价（销售额/产品/推广/退款四角度），AI 不可用时回退规则模板。
- **入口**：侧边栏「店铺工作台」→ 导入 Excel 文件 → 全屏「数据中台」面板（iframe 加载 `/ecommerce-api/data-center`）。

导入的月度/周度文件格式（列名/元数据行）由插件固定识别；同格式不同内容的文件插入后，面板即展示对应内容。

## 桌面端侧边栏「店铺工作台」

> 打开方式：**侧边栏模块启动**（better-sidebar 标签页 / 右侧悬浮「驾驶舱」按键 / shell.overlay 兜底），不再依赖对话顶部。

- 经营总览卡片（销售额/订单量/客单价/退款率）｜ 今日待办（逾期红置顶/待发货/低库存）
- 商品分类树（点击筛选）｜ 销售排行 TOP5 ｜ 低库存预警清单（可展开）
- 行动清单 dock（逾期/待发货/低库存 → 待办 N 项 · 今天到期 N · 紧急 N）
- 一页经营简报（Markdown 一键复制）｜ 数据导入（CSV/Excel/SQL/PDF/JSON）｜ 数据源切换｜ 数据中台全屏面板
- 数据全部来自同一 `EcommerceStore` 统计口径（`/ecommerce-api` 只读接口），与工具结果完全一致

## 快速开始：对话示例

- 「帮我查一下今天的经营总览」
- 「把库存低于 10 的商品列出来」
- 「给订单 ORD-20260810-007 发货，运单号 SF123，顺丰」
- 「统计 8 月份的销售趋势」
- 「哪个商品卖得最好？」

### 导入 Excel 表格数据

`ecommerce_import_excel` 支持把 Excel 导出的 CSV（或 JSON 行数组）整体导入商品与订单：

- 商品表头（支持中文别名）：`sku/商品编码, name/商品名称, category/类目, price/售价, stock/库存, status/状态(在售|下架)`
- 订单表头（支持中文别名）：`order_id/订单号, buyer/买家, sku/商品编码, product_name/商品名称, quantity/数量, amount/金额, status/状态, created_at/下单时间`
- 导入前自动备份当前数据；导入后「店铺工作台」侧边栏与统计工具立即反映新数据（同一 Store）

### 对接真实电商平台（rest 模式）

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
# 单元测试（106 项：状态机、统计口径、库存预警、持久化、工具注册、周期隔离、导出接口、入口冒烟、UI 完整性）
pnpm --dir ecommerce-analyst-plugin test

# 端到端测试（生成物理 Excel 测试文件 → 导入/导出/分析 → 自动清理）
node --import tsx scripts/e2e-test.ts

# 模拟多组数据渲染（3 组月度 + 3 组周度，验证「同格式不同内容 → 不同面板」）
node --import tsx scripts/simulate-import.ts
```

> 说明：`typecheck` 脚本依赖仓库根 `node_modules/typescript`（workspace 提升），在独立 clone 下可能因路径不一致而失败；类型正确性以 `pnpm test`（tsx 类型擦除执行）+ `scripts/build.mjs`（esbuild）为准。

## 架构

```
src/
├── index.ts              # 插件入口：适配器→Store→工具注册→「今天要处理」提示
├── config.ts             # 配置 Schema（schemastery）
├── types.ts              # 领域类型 + 订单状态机 + 金额分位工具
├── store.ts              # 数据仓库：统计口径 / 库存预警 / 持久化 / 报表合并（无手动商品增删改查）
├── import-parse.ts       # 数据导入解析（CSV/JSON/Excel/SQL/PDF）
├── monthly-report.ts     # 月度复盘解析（「商品排名导出」×3 + 「利润表」）
├── weekly-report.ts      # 周复盘解析（「商品排名导出」×3）
├── data-center.ts        # 电商数据中台（全屏 HTML + echarts 内联）
├── data-evaluation.ts    # 数据评价（AI/规则四角度 40~80 字）
├── shop-api.ts           # /ecommerce-api 只读 JSON 接口 + 导入/导出/中台页面
├── csv-util.ts           # CSV 导出（UTF-8 BOM）
├── platform/
│   ├── adapter.ts        # PlatformAdapter 接口 + 适配器工厂
│   ├── mock.ts           # 示例数据适配器（默认，只读）
│   └── rest.ts           # 通用 REST 电商平台适配器
├── assets/
│   └── data-center.html  # 数据中台前端（内联 echarts，自包含）
└── tools/
    ├── products.ts       # 商品查询工具集（只读）
    ├── orders.ts         # 订单处理工具集
    ├── stats.ts          # 数据分析工具集
    ├── inventory.ts      # 库存预警工具集
    ├── backup.ts         # 数据备份工具集
    └── json.ts           # 输出类型适配
data/seed.json            # 预置示例数据（26 商品 / 480 订单）
tests/                    # 106 项单元测试
docs/functional-spec.md   # 功能规范文档
```

## 设计要点

- **数据来源唯一**：商品/订单由「导入」或「平台 API」决定，无手动增删改查，杜绝导入后残留演示数据
- **周期隔离**：月度（30 天）与周度（7 天）复盘分库存储，互不串数据；只导入 7 天数据则 30 天面板为空
- **统计口径统一**：销售额 = 已支付订单（paid/shipped/completed）实付金额；退款率 = 退款单/总单
- **金额精度**：内部整数分位运算，杜绝浮点误差（¥0.1+0.2 = ¥0.3）
- **状态机约束**：`pending→paid→shipped→completed`，`paid/shipped→refunded`，`pending→cancelled`，非法流转报错
- **「今天要处理」置顶**：系统提示动态注入今日待办（逾期订单/待发货/低库存），模型开聊即知
- **数据安全**：本地 JSON 持久化 + 导出/导入备份 + 恢复前自动快照

## 兼容性

- dsh 版本：`0.1.1-rc.2`
- Node.js：≥ 22.19
- 零外部运行时依赖（仅 peer 依赖 dsh 内置包；`xlsx`/`pdfjs-dist` 为导入解析可选依赖）
