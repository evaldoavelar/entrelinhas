import { test, expect } from '@playwright/test';

test('admin login: keyboard navigation, invalid credentials, passkey notice, then admin access (RF58/CA65)', async ({
  page,
}) => {
  await page.goto('/admin/login');
  await expect(page.getByRole('heading', { level: 1, name: 'Acesso de administrador' })).toBeVisible();

  const username = page.getByLabel('Usuário');
  const password = page.getByLabel('Senha');
  const code = page.getByLabel('Código do aplicativo autenticador');

  // Fill with wrong password first
  await username.fill('evaldo');
  await password.fill('senha-errada');
  await code.fill('482 913');

  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toHaveText('Usuário, senha ou código incorretos.');

  // Test passkey notice
  await page.getByRole('button', { name: 'Usar passkey' }).click();
  await expect(page.getByRole('status')).toHaveText(/passkey está indisponível nesta versão simulada/i);

  // Correct credentials and submit via keyboard (Enter)
  await password.fill('admin-exemplo');
  await code.press('Enter');

  await expect(page).toHaveURL(/\/admin$/);
});

// Reviewed baselines (frame 27 comparison in docs/tasks/handoffs/TASK-011.md); never auto-updated.
test('admin login visual baseline (frame 27, TASK-011)', async ({ page }, info) => {
  await page.goto('/admin/login');
  const username = page.getByLabel('Usuário');
  const password = page.getByLabel('Senha');
  const code = page.getByLabel('Código do aplicativo autenticador');

  await username.fill('evaldo');
  await password.fill('admin-exemplo');
  await code.fill('482 913');
  await code.blur();

  if (info.project.name.startsWith('light')) {
    await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
  }
  await expect(page).toHaveScreenshot('admin-login.png');
});
