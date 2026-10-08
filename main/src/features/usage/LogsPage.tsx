import { BarChart3, CalendarDays, ChevronDown, ChevronRight, FileText, MessageCircle, Play, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import type { TeachingAssistant } from '../../../shared/assistant';
import { demoSessions } from '@/data/platform';
import { Button } from '@/components/ui/button';

const skillUsage = [
  { name: '错误后反思引导', count: 36, percentage: 41, icon: MessageCircle },
  { name: '渐进式提示', count: 29, percentage: 33, icon: BarChart3 },
  { name: '理解确认', count: 23, percentage: 26, icon: CalendarDays },
];

export function LogsPage({ assistant, onOpen, onReport, onUse }: { assistant: TeachingAssistant; onOpen: (id: string) => void; onReport: () => void; onUse: () => void }) {
  const [onlyAnomaly, setOnlyAnomaly] = useState(false);
  const sessions = onlyAnomaly ? demoSessions.filter((session) => session.anomaly) : demoSessions;
  const isTrial = assistant.status === 'TRIAL';
  return (
    <main className="logs-page page-frame wide-frame">
      <div className="breadcrumbs"><button>我的助手</button><span>/</span><span>{isTrial ? '试用' : '运行记录'}</span></div>
      <div className="logs-hero">
        <div><div className="logs-title-row"><h1>{assistant.name}</h1><span className={`running-state ${isTrial ? 'trial-state' : ''}`}><i />{isTrial ? '试用中' : '运行中'}</span></div><p>{isTrial ? '已小范围投放给学生，以下展示最近 7 天的学生试用记录与教学技能使用情况。' : '已投入使用，以下展示最近 7 天的运行记录与教学技能使用情况。'}</p></div>
        <div className="logs-hero-actions"><Button variant="outline" onClick={onUse}><Play data-icon="inline-start" />{isTrial ? '打开学生端' : '打开助手'}</Button><Button variant="outline" onClick={onReport}><FileText data-icon="inline-start" />{isTrial ? '查看试用报告' : '生成运行报告'}</Button></div>
      </div>
      <div className="logs-grid">
        <div className="logs-main-column">
          <section className="summary-strip" aria-label="最近七天摘要">
            <div><span className="summary-icon"><CalendarDays /></span><p><strong>最近 7 天</strong><small>统计时段</small></p></div>
            <div><span className="summary-icon"><MessageCircle /></span><p><strong>128 次</strong><small>对话</small></p></div>
            <div><span className="summary-icon"><BarChart3 /></span><p><strong>236 次</strong><small>教学技能触发</small></p></div>
            <div><span className="summary-icon"><TriangleAlert /></span><p><strong>3 次</strong><small>异常</small></p></div>
          </section>
          <section className="run-records">
            <header className="records-head"><h2>{isTrial ? '学生试用记录' : '运行记录'}</h2><button className="range-button"><CalendarDays />最近 7 天<ChevronDown /></button></header>
            <div className="record-filters"><button className={!onlyAnomaly ? 'active' : ''} onClick={() => setOnlyAnomaly(false)}>全部</button><button className={onlyAnomaly ? 'active' : ''} onClick={() => setOnlyAnomaly(true)}>有异常</button></div>
            <div className="session-list">
              {sessions.map((session) => (
                <button className="session-row" key={session.id} onClick={() => onOpen(session.id)}>
                  <span className="session-time"><strong>{session.date}</strong><small>{session.time}</small></span>
                  <span className="session-detail"><strong>学生完成 {session.turns} 轮对话</strong><small>触发教学技能：{session.skills.join('、')}</small></span>
                  <span className={session.anomaly ? 'session-anomaly has' : 'session-anomaly'}>{session.anomaly ? `异常：1 条，${session.anomaly}` : '异常：无'}</span>
                  <ChevronRight />
                </button>
              ))}
            </div>
          </section>
        </div>
        <aside className="logs-side-column">
          <section className="usage-card"><h2>本周教学技能使用</h2>{skillUsage.map(({ name, count, percentage, icon: Icon }) => <div className="usage-row" key={name}><span><Icon /></span><strong>{name}</strong><b>{count} 次</b><small>{percentage}%</small></div>)}</section>
          <section className="latest-report"><h2>{isTrial ? '试用报告' : '最近报告'}</h2><div><span><FileText /></span><p>系统已根据学生使用记录生成 1 份{isTrial ? '试用' : '运行'}报告。<button onClick={onReport}>{isTrial ? '查看试用报告' : '查看报告'} <ChevronRight /></button></p></div></section>
        </aside>
      </div>
    </main>
  );
}
