import { Link } from 'react-router';
import type { Post } from '@entrelinhas/contracts';
import { Button, Chip, IconButton } from '../../components';
import { formatArticleDate, formatArticleDuration, formatListenState } from './format';
import { ArticleCover } from './ArticleCover';

export function ArticleCard({ post, actionsNoteId }: { post: Post; actionsNoteId: string }) {
  const date = formatArticleDate(post.published_at);
  const duration = formatArticleDuration(post.duration_seconds);
  const tagsText = post.tags.slice(0, 3).join(', ');
  const meta = [date, duration, tagsText].filter(Boolean).join(' · ');
  const listenLabel = formatListenState(post.listen_state);

  return (
    <li className="site-article">
      <ArticleCover />
      <div className="site-article__body">
        <h3 className="site-article__title">{post.title}</h3>
        <p className="site-article__meta">{meta}</p>
        <div className="site-article__status">
          <Chip>{listenLabel}</Chip>
        </div>
      </div>
      <div className="site-article__actions">
        <Link to={`/articles/${post.id}`} className="el-button el-button--primary site-article__listen">
          Ouvir
        </Link>
        <Button
          variant="outline"
          disabled
          aria-label={`Baixar áudio: ${post.title} (indisponível)`}
          aria-describedby={actionsNoteId}
        >
          Baixar
        </Button>
        <IconButton
          icon="more"
          disabled
          label={`Mais opções para ${post.title} (indisponível)`}
          aria-describedby={actionsNoteId}
        />
      </div>
    </li>
  );
}
