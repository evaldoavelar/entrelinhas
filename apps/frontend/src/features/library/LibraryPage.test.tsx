import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../../app/router';
import { SessionProvider } from '../../app/session';
import { db } from '../../mocks/db';
import { setScenario } from '../../mocks/scenario';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-27T15:00:00-03:00'));
  db.sessionProfileId = 'prof_evaldo';
});
afterEach(() => vi.useRealTimers());

function renderLibrary(path = '/library') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
  return router;
}

const siteList = () => screen.findByRole('list', { name: 'Sites' });
const siteNames = (list: HTMLElement) => within(list).getAllByRole('heading', { level: 2 }).map((h) => h.textContent);

test('cards ordered by last conversion with count and site details (frame 01, RF04, RF05, RF15)', async () => {
  renderLibrary();
  expect(await screen.findByRole('heading', { level: 1, name: 'Sua biblioteca' })).toBeInTheDocument();
  const list = await siteList();
  expect(siteNames(list)).toEqual(['Horizonte', 'Circuito', 'Ciência Aberta', 'Ideias', 'Cotidiano', 'Palavra']);
  const horizonte = within(list).getAllByRole('listitem')[0]!;
  expect(horizonte).toHaveTextContent('horizonte.example');
  expect(horizonte).toHaveTextContent('Ciência');
  expect(horizonte).toHaveTextContent('12 áudios · 3 não ouvidos');
  expect(horizonte).toHaveTextContent('Última conversão · Hoje, 13:42');
  expect(within(horizonte).getByRole('link', { name: 'Abrir site Horizonte' })).toHaveAttribute('href', '/sites/site_horizonte');
  expect(screen.getByText('6 de 24 sites')).toBeInTheDocument();
});

test('load more appends the next page without duplicates (RF38, CA22)', async () => {
  renderLibrary();
  await siteList();
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }));
  await waitFor(() => expect(screen.getByText('12 de 24 sites')).toBeInTheDocument());
  const names = siteNames(await siteList());
  expect(new Set(names).size).toBe(12);
});

test('sort menu by keyboard: name ascending (frame 18, RF16, CA04)', async () => {
  renderLibrary();
  await siteList();
  const sortButton = screen.getByRole('button', { name: /Ordenar/ });
  sortButton.focus();
  await userEvent.keyboard('{Enter}');
  const menu = screen.getByRole('menu', { name: 'Ordenar biblioteca' });
  expect(menu).toHaveTextContent('Vale para todos os sites, inclusive os ainda não carregados.');
  expect(within(menu).getByRole('menuitemradio', { name: 'Última conversão' })).toHaveAttribute('aria-checked', 'true');
  await userEvent.click(within(menu).getByRole('menuitemradio', { name: 'Nome do site' }));
  await waitFor(async () => expect(siteNames(await siteList()).slice(0, 3)).toEqual(['Atlas', 'Bússola', 'Cais']));
  // Name sort uses A–Z wording for the direction (frame 18 only shows the date wording).
  await userEvent.click(screen.getByRole('button', { name: /Ordenar/ }));
  expect(screen.getByRole('menuitemradio', { name: 'A a Z' })).toHaveAttribute('aria-checked', 'true');
  // Focus starts on the checked criterion (Nome do site); two steps down reach "Z a A".
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
  await waitFor(async () => expect(siteNames(await siteList())[0]).toBe('Sextante'));
});

test('sort menu closes with Escape and returns focus', async () => {
  renderLibrary();
  await siteList();
  const sortButton = screen.getByRole('button', { name: /Ordenar/ });
  await userEvent.click(sortButton);
  expect(screen.getByRole('menu')).toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
  expect(screen.queryByRole('menu')).toBeNull();
  expect(sortButton).toHaveFocus();
});

test('category filter combined with search keeps the URL state (RF45, CA33)', async () => {
  const router = renderLibrary();
  await siteList();
  await userEvent.selectOptions(screen.getByLabelText('Categoria'), 'cat_ciencia');
  await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar em posts, resumos e tags' }), 'submarino');
  await waitFor(async () => expect(siteNames(await siteList()).sort()).toEqual(['Ciência Aberta', 'Horizonte']));
  expect(router.state.location.search).toContain('category=cat_ciencia');
  expect(router.state.location.search).toContain('q=submarino');
});

