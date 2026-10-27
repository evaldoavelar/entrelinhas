# TASK-014 — Detalhe do site

- **Estado:** running · **Implementa:** agy (redistribuído do Codex em 27/10: limite de uso da Codex) · **Revisa:** Claude · **Sprint:** S02
- **Frame:** 04 (`b1ebb8ed726854e5…`).
- **Objetivo:** `/sites/:siteId` cabeçalho (nome, domínio, última conversão), filtros Todos/Não ouvidos, lista de artigos (capa genérica, data, duração, tags, estado de escuta), Ouvir/Baixar/menu, carregar mais.
- **Requisitos:** RF07, RF19 (estado), RF24, CA25. **Dependências:** TASK-012.
- **Arquivos:** `apps/frontend/src/features/site/**`, `apps/frontend/src/mocks/handlers/site.ts`, `tests/e2e/site.spec.ts`.

## Instruções ao worker (27/10, sessão 2)

- Worktree `../entrelinhas-wt/TASK-014`, branch `task/TASK-014-site-detail`, base = `main` na criação. Confirme `pwd`, branch e base antes de escrever.
- **Não saia do sandbox nem peça elevação de permissão**, mesmo que um comando falhe por porta/rede/escrita: registre o erro exato no handoff e siga. O líder roda o Playwright.
- Arquivos permitidos: `apps/frontend/src/features/site/**` (página `SiteDetailPage.tsx`, componentes, `site.css`, testes), `apps/frontend/src/mocks/handlers/site.ts` (+ teste), `tests/e2e/site.spec.ts`. **Não** edite router, `mocks/handlers/index.ts`, `mocks/fixtures.ts`, contratos, tokens, componentes base ou lockfile — o líder registra o handler e liga a rota `/sites/:siteId` na integração. Precisa de algo fora disso? Escreva no handoff.
- Contrato (já existe): `api.getSite(id)` → `GET /v1/sites/:id` (`Site`); `api.listSitePosts(id, { filter: 'all' | 'unheard', cursor, limit })` → `GET /v1/sites/:id/posts` (`pageOf(Post)`, cursor). Handler novo em `mocks/handlers/site.ts` exportando `siteHandlers`, no mesmo estilo de `mocks/handlers/library.ts`: exige sessão (`unauthenticated()`), respeita `scenarioOverride()`, usa `sites`/`posts` de `mocks/fixtures.ts` (só leitura), 404 `not_found` para site inexistente, cursor estável como em `library.ts`, posts ordenados por `published_at` desc. Teste o handler como em `library.test.ts` (registre-o no teste com `server.use(...siteHandlers)`).
- Tela (frame `prototype/04 · Detalhes da Fonte — Horizonte.png`): cabeçalho (nome, domínio, última conversão), filtros Todos / Não ouvidos (`aria-pressed`, filtro no servidor), lista de artigos (capa genérica — não use imagens externas —, data, duração, tags, estado de escuta legível), ações Ouvir / Baixar / menu como controles reais; como player e download são de outras tarefas, "Ouvir" navega para `/articles/:postId` e "Baixar"/menu ficam desabilitados com motivo acessível (ou como o frame indicar, sem fingir funcionalidade). "Carregar mais" por cursor. Estados: carregando, vazio (incluindo "nenhum não ouvido"), erro com tentar de novo, 404 "Site não encontrado" com link para a biblioteca. Textos de dados sempre como texto (nunca `innerHTML`).
- Siga o padrão de `features/library/**` (hook com abort por filtro, reset no render, `useSites.test.ts`) e dos componentes base (`Button`, `Chip`, `Icon`). Tokens em `src/theme/tokens.css` (não altere).
- Testes de página: monte com `createMemoryRouter` + `SessionProvider` e uma rota local `/sites/:siteId` → `SiteDetailPage`, registrando `siteHandlers` com `server.use`. `db.sessionProfileId = 'prof_evaldo'` no `beforeEach`.
- E2E `tests/e2e/site.spec.ts`: jornada a partir da biblioteca ("Abrir site Horizonte"), filtro Não ouvidos, carregar mais, teclado; `toHaveScreenshot('site-detail.png')` com campos sem foco. **Não** gere baselines.
- Abra o frame 04 e compare com o que implementou; diga no handoff se abriu a imagem.
- Gates: `npm run lint`, `npm run typecheck`, `npm run test:coverage -w apps/frontend` (>80% estrito; arquivo ≥ 20 statements também; `COVERAGE_BASE=main`).
- Comite na branch (Conventional Commits, `TASK-014` no corpo, linha final `Co-Authored-By: agy <noreply@google.com>`). Handoff em `docs/tasks/handoffs/TASK-014.md` com o hash real do commit e comandos/resultados reais (RED → GREEN).
