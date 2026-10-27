import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './theme/fonts';
import './theme/tokens.css';
import './theme/global.css';
import './components/components.css';

async function enableMocking() {
  // Statically false in production builds, so the mock module is dropped from the bundle.
  if (import.meta.env.VITE_API_MOCK !== 'true') return;
  const { startMockWorker } = await import('./mocks/browser');
  await startMockWorker(window.location);
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Elemento #root ausente no documento');

await enableMocking();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
