import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { TeachingAssistant } from '../../../shared/assistant';
import { demoSessions } from '@/data/platform';

export function LogDetailPage({ assistant, sessionId, onBack }: { assistant: TeachingAssistant; sessionId: string; onBack: () => void }) {
  const session = demoSessions.find((item) => item.id === sessionId) || demoSessions[0];
  return (
    <main className="detail-page page-frame narrow-frame">
      <button className="back-link" onClick={onBack}><ArrowLeft />返回运行记录</button>
      <div className="detail-heading"><p>{assistant.name}</p><h1>本次对话</h1><span>{session.turns} 轮</span></div>
      <section className="detail-summary"><div><h2>教学技能触发</h2><p>错误后反思引导 <strong>3 次</strong></p><p>渐进式提示 <strong>2 次</strong></p><p>理解确认 <strong>1 次</strong></p></div><div><h2>异常</h2><p className={session.anomaly ? 'issue' : 'normal'}>{session.anomaly || '无'}</p></div></section>
      <section className="conversation-record"><h2>对话记录</h2><div className="conversation-turn student"><span>学生</span><p>我算出来 x = 9，但老师说不对。</p></div><div className="conversation-turn assistant"><span>教学助手</span><p>先不急着改答案。你能把从 3x + 6 = 12 到 x = 9 的计算过程写出来吗？</p><small><CheckCircle2 />触发教学技能：错误后反思引导</small></div><div className="conversation-turn student"><span>学生</span><p>我把左边的 6 移到右边，算成了 12 + 6。</p></div><div className="conversation-turn assistant"><span>教学助手</span><p>你已经找到关键一步了。想一想：为了消去左边的 +6，等式两边应该同时做加法还是减法？</p><small><CheckCircle2 />触发教学技能：渐进式提示</small></div></section>
    </main>
  );
}
