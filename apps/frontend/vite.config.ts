import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `--mode mock` (dev default, e2e and demos) ships the MSW worker; the production build never
// contains MSW or its worker (ADR-12, checked by scripts/bundle/check-no-mocks.mjs).
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  publicDir: mode === 'mock' ? 'public-mock' : 'public',
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
}));
