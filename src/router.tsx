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

/**
 * Parses route information from location object.
 * Supports both clean path routing (/search, /submit, /my-reports, /about)
 * and hash routing (#/search, #/submit, etc.), ensuring compatibility
 * with direct URL visits, browser refreshes, and existing hash links.
 */
export function parseRouteFromLocation(location: {
  pathname?: string;
  search?: string;
  hash?: string;
}): AppRoute {
  const hash = location.hash || '';
  const cleanHash = hash.replace(/^#\/?/, '').trim();

  let routePath = '';
  let queryString = '';

  // 1. If a non-empty hash route exists (e.g. #/search, #search, #/report/123), prioritize it
  if (cleanHash) {
    const [hPath, hQuery] = cleanHash.split('?');
    routePath = hPath;
    queryString = hQuery || '';
  } else {
    // 2. Otherwise fallback to pathname and search query (e.g. /search, /submit, /my-reports, /about)
    const rawPath = location.pathname || '';
    const cleanPath = rawPath.replace(/^\/+|\/+$/g, '');
    routePath = cleanPath;
    queryString = (location.search || '').replace(/^\?/, '');
  }

  const params = new URLSearchParams(queryString);
  const segments = routePath.split('/').filter(Boolean);

  if (segments.length === 0 || segments[0] === '') {
    return { name: 'home' };
  }

  const rootSegment = segments[0].toLowerCase();

  if (rootSegment === 'search') {
    return {
      name: 'search',
      query: params.get('q') || undefined,
      category: params.get('cat') || undefined,
      status: params.get('status') || undefined,
    };
  }

  if (rootSegment === 'report' && segments[1]) {
    return { name: 'report-detail', id: decodeURIComponent(segments[1]) };
  }

  if (rootSegment === 'submit') {
    return {
      name: 'submit',
      initialLocation: params.get('loc') || undefined,
      initialCategory: params.get('cat') || undefined,
    };
  }

  if (rootSegment === 'my-reports') {
    return { name: 'my-reports' };
  }

  if (rootSegment === 'moderation') {
    return {
      name: 'moderation',
      focusId: params.get('id') || undefined,
    };
  }

  if (rootSegment === 'about') {
    return { name: 'about' };
  }

  return { name: 'home' };
}

/**
 * Backwards compatibility alias for parsing hash string directly
 */
export function parseHash(hash: string): AppRoute {
  return parseRouteFromLocation({ hash });
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<AppRoute>(() =>
    typeof window !== 'undefined' ? parseRouteFromLocation(window.location) : { name: 'home' }
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(parseRouteFromLocation(window.location));
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = (to: string) => {
    const formatted = to.startsWith('#') ? to : `#/${to.replace(/^\//, '')}`;
    // If the user arrived directly via a clean pathname route (e.g. /search),
    // normalize the pathname to '/' when navigating to keep the address bar clean
    if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/') {
      try {
        window.history.replaceState(null, '', '/' + formatted);
      } catch {
        // Safe fallback in restricted environments
      }
    }
    window.location.hash = formatted;
    setRoute(parseRouteFromLocation(window.location));
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
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
