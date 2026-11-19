import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppRoute =
  | { name: 'home' }
  | { name: 'search'; query?: string; category?: string; status?: string }
  | { name: 'report-detail'; id: string }
  | { name: 'submit'; initialLocation?: string; initialCategory?: string }
  | { name: 'my-reports' }
  | { name: 'moderation'; focusId?: string }
  | { name: 'about' };

interface RouterContextType {
  route: AppRoute;
  navigate: (to: string) => void;
  navigateToReport: (id: string) => void;
  navigateToSearch: (params?: { query?: string; category?: string; status?: string }) => void;
  navigateToSubmit: (initial?: { location?: string; category?: string }) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function parseHash(hash: string): AppRoute {
  const cleanHash = hash.replace(/^#\/?/, '') || '';
  const [path, queryString] = cleanHash.split('?');
  const params = new URLSearchParams(queryString || '');

  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0 || segments[0] === '') {
    return { name: 'home' };
  }

  if (segments[0] === 'search') {
    return {
      name: 'search',
      query: params.get('q') || undefined,
      category: params.get('cat') || undefined,
      status: params.get('status') || undefined,
    };
  }

  if (segments[0] === 'report' && segments[1]) {
    return { name: 'report-detail', id: decodeURIComponent(segments[1]) };
  }

  if (segments[0] === 'submit') {
    return {
      name: 'submit',
      initialLocation: params.get('loc') || undefined,
      initialCategory: params.get('cat') || undefined,
    };
  }

  if (segments[0] === 'my-reports') {
    return { name: 'my-reports' };
  }

  if (segments[0] === 'moderation') {
    return {
      name: 'moderation',
      focusId: params.get('id') || undefined,
    };
  }

  if (segments[0] === 'about') {
    return { name: 'about' };
  }

  return { name: 'home' };
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<AppRoute>(() =>
    typeof window !== 'undefined' ? parseHash(window.location.hash) : { name: 'home' }
  );

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to: string) => {
    const formatted = to.startsWith('#') ? to : `#/${to.replace(/^\//, '')}`;
    window.location.hash = formatted;
    setRoute(parseHash(formatted));
    window.scrollTo(0, 0);
  };

  const navigateToReport = (id: string) => {
    navigate(`#/report/${encodeURIComponent(id)}`);
  };

  const navigateToSearch = (params?: { query?: string; category?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('q', params.query);
    if (params?.category && params.category !== 'All') searchParams.set('cat', params.category);
    if (params?.status && params.status !== 'All') searchParams.set('status', params.status);
    const qs = searchParams.toString();
    navigate(`#/search${qs ? `?${qs}` : ''}`);
  };

  const navigateToSubmit = (initial?: { location?: string; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (initial?.location) searchParams.set('loc', initial.location);
    if (initial?.category) searchParams.set('cat', initial.category);
    const qs = searchParams.toString();
    navigate(`#/submit${qs ? `?${qs}` : ''}`);
  };

  return (
    <RouterContext.Provider
      value={{ route, navigate, navigateToReport, navigateToSearch, navigateToSubmit }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

