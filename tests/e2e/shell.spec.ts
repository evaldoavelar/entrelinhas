import { test, expect } from '@playwright/test';

test('signed-in shell: navigation, current page and theme switch', async ({ page }, info) => {
  await page.goto('/library?mockSession=prof_evaldo');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  if (info.project.name.includes('mobile')) {
    const tabs = page.getByRole('navigation', { name: 'Atalhos' });
    await expect(tabs).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden();
    await tabs.getByRole('link', { name: 'Playlists' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Playlists' })).toBeVisible();
    return;
  }

  const nav = page.getByRole('navigation', { name: 'Principal' });
  await expect(nav.getByRole('link', { name: 'Biblioteca' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: /Notificações/ })).toHaveAccessibleName('Notificações 2 notificações não lidas');

  // Keyboard: the theme switch is reachable and operable with Space.
  const toggle = page.getByRole('switch', { name: 'Tema escuro (Dracula)' });
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await toggle.press('Space');
  await expect(html).toHaveAttribute('data-theme', 'dark');
});

test('evidence screenshots for frame comparison (TASK-005)', async ({ page }, info) => {
  await page.goto('/library?mockSession=prof_evaldo');
  await expect(page.getByRole('heading', { level: 1, name: 'Sua biblioteca' })).toBeVisible();
  if (info.project.name.startsWith('light')) {
    const toggle = page.getByRole('switch', { name: 'Tema escuro (Dracula)' });
    if (await toggle.isVisible()) await toggle.click();
    else await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  }
  await page.screenshot({ path: `docs/design/evidence/TASK-005/shell-${info.project.name}.png` });
});
