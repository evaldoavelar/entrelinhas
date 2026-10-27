import { act, renderHook, waitFor } from '@testing-library/react';
import { db } from '../../mocks/db';
import { server } from '../../mocks/server';
import { siteHandlers } from '../../mocks/handlers/site';
import { PAGE_SIZE, useSiteDetail } from './useSiteDetail';

beforeEach(() => {
  server.use(...siteHandlers);
  db.sessionProfileId = 'prof_evaldo';
});

test('loads site and first page of posts on mount', async () => {
  const { result } = renderHook(() => useSiteDetail('site_horizonte', 'all'));
  expect(result.current.status).toBe('loading');
  expect(result.current.site).toBeNull();
  expect(result.current.posts).toEqual([]);

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.site?.name).toBe('Horizonte');
  expect(result.current.posts).toHaveLength(PAGE_SIZE);
  expect(result.current.total).toBe(4);
  expect(result.current.nextCursor).not.toBeNull();
});

test('changing filter resets state and fetches filtered posts', async () => {
  let filter: 'all' | 'unheard' = 'all';
  const { result, rerender } = renderHook(() => useSiteDetail('site_horizonte', filter));

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.posts).toHaveLength(PAGE_SIZE);

  filter = 'unheard';
  rerender();

  expect(result.current.status).toBe('loading');
  expect(result.current.posts).toEqual([]);

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.posts.every((p) => p.listen_state === 'unheard')).toBe(true);
  expect(result.current.total).toBe(2);
});

test('loadMore appends posts using nextCursor', async () => {
  const { result } = renderHook(() => useSiteDetail('site_horizonte', 'all'));
  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.posts).toHaveLength(PAGE_SIZE);

  act(() => {
    result.current.loadMore();
  });

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.posts).toHaveLength(4);
  expect(result.current.nextCursor).toBeNull();
});

test('loadMore does nothing when nextCursor is null', async () => {
  const { result } = renderHook(() => useSiteDetail('site_horizonte', 'unheard'));
  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.nextCursor).toBeNull();

  act(() => {
    result.current.loadMore();
  });

  expect(result.current.status).toBe('ready');
});

test('error on initial load sets error status and captures ApiError', async () => {
  const { result } = renderHook(() => useSiteDetail('site_inexistente', 'all'));
  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.error).toMatchObject({ status: 404 });
});

test('retry after failed initial load retries fetching', async () => {
  db.sessionProfileId = null;
  const { result } = renderHook(() => useSiteDetail('site_horizonte', 'all'));
  await waitFor(() => expect(result.current.status).toBe('error'));

  db.sessionProfileId = 'prof_evaldo';
  act(() => {
    result.current.retry();
  });

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.site?.name).toBe('Horizonte');
});

test('retry after failed loadMore retries the page and preserves posts', async () => {
  const { result } = renderHook(() => useSiteDetail('site_horizonte', 'all'));
  await waitFor(() => expect(result.current.status).toBe('ready'));
  const firstPosts = result.current.posts;

  db.sessionProfileId = null;
  act(() => {
    result.current.loadMore();
  });

  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.posts).toEqual(firstPosts);

  db.sessionProfileId = 'prof_evaldo';
  act(() => {
    result.current.retry();
  });

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.posts).toHaveLength(4);
});

test('retry after failed loadMore followed by filter change retries initial query instead', async () => {
  let filter: 'all' | 'unheard' = 'all';
  const { result, rerender } = renderHook(() => useSiteDetail('site_horizonte', filter));
  await waitFor(() => expect(result.current.status).toBe('ready'));

  db.sessionProfileId = null;
  act(() => {
    result.current.loadMore();
  });
  await waitFor(() => expect(result.current.status).toBe('error'));

  filter = 'unheard';
  rerender();

  db.sessionProfileId = 'prof_evaldo';
  act(() => {
    result.current.retry();
  });

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.posts.every((p) => p.listen_state === 'unheard')).toBe(true);
});
