# TASK-013 — Handoff (busca global)

- **Agente/provider:** Claude (líder) / Anthropic. **Revisor previsto:** Codex (limite de uso até 15:04) ou agy.
- **Branch/worktree:** `task/TASK-013-search` em `../entrelinhas-wt/TASK-013`, base `cdcf995` (TASK-012 integrada).
- **Skills:** frontend-tdd, prototype-guided-ui, api-contract-mocks, playwright-regression.

## Arquivos

- `features/search/**` (`SearchPage.tsx`, `search.css`, testes); `mocks/handlers/search.ts` (+ teste); `tests/e2e/search.spec.ts` + 4 baselines.
- **Compartilhados (líder):** `features/shared/usePagedList.ts` — extraído do `useSites` (paginação por cursor/snapshot, abort por consulta, reset no render, retry da página que falhou), reutilizado pela busca; `features/library/useSites.ts` virou invólucro (testes do `useSites` inalterados e verdes). `mocks/handlers/index.ts` (registra `searchHandlers`); `app/router.tsx` (`/search`); biblioteca: link "Ver leituras com “q”" → `/search?q=` quando há busca.

## TDD

- Handler: `mocks/handlers/search.test.ts` RED (6 falhas: rota sem handler) → GREEN. Casos: sessão, campos (texto/resumo/tags/título) e ordem por data, trecho em segmentos com realce sem acento e com acentos originais, markup na consulta sem match, cursor/snapshot e cursor inválido, cenários `empty`/`unavailable`.
- Página: `features/search/SearchPage.test.tsx` RED (7 falhas: rota inexistente) → GREEN. Casos: frame 15 (onde casou + `<mark>`), Ouvir/Baixar/menu, markup como texto (CA67, nenhum `<img>` criado), digitação com debounce + Limpar (foco volta ao campo), carregar mais, erro + tentar de novo, ida e volta biblioteca ↔ busca.

## Comandos (resultados reais)

- `npx vitest run src/mocks/handlers/search.test.ts src/features/search`: 13 passed.
- `npx vitest run src/features`: 43 passed (biblioteca inclusive, após extrair `usePagedList`).
- `PW_PORT=4178 npx playwright test tests/e2e/search.spec.ts`: 8 passed, duas execuções seguidas sem update (baselines criadas com `--update-snapshots=missing` e revisadas: dark-desktop, dark-mobile, light-desktop).
- `npm run verify`: exit 0, 196 testes frontend, 60 e2e.

## Visual (frame 15, sha256 `09a712817dcca669…`, 1440×1000)

Conferem: eyebrow/título/subtítulo, barra de busca em superfície com "Limpar" 140 px, contagem "3 posts encontrados · texto, resumo e tags", cartão "Leituras encontradas", capa genérica (SVG decorativo com tokens de capa), título, "Site · Encontrado no texto/nas tags/no resumo: “trecho”" com realce, chip de escuta, Ouvir/Baixar/⋯, "Voltar à biblioteca" 220 px.
Diferenças justificadas: "Baixar" e "⋯" desabilitados com descrição acessível ("Baixar e mais ações chegam com o player.") — download/menu são de tarefas futuras; "Em andamento" no 1º item vem da fixture (frame: "Não ouvido"); item "Biblioteca" da barra lateral não fica ativo em `/search` (o frame o destaca; `aria-current="page"` em outra rota seria incorreto); cartão sem altura mínima fixa; PlayerBar é TASK-021. Móvel e claro derivados.

## Limitações

- `Ouvir` leva a `/articles/:id`, rota ainda inexistente (cai no `*` → biblioteca) até a tarefa do player/artigo.
