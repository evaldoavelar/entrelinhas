import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { Category, LibraryView, SiteSort, SortOrder } from '@entrelinhas/contracts';
import { Button, Icon, Select } from '../../components';
import { api } from '../../api';
import { useSession } from '../../app/session';
import { ContinueBanner } from './ContinueBanner';
import { SiteCard } from './SiteCard';
import { SortMenu } from './SortMenu';
import { useSites } from './useSites';

const VIEWS: { value: LibraryView; label: string }[] = [
  { value: 'cards', label: 'Cards' },
  { value: 'compact', label: 'Compactos' },
  { value: 'list', label: 'Lista' },
];

const SEARCH_DEBOUNCE_MS = 300;

function readSort(value: string | null): SiteSort {
  return value === 'name' ? 'name' : 'last_conversion';
}
function readOrder(value: string | null, sort: SiteSort): SortOrder {
  if (value === 'asc' || value === 'desc') return value;
  return sort === 'name' ? 'asc' : 'desc';
}

// Library (frames 01–03, 16, 18): search, category and sort live in the URL; the view mode is a
// profile preference (RF39). Filters always apply to the full set on the server (CA23).
export function LibraryPage() {
  const { state, updatePreferences } = useSession();
  const savedView = state.status === 'authenticated' ? state.session.preferences.library_view : 'cards';
  const [view, setView] = useState<LibraryView>(savedView);
  const [params, setParams] = useSearchParams();
  const sort = readSort(params.get('sort'));
  const order = readOrder(params.get('order'), sort);
  const category = params.get('category') ?? undefined;
  const q = params.get('q') ?? undefined;
  const [searchText, setSearchText] = useState(q ?? '');
  const [categories, setCategories] = useState<Category[]>([]);
  const sites = useSites({ sort, order, ...(category ? { category } : {}), ...(q ? { q } : {}) });
  const now = new Date();

  useEffect(() => {
    const abort = new AbortController();
    api.listCategories({ signal: abort.signal }).then((list) => setCategories(list.items), () => setCategories([]));
    return () => abort.abort();
  }, []);

  const setParam = (changes: Record<string, string | undefined>) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    const trimmed = searchText.trim();
    if (trimmed === (q ?? '')) return;
    const timer = setTimeout(() => setParam({ q: trimmed || undefined }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setParam is stable in behaviour; q drives re-sync
  }, [searchText, q]);

  const chooseView = (next: LibraryView) => {
    setView(next);
    void updatePreferences({ library_view: next });
  };

  const empty = sites.status === 'ready' && sites.total === 0;
  const filtered = Boolean(q || category);

  return (
    <div className="page library">
      <header className="page__header library__header">
        <div>
          <p className="page__eyebrow">Biblioteca</p>
          <h1 className="page__title">Sua biblioteca</h1>
          <p className="page__subtitle">Todos os seus sites. Cada leitura, uma nova escuta.</p>
        </div>
        <Link to="/imports/new" className="el-button el-button--primary library__add">
          Adicionar URL
        </Link>
      </header>

      <ContinueBanner />

      <div className="library__toolbar">
        <label className="library__search">
          <Icon name="search" />
          <input
            type="search"
            aria-label="Buscar em posts, resumos e tags"
            placeholder="Buscar em posts, resumos e tags…"
            value={searchText}
            maxLength={2000}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </label>
        <Select
          label="Categoria"
          labelHidden
          className="library__category"
          value={category ?? ''}
          onChange={(e) => setParam({ category: e.target.value || undefined })}
          options={[{ value: '', label: 'Categoria: Todas' }, ...categories.map((c) => ({ value: c.id, label: `Categoria: ${c.name}` }))]}
        />
        <SortMenu
          sort={sort}
          order={order}
          onChange={(nextSort, nextOrder) => setParam({ sort: nextSort === 'last_conversion' ? undefined : nextSort, order: nextOrder })}
        />
        <div role="group" aria-label="Modo de exibição" className="library__views">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              aria-pressed={view === v.value}
              className={`el-button ${view === v.value ? 'el-button--primary' : 'el-button--outline'}`}
              onClick={() => chooseView(v.value)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {sites.status === 'loading' ? (
        <p role="status" className="library__status">
          Carregando sites…
        </p>
      ) : null}

      {empty ? (
        <div className="library__empty">
          <p>{filtered ? 'Nenhum site encontrado com esses filtros.' : 'Sua biblioteca ainda está vazia.'}</p>
          {filtered ? null : (
            <Link to="/imports/new" className="el-button el-button--outline">
              Adicionar URL
            </Link>
          )}
        </div>
      ) : null}

      {sites.items.length > 0 ? (
        <ul aria-label="Sites" data-view={view} className={`site-grid site-grid--${view}`}>
          {sites.items.map((site) => (
            <SiteCard key={site.id} site={site} view={view} now={now} />
          ))}
        </ul>
      ) : null}

      {sites.status === 'error' && sites.error ? (
        <div className="library__error">
          <p role="alert">{sites.error.message}</p>
          <Button variant="outline" onClick={sites.retry}>
            Tentar de novo
          </Button>
        </div>
      ) : null}

      {sites.items.length > 0 ? (
        <footer className="library__footer">
          <p aria-live="polite">{`${sites.items.length} de ${sites.total} sites`}</p>
          {sites.nextCursor ? (
            <Button variant="outline" onClick={sites.loadMore} disabled={sites.status === 'loading-more'}>
              {sites.status === 'loading-more' ? 'Carregando…' : 'Carregar mais'}
            </Button>
          ) : null}
        </footer>
      ) : null}
    </div>
  );
}
