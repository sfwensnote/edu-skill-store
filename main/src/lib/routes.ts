export type AppRoute =
  | { page: 'library' }
  | { page: 'library-detail'; assistantId: string }
  | { page: 'mine' }
  | { page: 'create'; assistantId: string }
  | { page: 'test'; assistantId: string }
  | { page: 'use'; assistantId: string }
  | { page: 'trial-preview'; assistantId: string; from: 'logs' | 'report' }
  | { page: 'logs'; assistantId: string }
  | { page: 'log-detail'; assistantId: string; sessionId: string }
  | { page: 'report'; assistantId: string };

export function readRoute(hash = window.location.hash): AppRoute {
  const from = hash.split('?')[1] === 'from=report' ? 'report' : 'logs';
  const parts = hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean);
  if (!parts.length || parts[0] === 'community' || parts[0] === 'library') {
    return parts[1]
      ? { page: 'library-detail', assistantId: parts[1] }
      : { page: 'library' };
  }
  if (parts[0] === 'mine') return { page: 'mine' };
  if (parts[0] === 'create') return { page: 'create', assistantId: parts[1] || 'new' };
  if (parts[0] === 'assistant' && parts[1]) {
    if (parts[2] === 'test') return { page: 'test', assistantId: parts[1] };
    if (parts[2] === 'student-preview') return { page: 'trial-preview', assistantId: parts[1], from };
    if (parts[2] === 'use') return { page: 'use', assistantId: parts[1] };
    if (parts[2] === 'logs' && parts[3]) {
      return { page: 'log-detail', assistantId: parts[1], sessionId: parts[3] };
    }
    if (parts[2] === 'logs') return { page: 'logs', assistantId: parts[1] };
    if (parts[2] === 'report') return { page: 'report', assistantId: parts[1] };
  }
  return { page: 'library' };
}

export function routeHash(route: AppRoute) {
  switch (route.page) {
    case 'library': return '#/library';
    case 'library-detail': return `#/library/${route.assistantId}`;
    case 'mine': return '#/mine';
    case 'create': return `#/create/${route.assistantId}`;
    case 'test': return `#/assistant/${route.assistantId}/test`;
    case 'use': return `#/assistant/${route.assistantId}/use`;
    case 'trial-preview': return `#/assistant/${route.assistantId}/student-preview?from=${route.from}`;
    case 'logs': return `#/assistant/${route.assistantId}/logs`;
    case 'log-detail': return `#/assistant/${route.assistantId}/logs/${route.sessionId}`;
    case 'report': return `#/assistant/${route.assistantId}/report`;
  }
}

export function goTo(route: AppRoute, replace = false) {
  const hash = routeHash(route);
  if (replace) window.history.replaceState(null, '', hash);
  else window.location.hash = hash.slice(1);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  window.scrollTo({ top: 0, behavior: 'instant' });
}
