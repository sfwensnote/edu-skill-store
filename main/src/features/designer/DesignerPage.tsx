import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { TeachingAssistant } from '../../../shared/assistant';
import { defaultCreationDraft, emptyMethod, methodFromSkill, packageTeachingMethod, prepareMethod, type CreationDraft, type TeachingMethod } from '../../../shared/teaching-method';
import { Button } from '@/components/ui/button';
import { IdeaForm } from './IdeaForm';
import { GuidedMethodPage } from './GuidedMethodPage';
import './creation-flow.css';

const draftKey = (id: string) => `teaching-assistant.method-draft.v1:${id}`;
function restore(assistant: TeachingAssistant): CreationDraft {
  try {
    const saved = JSON.parse(localStorage.getItem(draftKey(assistant.id)) || 'null') as CreationDraft | null;
    if (saved && typeof saved.originalIdea === 'string' && saved.method && Array.isArray(saved.method.teachingSteps)
      && Array.isArray(saved.method.principles) && ['idea', 'method', 'preview'].includes(saved.stage)) {
      const method: TeachingMethod = { ...saved.method, trigger: saved.method.trigger || saved.method.teachingSteps[0]?.condition || '' };
      return { ...saved, method, conversation: Array.isArray(saved.conversation) ? saved.conversation : [],
        questionIndex: Number.isInteger(saved.questionIndex) ? saved.questionIndex : 0,
        manualEdits: Array.isArray(saved.manualEdits) ? saved.manualEdits : [] };
    }
  } catch { /* 本地草稿损坏时仍可重新填写。 */ }
  if (!assistant.goal && !assistant.skills.length) return defaultCreationDraft();
  return { ...defaultCreationDraft(), originalIdea: assistant.goal, grade: assistant.grade, subject: assistant.subject,
    teachingScene: assistant.activity === '错因诊断' ? '' : assistant.activity,
    stage: assistant.skills.length ? 'preview' : 'idea',
    method: assistant.skills[0] ? methodFromSkill(assistant.skills[0]) : emptyMethod(),
    editingSkillId: assistant.skills[0]?.id };
}

export function DesignerPage({ assistant, onBack, onSaveExit, onUpdate, onStartTest }: {
  assistant: TeachingAssistant; onBack: () => void; onSaveExit: () => void; onUpdate: (patch: Partial<TeachingAssistant>) => void;
  onStartTest: () => void; isSkillIncluded: (id: string) => boolean; onToggleSkill: (id: string) => void;
}) {
  const [draft, setDraft] = useState(() => restore(assistant));
  const [storageError, setStorageError] = useState('');
  function save(next: CreationDraft) {
    setDraft(next);
    try { localStorage.setItem(draftKey(assistant.id), JSON.stringify(next)); setStorageError(''); }
    catch { setStorageError('本地存储空间不足，请保持此页面打开，避免丢失草稿。'); }
  }
  function edit(next: CreationDraft) {
    save(next);
    onUpdate({ status: 'DRAFT', isPublic: false, name: assistant.name || `${next.grade}${next.subject}教学助手`,
      goal: next.method.expectedOutcome || next.originalIdea, grade: next.grade, subject: next.subject,
      activity: next.teachingScene || '教学实践' });
  }
  function confirmMethod() {
    const skill = packageTeachingMethod(draft.method, draft.editingSkillId || `method-${assistant.id}`);
    onUpdate({ skills: [skill], name: assistant.name || `${draft.grade}${draft.subject}教学助手`,
      goal: draft.method.expectedOutcome, grade: draft.grade, subject: draft.subject,
      activity: draft.teachingScene || '教学实践', status: 'DRAFT', isPublic: false });
    save({ ...draft, stage: 'preview', editingSkillId: skill.id });
  }
  const skill = draft.stage === 'preview' ? packageTeachingMethod(draft.method, draft.editingSkillId || `method-${assistant.id}`) : null;
  return <main className="creation-flow page-frame">
    <header className="creation-heading"><button className="back-link" aria-label="返回" onClick={draft.stage === 'idea' ? onBack : () => save({ ...draft, stage: draft.stage === 'preview' ? 'method' : 'idea' })}><ArrowLeft /></button><h1>创建助手</h1><span className="creation-position">{draft.stage === 'idea' ? '1 · 教学想法' : draft.stage === 'method' ? '2 · 教学方法' : '3 · 教学技能'}</span><Button variant="ghost" onClick={onSaveExit}>保存并退出</Button></header>
    {storageError && <p role="alert">{storageError}</p>}
    {draft.stage === 'idea' && <IdeaForm draft={draft} onChange={edit} onContinue={() => save({ ...draft, method: prepareMethod(draft.originalIdea, draft.method), stage: 'method' })} />}
    {draft.stage === 'method' && <GuidedMethodPage draft={draft} onChange={edit} onEditIdea={() => save({ ...draft, stage: 'idea' })} onConfirm={confirmMethod} />}
    {skill && <section className="creation-preview creation-panel">
      <header><h2>Educational Skill</h2><p>你的教学方法已经整理为下面的 Skill。</p></header>
      <div className="preview-intro"><h3>{skill.name}</h3><p>{skill.description}</p></div>
      <div className="preview-section"><h4>教学目的</h4><p>{skill.purpose}</p></div>
      <div className="preview-section"><h4>适用条件</h4><p>{skill.trigger}</p></div>
      <div className="preview-section"><h4>教学步骤</h4><ol>{skill.steps?.map((step, index) => <li key={index}>
        <span className="preview-step-label">Step {index + 1}</span><p><span>{index === 0 ? '当' : '如果'}</span>{step.condition}</p><p><span>做</span>{step.action}</p>
      </li>)}</ol></div>
      <div className="preview-section"><h4>教学原则</h4>{skill.constraints.length ? <ul>{skill.constraints.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>未补充额外原则</p>}</div>
      <footer className="creation-footer"><Button variant="outline" onClick={() => save({ ...draft, stage: 'method' })}>返回修改教学方法</Button>
        <Button onClick={() => { onUpdate({ status: 'GENERATED' }); onStartTest(); }}>确认 Skill<ArrowRight data-icon="inline-end" /></Button></footer>
    </section>}
  </main>;
}
