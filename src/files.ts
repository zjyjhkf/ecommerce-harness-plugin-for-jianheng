/**
 * ecommerce-analyst-plugin — 通用文件交换(服务端)
 *
 * 闭环:「上传文件 → AI 会话处理 → 下载结果」。本模块只负责传输(收件/列表/下载/删除),
 * AI 处理仍发生在 dsh 会话里(agent 读 inbox、写 outbox)。目录通过 config.files 或环境
 * 变量 ECOM_FILES_INBOX / ECOM_FILES_OUTBOX 指定;部署时可指到共享工作区
 * (/srv/dsh-share/inbox、/srv/dsh-share/outbox),从而与 agent 工作区 + nginx /share/ 对齐。
 *
 * 路由(挂在与 /ecommerce-api 同一前缀下,由 shop-api.ts 派发):
 *   POST /ecommerce-api/files/upload?name=<文件名>      原始字节体 → inbox
 *   GET  /ecommerce-api/files/list?dir=inbox|outbox      列出文件
 *   GET  /ecommerce-api/files/download?dir=..&name=..    attachment 下载
 *   POST /ecommerce-api/files/delete?dir=..&name=..      删除
 */
import { createReadStream } from 'node:fs'
import { mkdir, readdir, rm, stat } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolveDir } from './paths.ts'

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'accept, content-type, origin',
  'access-control-max-age': '600',
} as const

const MIME: Record<string, string> = {
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.zip': 'application/zip',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.html': 'text/html',
  '.xml': 'application/xml',
  '.sql': 'text/plain',
  '.log': 'text/plain',
}

export interface FilesConfig {
  inboxDir: string
  outboxDir: string
  maxBytes: number
}

export interface FileEntry {
  name: string
  size: number
  modified: number
  dir: 'inbox' | 'outbox'
}

/** 解析文件交换目录:环境变量优先,其次 config,默认锚定插件根 data/files/{inbox,outbox}。 */
export function resolveFilesDirs(cfg: FilesConfig): FilesConfig {
  const inboxDir = process.env.ECOM_FILES_INBOX?.trim() || resolveDir(cfg.inboxDir, join('data', 'files', 'inbox'))
  const outboxDir = process.env.ECOM_FILES_OUTBOX?.trim() || resolveDir(cfg.outboxDir, join('data', 'files', 'outbox'))
  return { inboxDir, outboxDir, maxBytes: cfg.maxBytes }
}

function dirPath(dirs: FilesConfig, dir: string): string {
  const base = dir === 'outbox' ? dirs.outboxDir : dirs.inboxDir
  return resolve(base)
}

/** 文件名字段清洗:只取 basename、去控制字符,拒绝空/点路径,防目录穿越。 */
function sanitizeName(raw: string): string {
  const base = String(raw ?? '').replace(/\\/g, '/').split('/').pop() ?? ''
  const cleaned = base.replace(/[\u0000-\u001f]/g, '').trim()
  if (cleaned === '' || cleaned === '.' || cleaned === '..') throw new Error('非法文件名')
  return cleaned
}

function targetPath(dirs: FilesConfig, dir: string, name: string): string {
  const root = dirPath(dirs, dir)
  const target = join(root, sanitizeName(name))
  if (target !== root && !target.startsWith(root + sep)) throw new Error('路径越界')
  return target
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...CORS,
  })
  res.end(JSON.stringify(body))
}

function sendPreflight(res: ServerResponse): void {
  res.writeHead(204, { ...CORS })
  res.end()
}

function readBody(req: IncomingMessage, maxBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > maxBytes) {
        reject(new Error(`文件超过大小上限(${Math.round(maxBytes / 1024 / 1024)}MB)`))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/** 处理一个 /ecommerce-api/files* 请求;命中返回 true,未命中返回 false。 */
export async function handleFilesRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  query: URLSearchParams,
  dirs: FilesConfig,
): Promise<boolean> {
  if (req.method === 'OPTIONS') {
    sendPreflight(res)
    return true
  }
  try {
    if (pathname === '/ecommerce-api/files/upload' && req.method === 'POST') {
      const name = sanitizeName(String(query.get('name') ?? ''))
      await mkdir(dirPath(dirs, 'inbox'), { recursive: true })
      const target = targetPath(dirs, 'inbox', name)
      const body = await readBody(req, dirs.maxBytes)
      const { writeFile } = await import('node:fs/promises')
      await writeFile(target, body)
      const st = await stat(target)
      sendJson(res, 200, {
        ok: true,
        value: { name, size: st.size, dir: 'inbox' },
        hint: `已上传到收件箱 inbox/${name},去会话里让 AI 处理即可`,
      })
      return true
    }
    if (pathname === '/ecommerce-api/files/list' && req.method === 'GET') {
      const dir = query.get('dir') === 'outbox' ? 'outbox' : 'inbox'
      await mkdir(dirPath(dirs, dir), { recursive: true })
      const entries = await readdir(dirPath(dirs, dir), { withFileTypes: true })
      const files: FileEntry[] = []
      for (const e of entries) {
        if (!e.isFile()) continue
        const st = await stat(join(dirPath(dirs, dir), e.name)).catch(() => null)
        if (st === null) continue
        files.push({ name: e.name, size: st.size, modified: st.mtimeMs, dir })
      }
      files.sort((a, b) => b.modified - a.modified)
      sendJson(res, 200, { ok: true, value: { dir, files } })
      return true
    }
    if (pathname === '/ecommerce-api/files/download' && req.method === 'GET') {
      const dir = query.get('dir') === 'outbox' ? 'outbox' : 'inbox'
      const name = sanitizeName(String(query.get('name') ?? ''))
      const target = targetPath(dirs, dir, name)
      const st = await stat(target).catch(() => null)
      if (st === null || !st.isFile()) {
        sendJson(res, 404, { ok: false, error: { code: 'NOT_FOUND', message: '文件不存在' } })
        return true
      }
      const mime = MIME[extname(name).toLowerCase()] ?? 'application/octet-stream'
      res.writeHead(200, {
        'content-type': mime,
        'content-length': String(st.size),
        'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
        'cache-control': 'no-store',
        ...CORS,
      })
      createReadStream(target).pipe(res)
      return true
    }
    if (pathname === '/ecommerce-api/files/delete' && req.method === 'POST') {
      const dir = query.get('dir') === 'outbox' ? 'outbox' : 'inbox'
      const name = sanitizeName(String(query.get('name') ?? ''))
      const target = targetPath(dirs, dir, name)
      await rm(target, { force: true })
      sendJson(res, 200, { ok: true, value: { name, dir } })
      return true
    }
  } catch (err) {
    sendJson(res, 400, {
      ok: false,
      error: { code: 'FILES_FAILED', message: err instanceof Error ? err.message : String(err) },
    })
    return true
  }
  return false
}
