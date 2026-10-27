import { http } from 'msw';
import { CategoryList, ContinueListening, SitesQuery, pageOf, Site, type Site as SiteT } from '@entrelinhas/contracts';
import { db } from '../db';
import { categories, posts, postText, sites } from '../fixtures';
import { ok } from '../respond';
import { errorResponse, getScenario, scenarioOverride } from '../scenario';
import { unauthenticated } from './session';

// SIMULATED library queries (ADR-12): search, filters, ordering and snapshot pagination over
// fixtures. The real backend uses PostgreSQL FTS (plano §10); only the contract is shared.

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function siteMatches(site: SiteT, q: string): boolean {
  const needle = normalize(q);
  if (normalize(`${site.name} ${site.domain}`).includes(needle)) return true;
  return posts
    .filter((p) => p.site_id === site.id)
    .some((p) => {
      const text = postText[p.id];
      return normalize([p.title, ...p.tags, text?.summary ?? '', text?.body ?? ''].join(' ')).includes(needle);
    });
}

function compare(sort: 'last_conversion' | 'name', order: 'asc' | 'desc') {
  const direction = order === 'asc' ? 1 : -1;
  return (a: SiteT, b: SiteT) => {
    if (sort === 'name') return direction * a.name.localeCompare(b.name, 'pt-BR');
    // Sites without a successful conversion always come last (RF06).
    if (a.last_conversion_at === null || b.last_conversion_at === null) {
      return (a.last_conversion_at === null ? 1 : 0) - (b.last_conversion_at === null ? 1 : 0);
    }
    return direction * (Date.parse(a.last_conversion_at) - Date.parse(b.last_conversion_at));
  };
}

// Snapshot of ordered ids per query (CA22): later pages reuse the order fixed on the first page.
const snapshots = new Map<string, string[]>();
let snapshotSeq = 0;

export const libraryHandlers = [
  http.get('/v1/sites', async ({ request }) => {
    const override = await scenarioOverride();
    if (override) return override;
    if (!db.sessionProfileId) return unauthenticated();
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = SitesQuery.safeParse({ ...params, ...(params.limit ? { limit: Number(params.limit) } : {}) });
    if (!parsed.success) return errorResponse(400, 'invalid_request', 'Consulta inválida.');
    const query = parsed.data;

    let ids: string[];
    let offset = 0;
    let key: string;
    if (query.cursor) {
      const match = /^snap_(\d+)_(\d+)$/.exec(query.cursor);
      const snapshot = match ? snapshots.get(match[1] as string) : undefined;
      if (!match || !snapshot) return errorResponse(400, 'invalid_cursor', 'Cursor inválido ou expirado.');
      key = match[1] as string;
      ids = snapshot;
      offset = Number(match[2]);
    } else {
      const visible = getScenario() === 'empty' ? [] : sites;
      ids = visible
        .filter((s) => !query.category || s.category_id === query.category)
        .filter((s) => !query.q || siteMatches(s, query.q))
        .sort(compare(query.sort, query.order))
        .map((s) => s.id);
      key = String(++snapshotSeq);
      snapshots.set(key, ids);
    }

    const end = offset + query.limit;
    const items = ids
      .slice(offset, end)
      .map((id) => sites.find((s) => s.id === id))
      .filter((s): s is SiteT => s !== undefined);
    return ok(pageOf(Site), { items, next_cursor: end < ids.length ? `snap_${key}_${end}` : null, total: ids.length });
  }),

  http.get('/v1/categories', async () => {
    const override = await scenarioOverride();
    if (override) return override;
    if (!db.sessionProfileId) return unauthenticated();
    return ok(CategoryList, { items: categories });
  }),

  http.get('/v1/me/continue', async () => {
    const override = await scenarioOverride();
    if (override) return override;
    if (!db.sessionProfileId) return unauthenticated();
    const post = posts.find((p) => p.id === 'post_oceano');
    return ok(ContinueListening, getScenario() === 'empty' || !post ? null : { post, position_seconds: 252 });
  }),
];
