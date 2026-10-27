import { createApiClient, type ApiClient } from './client';

const profile = { id: 'prof_e', display_name: 'Evaldo', initials: 'EA', has_pin: true };
const post = {
  id: 'post_o',
  site_id: 'site_h',
  site_name: 'Horizonte',
  title: 'O que existe no fundo do oceano?',
  published_at: null,
  duration_seconds: 768,
  tags: [],
  listen_state: 'unheard',
  processing_state: 'ready',
  visibility: 'household',
};
const article = {
  ...post,
  summary: null,
  summary_kind: null,
  source_url: 'https://horizonte.example/a',
  voice: null,
  vision: 'none',
  image_descriptions: [],
  audio_url: null,
};
const emptyPage = { items: [], next_cursor: null, total: 0 };

// Route table of the v1 contract used by S01/S02 screens.
const cases: [string, (api: ApiClient) => Promise<unknown>, string, string, unknown, unknown][] = [
  ['getSession', (a) => a.getSession(), 'GET', '/v1/session', undefined, { profile, preferences: { theme: 'dark', library_view: 'cards' }, unread_notifications: 0, private_unlocked: false }],
  ['listPublicProfiles', (a) => a.listPublicProfiles(), 'GET', '/v1/profiles/public', undefined, { items: [profile] }],
  [
    'createAdminSession',
    (a) => a.createAdminSession({ username: 'evaldo', password: 'p', totp_code: '482913' }),
    'POST',
    '/v1/admin/session',
    { username: 'evaldo', password: 'p', totp_code: '482913' },
    { admin: { id: 'adm_e', username: 'evaldo', display_name: 'Evaldo' }, idle_expires_at: '2026-10-27T14:00:00-03:00' },
  ],
  ['updatePreferences', (a) => a.updatePreferences({ library_view: 'list' }), 'PATCH', '/v1/me/preferences', { library_view: 'list' }, { theme: 'dark', library_view: 'list' }],
  ['listSitePosts', (a) => a.listSitePosts('site_h', { filter: 'unheard' }), 'GET', '/v1/sites/site_h/posts?filter=unheard&limit=20', undefined, emptyPage],
  ['getContinueListening', (a) => a.getContinueListening(), 'GET', '/v1/me/continue', undefined, null],
  ['search', (a) => a.search({ q: 'submarino' }), 'GET', '/v1/search?q=submarino&limit=20', undefined, emptyPage],
  ['getArticle', (a) => a.getArticle('post_o'), 'GET', '/v1/posts/post_o', undefined, article],
];

test.each(cases)('%s calls %s %s', async (_name, call, method, path, body, response) => {
  const seen: { url: string; init: RequestInit }[] = [];
  const fetch = (async (url: string, init: RequestInit) => {
    seen.push({ url, init });
    return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as unknown as typeof globalThis.fetch;
  const api = createApiClient({ fetch, origin: 'https://app.test' });
  await expect(call(api)).resolves.toEqual(response);
  expect(seen[0]?.init.method).toBe(method);
  expect(seen[0]?.url).toBe(`https://app.test${path}`);
  expect(seen[0]?.init.body === null ? undefined : JSON.parse(String(seen[0]?.init.body))).toEqual(body);
});

test('uses global fetch and location origin by default', async () => {
  const original = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = (async (url: string) => {
    calls.push(url);
    return new Response(JSON.stringify({ items: [] }), { status: 200 });
  }) as unknown as typeof globalThis.fetch;
  vi.stubGlobal('location', { origin: 'https://casa.test' });
  try {
    await createApiClient().listCategories();
    expect(calls).toEqual(['https://casa.test/v1/categories']);
  } finally {
    globalThis.fetch = original;
    vi.unstubAllGlobals();
  }
});

test('resolves global fetch at call time, so interceptors installed after creation apply', async () => {
  const original = globalThis.fetch;
  const api = createApiClient({ origin: 'https://casa.test' });
  const calls: string[] = [];
  globalThis.fetch = (async (url: string) => {
    calls.push(url);
    return new Response(JSON.stringify({ items: [] }), { status: 200 });
  }) as unknown as typeof globalThis.fetch;
  try {
    await api.listCategories();
    expect(calls).toEqual(['https://casa.test/v1/categories']);
  } finally {
    globalThis.fetch = original;
  }
});
