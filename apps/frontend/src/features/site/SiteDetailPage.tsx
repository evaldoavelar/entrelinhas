import { Link, useParams, useSearchParams } from 'react-router';
import { Button } from '../../components';
import { ArticleCard } from './ArticleCard';
import { formatConversion } from './format';
import { useSiteDetail } from './useSiteDetail';
import './site.css';

export function SiteDetailPage() {
  const params = useParams<{ siteId: string }>();
  const siteId = params.siteId ?? '';
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') === 'unheard' ? 'unheard' : 'all';

  const setFilter = (next: 'all' | 'unheard') => {
    const nextParams = new URLSearchParams(searchParams);
    if (next === 'all') nextParams.delete('filter');
    else nextParams.set('filter', next);
    setSearchParams(nextParams, { replace: true });
  };

  const { site, posts, nextCursor, status, error, loadMore, retry } = useSiteDetail(siteId, filter);
  const now = new Date();

  if (status === 'error' && error?.status === 404) {
    return (
      <div className="page site-detail">
        <div className="site-detail__not-found">
          <h1 className="page__title">Site não encontrado</h1>
          <p className="page__subtitle">O site solicitado não foi encontrado ou não existe mais.</p>
          <Link to="/library" className="el-button el-button--primary site-detail__back-link">
            Voltar para a biblioteca
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error' && !site) {
    return (
      <div className="page site-detail">
        <div className="site-detail__error">
          <p role="alert">{error?.message ?? 'Não foi possível carregar as informações do site.'}</p>
          <Button variant="outline" onClick={retry}>
            Tentar de novo
          </Button>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="page site-detail">
        <p role="status" className="site-detail__status">
          Carregando site…
        </p>
      </div>
    );
  }

  const audioCountLabel = `${site.audio_count} ${site.audio_count === 1 ? 'áudio' : 'áudios'}`;

  return (
    <div className="page site-detail">
      <nav aria-label="Navegação estrutural">
        <Link to="/library" className="page__eyebrow site-detail__eyebrow">
          BIBLIOTECA
        </Link>
      </nav>

      <header className="site-detail__header">
        <div>
          <h1 className="page__title site-detail__title">{site.name}</h1>
          <p className="page__subtitle site-detail__subtitle">
            {`${site.domain} · Última conversão ${formatConversion(site.last_conversion_at, now)}`}
          </p>
        </div>
        <Button
          variant="outline"
          disabled
          className="site-detail__config"
          title="Configuração de fonte indisponível nesta versão"
        >
          Configurar fonte
        </Button>
      </header>

      <div className="site-detail__filter-bar">
        <span className="site-detail__count-chip">{audioCountLabel}</span>
        <div role="group" aria-label="Filtro de artigos" className="site-detail__filters">
          <button
            type="button"
            aria-pressed={filter === 'all'}
            className={`el-button site-detail__filter-btn ${filter === 'all' ? 'el-button--primary' : 'el-button--outline'}`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button
            type="button"
            aria-pressed={filter === 'unheard'}
            className={`el-button site-detail__filter-btn ${filter === 'unheard' ? 'el-button--primary' : 'el-button--outline'}`}
            onClick={() => setFilter('unheard')}
          >
            Não ouvidos
          </button>
        </div>
        <span className="site-detail__sort-caption">Mais recentes primeiro</span>
      </div>

      <section className="site-detail__card" aria-labelledby="articles-heading">
        <h2 id="articles-heading" className="site-detail__section-title">
          Artigos convertidos
        </h2>

        {status === 'loading' ? (
          <p role="status" className="site-detail__status">
            Carregando artigos…
          </p>
        ) : null}

        {status === 'ready' && posts.length === 0 ? (
          <div className="site-detail__empty">
            <p>{filter === 'unheard' ? 'Nenhum artigo não ouvido neste site.' : 'Nenhum artigo convertido ainda neste site.'}</p>
          </div>
        ) : null}

        {posts.length > 0 ? (
          <ul className="site-detail__list" aria-label="Artigos convertidos">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </ul>
        ) : null}

        {status === 'error' && error ? (
          <div className="site-detail__error">
            <p role="alert">{error.message}</p>
            <Button variant="outline" onClick={retry}>
              Tentar de novo
            </Button>
          </div>
        ) : null}
      </section>

      <div className="site-detail__bottom-actions">
        <Button variant="outline" disabled title="Adicionar à playlist indisponível nesta versão">
          Adicionar todos à playlist
        </Button>
        {nextCursor ? (
          <Button variant="outline" onClick={loadMore} disabled={status === 'loading-more'}>
            {status === 'loading-more' ? 'Carregando…' : 'Carregar mais artigos'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
