import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiError } from '@entrelinhas/api-client';
import type { Site, SitesQuery } from '@entrelinhas/contracts';
import { api } from '../../api';

export const PAGE_SIZE = 6;

type Status = 'loading' | 'ready' | 'loading-more' | 'error';

interface SitesState {
  items: Site[];
  total: number;
  nextCursor: string | null;
  status: Status;
  error: ApiError | null;
}

const initial: SitesState = { items: [], total: 0, nextCursor: null, status: 'loading', error: null };

// The shared api-client rejects only with ApiError (transport, contract and HTTP errors alike).
const asApiError = (e: unknown) => e as ApiError;

// First page for the current filters, then cursor pages over the server snapshot (CA22).
// A filter change aborts in-flight requests so stale pages never mix with new results.
export function useSites(query: Omit<SitesQuery, 'cursor' | 'limit'>) {
  const [state, setState] = useState<SitesState>(initial);
  const [attempt, setAttempt] = useState(0);
  const controller = useRef(new AbortController());
  const failedMore = useRef(false);
  const key = JSON.stringify(query);

  // New filters (or a retry) start from an empty loading state, reset during render rather than in the effect.
  const requestKey = `${key}#${attempt}`;
  const [shownKey, setShownKey] = useState(requestKey);
  if (shownKey !== requestKey) {
    setShownKey(requestKey);
    setState(initial);
  }

  useEffect(() => {
    const abort = new AbortController();
    controller.current = abort;
    failedMore.current = false;
    api.listSites({ ...(JSON.parse(key) as SitesQuery), limit: PAGE_SIZE }, { signal: abort.signal }).then(
      (page) => setState({ items: page.items, total: page.total, nextCursor: page.next_cursor, status: 'ready', error: null }),
      (e: unknown) => {
        if (!abort.signal.aborted) setState({ ...initial, status: 'error', error: asApiError(e) });
      },
    );
    return () => abort.abort();
  }, [key, attempt]);

  const loadMore = useCallback(() => {
    const cursor = state.nextCursor;
    if (!cursor) return;
    const signal = controller.current.signal;
    failedMore.current = false;
    setState((s) => ({ ...s, status: 'loading-more', error: null }));
    api.listSites({ cursor, limit: PAGE_SIZE }, { signal }).then(
      (page) =>
        setState((s) => ({ items: [...s.items, ...page.items], total: page.total, nextCursor: page.next_cursor, status: 'ready', error: null })),
      (e: unknown) => {
        if (signal.aborted) return;
        failedMore.current = true;
        setState((s) => ({ ...s, status: 'error', error: asApiError(e) }));
      },
    );
  }, [state.nextCursor]);

  // Retry repeats whatever failed: the next page when items are already shown, otherwise the first page.
  const retry = useCallback(() => {
    if (failedMore.current) loadMore();
    else setAttempt((n) => n + 1);
  }, [loadMore]);

  return { ...state, loadMore, retry };
}
