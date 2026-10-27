import { http } from 'msw';
import { errorResponse } from './scenario';

// Registered last in the browser worker: in MSW 3 the 'error' strategy only logs in the browser and
// the request would still reach the network. This guard answers every unhandled /v1 call locally.
export const unhandledApiGuard = http.all('/v1/*', ({ request }) => {
  console.error(`[mock] sem handler para ${request.method} ${new URL(request.url).pathname}`);
  return errorResponse(501, 'mock_handler_missing', 'Rota sem mock definido.');
});
