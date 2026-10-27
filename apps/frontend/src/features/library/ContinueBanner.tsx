import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router';
import type { ContinueListening } from '@entrelinhas/contracts';
import { Icon } from '../../components';
import { api } from '../../api';
import { formatRemaining } from './format';

// "Um bom momento para continuar." (frame 01). Silent when there is nothing to resume or on error.
export function ContinueBanner() {
  const [item, setItem] = useState<ContinueListening>(null);
  const id = useId();

  useEffect(() => {
    const abort = new AbortController();
    api.getContinueListening({ signal: abort.signal }).then(setItem, () => setItem(null));
    return () => abort.abort();
  }, []);

  if (!item) return null;
  const duration = item.post.duration_seconds ?? item.position_seconds;
  return (
    <section className="continue-banner" aria-labelledby={id}>
      <Icon name="headphones" size={32} />
      <div className="continue-banner__text">
        <h2 id={id} className="continue-banner__title">
          Um bom momento para continuar.
        </h2>
        <p className="continue-banner__detail">{`${item.post.title} · ${formatRemaining(duration, item.position_seconds)}`}</p>
      </div>
      <Link to={`/articles/${item.post.id}`} className="el-button el-button--primary continue-banner__action">
        Continuar
      </Link>
    </section>
  );
}
