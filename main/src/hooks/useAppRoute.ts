import { useEffect, useState } from 'react';
import { readRoute } from '@/lib/routes';

export function useAppRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const sync = () => setRoute(readRoute());
    window.addEventListener('hashchange', sync);
    if (!window.location.hash) window.history.replaceState(null, '', '#/library');
    sync();
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  return route;
}
