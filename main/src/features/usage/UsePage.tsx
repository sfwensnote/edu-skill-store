import { ArrowLeft, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import type { TeachingAssistant } from '../../../shared/assistant';

export function UsePage({ assistant, onBack }: { assistant: TeachingAssistant; onBack: () => void }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: '把你正在思考的题目和步骤发给我，我们一起找到下一步。' }]);
  const [value, setValue] = useState('');
  function send() {
    if (!value.trim()) return;
    setMessages((items) => [...items, { role: 'user', content: value }, { role: 'assistant', content: '先不急着看答案。你能说说你从原式到当前结果的计算过程吗？' }]);
    setValue('');
  }
  return <main className="use-page page-frame narrow-frame"><button className="back-link" onClick={onBack}><ArrowLeft />返回运行记录</button><div className="use-heading"><h1>{assistant.name}</h1><p>{assistant.goal}</p></div><section className="student-chat">{messages.map((message, index) => <div className={`student-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === 'user' ? '学生' : '教学助手'}</span><p>{message.content}</p></div>)}</section><div className="student-composer"><textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="输入题目或你的解题过程……" aria-label="学生问题" /><button onClick={send} disabled={!value.trim()} aria-label="发送问题"><ArrowUp /></button></div></main>;
}
