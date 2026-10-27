import { test, expect } from '@playwright/test';

// The global /login route still renders PendingPage until the leader integrates TASK-010.
// These browser checks cover the mocked HTTP contract without claiming UI coverage.
test('public profiles and household session are served by the browser mock', async ({ page }) => {
  await page.goto('/login');
  const result = await page.evaluate(async () => {
    const profiles = await fetch('/v1/profiles/public').then((response) => response.json());
    const login = await fetch('/v1/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ household_password: 'casa-exemplo', profile_id: profiles.items[1].id }),
    });
    return { names: profiles.items.map((profile: { display_name: string }) => profile.display_name), status: login.status, session: await login.json() };
  });
  expect(result.names).toEqual(['Evaldo Avelar', 'Ana', 'Convidado']);
  expect(result.status).toBe(201);
  expect(result.session.profile.display_name).toBe('Ana');
  expect(result.session.private_unlocked).toBe(false);
});

test('wrong household password leaves profiles available', async ({ page }) => {
  await page.goto('/login');
  const result = await page.evaluate(async () => {
    const wrong = await fetch('/v1/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ household_password: 'errada', profile_id: 'prof_evaldo' }) });
    const profiles = await fetch('/v1/profiles/public').then((response) => response.json());
    return { status: wrong.status, profileCount: profiles.items.length };
  });
  expect(result).toEqual({ status: 401, profileCount: 3 });
});

test.fixme('login page UI, keyboard and frame screenshot after leader replaces PendingPage on /login', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('radiogroup', { name: 'Perfil' })).toBeVisible();
});
