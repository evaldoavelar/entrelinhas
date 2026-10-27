import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ApiError } from '@entrelinhas/api-client';
import { api } from '../../../api';
import { SessionProvider, useSession } from '../../../app/session';
import { db } from '../../../mocks/db';
import { setScenario } from '../../../mocks/scenario';
import { AdminLoginPage } from './AdminLoginPage';

function AdminDestination() {
  const { state } = useSession();
  return (
    <div>
      <h1>Painel de administração</h1>
      <p>Sessão da casa: {state.status}</p>
    </div>
  );
}

function HouseholdLoginDestination() {
  return <h1>Quem vai ouvir?</h1>;
}

function renderAdminLogin() {
  const router = createMemoryRouter(
    [
      { path: '/admin/login', element: <AdminLoginPage /> },
      { path: '/admin', element: <AdminDestination /> },
      { path: '/login', element: <HouseholdLoginDestination /> },
    ],
    { initialEntries: ['/admin/login'] },
  );
  render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
  return router;
}

beforeEach(() => {
  setScenario('default');
  db.sessionProfileId = null;
  db.privateUnlocked = false;
});

test('renders admin login form with all required fields, lockout notice and back link', () => {
  renderAdminLogin();

  expect(screen.getByRole('heading', { level: 1, name: 'Acesso de administrador' })).toBeInTheDocument();
  expect(screen.getByText('Credencial individual, diferente da senha da casa e do PIN.')).toBeInTheDocument();

  const userInput = screen.getByLabelText('Usuário');
  expect(userInput).toBeRequired();
  expect(userInput).toHaveAttribute('autocomplete', 'username');

  const passwordInput = screen.getByLabelText('Senha');
  expect(passwordInput).toBeRequired();
  expect(passwordInput).toHaveAttribute('type', 'password');
  expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');

  const totpInput = screen.getByLabelText('Código do aplicativo autenticador');
  expect(totpInput).toBeRequired();
  expect(totpInput).toHaveAttribute('inputmode', 'numeric');
  expect(totpInput).toHaveAttribute('autocomplete', 'one-time-code');

  const submitButton = screen.getByRole('button', { name: 'Entrar' });
  expect(submitButton).toBeDisabled();

  expect(screen.getByRole('button', { name: 'Usar passkey' })).toBeInTheDocument();
  expect(
    screen.getByText('Depois de 5 tentativas erradas, aguarde 15 minutos. Os outros perfis da casa não são bloqueados.'),
  ).toBeInTheDocument();

  const backLink = screen.getByRole('link', { name: 'Voltar' });
  expect(backLink).toHaveAttribute('href', '/login');
});

test('submits credentials and sanitized totp code (stripping spaces), navigating to /admin without creating a household session', async () => {
  const router = renderAdminLogin();

  await userEvent.type(screen.getByLabelText('Usuário'), 'evaldo');
  await userEvent.type(screen.getByLabelText('Senha'), 'admin-exemplo');
  await userEvent.type(screen.getByLabelText('Código do aplicativo autenticador'), '482 913');

  const submitButton = screen.getByRole('button', { name: 'Entrar' });
  expect(submitButton).toBeEnabled();

  await userEvent.click(submitButton);

  expect(await screen.findByRole('heading', { level: 1, name: 'Painel de administração' })).toBeInTheDocument();
  expect(screen.getByText('Sessão da casa: anonymous')).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/admin');
  expect(db.sessionProfileId).toBeNull();
});

test('wrong credentials show generic error message without revealing which field failed', async () => {
  renderAdminLogin();

  await userEvent.type(screen.getByLabelText('Usuário'), 'evaldo');
  await userEvent.type(screen.getByLabelText('Senha'), 'senha-errada');
  await userEvent.type(screen.getByLabelText('Código do aplicativo autenticador'), '482913');

  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent('Usuário, senha ou código incorretos.');
  expect(db.sessionProfileId).toBeNull();

  // Changing inputs clears error
  await userEvent.type(screen.getByLabelText('Senha'), 'a');
  expect(screen.queryByRole('alert')).toBeNull();
});

