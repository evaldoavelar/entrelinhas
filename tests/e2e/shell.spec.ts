import { test, expect } from '@playwright/test';

test('signed-in shell: navigation, current page and theme switch', async ({ page }, info) => {
  await page.goto('/library?mockSession=prof_evaldo');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  if (info.project.name.includes('mobile')) {
    const tabs = page.getByRole('navigation', { name: 'Atalhos' });
    await expect(tabs).toBeVisible();
    // Re-review TASK-005 #1: header sits at the top as in frame 16 (brand at y≈44), not pushed down.
    const header = await page.getByRole('button', { name: 'Menu' }).boundingBox();
    expect(header?.y).toBeLessThan(60);
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden();
    await tabs.getByRole('link', { name: 'Playlists' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Playlists' })).toBeVisible();
    // Review TASK-005 #1: theme and sign out reachable on mobile through the header menu.
    const menu = page.getByRole('button', { name: 'Menu' });
    await menu.click();
    const panel = page.getByRole('navigation', { name: 'Menu do perfil' });
    await panel.getByRole('switch', { name: 'Tema escuro (Dracula)' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
    await menu.click();
    await panel.getByRole('button', { name: 'Sair' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Quem vai ouvir?' })).toBeVisible();
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
  // Written to test-results: the reviewed copies in docs/design/evidence/TASK-005 are never overwritten by a run.
  await page.screenshot({ path: info.outputPath(`shell-${info.project.name}.png`) });
});
