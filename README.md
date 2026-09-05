# ecommerce-analyst-plugin — 电商商单智能体插件

> 基于 DeepSeek Harness（dsh）插件体系开发的电商店铺数据分析智能体。
> 通过自然语言即可完成 **订单处理、销售数据分析、库存预警**，并支持 **Excel 月度/周度复盘数据导入与数据中台分析**。
>
> 商品/订单数据**完全由「数据导入」或「平台 API」决定**，不再提供手动增删改查工具（早期设计的单个商品增删改查/上下架功能已删除，避免与导入数据冲突）。

---

## 环境要求（Windows / Ubuntu 通用）

安装前请先满足以下依赖：

| 依赖 | 版本 / 要求 | 自检命令 | 说明 |
|---|---|---|---|
| Node.js | ≥ 22.19 | `node -v` | |
| git | 任意 | `git --version` | |
| pnpm | ≥ 9（**必须**，npm 不可替代） | `pnpm -v` | `dsh plugin` 依赖 pnpm 管理插件；缺失时先执行 `npm install -g pnpm` |
| DeepSeek Harness (dsh) | v0.1.1-rc.2 及以上（已在 0.1.2-rc.1 验证） | `dsh -V` | 全局安装或 `npx @deepseek-ai/dsh` 临时运行均可，命令写法见「方式一」 |

> 插件运行时依赖仅 `xlsx`（Excel 解析，导入必需）与 `pdfjs-dist`（PDF 导入，可选，缺失自动降级）。

---

## 为什么「下载完不能直接用」？

> **机制说明**：dsh 插件要经过三步才生效——
> ① **下载**（把代码放到本地文件夹）→ ② **安装**（`dsh plugin add` 注册进
> `~/.dsh/profiles/web/`，自动装齐运行依赖）→ ③ **重启**（`dsh web` 启动时加载，
> 此时才出现 logo / 工具 / 「数据查看」入口与「电商数据中台」面板）。
> **只下载不安装、只安装不重启，界面上都不会有任何变化。**

---

## 部署与配置（按操作系统）

### 方式一：git 一键安装（推荐，Windows / Ubuntu 通用）

> 仓库已内置构建产物 `index.js` / `client.js` / `assets/data-center.html`，
> 安装时不执行任何构建，**开箱即用**。
>
> 源地址二选一（内容一致）：
> - GitHub：`https://github.com/zjyjhkf/ecommerce-harness-plugin-for-jianheng.git`
> - Gitee 镜像：`https://gitee.com/zjy041213/ecommerce-harness-plugin-for-jianheng.git`

**前置**：确认 pnpm 可用（`dsh plugin` 依赖它，缺失会报 `pnpm not found`）：

```sh
pnpm -v || npm install -g pnpm
```

**A. 已全局安装 dsh（终端可直接执行 `dsh`）** —— Windows PowerShell 与 Ubuntu bash 命令一致：

```sh
dsh plugin --profile web add git+https://github.com/zjyjhkf/ecommerce-harness-plugin-for-jianheng.git
# Gitee 源：
# dsh plugin --profile web add git+https://gitee.com/zjy041213/ecommerce-harness-plugin-for-jianheng.git
```

**B. dsh 由 `npx` / `npm exec` 临时运行（PATH 上没有 `dsh` 命令）**

> ⚠️ 不要写成 `npm exec @deepseek-ai/dsh plugin --profile web ...`：
> npm 会把 `--profile` 当成自己的参数吞掉（报 `Unknown cli config "--profile"`）导致命令不执行。
> 用下面两种写法之一：

```sh
# 写法 1：用 `--` 分隔，告诉 npm 后面的参数全部交给 dsh
npm exec --package @deepseek-ai/dsh -- dsh plugin --profile web add git+https://gitee.com/zjy041213/ecommerce-harness-plugin-for-jianheng.git

# 写法 2（最稳）：直接调用 npx 缓存里的 dsh 可执行文件
~/.npm/_npx/*/node_modules/.bin/dsh plugin --profile web add git+https://gitee.com/zjy041213/ecommerce-harness-plugin-for-jianheng.git
```

**C. 使用本地已 clone 的目录安装（二次开发场景）**

```sh
git clone https://gitee.com/zjy041213/ecommerce-harness-plugin-for-jianheng.git ~/dsh-plugin
ls ~/dsh-plugin   # 自检：必须能看到 package.json / index.js / client.js —— 空目录说明 clone 失败，先解决下载
dsh plugin --profile web add file:/home/<你的用户名>/dsh-plugin   # 务必用绝对路径
```

安装位置（自动生成，无需手动修改）：

