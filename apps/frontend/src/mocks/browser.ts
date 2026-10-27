import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { unhandledApiGuard } from './guard';
import { db } from './db';
import { parseScenario, setScenario } from './scenario';

// Browser mock bootstrap (dev and `build:mock` only; never imported by the production build).
// URL params: ?scenario=<name> selects a scenario; ?mockSession=<profileId> starts signed in.
export async function startMockWorker(location: Location) {
  const params = new URLSearchParams(location.search);
  setScenario(parseScenario(params.get('scenario')));
  db.sessionProfileId = params.get('mockSession');
  // The guard comes last so unhandled /v1 calls never leave the browser; static assets bypass.
  await setupWorker(...handlers, unhandledApiGuard).start({ quiet: true, onUnhandledFrame: 'bypass' });
}
