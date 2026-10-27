import { HttpResponse } from 'msw';
import type { z } from 'zod';
import { errorResponse } from './scenario';

// Mock responses are validated against the same contract the client uses, so a mock can never
// drift from packages/contracts silently.
export function ok<S extends z.ZodType>(schema: S, data: z.input<S>, status = 200) {
  return HttpResponse.json(schema.parse(data) as never, { status });
}

export async function readBody<S extends z.ZodType>(request: Request, schema: S): Promise<z.output<S> | Response> {
  const parsed = schema.safeParse(await request.json().catch(() => undefined));
  return parsed.success ? parsed.data : errorResponse(400, 'invalid_request', 'Pedido inválido.');
}
