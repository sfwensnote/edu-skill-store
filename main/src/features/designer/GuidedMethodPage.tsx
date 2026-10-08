import { useState } from 'react';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { demoIdea, methodError, mockQuestions, recordAnswer, type CreationDraft, type TeachingMethod } from '../../../shared/teaching-method';

function EditableText({ label, value, onChange, placeholder = '待补充' }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  return <div className="method-editable">
    {editing ? <textarea aria-label={label} autoFocus value={value} maxLength={500} placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)} onBlur={() => window.setTimeout(() => setEditing(false), 0)} rows={2} />
      : <button type="button" className={`method-edit-button ${value.trim() ? '' : 'is-empty'}`}
        aria-label={`编辑${label}`} onClick={() => setEditing(true)}><span>{value.trim() || placeholder}</span><small>编辑</small></button>}
  </div>;
}

export function GuidedMethodPage({ draft, onChange, onEditIdea, onConfirm }: {
  draft: CreationDraft; onChange: (draft: CreationDraft) => void; onEditIdea: () => void; onConfirm: () => void;
}) {
  const [answerDraft, setAnswerDraft] = useState<{ questionId: string; value: string } | null>(null);
  const [showExtra, setShowExtra] = useState(false);
  const [extraCondition, setExtraCondition] = useState('');
  const [extraAction, setExtraAction] = useState('');
  const [error, setError] = useState('');
  const question = mockQuestions[draft.questionIndex];
  const answer = question && answerDraft?.questionId === question.id
    ? answerDraft.value : draft.originalIdea === demoIdea ? question?.example || '' : '';
  const method = draft.method;

  function updateMethod(next: TeachingMethod, field?: string) {
    onChange({ ...draft, method: next, manualEdits: field && !draft.manualEdits.includes(field) ? [...draft.manualEdits, field] : draft.manualEdits });
    setError('');
  }
  function updateStep(index: number, key: 'condition' | 'action', value: string) {
    updateMethod({ ...method, teachingSteps: method.teachingSteps.map((step, i) => i === index ? { ...step, [key]: value } : step) }, `step-${index}-${key}`);
  }
  function submitAnswer() {
    if (!answer.trim()) return;
    onChange(recordAnswer(draft, answer));
    setAnswerDraft(null);
    setError('');
  }
  function confirm() {
    const message = methodError(method);
    if (message) { setError(message); return; }
    onConfirm();
  }
  function addExtra() {
    if (!extraCondition.trim() || !extraAction.trim()) { setError('请补充这种情况和你的做法。'); return; }
    updateMethod({ ...method, teachingSteps: [...method.teachingSteps, { condition: extraCondition.trim(), action: extraAction.trim() }] });
    setExtraCondition(''); setExtraAction(''); setShowExtra(false);
  }

  return <div className="guided-creation">
    <header className="guided-heading"><h2>梳理我的教学方法</h2><p>通过几个具体问题，把你平时的做法逐渐整理清楚。</p></header>
    <div className="guided-layout">
      <section className="guided-panel guided-conversation" aria-label="引导对话">
        <header><h3>和系统聊聊你的做法</h3><p>系统只帮助你把已有的教学想法说清楚，不替你设计教学方法。</p></header>
        <div className="initial-idea"><div><strong>你的初步想法</strong><Button variant="link" size="sm" onClick={onEditIdea}>修改</Button></div><p>{draft.originalIdea}</p></div>
        <div className="guided-history">
          {draft.conversation.map((item) => <div className="history-item" key={item.questionId}>
            <p className="history-question">{item.question}</p><span>你的回答</span><p>{item.answer}</p>
          </div>)}
        </div>
        {question ? <div className="current-question">
          <span className="question-label">系统问题</span><h4>{question.question}</h4>
          <label className="sr-only" htmlFor="guided-answer">你的回答</label>
          <textarea id="guided-answer" value={answer} maxLength={500} placeholder={question.placeholder} onChange={(event) => setAnswerDraft({ questionId: question.id, value: event.target.value })} />
          <div className="answer-actions"><button className="example-answer" type="button" onClick={() => setAnswerDraft({ questionId: question.id, value: question.example })}>使用示例回答</button>
            <Button type="button" size="sm" disabled={!answer.trim()} onClick={submitAnswer}>提交<ArrowRight data-icon="inline-end" /></Button></div>
        </div> : <div className="current-question final-question">
          <span className="question-label">最后确认</span>
          <h4>如果另一位教师完全按照右边这套方法去做，你认为他已经能够基本复现你的做法了吗？</h4>
          {showExtra && <div className="extra-method"><p>还有哪些常见情况，会让你改变接下来的做法？</p>
            <label>如果学生……<textarea aria-label="补充情况" value={extraCondition} onChange={(event) => setExtraCondition(event.target.value)} placeholder="描述这种情况" maxLength={500} /></label>
            <label>我会……<textarea aria-label="补充做法" value={extraAction} onChange={(event) => setExtraAction(event.target.value)} placeholder="写下你通常的做法" maxLength={500} /></label>
            <Button size="sm" onClick={addExtra}>保存补充</Button></div>}
          <div className="final-actions"><Button variant="outline" onClick={() => { setShowExtra(true); setError(''); }}>还需要补充</Button>
            <Button onClick={confirm}>这就是我的教学方法<ArrowRight data-icon="inline-end" /></Button></div>
        </div>}
        {error && <p className="method-error" role="alert">{error}</p>}
      </section>
      <section className="guided-panel method-outline" aria-label="我的教学方法">
        <header><div><h3>我的教学方法</h3><p>这里会随着你的回答逐步整理，你可以随时修改。</p></div><span className="autosave-label">已保存到本机</span></header>
        <div className="outline-row"><h4>想解决的问题</h4><EditableText label="想解决的问题" value={method.problem} onChange={(value) => updateMethod({ ...method, problem: value }, 'problem')} /></div>
        <div className="outline-row"><h4>希望学生达到</h4><EditableText label="希望学生达到" value={method.expectedOutcome} onChange={(value) => updateMethod({ ...method, expectedOutcome: value }, 'expectedOutcome')} /></div>
        <div className="outline-row"><h4>什么时候开始</h4><EditableText label="什么时候开始" value={method.trigger} onChange={(value) => updateMethod({ ...method, trigger: value }, 'trigger')} /></div>
        <div className="outline-row"><h4>我会怎么做</h4>
          {method.teachingSteps.length ? <div className="outline-steps">{method.teachingSteps.map((step, index) => <div className="outline-step" key={index}>
            <div className="step-top"><strong>{index + 1}</strong>{index > 0 && <Button variant="ghost" size="icon-xs" aria-label={`删除情况 ${index + 1}`} onClick={() => updateMethod({ ...method, teachingSteps: method.teachingSteps.filter((_, i) => i !== index) })}><Trash2 /></Button>}</div>
            <div className="step-content"><span>{index === 0 ? '当' : '如果'}</span><EditableText label={`情况 ${index + 1}`} value={step.condition} onChange={(value) => updateStep(index, 'condition', value)} /></div>
            <div className="step-content"><span>我会</span><EditableText label={`做法 ${index + 1}`} value={step.action} onChange={(value) => updateStep(index, 'action', value)} /></div>
          </div>)}</div> : <p className="empty-method">待补充</p>}
          <Button variant="link" size="sm" onClick={() => updateMethod({ ...method, teachingSteps: [...method.teachingSteps, { condition: '', action: '' }] })}><Plus data-icon="inline-start" />补充一种情况和做法</Button>
        </div>
        <div className="outline-row"><h4>我的原则</h4>
          {method.principles.length ? <div className="outline-principles">{method.principles.map((principle, index) => <div className="outline-principle" key={index}><span>•</span><EditableText label={`原则 ${index + 1}`} value={principle} onChange={(value) => updateMethod({ ...method, principles: method.principles.map((item, i) => i === index ? value : item) })} />
            <Button variant="ghost" size="icon-xs" aria-label={`删除原则 ${index + 1}`} onClick={() => updateMethod({ ...method, principles: method.principles.filter((_, i) => i !== index) })}><Trash2 /></Button></div>)}</div> : <p className="empty-method">待补充</p>}
          <Button variant="link" size="sm" onClick={() => updateMethod({ ...method, principles: [...method.principles, ''] })}><Plus data-icon="inline-start" />补充一条原则</Button>
        </div>
      </section>
    </div>
  </div>;
}
