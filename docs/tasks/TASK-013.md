# TASK-013 — Busca global

- **Estado:** running · **Implementa:** Claude · **Revisa:** Codex · **Sprint:** S02
- **Frame:** 15 (`09a712817dcca669…`).
- **Objetivo:** `/search?q=` resultados de posts de todos os sites, indicando onde casou (texto/tags/resumo), trecho com realce renderizado como segmentos de texto (CA67, nunca HTML); limpar; vazio; erro.
- **Requisitos:** RF17, CA05, CA23, CA67. **Dependências:** TASK-012.
- **Arquivos:** `apps/frontend/src/features/search/**`, `apps/frontend/src/mocks/handlers/search.ts`, `tests/e2e/search.spec.ts`.
