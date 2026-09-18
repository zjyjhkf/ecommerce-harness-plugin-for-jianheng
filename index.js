/**
 * ecommerce-analyst-plugin — 服务端 bundle（esbuild 构建）
 * 源码：deepseek-harness-master/ecommerce-analyst-plugin/src
 * 请勿直接编辑本文件；改动请回源码并运行 scripts/build.mjs
 */
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};

// src/platform/mock.ts
var mock_exports = {};
__export(mock_exports, {
  MockAdapter: () => MockAdapter,
  filterOrders: () => filterOrders,
  filterProducts: () => filterProducts
});
function filterProducts(products, filter) {
  let result = products;
  if (filter.category) {
    result = result.filter((p) => p.category === filter.category);
  }
  if (filter.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  if (filter.min_price !== void 0) {
    result = result.filter((p) => p.price >= (filter.min_price ?? 0));
  }
  if (filter.max_price !== void 0) {
    result = result.filter((p) => p.price <= (filter.max_price ?? Infinity));
  }
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(kw) || p.sku.toLowerCase().includes(kw)
    );
  }
  return result;
}
function filterOrders(orders, filter) {
  let result = orders;
  if (filter.status) {
    result = result.filter((o) => o.status === filter.status);
  }
  if (filter.date_from) {
    result = result.filter((o) => o.created_at.slice(0, 10) >= (filter.date_from ?? ""));
  }
  if (filter.date_to) {
    result = result.filter((o) => o.created_at.slice(0, 10) <= (filter.date_to ?? ""));
  }
  if (filter.min_amount !== void 0) {
    result = result.filter((o) => o.amount >= (filter.min_amount ?? 0));
  }
  if (filter.max_amount !== void 0) {
    result = result.filter((o) => o.amount <= (filter.max_amount ?? Infinity));
  }
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase();
    result = result.filter(
      (o) => o.buyer.toLowerCase().includes(kw) || o.order_id.toLowerCase().includes(kw) || o.product_name.toLowerCase().includes(kw)
    );
  }
  return result;
}
var MockAdapter;
var init_mock = __esm({
  "src/platform/mock.ts"() {
    "use strict";
    MockAdapter = class {
      name = "mock";
      readOnly = true;
      /** 深拷贝注入数据（缺省为空），避免 Store 写操作污染调用方持有的数组（测试隔离）。 */
      products;
      orders;
      constructor(seed) {
        this.products = seed ? structuredClone(seed.products) : [];
        this.orders = seed ? structuredClone(seed.orders) : [];
      }
      async listProducts(filter) {
        return filterProducts(this.products, filter);
      }
      async listOrders(filter) {
        return filterOrders(this.orders, filter);
      }
      writeDenied(operation) {
        throw new Error(
          `[\u793A\u4F8B\u6A21\u5F0F] \u4E0D\u652F\u6301\u300C${operation}\u300D\u5199\u64CD\u4F5C\u3002\u793A\u4F8B\u6570\u636E\u4E3A\u53EA\u8BFB\u6F14\u793A\uFF0C\u5982\u9700\u771F\u5B9E\u8BFB\u5199\uFF0C\u8BF7\u914D\u7F6E\u7535\u5546\u5E73\u53F0 API \u51ED\u8BC1\uFF08ecommerceAnalyst.platform.*\uFF09\u3002`
        );
      }
      async updateOrderStatus(_orderId, _status, _meta) {
        return this.writeDenied("\u66F4\u65B0\u8BA2\u5355\u72B6\u6001");
      }
    };
  }
});

