import { z } from 'zod';
import {
  AdminSession,
  AdminSessionCreateRequest,
  ApiErrorBody,
  Article,
  CategoryList,
  ContinueListening,
  Id,
  Post,
  Preferences,
  PreferencesUpdate,
  ProfileList,
  SearchQuery,
  SearchResult,
  Session,
  SessionCreateRequest,
  Site,
  SitePostsQuery,
  SitesQuery,
  pageOf,
} from '@entrelinhas/contracts';

// Single HTTP client for every screen. Mock (MSW) and real backend differ only in who answers
// the HTTP request; components never branch on mock mode (ADR-12).

const STATUS_CODES: Record<number, string> = {
  401: 'unauthenticated',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  413: 'payload_too_large',
  429: 'rate_limited',
  503: 'unavailable',
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryAfterSeconds: number | undefined;
  // True when the request may have reached the server (timeout/network): the UI must not claim rejection.
  readonly outcomeUnknown: boolean;

  constructor(init: { status: number; code: string; message: string; retryAfterSeconds?: number | undefined; outcomeUnknown?: boolean }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.retryAfterSeconds = init.retryAfterSeconds;
    this.outcomeUnknown = init.outcomeUnknown ?? false;
  }
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  origin?: string;
}

export interface CallOptions {
  signal?: AbortSignal;
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestSpec<T> {
  method: Method;
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  response: z.ZodType<T> | null;
  signal?: AbortSignal | undefined;
}

function invalidRequest(message: string): ApiError {
  return new ApiError({ status: 0, code: 'invalid_request', message });
}

function parseInput<S extends z.ZodType>(schema: S, value: unknown): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) throw invalidRequest('Pedido inválido para o contrato v1');
  return result.data;
}

function pathId(id: string): string {
  return encodeURIComponent(parseInput(Id, id));
}

// Retry-After may be delta-seconds or an HTTP-date (RFC 9110 §10.2.3).
function retryAfter(header: string | null, body: number | undefined): number | undefined {
  if (header === null) return body;
  const seconds = Number(header);
  if (header.trim() !== '' && Number.isFinite(seconds) && seconds >= 0) return seconds;
  const date = Date.parse(header);
  if (Number.isNaN(date)) return body;
  return Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

export function createApiClient(options: ApiClientOptions = {}) {
  // Resolved per call: test interceptors and wrappers installed after creation must apply.
  const fetchImpl: typeof globalThis.fetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const timeoutMs = options.timeoutMs ?? 15_000;
  const base = new URL(options.baseUrl ?? '/', options.origin ?? globalThis.location?.origin);

  async function request<T>(spec: RequestSpec<T>): Promise<T> {
    const url = new URL(spec.path, base);
    for (const [key, value] of Object.entries(spec.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    const headers = new Headers({ Accept: 'application/json' });
    if (spec.body !== undefined) headers.set('Content-Type', 'application/json');

    const timeout = AbortSignal.timeout(timeoutMs);
    const signal = spec.signal ? AbortSignal.any([spec.signal, timeout]) : timeout;

    // Any failure while the exchange is in flight (headers or body) leaves the outcome unknown.
    const transportError = () => {
      if (spec.signal?.aborted) return new ApiError({ status: 0, code: 'aborted', message: 'Pedido cancelado', outcomeUnknown: true });
      if (timeout.aborted) return new ApiError({ status: 0, code: 'timeout', message: 'O servidor não respondeu a tempo', outcomeUnknown: true });
      return new ApiError({ status: 0, code: 'network_error', message: 'Sem conexão com o servidor', outcomeUnknown: true });
    };

    let response: Response;
    let text: string;
    try {
      response = await fetchImpl(url.toString(), {
        method: spec.method,
        headers,
        body: spec.body === undefined ? null : JSON.stringify(spec.body),
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        referrerPolicy: 'no-referrer',
        signal,
      });
      text = await response.text();
    } catch {
      throw transportError();
    }

    const json = (): unknown => {
      try {
        return JSON.parse(text);
      } catch {
        return undefined;
      }
    };

    if (!response.ok) {
      const parsed = ApiErrorBody.safeParse(json());
      const body = parsed.success ? parsed.data.error : undefined;
      throw new ApiError({
        status: response.status,
        code: body?.code ?? STATUS_CODES[response.status] ?? 'server_error',
        message: body?.message ?? 'Não foi possível concluir o pedido',
        retryAfterSeconds: retryAfter(response.headers.get('Retry-After'), body?.retry_after_seconds),
      });
    }

    // Only routes declared without a response body may succeed empty; a 204 elsewhere is a contract violation.
    if (spec.response === null) return undefined as T;
    const result = spec.response.safeParse(json());
    if (!result.success) {
      throw new ApiError({ status: response.status, code: 'invalid_response', message: 'Resposta fora do contrato v1' });
    }
    return result.data;
  }

  return {
    getSession: async (o: CallOptions = {}) => request({ method: 'GET', path: '/v1/session', response: Session, signal: o.signal }),
    createSession: async (body: SessionCreateRequest, o: CallOptions = {}) =>
      request({ method: 'POST', path: '/v1/session', body: parseInput(SessionCreateRequest, body), response: Session, signal: o.signal }),
    deleteSession: async (o: CallOptions = {}) => request<undefined>({ method: 'DELETE', path: '/v1/session', response: null, signal: o.signal }),
    listPublicProfiles: async (o: CallOptions = {}) =>
      request({ method: 'GET', path: '/v1/profiles/public', response: ProfileList, signal: o.signal }),
    createAdminSession: async (body: AdminSessionCreateRequest, o: CallOptions = {}) =>
      request({
        method: 'POST',
        path: '/v1/admin/session',
        body: parseInput(AdminSessionCreateRequest, body),
        response: AdminSession,
        signal: o.signal,
      }),
    updatePreferences: async (body: PreferencesUpdate, o: CallOptions = {}) =>
      request({ method: 'PATCH', path: '/v1/me/preferences', body: parseInput(PreferencesUpdate, body), response: Preferences, signal: o.signal }),
    listSites: async (query: SitesQuery, o: CallOptions = {}) =>
      request({ method: 'GET', path: '/v1/sites', query: parseInput(SitesQuery, query), response: pageOf(Site), signal: o.signal }),
    getSite: async (id: string, o: CallOptions = {}) => request({ method: 'GET', path: `/v1/sites/${pathId(id)}`, response: Site, signal: o.signal }),
    listSitePosts: async (id: string, query: SitePostsQuery, o: CallOptions = {}) =>
      request({
        method: 'GET',
        path: `/v1/sites/${pathId(id)}/posts`,
        query: parseInput(SitePostsQuery, query),
        response: pageOf(Post),
        signal: o.signal,
      }),
    listCategories: async (o: CallOptions = {}) => request({ method: 'GET', path: '/v1/categories', response: CategoryList, signal: o.signal }),
    getContinueListening: async (o: CallOptions = {}) =>
      request({ method: 'GET', path: '/v1/me/continue', response: ContinueListening, signal: o.signal }),
    search: async (query: SearchQuery, o: CallOptions = {}) =>
      request({ method: 'GET', path: '/v1/search', query: parseInput(SearchQuery, query), response: pageOf(SearchResult), signal: o.signal }),
    getArticle: async (id: string, o: CallOptions = {}) =>
      request({ method: 'GET', path: `/v1/posts/${pathId(id)}`, response: Article, signal: o.signal }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
