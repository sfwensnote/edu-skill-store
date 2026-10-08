import { ArrowLeft, Check, Pause } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { TeachingAssistant } from '../../../shared/assistant';
import { Button } from '@/components/ui/button';
import { createTestCases } from './testData';
import { TestCaseRecord } from './TestCaseRecord';
import { SkillResults } from './SkillResults';

export function TestingPage({
  assistant,
  onBack,
  onComplete,
  onStartTrial,
  onCreated,
}: {
  assistant: TeachingAssistant;
  onBack: () => void;
  onComplete: () => void;
  onStartTrial: () => void;
  onCreated?: () => void;
}) {
  const cases = useMemo(() => createTestCases(assistant.skills), [assistant.skills]);
  const progressKey = `teaching-assistant.check-progress:${assistant.id}`;
  const signature = JSON.stringify(assistant.skills);
  const [completed, setCompleted] = useState(() => {
    if (['TESTED', 'TRIAL', 'ACTIVE'].includes(assistant.status)) return cases.length;
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey) || 'null');
      if (saved?.signature === signature && Number.isInteger(saved.completed)) return Math.max(0, Math.min(saved.completed, Math.max(0, cases.length - 1)));
    } catch { /* 无有效进度时从第一项开始。 */ }
    return 0;
  });
  const [paused, setPaused] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'process' | 'results'>('process');
  const done = completed >= cases.length;
  const current = cases[Math.min(completed, cases.length - 1)];
  function confirmCurrent() {
    if (paused || done) return;
    const next = completed + 1;
    setCompleted(next);
    try { localStorage.setItem(progressKey, JSON.stringify({ signature, completed: next })); } catch { /* 保存受限时仍允许本次确认。 */ }
    if (next === cases.length) onComplete();
  }
  if (!assistant.skills.length || assistant.status === 'DRAFT') {
    return <main className="page-frame creation-flow"><h1>请先确认教学技能</h1><p>完成教学方法并选择加入助手的技能后，再开始检测。</p><Button onClick={onBack}>返回设计</Button></main>;
  }
  return (
    <main className="testing-page">
      <header className="testing-toolbar">
        <div className="page-frame testing-toolbar-inner">
          <button className="back-link" onClick={onBack}><ArrowLeft />返回设计</button>
          <div className="testing-title"><strong>{assistant.name}</strong><span>v1.0</span><i className={done ? 'done' : ''}>{done ? '检测完成' : paused ? '已暂停' : '等待确认'}</i></div>
          <div className="testing-progress"><span>{Math.min(completed + (done ? 0 : 1), cases.length)} / {cases.length}</span>{!done && <Button variant="outline" onClick={() => setPaused((value) => !value)}><Pause data-icon="inline-start" />{paused ? '继续检测' : '停止检测'}</Button>}</div>
        </div>
      </header>
      <div className="mobile-workspace-tabs testing-tabs" role="tablist"><button className={mobilePanel === 'process' ? 'active' : ''} onClick={() => setMobilePanel('process')}>测试过程</button><button className={mobilePanel === 'results' ? 'active' : ''} onClick={() => setMobilePanel('results')}>检测结果</button></div>
      <div className="testing-workspace page-frame">
        <div className={`testing-main ${mobilePanel === 'process' ? 'mobile-active' : ''}`}>
          {done ? (
            <section className="test-complete">
              <div className="complete-summary"><span className="complete-mark"><Check /></span><div><h1>{onCreated ? '助手创建成功' : '检测完成'}</h1><p>{onCreated ? '已完成教学方法逐项确认。当前为流程演示，真实模型表现仍待验证。' : '整体情况：基本符合你的教学要求'}</p></div></div>
              <div className="completed-cases">
                {cases.map((item) => <div key={item.id}><span><Check /></span><p><strong>{item.title}</strong><small>{assistant.skills.find((skill) => skill.id === item.skillId)?.name}</small></p><em className={item.attention ? 'attention' : ''}>{item.methodReview ? '已确认' : item.attention ? '需要关注' : '通过'}</em></div>)}
              </div>
              <div className="complete-actions"><Button variant="outline" size="lg" onClick={onBack}>返回调整</Button>{onCreated && <Button variant="outline" size="lg" onClick={onCreated}>进入我的助手</Button>}<Button size="lg" onClick={onStartTrial}>投放试用</Button></div>
            </section>
          ) : <TestCaseRecord testCase={current} index={completed} total={cases.length} paused={paused} onConfirm={confirmCurrent} />}
        </div>
        <div className={`testing-side ${mobilePanel === 'results' ? 'mobile-active' : ''}`}><SkillResults skills={assistant.skills} cases={cases} completed={completed} /></div>
      </div>
    </main>
  );
}
