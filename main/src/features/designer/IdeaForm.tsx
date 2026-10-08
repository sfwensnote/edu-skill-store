import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { demoIdea, type CreationDraft } from '../../../shared/teaching-method';
import { MethodTextField } from './MethodTextField';

export function IdeaForm({ draft, onChange, onContinue }: {
  draft: CreationDraft; onChange: (draft: CreationDraft) => void; onContinue: () => void;
}) {
  return <form className="idea-form creation-panel" onSubmit={(event) => { event.preventDefault(); if (draft.originalIdea.trim()) onContinue(); }}>
    <header><h2>说说你的教学想法</h2><p>从一个具体的教学场景、问题或做法开始。</p></header>
    {draft.originalIdea === demoIdea && <p className="idea-demo-hint">演示想法已填好，你可以直接继续，也可以改成自己的想法。</p>}
    {!draft.originalIdea && <Button variant="link" type="button" onClick={() => onChange({ ...draft, originalIdea: demoIdea, grade: '初中', subject: '数学', teachingScene: '一元一次方程练习' })}>使用数学教学示例，体验完整流程</Button>}
    <label className="idea-input"><span className="sr-only">教学想法</span>
      <MethodTextField id="original-idea" aria-label="教学想法" required maxLength={500} value={draft.originalIdea} onChange={(event) => onChange({ ...draft, originalIdea: event.target.value })}
        placeholder="例如：学生做错题以后总是等答案。我希望第一次做错的时候不要马上告诉他答案，而是先让他回顾自己的思路。" />
      <span className="idea-count">{draft.originalIdea.length} / 500</span>
    </label>
    <div className="idea-context">
      <label>学段<select value={draft.grade} onChange={(event) => onChange({ ...draft, grade: event.target.value })}>{['小学', '初中', '高中', '大学'].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>学科<select value={draft.subject} onChange={(event) => onChange({ ...draft, subject: event.target.value })}>{['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '科学', '信息技术', '其他'].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>教学场景（可选）<input maxLength={40} value={draft.teachingScene} placeholder="例如：一元一次方程练习" onChange={(event) => onChange({ ...draft, teachingScene: event.target.value })} /></label>
    </div>
    <footer className="creation-footer"><p>先说出你现在的想法，后面可以继续把方法补充完整。</p><Button size="lg" type="submit" disabled={!draft.originalIdea.trim()}>继续<ArrowRight data-icon="inline-end" /></Button></footer>
  </form>;
}
