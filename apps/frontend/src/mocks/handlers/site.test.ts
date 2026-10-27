import { api } from '../../api';
import { db } from '../db';
import { server } from '../server';
import { setScenario } from '../scenario';
import { siteHandlers } from './site';

beforeEach(() => {
  server.use(...siteHandlers);
  db.sessionProfileId = 'prof_evaldo';
});

describe('getSite handler', () => {
  test('requires a session', async () => {
    db.sessionProfileId = null;
    await expect(api.getSite('site_horizonte')).rejects.toMatchObject({ status: 401 });
  });

  test('returns 404 for unknown site', async () => {
    await expect(api.getSite('site_inexistente')).rejects.toMatchObject({ status: 404 });
  });

  test('returns site data for existing site', async () => {
    const site = await api.getSite('site_horizonte');
    expect(site).toMatchObject({
      id: 'site_horizonte',
      name: 'Horizonte',
      domain: 'horizonte.example',
      audio_count: 12,
      unheard_count: 3,
    });
  });

  test('returns 404 when scenario is empty', async () => {
    setScenario('empty');
    await expect(api.getSite('site_horizonte')).rejects.toMatchObject({ status: 404 });
  });

  test('respects scenario override', async () => {
    setScenario('server_error');
    await expect(api.getSite('site_horizonte')).rejects.toMatchObject({ status: 500 });
  });
});

describe('listSitePosts handler', () => {
  test('requires a session', async () => {
    db.sessionProfileId = null;
    await expect(api.listSitePosts('site_horizonte', {})).rejects.toMatchObject({ status: 401 });
  });

  test('returns 404 for unknown site', async () => {
    await expect(api.listSitePosts('site_inexistente', {})).rejects.toMatchObject({ status: 404 });
  });

  test('returns posts for site ordered by published_at desc', async () => {
    const page = await api.listSitePosts('site_horizonte', {});
    expect(page.items.map((p) => p.id)).toEqual(['post_oceano', 'post_rios', 'post_energia', 'post_florestas']);
    expect(page.total).toBe(4);
    expect(page.next_cursor).toBeNull();
  });

  test('filters unheard posts when filter=unheard', async () => {
    const page = await api.listSitePosts('site_horizonte', { filter: 'unheard' });
    expect(page.items.map((p) => p.id)).toEqual(['post_rios', 'post_energia']);
    expect(page.total).toBe(2);
    expect(page.items.every((p) => p.listen_state === 'unheard')).toBe(true);
  });

  test('returns empty list when site has no unheard posts with filter=unheard', async () => {
    const page = await api.listSitePosts('site_palavra', { filter: 'unheard' });
    expect(page.items).toEqual([]);
    expect(page.total).toBe(0);
    expect(page.next_cursor).toBeNull();
  });

  test('paginates posts with stable snapshot cursor', async () => {
    const first = await api.listSitePosts('site_horizonte', { limit: 2 });
    expect(first.items).toHaveLength(2);
    expect(first.items.map((p) => p.id)).toEqual(['post_oceano', 'post_rios']);
    expect(first.next_cursor).not.toBeNull();

    const second = await api.listSitePosts('site_horizonte', { cursor: first.next_cursor!, limit: 2 });
    expect(second.items).toHaveLength(2);
    expect(second.items.map((p) => p.id)).toEqual(['post_energia', 'post_florestas']);
    expect(second.next_cursor).toBeNull();
  });

  test('rejects non-matching cursor with 400', async () => {
    await expect(api.listSitePosts('site_horizonte', { cursor: 'invalid_format' })).rejects.toMatchObject({ status: 400 });
  });

  test('rejects expired or non-existent snapshot cursor with 400', async () => {
    await expect(api.listSitePosts('site_horizonte', { cursor: 'snap_99999_0' })).rejects.toMatchObject({ status: 400 });
  });

  test('returns 404 when scenario is empty', async () => {
    setScenario('empty');
    await expect(api.listSitePosts('site_horizonte', {})).rejects.toMatchObject({ status: 404 });
  });

  test('respects scenario override', async () => {
    setScenario('server_error');
    await expect(api.listSitePosts('site_horizonte', {})).rejects.toMatchObject({ status: 500 });
  });
});
