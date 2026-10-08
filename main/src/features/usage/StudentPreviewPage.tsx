import { ArrowLeft, ArrowUp, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { TeachingAssistant } from '../../../shared/assistant';
import { Button } from '@/components/ui/button';

type PreviewMessage = { role: 'student' | 'assistant'; content: string };

function isEquationDemo(assistant: TeachingAssistant) {
  return assistant.subject === '数学' && /方程/.test(`${assistant.activity} ${assistant.goal}`);
}

function initialMessages(equationDemo: boolean): PreviewMessage[] {
  return equationDemo ? [
    { role: 'assistant', content: '我们一起看看这道题：3x + 6 = 12。你已经算到哪一步了？' },
    { role: 'student', content: '我算出来 x = 9，但老师说不对。' },
    { role: 'assistant', content: '先不急着改答案。你能说说从 3x + 6 = 12 到 x = 9，你是怎样计算的吗？' },
  ] : [
    { role: 'assistant', content: '请说说你正在处理的问题，以及你已经尝试过什么。' },
  ];
}

function fixedReply(input: string, equationDemo: boolean): string {
  if (!equationDemo) return '【前端示例】你的输入已显示在学生视角中。这个学科尚未配置固定对话回复。';
  if (/12\s*\+\s*6|移到右边|移项/.test(input))
    return '你已经说出了关键一步。为了消去左边的 +6，等式两边应该同时做加法还是减法？先试着写出这一步。';
  if (/两边.*减|减去\s*6|减\s*6/.test(input))
    return '对，等式两边同时减去 6，仍能保持相等。现在请你写出新的等式，再试着求出 x。';
  if (/不会|提示|不知道|卡住/.test(input))
    return '先看等式左边的 +6。你想让它消失时，等式两边可以同时做什么操作？';
  return '先不急着看答案。请把你目前的计算过程写出来，我们从你不确定的那一步开始。';
}

export function StudentPreviewPage({ assistant, onBack, from }: {
  assistant: TeachingAssistant; onBack: () => void; from: 'logs' | 'report';
}) {
  const equationDemo = isEquationDemo(assistant);
  const [messages, setMessages] = useState<PreviewMessage[]>(() => initialMessages(equationDemo));
  const [value, setValue] = useState('');
  function send() {
    const input = value.trim();
    if (!input) return;
    setMessages((items) => [...items, { role: 'student', content: input }, { role: 'assistant', content: fixedReply(input, equationDemo) }]);
    setValue('');
  }
  function reset() {
    setMessages(initialMessages(equationDemo));
    setValue('');
  }
  return <main className="student-preview-page page-frame narrow-frame">
    <button className="back-link" onClick={onBack}><ArrowLeft />返回{from === 'report' ? '试用报告' : '试用记录'}</button>
    <header className="student-preview-heading"><span>教师试用 · 学生视角演示</span><h1>{assistant.name}</h1><p>{assistant.goal}</p></header>
    <div className="preview-notice">这是教师查看的前端演示。下方对话使用固定示例回复，不连接学生账号或真实模型。</div>
    <section className="student-chat preview-chat" aria-label="学生视角对话">
      {messages.map((message, index) => <div className={`student-message ${message.role === 'student' ? 'user' : 'assistant'}`} key={index}>
        <span>{message.role === 'student' ? '学生' : '教学助手'}</span><p>{message.content}</p>
      </div>)}
    </section>
    <div className="student-composer preview-composer"><label className="sr-only" htmlFor="preview-student-input">以学生身份输入</label>
      <textarea id="preview-student-input" value={value} maxLength={500} onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') send(); }}
        placeholder="以学生身份输入题目或解题过程……" />
      <button onClick={send} disabled={!value.trim()} aria-label="发送学生问题"><ArrowUp /></button>
    </div>
    <div className="preview-under-chat"><div className="preview-suggestions"><span>试用示例</span>
      {(equationDemo ? ['我把左边的 6 移到右边，算成了 12 + 6。', '我还是不知道下一步怎么做。', '应该两边都减去 6 吗？'] : ['我遇到了困难，想请你帮我看看。']).map((sample) =>
        <button key={sample} onClick={() => setValue(sample)}>{sample}</button>)}
    </div><Button variant="ghost" size="sm" onClick={reset}><RotateCcw data-icon="inline-start" />重新开始</Button></div>
  </main>;
}