// src/platform/rest.ts
var rest_exports = {};
__export(rest_exports, {
  RestAdapter: () => RestAdapter
});
var RestAdapter;
var init_rest = __esm({
  "src/platform/rest.ts"() {
    "use strict";
    RestAdapter = class {
      name = "rest";
      readOnly = false;
      baseUrl;
      token;
      appKey;
      appSecret;
      timeoutMs;
      constructor(config) {
        if (!config.baseUrl) {
          throw new Error("[RestAdapter] \u7F3A\u5C11 baseUrl\uFF0C\u8BF7\u914D\u7F6E ecommerceAnalyst.platform.baseUrl");
        }
        this.baseUrl = config.baseUrl.replace(/\/+$/, "");
        this.token = config.token || process.env.DSH_ECOM_TOKEN || "";
        this.appKey = config.appKey;
        this.appSecret = config.appSecret;
        this.timeoutMs = config.timeoutMs ?? 15e3;
      }
      /**
       * 平台签名钩子：各平台在此注入签名参数（如 sign / timestamp / nonce）。
       * 默认返回空签名参数；接入具体平台时覆盖。
       */
      signParams() {
        return {};
      }
      /** 统一请求入口：组装鉴权头 + 签名参数 + 超时 */
      async request(path, init) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
          const headers = {
            "content-type": "application/json",
            ...this.token ? { authorization: `Bearer ${this.token}` } : {},
            ...this.appKey ? { "x-app-key": this.appKey } : {},
            ...this.appSecret ? { "x-app-secret": this.appSecret } : {}
          };
          const url = new URL(this.baseUrl + path);
          for (const [k, v] of Object.entries(this.signParams())) {
            url.searchParams.set(k, v);
          }
          const res = await fetch(url, {
            ...init,
            headers: { ...headers, ...init?.headers ?? {} },
            signal: controller.signal
          });
          if (!res.ok) {
            throw new Error(`[RestAdapter] ${path} \u8BF7\u6C42\u5931\u8D25\uFF1AHTTP ${res.status} ${res.statusText}`);
          }
          return await res.json();
        } finally {
          clearTimeout(timer);
        }
      }
      async listProducts(filter) {
        const params = new URLSearchParams();
        if (filter.category) params.set("category", filter.category);
        if (filter.status) params.set("status", filter.status);
        const data = await this.request(
          `/products?${params.toString()}`
        );
        return data.products ?? [];
      }
      async listOrders(filter) {
        const params = new URLSearchParams();
        if (filter.status) params.set("status", filter.status);
        if (filter.date_from) params.set("date_from", filter.date_from);
        if (filter.date_to) params.set("date_to", filter.date_to);
        const data = await this.request(
          `/orders?${params.toString()}`
        );
        return data.orders ?? [];
      }
      async updateOrderStatus(orderId, status, meta) {
        const data = await this.request(`/orders/${orderId}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status, ...meta })
        });
        return data.order;
      }
    };
  }
});

// src/index.ts
import { mkdirSync as mkdirSync2 } from "node:fs";
import { dirname as dirname5, join as join5 } from "node:path";
import { tmpdir } from "node:os";

// src/config.ts
import z from "@deepseek-ai/schemastery";
var Config = z.object({
  activation: z.union([z.const("silent"), z.const("active")]).default("silent"),
  platform: z.object({
    name: z.string().default("mock"),
    baseUrl: z.string().default(""),
    appKey: z.string().default(""),
    appSecret: z.string().default("")
  }),
  storage: z.object({
    // file：持久化路径；相对路径按插件自身目录解析（与 dsh 启动目录无关），绝对路径原样使用
    file: z.string().default("./data/store.json"),
    seedOnEmpty: z.boolean().default(true)
  }),
  inventory: z.object({
    lowStockThreshold: z.number().default(10)
  }),
  files: z.object({
    inboxDir: z.string().default("./data/files/inbox"),
    outboxDir: z.string().default("./data/files/outbox"),
    maxBytes: z.number().default(200 * 1024 * 1024)
  })
});
var defaultConfig = {
  activation: "silent",
  platform: { name: "mock", baseUrl: "", appKey: "", appSecret: "" },
  storage: { file: "./data/store.json", seedOnEmpty: true },
  inventory: { lowStockThreshold: 10 },
  files: {
    inboxDir: "./data/files/inbox",
    outboxDir: "./data/files/outbox",
    maxBytes: 200 * 1024 * 1024
  }
};

// src/paths.ts
import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
var MODULE_DIR = dirname(fileURLToPath(import.meta.url));
function findPluginRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, "package.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return start;
}
var PLUGIN_ROOT = findPluginRoot(MODULE_DIR);
function resolveStoreFile(raw) {
  if (raw === "") return resolve(PLUGIN_ROOT, "data", "store.json");
  if (isAbsolute(raw)) return raw;
  const cleaned = raw.replace(/^\.?\/?(?:ecommerce-analyst-plugin\/)+/, "");
  return resolve(PLUGIN_ROOT, cleaned);
}
function resolveDir(raw, fallback) {
  if (raw === "") return resolve(PLUGIN_ROOT, fallback);
  if (isAbsolute(raw)) return raw;
  const cleaned = raw.replace(/^\.?\/?(?:ecommerce-analyst-plugin\/)+/, "");
  return resolve(PLUGIN_ROOT, cleaned);
}

// src/store.ts
import { existsSync as existsSync2, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname as dirname2 } from "node:path";

// src/types.ts
var ORDER_TRANSITIONS = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "refunded"],
  shipped: ["completed", "refunded"],
  completed: [],
  refunded: [],
  cancelled: []
};
function toCents(amount) {
  return Math.round(amount * 100);
}
function fromCents(cents) {
  return cents / 100;
}
function isRevenueOrder(status) {
  return status === "paid" || status === "shipped" || status === "completed";
}

// src/weekly-report.ts
function toNum(v) {
  if (v === void 0 || v === null) return 0;
  const s = String(v).replace(/[,，¥￥%\s]/g, "").trim();
  if (!s || s === "-" || s === "\u2014" || s === "/" || s === "\u65E0") return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
function toRate(v) {
  if (v === void 0 || v === null) return 0;
  const s = String(v).replace(/[,，¥￥\s]/g, "").trim();
  if (!s || s === "-" || s === "\u2014" || s === "/" || s === "\u65E0") return 0;
  const hasPct = s.includes("%");
  const n = Number(s.replace(/%/g, ""));
  if (!Number.isFinite(n)) return 0;
  return hasPct ? n : n * 100;
}
function toRank(v) {
  const n = toNum(v);
  return n > 0 ? Math.round(n) : 0;
}
function periodSpanDays(period) {
  const m = String(period || "").match(/(\d{4})-(\d{2})-(\d{2})\s*[~～]\s*(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return 0;
  const [, y1, mo1, d1, y2, mo2, d2] = m;
  const t1 = (/* @__PURE__ */ new Date(`${y1}-${mo1}-${d1}T00:00:00Z`)).getTime();
  const t2 = (/* @__PURE__ */ new Date(`${y2}-${mo2}-${d2}T00:00:00Z`)).getTime();
  if (!Number.isFinite(t1) || !Number.isFinite(t2)) return 0;
  return Math.round((t2 - t1) / 864e5) + 1;
}
async function parseWeeklyRankExcel(buffer) {
  let xlsx;
  try {
    xlsx = await import("xlsx");
  } catch {
    return null;
  }
  const wb = xlsx.read(buffer, { type: "buffer", cellDates: true });
  const name2 = wb.SheetNames.find((n) => String(n).toLowerCase().includes("\u5546\u54C1\u6392\u540D")) ?? wb.SheetNames[0];
  if (!name2) return null;
  const ws = wb.Sheets[name2];
  if (!ws) return null;
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
  let subIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? [];
    if (r.some((c) => String(c ?? "").trim() === "\u9500\u552E\u989D")) {
      subIdx = i;
      break;
    }
  }
  if (subIdx < 1) return null;
  let period = "";
  let showForm = "";
  let shops = [];
  for (let i = 0; i < subIdx - 1; i++) {
    const r = rows[i] ?? [];
    const key = String(r?.[0] ?? "").trim();
    if (key === "\u65E5\u671F") period = String(r?.[1] ?? "").trim();
    else if (key === "\u5C55\u793A\u5F62\u5F0F") showForm = String(r?.[1] ?? "").trim();
    else if (key === "\u5E97\u94FA") {
      shops = String(r?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  if (periodSpanDays(period) >= 28) return null;
  const kind = showForm.includes("\u89C4\u683C") ? "systemSkus" : showForm.includes("\u5E73\u53F0") ? "platformLinks" : showForm.includes("\u8D27\u54C1") ? "systemProducts" : "platformLinks";
  const data = (i, row) => String(row[i] ?? "").trim();
  if (kind === "platformLinks") {
    const out2 = [];
    for (let r = subIdx + 1; r < rows.length; r++) {
      const row = rows[r] ?? [];
      if (!data(1, row) && !data(2, row)) continue;
      out2.push({
        shop: data(0, row),
        linkName: data(1, row),
        linkId: data(2, row),
        linkCode: data(3, row),
        linkTag: data(4, row),
        sales: toNum(row[5]),
        salesCount: toNum(row[6]),
        salesCost: toNum(row[7]),
        grossProfit: toNum(row[8]),
        grossMargin: toRate(row[9]),
        refundAmount: toNum(row[10]),
        refundRate: toRate(row[11]),
        returnRate: toRate(row[12]),
        netSales: toNum(row[13]),
        adSpend: toNum(row[14]),
        fullConv: toRate(row[15]),
        realConv: toRate(row[16]),
        views: toNum(row[17]),
        visitors: toNum(row[18]),
        favCount: toNum(row[19]),
        favRate: toRate(row[20]),
        cartCount: toNum(row[21]),
        cartQty: toNum(row[22]),
        cartRate: toRate(row[23]),
        orderCount: toNum(row[24]),
        orderQty: toNum(row[25]),
        orderRate: toRate(row[26]),
        payCount: toNum(row[27]),
        payQty: toNum(row[28]),
        payRate: toRate(row[29]),
        searchVisitors: toNum(row[30]),
        searchPayCount: toNum(row[31]),
        searchConv: toRate(row[32]),
        avgPrice: toNum(row[33])
      });
      if (out2.length >= 5e3) break;
    }
    return out2.length ? { kind, period, shops, platformLinks: out2 } : null;
  }
  if (kind === "systemProducts") {
    const out2 = [];
    for (let r = subIdx + 1; r < rows.length; r++) {
      const row = rows[r] ?? [];
      if (!data(0, row)) continue;
      out2.push({
        name: data(0, row),
        code: data(1, row),
        brand: data(2, row),
        category: data(3, row),
        sales: toNum(row[4]),
        grossProfit: toNum(row[5]),
        grossMargin: toRate(row[6]),
        refundRate: toRate(row[7]),
        returnRate: toRate(row[8]),
        netSales: toNum(row[9]),
        adSpend: toNum(row[10]),
        avgPrice: toNum(row[11]),
        singleRate: toRate(row[12])
      });
      if (out2.length >= 5e3) break;
    }
    return out2.length ? { kind, period, shops, systemProducts: out2 } : null;
  }
  const out = [];
  for (let r = subIdx + 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    if (!data(0, row) && !data(1, row)) continue;
    out.push({
      name: data(0, row),
      specName: data(1, row),
      code: data(2, row),
      brand: data(3, row),
      category: data(4, row),
      salesRank: toRank(row[5]),
      sales: toNum(row[6]),
      countRank: toRank(row[7]),
      salesCount: toNum(row[8]),
      salesCost: toNum(row[9]),
      profitRank: toRank(row[10]),
      grossProfit: toNum(row[11]),
      marginRank: toRank(row[12]),
      grossMargin: toRate(row[13]),
      refundAmount: toNum(row[14]),
      refundRate: toRate(row[15]),
      returnRate: toRate(row[16]),
      preShipRefundRate: toRate(row[17]),
      postShipRefundRate: toRate(row[18]),
      receivedRefundRate: toRate(row[19]),
      netSales: toNum(row[20]),
      netCost: toNum(row[21]),
      platformFee: toNum(row[22]),
      platformOperFee: toNum(row[23]),
      softwareFee: toNum(row[24]),
      adSpend: toNum(row[25]),
      offlineFee: toNum(row[26]),
      otherFee: toNum(row[27]),
      avgPrice: toNum(row[28])
    });
    if (out.length >= 5e3) break;
  }
  return out.length ? { kind, period, shops, systemSkus: out } : null;
}
function mergeWeekly(base, part) {
  const merged = base ?? {
    period: part.period,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    shops: part.shops ?? []
  };
  if (part.period) merged.period = part.period;
  if (part.shops && part.shops.length) merged.shops = part.shops;
  if (base && part.period && base.period && base.period !== part.period) {
    delete merged.platformLinks;
    delete merged.systemProducts;
    delete merged.systemSkus;
  }
  if (part.platformLinks) merged.platformLinks = part.platformLinks;
  if (part.systemProducts) merged.systemProducts = part.systemProducts;
  if (part.systemSkus) merged.systemSkus = part.systemSkus;
  merged.lastKind = part.kind;
  merged.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  return merged;
}

// src/monthly-report.ts
function toNum2(v) {
  if (v === void 0 || v === null) return 0;
  const s = String(v).replace(/[,，¥￥%\s]/g, "").trim();
  if (!s || s === "-" || s === "\u2014" || s === "/" || s === "\u65E0") return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
function toRate2(v) {
  if (v === void 0 || v === null) return 0;
  const s = String(v).replace(/[,，¥￥\s]/g, "").trim();
  if (!s || s === "-" || s === "\u2014" || s === "/" || s === "\u65E0") return 0;
  const hasPct = s.includes("%");
  const n = Number(s.replace(/%/g, ""));
  if (!Number.isFinite(n)) return 0;
  return hasPct ? n : n * 100;
}
function toRank2(v) {
  const n = toNum2(v);
  return n > 0 ? Math.round(n) : 0;
}
function periodSpanDays2(period) {
  const m = String(period || "").match(/(\d{4})-(\d{2})-(\d{2})\s*[~～]\s*(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return 0;
  const [, y1, mo1, d1, y2, mo2, d2] = m;
  const t1 = (/* @__PURE__ */ new Date(`${y1}-${mo1}-${d1}T00:00:00Z`)).getTime();
  const t2 = (/* @__PURE__ */ new Date(`${y2}-${mo2}-${d2}T00:00:00Z`)).getTime();
  if (!Number.isFinite(t1) || !Number.isFinite(t2)) return 0;
  return Math.round((t2 - t1) / 864e5) + 1;
}
function monthOf(period) {
  const m = String(period || "").match(/(\d{4}-\d{2})-\d{2}/);
  return m ? m[1] : "";
}
async function parseMonthlyRankExcel(buffer) {
  let xlsx;
  try {
    xlsx = await import("xlsx");
  } catch {
    return null;
  }
  const wb = xlsx.read(buffer, { type: "buffer", cellDates: true });
  const name2 = wb.SheetNames.find((n) => String(n).toLowerCase().includes("\u5546\u54C1\u6392\u540D")) ?? wb.SheetNames[0];
  if (!name2) return null;
  const ws = wb.Sheets[name2];
  if (!ws) return null;
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
  const hasSales = (r) => r.some((c2) => String(c2 ?? "").trim() === "\u9500\u552E\u989D");
  let subIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? [];
    if (!hasSales(r)) continue;
    if ([0, 1, 2].every((j) => String(r[j] ?? "").trim() === "")) {
      subIdx = i;
      break;
    }
  }
  if (subIdx === -1) {
    for (let i = 0; i < rows.length; i++) {
      if (hasSales(rows[i] ?? [])) {
        subIdx = i;
        break;
      }
    }
  }
  if (subIdx < 1) return null;
  let period = "";
  let showForm = "";
  let shops = [];
  for (let i = 0; i < subIdx - 1; i++) {
    const r = rows[i] ?? [];
    const key = String(r?.[0] ?? "").trim();
    if (key === "\u65E5\u671F") period = String(r?.[1] ?? "").trim();
    else if (key === "\u5C55\u793A\u5F62\u5F0F") showForm = String(r?.[1] ?? "").trim();
    else if (key === "\u5E97\u94FA") {
      shops = String(r?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  const spanDays = periodSpanDays2(period);
  if (spanDays >= 1 && spanDays < 28) return null;
  const kind = showForm.includes("\u89C4\u683C") ? "systemSkus" : showForm.includes("\u5E73\u53F0") ? "platformLinks" : showForm.includes("\u8D27\u54C1") ? "systemProducts" : "platformLinks";
  const data = (i, row) => String(row[i] ?? "").trim();
  const sub = rows[subIdx] ?? [];
  const colBy = (name3, fallback) => {
    const i = sub.findIndex((c2) => String(c2 ?? "").trim() === name3);
    return i >= 0 ? i : fallback;
  };
  const colNth = (name3, n, fallback) => {
    let seen = 0;
    for (let i = 0; i < sub.length; i++) {
      if (String(sub[i] ?? "").trim() === name3) {
        if (seen === n) return i;
        seen++;
      }
    }
    return fallback;
  };
  const head = subIdx >= 1 ? rows[subIdx - 1] ?? [] : [];
  const headCol = (name3, fallback) => {
    const i = head.findIndex((c2) => String(c2 ?? "").trim() === name3);
    return i >= 0 ? i : fallback;
  };
  if (kind === "platformLinks") {
    const id2 = {
      shop: headCol("\u5E97\u94FA", 0),
      linkName: headCol("\u94FE\u63A5\u540D\u79F0", 1),
      linkId: headCol("\u94FE\u63A5ID", 2),
      linkCode: headCol("\u94FE\u63A5\u7F16\u7801", 3),
      linkTag: headCol("\u94FE\u63A5\u6807\u7B7E", 4)
    };
    const c2 = {
      sales: colBy("\u9500\u552E\u989D", 5),
      salesCount: colBy("\u9500\u552E\u4EF6\u6570", 6),
      salesCost: colBy("\u9500\u552E\u6210\u672C", 7),
      grossProfit: colBy("\u6BDB\u5229\u989D", 8),
      grossMargin: colBy("\u6BDB\u5229\u7387", 9),
      refundAmount: colBy("\u9000\u6B3E\u91D1\u989D", 10),
      refundRate: colBy("\u9000\u6B3E\u7387", 11),
      returnRate: colBy("\u9000\u8D27\u6BD4\u4F8B", 12),
      netSales: colBy("\u51C0\u9500\u552E\u989D", 13),
      adSpend: colBy("\u63A8\u5E7F\u6295\u653E\u8D39\u7528", 14),
      fullConv: colBy("\u5168\u94FE\u8DEF\u652F\u4ED8\u8F6C\u5316\u7387", 15),
      realConv: colBy("\u771F\u5B9E\u652F\u4ED8\u8F6C\u5316\u7387\uFF08\u6263\u9664\u7279\u6B8A\u5355\uFF09", 16),
      views: colBy("\u6D4F\u89C8\u91CF", 17),
      visitors: colBy("\u8BBF\u5BA2\u6570", 18),
      favCount: colBy("\u6536\u85CF\u4EBA\u6570", 19),
      favRate: colBy("\u6536\u85CF\u7387", 20),
      cartCount: colBy("\u52A0\u8D2D\u4EBA\u6570", 21),
      cartQty: colBy("\u52A0\u8D2D\u4EF6\u6570", 22),
      cartRate: colBy("\u52A0\u8D2D\u7387", 23),
      orderCount: colBy("\u4E0B\u5355\u4EBA\u6570", 24),
      orderQty: colBy("\u4E0B\u5355\u4EF6\u6570", 25),
      orderRate: colBy("\u4E0B\u5355\u7387", 26),
      payCount: colBy("\u652F\u4ED8\u4EBA\u6570", 27),
      payQty: colBy("\u652F\u4ED8\u4EF6\u6570", 28),
      payRate: colBy("\u652F\u4ED8\u7387", 29),
      searchVisitors: colBy("\u641C\u7D22\u5F15\u5BFC\u8BBF\u5BA2\u6570", 30),
      searchPayCount: colBy("\u641C\u7D22\u5F15\u5BFC\u652F\u4ED8\u4EBA\u6570", 31),
      searchConv: colBy("\u641C\u7D22\u5F15\u5BFC\u652F\u4ED8\u8F6C\u5316\u7387", 32),
      avgPrice: colBy("\u5E73\u5747\u5355\u4EF7", 33)
    };
    const out2 = [];
    const GHOST_NUM = [
      "sales",
      "salesCount",
      "salesCost",
      "grossProfit",
      "refundAmount",
      "netSales",
      "adSpend",
      "views",
      "visitors",
      "favCount",
      "cartCount",
      "cartQty",
      "orderCount",
      "orderQty",
      "payCount",
      "payQty",
      "searchVisitors",
      "searchPayCount",
      "avgPrice"
    ];
    const ghost = {};
    let ghostCount = 0;
    for (let r = subIdx + 1; r < rows.length; r++) {
      const row = rows[r] ?? [];
      if (!data(id2.linkName, row) && !data(id2.linkId, row)) {
        ghostCount += 1;
        for (const k of GHOST_NUM) {
          const n = toNum2(row[c2[k]]);
          if (n !== 0) ghost[k] = (ghost[k] ?? 0) + n;
        }
        continue;
      }
      out2.push({
        shop: data(id2.shop, row),
        linkName: data(id2.linkName, row),
        linkId: data(id2.linkId, row),
        linkCode: data(id2.linkCode, row),
        linkTag: data(id2.linkTag, row),
        sales: toNum2(row[c2.sales]),
        salesCount: toNum2(row[c2.salesCount]),
        salesCost: toNum2(row[c2.salesCost]),
        grossProfit: toNum2(row[c2.grossProfit]),
        grossMargin: toRate2(row[c2.grossMargin]),
        refundAmount: toNum2(row[c2.refundAmount]),
        refundRate: toRate2(row[c2.refundRate]),
        returnRate: toRate2(row[c2.returnRate]),
        netSales: toNum2(row[c2.netSales]),
        adSpend: toNum2(row[c2.adSpend]),
        fullConv: toRate2(row[c2.fullConv]),
        realConv: toRate2(row[c2.realConv]),
        views: toNum2(row[c2.views]),
        visitors: toNum2(row[c2.visitors]),
        favCount: toNum2(row[c2.favCount]),
        favRate: toRate2(row[c2.favRate]),
        cartCount: toNum2(row[c2.cartCount]),
        cartQty: toNum2(row[c2.cartQty]),
        cartRate: toRate2(row[c2.cartRate]),
        orderCount: toNum2(row[c2.orderCount]),
        orderQty: toNum2(row[c2.orderQty]),
        orderRate: toRate2(row[c2.orderRate]),
        payCount: toNum2(row[c2.payCount]),
        payQty: toNum2(row[c2.payQty]),
        payRate: toRate2(row[c2.payRate]),
        searchVisitors: toNum2(row[c2.searchVisitors]),
        searchPayCount: toNum2(row[c2.searchPayCount]),
        searchConv: toRate2(row[c2.searchConv]),
        avgPrice: toNum2(row[c2.avgPrice])
      });
      if (out2.length >= 5e3) break;
    }
    if (ghostCount > 0) {
      out2.push({
        shop: "",
        linkName: `\uFF08\u65E0\u8EAB\u4EFD\u5360\u4F4D\u884C ${ghostCount} \u884C\xB7\u6570\u503C\u5DF2\u5E76\u5165\u5408\u8BA1\uFF09`,
        linkId: "",
        linkCode: "",
        linkTag: "",
        sales: ghost.sales ?? 0,
        salesCount: ghost.salesCount ?? 0,
        salesCost: ghost.salesCost ?? 0,
        grossProfit: ghost.grossProfit ?? 0,
        grossMargin: 0,
        refundAmount: ghost.refundAmount ?? 0,
        refundRate: 0,
        returnRate: 0,
        netSales: ghost.netSales ?? 0,
        adSpend: ghost.adSpend ?? 0,
        fullConv: 0,
        realConv: 0,
        views: ghost.views ?? 0,
        visitors: ghost.visitors ?? 0,
        favCount: ghost.favCount ?? 0,
        favRate: 0,
        cartCount: ghost.cartCount ?? 0,
        cartQty: ghost.cartQty ?? 0,
        cartRate: 0,
        orderCount: ghost.orderCount ?? 0,
        orderQty: ghost.orderQty ?? 0,
        orderRate: 0,
        payCount: ghost.payCount ?? 0,
        payQty: ghost.payQty ?? 0,
        payRate: 0,
        searchVisitors: ghost.searchVisitors ?? 0,
        searchPayCount: ghost.searchPayCount ?? 0,
        searchConv: 0,
        avgPrice: ghost.avgPrice ?? 0
      });
    }
    return out2.length ? { kind, period, month: monthOf(period), shops, platformLinks: out2 } : null;
  }
  if (kind === "systemProducts") {
    const id2 = {
      name: headCol("\u7CFB\u7EDF\u8D27\u54C1\u540D\u79F0", 0),
      code: headCol("\u8D27\u54C1\u7F16\u53F7", 1),
      brand: headCol("\u54C1\u724C", 2),
      category: headCol("\u5206\u7C7B", 3)
    };
    const c2 = {
      sales: colBy("\u9500\u552E\u989D", 4),
      grossProfit: colBy("\u6BDB\u5229\u989D", 5),
      grossMargin: colBy("\u6BDB\u5229\u7387", 6),
      refundRate: colBy("\u9000\u6B3E\u7387", 7),
      returnRate: colBy("\u9000\u8D27\u6BD4\u4F8B", 8),
      netSales: colBy("\u51C0\u9500\u552E\u989D", 9),
      adSpend: colBy("\u63A8\u5E7F\u6295\u653E\u8D39\u7528", 10),
      avgPrice: colBy("\u5E73\u5747\u5355\u4EF7", 11),
      singleRate: colBy("\u5355\u4EF6\u7387", 12)
    };
    const out2 = [];
    for (let r = subIdx + 1; r < rows.length; r++) {
      const row = rows[r] ?? [];
      if (!data(id2.name, row)) continue;
      out2.push({
        name: data(id2.name, row),
        code: data(id2.code, row),
        brand: data(id2.brand, row),
        category: data(id2.category, row),
        sales: toNum2(row[c2.sales]),
        grossProfit: toNum2(row[c2.grossProfit]),
        grossMargin: toRate2(row[c2.grossMargin]),
        refundRate: toRate2(row[c2.refundRate]),
        returnRate: toRate2(row[c2.returnRate]),
        netSales: toNum2(row[c2.netSales]),
        adSpend: toNum2(row[c2.adSpend]),
        avgPrice: toNum2(row[c2.avgPrice]),
        singleRate: toRate2(row[c2.singleRate])
      });
      if (out2.length >= 5e3) break;
    }
    return out2.length ? { kind, period, month: monthOf(period), shops, systemProducts: out2 } : null;
  }
  const id = {
    name: headCol("\u7CFB\u7EDF\u8D27\u54C1\u540D\u79F0", 0),
    specName: headCol("\u7CFB\u7EDF\u89C4\u683C\u540D\u79F0", 1),
    code: headCol("\u5546\u5BB6\u7F16\u7801", 2),
    brand: headCol("\u54C1\u724C", 3),
    category: headCol("\u5206\u7C7B", 4)
  };
  const c = {
    salesRank: colBy("\u6392\u540D\uFF08\u9500\u552E\u989D\uFF09", 5),
    sales: colBy("\u9500\u552E\u989D", 6),
    countRank: colBy("\u6392\u540D\uFF08\u9500\u552E\u4EF6\u6570\uFF09", 7),
    salesCount: colBy("\u9500\u552E\u4EF6\u6570", 8),
    salesCost: colBy("\u9500\u552E\u6210\u672C", 9),
    profitRank: colNth("\u6392\u540D", 0, 10),
    grossProfit: colBy("\u6BDB\u5229\u989D", 11),
    marginRank: colNth("\u6392\u540D", 1, 12),
    grossMargin: colBy("\u6BDB\u5229\u7387", 13),
    refundAmount: colBy("\u9000\u6B3E\u91D1\u989D", 14),
    refundRate: colNth("\u9000\u6B3E\u7387", 0, 15),
    returnRate: colBy("\u9000\u8D27\u6BD4\u4F8B", 16),
    preShipRefundRate: colNth("\u9000\u6B3E\u7387", 1, 17),
    postShipRefundRate: colNth("\u9000\u6B3E\u7387", 2, 18),
    receivedRefundRate: colNth("\u9000\u6B3E\u7387", 3, 19),
    netSales: colBy("\u51C0\u9500\u552E\u989D", 20),
    netCost: colBy("\u51C0\u9500\u552E\u6210\u672C", 21),
    adSpend: colBy("\u63A8\u5E7F\u6295\u653E\u8D39\u7528", 22),
    offlineFee: colBy("\u7EBF\u4E0B\u8D39\u7528", 23),
    otherFee: colBy("\u5176\u4ED6", 24),
    avgPrice: colBy("\u5E73\u5747\u5355\u4EF7", 25)
  };
  const out = [];
  for (let r = subIdx + 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    if (!data(id.name, row) && !data(id.specName, row)) continue;
    out.push({
      name: data(id.name, row),
      specName: data(id.specName, row),
      code: data(id.code, row),
      brand: data(id.brand, row),
      category: data(id.category, row),
      salesRank: toRank2(row[c.salesRank]),
      sales: toNum2(row[c.sales]),
      countRank: toRank2(row[c.countRank]),
      salesCount: toNum2(row[c.salesCount]),
      salesCost: toNum2(row[c.salesCost]),
      profitRank: toRank2(row[c.profitRank]),
      grossProfit: toNum2(row[c.grossProfit]),
      marginRank: toRank2(row[c.marginRank]),
      grossMargin: toRate2(row[c.grossMargin]),
      refundAmount: toNum2(row[c.refundAmount]),
      refundRate: toRate2(row[c.refundRate]),
      returnRate: toRate2(row[c.returnRate]),
      preShipRefundRate: toRate2(row[c.preShipRefundRate]),
      postShipRefundRate: toRate2(row[c.postShipRefundRate]),
      receivedRefundRate: toRate2(row[c.receivedRefundRate]),
      netSales: toNum2(row[c.netSales]),
      netCost: toNum2(row[c.netCost]),
      adSpend: toNum2(row[c.adSpend]),
      offlineFee: toNum2(row[c.offlineFee]),
      otherFee: toNum2(row[c.otherFee]),
      avgPrice: toNum2(row[c.avgPrice])
    });
    if (out.length >= 5e3) break;
  }
  return out.length ? { kind, period, month: monthOf(period), shops, systemSkus: out } : null;
}
async function parseStoreProfitExcel(buffer) {
  let xlsx;
  try {
    xlsx = await import("xlsx");
  } catch {
    return null;
  }
  const wb = xlsx.read(buffer, { type: "buffer", cellDates: true });
  const name2 = wb.SheetNames.find((n) => String(n).toLowerCase().includes("\u5229\u6DA6\u8868")) ?? wb.SheetNames[0];
  if (!name2) return null;
  const ws = wb.Sheets[name2];
  if (!ws) return null;
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i] ?? []).some((c) => String(c ?? "").trim() === "\u6838\u7B97\u9879\u76EE\u540D\u79F0")) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return null;
  const header = rows[headerIdx] ?? [];
  const storeCols = [];
  for (let c = 1; c < header.length; c++) {
    const s = String(header[c] ?? "").trim();
    if (s && s !== "\u5408\u8BA1") storeCols.push({ store: s, col: c });
  }
  if (!storeCols.length) return null;
  const metricKey = (m) => {
    const s = String(m ?? "").trim();
    if (s === "\u4E00\u3001\u9500\u552E\u6536\u5165") return "sales";
    if (s.includes("\u6B63\u5411\u9500\u552E\u6536\u5165")) return "positiveSales";
    if (s === "\u9000\u6B3E") return "refund";
    if (s === "\u56DB\u3001\u6BDB\u5229") return "grossProfit";
    if (s === "\u4E94\u3001\u9500\u552E\u6BDB\u5229\u7387") return "grossMargin";
    if (s === "\u516D\u3001\u4ED3\u5E93\u7269\u6D41\u8D39\u7528") return "logisticsCost";
    if (s === "\u4E03\u3001\u8FD0\u8425\u63A8\u5E7F\u8D39\u7528") return "promoCost";
    return null;
  };
  const acc = storeCols.map(({ store }) => {
    const row = { store };
    return row;
  });
  const isRate = (k) => k === "grossMargin";
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    const key = metricKey(String(r[0] ?? ""));
    if (!key) continue;
    storeCols.forEach(({ col }, si) => {
      const v = r[col];
      acc[si][key] = isRate(key) ? toRate2(v) : toNum2(v);
    });
  }
  const out = acc.map((s) => {
    const sales = Number(s.sales) || 0;
    const raw = Number(s.positiveSales) || 0;
    const positiveSales = sales;
    const rawDiffers = Math.abs(raw - sales) > 0.01;
    const effSales = sales > 0 ? sales : positiveSales;
    return {
      ...s,
      sales,
      positiveSales,
      ...rawDiffers ? { positiveSalesRaw: raw } : {},
      feeRatio: effSales > 0 ? Number(s.promoCost) / effSales * 100 : 0
    };
  }).filter((s) => (Number(s.sales) || 0) > 0 || (Number(s.positiveSales) || 0) > 0);
  return out.length ? out : null;
}
async function parseMonthlyReportExcel(buffer) {
  const rank = await parseMonthlyRankExcel(buffer);
  if (rank) return rank;
  const profit = await parseStoreProfitExcel(buffer);
  if (profit) {
    return {
      kind: "storeProfit",
      period: "",
      month: "",
      shops: profit.map((p) => p.store),
      storeProfit: profit
    };
  }
  return null;
}
function mergeMonthly(base, part) {
  const merged = base ?? {
    period: part.period,
    month: part.month,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    shops: part.shops ?? []
  };
  if (part.period) merged.period = part.period;
  if (part.month) merged.month = part.month;
  if (part.shops && part.shops.length) merged.shops = part.shops;
  if (base && part.period && base.period && base.period !== part.period) {
    delete merged.platformLinks;
    delete merged.systemProducts;
    delete merged.systemSkus;
    delete merged.storeProfit;
  }
  if (part.platformLinks) merged.platformLinks = part.platformLinks;
  if (part.systemProducts) merged.systemProducts = part.systemProducts;
  if (part.systemSkus) merged.systemSkus = part.systemSkus;
  if (part.storeProfit) merged.storeProfit = part.storeProfit;
  if (part.kind !== "storeProfit") merged.lastKind = part.kind;
  enforceNetSalesRule(merged);
  merged.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  return merged;
}
function enforceNetSalesRule(rep) {
  for (const l of rep.platformLinks ?? []) {
    l.netSales = (Number(l.sales) || 0) - (Number(l.refundAmount) || 0);
  }
  for (const s of rep.systemSkus ?? []) {
    s.netSales = (Number(s.sales) || 0) - (Number(s.refundAmount) || 0);
  }
}
function parseMonthlyReportJson(value) {
  if (value === null || typeof value !== "object") return null;
  const obj = value;
  const rep = Array.isArray(obj.monthlyReport) ? null : obj.monthlyReport;
  const src = rep && typeof rep === "object" ? rep : obj;
  if (!src || typeof src !== "object") return null;
  const has = (k) => Array.isArray(src[k]) && src[k].length > 0;
  if (!has("platformLinks") && !has("systemProducts") && !has("systemSkus") && !has("storeProfit")) {
    return null;
  }
  return {
    period: String(src.period ?? ""),
    month: String(src.month ?? monthOf(String(src.period ?? ""))),
    updatedAt: String(src.updatedAt ?? (/* @__PURE__ */ new Date()).toISOString()),
    shops: src.shops ?? [],
    lastKind: src.lastKind || void 0,
    platformLinks: src.platformLinks ?? [],
    systemProducts: src.systemProducts ?? [],
    systemSkus: src.systemSkus ?? [],
    storeProfit: src.storeProfit ?? []
  };
}

// src/store.ts
init_mock();
var todayStr = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
var EcommerceStore = class {
  adapter;
  /** 数据源模式：mock=示例模式（只读平台+本地演示），rest=真实平台 */
  sourceMode;
  products = [];
  orders = [];
  cfg;
  /** 数据来源模式：demo=演示数据（种子）/ imported=导入数据 / rest=平台 API */
  dataMode = "demo";
  /** 商品/订单各自的数据来源（demo=演示种子 / imported=用户导入或派生）：用于导入时
   *  判定「另一张表是否仍是演示数据」，从而决定是否清空/派生，避免演示数据残留。 */
  productsSource = "demo";
  ordersSource = "demo";
  /** 最近一次导入的数据快照（深拷贝），供「切换回导入数据」使用 */
  lastImported = null;
  /** 月度复盘（7月月度复盘.xlsx 导入）：30/60 天「月复盘」视图数据源 */
  monthlyReport = null;
  /** 周复盘（「周数据」三份「商品排名导出」导入，按展示形式合并）：7 天「周复盘」视图数据源 */
  weeklyReport = null;
  /** 上一期月度复盘（导入新周期时归档）：供「数据对比」用（上期 vs 本期）。随持久化保存/恢复，
   *  插件重启或重载后归档仍在，保证「两次导入之间进程被重建」也能继续对比。 */
  previousMonthlyReport = null;
  /** 上一期周复盘（导入新周期时归档）：同上 */
  previousWeeklyReport = null;
  /** 月度复盘多月份归档（按 period upsert，最多保留 12 个月）：供「数据对比」
   *  的月度趋势柱状/折线使用。连续导入越多个月份，趋势点越多。随持久化保存/恢复，
   *  「一键清除」连同本归档一起清空（清除后趋势与对比模块必须消失）。 */
  monthlyHistory = [];
  /** 报表数据单调递增版本号：任一报表（月/周）导入或替换即 +1，供前端判断「数据是否真正变化」，
   *  避免仅靠行数/周期这类粗粒度指纹漏掉「数值变化但行数相同」的插入更新。 */
  reportRevision = 0;
  constructor(adapter, cfg) {
    this.adapter = adapter;
    this.sourceMode = adapter.name === "mock" ? "mock" : "rest";
    this.cfg = cfg;
  }
  /** 初始化：加载持久化数据；为空时从适配器种子数据初始化 */
  async init() {
    if (this.cfg.seedOnEmpty && existsSync2(this.cfg.file)) {
      try {
        const raw = readFileSync(this.cfg.file, "utf8");
        const data = JSON.parse(raw);
        if (Array.isArray(data.products) && Array.isArray(data.orders)) {
          this.products = data.products;
          this.orders = data.orders;
          this.monthlyReport = data.monthlyReport ?? null;
          this.weeklyReport = data.weeklyReport ?? null;
          this.previousMonthlyReport = data.previousMonthlyReport ?? null;
          this.previousWeeklyReport = data.previousWeeklyReport ?? null;
          this.monthlyHistory = Array.isArray(data.monthlyHistory) ? data.monthlyHistory : [];
          this.rebuildMonthlyHistoryFallback();
          if (Number.isFinite(data.reportRevision)) this.reportRevision = Number(data.reportRevision);
          const imported = this.adapter.name === "rest" ? "rest" : data.meta?.dataMode === "imported" ? "imported" : "demo";
          this.dataMode = imported;
          this.productsSource = imported === "demo" ? "demo" : "imported";
          this.ordersSource = imported === "demo" ? "demo" : "imported";
          return;
        }
      } catch {
      }
    }
    const [products, orders] = await Promise.all([
      this.adapter.listProducts({}),
      this.adapter.listOrders({})
    ]);
    this.products = products;
    this.orders = orders;
    this.dataMode = this.adapter.name === "rest" ? "rest" : "demo";
    this.productsSource = "demo";
    this.ordersSource = "demo";
    this.save();
  }
  // v0.3 起商品增删改查已移除（数据由导入整体维护），SKU 计数器成为死代码：
  // 原 recomputeCounters()/nextSku 已删除，数据重载后不再需要刷新计数器。
  // ─────────────────────────── 持久化 ───────────────────────────
  save() {
    try {
      mkdirSync(dirname2(this.cfg.file), { recursive: true });
      writeFileSync(
        this.cfg.file,
        JSON.stringify(
          {
            products: this.products,
            orders: this.orders,
            monthlyReport: this.monthlyReport,
            weeklyReport: this.weeklyReport,
            previousMonthlyReport: this.previousMonthlyReport,
            previousWeeklyReport: this.previousWeeklyReport,
            monthlyHistory: this.monthlyHistory,
            reportRevision: this.reportRevision,
            meta: { dataMode: this.dataMode, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }
          },
          null,
          2
        ),
        "utf8"
      );
    } catch (err) {
      console.error("[ecommerce-analyst] \u6301\u4E45\u5316\u5931\u8D25\uFF1A", err);
    }
  }
  /** 导出 JSON 备份 */
  exportBackup() {
    return JSON.stringify(
      {
        products: this.products,
        orders: this.orders,
        monthlyReport: this.monthlyReport,
        weeklyReport: this.weeklyReport,
        previousMonthlyReport: this.previousMonthlyReport,
        previousWeeklyReport: this.previousWeeklyReport,
        monthlyHistory: this.monthlyHistory
      },
      null,
      2
    );
  }
  /** 导入 JSON 备份（整体替换） */
  importBackup(json) {
    const data = JSON.parse(json);
    if (!Array.isArray(data.products) || !Array.isArray(data.orders)) {
      throw new Error("\u5907\u4EFD\u6587\u4EF6\u683C\u5F0F\u4E0D\u6B63\u786E\uFF1A\u7F3A\u5C11 products/orders \u6570\u7EC4");
    }
    this.products = data.products;
    this.orders = data.orders;
    this.monthlyReport = data.monthlyReport ?? null;
    this.weeklyReport = data.weeklyReport ?? null;
    this.previousMonthlyReport = data.previousMonthlyReport ?? null;
    this.previousWeeklyReport = data.previousWeeklyReport ?? null;
    this.monthlyHistory = Array.isArray(data.monthlyHistory) ? data.monthlyHistory : [];
    this.rebuildMonthlyHistoryFallback();
    this.dataMode = "imported";
    this.productsSource = "imported";
    this.ordersSource = "imported";
    this.reportRevision += 1;
    this.captureImported();
    this.save();
    return { products: this.products.length, orders: this.orders.length };
  }
  /**
   * 导入规范化后的商品/订单数组（整体替换）。Excel/CSV 导入工具使用：
   * 先校验商品 SKU 唯一、订单引用存在、金额/数量合法，再整体替换并落盘。
   */
  importData(products, orders) {
    const skus = /* @__PURE__ */ new Set();
    for (const p of products) {
      if (!p.sku || !String(p.sku).trim()) throw new Error("\u5546\u54C1\u7F3A\u5C11 sku");
      if (skus.has(p.sku)) throw new Error(`\u5546\u54C1 sku \u91CD\u590D\uFF1A${p.sku}`);
      skus.add(p.sku);
      if (!p.name || !String(p.name).trim()) throw new Error(`\u5546\u54C1 ${p.sku} \u7F3A\u5C11 name`);
      if (!Number.isFinite(p.price) || p.price < 0) throw new Error(`\u5546\u54C1 ${p.sku} \u552E\u4EF7\u975E\u6CD5\uFF1A${p.price}`);
      if (!Number.isInteger(p.stock) || p.stock < 0) throw new Error(`\u5546\u54C1 ${p.sku} \u5E93\u5B58\u975E\u6CD5\uFF1A${p.stock}`);
      if (!p.category) throw new Error(`\u5546\u54C1 ${p.sku} \u7F3A\u5C11 category`);
      if (p.status !== "on_sale" && p.status !== "off_sale") throw new Error(`\u5546\u54C1 ${p.sku} \u72B6\u6001\u975E\u6CD5\uFF1A${p.status}`);
    }
    const orderIds = /* @__PURE__ */ new Set();
    for (const o of orders) {
      if (!o.order_id || !String(o.order_id).trim()) throw new Error("\u8BA2\u5355\u7F3A\u5C11 order_id");
      if (orderIds.has(o.order_id)) throw new Error(`\u8BA2\u5355\u53F7\u91CD\u590D\uFF1A${o.order_id}`);
      orderIds.add(o.order_id);
      if (!skus.has(o.sku)) throw new Error(`\u8BA2\u5355 ${o.order_id} \u5F15\u7528\u4E86\u4E0D\u5B58\u5728\u7684\u5546\u54C1 sku\uFF1A${o.sku}`);
      if (!Number.isInteger(o.quantity) || o.quantity < 1) throw new Error(`\u8BA2\u5355 ${o.order_id} \u6570\u91CF\u975E\u6CD5\uFF1A${o.quantity}`);
      if (!Number.isFinite(o.amount) || o.amount < 0) throw new Error(`\u8BA2\u5355 ${o.order_id} \u91D1\u989D\u975E\u6CD5\uFF1A${o.amount}`);
      if (!o.buyer) throw new Error(`\u8BA2\u5355 ${o.order_id} \u7F3A\u5C11 buyer`);
      if (!o.created_at) throw new Error(`\u8BA2\u5355 ${o.order_id} \u7F3A\u5C11 created_at`);
    }
    this.products = products;
    this.orders = orders;
    this.dataMode = "imported";
    this.productsSource = "imported";
    this.ordersSource = "imported";
    this.captureImported();
    this.save();
    return { products: this.products.length, orders: this.orders.length };
  }
  /**
   * 文件导入（「店铺工作台」本地文件导入）：以「导入文件」为准做整体替换，杜绝演示数据残留。
   * - 文件同时含商品+订单：整体替换两者（dataMode=imported）。
   * - 文件仅含订单：替换订单；若当前商品仍为演示数据，则从订单 distinct(sku, 商品名称)
   *   派生商品（category=未分类 / price=0 / stock=阈值+1，避免误报低库存），确保看板展示
   *   用户真实商品而非演示商品。
   * - 文件仅含商品：替换商品（dataMode=imported）；若当前订单仍为演示数据则清空，避免
   *   演示订单残留。
   */
  importFromFile(products, orders) {
    let finalProducts = this.products;
    let finalOrders = this.orders;
    let derivedProducts = 0;
    if (products !== void 0) {
      const skus = /* @__PURE__ */ new Set();
      for (const p of products) {
        if (!p.sku || !String(p.sku).trim()) throw new Error("\u5546\u54C1\u7F3A\u5C11 sku");
        if (skus.has(p.sku)) throw new Error(`\u5546\u54C1 sku \u91CD\u590D\uFF1A${p.sku}`);
        skus.add(p.sku);
        if (!p.name || !String(p.name).trim()) throw new Error(`\u5546\u54C1 ${p.sku} \u7F3A\u5C11 name`);
        if (!Number.isFinite(p.price) || p.price < 0) throw new Error(`\u5546\u54C1 ${p.sku} \u552E\u4EF7\u975E\u6CD5\uFF1A${p.price}`);
        if (!Number.isInteger(p.stock) || p.stock < 0) throw new Error(`\u5546\u54C1 ${p.sku} \u5E93\u5B58\u975E\u6CD5\uFF1A${p.stock}`);
        if (!p.category) throw new Error(`\u5546\u54C1 ${p.sku} \u7F3A\u5C11 category`);
        if (p.status !== "on_sale" && p.status !== "off_sale") throw new Error(`\u5546\u54C1 ${p.sku} \u72B6\u6001\u975E\u6CD5\uFF1A${p.status}`);
      }
      finalProducts = products;
      this.productsSource = "imported";
    }
    if (orders !== void 0) {
      const skus = /* @__PURE__ */ new Set();
      for (const o of orders) {
        if (!o.order_id || !String(o.order_id).trim()) throw new Error("\u8BA2\u5355\u7F3A\u5C11 order_id");
        if (skus.has(o.order_id)) throw new Error(`\u8BA2\u5355\u53F7\u91CD\u590D\uFF1A${o.order_id}`);
        skus.add(o.order_id);
        if (!o.sku) throw new Error(`\u8BA2\u5355 ${o.order_id} \u7F3A\u5C11 sku`);
        if (!Number.isInteger(o.quantity) || o.quantity < 1) throw new Error(`\u8BA2\u5355 ${o.order_id} \u6570\u91CF\u975E\u6CD5\uFF1A${o.quantity}`);
        if (!Number.isFinite(o.amount) || o.amount < 0) throw new Error(`\u8BA2\u5355 ${o.order_id} \u91D1\u989D\u975E\u6CD5\uFF1A${o.amount}`);
        if (!o.buyer) throw new Error(`\u8BA2\u5355 ${o.order_id} \u7F3A\u5C11 buyer`);
        if (!o.created_at) throw new Error(`\u8BA2\u5355 ${o.order_id} \u7F3A\u5C11 created_at`);
      }
      finalOrders = orders;
      this.ordersSource = "imported";
      if (products === void 0 && this.productsSource === "demo") {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const bySku = /* @__PURE__ */ new Map();
        for (const o of orders) {
          if (!bySku.has(o.sku)) bySku.set(o.sku, o.product_name || o.sku);
        }
        finalProducts = [...bySku.entries()].map(([sku, name2]) => ({
          sku,
          name: name2,
          category: "\u672A\u5206\u7C7B",
          price: 0,
          stock: this.cfg.lowStockThreshold + 1,
          status: "on_sale",
          created_at: now,
          updated_at: now
        }));
        this.productsSource = "imported";
        derivedProducts = finalProducts.length;
      }
    }
    if (products !== void 0 && orders === void 0 && this.ordersSource === "demo") {
      finalOrders = [];
      this.ordersSource = "imported";
    }
    this.products = finalProducts;
    this.orders = finalOrders;
    this.dataMode = "imported";
    this.captureImported();
    this.save();
    return { products: this.products.length, orders: this.orders.length, derivedProducts };
  }
  // ─────────────────────────── 月度复盘 ───────────────────────────
  /** 写入月度复盘（来自 JSON 完整月报导入）。新周期写入时归档上一期。 */
  setMonthlyReport(report) {
    this.adoptMonthly(report);
    this.archiveToMonthlyHistory();
    this.reportRevision += 1;
    this.save();
  }
  /** 合并月度复盘章节（「月度表」4 份文件分次导入，按展示形式/利润表覆盖对应章节）。
   *  合并结果周期与当前不同（新周期文件先到）时归档上一期，后续同周期文件继续补章节。 */
  mergeMonthlyReport(part) {
    const cur = this.monthlyReport;
    if (part.period && cur !== null && cur.period !== "" && cur.period !== part.period) {
      this.previousMonthlyReport = structuredClone(cur);
    }
    const incoming = mergeMonthly(this.monthlyReport, part);
    this.monthlyReport = incoming;
    this.archiveToMonthlyHistory();
    this.reportRevision += 1;
    this.save();
  }
  /**
   * 批量导入月度复盘（30 天周期）：以「这批文件」为唯一数据源，从零整体重建
   * MonthlyReport（不继承任何旧周期章节），保证 30 天面板的分析结果完全来自
   * 本次一次性导入的 4 份 Excel（利润表 + 三份「商品排名导出」），杜绝旧数据残留。
   */
  importMonthlyReport(parts) {
    let report = null;
    for (const part of parts) {
      report = mergeMonthly(report, part);
    }
    if (report === null) return;
    if (this.monthlyReport !== null && this.monthlyReport.period !== report.period) {
      this.previousMonthlyReport = this.monthlyReport;
    }
    this.monthlyReport = report;
    this.archiveToMonthlyHistory();
    this.reportRevision += 1;
    this.save();
  }
  /** 统一采纳月报：周期与当前不同时先把当前归档为上一期，再替换 */
  adoptMonthly(report) {
    if (report !== null && report.period && this.monthlyReport !== null && this.monthlyReport.period !== "" && this.monthlyReport.period !== report.period) {
      this.previousMonthlyReport = this.monthlyReport;
    }
    this.monthlyReport = report;
  }
  /** 把当前月报按 period upsert 进多月份归档（升序、保留最近 12 个月）：
   *  数据对比的「月份柱状 + 折线趋势」据此渲染；重复导入同月数据 → 覆盖该月条目。 */
  archiveToMonthlyHistory() {
    const cur = this.monthlyReport;
    if (cur === null || !cur.period) return;
    const clone = structuredClone(cur);
    const idx = this.monthlyHistory.findIndex((r) => r.period === clone.period);
    if (idx >= 0) this.monthlyHistory[idx] = clone;
    else {
      this.monthlyHistory.push(clone);
      this.monthlyHistory.sort((a, b) => a.period < b.period ? -1 : a.period > b.period ? 1 : 0);
      if (this.monthlyHistory.length > 12) this.monthlyHistory.splice(0, this.monthlyHistory.length - 12);
    }
  }
  /** 读取月度复盘（无导入记录返回 null） */
  getMonthlyReport() {
    return this.monthlyReport;
  }
  /** 读取上一期月度复盘（未连续导入第二期返回 null）：供数据对比用 */
  getPreviousMonthlyReport() {
    return this.previousMonthlyReport;
  }
  /** 读取多月份月度复盘归档（升序，含当前期）：供数据对比的月份趋势柱状/折线用 */
  getMonthlyHistory() {
    return this.monthlyHistory;
  }
  /** 兼容兜底：历史里没有当前期/上一期时（旧版持久化文件、老备份导入），把它们并进去 */
  rebuildMonthlyHistoryFallback() {
    for (const rep of [this.previousMonthlyReport, this.monthlyReport]) {
      if (rep === null || !rep.period) continue;
      if (!this.monthlyHistory.some((r) => r.period === rep.period)) {
        this.monthlyHistory.push(structuredClone(rep));
      }
    }
    this.monthlyHistory.sort((a, b) => a.period < b.period ? -1 : a.period > b.period ? 1 : 0);
    if (this.monthlyHistory.length > 12) this.monthlyHistory.splice(0, this.monthlyHistory.length - 12);
  }
  /** 合并周复盘章节（三份「商品排名导出」分次导入，按展示形式覆盖对应章节）。
   *  新周期文件先到时归档上一期，后续同周期文件继续补章节（不重复归档）。 */
  mergeWeeklyReport(part) {
    const cur = this.weeklyReport;
    if (part.period && cur !== null && cur.period !== "" && cur.period !== part.period) {
      this.previousWeeklyReport = structuredClone(cur);
    }
    const incoming = mergeWeekly(this.weeklyReport, part);
    this.weeklyReport = incoming;
    this.reportRevision += 1;
    this.save();
  }
  /** 读取周复盘（无导入记录返回 null） */
  getWeeklyReport() {
    return this.weeklyReport;
  }
  /** 读取上一期周复盘（未连续导入第二期返回 null）：供数据对比用 */
  getPreviousWeeklyReport() {
    return this.previousWeeklyReport;
  }
  /** 报表数据版本号（单调递增），供 /ecommerce-api/*-report 接口返回给前端做变更检测 */
  getReportRevision() {
    return this.reportRevision;
  }
  // ─────────────────────────── 数据源模式切换 ───────────────────────────
  /** 深拷贝当前数据为「最近导入快照」（避免后续 CRUD 就地修改污染快照） */
  captureImported() {
    this.lastImported = {
      products: structuredClone(this.products),
      orders: structuredClone(this.orders)
    };
  }
  /**
   * 重置为本地初始数据：先导出当前数据快照（防误操作），再从适配器重新拉取。
   * v0.4.0 起示例种子已移除——mock 适配器返回空库，即「清空重置」。
   * 返回 { products, orders, snapshot }，snapshot 为重置前的备份 JSON。
   */
  async resetToDemo() {
    const snapshot = this.exportBackup();
    const [products, orders] = await Promise.all([
      this.adapter.listProducts({}),
      this.adapter.listOrders({})
    ]);
    this.products = products;
    this.orders = orders;
    this.dataMode = "demo";
    this.productsSource = "demo";
    this.ordersSource = "demo";
    this.save();
    return { products: this.products.length, orders: this.orders.length, snapshot };
  }
  /**
   * v0.4.2「清除重置」：一键清空当前所有已导入的数据——
   * 商品/订单、月度/周度复盘及其上一期归档、导入快照缓存，全部归零并持久化。
   * 纯清除语义：不产生/不回传备份快照（不触发任何文件导入导出）；
   * 归档清空后，只导入一份数据时「数据对比」模块不会出现。
   */
  clearAllData() {
    const cleared = { products: this.products.length, orders: this.orders.length };
    this.products = [];
    this.orders = [];
    this.dataMode = "demo";
    this.productsSource = "demo";
    this.ordersSource = "demo";
    this.lastImported = null;
    this.monthlyReport = null;
    this.weeklyReport = null;
    this.previousMonthlyReport = null;
    this.previousWeeklyReport = null;
    this.monthlyHistory = [];
    this.reportRevision += 1;
    this.save();
    return cleared;
  }
  /** 切换回最近一次导入的数据（无导入记录时报错） */
  switchToImported() {
    if (this.lastImported === null) {
      throw new Error("\u6682\u65E0\u5BFC\u5165\u6570\u636E\uFF0C\u8BF7\u5148\u901A\u8FC7 ecommerce_import_excel / ecommerce_import_backup \u6216\u5DE5\u4F5C\u53F0\u5BFC\u5165\u6587\u4EF6");
    }
    this.products = structuredClone(this.lastImported.products);
    this.orders = structuredClone(this.lastImported.orders);
    this.dataMode = "imported";
    this.productsSource = "imported";
    this.ordersSource = "imported";
    this.save();
    return { products: this.products.length, orders: this.orders.length };
  }
  /** 从平台 API 重新拉取数据（仅 rest 适配器可用） */
  async reloadFromRest() {
    if (this.adapter.name !== "rest") {
      throw new Error("\u5F53\u524D\u672A\u914D\u7F6E\u5E73\u53F0 API\uFF08\u542F\u52A8\u65F6 ecommerceAnalyst.platform.name \u9700\u4E3A rest\uFF09");
    }
    const [products, orders] = await Promise.all([
      this.adapter.listProducts({}),
      this.adapter.listOrders({})
    ]);
    this.products = products;
    this.orders = orders;
    this.dataMode = "rest";
    this.productsSource = "imported";
    this.ordersSource = "imported";
    this.save();
    return { products: this.products.length, orders: this.orders.length };
  }
  /** 显式切换数据源模式（demo/imported/rest） */
  async switchMode(mode) {
    switch (mode) {
      case "demo":
        return this.resetToDemo();
      case "imported":
        return this.switchToImported();
      case "rest":
        return this.reloadFromRest();
      default:
        throw new Error(`\u672A\u77E5\u6570\u636E\u6E90\u6A21\u5F0F\uFF1A${String(mode)}`);
    }
  }
  /** 数据源模式信息（供侧边栏「数据源」标签渲染） */
  getModeInfo() {
    return {
      mode: this.dataMode,
      sourceMode: this.sourceMode,
      canDemo: true,
      canImported: this.lastImported !== null,
      canRest: this.adapter.name === "rest"
    };
  }
  // ─────────────────────────── 商品查询 ───────────────────────────
  listProducts(filter) {
    const pageSize = filter.page_size ?? 20;
    const page = filter.page ?? 1;
    const filtered = filterProducts(this.products, filter);
    return {
      total: filtered.length,
      items: filtered.slice((page - 1) * pageSize, page * pageSize)
    };
  }
  getProduct(sku) {
    return this.products.find((p) => p.sku === sku);
  }
  // ─────────────────────────── 订单处理 ───────────────────────────
  listOrders(filter) {
    const pageSize = filter.page_size ?? 20;
    const page = filter.page ?? 1;
    const filtered = filterOrders(this.orders, filter);
    const sorted = [...filtered].sort(
      (a, b) => b.created_at.localeCompare(a.created_at)
    );
    return {
      total: sorted.length,
      items: sorted.slice((page - 1) * pageSize, page * pageSize)
    };
  }
  getOrder(orderId) {
    return this.orders.find((o) => o.order_id === orderId);
  }
  /** 校验并执行订单状态流转 */
  async updateOrderStatus(orderId, status, meta) {
    const order = this.getOrder(orderId);
    if (!order) throw new Error(`\u8BA2\u5355\u4E0D\u5B58\u5728\uFF1A${orderId}`);
    if (order.status === status) return order;
    const allowed = ORDER_TRANSITIONS[order.status];
    if (!allowed.includes(status)) {
      throw new Error(
        `\u975E\u6CD5\u72B6\u6001\u6D41\u8F6C\uFF1A${order.status} \u2192 ${status}\uFF08\u5141\u8BB8\uFF1A${allowed.join("\u3001") || "\u65E0"}\uFF09`
      );
    }
    order.status = status;
    if (meta?.note) {
      ;
      order.note = meta.note;
    }
    if (status === "shipped" && meta?.tracking_no) {
      order.shipped_at = (/* @__PURE__ */ new Date()).toISOString();
      order.tracking_no = meta.tracking_no;
      order.carrier = meta.carrier;
    }
    if (status === "refunded") {
      order.refund_reason = meta?.refund_reason ?? "\u7528\u6237\u7533\u8BF7\u9000\u6B3E";
    }
    this.save();
    return order;
  }
  /** 发货便捷操作 */
  async shipOrder(orderId, trackingNo, carrier) {
    return this.updateOrderStatus(orderId, "shipped", {
      tracking_no: trackingNo,
      carrier
    });
  }
  /** 退款便捷操作 */
  async refundOrder(orderId, reason) {
    return this.updateOrderStatus(orderId, "refunded", { refund_reason: reason });
  }
  /** 待发货订单（今日要处理） */
  pendingShipments() {
    return this.orders.filter((o) => o.status === "paid");
  }
  /** 逾期未处理订单：pending 超过 24 小时 */
  overduePending() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1e3;
    return this.orders.filter(
      (o) => o.status === "pending" && new Date(o.created_at).getTime() < cutoff
    );
  }
  // ─────────────────────────── 统计口径 ───────────────────────────
  inRange(order, range) {
    const d = order.created_at.slice(0, 10);
    if (range.date_from && d < range.date_from) return false;
    if (range.date_to && d > range.date_to) return false;
    return true;
  }
  revenueOrders(range) {
    return this.orders.filter((o) => isRevenueOrder(o.status) && this.inRange(o, range));
  }
  overview(range = {}) {
    const revOrders = this.revenueOrders(range);
    const revenue = revOrders.reduce((sum3, o) => sum3 + toCents(o.amount), 0);
    const revenueYuan = fromCents(revenue);
    const total = this.orders.filter((o) => this.inRange(o, range)).length;
    const refunded = this.orders.filter(
      (o) => o.status === "refunded" && this.inRange(o, range)
    ).length;
    const top = this.topProducts(range, 1)[0];
    return {
      revenue: revenueYuan,
      orders: revOrders.length,
      avg_order_value: revOrders.length ? fromCents(Math.round(revenue / revOrders.length)) : 0,
      top_selling_sku: top?.sku ?? "",
      refund_rate: total ? Math.round(refunded / total * 1e3) / 10 : 0
    };
  }
  trend(range = {}, granularity = "day") {
    const orders = this.revenueOrders(range);
    const buckets = /* @__PURE__ */ new Map();
    for (const o of orders) {
      const date = o.created_at.slice(0, 10);
      const key = granularity === "month" ? date.slice(0, 7) : granularity === "week" ? weekKey(date) : date;
      const bucket = buckets.get(key) ?? { revenue: 0, orders: 0 };
      bucket.revenue += toCents(o.amount);
      bucket.orders += 1;
      buckets.set(key, bucket);
    }
    return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, revenue: fromCents(v.revenue), orders: v.orders }));
  }
  topProducts(range = {}, limit = 10) {
    const orders = this.revenueOrders(range);
    const agg = /* @__PURE__ */ new Map();
    for (const o of orders) {
      const item = agg.get(o.sku) ?? { revenue: 0, units: 0, name: o.product_name };
      item.revenue += toCents(o.amount);
      item.units += o.quantity;
      agg.set(o.sku, item);
    }
    return [...agg.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, limit).map(([sku, v]) => ({
      sku,
      name: v.name,
      revenue: fromCents(v.revenue),
      units: v.units
    }));
  }
  categoryDistribution(range = {}) {
    const orders = this.revenueOrders(range);
    const nameBySku = new Map(this.products.map((p) => [p.sku, p.category]));
    const agg = /* @__PURE__ */ new Map();
    for (const o of orders) {
      const cat = nameBySku.get(o.sku) ?? "\u672A\u5206\u7C7B";
      agg.set(cat, (agg.get(cat) ?? 0) + toCents(o.amount));
    }
    const total = [...agg.values()].reduce((a, b) => a + b, 0);
    return [...agg.entries()].sort((a, b) => b[1] - a[1]).map(([category, revenue]) => ({
      category,
      revenue: fromCents(revenue),
      ratio: total ? Math.round(revenue / total * 1e3) / 10 : 0
    }));
  }
  // ─────────────────────────── 库存预警 ───────────────────────────
  lowStock(threshold) {
    const t = threshold ?? this.cfg.lowStockThreshold;
    return this.products.filter((p) => p.stock <= t).sort((a, b) => a.stock - b.stock).map((p) => ({
      sku: p.sku,
      name: p.name,
      stock: p.stock,
      category: p.category,
      threshold: t
    }));
  }
  restockSuggestions(threshold) {
    const t = threshold ?? this.cfg.lowStockThreshold;
    const recent30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString().slice(0, 10);
    const range = { date_from: recent30 };
    const salesBySku = /* @__PURE__ */ new Map();
    for (const o of this.revenueOrders(range)) {
      salesBySku.set(o.sku, (salesBySku.get(o.sku) ?? 0) + o.quantity);
    }
    return this.products.filter((p) => p.stock <= t).map((p) => {
      const sold = salesBySku.get(p.sku) ?? 0;
      const suggest = Math.max(0, Math.ceil(sold * 1.5 - p.stock));
      return {
        sku: p.sku,
        name: p.name,
        stock: p.stock,
        suggest_qty: suggest,
        reason: suggest > 0 ? `\u8FD130\u5929\u9500\u91CF ${sold}\uFF0C\u6309 1.5 \u500D\u5B89\u5168\u5E93\u5B58\u5EFA\u8BAE\u8865\u8D27` : "\u8FD130\u5929\u65E0\u9500\u91CF\uFF0C\u6682\u4E0D\u9700\u8981\u8865\u8D27"
      };
    }).sort((a, b) => a.stock - b.stock);
  }
  /** 今日概览文本（供「今天要处理」区域使用） */
  todayActions() {
    return {
      shipments: this.pendingShipments(),
      overdues: this.overduePending(),
      lowStockCount: this.lowStock().length
    };
  }
};
function weekKey(date) {
  const d = /* @__PURE__ */ new Date(`${date}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

// src/platform/adapter.ts
async function createAdapter(config) {
  switch (config.name) {
    case "mock":
      const { MockAdapter: MockAdapter2 } = await Promise.resolve().then(() => (init_mock(), mock_exports));
      return new MockAdapter2();
    case "rest":
      const { RestAdapter: RestAdapter2 } = await Promise.resolve().then(() => (init_rest(), rest_exports));
      return new RestAdapter2(config);
    default:
      const { MockAdapter: fallback } = await Promise.resolve().then(() => (init_mock(), mock_exports));
      return new fallback();
  }
}

// src/tools/products.ts
import { defineTool } from "@deepseek-ai/dsh-tools";

// src/tools/json.ts
function asJsonObject(value) {
  return value;
}

// src/tools/products.ts
function renderProducts(data, sourceMode) {
  if (data.total === 0) return "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u5546\u54C1\u3002";
  const lines = data.items.map((p) => {
    const statusText = p.status === "on_sale" ? "\u5728\u552E" : "\u4E0B\u67B6";
    return `- ${p.sku} \uFF5C ${p.name} \uFF5C \xA5${p.price.toFixed(2)} \uFF5C \u5E93\u5B58 ${p.stock} \uFF5C ${p.category} \uFF5C ${statusText}`;
  });
  const note = sourceMode === "mock" ? "\n\uFF08\u5F53\u524D\u4E3A\u672C\u5730\u6A21\u5F0F\uFF1A\u6570\u636E\u6765\u81EA\u5BFC\u5165\uFF1B\u9700\u5E73\u53F0\u5B9E\u65F6\u6570\u636E\u8BF7\u914D\u7F6E rest\uFF09" : "";
  return `\u5171 ${data.total} \u4EF6\u5546\u54C1${data.total > data.items.length ? `\uFF0C\u663E\u793A\u524D ${data.items.length} \u4EF6` : ""}\uFF1A
${lines.join("\n")}${note}`;
}
function registerProductTools(ctx, store) {
  const mode = store.sourceMode;
  ctx.tools.register(defineTool({
    name: "product_list",
    description: "\u67E5\u8BE2\u5E97\u94FA\u5546\u54C1\u5217\u8868\uFF0C\u652F\u6301\u6309\u5206\u7C7B\u3001\u5173\u952E\u8BCD\u3001\u4E0A\u4E0B\u67B6\u72B6\u6001\u3001\u4EF7\u683C\u533A\u95F4\u7B5B\u9009\uFF0C\u5206\u9875\u8FD4\u56DE\u3002",
    parameters: {
      category: { type: "string", description: "\u5546\u54C1\u5206\u7C7B\uFF0C\u5982\u300C\u6570\u7801\u914D\u4EF6\u300D" },
      keyword: { type: "string", description: "\u6309\u5546\u54C1\u540D\u79F0\u6216 SKU \u6A21\u7CCA\u641C\u7D22" },
      status: { type: "string", enum: ["on_sale", "off_sale"], description: "\u4E0A\u4E0B\u67B6\u72B6\u6001" },
      min_price: { type: "number", description: "\u6700\u4F4E\u4EF7\uFF08\xA5\uFF09" },
      max_price: { type: "number", description: "\u6700\u9AD8\u4EF7\uFF08\xA5\uFF09" },
      page: { type: "number", description: "\u9875\u7801\uFF0C\u4ECE 1 \u5F00\u59CB" },
      page_size: { type: "number", description: "\u6BCF\u9875\u6570\u91CF\uFF0C\u9ED8\u8BA4 20" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          total: { type: "number" },
          items: { type: "array", items: { type: "object", additionalProperties: true } }
        }
      },
      render: (_args, value) => {
        const v = value;
        return [{ type: "text", text: renderProducts(v, mode) }];
      }
    },
    async execute(args) {
      return asJsonObject(store.listProducts({
        category: args.category,
        keyword: args.keyword,
        status: args.status,
        min_price: args.min_price,
        max_price: args.max_price,
        page: args.page ?? 1,
        page_size: args.page_size ?? 20
      }));
    }
  }));
}

// src/tools/orders.ts
import { defineTool as defineTool2 } from "@deepseek-ai/dsh-tools";
var STATUS_TEXT = {
  pending: "\u5F85\u4ED8\u6B3E",
  paid: "\u5F85\u53D1\u8D27",
  shipped: "\u5DF2\u53D1\u8D27",
  completed: "\u5DF2\u5B8C\u6210",
  refunded: "\u5DF2\u9000\u6B3E",
  cancelled: "\u5DF2\u53D6\u6D88"
};
function renderOrders(data, sourceMode) {
  if (data.total === 0) return "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u8BA2\u5355\u3002";
  const lines = data.items.map((o) => {
    const tracking = o.tracking_no ? ` \uFF5C \u8FD0\u5355 ${o.tracking_no}` : "";
    return `- ${o.order_id} \uFF5C ${o.buyer} \uFF5C ${o.product_name} \xD7${o.quantity} \uFF5C \xA5${o.amount.toFixed(2)} \uFF5C ${STATUS_TEXT[o.status] ?? o.status} \uFF5C ${o.created_at.slice(0, 10)}${tracking}`;
  });
  const note = sourceMode === "mock" ? "\n\uFF08\u5F53\u524D\u4E3A\u672C\u5730\u6A21\u5F0F\uFF1A\u6570\u636E\u6765\u81EA\u5BFC\u5165\uFF1B\u9700\u5E73\u53F0\u5B9E\u65F6\u6570\u636E\u8BF7\u914D\u7F6E rest\uFF09" : "";
  return `\u5171 ${data.total} \u7B14\u8BA2\u5355${data.total > data.items.length ? `\uFF0C\u663E\u793A\u524D ${data.items.length} \u7B14` : ""}\uFF1A
${lines.join("\n")}${note}`;
}
function registerOrderTools(ctx, store) {
  const mode = store.sourceMode;
  ctx.tools.register(defineTool2({
    name: "order_list",
    description: "\u67E5\u8BE2\u8BA2\u5355\u5217\u8868\uFF0C\u652F\u6301\u6309\u72B6\u6001\u3001\u65E5\u671F\u8303\u56F4\u3001\u91D1\u989D\u533A\u95F4\u3001\u4E70\u5BB6/\u8BA2\u5355\u53F7\u641C\u7D22\uFF0C\u5206\u9875\u8FD4\u56DE\uFF0C\u6309\u65F6\u95F4\u5012\u5E8F\u3002",
    parameters: {
      status: {
        type: "string",
        enum: ["pending", "paid", "shipped", "completed", "refunded", "cancelled"],
        description: "\u8BA2\u5355\u72B6\u6001\uFF1A\u5F85\u4ED8\u6B3E/\u5F85\u53D1\u8D27/\u5DF2\u53D1\u8D27/\u5DF2\u5B8C\u6210/\u5DF2\u9000\u6B3E/\u5DF2\u53D6\u6D88"
      },
      date_from: { type: "string", description: "\u8D77\u59CB\u65E5\u671F YYYY-MM-DD" },
      date_to: { type: "string", description: "\u7ED3\u675F\u65E5\u671F YYYY-MM-DD" },
      min_amount: { type: "number", description: "\u6700\u4F4E\u91D1\u989D\uFF08\xA5\uFF09" },
      max_amount: { type: "number", description: "\u6700\u9AD8\u91D1\u989D\uFF08\xA5\uFF09" },
      keyword: { type: "string", description: "\u6309\u4E70\u5BB6\u6635\u79F0/\u8BA2\u5355\u53F7/\u5546\u54C1\u540D\u641C\u7D22" },
      page: { type: "number", description: "\u9875\u7801\uFF0C\u4ECE 1 \u5F00\u59CB" },
      page_size: { type: "number", description: "\u6BCF\u9875\u6570\u91CF\uFF0C\u9ED8\u8BA4 20" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          total: { type: "number" },
          items: { type: "array", items: { type: "object", additionalProperties: true } }
        }
      },
      render: (_args, value) => {
        const v = value;
        return [{ type: "text", text: renderOrders(v, mode) }];
      }
    },
    async execute(args) {
      return asJsonObject(store.listOrders({
        status: args.status,
        date_from: args.date_from,
        date_to: args.date_to,
        min_amount: args.min_amount,
        max_amount: args.max_amount,
        keyword: args.keyword,
        page: args.page ?? 1,
        page_size: args.page_size ?? 20
      }));
    }
  }));
  ctx.tools.register(defineTool2({
    name: "order_stats",
    description: "\u7EDF\u8BA1\u8BA2\u5355\u6982\u89C8\uFF1A\u8BA2\u5355\u91CF\u3001\u9500\u552E\u989D\u3001\u5BA2\u5355\u4EF7\u3001\u9000\u6B3E\u7387\u3002\u9500\u552E\u989D\u6309\u5DF2\u652F\u4ED8\u53E3\u5F84\u8BA1\u7B97\uFF08\u5F85\u4ED8\u6B3E/\u5DF2\u53D6\u6D88\u4E0D\u8BA1\u5165\uFF09\u3002",
    parameters: {
      date_from: { type: "string", description: "\u8D77\u59CB\u65E5\u671F YYYY-MM-DD" },
      date_to: { type: "string", description: "\u7ED3\u675F\u65E5\u671F YYYY-MM-DD" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          revenue: { type: "number" },
          orders: { type: "number" },
          avg_order_value: { type: "number" },
          refund_rate: { type: "number" },
          date_from: { type: "string" },
          date_to: { type: "string" }
        }
      },
      render: (_args, value) => {
        const v = value;
        return [{
          type: "text",
          text: [
            `\u8BA2\u5355\u7EDF\u8BA1${v.date_from ? `\uFF08${v.date_from} ~ ${v.date_to ?? "\u4ECA\u5929"}\uFF09` : "\uFF08\u5168\u90E8\u65F6\u95F4\uFF09"}\uFF1A`,
            `- \u9500\u552E\u989D\uFF1A\xA5${v.revenue.toFixed(2)}`,
            `- \u8BA2\u5355\u91CF\uFF1A${v.orders} \u7B14`,
            `- \u5BA2\u5355\u4EF7\uFF1A\xA5${v.avg_order_value.toFixed(2)}`,
            `- \u9000\u6B3E\u7387\uFF1A${v.refund_rate}%`
          ].join("\n")
        }];
      }
    },
    async execute(args) {
      const overview = store.overview({ date_from: args.date_from, date_to: args.date_to });
      return asJsonObject({
        ...overview,
        date_from: args.date_from ?? "",
        date_to: args.date_to ?? ""
      });
    }
  }));
  ctx.tools.register(defineTool2({
    name: "order_update_status",
    description: "\u66F4\u65B0\u8BA2\u5355\u72B6\u6001\u3002\u5408\u6CD5\u6D41\u8F6C\uFF1A\u5F85\u4ED8\u6B3E\u2192\u5F85\u53D1\u8D27/\u5DF2\u53D6\u6D88\uFF1B\u5F85\u53D1\u8D27\u2192\u5DF2\u53D1\u8D27/\u5DF2\u9000\u6B3E\uFF1B\u5DF2\u53D1\u8D27\u2192\u5DF2\u5B8C\u6210/\u5DF2\u9000\u6B3E\u3002\u975E\u6CD5\u6D41\u8F6C\u4F1A\u62A5\u9519\u3002",
    parameters: {
      order_id: { type: "string", required: true, description: "\u8BA2\u5355\u53F7" },
      status: {
        type: "string",
        required: true,
        enum: ["pending", "paid", "shipped", "completed", "refunded", "cancelled"],
        description: "\u76EE\u6807\u72B6\u6001"
      },
      note: { type: "string", description: "\u5907\u6CE8" }
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_args, value) => {
        const v = value;
        return [{
          type: "text",
          text: `\u8BA2\u5355 ${v.order_id} \u72B6\u6001\u5DF2\u66F4\u65B0\u4E3A\u300C${STATUS_TEXT[v.status] ?? v.status}\u300D`
        }];
      }
    },
    async execute(args) {
      return asJsonObject(store.updateOrderStatus(args.order_id, args.status, {
        note: args.note
      }));
    }
  }));
  ctx.tools.register(defineTool2({
    name: "order_ship",
    description: "\u8BA2\u5355\u53D1\u8D27\uFF1A\u4EC5\u5F85\u53D1\u8D27\u8BA2\u5355\u53EF\u53D1\u8D27\uFF0C\u586B\u5199\u8FD0\u5355\u53F7\u548C\u5FEB\u9012\u516C\u53F8\u3002",
    parameters: {
      order_id: { type: "string", required: true, description: "\u8BA2\u5355\u53F7" },
      tracking_no: { type: "string", required: true, description: "\u8FD0\u5355\u53F7" },
      carrier: { type: "string", required: true, description: "\u5FEB\u9012\u516C\u53F8\uFF0C\u5982 \u987A\u4E30/\u5706\u901A/\u4E2D\u901A" }
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_args, value) => {
        const v = value;
        return [{
          type: "text",
          text: `\u8BA2\u5355 ${v.order_id} \u5DF2\u53D1\u8D27\uFF08${v.carrier ?? ""} \u8FD0\u5355 ${v.tracking_no ?? ""}\uFF09`
        }];
      }
    },
    async execute(args) {
      if (!args.tracking_no.trim()) throw new Error("\u8FD0\u5355\u53F7\u4E0D\u80FD\u4E3A\u7A7A");
      return asJsonObject(store.shipOrder(args.order_id, args.tracking_no.trim(), args.carrier.trim()));
    }
  }));
  ctx.tools.register(defineTool2({
    name: "order_refund",
    description: "\u8BA2\u5355\u9000\u6B3E/\u552E\u540E\uFF1A\u5F85\u53D1\u8D27\u6216\u5DF2\u53D1\u8D27\u8BA2\u5355\u53EF\u9000\u6B3E\uFF0C\u8BB0\u5F55\u9000\u6B3E\u539F\u56E0\u3002",
    parameters: {
      order_id: { type: "string", required: true, description: "\u8BA2\u5355\u53F7" },
      reason: { type: "string", required: true, description: "\u9000\u6B3E\u539F\u56E0" }
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_args, value) => {
        const v = value;
        return [{
          type: "text",
          text: `\u8BA2\u5355 ${v.order_id} \u5DF2\u9000\u6B3E\uFF08\u539F\u56E0\uFF1A${v.refund_reason ?? ""}\uFF09`
        }];
      }
    },
    async execute(args) {
      if (!args.reason.trim()) throw new Error("\u9000\u6B3E\u539F\u56E0\u4E0D\u80FD\u4E3A\u7A7A");
      return asJsonObject(store.refundOrder(args.order_id, args.reason.trim()));
    }
  }));
}

