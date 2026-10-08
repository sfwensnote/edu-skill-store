import { BookOpen, Plus } from 'lucide-react';
import type { AppRoute } from '@/lib/routes';
import { Button } from '@/components/ui/button';

type Props = {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

export function AppHeader({ route, onNavigate }: Props) {
  const isLibrary = route.page === 'library' || route.page === 'library-detail';
  const isMine = !isLibrary && route.page !== 'create';
  return (
    <header className="app-header">
      <div className="header-inner">
        <button className="brand" onClick={() => onNavigate({ page: 'library' })} aria-label="返回助手库">
          <BookOpen aria-hidden="true" />
          <span>教学助手</span>
        </button>
        <nav className="header-nav" aria-label="主要导航">
          <button className={isLibrary ? 'active' : ''} onClick={() => onNavigate({ page: 'library' })}>
            助手库
          </button>
          <button className={isMine ? 'active' : ''} onClick={() => onNavigate({ page: 'mine' })}>
            我的助手
          </button>
        </nav>
        <div className="header-actions">
          <Button onClick={() => onNavigate({ page: 'create', assistantId: `assistant-${Date.now()}` })}>
            <Plus data-icon="inline-start" />
            创建助手
          </Button>
          <button className="teacher-avatar" aria-label="教师账户" title="张老师">张</button>
        </div>
      </div>
    </header>
  );
}
