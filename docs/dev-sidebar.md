# 「店铺工作台」侧边栏 — 二次开发说明

> 目标：为 ecommerce-analyst-plugin 新增桌面端侧边栏 UI（dsh 客户端插件机制），
> 复用现有 Store 统计口径，不破坏官方侧边栏与 20 个工具。

## 一、改动清单

### 服务端（数据 API，复用 Store）
| 文件 | 改动 |
|---|---|
| `src/index.ts` | `inject` 增加 `webServer`；工具注册后调用 `registerShopApi`，路由随插件 fiber 卸载 |
| `src/shop-api.ts` | **新增**：`/ecommerce-api` 前缀路由（只读 JSON）+ `buildSnapshot()` 快照构建 |
| `src/store.ts` / `src/tools/*` | **未改动**——API 直接调用既有 `overview() / todayActions() / lowStock() / topProducts() / categoryDistribution() / listProducts()`，口径与 stats_*/inventory_* 工具一致 |

### 客户端（侧边栏面板）
| 文件 | 说明 |
|---|---|
| `src/client/index.tsx` | 客户端入口：`inject=['slots']`，`apply` 注入样式 + 注册 `shell.overlay` entry（id `ecommerce-shop-desk`，order 110） |
| `src/client/ShopDeskPanel.tsx` | 面板组件：开关按钮 + 可折叠面板 + 五大区块；`Boundary` 错误边界 |
| `src/client/data.ts` | 快照类型 + `fetch` 封装（`/ecommerce-api/snapshot`、`/ecommerce-api/products`）+ 格式化工具 |
| `src/client/styles.ts` | 内联 CSS（`esd-` 前缀防冲突，dsh 主题 token + 回退值，幂等注入） |

### 构建与部署
| 文件 | 说明 |
|---|---|
| `scripts/build.mjs` | esbuild 打包服务端 `index.js`（ESM，external `@deepseek-ai/*`、`node:*`）与客户端 `client.js`（CJS，external `react`，`window.__ModuleLoader__.load` 包裹）；**默认输出仓库根**（`index.js` / `client.js` / `assets/` 随仓库提交，git 安装开箱即用），不再另写部署 `package.json` |
| `scripts/verify-snapshot.mts` | **新增**：验收数据校验脚本（对照企业数据口径） |
| `package.json`（仓库根，即部署清单） | 源码清单增加 `build` 脚本；部署声明 `exports["./client"]` + `dsh.client { platform: 'web', inject: [] }` + `dsh.bundle` 均在此文件 |
| `client.js`（仓库根） | **新增**：客户端 bundle（与 index.js 并列，默认构建产物直接入库） |

## 二、挂载方案（不破坏官方侧边栏）

- 已核实 `packages/client/ui-layout`：`sidebar` 为 single 插槽且被官方 ui-sidebar 占用 → **不注册替换**。
- 采用「叠加式」：注册到 `shell.overlay`（list 插槽，scope root，可多 entry 叠加——dsh-office 同款机制）。
- 面板以 `position: fixed` 悬浮于视图右侧，官方会话列表（左侧）与既有 20 个工具完全不受影响。
- 宿主 `shell.overlay` 容器默认点击穿透；面板/开关节点 `pointer-events: auto` 自行接收事件。

## 三、组件结构

```
ShopDeskPanel (shell.overlay entry, order 110)
├── Boundary（错误边界，面板渲染失败不影响宿主）
├── .esd-toggle 右侧竖排悬浮开关（带逾期红点徽标）
└── .esd-panel（fixed 右侧 340px，可折叠）
    ├── header：标题 + 数据模式徽标 + 刷新/收起
    ├── body
    │   ├── OverviewSection   经营总览（销售额/订单量/客单价/退款率 2×2 卡片）
    │   ├── TodoSection       今日待办（逾期红置顶可展开列表 / 待发货 / 低库存）
    │   ├── CategorySection   商品分类树（6 类，点击筛选 → 内联商品列表）
    │   ├── TopSection        销售排行 TOP5（金银铜 rank 色）
    │   └── LowStockSection   低库存预警清单（可展开，0 库存红色）
    └── footer：数据模式 + 更新时间
```

## 四、数据流（与工具结果一致）

```
客户端                           服务端                        Store（唯一数据源）
mount / 打开 / 60s 定时 / 手动刷新
   │  GET /ecommerce-api/snapshot
   ├──────────────────────────→ registerShopApi
   │                              └─ buildSnapshot(store)
   │                                  ├─ store.overview()            ← stats_overview
   │                                  ├─ store.todayActions()        ← 「今天要处理」
   │                                  ├─ store.lowStock()            ← inventory_low_stock
   │                                  ├─ store.topProducts({}, 5)    ← stats_top_products
   │                                  ├─ store.categoryDistribution()← stats_category_distribution
   │                                  └─ store.listProducts(...)     ← product_list
   │  { ok, value }  ←───────────────┘
   └─ 分类点击 → GET /ecommerce-api/products?category=X → 内联商品列表
```

客户端**不做任何二次统计**，只负责格式化展示；数字与模型通过工具得到的结果同源同口径。