// src/tools/stats.ts
import { defineTool as defineTool3 } from "@deepseek-ai/dsh-tools";
function rangeNote(range) {
  return range.date_from || range.date_to ? `\uFF08${range.date_from ?? "\u5F00\u59CB"} ~ ${range.date_to ?? "\u4ECA\u5929"}\uFF09` : "\uFF08\u5168\u90E8\u65F6\u95F4\uFF09";
}
function registerStatsTools(ctx, store) {
  const mode = store.sourceMode;
  ctx.tools.register(defineTool3({
    name: "stats_overview",
    description: "\u5E97\u94FA\u7ECF\u8425\u603B\u89C8\uFF1A\u9500\u552E\u989D\u3001\u8BA2\u5355\u91CF\u3001\u5BA2\u5355\u4EF7\u3001\u7545\u9500\u5546\u54C1\u3001\u9000\u6B3E\u7387\uFF08\u5DF2\u652F\u4ED8\u53E3\u5F84\uFF09\u3002",
    parameters: {
      date_from: { type: "string", description: "\u8D77\u59CB\u65E5\u671F YYYY-MM-DD" },
      date_to: { type: "string", description: "\u7ED3\u675F\u65E5\u671F YYYY-MM-DD" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          revenue: { type: "number" },
          orders: { type: "number" },
          avg_order_value: { type: "number" },
          top_selling_sku: { type: "string" },
          refund_rate: { type: "number" }
        }
      },
      render: (_args, value) => {
        const v = value;
        const top = v.top_selling_sku ? `
- \u7545\u9500\u5546\u54C1\uFF1A${v.top_selling_sku}` : "";
        const note = mode === "mock" ? "\n\uFF08\u5F53\u524D\u4E3A\u793A\u4F8B\u6570\u636E\u6A21\u5F0F\uFF0C\u4EC5\u4F5C\u6F14\u793A\uFF09" : "";
        return [{
          type: "text",
          text: `\u7ECF\u8425\u603B\u89C8${rangeNote(v)}
- \u9500\u552E\u989D\uFF1A\xA5${v.revenue.toFixed(2)}
- \u8BA2\u5355\u91CF\uFF1A${v.orders} \u7B14
- \u5BA2\u5355\u4EF7\uFF1A\xA5${v.avg_order_value.toFixed(2)}
- \u9000\u6B3E\u7387\uFF1A${v.refund_rate}%${top}${note}`
        }];
      }
    },
    async execute(args) {
      return asJsonObject({
        ...store.overview({ date_from: args.date_from, date_to: args.date_to }),
        date_from: args.date_from ?? "",
        date_to: args.date_to ?? ""
      });
    }
  }));
  ctx.tools.register(defineTool3({
    name: "stats_trend",
    description: "\u9500\u552E\u8D8B\u52BF\uFF1A\u6309\u65E5/\u5468/\u6708\u805A\u5408\u9500\u552E\u989D\u4E0E\u8BA2\u5355\u91CF\uFF0C\u7528\u4E8E\u7ED8\u5236\u6298\u7EBF\u56FE\u3002",
    parameters: {
      date_from: { type: "string", description: "\u8D77\u59CB\u65E5\u671F YYYY-MM-DD" },
      date_to: { type: "string", description: "\u7ED3\u675F\u65E5\u671F YYYY-MM-DD" },
      granularity: { type: "string", enum: ["day", "week", "month"], description: "\u805A\u5408\u7C92\u5EA6\uFF0C\u9ED8\u8BA4 day" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          granularity: { type: "string" },
          points: { type: "array", items: { type: "object", additionalProperties: true } }
        }
      },
      render: (_args, value) => {
        const v = value;
        const lines = v.points.map((p) => `- ${p.date}\uFF1A\xA5${p.revenue.toFixed(2)}\uFF08${p.orders} \u5355\uFF09`).join("\n");
        return [{ type: "text", text: `\u9500\u552E\u8D8B\u52BF\uFF08${v.granularity}\uFF09\uFF1A
${lines || "\uFF08\u65E0\u6570\u636E\uFF09"}` }];
      }
    },
    async execute(args) {
      const points = store.trend(
        { date_from: args.date_from, date_to: args.date_to },
        args.granularity ?? "day"
      );
      return asJsonObject({ points, granularity: args.granularity ?? "day" });
    }
  }));
  ctx.tools.register(defineTool3({
    name: "stats_top_products",
    description: "\u5546\u54C1\u9500\u552E\u6392\u884C TOP N\uFF1A\u6309\u9500\u552E\u989D\u6392\u5E8F\uFF0C\u542B\u9500\u91CF\u3002",
    parameters: {
      date_from: { type: "string", description: "\u8D77\u59CB\u65E5\u671F YYYY-MM-DD" },
      date_to: { type: "string", description: "\u7ED3\u675F\u65E5\u671F YYYY-MM-DD" },
      limit: { type: "number", description: "\u8FD4\u56DE\u6761\u6570\uFF0C\u9ED8\u8BA4 10\uFF0C\u6700\u5927 50" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          items: { type: "array", items: { type: "object", additionalProperties: true } }
        }
      },
      render: (_args, value) => {
        const v = value;
        const lines = v.items.map((p, i) => `${i + 1}. ${p.name}\uFF08${p.sku}\uFF09\xA5${p.revenue.toFixed(2)}\uFF0C${p.units} \u4EF6`).join("\n");
        return [{ type: "text", text: `\u5546\u54C1\u9500\u552E\u6392\u884C\uFF1A
${lines || "\uFF08\u65E0\u6570\u636E\uFF09"}` }];
      }
    },
    async execute(args) {
      const limit = Math.min(args.limit ?? 10, 50);
      return asJsonObject({ items: store.topProducts({ date_from: args.date_from, date_to: args.date_to }, limit) });
    }
  }));
  ctx.tools.register(defineTool3({
    name: "stats_category",
    description: "\u7C7B\u76EE\u9500\u552E\u5206\u5E03\uFF1A\u5404\u5206\u7C7B\u9500\u552E\u989D\u4E0E\u5360\u6BD4\uFF0C\u7528\u4E8E\u7ED8\u5236\u997C\u56FE\u3002",
    parameters: {
      date_from: { type: "string", description: "\u8D77\u59CB\u65E5\u671F YYYY-MM-DD" },
      date_to: { type: "string", description: "\u7ED3\u675F\u65E5\u671F YYYY-MM-DD" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          items: { type: "array", items: { type: "object", additionalProperties: true } }
        }
      },
      render: (_args, value) => {
        const v = value;
        const lines = v.items.map((c) => `- ${c.category}\uFF1A\xA5${c.revenue.toFixed(2)}\uFF08${c.ratio}%\uFF09`).join("\n");
        return [{ type: "text", text: `\u7C7B\u76EE\u9500\u552E\u5206\u5E03\uFF1A
${lines || "\uFF08\u65E0\u6570\u636E\uFF09"}` }];
      }
    },
    async execute(args) {
      return asJsonObject({
        items: store.categoryDistribution({ date_from: args.date_from, date_to: args.date_to })
      });
    }
  }));
}

// src/tools/inventory.ts
import { defineTool as defineTool4 } from "@deepseek-ai/dsh-tools";
function registerInventoryTools(ctx, store) {
  const mode = store.sourceMode;
  ctx.tools.register(defineTool4({
    name: "inventory_low_stock",
    description: "\u67E5\u8BE2\u4F4E\u5E93\u5B58\u5546\u54C1\u6E05\u5355\uFF08\u5E93\u5B58 \u2264 \u9608\u503C\uFF09\uFF0C\u6309\u5E93\u5B58\u5347\u5E8F\u6392\u5217\u3002",
    parameters: {
      threshold: { type: "number", description: "\u4F4E\u5E93\u5B58\u9608\u503C\uFF0C\u9ED8\u8BA4\u53D6\u63D2\u4EF6\u914D\u7F6E\uFF0810\uFF09" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          threshold: { type: "number" },
          items: { type: "array", items: { type: "object", additionalProperties: true } }
        }
      },
      render: (_args, value) => {
        const v = value;
        if (v.items.length === 0) {
          return [{ type: "text", text: `\u5E93\u5B58\u5145\u8DB3\uFF0C\u6CA1\u6709\u4F4E\u4E8E\u9608\u503C\uFF08${v.threshold}\uFF09\u7684\u5546\u54C1\u3002` }];
        }
        const lines = v.items.map((p) => `- ${p.sku} \uFF5C ${p.name} \uFF5C \u5E93\u5B58 ${p.stock} \uFF5C ${p.category}`).join("\n");
        const note = mode === "mock" ? "\n\uFF08\u5F53\u524D\u4E3A\u672C\u5730\u6A21\u5F0F\uFF1A\u6570\u636E\u6765\u81EA\u5BFC\u5165\uFF1B\u9700\u5E73\u53F0\u5B9E\u65F6\u6570\u636E\u8BF7\u914D\u7F6E rest\uFF09" : "";
        return [{
          type: "text",
          text: `\u26A0\uFE0F \u6709 ${v.items.length} \u4EF6\u5546\u54C1\u5E93\u5B58\u4F4E\u4E8E\u9608\u503C\uFF08${v.threshold}\uFF09\uFF1A
${lines}${note}`
        }];
      }
    },
    async execute(args) {
      const items = store.lowStock(args.threshold);
      return asJsonObject({ items, threshold: args.threshold ?? 10 });
    }
  }));
  ctx.tools.register(defineTool4({
    name: "inventory_suggest",
    description: "\u751F\u6210\u4F4E\u5E93\u5B58\u5546\u54C1\u7684\u8865\u8D27\u5EFA\u8BAE\uFF1A\u57FA\u4E8E\u8FD1 30 \u5929\u9500\u91CF\u6309 1.5 \u500D\u5B89\u5168\u5E93\u5B58\u4F30\u7B97\u5EFA\u8BAE\u8865\u8D27\u91CF\u3002",
    parameters: {
      threshold: { type: "number", description: "\u4F4E\u5E93\u5B58\u9608\u503C\uFF0C\u9ED8\u8BA4\u53D6\u63D2\u4EF6\u914D\u7F6E\uFF0810\uFF09" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          items: { type: "array", items: { type: "object", additionalProperties: true } }
        }
      },
      render: (_args, value) => {
        const v = value;
        if (v.items.length === 0) return [{ type: "text", text: "\u6CA1\u6709\u9700\u8981\u8865\u8D27\u7684\u5546\u54C1\u3002" }];
        const lines = v.items.map((p) => `- ${p.name}\uFF08${p.sku}\uFF09\u5F53\u524D\u5E93\u5B58 ${p.stock} \u2192 \u5EFA\u8BAE\u8865\u8D27 ${p.suggest_qty}\uFF08${p.reason}\uFF09`).join("\n");
        return [{ type: "text", text: `\u8865\u8D27\u5EFA\u8BAE\uFF1A
${lines}` }];
      }
    },
    async execute(args) {
      return asJsonObject({ items: store.restockSuggestions(args.threshold) });
    }
  }));
}

