import { render, screen } from '@testing-library/react';
import { App } from './App';

test('anonymous visitor lands on the login page through the browser router', async () => {
  window.history.replaceState(null, '', '/library');
  render(<App />);
  expect(await screen.findByRole('heading', { level: 1, name: 'Quem vai ouvir?' })).toBeInTheDocument();
  expect(window.location.pathname).toBe('/login');
});
