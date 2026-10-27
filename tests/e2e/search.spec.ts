import { test, expect, type Page } from '@playwright/test';

const results = (page: Page) => page.getByRole('list', { name: 'Leituras encontradas' });

test('global search from the library: where it matched, safe highlight, clear and back (RF17, CA05, CA23, CA67)', async ({ page }) => {
  await page.goto('/library?mockSession=prof_evaldo');
  await page.getByRole('searchbox', { name: 'Buscar em posts, resumos e tags' }).fill('submarino');
  await page.getByRole('link', { name: 'Ver leituras com “submarino”' }).click();
  await expect(page).toHaveURL(/\/search\?q=submarino$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Resultados da busca' })).toBeVisible();
  await expect(results(page).getByRole('listitem')).toHaveCount(3);
  await expect(page.getByText('3 posts encontrados · texto, resumo e tags')).toBeVisible();
  await expect(results(page).locator('mark')).toHaveText(['submarino', 'submarino', 'submarino']);

  // Markup typed in the box is searched as text and shown as text (CA67).
  const box = page.getByRole('searchbox', { name: 'Buscar em todos os sites' });
  await box.fill('<img src=x onerror=alert(1)>');
  await expect(page.getByText('Nenhuma leitura encontrada para “<img src=x onerror=alert(1)>”.')).toBeVisible();
  await expect(page.locator('main img')).toHaveCount(0);

  // Keyboard: Limpar is reachable from the box and returns focus to it.
  await box.focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Limpar' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(box).toBeFocused();
  await expect(box).toHaveValue('');
  await expect(page.getByText('Digite um termo para buscar em todos os sites.')).toBeVisible();

  await page.getByRole('link', { name: 'Voltar à biblioteca' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Sua biblioteca' })).toBeVisible();
});

// Reviewed baselines (frame 15 comparison in docs/tasks/handoffs/TASK-013.md); never auto-updated.
test('search results visual baseline (frame 15, TASK-013)', async ({ page }, info) => {
  await page.goto('/search?mockSession=prof_evaldo&q=submarino');
  await expect(results(page).getByRole('listitem')).toHaveCount(3);
  if (info.project.name.startsWith('light')) await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
  await expect(page).toHaveScreenshot('search-results.png');
});
