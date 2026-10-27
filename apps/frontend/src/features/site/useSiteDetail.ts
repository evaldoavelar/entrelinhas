import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiError } from '@entrelinhas/api-client';
import type { Post, Site } from '@entrelinhas/contracts';
import { api } from '../../api';

export const PAGE_SIZE = 2;

type Status = 'loading' | 'ready' | 'loading-more' | 'error';

interface SiteDetailState {
  site: Site | null;
  posts: Post[];
  total: number;
  nextCursor: string | null;
  status: Status;
  error: ApiError | null;
}

const initial: SiteDetailState = {
  site: null,
  posts: [],
  total: 0,
  nextCursor: null,
  status: 'loading',
  error: null,
};

const asApiError = (e: unknown) => e as ApiError;

export function useSiteDetail(siteId: string, filter: 'all' | 'unheard') {
  const [state, setState] = useState<SiteDetailState>(initial);
  const [attempt, setAttempt] = useState(0);
  const controller = useRef(new AbortController());
  const failedMore = useRef(false);

  // New filters (or a retry) start from an empty loading state, reset during render.
  const requestKey = `${siteId}#${filter}#${attempt}`;
  const [shownKey, setShownKey] = useState(requestKey);
  if (shownKey !== requestKey) {
    setShownKey(requestKey);
    setState(initial);
  }

  useEffect(() => {
    const abort = new AbortController();
    controller.current = abort;
    failedMore.current = false;

    Promise.all([
      api.getSite(siteId, { signal: abort.signal }),
      api.listSitePosts(siteId, { filter, limit: PAGE_SIZE }, { signal: abort.signal }),
    ]).then(
      ([site, page]) => {
        setState({
          site,
          posts: page.items,
          total: page.total,
          nextCursor: page.next_cursor,
          status: 'ready',
          error: null,
        });
      },
      (e: unknown) => {
        if (!abort.signal.aborted) {
          setState((s) => ({ ...s, status: 'error', error: asApiError(e) }));
        }
      },
    );

    return () => abort.abort();
  }, [siteId, filter, attempt]);

  const loadMore = useCallback(() => {
    const cursor = state.nextCursor;
    if (!cursor) return;
    const signal = controller.current.signal;
    failedMore.current = false;
    setState((s) => ({ ...s, status: 'loading-more', error: null }));

    api.listSitePosts(siteId, { filter, cursor, limit: PAGE_SIZE }, { signal }).then(
      (page) => {
        setState((s) => ({
          ...s,
          posts: [...s.posts, ...page.items],
          total: page.total,
          nextCursor: page.next_cursor,
          status: 'ready',
          error: null,
        }));
      },
      (e: unknown) => {
        if (signal.aborted) return;
        failedMore.current = true;
        setState((s) => ({ ...s, status: 'error', error: asApiError(e) }));
      },
    );
  }, [siteId, filter, state.nextCursor]);

  const retry = useCallback(() => {
    if (failedMore.current) loadMore();
    else setAttempt((n) => n + 1);
  }, [loadMore]);

  return { ...state, loadMore, retry };
}
