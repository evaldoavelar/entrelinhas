import { test, expect } from '@playwright/test';

test('app loads without external network and lands on login', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (req) => {
    if (new URL(req.url()).hostname !== 'localhost') external.push(req.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Quem vai ouvir?' })).toBeVisible();
  expect(external).toEqual([]);
});
