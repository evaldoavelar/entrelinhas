import { api } from '../../api';
import { db } from '../db';
import { sites } from '../fixtures';
import { setScenario } from '../scenario';

beforeEach(() => {
  db.sessionProfileId = 'prof_evaldo';
});

const names = (items: { name: string }[]) => items.map((s) => s.name);

test('requires a session', async () => {
  db.sessionProfileId = null;
  await expect(api.listSites({})).rejects.toMatchObject({ status: 401 });
});

test('default order is last successful conversion, newest first; never-converted last (RF15, RF06)', async () => {
  const page = await api.listSites({ limit: 50 });
  expect(page.total).toBe(24);
  expect(names(page.items).slice(0, 6)).toEqual(['Horizonte', 'Circuito', 'Ciência Aberta', 'Ideias', 'Cotidiano', 'Palavra']);
  expect(page.items.at(-1)?.name).toBe('Sextante');
});

test('name ascending and descending (CA04)', async () => {
  const asc = await api.listSites({ sort: 'name', order: 'asc', limit: 3 });
  expect(names(asc.items)).toEqual(['Atlas', 'Bússola', 'Cais']);
  const desc = await api.listSites({ sort: 'name', order: 'desc', limit: 2 });
  expect(names(desc.items)).toEqual(['Sextante', 'Rota']);
});

test('last conversion ascending puts never-converted sites last too', async () => {
  const page = await api.listSites({ order: 'asc', limit: 50 });
  expect(page.items.at(-1)?.name).toBe('Sextante');
  const [first, second] = page.items.map((s) => s.last_conversion_at ?? '');
  expect(first! < second!).toBe(true);
});

test('category filter combines with sort (CA33)', async () => {
  const page = await api.listSites({ category: 'cat_literatura', sort: 'name', order: 'asc', limit: 50 });
  expect(page.items.every((s) => s.category_id === 'cat_literatura')).toBe(true);
  expect(page.items.map((s) => s.name)).toEqual([...page.items.map((s) => s.name)].sort((a, b) => a.localeCompare(b, 'pt-BR')));
});

test('search matches posts by body, tags or summary even if not loaded, accent/case insensitive (CA05, CA23)', async () => {
  const page = await api.listSites({ q: 'SUBMARINO', limit: 50 });
  expect(names(page.items).sort((a, b) => a.localeCompare(b, 'pt-BR'))).toEqual(['Ciência Aberta', 'Circuito', 'Horizonte']);
  const accents = await api.listSites({ q: 'ciencia aberta', limit: 50 });
  expect(names(accents.items)).toEqual(['Ciência Aberta']);
});

test('pagination follows a snapshot: no duplicates or gaps when data changes (CA22)', async () => {
  const first = await api.listSites({ limit: 6 });
  expect(first.next_cursor).not.toBeNull();
  const atlas = sites.find((s) => s.id === 'site_atlas')!;
  const original = atlas.last_conversion_at;
  atlas.last_conversion_at = '2026-10-27T14:59:00-03:00';
  try {
    const seen = [...first.items];
    let cursor = first.next_cursor;
    while (cursor) {
      const next = await api.listSites({ limit: 6, cursor });
      seen.push(...next.items);
      cursor = next.next_cursor;
    }
    expect(seen).toHaveLength(24);
    expect(new Set(seen.map((s) => s.id)).size).toBe(24);
  } finally {
    atlas.last_conversion_at = original;
  }
});

test('invalid or foreign cursor is rejected', async () => {
  await expect(api.listSites({ cursor: 'snap_nao_existe_6' })).rejects.toMatchObject({ status: 400 });
});

test('empty scenario returns no sites', async () => {
  setScenario('empty');
  await expect(api.listSites({})).resolves.toMatchObject({ items: [], total: 0, next_cursor: null });
});

test('categories and continue listening', async () => {
  const { items } = await api.listCategories();
  expect(items.map((c) => c.name)).toEqual(['Ciência', 'Tecnologia', 'Cultura', 'Literatura']);
  await expect(api.getContinueListening()).resolves.toMatchObject({ post: { id: 'post_oceano' }, position_seconds: 252 });
  setScenario('empty');
  await expect(api.getContinueListening()).resolves.toBeNull();
});
