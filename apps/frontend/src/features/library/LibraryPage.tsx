import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { Category, LibraryView, SiteSort, SortOrder } from '@entrelinhas/contracts';
import { Button, Icon, Select, type IconName } from '../../components';
import { api } from '../../api';
import { useSession } from '../../app/session';
import { ContinueBanner } from './ContinueBanner';
import { SiteCard } from './SiteCard';
import { SortMenu } from './SortMenu';
import { useSites } from './useSites';
import './library.css';

// Icons stand in for the labels on mobile (frame 16); the label stays as the accessible name.
const VIEWS: { value: LibraryView; label: string; icon: IconName }[] = [
  { value: 'cards', label: 'Cards', icon: 'grid' },
  { value: 'compact', label: 'Compactos', icon: 'rows' },
  { value: 'list', label: 'Lista', icon: 'list' },
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
  // q changed from outside the box (link, back button): show it instead of re-applying old text.
  const [shownQ, setShownQ] = useState(q);
  if (q !== shownQ) {
    setShownQ(q);
    if ((q ?? '') !== searchText.trim()) setSearchText(q ?? '');
  }
  const [viewError, setViewError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const sites = useSites({ sort, order, ...(category ? { category } : {}), ...(q ? { q } : {}) });
  const now = new Date();

  useEffect(() => {
    const abort = new AbortController();
    api.listCategories({ signal: abort.signal }).then((list) => setCategories(list.items), () => setCategories([]));
    return () => abort.abort();
  }, []);

  // The search debounce calls setParam from an older render; React Router's functional updater
  // would start from that render's params and undo a category/sort chosen meanwhile.
  const latestParams = useRef(params);
  useEffect(() => {
    latestParams.current = params;
  }, [params]);
  const setParam = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(latestParams.current);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    latestParams.current = next;
    setParams(next, { replace: true });
  };

  useEffect(() => {
    const trimmed = searchText.trim();
    if (trimmed === (q ?? '')) return;
    const timer = setTimeout(() => setParam({ q: trimmed || undefined }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setParam is stable in behaviour; q drives re-sync
  }, [searchText, q]);

  // Optimistic switch; a preference that could not be saved is reverted so RF39 never lies.
  const chooseView = (next: LibraryView) => {
    const previous = view;
    setView(next);
    setViewError('');
    updatePreferences({ library_view: next }).catch(() => {
      setView(previous);
      setViewError('Não foi possível salvar o modo de exibição. Tente de novo.');
    });
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
              className={`el-button library__view ${view === v.value ? 'el-button--primary' : 'el-button--outline'}`}
              onClick={() => chooseView(v.value)}
            >
              <Icon name={v.icon} />
              <span className="library__view-label">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {viewError ? (
        <p role="alert" className="library__view-error">
          {viewError}
        </p>
      ) : null}

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
