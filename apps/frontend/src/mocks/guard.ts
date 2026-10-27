import { http } from 'msw';
import { errorResponse } from './scenario';

// Registered last in the browser worker: in MSW 3 the 'error' strategy only logs in the browser and
// the request would still reach the network. These guards answer every unhandled API call locally.
// '/v1/*' does not match the bare prefix, so '/v1' has its own handler.
const answer = ({ request }: { request: Request }) => {
  console.error(`[mock] sem handler para ${request.method} ${new URL(request.url).pathname}`);
  return errorResponse(501, 'mock_handler_missing', 'Rota sem mock definido.');
};

export const unhandledApiGuard = [http.all('/v1', answer), http.all('/v1/*', answer)];
