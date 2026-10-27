import { useCallback, useEffect, useState } from 'react';
import type { ApiError } from '@entrelinhas/api-client';
import type { Post, Site } from '@entrelinhas/contracts';
import { api } from '../../api';
import { usePagedList, type FetchPage } from '../shared/usePagedList';

export const PAGE_SIZE = 4;

type Filter = 'all' | 'unheard';

const fetchPosts: FetchPage<{ siteId: string; filter: Filter }, Post> = (query, cursor, signal) =>
  api.listSitePosts(query.siteId, { filter: query.filter, limit: PAGE_SIZE, ...(cursor ? { cursor } : {}) }, { signal });

interface SiteState {
  site: Site | null;
  error: ApiError | null;
}

// The site header and its posts load independently: the header does not depend on the filter.
export function useSiteDetail(siteId: string, filter: Filter) {
  const list = usePagedList({ siteId, filter }, fetchPosts);
  const [attempt, setAttempt] = useState(0);
  const [siteState, setSiteState] = useState<SiteState>({ site: null, error: null });

  // Another site (or a retry) starts without the previous header, reset during render.
  const siteKey = `${siteId}#${attempt}`;
  const [shownKey, setShownKey] = useState(siteKey);
  if (shownKey !== siteKey) {
    setShownKey(siteKey);
    setSiteState({ site: null, error: null });
  }

  useEffect(() => {
    const abort = new AbortController();
    api.getSite(siteId, { signal: abort.signal }).then(
      (site) => {
        if (!abort.signal.aborted) setSiteState({ site, error: null });
      },
      (e: unknown) => {
        if (!abort.signal.aborted) setSiteState({ site: null, error: e as ApiError });
      },
    );
    return () => abort.abort();
  }, [siteId, attempt]);

  const { retry: retryList } = list;
  const retry = useCallback(() => {
    if (siteState.error) setAttempt((n) => n + 1);
    retryList();
  }, [siteState.error, retryList]);

  const { site, error: siteError } = siteState;
  const status = siteError ? 'error' : !site && list.status !== 'error' ? 'loading' : list.status;

  return {
    site,
    posts: list.items,
    total: list.total,
    nextCursor: list.nextCursor,
    status,
    error: siteError ?? list.error,
    loadMore: list.loadMore,
    retry,
  };
}
