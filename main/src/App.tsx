import { useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { LibraryPage } from '@/features/library/LibraryPage';
import { LibraryDetailPage } from '@/features/library/LibraryDetailPage';
import { MyAssistantsPage } from '@/features/library/MyAssistantsPage';
import { DesignerPage } from '@/features/designer/DesignerPage';
import { TestingPage } from '@/features/testing/TestingPage';
import { LogsPage } from '@/features/usage/LogsPage';
import { LogDetailPage } from '@/features/usage/LogDetailPage';
import { ReportPage } from '@/features/usage/ReportPage';
import { UsePage } from '@/features/usage/UsePage';
import { StudentPreviewPage } from '@/features/usage/StudentPreviewPage';
import { libraryAssistants } from '@/data/platform';
import { useDemoPlatform } from '@/hooks/useDemoPlatform';
import { useAppRoute } from '@/hooks/useAppRoute';
import { goTo, type AppRoute } from '@/lib/routes';

export default function App() {
  const route = useAppRoute();
  const platform = useDemoPlatform();
  const routeAssistantId = 'assistantId' in route ? route.assistantId : '';

  useEffect(() => {
    if (route.page === 'create' && !platform.getAssistant(route.assistantId)) {
      platform.ensureAssistant(route.assistantId);
    }
  }, [route.page, routeAssistantId]);

  function navigate(next: AppRoute) {
    goTo(next);
  }

  function openMine(id: string) {
    const assistant = platform.getAssistant(id);
    if (!assistant) return;
    if (assistant.status === 'DRAFT') navigate({ page: 'create', assistantId: id });
    else if (assistant.status === 'GENERATED' || assistant.status === 'TESTED') navigate({ page: 'test', assistantId: id });
    else navigate({ page: 'logs', assistantId: id });
  }

  const publishedAssistants = platform.assistants.filter((assistant) => assistant.isPublic && assistant.status === 'ACTIVE');
  const publishedIds = new Set(publishedAssistants.map((assistant) => assistant.id));
  const publicLibrary = [...publishedAssistants, ...libraryAssistants.filter((assistant) => !publishedIds.has(assistant.id))];
  const current = routeAssistantId ? platform.getAssistant(routeAssistantId) : undefined;
  const publicAssistant = routeAssistantId ? publicLibrary.find((item) => item.id === routeAssistantId) : undefined;

  return (
    <div className="application">
      <AppHeader route={route} onNavigate={navigate} />
      {route.page === 'library' && <LibraryPage assistants={publicLibrary} onOpen={(id) => navigate({ page: 'library-detail', assistantId: id })} />}
      {route.page === 'library-detail' && publicAssistant && (
        <LibraryDetailPage assistant={publicAssistant} onBack={() => navigate({ page: 'library' })} onUse={() => navigate({ page: 'use', assistantId: publicAssistant.id })} />
      )}
      {route.page === 'mine' && (
        <MyAssistantsPage
          assistants={platform.assistants}
          onOpen={(assistant) => openMine(assistant.id)}
          onCreate={() => navigate({ page: 'create', assistantId: `assistant-${Date.now()}` })}
          onDelete={platform.removeAssistant}
        />
      )}
      {route.page === 'create' && current && (
        <DesignerPage
          key={current.id}
          assistant={current}
          onBack={() => navigate({ page: 'library' })}
          onSaveExit={() => navigate({ page: 'mine' })}
          onUpdate={(patch) => platform.updateAssistant(current.id, patch)}
          onStartTest={() => navigate({ page: 'test', assistantId: current.id })}
          isSkillIncluded={(skillId) => platform.isSkillIncluded(current.id, skillId)}
          onToggleSkill={(skillId) => platform.toggleSkill(current.id, skillId)}
        />
      )}
      {route.page === 'test' && current && (
        <TestingPage
          key={current.id + current.updatedAt}
          assistant={{ ...current, skills: current.skills.filter((skill) => platform.isSkillIncluded(current.id, skill.id)) }}
          onBack={() => navigate({ page: 'create', assistantId: current.id })}
          onComplete={() => platform.setStatus(current.id, 'TESTED')}
          onStartTrial={() => { platform.setStatus(current.id, 'TRIAL'); navigate({ page: 'logs', assistantId: current.id }); }}
          onCreated={current.skills.some((skill) => skill.steps) ? () => navigate({ page: 'mine' }) : undefined}
        />
      )}
      {route.page === 'logs' && current && (
        <LogsPage
          assistant={current}
          onOpen={(sessionId) => navigate({ page: 'log-detail', assistantId: current.id, sessionId })}
          onReport={() => navigate({ page: 'report', assistantId: current.id })}
          onUse={() => navigate(current.status === 'TRIAL' ? { page: 'trial-preview', assistantId: current.id, from: 'logs' } : { page: 'use', assistantId: current.id })}
        />
      )}
      {route.page === 'log-detail' && current && <LogDetailPage assistant={current} sessionId={route.sessionId} onBack={() => navigate({ page: 'logs', assistantId: current.id })} />}
      {route.page === 'report' && current && <ReportPage assistant={current} onBack={() => navigate({ page: 'logs', assistantId: current.id })} onOpenPreview={() => navigate({ page: 'trial-preview', assistantId: current.id, from: 'report' })} onPublish={current.status === 'TRIAL' ? () => { platform.publishAssistant(current.id); navigate({ page: 'library-detail', assistantId: current.id }); } : undefined} />}
      {route.page === 'trial-preview' && current && <StudentPreviewPage key={current.id} assistant={current} onBack={() => navigate({ page: route.from, assistantId: current.id })} from={route.from} />}
      {route.page === 'use' && (current || publicAssistant) && <UsePage assistant={(current || publicAssistant)!} onBack={() => current ? navigate({ page: 'logs', assistantId: current.id }) : navigate({ page: 'library-detail', assistantId: publicAssistant!.id })} />}
      {['library-detail', 'test', 'use', 'logs', 'log-detail', 'report', 'trial-preview'].includes(route.page) && !current && !publicAssistant && (
        <main className="not-found page-frame"><h1>没有找到这个助手</h1><button onClick={() => navigate({ page: 'library' })}>返回助手库</button></main>
      )}
    </div>
  );
}
