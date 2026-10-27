import { http } from 'msw';
import { SearchQuery, SearchResult, pageOf, type Post } from '@entrelinhas/contracts';
import { db } from '../db';
import { posts, postText } from '../fixtures';
import { ok } from '../respond';
import { errorResponse, getScenario, scenarioOverride } from '../scenario';
import { unauthenticated } from './session';

// SIMULATED global search (ADR-12) over every post, including the ones the library has not loaded
// (CA23). Snippets are plain-text segments; the UI renders them as text, never HTML (CA67).

type Segment = { text: string; highlight: boolean };
type Field = SearchResult['match_field'];

const fold = (char: string) =>
  char
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// Accent- and case-insensitive search that reports the match in original-text positions.
export function findMatch(text: string, q: string): { start: number; end: number } | null {
  let folded = '';
  const origin: number[] = [];
  for (let i = 0; i < text.length; i++) {
    for (const c of fold(text[i] as string)) {
      folded += c;
      origin.push(i);
    }
  }
  const needle = [...q].map(fold).join('');
  const at = folded.indexOf(needle);
  if (at < 0 || needle.length === 0) return null;
  // Combining marks fold to nothing; keep the ones after the last matched letter inside the match.
  let end = (origin[at + needle.length - 1] as number) + 1;
  while (end < text.length && /[̀-ͯ]/.test(text[end] as string)) end++;
  return { start: origin[at] as number, end };
}

// Frame 15 shows a short excerpt around the match ("…um veículo submarino de pesquisa…").
const CONTEXT = 12;
const SHORT_TEXT = 80;

export function textSnippet(text: string, match: { start: number; end: number }): Segment[] {
  let from = 0;
  let to = text.length;
  if (text.length > SHORT_TEXT) {
    from = Math.max(0, match.start - CONTEXT);
    to = Math.min(text.length, match.end + CONTEXT);
    // Never cut a word at the edges: move inward to a space outside the match, or outward to the
    // whole word when the window edge falls inside the word that touches the match.
    if (from > 0) {
      const space = text.indexOf(' ', from);
      from = space >= 0 && space + 1 < match.start ? space + 1 : text.lastIndexOf(' ', from) + 1;
    }
    if (to < text.length) {
      const inward = text.lastIndexOf(' ', to);
      const outward = text.indexOf(' ', to);
      to = inward > match.end ? inward : outward >= 0 ? outward : text.length;
    }
  }
  const segments: Segment[] = [
    { text: `${from > 0 ? '…' : ''}${text.slice(from, match.start)}`, highlight: false },
    { text: text.slice(match.start, match.end), highlight: true },
    { text: `${text.slice(match.end, to)}${to < text.length ? '…' : ''}`, highlight: false },
  ];
  return segments.filter((s) => s.text !== '');
}

function tagSnippet(tags: string[], q: string): Segment[] {
  return tags.flatMap((tag, i) => [
    ...(i > 0 ? [{ text: ', ', highlight: false }] : []),
    { text: tag, highlight: findMatch(tag, q) !== null },
  ]);
}

// Field priority: title, summary, body, then tags.
function matchPost(post: Post, q: string): SearchResult | null {
  const extra = postText[post.id];
  const fields: [Field, string | undefined][] = [
    ['title', post.title],
    ['summary', extra?.summary],
    ['body', extra?.body],
  ];
  for (const [field, text] of fields) {
    const match = text ? findMatch(text, q) : null;
    if (text && match) return { post, match_field: field, snippet: textSnippet(text, match) };
  }
  if (post.tags.some((tag) => findMatch(tag, q))) return { post, match_field: 'tags', snippet: tagSnippet(post.tags, q) };
  return null;
}

const newestFirst = (a: Post, b: Post) => Date.parse(b.published_at ?? '') - Date.parse(a.published_at ?? '');

// Snapshot per query (CA22): later pages reuse the result order fixed on the first page.
const snapshots = new Map<string, SearchResult[]>();
let snapshotSeq = 0;

export const searchHandlers = [
  http.get('/v1/search', async ({ request }) => {
    const override = await scenarioOverride();
    if (override) return override;
    if (!db.sessionProfileId) return unauthenticated();
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = SearchQuery.safeParse({ ...params, ...(params.limit ? { limit: Number(params.limit) } : {}) });
    if (!parsed.success) return errorResponse(400, 'invalid_request', 'Consulta inválida.');
    const query = parsed.data;

    let results: SearchResult[];
    let offset = 0;
    let key: string;
    if (query.cursor) {
      const match = /^search_(\d+)_(\d+)$/.exec(query.cursor);
      const snapshot = match ? snapshots.get(match[1] as string) : undefined;
      if (!match || !snapshot) return errorResponse(400, 'invalid_cursor', 'Cursor inválido ou expirado.');
      key = match[1] as string;
      results = snapshot;
      offset = Number(match[2]);
    } else {
      const visible = getScenario() === 'empty' ? [] : [...posts].sort(newestFirst);
      results = visible.map((post) => matchPost(post, query.q)).filter((r): r is SearchResult => r !== null);
      key = String(++snapshotSeq);
      snapshots.set(key, results);
    }

    const end = offset + query.limit;
    return ok(pageOf(SearchResult), {
      items: results.slice(offset, end),
      next_cursor: end < results.length ? `search_${key}_${end}` : null,
      total: results.length,
    });
  }),
];
