import { act, renderHook, waitFor } from '@testing-library/react';
import type { SitesQuery } from '@entrelinhas/contracts';
import { db } from '../../mocks/db';
import { setScenario } from '../../mocks/scenario';
import { useSites } from './useSites';

type Query = Omit<SitesQuery, 'cursor' | 'limit'>;
const render = (query: Query) => renderHook((q: Query) => useSites(q), { initialProps: query });
beforeEach(() => {
  db.sessionProfileId = 'prof_evaldo';
});

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

test('retry after a failed first page loads it again', async () => {
  setScenario('unavailable');
  const { result } = render({ sort: 'last_conversion', order: 'desc' });
  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.error?.status).toBe(503);
  setScenario('default');
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.items).toHaveLength(6);
});

test('load more without a next page does nothing', async () => {
  const { result } = render({ sort: 'last_conversion', order: 'desc', q: 'submarino' });
  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.nextCursor).toBeNull();
  act(() => result.current.loadMore());
  expect(result.current.status).toBe('ready');
  expect(result.current.items).toHaveLength(3);
});

test('a first page aborted by a filter change is not reported as an error', async () => {
  setScenario('slow');
  const { result, rerender } = render({ sort: 'last_conversion', order: 'desc' });
  rerender({ sort: 'name', order: 'asc' });
  await settle();
  expect(result.current.status).toBe('loading');
  expect(result.current.error).toBeNull();
});

test('a next page aborted by a filter change is not reported as an error', async () => {
  const { result, rerender } = render({ sort: 'last_conversion', order: 'desc' });
  await waitFor(() => expect(result.current.status).toBe('ready'));
  setScenario('slow');
  act(() => result.current.loadMore());
  expect(result.current.status).toBe('loading-more');
  rerender({ sort: 'name', order: 'asc' });
  await settle();
  expect(result.current.status).toBe('loading');
  expect(result.current.error).toBeNull();
});
