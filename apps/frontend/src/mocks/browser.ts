import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { db } from './db';
import { parseScenario, setScenario } from './scenario';

// Browser mock bootstrap (dev and `build:mock` only; never imported by the production build).
// URL params: ?scenario=<name> selects a scenario; ?mockSession=<profileId> starts signed in.
export async function startMockWorker(location: Location) {
  const params = new URLSearchParams(location.search);
  setScenario(parseScenario(params.get('scenario')));
  db.sessionProfileId = params.get('mockSession');
  await setupWorker(...handlers).start({
    quiet: true,
    onUnhandledFrame({ frame, defaults }) {
      // Any API call without a handler is an error; static assets pass through.
      const request = (frame.data as { request?: Request } | undefined)?.request;
      if (request && new URL(request.url).pathname.startsWith('/v1/')) defaults.error();
    },
  });
}
