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

// data/seed.json
var seed_default;
var init_seed = __esm({
  "data/seed.json"() {
    seed_default = {
      products: [
        {
          sku: "SKU-0001",
          name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          category: "\u670D\u9970",
          price: 159,
          stock: 427,
          status: "on_sale",
          created_at: "2026-04-16T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0002",
          name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          category: "\u670D\u9970",
          price: 189,
          stock: 1,
          status: "on_sale",
          created_at: "2026-04-17T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0003",
          name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          category: "\u670D\u9970",
          price: 69,
          stock: 55,
          status: "on_sale",
          created_at: "2026-04-12T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0004",
          name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          category: "\u670D\u9970",
          price: 399,
          stock: 157,
          status: "on_sale",
          created_at: "2026-04-23T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0005",
          name: "\u590D\u53E4\u5E06\u5E03\u978B",
          category: "\u670D\u9970",
          price: 159,
          stock: 0,
          status: "off_sale",
          created_at: "2026-03-03T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0006",
          name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          category: "\u6570\u7801\u914D\u4EF6",
          price: 299,
          stock: 73,
          status: "on_sale",
          created_at: "2026-04-03T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0007",
          name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          category: "\u6570\u7801\u914D\u4EF6",
          price: 199,
          stock: 1,
          status: "on_sale",
          created_at: "2026-03-13T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0008",
          name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          category: "\u6570\u7801\u914D\u4EF6",
          price: 129,
          stock: 393,
          status: "on_sale",
          created_at: "2026-05-20T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0009",
          name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          category: "\u6570\u7801\u914D\u4EF6",
          price: 89,
          stock: 241,
          status: "on_sale",
          created_at: "2026-04-13T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0010",
          name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          category: "\u6570\u7801\u914D\u4EF6",
          price: 119,
          stock: 290,
          status: "on_sale",
          created_at: "2026-05-16T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0011",
          name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          category: "\u5BB6\u5C45\u751F\u6D3B",
          price: 99,
          stock: 425,
          status: "on_sale",
          created_at: "2026-03-22T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0012",
          name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          category: "\u5BB6\u5C45\u751F\u6D3B",
          price: 259,
          stock: 3,
          status: "on_sale",
          created_at: "2026-05-13T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0013",
          name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          category: "\u5BB6\u5C45\u751F\u6D3B",
          price: 139,
          stock: 131,
          status: "on_sale",
          created_at: "2026-03-19T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0014",
          name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          category: "\u5BB6\u5C45\u751F\u6D3B",
          price: 299,
          stock: 0,
          status: "off_sale",
          created_at: "2026-04-04T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0015",
          name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          category: "\u5BB6\u5C45\u751F\u6D3B",
          price: 49,
          stock: 262,
          status: "on_sale",
          created_at: "2026-05-26T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0016",
          name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          category: "\u7F8E\u5986\u4E2A\u62A4",
          price: 59,
          stock: 474,
          status: "on_sale",
          created_at: "2026-04-03T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0017",
          name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          category: "\u7F8E\u5986\u4E2A\u62A4",
          price: 79,
          stock: 7,
          status: "on_sale",
          created_at: "2026-03-23T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0018",
          name: "\u9632\u6652\u971C SPF50+",
          category: "\u7F8E\u5986\u4E2A\u62A4",
          price: 129,
          stock: 57,
          status: "on_sale",
          created_at: "2026-04-15T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0019",
          name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          category: "\u7F8E\u5986\u4E2A\u62A4",
          price: 199,
          stock: 465,
          status: "on_sale",
          created_at: "2026-05-10T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0020",
          name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          category: "\u7F8E\u5986\u4E2A\u62A4",
          price: 89,
          stock: 464,
          status: "on_sale",
          created_at: "2026-03-05T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0021",
          name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          category: "\u98DF\u54C1\u996E\u6599",
          price: 89,
          stock: 312,
          status: "on_sale",
          created_at: "2026-05-19T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0022",
          name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          category: "\u98DF\u54C1\u996E\u6599",
          price: 129,
          stock: 3,
          status: "on_sale",
          created_at: "2026-05-13T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0023",
          name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          category: "\u98DF\u54C1\u996E\u6599",
          price: 59,
          stock: 0,
          status: "off_sale",
          created_at: "2026-05-27T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0024",
          name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          category: "\u8FD0\u52A8\u6237\u5916",
          price: 79,
          stock: 149,
          status: "on_sale",
          created_at: "2026-03-02T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0025",
          name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          category: "\u8FD0\u52A8\u6237\u5916",
          price: 49,
          stock: 203,
          status: "on_sale",
          created_at: "2026-03-10T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        },
        {
          sku: "SKU-0026",
          name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          category: "\u8FD0\u52A8\u6237\u5916",
          price: 199,
          stock: 187,
          status: "on_sale",
          created_at: "2026-03-02T10:00:00.000Z",
          updated_at: "2026-08-20T09:00:00.000Z"
        }
      ],
      orders: [
        {
          order_id: "ORD-20260528-401",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 2,
          amount: 518,
          status: "pending",
          created_at: "2026-05-28T09:52:44.000Z"
        },
        {
          order_id: "ORD-20260528-194",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 2,
          amount: 258,
          status: "completed",
          created_at: "2026-05-28T15:00:44.000Z",
          shipped_at: "2026-05-29T15:00:44.000Z",
          tracking_no: "SF7074923192",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260528-140",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 3,
          amount: 477,
          status: "completed",
          created_at: "2026-05-28T17:02:15.000Z",
          shipped_at: "2026-05-29T17:02:15.000Z",
          tracking_no: "SF5796318170",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260529-117",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 1,
          amount: 59,
          status: "completed",
          created_at: "2026-05-29T12:23:39.000Z",
          shipped_at: "2026-05-30T12:23:39.000Z",
          tracking_no: "SF4088290468",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260529-098",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 5,
          amount: 645,
          status: "completed",
          created_at: "2026-05-29T16:00:36.000Z",
          shipped_at: "2026-05-31T16:00:36.000Z",
          tracking_no: "SF6949562619",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260530-256",
          buyer: "\u9752\u9752",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 1,
          amount: 119,
          status: "completed",
          created_at: "2026-05-30T12:45:07.000Z",
          shipped_at: "2026-06-02T12:45:07.000Z",
          tracking_no: "SF8734253267",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260530-254",
          buyer: "\u963F\u54F2",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 5,
          amount: 1295,
          status: "completed",
          created_at: "2026-05-30T14:41:55.000Z",
          shipped_at: "2026-06-02T14:41:55.000Z",
          tracking_no: "SF8455743730",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260530-058",
          buyer: "\u6728\u6728",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 2,
          amount: 118,
          status: "pending",
          created_at: "2026-05-30T15:18:02.000Z"
        },
        {
          order_id: "ORD-20260530-130",
          buyer: "\u963F\u54F2",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 5,
          amount: 795,
          status: "completed",
          created_at: "2026-05-30T16:27:47.000Z",
          shipped_at: "2026-06-02T16:27:47.000Z",
          tracking_no: "SF6694087340",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260530-065",
          buyer: "Suki",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 3,
          amount: 387,
          status: "shipped",
          created_at: "2026-05-30T18:55:20.000Z",
          shipped_at: "2026-06-01T18:55:20.000Z",
          tracking_no: "SF6426296608",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260531-003",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 1,
          amount: 99,
          status: "refunded",
          created_at: "2026-05-31T11:48:33.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260531-187",
          buyer: "\u963F\u8363",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 1,
          amount: 189,
          status: "completed",
          created_at: "2026-05-31T13:44:20.000Z",
          shipped_at: "2026-06-03T13:44:20.000Z",
          tracking_no: "SF1323065292",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260531-357",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 1,
          amount: 159,
          status: "shipped",
          created_at: "2026-05-31T14:56:13.000Z",
          shipped_at: "2026-06-02T14:56:13.000Z",
          tracking_no: "SF2744194245",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260531-471",
          buyer: "\u8389\u8389",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 1,
          amount: 79,
          status: "completed",
          created_at: "2026-05-31T20:12:53.000Z",
          shipped_at: "2026-06-03T20:12:53.000Z",
          tracking_no: "SF8760208836",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260601-145",
          buyer: "\u6728\u6728",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 5,
          amount: 395,
          status: "completed",
          created_at: "2026-06-01T08:15:54.000Z",
          shipped_at: "2026-06-02T08:15:54.000Z",
          tracking_no: "SF9209078409",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260601-146",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 2,
          amount: 518,
          status: "paid",
          created_at: "2026-06-01T14:20:29.000Z"
        },
        {
          order_id: "ORD-20260601-334",
          buyer: "\u8001\u738B",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 5,
          amount: 445,
          status: "paid",
          created_at: "2026-06-01T15:18:15.000Z"
        },
        {
          order_id: "ORD-20260601-315",
          buyer: "\u963F\u54F2",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 5,
          amount: 345,
          status: "shipped",
          created_at: "2026-06-01T20:15:01.000Z",
          shipped_at: "2026-06-03T20:15:01.000Z",
          tracking_no: "SF6135976869",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260601-276",
          buyer: "\u9752\u9752",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 4,
          amount: 356,
          status: "completed",
          created_at: "2026-06-01T20:31:38.000Z",
          shipped_at: "2026-06-04T20:31:38.000Z",
          tracking_no: "SF5489456131",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260602-153",
          buyer: "\u9752\u9752",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 5,
          amount: 245,
          status: "pending",
          created_at: "2026-06-02T08:35:09.000Z"
        },
        {
          order_id: "ORD-20260602-324",
          buyer: "\u963F\u51EF",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 5,
          amount: 1295,
          status: "completed",
          created_at: "2026-06-02T10:26:46.000Z",
          shipped_at: "2026-06-04T10:26:46.000Z",
          tracking_no: "SF2362911189",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260602-088",
          buyer: "\u8389\u8389",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 4,
          amount: 516,
          status: "completed",
          created_at: "2026-06-02T11:48:58.000Z",
          shipped_at: "2026-06-04T11:48:58.000Z",
          tracking_no: "SF6419383598",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260602-397",
          buyer: "\u96EA\u8389",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 4,
          amount: 796,
          status: "completed",
          created_at: "2026-06-02T12:06:32.000Z",
          shipped_at: "2026-06-04T12:06:32.000Z",
          tracking_no: "SF6456399293",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260602-413",
          buyer: "Suki",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 1,
          amount: 129,
          status: "completed",
          created_at: "2026-06-02T14:36:53.000Z",
          shipped_at: "2026-06-03T14:36:53.000Z",
          tracking_no: "SF3684110644",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260602-169",
          buyer: "\u963F\u51EF",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 1,
          amount: 59,
          status: "completed",
          created_at: "2026-06-02T15:09:54.000Z",
          shipped_at: "2026-06-05T15:09:54.000Z",
          tracking_no: "SF6892237322",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260602-020",
          buyer: "\u5927\u718A",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 1,
          amount: 79,
          status: "shipped",
          created_at: "2026-06-02T15:56:17.000Z",
          shipped_at: "2026-06-05T15:56:17.000Z",
          tracking_no: "SF8962545454",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260602-174",
          buyer: "Suki",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 2,
          amount: 278,
          status: "completed",
          created_at: "2026-06-02T21:50:45.000Z",
          shipped_at: "2026-06-05T21:50:45.000Z",
          tracking_no: "SF4089799950",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260603-419",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 3,
          amount: 387,
          status: "completed",
          created_at: "2026-06-03T09:54:48.000Z",
          shipped_at: "2026-06-04T09:54:48.000Z",
          tracking_no: "SF3946624247",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260603-195",
          buyer: "\u963F\u6770",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 2,
          amount: 318,
          status: "completed",
          created_at: "2026-06-03T14:05:09.000Z",
          shipped_at: "2026-06-06T14:05:09.000Z",
          tracking_no: "SF9791701929",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260603-452",
          buyer: "\u5976\u76D6",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 3,
          amount: 597,
          status: "paid",
          created_at: "2026-06-03T14:36:41.000Z"
        },
        {
          order_id: "ORD-20260603-074",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 5,
          amount: 445,
          status: "shipped",
          created_at: "2026-06-03T17:04:53.000Z",
          shipped_at: "2026-06-06T17:04:53.000Z",
          tracking_no: "SF3897323001",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260603-134",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 4,
          amount: 1196,
          status: "paid",
          created_at: "2026-06-03T18:51:30.000Z"
        },
        {
          order_id: "ORD-20260603-085",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 5,
          amount: 645,
          status: "shipped",
          created_at: "2026-06-03T20:45:17.000Z",
          shipped_at: "2026-06-04T20:45:17.000Z",
          tracking_no: "SF3995473178",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260603-029",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 1,
          amount: 189,
          status: "completed",
          created_at: "2026-06-03T21:02:38.000Z",
          shipped_at: "2026-06-04T21:02:38.000Z",
          tracking_no: "SF1211066363",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260604-354",
          buyer: "\u8389\u8389",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 1,
          amount: 129,
          status: "cancelled",
          created_at: "2026-06-04T13:20:51.000Z"
        },
        {
          order_id: "ORD-20260604-333",
          buyer: "\u963F\u6770",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 2,
          amount: 98,
          status: "completed",
          created_at: "2026-06-04T15:20:15.000Z",
          shipped_at: "2026-06-06T15:20:15.000Z",
          tracking_no: "SF8994166516",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260604-120",
          buyer: "\u6843\u5B50",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 5,
          amount: 395,
          status: "completed",
          created_at: "2026-06-04T17:17:07.000Z",
          shipped_at: "2026-06-06T17:17:07.000Z",
          tracking_no: "SF5658850029",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260604-307",
          buyer: "Suki",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 3,
          amount: 777,
          status: "completed",
          created_at: "2026-06-04T18:38:05.000Z",
          shipped_at: "2026-06-07T18:38:05.000Z",
          tracking_no: "SF2173720239",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260605-328",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 1,
          amount: 199,
          status: "shipped",
          created_at: "2026-06-05T08:35:19.000Z",
          shipped_at: "2026-06-08T08:35:19.000Z",
          tracking_no: "SF1376341111",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260605-001",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 2,
          amount: 118,
          status: "completed",
          created_at: "2026-06-05T09:47:53.000Z",
          shipped_at: "2026-06-07T09:47:53.000Z",
          tracking_no: "SF4052129089",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260605-454",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 3,
          amount: 387,
          status: "shipped",
          created_at: "2026-06-05T10:05:07.000Z",
          shipped_at: "2026-06-06T10:05:07.000Z",
          tracking_no: "SF9403653501",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260605-157",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 1,
          amount: 299,
          status: "shipped",
          created_at: "2026-06-05T10:51:44.000Z",
          shipped_at: "2026-06-06T10:51:44.000Z",
          tracking_no: "SF9600287759",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260605-192",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 1,
          amount: 89,
          status: "paid",
          created_at: "2026-06-05T12:22:27.000Z"
        },
        {
          order_id: "ORD-20260605-400",
          buyer: "\u963F\u51EF",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 5,
          amount: 695,
          status: "cancelled",
          created_at: "2026-06-05T14:44:27.000Z"
        },
        {
          order_id: "ORD-20260605-384",
          buyer: "\u665A\u98CE",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 5,
          amount: 995,
          status: "cancelled",
          created_at: "2026-06-05T14:55:06.000Z"
        },
        {
          order_id: "ORD-20260605-463",
          buyer: "\u5927\u718A",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 1,
          amount: 99,
          status: "completed",
          created_at: "2026-06-05T16:43:42.000Z",
          shipped_at: "2026-06-07T16:43:42.000Z",
          tracking_no: "SF5916467341",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260605-124",
          buyer: "\u9752\u9752",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 1,
          amount: 119,
          status: "paid",
          created_at: "2026-06-05T18:44:53.000Z"
        },
        {
          order_id: "ORD-20260605-089",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 1,
          amount: 129,
          status: "completed",
          created_at: "2026-06-05T21:51:25.000Z",
          shipped_at: "2026-06-06T21:51:25.000Z",
          tracking_no: "SF6353340613",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260606-376",
          buyer: "\u963F\u6770",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 3,
          amount: 417,
          status: "shipped",
          created_at: "2026-06-06T08:39:35.000Z",
          shipped_at: "2026-06-08T08:39:35.000Z",
          tracking_no: "SF5144970112",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260606-200",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 5,
          amount: 995,
          status: "cancelled",
          created_at: "2026-06-06T15:53:25.000Z"
        },
        {
          order_id: "ORD-20260606-462",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 2,
          amount: 198,
          status: "completed",
          created_at: "2026-06-06T15:57:23.000Z",
          shipped_at: "2026-06-08T15:57:23.000Z",
          tracking_no: "SF3952379285",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260606-251",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 2,
          amount: 238,
          status: "completed",
          created_at: "2026-06-06T15:58:46.000Z",
          shipped_at: "2026-06-08T15:58:46.000Z",
          tracking_no: "SF1380285023",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260606-111",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 1,
          amount: 129,
          status: "completed",
          created_at: "2026-06-06T18:00:52.000Z",
          shipped_at: "2026-06-09T18:00:52.000Z",
          tracking_no: "SF4184844674",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260606-008",
          buyer: "\u829D\u829D",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 3,
          amount: 237,
          status: "shipped",
          created_at: "2026-06-06T19:56:37.000Z",
          shipped_at: "2026-06-07T19:56:37.000Z",
          tracking_no: "SF1100815058",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260607-101",
          buyer: "\u963F\u5357",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 3,
          amount: 387,
          status: "pending",
          created_at: "2026-06-07T09:39:03.000Z"
        },
        {
          order_id: "ORD-20260607-011",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 3,
          amount: 597,
          status: "pending",
          created_at: "2026-06-07T09:50:49.000Z"
        },
        {
          order_id: "ORD-20260607-191",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 3,
          amount: 597,
          status: "completed",
          created_at: "2026-06-07T12:33:07.000Z",
          shipped_at: "2026-06-10T12:33:07.000Z",
          tracking_no: "SF2303545802",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260607-365",
          buyer: "\u5927\u718A",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 2,
          amount: 118,
          status: "paid",
          created_at: "2026-06-07T12:40:30.000Z"
        },
        {
          order_id: "ORD-20260607-205",
          buyer: "\u963F\u8363",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 4,
          amount: 196,
          status: "cancelled",
          created_at: "2026-06-07T12:54:16.000Z"
        },
        {
          order_id: "ORD-20260607-456",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 3,
          amount: 387,
          status: "pending",
          created_at: "2026-06-07T13:32:03.000Z"
        },
        {
          order_id: "ORD-20260607-220",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 1,
          amount: 89,
          status: "pending",
          created_at: "2026-06-07T15:12:16.000Z"
        },
        {
          order_id: "ORD-20260607-321",
          buyer: "Suki",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 2,
          amount: 178,
          status: "completed",
          created_at: "2026-06-07T15:34:54.000Z",
          shipped_at: "2026-06-08T15:34:54.000Z",
          tracking_no: "SF6762400471",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260607-227",
          buyer: "\u963F\u6770",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 3,
          amount: 1197,
          status: "completed",
          created_at: "2026-06-07T21:12:11.000Z",
          shipped_at: "2026-06-09T21:12:11.000Z",
          tracking_no: "SF1139824291",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260608-355",
          buyer: "\u665A\u98CE",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 2,
          amount: 318,
          status: "pending",
          created_at: "2026-06-08T08:19:55.000Z"
        },
        {
          order_id: "ORD-20260608-445",
          buyer: "\u963F\u6770",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 5,
          amount: 295,
          status: "refunded",
          created_at: "2026-06-08T08:31:53.000Z",
          refund_reason: "\u5546\u54C1\u8D28\u91CF\u95EE\u9898"
        },
        {
          order_id: "ORD-20260608-245",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 2,
          amount: 398,
          status: "pending",
          created_at: "2026-06-08T10:27:07.000Z"
        },
        {
          order_id: "ORD-20260608-432",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 5,
          amount: 245,
          status: "completed",
          created_at: "2026-06-08T15:48:37.000Z",
          shipped_at: "2026-06-09T15:48:37.000Z",
          tracking_no: "SF8066808772",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260608-027",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 2,
          amount: 278,
          status: "completed",
          created_at: "2026-06-08T16:38:41.000Z",
          shipped_at: "2026-06-11T16:38:41.000Z",
          tracking_no: "SF1455207913",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260608-409",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 4,
          amount: 236,
          status: "completed",
          created_at: "2026-06-08T17:38:10.000Z",
          shipped_at: "2026-06-11T17:38:10.000Z",
          tracking_no: "SF5639036363",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260608-330",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 5,
          amount: 1995,
          status: "shipped",
          created_at: "2026-06-08T19:29:14.000Z",
          shipped_at: "2026-06-10T19:29:14.000Z",
          tracking_no: "SF8407161178",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260609-007",
          buyer: "\u8001\u738B",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 5,
          amount: 445,
          status: "paid",
          created_at: "2026-06-09T08:45:46.000Z"
        },
        {
          order_id: "ORD-20260609-264",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 2,
          amount: 178,
          status: "pending",
          created_at: "2026-06-09T13:41:30.000Z"
        },
        {
          order_id: "ORD-20260609-154",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 4,
          amount: 316,
          status: "completed",
          created_at: "2026-06-09T15:37:49.000Z",
          shipped_at: "2026-06-11T15:37:49.000Z",
          tracking_no: "SF4214007157",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260609-019",
          buyer: "\u963F\u6770",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 1,
          amount: 89,
          status: "pending",
          created_at: "2026-06-09T16:41:45.000Z"
        },
        {
          order_id: "ORD-20260609-129",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 2,
          amount: 98,
          status: "completed",
          created_at: "2026-06-09T18:12:44.000Z",
          shipped_at: "2026-06-12T18:12:44.000Z",
          tracking_no: "SF2730800161",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260609-239",
          buyer: "\u963F\u51EF",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 3,
          amount: 597,
          status: "completed",
          created_at: "2026-06-09T19:45:44.000Z",
          shipped_at: "2026-06-11T19:45:44.000Z",
          tracking_no: "SF7793049546",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260609-036",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 4,
          amount: 316,
          status: "completed",
          created_at: "2026-06-09T19:57:23.000Z",
          shipped_at: "2026-06-12T19:57:23.000Z",
          tracking_no: "SF9140755222",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260610-329",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 5,
          amount: 345,
          status: "shipped",
          created_at: "2026-06-10T10:30:19.000Z",
          shipped_at: "2026-06-11T10:30:19.000Z",
          tracking_no: "SF2279011538",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260610-297",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 5,
          amount: 945,
          status: "completed",
          created_at: "2026-06-10T11:11:46.000Z",
          shipped_at: "2026-06-11T11:11:46.000Z",
          tracking_no: "SF3066210572",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260610-268",
          buyer: "\u6728\u6728",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 4,
          amount: 276,
          status: "shipped",
          created_at: "2026-06-10T12:26:23.000Z",
          shipped_at: "2026-06-12T12:26:23.000Z",
          tracking_no: "SF3210038057",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260610-087",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 2,
          amount: 98,
          status: "pending",
          created_at: "2026-06-10T13:30:02.000Z"
        },
        {
          order_id: "ORD-20260610-043",
          buyer: "\u8389\u8389",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 4,
          amount: 796,
          status: "shipped",
          created_at: "2026-06-10T15:01:51.000Z",
          shipped_at: "2026-06-13T15:01:51.000Z",
          tracking_no: "SF4369118737",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260611-339",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 4,
          amount: 516,
          status: "completed",
          created_at: "2026-06-11T11:32:59.000Z",
          shipped_at: "2026-06-13T11:32:59.000Z",
          tracking_no: "SF4845858301",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260611-018",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 3,
          amount: 177,
          status: "completed",
          created_at: "2026-06-11T14:02:04.000Z",
          shipped_at: "2026-06-12T14:02:04.000Z",
          tracking_no: "SF1887626891",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260611-391",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 4,
          amount: 1196,
          status: "completed",
          created_at: "2026-06-11T16:26:15.000Z",
          shipped_at: "2026-06-12T16:26:15.000Z",
          tracking_no: "SF6866876114",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260611-447",
          buyer: "\u6728\u6728",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 4,
          amount: 396,
          status: "completed",
          created_at: "2026-06-11T20:57:28.000Z",
          shipped_at: "2026-06-12T20:57:28.000Z",
          tracking_no: "SF8291883424",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260611-063",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 1,
          amount: 89,
          status: "paid",
          created_at: "2026-06-11T21:49:44.000Z"
        },
        {
          order_id: "ORD-20260612-373",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 4,
          amount: 356,
          status: "completed",
          created_at: "2026-06-12T11:11:02.000Z",
          shipped_at: "2026-06-13T11:11:02.000Z",
          tracking_no: "SF5367299318",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260612-412",
          buyer: "\u96EA\u8389",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 4,
          amount: 356,
          status: "completed",
          created_at: "2026-06-12T18:59:19.000Z",
          shipped_at: "2026-06-13T18:59:19.000Z",
          tracking_no: "SF4471011473",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260612-302",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 1,
          amount: 199,
          status: "completed",
          created_at: "2026-06-12T19:12:31.000Z",
          shipped_at: "2026-06-15T19:12:31.000Z",
          tracking_no: "SF2293977462",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260612-180",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 1,
          amount: 49,
          status: "refunded",
          created_at: "2026-06-12T20:26:47.000Z",
          refund_reason: "\u7269\u6D41\u592A\u6162\u7533\u8BF7\u9000\u6B3E"
        },
        {
          order_id: "ORD-20260613-132",
          buyer: "\u9752\u9752",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 2,
          amount: 118,
          status: "refunded",
          created_at: "2026-06-13T15:31:13.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260613-408",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 1,
          amount: 119,
          status: "completed",
          created_at: "2026-06-13T16:40:20.000Z",
          shipped_at: "2026-06-15T16:40:20.000Z",
          tracking_no: "SF8950220634",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260613-473",
          buyer: "\u5927\u718A",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 3,
          amount: 897,
          status: "completed",
          created_at: "2026-06-13T20:01:21.000Z",
          shipped_at: "2026-06-14T20:01:21.000Z",
          tracking_no: "SF8256301694",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260613-094",
          buyer: "\u8001\u738B",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 4,
          amount: 1036,
          status: "pending",
          created_at: "2026-06-13T20:53:33.000Z"
        },
        {
          order_id: "ORD-20260613-464",
          buyer: "\u963F\u51EF",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 1,
          amount: 89,
          status: "completed",
          created_at: "2026-06-13T21:10:22.000Z",
          shipped_at: "2026-06-16T21:10:22.000Z",
          tracking_no: "SF9434871217",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260613-358",
          buyer: "\u829D\u829D",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 3,
          amount: 387,
          status: "completed",
          created_at: "2026-06-13T21:53:34.000Z",
          shipped_at: "2026-06-14T21:53:34.000Z",
          tracking_no: "SF5727374793",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260614-172",
          buyer: "\u963F\u54F2",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 2,
          amount: 158,
          status: "completed",
          created_at: "2026-06-14T10:29:15.000Z",
          shipped_at: "2026-06-17T10:29:15.000Z",
          tracking_no: "SF1348696997",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260614-108",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 1,
          amount: 99,
          status: "refunded",
          created_at: "2026-06-14T10:38:16.000Z",
          refund_reason: "\u62CD\u9519\u5546\u54C1"
        },
        {
          order_id: "ORD-20260614-374",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 4,
          amount: 196,
          status: "completed",
          created_at: "2026-06-14T11:34:22.000Z",
          shipped_at: "2026-06-17T11:34:22.000Z",
          tracking_no: "SF5047668768",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260614-381",
          buyer: "\u6843\u5B50",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 4,
          amount: 236,
          status: "refunded",
          created_at: "2026-06-14T16:53:00.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260614-110",
          buyer: "\u96EA\u8389",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 5,
          amount: 445,
          status: "cancelled",
          created_at: "2026-06-14T17:15:47.000Z"
        },
        {
          order_id: "ORD-20260614-025",
          buyer: "\u829D\u829D",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 5,
          amount: 995,
          status: "refunded",
          created_at: "2026-06-14T17:39:46.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260614-038",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 3,
          amount: 177,
          status: "completed",
          created_at: "2026-06-14T19:38:20.000Z",
          shipped_at: "2026-06-15T19:38:20.000Z",
          tracking_no: "SF9219037816",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260614-364",
          buyer: "\u665A\u98CE",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 5,
          amount: 295,
          status: "paid",
          created_at: "2026-06-14T20:34:30.000Z"
        },
        {
          order_id: "ORD-20260615-246",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 4,
          amount: 516,
          status: "paid",
          created_at: "2026-06-15T09:40:53.000Z"
        },
        {
          order_id: "ORD-20260615-050",
          buyer: "\u829D\u829D",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 3,
          amount: 267,
          status: "completed",
          created_at: "2026-06-15T11:13:21.000Z",
          shipped_at: "2026-06-17T11:13:21.000Z",
          tracking_no: "SF4860887313",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260615-115",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 3,
          amount: 357,
          status: "paid",
          created_at: "2026-06-15T13:43:23.000Z"
        },
        {
          order_id: "ORD-20260615-136",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 2,
          amount: 318,
          status: "shipped",
          created_at: "2026-06-15T14:02:19.000Z",
          shipped_at: "2026-06-16T14:02:19.000Z",
          tracking_no: "SF6296013514",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260615-210",
          buyer: "\u963F\u6770",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 2,
          amount: 98,
          status: "shipped",
          created_at: "2026-06-15T17:36:06.000Z",
          shipped_at: "2026-06-18T17:36:06.000Z",
          tracking_no: "SF3556280875",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260615-009",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 1,
          amount: 79,
          status: "paid",
          created_at: "2026-06-15T17:45:39.000Z"
        },
        {
          order_id: "ORD-20260616-151",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 3,
          amount: 177,
          status: "shipped",
          created_at: "2026-06-16T20:29:42.000Z",
          shipped_at: "2026-06-17T20:29:42.000Z",
          tracking_no: "SF6595844714",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260616-188",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 5,
          amount: 345,
          status: "completed",
          created_at: "2026-06-16T20:48:42.000Z",
          shipped_at: "2026-06-18T20:48:42.000Z",
          tracking_no: "SF4088462674",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260617-059",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 4,
          amount: 276,
          status: "shipped",
          created_at: "2026-06-17T11:39:07.000Z",
          shipped_at: "2026-06-18T11:39:07.000Z",
          tracking_no: "SF5218357073",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260617-378",
          buyer: "\u96EA\u8389",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 3,
          amount: 297,
          status: "completed",
          created_at: "2026-06-17T15:48:48.000Z",
          shipped_at: "2026-06-20T15:48:48.000Z",
          tracking_no: "SF2799115335",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260617-281",
          buyer: "\u5976\u76D6",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 4,
          amount: 316,
          status: "refunded",
          created_at: "2026-06-17T17:21:05.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260617-252",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 3,
          amount: 387,
          status: "completed",
          created_at: "2026-06-17T18:33:11.000Z",
          shipped_at: "2026-06-18T18:33:11.000Z",
          tracking_no: "SF3401312928",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260617-418",
          buyer: "\u829D\u829D",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 2,
          amount: 158,
          status: "refunded",
          created_at: "2026-06-17T19:21:21.000Z",
          refund_reason: "\u5546\u54C1\u8D28\u91CF\u95EE\u9898"
        },
        {
          order_id: "ORD-20260618-002",
          buyer: "\u963F\u5357",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 3,
          amount: 177,
          status: "completed",
          created_at: "2026-06-18T08:07:30.000Z",
          shipped_at: "2026-06-19T08:07:30.000Z",
          tracking_no: "SF2428751340",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260618-112",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 4,
          amount: 236,
          status: "refunded",
          created_at: "2026-06-18T12:23:36.000Z",
          refund_reason: "\u62CD\u9519\u5546\u54C1"
        },
        {
          order_id: "ORD-20260618-069",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 5,
          amount: 245,
          status: "shipped",
          created_at: "2026-06-18T12:46:56.000Z",
          shipped_at: "2026-06-19T12:46:56.000Z",
          tracking_no: "SF9234974980",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260619-222",
          buyer: "\u963F\u6770",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 4,
          amount: 196,
          status: "completed",
          created_at: "2026-06-19T11:15:28.000Z",
          shipped_at: "2026-06-22T11:15:28.000Z",
          tracking_no: "SF1122953542",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260619-368",
          buyer: "\u8389\u8389",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 1,
          amount: 89,
          status: "refunded",
          created_at: "2026-06-19T12:57:22.000Z",
          refund_reason: "\u7269\u6D41\u592A\u6162\u7533\u8BF7\u9000\u6B3E"
        },
        {
          order_id: "ORD-20260620-218",
          buyer: "\u963F\u54F2",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 4,
          amount: 1596,
          status: "paid",
          created_at: "2026-06-20T10:08:38.000Z"
        },
        {
          order_id: "ORD-20260620-260",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 1,
          amount: 129,
          status: "refunded",
          created_at: "2026-06-20T11:36:46.000Z",
          refund_reason: "\u62CD\u9519\u5546\u54C1"
        },
        {
          order_id: "ORD-20260620-238",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 5,
          amount: 795,
          status: "cancelled",
          created_at: "2026-06-20T12:37:47.000Z"
        },
        {
          order_id: "ORD-20260620-312",
          buyer: "\u963F\u6770",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 2,
          amount: 398,
          status: "paid",
          created_at: "2026-06-20T16:19:51.000Z"
        },
        {
          order_id: "ORD-20260620-366",
          buyer: "Suki",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 4,
          amount: 356,
          status: "refunded",
          created_at: "2026-06-20T16:43:59.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260620-263",
          buyer: "\u963F\u8363",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 3,
          amount: 207,
          status: "shipped",
          created_at: "2026-06-20T16:49:09.000Z",
          shipped_at: "2026-06-23T16:49:09.000Z",
          tracking_no: "SF7051872925",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260620-287",
          buyer: "\u665A\u98CE",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 1,
          amount: 129,
          status: "completed",
          created_at: "2026-06-20T17:47:42.000Z",
          shipped_at: "2026-06-21T17:47:42.000Z",
          tracking_no: "SF8494207714",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260620-480",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 4,
          amount: 236,
          status: "completed",
          created_at: "2026-06-20T20:36:52.000Z",
          shipped_at: "2026-06-23T20:36:52.000Z",
          tracking_no: "SF4898983862",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260620-241",
          buyer: "\u5927\u718A",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 3,
          amount: 297,
          status: "refunded",
          created_at: "2026-06-20T21:56:01.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260621-068",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 3,
          amount: 477,
          status: "shipped",
          created_at: "2026-06-21T10:22:10.000Z",
          shipped_at: "2026-06-23T10:22:10.000Z",
          tracking_no: "SF4398522641",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260621-336",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 3,
          amount: 597,
          status: "pending",
          created_at: "2026-06-21T10:26:03.000Z"
        },
        {
          order_id: "ORD-20260621-293",
          buyer: "\u963F\u6770",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 5,
          amount: 395,
          status: "pending",
          created_at: "2026-06-21T15:43:58.000Z"
        },
        {
          order_id: "ORD-20260621-021",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 2,
          amount: 378,
          status: "completed",
          created_at: "2026-06-21T16:23:23.000Z",
          shipped_at: "2026-06-22T16:23:23.000Z",
          tracking_no: "SF1512724692",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260621-024",
          buyer: "\u963F\u54F2",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 3,
          amount: 897,
          status: "completed",
          created_at: "2026-06-21T18:16:38.000Z",
          shipped_at: "2026-06-23T18:16:38.000Z",
          tracking_no: "SF2944602552",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260621-060",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 1,
          amount: 49,
          status: "shipped",
          created_at: "2026-06-21T20:57:07.000Z",
          shipped_at: "2026-06-24T20:57:07.000Z",
          tracking_no: "SF4060033320",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260622-138",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 3,
          amount: 1197,
          status: "paid",
          created_at: "2026-06-22T08:35:32.000Z"
        },
        {
          order_id: "ORD-20260622-198",
          buyer: "\u6843\u5B50",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 5,
          amount: 395,
          status: "completed",
          created_at: "2026-06-22T13:24:39.000Z",
          shipped_at: "2026-06-25T13:24:39.000Z",
          tracking_no: "SF2049226222",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260622-206",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 5,
          amount: 445,
          status: "completed",
          created_at: "2026-06-22T16:25:21.000Z",
          shipped_at: "2026-06-24T16:25:21.000Z",
          tracking_no: "SF3098130245",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260622-389",
          buyer: "\u96EA\u8389",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 3,
          amount: 477,
          status: "completed",
          created_at: "2026-06-22T17:58:54.000Z",
          shipped_at: "2026-06-25T17:58:54.000Z",
          tracking_no: "SF2782671192",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260622-123",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 4,
          amount: 796,
          status: "paid",
          created_at: "2026-06-22T18:44:13.000Z"
        },
        {
          order_id: "ORD-20260622-440",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 4,
          amount: 196,
          status: "pending",
          created_at: "2026-06-22T19:32:05.000Z"
        },
        {
          order_id: "ORD-20260622-303",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 1,
          amount: 49,
          status: "completed",
          created_at: "2026-06-22T19:45:13.000Z",
          shipped_at: "2026-06-23T19:45:13.000Z",
          tracking_no: "SF3699317726",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260622-217",
          buyer: "\u829D\u829D",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 4,
          amount: 516,
          status: "pending",
          created_at: "2026-06-22T21:02:40.000Z"
        },
        {
          order_id: "ORD-20260623-459",
          buyer: "\u665A\u98CE",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 4,
          amount: 1196,
          status: "completed",
          created_at: "2026-06-23T12:45:49.000Z",
          shipped_at: "2026-06-26T12:45:49.000Z",
          tracking_no: "SF4357138176",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260623-258",
          buyer: "\u6843\u5B50",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 3,
          amount: 267,
          status: "completed",
          created_at: "2026-06-23T15:33:46.000Z",
          shipped_at: "2026-06-26T15:33:46.000Z",
          tracking_no: "SF1836040593",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260623-404",
          buyer: "\u963F\u54F2",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 3,
          amount: 267,
          status: "completed",
          created_at: "2026-06-23T17:29:00.000Z",
          shipped_at: "2026-06-25T17:29:00.000Z",
          tracking_no: "SF8022936956",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260624-121",
          buyer: "\u963F\u51EF",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 2,
          amount: 98,
          status: "paid",
          created_at: "2026-06-24T09:56:59.000Z"
        },
        {
          order_id: "ORD-20260624-259",
          buyer: "\u5927\u718A",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 4,
          amount: 236,
          status: "shipped",
          created_at: "2026-06-24T13:48:00.000Z",
          shipped_at: "2026-06-25T13:48:00.000Z",
          tracking_no: "SF6480113531",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260624-118",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 5,
          amount: 995,
          status: "completed",
          created_at: "2026-06-24T15:28:48.000Z",
          shipped_at: "2026-06-26T15:28:48.000Z",
          tracking_no: "SF8565555970",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260624-160",
          buyer: "\u96EA\u8389",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 4,
          amount: 396,
          status: "refunded",
          created_at: "2026-06-24T15:36:01.000Z",
          refund_reason: "\u7269\u6D41\u592A\u6162\u7533\u8BF7\u9000\u6B3E"
        },
        {
          order_id: "ORD-20260624-062",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 3,
          amount: 567,
          status: "pending",
          created_at: "2026-06-24T17:20:10.000Z"
        },
        {
          order_id: "ORD-20260625-446",
          buyer: "\u8001\u738B",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 4,
          amount: 236,
          status: "completed",
          created_at: "2026-06-25T20:36:01.000Z",
          shipped_at: "2026-06-27T20:36:01.000Z",
          tracking_no: "SF5022535828",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260625-026",
          buyer: "\u963F\u6770",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 1,
          amount: 89,
          status: "completed",
          created_at: "2026-06-25T20:57:53.000Z",
          shipped_at: "2026-06-28T20:57:53.000Z",
          tracking_no: "SF7361212952",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260626-286",
          buyer: "\u96EA\u8389",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 3,
          amount: 237,
          status: "cancelled",
          created_at: "2026-06-26T08:50:47.000Z"
        },
        {
          order_id: "ORD-20260626-320",
          buyer: "\u665A\u98CE",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 2,
          amount: 598,
          status: "paid",
          created_at: "2026-06-26T12:49:08.000Z"
        },
        {
          order_id: "ORD-20260626-283",
          buyer: "\u96EA\u8389",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 2,
          amount: 178,
          status: "completed",
          created_at: "2026-06-26T15:25:41.000Z",
          shipped_at: "2026-06-29T15:25:41.000Z",
          tracking_no: "SF8465596808",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260626-061",
          buyer: "\u6843\u5B50",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 3,
          amount: 477,
          status: "completed",
          created_at: "2026-06-26T21:46:43.000Z",
          shipped_at: "2026-06-27T21:46:43.000Z",
          tracking_no: "SF3388911801",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260627-055",
          buyer: "\u963F\u5357",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 2,
          amount: 798,
          status: "completed",
          created_at: "2026-06-27T08:03:00.000Z",
          shipped_at: "2026-06-30T08:03:00.000Z",
          tracking_no: "SF4300596334",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260627-470",
          buyer: "\u6728\u6728",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 2,
          amount: 178,
          status: "paid",
          created_at: "2026-06-27T11:27:21.000Z"
        },
        {
          order_id: "ORD-20260627-383",
          buyer: "Suki",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 2,
          amount: 178,
          status: "completed",
          created_at: "2026-06-27T13:50:54.000Z",
          shipped_at: "2026-06-29T13:50:54.000Z",
          tracking_no: "SF5679871042",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260627-182",
          buyer: "\u5927\u718A",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 2,
          amount: 258,
          status: "completed",
          created_at: "2026-06-27T14:04:57.000Z",
          shipped_at: "2026-06-28T14:04:57.000Z",
          tracking_no: "SF3050183441",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260627-099",
          buyer: "\u963F\u5357",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 2,
          amount: 98,
          status: "shipped",
          created_at: "2026-06-27T14:34:27.000Z",
          shipped_at: "2026-06-29T14:34:27.000Z",
          tracking_no: "SF3086460846",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260627-370",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 5,
          amount: 295,
          status: "cancelled",
          created_at: "2026-06-27T15:43:16.000Z"
        },
        {
          order_id: "ORD-20260627-310",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 1,
          amount: 159,
          status: "refunded",
          created_at: "2026-06-27T18:46:21.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260627-382",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 1,
          amount: 59,
          status: "completed",
          created_at: "2026-06-27T19:29:33.000Z",
          shipped_at: "2026-06-30T19:29:33.000Z",
          tracking_no: "SF8047652347",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260629-465",
          buyer: "\u963F\u51EF",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 4,
          amount: 356,
          status: "completed",
          created_at: "2026-06-29T08:42:21.000Z",
          shipped_at: "2026-07-01T08:42:21.000Z",
          tracking_no: "SF1281297944",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260629-360",
          buyer: "\u963F\u51EF",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 2,
          amount: 398,
          status: "completed",
          created_at: "2026-06-29T13:37:44.000Z",
          shipped_at: "2026-06-30T13:37:44.000Z",
          tracking_no: "SF1065332714",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260629-431",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 5,
          amount: 445,
          status: "completed",
          created_at: "2026-06-29T14:34:18.000Z",
          shipped_at: "2026-07-01T14:34:18.000Z",
          tracking_no: "SF1684153618",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260629-318",
          buyer: "\u96EA\u8389",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 4,
          amount: 356,
          status: "completed",
          created_at: "2026-06-29T14:58:01.000Z",
          shipped_at: "2026-06-30T14:58:01.000Z",
          tracking_no: "SF7081869843",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260629-386",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 3,
          amount: 597,
          status: "shipped",
          created_at: "2026-06-29T17:20:07.000Z",
          shipped_at: "2026-06-30T17:20:07.000Z",
          tracking_no: "SF7580600221",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260629-311",
          buyer: "\u6728\u6728",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 3,
          amount: 387,
          status: "completed",
          created_at: "2026-06-29T21:08:45.000Z",
          shipped_at: "2026-06-30T21:08:45.000Z",
          tracking_no: "SF1659109331",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260630-125",
          buyer: "\u6843\u5B50",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 3,
          amount: 207,
          status: "pending",
          created_at: "2026-06-30T10:34:12.000Z"
        },
        {
          order_id: "ORD-20260630-114",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 2,
          amount: 198,
          status: "completed",
          created_at: "2026-06-30T12:00:22.000Z",
          shipped_at: "2026-07-02T12:00:22.000Z",
          tracking_no: "SF3898657767",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260630-319",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 2,
          amount: 318,
          status: "shipped",
          created_at: "2026-06-30T13:34:47.000Z",
          shipped_at: "2026-07-03T13:34:47.000Z",
          tracking_no: "SF7270330784",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260630-119",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 2,
          amount: 318,
          status: "paid",
          created_at: "2026-06-30T13:46:32.000Z"
        },
        {
          order_id: "ORD-20260630-047",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 5,
          amount: 995,
          status: "completed",
          created_at: "2026-06-30T20:45:10.000Z",
          shipped_at: "2026-07-03T20:45:10.000Z",
          tracking_no: "SF2866440852",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260701-048",
          buyer: "\u5927\u718A",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 3,
          amount: 207,
          status: "shipped",
          created_at: "2026-07-01T08:56:05.000Z",
          shipped_at: "2026-07-02T08:56:05.000Z",
          tracking_no: "SF2788452146",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260701-091",
          buyer: "\u6728\u6728",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 3,
          amount: 777,
          status: "shipped",
          created_at: "2026-07-01T09:16:11.000Z",
          shipped_at: "2026-07-04T09:16:11.000Z",
          tracking_no: "SF1071854789",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260701-353",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 3,
          amount: 417,
          status: "shipped",
          created_at: "2026-07-01T11:02:34.000Z",
          shipped_at: "2026-07-02T11:02:34.000Z",
          tracking_no: "SF1375948760",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260701-189",
          buyer: "\u8389\u8389",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 2,
          amount: 398,
          status: "paid",
          created_at: "2026-07-01T12:22:03.000Z"
        },
        {
          order_id: "ORD-20260702-162",
          buyer: "Suki",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 3,
          amount: 1197,
          status: "completed",
          created_at: "2026-07-02T13:10:23.000Z",
          shipped_at: "2026-07-05T13:10:23.000Z",
          tracking_no: "SF8883209690",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260702-271",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 2,
          amount: 198,
          status: "pending",
          created_at: "2026-07-02T14:58:54.000Z"
        },
        {
          order_id: "ORD-20260702-277",
          buyer: "\u8389\u8389",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 3,
          amount: 177,
          status: "completed",
          created_at: "2026-07-02T15:49:43.000Z",
          shipped_at: "2026-07-03T15:49:43.000Z",
          tracking_no: "SF8272578700",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260702-012",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 1,
          amount: 79,
          status: "paid",
          created_at: "2026-07-02T16:22:03.000Z"
        },
        {
          order_id: "ORD-20260702-232",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 1,
          amount: 259,
          status: "completed",
          created_at: "2026-07-02T16:33:05.000Z",
          shipped_at: "2026-07-03T16:33:05.000Z",
          tracking_no: "SF8550116645",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260702-237",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 1,
          amount: 49,
          status: "completed",
          created_at: "2026-07-02T18:38:06.000Z",
          shipped_at: "2026-07-04T18:38:06.000Z",
          tracking_no: "SF8122367942",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260702-274",
          buyer: "\u6728\u6728",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 3,
          amount: 387,
          status: "shipped",
          created_at: "2026-07-02T21:22:21.000Z",
          shipped_at: "2026-07-05T21:22:21.000Z",
          tracking_no: "SF7578702294",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260703-331",
          buyer: "\u5976\u76D6",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 4,
          amount: 356,
          status: "paid",
          created_at: "2026-07-03T08:17:21.000Z"
        },
        {
          order_id: "ORD-20260703-327",
          buyer: "\u5976\u76D6",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 3,
          amount: 297,
          status: "refunded",
          created_at: "2026-07-03T08:59:48.000Z",
          refund_reason: "\u62CD\u9519\u5546\u54C1"
        },
        {
          order_id: "ORD-20260703-170",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 2,
          amount: 238,
          status: "paid",
          created_at: "2026-07-03T15:27:13.000Z"
        },
        {
          order_id: "ORD-20260703-152",
          buyer: "\u665A\u98CE",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 4,
          amount: 756,
          status: "completed",
          created_at: "2026-07-03T19:04:26.000Z",
          shipped_at: "2026-07-06T19:04:26.000Z",
          tracking_no: "SF2292044105",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260703-086",
          buyer: "\u963F\u8363",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 5,
          amount: 445,
          status: "paid",
          created_at: "2026-07-03T19:34:57.000Z"
        },
        {
          order_id: "ORD-20260703-039",
          buyer: "\u963F\u6770",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 4,
          amount: 516,
          status: "completed",
          created_at: "2026-07-03T21:53:33.000Z",
          shipped_at: "2026-07-05T21:53:33.000Z",
          tracking_no: "SF2751278376",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260704-278",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 2,
          amount: 258,
          status: "completed",
          created_at: "2026-07-04T11:27:17.000Z",
          shipped_at: "2026-07-05T11:27:17.000Z",
          tracking_no: "SF7632142132",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260704-199",
          buyer: "\u5976\u76D6",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 2,
          amount: 158,
          status: "completed",
          created_at: "2026-07-04T15:43:30.000Z",
          shipped_at: "2026-07-06T15:43:30.000Z",
          tracking_no: "SF6071985112",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260704-214",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 2,
          amount: 118,
          status: "completed",
          created_at: "2026-07-04T19:43:42.000Z",
          shipped_at: "2026-07-07T19:43:42.000Z",
          tracking_no: "SF9833750545",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260704-406",
          buyer: "\u6843\u5B50",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 1,
          amount: 89,
          status: "shipped",
          created_at: "2026-07-04T20:14:46.000Z",
          shipped_at: "2026-07-06T20:14:46.000Z",
          tracking_no: "SF8146661858",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260704-213",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 5,
          amount: 295,
          status: "completed",
          created_at: "2026-07-04T20:43:18.000Z",
          shipped_at: "2026-07-05T20:43:18.000Z",
          tracking_no: "SF9603946326",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260705-407",
          buyer: "\u963F\u54F2",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 5,
          amount: 695,
          status: "pending",
          created_at: "2026-07-05T09:22:13.000Z"
        },
        {
          order_id: "ORD-20260705-077",
          buyer: "\u8389\u8389",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 2,
          amount: 178,
          status: "cancelled",
          created_at: "2026-07-05T10:31:52.000Z"
        },
        {
          order_id: "ORD-20260705-057",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 5,
          amount: 1495,
          status: "shipped",
          created_at: "2026-07-05T16:17:30.000Z",
          shipped_at: "2026-07-06T16:17:30.000Z",
          tracking_no: "SF5502877551",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260705-215",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 5,
          amount: 795,
          status: "paid",
          created_at: "2026-07-05T16:33:16.000Z"
        },
        {
          order_id: "ORD-20260705-288",
          buyer: "\u963F\u8363",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 1,
          amount: 399,
          status: "cancelled",
          created_at: "2026-07-05T17:44:34.000Z"
        },
        {
          order_id: "ORD-20260705-247",
          buyer: "\u963F\u8363",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 4,
          amount: 516,
          status: "completed",
          created_at: "2026-07-05T18:25:46.000Z",
          shipped_at: "2026-07-07T18:25:46.000Z",
          tracking_no: "SF7062518401",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260705-095",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 3,
          amount: 267,
          status: "cancelled",
          created_at: "2026-07-05T20:58:04.000Z"
        },
        {
          order_id: "ORD-20260705-292",
          buyer: "Suki",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 3,
          amount: 597,
          status: "completed",
          created_at: "2026-07-05T21:04:47.000Z",
          shipped_at: "2026-07-06T21:04:47.000Z",
          tracking_no: "SF8833222027",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260706-173",
          buyer: "\u963F\u6770",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 5,
          amount: 645,
          status: "refunded",
          created_at: "2026-07-06T11:47:41.000Z",
          refund_reason: "\u5546\u54C1\u8D28\u91CF\u95EE\u9898"
        },
        {
          order_id: "ORD-20260706-299",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 2,
          amount: 598,
          status: "completed",
          created_at: "2026-07-06T15:42:38.000Z",
          shipped_at: "2026-07-09T15:42:38.000Z",
          tracking_no: "SF7540970013",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260706-296",
          buyer: "\u6843\u5B50",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 1,
          amount: 49,
          status: "paid",
          created_at: "2026-07-06T16:09:35.000Z"
        },
        {
          order_id: "ORD-20260706-107",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 1,
          amount: 89,
          status: "pending",
          created_at: "2026-07-06T17:40:42.000Z"
        },
        {
          order_id: "ORD-20260706-184",
          buyer: "\u8001\u738B",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 5,
          amount: 1295,
          status: "cancelled",
          created_at: "2026-07-06T18:46:32.000Z"
        },
        {
          order_id: "ORD-20260706-168",
          buyer: "\u5976\u76D6",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 5,
          amount: 395,
          status: "completed",
          created_at: "2026-07-06T19:58:23.000Z",
          shipped_at: "2026-07-08T19:58:23.000Z",
          tracking_no: "SF2852231022",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260707-341",
          buyer: "\u6843\u5B50",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 2,
          amount: 98,
          status: "completed",
          created_at: "2026-07-07T14:28:38.000Z",
          shipped_at: "2026-07-08T14:28:38.000Z",
          tracking_no: "SF9268257126",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260707-234",
          buyer: "Suki",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 1,
          amount: 159,
          status: "paid",
          created_at: "2026-07-07T16:16:21.000Z"
        },
        {
          order_id: "ORD-20260707-233",
          buyer: "\u5976\u76D6",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 2,
          amount: 118,
          status: "shipped",
          created_at: "2026-07-07T16:34:58.000Z",
          shipped_at: "2026-07-09T16:34:58.000Z",
          tracking_no: "SF8246704331",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260707-474",
          buyer: "\u8001\u738B",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 5,
          amount: 395,
          status: "shipped",
          created_at: "2026-07-07T17:45:22.000Z",
          shipped_at: "2026-07-08T17:45:22.000Z",
          tracking_no: "SF6072000168",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260707-253",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 5,
          amount: 595,
          status: "refunded",
          created_at: "2026-07-07T19:05:22.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260708-066",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 2,
          amount: 158,
          status: "completed",
          created_at: "2026-07-08T10:26:07.000Z",
          shipped_at: "2026-07-09T10:26:07.000Z",
          tracking_no: "SF4038053929",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260708-428",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 3,
          amount: 477,
          status: "completed",
          created_at: "2026-07-08T11:33:34.000Z",
          shipped_at: "2026-07-10T11:33:34.000Z",
          tracking_no: "SF5682213155",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260708-273",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 3,
          amount: 147,
          status: "completed",
          created_at: "2026-07-08T17:01:50.000Z",
          shipped_at: "2026-07-11T17:01:50.000Z",
          tracking_no: "SF9800436736",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260709-082",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 4,
          amount: 476,
          status: "completed",
          created_at: "2026-07-09T08:15:26.000Z",
          shipped_at: "2026-07-12T08:15:26.000Z",
          tracking_no: "SF9680975599",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260709-067",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 5,
          amount: 795,
          status: "completed",
          created_at: "2026-07-09T10:04:49.000Z",
          shipped_at: "2026-07-11T10:04:49.000Z",
          tracking_no: "SF8275341698",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260709-248",
          buyer: "Suki",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 2,
          amount: 598,
          status: "pending",
          created_at: "2026-07-09T12:15:58.000Z"
        },
        {
          order_id: "ORD-20260709-332",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 4,
          amount: 756,
          status: "cancelled",
          created_at: "2026-07-09T20:21:29.000Z"
        },
        {
          order_id: "ORD-20260709-356",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 5,
          amount: 695,
          status: "completed",
          created_at: "2026-07-09T20:51:29.000Z",
          shipped_at: "2026-07-11T20:51:29.000Z",
          tracking_no: "SF4429367419",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260710-028",
          buyer: "\u829D\u829D",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 4,
          amount: 316,
          status: "paid",
          created_at: "2026-07-10T12:28:27.000Z"
        },
        {
          order_id: "ORD-20260710-433",
          buyer: "\u963F\u8363",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 3,
          amount: 597,
          status: "completed",
          created_at: "2026-07-10T13:50:13.000Z",
          shipped_at: "2026-07-13T13:50:13.000Z",
          tracking_no: "SF8370266678",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260710-275",
          buyer: "\u665A\u98CE",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 1,
          amount: 89,
          status: "refunded",
          created_at: "2026-07-10T14:05:43.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260710-265",
          buyer: "\u829D\u829D",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 2,
          amount: 598,
          status: "paid",
          created_at: "2026-07-10T14:14:40.000Z"
        },
        {
          order_id: "ORD-20260710-093",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 4,
          amount: 356,
          status: "shipped",
          created_at: "2026-07-10T16:41:58.000Z",
          shipped_at: "2026-07-12T16:41:58.000Z",
          tracking_no: "SF7895074466",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260710-291",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 5,
          amount: 645,
          status: "paid",
          created_at: "2026-07-10T21:19:13.000Z"
        },
        {
          order_id: "ORD-20260711-208",
          buyer: "\u5927\u718A",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 3,
          amount: 597,
          status: "completed",
          created_at: "2026-07-11T12:03:52.000Z",
          shipped_at: "2026-07-12T12:03:52.000Z",
          tracking_no: "SF9895480370",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260711-034",
          buyer: "\u8389\u8389",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 1,
          amount: 299,
          status: "completed",
          created_at: "2026-07-11T14:50:02.000Z",
          shipped_at: "2026-07-14T14:50:02.000Z",
          tracking_no: "SF3419935681",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260711-325",
          buyer: "\u963F\u6770",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 3,
          amount: 387,
          status: "completed",
          created_at: "2026-07-11T20:13:09.000Z",
          shipped_at: "2026-07-14T20:13:09.000Z",
          tracking_no: "SF5943044307",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260712-361",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 3,
          amount: 1197,
          status: "completed",
          created_at: "2026-07-12T08:19:48.000Z",
          shipped_at: "2026-07-14T08:19:48.000Z",
          tracking_no: "SF4489108520",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260712-092",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 3,
          amount: 177,
          status: "completed",
          created_at: "2026-07-12T09:29:28.000Z",
          shipped_at: "2026-07-14T09:29:28.000Z",
          tracking_no: "SF2024537377",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260712-350",
          buyer: "\u8001\u738B",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 4,
          amount: 796,
          status: "shipped",
          created_at: "2026-07-12T10:16:26.000Z",
          shipped_at: "2026-07-15T10:16:26.000Z",
          tracking_no: "SF6286937925",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260712-240",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 2,
          amount: 258,
          status: "refunded",
          created_at: "2026-07-12T10:53:49.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260712-313",
          buyer: "\u665A\u98CE",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 5,
          amount: 645,
          status: "cancelled",
          created_at: "2026-07-12T13:35:07.000Z"
        },
        {
          order_id: "ORD-20260712-051",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 3,
          amount: 897,
          status: "completed",
          created_at: "2026-07-12T13:51:16.000Z",
          shipped_at: "2026-07-13T13:51:16.000Z",
          tracking_no: "SF7088297908",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260712-127",
          buyer: "\u96EA\u8389",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 4,
          amount: 516,
          status: "completed",
          created_at: "2026-07-12T14:22:47.000Z",
          shipped_at: "2026-07-13T14:22:47.000Z",
          tracking_no: "SF4560654423",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260712-186",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 3,
          amount: 267,
          status: "refunded",
          created_at: "2026-07-12T18:25:45.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260712-030",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 4,
          amount: 236,
          status: "pending",
          created_at: "2026-07-12T21:49:47.000Z"
        },
        {
          order_id: "ORD-20260713-109",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 2,
          amount: 238,
          status: "shipped",
          created_at: "2026-07-13T08:48:54.000Z",
          shipped_at: "2026-07-15T08:48:54.000Z",
          tracking_no: "SF7092516065",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260713-257",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 2,
          amount: 398,
          status: "completed",
          created_at: "2026-07-13T15:07:42.000Z",
          shipped_at: "2026-07-15T15:07:42.000Z",
          tracking_no: "SF9030950205",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260713-298",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 1,
          amount: 59,
          status: "completed",
          created_at: "2026-07-13T16:41:02.000Z",
          shipped_at: "2026-07-14T16:41:02.000Z",
          tracking_no: "SF1833322981",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260714-045",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 1,
          amount: 69,
          status: "completed",
          created_at: "2026-07-14T08:03:10.000Z",
          shipped_at: "2026-07-15T08:03:10.000Z",
          tracking_no: "SF2537181075",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260714-305",
          buyer: "\u963F\u5357",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 5,
          amount: 495,
          status: "completed",
          created_at: "2026-07-14T09:24:55.000Z",
          shipped_at: "2026-07-17T09:24:55.000Z",
          tracking_no: "SF4283529923",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260714-116",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 3,
          amount: 177,
          status: "completed",
          created_at: "2026-07-14T09:32:27.000Z",
          shipped_at: "2026-07-17T09:32:27.000Z",
          tracking_no: "SF7874327003",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260714-399",
          buyer: "\u9752\u9752",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 4,
          amount: 1596,
          status: "refunded",
          created_at: "2026-07-14T10:17:46.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260714-351",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 2,
          amount: 258,
          status: "completed",
          created_at: "2026-07-14T10:50:22.000Z",
          shipped_at: "2026-07-16T10:50:22.000Z",
          tracking_no: "SF2685247937",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260714-052",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 2,
          amount: 598,
          status: "completed",
          created_at: "2026-07-14T15:00:31.000Z",
          shipped_at: "2026-07-15T15:00:31.000Z",
          tracking_no: "SF8079081883",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260714-190",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 3,
          amount: 387,
          status: "shipped",
          created_at: "2026-07-14T16:41:53.000Z",
          shipped_at: "2026-07-15T16:41:53.000Z",
          tracking_no: "SF7020519417",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260714-403",
          buyer: "\u96EA\u8389",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 2,
          amount: 158,
          status: "paid",
          created_at: "2026-07-14T16:55:58.000Z"
        },
        {
          order_id: "ORD-20260714-142",
          buyer: "\u963F\u8363",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 1,
          amount: 129,
          status: "completed",
          created_at: "2026-07-14T18:40:36.000Z",
          shipped_at: "2026-07-16T18:40:36.000Z",
          tracking_no: "SF7419543446",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260714-295",
          buyer: "\u665A\u98CE",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 3,
          amount: 897,
          status: "completed",
          created_at: "2026-07-14T18:56:22.000Z",
          shipped_at: "2026-07-15T18:56:22.000Z",
          tracking_no: "SF3241920046",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260714-282",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 5,
          amount: 295,
          status: "refunded",
          created_at: "2026-07-14T20:20:01.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260715-417",
          buyer: "\u6843\u5B50",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 4,
          amount: 1596,
          status: "completed",
          created_at: "2026-07-15T10:00:09.000Z",
          shipped_at: "2026-07-18T10:00:09.000Z",
          tracking_no: "SF3564821883",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260715-390",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 2,
          amount: 398,
          status: "completed",
          created_at: "2026-07-15T13:20:16.000Z",
          shipped_at: "2026-07-18T13:20:16.000Z",
          tracking_no: "SF3171496188",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260715-349",
          buyer: "\u963F\u5357",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 1,
          amount: 299,
          status: "completed",
          created_at: "2026-07-15T16:13:30.000Z",
          shipped_at: "2026-07-17T16:13:30.000Z",
          tracking_no: "SF5083487272",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260715-185",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 3,
          amount: 267,
          status: "refunded",
          created_at: "2026-07-15T18:43:44.000Z",
          refund_reason: "\u7269\u6D41\u592A\u6162\u7533\u8BF7\u9000\u6B3E"
        },
        {
          order_id: "ORD-20260715-017",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 2,
          amount: 398,
          status: "completed",
          created_at: "2026-07-15T20:56:07.000Z",
          shipped_at: "2026-07-16T20:56:07.000Z",
          tracking_no: "SF1000664026",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260716-113",
          buyer: "\u5927\u718A",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 2,
          amount: 398,
          status: "paid",
          created_at: "2026-07-16T10:32:13.000Z"
        },
        {
          order_id: "ORD-20260716-236",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 3,
          amount: 357,
          status: "cancelled",
          created_at: "2026-07-16T11:12:02.000Z"
        },
        {
          order_id: "ORD-20260716-235",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 4,
          amount: 516,
          status: "shipped",
          created_at: "2026-07-16T11:55:08.000Z",
          shipped_at: "2026-07-17T11:55:08.000Z",
          tracking_no: "SF3166243943",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260716-343",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 4,
          amount: 236,
          status: "completed",
          created_at: "2026-07-16T14:06:22.000Z",
          shipped_at: "2026-07-17T14:06:22.000Z",
          tracking_no: "SF3974317655",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260716-434",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 2,
          amount: 598,
          status: "paid",
          created_at: "2026-07-16T16:59:07.000Z"
        },
        {
          order_id: "ORD-20260716-150",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 5,
          amount: 1295,
          status: "completed",
          created_at: "2026-07-16T17:35:09.000Z",
          shipped_at: "2026-07-17T17:35:09.000Z",
          tracking_no: "SF1572412289",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260716-229",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 3,
          amount: 387,
          status: "refunded",
          created_at: "2026-07-16T17:57:13.000Z",
          refund_reason: "\u62CD\u9519\u5546\u54C1"
        },
        {
          order_id: "ORD-20260717-097",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 4,
          amount: 236,
          status: "shipped",
          created_at: "2026-07-17T08:19:11.000Z",
          shipped_at: "2026-07-20T08:19:11.000Z",
          tracking_no: "SF8690783127",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260717-475",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 4,
          amount: 316,
          status: "refunded",
          created_at: "2026-07-17T10:34:31.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260717-181",
          buyer: "Suki",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 4,
          amount: 1196,
          status: "completed",
          created_at: "2026-07-17T12:47:31.000Z",
          shipped_at: "2026-07-19T12:47:31.000Z",
          tracking_no: "SF3883265210",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260717-468",
          buyer: "\u5927\u718A",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 5,
          amount: 995,
          status: "completed",
          created_at: "2026-07-17T14:01:01.000Z",
          shipped_at: "2026-07-18T14:01:01.000Z",
          tracking_no: "SF9908858585",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260717-436",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 4,
          amount: 236,
          status: "pending",
          created_at: "2026-07-17T16:24:14.000Z"
        },
        {
          order_id: "ORD-20260718-219",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 2,
          amount: 138,
          status: "shipped",
          created_at: "2026-07-18T09:31:06.000Z",
          shipped_at: "2026-07-20T09:31:06.000Z",
          tracking_no: "SF3452333436",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260718-415",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 5,
          amount: 445,
          status: "refunded",
          created_at: "2026-07-18T11:59:28.000Z",
          refund_reason: "\u5546\u54C1\u8D28\u91CF\u95EE\u9898"
        },
        {
          order_id: "ORD-20260718-250",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 2,
          amount: 98,
          status: "pending",
          created_at: "2026-07-18T12:26:07.000Z"
        },
        {
          order_id: "ORD-20260718-139",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 1,
          amount: 89,
          status: "completed",
          created_at: "2026-07-18T18:39:59.000Z",
          shipped_at: "2026-07-20T18:39:59.000Z",
          tracking_no: "SF8421351748",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260718-369",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 4,
          amount: 1196,
          status: "completed",
          created_at: "2026-07-18T19:18:26.000Z",
          shipped_at: "2026-07-20T19:18:26.000Z",
          tracking_no: "SF3756964369",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260718-211",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 2,
          amount: 258,
          status: "shipped",
          created_at: "2026-07-18T19:53:23.000Z",
          shipped_at: "2026-07-21T19:53:23.000Z",
          tracking_no: "SF8420938361",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260718-156",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 4,
          amount: 356,
          status: "shipped",
          created_at: "2026-07-18T21:40:44.000Z",
          shipped_at: "2026-07-20T21:40:44.000Z",
          tracking_no: "SF3762199756",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260719-449",
          buyer: "\u5927\u718A",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 2,
          amount: 138,
          status: "completed",
          created_at: "2026-07-19T10:30:14.000Z",
          shipped_at: "2026-07-20T10:30:14.000Z",
          tracking_no: "SF3829353339",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260719-056",
          buyer: "\u5976\u76D6",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 4,
          amount: 556,
          status: "shipped",
          created_at: "2026-07-19T10:37:49.000Z",
          shipped_at: "2026-07-21T10:37:49.000Z",
          tracking_no: "SF1806610432",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260719-372",
          buyer: "\u5976\u76D6",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 2,
          amount: 278,
          status: "paid",
          created_at: "2026-07-19T12:23:36.000Z"
        },
        {
          order_id: "ORD-20260719-249",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 1,
          amount: 49,
          status: "refunded",
          created_at: "2026-07-19T16:42:55.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260719-203",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 2,
          amount: 398,
          status: "refunded",
          created_at: "2026-07-19T19:00:59.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260719-243",
          buyer: "\u6728\u6728",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 5,
          amount: 395,
          status: "completed",
          created_at: "2026-07-19T20:53:30.000Z",
          shipped_at: "2026-07-22T20:53:30.000Z",
          tracking_no: "SF7021016843",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260720-126",
          buyer: "\u5976\u76D6",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 3,
          amount: 387,
          status: "completed",
          created_at: "2026-07-20T14:11:11.000Z",
          shipped_at: "2026-07-23T14:11:11.000Z",
          tracking_no: "SF3744218231",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260720-171",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 5,
          amount: 445,
          status: "completed",
          created_at: "2026-07-20T17:38:50.000Z",
          shipped_at: "2026-07-21T17:38:50.000Z",
          tracking_no: "SF4991264095",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260720-262",
          buyer: "\u9752\u9752",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 4,
          amount: 196,
          status: "shipped",
          created_at: "2026-07-20T20:14:36.000Z",
          shipped_at: "2026-07-22T20:14:36.000Z",
          tracking_no: "SF9252714832",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260721-393",
          buyer: "\u963F\u8363",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 2,
          amount: 158,
          status: "refunded",
          created_at: "2026-07-21T09:22:43.000Z",
          refund_reason: "\u5546\u54C1\u8D28\u91CF\u95EE\u9898"
        },
        {
          order_id: "ORD-20260721-443",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 4,
          amount: 516,
          status: "paid",
          created_at: "2026-07-21T12:13:54.000Z"
        },
        {
          order_id: "ORD-20260722-166",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 1,
          amount: 259,
          status: "completed",
          created_at: "2026-07-22T12:49:05.000Z",
          shipped_at: "2026-07-24T12:49:05.000Z",
          tracking_no: "SF1789471992",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260722-143",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 4,
          amount: 1196,
          status: "completed",
          created_at: "2026-07-22T14:00:43.000Z",
          shipped_at: "2026-07-23T14:00:43.000Z",
          tracking_no: "SF4874755105",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260722-071",
          buyer: "\u8389\u8389",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 1,
          amount: 199,
          status: "completed",
          created_at: "2026-07-22T16:56:33.000Z",
          shipped_at: "2026-07-23T16:56:33.000Z",
          tracking_no: "SF5980035412",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260723-161",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 4,
          amount: 796,
          status: "cancelled",
          created_at: "2026-07-23T08:33:01.000Z"
        },
        {
          order_id: "ORD-20260723-317",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 1,
          amount: 119,
          status: "completed",
          created_at: "2026-07-23T10:22:59.000Z",
          shipped_at: "2026-07-25T10:22:59.000Z",
          tracking_no: "SF4705284992",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260723-137",
          buyer: "\u665A\u98CE",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 3,
          amount: 897,
          status: "completed",
          created_at: "2026-07-23T14:27:29.000Z",
          shipped_at: "2026-07-25T14:27:29.000Z",
          tracking_no: "SF7419658513",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260723-078",
          buyer: "\u963F\u6770",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 2,
          amount: 598,
          status: "completed",
          created_at: "2026-07-23T15:27:20.000Z",
          shipped_at: "2026-07-24T15:27:20.000Z",
          tracking_no: "SF3641134585",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260723-183",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 2,
          amount: 378,
          status: "completed",
          created_at: "2026-07-23T15:48:14.000Z",
          shipped_at: "2026-07-26T15:48:14.000Z",
          tracking_no: "SF9862319772",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260723-395",
          buyer: "\u829D\u829D",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 2,
          amount: 258,
          status: "cancelled",
          created_at: "2026-07-23T20:56:58.000Z"
        },
        {
          order_id: "ORD-20260724-306",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 1,
          amount: 199,
          status: "completed",
          created_at: "2026-07-24T09:41:22.000Z",
          shipped_at: "2026-07-25T09:41:22.000Z",
          tracking_no: "SF1967428660",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260724-435",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 5,
          amount: 295,
          status: "refunded",
          created_at: "2026-07-24T10:55:32.000Z",
          refund_reason: "\u7269\u6D41\u592A\u6162\u7533\u8BF7\u9000\u6B3E"
        },
        {
          order_id: "ORD-20260724-450",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 2,
          amount: 258,
          status: "shipped",
          created_at: "2026-07-24T10:56:26.000Z",
          shipped_at: "2026-07-27T10:56:26.000Z",
          tracking_no: "SF7132573839",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260724-031",
          buyer: "\u8001\u738B",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 1,
          amount: 59,
          status: "paid",
          created_at: "2026-07-24T13:23:43.000Z"
        },
        {
          order_id: "ORD-20260724-416",
          buyer: "\u8389\u8389",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 5,
          amount: 395,
          status: "completed",
          created_at: "2026-07-24T13:58:19.000Z",
          shipped_at: "2026-07-27T13:58:19.000Z",
          tracking_no: "SF6374698276",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260724-476",
          buyer: "\u963F\u54F2",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 4,
          amount: 356,
          status: "pending",
          created_at: "2026-07-24T18:21:07.000Z"
        },
        {
          order_id: "ORD-20260724-304",
          buyer: "\u963F\u54F2",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 1,
          amount: 199,
          status: "completed",
          created_at: "2026-07-24T20:49:03.000Z",
          shipped_at: "2026-07-25T20:49:03.000Z",
          tracking_no: "SF9244634493",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260725-453",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 3,
          amount: 477,
          status: "cancelled",
          created_at: "2026-07-25T12:48:24.000Z"
        },
        {
          order_id: "ORD-20260726-414",
          buyer: "\u8001\u738B",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 2,
          amount: 178,
          status: "completed",
          created_at: "2026-07-26T13:44:55.000Z",
          shipped_at: "2026-07-29T13:44:55.000Z",
          tracking_no: "SF6330918077",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260726-451",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 5,
          amount: 795,
          status: "completed",
          created_at: "2026-07-26T18:14:54.000Z",
          shipped_at: "2026-07-28T18:14:54.000Z",
          tracking_no: "SF6181971153",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260727-177",
          buyer: "\u829D\u829D",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 3,
          amount: 567,
          status: "shipped",
          created_at: "2026-07-27T09:04:14.000Z",
          shipped_at: "2026-07-29T09:04:14.000Z",
          tracking_no: "SF4455540678",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260727-352",
          buyer: "\u963F\u51EF",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 4,
          amount: 636,
          status: "cancelled",
          created_at: "2026-07-27T12:13:17.000Z"
        },
        {
          order_id: "ORD-20260727-279",
          buyer: "\u829D\u829D",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 1,
          amount: 159,
          status: "pending",
          created_at: "2026-07-27T15:47:22.000Z"
        },
        {
          order_id: "ORD-20260728-212",
          buyer: "\u96EA\u8389",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 4,
          amount: 756,
          status: "refunded",
          created_at: "2026-07-28T08:19:18.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260728-346",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 1,
          amount: 299,
          status: "pending",
          created_at: "2026-07-28T11:26:54.000Z"
        },
        {
          order_id: "ORD-20260728-411",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 3,
          amount: 147,
          status: "paid",
          created_at: "2026-07-28T11:37:24.000Z"
        },
        {
          order_id: "ORD-20260728-266",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 4,
          amount: 236,
          status: "refunded",
          created_at: "2026-07-28T12:49:19.000Z",
          refund_reason: "\u62CD\u9519\u5546\u54C1"
        },
        {
          order_id: "ORD-20260728-322",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 4,
          amount: 796,
          status: "completed",
          created_at: "2026-07-28T13:33:52.000Z",
          shipped_at: "2026-07-29T13:33:52.000Z",
          tracking_no: "SF2493526522",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260728-423",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 3,
          amount: 477,
          status: "cancelled",
          created_at: "2026-07-28T14:31:24.000Z"
        },
        {
          order_id: "ORD-20260728-167",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 1,
          amount: 89,
          status: "completed",
          created_at: "2026-07-28T14:44:55.000Z",
          shipped_at: "2026-07-29T14:44:55.000Z",
          tracking_no: "SF4239763304",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260728-013",
          buyer: "\u8001\u738B",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 5,
          amount: 495,
          status: "pending",
          created_at: "2026-07-28T14:54:26.000Z"
        },
        {
          order_id: "ORD-20260728-230",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 4,
          amount: 796,
          status: "paid",
          created_at: "2026-07-28T19:07:02.000Z"
        },
        {
          order_id: "ORD-20260729-326",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 5,
          amount: 995,
          status: "refunded",
          created_at: "2026-07-29T08:27:27.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260729-301",
          buyer: "\u963F\u8363",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 5,
          amount: 645,
          status: "completed",
          created_at: "2026-07-29T09:56:28.000Z",
          shipped_at: "2026-08-01T09:56:28.000Z",
          tracking_no: "SF6725190015",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260729-147",
          buyer: "\u829D\u829D",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 2,
          amount: 178,
          status: "pending",
          created_at: "2026-07-29T11:00:08.000Z"
        },
        {
          order_id: "ORD-20260729-106",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 1,
          amount: 79,
          status: "completed",
          created_at: "2026-07-29T12:12:37.000Z",
          shipped_at: "2026-07-30T12:12:37.000Z",
          tracking_no: "SF7092524858",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260729-072",
          buyer: "\u963F\u8363",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 3,
          amount: 597,
          status: "completed",
          created_at: "2026-07-29T14:45:02.000Z",
          shipped_at: "2026-07-30T14:45:02.000Z",
          tracking_no: "SF2917402333",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260729-076",
          buyer: "\u963F\u6770",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 1,
          amount: 259,
          status: "shipped",
          created_at: "2026-07-29T15:38:51.000Z",
          shipped_at: "2026-07-30T15:38:51.000Z",
          tracking_no: "SF3310283091",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260729-144",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 1,
          amount: 139,
          status: "completed",
          created_at: "2026-07-29T16:43:50.000Z",
          shipped_at: "2026-07-30T16:43:50.000Z",
          tracking_no: "SF4165927699",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260730-457",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 1,
          amount: 129,
          status: "paid",
          created_at: "2026-07-30T09:25:45.000Z"
        },
        {
          order_id: "ORD-20260730-178",
          buyer: "\u963F\u8363",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 5,
          amount: 245,
          status: "completed",
          created_at: "2026-07-30T12:25:01.000Z",
          shipped_at: "2026-07-31T12:25:01.000Z",
          tracking_no: "SF3157318867",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260730-201",
          buyer: "\u963F\u5357",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 5,
          amount: 445,
          status: "completed",
          created_at: "2026-07-30T13:03:08.000Z",
          shipped_at: "2026-07-31T13:03:08.000Z",
          tracking_no: "SF2641920616",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260730-308",
          buyer: "\u5976\u76D6",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 5,
          amount: 995,
          status: "completed",
          created_at: "2026-07-30T14:08:16.000Z",
          shipped_at: "2026-08-01T14:08:16.000Z",
          tracking_no: "SF3841707680",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260730-035",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 4,
          amount: 796,
          status: "paid",
          created_at: "2026-07-30T15:59:02.000Z"
        },
        {
          order_id: "ORD-20260730-158",
          buyer: "\u963F\u6770",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 2,
          amount: 98,
          status: "completed",
          created_at: "2026-07-30T16:29:11.000Z",
          shipped_at: "2026-08-02T16:29:11.000Z",
          tracking_no: "SF3868019289",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260731-439",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 2,
          amount: 598,
          status: "completed",
          created_at: "2026-07-31T15:34:18.000Z",
          shipped_at: "2026-08-02T15:34:18.000Z",
          tracking_no: "SF4024467430",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260731-010",
          buyer: "\u5927\u718A",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 4,
          amount: 236,
          status: "completed",
          created_at: "2026-07-31T17:14:48.000Z",
          shipped_at: "2026-08-02T17:14:48.000Z",
          tracking_no: "SF3852042489",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260731-197",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 3,
          amount: 147,
          status: "paid",
          created_at: "2026-07-31T17:40:22.000Z"
        },
        {
          order_id: "ORD-20260801-367",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 2,
          amount: 98,
          status: "refunded",
          created_at: "2026-08-01T09:26:43.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260801-458",
          buyer: "\u5976\u76D6",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 3,
          amount: 357,
          status: "completed",
          created_at: "2026-08-01T14:56:57.000Z",
          shipped_at: "2026-08-04T14:56:57.000Z",
          tracking_no: "SF3434933401",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260801-294",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 5,
          amount: 395,
          status: "completed",
          created_at: "2026-08-01T21:25:51.000Z",
          shipped_at: "2026-08-03T21:25:51.000Z",
          tracking_no: "SF8584861836",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260801-255",
          buyer: "\u9752\u9752",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 2,
          amount: 378,
          status: "completed",
          created_at: "2026-08-01T21:48:09.000Z",
          shipped_at: "2026-08-02T21:48:09.000Z",
          tracking_no: "SF1481688466",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260802-070",
          buyer: "\u963F\u8363",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 1,
          amount: 49,
          status: "refunded",
          created_at: "2026-08-02T09:20:00.000Z",
          refund_reason: "\u7269\u6D41\u592A\u6162\u7533\u8BF7\u9000\u6B3E"
        },
        {
          order_id: "ORD-20260802-242",
          buyer: "\u6728\u6728",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 2,
          amount: 258,
          status: "completed",
          created_at: "2026-08-02T10:12:56.000Z",
          shipped_at: "2026-08-05T10:12:56.000Z",
          tracking_no: "SF5554633529",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260802-420",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 3,
          amount: 477,
          status: "completed",
          created_at: "2026-08-02T12:45:57.000Z",
          shipped_at: "2026-08-04T12:45:57.000Z",
          tracking_no: "SF5095061685",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260802-441",
          buyer: "\u8001\u738B",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 5,
          amount: 295,
          status: "pending",
          created_at: "2026-08-02T13:23:19.000Z"
        },
        {
          order_id: "ORD-20260802-300",
          buyer: "\u665A\u98CE",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 4,
          amount: 1196,
          status: "paid",
          created_at: "2026-08-02T16:05:33.000Z"
        },
        {
          order_id: "ORD-20260802-270",
          buyer: "\u963F\u6770",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 5,
          amount: 795,
          status: "refunded",
          created_at: "2026-08-02T16:32:55.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260803-041",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 4,
          amount: 1196,
          status: "completed",
          created_at: "2026-08-03T08:09:37.000Z",
          shipped_at: "2026-08-06T08:09:37.000Z",
          tracking_no: "SF1872389898",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260803-004",
          buyer: "\u963F\u54F2",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 3,
          amount: 897,
          status: "shipped",
          created_at: "2026-08-03T11:39:39.000Z",
          shipped_at: "2026-08-05T11:39:39.000Z",
          tracking_no: "SF8212655909",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260803-159",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 2,
          amount: 238,
          status: "completed",
          created_at: "2026-08-03T13:58:15.000Z",
          shipped_at: "2026-08-06T13:58:15.000Z",
          tracking_no: "SF7351611308",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260803-244",
          buyer: "\u8001\u738B",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 2,
          amount: 118,
          status: "completed",
          created_at: "2026-08-03T15:39:13.000Z",
          shipped_at: "2026-08-05T15:39:13.000Z",
          tracking_no: "SF2135418240",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260803-289",
          buyer: "\u8001\u738B",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 5,
          amount: 995,
          status: "completed",
          created_at: "2026-08-03T16:11:19.000Z",
          shipped_at: "2026-08-05T16:11:19.000Z",
          tracking_no: "SF7057485397",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260803-460",
          buyer: "\u963F\u54F2",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 2,
          amount: 178,
          status: "cancelled",
          created_at: "2026-08-03T16:51:49.000Z"
        },
        {
          order_id: "ORD-20260803-394",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 4,
          amount: 276,
          status: "shipped",
          created_at: "2026-08-03T19:55:41.000Z",
          shipped_at: "2026-08-05T19:55:41.000Z",
          tracking_no: "SF2949210597",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260803-427",
          buyer: "\u963F\u51EF",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 5,
          amount: 645,
          status: "completed",
          created_at: "2026-08-03T20:25:22.000Z",
          shipped_at: "2026-08-06T20:25:22.000Z",
          tracking_no: "SF2907740482",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260804-141",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 3,
          amount: 477,
          status: "paid",
          created_at: "2026-08-04T08:15:50.000Z"
        },
        {
          order_id: "ORD-20260804-362",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 1,
          amount: 299,
          status: "completed",
          created_at: "2026-08-04T14:33:13.000Z",
          shipped_at: "2026-08-06T14:33:13.000Z",
          tracking_no: "SF3769935411",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260804-477",
          buyer: "\u963F\u6770",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 5,
          amount: 995,
          status: "completed",
          created_at: "2026-08-04T15:37:18.000Z",
          shipped_at: "2026-08-05T15:37:18.000Z",
          tracking_no: "SF9630656074",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260804-155",
          buyer: "\u8001\u738B",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 5,
          amount: 795,
          status: "completed",
          created_at: "2026-08-04T17:29:44.000Z",
          shipped_at: "2026-08-06T17:29:44.000Z",
          tracking_no: "SF3415443917",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260804-323",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 3,
          amount: 357,
          status: "pending",
          created_at: "2026-08-04T18:24:44.000Z"
        },
        {
          order_id: "ORD-20260804-437",
          buyer: "\u5976\u76D6",
          sku: "SKU-0019",
          product_name: "\u7535\u52A8\u7259\u5237\u5957\u88C5",
          quantity: 4,
          amount: 796,
          status: "completed",
          created_at: "2026-08-04T21:46:20.000Z",
          shipped_at: "2026-08-07T21:46:20.000Z",
          tracking_no: "SF2662106785",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260805-054",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 4,
          amount: 316,
          status: "completed",
          created_at: "2026-08-05T08:36:38.000Z",
          shipped_at: "2026-08-07T08:36:38.000Z",
          tracking_no: "SF5384942719",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260805-226",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 5,
          amount: 1295,
          status: "paid",
          created_at: "2026-08-05T17:23:44.000Z"
        },
        {
          order_id: "ORD-20260805-148",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 2,
          amount: 138,
          status: "completed",
          created_at: "2026-08-05T17:29:16.000Z",
          shipped_at: "2026-08-07T17:29:16.000Z",
          tracking_no: "SF3842656283",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260805-448",
          buyer: "\u8001\u738B",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 5,
          amount: 995,
          status: "completed",
          created_at: "2026-08-05T18:22:20.000Z",
          shipped_at: "2026-08-06T18:22:20.000Z",
          tracking_no: "SF4951057977",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260805-309",
          buyer: "\u8001\u738B",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 4,
          amount: 636,
          status: "completed",
          created_at: "2026-08-05T20:54:07.000Z",
          shipped_at: "2026-08-07T20:54:07.000Z",
          tracking_no: "SF5467024765",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260805-377",
          buyer: "\u5976\u76D6",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 1,
          amount: 129,
          status: "paid",
          created_at: "2026-08-05T21:21:26.000Z"
        },
        {
          order_id: "ORD-20260806-079",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 4,
          amount: 236,
          status: "completed",
          created_at: "2026-08-06T20:15:49.000Z",
          shipped_at: "2026-08-07T20:15:49.000Z",
          tracking_no: "SF5171083501",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260806-344",
          buyer: "\u665A\u98CE",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 2,
          amount: 178,
          status: "pending",
          created_at: "2026-08-06T21:59:19.000Z"
        },
        {
          order_id: "ORD-20260807-267",
          buyer: "\u96EA\u8389",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 3,
          amount: 207,
          status: "completed",
          created_at: "2026-08-07T10:02:05.000Z",
          shipped_at: "2026-08-09T10:02:05.000Z",
          tracking_no: "SF7986295730",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260807-396",
          buyer: "\u8389\u8389",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 5,
          amount: 995,
          status: "pending",
          created_at: "2026-08-07T10:54:50.000Z"
        },
        {
          order_id: "ORD-20260807-022",
          buyer: "\u963F\u6770",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 2,
          amount: 158,
          status: "completed",
          created_at: "2026-08-07T18:22:44.000Z",
          shipped_at: "2026-08-08T18:22:44.000Z",
          tracking_no: "SF2089310023",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260808-359",
          buyer: "\u8001\u738B",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 5,
          amount: 795,
          status: "shipped",
          created_at: "2026-08-08T11:07:30.000Z",
          shipped_at: "2026-08-11T11:07:30.000Z",
          tracking_no: "SF4283598795",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260808-100",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 3,
          amount: 387,
          status: "completed",
          created_at: "2026-08-08T11:20:01.000Z",
          shipped_at: "2026-08-11T11:20:01.000Z",
          tracking_no: "SF9491893306",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260808-073",
          buyer: "\u6843\u5B50",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 3,
          amount: 597,
          status: "completed",
          created_at: "2026-08-08T15:48:01.000Z",
          shipped_at: "2026-08-11T15:48:01.000Z",
          tracking_no: "SF1023337892",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260809-016",
          buyer: "\u829D\u829D",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 2,
          amount: 238,
          status: "completed",
          created_at: "2026-08-09T17:08:21.000Z",
          shipped_at: "2026-08-12T17:08:21.000Z",
          tracking_no: "SF4989665945",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260809-135",
          buyer: "\u829D\u829D",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 5,
          amount: 695,
          status: "completed",
          created_at: "2026-08-09T17:18:49.000Z",
          shipped_at: "2026-08-11T17:18:49.000Z",
          tracking_no: "SF7427106450",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260809-080",
          buyer: "\u963F\u6770",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 1,
          amount: 89,
          status: "shipped",
          created_at: "2026-08-09T20:22:16.000Z",
          shipped_at: "2026-08-11T20:22:16.000Z",
          tracking_no: "SF2420116148",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260809-014",
          buyer: "\u96EA\u8389",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 3,
          amount: 357,
          status: "shipped",
          created_at: "2026-08-09T21:46:54.000Z",
          shipped_at: "2026-08-10T21:46:54.000Z",
          tracking_no: "SF1027464917",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260810-380",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 2,
          amount: 258,
          status: "paid",
          created_at: "2026-08-10T11:22:39.000Z"
        },
        {
          order_id: "ORD-20260810-398",
          buyer: "\u96EA\u8389",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 5,
          amount: 795,
          status: "completed",
          created_at: "2026-08-10T13:47:25.000Z",
          shipped_at: "2026-08-12T13:47:25.000Z",
          tracking_no: "SF2279558357",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260810-165",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 3,
          amount: 387,
          status: "completed",
          created_at: "2026-08-10T18:29:47.000Z",
          shipped_at: "2026-08-13T18:29:47.000Z",
          tracking_no: "SF3206741175",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260810-425",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 3,
          amount: 177,
          status: "completed",
          created_at: "2026-08-10T21:06:47.000Z",
          shipped_at: "2026-08-11T21:06:47.000Z",
          tracking_no: "SF1834599063",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260811-402",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 5,
          amount: 345,
          status: "refunded",
          created_at: "2026-08-11T08:37:42.000Z",
          refund_reason: "\u62CD\u9519\u5546\u54C1"
        },
        {
          order_id: "ORD-20260811-392",
          buyer: "\u829D\u829D",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 5,
          amount: 445,
          status: "shipped",
          created_at: "2026-08-11T12:26:06.000Z",
          shipped_at: "2026-08-13T12:26:06.000Z",
          tracking_no: "SF4967912239",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260812-103",
          buyer: "\u8389\u8389",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 2,
          amount: 118,
          status: "completed",
          created_at: "2026-08-12T09:41:14.000Z",
          shipped_at: "2026-08-14T09:41:14.000Z",
          tracking_no: "SF7399857260",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260812-209",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 2,
          amount: 278,
          status: "completed",
          created_at: "2026-08-12T10:40:09.000Z",
          shipped_at: "2026-08-15T10:40:09.000Z",
          tracking_no: "SF7131372844",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260812-438",
          buyer: "\u963F\u5357",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 1,
          amount: 299,
          status: "completed",
          created_at: "2026-08-12T17:57:47.000Z",
          shipped_at: "2026-08-15T17:57:47.000Z",
          tracking_no: "SF8363448660",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260812-193",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 1,
          amount: 119,
          status: "completed",
          created_at: "2026-08-12T19:37:28.000Z",
          shipped_at: "2026-08-13T19:37:28.000Z",
          tracking_no: "SF1010340703",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260812-424",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 4,
          amount: 356,
          status: "completed",
          created_at: "2026-08-12T21:55:12.000Z",
          shipped_at: "2026-08-15T21:55:12.000Z",
          tracking_no: "SF7121199636",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260813-314",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 3,
          amount: 1197,
          status: "completed",
          created_at: "2026-08-13T08:49:31.000Z",
          shipped_at: "2026-08-14T08:49:31.000Z",
          tracking_no: "SF1607502448",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260813-422",
          buyer: "\u8389\u8389",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 2,
          amount: 258,
          status: "shipped",
          created_at: "2026-08-13T10:09:57.000Z",
          shipped_at: "2026-08-15T10:09:57.000Z",
          tracking_no: "SF8228355760",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260813-280",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 2,
          amount: 98,
          status: "refunded",
          created_at: "2026-08-13T11:42:59.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260813-472",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 5,
          amount: 995,
          status: "pending",
          created_at: "2026-08-13T12:33:22.000Z"
        },
        {
          order_id: "ORD-20260813-096",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 5,
          amount: 295,
          status: "completed",
          created_at: "2026-08-13T14:25:53.000Z",
          shipped_at: "2026-08-14T14:25:53.000Z",
          tracking_no: "SF8035579869",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260813-083",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 5,
          amount: 445,
          status: "completed",
          created_at: "2026-08-13T17:45:54.000Z",
          shipped_at: "2026-08-16T17:45:54.000Z",
          tracking_no: "SF1263212387",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260813-204",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 2,
          amount: 98,
          status: "completed",
          created_at: "2026-08-13T18:27:11.000Z",
          shipped_at: "2026-08-15T18:27:11.000Z",
          tracking_no: "SF3252356601",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260813-164",
          buyer: "\u96EA\u8389",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 3,
          amount: 147,
          status: "completed",
          created_at: "2026-08-13T19:56:49.000Z",
          shipped_at: "2026-08-15T19:56:49.000Z",
          tracking_no: "SF3198390979",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260814-461",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 5,
          amount: 795,
          status: "completed",
          created_at: "2026-08-14T09:25:34.000Z",
          shipped_at: "2026-08-17T09:25:34.000Z",
          tracking_no: "SF4858070162",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260814-429",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 2,
          amount: 398,
          status: "paid",
          created_at: "2026-08-14T13:24:13.000Z"
        },
        {
          order_id: "ORD-20260814-410",
          buyer: "\u96EA\u8389",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 3,
          amount: 387,
          status: "shipped",
          created_at: "2026-08-14T15:12:06.000Z",
          shipped_at: "2026-08-17T15:12:06.000Z",
          tracking_no: "SF5984644558",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260814-128",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 3,
          amount: 597,
          status: "completed",
          created_at: "2026-08-14T18:41:34.000Z",
          shipped_at: "2026-08-17T18:41:34.000Z",
          tracking_no: "SF7615988055",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260814-375",
          buyer: "\u53EF\u4E50",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 5,
          amount: 395,
          status: "completed",
          created_at: "2026-08-14T20:46:07.000Z",
          shipped_at: "2026-08-17T20:46:07.000Z",
          tracking_no: "SF6720491068",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260815-049",
          buyer: "\u963F\u51EF",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 3,
          amount: 387,
          status: "completed",
          created_at: "2026-08-15T08:55:22.000Z",
          shipped_at: "2026-08-16T08:55:22.000Z",
          tracking_no: "SF2149015914",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260815-081",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 3,
          amount: 357,
          status: "completed",
          created_at: "2026-08-15T09:36:55.000Z",
          shipped_at: "2026-08-17T09:36:55.000Z",
          tracking_no: "SF4800851446",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260815-405",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 1,
          amount: 299,
          status: "completed",
          created_at: "2026-08-15T11:55:37.000Z",
          shipped_at: "2026-08-16T11:55:37.000Z",
          tracking_no: "SF9432124922",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260815-122",
          buyer: "\u6728\u6728",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 1,
          amount: 79,
          status: "cancelled",
          created_at: "2026-08-15T11:58:05.000Z"
        },
        {
          order_id: "ORD-20260815-084",
          buyer: "\u963F\u5357",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 1,
          amount: 199,
          status: "completed",
          created_at: "2026-08-15T16:08:13.000Z",
          shipped_at: "2026-08-16T16:08:13.000Z",
          tracking_no: "SF7938472574",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260816-337",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 4,
          amount: 796,
          status: "shipped",
          created_at: "2026-08-16T08:33:43.000Z",
          shipped_at: "2026-08-17T08:33:43.000Z",
          tracking_no: "SF2680778887",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260816-224",
          buyer: "\u8389\u8389",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 2,
          amount: 318,
          status: "shipped",
          created_at: "2026-08-16T10:13:09.000Z",
          shipped_at: "2026-08-18T10:13:09.000Z",
          tracking_no: "SF8834293180",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260816-466",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 2,
          amount: 318,
          status: "completed",
          created_at: "2026-08-16T10:48:32.000Z",
          shipped_at: "2026-08-17T10:48:32.000Z",
          tracking_no: "SF8370454854",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260816-202",
          buyer: "\u963F\u51EF",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 3,
          amount: 777,
          status: "shipped",
          created_at: "2026-08-16T11:29:39.000Z",
          shipped_at: "2026-08-19T11:29:39.000Z",
          tracking_no: "SF7801003396",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260816-385",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 3,
          amount: 567,
          status: "refunded",
          created_at: "2026-08-16T14:13:12.000Z",
          refund_reason: "\u62CD\u9519\u5546\u54C1"
        },
        {
          order_id: "ORD-20260816-387",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 3,
          amount: 1197,
          status: "completed",
          created_at: "2026-08-16T14:21:41.000Z",
          shipped_at: "2026-08-17T14:21:41.000Z",
          tracking_no: "SF6735574267",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260816-037",
          buyer: "\u963F\u54F2",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 4,
          amount: 276,
          status: "refunded",
          created_at: "2026-08-16T15:53:54.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260816-228",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 3,
          amount: 597,
          status: "pending",
          created_at: "2026-08-16T16:07:14.000Z"
        },
        {
          order_id: "ORD-20260816-269",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 2,
          amount: 278,
          status: "completed",
          created_at: "2026-08-16T17:42:46.000Z",
          shipped_at: "2026-08-17T17:42:46.000Z",
          tracking_no: "SF8137008893",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260816-046",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 5,
          amount: 945,
          status: "shipped",
          created_at: "2026-08-16T19:01:30.000Z",
          shipped_at: "2026-08-19T19:01:30.000Z",
          tracking_no: "SF4130119555",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260817-196",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0017",
          product_name: "\u73BB\u5C3F\u9178\u8865\u6C34\u9762\u819C(10\u7247)",
          quantity: 5,
          amount: 395,
          status: "completed",
          created_at: "2026-08-17T09:05:26.000Z",
          shipped_at: "2026-08-20T09:05:26.000Z",
          tracking_no: "SF6873972625",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260817-426",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 3,
          amount: 357,
          status: "completed",
          created_at: "2026-08-17T11:03:32.000Z",
          shipped_at: "2026-08-20T11:03:32.000Z",
          tracking_no: "SF9194191904",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260817-467",
          buyer: "\u963F\u6770",
          sku: "SKU-0004",
          product_name: "\u8F7B\u91CF\u7FBD\u7ED2\u670D(\u9884\u552E)",
          quantity: 4,
          amount: 1596,
          status: "cancelled",
          created_at: "2026-08-17T16:39:29.000Z"
        },
        {
          order_id: "ORD-20260817-006",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 4,
          amount: 276,
          status: "completed",
          created_at: "2026-08-17T16:53:36.000Z",
          shipped_at: "2026-08-19T16:53:36.000Z",
          tracking_no: "SF3867304512",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260817-163",
          buyer: "\u9752\u9752",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 1,
          amount: 129,
          status: "pending",
          created_at: "2026-08-17T19:25:45.000Z"
        },
        {
          order_id: "ORD-20260817-179",
          buyer: "\u829D\u829D",
          sku: "SKU-0007",
          product_name: "\u667A\u80FD\u624B\u73AF 5 \u4EE3",
          quantity: 3,
          amount: 597,
          status: "paid",
          created_at: "2026-08-17T21:27:46.000Z"
        },
        {
          order_id: "ORD-20260818-053",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 4,
          amount: 516,
          status: "cancelled",
          created_at: "2026-08-18T08:20:22.000Z"
        },
        {
          order_id: "ORD-20260818-225",
          buyer: "\u6A59\u5B50",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 3,
          amount: 387,
          status: "completed",
          created_at: "2026-08-18T11:58:19.000Z",
          shipped_at: "2026-08-21T11:58:19.000Z",
          tracking_no: "SF9231365846",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260818-175",
          buyer: "\u963F\u5357",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 2,
          amount: 378,
          status: "shipped",
          created_at: "2026-08-18T12:48:05.000Z",
          shipped_at: "2026-08-21T12:48:05.000Z",
          tracking_no: "SF5990627743",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260818-444",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 2,
          amount: 598,
          status: "completed",
          created_at: "2026-08-18T12:55:46.000Z",
          shipped_at: "2026-08-21T12:55:46.000Z",
          tracking_no: "SF2926253172",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260818-042",
          buyer: "\u963F\u6770",
          sku: "SKU-0022",
          product_name: "\u51BB\u5E72\u5496\u5561 2g\xD760",
          quantity: 5,
          amount: 645,
          status: "completed",
          created_at: "2026-08-18T13:13:30.000Z",
          shipped_at: "2026-08-19T13:13:30.000Z",
          tracking_no: "SF9030969041",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260818-015",
          buyer: "\u963F\u8363",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 2,
          amount: 278,
          status: "shipped",
          created_at: "2026-08-18T16:48:21.000Z",
          shipped_at: "2026-08-21T16:48:21.000Z",
          tracking_no: "SF2734595187",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260818-032",
          buyer: "\u963F\u54F2",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 4,
          amount: 796,
          status: "refunded",
          created_at: "2026-08-18T17:09:31.000Z",
          refund_reason: "\u5C3A\u7801\u4E0D\u5408\u9002"
        },
        {
          order_id: "ORD-20260818-347",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 4,
          amount: 556,
          status: "refunded",
          created_at: "2026-08-18T18:49:52.000Z",
          refund_reason: "\u62CD\u9519\u5546\u54C1"
        },
        {
          order_id: "ORD-20260818-272",
          buyer: "\u5C0F\u9E7F\u4E71\u649E",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 1,
          amount: 59,
          status: "completed",
          created_at: "2026-08-18T19:05:16.000Z",
          shipped_at: "2026-08-20T19:05:16.000Z",
          tracking_no: "SF1723529328",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260818-207",
          buyer: "\u5976\u76D6",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 1,
          amount: 159,
          status: "paid",
          created_at: "2026-08-18T20:49:37.000Z"
        },
        {
          order_id: "ORD-20260819-338",
          buyer: "\u963F\u6770",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 1,
          amount: 79,
          status: "shipped",
          created_at: "2026-08-19T09:46:26.000Z",
          shipped_at: "2026-08-21T09:46:26.000Z",
          tracking_no: "SF2562453959",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260819-342",
          buyer: "\u665A\u98CE",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 5,
          amount: 645,
          status: "shipped",
          created_at: "2026-08-19T11:33:50.000Z",
          shipped_at: "2026-08-22T11:33:50.000Z",
          tracking_no: "SF7941485717",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260819-478",
          buyer: "Suki",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 1,
          amount: 139,
          status: "completed",
          created_at: "2026-08-19T11:41:00.000Z",
          shipped_at: "2026-08-22T11:41:00.000Z",
          tracking_no: "SF7296460552",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260819-033",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 5,
          amount: 645,
          status: "paid",
          created_at: "2026-08-19T13:24:02.000Z"
        },
        {
          order_id: "ORD-20260819-363",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 3,
          amount: 387,
          status: "shipped",
          created_at: "2026-08-19T13:46:49.000Z",
          shipped_at: "2026-08-21T13:46:49.000Z",
          tracking_no: "SF7910995243",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260819-261",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0002",
          product_name: "\u9AD8\u8170\u9614\u817F\u725B\u4ED4\u88E4",
          quantity: 5,
          amount: 945,
          status: "paid",
          created_at: "2026-08-19T16:39:14.000Z"
        },
        {
          order_id: "ORD-20260819-290",
          buyer: "\u96EA\u8389",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 3,
          amount: 477,
          status: "completed",
          created_at: "2026-08-19T19:03:59.000Z",
          shipped_at: "2026-08-22T19:03:59.000Z",
          tracking_no: "SF7679697958",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260819-371",
          buyer: "\u5C0F\u6797",
          sku: "SKU-0001",
          product_name: "\u51B0\u4E1D\u9632\u6652\u5916\u5957",
          quantity: 5,
          amount: 795,
          status: "completed",
          created_at: "2026-08-19T21:15:34.000Z",
          shipped_at: "2026-08-20T21:15:34.000Z",
          tracking_no: "SF2257994088",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260820-379",
          buyer: "\u6BDB\u6BDB",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 4,
          amount: 196,
          status: "pending",
          created_at: "2026-08-20T09:53:02.000Z"
        },
        {
          order_id: "ORD-20260820-348",
          buyer: "\u6728\u6728",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 4,
          amount: 356,
          status: "shipped",
          created_at: "2026-08-20T14:18:07.000Z",
          shipped_at: "2026-08-22T14:18:07.000Z",
          tracking_no: "SF3457045593",
          carrier: "\u987A\u4E30"
        },
        {
          order_id: "ORD-20260820-005",
          buyer: "\u8001\u738B",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 2,
          amount: 398,
          status: "completed",
          created_at: "2026-08-20T16:10:58.000Z",
          shipped_at: "2026-08-22T16:10:58.000Z",
          tracking_no: "SF8766696037",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260820-284",
          buyer: "\u6728\u6728",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 1,
          amount: 99,
          status: "refunded",
          created_at: "2026-08-20T17:28:56.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260821-133",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 3,
          amount: 267,
          status: "completed",
          created_at: "2026-08-21T08:26:00.000Z",
          shipped_at: "2026-08-23T08:26:00.000Z",
          tracking_no: "SF1212207115",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260821-479",
          buyer: "\u8001\u738B",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 5,
          amount: 295,
          status: "pending",
          created_at: "2026-08-21T09:09:35.000Z"
        },
        {
          order_id: "ORD-20260821-149",
          buyer: "\u82B3\u82B3",
          sku: "SKU-0003",
          product_name: "\u7EAF\u68C9\u77ED\u8896 T \u6064",
          quantity: 3,
          amount: 207,
          status: "refunded",
          created_at: "2026-08-21T13:14:30.000Z",
          refund_reason: "\u62CD\u9519\u5546\u54C1"
        },
        {
          order_id: "ORD-20260821-335",
          buyer: "\u9752\u9752",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 3,
          amount: 177,
          status: "pending",
          created_at: "2026-08-21T14:10:29.000Z"
        },
        {
          order_id: "ORD-20260821-223",
          buyer: "\u5927\u718A",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 2,
          amount: 178,
          status: "cancelled",
          created_at: "2026-08-21T15:15:49.000Z"
        },
        {
          order_id: "ORD-20260821-442",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0026",
          product_name: "\u901F\u5E72\u8FD0\u52A8\u5957\u88C5",
          quantity: 1,
          amount: 199,
          status: "refunded",
          created_at: "2026-08-21T18:30:46.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260822-345",
          buyer: "Suki",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 1,
          amount: 49,
          status: "refunded",
          created_at: "2026-08-22T08:25:03.000Z",
          refund_reason: "\u4E03\u5929\u65E0\u7406\u7531\u9000\u8D27"
        },
        {
          order_id: "ORD-20260822-285",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 2,
          amount: 598,
          status: "completed",
          created_at: "2026-08-22T11:54:11.000Z",
          shipped_at: "2026-08-24T11:54:11.000Z",
          tracking_no: "SF7829897183",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260822-104",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0012",
          product_name: "\u61D2\u4EBA\u6C99\u53D1\u8C46\u888B",
          quantity: 4,
          amount: 1036,
          status: "completed",
          created_at: "2026-08-22T12:49:01.000Z",
          shipped_at: "2026-08-24T12:49:01.000Z",
          tracking_no: "SF2932607321",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260822-105",
          buyer: "\u9752\u9752",
          sku: "SKU-0005",
          product_name: "\u590D\u53E4\u5E06\u5E03\u978B",
          quantity: 3,
          amount: 477,
          status: "pending",
          created_at: "2026-08-22T14:11:23.000Z"
        },
        {
          order_id: "ORD-20260822-075",
          buyer: "\u5C0F\u7F8E",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 2,
          amount: 158,
          status: "pending",
          created_at: "2026-08-22T16:07:30.000Z"
        },
        {
          order_id: "ORD-20260823-102",
          buyer: "\u5927\u718A",
          sku: "SKU-0020",
          product_name: "\u62A4\u53D1\u7CBE\u6CB9 100ml",
          quantity: 5,
          amount: 445,
          status: "shipped",
          created_at: "2026-08-23T08:35:25.000Z",
          shipped_at: "2026-08-26T08:35:25.000Z",
          tracking_no: "SF8395642010",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260823-455",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 1,
          amount: 49,
          status: "refunded",
          created_at: "2026-08-23T08:46:03.000Z",
          refund_reason: "\u5546\u54C1\u8D28\u91CF\u95EE\u9898"
        },
        {
          order_id: "ORD-20260823-131",
          buyer: "\u9EA6\u9EA6",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 3,
          amount: 147,
          status: "completed",
          created_at: "2026-08-23T10:50:02.000Z",
          shipped_at: "2026-08-25T10:50:02.000Z",
          tracking_no: "SF2118795432",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260823-040",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0016",
          product_name: "\u6C28\u57FA\u9178\u6D01\u9762\u4E73",
          quantity: 5,
          amount: 295,
          status: "paid",
          created_at: "2026-08-23T11:36:47.000Z"
        },
        {
          order_id: "ORD-20260823-176",
          buyer: "\u5E03\u4E01",
          sku: "SKU-0015",
          product_name: "\u667A\u80FD\u611F\u5E94\u591C\u706F",
          quantity: 2,
          amount: 98,
          status: "completed",
          created_at: "2026-08-23T11:59:16.000Z",
          shipped_at: "2026-08-26T11:59:16.000Z",
          tracking_no: "SF7243604459",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260823-231",
          buyer: "\u963F\u5357",
          sku: "SKU-0008",
          product_name: "\u5FEB\u5145\u5145\u7535\u5B9D 20000mAh",
          quantity: 4,
          amount: 516,
          status: "cancelled",
          created_at: "2026-08-23T14:17:16.000Z"
        },
        {
          order_id: "ORD-20260823-216",
          buyer: "\u963F\u6770",
          sku: "SKU-0018",
          product_name: "\u9632\u6652\u971C SPF50+",
          quantity: 4,
          amount: 516,
          status: "refunded",
          created_at: "2026-08-23T15:37:33.000Z",
          refund_reason: "\u5546\u54C1\u8D28\u91CF\u95EE\u9898"
        },
        {
          order_id: "ORD-20260823-469",
          buyer: "\u9752\u9752",
          sku: "SKU-0009",
          product_name: "\u6C2E\u5316\u9553 65W \u5145\u7535\u5668",
          quantity: 1,
          amount: 89,
          status: "paid",
          created_at: "2026-08-23T19:41:19.000Z"
        },
        {
          order_id: "ORD-20260823-064",
          buyer: "\u963F\u8C6A",
          sku: "SKU-0006",
          product_name: "\u65E0\u7EBF\u84DD\u7259\u8033\u673A Pro",
          quantity: 1,
          amount: 299,
          status: "completed",
          created_at: "2026-08-23T21:48:22.000Z",
          shipped_at: "2026-08-24T21:48:22.000Z",
          tracking_no: "SF1986677640",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260824-421",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0010",
          product_name: "\u78C1\u5438\u65E0\u7EBF\u5145\u7535\u677F",
          quantity: 3,
          amount: 357,
          status: "completed",
          created_at: "2026-08-24T13:24:44.000Z",
          shipped_at: "2026-08-27T13:24:44.000Z",
          tracking_no: "SF1472363546",
          carrier: "\u97F5\u8FBE"
        },
        {
          order_id: "ORD-20260824-221",
          buyer: "\u665A\u98CE",
          sku: "SKU-0011",
          product_name: "\u8BB0\u5FC6\u68C9\u62A4\u9888\u6795",
          quantity: 1,
          amount: 99,
          status: "refunded",
          created_at: "2026-08-24T13:42:42.000Z",
          refund_reason: "\u5546\u54C1\u8D28\u91CF\u95EE\u9898"
        },
        {
          order_id: "ORD-20260824-430",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0013",
          product_name: "\u9999\u85B0\u52A0\u6E7F\u5668",
          quantity: 3,
          amount: 417,
          status: "completed",
          created_at: "2026-08-24T13:51:55.000Z",
          shipped_at: "2026-08-26T13:51:55.000Z",
          tracking_no: "SF8793824949",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260824-340",
          buyer: "\u5927\u9E4F",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 2,
          amount: 158,
          status: "completed",
          created_at: "2026-08-24T14:00:11.000Z",
          shipped_at: "2026-08-26T14:00:11.000Z",
          tracking_no: "SF9304964422",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260825-316",
          buyer: "\u7A0B\u7A0B",
          sku: "SKU-0023",
          product_name: "\u4F4E\u7CD6\u6C14\u6CE1\u6C34(24\u74F6)",
          quantity: 5,
          amount: 295,
          status: "shipped",
          created_at: "2026-08-25T09:07:33.000Z",
          shipped_at: "2026-08-28T09:07:33.000Z",
          tracking_no: "SF5568277950",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260825-090",
          buyer: "\u5C0F\u6EE1",
          sku: "SKU-0014",
          product_name: "\u5168\u68C9\u56DB\u4EF6\u5957",
          quantity: 5,
          amount: 1495,
          status: "completed",
          created_at: "2026-08-25T11:25:47.000Z",
          shipped_at: "2026-08-28T11:25:47.000Z",
          tracking_no: "SF7560889103",
          carrier: "\u4E2D\u901A"
        },
        {
          order_id: "ORD-20260825-023",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0024",
          product_name: "\u745C\u4F3D\u57AB\u52A0\u539A 8mm",
          quantity: 3,
          amount: 237,
          status: "completed",
          created_at: "2026-08-25T16:00:54.000Z",
          shipped_at: "2026-08-26T16:00:54.000Z",
          tracking_no: "SF4636695344",
          carrier: "\u4EAC\u4E1C"
        },
        {
          order_id: "ORD-20260825-388",
          buyer: "\u963F\u51EF",
          sku: "SKU-0021",
          product_name: "\u6BCF\u65E5\u575A\u679C\u793C\u76D2 30 \u5305",
          quantity: 1,
          amount: 89,
          status: "shipped",
          created_at: "2026-08-25T19:08:05.000Z",
          shipped_at: "2026-08-27T19:08:05.000Z",
          tracking_no: "SF5857813553",
          carrier: "\u5706\u901A"
        },
        {
          order_id: "ORD-20260825-044",
          buyer: "\u67DA\u5B50",
          sku: "SKU-0025",
          product_name: "\u8FD0\u52A8\u6C34\u58F6 1L",
          quantity: 4,
          amount: 196,
          status: "completed",
          created_at: "2026-08-25T21:05:22.000Z",
          shipped_at: "2026-08-26T21:05:22.000Z",
          tracking_no: "SF8990494302",
          carrier: "\u987A\u4E30"
        }
      ],
      _meta: {
        source: "enterprise-seed",
        description: "\u4F01\u4E1A\u7535\u5546\u6F14\u793A\u6570\u636E\uFF1A26 \u5546\u54C1 / 480 \u8BA2\u5355\uFF08\u8FD1 90 \u5929\uFF0C6 \u5927\u5206\u7C7B\uFF09\uFF0C\u786E\u5B9A\u6027\u751F\u6210 seed=20260825",
        generated_at: "2026-08-25T02:53:50.892Z"
      }
    };
  }
});

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
var seedData, MockAdapter;
var init_mock = __esm({
  "src/platform/mock.ts"() {
    "use strict";
    init_seed();
    seedData = seed_default;
    MockAdapter = class {
      name = "mock";
      readOnly = true;
      /** 深拷贝 seed 数据，避免 Store 写操作污染模块级示例数据（测试隔离） */
      products = structuredClone(seedData.products);
      orders = structuredClone(seedData.orders);
      async listProducts(filter) {
        return filterProducts(this.products, filter);
      }
      async listOrders(filter) {
        return filterOrders(this.orders, filter);
      }
      /** 返回示例种子数据的深拷贝（供「重置为演示数据」使用） */
      seedSnapshot() {
        return {
          products: structuredClone(seedData.products),
          orders: structuredClone(seedData.orders)
        };
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

// src/config.ts
import z from "@deepseek-ai/schemastery";
var Config = z.object({
  platform: z.object({
    name: z.string().default("mock"),
    baseUrl: z.string().default(""),
    appKey: z.string().default(""),
    appSecret: z.string().default("")
  }),
  storage: z.object({
    file: z.string().default("./ecommerce-analyst-plugin/data/store.json"),
    seedOnEmpty: z.boolean().default(true)
  }),
  inventory: z.object({
    lowStockThreshold: z.number().default(10)
  })
});
var defaultConfig = {
  platform: { name: "mock", baseUrl: "", appKey: "", appSecret: "" },
  storage: { file: "./ecommerce-analyst-plugin/data/store.json", seedOnEmpty: true },
  inventory: { lowStockThreshold: 10 }
};

// src/store.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

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
    for (let r = subIdx + 1; r < rows.length; r++) {
      const row = rows[r] ?? [];
      if (!data(id2.linkName, row) && !data(id2.linkId, row)) continue;
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
    const positiveSales = Number(s.positiveSales) || 0;
    const effSales = sales > 0 ? sales : positiveSales;
    return { ...s, sales, positiveSales, feeRatio: effSales > 0 ? Number(s.promoCost) / effSales * 100 : 0 };
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
  merged.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  return merged;
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
    if (this.cfg.seedOnEmpty && existsSync(this.cfg.file)) {
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
      mkdirSync(dirname(this.cfg.file), { recursive: true });
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
        previousWeeklyReport: this.previousWeeklyReport
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
  /** 读取月度复盘（无导入记录返回 null） */
  getMonthlyReport() {
    return this.monthlyReport;
  }
  /** 读取上一期月度复盘（未连续导入第二期返回 null）：供数据对比用 */
  getPreviousMonthlyReport() {
    return this.previousMonthlyReport;
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
   * 重置为演示数据：先导出当前数据快照（防误操作），再从示例种子重新初始化。
   * 返回 { products, orders, snapshot }，snapshot 为重置前的备份 JSON。
   */
  async resetToDemo() {
    const snapshot = this.exportBackup();
    if (typeof this.adapter.seedSnapshot === "function") {
      const seed = this.adapter.seedSnapshot();
      this.products = seed.products;
      this.orders = seed.orders;
    } else {
      const [products, orders] = await Promise.all([
        this.adapter.listProducts({}),
        this.adapter.listOrders({})
      ]);
      this.products = products;
      this.orders = orders;
    }
    this.dataMode = "demo";
    this.productsSource = "demo";
    this.ordersSource = "demo";
    this.save();
    return { products: this.products.length, orders: this.orders.length, snapshot };
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
    const revenue = revOrders.reduce((sum2, o) => sum2 + toCents(o.amount), 0);
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
  const note = sourceMode === "mock" ? "\n\uFF08\u5F53\u524D\u4E3A\u793A\u4F8B\u6570\u636E\u6A21\u5F0F\uFF0C\u4EC5\u4F5C\u6F14\u793A\uFF09" : "";
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
  const note = sourceMode === "mock" ? "\n\uFF08\u5F53\u524D\u4E3A\u793A\u4F8B\u6570\u636E\u6A21\u5F0F\uFF0C\u4EC5\u4F5C\u6F14\u793A\uFF09" : "";
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
        const note = mode === "mock" ? "\n\uFF08\u5F53\u524D\u4E3A\u793A\u4F8B\u6570\u636E\u6A21\u5F0F\uFF0C\u4EC5\u4F5C\u6F14\u793A\uFF09" : "";
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
import { dirname as dirname2, join } from "node:path";
import { fileURLToPath } from "node:url";
var MODULE_DIR = dirname2(fileURLToPath(import.meta.url));
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
    html = readFileSync2(join(MODULE_DIR, "assets", "data-center.html"), "utf8");
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
  const totalSales = sum(rows, "sales");
  const totalNet = sum(rows, "netSales");
  const totalAd = sum(rows, "adSpend");
  const totalRefund = sum(rows, "refundAmount");
  const feeRatio = totalNet > 0 ? totalAd / totalNet * 100 : 0;
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
    topShare
  };
}
function ruleBasedEvaluation(s) {
  const periodLabel2 = s.cycle === "7d" ? "\u672C\u5468" : "\u672C\u6708";
  const issues = [];
  if (s.feeRatio > 20) issues.push("\u63A8\u5E7F\u8D39\u6BD4\u504F\u9AD8");
  if (s.refundRate > 10) issues.push("\u9000\u6B3E\u7387\u504F\u9AD8");
  if (s.topShare > 40) issues.push("\u5934\u90E8\u5546\u54C1\u5360\u6BD4\u8FC7\u9AD8");
  const verdict = issues.length ? issues.join("\u3001") + "\uFF0C\u5EFA\u8BAE\u4F18\u5316\u5BF9\u5E94\u73AF\u8282" : "\u9500\u552E\u4E0E\u8D39\u6548\u6574\u4F53\u5E73\u7A33";
  const text = `${periodLabel2}\u9500\u552E\u989D${fmtMoney(s.totalSales)}\uFF0C\u5728\u9500\u5546\u54C1${s.itemCount}\u4E2A\uFF0C\u8D39\u6BD4${s.feeRatio.toFixed(1)}%\uFF0C\u9000\u6B3E\u7387${s.refundRate.toFixed(1)}%\uFF1B${verdict}\u3002`;
  return text.length > 80 ? text.slice(0, 80) : text;
}
function evaluationPrompt(s) {
  const periodLabel2 = s.cycle === "7d" ? "\u672C\u5468" : "\u672C\u6708";
  return [
    `\u8BF7\u57FA\u4E8E\u4EE5\u4E0B${periodLabel2}\u7535\u5546\u7ECF\u8425\u6570\u636E\uFF0C\u4ECE\u300C\u9500\u552E\u989D\u3001\u4EA7\u54C1\u3001\u63A8\u5E7F\u3001\u9000\u6B3E\u300D\u56DB\u4E2A\u89D2\u5EA6\u505A\u4E00\u53E5\u603B\u4F53\u6570\u636E\u8BC4\u4EF7\u3002`,
    `- \u5468\u671F\uFF1A${s.period}`,
    `- \u9500\u552E\u989D\uFF1A${fmtMoney(s.totalSales)}\uFF08\u51C0\u9500 ${fmtMoney(s.totalNet)}\uFF09`,
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
var COMPARE_METRICS = {
  platformLinks: [
    metric("sales", "\u9500\u552E\u989D", "money"),
    metric("netSales", "\u51C0\u9500\u552E\u989D", "money"),
    metric("grossProfit", "\u6BDB\u5229\u989D", "money"),
    metric("salesCount", "\u9500\u552E\u4EF6\u6570", "number"),
    metric("grossMargin", "\u6BDB\u5229\u7387", "pct", true),
    metric("refundAmount", "\u9000\u6B3E\u91D1\u989D", "money"),
    metric("refundRate", "\u9000\u6B3E\u7387", "pct", true),
    metric("adSpend", "\u63A8\u5E7F\u8D39", "money"),
    metric("views", "\u6D4F\u89C8\u91CF", "number"),
    metric("avgPrice", "\u5BA2\u5355\u4EF7", "money", true, "salesCount")
  ],
  systemProducts: [
    metric("sales", "\u9500\u552E\u989D", "money"),
    metric("netSales", "\u51C0\u9500\u552E\u989D", "money"),
    metric("grossProfit", "\u6BDB\u5229\u989D", "money"),
    metric("grossMargin", "\u6BDB\u5229\u7387", "pct", true),
    metric("refundRate", "\u9000\u6B3E\u7387", "pct", true),
    metric("adSpend", "\u63A8\u5E7F\u8D39", "money"),
    metric("avgPrice", "\u5BA2\u5355\u4EF7", "money", true, "sales")
  ],
  systemSkus: [
    metric("sales", "\u9500\u552E\u989D", "money"),
    metric("salesCount", "\u9500\u552E\u4EF6\u6570", "number"),
    metric("netSales", "\u51C0\u9500\u552E\u989D", "money"),
    metric("grossProfit", "\u6BDB\u5229\u989D", "money"),
    metric("grossMargin", "\u6BDB\u5229\u7387", "pct", true),
    metric("refundAmount", "\u9000\u6B3E\u91D1\u989D", "money"),
    metric("refundRate", "\u9000\u6B3E\u7387", "pct", true),
    metric("adSpend", "\u63A8\u5E7F\u8D39", "money"),
    metric("avgPrice", "\u5BA2\u5355\u4EF7", "money", true, "salesCount")
  ],
  storeProfit: [
    metric("sales", "\u9500\u552E\u6536\u5165", "money"),
    metric("positiveSales", "\u6B63\u5411\u9500\u552E\u6536\u5165", "money"),
    metric("refund", "\u9000\u6B3E", "money"),
    metric("grossProfit", "\u6BDB\u5229", "money"),
    metric("grossMargin", "\u6BDB\u5229\u7387", "pct", true),
    metric("promoCost", "\u8FD0\u8425\u63A8\u5E7F\u8D39", "money"),
    metric("logisticsCost", "\u4ED3\u5E93\u7269\u6D41\u8D39", "money"),
    metric("feeRatio", "\u8D39\u6BD4", "pct", true)
  ]
};
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
    const cur = out.get(key);
    if (cur) {
      cur.value += value;
      cur.weight += weight;
    } else {
      out.set(key, { key, label: labelOf(kind, row) || key, value, weight });
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
      state
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
    result
  };
}

// src/shop-api.ts
var CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "accept, content-type, origin",
  "access-control-max-age": "600"
};
function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...CORS_HEADERS
  });
  res.end(text);
}
function sendPreflight(res) {
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
  return new Promise((resolve, reject) => {
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
        resolve(text ? JSON.parse(text) : {});
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
function registerShopApi(webServer, store, ctx = {}) {
  return webServer.register({
    kind: "prefix",
    path: "/ecommerce-api",
    handler: async (req, res) => {
      const raw = String(req.url ?? "/");
      const pathname = raw.split("?")[0] ?? raw;
      const query = new URL(raw, "http://localhost").searchParams;
      try {
        if (req.method === "OPTIONS") {
          sendPreflight(res);
          return;
        }
        if (pathname === "/ecommerce-api/import-batch" && req.method === "POST") {
          const body = await readJsonBody(req);
          const rawFiles = Array.isArray(body.files) ? body.files : [];
          if (rawFiles.length === 0) {
            sendJson(res, 400, {
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
          sendJson(res, 200, {
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
        if (pathname === "/ecommerce-api/monthly-report") {
          sendJson(res, 200, { ok: true, value: store.getMonthlyReport(), revision: store.getReportRevision() });
          return;
        }
        if (pathname === "/ecommerce-api/weekly-report") {
          sendJson(res, 200, { ok: true, value: store.getWeeklyReport(), revision: store.getReportRevision() });
          return;
        }
        if (pathname === "/ecommerce-api/compare") {
          const rawCycle = String(query.get("cycle") ?? "30d");
          const cycle = isCompareCycle(rawCycle) ? rawCycle : "30d";
          const kind = query.get("kind") ?? void 0;
          const metric2 = query.get("metric") ?? void 0;
          const limit = Math.min(Math.max(Number(query.get("limit") ?? 100) || 100, 1), 1e3);
          const payload = buildComparePayload(store, cycle, kind, metric2, limit);
          sendJson(res, 200, { ok: true, value: payload, revision: store.getReportRevision() });
          return;
        }
        if (pathname === "/ecommerce-api/evaluation") {
          const cycle = query.get("cycle") === "7d" ? "7d" : "30d";
          const revision = store.getReportRevision();
          const cacheKey = cycle + ":" + revision;
          const summary = buildEvaluationSummary(cycle, store.getMonthlyReport(), store.getWeeklyReport());
          if (summary === null) {
            sendJson(res, 200, { ok: true, value: { cycle, evaluation: "", source: "rule", pending: false } });
            return;
          }
          const entry = ensureEvaluation(cacheKey, summary, ctx);
          sendJson(res, 200, {
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
            if (type === "json") {
              sendJson(res, 200, { ok: true, value: { products, orders } });
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
            } else {
              csv = productsToCsv(products) + "\r\n\r\n" + ordersToCsv(orders);
              filename = "ecommerce-all.csv";
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
            sendJson(res, 500, {
              ok: false,
              error: { code: "EXPORT_FAILED", message: err instanceof Error ? err.message : String(err) }
            });
            return;
          }
        }
        sendJson(res, 404, {
          ok: false,
          error: { code: "NOT_FOUND", message: `unknown ecommerce-api path: ${pathname}` }
        });
      } catch (err) {
        sendJson(res, 500, {
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
    description: "\u5207\u6362\u5E97\u94FA\u6570\u636E\u6E90\u6A21\u5F0F\uFF1Ademo=\u6F14\u793A\u6570\u636E\uFF08\u793A\u4F8B\u79CD\u5B50\uFF09/ imported=\u5BFC\u5165\u6570\u636E\uFF08\u6700\u8FD1\u4E00\u6B21\u5BFC\u5165\u7684\u5907\u4EFD\uFF09/ rest=\u5E73\u53F0 API\uFF08\u9700\u542F\u52A8\u65F6\u914D\u7F6E rest \u5E73\u53F0\uFF09\u3002\u5207\u6362\u524D\u81EA\u52A8\u5907\u4EFD\u5F53\u524D\u6570\u636E\uFF1B\u5207\u6362\u540E\u7EDF\u8BA1\u5DE5\u5177\u4E0E\u5E97\u94FA\u5DE5\u4F5C\u53F0\u7ACB\u5373\u53CD\u6620\u65B0\u6570\u636E\u6E90\u3002",
    parameters: {
      mode: {
        type: "string",
        required: true,
        enum: ["demo", "imported", "rest"],
        description: "\u76EE\u6807\u6570\u636E\u6E90\uFF1Ademo / imported / rest"
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
      if (mode !== "demo" && mode !== "imported" && mode !== "rest") {
        throw new Error(`\u672A\u77E5\u6570\u636E\u6E90\u6A21\u5F0F\uFF1A${String(mode)}`);
      }
      try {
        const result = await store.switchMode(mode);
        return asJsonObject({
          ...result,
          mode,
          hint: mode === "imported" ? "\u5DF2\u6062\u590D\u6700\u8FD1\u4E00\u6B21\u5BFC\u5165\u7684\u6570\u636E" : mode === "rest" ? "\u5DF2\u4ECE\u5E73\u53F0 API \u91CD\u65B0\u62C9\u53D6\u6570\u636E" : "\u5DF2\u91CD\u7F6E\u4E3A\u6F14\u793A\u6570\u636E\uFF08\u5207\u6362\u524D\u6570\u636E\u5DF2\u5907\u4EFD\u5230 snapshot\uFF09"
        });
      } catch (err) {
        throw new Error(`\u5207\u6362\u5931\u8D25\uFF0C\u6570\u636E\u672A\u53D8\u66F4\uFF1A${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }));
  ctx.tools.register(defineTool9({
    name: "ecommerce_reset_demo",
    description: "\u4E00\u952E\u91CD\u7F6E\u5E97\u94FA\u6570\u636E\u4E3A\u6F14\u793A\u6570\u636E\uFF08\u793A\u4F8B\u79CD\u5B50 26 \u5546\u54C1 / 480 \u8BA2\u5355\uFF09\u3002\u91CD\u7F6E\u524D\u81EA\u52A8\u5907\u4EFD\u5F53\u524D\u6570\u636E\u5FEB\u7167\uFF0C\u9632\u8BEF\u64CD\u4F5C\u3002",
    parameters: {},
    output: {
      schema: {
        type: "object",
        additionalProperties: true,
        properties: {
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
          text: `\u5DF2\u91CD\u7F6E\u4E3A\u6F14\u793A\u6570\u636E\uFF1A${v.products} \u4EF6\u5546\u54C1\u3001${v.orders} \u7B14\u8BA2\u5355\u3002${v.hint ?? ""}`
        }];
      }
    },
    async execute() {
      const result = await store.resetToDemo();
      return asJsonObject({
        ...result,
        hint: "\u91CD\u7F6E\u524D\u6570\u636E\u5DF2\u5907\u4EFD\u5230 snapshot \u5B57\u6BB5\uFF0C\u53EF\u7528 ecommerce_import_backup \u6062\u590D"
      });
    }
  }));
}
function modeText(mode) {
  switch (mode) {
    case "demo":
      return "\u6F14\u793A\u6570\u636E";
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

// src/skills.ts
import { existsSync as existsSync2, readFileSync as readFileSync3, readdirSync } from "node:fs";
import { dirname as dirname3, join as join2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var MODULE_DIR2 = dirname3(fileURLToPath2(import.meta.url));
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
  for (const candidate of [join2(MODULE_DIR2, "skills"), join2(MODULE_DIR2, "..", "skills")]) {
    if (existsSync2(join2(candidate, "keyword-research", "SKILL.md"))) return candidate;
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
        const md = join2(skillsDir, entry.name, "SKILL.md");
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
  const resolved = {
    platform: { ...defaultConfig.platform, ...config.platform },
    storage: { ...defaultConfig.storage, ...config.storage },
    inventory: { ...defaultConfig.inventory, ...config.inventory }
  };
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
  if (store.sourceMode === "mock") {
    console.log("[ecommerce-analyst] \u5DF2\u542F\u52A8\uFF1A\u793A\u4F8B\u6570\u636E\u6A21\u5F0F\uFF08\u914D\u7F6E\u7535\u5546\u5E73\u53F0 API \u53EF\u5207\u6362\u771F\u5B9E\u6570\u636E\uFF09");
  } else {
    console.log(`[ecommerce-analyst] \u5DF2\u542F\u52A8\uFF1A\u5BF9\u63A5\u5E73\u53F0 API\uFF08${adapter.name}\uFF09`);
  }
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
    const disposeApi = registerShopApi(webServer, store, ctx);
    ctx.effect(() => disposeApi, "ecommerce: shop api routes");
    const disposeBase = injectApiBase(webServer);
    if (disposeBase !== void 0) {
      ctx.effect(() => disposeBase, "ecommerce: api base injection");
    }
  }
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
export {
  apply,
  inject,
  name
};
