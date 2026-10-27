import { Link } from 'react-router';
import type { LibraryView, Site } from '@entrelinhas/contracts';
import { Chip, Icon } from '../../components';
import { formatConversion } from './format';

function counts(site: Site): string {
  const audios = `${site.audio_count} ${site.audio_count === 1 ? 'áudio' : 'áudios'}`;
  if (site.audio_count === 0) return audios;
  if (site.unheard_count === 0) return `${audios} · Todos ouvidos`;
  return `${audios} · ${site.unheard_count} ${site.unheard_count === 1 ? 'não ouvido' : 'não ouvidos'}`;
}

const MONITORING_LABEL = { active: 'Monitorando', paused: 'Pausado', none: null } as const;

// One card per site (RF04, RF05), in the three layouts of frames 01–03.
export function SiteCard({ site, view, now }: { site: Site; view: LibraryView; now: Date }) {
  const monitoring = MONITORING_LABEL[site.monitoring];
  return (
    <li className={`site-card site-card--${view}`}>
      <div className="site-card__identity">
        <span className="site-card__icon" aria-hidden="true">
          {site.name.slice(0, 1)}
        </span>
        <div>
          <h2 className="site-card__name">{site.name}</h2>
          <p className="site-card__domain">{site.domain}</p>
        </div>
      </div>
      {site.category_name ? (
        <span className="site-card__category">
          <Chip tone="accent">{site.category_name}</Chip>
        </span>
      ) : null}
      <div className="site-card__meta">
        <p>{counts(site)}</p>
        <p>{`Última conversão · ${formatConversion(site.last_conversion_at, now)}`}</p>
      </div>
      {view === 'cards' ? (
        <div className="site-card__footer">
          {monitoring ? <Chip>{monitoring}</Chip> : <span />}
          <Link to={`/sites/${site.id}`} className="site-card__open" aria-label={`Abrir site ${site.name}`}>
            Abrir site <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      ) : (
        <Link to={`/sites/${site.id}`} className="site-card__overlay" aria-label={`Abrir site ${site.name}`} />
      )}
    </li>
  );
}
