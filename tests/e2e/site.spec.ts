import { test, expect } from '@playwright/test';

test('site detail journey: open from library, load more, filter unheard, keyboard navigation (RF07, RF19, CA25)', async ({
  page,
}) => {
  await page.goto('/library?mockSession=prof_evaldo');

  // Journey starts from library: click "Abrir site Horizonte"
  const openLink = page.getByRole('link', { name: 'Abrir site Horizonte' });
  await expect(openLink).toBeVisible();
  await openLink.click();

  await expect(page).toHaveURL(/\/sites\/site_horizonte/);
  await expect(page.getByRole('heading', { level: 1, name: 'Horizonte' })).toBeVisible();
  await expect(page.getByText(/horizonte\.example · Última conversão/)).toBeVisible();
  await expect(page.getByText('12 áudios')).toBeVisible();

  const articles = page.getByRole('list', { name: 'Artigos convertidos' }).getByRole('listitem');
  await expect(articles).toHaveCount(4);
  await expect(page.getByText('O que existe no fundo do oceano?')).toBeVisible();
  await expect(page.getByText('As cidades que estão redescobrindo seus rios')).toBeVisible();

  // Load more articles using snapshot cursor
  const loadMoreBtn = page.getByRole('button', { name: 'Carregar mais artigos' });
  await expect(loadMoreBtn).toBeVisible();
  await loadMoreBtn.click();

  await expect(articles).toHaveCount(8);
  await expect(page.getByText('Por que as marés mudam a cada dia')).toBeVisible();
  await loadMoreBtn.click();
  await expect(articles).toHaveCount(12);
  await expect(page.getByText('Mercados de bairro e a economia local')).toBeVisible();
  await expect(loadMoreBtn).toBeHidden();

  // Filter "Não ouvidos"
  const unheardBtn = page.getByRole('button', { name: 'Não ouvidos', exact: true });
  const allBtn = page.getByRole('button', { name: 'Todos', exact: true });
  await unheardBtn.click();

  await expect(unheardBtn).toHaveAttribute('aria-pressed', 'true');
  await expect(allBtn).toHaveAttribute('aria-pressed', 'false');
  await expect(page).toHaveURL(/filter=unheard/);

  await expect(articles).toHaveCount(4);
  await expect(page.getByText('As cidades que estão redescobrindo seus rios')).toBeVisible();
  await expect(page.getByText('O futuro da energia cabe no telhado')).toBeVisible();
  await expect(page.getByText('O que existe no fundo do oceano?')).toBeHidden();

  // Keyboard navigation: focus "Todos" and press Enter to restore all articles
  await allBtn.focus();
  await expect(allBtn).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(allBtn).toHaveAttribute('aria-pressed', 'true');
  await expect(articles).toHaveCount(4);

  // Load more again after filter reset
  await expect(page.getByRole('button', { name: 'Carregar mais artigos' })).toBeVisible();
  await page.keyboard.press('Tab'); // move focus
});

test('site detail visual baseline (frame 04)', async ({ page }) => {
  await page.goto('/sites/site_horizonte?mockSession=prof_evaldo');
  await expect(page.getByRole('heading', { level: 1, name: 'Horizonte' })).toBeVisible();

  // Frame 04 shows the first four articles of the 12.
  await expect(page.getByRole('list', { name: 'Artigos convertidos' }).getByRole('listitem')).toHaveCount(4);

  // Ensure no inputs/buttons retain focus
  await page.getByRole('heading', { level: 1 }).click();
  await expect(page).toHaveScreenshot('site-detail.png');
});
