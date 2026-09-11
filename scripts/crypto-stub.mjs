/* 浏览器端 node:crypto 桩（demo bundle 专用，仅生成非安全用途 uuid） */
let n = 0
export function randomUUID() {
  n += 1
  return "demo-" + n.toString(36) + "-" + Math.random().toString(36).slice(2, 10)
}
export default { randomUUID }
