import { useEffect, useId, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { Post, SearchQuery, SearchResult } from '@entrelinhas/contracts';
import { Button, Chip, Icon } from '../../components';
import { api } from '../../api';
import { usePagedList, type FetchPage } from '../shared/usePagedList';
import './search.css';

export const PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MS = 300;

const fetchResults: FetchPage<{ q: string }, SearchResult> = (query, cursor, signal) =>
  api.search({ q: query.q, limit: PAGE_SIZE, ...(cursor ? { cursor } : {}) } satisfies SearchQuery, { signal });

const MATCH_LABEL: Record<SearchResult['match_field'], string> = {
  title: 'Encontrado no título',
  summary: 'Encontrado no resumo',
  body: 'Encontrado no texto',
  tags: 'Encontrado nas tags',
};

const LISTEN_LABEL: Record<Post['listen_state'], string> = {
  unheard: 'Não ouvido',
  in_progress: 'Em andamento',
  heard: 'Ouvido',
};

// Generic cover (frames 05/15): decorative, no external image.
function Cover() {
  return (
    <svg className="search-result__cover" viewBox="0 0 80 64" aria-hidden="true" focusable="false">
      <circle cx="58" cy="14" r="10" className="search-result__cover-sun" />
      <path d="M0 64V40l18-18 22 26 12-10 28 26z" className="search-result__cover-a" />
      <path d="M0 64V52l26-14 20 12 14-8 20 22z" className="search-result__cover-b" />
    </svg>
  );
}

// Highlighted segments come from the server as plain text and are rendered as text (CA67).
function Snippet({ result }: { result: SearchResult }) {
  const segments = result.snippet.map((s, i) => (s.highlight ? <mark key={i}>{s.text}</mark> : <span key={i}>{s.text}</span>));
  return result.match_field === 'tags' ? <>{segments}</> : <>“{segments}”</>;
}

function ResultItem({ result, actionsNoteId }: { result: SearchResult; actionsNoteId: string }) {
  const { post } = result;
  return (
    <li className="search-result">
      <Cover />
      <div className="search-result__text">
        <h3 className="search-result__title">{post.title}</h3>
        <p className="search-result__match">
          {`${post.site_name} · ${MATCH_LABEL[result.match_field]}: `}
          <Snippet result={result} />
        </p>
        <Chip tone="accent">{LISTEN_LABEL[post.listen_state]}</Chip>
      </div>
      <div className="search-result__actions">
        <Link to={`/articles/${post.id}`} className="el-button el-button--primary" aria-label={`Ouvir ${post.title}`}>
          Ouvir
        </Link>
        <Button variant="outline" disabled aria-label={`Baixar ${post.title}`} aria-describedby={actionsNoteId}>
          Baixar
        </Button>
        <button
          type="button"
          className="el-icon-button"
          disabled
          aria-label={`Mais ações para ${post.title}`}
          aria-describedby={actionsNoteId}
        >
          <Icon name="more" />
        </button>
      </div>
    </li>
  );
}

// Global search (frame 15): every post of every site, including the ones the library has not
// loaded (CA23). The query lives in the URL.
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q')?.trim() || undefined;
  const [searchText, setSearchText] = useState(q ?? '');
  // q changed from outside the box (link, back button): show it instead of re-applying old text.
  // Our own debounced push is skipped: the navigation renders in a transition, so the user may
  // already have typed more by then.
  const [shownQ, setShownQ] = useState(q);
  const [pushedQ, setPushedQ] = useState(q);
  if (q !== shownQ) {
    setShownQ(q);
    if (q !== pushedQ && (q ?? '') !== searchText.trim()) setSearchText(q ?? '');
  }
  const input = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const actionsNoteId = useId();
  const results = usePagedList(q ? { q } : null, fetchResults);

  useEffect(() => {
    const trimmed = searchText.trim();
    if (trimmed === (q ?? '')) return;
    const timer = setTimeout(() => {
      setPushedQ(trimmed || undefined);
      setParams(trimmed ? { q: trimmed } : {}, { replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText, q, setParams]);

  const clear = () => {
    setSearchText('');
    setPushedQ(undefined);
    setParams({}, { replace: true });
    input.current?.focus();
  };

  const count = `${results.total} ${results.total === 1 ? 'post encontrado' : 'posts encontrados'} · texto, resumo e tags`;

  return (
    <div className="page search">
      <header className="page__header">
        <p className="page__eyebrow">Biblioteca</p>
        <h1 className="page__title">Resultados da busca</h1>
        <p className="page__subtitle">Buscando em todos os sites, inclusive nos posts ainda não carregados.</p>
      </header>

      <div className="search__bar">
        <Icon name="search" />
        <input
          ref={input}
          type="search"
          aria-label="Buscar em todos os sites"
          placeholder="Buscar em posts, resumos e tags…"
          value={searchText}
          maxLength={2000}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button variant="outline" onClick={clear}>
          Limpar
        </Button>
      </div>

      {/* One live region for idle, loading and "no results", so every outcome is announced. */}
      <p role="status" className="search__status">
        {results.status === 'idle' ? 'Digite um termo para buscar em todos os sites.' : null}
        {results.status === 'loading' ? 'Buscando…' : null}
        {results.status === 'ready' && results.total === 0 ? `Nenhuma leitura encontrada para “${q ?? ''}”.` : null}
      </p>

      {results.items.length > 0 ? (
        <>
          <p className="search__count" aria-live="polite">
            {count}
          </p>
          <section className="search__results" aria-labelledby={titleId}>
            <h2 id={titleId} className="search__results-title">
              Leituras encontradas
            </h2>
            <ul aria-labelledby={titleId} className="search__list">
              {results.items.map((result) => (
                <ResultItem key={result.post.id} result={result} actionsNoteId={actionsNoteId} />
              ))}
            </ul>
            <p id={actionsNoteId} className="visually-hidden">
              Baixar e mais ações chegam com o player.
            </p>
            {results.nextCursor ? (
              <Button variant="outline" onClick={results.loadMore} disabled={results.status === 'loading-more'}>
                {results.status === 'loading-more' ? 'Carregando…' : 'Carregar mais'}
              </Button>
            ) : null}
          </section>
        </>
      ) : null}

      {results.status === 'error' && results.error ? (
        <div className="search__error">
          <p role="alert">{results.error.message}</p>
          <Button variant="outline" onClick={results.retry}>
            Tentar de novo
          </Button>
        </div>
      ) : null}

      <Link to="/library" className="el-button el-button--outline search__back">
        Voltar à biblioteca
      </Link>
    </div>
  );
}
