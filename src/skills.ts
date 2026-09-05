/**
 * ecommerce-analyst-plugin — 宿主端技能 Provider
 *
 * 把仓库根 skills/<id>/SKILL.md（7 个跨境电商分析技能）注册进 dsh 的 ctx.skills 目录，
 * 使 `/keyword-research` 这类 `/name` 调用可被识别、模型目录可自动调用（modelInvocable）。
 *
 * 设计要点：
 *  - 零运行时依赖：用内置极简 frontmatter 解析（只读 name/description/whenToUse 标量），
 *    不引入 yaml 库（插件运行时依赖仅 xlsx/pdfjs-dist）。
 *  - 跨平台：用 import.meta.url 定位模块目录，再向上找到 skills/ 目录（兼容 dev src/ 与
 *    打包后包根 node_modules/ecommerce-analyst-plugin/ 两种布局，Windows/Ubuntu 一致）。
 *  - 可选注册：ctx.skills 服务缺失（老版本 dsh）时优雅跳过，不阻塞插件激活。
 *  - 可逆：registerProvider 返回的 disposer 随 fiber 卸载，技能目录改动不残留。
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'

const MODULE_DIR = dirname(fileURLToPath(import.meta.url))
/** dsh 技能名语法（与 @deepseek-ai/dsh-skill 的 isSkillName 一致） */
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PROVIDER_NAME = 'ecommerce-analyst'
/** 低优先级：用户项目/个人技能（rank 100~500）优先于插件内置技能，避免同名覆盖 */
const PROVIDER_RANK = 600

/* ──────────────────────── 最小类型（避免依赖 @deepseek-ai/dsh-skill 类型） ──────────────────────── */

interface SkillInvocationPolicyLike {
  modelInvocable: boolean
  userInvocable: boolean
}
interface SkillResourceBaseLike {
  kind: 'directory'
  path: string
}
interface SkillSummaryLike {
  name: string
  description: string
  whenToUse?: string
  invocation: SkillInvocationPolicyLike
  source: string
  provider: string
  resourceBase?: SkillResourceBaseLike
}
interface SkillCandidateLike extends SkillSummaryLike {
  rank: number
  locator: unknown
  path?: string
}
interface SkillDefinitionLike extends SkillSummaryLike {
  content: string
  path?: string
}
interface SkillLookupOptionsLike {
  cwd?: string
  signal?: AbortSignal
}
interface SkillProviderControlLike {
  signal: AbortSignal
  invalidate(): void
}
interface SkillProviderLike {
  name: string
  list(options: SkillLookupOptionsLike): Promise<readonly SkillCandidateLike[] | unknown>
  get(candidate: SkillCandidateLike, options: SkillLookupOptionsLike): Promise<SkillDefinitionLike | undefined>
}
interface SkillRegistryLike {
  registerProvider(create: (control: SkillProviderControlLike) => SkillProviderLike): () => void
}

/* ──────────────────────── frontmatter 解析（极简，仅覆盖本插件 SKILL.md 的标量字段） ──────────────────────── */

interface ParsedSkill {
  data: Record<string, string>
  body: string
}

/** 解析 `---` 分隔的 YAML frontmatter（只解析 `key: value` 单行标量，正文原样返回） */
function parseFrontmatter(raw: string): ParsedSkill | undefined {
  const lines = raw.split(/\r?\n/)
  if ((lines[0] ?? '').trim() !== '---') return undefined
  let close = -1
  for (let i = 1; i < lines.length; i++) {
    if ((lines[i] ?? '').trim() === '---') {
      close = i
      break
    }
  }
  if (close < 0) return undefined
  const data: Record<string, string> = {}
  for (let i = 1; i < close; i++) {
    const m = (lines[i] ?? '').match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
    if (m !== null) data[m[1]] = m[2]
  }
  return { data, body: lines.slice(close + 1).join('\n') }
}

/** 定位插件技能目录（dev src/ 与打包后包根两种布局都覆盖） */
function resolveSkillsDir(): string | undefined {
  for (const candidate of [join(MODULE_DIR, 'skills'), join(MODULE_DIR, '..', 'skills')]) {
    if (existsSync(join(candidate, 'keyword-research', 'SKILL.md'))) return candidate
  }
  return undefined
}

/** 读取并解析一个 SKILL.md，产出可注册的 SkillDefinition（解析失败/缺失返回 undefined） */
function readSkill(path: string): SkillDefinitionLike | undefined {
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    return undefined
  }
  const parsed = parseFrontmatter(raw)
  if (parsed === undefined) return undefined
  const name = (parsed.data.name ?? '').trim()
  const description = (parsed.data.description ?? '').trim()
  if (name === '' || description === '' || !SKILL_NAME.test(name)) return undefined
  const whenToUse = (parsed.data.whenToUse ?? '').trim()
  return {
    name,
    description,
    ...(whenToUse !== '' ? { whenToUse } : {}),
    invocation: { modelInvocable: true, userInvocable: true },
    source: 'custom',
    provider: PROVIDER_NAME,
    content: parsed.body.trim(),
    path,
  }
}

/* ──────────────────────── Provider 构造与注册 ──────────────────────── */

/** 基于插件 skills/ 目录的内存技能 Provider（list/get 均直接读盘，保证改后即时生效） */
function createSkillsProvider(skillsDir: string): SkillProviderLike {
  return {
    name: PROVIDER_NAME,
    async list(): Promise<SkillCandidateLike[]> {
      const candidates: SkillCandidateLike[] = []
      let entries
      try {
        entries = readdirSync(skillsDir, { withFileTypes: true })
      } catch {
        return candidates
      }
      for (const entry of entries) {
        if (!entry.isDirectory()) continue
        const md = join(skillsDir, entry.name, 'SKILL.md')
        const skill = readSkill(md)
        if (skill === undefined) continue
        candidates.push({
          name: skill.name,
          description: skill.description,
          ...(skill.whenToUse !== undefined ? { whenToUse: skill.whenToUse } : {}),
          invocation: skill.invocation,
          source: skill.source,
          provider: PROVIDER_NAME,
          resourceBase: { kind: 'directory', path: skillsDir },
          rank: PROVIDER_RANK,
          locator: md,
          path: md,
        })
      }
      return candidates
    },
    async get(candidate): Promise<SkillDefinitionLike | undefined> {
      const md = candidate.locator as string
      return readSkill(md)
    },
  }
}

/**
 * 把插件技能注册进 dsh 技能目录。ctx.skills 服务缺失时返回 undefined（调用方据此打印提示）。
 * @returns 反注册 disposer（随插件 fiber 卸载），或 undefined（未注册）
 */
export function registerPluginSkills(ctx: Context): (() => void) | undefined {
  const registry = ctx.get('skills') as SkillRegistryLike | undefined
  if (registry === undefined || typeof registry.registerProvider !== 'function') {
    return undefined
  }
  const skillsDir = resolveSkillsDir()
  if (skillsDir === undefined) return undefined
  const provider = createSkillsProvider(skillsDir)
  return registry.registerProvider(() => provider)
}
