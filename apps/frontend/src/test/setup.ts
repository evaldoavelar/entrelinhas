import '@testing-library/jest-dom/vitest';
import { server } from '../mocks/server';
import { resetDb } from '../mocks/db';
import { setScenario } from '../mocks/scenario';

// No real network in tests: any request without a handler fails the test (RD05, ADR-12).
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  resetDb();
  setScenario('default');
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