test('changing the category while a search is pending is not reverted by the debounce', async () => {
  const router = renderLibrary('/library?q=submarino&category=cat_ciencia');
  await siteList();
  await userEvent.clear(screen.getByRole('searchbox', { name: 'Buscar em posts, resumos e tags' }));
  await userEvent.selectOptions(screen.getByLabelText('Categoria'), '');
  await waitFor(() => expect(router.state.location.search).not.toContain('q='));
  expect(router.state.location.search).not.toContain('category=');
});

test('search finds sites by words only present in posts not yet loaded (CA05, CA23)', async () => {
  renderLibrary('/library?q=submarino');
  await waitFor(async () => expect(siteNames(await siteList()).sort((a, b) => a!.localeCompare(b!, 'pt-BR'))).toEqual(['Ciência Aberta', 'Circuito', 'Horizonte']));
});

test('view mode buttons switch layout, keep filters and persist in the profile (RF37, RF39, CA21)', async () => {
  renderLibrary('/library?category=cat_cultura');
  await siteList();
  const group = screen.getByRole('group', { name: 'Modo de exibição' });
  expect(within(group).getByRole('button', { name: 'Cards' })).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(within(group).getByRole('button', { name: 'Lista' }));
  expect(within(group).getByRole('button', { name: 'Lista' })).toHaveAttribute('aria-pressed', 'true');
  const list = await siteList();
  expect(list).toHaveAttribute('data-view', 'list');
  expect(siteNames(list).length).toBeGreaterThan(0);
  expect(within(list).getAllByRole('listitem').every((li) => li.textContent?.includes('Cultura'))).toBe(true);
  await waitFor(() => expect(db.preferences.prof_evaldo?.library_view).toBe('list'));
});

test('saved view mode is used on the next visit (RF39)', async () => {
  db.preferences.prof_evaldo = { theme: 'dark', library_view: 'compact' };
  renderLibrary();
  expect(await siteList()).toHaveAttribute('data-view', 'compact');
});

test('continue listening banner (frame 01)', async () => {
  renderLibrary();
  const banner = await screen.findByRole('region', { name: 'Um bom momento para continuar.' });
  expect(banner).toHaveTextContent('O que existe no fundo do oceano? · 8 minutos restantes');
  expect(within(banner).getByRole('link', { name: 'Continuar' })).toHaveAttribute('href', '/articles/post_oceano');
});

test('empty library invites adding a URL', async () => {
  setScenario('empty');
  renderLibrary();
  expect(await screen.findByText('Sua biblioteca ainda está vazia.')).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Adicionar URL/ }).length).toBeGreaterThan(0);
});

test('error shows the server message with retry', async () => {
  renderLibrary();
  await siteList();
  setScenario('unavailable');
  await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível no momento.');
  setScenario('default');
  await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
  await waitFor(() => expect(screen.getByText('12 de 24 sites')).toBeInTheDocument());
});

test('a site never converted says so instead of a date (RF06)', async () => {
  renderLibrary('/library?sort=name&order=desc');
  const first = within(await siteList()).getAllByRole('listitem')[0]!;
  expect(first).toHaveTextContent('Sextante');
  expect(first).toHaveTextContent('Nenhuma conversão ainda');
});

describe('review TASK-012 r1', () => {
  test('navigating to /library without a query clears the search box (#1)', async () => {
    const router = renderLibrary('/library?q=submarino');
    await siteList();
    expect(screen.getByRole('searchbox', { name: 'Buscar em posts, resumos e tags' })).toHaveValue('submarino');
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Principal' })).getByRole('link', { name: 'Biblioteca' }));
    expect(screen.getByRole('searchbox', { name: 'Buscar em posts, resumos e tags' })).toHaveValue('');
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(router.state.location.search).toBe('');
  });

  test('a view mode that cannot be saved is reverted with a message (#3)', async () => {
    renderLibrary();
    await siteList();
    setScenario('unavailable');
    const group = screen.getByRole('group', { name: 'Modo de exibição' });
    await userEvent.click(within(group).getByRole('button', { name: 'Lista' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar o modo de exibição');
    expect(within(group).getByRole('button', { name: 'Cards' })).toHaveAttribute('aria-pressed', 'true');
    expect(await siteList()).toHaveAttribute('data-view', 'cards');
  });

  test('Tab out of the sort menu closes it (#4)', async () => {
    renderLibrary();
    await siteList();
    await userEvent.click(screen.getByRole('button', { name: /^Ordenar:/ }));
    expect(screen.getByRole('menu', { name: 'Ordenar biblioteca' })).toBeInTheDocument();
    await userEvent.tab();
    expect(screen.queryByRole('menu', { name: 'Ordenar biblioteca' })).toBeNull();
  });
});
