import { test, expect } from '@playwright/test';

// Review TASK-003 #1: in the browser an API route without a mock must be answered locally
// (501 from the guard), never forwarded to the network.
test('unhandled /v1 route is answered by the mock guard, not the network', async ({ page }) => {
  const forwarded: string[] = [];
  page.on('requestfinished', (req) => {
    if (new URL(req.url()).pathname.startsWith('/v1/') && req.serviceWorker() === null && !req.url().includes('localhost')) forwarded.push(req.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const status = await page.evaluate(async () => (await fetch('/v1/rota-inexistente')).status);
  expect(status).toBe(501);
  expect(await page.evaluate(async () => (await fetch('/v1')).status)).toBe(501);
  const profiles = await page.evaluate(async () => (await fetch('/v1/profiles/public')).status);
  expect(profiles).toBe(200);
  expect(forwarded).toEqual([]);
});
