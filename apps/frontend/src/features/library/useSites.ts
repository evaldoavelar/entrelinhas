import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@entrelinhas/api-client';
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

const toApiError = (e: unknown) => (e instanceof ApiError ? e : new ApiError({ status: 0, code: 'unknown', message: 'Erro inesperado' }));

// First page for the current filters, then cursor pages over the server snapshot (CA22).
// A filter change aborts in-flight requests so stale pages never mix with new results.
export function useSites(query: Omit<SitesQuery, 'cursor' | 'limit'>) {
  const [state, setState] = useState<SitesState>(initial);
  const [attempt, setAttempt] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const failedMore = useRef(false);
  const key = JSON.stringify(query);

  useEffect(() => {
    const abort = new AbortController();
    controller.current = abort;
    setState(initial);
    api.listSites({ ...(JSON.parse(key) as SitesQuery), limit: PAGE_SIZE }, { signal: abort.signal }).then(
      (page) => setState({ items: page.items, total: page.total, nextCursor: page.next_cursor, status: 'ready', error: null }),
      (e: unknown) => {
        if (!abort.signal.aborted) setState({ ...initial, status: 'error', error: toApiError(e) });
      },
    );
    return () => abort.abort();
  }, [key, attempt]);

  const loadMore = useCallback(() => {
    const cursor = state.nextCursor;
    if (!cursor || !controller.current) return;
    const signal = controller.current.signal;
    failedMore.current = false;
    setState((s) => ({ ...s, status: 'loading-more', error: null }));
    api.listSites({ cursor, limit: PAGE_SIZE }, { signal }).then(
      (page) =>
        setState((s) => ({ items: [...s.items, ...page.items], total: page.total, nextCursor: page.next_cursor, status: 'ready', error: null })),
      (e: unknown) => {
        if (signal.aborted) return;
        failedMore.current = true;
        setState((s) => ({ ...s, status: 'error', error: toApiError(e) }));
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