test('rate limit communicates retry-after wait time and that other household profiles are safe', async () => {
  renderAdminLogin();

  await userEvent.type(screen.getByLabelText('Usuário'), 'evaldo');
  await userEvent.type(screen.getByLabelText('Senha'), 'admin-exemplo');
  await userEvent.type(screen.getByLabelText('Código do aplicativo autenticador'), '482913');

  setScenario('rate_limited');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent('30 segundos');
  expect(alert).toHaveTextContent(/outros perfis da casa não são bloqueados/i);
});

test('unavailable scenario shows retryable server error and succeeds after recovery', async () => {
  const router = renderAdminLogin();

  await userEvent.type(screen.getByLabelText('Usuário'), 'evaldo');
  await userEvent.type(screen.getByLabelText('Senha'), 'admin-exemplo');
  await userEvent.type(screen.getByLabelText('Código do aplicativo autenticador'), '482913');

  setScenario('unavailable');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent('Servidor indisponível no momento. Tente de novo.');

  setScenario('default');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

  expect(await screen.findByRole('heading', { level: 1, name: 'Painel de administração' })).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/admin');
});

test('handles transport errors with outcomeUnknown, generic api errors and unexpected exceptions', async () => {
  renderAdminLogin();

  const user = screen.getByLabelText('Usuário');
  const pass = screen.getByLabelText('Senha');
  const totp = screen.getByLabelText('Código do aplicativo autenticador');

  await userEvent.type(user, 'evaldo');
  await userEvent.type(pass, 'admin-exemplo');
  await userEvent.type(totp, '482913');

  const spy = vi.spyOn(api, 'createAdminSession');

  // Outcome unknown error
  spy.mockRejectedValueOnce(
    new ApiError({ status: 0, code: 'timeout', message: 'timeout', outcomeUnknown: true }),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível confirmar o acesso. Tente de novo.');

  // Generic ApiError with custom message
  spy.mockRejectedValueOnce(
    new ApiError({ status: 500, code: 'server_error', message: 'Falha interna do servidor.' }),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Falha interna do servidor.');

  // Unexpected non-ApiError
  spy.mockRejectedValueOnce(new Error('Unknown failure'));
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Erro inesperado. Tente de novo.');

  spy.mockRestore();
});

test('clicking "Usar passkey" informs that passkeys are unavailable in simulated version without HTTP request', async () => {
  renderAdminLogin();

  await userEvent.click(screen.getByRole('button', { name: 'Usar passkey' }));

  expect(await screen.findByRole('status')).toHaveTextContent(/passkey está indisponível nesta versão simulada/i);
  expect(db.sessionProfileId).toBeNull();

  // Typing in inputs clears notice
  await userEvent.type(screen.getByLabelText('Usuário'), 'e');
  expect(screen.queryByRole('status')).toBeNull();
});

test('clicking "Voltar" navigates back to /login', async () => {
  const router = renderAdminLogin();

  await userEvent.click(screen.getByRole('link', { name: 'Voltar' }));

  expect(await screen.findByRole('heading', { level: 1, name: 'Quem vai ouvir?' })).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/login');
});

test('supports submitting form via Enter key from TOTP input', async () => {
  const router = renderAdminLogin();

  await userEvent.type(screen.getByLabelText('Usuário'), 'evaldo');
  await userEvent.type(screen.getByLabelText('Senha'), 'admin-exemplo');
  const totpInput = screen.getByLabelText('Código do aplicativo autenticador');
  await userEvent.type(totpInput, '482913{Enter}');

  expect(await screen.findByRole('heading', { level: 1, name: 'Painel de administração' })).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/admin');
});

test('does nothing if form submit is fired directly with empty fields', () => {
  renderAdminLogin();

  const form = screen.getByRole('button', { name: 'Entrar' }).closest('form')!;
  fireEvent.submit(form);

  expect(screen.queryByRole('alert')).toBeNull();
});

test.each(['1', 'abcdef', '1234567', '12 34a6'])('malformed authenticator code "%s" is explained and never sent (review r1)', async (code) => {
  const spy = vi.spyOn(api, 'createAdminSession');
  renderAdminLogin();
  await userEvent.type(screen.getByLabelText('Usuário'), 'evaldo');
  await userEvent.type(screen.getByLabelText('Senha'), 'admin-exemplo');
  await userEvent.type(screen.getByLabelText('Código do aplicativo autenticador'), code);
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Informe o código de 6 dígitos do aplicativo autenticador.');
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});
