/**
 * 技能模块注册表 + 短链接/提示词构建器单测。
 *
 * 覆盖：
 *  - 7 个 skill 与 .dsh/skills/ 目录一一对应（id 完整、唯一、icon 键合法）
 *  - findSkill 精确命中 / 未命中
 *  - skillTagOf 生成「短链接形式」技能调用（仅显示 skill 中文名）
 *  - valuePromptOf 生成「视图弹值」提示词（含指标名与数值、可选备注）
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SKILL_MODULES, findSkill, skillTagOf, valuePromptOf } from '../src/client/skills.ts'

test('注册表：恰好 7 个技能，id 与 .dsh/skills/ 一致且唯一', () => {
  assert.equal(SKILL_MODULES.length, 7, '必须为 7 个技能模块')
  const ids = SKILL_MODULES.map((s) => s.id)
  const expected = [
    'ad-traffic',
    'competitor-analysis',
    'comprehensive-research',
    'keyword-research',
    'listing',
    'market-opportunity',
    'review-insight',
  ]
  assert.deepEqual(ids, expected, '技能 slug 必须与 .dsh/skills/<id>/ 目录一一对应')
  assert.equal(new Set(ids).size, ids.length, '技能 id 不得重复')
})

test('注册表：每个技能字段完整（label/icon/hint/task 非空，icon 键合法）', () => {
  const validIcons = new Set(['traffic', 'competitor', 'research', 'keyword', 'listing', 'market', 'review'])
  for (const s of SKILL_MODULES) {
    assert.ok(s.label.trim().length > 0, `${s.id} label 非空`)
    assert.ok(validIcons.has(s.icon), `${s.id} icon 键合法`)
    assert.ok(s.hint.trim().length > 0, `${s.id} hint 非空`)
    assert.ok(s.task.trim().length > 0, `${s.id} task 非空`)
  }
})

test('findSkill：命中返回技能、未命中返回 undefined', () => {
  assert.equal(findSkill('listing')?.label, 'Listing优化')
  assert.equal(findSkill('review-insight')?.icon, 'review')
  assert.equal(findSkill('not-a-skill'), undefined)
})

test('skillTagOf：生成仅含技能中文名的短链接形式', () => {
  const skill = findSkill('ad-traffic')!
  const tag = skillTagOf(skill)
  assert.match(tag, /广告流量/)
  assert.match(tag, /ad-traffic/)
  // 短链接：单行、不含冗长任务描述
  assert.ok(!tag.includes('\n'), '短链接应为单行')
  assert.ok(!tag.includes('ACOS'), '短链接不应塞入冗长任务描述')
})

test('valuePromptOf：生成含指标名与数值的提示词，可选备注', () => {
  const p1 = valuePromptOf('累计销售额 (GMV)', '¥123,456（89 笔已支付订单）')
  assert.match(p1, /累计销售额 \(GMV\)/)
  assert.match(p1, /¥123,456/)
  assert.match(p1, /可执行建议/)

  const p2 = valuePromptOf('逾期订单', 'ORD-1001 · 张三 · ¥88.00', '该单已逾期 5 天')
  assert.match(p2, /逾期订单/)
  assert.match(p2, /ORD-1001/)
  assert.match(p2, /已逾期 5 天/)
})
