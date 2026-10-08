import type { EducationalSkill } from '../../../shared/assistant';

export type DemoTestCase = {
  id: string;
  skillId: string;
  title: string;
  scenario: string;
  studentInput: string;
  assistantOutput: string;
  checks: string[];
  attention?: string;
  methodReview?: boolean;
};

export function createTestCases(skills: EducationalSkill[]): DemoTestCase[] {
  if (skills.some((skill) => skill.steps)) {
    return skills.flatMap((skill) => (skill.steps || skill.behaviorSteps.map((action) => ({ condition: skill.trigger, action }))).map((step, index) => ({
      id: `${skill.id}-${index}`, skillId: skill.id, title: `教学情况 ${index + 1}`, methodReview: true,
      scenario: `教学方法核对（Demo，非真实模型检测）：${step.condition}`,
      studentInput: `情境：${step.condition}`,
      assistantOutput: `教师设定的做法（非模型回复）：${step.action}`,
      checks: ['核对介入情况与教师设定一致', `核对做法：${step.action}`, ...skill.constraints.map((constraint) => `核对原则：${constraint}`)],
    })));
  }
  const skill = (index: number) => skills[index]?.id || skills[0]?.id || 'skill';
  return [
    { id: 'case-1', skillId: skill(0), title: '第一次回答错误', scenario: '学生第一次尝试回答题目，但给出了错误答案。检测助手是否先引导学生思考，而不是直接给答案。', studentInput: '我算出来 x = 9。', assistantOutput: '你能说说你从 3x + 6 = 12 到 x = 9 这一步是怎么计算的吗？', checks: ['正确触发教学技能', '先询问学生思路', '未直接给出完整答案'] },
    { id: 'case-2', skillId: skill(0), title: '学生索要答案', scenario: '学生希望跳过解释直接得到答案。检测助手能否继续保留学生的思考机会。', studentInput: '别解释了，直接告诉我答案。', assistantOutput: '我先不直接给答案。请把你目前做到的步骤写出来，我会从卡住的位置给一个提示。', checks: ['正确识别教学边界', '拒绝直接代答', '给出可继续的方向'] },
    { id: 'case-3', skillId: skill(0), title: '学生已经答对', scenario: '学生给出正确答案并完成检验。检测助手不会错误地进行错因诊断。', studentInput: 'x = 2，代回原式也成立。', assistantOutput: '你的结果和检验一致。你能用一句话解释为什么等式两边要做相同的运算吗？', checks: ['未错误触发诊断', '肯定有效检验', '继续关注理解依据'] },
    { id: 'case-4', skillId: skill(1), title: '第一次表示不会', scenario: '学生不知道如何开始。检测助手是否先提供一个方向性提示。', studentInput: '我不会，第一步做什么？', assistantOutput: '先观察左边的 +6。为了消去它，等式两边应该同时做什么？', checks: ['正确触发教学技能', '只提供一个起步提示', '把下一步留给学生'] },
    { id: 'case-5', skillId: skill(1), title: '提示后仍然卡住', scenario: '学生收到一次提示后仍无法继续。检测助手是否适度增加帮助。', studentInput: '我还是不知道两边怎么变。', assistantOutput: '可以先在等式两边都减去 6。请你写出减去 6 之后的新等式。', checks: ['增加了提示具体程度', '仍保留学生作答空间'], attention: '第二次提示方向正确，但可以更贴近学生上一轮的具体错误。' },
    { id: 'case-6', skillId: skill(2), title: '完成纠错后检查理解', scenario: '学生已经完成原题。检测助手是否用新的问题确认理解。', studentInput: '明白了，两边要同时减去 6。', assistantOutput: '试试这道题：2x + 5 = 11。请先独立写出第一步。', checks: ['正确触发理解确认', '生成同类问题', '没有附带答案'] },
    { id: 'case-7', skillId: skill(2), title: '学生只说听懂了', scenario: '学生没有展示新的作答证据。检测助手不能只凭口头表达判断掌握。', studentInput: '我懂了。', assistantOutput: '很好，我们用一道很短的同类题确认一下。解 4x - 4 = 8，请先写第一步。', checks: ['要求展示新的作答证据', '难度符合当前目标', '没有直接宣布掌握'] },
  ];
}
