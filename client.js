window.__ModuleLoader__.load({
  id: "ecommerce-analyst-plugin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var React4 = __toESM(require("react"), 1);

// src/client/ShopDeskPanel.tsx
var React2 = __toESM(require("react"), 1);

// src/client/data.ts
function resolveApiBase() {
  if (typeof window === "undefined") return null;
  const injected2 = window.__ECOM_API_BASE__;
  if (typeof injected2 === "string" && injected2) return injected2.replace(/\/$/, "");
  const proto = window.location?.protocol;
  if (proto === "http:" || proto === "https:") return window.location.origin;
  return null;
}
function toBase64(bytes) {
  let bin = "";
  const chunk = 32768;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}
async function importLocalFiles(files) {
  const items = await Promise.all(
    files.map(async (file) => {
      const ext = (file.name.split(".").pop() ?? "").toLowerCase();
      const isText = ["csv", "txt", "json", "sql"].includes(ext);
      let content;
      let encoding;
      if (isText) {
        content = await file.text();
        encoding = "utf8";
      } else {
        const bytes = new Uint8Array(await file.arrayBuffer());
        content = toBase64(bytes);
        encoding = "base64";
      }
      return { filename: file.name, content, encoding };
    })
  );
  const base = resolveApiBase();
  const url = (base ? base : "") + "/ecommerce-api/import-batch";
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      cache: "no-store",
      body: JSON.stringify({ files: items })
    });
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || body === null || body.ok !== true || body.value === void 0) {
    const message = body?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }
  return body.value;
}
function dataCenterUrl() {
  const base = resolveApiBase();
  return (base ? base : "") + "/ecommerce-api/data-center?v=20260904-r18";
}
function exportData(type = "csv", scope = "all") {
  if (typeof window === "undefined") return;
  const base = resolveApiBase();
  const url = (base ? base : "") + `/ecommerce-api/export?type=${type}&scope=${scope}`;
  window.open(url, "_blank");
}

// src/client/cockpit-bus.ts
var cockpitOpen = false;
var cockpitEverOpened = false;
var subscribers = /* @__PURE__ */ new Set();
var openedSubscribers = /* @__PURE__ */ new Set();
function markOpened() {
  if (cockpitEverOpened) return;
  cockpitEverOpened = true;
  for (const fn of openedSubscribers) {
    try {
      fn();
    } catch {
    }
  }
}
function syncDockVisibility(open) {
  if (typeof document === "undefined") return;
  document.body?.classList.toggle("esd-cockpit-open", open);
}
function toggleCockpit() {
  cockpitOpen = !cockpitOpen;
  if (cockpitOpen) markOpened();
  else resetFullscreen();
  syncDockVisibility(cockpitOpen);
  notify(cockpitOpen);
}
function isCockpitOpen() {
  return cockpitOpen;
}
function subscribeCockpit(fn) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}
function notify(open) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("ecommerce:cockpit-toggle", { detail: { open } })
    );
  }
  for (const fn of subscribers) {
    try {
      fn(open);
    } catch {
    }
  }
}
var conversationSender = null;
var clientCtx = null;
function setClientContext(ctx) {
  clientCtx = ctx;
}
function registerConversationSender(sender) {
  conversationSender = sender;
}
function setNativeValue(el, value) {
  const proto = Object.getPrototypeOf(el);
  const desc = Object.getOwnPropertyDescriptor(proto, "value");
  if (desc?.set !== void 0) {
    desc.set.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}
function findComposerTextarea() {
  if (typeof document === "undefined") return null;
  const tas = Array.from(document.querySelectorAll("textarea"));
  if (tas.length === 0) return null;
  const byPlaceholder = tas.find((t) => {
    const ph = (t.getAttribute("placeholder") ?? "").toLowerCase();
    return ph.includes("\u63CF\u8FF0") || ph.includes("\u8F93\u5165") || ph.includes("message") || ph.includes("prompt") || ph.includes("\u95EE");
  });
  if (byPlaceholder !== void 0) return byPlaceholder;
  return tas[0];
}
function insertIntoComposer(text) {
  const ta = findComposerTextarea();
  if (ta === null) return false;
  try {
    setNativeValue(ta, text);
    ta.focus();
    return true;
  } catch {
    return false;
  }
}
function sendViaSessionScope(text) {
  if (clientCtx === null || typeof clientCtx.get !== "function") return false;
  try {
    const sessions = clientCtx.get("sessions");
    const currentId = sessions?.list?.getSnapshot?.()?.current;
    if (currentId !== void 0 && currentId !== null && typeof sessions?.scope === "function") {
      const scoped = sessions.scope(currentId);
      const conv = scoped?.conversation ?? (typeof scoped?.get === "function" ? scoped.get("conversation") : void 0);
      if (conv !== void 0 && typeof conv.send === "function") {
        void conv.send(text);
        return true;
      }
    }
  } catch (err) {
    console.error("[ecommerce-analyst] session scope \u53D1\u9001\u5931\u8D25\uFF1A", err);
  }
  return false;
}
function sendToConversation(text) {
  if (insertIntoComposer(text)) {
    return { sent: true };
  }
  if (sendViaSessionScope(text)) {
    return { sent: true };
  }
  if (conversationSender !== null) {
    try {
      conversationSender(text);
      return { sent: true };
    } catch (err) {
      console.error("[ecommerce-analyst] \u53D1\u9001\u4F1A\u8BDD\u6307\u4EE4\u5931\u8D25\uFF1A", err);
    }
  }
  if (typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function") {
    navigator.clipboard.writeText(text).catch(() => {
    });
  }
  return { sent: false };
}
function appendToConversation(text) {
  if (typeof document !== "undefined") {
    const ta = findComposerTextarea();
    if (ta !== null) {
      try {
        const cur = ta.value ?? "";
        const sep = cur.trim() === "" ? "" : "\n";
        setNativeValue(ta, cur + sep + text);
        ta.focus();
        return { sent: true };
      } catch {
      }
    }
  }
  return sendToConversation(text);
}
function getSessions() {
  if (clientCtx === null || typeof clientCtx.get !== "function") return null;
  try {
    return clientCtx.get("sessions") ?? null;
  } catch {
    return null;
  }
}
function currentSessionCwd(sessions) {
  try {
    const snap = sessions.list?.getSnapshot?.();
    const cur = snap?.current;
    if (cur !== null && cur !== void 0 && snap?.byId !== void 0) {
      const cwd = snap.byId[cur]?.cwd;
      if (typeof cwd === "string" && cwd !== "") return cwd;
    }
  } catch {
  }
  return void 0;
}
function currentWorkspaceId(sessions) {
  try {
    if (clientCtx === null || typeof clientCtx.get !== "function") return void 0;
    const workspaces = clientCtx.get("workspaces");
    const wsSnap = workspaces?.list?.getSnapshot?.();
    const items = wsSnap?.items ?? [];
    if (items.length === 0) return void 0;
    const sessionsSnap = sessions.list?.getSnapshot?.();
    const current = sessionsSnap?.current;
    if (current !== null && current !== void 0) {
      const byMember = items.find((w) => (w.sessionIds ?? []).includes(current))?.workspaceId;
      if (byMember !== void 0) return byMember;
      const cwd = sessionsSnap?.byId?.[current]?.cwd;
      if (typeof cwd === "string" && cwd !== "") {
        const byPath = items.find((w) => w.path === cwd)?.workspaceId;
        if (byPath !== void 0) return byPath;
      }
    }
    const recent = wsSnap?.recentWorkspaceId;
    if (typeof recent === "string" && recent !== "") return recent;
  } catch {
  }
  return void 0;
}
async function createSessionInCurrentGroup(sessions) {
  try {
    if (typeof sessions.create !== "function") return null;
    const workspaceId = currentWorkspaceId(sessions);
    const cwd = workspaceId === void 0 ? currentSessionCwd(sessions) : void 0;
    const opts = workspaceId !== void 0 ? { workspaceId } : cwd !== void 0 ? { cwd } : {};
    const id = await sessions.create(opts);
    if (typeof id !== "string" || id === "") return null;
    if (typeof sessions.open === "function") sessions.open(id);
    return id;
  } catch (err) {
    console.error("[ecommerce-analyst] \u65B0\u5EFA\u4F1A\u8BDD\u5931\u8D25\uFF1A", err);
    return null;
  }
}
async function sendToSession(sessions, id, text) {
  try {
    if (typeof sessions.scope !== "function") return false;
    const scoped = sessions.scope(id);
    const conversation = scoped?.conversation;
    if (conversation === void 0 || typeof conversation.send !== "function") return false;
    await conversation.send(text);
    return true;
  } catch (err) {
    console.error("[ecommerce-analyst] \u4F1A\u8BDD\u53D1\u9001\u5931\u8D25\uFF1A", err);
    return false;
  }
}
var linkWarnSessionId = null;
async function openNewConversation(text) {
  const sessions = getSessions();
  if (sessions === null) {
    const r2 = sendToConversation(text);
    return { opened: r2.sent, newSession: false };
  }
  let id = linkWarnSessionId;
  let stillExists = false;
  try {
    const snap = sessions.list?.getSnapshot?.();
    stillExists = id !== null && snap?.byId !== void 0 && Object.prototype.hasOwnProperty.call(snap.byId, id);
  } catch {
  }
  let newSession = false;
  if (!stillExists) {
    id = await createSessionInCurrentGroup(sessions);
    newSession = id !== null;
    if (id !== null) linkWarnSessionId = id;
  } else if (id !== null && typeof sessions.open === "function") {
    sessions.open(id);
  }
  if (id === null) {
    const r2 = sendToConversation(text);
    return { opened: r2.sent, newSession: false };
  }
  const sent = await sendToSession(sessions, id, text);
  if (sent) return { opened: true, newSession };
  const r = sendToConversation(text);
  return { opened: r.sent, newSession };
}
var fullscreen = false;
var fullscreenSubscribers = /* @__PURE__ */ new Set();
function isFullscreen() {
  return fullscreen;
}
function toggleFullscreen() {
  fullscreen = !fullscreen;
  for (const fn of fullscreenSubscribers) {
    try {
      fn(fullscreen);
    } catch {
    }
  }
}
function resetFullscreen() {
  if (!fullscreen) return;
  fullscreen = false;
  for (const fn of fullscreenSubscribers) {
    try {
      fn(fullscreen);
    } catch {
    }
  }
}
function subscribeFullscreen(fn) {
  fullscreenSubscribers.add(fn);
  return () => {
    fullscreenSubscribers.delete(fn);
  };
}

// src/client/brand.tsx
var React = __toESM(require("react"), 1);

// src/client/logo.ts
var LOGO_BASE64 = "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";
var LOGO_SRC = "data:image/png;base64," + LOGO_BASE64;

// src/client/brand.tsx
function BrandBadge(props) {
  const size = props.size ?? 22;
  return /* @__PURE__ */ React.createElement(
    "img",
    {
      className: props.className,
      src: LOGO_SRC,
      alt: "\u5065\u8861\u5B66\u56ED",
      width: size,
      height: size,
      style: {
        display: "block",
        borderRadius: "18%",
        objectFit: "contain",
        background: "transparent"
      }
    }
  );
}
function BrandMark(props) {
  const size = props.size ?? 16;
  return /* @__PURE__ */ React.createElement(
    "img",
    {
      className: props.className,
      src: LOGO_SRC,
      alt: "\u5065\u8861\u5B66\u56ED",
      width: size,
      height: size,
      style: {
        display: "block",
        borderRadius: "50%",
        objectFit: "cover",
        background: "transparent"
      }
    }
  );
}
function SkillIconPath(name) {
  switch (name) {
    case "traffic":
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M4 19 L9 13 L13 16 L22 7" }), /* @__PURE__ */ React.createElement("path", { d: "M17 7 H22 V12" }));
    case "competitor":
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M4 8 H22" }), /* @__PURE__ */ React.createElement("path", { d: "M5 8 L8 4 M5 8 L8 12" }), /* @__PURE__ */ React.createElement("path", { d: "M21 8 L18 4 M21 8 L18 12" }));
    case "research":
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "13", cy: "13", r: "8" }), /* @__PURE__ */ React.createElement("path", { d: "M17.5 8.5 L15.5 15.5 L8.5 17.5 L10.5 10.5 Z" }));
    case "keyword":
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "8.5", cy: "8.5", r: "3.5" }), /* @__PURE__ */ React.createElement("path", { d: "M11 11 L20 20" }), /* @__PURE__ */ React.createElement("path", { d: "M16 16 L20 20" }), /* @__PURE__ */ React.createElement("path", { d: "M18 14 L20 16" }));
    case "listing":
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M6 4 H20 V22 H6 Z" }), /* @__PURE__ */ React.createElement("path", { d: "M10 9 H16" }), /* @__PURE__ */ React.createElement("path", { d: "M10 13 H16" }), /* @__PURE__ */ React.createElement("path", { d: "M10 17 H14" }));
    case "market":
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "13", cy: "13", r: "9" }), /* @__PURE__ */ React.createElement("circle", { cx: "13", cy: "13", r: "5" }), /* @__PURE__ */ React.createElement("circle", { cx: "13", cy: "13", r: "1.5" }));
    case "review":
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M5 6 H21 V16 H14 L9 21 V16 H5 Z" }));
    default:
      return /* @__PURE__ */ React.createElement("circle", { cx: "13", cy: "13", r: "8" });
  }
}
function SkillIcon(props) {
  const size = props.size ?? 15;
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      className: "esd-skill-icon-svg",
      viewBox: "0 0 26 26",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      focusable: "false"
    },
    /* @__PURE__ */ React.createElement(SkillIconPath, { name: props.name })
  );
}

