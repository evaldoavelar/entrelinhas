# TASK-001 — Harness do monorepo

- **Estado:** ready · **Implementa:** Claude (líder) · **Revisa:** Codex · **Sprint:** S01
- **Objetivo observável:** `npm ci && npm run verify` executa lint, typecheck, testes com cobertura (>80% estrito, falha em 80,0), build e smoke Playwright, e falha quando qualquer etapa falha.
- **Requisitos:** RD01–RD09, CA72–CA80, ADR-10, ADR-12 (G0-F).
- **Dependências:** —
- **Base:** `main@54285dd` · branch `task/TASK-001-harness` (líder pode trabalhar direto na `main` por ser dono único da fundação; registra hash).
- **Arquivos permitidos:** `package.json`, `package-lock.json`, `tsconfig*.json`, `eslint.config.js`, `.prettierrc`, `vitest.workspace.ts`, `playwright.config.ts`, `apps/frontend/{package.json,index.html,vite.config.ts,vitest.config.ts,tsconfig*.json,src/main.tsx,src/App.tsx,src/test/**}`, `packages/*/package.json`, `scripts/coverage/**`, `.github/workflows/ci.yml`, `tests/e2e/smoke.spec.ts`, `README.md` § Comandos.
- **Proibidos:** `docs/specs/**`, `prototype/**`.
- **Contrato/mocks:** nenhum.
- **Aceite:** (1) `scripts/coverage/check-coverage.mjs` testado: 80,0% → falha; 80,1% → passa; relatório ausente → falha; arquivo ≥20 statements ≤80% → falha. (2) `vitest` com `coverage.all`/include de `src/**` (arquivos não importados entram). (3) Playwright smoke abre a app em Chromium bundled. (4) CI roda `npm run verify`.
- **Comandos:** `npm ci`, `npm run verify`, `npm run test -w scripts/coverage` (ou equivalente).
- **Evidência:** saída de `verify`; teste do gate em RED (antes de existir o script) e GREEN.
- **Próxima integração:** TASK-002, TASK-004.
