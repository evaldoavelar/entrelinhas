# SPRINT-01 — Fundação (G0-F)

**Entrada:** S00 concluída (`54285dd`), ADR-12 aceita, prototype-map com 37 frames inspecionados.
**Saída (G0-F):** `npm run verify` verde na `main` (lint, typecheck, unit+coverage >80% estrito, build, e2e smoke); enums com teste de drift contra `decisoes-e-estados.md`; app sobe com MSW sem rede externa; Dracula + Claro; AppShell do frame 01; CI configurado.

| Tarefa | Título | Implementa | Revisa | Depende |
| --- | --- | --- | --- | --- |
| TASK-001 | Harness monorepo (npm workspaces, Vite/React/TS, Vitest coverage gate, ESLint, Playwright, CI) | Claude | Codex | — |
| TASK-002 | `packages/contracts`: enums canônicos + drift test + schemas v1 iniciais | Claude | Codex | 001 |
| TASK-003 | `packages/api-client` + MSW (cenários, reset, falha sem handler) | Claude | Codex | 002 |
| TASK-004 | Tokens Dracula/ValueTI, fontes locais, componentes base | Claude | Codex | 001 |
| TASK-005 | AppShell (sidebar, player bar), router, tema por perfil, rota protegida | Claude | Codex | 003, 004 |

Tudo sequencial: altera arquivos de dono único (lockfile, contratos, tokens, router). Integração por tarefa na `main`.