// src/client/skills.ts
var SKILL_MODULES = [
  {
    id: "ad-traffic",
    label: "\u5E7F\u544A\u6D41\u91CF",
    icon: "traffic",
    hint: "ACOS / CPC / \u6D41\u91CF\u6765\u6E90 / \u9884\u7B97\u5206\u914D",
    task: "\u5206\u6790\u6D41\u91CF\u7ED3\u6784\uFF08\u81EA\u7136 vs \u5E7F\u544A\uFF09\u4E0E\u5E7F\u544A\u6548\u7387\u6307\u6807\uFF08ACOS\u3001CPC\u3001CTR\u3001CVR\u3001\u5E7F\u544A\u82B1\u8D39\u5360\u6BD4\uFF09\uFF0C\u5B9A\u4F4D\u9AD8\u82B1\u8D39\u4F4E\u8F6C\u5316\u7684\u6D6A\u8D39\u70B9\uFF0C\u5E76\u7ED9\u51FA\u7ADE\u4EF7\u3001\u9884\u7B97\u3001\u7ED3\u6784\u4E0E\u5426\u5B9A\u8BCD\u7684\u4F18\u5316\u5EFA\u8BAE\u3002"
  },
  {
    id: "competitor-analysis",
    label: "\u7ADE\u54C1\u5206\u6790",
    icon: "competitor",
    hint: "\u5BF9\u624B / ASIN / \u5DEE\u5F02\u5316 / SWOT",
    task: "\u5708\u5B9A\u6838\u5FC3\u7ADE\u54C1\uFF0C\u5BF9\u6BD4\u4EF7\u683C\u3001\u8BC4\u5206\u3001\u8BC4\u8BBA\u6570\u3001\u5356\u70B9\u3001\u6D41\u91CF\u4E0E\u5E7F\u544A\u7B56\u7565\uFF0C\u505A SWOT \u4E0E\u5DEE\u5F02\u5316\u5B9A\u4F4D\uFF0C\u5E76\u7ED9\u51FA 1-3 \u4E2A\u53EF\u6253\u7684\u5DEE\u5F02\u70B9\u3002"
  },
  {
    id: "comprehensive-research",
    label: "\u7EFC\u5408\u7814\u7A76",
    icon: "research",
    hint: "\u5168\u65B9\u4F4D\u7EFC\u5408\u5206\u6790",
    task: "\u5BF9\u7814\u7A76\u5BF9\u8C61\u505A\u5E02\u573A\u673A\u4F1A\u3001\u7ADE\u54C1\u3001\u5173\u952E\u8BCD\u3001\u8BC4\u8BBA\u3001\u5E7F\u544A\u3001Listing \u7684\u5168\u65B9\u4F4D\u7EFC\u5408\u5206\u6790\uFF0C\u5148\u7ED9\u4E00\u53E5\u8BDD\u7ED3\u8BBA\uFF0C\u518D\u7ED9\u5173\u952E\u6570\u636E\uFF0C\u6700\u540E\u8F93\u51FA P0/P1/P2 \u53EF\u6267\u884C\u52A8\u4F5C\u3002"
  },
  {
    id: "keyword-research",
    label: "\u5173\u952E\u8BCD\u7814\u7A76",
    icon: "keyword",
    hint: "\u6316\u8BCD / \u9009\u8BCD / ABA",
    task: "\u4ECE\u79CD\u5B50\u8BCD\u6316\u6398\u957F\u5C3E\u8BCD\uFF0C\u8BC4\u4F30\u641C\u7D22\u91CF\u3001\u7ADE\u4E89\u5EA6\u4E0E\u76F8\u5173\u6027\uFF0C\u533A\u5206\u6D41\u91CF\u8BCD\u4E0E\u8F6C\u5316\u8BCD\uFF0C\u4EA7\u51FA Listing \u57CB\u8BCD\u65B9\u6848\u4E0E\u5E7F\u544A\u8BCD\u5206\u7EC4\uFF08\u7CBE\u51C6/\u5E7F\u6CDB/\u5426\u5B9A\uFF09\u3002"
  },
  {
    id: "listing",
    label: "Listing\u4F18\u5316",
    icon: "listing",
    hint: "\u6807\u9898 / \u4E94\u70B9 / \u8F6C\u5316\u7387",
    task: "\u5BF9\u7167\u5173\u952E\u8BCD\u4E0E\u8BC4\u8BBA\u6D1E\u5BDF\uFF0C\u4F18\u5316\u6807\u9898\u3001\u4E94\u70B9\u3001\u63CF\u8FF0\u3001\u56FE\u7247\u4E0E\u540E\u53F0\u5173\u952E\u8BCD\uFF0C\u5B9A\u4F4D\u70B9\u51FB\u7387\u4F4E\u8FD8\u662F\u8F6C\u5316\u7387\u4F4E\uFF0C\u63D0\u5347\u627F\u63A5\u6D41\u91CF\u7684\u80FD\u529B\u3002"
  },
  {
    id: "market-opportunity",
    label: "\u5E02\u573A\u673A\u4F1A",
    icon: "market",
    hint: "\u7C7B\u76EE / \u5BB9\u91CF / \u9009\u54C1",
    task: "\u8BC4\u4F30\u5E02\u573A\u5BB9\u91CF\u3001\u589E\u957F\u8D8B\u52BF\u3001\u4EF7\u683C\u5E26\u5206\u5E03\u3001\u7ADE\u4E89\u96C6\u4E2D\u5EA6\u4E0E\u8FDB\u5165\u95E8\u69DB\uFF0C\u8F93\u51FA\u300C\u8FDB\u5165 / \u8C28\u614E / \u653E\u5F03\u300D\u7684\u5224\u65AD\u4E0E\u5207\u5165\u70B9\u5EFA\u8BAE\u3002"
  },
  {
    id: "review-insight",
    label: "\u8BC4\u8BBA\u6D1E\u5BDF",
    icon: "review",
    hint: "\u597D\u8BC4 / \u5DEE\u8BC4 / \u75DB\u70B9\u5356\u70B9",
    task: "\u4ECE\u7528\u6237\u8BC4\u8BBA\u6316\u6398\u9AD8\u9891\u597D\u8BC4\u5356\u70B9\u3001\u5DEE\u8BC4\u75DB\u70B9\u4E0E\u4F7F\u7528\u573A\u666F\uFF0C\u6309 P0/P1/P2 \u7ED9\u51FA\u53CD\u54FA\u9009\u54C1\u3001Listing \u4E0E\u552E\u540E\u7684\u6539\u8FDB\u52A8\u4F5C\u3002"
  }
];
function skillInvocationToken(skill) {
  return `/${skill.id}`;
}
function valuePromptOf(label, value, note) {
  const lines = [`\u5F53\u524D\u5E97\u94FA\u6570\u636E \xB7 ${label}\uFF1A${value}`];
  if (note !== void 0 && note !== "") lines.push(note);
  lines.push("\u8BF7\u7ED3\u5408\u5E97\u94FA\u6570\u636E\uFF0C\u5BF9\u4E0A\u8FF0\u6307\u6807\u505A\u7B80\u8981\u5206\u6790\u5E76\u7ED9\u51FA\u53EF\u6267\u884C\u5EFA\u8BAE\u3002");
  return lines.join("\n");
}