// src/tools/backup.ts
import { defineTool as defineTool5 } from "@deepseek-ai/dsh-tools";
function registerBackupTools(ctx, store) {
  ctx.tools.register(defineTool5({
    name: "ecommerce_export_backup",
    description: "\u5BFC\u51FA\u5E97\u94FA\u6570\u636E JSON \u5907\u4EFD\uFF08\u5546\u54C1 + \u8BA2\u5355\u5168\u91CF\uFF09\u3002\u5EFA\u8BAE\u5B9A\u671F\u5907\u4EFD\u3002",
    parameters: {},
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          products: { type: "number" },
          orders: { type: "number" },
          json: { type: "string" },
          hint: { type: "string" }
        }
      },
      render: (_args, value) => {
        const v = value;
        return [{
          type: "text",
          text: `\u5DF2\u751F\u6210\u5907\u4EFD\uFF1A${v.products} \u4EF6\u5546\u54C1\u3001${v.orders} \u7B14\u8BA2\u5355\u3002\u8BF7\u5C06\u4EE5\u4E0B JSON \u59A5\u5584\u4FDD\u5B58\uFF1A

${v.json}

${v.hint}`
        }];
      }
    },
    async execute() {
      const json = store.exportBackup();
      const data = JSON.parse(json);
      return asJsonObject({
        products: data.products.length,
        orders: data.orders.length,
        json,
        hint: "\u8BF7\u5C06 json \u5B57\u6BB5\u5B8C\u6574\u4FDD\u5B58\u4F5C\u4E3A\u5907\u4EFD"
      });
    }
  }));
  ctx.tools.register(defineTool5({
    name: "ecommerce_import_backup",
    description: "\u4ECE JSON \u5907\u4EFD\u6062\u590D\u5E97\u94FA\u6570\u636E\uFF08\u6574\u4F53\u66FF\u6362\u5F53\u524D\u6570\u636E\uFF09\u3002\u6062\u590D\u524D\u4F1A\u81EA\u52A8\u5BFC\u51FA\u5F53\u524D\u6570\u636E\u5FEB\u7167\u4EE5\u9632\u8BEF\u64CD\u4F5C\u3002",
    parameters: {
      json: { type: "string", required: true, description: "\u5907\u4EFD JSON \u5B8C\u6574\u5185\u5BB9" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          products: { type: "number" },
          orders: { type: "number" },
          snapshot: { type: "string" }
        }
      },
      render: (_args, value) => {
        const v = value;
        return [{
          type: "text",
          text: `\u6062\u590D\u5B8C\u6210\uFF1A${v.products} \u4EF6\u5546\u54C1\u3001${v.orders} \u7B14\u8BA2\u5355\u3002\uFF08\u6062\u590D\u524D\u6570\u636E\u5DF2\u5907\u4EFD\uFF09`
        }];
      }
    },
    async execute(args) {
      const snapshot = store.exportBackup();
      try {
        const result = store.importBackup(args.json);
        return asJsonObject({ ...result, snapshot });
      } catch (err) {
        throw new Error(`\u5BFC\u5165\u5931\u8D25\uFF0C\u6570\u636E\u672A\u53D8\u66F4\uFF1A${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }));
}

// src/import-parse.ts
var PRODUCT_COLUMNS = {
  sku: "sku",
  \u5546\u54C1\u7F16\u7801: "sku",
  \u5546\u54C1\u7F16\u53F7: "sku",
  name: "name",
  \u5546\u54C1\u540D\u79F0: "name",
  \u5546\u54C1\u540D: "name",
  \u540D\u79F0: "name",
  category: "category",
  \u7C7B\u76EE: "category",
  \u5206\u7C7B: "category",
  \u5546\u54C1\u7C7B\u76EE: "category",
  price: "price",
  \u552E\u4EF7: "price",
  \u4EF7\u683C: "price",
  \u5355\u4EF7: "price",
  stock: "stock",
  \u5E93\u5B58: "stock",
  \u5E93\u5B58\u6570\u91CF: "stock",
  \u6570\u91CF: "stock",
  status: "status",
  \u72B6\u6001: "status"
};
var ORDER_COLUMNS = {
  order_id: "order_id",
  \u8BA2\u5355\u53F7: "order_id",
  \u8BA2\u5355\u7F16\u53F7: "order_id",
  \u5355\u53F7: "order_id",
  buyer: "buyer",
  \u4E70\u5BB6: "buyer",
  \u4E70\u5BB6\u6635\u79F0: "buyer",
  \u5BA2\u6237: "buyer",
  sku: "sku",
  \u5546\u54C1\u7F16\u7801: "sku",
  \u5546\u54C1\u7F16\u53F7: "sku",
  product_name: "product_name",
  \u5546\u54C1\u540D\u79F0: "product_name",
  \u5546\u54C1: "product_name",
  quantity: "quantity",
  \u6570\u91CF: "quantity",
  \u4EF6\u6570: "quantity",
  amount: "amount",
  \u91D1\u989D: "amount",
  \u5B9E\u4ED8: "amount",
  \u5B9E\u4ED8\u91D1\u989D: "amount",
  status: "status",
  \u72B6\u6001: "status",
  \u8BA2\u5355\u72B6\u6001: "status",
  created_at: "created_at",
  \u4E0B\u5355\u65F6\u95F4: "created_at",
  \u521B\u5EFA\u65F6\u95F4: "created_at",
  \u65E5\u671F: "created_at"
};
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}
function csvToRows(text, alias) {
  const cells = parseCsv(text.trim());
  if (cells.length < 2) throw new Error("\u8868\u683C\u6570\u636E\u4E3A\u7A7A\u6216\u7F3A\u5C11\u8868\u5934");
  const header = cells[0].map((h) => h.trim());
  const map = {};
  for (let i = 0; i < header.length; i++) {
    const key = alias[header[i]] ?? header[i];
    if (key) map[key] = map[key] ?? String(i);
  }
  const out = [];
  for (let r = 1; r < cells.length; r++) {
    const rowCells = cells[r];
    const obj = {};
    for (const [key, idxStr] of Object.entries(map)) {
      const idx = Number(idxStr);
      if (idx < rowCells.length) obj[key] = rowCells[idx]?.trim() ?? "";
    }
    if (Object.values(obj).some((v) => v !== "")) out.push(obj);
  }
  return out;
}
function jsonToRows(value, alias) {
  if (!Array.isArray(value)) throw new Error("JSON \u6570\u636E\u5FC5\u987B\u662F\u6570\u7EC4");
  return value.map((row) => {
    if (row === null || typeof row !== "object") throw new Error("JSON \u884C\u5FC5\u987B\u662F\u5BF9\u8C61");
    const obj = {};
    for (const [k, v] of Object.entries(row)) {
      obj[alias[k] ?? k] = v;
    }
    return obj;
  });
}
function pick(row, key) {
  return row[key];
}
function toNumber(value) {
  if (value === void 0 || value === null || value === "") return void 0;
  if (typeof value === "number") return value;
  const n = Number(String(value).replace(/[,\s¥￥]/g, ""));
  return Number.isFinite(n) ? n : void 0;
}
function toInt(value) {
  const n = toNumber(value);
  if (n === void 0) return void 0;
  return Math.trunc(n);
}
function toIsoDate(value) {
  if (value === void 0 || value === null || value === "") return void 0;
  const s = String(value).trim();
  const m = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    const [, y, mo, d, h = "0", mi = "0", se = "0"] = m;
    const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T${h.padStart(2, "0")}:${mi.padStart(2, "0")}:${se.padStart(2, "0")}.000Z`;
    const t2 = new Date(iso).getTime();
    if (!Number.isNaN(t2)) return new Date(t2).toISOString();
  }
  const t = new Date(s).getTime();
  if (Number.isNaN(t)) return void 0;
  return new Date(t).toISOString();
}
function toProductStatus(value) {
  const s = String(value ?? "").trim().toLowerCase();
  if (s === "on_sale" || s === "\u5728\u552E" || s === "\u4E0A\u67B6" || s === "\u5728\u67B6" || s === "\u9500\u552E\u4E2D") return "on_sale";
  return "off_sale";
}
var ORDER_STATUSES = /* @__PURE__ */ new Set([
  "pending",
  "paid",
  "shipped",
  "completed",
  "refunded",
  "cancelled"
]);
function productErrorsForRow(row, rowNo) {
  const errs = [];
  const sku = String(pick(row, "sku") ?? "").trim();
  const name2 = String(pick(row, "name") ?? "").trim();
  const price = toNumber(pick(row, "price"));
  const stock = toInt(pick(row, "stock"));
  if (!sku) errs.push({ row: rowNo, field: "sku", reason: "\u7F3A\u5C11 sku\uFF08\u5546\u54C1\u7F16\u7801\uFF09\u5217" });
  if (!name2) errs.push({ row: rowNo, field: "name", reason: "\u7F3A\u5C11\u540D\u79F0\u5217" });
  if (price === void 0) errs.push({ row: rowNo, field: "price", reason: `\u552E\u4EF7\u975E\u6570\u5B57\uFF1A${String(pick(row, "price"))}` });
  else if (price < 0) errs.push({ row: rowNo, field: "price", reason: `\u552E\u4EF7\u4E3A\u8D1F\uFF1A${price}` });
  if (stock === void 0) errs.push({ row: rowNo, field: "stock", reason: `\u5E93\u5B58\u975E\u6574\u6570\uFF1A${String(pick(row, "stock"))}` });
  else if (stock < 0) errs.push({ row: rowNo, field: "stock", reason: `\u5E93\u5B58\u4E3A\u8D1F\uFF1A${stock}` });
  return errs;
}
function buildProductFromRow(row, now) {
  return {
    sku: String(pick(row, "sku") ?? "").trim(),
    name: String(pick(row, "name") ?? "").trim(),
    category: String(pick(row, "category") ?? "").trim() || "\u672A\u5206\u7C7B",
    price: toNumber(pick(row, "price")),
    stock: toInt(pick(row, "stock")),
    status: toProductStatus(pick(row, "status")),
    created_at: now,
    updated_at: now
  };
}
function validateProducts(rows) {
  const errors = [];
  const seen = /* @__PURE__ */ new Set();
  const items = [];
  const now = (/* @__PURE__ */ new Date()).toISOString();
  rows.forEach((row, i) => {
    const rowNo = i + 1;
    const sku = String(pick(row, "sku") ?? "").trim();
    if (sku !== "" && seen.has(sku)) {
      errors.push({ row: rowNo, field: "sku", reason: `sku \u91CD\u590D\uFF1A${sku}` });
      return;
    }
    if (sku !== "") seen.add(sku);
    const rowErrs = productErrorsForRow(row, rowNo);
    if (rowErrs.length > 0) {
      errors.push(...rowErrs);
      return;
    }
    items.push(buildProductFromRow(row, now));
  });
  return { errors, items };
}
function buildProducts(rows) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return rows.map((row, i) => {
    const sku = String(pick(row, "sku") ?? "").trim();
    const errs = productErrorsForRow(row, i + 1);
    if (errs.length > 0) {
      const e = errs[0];
      if (e.field === "sku") throw new Error("\u5546\u54C1\u7F3A\u5C11 sku\uFF08\u5546\u54C1\u7F16\u7801\uFF09\u5217");
      if (e.field === "name") throw new Error(`\u5546\u54C1 ${sku} \u7F3A\u5C11\u540D\u79F0\u5217`);
      if (e.field === "price") throw new Error(`\u5546\u54C1 ${sku} \u552E\u4EF7\u975E\u6CD5\uFF1A${String(pick(row, "price"))}`);
      throw new Error(`\u5546\u54C1 ${sku} \u5E93\u5B58\u975E\u6CD5\uFF1A${String(pick(row, "stock"))}`);
    }
    return buildProductFromRow(row, now);
  });
}
function tryOrderStatus(value) {
  const s = String(value ?? "").trim().toLowerCase();
  if (s === "") return "pending";
  const alias = {
    "\u5F85\u4ED8\u6B3E": "pending",
    "\u5F85\u53D1\u8D27": "paid",
    "\u5DF2\u4ED8\u6B3E": "paid",
    "\u5DF2\u652F\u4ED8": "paid",
    "\u5DF2\u53D1\u8D27": "shipped",
    "\u5DF2\u5B8C\u6210": "completed",
    "\u4EA4\u6613\u5B8C\u6210": "completed",
    "\u5DF2\u9000\u6B3E": "refunded",
    "\u9000\u6B3E": "refunded",
    "\u5DF2\u53D6\u6D88": "cancelled",
    "\u53D6\u6D88": "cancelled"
  };
  const mapped = alias[s] ?? s;
  return ORDER_STATUSES.has(mapped) ? mapped : null;
}
function orderErrorsForRow(row, rowNo) {
  const errs = [];
  const order_id = String(pick(row, "order_id") ?? "").trim();
  const sku = String(pick(row, "sku") ?? "").trim();
  const buyer = String(pick(row, "buyer") ?? "").trim();
  const quantity = toInt(pick(row, "quantity"));
  const amount = toNumber(pick(row, "amount"));
  const created_at = toIsoDate(pick(row, "created_at"));
  const status = tryOrderStatus(pick(row, "status"));
  if (!order_id) errs.push({ row: rowNo, field: "order_id", reason: "\u7F3A\u5C11 order_id\uFF08\u8BA2\u5355\u53F7\uFF09\u5217" });
  if (!sku) errs.push({ row: rowNo, field: "sku", reason: "\u7F3A\u5C11\u5546\u54C1\u7F16\u7801\uFF08sku\uFF09\u5217" });
  if (!buyer) errs.push({ row: rowNo, field: "buyer", reason: "\u7F3A\u5C11\u4E70\u5BB6\u5217" });
  if (quantity === void 0 || quantity < 1) {
    errs.push({ row: rowNo, field: "quantity", reason: `\u6570\u91CF\u975E\u6CD5\uFF1A${String(pick(row, "quantity"))}\uFF08\u9700 \u22651 \u7684\u6574\u6570\uFF09` });
  }
  if (amount === void 0 || amount < 0) {
    errs.push({ row: rowNo, field: "amount", reason: `\u91D1\u989D\u975E\u6CD5\uFF1A${String(pick(row, "amount"))}\uFF08\u9700 \u22650 \u7684\u6570\u5B57\uFF09` });
  }
  if (!created_at) {
    errs.push({ row: rowNo, field: "created_at", reason: `\u4E0B\u5355\u65F6\u95F4\u975E\u6CD5\uFF1A${String(pick(row, "created_at"))}\uFF08\u9700 YYYY-MM-DD HH:mm\uFF09` });
  }
  if (status === null) {
    errs.push({ row: rowNo, field: "status", reason: `\u8BA2\u5355\u72B6\u6001\u975E\u6CD5\uFF1A${String(pick(row, "status"))}` });
  }
  return errs;
}
function buildOrderFromRow(row) {
  const order_id = String(pick(row, "order_id") ?? "").trim();
  return {
    order_id,
    buyer: String(pick(row, "buyer") ?? "").trim(),
    sku: String(pick(row, "sku") ?? "").trim(),
    product_name: String(pick(row, "product_name") ?? "").trim(),
    quantity: toInt(pick(row, "quantity")),
    amount: toNumber(pick(row, "amount")),
    status: tryOrderStatus(pick(row, "status")) ?? "pending",
    created_at: toIsoDate(pick(row, "created_at"))
  };
}
function validateOrders(rows, knownSkus) {
  const errors = [];
  const seen = /* @__PURE__ */ new Set();
  const items = [];
  rows.forEach((row, i) => {
    const rowNo = i + 1;
    const order_id = String(pick(row, "order_id") ?? "").trim();
    if (order_id !== "" && seen.has(order_id)) {
      errors.push({ row: rowNo, field: "order_id", reason: `\u8BA2\u5355\u53F7\u91CD\u590D\uFF1A${order_id}` });
      return;
    }
    if (order_id !== "") seen.add(order_id);
    const rowErrs = orderErrorsForRow(row, rowNo);
    if (rowErrs.length > 0) {
      errors.push(...rowErrs);
      return;
    }
    const sku = String(pick(row, "sku") ?? "").trim();
    if (knownSkus !== void 0 && !knownSkus.has(sku)) {
      errors.push({ row: rowNo, field: "sku", reason: `\u5F15\u7528\u4E86\u4E0D\u5B58\u5728\u7684\u5546\u54C1 sku\uFF1A${sku}` });
      return;
    }
    items.push(buildOrderFromRow(row));
  });
  return { errors, items };
}
function buildOrders(rows) {
  return rows.map((row, i) => {
    const order_id = String(pick(row, "order_id") ?? "").trim();
    const errs = orderErrorsForRow(row, i + 1);
    if (errs.length > 0) {
      const e = errs[0];
      if (e.field === "order_id") throw new Error("\u8BA2\u5355\u7F3A\u5C11 order_id\uFF08\u8BA2\u5355\u53F7\uFF09\u5217");
      if (e.field === "sku") throw new Error(`\u8BA2\u5355 ${order_id} \u7F3A\u5C11\u5546\u54C1\u7F16\u7801\uFF08sku\uFF09\u5217`);
      if (e.field === "buyer") throw new Error(`\u8BA2\u5355 ${order_id} \u7F3A\u5C11\u4E70\u5BB6\u5217`);
      if (e.field === "quantity") throw new Error(`\u8BA2\u5355 ${order_id} \u6570\u91CF\u975E\u6CD5\uFF1A${String(pick(row, "quantity"))}`);
      if (e.field === "amount") throw new Error(`\u8BA2\u5355 ${order_id} \u91D1\u989D\u975E\u6CD5\uFF1A${String(pick(row, "amount"))}`);
      if (e.field === "created_at") throw new Error(`\u8BA2\u5355 ${order_id} \u4E0B\u5355\u65F6\u95F4\u975E\u6CD5\uFF1A${String(pick(row, "created_at"))}`);
      throw new Error(`\u8BA2\u5355 ${order_id} \u72B6\u6001\u975E\u6CD5\uFF1A${String(pick(row, "status"))}`);
    }
    return buildOrderFromRow(row);
  });
}
function parseCsvFile(text) {
  const rows = parseCsv(text.trim());
  if (rows.length < 2) throw new Error("CSV \u7F3A\u5C11\u8868\u5934\u6216\u6570\u636E\u4E3A\u7A7A");
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const hasOrderKey = header.some((h) => /订单号|order_id|买家|buyer/.test(h));
  const hasProductKey = header.some((h) => /售价|price|库存|stock/.test(h));
  let kind = "product";
  if (hasOrderKey && !hasProductKey) kind = "order";
  else if (hasProductKey && !hasOrderKey) kind = "product";
  else if (hasOrderKey && hasProductKey) kind = "order";
  if (kind === "order") {
    return { orders: buildOrders(csvToRows(text, ORDER_COLUMNS)) };
  }
  return { products: buildProducts(csvToRows(text, PRODUCT_COLUMNS)) };
}
function parseJsonFile(text) {
  const data = JSON.parse(text);
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    const obj = data;
    if (Array.isArray(obj.products) || Array.isArray(obj.orders)) {
      return {
        products: Array.isArray(obj.products) ? buildProducts(jsonToRows(obj.products, PRODUCT_COLUMNS)) : void 0,
        orders: Array.isArray(obj.orders) ? buildOrders(jsonToRows(obj.orders, ORDER_COLUMNS)) : void 0
      };
    }
    throw new Error("JSON \u5907\u4EFD\u7ED3\u6784\u9700\u5305\u542B products/orders \u6570\u7EC4");
  }
  return parseRowsArray(data);
}
function parseRowsArray(data) {
  if (!Array.isArray(data) || data.length === 0) throw new Error("JSON \u6570\u7EC4\u4E3A\u7A7A");
  const first = data[0];
  const keys = Object.keys(first ?? {}).map((k) => k.toLowerCase());
  const isOrder = keys.some((k) => /order|buyer|amount/.test(k));
  const isProduct = keys.some((k) => /sku|price|stock/.test(k)) && !isOrder;
  if (isOrder) return { orders: buildOrders(jsonToRows(data, ORDER_COLUMNS)) };
  if (isProduct) return { products: buildProducts(jsonToRows(data, PRODUCT_COLUMNS)) };
  throw new Error("\u65E0\u6CD5\u8BC6\u522B JSON \u884C\u6570\u7EC4\u5B57\u6BB5\uFF08\u5546\u54C1\u9700 sku/price/stock\uFF1B\u8BA2\u5355\u9700 order_id/buyer/amount\uFF09");
}
async function parseExcelBuffer(buffer) {
  let xlsx;
  try {
    xlsx = await import("xlsx");
  } catch {
    throw new Error("Excel \u89E3\u6790\u5E93\u672A\u5B89\u88C5\uFF08node_modules/xlsx \u7F3A\u5931\uFF09");
  }
  const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
  const sheets = workbook.SheetNames;
  if (!Array.isArray(sheets) || sheets.length === 0) {
    throw new Error("\u65E0\u6CD5\u8BFB\u53D6 Excel \u6587\u4EF6\uFF08\u6587\u4EF6\u635F\u574F\u6216\u683C\u5F0F\u4E0D\u652F\u6301\uFF0C\u8BF7\u53E6\u5B58\u4E3A .xlsx \u540E\u91CD\u8BD5\uFF09");
  }
  const result = {};
  const findSheet = (names) => sheets.find((n) => names.some((k) => n.toLowerCase().includes(k)));
  const productSheetName = findSheet(["product", "\u5546\u54C1", "\u5E93\u5B58", "spu"]);
  const orderSheetName = findSheet(["order", "\u8BA2\u5355", "\u4EA4\u6613", "sales"]);
  const productSheet = productSheetName ?? (orderSheetName ? void 0 : sheets[0]);
  const orderSheet = orderSheetName ?? (productSheetName ? void 0 : sheets[0]);
  if (productSheet && productSheet !== orderSheet) {
    const rows = sheetToRows(xlsx.utils, workbook, productSheet, false);
    if (rows.length > 0) result.products = buildProducts(rows);
  }
  if (orderSheet && orderSheet !== productSheet) {
    const rows = sheetToRows(xlsx.utils, workbook, orderSheet, true);
    if (rows.length > 0) result.orders = buildOrders(rows);
  }
  if (productSheet && orderSheet && productSheet === orderSheet) {
    try {
      const rows = sheetToRows(xlsx.utils, workbook, productSheet, false);
      if (rows.length > 0) {
        const firstRow = rows[0];
        const isOrder = Object.keys(firstRow ?? {}).some((k) => /order|buyer|amount/.test(k));
        if (isOrder) result.orders = buildOrders(rows);
        else result.products = buildProducts(rows);
      }
    } catch {
    }
  }
  return result;
}
function sheetToRows(utils, workbook, sheetName, isOrder) {
  const sheet = workbook.Sheets?.[sheetName];
  if (!sheet) throw new Error("\u627E\u4E0D\u5230\u5DE5\u4F5C\u8868\uFF1A" + sheetName);
  const matrix = utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
  if (matrix.length < 2) return [];
  const header = (matrix[0] ?? []).map((h) => String(h ?? "").trim());
  const out = [];
  for (let r = 1; r < matrix.length; r++) {
    const rowCells = matrix[r] ?? [];
    const obj = {};
    let has = false;
    for (let c = 0; c < header.length; c++) {
      const key = header[c];
      if (!key) continue;
      const val = rowCells[c];
      if (val !== "" && val !== void 0 && val !== null) {
        obj[(isOrder ? ORDER_COLUMNS : PRODUCT_COLUMNS)[key] ?? key] = val;
        has = true;
      }
    }
    if (has) out.push(obj);
  }
  return out;
}
function parseSqlText(text) {
  const cleaned = text.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const result = {};
  const inserts = [...cleaned.matchAll(/INSERT\s+INTO\s+["'\x60]?([a-zA-Z_][a-zA-Z0-9_]*)["'\x60]?\s*\(([^)]*)\)\s*VALUES\s*([\s\S]*?)(?:;|$)/gi)];
  if (inserts.length === 0) throw new Error("SQL \u4E2D\u672A\u627E\u5230 INSERT INTO \u8BED\u53E5\uFF08\u9700 products/orders \u8868\uFF09");
  for (const m of inserts) {
    const table = m[1].toLowerCase();
    const cols = m[2].split(",").map((c) => c.trim().replace(/["'\x60]/g, ""));
    const alias = table.includes("order") ? ORDER_COLUMNS : PRODUCT_COLUMNS;
    const mappedCols = cols.map((c) => alias[c] ?? c);
    const rows = parseSqlValues(m[3]);
    const built = rows.map((vals) => {
      const obj = {};
      mappedCols.forEach((c, i) => {
        if (c && vals[i] !== void 0) obj[c] = vals[i];
      });
      return obj;
    });
    if (table.includes("order") && built.length) {
      result.orders = buildOrders(built);
    } else if (!table.includes("order") && built.length) {
      result.products = buildProducts(built);
    }
  }
  if (!result.products && !result.orders) throw new Error("SQL \u672A\u89E3\u6790\u51FA\u5546\u54C1/\u8BA2\u5355\u6570\u636E");
  return result;
}
function parseSqlValues(block) {
  const tuples = [];
  let current = [];
  let field = "";
  let inStr = false;
  let depth = 0;
  for (let i = 0; i < block.length; i++) {
    const ch = block[i];
    if (inStr) {
      if (ch === "'") {
        if (block[i + 1] === "'") {
          field += "'";
          i++;
        } else inStr = false;
      } else field += ch;
      continue;
    }
    if (ch === "'") {
      inStr = true;
      continue;
    }
    if (ch === "(") {
      depth++;
      if (depth === 1) {
        current = [];
        field = "";
      }
      continue;
    }
    if (ch === ")") {
      depth--;
      if (depth === 0) {
        current.push(parseSqlValue(field));
        tuples.push(current);
        current = [];
      }
      continue;
    }
    if (ch === "," && depth === 1) {
      current.push(parseSqlValue(field));
      field = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") continue;
    field += ch;
  }
  return tuples;
}
function parseSqlValue(raw) {
  const s = raw.trim();
  if (s === "NULL" || s === "null" || s === "") return "";
  if (s.startsWith("'")) return s.slice(1, -1).replace(/''/g, "'");
  const n = Number(s);
  return Number.isFinite(n) ? n : s;
}
async function parsePdfBuffer(buffer) {
  let getDocument;
  try {
    const mod = await import("pdfjs-dist/legacy/build/pdf.mjs");
    getDocument = mod.getDocument;
  } catch {
    throw new Error("PDF \u89E3\u6790\u5E93\u672A\u5B89\u88C5\uFF08node_modules/pdfjs-dist \u7F3A\u5931\uFF09");
  }
  const doc = await getDocument({
    data: new Uint8Array(Buffer.from(buffer)),
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true
  }).promise;
  const rowsByPage = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const bands = /* @__PURE__ */ new Map();
    for (const raw of content.items) {
      if (!raw.str) continue;
      const tr = raw.transform;
      const y = tr?.[5] ?? 0;
      const x = tr?.[4] ?? 0;
      const list = bands.get(y) ?? [];
      list.push({ x, str: raw.str });
      bands.set(y, list);
    }
    const pageRows = [...bands.entries()].sort((a, b) => b[0] - a[0]).map(([, items]) => items.sort((a, b) => a.x - b.x).map((i2) => i2.str).join(" "));
    rowsByPage.push(...pageRows);
  }
  const lines = rowsByPage.map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) throw new Error("PDF \u672A\u63D0\u53D6\u5230\u6587\u672C\uFF08\u53EF\u80FD\u662F\u626B\u63CF\u4EF6/\u56FE\u7247\u578B PDF\uFF0C\u8BF7\u6539\u7528 CSV/Excel\uFF09");
  const productHeaderIdx = lines.findIndex((l) => /sku|product|商品|售价|price|库存|stock/.test(l) && !/订单|order_id|买家|buyer/.test(l));
  const orderHeaderIdx = lines.findIndex((l) => /订单号|order_id|买家|buyer|金额|amount|实付/.test(l));
  const smartParseLine = (line, isOrder) => {
    const tokens = line.split(/\s+/).filter(Boolean);
    if (tokens.length < 2) return null;
    const obj = {};
    if (isOrder) {
      let rest2 = [...tokens];
      const oi = rest2.findIndex((t) => /^(ORD|ORDER)?[-_]?[A-Za-z0-9]{6,}$/i.test(t));
      if (oi !== -1) {
        obj.order_id = rest2[oi];
        rest2 = rest2.filter((_, i) => i !== oi);
      }
      const di = rest2.findIndex((t) => /^\d{4}[/.\-]\d{1,2}[/.\-]\d{1,2}/.test(t));
      if (di !== -1) {
        obj.created_at = rest2[di];
        rest2 = rest2.filter((_, i) => i !== di);
      }
      const nums2 = rest2.map((t, i) => ({ t, i, n: Number(t.replace(/[,¥￥]/g, "")) })).filter((x) => Number.isFinite(x.n) && x.t !== "");
      if (nums2.length >= 2) {
        const amount = nums2[nums2.length - 1];
        const qty = nums2[nums2.length - 2];
        obj.amount = amount.t;
        obj.quantity = qty.t;
        rest2 = rest2.filter((_, i) => i !== amount.i && i !== qty.i);
      }
      if (obj.order_id && obj.amount !== void 0 && obj.quantity !== void 0 && rest2.length > 0) {
        obj.buyer = rest2.join(" ");
        return obj;
      }
      return null;
    }
    let rest = [...tokens];
    const si = rest.findIndex((t) => /^[A-Za-z0-9]{1,8}[-_][A-Za-z0-9-]{1,12}$/.test(t));
    if (si !== -1) {
      obj.sku = rest[si];
      rest = rest.filter((_, i) => i !== si);
    }
    const nums = rest.map((t, i) => ({ t, i, n: Number(t.replace(/[,¥￥]/g, "")) })).filter((x) => Number.isFinite(x.n) && x.t !== "");
    if (nums.length >= 2) {
      const stock = nums[nums.length - 1];
      const price = nums[nums.length - 2];
      obj.stock = stock.t;
      obj.price = price.t;
      rest = rest.filter((_, i) => i !== stock.i && i !== price.i);
    }
    if (rest.length > 0) {
      obj.name = rest.join(" ");
      if (obj.sku || obj.price !== void 0 && obj.stock !== void 0) return obj;
    }
    return null;
  };
  const parseTable = (headerIdx, isOrder) => {
    if (headerIdx === -1) return [];
    const headerCells = lines[headerIdx].split(/\t| {2,}|，|,|\|/).map((c) => c.trim()).filter(Boolean);
    const out = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^第?\d+\s*页|^\s*[-=]{3,}|^合计|^总计/i.test(line)) continue;
      const cells = line.split(/\t| {2,}|，|,|\|/).map((c) => c.trim()).filter(Boolean);
      if (cells.length >= headerCells.length && headerCells.length >= 2) {
        const obj = {};
        headerCells.forEach((h, c) => {
          const key = (isOrder ? ORDER_COLUMNS : PRODUCT_COLUMNS)[h] ?? h;
          if (key && cells[c] !== void 0) obj[key] = cells[c];
        });
        if (Object.keys(obj).length >= 2) {
          out.push(obj);
          if (out.length >= 500) break;
          continue;
        }
      }
      const smart = smartParseLine(line, isOrder);
      if (smart !== null) {
        out.push(smart);
        if (out.length >= 500) break;
      }
    }
    return out;
  };
  const productRows = parseTable(productHeaderIdx, false);
  const orderRows = parseTable(orderHeaderIdx, true);
  if (productRows.length === 0 && orderRows.length === 0) {
    throw new Error("PDF \u4E2D\u672A\u8BC6\u522B\u5230\u5546\u54C1/\u8BA2\u5355\u8868\u683C\uFF08\u8868\u5934\u9700\u542B sku/\u5546\u54C1/\u552E\u4EF7 \u6216 \u8BA2\u5355\u53F7/\u4E70\u5BB6/\u91D1\u989D\uFF09");
  }
  const result = {};
  if (productRows.length) result.products = buildProducts(productRows);
  if (orderRows.length) result.orders = buildOrders(orderRows);
  return result;
}
async function parseImportFile(filename, content, encoding = "utf8") {
  const ext = (filename.split(".").pop() ?? "").toLowerCase();
  const decode = () => encoding === "base64" ? Buffer.from(content, "base64").toString("utf8") : content;
  switch (ext) {
    case "csv":
    case "txt": {
      const r = parseCsvFile(decode());
      return { ...r, hint: "CSV \u5BFC\u5165\uFF1A" + (r.products?.length ?? 0) + " \u4EF6\u5546\u54C1 / " + (r.orders?.length ?? 0) + " \u7B14\u8BA2\u5355" };
    }
    case "json": {
      const r = parseJsonFile(decode());
      let monthlyReport = null;
      try {
        monthlyReport = parseMonthlyReportJson(JSON.parse(decode()));
      } catch {
      }
      return {
        ...r,
        monthlyReport: monthlyReport ?? void 0,
        hint: "JSON \u5BFC\u5165\uFF1A" + (r.products?.length ?? 0) + " \u4EF6\u5546\u54C1 / " + (r.orders?.length ?? 0) + " \u7B14\u8BA2\u5355" + (monthlyReport ? " / \u6708\u5EA6\u590D\u76D8\u5DF2\u8BC6\u522B" : "")
      };
    }
    case "xlsx":
    case "xls": {
      const buf = encoding === "base64" ? Buffer.from(content, "base64") : Buffer.from(content, "utf8");
      let monthlyPart = null;
      try {
        monthlyPart = await parseMonthlyReportExcel(buf);
      } catch {
      }
      let weeklyReport = null;
      try {
        weeklyReport = await parseWeeklyRankExcel(buf);
      } catch {
      }
      let products;
      let orders;
      try {
        const r = await parseExcelBuffer(buf);
        products = r.products;
        orders = r.orders;
      } catch {
      }
      return {
        products,
        orders,
        monthlyPart: monthlyPart ?? void 0,
        weeklyReport: weeklyReport ?? void 0,
        hint: "Excel \u5BFC\u5165\uFF1A" + (products?.length ?? 0) + " \u4EF6\u5546\u54C1 / " + (orders?.length ?? 0) + " \u7B14\u8BA2\u5355" + (monthlyPart ? " / \u6708\u5EA6\u5DF2\u8BC6\u522B\uFF08" + monthlyPart.kind + "\uFF09" : "") + (weeklyReport ? " / \u5468\u6392\u540D\u5DF2\u8BC6\u522B\uFF08" + weeklyReport.kind + "\uFF09" : "")
      };
    }
    case "sql": {
      const r = parseSqlText(decode());
      return { ...r, hint: "SQL \u5BFC\u5165\uFF1A" + (r.products?.length ?? 0) + " \u4EF6\u5546\u54C1 / " + (r.orders?.length ?? 0) + " \u7B14\u8BA2\u5355" };
    }
    case "pdf": {
      const buf = encoding === "base64" ? Buffer.from(content, "base64") : Buffer.from(content, "utf8");
      try {
        const r = await parsePdfBuffer(buf);
        return { ...r, hint: "PDF \u5BFC\u5165\uFF1A" + (r.products?.length ?? 0) + " \u4EF6\u5546\u54C1 / " + (r.orders?.length ?? 0) + " \u7B14\u8BA2\u5355" };
      } catch (e) {
        return { hint: "PDF \u5BFC\u5165\u5931\u8D25\uFF1A" + (e instanceof Error ? e.message : String(e)) };
      }
    }
    default:
      return { hint: "\u5DF2\u8DF3\u8FC7\u4E0D\u652F\u6301\u7684\u6587\u4EF6\uFF1A." + ext + "\uFF08\u4EC5\u89E3\u6790 csv/txt/json/xlsx/xls/sql/pdf\uFF09" };
  }
}

// src/data-center.ts
import { readFileSync as readFileSync2 } from "node:fs";
import { dirname as dirname3, join as join2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var MODULE_DIR2 = dirname3(fileURLToPath2(import.meta.url));
function apiBaseFromRequest(req) {
  const host = String(req?.headers?.host || "").trim();
  if (host) {
    const fwdProto = String(req?.headers?.["x-forwarded-proto"] || "").split(",")[0].trim().toLowerCase();
    const proto = fwdProto === "https" ? "https:" : "http:";
    return `${proto}//${host}`;
  }
  const referer = String(req?.headers?.referer || "").trim();
  if (referer) {
    try {
      const u = new URL(referer);
      if (u.host) return `${u.protocol}//${u.host}`;
    } catch {
    }
  }
  return "";
}
function renderDataCenter(_store, req) {
  let html;
  try {
    html = readFileSync2(join2(MODULE_DIR2, "assets", "data-center.html"), "utf8");
  } catch (err) {
    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>\u7535\u5546\u6570\u636E\u4E2D\u53F0</title></head><body style="font-family:sans-serif;background:#e8f3f1;color:#16343b;padding:40px;line-height:1.8"><h2>\u26A0\uFE0F \u7535\u5546\u6570\u636E\u4E2D\u53F0\u52A0\u8F7D\u5931\u8D25</h2><p>' + (err instanceof Error ? String(err.message) : String(err)) + "</p><p>\u8BF7\u786E\u8BA4\u90E8\u7F72\u76EE\u5F55\u5B58\u5728 <code>assets/data-center.html</code>\uFF08\u5728\u63D2\u4EF6\u6E90\u7801\u76EE\u5F55\u8FD0\u884C <code>node scripts/build.mjs</code> \u91CD\u65B0\u6784\u5EFA\uFF09\u3002</p></body></html>";
  }
  const base = apiBaseFromRequest(req);
  const tag = `<script>window.__ECOM_API_BASE__ = ${JSON.stringify(base)};</script>`;
  return html.includes("</head>") ? html.replace("</head>", tag + "</head>") : tag + html;
}

// src/csv-util.ts
function escapeField(value) {
  const s = String(value ?? "");
  if (/[",\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
function toCsv(header, rows) {
  const lines = [header.map(escapeField).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeField).join(","));
  }
  return "\uFEFF" + lines.join("\r\n");
}
function productsToCsv(products) {
  return toCsv(
    ["sku", "name", "category", "price", "stock", "status", "created_at", "updated_at"],
    products.map((p) => [p.sku, p.name, p.category, p.price, p.stock, p.status, p.created_at, p.updated_at])
  );
}
function joinCsvBlocks(blocks) {
  const clean = blocks.filter((b) => b.length > 0).map((b) => b.charCodeAt(0) === 65279 ? b.slice(1) : b).join("\r\n\r\n");
  return clean === "" ? "" : "\uFEFF" + clean;
}
function monthlyReportToCsv(rep) {
  const blocks = [];
  if (rep.storeProfit && rep.storeProfit.length > 0) {
    blocks.push(toCsv(
      ["\u5E97\u94FA", "\u9500\u552E\u6536\u5165", "\u9000\u6B3E", "\u51C0\u9500", "\u6BDB\u5229", "\u6BDB\u5229\u7387%", "\u63A8\u5E7F\u8D39", "\u7269\u6D41\u8D39", "\u8D39\u6BD4%"],
      rep.storeProfit.map((s) => [s.store, s.sales, s.refund, (Number(s.sales) || 0) - (Number(s.refund) || 0), s.grossProfit, s.grossMargin, s.promoCost, s.logisticsCost, s.feeRatio])
    ));
  }
  if (rep.platformLinks && rep.platformLinks.length > 0) {
    blocks.push(toCsv(
      ["\u5E97\u94FA", "\u94FE\u63A5\u540D\u79F0", "\u94FE\u63A5ID", "\u9500\u552E\u989D", "\u9500\u552E\u4EF6\u6570", "\u51C0\u9500", "\u6BDB\u5229", "\u6BDB\u5229\u7387%", "\u9000\u6B3E\u989D", "\u9000\u6B3E\u7387%", "\u63A8\u5E7F\u8D39", "\u5BA2\u5355\u4EF7"],
      rep.platformLinks.map((l) => [l.shop, l.linkName, l.linkId, l.sales, l.salesCount, l.netSales, l.grossProfit, l.grossMargin ?? "", l.refundAmount, l.refundRate, l.adSpend, l.avgPrice ?? ""])
    ));
  }
  if (rep.systemProducts && rep.systemProducts.length > 0) {
    blocks.push(toCsv(
      ["\u8D27\u54C1\u540D\u79F0", "\u5546\u5BB6\u7F16\u7801", "\u54C1\u724C", "\u5206\u7C7B", "\u9500\u552E\u989D", "\u9500\u552E\u4EF6\u6570", "\u51C0\u9500", "\u6BDB\u5229", "\u9000\u6B3E\u7387%", "\u63A8\u5E7F\u8D39"],
      rep.systemProducts.map((p) => [p.name, p.code, p.brand ?? "", p.category ?? "", p.sales, p.salesCount ?? "", p.netSales, p.grossProfit, p.refundRate, p.adSpend ?? ""])
    ));
  }
  if (rep.systemSkus && rep.systemSkus.length > 0) {
    blocks.push(toCsv(
      ["\u8D27\u54C1\u540D\u79F0", "\u89C4\u683C\u540D\u79F0", "\u5546\u5BB6\u7F16\u7801", "\u5206\u7C7B", "\u9500\u552E\u989D", "\u9500\u552E\u4EF6\u6570", "\u51C0\u9500", "\u6BDB\u5229", "\u9000\u6B3E\u7387%", "\u63A8\u5E7F\u8D39"],
      rep.systemSkus.map((s) => [s.name, s.specName, s.code, s.category ?? "", s.sales, s.salesCount, s.netSales, s.grossProfit, s.refundRate, s.adSpend ?? ""])
    ));
  }
  return joinCsvBlocks(blocks);
}
function weeklyReportToCsv(rep) {
  const blocks = [];
  if (rep.platformLinks && rep.platformLinks.length > 0) {
    blocks.push(toCsv(
      ["\u5E97\u94FA", "\u94FE\u63A5\u540D\u79F0", "\u94FE\u63A5ID", "\u9500\u552E\u989D", "\u9500\u552E\u4EF6\u6570", "\u51C0\u9500", "\u9000\u6B3E\u989D", "\u9000\u6B3E\u7387%", "\u63A8\u5E7F\u8D39"],
      rep.platformLinks.map((l) => [l.shop, l.linkName, l.linkId, l.sales, l.salesCount, l.netSales, l.refundAmount, l.refundRate, l.adSpend])
    ));
  }
  if (rep.systemProducts && rep.systemProducts.length > 0) {
    blocks.push(toCsv(
      ["\u8D27\u54C1\u540D\u79F0", "\u5546\u5BB6\u7F16\u7801", "\u54C1\u724C", "\u9500\u552E\u989D", "\u51C0\u9500", "\u9000\u6B3E\u7387%", "\u63A8\u5E7F\u8D39"],
      rep.systemProducts.map((p) => [p.name, p.code, p.brand ?? "", p.sales, p.netSales, p.refundRate, p.adSpend ?? ""])
    ));
  }
  if (rep.systemSkus && rep.systemSkus.length > 0) {
    blocks.push(toCsv(
      ["\u8D27\u54C1\u540D\u79F0", "\u89C4\u683C\u540D\u79F0", "\u5546\u5BB6\u7F16\u7801", "\u9500\u552E\u989D", "\u51C0\u9500", "\u9000\u6B3E\u7387%", "\u63A8\u5E7F\u8D39"],
      rep.systemSkus.map((s) => [s.name, s.specName, s.code, s.sales, s.netSales, s.refundRate, s.adSpend ?? ""])
    ));
  }
  return joinCsvBlocks(blocks);
}
function reportsToCsv(monthlyHistory, weekly) {
  const blocks = [];
  for (const rep of monthlyHistory) {
    blocks.push(toCsv(["\u671F\u95F4"], [[`\u6708\u5EA6\u590D\u76D8 ${rep.period || rep.month}`]]));
    const body = monthlyReportToCsv(rep);
    if (body) blocks.push(body);
  }
  if (weekly !== null) {
    blocks.push(toCsv(["\u671F\u95F4"], [[`\u5468\u590D\u76D8 ${weekly.period}`]]));
    const body = weeklyReportToCsv(weekly);
    if (body) blocks.push(body);
  }
  return joinCsvBlocks(blocks);
}
function ordersToCsv(orders) {
  return toCsv(
    ["order_id", "buyer", "sku", "product_name", "quantity", "amount", "status", "created_at", "shipped_at", "tracking_no", "carrier", "refund_reason"],
    orders.map((o) => [
      o.order_id,
      o.buyer,
      o.sku,
      o.product_name,
      o.quantity,
      o.amount,
      o.status,
      o.created_at,
      o.shipped_at ?? "",
      o.tracking_no ?? "",
      o.carrier ?? "",
      o.refund_reason ?? ""
    ])
  );
}

// src/data-evaluation.ts
import { randomUUID } from "node:crypto";
function fmtMoney(v) {
  const n = Number(v) || 0;
  if (n >= 1e4) return "\xA5" + (n / 1e4).toFixed(1) + "\u4E07";
  return "\xA5" + Math.round(n).toLocaleString("zh-CN");
}
function sum(rows, field) {
  return rows.reduce((s, r) => s + (Number(r[field]) || 0), 0);
}
function pickRows(rep) {
  if (!rep) return [];
  const links = rep.platformLinks;
  if (links && links.length) {
    return links.map((l) => ({
      name: String(l.linkName ?? l.linkId ?? ""),
      sales: Number(l.sales) || 0,
      netSales: Number(l.netSales) || 0,
      adSpend: Number(l.adSpend) || 0,
      refundAmount: Number(l.refundAmount) || 0,
      refundRate: Number(l.refundRate) || 0
    }));
  }
  const products = rep.systemProducts;
  if (products && products.length) {
    return products.map((p) => ({
      name: String(p.name ?? ""),
      sales: Number(p.sales) || 0,
      netSales: Number(p.netSales) || 0,
      adSpend: Number(p.adSpend) || 0,
      refundAmount: 0,
      refundRate: Number(p.refundRate) || 0
    }));
  }
  const skus = rep.systemSkus;
  if (skus && skus.length) {
    return skus.map((s) => ({
      name: String(s.specName ?? s.name ?? ""),
      sales: Number(s.sales) || 0,
      netSales: Number(s.netSales) || 0,
      adSpend: Number(s.adSpend) || 0,
      refundAmount: Number(s.refundAmount) || 0,
      refundRate: Number(s.refundRate) || 0
    }));
  }
  return [];
}
function buildEvaluationSummary(cycle, monthlyReport, weeklyReport) {
  const rep = cycle === "7d" ? weeklyReport : monthlyReport;
  const rows = pickRows(rep);
  if (!rows.length) return null;
  let totalSales = sum(rows, "sales");
  let totalNet = sum(rows, "netSales");
  let totalAd = sum(rows, "adSpend");
  let totalRefund = sum(rows, "refundAmount");
  let scope = "ranking";
  const stores = cycle === "30d" ? rep.storeProfit : void 0;
  if (stores && stores.length) {
    totalSales = sum(stores, "sales");
    totalRefund = sum(stores, "refund");
    totalNet = totalSales - totalRefund;
    totalAd = sum(stores, "promoCost");
    scope = "storeProfit";
  }
  const feeRatio = scope === "storeProfit" ? totalSales > 0 ? totalAd / totalSales * 100 : 0 : totalNet > 0 ? totalAd / totalNet * 100 : 0;
  const refundRate = totalSales > 0 ? totalRefund / totalSales * 100 : sum(rows, "refundRate") / rows.length;
  const top = [...rows].sort((a, b) => (Number(b.netSales) || 0) - (Number(a.netSales) || 0))[0];
  const topShare = totalNet > 0 && top ? (Number(top.netSales) || 0) / totalNet * 100 : 0;
  const period = String(rep.period ?? (cycle === "7d" ? "\u672C\u5468" : "\u672C\u6708"));
  return {
    cycle,
    period,
    totalSales,
    totalNet,
    totalAd,
    feeRatio,
    totalRefund,
    refundRate,
    itemCount: rows.length,
    topItem: String(top?.name ?? ""),
    topShare,
    scope
  };
}
function ruleBasedEvaluation(s) {
  const periodLabel2 = s.cycle === "7d" ? "\u672C\u5468" : "\u672C\u6708";
  const issues = [];
  if (s.feeRatio > 20) issues.push("\u63A8\u5E7F\u8D39\u6BD4\u504F\u9AD8");
  if (s.refundRate > 10) issues.push("\u9000\u6B3E\u7387\u504F\u9AD8");
  if (s.topShare > 40) issues.push("\u5934\u90E8\u5546\u54C1\u5360\u6BD4\u8FC7\u9AD8");
  const verdict = issues.length ? issues.join("\u3001") + "\uFF0C\u5EFA\u8BAE\u4F18\u5316\u5BF9\u5E94\u73AF\u8282" : "\u9500\u552E\u4E0E\u8D39\u6548\u6574\u4F53\u5E73\u7A33";
  const scopeTag = s.scope === "storeProfit" ? "\uFF08\u8D22\u52A1\u53E3\u5F84\uFF09" : "";
  const text = `${periodLabel2}\u9500\u552E\u989D${fmtMoney(s.totalSales)}${scopeTag}\uFF0C\u5728\u9500\u5546\u54C1${s.itemCount}\u4E2A\uFF0C\u8D39\u6BD4${s.feeRatio.toFixed(1)}%\uFF0C\u9000\u6B3E\u7387${s.refundRate.toFixed(1)}%\uFF1B${verdict}\u3002`;
  return text.length > 80 ? text.slice(0, 80) : text;
}
function evaluationPrompt(s) {
  const periodLabel2 = s.cycle === "7d" ? "\u672C\u5468" : "\u672C\u6708";
  return [
    `\u8BF7\u57FA\u4E8E\u4EE5\u4E0B${periodLabel2}\u7535\u5546\u7ECF\u8425\u6570\u636E\uFF0C\u4ECE\u300C\u9500\u552E\u989D\u3001\u4EA7\u54C1\u3001\u63A8\u5E7F\u3001\u9000\u6B3E\u300D\u56DB\u4E2A\u89D2\u5EA6\u505A\u4E00\u53E5\u603B\u4F53\u6570\u636E\u8BC4\u4EF7\u3002`,
    `- \u5468\u671F\uFF1A${s.period}`,
    `- \u9500\u552E\u989D\uFF1A${fmtMoney(s.totalSales)}\uFF08\u51C0\u9500 ${fmtMoney(s.totalNet)}\uFF09` + (s.scope === "storeProfit" ? "\uFF08\u53E3\u5F84\uFF1A\u9500\u552E\u989D = \u5229\u6DA6\u8868\u9500\u552E\u6536\u5165 = \u6B63\u5411\u9500\u552E\u989D\uFF1B\u51C0\u9500\u552E\u989D = \u9500\u552E\u6536\u5165 \u2212 \u9000\u6B3E\uFF09" : "\uFF08\u53E3\u5F84\uFF1A\u5546\u54C1\u6392\u540D\u8868\uFF09"),
    `- \u4EA7\u54C1\uFF1A\u5728\u9500\u5546\u54C1 ${s.itemCount} \u4E2A\uFF0C\u5934\u90E8\u5546\u54C1\u300C${s.topItem}\u300D\u51C0\u9500\u5360\u6BD4 ${s.topShare.toFixed(1)}%`,
    `- \u63A8\u5E7F\uFF1A\u63A8\u5E7F\u8D39 ${fmtMoney(s.totalAd)}\uFF0C\u6574\u4F53\u8D39\u6BD4 ${s.feeRatio.toFixed(1)}%`,
    `- \u9000\u6B3E\uFF1A\u9000\u6B3E\u91D1\u989D ${fmtMoney(s.totalRefund)}\uFF0C\u9000\u6B3E\u7387 ${s.refundRate.toFixed(1)}%`,
    "",
    "\u8981\u6C42\uFF1A\u4EC5\u8F93\u51FA\u4E00\u53E5 40~80 \u5B57\u7684\u4E2D\u6587\u8BC4\u4EF7\uFF08\u542B\u6807\u70B9\uFF09\uFF0C\u4E0D\u8981\u6807\u9898\u3001\u4E0D\u8981\u6362\u884C\u3001\u4E0D\u8981\u5217\u8868\u7B26\u53F7\u3001\u4E0D\u8981\u4EFB\u4F55\u89E3\u91CA\u3002"
  ].join("\n");
}
var EVAL_SYSTEM = "\u4F60\u662F\u8D44\u6DF1\u7535\u5546\u6570\u636E\u5206\u6790\u5E08\uFF0C\u5584\u4E8E\u7528\u4E00\u53E5\u8BDD\u7CBE\u51C6\u6982\u62EC\u7ECF\u8425\u6570\u636E\u5E76\u7ED9\u51FA\u53EF\u6267\u884C\u5EFA\u8BAE\u3002";
function cleanEvaluationText(raw) {
  return raw.replace(/^[\s"'“”「」：:]+/, "").replace(/[\s"'“”「」：:]+$/, "").replace(/^(数据评价|评价|结论)[：:]\s*/, "").trim();
}
async function callLlmForEvaluation(ctx, prompt) {
  try {
    if (!ctx || typeof ctx.get !== "function") return null;
    const llm = ctx.get("llm");
    if (!llm || typeof llm.stream !== "function") return null;
    const dm = ctx.get("agentDefaultModel");
    const sel = dm?.currentSelection?.();
    if (!sel || !sel.provider || !sel.model) return null;
    let text = "";
    for await (const chunk of llm.stream({
      provider: sel.provider,
      model: sel.model,
      system: EVAL_SYSTEM,
      messages: [
        {
          id: randomUUID(),
          role: "user",
          content: [{ type: "text", text: prompt }],
          source: { kind: "plugin", plugin: "ecommerce-analyst" }
        }
      ],
      maxTokens: 160,
      temperature: 0.6
    })) {
      if (chunk.type === "text-delta" && typeof chunk.text === "string") text += chunk.text;
      else if (chunk.type === "finish" && chunk.reason && (chunk.reason.kind === "error" || chunk.reason.kind === "aborted")) return null;
    }
    const cleaned = cleanEvaluationText(text);
    if (cleaned.length < 40) return null;
    return cleaned.length > 80 ? cleaned.slice(0, 80) : cleaned;
  } catch (err) {
    console.error("[ecommerce-analyst] AI \u6570\u636E\u8BC4\u4EF7\u751F\u6210\u5931\u8D25\uFF1A", err);
    return null;
  }
}

// src/compare.ts
var COMPARE_KIND_LABELS = {
  platformLinks: "\u5E73\u53F0\u8D27\u54C1\uFF08\u94FE\u63A5\uFF09",
  systemProducts: "\u7CFB\u7EDF\u8D27\u54C1",
  systemSkus: "\u7CFB\u7EDF\u89C4\u683C",
  storeProfit: "\u5E97\u94FA\u5229\u6DA6"
};
var COMPARE_KIND_ORDER = [
  "platformLinks",
  "systemProducts",
  "systemSkus",
  "storeProfit"
];
var metric = (id, label, unit, wavg = false, weight = "sales") => ({
  id,
  label,
  unit,
  wavg,
  weight
});
var CORE_ROW_METRICS = [
  metric("sales", "\u9500\u552E\u989D", "money"),
  metric("netSales", "\u51C0\u9500\u989D", "money"),
  metric("grossProfit", "\u6BDB\u5229", "money"),
  metric("adSpend", "\u63A8\u5E7F\u8D39", "money"),
  metric("refundRate", "\u9000\u6B3E\u7387", "pct", true)
];
var COMPARE_METRICS = {
  platformLinks: CORE_ROW_METRICS,
  systemProducts: CORE_ROW_METRICS,
  systemSkus: CORE_ROW_METRICS,
  storeProfit: [
    metric("sales", "\u9500\u552E\u6536\u5165", "money"),
    metric("netSales", "\u51C0\u9500\u989D", "money"),
    metric("grossProfit", "\u6BDB\u5229", "money"),
    metric("promoCost", "\u63A8\u5E7F\u8D39", "money"),
    metric("feeRatio", "\u8D39\u6BD4", "pct", true)
  ]
};
var CORE_TREND_METRICS = [
  { id: "netSales", label: "\u51C0\u9500\u989D", unit: "money" },
  { id: "skuCount", label: "\u4EA7\u54C1\u89C4\u683C\u6570", unit: "number" },
  { id: "promoCost", label: "\u63A8\u5E7F\u8D39", unit: "money" },
  { id: "grossProfit", label: "\u6BDB\u5229", unit: "money" },
  { id: "feeRatio", label: "\u8D39\u6BD4", unit: "pct" }
];
var round1 = (n) => Math.round(n * 10) / 10;
function buildMonthTrendPoint(rep, kind) {
  const sum3 = function(rows2, f) {
    if (!rows2 || rows2.length === 0) return null;
    let s = 0;
    for (const r of rows2) s += Number(f(r)) || 0;
    return s;
  };
  const month = rep.month || String(rep.period || "").slice(0, 7);
  const mm = Number(month.slice(5, 7));
  const label = Number.isFinite(mm) && mm > 0 ? mm + "\u6708" : month;
  const stores = rep.storeProfit;
  const links = rep.platformLinks;
  const products = rep.systemProducts;
  const skus = rep.systemSkus;
  const pick2 = kind === "systemSkus" ? { kind: "systemSkus", rows: skus } : kind === "systemProducts" ? { kind: "systemProducts", rows: products } : kind === "platformLinks" ? { kind: "platformLinks", rows: links } : links && links.length ? { kind: "platformLinks", rows: links } : products && products.length ? { kind: "systemProducts", rows: products } : skus && skus.length ? { kind: "systemSkus", rows: skus } : { kind: "platformLinks", rows: void 0 };
  if (stores && stores.length) {
    const sales2 = sum3(stores, (r) => r.sales);
    const refund = sum3(stores, (r) => r.refund);
    const netSales2 = sales2 === null ? null : sales2 - (refund ?? 0);
    const grossProfit2 = sum3(stores, (r) => r.grossProfit);
    const promoCost2 = sum3(stores, (r) => r.promoCost);
    const feeRatio2 = promoCost2 !== null && sales2 !== null && sales2 > 0 ? round1(promoCost2 / sales2 * 100) : null;
    return {
      period: rep.period || "",
      month,
      label,
      sales: sales2,
      netSales: netSales2,
      grossProfit: grossProfit2,
      promoCost: promoCost2,
      feeRatio: feeRatio2,
      skuCount: skus ? skus.length : null,
      source: "storeProfit"
    };
  }
  const rows = pick2.rows;
  const sales = sum3(rows, (r) => r.sales);
  const netSales = sum3(rows, (r) => r.netSales);
  const grossProfit = sum3(rows, (r) => r.grossProfit);
  const promoCost = sum3(rows, (r) => r.adSpend);
  const feeRatio = promoCost !== null && netSales !== null && netSales > 0 ? round1(promoCost / netSales * 100) : null;
  return {
    period: rep.period || "",
    month,
    label,
    sales,
    netSales,
    grossProfit,
    promoCost,
    feeRatio,
    skuCount: skus ? skus.length : null,
    source: rows ? pick2.kind : null
  };
}
function buildMonthTrend(history, kind) {
  return history.filter((r) => r !== null && typeof r.period === "string" && r.period !== "").slice().sort((a, b) => a.period < b.period ? -1 : a.period > b.period ? 1 : 0).map((r) => buildMonthTrendPoint(r, kind));
}
function listCompareMetrics(kind) {
  return COMPARE_METRICS[kind] ?? [];
}
function compareKindLabel(kind) {
  return COMPARE_KIND_LABELS[kind] ?? kind;
}
function chapterRows(report, kind) {
  if (report === null || typeof report !== "object") return void 0;
  if (kind === "storeProfit") {
    return report.storeProfit;
  }
  const arr = report[kind];
  return Array.isArray(arr) ? arr : void 0;
}
function keyOf(kind, row) {
  const s = (v) => String(v ?? "").trim();
  if (kind === "platformLinks") {
    const id = s(row.linkId);
    if (id) return "id:" + id;
    return "nm:" + s(row.linkName) + "|" + s(row.shop);
  }
  if (kind === "systemProducts") {
    const code = s(row.code);
    if (code) return "code:" + code;
    return "nm:" + s(row.name);
  }
  if (kind === "systemSkus") {
    const code = s(row.code);
    if (code) return "code:" + code;
    return "nm:" + s(row.name) + "|" + s(row.specName);
  }
  return "nm:" + s(row.store);
}
function labelOf(kind, row) {
  const s = (v) => String(v ?? "").trim();
  if (kind === "platformLinks") return s(row.linkName) || s(row.linkId);
  if (kind === "systemProducts") return s(row.name);
  if (kind === "systemSkus") return s(row.name) ? s(row.name) + (s(row.specName) ? " \xB7 " + s(row.specName) : "") : s(row.specName);
  return s(row.store);
}
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function codeOf(kind, row) {
  if (kind === "storeProfit") return "";
  if (kind === "platformLinks") return String(row.linkCode ?? row.linkId ?? "").trim();
  return String(row.code ?? "").trim();
}
function netOf(row) {
  if (row.netSales !== void 0 && row.netSales !== null && String(row.netSales).trim() !== "") return num(row.netSales);
  const refund = row.refund ?? row.refundAmount ?? 0;
  return num(row.sales) - num(refund);
}
function normalize(kind, rows, def) {
  const out = /* @__PURE__ */ new Map();
  for (const raw of rows ?? []) {
    if (raw === null || typeof raw !== "object") continue;
    const row = raw;
    const present = (...fields) => fields.some((f) => String(f ?? "").trim() !== "");
    if (kind === "platformLinks" && !present(row.linkId, row.linkName, row.shop)) continue;
    if (kind === "systemProducts" && !present(row.code, row.name)) continue;
    if (kind === "systemSkus" && !present(row.code, row.name, row.specName)) continue;
    if (kind === "storeProfit" && !present(row.store)) continue;
    const key = keyOf(kind, row);
    const value = num(row[def.id]);
    const weightField = def.weight ?? "sales";
    const weight = num(row[weightField]);
    const category = String(row.category ?? "").trim();
    const code = codeOf(kind, row);
    const gp = num(row.grossProfit);
    const net = netOf(row);
    const cur = out.get(key);
    if (cur) {
      cur.value += value;
      cur.weight += weight;
      cur.gp += gp;
      cur.net += net;
      if (!cur.category && category) cur.category = category;
      if (!cur.code && code) cur.code = code;
    } else {
      out.set(key, { key, label: labelOf(kind, row) || key, value, weight, category, code, gp, net });
    }
  }
  return [...out.values()];
}
function aggregate(def, entries) {
  if (def.wavg) {
    const w = entries.reduce((s, e) => s + e.weight, 0);
    if (w <= 0) return 0;
    return entries.reduce((s, e) => s + e.value * e.weight, 0) / w;
  }
  return entries.reduce((s, e) => s + e.value, 0);
}
function rankOf(values) {
  const order = values.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
  const rank = new Array(values.length);
  order.forEach((o, pos) => {
    rank[o.i] = pos + 1;
  });
  return rank;
}
function buildCompare(input) {
  const { cycle, kind, metricId, prevReport, currReport } = input;
  const defs = COMPARE_METRICS[kind];
  if (!defs) return null;
  const def = defs.find((m) => m.id === metricId) ?? defs[0];
  if (!def) return null;
  const prevRows = chapterRows(prevReport, kind);
  const currRows = chapterRows(currReport, kind);
  if (!Array.isArray(prevRows) || !Array.isArray(currRows)) return null;
  if (prevRows.length === 0 && currRows.length === 0) return null;
  const prevEntries = normalize(kind, prevRows, def);
  const currEntries = normalize(kind, currRows, def);
  if (prevEntries.length === 0 && currEntries.length === 0) return null;
  const prevMap = new Map(prevEntries.map((e) => [e.key, e]));
  const currMap = new Map(currEntries.map((e) => [e.key, e]));
  const rankOfEntries = (entries) => {
    const values = entries.map((e) => e.value);
    const ranks = rankOf(values);
    const map = /* @__PURE__ */ new Map();
    entries.forEach((e, i) => map.set(e.key, ranks[i]));
    return map;
  };
  const prevRank = rankOfEntries(prevEntries);
  const currRank = rankOfEntries(currEntries);
  const rows = [];
  let matched = 0;
  let added = 0;
  let removed = 0;
  let rankUp = 0;
  let rankDown = 0;
  const allKeys = /* @__PURE__ */ new Set([...prevMap.keys(), ...currMap.keys()]);
  for (const key of allKeys) {
    const p = prevMap.get(key);
    const c = currMap.get(key);
    let state;
    let prevV;
    let currV;
    if (p && c) {
      state = "shared";
      matched++;
      prevV = p.value;
      currV = c.value;
      const rp = prevRank.get(key);
      const rc = currRank.get(key);
      if (rp !== void 0 && rc !== void 0 && rp !== rc) {
        if (rc < rp) rankUp++;
        else rankDown++;
      }
    } else if (c) {
      state = "added";
      added++;
      prevV = null;
      currV = c.value;
    } else {
      state = "removed";
      removed++;
      prevV = p.value;
      currV = null;
    }
    const a = prevV ?? 0;
    const b = currV ?? 0;
    const delta2 = b - a;
    const deltaPct2 = def.unit === "pct" || a === 0 ? null : delta2 / a * 100;
    const marginOf = (e) => e && e.net > 0 ? round1(e.gp / e.net * 100) : null;
    rows.push({
      key,
      label: (p ?? c).label,
      prev: prevV,
      curr: currV,
      delta: delta2,
      deltaPct: deltaPct2,
      rankPrev: p ? prevRank.get(key) ?? null : null,
      rankCurr: c ? currRank.get(key) ?? null : null,
      rankShift: p && c ? (prevRank.get(key) ?? 0) - (currRank.get(key) ?? 0) : null,
      state,
      category: (p ?? c).category,
      code: (p ?? c).code,
      prevMargin: marginOf(p),
      currMargin: marginOf(c)
    });
  }
  const prevTotal = aggregate(def, prevEntries);
  const currTotal = aggregate(def, currEntries);
  const delta = currTotal - prevTotal;
  const deltaPct = def.unit === "pct" || prevTotal === 0 ? null : delta / prevTotal * 100;
  const limit = Math.max(1, Math.min(input.limit ?? 100, 1e3));
  const sorted = rows.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta)).slice(0, limit);
  const prevPeriod = periodLabel(prevReport);
  const currPeriod = periodLabel(currReport);
  return {
    cycle,
    kind,
    kindLabel: compareKindLabel(kind),
    metric: def.id,
    metricLabel: def.label,
    unit: def.unit,
    prevPeriod,
    currPeriod,
    summary: { prevTotal, currTotal, delta, deltaPct, matched, added, removed, rankUp, rankDown },
    rows: sorted
  };
}
function periodLabel(report) {
  if (report === null || typeof report !== "object") return "";
  const rep = report;
  return String(rep.period ?? rep.month ?? "");
}
function pickCompareKind(cycle, prevReport, currReport) {
  const kinds = cycle === "7d" ? COMPARE_KIND_ORDER.filter((k) => k !== "storeProfit") : COMPARE_KIND_ORDER;
  for (const k of kinds) {
    const p = chapterRows(prevReport, k);
    const c = chapterRows(currReport, k);
    if (Array.isArray(p) && Array.isArray(c) && p.length > 0 && c.length > 0) return k;
  }
  for (const k of kinds) {
    const p = chapterRows(prevReport, k);
    const c = chapterRows(currReport, k);
    if (Array.isArray(p) && p.length > 0 && Array.isArray(c) && c.length > 0) continue;
    if (Array.isArray(p) && p.length > 0 || Array.isArray(c) && c.length > 0) return k;
  }
  return kinds[0];
}
function reportKindsAvail(cycle, prevReport, currReport) {
  const kinds = cycle === "7d" ? COMPARE_KIND_ORDER.filter((k) => k !== "storeProfit") : COMPARE_KIND_ORDER;
  return kinds.map((k) => {
    const p = chapterRows(prevReport, k);
    const c = chapterRows(currReport, k);
    return {
      kind: k,
      label: compareKindLabel(k),
      prev: Array.isArray(p) ? p.length : 0,
      curr: Array.isArray(c) ? c.length : 0
    };
  });
}

// src/compare-payload.ts
var CYCLES = ["30d", "7d"];
var KINDS = ["platformLinks", "systemProducts", "systemSkus", "storeProfit"];
function isCompareCycle(v) {
  return CYCLES.indexOf(v) !== -1;
}
function isCompareKind(v) {
  return KINDS.indexOf(v) !== -1;
}
function buildComparePayload(store, cycle, kind, metricId, limit = 100) {
  const prevReport = cycle === "7d" ? store.getPreviousWeeklyReport() : store.getPreviousMonthlyReport();
  const currReport = cycle === "7d" ? store.getWeeklyReport() : store.getMonthlyReport();
  const kinds = reportKindsAvail(cycle, prevReport, currReport);
  const effectiveKind = kind !== void 0 && isCompareKind(kind) ? kind : pickCompareKind(cycle, prevReport, currReport);
  const trend = cycle === "30d" ? buildMonthTrend(store.getMonthlyHistory(), effectiveKind) : [];
  const defs = listCompareMetrics(effectiveKind);
  const def = defs.find((m) => m.id === metricId) ?? defs[0];
  const result = buildCompare({
    cycle,
    kind: effectiveKind,
    metricId: def ? def.id : "sales",
    prevReport,
    currReport,
    limit
  });
  return {
    hasPrev: prevReport !== null,
    prevPeriod: prevReport && prevReport.period || "",
    currPeriod: currReport && currReport.period || "",
    kinds,
    metrics: defs.map((m) => ({ id: m.id, label: m.label, unit: m.unit })),
    result,
    trend,
    trendMetrics: CORE_TREND_METRICS,
    // 模块出现条件（严格隔离）：30d 需连续导入 ≥2 个月归档；7d 需存在上一期且两期有可比对象。
    // 一键清除后归档为空 → hasPrev=false、trend=[]、result=null → showModule=false，菜单必隐藏。
    showModule: cycle === "30d" ? trend.length >= 2 : prevReport !== null && result !== null
  };
}

// src/new-products.ts
function newProductSideOf(p) {
  if (!p.available) return null;
  return {
    period: p.period,
    basis: p.basis,
    basisLabel: p.basisLabel,
    newCnt: p.newCnt,
    specCnt: p.specCnt,
    oldCnt: p.oldCnt,
    newSales: p.newSales,
    totalSales: p.totalSales,
    newShare: p.newShare,
    newGm: p.newGm,
    oldGm: p.oldGm,
    newRr: p.newRr,
    oldRr: p.oldRr,
    top1Share: p.top1Share,
    top1Name: p.top1Name
  };
}
function monthLabel(month) {
  const m = String(month ?? "").match(/^(\d{4})-(\d{2})$/);
  if (!m) return "";
  return m[1].slice(2) + "\u5E74" + String(Number(m[2])) + "\u6708";
}
function asMonthLabel(v) {
  const m = String(v ?? "").trim().match(/^(\d{2})年(\d{1,2})月$/);
  return m ? m[1] + "\u5E74" + String(Number(m[2])) + "\u6708" : "";
}
function weighted(items, weights) {
  let sw = 0;
  let sv = 0;
  for (let i = 0; i < items.length; i++) {
    const w = Number(weights[i]) || 0;
    sw += w;
    sv += (Number(items[i]) || 0) * w;
  }
  return sw > 0 ? sv / sw : 0;
}
function sumBy(arr, f) {
  let s = 0;
  for (const x of arr) s += Number(f(x)) || 0;
  return s;
}
function prodKey(p) {
  const c = String(p.code ?? "").trim();
  return c || String(p.name ?? "").trim();
}
function prodNameKey(p) {
  return String(p.name ?? "").trim();
}
function specNameKey(s) {
  return String(s.name ?? "").trim() + "\0" + String(s.specName ?? "").trim();
}
var EMPTY = (reason, period = "", prevPeriod = "", hasPrev = false) => ({
  available: false,
  reason,
  basis: "none",
  basisLabel: "",
  period,
  prevPeriod,
  hasPrev,
  newCnt: 0,
  specCnt: 0,
  oldCnt: 0,
  newSales: 0,
  totalSales: 0,
  newShare: 0,
  newUnits: 0,
  newCost: 0,
  costRate: 0,
  newGm: 0,
  oldGm: 0,
  newRr: 0,
  oldRr: 0,
  newRt: 0,
  oldRt: 0,
  refundPre: 0,
  refundPost: 0,
  refundReceived: 0,
  top1Share: 0,
  top1Name: "",
  top10: [],
  donut: { newSales: 0, oldSales: 0 },
  specTop10: [],
  specPie: { prodName: "", items: [] },
  specDist: [],
  products: [],
  specs: [],
  prevSide: null
});
function buildNewProductPayload(store) {
  const curr = store.getMonthlyReport();
  const prev = store.getPreviousMonthlyReport();
  const payload = computeNewProducts(curr, prev);
  if (prev) {
    const history = store.getMonthlyHistory();
    const idx = history.findIndex((r) => r.period === prev.period);
    const before = idx > 0 ? history[idx - 1] : null;
    const side = computeNewProducts(prev, before ?? null);
    payload.prevSide = newProductSideOf(side);
  }
  return payload;
}
function computeNewProducts(curr, prev) {
  const period = curr && curr.period || "";
  const prevPeriod = prev && prev.period || "";
  const hasPrev = prev !== null;
  if (!curr) return EMPTY("\u6682\u65E0\u5BFC\u5165\u6570\u636E\uFF1A\u8BF7\u5148\u5BFC\u5165\u6708\u5EA6\u590D\u76D8\uFF0830 \u5929\u5468\u671F\uFF094 \u4EFD\u6587\u4EF6\u3002", period, prevPeriod, hasPrev);
  const allProd = Array.isArray(curr.systemProducts) ? curr.systemProducts : [];
  const allSku = Array.isArray(curr.systemSkus) ? curr.systemSkus : [];
  if (allProd.length === 0 && allSku.length === 0) {
    return EMPTY("\u672C\u671F\u6708\u5EA6\u590D\u76D8\u7F3A\u5C11\u7CFB\u7EDF\u8D27\u54C1\u8868\u4E0E\u7CFB\u7EDF\u89C4\u683C\u8868\uFF1A\u65E0\u6CD5\u5224\u5B9A\u65B0\u54C1\uFF0C\u8BF7\u91CD\u65B0\u5BFC\u5165\u6708\u5EA6\u590D\u76D8 4 \u4EFD\u6587\u4EF6\u3002", period, prevPeriod, hasPrev);
  }
  const label = monthLabel(curr.month);
  const prevProds = prev && Array.isArray(prev.systemProducts) ? prev.systemProducts : [];
  const prevSkus = prev && Array.isArray(prev.systemSkus) ? prev.systemSkus : [];
  let basis = "none";
  let newProd = [];
  let newSku = [];
  let basisLabel = "";
  if (label) {
    newProd = allProd.filter((p) => asMonthLabel(p.category) === label);
    newSku = allSku.filter((s) => asMonthLabel(s.category) === label);
    if (newProd.length > 0 || newSku.length > 0) {
      basis = "category";
      basisLabel = "\u65B0\u54C1 = \u6708\u5EA6\u8868\u300C\u5206\u7C7B\u300D\u5217\u4E0A\u5E02\u6708\u4EFD = " + label + "\uFF08\u4E0E\u672C\u671F\u62A5\u8868\u6708\u4EFD\u4E00\u81F4\uFF09";
    }
  }
  if (basis === "none" && prevProds.length > 0) {
    const seen = new Set(prevProds.map((p) => prodNameKey(p)));
    newProd = allProd.filter((p) => !seen.has(prodNameKey(p)));
    basis = "newcomer";
    basisLabel = "\u672C\u671F\u8868\u300C\u5206\u7C7B\u300D\u5217\u65E0\u4E0A\u5E02\u6708\u4EFD\u6807\u7B7E\uFF0C\u6539\u7528\u300C" + prevPeriod + " \u672A\u51FA\u73B0\u3001" + period + " \u9996\u6B21\u51FA\u73B0\u300D\u5224\u5B9A\u65B0\u54C1";
  }
  if (basis !== "none" && newSku.length === 0 && prevSkus.length > 0) {
    const seenSku = new Set(prevSkus.map((s) => specNameKey(s)));
    newSku = allSku.filter((s) => !seenSku.has(specNameKey(s)));
  }
  if (basis === "category" && newSku.length === 0 && allSku.length > 0) {
    const newNames = new Set(newProd.map((p) => String(p.name ?? "")));
    newSku = allSku.filter((s) => newNames.has(String(s.name ?? "")));
  }
  if (basis === "none" || newProd.length === 0 && newSku.length === 0) {
    const why = hasPrev || label ? "\u672C\u671F\u672A\u8BC6\u522B\u5230\u65B0\u54C1\uFF1A\u6708\u5EA6\u8868\u300C\u5206\u7C7B\u300D\u5217\u65E2\u65E0\u4E0E\u672C\u671F\u6708\u4EFD\u4E00\u81F4\u7684\u4E0A\u5E02\u6807\u7B7E\uFF0C\u4E5F\u65E0\u53EF\u6BD4\u4E0A\u4E00\u671F\u7528\u4E8E\u300C\u9996\u6B21\u4E0A\u699C\u300D\u5224\u5B9A\u3002" : "\u672C\u671F\u672A\u8BC6\u522B\u5230\u65B0\u54C1\uFF1A\u6708\u5EA6\u8868\u300C\u5206\u7C7B\u300D\u5217\u65E0\u4E0A\u5E02\u6708\u4EFD\u6807\u7B7E\uFF0C\u4E14\u5C1A\u672A\u5BFC\u5165\u4E0A\u4E00\u671F\uFF0C\u65E0\u6CD5\u505A\u300C\u9996\u6B21\u51FA\u73B0\u300D\u5224\u5B9A\u3002\u8BF7\u518D\u5BFC\u5165\u4E0A\u4E00\u671F\u6708\u5EA6\u590D\u76D8\u540E\u67E5\u770B\u3002";
    return EMPTY(why, period, prevPeriod, hasPrev);
  }
  const newKeySet = new Set(newProd.map((p) => prodKey(p)));
  const oldProd = allProd.filter((p) => !newKeySet.has(prodKey(p)));
  const newSales = sumBy(newProd, (p) => p.sales);
  const totalSales = sumBy(allProd, (p) => p.sales);
  const newSkuSales = sumBy(newSku, (s) => s.sales);
  const newUnits = sumBy(newSku, (s) => s.salesCount);
  const newCost = sumBy(newSku, (s) => s.salesCost);
  const costRate = newSkuSales > 0 ? newCost / newSkuSales * 100 : 0;
  const refundPre = weighted(newSku.map((s) => s.preShipRefundRate), newSku.map((s) => s.sales));
  const refundPost = weighted(newSku.map((s) => s.postShipRefundRate), newSku.map((s) => s.sales));
  const refundReceived = weighted(newSku.map((s) => s.receivedRefundRate), newSku.map((s) => s.sales));
  const oldSales = sumBy(oldProd, (p) => p.sales);
  const newNet = sumBy(newProd, (p) => p.netSales);
  const oldNet = sumBy(oldProd, (p) => p.netSales);
  const newGm = newNet > 0 ? sumBy(newProd, (p) => p.grossProfit) / newNet * 100 : 0;
  const oldGm = oldNet > 0 ? sumBy(oldProd, (p) => p.grossProfit) / oldNet * 100 : 0;
  const newRr = weighted(newProd.map((p) => p.refundRate), newProd.map((p) => p.sales));
  const oldRr = weighted(oldProd.map((p) => p.refundRate), oldProd.map((p) => p.sales));
  const newRt = weighted(newProd.map((p) => p.returnRate), newProd.map((p) => p.sales));
  const oldRt = weighted(oldProd.map((p) => p.returnRate), oldProd.map((p) => p.sales));
  const specCntOf = /* @__PURE__ */ new Map();
  for (const s of newSku) {
    const k = String(s.name ?? "");
    specCntOf.set(k, (specCntOf.get(k) ?? 0) + 1);
  }
  const postShipOf = /* @__PURE__ */ new Map();
  const postShipW = /* @__PURE__ */ new Map();
  for (const s of newSku) {
    const k = String(s.name ?? "");
    if (!postShipOf.has(k)) {
      postShipOf.set(k, []);
      postShipW.set(k, []);
    }
    postShipOf.get(k).push(s.postShipRefundRate);
    postShipW.get(k).push(s.sales);
  }
  const products = newProd.map((p) => ({
    name: String(p.name ?? ""),
    code: String(p.code ?? ""),
    brand: String(p.brand ?? ""),
    category: String(p.category ?? ""),
    specCount: specCntOf.get(String(p.name ?? "")) ?? 0,
    sales: p.sales,
    netSales: p.netSales,
    grossProfit: p.grossProfit,
    grossMargin: p.grossMargin,
    salesCount: sumBy(newSku.filter((s) => String(s.name ?? "") === String(p.name ?? "")), (s) => s.salesCount),
    salesCost: sumBy(newSku.filter((s) => String(s.name ?? "") === String(p.name ?? "")), (s) => s.salesCost),
    refundRate: p.refundRate,
    returnRate: p.returnRate,
    postShipRefundRate: weighted(postShipOf.get(String(p.name ?? "")) ?? [], postShipW.get(String(p.name ?? "")) ?? []),
    adSpend: p.adSpend
  })).sort((a, b) => b.sales - a.sales);
  const specs = newSku.map((s) => ({
    name: String(s.name ?? ""),
    specName: String(s.specName ?? ""),
    code: String(s.code ?? ""),
    sales: s.sales,
    netSales: s.netSales,
    grossProfit: s.grossProfit,
    grossMargin: s.grossMargin,
    salesCount: s.salesCount,
    salesCost: s.salesCost,
    refundRate: s.refundRate,
    returnRate: s.returnRate,
    preShipRefundRate: s.preShipRefundRate,
    postShipRefundRate: s.postShipRefundRate,
    receivedRefundRate: s.receivedRefundRate
  })).sort((a, b) => b.sales - a.sales);
  const top1 = products[0];
  const top1Share = top1 && newSales > 0 ? top1.sales / newSales * 100 : 0;
  const specDist = [...specCntOf.entries()].map(([name2, cnt]) => ({ name: name2, cnt })).sort((a, b) => b.cnt - a.cnt).slice(0, 15).reverse();
  const pieProd = top1 ? top1.name : "";
  const pieAll = specs.filter((s) => s.name === pieProd).slice(0, 8);
  const pieRest = specs.filter((s) => s.name === pieProd).slice(8);
  const specPieItems = pieAll.map((s) => ({ name: s.specName, value: s.sales }));
  if (pieRest.length) specPieItems.push({ name: "\u5176\u4ED6\u89C4\u683C", value: sumBy(pieRest, (s) => s.sales) });
  return {
    available: true,
    reason: "",
    basis,
    basisLabel,
    period,
    prevPeriod,
    hasPrev,
    newCnt: products.length,
    specCnt: specs.length,
    oldCnt: oldProd.length,
    newSales,
    totalSales,
    newShare: totalSales > 0 ? newSales / totalSales * 100 : 0,
    newUnits,
    newCost,
    costRate,
    newGm,
    oldGm,
    newRr,
    oldRr,
    newRt,
    oldRt,
    refundPre,
    refundPost,
    refundReceived,
    top1Share,
    top1Name: pieProd,
    top10: products.slice(0, 10).reverse().map((p) => ({ name: p.name, sales: p.sales, netSales: p.netSales })),
    donut: { newSales, oldSales },
    specTop10: specs.slice(0, 10).reverse().map((s) => ({ name: s.specName, sales: s.sales })),
    specPie: { prodName: pieProd, items: specPieItems },
    specDist,
    products,
    specs,
    prevSide: null
    // 由 buildNewProductPayload 用上一期数据回填
  };
}

// src/files.ts
import { createReadStream } from "node:fs";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { extname, join as join3, resolve as resolve2, sep } from "node:path";
var CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "accept, content-type, origin",
  "access-control-max-age": "600"
};
var MIME = {
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".csv": "text/csv",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".ppt": "application/vnd.ms-powerpoint",
  ".zip": "application/zip",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".html": "text/html",
  ".xml": "application/xml",
  ".sql": "text/plain",
  ".log": "text/plain"
};
function resolveFilesDirs(cfg) {
  const inboxDir = process.env.ECOM_FILES_INBOX?.trim() || resolveDir(cfg.inboxDir, join3("data", "files", "inbox"));
  const outboxDir = process.env.ECOM_FILES_OUTBOX?.trim() || resolveDir(cfg.outboxDir, join3("data", "files", "outbox"));
  return { inboxDir, outboxDir, maxBytes: cfg.maxBytes };
}
function dirPath(dirs, dir) {
  const base = dir === "outbox" ? dirs.outboxDir : dirs.inboxDir;
  return resolve2(base);
}
function sanitizeName(raw) {
  const base = String(raw ?? "").replace(/\\/g, "/").split("/").pop() ?? "";
  const cleaned = base.replace(/[\u0000-\u001f]/g, "").trim();
  if (cleaned === "" || cleaned === "." || cleaned === "..") throw new Error("\u975E\u6CD5\u6587\u4EF6\u540D");
  return cleaned;
}
function targetPath(dirs, dir, name2) {
  const root = dirPath(dirs, dir);
  const target = join3(root, sanitizeName(name2));
  if (target !== root && !target.startsWith(root + sep)) throw new Error("\u8DEF\u5F84\u8D8A\u754C");
  return target;
}
function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...CORS
  });
  res.end(JSON.stringify(body));
}
function sendPreflight(res) {
  res.writeHead(204, { ...CORS });
  res.end();
}
function readBody(req, maxBytes) {
  return new Promise((resolve3, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error(`\u6587\u4EF6\u8D85\u8FC7\u5927\u5C0F\u4E0A\u9650(${Math.round(maxBytes / 1024 / 1024)}MB)`));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve3(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
async function handleFilesRoute(req, res, pathname, query, dirs) {
  if (req.method === "OPTIONS") {
    sendPreflight(res);
    return true;
  }
  try {
    if (pathname === "/ecommerce-api/files/upload" && req.method === "POST") {
      const name2 = sanitizeName(String(query.get("name") ?? ""));
      await mkdir(dirPath(dirs, "inbox"), { recursive: true });
      const target = targetPath(dirs, "inbox", name2);
      const body = await readBody(req, dirs.maxBytes);
      const { writeFile } = await import("node:fs/promises");
      await writeFile(target, body);
      const st = await stat(target);
      sendJson(res, 200, {
        ok: true,
        value: { name: name2, size: st.size, dir: "inbox" },
        hint: `\u5DF2\u4E0A\u4F20\u5230\u6536\u4EF6\u7BB1 inbox/${name2},\u53BB\u4F1A\u8BDD\u91CC\u8BA9 AI \u5904\u7406\u5373\u53EF`
      });
      return true;
    }
    if (pathname === "/ecommerce-api/files/list" && req.method === "GET") {
      const dir = query.get("dir") === "outbox" ? "outbox" : "inbox";
      await mkdir(dirPath(dirs, dir), { recursive: true });
      const entries = await readdir(dirPath(dirs, dir), { withFileTypes: true });
      const files = [];
      for (const e of entries) {
        if (!e.isFile()) continue;
        const st = await stat(join3(dirPath(dirs, dir), e.name)).catch(() => null);
        if (st === null) continue;
        files.push({ name: e.name, size: st.size, modified: st.mtimeMs, dir });
      }
      files.sort((a, b) => b.modified - a.modified);
      sendJson(res, 200, { ok: true, value: { dir, files } });
      return true;
    }
    if (pathname === "/ecommerce-api/files/download" && req.method === "GET") {
      const dir = query.get("dir") === "outbox" ? "outbox" : "inbox";
      const name2 = sanitizeName(String(query.get("name") ?? ""));
      const target = targetPath(dirs, dir, name2);
      const st = await stat(target).catch(() => null);
      if (st === null || !st.isFile()) {
        sendJson(res, 404, { ok: false, error: { code: "NOT_FOUND", message: "\u6587\u4EF6\u4E0D\u5B58\u5728" } });
        return true;
      }
      const mime = MIME[extname(name2).toLowerCase()] ?? "application/octet-stream";
      res.writeHead(200, {
        "content-type": mime,
        "content-length": String(st.size),
        "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name2)}`,
        "cache-control": "no-store",
        ...CORS
      });
      createReadStream(target).pipe(res);
      return true;
    }
    if (pathname === "/ecommerce-api/files/delete" && req.method === "POST") {
      const dir = query.get("dir") === "outbox" ? "outbox" : "inbox";
      const name2 = sanitizeName(String(query.get("name") ?? ""));
      const target = targetPath(dirs, dir, name2);
      await rm(target, { force: true });
      sendJson(res, 200, { ok: true, value: { name: name2, dir } });
      return true;
    }
  } catch (err) {
    sendJson(res, 400, {
      ok: false,
      error: { code: "FILES_FAILED", message: err instanceof Error ? err.message : String(err) }
    });
    return true;
  }
  return false;
}

// src/shop-api.ts
var CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "accept, content-type, origin",
  "access-control-max-age": "600"
};
function sendJson2(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...CORS_HEADERS
  });
  res.end(text);
}
function sendPreflight2(res) {
  res.writeHead(204, {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "accept, content-type, origin",
    "access-control-max-age": "600"
  });
  res.end();
}
function injectApiBase(webServer) {
  if (typeof webServer.tapIndex !== "function") return void 0;
  const port = webServer.port;
  const base = port ? `http://127.0.0.1:${port}` : "";
  return webServer.tapIndex((html) => {
    const tag = base ? `<script>window.__ECOM_API_BASE__ = ${JSON.stringify(base)};</script>` : '<script>window.__ECOM_API_BASE__ = "";</script>';
    if (html.includes("__ECOM_API_BASE__")) return html;
    return html.replace("</head>", tag + "</head>");
  });
}
function readJsonBody(req) {
  return new Promise((resolve3, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 64 * 1024 * 1024) {
        reject(new Error("\u8BF7\u6C42\u4F53\u8FC7\u5927\uFF08>64MB\uFF09"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve3(text ? JSON.parse(text) : {});
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
    req.on("error", reject);
  });
}
var evaluationCache = /* @__PURE__ */ new Map();
var evaluationPending = /* @__PURE__ */ new Set();
async function generateEvaluation(cacheKey, summary, ctx) {
  if (evaluationPending.has(cacheKey)) return;
  evaluationPending.add(cacheKey);
  try {
    let text = await callLlmForEvaluation(ctx, evaluationPrompt(summary));
    let source = "ai";
    if (text === null || text.length < 40) {
      text = ruleBasedEvaluation(summary);
      source = "rule";
    }
    if (text.length > 80) text = text.slice(0, 80);
    evaluationCache.set(cacheKey, { text, source, pending: false });
  } catch (err) {
    evaluationCache.set(cacheKey, { text: ruleBasedEvaluation(summary), source: "rule", pending: false });
  } finally {
    evaluationPending.delete(cacheKey);
  }
}
function ensureEvaluation(cacheKey, summary, ctx) {
  const cached = evaluationCache.get(cacheKey);
  if (cached && !cached.pending) return cached;
  if (!cached) {
    evaluationCache.set(cacheKey, { text: ruleBasedEvaluation(summary), source: "rule", pending: true });
  }
  void generateEvaluation(cacheKey, summary, ctx);
  return evaluationCache.get(cacheKey);
}
function prewarmEvaluations(store, ctx) {
  const revision = store.getReportRevision();
  const monthlyReport = store.getMonthlyReport();
  const weeklyReport = store.getWeeklyReport();
  for (const cycle of ["30d", "7d"]) {
    const summary = buildEvaluationSummary(cycle, monthlyReport, weeklyReport);
    if (summary === null) continue;
    void generateEvaluation(cycle + ":" + revision, summary, ctx);
  }
}
function registerShopApi(webServer, store, ctx = {}, filesDirs) {
  return webServer.register({
    kind: "prefix",
    path: "/ecommerce-api",
    handler: async (req, res) => {
      const raw = String(req.url ?? "/");
      const pathname = raw.split("?")[0] ?? raw;
      const query = new URL(raw, "http://localhost").searchParams;
      try {
        if (req.method === "OPTIONS") {
          sendPreflight2(res);
          return;
        }
        if (pathname === "/ecommerce-api/import-batch" && req.method === "POST") {
          const body = await readJsonBody(req);
          const rawFiles = Array.isArray(body.files) ? body.files : [];
          if (rawFiles.length === 0) {
            sendJson2(res, 400, {
              ok: false,
              error: { code: "NO_FILES", message: "\u672A\u6536\u5230\u4EFB\u4F55\u6587\u4EF6\uFF08files \u4E3A\u7A7A\uFF09" }
            });
            return;
          }
          const files = rawFiles.map((f) => {
            const o = f ?? {};
            return {
              filename: String(o.filename ?? ""),
              content: String(o.content ?? ""),
              encoding: o.encoding === "base64" ? "base64" : "utf8"
            };
          });
          const parsedList = await Promise.all(
            files.map(async (f) => {
              try {
                return await parseImportFile(f.filename, f.content, f.encoding);
              } catch (e) {
                return { hint: "\u8DF3\u8FC7\u6587\u4EF6 " + f.filename + "\uFF1A" + (e instanceof Error ? e.message : String(e)) };
              }
            })
          );
          const snapshot = store.exportBackup();
          const monthlyParts = [];
          const weeklyParts = [];
          let monthlyReport;
          let products;
          let orders;
          for (const p of parsedList) {
            if (p.monthlyPart !== void 0) monthlyParts.push(p.monthlyPart);
            if (p.monthlyReport !== void 0) monthlyReport = p.monthlyReport;
            if (p.weeklyReport !== void 0) weeklyParts.push(p.weeklyReport);
            if (p.products !== void 0) products = p.products;
            if (p.orders !== void 0) orders = p.orders;
          }
          let productCount = store.listProducts({ page_size: 1 }).total;
          let orderCount = store.listOrders({ page_size: 1 }).total;
          if (products !== void 0 || orders !== void 0) {
            const r = store.importFromFile(products, orders);
            productCount = r.products;
            orderCount = r.orders;
          }
          if (monthlyParts.length > 0) {
            store.importMonthlyReport(monthlyParts);
          } else if (monthlyReport !== void 0) {
            store.setMonthlyReport(monthlyReport);
          }
          for (const w of weeklyParts) {
            store.mergeWeeklyReport(w);
          }
          prewarmEvaluations(store, ctx);
          sendJson2(res, 200, {
            ok: true,
            value: {
              products: productCount,
              orders: orderCount,
              files: files.length,
              monthlyReport: store.getMonthlyReport() !== null,
              weeklyReport: store.getWeeklyReport() !== null,
              hint: `\u6279\u91CF\u5BFC\u5165 ${files.length} \u4E2A\u6587\u4EF6\uFF1A${parsedList.map((p) => p.hint).join("\uFF1B")}`,
              snapshot
            }
          });
          return;
        }
        if (pathname === "/ecommerce-api/clear-data" && req.method === "POST") {
          const r = store.clearAllData();
          sendJson2(res, 200, {
            ok: true,
            value: {
              clearedProducts: r.products,
              clearedOrders: r.orders,
              hint: `\u5DF2\u6E05\u9664 ${r.products} \u6761\u5546\u54C1\u3001${r.orders} \u6761\u8BA2\u5355\u53CA\u5168\u90E8\u6708/\u5468\u590D\u76D8\u4E0E\u5BF9\u6BD4\u5F52\u6863`
            }
          });
          return;
        }
        if (pathname === "/ecommerce-api/monthly-report") {
          sendJson2(res, 200, { ok: true, value: store.getMonthlyReport(), revision: store.getReportRevision() });
          return;
        }
        if (pathname === "/ecommerce-api/weekly-report") {
          sendJson2(res, 200, { ok: true, value: store.getWeeklyReport(), revision: store.getReportRevision() });
          return;
        }
        if (pathname === "/ecommerce-api/compare") {
          const rawCycle = String(query.get("cycle") ?? "30d");
          const cycle = isCompareCycle(rawCycle) ? rawCycle : "30d";
          const kind = query.get("kind") ?? void 0;
          const metric2 = query.get("metric") ?? void 0;
          const limit = Math.min(Math.max(Number(query.get("limit") ?? 100) || 100, 1), 1e3);
          const payload = buildComparePayload(store, cycle, kind, metric2, limit);
          sendJson2(res, 200, { ok: true, value: payload, revision: store.getReportRevision() });
          return;
        }
        if (pathname === "/ecommerce-api/new-products") {
          sendJson2(res, 200, { ok: true, value: buildNewProductPayload(store), revision: store.getReportRevision() });
          return;
        }
        if (pathname === "/ecommerce-api/evaluation") {
          const cycle = query.get("cycle") === "7d" ? "7d" : "30d";
          const revision = store.getReportRevision();
          const cacheKey = cycle + ":" + revision;
          const summary = buildEvaluationSummary(cycle, store.getMonthlyReport(), store.getWeeklyReport());
          if (summary === null) {
            sendJson2(res, 200, { ok: true, value: { cycle, evaluation: "", source: "rule", pending: false } });
            return;
          }
          const entry = ensureEvaluation(cacheKey, summary, ctx);
          sendJson2(res, 200, {
            ok: true,
            value: { cycle, evaluation: entry.text, source: entry.source, pending: entry.pending }
          });
          return;
        }
        if (pathname === "/ecommerce-api/data-center" && req.method === "GET") {
          const html = renderDataCenter(store, req);
          res.writeHead(200, {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
            ...CORS_HEADERS
          });
          res.end(html);
          return;
        }
        if (pathname === "/ecommerce-api/export" && req.method === "GET") {
          const type = query.get("type") ?? "csv";
          const scope = query.get("scope") ?? "all";
          try {
            const products = store.listProducts({ page_size: 1e4 }).items;
            const orders = store.listOrders({ page_size: 1e4 }).items;
            const monthlyHistory = store.getMonthlyHistory();
            const weekly = store.getWeeklyReport();
            if (type === "json") {
              sendJson2(res, 200, { ok: true, value: { products, orders, monthlyHistory, weekly } });
              return;
            }
            let csv = "";
            let filename = "ecommerce-export.csv";
            if (scope === "products") {
              csv = productsToCsv(products);
              filename = "ecommerce-products.csv";
            } else if (scope === "orders") {
              csv = ordersToCsv(orders);
              filename = "ecommerce-orders.csv";
            } else if (scope === "reports") {
              csv = reportsToCsv(monthlyHistory, weekly);
              filename = "ecommerce-reports.csv";
            } else {
              const blocks = [];
              if (products.length > 0) blocks.push(productsToCsv(products));
              if (orders.length > 0) blocks.push(ordersToCsv(orders));
              const repCsv = reportsToCsv(monthlyHistory, weekly);
              if (repCsv !== "") blocks.push(repCsv);
              csv = joinCsvBlocks(blocks);
              filename = "ecommerce-all.csv";
            }
            const dataLines = csv.split("\r\n").filter((l) => l.trim() !== "").length;
            if (csv === "" || dataLines === 0) {
              sendJson2(res, 400, {
                ok: false,
                error: { code: "EXPORT_EMPTY", message: "\u5F53\u524D\u6CA1\u6709\u4EFB\u4F55\u53EF\u5BFC\u51FA\u7684\u6570\u636E\uFF1A\u8BF7\u5148\u5BFC\u5165\u5546\u54C1/\u8BA2\u5355\u8868\u683C\u6216\u6708\u5EA6/\u5468\u5EA6\u590D\u76D8 Excel" }
              });
              return;
            }
            res.writeHead(200, {
              "content-type": "text/csv; charset=utf-8",
              "content-disposition": `attachment; filename="${filename}"`,
              "cache-control": "no-store",
              ...CORS_HEADERS
            });
            res.end(csv);
            return;
          } catch (err) {
            sendJson2(res, 500, {
              ok: false,
              error: { code: "EXPORT_FAILED", message: err instanceof Error ? err.message : String(err) }
            });
            return;
          }
        }
        if (filesDirs !== void 0 && await handleFilesRoute(req, res, pathname, query, filesDirs)) {
          return;
        }
        sendJson2(res, 404, {
          ok: false,
          error: { code: "NOT_FOUND", message: `unknown ecommerce-api path: ${pathname}` }
        });
      } catch (err) {
        sendJson2(res, 500, {
          ok: false,
          error: {
            code: "INTERNAL",
            message: err instanceof Error ? err.message : String(err)
          }
        });
      }
    }
  });
}

// src/tools/excel.ts
import { defineTool as defineTool6 } from "@deepseek-ai/dsh-tools";
function renderErrors(errors) {
  return errors.slice(0, 50).map((e) => `- \u7B2C ${e.row + 1} \u884C \uFF5C ${e.field} \uFF5C ${e.reason}`).join("\n") + (errors.length > 50 ? `
\u2026\u5171 ${errors.length} \u9879\u9519\u8BEF` : "");
}
function registerExcelTools(ctx, store) {
  ctx.tools.register(defineTool6({
    name: "ecommerce_import_excel",
    description: "\u4ECE\u8868\u683C\u6570\u636E\u5BFC\u5165\u5E97\u94FA\u5546\u54C1\u4E0E\u8BA2\u5355\uFF08\u6574\u4F53\u66FF\u6362\u5F53\u524D\u6570\u636E\uFF09\u3002\u652F\u6301 CSV \u6587\u672C\uFF08\u5E26\u8868\u5934\uFF0C\u5217\u540D\u53EF\u4E3A\u4E2D\u6587\u522B\u540D\uFF09\u6216 JSON \u884C\u6570\u7EC4\u3002products \u5FC5\u586B\uFF1Borders \u53EF\u9009\u3002\u5BFC\u5165\u524D\u81EA\u52A8\u5907\u4EFD\uFF1B\u5BFC\u5165\u524D\u505A\u5B57\u6BB5\u7EA7\u6821\u9A8C\uFF0C\u5931\u8D25\u8FD4\u56DE\u300C\u884C\u53F7/\u5B57\u6BB5/\u539F\u56E0\u300D\u660E\u7EC6\u4E14\u4E0D\u5199\u5165\u6570\u636E\u3002",
    parameters: {
      products_csv: {
        type: "string",
        description: "\u5546\u54C1 CSV\uFF08UTF-8\uFF0C\u9996\u884C\u4E3A\u8868\u5934\uFF09\uFF1Asku/\u5546\u54C1\u7F16\u7801, name/\u5546\u54C1\u540D\u79F0, category/\u7C7B\u76EE, price/\u552E\u4EF7, stock/\u5E93\u5B58, status/\u72B6\u6001(\u5728\u552E|\u4E0B\u67B6)"
      },
      products_json: {
        type: "string",
        description: "\u5546\u54C1 JSON \u884C\u6570\u7EC4\u5B57\u7B26\u4E32\uFF1A[{sku,name,category,price,stock,status}]"
      },
      orders_csv: {
        type: "string",
        description: "\u8BA2\u5355 CSV\uFF08UTF-8\uFF0C\u9996\u884C\u4E3A\u8868\u5934\uFF09\uFF1Aorder_id/\u8BA2\u5355\u53F7, buyer/\u4E70\u5BB6, sku/\u5546\u54C1\u7F16\u7801, product_name/\u5546\u54C1\u540D\u79F0, quantity/\u6570\u91CF, amount/\u91D1\u989D, status/\u72B6\u6001, created_at/\u4E0B\u5355\u65F6\u95F4(YYYY-MM-DD HH:mm)"
      },
      orders_json: {
        type: "string",
        description: "\u8BA2\u5355 JSON \u884C\u6570\u7EC4\u5B57\u7B26\u4E32\uFF1A[{order_id,buyer,sku,product_name,quantity,amount,status,created_at}]"
      }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          ok: { type: "boolean" },
          products: { type: "number" },
          orders: { type: "number" },
          snapshot: { type: "string" },
          hint: { type: "string" },
          errors: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: true,
              properties: {
                row: { type: "number" },
                field: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      },
      render: (_args, value) => {
        const v = value;
        if (v.ok === false && v.errors !== void 0 && v.errors.length > 0) {
          return [{
            type: "text",
            text: `\u8868\u683C\u5BFC\u5165\u6821\u9A8C\u5931\u8D25\uFF0C\u6570\u636E\u672A\u5199\u5165\uFF08\u5171 ${v.errors.length} \u9879\u9519\u8BEF\uFF09\uFF1A
${renderErrors(v.errors)}`
          }];
        }
        return [{
          type: "text",
          text: `\u8868\u683C\u5BFC\u5165\u5B8C\u6210\uFF1A${v.products} \u4EF6\u5546\u54C1\u3001${v.orders} \u7B14\u8BA2\u5355\u3002${v.hint ?? ""}\uFF08\u5BFC\u5165\u524D\u6570\u636E\u5DF2\u5907\u4EFD\uFF09`
        }];
      }
    },
    async execute(args) {
      const snapshot = store.exportBackup();
      let productRows;
      if (typeof args.products_csv === "string" && args.products_csv.trim()) {
        productRows = csvToRows(args.products_csv, PRODUCT_COLUMNS);
      } else if (typeof args.products_json === "string" && args.products_json.trim()) {
        productRows = jsonToRows(JSON.parse(args.products_json), PRODUCT_COLUMNS);
      } else {
        throw new Error("\u8BF7\u63D0\u4F9B products_csv \u6216 products_json\uFF08\u5546\u54C1\u6570\u636E\u5FC5\u586B\uFF09");
      }
      let orderRows = [];
      if (typeof args.orders_csv === "string" && args.orders_csv.trim()) {
        orderRows = csvToRows(args.orders_csv, ORDER_COLUMNS);
      } else if (typeof args.orders_json === "string" && args.orders_json.trim()) {
        orderRows = jsonToRows(JSON.parse(args.orders_json), ORDER_COLUMNS);
      }
      const vp = validateProducts(productRows);
      const knownSkus = new Set(vp.items.map((p) => p.sku));
      const vo = validateOrders(orderRows, knownSkus);
      const allErrors = [...vp.errors, ...vo.errors];
      if (allErrors.length > 0) {
        return asJsonObject({
          ok: false,
          products: 0,
          orders: 0,
          errors: allErrors,
          snapshot,
          hint: `\u6821\u9A8C\u5931\u8D25 ${allErrors.length} \u9879\uFF0C\u6570\u636E\u672A\u5199\u5165\uFF08\u53EF\u7528 ecommerce_import_backup \u6062\u590D snapshot\uFF09`
        });
      }
      const result = store.importData(vp.items, vo.items);
      const hint = vo.items.length ? `\u5546\u54C1\u7C7B\u76EE\uFF1A${[...new Set(vp.items.map((p) => p.category))].join("\u3001")}` : "\u672A\u63D0\u4F9B\u8BA2\u5355\u6570\u636E\uFF0C\u4EC5\u5BFC\u5165\u5546\u54C1\uFF08\u7EDF\u8BA1\u5DE5\u5177\u6309\u8BA2\u5355\u8BA1\u7B97\uFF09";
      return asJsonObject({ ok: true, ...result, snapshot, hint });
    }
  }));
}

// src/tools/qa.ts
import { defineTool as defineTool7 } from "@deepseek-ai/dsh-tools";

// src/qa-engine.ts
function normalize2(q) {
  return q.toLowerCase().replace(/[\s，。？！、；：""''（）()【】《》,.?!;:'"\[\]{}|\/\\-—_]+/g, "");
}
var money = (v) => `\xA5${v.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
var RULES = [
  {
    id: "today_sales",
    title: "\u4ECA\u65E5\u9500\u552E",
    keywords: ["\u4ECA\u5929\u5356", "\u4ECA\u65E5\u5356", "\u4ECA\u65E5\u9500\u552E", "\u4ECA\u5929\u9500\u552E", "\u4ECA\u65E5\u8BA2\u5355", "\u4ECA\u5929\u8BA2\u5355", "\u4ECA\u65E5\u6210\u4EA4", "\u4ECA\u5929\u6210\u4EA4", "\u4ECA\u65E5\u8425\u6536", "\u4ECA\u5929\u8425\u6536", "\u4ECA\u5929\u7684\u9500\u552E", "\u4ECA\u5929\u6D41\u6C34", "\u4ECA\u65E5\u6D41\u6C34", "\u4ECA\u5929\u591A\u5C11\u94B1", "\u4ECA\u65E5\u591A\u5C11\u94B1"],
    run: (store) => {
      const today = todayStr();
      const o = store.overview({ date_from: today, date_to: today });
      const answer = [
        `\u4ECA\u65E5\u9500\u552E\uFF08${today}\uFF0C\u5DF2\u652F\u4ED8\u53E3\u5F84\uFF09\uFF1A`,
        `- \u9500\u552E\u989D\uFF1A${money(o.revenue)}`,
        `- \u8BA2\u5355\u91CF\uFF1A${o.orders} \u7B14`,
        o.orders > 0 ? `- \u5BA2\u5355\u4EF7\uFF1A${money(o.avg_order_value)}` : "- \u4ECA\u65E5\u6682\u65E0\u5DF2\u652F\u4ED8\u8BA2\u5355"
      ].join("\n");
      return { answer, data: { date: today, overview: o } };
    }
  },
  {
    id: "overview",
    title: "\u7ECF\u8425\u603B\u89C8",
    keywords: ["\u603B\u89C8", "\u6982\u89C8", "\u6574\u4F53\u60C5\u51B5", "\u7ECF\u8425\u60C5\u51B5", "\u5E97\u94FA\u60C5\u51B5", "\u9500\u552E\u60C5\u51B5", "\u751F\u610F", "\u4E1A\u7EE9", "\u8425\u6536\u60C5\u51B5", "\u7ECF\u8425\u72B6\u51B5", "\u6982\u51B5"],
    run: (store) => {
      const o = store.overview();
      const answer = [
        "\u7ECF\u8425\u603B\u89C8\uFF08\u5168\u90E8\u65F6\u95F4\uFF0C\u5DF2\u652F\u4ED8\u53E3\u5F84\uFF09\uFF1A",
        `- \u9500\u552E\u989D\uFF1A${money(o.revenue)}`,
        `- \u8BA2\u5355\u91CF\uFF1A${o.orders} \u7B14`,
        `- \u5BA2\u5355\u4EF7\uFF1A${money(o.avg_order_value)}`,
        `- \u9000\u6B3E\u7387\uFF1A${o.refund_rate}%`,
        o.top_selling_sku ? `- \u7545\u9500\u5546\u54C1\uFF1A${o.top_selling_sku}` : ""
      ].filter(Boolean).join("\n");
      return { answer, data: { overview: o } };
    }
  },
  {
    id: "top_products",
    title: "\u7545\u9500\u5546\u54C1 TOP",
    keywords: ["\u7545\u9500", "\u6392\u884C", "\u6392\u540D", "top", "\u6700\u597D\u5356", "\u5356\u5F97\u6700\u597D", "\u7206\u6B3E", "\u70ED\u9500", "\u660E\u661F\u5546\u54C1"],
    run: (store) => {
      const top = store.topProducts({}, 10);
      const answer = top.length === 0 ? "\u6682\u65E0\u9500\u552E\u6570\u636E" : "\u5546\u54C1\u9500\u552E\u6392\u884C TOP" + top.length + "\uFF1A\n" + top.map(
        (p, i) => `${i + 1}. ${p.name}\uFF08${p.sku}\uFF09${money(p.revenue)}\uFF0C${p.units} \u4EF6`
      ).join("\n");
      return { answer, data: { items: top } };
    }
  },
  {
    id: "low_stock",
    title: "\u4F4E\u5E93\u5B58\u9884\u8B66",
    keywords: ["\u4F4E\u5E93\u5B58", "\u5E93\u5B58\u4E0D\u8DB3", "\u7F3A\u8D27", "\u6CA1\u8D27", "\u8865\u8D27", "\u5E93\u5B58\u9884\u8B66", "\u5E93\u5B58\u544A\u6025", "\u5E93\u5B58\u4F4E"],
    run: (store) => {
      const items = store.lowStock();
      const answer = items.length === 0 ? "\u5E93\u5B58\u5145\u8DB3\uFF0C\u6CA1\u6709\u4F4E\u4E8E\u9608\u503C\u7684\u5546\u54C1 \u{1F389}" : "\u26A0\uFE0F \u6709 " + items.length + " \u4EF6\u5546\u54C1\u5E93\u5B58\u4F4E\u4E8E\u9608\u503C\uFF1A\n" + items.map((p) => `- ${p.sku} \uFF5C ${p.name} \uFF5C \u5E93\u5B58 ${p.stock} \uFF5C ${p.category}`).join("\n");
      return { answer, data: { threshold: items[0]?.threshold ?? 10, items } };
    }
  },
  {
    id: "pending_ship",
    title: "\u5F85\u53D1\u8D27\u8BA2\u5355",
    keywords: ["\u5F85\u53D1\u8D27", "\u672A\u53D1\u8D27", "\u6CA1\u53D1\u8D27", "\u5F85\u53D1", "\u8FD8\u6CA1\u53D1", "\u8981\u53D1\u8D27"],
    run: (store) => {
      const list = store.pendingShipments();
      const answer = list.length === 0 ? "\u6CA1\u6709\u5F85\u53D1\u8D27\u8BA2\u5355 \u{1F389}" : "\u{1F4E6} \u5F85\u53D1\u8D27\u8BA2\u5355 " + list.length + " \u7B14\uFF1A\n" + list.map((o) => `- ${o.order_id} \uFF5C ${o.buyer} \uFF5C ${money(o.amount)}`).slice(0, 20).join("\n") + (list.length > 20 ? "\n\u2026\u5171 " + list.length + " \u7B14" : "");
      return { answer, data: { count: list.length, items: list.slice(0, 50) } };
    }
  },
  {
    id: "pending_pay",
    title: "\u5F85\u4ED8\u6B3E/\u903E\u671F\u8BA2\u5355",
    keywords: ["\u5F85\u4ED8\u6B3E", "\u672A\u4ED8\u6B3E", "\u672A\u652F\u4ED8", "\u903E\u671F", "\u6B20\u6B3E", "\u6CA1\u4ED8", "\u8FD8\u6CA1\u4ED8", "\u50AC\u4ED8", "\u5F85\u652F\u4ED8"],
    run: (store) => {
      const overdues = store.overduePending();
      const pend = store.listOrders({ status: "pending", page_size: 500 }).total;
      const answer = [
        `\u23F0 \u5F85\u4ED8\u6B3E\u8BA2\u5355 ${pend} \u7B14`,
        `\u26A0\uFE0F \u5176\u4E2D\u903E\u671F\uFF08\u8D85\u8FC7 24 \u5C0F\u65F6\u672A\u5904\u7406\uFF09${overdues.length} \u7B14\uFF1A`,
        overdues.length === 0 ? "- \u65E0\u903E\u671F" : overdues.map((o) => `- ${o.order_id}\uFF08${o.buyer}\uFF0C${money(o.amount)}\uFF09`).join("\n")
      ].join("\n");
      return { answer, data: { pending: pend, overdueCount: overdues.length, overdues: overdues.slice(0, 50) } };
    }
  },
  {
    id: "refund",
    title: "\u9000\u6B3E/\u552E\u540E",
    keywords: ["\u9000\u6B3E", "\u9000\u8D27", "\u552E\u540E", "\u9000\u5355", "\u9000\u6B3E\u7387"],
    run: (store) => {
      const o = store.overview();
      const refunded = store.listOrders({ status: "refunded", page_size: 500 }).total;
      const answer = [
        `\u9000\u6B3E\u7387\uFF1A${o.refund_rate}%\uFF08\u5168\u90E8\u65F6\u95F4\uFF09`,
        `\u5DF2\u9000\u6B3E\u8BA2\u5355\uFF1A${refunded} \u7B14`,
        o.refund_rate >= 10 ? "\u26A0\uFE0F \u9000\u6B3E\u7387\u504F\u9AD8\uFF0C\u5EFA\u8BAE\u6838\u67E5\u552E\u540E\u539F\u56E0" : "\u2705 \u9000\u6B3E\u7387\u5904\u4E8E\u6B63\u5E38\u6C34\u5E73"
      ].join("\n");
      return { answer, data: { refund_rate: o.refund_rate, refunded_orders: refunded } };
    }
  },
  {
    id: "category",
    title: "\u7C7B\u76EE\u9500\u552E\u5360\u6BD4",
    keywords: ["\u7C7B\u76EE", "\u5206\u7C7B", "\u5360\u6BD4", "\u7ED3\u6784", "\u5206\u5E03", "\u54C1\u7C7B"],
    run: (store) => {
      const items = store.categoryDistribution();
      const answer = items.length === 0 ? "\u6682\u65E0\u9500\u552E\u6570\u636E" : "\u7C7B\u76EE\u9500\u552E\u5206\u5E03\uFF1A\n" + items.map((c) => `- ${c.category}\uFF1A${money(c.revenue)}\uFF08${c.ratio}%\uFF09`).join("\n");
      return { answer, data: { items }, chart: "donut" };
    }
  }
];
function answerQuestion(store, question) {
  const q = normalize2(question);
  if (!q) {
    return { matched: false, answer: "\u95EE\u9898\u4E3A\u7A7A\uFF0C\u8BF7\u63CF\u8FF0\u4F60\u60F3\u4E86\u89E3\u7684\u5E97\u94FA\u7ECF\u8425\u4FE1\u606F\u3002" };
  }
  for (const rule of RULES) {
    if (rule.keywords.some((k) => q.includes(k))) {
      const out = rule.run(store);
      return {
        matched: true,
        rule: rule.id,
        rule_title: rule.title,
        answer: out.answer,
        data: out.data,
        chart: out.chart ?? null
      };
    }
  }
  return {
    matched: false,
    answer: "\u672A\u547D\u4E2D\u5185\u7F6E\u9AD8\u9891\u89C4\u5219\uFF0C\u8BF7\u6539\u7528 stats_overview / stats_trend / stats_top_products / stats_category / inventory_low_stock / order_list \u7B49\u5DE5\u5177\u67E5\u8BE2\u3002"
  };
}
function qaRuleDescription() {
  return [
    "\u300C\u89C4\u5219\u95EE\u7B54\u300D\uFF1A\u9AD8\u9891\u7ECF\u8425\u95EE\u9898\u53EF\u8C03\u7528 ecommerce_qa \u76F4\u63A5\u547D\u4E2D\uFF0C\u8FD4\u56DE\u786E\u5B9A\u6027\u7B54\u6848\uFF08\u4E0E\u5DE5\u5177\u540C\u53E3\u5F84\uFF09\uFF1A",
    "- \u7ECF\u8425\u603B\u89C8 / \u4ECA\u65E5\u9500\u552E / \u7545\u9500\u5546\u54C1 TOP / \u4F4E\u5E93\u5B58 / \u5F85\u53D1\u8D27 / \u5F85\u4ED8\u6B3E\u4E0E\u903E\u671F / \u9000\u6B3E\u7387 / \u7C7B\u76EE\u5360\u6BD4",
    "- \u547D\u4E2D\uFF08matched=true\uFF09\u65F6\u76F4\u63A5\u5F15\u7528 answer \u56DE\u7B54\u7528\u6237\uFF0C\u65E0\u9700\u518D\u8C03\u5176\u4ED6\u5DE5\u5177\uFF1B",
    "- \u672A\u547D\u4E2D\uFF08matched=false\uFF09\u65F6\u6539\u7528 stats_*/inventory_*/order_* \u5DE5\u5177\u67E5\u8BE2\u3002"
  ].join("\n");
}

// src/tools/qa.ts
function registerQaTool(ctx, store) {
  const mode = store.sourceMode;
  ctx.tools.register(defineTool7({
    name: "ecommerce_qa",
    description: "\u89C4\u5219\u95EE\u7B54\uFF1A\u9AD8\u9891\u7ECF\u8425\u95EE\u9898\u76F4\u63A5\u547D\u4E2D\u5185\u7F6E\u89C4\u5219\u8FD4\u56DE\u786E\u5B9A\u6027\u7B54\u6848\uFF08\u7ECF\u8425\u603B\u89C8/\u4ECA\u65E5\u9500\u552E/\u7545\u9500TOP/\u4F4E\u5E93\u5B58/\u5F85\u53D1\u8D27/\u5F85\u4ED8\u6B3E\u4E0E\u903E\u671F/\u9000\u6B3E\u7387/\u7C7B\u76EE\u5360\u6BD4\uFF09\uFF0C\u4E0E stats_* \u7B49\u5DE5\u5177\u540C\u53E3\u5F84\u3002\u547D\u4E2D\uFF08matched=true\uFF09\u76F4\u63A5\u5F15\u7528 answer\uFF1B\u672A\u547D\u4E2D\uFF08matched=false\uFF09\u8BF7\u6539\u7528 stats_*/inventory_*/order_* \u5DE5\u5177\u3002",
    parameters: {
      question: { type: "string", required: true, description: "\u81EA\u7136\u8BED\u8A00\u7ECF\u8425\u95EE\u9898\uFF0C\u5982\u300C\u5E97\u94FA\u4ECA\u5929\u5356\u4E86\u591A\u5C11\u300D\u300C\u4F4E\u5E93\u5B58\u6709\u54EA\u4E9B\u300D\u300C\u7545\u9500TOP5\u300D" }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          matched: { type: "boolean" },
          rule: { type: "string" },
          rule_title: { type: "string" },
          answer: { type: "string" },
          data: { type: "object", additionalProperties: true },
          chart: { type: "string" }
        }
      },
      render: (_args, value) => {
        const v = value;
        const head = v.matched ? `[\u89C4\u5219\u547D\u4E2D\uFF1A${v.rule_title ?? v.rule ?? ""}]` : "[\u672A\u547D\u4E2D\u5185\u7F6E\u89C4\u5219\uFF0C\u8BF7\u6539\u7528\u5DE5\u5177\u67E5\u8BE2]";
        const note = mode === "mock" ? "\n\uFF08\u5F53\u524D\u4E3A\u793A\u4F8B\u6570\u636E\u6A21\u5F0F\uFF0C\u4EC5\u4F5C\u6F14\u793A\uFF09" : "";
        return [{ type: "text", text: `${head}
${v.answer}${note}` }];
      }
    },
    async execute(args) {
      if (!args.question || !String(args.question).trim()) {
        throw new Error("question \u4E0D\u80FD\u4E3A\u7A7A");
      }
      return asJsonObject(answerQuestion(store, String(args.question).trim()));
    }
  }));
}

// src/tools/export-csv.ts
import { defineTool as defineTool8 } from "@deepseek-ai/dsh-tools";
function registerExportCsvTool(ctx, store) {
  ctx.tools.register(defineTool8({
    name: "ecommerce_export_csv",
    description: "\u5BFC\u51FA\u5E97\u94FA\u6570\u636E\u4E3A CSV\uFF08\u5546\u54C1/\u8BA2\u5355\uFF0CUTF-8 \u5E26 BOM\uFF0CExcel \u53EF\u76F4\u63A5\u6253\u5F00\uFF09\u3002\u4E0E JSON \u5907\u4EFD\u5E76\u5217\u7684\u6570\u636E\u5BFC\u51FA\u80FD\u529B\u3002",
    parameters: {
      scope: {
        type: "string",
        enum: ["products", "orders", "all"],
        description: "\u5BFC\u51FA\u8303\u56F4\uFF1Aproducts=\u5546\u54C1\u8868\uFF0Corders=\u8BA2\u5355\u8868\uFF0Call=\u4E24\u8005\uFF08\u9ED8\u8BA4 all\uFF09"
      }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          products: { type: "number" },
          orders: { type: "number" },
          products_csv: { type: "string" },
          orders_csv: { type: "string" },
          hint: { type: "string" }
        }
      },
      render: (_args, value) => {
        const v = value;
        const parts = [`\u5DF2\u5BFC\u51FA\uFF1A${v.products} \u4EF6\u5546\u54C1\u3001${v.orders} \u7B14\u8BA2\u5355\uFF08UTF-8 \u5E26 BOM\uFF0CExcel \u53EF\u76F4\u63A5\u6253\u5F00\uFF09`];
        if (v.products_csv !== void 0) {
          parts.push(`
\u3010\u5546\u54C1 CSV\u3011
${v.products_csv}`);
        }
        if (v.orders_csv !== void 0) {
          parts.push(`
\u3010\u8BA2\u5355 CSV\u3011
${v.orders_csv}`);
        }
        parts.push("\n" + v.hint);
        return [{ type: "text", text: parts.join("") }];
      }
    },
    async execute(args) {
      const scope = args.scope ?? "all";
      const allProducts = store.listProducts({ page_size: 1e5 }).items;
      const allOrders = store.listOrders({ page_size: 1e5 }).items;
      const out = {
        products: allProducts.length,
        orders: allOrders.length,
        hint: "\u8BF7\u5C06 csv \u5B57\u6BB5\u5185\u5BB9\u5B8C\u6574\u4FDD\u5B58\u4E3A .csv \u6587\u4EF6\uFF08UTF-8\uFF09"
      };
      if (scope === "products" || scope === "all") {
        out.products_csv = productsToCsv(allProducts);
      }
      if (scope === "orders" || scope === "all") {
        out.orders_csv = ordersToCsv(allOrders);
      }
      return asJsonObject(out);
    }
  }));
}

// src/tools/mode.ts
import { defineTool as defineTool9 } from "@deepseek-ai/dsh-tools";
function registerModeTools(ctx, store) {
  ctx.tools.register(defineTool9({
    name: "ecommerce_set_mode",
    description: "\u5207\u6362\u5E97\u94FA\u6570\u636E\u6E90\u6A21\u5F0F\uFF1Aimported=\u5BFC\u5165\u6570\u636E\uFF08\u6700\u8FD1\u4E00\u6B21\u5BFC\u5165\u7684\u5907\u4EFD\uFF09/ rest=\u5E73\u53F0 API\uFF08\u9700\u542F\u52A8\u65F6\u914D\u7F6E rest \u5E73\u53F0\uFF09\u3002\u5207\u6362\u524D\u81EA\u52A8\u5907\u4EFD\u5F53\u524D\u6570\u636E\uFF1B\u5207\u6362\u540E\u7EDF\u8BA1\u5DE5\u5177\u4E0E\u5E97\u94FA\u5DE5\u4F5C\u53F0\u7ACB\u5373\u53CD\u6620\u65B0\u6570\u636E\u6E90\u3002",
    parameters: {
      mode: {
        type: "string",
        required: true,
        enum: ["imported", "rest"],
        description: "\u76EE\u6807\u6570\u636E\u6E90\uFF1Aimported / rest"
      }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
          mode: { type: "string" },
          products: { type: "number" },
          orders: { type: "number" },
          snapshot: { type: "string" },
          hint: { type: "string" }
        }
      },
      render: (_args, value) => {
        const v = value;
        return [{
          type: "text",
          text: `\u5DF2\u5207\u6362\u6570\u636E\u6E90\u4E3A\u300C${modeText(v.mode)}\u300D\uFF1A${v.products} \u4EF6\u5546\u54C1\u3001${v.orders} \u7B14\u8BA2\u5355\u3002${v.hint ?? ""}`
        }];
      }
    },
    async execute(args) {
      const mode = args.mode;
      if (mode !== "imported" && mode !== "rest") {
        throw new Error(`\u672A\u77E5\u6570\u636E\u6E90\u6A21\u5F0F\uFF1A${String(mode)}\uFF08\u793A\u4F8B\u6570\u636E\u6A21\u5F0F\u5DF2\u968F v0.4.0 \u79FB\u9664\uFF0C\u53EF\u7528\uFF1Aimported / rest\uFF09`);
      }
      try {
        const result = await store.switchMode(mode);
        return asJsonObject({
          ...result,
          mode,
          hint: mode === "imported" ? "\u5DF2\u6062\u590D\u6700\u8FD1\u4E00\u6B21\u5BFC\u5165\u7684\u6570\u636E" : "\u5DF2\u4ECE\u5E73\u53F0 API \u91CD\u65B0\u62C9\u53D6\u6570\u636E"
        });
      } catch (err) {
        throw new Error(`\u5207\u6362\u5931\u8D25\uFF0C\u6570\u636E\u672A\u53D8\u66F4\uFF1A${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }));
}
function modeText(mode) {
  switch (mode) {
    case "imported":
      return "\u5BFC\u5165\u6570\u636E";
    case "rest":
      return "\u5E73\u53F0 API";
    default:
      return mode;
  }
}

// src/tools/compare.ts
import { defineTool as defineTool10 } from "@deepseek-ai/dsh-tools";
var money2 = (v) => "\xA5" + v.toLocaleString("zh-CN", { maximumFractionDigits: v >= 1e4 ? 0 : 2 });
function fmtValue(v, unit) {
  if (unit === "pct") return v.toFixed(2) + "%";
  if (unit === "number") return Math.round(v).toLocaleString("zh-CN");
  return money2(v);
}
function fmtDelta(result, delta) {
  const base = (delta >= 0 ? "+" : "") + fmtValue(delta, result.unit);
  const suffix = result.unit === "pct" ? "pp" : "";
  return base + suffix;
}
function formatCompareText(result, limit = 20) {
  const s = result.summary;
  const L = [];
  L.push(`\u3010${result.cycle === "7d" ? "\u5468" : "\u6708"}\u5EA6\u6570\u636E\u5BF9\u6BD4 \xB7 ${result.kindLabel}\xB7${result.metricLabel}\u3011`);
  L.push(`\u4E0A\u671F ${result.prevPeriod || "\u2014"}\uFF08\u4E0A\u671F\uFF09  vs  \u672C\u671F ${result.currPeriod || "\u2014"}`);
  L.push(`\u6574\u4F53\uFF1A${fmtValue(s.prevTotal, result.unit)} \u2192 ${fmtValue(s.currTotal, result.unit)}\uFF08${fmtDelta(result, s.delta)}${s.deltaPct !== null ? "\uFF0C" + (s.deltaPct >= 0 ? "+" : "") + s.deltaPct.toFixed(1) + "%" : ""}\uFF09`);
  L.push(`\u5BF9\u6BD4\u5BF9\u8C61\uFF1A\u4E24\u671F\u90FD\u5728 ${s.matched} \xB7 \u672C\u671F\u65B0\u589E ${s.added} \xB7 \u672C\u671F\u9000\u51FA ${s.removed} \xB7 \u540D\u6B21\u4E0A\u5347/\u4E0B\u964D ${s.rankUp}/${s.rankDown}`);
  const rows = result.rows.slice(0, limit);
  const head = ["#", "\u540D\u79F0", "\u4E0A\u671F", "\u672C\u671F", "\u589E\u51CF", "\u540D\u6B21"].join(" | ");
  L.push("\u660E\u7EC6\uFF08\u6309\u53D8\u5316\u5E45\u5EA6\u6392\u5E8F\uFF09\uFF1A");
  L.push(head);
  rows.forEach((r, i) => {
    const name2 = r.label || r.key;
    const pv = r.prev === null ? "\u2014" : fmtValue(r.prev, result.unit);
    const cv = r.curr === null ? "\u2014" : fmtValue(r.curr, result.unit);
    const dv = r.state === "added" ? "\u65B0\u4E0A\u699C" : r.state === "removed" ? "\u9000\u51FA" : fmtDelta(result, r.delta) + (r.deltaPct !== null ? " (" + (r.deltaPct >= 0 ? "+" : "") + r.deltaPct.toFixed(1) + "%)" : "");
    const rk = r.state === "added" ? "\u65B0" : r.state === "removed" ? "\u9000" : (r.rankPrev ?? 0) + "\u2192" + (r.rankCurr ?? 0) + (r.rankShift && r.rankShift !== 0 ? r.rankShift > 0 ? " \u2191" + r.rankShift : " \u2193" + Math.abs(r.rankShift) : "");
    L.push(`${i + 1} | ${name2} | ${pv} | ${cv} | ${dv} | ${rk}`);
  });
  if (s.removed > 0) L.push("\uFF08\u63D0\u793A\uFF1A\u300C\u9000\u51FA\u300D\u884C\u672C\u671F\u5DF2\u65E0\u9500\u552E/\u6392\u540D\uFF0C\u591A\u4E3A\u4E0B\u67B6\u6216\u65E0\u6210\u4EA4\uFF09");
  L.push("\u8BF4\u660E\uFF1A\u6307\u6807\u6309" + (result.unit === "pct" ? "\u9500\u552E\u989D\u52A0\u6743" : "\u6C47\u603B") + "\u53E3\u5F84\u5BF9\u6BD4\uFF1B\u6570\u636E\u6765\u81EA\u5DF2\u5BFC\u5165 Excel \u7684\u4E24\u671F\u590D\u76D8\u3002");
  return L.join("\n");
}
function registerCompareTools(ctx, store) {
  ctx.tools.register(defineTool10({
    name: "ecommerce_compare",
    description: "\u6570\u636E\u5BF9\u6BD4\uFF08\u5BFC\u5165\u4E24\u671F\u540E\uFF09\uFF1A\u5BF9\u6BD4\u4E0A\u4E00\u671F\u4E0E\u672C\u671F\uFF08\u6708\u5EA630d \u6216 \u5468\u5EA67d\uFF09\u67D0\u5C42\u7EA7\uFF08\u94FE\u63A5/\u8D27\u54C1/SKU/\u5E97\u94FA\u5229\u6DA6\uFF09\u67D0\u6307\u6807\uFF08\u9500\u552E\u989D/\u51C0\u9500/\u6BDB\u5229/\u63A8\u5E7F\u8D39/\u9000\u6B3E\u7387/\u6BDB\u5229\u7387/\u5BA2\u5355\u4EF7\u7B49\uFF09\u7684\u589E\u51CF\u4E0E\u6392\u884C\u4F4D\u79FB\u3002\u9700\u5148\u8FDE\u7EED\u5BFC\u5165\u4E24\u4E2A\u5468\u671F\u624D\u4F1A\u751F\u6548\u3002",
    parameters: {
      cycle: { type: "string", enum: ["30d", "7d"], description: "\u5468\u671F\uFF1A30d=\u6708\u5EA6\u590D\u76D8 / 7d=\u5468\u590D\u76D8\uFF0C\u9ED8\u8BA4 30d" },
      kind: {
        type: "string",
        enum: ["platformLinks", "systemProducts", "systemSkus", "storeProfit"],
        description: "\u5BF9\u6BD4\u5C42\u7EA7\uFF1AplatformLinks=\u94FE\u63A5 / systemProducts=\u7CFB\u7EDF\u8D27\u54C1 / systemSkus=\u7CFB\u7EDF\u89C4\u683C / storeProfit=\u5E97\u94FA\u5229\u6DA6\uFF1B\u7F3A\u7701\u81EA\u52A8\u9009\u62E9"
      },
      metric: {
        type: "string",
        description: "\u5BF9\u6BD4\u6307\u6807\uFF1Asales/netSales/grossProfit/salesCount/grossMargin/refundAmount/refundRate/adSpend/avgPrice/views \u7B49\uFF0C\u9ED8\u8BA4\u9500\u552E\u989D"
      },
      limit: { type: "number", description: "\u8FD4\u56DE\u660E\u7EC6\u6761\u6570\uFF0C\u9ED8\u8BA4 20\uFF0C\u6700\u5927 100" }
    },
    output: {
      schema: { type: "object", additionalProperties: true, properties: {} },
      render: (_args, value) => {
        const v = value;
        return [{
          type: "text",
          text: v.ok ? v.result ? formatCompareText(v.result) : v.message : v.message
        }];
      }
    },
    async execute(args) {
      const cycle = args.cycle === "30d" || args.cycle === "7d" ? args.cycle : "30d";
      const kind = args.kind !== void 0 && isCompareKind(args.kind) ? args.kind : void 0;
      const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);
      const payload = buildComparePayload(store, cycle, kind, args.metric, limit);
      const label = payload.result ? `${payload.result.kindLabel}\xB7${payload.result.metricLabel}` : "";
      if (!payload.hasPrev) {
        return asJsonObject({
          ok: false,
          message: "\u6682\u65E0\u4E0A\u4E00\u671F\u6570\u636E\u53EF\u5BF9\u6BD4\uFF1A\u8BF7\u5148\u5728\u300C\u5E97\u94FA\u5DE5\u4F5C\u53F0\u300D\u8FDE\u7EED\u5BFC\u5165\u4E24\u671F" + (cycle === "7d" ? "\u5468" : "\u6708") + "\u5EA6\u590D\u76D8 Excel\uFF08\u5F53\u524D\u671F\u4E0E\u4E0A\u4E00\u671F\uFF09\uFF0C\u518D\u8C03\u7528\u672C\u5DE5\u5177\u3002"
        });
      }
      if (!payload.result || !payload.result.rows.length) {
        return asJsonObject({
          ok: false,
          message: `\u5DF2\u5BFC\u5165\u4E24\u671F\uFF0C\u4F46\u6240\u9009\u5C42\u7EA7\u300C${label || "\u8BE5\u5C42\u7EA7"}\u300D\u5728\u5F53\u524D\u5468\u671F\u5185\u4E24\u4FA7\u7F3A\u5C11\u53EF\u6BD4\u6570\u636E\uFF08\u65B0\u589E/\u9000\u51FA\u5747\u65E0\uFF09\uFF0C\u8BF7\u6362\u4E00\u4E2A\u5C42\u7EA7\u6216\u5468\u671F\u518D\u8BD5\u3002`
        });
      }
      return asJsonObject({ ok: true, ...payload.result });
    }
  }));
}

// src/tools/data-report.ts
import { defineTool as defineTool11 } from "@deepseek-ai/dsh-tools";
var yuan = (v) => "\xA5" + (Number(v) || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
var pct = (v) => (Number(v) || 0).toFixed(2) + "%";
var int = (v) => Math.round(Number(v) || 0).toLocaleString("zh-CN");
var sum2 = (rows, pick2) => rows.reduce((s, r) => s + (Number(pick2(r)) || 0), 0);
function sourceLine(store, monthlies) {
  const months = monthlies.map((m) => m.month).join("\u3001");
  const weekly = store.getWeeklyReport();
  const parts = [
    `\u6570\u636E\u6765\u6E90:\u5DF2\u5BFC\u5165\u7684\u590D\u76D8 Excel(\u4E0E\u300C\u7535\u5546\u6570\u636E\u4E2D\u53F0\u300D\u9762\u677F\u540C\u6E90\u540C\u53E3\u5F84,\u4FEE\u8BA2\u53F7 ${store.getReportRevision()})`,
    `\u5DF2\u5BFC\u5165\u6708\u5EA6:${months || "(\u65E0)"}`,
    `\u5DF2\u5BFC\u5165\u5468\u5EA6:${weekly ? weekly.period : "(\u65E0)"}`,
    "\u5546\u54C1/\u8BA2\u5355\u5E93\u662F\u53E6\u4E00\u5957\u57DF,\u4E0E\u590D\u76D8\u62A5\u8868\u4E92\u4E0D\u76F8\u901A(\u672A\u5BFC\u5165\u8868\u683C\u65F6\u4E3A\u7A7A)\u3002",
    "\u672A\u5BFC\u5165\u7684\u5468\u671F\u4E00\u5F8B\u8FD4\u56DE\u300C\u672A\u5BFC\u5165\u300D\u2014\u2014\u4E0D\u5F97\u7528 0\u3001\u793A\u4F8B\u503C\u6216\u63A8\u6D4B\u503C\u4EE3\u66FF\u3002"
  ];
  return parts.join(" | ");
}
function pickMonthly(store, month) {
  const history = store.getMonthlyHistory();
  const current = store.getMonthlyReport();
  if (history.length === 0) return { report: current, note: "\u5C1A\u65E0\u4EFB\u4F55\u6708\u5EA6\u590D\u76D8\u6570\u636E\u3002" };
  if (month === void 0 || month.trim() === "") return { report: current, note: "" };
  const key = month.trim();
  const hit = history.find((r) => r.month === key || r.period.startsWith(key));
  if (hit === void 0) {
    return {
      report: null,
      note: `\u672A\u5BFC\u5165\u6708\u4EFD\u300C${key}\u300D:\u5DF2\u5BFC\u5165\u7684\u6708\u4EFD\u53EA\u6709 ${history.map((r) => r.month).join("\u3001")}\u3002\u8BF7\u52FF\u7ED9\u51FA\u8BE5\u6708\u7684\u4EFB\u4F55\u6570\u5B57\u3002`
    };
  }
  return { report: hit, note: "" };
}
function overviewText(store) {
  const history = store.getMonthlyHistory();
  const current = store.getMonthlyReport();
  const L = ["\u3010\u6570\u636E\u4E2D\u53F0 \xB7 \u5BFC\u5165\u603B\u89C8\u3011", sourceLine(store, history)];
  if (current === null) {
    L.push("\u5F53\u524D\u6CA1\u6709\u4EFB\u4F55\u5DF2\u5BFC\u5165\u7684\u6708\u5EA6\u590D\u76D8\u6570\u636E:\u9762\u677F\u5404\u89C6\u56FE\u5747\u4E3A\u7A7A\u767D\u5360\u4F4D\u3002\u82E5\u7528\u6237\u8BE2\u95EE\u6570\u636E,\u8BF7\u5982\u5B9E\u8BF4\u660E\u300C\u672A\u5BFC\u5165\u300D\u5E76\u5F15\u5BFC\u5176\u7528\u9762\u677F \u{1F4E5} \u5BFC\u5165\u3002");
    return L.join("\n");
  }
  const sp = current.storeProfit ?? [];
  const links = current.platformLinks ?? [];
  const prods = current.systemProducts ?? [];
  const skus = current.systemSkus ?? [];
  L.push("");
  L.push(`\u672C\u671F(\u6700\u8FD1\u5BFC\u5165):${current.period}  |  \u66F4\u65B0\u4E8E ${current.updatedAt}`);
  L.push(`- \u5E97\u94FA\u5229\u6DA6\u884C:${sp.length} \u5BB6(\u5BFC\u5165\u8868\u5E97\u94FA\u6E05\u5355 ${current.shops.length} \u5BB6,\`\u9500\u552E\u989D\u4E3A 0\`\u7684\u5E97\u4E0D\u8FDB\u5165\u5229\u6DA6\u884C)`);
  if (sp.length > 0) {
    const sales = sum2(sp, (r) => r.sales);
    const refund = sum2(sp, (r) => r.refund);
    const gross = sum2(sp, (r) => r.grossProfit);
    const promo = sum2(sp, (r) => r.promoCost);
    L.push(`- \u9500\u552E\u989D\u5408\u8BA1 ${yuan(sales)}  |  \u9000\u6B3E\u5408\u8BA1 ${yuan(refund)}  |  \u6BDB\u5229\u5408\u8BA1 ${yuan(gross)}  |  \u6574\u4F53\u6BDB\u5229\u7387 ${sales > 0 ? pct(gross / sales * 100) : "\u2014"}  |  \u8D39\u6BD4 ${sales > 0 ? pct(promo / sales * 100) : "\u2014"}`);
  }
  L.push(`- \u5E73\u53F0\u8D27\u54C1(\u94FE\u63A5)${int(links.length)} \u884C  |  \u7CFB\u7EDF\u8D27\u54C1 ${int(prods.length)} \u884C  |  \u7CFB\u7EDF\u89C4\u683C(SKU)${int(skus.length)} \u884C`);
  if (links.length > 0) {
    L.push(`- \u94FE\u63A5\u53E3\u5F84 \u9500\u552E\u989D ${yuan(sum2(links, (r) => r.sales))}  |  \u51C0\u9500\u552E\u989D ${yuan(sum2(links, (r) => r.netSales))}  |  \u9000\u6B3E ${yuan(sum2(links, (r) => r.refundAmount))}`);
  }
  const prev = store.getPreviousMonthlyReport();
  L.push("");
  L.push(prev === null ? "\u4E0A\u4E00\u671F:\u65E0(\u4EC5\u5BFC\u5165\u4E00\u671F,\u6570\u636E\u5BF9\u6BD4\u4E0D\u53EF\u7528)" : `\u4E0A\u4E00\u671F:${prev.period}(\u6570\u636E\u5BF9\u6BD4\u53EF\u7528)`);
  L.push(`\u6708\u5EA6\u5386\u53F2:${history.map((r) => r.month).join("\u3001")}`);
  return L.join("\n");
}
function storesText(report, top) {
  const rows = [...report.storeProfit ?? []].sort((a, b) => b.sales - a.sales);
  const L = [`\u3010\u5E97\u94FA\u5229\u6DA6 \xB7 ${report.period}\u3011\u5171 ${rows.length} \u5BB6(\u6309\u9500\u552E\u989D\u964D\u5E8F,\u663E\u793A\u524D ${Math.min(top, rows.length)})`];
  const sales = sum2(rows, (r) => r.sales);
  const refund = sum2(rows, (r) => r.refund);
  L.push(["\u95E8\u5E97", "\u9500\u552E\u989D(=\u6B63\u5411\u6536\u5165)", "\u9000\u6B3E", "\u51C0\u9500\u552E\u989D", "\u6BDB\u5229", "\u6BDB\u5229\u7387", "\u7269\u6D41\u8D39", "\u63A8\u5E7F\u8D39", "\u8D39\u6BD4"].join(" | "));
  for (const r of rows.slice(0, top)) {
    L.push([r.store, yuan(r.sales), yuan(r.refund), yuan(r.sales - r.refund), yuan(r.grossProfit), pct(r.grossMargin), yuan(r.logisticsCost), yuan(r.promoCost), pct(r.feeRatio)].join(" | "));
  }
  L.push(`\u5408\u8BA1:\u9500\u552E\u989D ${yuan(sales)} \xB7 \u9000\u6B3E ${yuan(refund)} \xB7 \u51C0\u9500\u552E\u989D ${yuan(sales - refund)} \xB7 \u6BDB\u5229 ${yuan(sum2(rows, (r) => r.grossProfit))}`);
  L.push("\u53E3\u5F84:\u9500\u552E\u989D\u4EE5\u5229\u6DA6\u8868\u300C\u9500\u552E\u6536\u5165\u300D\u4E3A\u51C6(=\u6B63\u5411\u9500\u552E\u989D);\u51C0\u9500\u552E\u989D = \u9500\u552E\u989D \u2212 \u9000\u6B3E;\u8D39\u6BD4 = \u8FD0\u8425\u63A8\u5E7F\u8D39 \xF7 \u9500\u552E\u989D\u3002\u5546\u54C1\u6392\u540D\u8868\u7684\u9500\u552E\u989D\u5C5E\u53E6\u4E00\u53E3\u5F84(\u542B\u672A\u53D1\u8D27/\u8DE8\u671F),\u4E0D\u8981\u4E0E\u8FD9\u91CC\u7684\u9500\u552E\u989D\u6DF7\u7528\u3002");
  const posRaw = sum2(rows, (r) => Number(r.positiveSalesRaw) || 0);
  if (posRaw > 0) {
    L.push(
      `\u26A0 \u6E90\u8868\u8BE5\u5217\u672A\u88AB\u91C7\u7528:\u5229\u6DA6\u8868\u300C\u6B63\u5411\u9500\u552E\u6536\u5165(\u4E0D\u542B\u7279\u6B8A\u5355)\u300D\u539F\u503C\u5408\u8BA1 ${yuan(posRaw)} \u4E0E\u300C\u9500\u552E\u6536\u5165\u300D${yuan(sales)} \u4E0D\u4E00\u81F4,\u9762\u677F\u9075\u5FAA \u6B63\u5411\u9500\u552E\u6536\u5165 = \u9500\u552E\u6536\u5165,\u6545\u53D6 ${yuan(sales)};\u56DE\u7B54\u65F6\u8BF7\u4F7F\u7528\u8BE5\u503C,\u5E76\u63D0\u9192\u7528\u6237\u6838\u5BF9 Excel \u5229\u6DA6\u8868\u8BE5\u884C\u516C\u5F0F(\u5E38\u89C1\u7B14\u8BEF:\u5199\u6210 \u9500\u552E\u6536\u5165+\u9000\u6B3E,\u5E94\u4E3A \u9500\u552E\u6536\u5165\u2212\u9000\u6B3E)\u3002`
    );
  }
  return L.join("\n");
}
function productsText(report, top) {
  const rows = [...report.systemProducts ?? []].sort((a, b) => b.sales - a.sales);
  const L = [`\u3010\u7CFB\u7EDF\u8D27\u54C1(\u8D27\u54C1\u7EA7) \xB7 ${report.period}\u3011\u5171 ${rows.length} \u884C(\u6309\u9500\u552E\u989D\u964D\u5E8F,\u663E\u793A\u524D ${Math.min(top, rows.length)})`];
  L.push(["\u8D27\u54C1\u540D\u79F0", "\u8D27\u54C1\u7F16\u53F7", "\u9500\u552E\u989D", "\u6BDB\u5229\u989D", "\u6BDB\u5229\u7387", "\u9000\u6B3E\u7387", "\u51C0\u9500\u552E\u989D", "\u63A8\u5E7F\u8D39", "\u5E73\u5747\u5355\u4EF7"].join(" | "));
  for (const r of rows.slice(0, top)) {
    L.push([r.name, r.code, yuan(r.sales), yuan(r.grossProfit), pct(r.grossMargin), pct(r.refundRate), yuan(r.netSales), yuan(r.adSpend), yuan(r.avgPrice)].join(" | "));
  }
  L.push(`\u5408\u8BA1:\u9500\u552E\u989D ${yuan(sum2(rows, (r) => r.sales))} \xB7 \u6BDB\u5229\u989D ${yuan(sum2(rows, (r) => r.grossProfit))} \xB7 \u51C0\u9500\u552E\u989D ${yuan(sum2(rows, (r) => r.netSales))}`);
  return L.join("\n");
}
function linksText(report, top) {
  const rows = [...report.platformLinks ?? []].sort((a, b) => b.sales - a.sales);
  const real = rows.filter((r) => !r.linkName.startsWith("\uFF08\u65E0\u8EAB\u4EFD\u5360\u4F4D\u884C"));
  const L = [`\u3010\u5E73\u53F0\u8D27\u54C1(\u94FE\u63A5\u7EA7) \xB7 ${report.period}\u3011\u5171 ${rows.length} \u884C(\u6309\u9500\u552E\u989D\u964D\u5E8F,\u663E\u793A\u524D ${Math.min(top, rows.length)})`];
  L.push(["\u5E97\u94FA", "\u94FE\u63A5\u540D\u79F0", "\u94FE\u63A5ID", "\u9500\u552E\u989D", "\u9500\u552E\u4EF6\u6570", "\u6BDB\u5229\u989D", "\u9000\u6B3E\u91D1\u989D", "\u51C0\u9500\u552E\u989D", "\u63A8\u5E7F\u8D39"].join(" | "));
  for (const r of rows.slice(0, top)) {
    L.push([r.shop, r.linkName, r.linkId, yuan(r.sales), int(r.salesCount), yuan(r.grossProfit), yuan(r.refundAmount), yuan(r.netSales), yuan(r.adSpend)].join(" | "));
  }
  L.push(`\u5408\u8BA1(\u542B\u5360\u4F4D\u884C\u7ED3\u8F6C):\u9500\u552E\u989D ${yuan(sum2(rows, (r) => r.sales))} \xB7 \u51C0\u9500\u552E\u989D ${yuan(sum2(rows, (r) => r.netSales))} \xB7 \u9000\u6B3E ${yuan(sum2(rows, (r) => r.refundAmount))}`);
  L.push(`\u5176\u4E2D\u6709\u8EAB\u4EFD\u94FE\u63A5 ${real.length} \u884C;\u53E6\u6709\u65E0\u8EAB\u4EFD\u5360\u4F4D\u884C\u5DF2\u5408\u5E76\u4E3A 1 \u6761\u6807\u6CE8\u884C(\u5176\u6570\u503C\u8BA1\u5165\u5408\u8BA1,\u4E0D\u53C2\u4E0E\u6392\u884C)\u3002`);
  return L.join("\n");
}
function skusText(report, top) {
  const rows = [...report.systemSkus ?? []].sort((a, b) => b.sales - a.sales);
  const L = [`\u3010\u7CFB\u7EDF\u89C4\u683C(SKU \u7EA7) \xB7 ${report.period}\u3011\u5171 ${rows.length} \u884C(\u6309\u9500\u552E\u989D\u964D\u5E8F,\u663E\u793A\u524D ${Math.min(top, rows.length)})`];
  L.push(["\u7CFB\u7EDF\u8D27\u54C1\u540D\u79F0", "\u89C4\u683C\u540D\u79F0", "\u5546\u5BB6\u7F16\u7801", "\u9500\u552E\u989D", "\u9500\u552E\u4EF6\u6570", "\u6BDB\u5229\u989D", "\u6BDB\u5229\u7387", "\u9000\u6B3E\u91D1\u989D", "\u51C0\u9500\u552E\u989D"].join(" | "));
  for (const r of rows.slice(0, top)) {
    L.push([r.name, r.specName, r.code, yuan(r.sales), int(r.salesCount), yuan(r.grossProfit), pct(r.grossMargin), yuan(r.refundAmount), yuan(r.netSales)].join(" | "));
  }
  L.push(`\u5408\u8BA1:\u9500\u552E\u989D ${yuan(sum2(rows, (r) => r.sales))} \xB7 \u6BDB\u5229\u989D ${yuan(sum2(rows, (r) => r.grossProfit))} \xB7 \u9000\u6B3E ${yuan(sum2(rows, (r) => r.refundAmount))}`);
  return L.join("\n");
}
function monthsText(store) {
  const history = store.getMonthlyHistory();
  const L = ["\u3010\u5DF2\u5BFC\u5165\u5468\u671F\u6E05\u5355\u3011", sourceLine(store, history)];
  if (history.length === 0) return L.join("\n");
  const cur = store.getMonthlyReport();
  const prev = store.getPreviousMonthlyReport();
  L.push("");
  L.push(["\u6708\u4EFD", "\u5468\u671F", "\u5E97\u94FA\u884C", "\u8D27\u54C1", "\u94FE\u63A5", "\u89C4\u683C", "\u89D2\u8272"].join(" | "));
  for (const m of history) {
    const role = cur && m.period === cur.period ? "\u672C\u671F" : prev && m.period === prev.period ? "\u4E0A\u4E00\u671F" : "\u5386\u53F2\u5F52\u6863";
    L.push([m.month, m.period, int((m.storeProfit ?? []).length), int((m.systemProducts ?? []).length), int((m.platformLinks ?? []).length), int((m.systemSkus ?? []).length), role].join(" | "));
  }
  return L.join("\n");
}
function registerDataReportTools(ctx, store) {
  ctx.tools.register(defineTool11({
    name: "ecommerce_data_report",
    description: "\u8BFB\u53D6\u300C\u7535\u5546\u6570\u636E\u4E2D\u53F0\u300D\u5F53\u524D\u5DF2\u5BFC\u5165\u7684\u590D\u76D8\u6570\u636E(\u9762\u677F\u4E0A\u6BCF\u4E2A\u6570\u5B57\u7684\u552F\u4E00\u6765\u6E90,\u53E3\u5F84\u5B8C\u5168\u4E00\u81F4):\u5E97\u94FA\u5229\u6DA6/\u7CFB\u7EDF\u8D27\u54C1/\u5E73\u53F0\u94FE\u63A5/\u7CFB\u7EDF\u89C4\u683C/\u5468\u671F\u5BF9\u6BD4/\u5DF2\u5BFC\u5165\u6708\u4EFD\u6E05\u5355\u3002\u56DE\u7B54\u4EFB\u4F55\u300C\u9500\u552E\u989D/\u9000\u6B3E/\u6BDB\u5229/\u6392\u884C/\u67D0\u6708\u6570\u636E\u300D\u95EE\u9898\u524D\u5E94\u5148\u8C03\u7528\u672C\u5DE5\u5177\u53D6\u6570;\u672A\u5BFC\u5165\u7684\u5468\u671F\u4F1A\u660E\u786E\u8FD4\u56DE\u300C\u672A\u5BFC\u5165\u300D,\u4E0D\u5F97\u7528 0 \u6216\u63A8\u6D4B\u503C\u4EE3\u66FF\u3002",
    parameters: {
      view: {
        type: "string",
        enum: ["overview", "months", "storeProfit", "systemProducts", "platformLinks", "systemSkus", "compare"],
        description: "\u8981\u8BFB\u7684\u89C6\u56FE:overview=\u603B\u89C8(\u9ED8\u8BA4)/months=\u5DF2\u5BFC\u5165\u6708\u4EFD\u6E05\u5355/storeProfit=\u5E97\u94FA\u5229\u6DA6/systemProducts=\u7CFB\u7EDF\u8D27\u54C1/platformLinks=\u5E73\u53F0\u94FE\u63A5/systemSkus=\u7CFB\u7EDF\u89C4\u683C/compare=\u5468\u671F\u5BF9\u6BD4"
      },
      month: { type: "string", description: "\u6307\u5B9A\u6708\u4EFD(\u5982 2026-07);\u7F3A\u7701=\u6700\u8FD1\u5BFC\u5165\u7684\u4E00\u671F\u3002\u672A\u5BFC\u5165\u7684\u6708\u4EFD\u4F1A\u660E\u786E\u62A5\u300C\u672A\u5BFC\u5165\u300D" },
      top: { type: "number", description: "\u660E\u7EC6\u884C\u6570,\u9ED8\u8BA4 20,\u6700\u5927 200" },
      cycle: { type: "string", enum: ["30d", "7d"], description: "\u4EC5 compare \u89C6\u56FE\u4F7F\u7528:30d=\u6708\u5EA6\u5BF9\u6BD4(\u9ED8\u8BA4)/7d=\u5468\u5EA6\u5BF9\u6BD4" },
      kind: { type: "string", enum: ["platformLinks", "systemProducts", "systemSkus", "storeProfit"], description: "\u4EC5 compare \u89C6\u56FE\u4F7F\u7528:\u5BF9\u6BD4\u5C42\u7EA7" },
      metric: { type: "string", description: "\u4EC5 compare \u89C6\u56FE\u4F7F\u7528:\u5BF9\u6BD4\u6307\u6807,\u5982 sales/netSales/grossProfit/refundRate/grossMargin/adSpend" }
    },
    output: {
      schema: { type: "object", additionalProperties: true, properties: {} },
      render: (args, value) => {
        const v = value;
        const view = args.view ?? "overview";
        return [{ type: "text", text: v.ok ? v.text : `[${view}] ${v.text}` }];
      }
    },
    async execute(args) {
      const view = ["overview", "months", "storeProfit", "systemProducts", "platformLinks", "systemSkus", "compare"].includes(args.view) ? args.view : "overview";
      const top = Math.min(Math.max(args.top ?? 20, 1), 200);
      const history = store.getMonthlyHistory();
      if (view === "months") return asJsonObject({ ok: true, text: monthsText(store) });
      if (view === "overview") {
        return asJsonObject({ ok: true, text: overviewText(store) });
      }
      if (view === "compare") {
        const cycle = args.cycle === "7d" ? "7d" : "30d";
        const kind = args.kind !== void 0 && isCompareKind(args.kind) ? args.kind : void 0;
        const payload = buildComparePayload(store, cycle, kind, args.metric, top);
        const head2 = sourceLine(store, history) + "\n\n";
        if (!payload.hasPrev) {
          return asJsonObject({ ok: false, text: head2 + "\u6682\u65E0\u4E0A\u4E00\u671F\u6570\u636E\u53EF\u5BF9\u6BD4:\u9700\u8FDE\u7EED\u5BFC\u5165\u4E24\u4E2A\u5468\u671F(\u4E0A\u671F+\u672C\u671F)\u7684\u590D\u76D8 Excel \u540E,\u300C\u6570\u636E\u5BF9\u6BD4\u300D\u624D\u53EF\u7528\u3002\u8BF7\u52FF\u7F16\u9020\u4E0A\u671F\u6570\u5B57\u3002" });
        }
        if (!payload.result || payload.result.rows.length === 0) {
          return asJsonObject({ ok: false, text: head2 + "\u5DF2\u5BFC\u5165\u4E24\u671F,\u4F46\u6240\u9009\u5C42\u7EA7/\u6307\u6807\u4E24\u4FA7\u7F3A\u5C11\u53EF\u6BD4\u6570\u636E,\u8BF7\u6362\u5C42\u7EA7\u6216\u6307\u6807\u518D\u8BD5\u3002" });
        }
        return asJsonObject({ ok: true, text: head2 + formatCompareText(payload.result, top) });
      }
      const { report, note } = pickMonthly(store, args.month);
      const head = sourceLine(store, history) + "\n\n";
      if (report === null) {
        return asJsonObject({ ok: false, text: head + (note || "\u672A\u627E\u5230\u5BF9\u5E94\u6708\u4EFD\u7684\u5DF2\u5BFC\u5165\u6570\u636E\u3002") });
      }
      const prefix = note === "" ? head : head + note + "\n\n";
      if (view === "storeProfit") return asJsonObject({ ok: true, text: prefix + storesText(report, top) });
      if (view === "systemProducts") return asJsonObject({ ok: true, text: prefix + productsText(report, top) });
      if (view === "platformLinks") return asJsonObject({ ok: true, text: prefix + linksText(report, top) });
      return asJsonObject({ ok: true, text: prefix + skusText(report, top) });
    }
  }));
}

// src/skills.ts
import { existsSync as existsSync3, readFileSync as readFileSync3, readdirSync } from "node:fs";
import { dirname as dirname4, join as join4 } from "node:path";
import { fileURLToPath as fileURLToPath3 } from "node:url";
var MODULE_DIR3 = dirname4(fileURLToPath3(import.meta.url));
var SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
var PROVIDER_NAME = "ecommerce-analyst";
var PROVIDER_RANK = 600;
function parseFrontmatter(raw) {
  const lines = raw.split(/\r?\n/);
  if ((lines[0] ?? "").trim() !== "---") return void 0;
  let close = -1;
  for (let i = 1; i < lines.length; i++) {
    if ((lines[i] ?? "").trim() === "---") {
      close = i;
      break;
    }
  }
  if (close < 0) return void 0;
  const data = {};
  for (let i = 1; i < close; i++) {
    const m = (lines[i] ?? "").match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (m !== null) data[m[1]] = m[2];
  }
  return { data, body: lines.slice(close + 1).join("\n") };
}
function resolveSkillsDir() {
  for (const candidate of [join4(MODULE_DIR3, "skills"), join4(MODULE_DIR3, "..", "skills")]) {
    if (existsSync3(join4(candidate, "keyword-research", "SKILL.md"))) return candidate;
  }
  return void 0;
}
function readSkill(path) {
  let raw;
  try {
    raw = readFileSync3(path, "utf8");
  } catch {
    return void 0;
  }
  const parsed = parseFrontmatter(raw);
  if (parsed === void 0) return void 0;
  const name2 = (parsed.data.name ?? "").trim();
  const description = (parsed.data.description ?? "").trim();
  if (name2 === "" || description === "" || !SKILL_NAME.test(name2)) return void 0;
  const whenToUse = (parsed.data.whenToUse ?? "").trim();
  return {
    name: name2,
    description,
    ...whenToUse !== "" ? { whenToUse } : {},
    invocation: { modelInvocable: true, userInvocable: true },
    source: "custom",
    provider: PROVIDER_NAME,
    content: parsed.body.trim(),
    path
  };
}
function createSkillsProvider(skillsDir) {
  return {
    name: PROVIDER_NAME,
    async list() {
      const candidates = [];
      let entries;
      try {
        entries = readdirSync(skillsDir, { withFileTypes: true });
      } catch {
        return candidates;
      }
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const md = join4(skillsDir, entry.name, "SKILL.md");
        const skill = readSkill(md);
        if (skill === void 0) continue;
        candidates.push({
          name: skill.name,
          description: skill.description,
          ...skill.whenToUse !== void 0 ? { whenToUse: skill.whenToUse } : {},
          invocation: skill.invocation,
          source: skill.source,
          provider: PROVIDER_NAME,
          resourceBase: { kind: "directory", path: skillsDir },
          rank: PROVIDER_RANK,
          locator: md,
          path: md
        });
      }
      return candidates;
    },
    async get(candidate) {
      const md = candidate.locator;
      return readSkill(md);
    }
  };
}
function registerPluginSkills(ctx) {
  const registry = ctx.get("skills");
  if (registry === void 0 || typeof registry.registerProvider !== "function") {
    return void 0;
  }
  const skillsDir = resolveSkillsDir();
  if (skillsDir === void 0) return void 0;
  const provider = createSkillsProvider(skillsDir);
  return registry.registerProvider(() => provider);
}

// src/index.ts
var name = "ecommerce-analyst";
var inject = ["systemPrompt", "webServer", "tools"];
async function apply(ctx, config = {}) {
  const envActivation = process.env.ECOM_ANALYST_ACTIVATION === "active" ? "active" : process.env.ECOM_ANALYST_ACTIVATION === "silent" ? "silent" : void 0;
  const resolved = {
    activation: envActivation ?? config.activation ?? defaultConfig.activation,
    platform: { ...defaultConfig.platform, ...config.platform },
    storage: { ...defaultConfig.storage, ...config.storage },
    inventory: { ...defaultConfig.inventory, ...config.inventory },
    files: { ...defaultConfig.files, ...config.files }
  };
  resolved.storage.file = ensureWritableStoreFile(resolved.storage.file);
  const adapter = await createAdapter({
    ...resolved.platform,
    name: resolved.platform.name === "rest" ? "rest" : "mock"
  });
  const store = new EcommerceStore(adapter, {
    file: resolved.storage.file,
    seedOnEmpty: resolved.storage.seedOnEmpty,
    lowStockThreshold: resolved.inventory.lowStockThreshold
  });
  await store.init();
  if (resolved.activation === "active") {
    console.log(
      store.sourceMode === "mock" ? "[ecommerce-analyst] \u5DF2\u542F\u52A8\uFF1Aactive \u6A21\u5F0F\uFF0C\u672C\u5730\u7A7A\u5E93\uFF08\u6570\u636E\u9760\u5BFC\u5165\uFF09\uFF1B\u5DE5\u5177\u4E0E\u63D0\u793A\u6CE8\u5165\u5DF2\u5168\u91CF\u6CE8\u518C" : `[ecommerce-analyst] \u5DF2\u542F\u52A8\uFF1Aactive \u6A21\u5F0F\uFF0C\u5BF9\u63A5\u5E73\u53F0 API\uFF08${adapter.name}\uFF09`
    );
  } else {
    console.log(
      "[ecommerce-analyst] \u5DF2\u542F\u52A8\uFF1Asilent \u6A21\u5F0F\u2014\u2014\u5BF9\u4F1A\u8BDD\u96F6\u5F71\u54CD\uFF08\u672A\u6CE8\u518C\u5DE5\u5177/\u672A\u6CE8\u5165\u63D0\u793A\uFF09\u3002\u9700\u8981\u7535\u5546\u5DE5\u4F5C\u53F0\u80FD\u529B\u65F6\uFF1Aprofile \u8865\u4E01\u5C42\u8BBE config.activation=active\uFF0C\u6216\u73AF\u5883\u53D8\u91CF ECOM_ANALYST_ACTIVATION=active"
    );
  }
  if (resolved.activation === "active") {
    registerProductTools(ctx, store);
    registerOrderTools(ctx, store);
    registerStatsTools(ctx, store);
    registerInventoryTools(ctx, store);
    registerBackupTools(ctx, store);
    registerExcelTools(ctx, store);
    registerQaTool(ctx, store);
    registerExportCsvTool(ctx, store);
    registerModeTools(ctx, store);
    registerCompareTools(ctx, store);
    registerDataReportTools(ctx, store);
  }
  const disposeSkills = registerPluginSkills(ctx);
  if (disposeSkills === void 0) {
    console.warn("[ecommerce-analyst] skills \u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7\u6280\u80FD\u76EE\u5F55\u6CE8\u518C\uFF08/name \u8C03\u7528\u4E0D\u53EF\u7528\uFF09");
  } else {
    ctx.effect(() => disposeSkills, "ecommerce: skills provider");
  }
  let webServer = ctx.get("webServer");
  if (webServer === void 0) {
    await new Promise((r) => setTimeout(r, 250));
    webServer = ctx.get("webServer");
  }
  if (webServer === void 0) {
    console.warn("[ecommerce-analyst] webServer \u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7\u5E97\u94FA\u5DE5\u4F5C\u53F0 API \u6CE8\u518C");
  } else {
    const disposeApi = registerShopApi(webServer, store, ctx, resolveFilesDirs(resolved.files));
    ctx.effect(() => disposeApi, "ecommerce: shop api routes");
    const disposeBase = injectApiBase(webServer);
    if (disposeBase !== void 0) {
      ctx.effect(() => disposeBase, "ecommerce: api base injection");
    }
  }
  if (resolved.activation === "active") {
    ctx.systemPrompt.section({
      name: "ecommerce:today",
      order: -95,
      text: () => todayPrompt(store)
    });
    ctx.systemPrompt.section({
      name: "ecommerce:qa-rules",
      order: -94,
      text: () => qaRuleDescription()
    });
    ctx.systemPrompt.section({
      name: "ecommerce:data-source",
      order: -93,
      text: () => dataSourcePrompt(store)
    });
  }
}
function ensureWritableStoreFile(raw) {
  const target = resolveStoreFile(raw);
  try {
    mkdirSync2(dirname5(target), { recursive: true });
    return target;
  } catch (err) {
    const fallback = join5(tmpdir(), "ecommerce-analyst-plugin", "data", "store.json");
    console.warn(
      `[ecommerce-analyst] \u6301\u4E45\u5316\u76EE\u5F55\u4E0D\u53EF\u5199\uFF0C\u56DE\u9000\u7CFB\u7EDF\u4E34\u65F6\u76EE\u5F55\uFF1A${target} \u2192 ${fallback}\uFF08`,
      err instanceof Error ? err.message : String(err),
      ")"
    );
    try {
      mkdirSync2(dirname5(fallback), { recursive: true });
      return fallback;
    } catch (err2) {
      console.error(
        "[ecommerce-analyst] \u4E34\u65F6\u76EE\u5F55\u4EA6\u4E0D\u53EF\u5199\uFF0C\u6570\u636E\u5C06\u4EC5\u5B58\u5185\u5B58\uFF08\u91CD\u542F\u4E22\u5931\uFF09\uFF1A",
        err2 instanceof Error ? err2.message : String(err2)
      );
      return target;
    }
  }
}
function todayPrompt(store) {
  const { shipments, overdues, lowStockCount } = store.todayActions();
  const date = todayStr();
  const parts = [`\u4ECA\u5929\u662F ${date}\uFF0C\u7535\u5546\u5E97\u94FA\u4ECA\u65E5\u8981\u5904\u7406\uFF1A`];
  if (overdues.length > 0) {
    const list = overdues.map((o) => `${o.order_id}\uFF08${o.buyer}\uFF0C\xA5${o.amount.toFixed(2)}\uFF09`).join("\u3001");
    parts.push(`- \u26A0\uFE0F \u903E\u671F\u672A\u5904\u7406\u8BA2\u5355 ${overdues.length} \u7B14\uFF1A${list}\uFF08\u5EFA\u8BAE\u5C3D\u5FEB\u8DDF\u8FDB\uFF09`);
  }
  if (shipments.length > 0) {
    parts.push(`- \u{1F4E6} \u5F85\u53D1\u8D27\u8BA2\u5355 ${shipments.length} \u7B14\uFF08\u53EF\u7528 order_list \u67E5\u8BE2 status=paid \u540E\u9010\u4E00\u53D1\u8D27\uFF09`);
  }
  if (lowStockCount > 0) {
    parts.push(`- \u26A0\uFE0F \u4F4E\u5E93\u5B58\u5546\u54C1 ${lowStockCount} \u4EF6\uFF08\u53EF\u7528 inventory_low_stock \u67E5\u770B\uFF09`);
  }
  if (parts.length === 1) {
    parts.push("- \u4ECA\u65E5\u65E0\u5F85\u529E\uFF0C\u5E97\u94FA\u72B6\u6001\u6B63\u5E38\u3002");
  }
  parts.push(
    "\u7528\u6237\u8BE2\u95EE\u5E97\u94FA\u60C5\u51B5\u65F6\uFF0C\u4F18\u5148\u6C47\u62A5\u4EE5\u4E0A\u5F85\u529E\uFF1B\u5904\u7406\u52A8\u4F5C\uFF08\u53D1\u8D27/\u6539\u5E93\u5B58/\u9000\u6B3E\uFF09\u6267\u884C\u524D\u5411\u7528\u6237\u786E\u8BA4\u3002"
  );
  return parts.join("\n");
}
function dataSourcePrompt(store) {
  const history = store.getMonthlyHistory();
  const weekly = store.getWeeklyReport();
  const parts = ["\u3010\u7ECF\u8425\u6570\u636E\u6765\u6E90\u7EAA\u5F8B\u3011"];
  parts.push(
    "\u300C\u7535\u5546\u6570\u636E\u4E2D\u53F0\u300D\u9762\u677F\u4E0A\u663E\u793A\u7684\u6BCF\u4E00\u4E2A\u6570\u5B57\uFF0C\u90FD\u53EA\u6765\u81EA\u7528\u6237\u5BFC\u5165\u7684\u590D\u76D8 Excel\uFF08\u5229\u6DA6\u8868 + \u5546\u54C1\u6392\u540D\u5BFC\u51FA\uFF09\uFF0C\u6CA1\u6709\u4EFB\u4F55\u5185\u7F6E\u793A\u4F8B\u6570\u636E\u3002\u5546\u54C1/\u8BA2\u5355\u5E93\u662F\u53E6\u4E00\u5957\u57DF\uFF0C\u672A\u5BFC\u5165\u8868\u683C\u65F6\u4E3A\u7A7A\u3002"
  );
  if (history.length === 0 && weekly === null) {
    parts.push("\u5F53\u524D**\u5C1A\u672A\u5BFC\u5165\u4EFB\u4F55\u590D\u76D8\u6570\u636E**\uFF1A\u9762\u677F\u5404\u89C6\u56FE\u4E3A\u7A7A\u767D\u5360\u4F4D\u3002\u6B64\u65F6\u4EFB\u4F55\u91D1\u989D/\u6392\u884C\u90FD\u5FC5\u987B\u56DE\u7B54\u300C\u672A\u5BFC\u5165\u300D\uFF0C\u4E25\u7981\u7ED9\u51FA\u5177\u4F53\u6570\u5B57\u6216\u793A\u4F8B\u503C\u3002");
  } else {
    parts.push(
      `\u5F53\u524D\u5DF2\u5BFC\u5165\uFF1A\u6708\u5EA6 ${history.map((m) => m.month).join("\u3001") || "\uFF08\u65E0\uFF09"}\uFF1B\u5468\u5EA6 ${weekly ? weekly.period : "\uFF08\u65E0\uFF09"}\u3002\u672A\u5217\u51FA\u7684\u5468\u671F\u5373\u300C\u672A\u5BFC\u5165\u300D\uFF0C\u4E0D\u5F97\u7ED9\u51FA\u5176\u6570\u5B57\u3002`
    );
  }
  parts.push(
    "\u56DE\u7B54\u4EFB\u4F55\u9500\u552E\u989D/\u9000\u6B3E/\u6BDB\u5229/\u6392\u884C/\u95E8\u5E97/\u67D0\u6708\u6570\u636E\u7684\u95EE\u9898\u524D\uFF0C**\u5148\u8C03\u7528 ecommerce_data_report** \u53D6\u6570\uFF08\u5B83\u8FD4\u56DE\u7684\u4E0E\u9762\u677F\u540C\u6E90\u540C\u53E3\u5F84\uFF09\uFF1B\u4E0D\u8981\u81EA\u5DF1\u53BB\u89E3\u6790 data/store.json\uFF0C\u4E5F\u4E0D\u8981\u4F9D\u636E\u8BB0\u5FC6\u6216\u4F30\u7B97\u4F5C\u7B54\u3002"
  );
  parts.push("\u5DE5\u5177\u7684\u8FD4\u56DE\u91CC\u4F1A\u5E26\u300C\u6570\u636E\u6765\u6E90\u300D\u884C\u4E0E\u5DF2\u5BFC\u5165\u6708\u4EFD\u6E05\u5355\uFF1B\u82E5\u8BE5\u5DE5\u5177\u8BF4\u67D0\u6708\u672A\u5BFC\u5165\uFF0C\u5C31\u7167\u5B9E\u8F6C\u8FBE\uFF0C\u4E0D\u5F97\u6539\u7528 0 \u6216\u63A8\u6D4B\u503C\u3002");
  return parts.join("\n");
}
export {
  apply,
  inject,
  name
};
