import { api } from '../../api';
import { db } from '../db';
import { setScenario } from '../scenario';

beforeEach(() => {
  db.sessionProfileId = 'prof_evaldo';
});

const text = (segments: { text: string }[]) => segments.map((s) => s.text).join('');
const highlighted = (segments: { text: string; highlight: boolean }[]) => segments.filter((s) => s.highlight).map((s) => s.text);

test('requires a session', async () => {
  db.sessionProfileId = null;
  await expect(api.search({ q: 'submarino' })).rejects.toMatchObject({ status: 401 });
});

test('finds posts by body, summary and tags across sites, newest first (frame 15, CA05, CA23)', async () => {
  const page = await api.search({ q: 'submarino' });
  expect(page.total).toBe(3);
  expect(page.items.map((r) => [r.post.id, r.match_field])).toEqual([
    ['post_oceano', 'body'],
    ['post_expedicoes', 'tags'],
    ['post_profundezas', 'summary'],
  ]);
});

test('snippets are plain text segments with the match highlighted, original accents kept (CA67)', async () => {
  const [body, tags, summary] = (await api.search({ q: 'SUBMARINO' })).items;
  expect(highlighted(body!.snippet)).toEqual(['submarino']);
  expect(text(body!.snippet)).toContain('um veículo submarino de pesquisa');
  expect(text(body!.snippet).startsWith('…')).toBe(true);
  expect(text(tags!.snippet)).toBe('submarino, exploração');
  expect(highlighted(tags!.snippet)).toEqual(['submarino']);
  expect(text(summary!.snippet)).toBe('Adaptações em um ambiente submarino extremo.');

  const accent = await api.search({ q: 'atencao' });
  expect(accent.items[0]?.match_field).toBe('title');
  expect(highlighted(accent.items[0]!.snippet)).toEqual(['atenção']);
});

test('markup in the query is just text: no match and nothing to interpret', async () => {
  const page = await api.search({ q: '<img src=x onerror=alert(1)>' });
  expect(page.total).toBe(0);
});

test('cursor pages keep the first page snapshot', async () => {
  const first = await api.search({ q: 'o', limit: 2 });
  expect(first.items).toHaveLength(2);
  expect(first.next_cursor).not.toBeNull();
  const second = await api.search({ q: 'o', limit: 2, cursor: first.next_cursor! });
  const ids = [...first.items, ...second.items].map((r) => r.post.id);
  expect(new Set(ids).size).toBe(4);
  await expect(api.search({ q: 'o', cursor: 'bogus' })).rejects.toMatchObject({ status: 400 });
});

test('empty scenario and scenario overrides', async () => {
  setScenario('empty');
  expect((await api.search({ q: 'submarino' })).total).toBe(0);
  setScenario('unavailable');
  await expect(api.search({ q: 'submarino' })).rejects.toMatchObject({ status: 503 });
});