// src/client/ShopDeskPanel.tsx
var Boundary = class extends React2.Component {
  constructor() {
    super(...arguments);
    __publicField(this, "state", { error: null });
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error !== null) {
      return /* @__PURE__ */ React2.createElement("div", { className: "esd-boundary-error" }, "\u7535\u5546\u6570\u636E\u4E2D\u53F0\u6E32\u67D3\u51FA\u9519\uFF1A", String(this.state.error.message ?? this.state.error));
    }
    return this.props.children;
  }
};
var NARROW_QUERY = "(max-width: 900px)";
function useShopDeskData() {
  const [, force] = React2.useState(0);
  React2.useEffect(() => subscribeCockpit(() => force((n) => n + 1)), []);
  const open = isCockpitOpen();
  const setOpen = React2.useCallback((next) => {
    if (next !== isCockpitOpen()) toggleCockpit();
  }, []);
  const [importing, setImporting] = React2.useState(false);
  const [importMsg, setImportMsg] = React2.useState(null);
  const fileInputRef = React2.useRef(null);
  const dcIframeRef = React2.useRef(null);
  const notifyDcRefresh = React2.useCallback(() => {
    try {
      dcIframeRef.current?.contentWindow?.postMessage({ type: "ecommerce:refresh" }, "*");
    } catch {
    }
  }, []);
  const [, forceFs] = React2.useState(0);
  React2.useEffect(() => subscribeFullscreen(() => forceFs((n) => n + 1)), []);
  const fullscreen2 = isFullscreen();
  const mountedRef = React2.useRef(true);
  React2.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  React2.useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const update = () => {
      if (mq.matches) setOpen(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
    };
  }, [setOpen]);
  const openFilePicker = React2.useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const handleFileChange = React2.useCallback(
    async (event) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = "";
      if (files.length === 0) return;
      setImporting(true);
      setImportMsg(null);
      try {
        const result = await importLocalFiles(files);
        if (!mountedRef.current) return;
        setImportMsg({
          ok: true,
          text: `\u5BFC\u5165\u5B8C\u6210\uFF08${files.length} \u4E2A\u6587\u4EF6\uFF09\uFF1A${result.hint}`
        });
        notifyDcRefresh();
      } catch (err) {
        if (!mountedRef.current) return;
        setImportMsg({
          ok: false,
          text: `\u5BFC\u5165\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`
        });
      } finally {
        if (mountedRef.current) setImporting(false);
      }
    },
    [notifyDcRefresh]
  );
  React2.useEffect(() => {
    const onMessage = (event) => {
      const data = event.data;
      if (data === null || typeof data !== "object") return;
      if (data.type === "ecommerce:analyze-value") {
        const label = typeof data.label === "string" ? data.label : "";
        const value = typeof data.value === "string" ? data.value : "";
        if (label === "" || value === "") return;
        const r = appendToConversation(valuePromptOf(label, value));
        setImportMsg({
          ok: r.sent,
          text: r.sent ? `\u5DF2\u5728\u4F1A\u8BDD\u6846\u8FFD\u52A0\u300C${label}\u300D\uFF1A${value}` : "\u4F1A\u8BDD\u6846\u672A\u8FDE\u63A5\uFF0C\u5DF2\u590D\u5236\u5BF9\u5E94\u6570\u503C\u5230\u526A\u8D34\u677F"
        });
        return;
      }
      if (data.type !== "ecommerce:analyze-link") return;
      const prompt = typeof data.prompt === "string" && data.prompt !== "" ? data.prompt : "";
      if (prompt === "") {
        setImportMsg({ ok: false, text: "\u94FE\u63A5\u9884\u8B66\u5206\u6790\u5931\u8D25\uFF1A\u672A\u6536\u5230\u5206\u6790\u63D0\u793A\u8BCD" });
        return;
      }
      const name = typeof data.linkName === "string" && data.linkName !== "" ? data.linkName : "\u8BE5\u5546\u54C1";
      void openNewConversation(prompt).then((r) => {
        setImportMsg({
          ok: r.opened,
          text: r.newSession ? r.opened ? `\u5DF2\u5728\u5F53\u524D\u4F1A\u8BDD\u5206\u7EC4\u5F00\u542F\u5168\u65B0\u4F1A\u8BDD\u5E76\u53D1\u9001\u94FE\u63A5\u9884\u8B66\u5206\u6790\u6307\u4EE4\uFF1A\u5206\u6790\u300C${name}\u300D` : `\u5DF2\u65B0\u5EFA\u4F1A\u8BDD\uFF0C\u4F46\u53D1\u9001\u5931\u8D25\uFF0C\u5206\u6790\u6307\u4EE4\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\uFF08\u5206\u6790\u300C${name}\u300D\uFF09` : r.opened ? `\u5DF2\u5728\u5F53\u524D\u4F1A\u8BDD\u4E2D\u53D1\u9001\u94FE\u63A5\u9884\u8B66\u5206\u6790\u6307\u4EE4\uFF1A\u5206\u6790\u300C${name}\u300D` : `\u4F1A\u8BDD\u670D\u52A1\u672A\u5C31\u7EEA\uFF0C\u5206\u6790\u6307\u4EE4\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\uFF08\u5206\u6790\u300C${name}\u300D\uFF09`
        });
      });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  const doExport = React2.useCallback((type, scope) => {
    exportData(type, scope);
  }, []);
  const toggleFs = React2.useCallback(() => {
    toggleFullscreen();
  }, []);
  return {
    open,
    importing,
    importMsg,
    setImportMsg,
    fileInputRef,
    dcIframeRef,
    openFilePicker,
    handleFileChange,
    refreshDataCenter: notifyDcRefresh,
    fullscreen: fullscreen2,
    toggleFullscreen: toggleFs,
    doExport
  };
}
function ShopDeskTab() {
  const d = useShopDeskData();
  return /* @__PURE__ */ React2.createElement("div", { className: "esd-root" }, /* @__PURE__ */ React2.createElement(Boundary, null, /* @__PURE__ */ React2.createElement("div", { className: "esd-tab-root" + (d.fullscreen ? " esd-panel-fullscreen" : "") }, /* @__PURE__ */ React2.createElement("div", { className: "esd-tab-toolbar" }, /* @__PURE__ */ React2.createElement("span", { className: "esd-tab-title" }, /* @__PURE__ */ React2.createElement(BrandBadge, { size: 22 }), /* @__PURE__ */ React2.createElement("span", { className: "esd-tab-title-text" }, "\u7535\u5546\u6570\u636E\u4E2D\u53F0")), /* @__PURE__ */ React2.createElement(
    "button",
    {
      type: "button",
      className: "esd-icon-btn",
      title: d.fullscreen ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F\u6D4F\u89C8",
      "aria-label": d.fullscreen ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F\u6D4F\u89C8",
      onClick: d.toggleFullscreen
    },
    d.fullscreen ? "\u{1F5D7}" : "\u26F6"
  ), /* @__PURE__ */ React2.createElement(
    "button",
    {
      type: "button",
      className: "esd-icon-btn",
      title: "\u5BFC\u51FA\u6570\u636E\uFF08CSV\uFF09",
      "aria-label": "\u5BFC\u51FA\u6570\u636E",
      onClick: () => d.doExport("csv", "all")
    },
    "\u2B07"
  ), /* @__PURE__ */ React2.createElement(
    "button",
    {
      type: "button",
      className: "esd-icon-btn",
      title: "\u5BFC\u5165\u672C\u5730\u6570\u636E\uFF08CSV / Excel / SQL / PDF / JSON\uFF09",
      "aria-label": "\u5BFC\u5165\u672C\u5730\u6570\u636E",
      onClick: d.openFilePicker,
      disabled: d.importing
    },
    d.importing ? "\u23F3" : "\u{1F4E5}"
  ), /* @__PURE__ */ React2.createElement(
    "button",
    {
      type: "button",
      className: "esd-icon-btn",
      title: "\u5237\u65B0\u6570\u636E",
      "aria-label": "\u5237\u65B0\u6570\u636E",
      onClick: d.refreshDataCenter
    },
    "\u{1F504}"
  ), /* @__PURE__ */ React2.createElement(
    "input",
    {
      ref: d.fileInputRef,
      type: "file",
      multiple: true,
      accept: ".csv,.txt,.json,.xlsx,.xls,.sql,.pdf",
      style: { display: "none" },
      onChange: (e) => void d.handleFileChange(e)
    }
  )), d.importMsg !== null ? /* @__PURE__ */ React2.createElement("div", { className: "esd-import " + (d.importMsg.ok ? "esd-import-ok" : "esd-import-bad") }, /* @__PURE__ */ React2.createElement("span", { className: "esd-import-msg" }, d.importMsg.text), /* @__PURE__ */ React2.createElement("button", { type: "button", className: "esd-refresh-btn", onClick: () => d.setImportMsg(null) }, "\u5173\u95ED")) : null, /* @__PURE__ */ React2.createElement("div", { className: "esd-dc-frame" }, /* @__PURE__ */ React2.createElement(
    "iframe",
    {
      ref: d.dcIframeRef,
      className: "esd-dc-iframe",
      src: dataCenterUrl(),
      title: "\u7535\u5546\u6570\u636E\u4E2D\u53F0",
      loading: "eager"
    }
  )), /* @__PURE__ */ React2.createElement("footer", { className: "esd-footer" }, /* @__PURE__ */ React2.createElement("span", null, "\u7535\u5546\u6570\u636E\u4E2D\u53F0 \xB7 \u590D\u76D8\u6570\u636E\u5206\u6790\uFF08\u6708\u5EA6 / \u5468\u5EA6 / \u6570\u636E\u5BF9\u6BD4\uFF09")))));
}
function ShopDeskPanel() {
  const d = useShopDeskData();
  return /* @__PURE__ */ React2.createElement("div", { className: "esd-root" }, /* @__PURE__ */ React2.createElement(Boundary, null, d.open ? /* @__PURE__ */ React2.createElement("aside", { className: "esd-panel" + (d.fullscreen ? " esd-panel-fullscreen" : ""), role: "complementary", "aria-label": "\u7535\u5546\u6570\u636E\u4E2D\u53F0" }, /* @__PURE__ */ React2.createElement("header", { className: "esd-header" }, /* @__PURE__ */ React2.createElement("span", { className: "esd-header-logo" }, /* @__PURE__ */ React2.createElement(BrandBadge, { size: 24 })), /* @__PURE__ */ React2.createElement("h3", { className: "esd-header-title" }, "\u7535\u5546\u6570\u636E\u4E2D\u53F0"), /* @__PURE__ */ React2.createElement(
    "button",
    {
      type: "button",
      className: "esd-icon-btn",
      title: d.fullscreen ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F\u6D4F\u89C8",
      "aria-label": d.fullscreen ? "\u9000\u51FA\u5168\u5C4F" : "\u5168\u5C4F\u6D4F\u89C8",
      onClick: d.toggleFullscreen
    },
    d.fullscreen ? "\u{1F5D7}" : "\u26F6"
  ), /* @__PURE__ */ React2.createElement(
    "button",
    {
      type: "button",
      className: "esd-icon-btn",
      title: "\u5BFC\u51FA\u6570\u636E\uFF08CSV\uFF09",
      "aria-label": "\u5BFC\u51FA\u6570\u636E",
      onClick: () => d.doExport("csv", "all")
    },
    "\u2B07"
  ), /* @__PURE__ */ React2.createElement(
    "button",
    {
      type: "button",
      className: "esd-icon-btn",
      title: "\u5BFC\u5165\u672C\u5730\u6570\u636E\uFF08CSV / Excel / SQL / PDF / JSON\uFF09",
      "aria-label": "\u5BFC\u5165\u672C\u5730\u6570\u636E",
      onClick: d.openFilePicker,
      disabled: d.importing
    },
    d.importing ? "\u23F3" : "\u{1F4E5}"
  ), /* @__PURE__ */ React2.createElement("button", { type: "button", className: "esd-icon-btn", title: "\u5237\u65B0\u6570\u636E", "aria-label": "\u5237\u65B0\u6570\u636E", onClick: d.refreshDataCenter }, "\u{1F504}"), /* @__PURE__ */ React2.createElement(
    "input",
    {
      ref: d.fileInputRef,
      type: "file",
      multiple: true,
      accept: ".csv,.txt,.json,.xlsx,.xls,.sql,.pdf",
      style: { display: "none" },
      onChange: (e) => void d.handleFileChange(e)
    }
  )), d.importMsg !== null ? /* @__PURE__ */ React2.createElement("div", { className: "esd-import " + (d.importMsg.ok ? "esd-import-ok" : "esd-import-bad") }, /* @__PURE__ */ React2.createElement("span", { className: "esd-import-msg" }, d.importMsg.text), /* @__PURE__ */ React2.createElement(
    "button",
    {
      type: "button",
      className: "esd-refresh-btn",
      onClick: () => d.setImportMsg(null)
    },
    "\u5173\u95ED"
  )) : null, /* @__PURE__ */ React2.createElement("div", { className: "esd-dc-frame" }, /* @__PURE__ */ React2.createElement(
    "iframe",
    {
      ref: d.dcIframeRef,
      className: "esd-dc-iframe",
      src: dataCenterUrl(),
      title: "\u7535\u5546\u6570\u636E\u4E2D\u53F0",
      loading: "eager"
    }
  )), /* @__PURE__ */ React2.createElement("footer", { className: "esd-footer" }, /* @__PURE__ */ React2.createElement("span", null, "\u7535\u5546\u6570\u636E\u4E2D\u53F0 \xB7 \u590D\u76D8\u6570\u636E\u5206\u6790\uFF08\u6708\u5EA6 / \u5468\u5EA6 / \u6570\u636E\u5BF9\u6BD4\uFF09"))) : null));
}

// src/client/SkillBar.tsx
var React3 = __toESM(require("react"), 1);
function SkillBar(props) {
  const variant = props.variant ?? "panel";
  return /* @__PURE__ */ React3.createElement("div", { className: "esd-skillbar" + (variant === "dock" ? " esd-skillbar-dock" : "") }, /* @__PURE__ */ React3.createElement("span", { className: "esd-skillbar-title" }, /* @__PURE__ */ React3.createElement(BrandBadge, { size: 16, className: "esd-skillbar-logo" }), /* @__PURE__ */ React3.createElement("span", { className: "esd-skillbar-name" }, "\u6280\u80FD\u5206\u6790")), SKILL_MODULES.map((s) => /* @__PURE__ */ React3.createElement(
    "button",
    {
      key: s.id,
      type: "button",
      className: "esd-skill-btn",
      title: `${s.label} \xB7 ${s.hint}`,
      "aria-label": `\u8C03\u7528\u300C${s.label}\u300D\u6280\u80FD`,
      onClick: () => props.onInvoke(s)
    },
    /* @__PURE__ */ React3.createElement(SkillIcon, { name: s.icon, size: 15 }),
    /* @__PURE__ */ React3.createElement("span", { className: "esd-skill-label" }, s.label)
  )));
}

// src/client/styles.ts
var CSS = `
.esd-root {
  pointer-events: none;
  font-family: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif);
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #1c1c1e);
  /* \u7EDF\u4E00\u54C1\u724C\u4E3B\u8C03\uFF1A\u767D\u8272 + \u6D45\u7EFF\uFF08\u8986\u76D6 dsh \u9ED8\u8BA4\u4EA4\u4E92\u84DD\uFF09 */
  --esd-accent: #2bb8a3;
  --esd-accent-strong: #16a085;
  --esd-accent-soft: rgba(43, 184, 163, 0.12);
  --esd-accent-soft-2: rgba(43, 184, 163, 0.20);
  --dsw-alias-interactive-primary: var(--esd-accent);
  --dsw-alias-interactive-bg: var(--esd-accent-soft);
  --dsw-alias-interactive-bg-hover: rgba(43, 184, 163, 0.10);
  --dsw-alias-state-success-primary: #16a085;
}

/* \u2500\u2500 \u53F3\u4FA7\u60AC\u6D6E\u5F00\u5173\uFF08\u7AD6\u6392\u80F6\u56CA\uFF0C\u59CB\u7EC8\u53EF\u89C1\uFF09 \u2500\u2500 */
.esd-toggle {
  pointer-events: auto;
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 9400;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 14px 7px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.28));
  border-right: none;
  border-radius: 10px 0 0 10px;
  background: var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-base, #ffffff));
  color: var(--dsw-alias-label-primary, #1c1c1e);
  box-shadow: var(--dsw-shadow-lv1, 0 1px 4px rgba(0,0,0,.10));
  cursor: pointer;
  user-select: none;
  transition: background .15s ease;
}
.esd-toggle:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.10)); }
.esd-toggle-icon { font-size: 18px; line-height: 1; }
.esd-toggle-text {
  writing-mode: vertical-rl;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--dsw-alias-label-secondary, #555);
}
.esd-toggle-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--dsw-alias-state-error-primary, #e5484d);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 17px;
  text-align: center;
  box-shadow: 0 0 0 2px var(--dsw-alias-bg-base, #fff);
}

/* \u2500\u2500 \u9762\u677F\u5BB9\u5668\uFF08\u505C\u9760\u53F3\u4FA7\uFF0C\u63A8\u9001\u4F1A\u8BDD\u5217\uFF0C\u4E0D\u8986\u76D6\u4F1A\u8BDD\u6846\uFF09 \u2500\u2500
   \u6302\u5728 shell.overlay \u5C42\uFF08host \u7EDD\u5BF9\u5B9A\u4F4D inset:0\uFF09\uFF0C\u9762\u677F\u4EE5 absolute \u505C\u9760\u5728\u53F3\u7F18\uFF0C
   \u540C\u65F6\u901A\u8FC7\u4E0B\u65B9\u63A8\u9001\u89C4\u5219\u628A\u4E2D\u95F4\u4F1A\u8BDD\u5217\u5411\u53F3\u8BA9\u51FA\u540C\u7B49\u5BBD\u5EA6\uFF0C\u4E24\u8005\u5E76\u6392\u3001\u4E92\u4E0D\u906E\u6321\u3002
   \u9ED8\u8BA4\u975E\u5168\u5C4F\uFF1A\u6570\u636E\u5C55\u793A\u9762\u79EF \u2248 \u5168\u5C4F\u9762\u677F\u7684 35%\uFF08clamp(320px, 35vw, 640px)\uFF09\u3002
   \u5F00\u542F\u5BB9\u5668\u67E5\u8BE2\uFF0C\u5185\u90E8\u6A21\u5757\u968F\u9762\u677F\u5BBD\u5EA6\u6309\u6BD4\u4F8B\u7F29\u653E\uFF0C\u907F\u514D\u62E5\u6324/\u7F3A\u6F0F\u3002 */
:has(> [data-shell-overlay]) {
  /* \u9762\u677F\u5BBD\u5EA6\u7EDF\u4E00\u53D6\u503C\uFF1A\u505C\u9760\u9762\u677F\u4E0E\u300C\u63A8\u9001\u4F1A\u8BDD\u5217\u300D\u5171\u4EAB\uFF0C\u907F\u514D\u4E24\u5904\u6F02\u79FB\u3002 */
  --esd-panel-width: clamp(320px, 35vw, 640px);
}

.esd-panel {
  pointer-events: auto;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--esd-panel-width, clamp(320px, 35vw, 640px));
  z-index: 1;
  display: flex;
  flex-direction: column;
  background: var(--dsw-alias-bg-base, #ffffff);
  border-left: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.28));
  box-shadow: var(--dsw-shadow-lv3, 0 8px 32px rgba(0,0,0,.20));
  animation: esd-slide-in .18s ease-out;
  container-type: inline-size;
  container-name: esdpanel;
}
@keyframes esd-slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* \u9762\u677F\u6253\u5F00\uFF08\u975E\u5168\u5C4F\uFF09\u65F6\uFF0C\u628A\u4E2D\u95F4\u4F1A\u8BDD\u5217\u5411\u53F3\u8BA9\u51FA\u9762\u677F\u5BBD\u5EA6\uFF0C\u9762\u677F\u505C\u9760\u5728\u8BA9\u51FA\u7684\u7A7A\u95F4\u5185\u3002
   AppFrame \u4E09\u5217 grid \u7684\u76F4\u63A5\u5B50\u8282\u70B9\u987A\u5E8F\u56FA\u5B9A\u4E3A sidebarCol / centerCol / detailsCol /
   overlayLayer\uFF08React Fragment \u4E0D\u4EA7\u751F DOM \u8282\u70B9\uFF09\uFF0C\u6545 centerCol \u6052\u4E3A\u7B2C 2 \u4E2A\u5B50\u5143\u7D20\u3002
   \u4F1A\u8BDD\u5185\u5BB9\u6309 max-width \u5C45\u4E2D\uFF0C\u5411\u53F3 padding \u540E\u6574\u4F53\u5DE6\u79FB\uFF0C\u4E0D\u518D\u88AB\u9762\u677F\u906E\u6321\u3002 */
:has(> [data-shell-overlay]):has(.esd-panel:not(.esd-panel-fullscreen)) > :nth-child(2) {
  padding-right: var(--esd-panel-width, clamp(320px, 35vw, 640px));
  transition: padding-right var(--ds-transition-duration-slow, 200ms) var(--ds-ease-in-out, ease);
}

.esd-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.16));
  flex: none;
}
.esd-header-logo { display: inline-flex; align-items: center; flex: none; line-height: 1; }
.esd-header-title { margin: 0; font-size: 15px; font-weight: 600; flex: 1; display: flex; align-items: center; gap: 8px; }
.esd-header-sub { font-size: 11px; color: var(--dsw-alias-label-tertiary, #999); font-weight: 400; margin-left: 6px; }
.esd-tab-title { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; }
.esd-tab-title-text { display: inline-flex; align-items: center; gap: 6px; }
.esd-icon-btn {
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: var(--esd-accent, #2bb8a3);
  font-size: 15px;
  padding: 4px 6px;
  border-radius: 6px;
  line-height: 1;
  transition: background .15s, border-color .15s, color .15s;
}
.esd-icon-btn:hover { background: var(--esd-accent-soft, rgba(43,184,163,.12)); border-color: var(--esd-accent-soft-2, rgba(43,184,163,.20)); }
.esd-icon-btn:active { background: var(--esd-accent); color: #fff; border-color: var(--esd-accent); }
.esd-refresh-btn {
  border: 1px solid var(--esd-accent, #2bb8a3);
  background: #fff;
  color: var(--esd-accent-strong, #16a085);
  font-size: 12px;
  padding: 3px 9px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s, color .15s, border-color .15s;
}
.esd-refresh-btn:hover { background: var(--esd-accent-soft, rgba(43,184,163,.12)); }
.esd-refresh-btn:active { background: var(--esd-accent); color: #fff; border-color: var(--esd-accent); }

.esd-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.esd-body::-webkit-scrollbar { width: 8px; }
.esd-body::-webkit-scrollbar-thumb {
  background: var(--dsw-alias-scrollbar-bg-l1, rgba(128,128,128,.28));
  border-radius: 4px;
}
.esd-body::-webkit-scrollbar-thumb:hover { background: var(--dsw-alias-scrollbar-hover-l1, rgba(128,128,128,.45)); }

.esd-section {
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.16));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #fafafa);
  overflow: hidden;
  flex: none;
}
.esd-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px 6px;
  font-size: 13px;
  font-weight: 600;
}
.esd-sec-icon { color: var(--esd-accent, #2bb8a3); display: inline-flex; align-items: center; flex: none; line-height: 1; }
.esd-sec-icon-svg { display: block; }
.esd-sec-meta { margin-left: auto; font-size: 11px; font-weight: 400; color: var(--dsw-alias-label-tertiary, #999); }
.esd-section-body { padding: 2px 10px 10px; }

/* \u2500\u2500 \u7ECF\u8425\u603B\u89C8\uFF08\u7CBE\u7B80\u7248\uFF1A\u5220\u9664\u4E0E BI \u6570\u636E\u770B\u677F\u91CD\u590D\u7684 KPI \u5361/\u8D8B\u52BF\u56FE/\u7C7B\u76EE\u5360\u6BD4\uFF09 \u2500\u2500 */
.esd-overview-body { padding: 6px 2px 8px; }
.esd-overview-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-base, #ffffff);
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.12));
}
.esd-overview-label { font-size: 12px; color: var(--dsw-alias-label-secondary, #666); }
.esd-overview-value { font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-primary, #1c1c1e); margin-left: auto; }
.esd-overview-sku { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.esd-overview-hint {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary, #666);
  padding: 0 4px;
}

/* \u539F\u7ECF\u8425\u603B\u89C8\u5361\u7247\u5DF2\u5220\u9664\uFF08\u4E0E BI \u770B\u677F\u91CD\u590D\uFF09\uFF0C\u76F8\u5173\u65E7\u7C7B\u540D\u4FDD\u7559\u517C\u5BB9\uFF0C\u5B9E\u9645\u4E0D\u518D\u6E32\u67D3 */
.esd-stats { display: none; }

/* \u2500\u2500 \u4ECA\u65E5\u5F85\u529E \u2500\u2500 */
.esd-todo-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 9px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}
.esd-todo-row:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.08)); }
.esd-todo-row.esd-overdue {
  background: rgba(229, 72, 77, 0.08);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 8%, transparent);
  border-color: rgba(229, 72, 77, 0.35);
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 32%, transparent);
}
.esd-todo-icon { font-size: 15px; }
.esd-todo-label { flex: 1; font-size: 13px; }
.esd-todo-count {
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
  background: var(--dsw-alias-bg-layer-2, #ececec);
  color: var(--dsw-alias-label-secondary, #555);
  font-variant-numeric: tabular-nums;
}
.esd-todo-count.esd-danger-count { background: var(--dsw-alias-state-error-primary, #e5484d); color: #fff; }
.esd-todo-chevron { font-size: 10px; color: var(--dsw-alias-label-tertiary, #aaa); }

.esd-overdue-list { display: flex; flex-direction: column; gap: 3px; padding: 0 4px 6px; }
.esd-overdue-item {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #555);
  padding: 4px 7px;
  border-radius: 6px;
}
.esd-overdue-item:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.08)); }
.esd-overdue-id { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; color: var(--dsw-alias-label-primary, #1c1c1e); }
.esd-overdue-buyer { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90px; }
.esd-overdue-amount { margin-left: auto; font-variant-numeric: tabular-nums; color: var(--dsw-alias-state-error-primary, #e5484d); }

/* \u2500\u2500 \u5546\u54C1\u5206\u7C7B\u6811 \u2500\u2500 */
.esd-cat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
.esd-cat:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.08)); }
.esd-cat.esd-cat-active {
  background: var(--dsw-alias-interactive-bg-active, rgba(0,0,0,.07));
  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2, rgba(128,128,128,.4));
}
.esd-cat-icon { font-size: 14px; }
.esd-cat-count { margin-left: auto; font-size: 11px; color: var(--dsw-alias-label-tertiary, #999); font-variant-numeric: tabular-nums; }
.esd-cat-revenue { font-size: 11px; color: var(--dsw-alias-label-tertiary, #999); margin-left: 8px; font-variant-numeric: tabular-nums; }

.esd-product-list { display: flex; flex-direction: column; gap: 4px; padding: 2px 2px 4px; }
.esd-product {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 12px;
}
.esd-product:nth-child(odd) { background: var(--dsw-alias-bg-layer-1, #f4f4f4); }
.esd-product-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.esd-product-price { color: var(--dsw-alias-label-secondary, #666); font-variant-numeric: tabular-nums; }
.esd-product-stock { color: var(--dsw-alias-label-secondary, #888); font-size: 11px; }
.esd-chip { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; line-height: 15px; }
.esd-chip-on { background: rgba(48, 164, 108, 0.16); color: #1f8a56; }
.esd-chip-off { background: var(--dsw-alias-bg-layer-2, #e8e8e8); color: var(--dsw-alias-label-secondary, #777); }

/* \u2500\u2500 \u9500\u552E\u6392\u884C TOP5 \u2500\u2500 */
.esd-top-item { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 6px; font-size: 12px; }
.esd-top-item:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.08)); }
.esd-rank {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: var(--dsw-alias-bg-layer-2, #e8e8e8);
  color: var(--dsw-alias-label-secondary, #666);
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  line-height: 18px;
  flex: none;
}
.esd-rank-1 { background: rgba(245, 165, 36, 0.25); color: #b45309; }
.esd-rank-2 { background: rgba(245, 165, 36, 0.16); color: #b45309; }
.esd-rank-3 { background: rgba(245, 165, 36, 0.10); color: #b45309; }
.esd-top-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.esd-top-revenue { font-weight: 600; font-variant-numeric: tabular-nums; }
.esd-top-units { color: var(--dsw-alias-label-tertiary, #999); font-size: 11px; }

/* \u2500\u2500 \u4F4E\u5E93\u5B58\u6E05\u5355 \u2500\u2500 */
.esd-low-item { display: flex; gap: 8px; align-items: center; padding: 6px 8px; border-radius: 6px; font-size: 12px; }
.esd-low-item:nth-child(odd) { background: var(--dsw-alias-bg-layer-1, #f4f4f4); }
.esd-low-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.esd-low-sku { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; color: var(--dsw-alias-label-tertiary, #999); }
.esd-low-stock { font-variant-numeric: tabular-nums; font-weight: 600; }
.esd-low-stock.esd-zero { color: var(--dsw-alias-state-error-primary, #e5484d); }
.esd-low-threshold { color: var(--dsw-alias-label-tertiary, #999); font-size: 11px; }

/* \u2500\u2500 \u672C\u5730\u6587\u4EF6\u5BFC\u5165\u72B6\u6001\u6761 \u2500\u2500 */
.esd-import {
  margin: 8px 12px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
  word-break: break-all;
}
.esd-import .esd-import-msg { flex: 1; }
.esd-import-ok {
  border: 1px solid rgba(48, 164, 108, 0.4);
  background: rgba(48, 164, 108, 0.08);
  color: var(--dsw-alias-state-success-primary, #1f8a56);
}
.esd-import-bad {
  border: 1px solid var(--dsw-alias-state-error-primary, #e5484d);
  background: rgba(229, 72, 77, 0.06);
  color: var(--dsw-alias-state-error-primary, #e5484d);
}

/* \u2500\u2500 \u72B6\u6001 \u2500\u2500 */
.esd-loading { padding: 26px 0; text-align: center; color: var(--dsw-alias-label-tertiary, #999); font-size: 12px; }
.esd-empty { padding: 12px 0; text-align: center; color: var(--dsw-alias-label-tertiary, #999); font-size: 12px; }
.esd-error {
  margin: 8px 12px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-state-error-primary, #e5484d);
  background: rgba(229, 72, 77, 0.06);
  color: var(--dsw-alias-state-error-primary, #e5484d);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}
.esd-error .esd-error-msg { flex: 1; word-break: break-all; }
.esd-footer {
  padding: 8px 12px;
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.16));
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #999);
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}
.esd-footer .esd-footer-dot { font-size: 10px; }
.esd-dot-mock { color: var(--dsw-alias-state-warn-primary, #f5a524); }
.esd-dot-rest { color: var(--dsw-alias-state-success-primary, #30a46c); }
.esd-boundary-error { padding: 12px; font-size: 12px; color: var(--dsw-alias-state-error-primary, #e5484d); }

/* \u2500\u2500 \u7ECF\u8425\u603B\u89C8\uFF1A30 \u5929\u8D8B\u52BF\u8FF7\u4F60\u56FE + \u7C7B\u76EE\u5360\u6BD4\u5E76\u6392\u653E\u7F6E\uFF08\u5404 50%\uFF09 \u2500\u2500 */
.esd-chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
.esd-chart-cell { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.esd-chart-title { font-size: 11px; font-weight: 500; color: var(--dsw-alias-label-tertiary, #999); }
.esd-trend { margin: 0; flex: 1; display: flex; align-items: stretch; }
.esd-trend-svg { width: 100%; height: 90px; display: block; }

/* \u2500\u2500 \u5546\u54C1\u5206\u7C7B\uFF1A\u7C7B\u76EE\u5360\u6BD4\u7D27\u51D1\u6A2A\u6761\uFF08\u4E0E\u8D8B\u52BF\u56FE\u5E76\u6392\uFF09 \u2500\u2500 */
.esd-cat-bars-compact { display: flex; flex-direction: column; gap: 6px; padding: 2px 0; flex: 1; justify-content: center; }
.esd-cat-bar-row { display: flex; align-items: center; gap: 5px; }
.esd-cat-bar-name { width: 40px; flex: none; font-size: 11px; color: var(--dsw-alias-label-secondary, #555); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.esd-cat-bar-track { flex: 1; height: 10px; background: rgba(128,128,128,.12); border-radius: 5px; overflow: hidden; min-width: 0; }
.esd-cat-bar-fill { height: 100%; border-radius: 5px; transition: width .4s ease-out; }
.esd-cat-bar-val { width: 34px; flex: none; text-align: right; font-size: 10px; color: var(--dsw-alias-label-secondary, #666); font-variant-numeric: tabular-nums; }

/* \u2500\u2500 \u6570\u636E\u6E90\u6807\u7B7E\uFF08\u6F14\u793A\u6570\u636E / \u5BFC\u5165\u6570\u636E / \u5E73\u53F0 API\uFF09 \u2500\u2500 */
.esd-mode-row { display: flex; gap: 6px; margin-bottom: 8px; }
.esd-mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 4px;
  font-size: 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.25));
  border-radius: 8px;
  background: var(--dsw-alias-bg-base, #fff);
  color: var(--dsw-alias-label-primary, #1c1c1e);
  cursor: pointer;
  user-select: none;
  transition: all .12s ease;
}
.esd-mode-btn:hover:not(:disabled) { border-color: var(--esd-accent, #2bb8a3); }
.esd-mode-active {
  border-color: var(--esd-accent, #2bb8a3);
  background: var(--esd-accent, #2bb8a3);
  color: #ffffff;
  font-weight: 600;
}
.esd-mode-disabled { opacity: .45; cursor: not-allowed; }
.esd-mode-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.esd-mode-link {
  padding: 5px 10px;
  font-size: 12px;
  border: 1px solid var(--esd-accent, #2bb8a3);
  border-radius: 7px;
  background: #fff;
  color: var(--esd-accent-strong, #16a085);
  cursor: pointer;
  user-select: none;
  transition: background .15s, color .15s, border-color .15s;
}
.esd-mode-link:hover:not(:disabled) { background: var(--esd-accent-soft, rgba(43,184,163,.12)); }
.esd-mode-link:active:not(:disabled) { background: var(--esd-accent); color: #fff; border-color: var(--esd-accent); }
.esd-mode-link:disabled { opacity: .5; cursor: not-allowed; }

/* === \u4E2D\u592E\u9876\u90E8 dock \u6309\u94AE\uFF08\u4E0E cockpit \u300C\u884C\u52A8\u6E05\u5355\u300D \u540C\u6B3E\u98CE\u683C\uFF09 === */
.esd-dock-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  background: var(--dsw-alias-bg-elevated, #ffffff);
  color: var(--dsw-alias-label-primary, #1c1c1e);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: background .15s, border-color .15s, color .15s;
}
.esd-dock-btn:hover { background: var(--esd-accent-soft, rgba(43,184,163,.10)); }
.esd-dock-btn-active {
  background: var(--esd-accent, #2bb8a3);
  border-color: var(--esd-accent, #2bb8a3);
  color: #ffffff;
}
.esd-dock-btn-icon { font-size: 14px; line-height: 1; }
.esd-dock-btn-text { font-weight: 500; }

/* === \u4FA7\u8FB9\u680F\u5E95\u90E8\u5165\u53E3\uFF08\u63D2\u4EF6\u542F\u52A8\u6309\u952E\uFF1A\u767D\u5E95\u7EFF\u7EBF / \u7EFF\u5E95\u767D\u7EBF\uFF09 === */
.esd-footer-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid var(--esd-accent, #2bb8a3);
  background: #ffffff;
  color: var(--esd-accent, #2bb8a3);
  font-size: 16px;
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;
}
.esd-footer-btn:hover { background: var(--esd-accent-soft, rgba(43,184,163,.14)); }
.esd-footer-btn-active {
  background: var(--esd-accent, #2bb8a3);
  border-color: var(--esd-accent, #2bb8a3);
  color: #ffffff;
  box-shadow: 0 0 0 3px var(--esd-accent-soft, rgba(43,184,163,.22));
}

/* === \u5168\u5C4F\u6A21\u5F0F === */
.esd-panel-fullscreen {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  border-radius: 0 !important;
  z-index: 9999 !important;
  overflow: hidden !important;
}

/* === \u5168\u5C4F\u300C\u7535\u5546\u6570\u636E\u4E2D\u53F0\u300Diframe\uFF08\u66FF\u6362\u4FEE\u6539\u7248 HTML \u9762\u677F\uFF09 === */
.esd-dc-frame {
  flex: 1;
  min-height: 0;
  position: relative;
  background: #e8f3f1;
}
.esd-dc-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background: #e8f3f1;
}

/* === BI \u6570\u636E\u770B\u677F\uFF08\u7EDF\u4E00\u5B57\u53F7\u9636\u68AF + \u6A2A\u6761\u5F62 bar\uFF09 === */
/* \u5B57\u53F7\u9636\u68AF\uFF1AKPI\u6807\u9898 13 / KPI\u6570\u503C 26 / \u5361\u7247\u6807\u9898 15 / bar \u540D 14 / bar \u6570\u5B57 14 / bar \u8F85 12 */

.esd-bi { display: flex; flex-direction: column; gap: 12px; }
.esd-bi-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.esd-bi-kpi-card {
  background: var(--dsw-alias-bg-elevated, #ffffff);
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  border-radius: 10px;
  padding: 14px 16px 12px;
  transition: transform .2s, box-shadow .2s;
}
.esd-bi-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,.06); }
.esd-bi-kpi-title { font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-tertiary, #888); margin-bottom: 6px; }
.esd-bi-kpi-value { font-size: 24px; font-weight: 700; color: var(--dsw-alias-label-primary, #1a1a1a); line-height: 1.1; letter-spacing: -0.3px; }
.esd-bi-kpi-sub { font-size: 12px; margin-top: 6px; color: var(--dsw-alias-label-tertiary, #999); }
.esd-bi-kpi-sub.up { color: #e5484d; }
.esd-bi-kpi-sub.down { color: #22b573; }

/* \u7F51\u683C\u5217\u5BBD\uFF1A1 : 1 \u7B49\u5BBD\uFF08\u4E24\u4E2A\u56FE\u90FD\u5360\u6EE1\uFF0C\u66F4\u534F\u8C03\uFF09 */
.esd-bi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.esd-bi-card {
  background: var(--dsw-alias-bg-elevated, #ffffff);
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  border-radius: 10px;
  padding: 18px;
}
.esd-bi-card-title { font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary, #333); margin-bottom: 14px; }
.esd-bi-empty { font-size: 12px; color: var(--dsw-alias-label-tertiary, #999); padding: 14px 0; text-align: center; }

/* \u8D8B\u52BF\u6298\u7EBF\uFF08\u5145\u5206\u5C55\u793A\uFF0C150px\uFF09 */
.esd-bi-chart { display: flex; flex-direction: column; gap: 6px; }
.esd-bi-svg { width: 100%; height: 150px; display: block; }
.esd-bi-chart-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--dsw-alias-label-tertiary, #999); }

/* === \u6A2A\u6761\u5F62 bar\uFF08\u7C7B\u76EE\u5360\u6BD4 + TOP \u6392\u884C\uFF0C\u52A0\u5927\u5C3A\u5BF8\u589E\u5F3A\u89C2\u611F\uFF09 === */
.esd-bi-bar { display: flex; flex-direction: column; gap: 20px; padding: 4px 0 6px; }
.esd-bi-bar-row { display: flex; align-items: center; gap: 12px; }
.esd-bi-bar-name {
  width: 96px;
  flex: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #555);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.esd-bi-bar-track {
  flex: 1;
  height: 22px;
  background: var(--dsw-alias-bg-subtle, #f0f2f5);
  border-radius: 11px;
  overflow: hidden;
}
.esd-bi-bar-fill {
  height: 100%;
  border-radius: 11px;
  transition: width .5s ease-out;
}
.esd-bi-bar-val {
  width: 96px;
  flex: none;
  text-align: right;
  font-size: 14px;
  font-weight: 700;
  color: var(--dsw-alias-label-primary, #333);
  font-variant-numeric: tabular-nums;
}

/* \u5E93\u5B58\u5065\u5EB7\u5EA6 */
.esd-bi-stock { display: flex; flex-direction: column; gap: 8px; }
.esd-bi-stock-line { display: flex; justify-content: space-between; font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-secondary, #555); }
.esd-bi-stock-line em { font-style: normal; font-weight: 700; color: #e5484d; }
.esd-bi-stock-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #333);
  padding: 4px 0;
}
.esd-bi-stock-row span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.esd-bi-stock-num {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin-left: 10px;
  flex: none;
  color: #e5484d;
}

/* === \u5546\u54C1\u7BA1\u7406 === */
.esd-pm { display: flex; flex-direction: column; gap: 10px; }
.esd-pm-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.esd-pm-search {
  flex: 1;
  min-width: 140px;
  height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  background: var(--dsw-alias-bg-elevated, #fff);
  color: var(--dsw-alias-label-primary, #1c1c1e);
  font-size: 12px;
}
.esd-pm-search:focus { outline: none; border-color: var(--dsw-alias-interactive-primary, #4f7cff); }
.esd-bi-btn {
  height: 30px;
  padding: 0 12px;
  border-radius: 7px;
  border: 1px solid var(--esd-accent, #2bb8a3);
  background: #fff;
  color: var(--esd-accent-strong, #16a085);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, border-color .15s, color .15s;
}
.esd-bi-btn:hover:not(:disabled) { background: var(--esd-accent-soft, rgba(43,184,163,.12)); }
.esd-bi-btn:disabled { opacity: .5; cursor: not-allowed; }
.esd-bi-btn-primary {
  background: var(--esd-accent, #2bb8a3);
  border-color: var(--esd-accent, #2bb8a3);
  color: #fff;
}
.esd-bi-btn-primary:hover:not(:disabled) { background: var(--esd-accent-strong, #16a085); }

.esd-pm-table-wrap { max-height: 380px; overflow: auto; border: 1px solid var(--dsw-alias-border-default, #e5e7eb); border-radius: 8px; }
.esd-pm-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.esd-pm-table thead th {
  position: sticky;
  top: 0;
  background: var(--dsw-alias-bg-subtle, #f7f8fa);
  color: var(--dsw-alias-label-secondary, #666);
  font-weight: 600;
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  white-space: nowrap;
}
.esd-pm-table tbody td { padding: 7px 10px; border-bottom: 1px solid var(--dsw-alias-border-subtle, #f0f2f5); color: var(--dsw-alias-label-primary, #333); }
.esd-pm-table tbody tr:hover { background: var(--dsw-alias-bg-hover, rgba(128,128,128,.05)); }
.esd-pm-table tbody tr.esd-pm-off { opacity: .55; }
.esd-pm-sku { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; color: var(--dsw-alias-label-tertiary, #888); }
.esd-pm-name { color: var(--dsw-alias-interactive-primary, #4f7cff); cursor: pointer; font-weight: 500; }
.esd-pm-name:hover { text-decoration: underline; }
.esd-pm-num { text-align: right; white-space: nowrap; }
.esd-pm-zero { color: #e5484d; font-weight: 700; }
.esd-pm-ops { white-space: nowrap; }
.esd-pm-ops button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  padding: 2px 3px;
  border-radius: 4px;
  line-height: 1;
}
.esd-pm-ops button:hover { background: var(--dsw-alias-bg-hover, rgba(128,128,128,.12)); }

/* \u5546\u54C1\u8868\u5355\u5F39\u7A97 */
.esd-bi-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.esd-bi-modal {
  background: var(--dsw-alias-bg-elevated, #fff);
  border-radius: 12px;
  padding: 20px;
  width: 360px;
  max-width: 92vw;
  box-shadow: 0 12px 40px rgba(0,0,0,.18);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.esd-bi-modal-title { font-size: 16px; font-weight: 600; color: var(--dsw-alias-label-primary, #1a1a1a); }
.esd-bi-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--dsw-alias-label-secondary, #666); }
.esd-bi-field input {
  height: 32px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  background: var(--dsw-alias-bg-elevated, #fff);
  color: var(--dsw-alias-label-primary, #1c1c1e);
  font-size: 13px;
}
.esd-bi-field input:focus { outline: none; border-color: var(--dsw-alias-interactive-primary, #4f7cff); }
.esd-bi-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.esd-bi-form-err { font-size: 12px; color: #e5484d; }
.esd-bi-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }

/* === \u5BFC\u5165\u6570\u636E\u63D0\u793A\u6A2A\u5E45\uFF08\u6570\u636E\u5B8C\u5168\u7531\u5BFC\u5165\u51B3\u5B9A\u65F6\uFF0C\u5F15\u5BFC\u7528\u6237\u5BFC\u5165\uFF09 === */
.esd-import-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff7e6 0%, #fff5d9 100%);
  border: 1px solid #ffd591;
  color: #ad6800;
  font-size: 13px;
  line-height: 1.45;
}
.esd-import-banner-icon { font-size: 18px; line-height: 1; flex: none; }
.esd-import-banner-text { flex: 1; }
.esd-import-banner-text strong { color: #874d00; }
.esd-import-banner-text kbd {
  display: inline-block;
  margin: 0 2px;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid #f0c97a;
  background: #fff;
  color: #ad6800;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 12px;
}

/* \u54CD\u5E94\u5F0F\uFF1A\u7A84\u5C4F KPI 2 \u5217\u3001\u56FE\u8868\u5355\u5217 */
@media (max-width: 900px) {
  .esd-bi-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .esd-bi-grid { grid-template-columns: 1fr; }
}

/* \u2500\u2500 \u5BB9\u5668\u67E5\u8BE2\uFF1A\u9762\u677F\u672C\u8EAB\u53D8\u7A84\u65F6\uFF08\u975E\u5168\u5C4F 35vw / \u79FB\u52A8\u7AEF\uFF09\u6309\u6BD4\u4F8B\u7F29\u653E\u6A21\u5757\uFF0C\u907F\u514D\u62E5\u6324\u4E0E\u7F3A\u6F0F \u2500\u2500 */
@container esdpanel (max-width: 600px) {
  .esd-bi-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .esd-bi-kpi-card { padding: 10px 12px 9px; }
  .esd-bi-kpi-value { font-size: 20px; }
  .esd-bi-grid { grid-template-columns: 1fr; gap: 10px; }
  .esd-bi-card { padding: 14px; }
  .esd-bi-svg { height: 130px; }
  .esd-chart-row { grid-template-columns: 1fr; gap: 8px; }
  .esd-stats { grid-template-columns: 1fr 1fr; }
  .esd-stat-value { font-size: 15px; }
  .esd-section-title { font-size: 12.5px; }
  .esd-body { padding: 10px 10px 14px; gap: 10px; }
}

/* \u5168\u5C4F\u5934\u90E8 Logo \u95F4\u8DDD\u5FAE\u8C03\uFF08\u4E0E\u53C2\u8003\u56FE\u4E00\u81F4\uFF1A\u5DE6\u4E0A\u4E3A\u54C1\u724C\u5FBD\u6807\uFF09 */
.esd-panel-fullscreen .esd-header { padding: 14px 16px; }
.esd-panel-fullscreen .esd-header-logo { flex: none; }

/* === \u6280\u80FD\u6A21\u5757\u6A2A\u5411\u6309\u952E\u6761\uFF087 \u4E2A skill\uFF0C\u5BF9\u8BDD\u6846\u4E0B\u65B9 / \u9762\u677F\u5934\u90E8\u4E0B\u65B9\uFF09 === */
.esd-skillbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 10px;
}
.esd-skillbar-title {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--dsw-alias-label-tertiary, #999);
  letter-spacing: 1px;
  white-space: nowrap;
  flex: none;
}
.esd-skillbar-logo { display: inline-flex; align-items: center; flex: none; }
.esd-skillbar-name { display: inline-flex; align-items: center; }
.esd-skill-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-default, #e5e7eb);
  background: var(--dsw-alias-bg-elevated, #ffffff);
  color: var(--dsw-alias-label-primary, #1c1c1e);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: background .15s, border-color .15s, color .15s, transform .12s ease;
}
.esd-skill-btn:hover {
  background: var(--esd-accent-soft, rgba(43,184,163,.10));
  border-color: var(--esd-accent, #2bb8a3);
  color: var(--esd-accent-strong, #16a085);
  transform: translateY(-1px);
}
.esd-skill-btn:active {
  background: var(--esd-accent, #2bb8a3);
  border-color: var(--esd-accent, #2bb8a3);
  color: #ffffff;
}
.esd-skill-icon-svg { display: inline-flex; align-items: center; flex: none; color: var(--esd-accent, #2bb8a3); }
.esd-skill-label { font-weight: 500; }

/* dock \u5F62\u6001\uFF1A\u7D27\u51D1 + \u53EF\u6A2A\u5411\u6EDA\u52A8\uFF0C\u4E0D\u6491\u7206 composer \u4E0B\u65B9\u6A2A\u6761 */
.esd-skillbar-dock {
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 4px 6px;
  gap: 6px;
}
.esd-skillbar-dock::-webkit-scrollbar { height: 4px; }
.esd-skillbar-dock::-webkit-scrollbar-thumb { background: rgba(128,128,128,.25); border-radius: 2px; }
.esd-skillbar-dock .esd-skill-btn { height: 26px; padding: 0 10px; font-size: 11px; }

/* dock \u6280\u80FD\u6761\u968F\u4FA7\u8FB9\u680F\u5F00\u5173\u663E\u9690\uFF1Abody \u6253\u53EF\u9006\u7684 esd-cockpit-open \u6807\u8BB0\uFF08\u7531 cockpit-bus
   syncDockVisibility \u5728\u6253\u5F00\u65F6\u6DFB\u52A0\u3001\u5173\u95ED\u65F6\u79FB\u9664\uFF09\u3002\u6253\u5F00\u4FA7\u8FB9\u680F\u300C\u547C\u51FA\u300D\u6280\u80FD\u6761\uFF0C\u5173\u95ED\u540E
   \u300C\u5F52\u4F4D\u300D\u56DE\u521D\u59CB\u9690\u85CF\u72B6\u6001\u3002 */
body:not(.esd-cockpit-open) .esd-skillbar-dock { display: none; }

/* === \u53EF\u70B9\u51FB\u89C6\u56FE\uFF08\u70B9\u51FB \u2192 \u4F1A\u8BDD\u6846\u5F39\u51FA\u5BF9\u5E94\u6570\u503C\uFF09 === */
.esd-clickable {
  cursor: pointer;
  border-radius: 8px;
  transition: background .15s ease, box-shadow .15s ease;
}
.esd-clickable:hover {
  background: var(--esd-accent-soft, rgba(43,184,163,.10));
  box-shadow: inset 0 0 0 1px var(--esd-accent-soft-2, rgba(43,184,163,.22));
}
`;
var injected = false;
function injectStyles() {
  if (injected) return;
  injected = true;
  if (typeof document === "undefined") return;
  if (document.getElementById("esd-shop-desk-styles") !== null) return;
  const el = document.createElement("style");
  el.id = "esd-shop-desk-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

// src/client/index.tsx
var inject = ["slots"];
function DataFooterLauncher() {
  const [, force] = React4.useState(0);
  React4.useEffect(() => subscribeCockpit(() => force((n) => n + 1)), []);
  const open = isCockpitOpen();
  return React4.createElement(
    "button",
    {
      type: "button",
      className: "esd-footer-btn" + (open ? " esd-footer-btn-active" : ""),
      title: open ? "\u6536\u8D77\u6570\u636E\u67E5\u770B" : "\u5C55\u5F00\u6570\u636E\u67E5\u770B",
      "aria-label": open ? "\u6536\u8D77\u6570\u636E\u67E5\u770B" : "\u5C55\u5F00\u6570\u636E\u67E5\u770B",
      onClick: () => {
        toggleCockpit();
      }
    },
    React4.createElement(BrandMark, { size: 16 })
  );
}
function ComposerDockSkillBar() {
  return React4.createElement(SkillBar, {
    variant: "dock",
    onInvoke: (skill) => {
      void sendToConversation(skillInvocationToken(skill));
    }
  });
}
function apply(ctx) {
  try {
    injectStyles();
  } catch (err) {
    console.error("[ecommerce-analyst] \u6837\u5F0F\u6CE8\u5165\u5931\u8D25\uFF1A", err);
  }
  setClientContext(ctx);
  if (typeof ctx.get === "function") {
    const conv = ctx.get("conversation");
    if (conv !== void 0 && typeof conv.send === "function") {
      registerConversationSender((text) => {
        void conv.send(text);
      });
    }
  }
  ctx.slots.inject(
    "sidebar.footer.action",
    () => ctx.slots.register(
      {
        name: "sidebar.footer.action",
        id: "ecommerce-cockpit-footer",
        order: 100,
        label: () => "\u6570\u636E\u67E5\u770B"
      },
      DataFooterLauncher
    )
  );
  ctx.slots.inject(
    "conversation.view",
    () => ctx.slots.register(
      {
        name: "conversation.view",
        id: "ecommerce-cockpit-view",
        order: 25,
        label: () => "\u6570\u636E\u67E5\u770B"
      },
      ShopDeskTab
    )
  );
  ctx.slots.inject(
    "shell.overlay",
    () => ctx.slots.register(
      {
        name: "shell.overlay",
        id: "ecommerce-shop-desk",
        order: 110,
        label: "\u6570\u636E\u67E5\u770B"
      },
      ShopDeskPanel
    )
  );
  ctx.slots.inject(
    "conversation.input.dock",
    () => ctx.slots.register(
      {
        name: "conversation.input.dock",
        id: "ecommerce-skill-dock",
        order: 50,
        label: "\u6280\u80FD\u5206\u6790"
      },
      ComposerDockSkillBar
    )
  );
}

    return module.exports;
  }
});
