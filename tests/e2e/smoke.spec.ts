import { test, expect } from '@playwright/test';

test('app loads without external network', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.hostname !== 'localhost') external.push(req.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'entrelinhas' })).toBeVisible();
  expect(external).toEqual([]);
});
