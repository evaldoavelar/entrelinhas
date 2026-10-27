import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from './router';
import { SessionProvider } from './session';
import { db } from '../mocks/db';
import { setScenario } from '../mocks/scenario';

function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
  return router;
}

const signedIn = () => {
  db.sessionProfileId = 'prof_evaldo';
};

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

test('private route without session redirects to /login (RF42)', async () => {
  const router = renderApp('/library');
  await screen.findByRole('heading', { level: 1, name: 'Quem vai ouvir?' });
  expect(router.state.location.pathname).toBe('/login');
});

test('signed-in shell shows navigation, current page, profile and unread badge', async () => {
  signedIn();
  renderApp('/library');
  const nav = await screen.findByRole('navigation', { name: 'Principal' });
  expect(within(nav).getByRole('link', { name: 'Biblioteca' })).toHaveAttribute('aria-current', 'page');
  expect(within(nav).getByRole('link', { name: /Notificações/ })).toHaveAccessibleName('Notificações 2 notificações não lidas');
  expect(screen.getByText('Evaldo Avelar')).toBeInTheDocument();
  expect(screen.getByRole('main')).toBeInTheDocument();
});

test('root redirects to the library', async () => {
  signedIn();
  const router = renderApp('/');
  await screen.findByRole('navigation', { name: 'Principal' });
  expect(router.state.location.pathname).toBe('/library');
});

test('theme follows the profile preference and the switch persists it (RF40, RF41)', async () => {
  signedIn();
  db.preferences.prof_evaldo = { theme: 'light', library_view: 'cards' };
  renderApp('/library');
  const toggle = await screen.findByRole('switch', { name: 'Tema escuro (Dracula)' });
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(toggle).toHaveAttribute('aria-checked', 'false');
  await userEvent.click(toggle);
  await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
  expect(db.preferences.prof_evaldo?.theme).toBe('dark');
});

test('anonymous pages default to the dark theme', async () => {
  renderApp('/login');
  await screen.findByRole('heading', { level: 1, name: 'Quem vai ouvir?' });
  expect(document.documentElement.dataset.theme).toBe('dark');
});

test('sign out ends the session and returns to login', async () => {
  signedIn();
  const router = renderApp('/library');
  await userEvent.click(await screen.findByRole('button', { name: 'Sair' }));
  await screen.findByRole('heading', { level: 1, name: 'Quem vai ouvir?' });
  expect(router.state.location.pathname).toBe('/login');
  expect(db.sessionProfileId).toBeNull();
});

test('session load failure shows an error with retry instead of a blank page', async () => {
  signedIn();
  setScenario('unavailable');
  renderApp('/library');
  expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível no momento.');
  setScenario('default');
  await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
  await screen.findByRole('navigation', { name: 'Principal' });
});

test('screens of later sprints are honest placeholders, not fake features', async () => {
  signedIn();
  renderApp('/playlists');
  expect(await screen.findByRole('heading', { level: 1, name: 'Playlists' })).toBeInTheDocument();
  expect(screen.getByText(/ainda não foi implementada/)).toBeInTheDocument();
});

test('mobile tab bar offers the three main destinations (frame 16)', async () => {
  signedIn();
  renderApp('/library');
  const tabs = await screen.findByRole('navigation', { name: 'Atalhos' });
  expect(within(tabs).getAllByRole('link').map((a) => a.textContent)).toEqual(['Biblioteca', 'Playlists', 'Fontes']);
});
