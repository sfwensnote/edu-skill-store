import type { EducationalSkill } from './assistant';

export type TeachingMethod = {
  problem: string;
  expectedOutcome: string;
  trigger: string;
  teachingSteps: { condition: string; action: string }[];
  principles: string[];
};

export type MethodAnswer = { questionId: string; question: string; answer: string };

export type CreationDraft = {
  originalIdea: string;
  grade: string;
  subject: string;
  teachingScene: string;
  stage: 'idea' | 'method' | 'preview';
  method: TeachingMethod;
  conversation: MethodAnswer[];
  questionIndex: number;
  manualEdits: string[];
  editingSkillId?: string;
};

export const demoIdea = '学生做错题以后经常等答案。我希望第一次做错的时候不要马上告诉他答案，而是先让他看看自己的思路哪里有问题。';

export const mockQuestions = [
  { id: 'outcome', question: '你希望通过这种做法，学生最终能够发生什么变化？', placeholder: '说说你最希望学生学会什么……', example: '我希望他不要马上依赖答案，而是先回顾自己的思路，尝试自己发现哪里出了问题。' },
  { id: 'trigger', question: '你通常在看到学生什么表现时，会开始这样做？', placeholder: '说说你通常在什么情况下开始……', example: '学生第一次回答错误，而且自己还没有意识到问题的时候。' },
  { id: 'first-action', question: '这种情况下，你通常会先怎么做？', placeholder: '说说你会先做什么……', example: '我会先让他回顾一下刚才的解题思路，说说自己是怎么想的。' },
  { id: 'next-condition', question: '学生完成这一步以后，什么表现会让你改变接下来的做法？', placeholder: '说说什么情况会让你继续介入……', example: '如果他回顾以后还是没有发现问题，我就会继续介入。' },
  { id: 'next-action', question: '这种情况下，你通常会怎么处理？', placeholder: '说说你接下来会怎么做……', example: '我会提醒他检查可能出错的那一步，但是不会直接告诉他错误在哪里。' },
  { id: 'principle', question: '在这个过程中，有没有你明确不希望助手做的事情？', placeholder: '说说你希望助手遵守的原则……', example: '第一次答错的时候不要直接给完整答案。' },
] as const;

export function emptyMethod(): TeachingMethod {
  return { problem: '', expectedOutcome: '', trigger: '', teachingSteps: [], principles: [] };
}

export function defaultCreationDraft(): CreationDraft {
  return {
    originalIdea: demoIdea, grade: '初中', subject: '数学', teachingScene: '一元一次方程练习',
    stage: 'idea', method: emptyMethod(), conversation: [], questionIndex: 0, manualEdits: [],
  };
}

// 只整理教师已经写下的想法；其他方法字段由教师后续回答。
export function prepareMethod(idea: string, current: TeachingMethod): TeachingMethod {
  if (current.problem.trim()) return current;
  return { ...current, problem: idea.trim() === demoIdea ? '学生答错后容易依赖直接答案' : idea.trim() };
}

export function recordAnswer(draft: CreationDraft, answer: string): CreationDraft {
  const item = mockQuestions[draft.questionIndex];
  if (!item || !answer.trim()) return draft;
  const value = answer.trim();
  const method = { ...draft.method, teachingSteps: draft.method.teachingSteps.map((step) => ({ ...step })), principles: [...draft.method.principles] };
  const editable = (field: string) => !draft.manualEdits.includes(field);
  switch (item.id) {
    case 'outcome': if (editable('expectedOutcome')) method.expectedOutcome = value; break;
    case 'trigger':
      if (editable('trigger')) method.trigger = value;
      if (!method.teachingSteps.length) method.teachingSteps.push({ condition: method.trigger, action: '' });
      else if (editable('step-0-condition')) method.teachingSteps[0].condition = method.trigger;
      break;
    case 'first-action':
      if (!method.teachingSteps.length) method.teachingSteps.push({ condition: method.trigger, action: '' });
      if (editable('step-0-action')) method.teachingSteps[0].action = value;
      break;
    case 'next-condition':
      if (method.teachingSteps.length < 2) method.teachingSteps.push({ condition: value, action: '' });
      else if (editable('step-1-condition')) method.teachingSteps[1].condition = value;
      break;
    case 'next-action':
      if (method.teachingSteps.length < 2) method.teachingSteps.push({ condition: '', action: '' });
      if (editable('step-1-action')) method.teachingSteps[1].action = value;
      break;
    case 'principle': method.principles.push(value); break;
  }
  return {
    ...draft, method, questionIndex: draft.questionIndex + 1,
    conversation: [...draft.conversation, { questionId: item.id, question: item.question, answer: value }],
  };
}

export function methodFromSkill(skill: EducationalSkill): TeachingMethod {
  return {
    problem: skill.purpose,
    expectedOutcome: skill.purpose,
    trigger: skill.trigger,
    teachingSteps: skill.steps?.map((step) => ({ ...step })) || skill.behaviorSteps.map((action, index) => ({ condition: index === 0 ? skill.trigger : '', action })),
    principles: [...skill.constraints],
  };
}

export function methodError(method: TeachingMethod): string {
  if (!method.problem.trim() || !method.expectedOutcome.trim() || !method.trigger.trim() ||
    !method.teachingSteps.length || method.teachingSteps.some((step) => !step.condition.trim() || !step.action.trim())) {
    return '还有一些关键内容没有说清楚，请先补充右侧标记为“待补充”的部分。';
  }
  return '';
}

export function packageTeachingMethod(method: TeachingMethod, id: string): EducationalSkill {
  const error = methodError(method);
  if (error) throw new Error(error);
  const description = '用于学生出现错误且尚未意识到问题时，引导学生回顾自己的思考过程并尝试自主修正。';
  return {
    id, name: '错误后的自主反思引导', description, summary: description,
    purpose: method.expectedOutcome,
    trigger: method.trigger,
    steps: method.teachingSteps.map((step) => ({ ...step })),
    behaviorSteps: method.teachingSteps.map((step) => `当：${step.condition}\n我会：${step.action}`),
    constraints: method.principles.filter((principle) => principle.trim()),
  };
}
