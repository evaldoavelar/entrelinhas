---
name: api-contract-mocks
description: Maintain the versioned HTTP contract (packages/contracts), the shared HTTP client (packages/api-client) and MSW scenario handlers, preventing drift between schema, mocks and UI. Use when a screen needs data or a contract changes.
---

# api-contract-mocks

**Quando usar:** tela precisa de endpoint/campo; contrato muda; novo cenário de mock.

**Entradas:** `packages/contracts/src/**` (schemas zod + enums canônicos), `docs/specs/decisoes-e-estados.md` §2, plano §8, extensão §4.

**Passos**
1. Enums vêm só de `packages/contracts/src/enums.ts`, que espelha `decisoes-e-estados.md` §2 (teste de drift compara). Nunca redeclare listas.
2. Campo/rota inexistente: proponha ao líder (dono de `packages/contracts`). Workers não criam variantes.
3. Cliente HTTP único em `packages/api-client`; componentes usam hooks/funções dele. Mock vs real é decidido no bootstrap do app (MSW worker), nunca no componente.
4. Handlers MSW em `apps/frontend/src/mocks/` validam request/response com os mesmos schemas. Cenários nomeados (sucesso, vazio, atraso, erro, timeout, 401, 403, 409, 429+Retry-After, 503, etc.) selecionáveis por teste.
5. Testes: `onUnhandledRequest: 'error'`, `server.resetHandlers()` e reset de estado por teste.
6. Mudança de contrato = schema + mocks + cliente + testes no mesmo commit.

**Saídas:** schema/cliente/handlers coerentes.

**Verificação:** `npm run test -w packages/contracts` (drift de enums) e testes do app verdes; nenhum `fetch` direto fora do `api-client`.