## 五、v0.2.1 修复与增强（HTTP 问题根治）

- **inject 补齐 `tools`**：插件 `inject` 从 `['systemPrompt','webServer']` 改为
  `['systemPrompt','webServer','tools']`。真实 dsh 组合下 `ctx.tools.register`
  要求 `tools` 出现在 fiber inject 声明中，缺失会导致工具注册抛
  「cannot get property tools without inject」，插件初始化中断、`/ecommerce-api`
  路由永远不注册（客户端 fetch 拿到 SPA index.html）。修复后路由随插件正常注册。
- **apply 改为 async 直取服务**：不再依赖嵌套 `ctx.inject`，与 dsh-office 同款模式。
- **CORS + OPTIONS 预检**：`/ecommerce-api` 响应带 `access-control-allow-origin: *`，
  支持桌面端 file:// 页面跨源拉取。
- **API base 注入**：`webServer.tapIndex` 把 `window.__ECOM_API_BASE__` 写入 index.html，
  客户端优先使用（无需猜测端口），其次页面 origin，最后相对路径。
- **新增 `ecommerce_import_excel`**：CSV/JSON 表格数据整体导入（Excel 导出 CSV 直接可用），
  导入后面板与统计工具立即反映（同一 Store）。
## 六、构建与部署

```bash
cd deepseek-harness-master/ecommerce-analyst-plugin
npm install                # esbuild 来自 devDependencies
npm run build              # = node scripts/build.mjs
# 产出 index.js + client.js + assets/data-center.html → 仓库根（随仓库提交）
```

- **默认构建输出仓库根**：产物 `index.js` / `client.js` / `assets/` 直接写入仓库并提交入库；
  其他用户 `dsh plugin --profile web add git+<仓库地址>` 安装后开箱即用，pnpm 安装 git 依赖时不执行任何构建。
- 仓库根 `package.json` 即部署清单（含 `dsh.client.platform: "web"`、`./client` export 与 `dsh.bundle` 声明），
  默认构建**不再向输出目录另写/复制 `package.json`**；`cordis.patch.yml`、`README.md` 也在仓库根，无需复制。
- 客户端 bundle：`external: react`（宿主 module table 提供），零外部运行时依赖、无 CDN/字体；
  宿主 client-modules 按根清单自动发现该包、将 `client.js` 编入 `window.__DSH_BOOT__` 提供。
- **构建到仓库外（可选）**：仅当显式设置 `ECOM_PLUGIN_OUT=<仓库外目录>` 时才把根清单与
  `cordis.patch.yml` / `README.md` 复制到该目录，并复制 xlsx 运行时文件到其 `node_modules`：
  `ECOM_PLUGIN_OUT=/你的/plugins/ecommerce-analyst-plugin npm run build`（路径按本机替换）。
- **peer junction（默认关闭）**：`ECOM_LINK_PEERS=1` **且** `ECOM_PLUGIN_OUT` 指向仓库外目录时，
  才会在其 `node_modules` 下建立 `@deepseek-ai/*` 等 peer junction（服务于仓库外部署且向上解析不到 peer 的本机场景）；
  `OUT=仓库根` 时绝不执行，防止误删真实 `node_modules`。
- Profile 注册（无需改动）：把仓库根（或 `ECOM_PLUGIN_OUT` 部署目录）链接/安装进你本机 dsh profile
  （`<你的用户目录>/.dsh/profiles/web/package.json` 的 dependencies + bundles）即可，链接目录即部署目录，新文件自动可见。

## 七、如何验证（重启 DSH Desktop Hub 后）

1. 完全退出并重启 DSH Desktop Hub。
2. 右侧中部出现竖排「店铺」开关（有逾期红点徽标=43）；点击展开面板。
3. 经营总览应显示：销售额 **¥154,699.00** ｜ 订单量 **359 单** ｜ 客单价 **¥430.92** ｜ 退款率 **10.6%**。
4. 今日待办：逾期 **43** 笔（红色高亮置顶，可展开看订单号/买家/金额）；待发货 55；低库存 8。
5. 商品分类树 6 类可点击，选中分类内联展示商品（名称/价格/库存/上下架）。
6. 销售排行 TOP5 与 stats_top_products 一致；低库存清单 8 件可展开。
7. 官方左侧会话列表照常；对话中调用任意 product_*/order_*/stats_*/inventory_* 工具正常。
8. 窗口缩窄到 <900px：面板自动收起，开关保留；无 JS 报错（面板错误被 Boundary 兜底）。
9. 面板数据刷新：右上 🔄 手动刷新；打开期间每 60s 自动刷新。

## 七、已知存量问题（与本次改动无关）

- `tests/*.test.ts` 中的数值断言（如 2446 元/3 件低库存/ORD-20260726-001）是按**旧 mock 种子**
  编写的；当前 `data/seed.json` 已替换为企业数据（26 商品/480 订单），故多数旧断言失败。
  服务端逻辑本身经 `scripts/verify-snapshot.mts` 对照企业口径验证通过（¥154,699 / 359 / ¥430.92 / 10.6% / 逾期 43 / 低库存 8）。
