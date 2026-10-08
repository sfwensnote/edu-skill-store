import { ArrowLeft, BarChart3, CheckCircle2, Play, Upload, TriangleAlert } from 'lucide-react';
import type { TeachingAssistant } from '../../../shared/assistant';
import { Button } from '@/components/ui/button';

export function ReportPage({ assistant, onBack, onOpenPreview, onPublish }: { assistant: TeachingAssistant; onBack: () => void; onOpenPreview: () => void; onPublish?: () => void }) {
  const isTrial = assistant.status === 'TRIAL';
  return (
    <main className="report-page-new page-frame narrow-frame">
      <button className="back-link" onClick={onBack}><ArrowLeft />{isTrial ? '返回试用' : '返回运行记录'}</button>
      <div className="report-heading"><span>{isTrial ? '学生试用' : '最近 7 天'}</span><h1>{assistant.name}{isTrial ? '试用报告' : '运行报告'}</h1><p>2026/09/03—2026/09/09</p>{isTrial && <Button variant="outline" onClick={onOpenPreview}><Play data-icon="inline-start" />打开学生端</Button>}</div>
      <section className="report-lead"><CheckCircle2 /><div><h2>{isTrial ? '试用表现基本稳定' : '整体运行稳定'}</h2><p>共完成 128 次学生对话，教学技能触发 236 次。大多数回复符合已设定的教学行为，3 次异常需要关注。</p></div></section>
      <div className="report-sections"><section><h2><BarChart3 />教学技能使用情况</h2><div className="report-table"><p><span>错误后反思引导</span><strong>36 次</strong><small>41%</small></p><p><span>渐进式提示</span><strong>29 次</strong><small>33%</small></p><p><span>理解确认</span><strong>23 次</strong><small>26%</small></p></div></section><section><h2><TriangleAlert />需要关注的问题</h2><ul><li>有 2 次对话中的第二次提示过于直接。</li><li>有 1 次对话未能识别学生的知识点混淆。</li></ul><p className="report-advice">建议返回设计器，补充第二次提示的具体边界，再重新检测。</p></section></div>
      {isTrial && onPublish && (
        <section className="report-publish">
          <div><h2>准备公开发布</h2><p>发布后，其他教师可以在助手库中发现并使用这个助手。</p></div>
          <Button size="lg" onClick={onPublish}><Upload data-icon="inline-start" />发布到助手库</Button>
        </section>
      )}
    </main>
  );
}
