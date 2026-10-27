import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiError } from '@entrelinhas/api-client';

export interface Page<T> {
  items: T[];
  next_cursor: string | null;
  total: number;
}

// `cursor` set means "next page of the snapshot the server returned for this query" (CA22).
export type FetchPage<Q, T> = (query: Q, cursor: string | undefined, signal: AbortSignal) => Promise<Page<T>>;

type Status = 'idle' | 'loading' | 'ready' | 'loading-more' | 'error';

interface ListState<T> {
  items: T[];
  total: number;
  nextCursor: string | null;
  status: Status;
  error: ApiError | null;
}

// The shared api-client rejects only with ApiError (transport, contract and HTTP errors alike).
const asApiError = (e: unknown) => e as ApiError;

// First page for the current query, then cursor pages over the server snapshot. A query change
// aborts in-flight requests, and any answer for an aborted request is ignored, so stale pages never
// mix with new results. A null query stays idle.
// `fetchPage` must be stable (module-level), the query is compared by value.
export function usePagedList<Q, T>(query: Q | null, fetchPage: FetchPage<Q, T>) {
  const initial = (): ListState<T> => ({ items: [], total: 0, nextCursor: null, status: query === null ? 'idle' : 'loading', error: null });
  const [state, setState] = useState<ListState<T>>(initial);
  const [attempt, setAttempt] = useState(0);
  const controller = useRef(new AbortController());
  const failedMore = useRef(false);
  const key = JSON.stringify(query);

  // A new query (or a retry) starts from an empty state, reset during render rather than in the effect.
  const requestKey = `${key}#${attempt}`;
  const [shownKey, setShownKey] = useState(requestKey);
  if (shownKey !== requestKey) {
    setShownKey(requestKey);
    setState(initial());
  }

  useEffect(() => {
    const abort = new AbortController();
    controller.current = abort;
    failedMore.current = false;
    const current = JSON.parse(key) as Q | null;
    if (current === null) return () => abort.abort();
    fetchPage(current, undefined, abort.signal).then(
      (page) => {
        if (!abort.signal.aborted) setState({ items: page.items, total: page.total, nextCursor: page.next_cursor, status: 'ready', error: null });
      },
      (e: unknown) => {
        if (!abort.signal.aborted) setState((s) => ({ ...s, items: [], total: 0, nextCursor: null, status: 'error', error: asApiError(e) }));
      },
    );
    return () => abort.abort();
  }, [key, attempt, fetchPage]);

  const loadMore = useCallback(() => {
    const cursor = state.nextCursor;
    if (!cursor) return;
    const signal = controller.current.signal;
    failedMore.current = false;
    setState((s) => ({ ...s, status: 'loading-more', error: null }));
    fetchPage(JSON.parse(key) as Q, cursor, signal).then(
      (page) => {
        if (signal.aborted) return;
        setState((s) => ({ items: [...s.items, ...page.items], total: page.total, nextCursor: page.next_cursor, status: 'ready', error: null }));
      },
      (e: unknown) => {
        if (signal.aborted) return;
        failedMore.current = true;
        setState((s) => ({ ...s, status: 'error', error: asApiError(e) }));
      },
    );
  }, [state.nextCursor, key, fetchPage]);

  // Retry repeats whatever failed: the next page when items are already shown, otherwise the first page.
  const retry = useCallback(() => {
    if (failedMore.current) loadMore();
    else setAttempt((n) => n + 1);
  }, [loadMore]);

  return { ...state, loadMore, retry };
}
