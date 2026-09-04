/** 允许从客户端 TS 直接以字符串导入 .html（esbuild text loader） */
declare module '*.html' {
  const content: string
  export default content
}
