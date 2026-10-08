import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCreationDraft, emptyMethod, methodError, packageTeachingMethod, methodFromSkill, prepareMethod, recordAnswer, mockQuestions, demoIdea, type TeachingMethod } from '../shared/teaching-method';
import { skillSchema } from '../shared/assistant';
import { createTestCases } from '../src/features/testing/testData';

test('初步想法只整理问题，不生成教学步骤或 Skill', () => {
  const draft = defaultCreationDraft();
  assert.equal(draft.originalIdea, demoIdea);
  assert.equal(draft.questionIndex, 0);
  assert.equal(draft.method.teachingSteps.length, 0);
  const method = prepareMethod(demoIdea, draft.method);
  assert.equal(method.problem, '学生答错后容易依赖直接答案');
  assert.equal(method.expectedOutcome, '');
  assert.equal(method.trigger, '');
  assert.ok(methodError(method));
  assert.throws(() => packageTeachingMethod(method, 'skill'));
  assert.deepEqual(prepareMethod('另一位教师的原始想法', emptyMethod()).problem, '另一位教师的原始想法');
});

test('六轮回答逐步形成方法，条件可以先于做法出现', () => {
  let draft = { ...defaultCreationDraft(), originalIdea: demoIdea, method: prepareMethod(demoIdea, emptyMethod()) };
  draft = recordAnswer(draft, mockQuestions[0].example);
  assert.equal(draft.method.expectedOutcome, mockQuestions[0].example);
  assert.equal(draft.method.trigger, '');
  draft = recordAnswer(draft, mockQuestions[1].example);
  assert.equal(draft.method.trigger, mockQuestions[1].example);
  assert.equal(draft.method.teachingSteps[0].condition, mockQuestions[1].example);
  draft = recordAnswer(draft, mockQuestions[2].example);
  draft = recordAnswer(draft, mockQuestions[3].example);
  assert.equal(draft.method.teachingSteps[1].condition, mockQuestions[3].example);
  assert.equal(draft.method.teachingSteps[1].action, '');
  assert.ok(methodError(draft.method));
  draft = recordAnswer(draft, mockQuestions[4].example);
  draft = recordAnswer(draft, mockQuestions[5].example);
  assert.equal(draft.questionIndex, 6);
  assert.equal(draft.conversation.length, 6);
  assert.equal(methodError(draft.method), '');
  assert.deepEqual(packageTeachingMethod(draft.method, 'skill').steps, draft.method.teachingSteps);
});

test('右侧教师修改后的内容优先于后续问答，Skill 忠实使用最终方法', () => {
  let draft = { ...defaultCreationDraft(), originalIdea: demoIdea, method: prepareMethod(demoIdea, emptyMethod()) };
  draft = recordAnswer(draft, mockQuestions[0].example);
  draft = { ...draft, method: { ...draft.method, trigger: '教师直接修改的触发条件' }, manualEdits: ['trigger'] };
  draft = recordAnswer(draft, mockQuestions[1].example);
  assert.equal(draft.method.trigger, '教师直接修改的触发条件');
  assert.equal(draft.conversation[1].answer, mockQuestions[1].example);
  const method: TeachingMethod = { problem: '问题', expectedOutcome: '目标', trigger: '触发条件',
    teachingSteps: [{ condition: '情况', action: '做法' }], principles: ['不能直接给答案'] };
  const skill = packageTeachingMethod(method, 'skill');
  assert.equal(skill.purpose, method.expectedOutcome);
  assert.equal(skill.trigger, method.trigger);
  assert.deepEqual(skill.steps, method.teachingSteps);
  assert.deepEqual(skill.constraints, method.principles);
  assert.equal(skillSchema.safeParse(skill).success, true);
  skill.steps![0].action = '修改封装副本';
  assert.equal(method.teachingSteps[0].action, '做法');
});

test('缺少触发条件或存在未完成的补充步骤时不能确认', () => {
  const method: TeachingMethod = { problem: '问题', expectedOutcome: '目标', trigger: '',
    teachingSteps: [{ condition: '情况', action: '做法' }], principles: [] };
  assert.ok(methodError(method));
  method.trigger = '开始情况';
  assert.equal(methodError(method), '');
  method.teachingSteps.push({ condition: '另一种情况', action: '' });
  assert.ok(methodError(method));
  assert.throws(() => packageTeachingMethod(method, 'skill'));
});

test('既有技能恢复和 Mock 检测沿用教师的条件与做法', () => {
  const method: TeachingMethod = { problem: '阅读时遗漏证据', expectedOutcome: '找到原文依据', trigger: '学生说不出依据',
    teachingSteps: [{ condition: '学生说不出依据', action: '请他标出支持观点的句子' }], principles: [] };
  const skill = packageTeachingMethod(method, 'reading');
  const restored = methodFromSkill(skill);
  assert.equal(restored.expectedOutcome, method.expectedOutcome);
  assert.deepEqual(restored.teachingSteps, method.teachingSteps);
  const legacy = { ...skill, id: 'old', steps: undefined };
  assert.deepEqual(new Set(createTestCases([skill, legacy]).map((item) => item.skillId)), new Set(['reading', 'old']));
  assert.ok(!JSON.stringify(createTestCases([skill])).includes('方程'));
});
