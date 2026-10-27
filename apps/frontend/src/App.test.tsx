import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders the product name as the main landmark heading', () => {
  render(<App />);
  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1, name: 'entrelinhas' })).toBeInTheDocument();
});
