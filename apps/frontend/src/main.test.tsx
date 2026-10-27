import { screen } from '@testing-library/react';

beforeEach(() => {
  vi.resetModules();
  document.body.replaceChildren();
});

test('bootstrap mounts the app into #root', async () => {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.append(root);
  await import('./main');
  expect(await screen.findByRole('heading', { level: 1, name: 'Quem vai ouvir?' })).toBeInTheDocument();
});

test('bootstrap fails loudly when #root is missing', async () => {
  await expect(import('./main')).rejects.toThrow('#root ausente');
});
