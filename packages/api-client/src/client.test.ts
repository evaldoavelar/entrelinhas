import { ApiError, createApiClient } from './client';

type Call = { url: string; init: RequestInit };

function fakeFetch(respond: (call: Call) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const call = { url: String(input), init };
    calls.push(call);
    return respond(call);
  };
  return { fetch: fetch as typeof globalThis.fetch, calls };
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

const site = {
  id: 'site_h',
  name: 'Horizonte',
  domain: 'horizonte.example',
  icon_url: null,
  category_id: 'cat_c',
  category_name: 'Ciência',
  audio_count: 12,
  unheard_count: 3,
  last_conversion_at: '2026-10-27T13:42:00-03:00',
  monitoring: 'active',
};

const base = 'https://app.test';

describe('requests', () => {
  test('lists sites with defaults applied and safe fetch options', async () => {
    const { fetch, calls } = fakeFetch(() => json({ items: [site], next_cursor: null, total: 1 }));
    const api = createApiClient({ baseUrl: base, fetch });
    const page = await api.listSites({ q: 'oceano' });
    expect(page.items[0]?.name).toBe('Horizonte');
    const call = calls[0]!;
    expect(call.url).toBe(`${base}/v1/sites?q=oceano&sort=last_conversion&order=desc&limit=20`);
    expect(call.init).toMatchObject({ method: 'GET', credentials: 'same-origin', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer' });
  });

  test('rejects invalid query before sending (never builds an unchecked URL)', async () => {
    const { fetch, calls } = fakeFetch(() => json({}));
    const api = createApiClient({ baseUrl: base, fetch });
    await expect(api.listSites({ limit: 500 })).rejects.toMatchObject({ code: 'invalid_request' });
    expect(calls).toHaveLength(0);
  });

  test('sends JSON body and validates it against the contract', async () => {
    const session = {
      profile: { id: 'prof_e', display_name: 'Evaldo', initials: 'EA', has_pin: true },
      preferences: { theme: 'dark', library_view: 'cards' },
      unread_notifications: 2,
      private_unlocked: false,
    };
    const { fetch, calls } = fakeFetch(() => json(session, 201));
    const api = createApiClient({ baseUrl: base, fetch });
    await expect(api.createSession({ household_password: 'segredo', profile_id: 'prof_e' })).resolves.toEqual(session);
    expect(calls[0]!.init.method).toBe('POST');
    expect(JSON.parse(String(calls[0]!.init.body))).toEqual({ household_password: 'segredo', profile_id: 'prof_e' });
    expect(new Headers(calls[0]!.init.headers).get('Content-Type')).toBe('application/json');
  });

  test('path parameters are encoded', async () => {
    const { fetch, calls } = fakeFetch(() => json(site));
    const api = createApiClient({ baseUrl: base, fetch });
    await api.getSite('site_h');
    expect(calls[0]!.url).toBe(`${base}/v1/sites/site_h`);
    await expect(api.getSite('../admin')).rejects.toMatchObject({ code: 'invalid_request' });
  });

  test('204 resolves to undefined', async () => {
    const { fetch } = fakeFetch(() => new Response(null, { status: 204 }));
    await expect(createApiClient({ baseUrl: base, fetch }).deleteSession()).resolves.toBeUndefined();
  });

  test('resolves relative base against window origin', async () => {
    const { fetch, calls } = fakeFetch(() => json({ items: [] }));
    await createApiClient({ fetch, origin: 'http://localhost:4173' }).listCategories();
    expect(calls[0]!.url).toBe('http://localhost:4173/v1/categories');
  });
});

describe('errors (plano §8 status mapping)', () => {
  test.each([
    [401, 'unauthenticated'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [409, 'conflict'],
    [413, 'payload_too_large'],
    [503, 'unavailable'],
    [500, 'server_error'],
  ])('%i without body maps to %s', async (status, code) => {
    const { fetch } = fakeFetch(() => new Response('<html>oops</html>', { status }));
    const err = await createApiClient({ baseUrl: base, fetch }).getSession().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status, code });
    expect((err as ApiError).message).not.toContain('<html>');
  });

  test('429 exposes Retry-After from header', async () => {
    const { fetch } = fakeFetch(() => json({ error: { code: 'rate_limited', message: 'Muitos pedidos' } }, 429, { 'Retry-After': '30' }));
    const err = await createApiClient({ baseUrl: base, fetch }).listCategories().catch((e: unknown) => e);
    expect(err).toMatchObject({ status: 429, code: 'rate_limited', retryAfterSeconds: 30, message: 'Muitos pedidos' });
  });

  test('error body retry_after_seconds is used when header is absent', async () => {
    const { fetch } = fakeFetch(() => json({ error: { code: 'rate_limited', message: 'x', retry_after_seconds: 12 } }, 429));
    const err = await createApiClient({ baseUrl: base, fetch }).listCategories().catch((e: unknown) => e);
    expect(err).toMatchObject({ retryAfterSeconds: 12 });
  });

  test('response violating the contract is rejected, not passed to the UI', async () => {
    const { fetch } = fakeFetch(() => json({ items: [{ ...site, owner_profile_id: 'x' }], next_cursor: null, total: 1 }));
    await expect(createApiClient({ baseUrl: base, fetch }).listSites({})).rejects.toMatchObject({ code: 'invalid_response' });
  });

  test('network failure is network_error with unknown outcome', async () => {
    const { fetch } = fakeFetch(() => Promise.reject(new TypeError('Failed to fetch')));
    const err = await createApiClient({ baseUrl: base, fetch }).listCategories().catch((e: unknown) => e);
    expect(err).toMatchObject({ status: 0, code: 'network_error', outcomeUnknown: true });
  });

  test('timeout aborts and reports unknown outcome', async () => {
    const { fetch } = fakeFetch(
      (call) =>
        new Promise((_, reject) => {
          call.init.signal?.addEventListener('abort', () => reject(call.init.signal?.reason));
        }),
    );
    const err = await createApiClient({ baseUrl: base, fetch, timeoutMs: 10 }).listCategories().catch((e: unknown) => e);
    expect(err).toMatchObject({ code: 'timeout', outcomeUnknown: true });
  });

  test('caller abort is propagated as aborted', async () => {
    const controller = new AbortController();
    const { fetch } = fakeFetch(
      (call) =>
        new Promise((_, reject) => {
          call.init.signal?.addEventListener('abort', () => reject(call.init.signal?.reason));
        }),
    );
    const pending = createApiClient({ baseUrl: base, fetch }).listCategories({ signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ code: 'aborted' });
  });
});

describe('review TASK-003 findings', () => {
  test('Retry-After as HTTP-date becomes seconds from now (#2)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-27T18:00:00Z'));
    const { fetch } = fakeFetch(() => json({ error: { code: 'rate_limited', message: 'x' } }, 429, { 'Retry-After': 'Tue, 27 Oct 2026 18:00:45 GMT' }));
    const err = await createApiClient({ baseUrl: base, fetch }).listCategories().catch((e: unknown) => e);
    vi.useRealTimers();
    expect(err).toMatchObject({ retryAfterSeconds: 45 });
  });

  test('past HTTP-date Retry-After means retry now (0)', async () => {
    const { fetch } = fakeFetch(() => json({ error: { code: 'rate_limited', message: 'x' } }, 429, { 'Retry-After': 'Thu, 01 Jan 2015 00:00:00 GMT' }));
    const err = await createApiClient({ baseUrl: base, fetch }).listCategories().catch((e: unknown) => e);
    expect(err).toMatchObject({ retryAfterSeconds: 0 });
  });

  test('204 on a route that requires a body is invalid_response (#3)', async () => {
    const { fetch } = fakeFetch(() => new Response(null, { status: 204 }));
    await expect(createApiClient({ baseUrl: base, fetch }).getSession()).rejects.toMatchObject({ code: 'invalid_response' });
  });

  test('body read failure after headers is an unknown outcome, not invalid_response (#4)', async () => {
    const broken = new ReadableStream({
      start(controller) {
        controller.error(new TypeError('terminated'));
      },
    });
    const { fetch } = fakeFetch(() => new Response(broken, { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const err = await createApiClient({ baseUrl: base, fetch }).listCategories().catch((e: unknown) => e);
    expect(err).toMatchObject({ code: 'network_error', outcomeUnknown: true });
  });

  test('malformed JSON with 200 stays invalid_response', async () => {
    const { fetch } = fakeFetch(() => new Response('{"items": [', { status: 200 }));
    await expect(createApiClient({ baseUrl: base, fetch }).listCategories()).rejects.toMatchObject({ code: 'invalid_response', outcomeUnknown: false });
  });
});
