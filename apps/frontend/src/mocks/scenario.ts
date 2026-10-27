import { HttpResponse, delay } from 'msw';

// Named scenarios selectable per test (setScenario) or in the browser (?scenario=name).
// Generic scenarios apply to every handler; `empty` is interpreted by each list handler.
export const SCENARIOS = [
  'default',
  'empty',
  'slow',
  'unauthenticated',
  'forbidden',
  'rate_limited',
  'unavailable',
  'server_error',
  'network_error',
] as const;
export type Scenario = (typeof SCENARIOS)[number];

let current: Scenario = 'default';

export function setScenario(scenario: Scenario) {
  current = scenario;
}

export function getScenario(): Scenario {
  return current;
}

export function parseScenario(value: string | null): Scenario {
  return SCENARIOS.find((s) => s === value) ?? 'default';
}

export function errorResponse(status: number, code: string, message: string, headers: Record<string, string> = {}) {
  return HttpResponse.json({ error: { code, message } }, { status, headers });
}

// Returns a response that overrides the handler, or undefined to let the handler answer.
export async function scenarioOverride(): Promise<Response | undefined> {
  switch (current) {
    case 'slow':
      await delay(1500);
      return undefined;
    case 'unauthenticated':
      return errorResponse(401, 'unauthenticated', 'Sessão expirada. Entre novamente.');
    case 'forbidden':
      return errorResponse(403, 'forbidden', 'Sem permissão para esta ação.');
    case 'rate_limited':
      return errorResponse(429, 'rate_limited', 'Muitos pedidos agora. Tente de novo em instantes.', { 'Retry-After': '30' });
    case 'unavailable':
      return errorResponse(503, 'unavailable', 'Servidor indisponível no momento.');
    case 'server_error':
      return errorResponse(500, 'server_error', 'Erro inesperado no servidor.');
    case 'network_error':
      return HttpResponse.error();
    default:
      return undefined;
  }
}
