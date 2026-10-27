# TASK-003 — Cliente HTTP único + MSW

- **Estado:** planned · **Implementa:** Claude · **Revisa:** Codex · **Sprint:** S01
- **Objetivo observável:** telas chamam só `packages/api-client`; em dev/teste o MSW responde no limite HTTP validando com os schemas; request sem handler falha o teste.
- **Requisitos:** plano §8 (status codes, Idempotency-Key, Retry-After), CA98–CA100 (UI), ADR-12.
- **Dependências:** TASK-002.
- **Arquivos permitidos:** `packages/api-client/**`, `apps/frontend/src/mocks/**`, `apps/frontend/src/test/setup.ts`, `apps/frontend/src/main.tsx` (bootstrap do worker apenas em dev/mock).
- **Escopo regularizado pelo líder (revisão Codex):** também alterados, por serem arquivos de dono único do líder necessários ao modo mock: `apps/frontend/{vite.config.ts,vitest.config.ts,package.json,.env.mock,public-mock/**,src/api.ts,src/vite-env.d.ts}`, `scripts/bundle/**`, `eslint.config.js`, `playwright.config.ts`, `package.json`, `package-lock.json`, `.gitignore`, `tests/e2e/mocks.spec.ts`.
- **Aceite:** cliente mapeia 401/403/404/409/413/429(Retry-After)/503/timeout para `ApiError` tipado; `credentials: 'same-origin'`, sem token em query; seletor de cenário (`?scenario=` em dev e `useScenario()` nos testes); `onUnhandledRequest: 'error'`; reset de handlers/estado por teste; bundle de produção não importa MSW (teste do build).
- **Comandos:** `npm run test -w packages/api-client`, `npm run test -w apps/frontend`.
- **Próxima integração:** TASK-005.
