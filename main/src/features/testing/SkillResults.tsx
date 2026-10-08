import { Check, Circle, LoaderCircle, TriangleAlert } from 'lucide-react';
import type { EducationalSkill } from '../../../shared/assistant';
import type { DemoTestCase } from './testData';

export function SkillResults({ skills, cases, completed }: { skills: EducationalSkill[]; cases: DemoTestCase[]; completed: number }) {
  return (
    <aside className="skill-results">
      <header><h2>教学技能检测结果</h2><p>系统会逐项检查触发、执行方式和教学边界。</p></header>
      <div className="result-stack">
        {skills.map((skill) => {
          const own = cases.filter((item) => item.skillId === skill.id);
          const done = own.filter((item) => cases.indexOf(item) < completed);
          const attention = done.some((item) => item.attention);
          const finished = done.length === own.length;
          const active = !finished && own.some((item) => cases.indexOf(item) === completed);
          return (
            <article className="skill-result-row" key={skill.id}>
              <span className={`result-icon ${finished ? attention ? 'attention' : 'passed' : active ? 'running' : 'waiting'}`}>
                {finished ? attention ? <TriangleAlert /> : <Check /> : active ? <LoaderCircle className="spin" /> : <Circle />}
              </span>
              <div><strong>{skill.name}</strong><span>{finished ? skill.steps ? '方法已确认，模型待验证' : attention ? '需要关注' : '通过' : active ? '检测中' : '等待检测'}</span><small>{done.length} / {own.length} 个情境完成</small></div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
