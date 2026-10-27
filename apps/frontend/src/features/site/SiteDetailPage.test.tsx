import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { SessionProvider } from '../../app/session';
import { db } from '../../mocks/db';
import { server } from '../../mocks/server';
import { siteHandlers } from '../../mocks/handlers/site';
import { SiteDetailPage } from './SiteDetailPage';
import { PAGE_SIZE } from './useSiteDetail';

beforeEach(() => {
  server.use(...siteHandlers);
  db.sessionProfileId = 'prof_evaldo';
});

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

function renderPage(initialPath = '/sites/site_horizonte') {
  const router = createMemoryRouter(
    [
      {
        path: '/sites/:siteId',
        element: <SiteDetailPage />,
      },
      {
        path: '/library',
        element: <div>Página da Biblioteca</div>,
      },
      {
        path: '/articles/:postId',
        element: <div>Página do Artigo</div>,
      },
    ],
    { initialEntries: [initialPath] },
  );

  return render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
}

test('renders site details: eyebrow, title, domain and conversion time', async () => {
  renderPage();

  expect(screen.getByRole('status')).toHaveTextContent('Carregando site…');

  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Horizonte' })).toBeInTheDocument());
  expect(screen.getByRole('link', { name: 'Biblioteca' })).toHaveAttribute('href', '/library');
  expect(screen.getByText(/horizonte\.example · Última conversão/)).toBeInTheDocument();
  expect(screen.getByText('12 áudios')).toBeInTheDocument();
  expect(screen.getByText('Mais recentes primeiro')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Configurar fonte' })).toBeDisabled();
});

test('renders converted articles list with actions', async () => {
  renderPage();

  await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: 'Artigos convertidos' })).toBeInTheDocument());
  expect(screen.getByText('O que existe no fundo do oceano?')).toBeInTheDocument();
  expect(screen.getByText(/24 out\. · 12 min 48 s/)).toBeInTheDocument();
  expect(screen.getByText('Em reprodução')).toBeInTheDocument();

  const listenLink = screen.getAllByRole('link', { name: 'Ouvir' })[0];
  expect(listenLink).toHaveAttribute('href', '/articles/post_oceano');

  const downloadButtons = screen.getAllByRole('button', { name: /Baixar áudio:/ });
  expect(downloadButtons[0]).toBeDisabled();

  const moreButtons = screen.getAllByRole('button', { name: /Mais opções para/ });
  expect(moreButtons[0]).toBeDisabled();
});

test('switching filter to "Não ouvidos" and back to "Todos" updates aria-pressed and filters list', async () => {
  const user = userEvent.setup();
  renderPage();

  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Horizonte' })).toBeInTheDocument());

  expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Não ouvidos' })).toHaveAttribute('aria-pressed', 'false');

  await user.click(screen.getByRole('button', { name: 'Não ouvidos' }));

  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Não ouvidos' })).toHaveAttribute('aria-pressed', 'true'),
  );
  expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false');

  // post_oceano (in_progress) should not be in unheard list
  expect(screen.queryByText('O que existe no fundo do oceano?')).not.toBeInTheDocument();
  expect(screen.getByText('As cidades que estão redescobrindo seus rios')).toBeInTheDocument();
  expect(screen.getByText('O futuro da energia cabe no telhado')).toBeInTheDocument();

  // Switch back to "Todos"
  await user.click(screen.getByRole('button', { name: 'Todos' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true'),
  );
  expect(screen.getByText('O que existe no fundo do oceano?')).toBeInTheDocument();
});

test('loads more articles when "Carregar mais artigos" is clicked', async () => {
  const user = userEvent.setup();
  renderPage();

  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Horizonte' })).toBeInTheDocument());

  const loadMoreButton = screen.getByRole('button', { name: 'Carregar mais artigos' });
  expect(loadMoreButton).toBeInTheDocument();

  await user.click(loadMoreButton);

  await waitFor(() => expect(screen.getByText('Por que as marés mudam a cada dia')).toBeInTheDocument());
  expect(screen.getAllByRole('listitem')).toHaveLength(PAGE_SIZE * 2);

  await user.click(screen.getByRole('button', { name: 'Carregar mais artigos' }));
  await waitFor(() => expect(screen.getByText('Mercados de bairro e a economia local')).toBeInTheDocument());
  // All 12 posts are loaded, cursor is exhausted
  expect(screen.getAllByRole('listitem')).toHaveLength(12);
  expect(screen.queryByRole('button', { name: 'Carregar mais artigos' })).not.toBeInTheDocument();
});

test('shows empty state when site has no unheard articles with filter=unheard', async () => {
  renderPage('/sites/site_palavra?filter=unheard');

  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Palavra' })).toBeInTheDocument());
  expect(screen.getByText('Nenhum artigo não ouvido neste site.')).toBeInTheDocument();
});

test('shows empty state when site has no converted articles', async () => {
  renderPage('/sites/site_sextante');

  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Sextante' })).toBeInTheDocument());
  expect(screen.getByText('Nenhum artigo convertido ainda neste site.')).toBeInTheDocument();
});

test('shows 404 state when site does not exist', async () => {
  renderPage('/sites/site_inexistente');

  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Site não encontrado' })).toBeInTheDocument());
  expect(screen.getByRole('link', { name: 'Voltar para a biblioteca' })).toHaveAttribute('href', '/library');
});

test('shows error message and retries on failure', async () => {
  const user = userEvent.setup();
  db.sessionProfileId = null;
  renderPage();

  await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  const retryButton = screen.getByRole('button', { name: 'Tentar de novo' });

  db.sessionProfileId = 'prof_evaldo';
  await user.click(retryButton);

  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Horizonte' })).toBeInTheDocument());
});

test('renders error state on retry when loadMore failed after articles were loaded', async () => {
  const user = userEvent.setup();
  renderPage();

  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Horizonte' })).toBeInTheDocument());

  db.sessionProfileId = null;
  await user.click(screen.getByRole('button', { name: 'Carregar mais artigos' }));

  await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  // Articles already loaded should still be visible
  expect(screen.getByText('O que existe no fundo do oceano?')).toBeInTheDocument();

  db.sessionProfileId = 'prof_evaldo';
  await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));

  await waitFor(() => expect(screen.getByText('Por que as marés mudam a cada dia')).toBeInTheDocument());
});

test('disabled actions say why, to assistive technology (a11y)', async () => {
  renderPage();

  await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: 'Artigos convertidos' })).toBeInTheDocument());
  const download = screen.getAllByRole('button', { name: /Baixar áudio:/ })[0] as HTMLElement;
  expect(download).toHaveAccessibleDescription('Baixar e mais opções chegam com o player.');
  const more = screen.getAllByRole('button', { name: /Mais opções para/ })[0] as HTMLElement;
  expect(more).toHaveAccessibleDescription('Baixar e mais opções chegam com o player.');
  expect(screen.getByRole('button', { name: 'Configurar fonte' })).toHaveAccessibleDescription('Configuração de fonte indisponível nesta versão.');
});
