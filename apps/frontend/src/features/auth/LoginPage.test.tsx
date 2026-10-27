import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { SessionProvider, useSession } from '../../app/session';
import { db } from '../../mocks/db';
import { setScenario } from '../../mocks/scenario';
import { LoginPage } from './LoginPage';

function Destination() {
  const { state } = useSession();
  return <p>Destino: {state.status === 'authenticated' ? state.session.profile.display_name : 'sem sessão'}</p>;
}

function renderLogin(from?: string) {
  const router = createMemoryRouter([
    { path: '/login', element: <LoginPage /> },
    { path: '/library', element: <Destination /> },
    { path: '/private', element: <Destination /> },
    { path: '/admin/login', element: <h1>Acesso de administrador</h1> },
  ], { initialEntries: [{ pathname: '/login', state: from ? { from } : null }] });
  render(<SessionProvider><RouterProvider router={router} /></SessionProvider>);
  return router;
}

test('loads public profiles as an accessible radio group and selects one by keyboard', async () => {
  renderLogin();
  const group = await screen.findByRole('radiogroup', { name: 'Perfil' });
  const evaldo = within(group).getByRole('radio', { name: 'Evaldo' });
  const ana = within(group).getByRole('radio', { name: 'Ana' });
  expect(evaldo).toBeChecked();
  expect(screen.getByText(/PIN para capturas privadas/)).toBeInTheDocument();
  evaldo.focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(ana).toBeChecked();
  expect(ana).toHaveFocus();
  expect(screen.queryByText(/PIN para capturas privadas/)).toBeNull();
});

test('signs in with the selected profile and returns to requested route without unlocking private captures', async () => {
  const router = renderLogin('/private');
  await userEvent.click(await screen.findByRole('radio', { name: 'Ana' }));
  await userEvent.type(screen.getByLabelText('Senha da casa'), 'casa-exemplo');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Destino: Ana')).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/private');
  expect(db.privateUnlocked).toBe(false);
});

test('wrong password shows error and keeps all profiles available', async () => {
  renderLogin();
  await screen.findByRole('radio', { name: 'Ana' });
  await userEvent.type(screen.getByLabelText('Senha da casa'), 'errada');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Senha da casa incorreta.');
  await userEvent.click(screen.getByRole('radio', { name: 'Convidado' }));
  expect(screen.getByRole('radio', { name: 'Convidado' })).toBeChecked();
});

test('rate limit communicates Retry-After and unavailable state can be retried', async () => {
  renderLogin();
  await screen.findByRole('radio', { name: 'Ana' });
  await userEvent.type(screen.getByLabelText('Senha da casa'), 'casa-exemplo');
  setScenario('rate_limited');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('30 segundos');
  setScenario('unavailable');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível');
  setScenario('default');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  await waitFor(() => expect(db.sessionProfileId).toBe('prof_evaldo'));
});

test('empty and failed profile lists show recovery; admin link navigates', async () => {
  setScenario('empty');
  renderLogin();
  expect(await screen.findByText('Nenhum perfil disponível.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
  await userEvent.click(screen.getByRole('link', { name: 'Entrar como administrador' }));
  expect(await screen.findByRole('heading', { name: 'Acesso de administrador' })).toBeInTheDocument();
});

test('profile loading failure offers retry and then loads profiles', async () => {
  setScenario('unavailable');
  renderLogin();
  expect(screen.getByRole('status')).toHaveTextContent('Carregando perfis');
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os perfis');
  setScenario('default');
  await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
  expect(await screen.findByRole('radio', { name: 'Ana' })).toBeInTheDocument();
});

test('successful login without return location goes to library', async () => {
  const router = renderLogin();
  await screen.findByRole('radio', { name: 'Ana' });
  await userEvent.type(screen.getByLabelText('Senha da casa'), 'casa-exemplo');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Destino: Evaldo')).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/library');
});