| 系统 | Profile 目录 |
|---|---|
| Windows | `C:\Users\<你的用户名>\.dsh\profiles\web\` |
| Ubuntu | `~/.dsh/profiles/web/` |

**安装成功的判定**（二选一）：

```sh
# 1) 查看 profile 清单：dependencies 与 dsh.profile.bundles 中应出现 ecommerce-analyst-plugin
cat ~/.dsh/profiles/web/package.json
# 2) 组合配置校验：应能看到 "# == ecommerce-analyst-plugin" 层
dsh --profile web --dump-config | grep -A3 ecommerce
```

**最后一步（必须）**：**完全退出**正在运行的 dsh（终端 Ctrl+C；重启前确认端口已释放，
`ss -ltn | grep 3080` 应无输出，否则会报端口占用），然后重新启动：

```sh
dsh web        # 或你平时启动 GUI 的命令（如 npm exec @deepseek-ai/dsh web）
```

> 为什么必须重启：dsh 在**进程启动时**组合加载插件 bundle（服务端工具 + 客户端
> logo/面板）。**刷新网页、重开对话都不会触发加载**，只有重启进程才会生效。

### 方式二：源码克隆 + 开发模式（二次开发 / 本地联调）

仅当需要改动 `src/` 源码并本地联调时使用。先克隆到 dsh 仓库内，再编辑 [cordis.yml](cordis.yml) 的 `name` 占位路径，替换为本机绝对路径。

> ⚠️ **普通用户请勿使用本方式，也不要修改/引用 `cordis.yml`。**
> 该文件的 `name` 是开发模式占位路径（`/absolute/path/to/...`），未经替换直接 `--patch` 会加载失败。
> 日常安装请用「方式一」——它自动使用 `cordis.patch.yml`，无需手动编辑任何清单。

#### Windows

```powershell
cd E:\dsh\deepseek-harness-master
git clone https://github.com/zjyjhkf/ecommerce-harness-plugin-for-jianheng.git ecommerce-analyst-plugin
# 编辑 ecommerce-analyst-plugin\cordis.yml，把 name 改为（示例，按本机路径替换）：
#   name: 'E:\dsh\deepseek-harness-master\ecommerce-analyst-plugin\src\index.ts'
pnpm install
pnpm dsh web --patch ./ecommerce-analyst-plugin/cordis.yml
```

#### Ubuntu

```bash
cd ~/deepseek-harness-master
git clone https://github.com/zjyjhkf/ecommerce-harness-plugin-for-jianheng.git ecommerce-analyst-plugin
# 编辑 ecommerce-analyst-plugin/cordis.yml，把 name 改为（示例，按本机路径替换）：
#   name: '/home/<你的用户名>/deepseek-harness-master/ecommerce-analyst-plugin/src/index.ts'
pnpm install
pnpm dsh web --patch ./ecommerce-analyst-plugin/cordis.yml
```

> 默认运行在**示例数据模式**（mock），内置一套 26 商品 / 480 订单的示例数据，可先通过对话工具（`product_list` / `order_list` / `stats_overview` / `inventory_low_stock` 等）体验取数与统计，再按「对接真实电商平台」章节切换到真实数据。

### 方式三：源码构建（仅在改动 src/ 后需要）

独立 clone（不在 dsh workspace 内）首次构建需先安装 dev 依赖，Windows / Ubuntu 命令一致：

```sh
cd ecommerce-analyst-plugin
npm install        # 安装 esbuild / tsx（在 devDependencies 中）
npm run build      # = node scripts/build.mjs
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

## 验证安装（Windows / Ubuntu 通用）

重启 dsh 后，按以下顺序确认各功能可用：

1. **侧边栏入口**：右侧底部出现「数据查看」圆形按钮，点击展开面板。
2. **电商数据中台面板**：面板标题为「电商数据中台」，工具栏含 全屏 / 导出 / 导入 / 刷新 四个按键，主体为数据中台 iframe。
3. **数据导入 + 复盘**：点击「📥 导入」选择月度（4 份 Excel）/ 周度（3 份「商品排名导出」）文件 → 数据中台显示对应复盘内容；**连续导入同口径两期后**出现「数据对比」结果（第一期仅显示「暂无上一期」引导）。
4. **工具**：对话中调用任意 `product_list` / `order_list` / `order_stats` / `stats_overview` / `inventory_low_stock` / `ecommerce_import_excel` / `ecommerce_export_csv` / `ecommerce_qa` / `ecommerce_compare` 正常返回。
5. **技能**：直接 `/keyword-research`、`/market-opportunity` 等 7 个技能可调用；会话输入框下方技能条（打开面板后显示）点击任一技能按钮，命令 `/slug` 会**直接送入当前会话**（若直接发送不可用，则填入输入框并提示「回车发送」；均失败时给出可见提示并复制到剪贴板，绝不静默）（详见下方技能包章节）。

---

## 附带技能包（skills）：安装与联合使用

