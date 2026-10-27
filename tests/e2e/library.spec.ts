import { test, expect, type Page } from '@playwright/test';

const sites = (page: Page) => page.getByRole('list', { name: 'Sites' });
const names = (page: Page) => sites(page).getByRole('heading', { level: 2 });

async function useLightThemeIfNeeded(page: Page, project: string) {
  if (project.startsWith('light')) await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
}

test('library journey: search, category, keyboard sort, load more (RF15–17, RF38, CA22, CA23)', async ({ page }) => {
  await page.goto('/library?mockSession=prof_evaldo');
  await expect(names(page)).toHaveCount(6);
  await expect(page.getByText('6 de 24 sites')).toBeVisible();

  // Search reaches posts not yet loaded on the client (CA23), combined with the category filter.
  await page.getByRole('searchbox', { name: 'Buscar em posts, resumos e tags' }).fill('submarino');
  await expect(names(page)).toHaveCount(3);
  await page.getByLabel('Categoria').selectOption('cat_ciencia');
  await expect(names(page)).toHaveText(['Horizonte', 'Ciência Aberta']);
  await expect(page).toHaveURL(/q=submarino/);
  await expect(page).toHaveURL(/category=cat_ciencia/);

  // Clear filters, then sort by name with the keyboard (frame 18).
  await page.getByRole('searchbox', { name: 'Buscar em posts, resumos e tags' }).fill('');
  await page.getByLabel('Categoria').selectOption('');
  await expect(page.getByText('6 de 24 sites')).toBeVisible();
  const sortButton = page.getByRole('button', { name: /^Ordenar:/ });
  await sortButton.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('menu', { name: 'Ordenar biblioteca' });
  await expect(menu.getByRole('menuitemradio', { name: 'Última conversão' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(menu).toBeHidden();
  await expect(sortButton).toBeFocused();
  await expect(page).toHaveURL(/sort=name/);
  const firstPage = await names(page).allTextContents();
  expect(firstPage).toEqual([...firstPage].sort((a, b) => a.localeCompare(b, 'pt-BR')));

  // Load more keeps the snapshot order without duplicates (RF38, CA22).
  await page.getByRole('button', { name: 'Carregar mais' }).click();
  await expect(page.getByText('12 de 24 sites')).toBeVisible();
  const all = await names(page).allTextContents();
  expect(new Set(all).size).toBe(12);
  expect(all.slice(0, 6)).toEqual(firstPage);
});

test('view mode keeps filters and is remembered on the next visit (RF37, RF39, CA21)', async ({ page }, info) => {
  await page.goto('/library?mockSession=prof_evaldo&category=cat_cultura');
  await expect(names(page)).not.toHaveCount(0);
  const views = page.getByRole('group', { name: 'Modo de exibição' });
  await views.getByRole('button', { name: 'Lista' }).click();
  await expect(sites(page)).toHaveAttribute('data-view', 'list');
  await expect(page).toHaveURL(/category=cat_cultura/);
  await expect(sites(page).getByRole('listitem').filter({ hasNotText: 'Cultura' })).toHaveCount(0);

  // Leave and come back inside the app: the saved preference wins.
  if (info.project.name.includes('mobile')) await page.getByRole('navigation', { name: 'Atalhos' }).getByRole('link', { name: 'Playlists' }).click();
  else await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Playlists' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Playlists' })).toBeVisible();
  await page.goBack();
  await expect(sites(page)).toHaveAttribute('data-view', 'list');
  await expect(views.getByRole('button', { name: 'Lista' })).toHaveAttribute('aria-pressed', 'true');
});

// Reviewed baselines (frames 01/02/03/16/18, comparison in docs/tasks/handoffs/TASK-012.md); never auto-updated.
for (const [view, label] of [
  ['cards', 'Cards'],
  ['compact', 'Compactos'],
  ['list', 'Lista'],
] as const) {
  test(`library ${view} visual baseline`, async ({ page }, info) => {
    await page.goto('/library?mockSession=prof_evaldo');
    await expect(names(page)).toHaveCount(6);
    await page.getByRole('group', { name: 'Modo de exibição' }).getByRole('button', { name: label }).click();
    await expect(sites(page)).toHaveAttribute('data-view', view);
    await page.getByRole('heading', { level: 1 }).click();
    await useLightThemeIfNeeded(page, info.project.name);
    await expect(page).toHaveScreenshot(`library-${view}.png`);
  });
}

test('sort menu visual baseline (frame 18)', async ({ page }, info) => {
  await page.goto('/library?mockSession=prof_evaldo');
  await expect(names(page)).toHaveCount(6);
  await page.getByRole('button', { name: /^Ordenar:/ }).click();
  await expect(page.getByRole('menu', { name: 'Ordenar biblioteca' })).toBeVisible();
  await useLightThemeIfNeeded(page, info.project.name);
  await expect(page).toHaveScreenshot('library-sort-menu.png');
});
