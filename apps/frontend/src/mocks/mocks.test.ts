import { http, HttpResponse } from 'msw';
import { ApiError } from '@entrelinhas/api-client';
import { api } from '../api';
import { server } from './server';
import { db } from './db';
import { HOUSEHOLD_PASSWORD } from './fixtures';
import { SCENARIOS, parseScenario, setScenario, getScenario } from './scenario';

const login = () => api.createSession({ household_password: HOUSEHOLD_PASSWORD, profile_id: 'prof_evaldo' });
const failure = (p: Promise<unknown>) => p.then(() => undefined, (e: unknown) => e as ApiError);

describe('session (simulated)', () => {
  test('no session -> 401; login -> session with profile prefs; logout clears', async () => {
    expect(await failure(api.getSession())).toMatchObject({ status: 401, code: 'unauthenticated' });
    const session = await login();
    expect(session.profile.id).toBe('prof_evaldo');
    expect(session.private_unlocked).toBe(false);
    await expect(api.getSession()).resolves.toMatchObject({ profile: { id: 'prof_evaldo' } });
    await api.deleteSession();
    expect(await failure(api.getSession())).toMatchObject({ status: 401 });
  });

  test('wrong household password is rejected without creating a session', async () => {
    const err = await failure(api.createSession({ household_password: 'errada', profile_id: 'prof_evaldo' }));
    expect(err).toMatchObject({ status: 401, code: 'invalid_credentials' });
    expect(db.sessionProfileId).toBeNull();
  });

  test('preferences are stored per profile and require a session', async () => {
    expect(await failure(api.updatePreferences({ theme: 'light' }))).toMatchObject({ status: 401 });
    await login();
    await expect(api.updatePreferences({ theme: 'light' })).resolves.toEqual({ theme: 'light', library_view: 'cards' });
    await api.createSession({ household_password: HOUSEHOLD_PASSWORD, profile_id: 'prof_ana' });
    await expect(api.getSession()).resolves.toMatchObject({ preferences: { theme: 'dark' } });
  });

  test('public profiles list', async () => {
    const { items } = await api.listPublicProfiles();
    expect(items.map((p) => p.initials)).toEqual(['EA', 'AN', 'CV']);
  });

  test('admin login requires username, password and TOTP (simulated)', async () => {
    await expect(api.createAdminSession({ username: 'evaldo', password: 'admin-exemplo', totp_code: '482913' })).resolves.toMatchObject({
      admin: { username: 'evaldo' },
    });
    expect(await failure(api.createAdminSession({ username: 'evaldo', password: 'admin-exemplo', totp_code: '000000' }))).toMatchObject({
      status: 401,
    });
  });

  test('handler rejects bodies outside the contract with 400', async () => {
    const res = await fetch(new URL('/v1/session', location.origin), {
      method: 'POST',
      body: JSON.stringify({ household_password: 'x', profile_id: 'prof_evaldo', role: 'admin' }),
    });
    expect(res.status).toBe(400);
  });
});

describe('scenarios', () => {
  test.each([
    ['unauthenticated', 401],
    ['forbidden', 403],
    ['rate_limited', 429],
    ['unavailable', 503],
    ['server_error', 500],
  ] as const)('%s answers %i on every handler', async (scenario, status) => {
    setScenario(scenario);
    expect(await failure(api.listPublicProfiles())).toMatchObject({ status });
  });

  test('rate_limited carries Retry-After', async () => {
    setScenario('rate_limited');
    expect(await failure(api.getSession())).toMatchObject({ retryAfterSeconds: 30 });
  });

  test('network_error surfaces as unknown outcome', async () => {
    setScenario('network_error');
    expect(await failure(api.getSession())).toMatchObject({ code: 'network_error', outcomeUnknown: true });
  });

  test('slow delays but answers', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    setScenario('slow');
    const pending = api.listPublicProfiles();
    await vi.advanceTimersByTimeAsync(1600);
    await expect(pending).resolves.toMatchObject({ items: expect.any(Array) });
    vi.useRealTimers();
  });

  test('scenario names parse safely', () => {
    expect(parseScenario('rate_limited')).toBe('rate_limited');
    expect(parseScenario('drop_tables')).toBe('default');
    expect(parseScenario(null)).toBe('default');
    expect(SCENARIOS).toContain('empty');
    setScenario('empty');
    expect(getScenario()).toBe('empty');
  });
});

describe('isolation', () => {
  test('a request without handler is rejected by MSW instead of reaching the network', async () => {
    const logged: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      logged.push(args.map(String).join(' '));
    });
    const err = await failure(api.listCategories());
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ code: 'network_error' });
    expect(logged.join('\n')).toMatch(/\[MSW\].*without a matching request handler/);
  });

  test('mock responses outside the contract are refused by the handler helper', async () => {
    const { ok } = await import('./respond');
    const { Session } = await import('@entrelinhas/contracts');
    expect(() => ok(Session, { profile: null } as never)).toThrow();
    server.use(http.get('/v1/categories', () => HttpResponse.json({ items: [{ id: 'x' }] })));
    expect(await failure(api.listCategories())).toMatchObject({ code: 'invalid_response' });
  });
});

describe('fixtures', () => {
  test('library has 24 sites, one never converted, and consistent category counts', async () => {
    const { sites, categories, posts } = await import('./fixtures');
    expect(sites).toHaveLength(24);
    expect(sites.filter((s) => s.last_conversion_at === null).map((s) => s.name)).toEqual(['Sextante']);
    expect(categories.reduce((n, c) => n + c.site_count, 0)).toBe(24);
    expect(posts.every((p) => p.site_name.length > 0)).toBe(true);
  });
});

describe('review TASK-003 findings', () => {
  test('browser guard answers unhandled /v1 routes locally instead of reaching the network (#1)', async () => {
    const { unhandledApiGuard } = await import('./guard');
    const logged: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      logged.push(args.map(String).join(' '));
    });
    server.use(...unhandledApiGuard);
    expect(await failure(api.listCategories())).toMatchObject({ status: 501, code: 'mock_handler_missing' });
    expect(logged.join('\n')).toContain('GET /v1/categories');
    // Bare prefix too (re-review TASK-003): '/v1/*' alone does not match '/v1'.
    expect((await fetch(new URL('/v1', location.origin))).status).toBe(501);
    expect((await fetch(new URL('/v1?x=1', location.origin), { method: 'POST' })).status).toBe(501);
  });

  test('guard does not shadow existing handlers when registered last', async () => {
    const { unhandledApiGuard } = await import('./guard');
    server.resetHandlers(...(await import('./handlers')).handlers, ...unhandledApiGuard);
    await expect(api.listPublicProfiles()).resolves.toMatchObject({ items: expect.any(Array) });
  });

  test('empty scenario empties list responses (#5)', async () => {
    setScenario('empty');
    await expect(api.listPublicProfiles()).resolves.toEqual({ items: [] });
  });
});