仓库根目录 `skills/` 附带 7 个**跨境电商品类分析 skill**（DeepSeek Harness 标准 `.dsh` 技能格式，每个含一个 `SKILL.md`）。插件加载时会**自动把这 7 个技能注册进 dsh 的技能目录**（`ctx.skills`），装完即可 `/keyword-research` 直接调用或让模型自动调用，**无需手动复制**。**插件负责「取数」**（订单/销售/库存/中台数据），**skills 负责「决策」**（选品/竞品/关键词/Listing/广告/评论的经营判断）。

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

### 2. 加载方式（自动注册，推荐）

插件在 `apply()` 阶段把 `skills/` 下 7 个技能注册进 dsh 的 `ctx.skills` 目录（provider 名 `ecommerce-analyst`，rank 600，不覆盖用户同名技能）。因此 **`dsh plugin add` / 加载插件后即可直接使用**：

- **对话调用**：`/keyword-research`、`/market-opportunity` 等 `/name` 形式（7 个 slug 见上表）；
- **模型自动调用**：技能声明为 `modelInvocable`，模型可按需自动选中；
- **技能条按键**：会话框下方技能条的 7 个技能按键点击后发送 `/<slug>`，触发技能注入。

> 若使用较旧 dsh（无 `ctx.skills` 服务），插件会打印 warn 并跳过注册；此时仍可手动装载：把 `skills/` 下各目录复制到 `~/.dsh/skills/`（Linux/macOS）、`%USERPROFILE%\.dsh\skills`（Windows），或 `<dsh项目根>/.dsh/skills/` 后重启 dsh。

### 3. 与 ecommerce-analyst-plugin 联合使用

插件与 skills 形成「数据 → 洞察 → 决策」闭环：

1. **插件取数**：启动 `ecommerce-analyst-plugin` 后，用对话完成订单/销售/库存管理，或导入月度/周度复盘 Excel，进入数据中台；
2. **导出数据**：用 `ecommerce_export_csv` 把商品/订单导出为 UTF-8 CSV（带 BOM，Excel 可直接打开）；
3. **喂给 skills**：把 CSV / 中台面板数据作为输入交给对应 skill，输出经营结论——
   - `market-opportunity`：用销量/类目分布判断该细分市场是否值得进入；
   - `competitor-analysis`：结合订单中的在售商品与价格带，做竞品对比与差异化定位；
   - `keyword-research` / `listing`：从销售 TOP 商品提炼关键词与卖点，优化标题/五点；
   - `ad-traffic`：用订单退款率/客单价定位广告浪费点，给出降 ACOS 建议；
   - `review-insight`：对评论类商品做卖点/痛点挖掘，反哺选品与售后；
   - `comprehensive-research`：汇总以上为一份可执行经营决策报告。

**典型流水线**：`market-opportunity`（选类目）→ `keyword-research`（选词）→ `competitor-analysis`（看对手）→ `listing`（写页面）→ `ad-traffic`（控广告）→ `review-insight`（盯反馈）→ `comprehensive-research`（出决策报告）。

> 技能正文的「数据来源」已默认绑定插件自身工具（`product_list`、`stats_*`、`inventory_*`、`order_*`、`ecommerce_export_*` 及导入的月度/周度复盘）；外部采集器（`amz_*`/VOC/抖音/小红书等）降级为「可选，若已接入」，未接入时模型基于插件数据给出结论并标注信息缺口。

---

## 功能一览

| 模块 | 工具 | 说明 |
|---|---|---|
| 📦 商品查询 | `product_list` | 商品查询筛选（只读；商品数据由导入/平台 API 决定，无手动增删改查） |
| 🧾 订单处理 | `order_list` / `order_stats` / `order_update_status` / `order_ship` / `order_refund` | 订单查询统计、状态流转（含合法性校验）、发货、退款 |
| 📊 销售数据分析 | `stats_overview` / `stats_trend` / `stats_top_products` / `stats_category` | 经营总览、趋势、TOP 排行、类目分布 |
| 🔀 数据对比 | `ecommerce_compare` | 连续导入两期月度/周度复盘后，按层级对比 KPI 增减、排名位移（上一期自动归档） |
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
- **数据对比**：同口径**连续导入两期**（如两个月/两周）后，导入新周期自动归档上一期；侧边栏「数据对比」模块按层级/指标输出上期→本期 KPI、条形图、排行与名次位移（仅导一期显示「暂无上一期」引导）。
- **入口**：侧边栏「数据查看」按钮 → 打开「电商数据中台」面板 → 导入 Excel 文件（iframe 加载 `/ecommerce-api/data-center`）。

导入的月度/周度文件格式（列名/元数据行）由插件固定识别；同格式不同内容的文件插入后，面板即展示对应内容。

## 桌面端侧边栏「电商数据中台」

