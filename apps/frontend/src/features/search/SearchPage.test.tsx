import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../../app/router';
import { SessionProvider } from '../../app/session';
import { db } from '../../mocks/db';
import { setScenario } from '../../mocks/scenario';

beforeEach(() => {
  db.sessionProfileId = 'prof_evaldo';
});

function renderSearch(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
  return router;
}

const results = () => screen.findByRole('list', { name: 'Leituras encontradas' });
const searchbox = () => screen.getByRole('searchbox', { name: 'Buscar em todos os sites' });

test('results from every site say where they matched, with the match highlighted (frame 15, RF17, CA05)', async () => {
  renderSearch('/search?q=submarino');
  expect(await screen.findByRole('heading', { level: 1, name: 'Resultados da busca' })).toBeInTheDocument();
  const list = await results();
  expect(searchbox()).toHaveValue('submarino');
  expect(screen.getByText('3 posts encontrados · texto, resumo e tags')).toBeInTheDocument();
  const items = within(list).getAllByRole('listitem');
  expect(items.map((li) => within(li).getByRole('heading', { level: 3 }).textContent)).toEqual([
    'O que existe no fundo do oceano?',
    'A tecnologia por trás das expedições',
    'Como a vida se adapta às profundezas',
  ]);
  const [oceano, expedicoes, profundezas] = items as [HTMLElement, HTMLElement, HTMLElement];
  expect(oceano).toHaveTextContent('Horizonte · Encontrado no texto: “');
  expect(within(oceano).getByText('submarino', { selector: 'mark' })).toBeInTheDocument();
  expect(within(oceano).getByText('Em andamento')).toBeInTheDocument();
  expect(expedicoes).toHaveTextContent('Circuito · Encontrado nas tags: submarino, exploração');
  expect(profundezas).toHaveTextContent('Ciência Aberta · Encontrado no resumo: “Adaptações em um ambiente submarino extremo.”');
  expect(within(profundezas).getByText('Não ouvido')).toBeInTheDocument();
});

test('listen opens the article; download and more actions are not available yet and say so', async () => {
  renderSearch('/search?q=submarino');
  const first = within(await results()).getAllByRole('listitem')[0] as HTMLElement;
  expect(within(first).getByRole('link', { name: 'Ouvir O que existe no fundo do oceano?' })).toHaveAttribute('href', '/articles/post_oceano');
  const download = within(first).getByRole('button', { name: 'Baixar O que existe no fundo do oceano?' });
  expect(download).toBeDisabled();
  expect(download).toHaveAccessibleDescription('Baixar e mais ações chegam com o player.');
  expect(within(first).getByRole('button', { name: 'Mais ações para O que existe no fundo do oceano?' })).toBeDisabled();
});

test('query markup is shown as text and never interpreted (CA67)', async () => {
  renderSearch(`/search?q=${encodeURIComponent('<img src=x onerror=alert(1)>')}`);
  // The live region announces the outcome (review agy r1 #5).
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Nenhuma leitura encontrada para “<img src=x onerror=alert(1)>”.'));
  expect(document.querySelector('img')).toBeNull();
});

test('typing searches after a pause; Limpar clears the query and focuses the box', async () => {
  const router = renderSearch('/search');
  expect(await screen.findByText('Digite um termo para buscar em todos os sites.')).toBeInTheDocument();
  await userEvent.type(searchbox(), 'profundezas');
  await waitFor(() => expect(router.state.location.search).toBe('?q=profundezas'));
  expect(within(await results()).getAllByRole('listitem')).toHaveLength(1);
  expect(screen.getByText('1 post encontrado · texto, resumo e tags')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Limpar' }));
  expect(searchbox()).toHaveValue('');
  expect(searchbox()).toHaveFocus();
  expect(router.state.location.search).toBe('');
  expect(screen.getByText('Digite um termo para buscar em todos os sites.')).toBeInTheDocument();
});

test('load more appends the next page of the same snapshot (CA22)', async () => {
  renderSearch('/search?q=o');
  const list = await results();
  expect(within(list).getAllByRole('listitem')).toHaveLength(6);
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }));
  await waitFor(() => expect(within(list).getAllByRole('listitem').length).toBeGreaterThan(6));
  expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull();
});

test('error shows the server message and retries', async () => {
  setScenario('unavailable');
  renderSearch('/search?q=submarino');
  expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível no momento.');
  setScenario('default');
  await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
  expect(within(await results()).getAllByRole('listitem')).toHaveLength(3);
});

test('back to the library, and the library links to the global search for its query', async () => {
  const router = renderSearch('/library?q=submarino');
  await userEvent.click(await screen.findByRole('link', { name: 'Ver leituras com “submarino”' }));
  expect(router.state.location.pathname).toBe('/search');
  expect(router.state.location.search).toBe('?q=submarino');
  await results();
  await userEvent.click(screen.getByRole('link', { name: 'Voltar à biblioteca' }));
  expect(router.state.location.pathname).toBe('/library');
});

test('back/forward to another query updates the box; erasing the text by hand clears the search', async () => {
  const router = renderSearch('/search?q=submarino');
  await results();
  await router.navigate('/search?q=profundezas');
  await waitFor(() => expect(searchbox()).toHaveValue('profundezas'));
  expect(within(await results()).getAllByRole('listitem')).toHaveLength(1);
  await userEvent.clear(searchbox());
  await waitFor(() => expect(router.state.location.search).toBe(''));
  expect(screen.getByRole('status')).toHaveTextContent('Digite um termo para buscar em todos os sites.');
});
