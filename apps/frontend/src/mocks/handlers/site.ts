import { http } from 'msw';
import { pageOf, Post, Site, SitePostsQuery, type Post as PostT } from '@entrelinhas/contracts';
import { db } from '../db';
import { posts, sites } from '../fixtures';
import { ok } from '../respond';
import { errorResponse, getScenario, scenarioOverride } from '../scenario';
import { unauthenticated } from './session';

// Snapshot of ordered ids per query (CA22): later pages reuse the order fixed on the first page.
const snapshots = new Map<string, string[]>();
let snapshotSeq = 0;

export const siteHandlers = [
  http.get('/v1/sites/:id', async ({ params }) => {
    const override = await scenarioOverride();
    if (override) return override;
    if (!db.sessionProfileId) return unauthenticated();

    const siteList = getScenario() === 'empty' ? [] : sites;
    const found = siteList.find((s) => s.id === params.id);
    if (!found) return errorResponse(404, 'not_found', 'Site não encontrado.');

    return ok(Site, found);
  }),

  http.get('/v1/sites/:id/posts', async ({ params, request }) => {
    const override = await scenarioOverride();
    if (override) return override;
    if (!db.sessionProfileId) return unauthenticated();

    const siteList = getScenario() === 'empty' ? [] : sites;
    const foundSite = siteList.find((s) => s.id === params.id);
    if (!foundSite) return errorResponse(404, 'not_found', 'Site não encontrado.');

    const urlParams = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = SitePostsQuery.safeParse({ ...urlParams, ...(urlParams.limit ? { limit: Number(urlParams.limit) } : {}) });
    if (!parsed.success) return errorResponse(400, 'invalid_request', 'Consulta inválida.');
    const query = parsed.data;

    let ids: string[];
    let offset = 0;
    let key: string;
    if (query.cursor) {
      const match = /^snap_(\d+)_(\d+)$/.exec(query.cursor);
      const snapshot = match ? snapshots.get(match[1] as string) : undefined;
      if (!snapshot || !match) return errorResponse(400, 'invalid_cursor', 'Cursor inválido ou expirado.');
      key = match[1] as string;
      ids = snapshot;
      offset = Number(match[2]);
    } else {
      const visible = getScenario() === 'empty' ? [] : posts;
      ids = visible
        .filter((p) => p.site_id === params.id)
        .filter((p) => (query.filter === 'unheard' ? p.listen_state === 'unheard' : true))
        .sort((a, b) => (Date.parse(b.published_at ?? '') || 0) - (Date.parse(a.published_at ?? '') || 0))
        .map((p) => p.id);
      key = String(++snapshotSeq);
      snapshots.set(key, ids);
    }

    const end = offset + query.limit;
    const items = ids
      .slice(offset, end)
      .map((id) => posts.find((p) => p.id === id))
      .filter((p): p is PostT => p !== undefined);

    return ok(pageOf(Post), { items, next_cursor: end < ids.length ? `snap_${key}_${end}` : null, total: ids.length });
  }),
];
