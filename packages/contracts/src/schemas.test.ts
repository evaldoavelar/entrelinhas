import * as s from './schemas';

const site = {
  id: 'site_horizonte',
  name: 'Horizonte',
  domain: 'horizonte.example',
  icon_url: null,
  category_id: 'cat_ciencia',
  category_name: 'Ciência',
  audio_count: 12,
  unheard_count: 3,
  last_conversion_at: '2026-10-27T13:42:00-03:00',
  monitoring: 'active',
};

const post = {
  id: 'post_oceano',
  site_id: 'site_horizonte',
  site_name: 'Horizonte',
  title: 'O que existe no fundo do oceano?',
  published_at: '2026-10-24T10:00:00-03:00',
  duration_seconds: 768,
  tags: ['ciência', 'oceano'],
  listen_state: 'in_progress',
  processing_state: 'ready',
  visibility: 'household',
};

describe('strict objects (mass assignment, CA99)', () => {
  test('site rejects unknown fields', () => {
    expect(s.Site.parse(site)).toEqual(site);
    expect(() => s.Site.parse({ ...site, owner_profile_id: 'p2' })).toThrow();
  });

  test('session request rejects role/profile escalation fields', () => {
    expect(s.SessionCreateRequest.parse({ household_password: 'x', profile_id: 'prof_evaldo' })).toBeTruthy();
    expect(() => s.SessionCreateRequest.parse({ household_password: 'x', profile_id: 'prof_evaldo', role: 'admin' })).toThrow();
  });

  test('preferences update only accepts known keys and values', () => {
    expect(s.PreferencesUpdate.parse({ theme: 'light' })).toEqual({ theme: 'light' });
    expect(() => s.PreferencesUpdate.parse({ theme: 'neon' })).toThrow();
    expect(() => s.PreferencesUpdate.parse({ library_view: 'grid' })).toThrow();
  });
});

describe('identifiers and dates', () => {
  test('ids are opaque tokens without path or query characters', () => {
    expect(() => s.Id.parse('../etc')).toThrow();
    expect(() => s.Id.parse('a?b')).toThrow();
    expect(() => s.Id.parse('')).toThrow();
  });

  test('datetimes require an offset', () => {
    expect(() => s.Site.parse({ ...site, last_conversion_at: '2026-10-27 13:42' })).toThrow();
  });

  test('site without successful conversion has null last_conversion_at (RF06)', () => {
    expect(s.Site.parse({ ...site, last_conversion_at: null, audio_count: 0, unheard_count: 0 }).last_conversion_at).toBeNull();
  });
});

describe('pagination', () => {
  test('page carries items, opaque cursor and snapshot total', () => {
    const page = s.pageOf(s.Site).parse({ items: [site], next_cursor: 'c_1', total: 24 });
    expect(page.items).toHaveLength(1);
    expect(() => s.pageOf(s.Site).parse({ items: [site], next_cursor: 'c_1', total: -1 })).toThrow();
  });

  test('sites query defaults to last conversion, newest first (RF15)', () => {
    expect(s.SitesQuery.parse({})).toEqual({ sort: 'last_conversion', order: 'desc', limit: 20 });
    expect(() => s.SitesQuery.parse({ limit: 51 })).toThrow();
  });
});

describe('search results are text segments, never HTML (CA67)', () => {
  test('snippet is a list of plain text segments with highlight flags', () => {
    const result = s.SearchResult.parse({
      post,
      match_field: 'body',
      snippet: [{ text: 'um veículo ', highlight: false }, { text: 'submarino', highlight: true }],
    });
    expect(result.match_field).toBe('body');
    expect(result.snippet[1]).toEqual({ text: 'submarino', highlight: true });
  });

  test('search query bounds length (plano §13: 2 mil caracteres)', () => {
    expect(() => s.SearchQuery.parse({ q: 'x'.repeat(2001) })).toThrow();
    expect(() => s.SearchQuery.parse({ q: '   ' })).toThrow();
  });
});

describe('errors', () => {
  test('error body carries code, bounded message and optional retry_after', () => {
    const body = s.ApiErrorBody.parse({ error: { code: 'rate_limited', message: 'Muitos pedidos', retry_after_seconds: 30 } });
    expect(body.error.retry_after_seconds).toBe(30);
    expect(() => s.ApiErrorBody.parse({ error: { code: 'x', message: 'y'.repeat(501) } })).toThrow();
  });
});

describe('admin login', () => {
  test('totp must be 6 digits', () => {
    expect(s.AdminSessionCreateRequest.parse({ username: 'evaldo', password: 'p', totp_code: '482913' })).toBeTruthy();
    expect(() => s.AdminSessionCreateRequest.parse({ username: 'evaldo', password: 'p', totp_code: '48291' })).toThrow();
  });
});

describe('site posts and list wrappers', () => {
  test('site posts query filters all or unheard, newest first by default (RF07)', () => {
    expect(s.SitePostsQuery.parse({})).toEqual({ filter: 'all', limit: 20 });
    expect(() => s.SitePostsQuery.parse({ filter: 'heard_by_others' })).toThrow();
  });

  test('list wrappers are strict', () => {
    expect(s.ProfileList.parse({ items: [] })).toEqual({ items: [] });
    expect(() => s.CategoryList.parse({ items: [], extra: 1 })).toThrow();
  });
});

describe('article and playback (review 2 #B1)', () => {
  test('article extends post with summary, voice, original url and image descriptions', () => {
    const article = s.Article.parse({
      ...post,
      summary: 'Uma exploração das regiões profundas do oceano.',
      summary_kind: 'abstractive',
      source_url: 'https://horizonte.example/artigos/fundo-do-oceano',
      voice: { id: 'voice_francisca', name: 'Francisca', language: 'pt-BR' },
      vision: 'model',
      image_descriptions: [{ position_seconds: 154, label: 'Gráfico de profundidade', text: 'O gráfico organiza as zonas.' }],
      audio_url: '/v1/assets/asset_1/audio.mp3',
    });
    expect(article.image_descriptions).toHaveLength(1);
    expect(() => s.Article.parse({ ...article, source_url: 'javascript:alert(1)' })).toThrow();
  });

  test('playback progress is per profile and asset, position bounded', () => {
    expect(s.PlaybackProgress.parse({ post_id: 'post_oceano', asset_id: 'asset_1', position_seconds: 252, rate: 1.25 })).toBeTruthy();
    expect(() => s.PlaybackProgress.parse({ post_id: 'post_oceano', asset_id: 'asset_1', position_seconds: -1, rate: 1 })).toThrow();
    expect(() => s.PlaybackProgress.parse({ post_id: 'post_oceano', asset_id: 'asset_1', position_seconds: 1, rate: 9 })).toThrow();
  });
});