> 打开方式：右侧底部「数据查看」圆形入口（`sidebar.footer.action`）点击展开面板；面板以 `conversation.view` 标签页形态呈现，`shell.overlay` 兜底。早期「店铺工作台 / BI 看板」（经营总览卡片、今日待办、商品分类树、销售排行、低库存清单、行动清单、一页简报、数据源切换）已随 v0.3.2 移除，面板现在只承载「电商数据中台」。

- **唯一主体**：电商数据中台 iframe（`/ecommerce-api/data-center`），展示导入的月度/周度复盘与数据对比
- **工具栏**：全屏浏览 / 导出 CSV / 导入本地数据（CSV/Excel/SQL/PDF/JSON）/ 刷新
- **数据联动**：导入 Excel 后 postMessage 通知 iframe 刷新，面板随导入数据动态更新；点击中台内商品名可唤起「链接预警分析」
- 数据一律来自导入的 Excel 复盘报表（月度/周度），无内置演示面板

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
- 导入前自动备份当前数据；导入后数据中台面板与统计工具立即反映新数据（同一 Store）

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
# 单元测试（116 项：状态机、统计口径、库存预警、持久化、工具注册、周期隔离、导出接口、入口冒烟、UI 完整性、数据对比引擎）
pnpm --dir ecommerce-analyst-plugin test

# 端到端测试（生成物理 Excel 测试文件 → 导入/导出/分析 → 自动清理）
node --import tsx scripts/e2e-test.ts

# 模拟多组数据渲染（3 组月度 + 3 组周度，验证「同格式不同内容 → 不同面板」）
node --import tsx scripts/simulate-import.ts

# 数据对比端到端（真实 Excel 为上期 + 本地 mutate 副本为本期 → 断言归档/对比/接口/视图 → 自动清理）
node --import tsx scripts/compare-test.ts
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
├── compare.ts            # 数据对比引擎（按层级对齐行、KPI 增减、排名位移，纯函数）
├── compare-payload.ts    # 对比接口负载组装（当前/上一期 → hasPrev/kinds/metrics/result）
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
    ├── compare.ts        # 数据对比工具（ecommerce_compare）
    └── json.ts           # 输出类型适配
data/seed.json            # 预置示例数据（26 商品 / 480 订单）
tests/                    # 116 项单元测试
docs/functional-spec.md   # 功能规范文档
```

## 设计要点

- **数据来源唯一**：商品/订单由「导入」或「平台 API」决定，无手动增删改查，杜绝导入后残留演示数据
- **周期隔离**：月度（30 天）与周度（7 天）复盘分库存储，互不串数据；只导入 7 天数据则 30 天面板为空
- **上一期归档**：导入新周期时自动把上一期归档（`previousXxxReport`）并持久化，供「数据对比」跨期对齐
- **统计口径统一**：销售额 = 已支付订单（paid/shipped/completed）实付金额；退款率 = 退款单/总单
- **金额精度**：内部整数分位运算，杜绝浮点误差（¥0.1+0.2 = ¥0.3）
- **状态机约束**：`pending→paid→shipped→completed`，`paid/shipped→refunded`，`pending→cancelled`，非法流转报错
- **「今天要处理」置顶**：系统提示动态注入今日待办（逾期订单/待发货/低库存），模型开聊即知
- **数据安全**：本地 JSON 持久化 + 导出/导入备份 + 恢复前自动快照

## 兼容性

- dsh 版本：`0.1.1-rc.2` 及以上（已在 `0.1.2-rc.1` 验证）
- Node.js：≥ 22.19
- 零外部运行时依赖（仅 peer 依赖 dsh 内置包；`xlsx`/`pdfjs-dist` 为导入解析可选依赖）

## 安装失败排查

| 报错 / 现象 | 原因 | 解决 |
|---|---|---|
| `dsh: pnpm not found on PATH`（exit 127） | 没装 pnpm，`dsh plugin` 硬依赖它 | `npm install -g pnpm` 后重试 |
| npm 输出 `Unknown cli config "--profile"` 或命令「没反应」 | `npm exec` 把 `--profile` 当自己的参数吞掉 | 用 `--` 分隔（见方式一 B）或直接调用 dsh 可执行文件绝对路径 |
| `dsh plugin add` 报找不到包 / 目录为空 | `file:` 指向的目录不存在或 clone 失败 | 重新 `git clone` 并用 `ls` 校验；路径用绝对路径 |
| 重启时报端口占用 / `EADDRINUSE` | 上一个 dsh 实例没退干净 | `Ctrl+C` 退出全部实例，`ss -ltn \| grep 3080` 无输出后再启动 |
| 安装成功但界面看不到插件 | 没有重启进程（刷新网页无效） | 完全退出后重新执行 `dsh web` |
| 不确定装没装上 | — | `cat ~/.dsh/profiles/web/package.json` 或 `dsh --profile web --dump-config \| grep -A3 ecommerce` |
