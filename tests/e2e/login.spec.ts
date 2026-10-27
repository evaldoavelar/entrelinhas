import { test, expect } from '@playwright/test';

test('household login: keyboard profile choice, wrong password, then library (RF42/RF43)', async ({ page }) => {
  await page.goto('/library');
  await expect(page.getByRole('heading', { level: 1, name: 'Quem vai ouvir?' })).toBeVisible();
  const group = page.getByRole('radiogroup', { name: 'Perfil' });
  await expect(group.getByRole('radio', { name: 'Evaldo' })).toBeChecked();

  // Keyboard: arrows move the selection inside the radio group.
  await group.getByRole('radio', { name: 'Evaldo' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('radio', { name: 'Ana' })).toBeChecked();
  await expect(group.getByRole('radio', { name: 'Ana' })).toBeFocused();

  const password = page.getByLabel('Senha da casa');
  await password.fill('errada');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toHaveText('Senha da casa incorreta.');
  await expect(group.getByRole('radio')).toHaveCount(3);

  await password.fill('casa-exemplo');
  await password.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Sua biblioteca' })).toBeVisible();
  await expect(page).toHaveURL(/\/library$/);
});

test('admin link leads to the individual admin login', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: 'Entrar como administrador' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

// Reviewed baselines (frame 26 comparison in docs/tasks/handoffs/TASK-010.md); never auto-updated.
test('login visual baseline (frame 26, TASK-010)', async ({ page }, info) => {
  await page.goto('/login');
  await expect(page.getByRole('radio', { name: 'Evaldo' })).toBeChecked();
  const password = page.getByLabel('Senha da casa');
  await password.fill('casa-exemplo');
  await password.blur();
  if (info.project.name.startsWith('light')) {
    await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
  }
  await expect(page).toHaveScreenshot('login.png');
});
