import { ArrowRight, Check, CircleDot } from 'lucide-react';
import type { DemoTestCase } from './testData';
import { Button } from '@/components/ui/button';

export function TestCaseRecord({ testCase, index, total, paused, onConfirm }: { testCase: DemoTestCase; index: number; total: number; paused: boolean; onConfirm: () => void }) {
  return (
    <section className="test-record">
      <div className="test-kicker">测试情境 {index + 1} / {total}</div>
      <div className="test-case-head"><span>当前测试</span><h1>{testCase.title}</h1></div>
      <p className="scenario-copy">{testCase.scenario}</p>
      {!testCase.methodReview && <div className="test-question"><span>题目</span><strong>解方程：3x + 6 = 12</strong></div>}
      <div className="simulation-flow">
        <div className="simulation-line student"><span className="speaker">学生（模拟）</span><p>{testCase.studentInput}</p></div>
        <div className="flow-line"><CircleDot /></div>
        <div className="simulation-line assistant"><span className="speaker">教学助手</span><p>{testCase.assistantOutput}</p></div>
      </div>
      <div className="check-list"><h2>当前检查</h2>{testCase.checks.map((check) => <p key={check}><Check />{check}</p>)}{testCase.attention && <p className="attention-note">{testCase.attention}</p>}</div>
      <div className="case-confirmation"><div><strong>请确认本项检测结果</strong><span>确认后系统才会进入下一个测试情境。</span></div><Button size="lg" onClick={onConfirm} disabled={paused}>{index === total - 1 ? '确认本次结果，完成检测' : '确认本次结果，检测下一项'}<ArrowRight data-icon="inline-end" /></Button></div>
    </section>
  );
}
