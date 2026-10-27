# TASK-012 — Biblioteca

- **Estado:** done · **Implementa:** Claude · **Revisa:** Codex · **Sprint:** S02
- **Frames:** 01 cards (`c0af61b48c8cfc42…`), 02 compactos (`fbabbcb1a1f89fc4…`), 03 lista (`cc96d0fcecc70d4b…`), 16 mobile 390×1100 (`242cb729e5bf95fe…`), 18 menu ordenar 332×372 (`6361b3ff49e486a1…`).
- **Objetivo:** cards por site (nome, ícone/inicial, domínio, categoria, áudios/não ouvidos, última conversão, monitorando, abrir site); 3 modos com mesmo conjunto/filtros (CA21/33); modo salvo entre visitas (RF39); busca (texto/tags/título/resumo) e categoria sobre o conjunto completo via API (CA23); ordenação nome/data asc/desc, padrão última conversão desc (RF15/16, CA04); carregar mais com snapshot/cursor estável (RF38, CA22); banner "continuar"; estados vazio/erro/carregando.
- **Arquivos:** `apps/frontend/src/features/library/**`, `apps/frontend/src/mocks/handlers/library.ts`, `tests/e2e/library.spec.ts`.
- **Contrato:** `GET /v1/sites?q&category&sort&order&cursor` (snapshot no cursor), `GET /v1/categories`, `GET /v1/me/continue`.
