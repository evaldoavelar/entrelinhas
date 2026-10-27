# TASK-002 — Contratos: enums canônicos e schemas v1 iniciais

- **Estado:** planned · **Implementa:** Claude · **Revisa:** Codex · **Sprint:** S01
- **Objetivo observável:** `packages/contracts` exporta enums e schemas zod; teste de drift falha se `enums.ts` divergir da tabela §2 de `docs/specs/decisoes-e-estados.md` (parse do markdown).
- **Requisitos:** CA109, CA99, plano §8, extensão §4, decisões §1–2.
- **Dependências:** TASK-001.
- **Arquivos permitidos:** `packages/contracts/**`.
- **Conteúdo mínimo:** enums (job, attempt, product.processing_state, import, captured_document, delivery, pairing, principal.status, principal.kind, input_kind, source_channel, visibility); `ApiError` (code, message, retry_after?); paginação por cursor/snapshot; schemas: Session/Profile, Site (id, name, domain, icon, category, audio_count, unheard_count, last_conversion_at, monitoring), Category, Post/Article, SearchResult (match_field + trechos como segmentos de texto, nunca HTML), PlaybackProgress, ThemePreference/ViewMode.
- **Aceite:** drift test RED (enum alterado) → GREEN; schemas rejeitam campos extras (`.strict()`); nenhum outro pacote declara listas de enum.
- **Comandos:** `npm run test -w packages/contracts`.
- **Próxima integração:** TASK-003.
