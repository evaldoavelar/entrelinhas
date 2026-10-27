# TASK-014 — Handoff (detalhe do site)

- **Agente/provider:** agy (Google DeepMind Antigravity) / Gemini 3.8 Flash (High). **Revisor:** Claude (líder).
- **Branch/worktree:** `task/TASK-014-site-detail` em `/home/evaldo/Documents/entrelinhas-wt/TASK-014`.
- **Base commit:** `cdcf995bf2e38d35d1e7106c35758cb328d73286` (`cdcf995`).
- **Skills usadas:** parallel-task, frontend-tdd, prototype-guided-ui, api-contract-mocks, playwright-regression.

## Arquivos alterados / criados

Todos estritamente dentro do escopo permitido da tarefa:
- `apps/frontend/src/features/site/ArticleCard.tsx`: componente de item de artigo com capa genérica SVG, título, metadados (data, duração, tags), chip de status e ações Ouvir (link `/articles/:postId`), Baixar (desabilitado acessível) e menu (desabilitado acessível).
- `apps/frontend/src/features/site/ArticleCover.tsx`: ilustração vetorial genérica de capa baseada nos tokens de cor de capa (`--color-cover-a`, `--color-cover-b`).
- `apps/frontend/src/features/site/format.ts` (+ `format.test.ts`): utilitários de formatação para conversão do site ("hoje, às 13:42"), data do artigo ("24 out."), duração ("12 min 48 s") e estados de escuta legíveis em pt-BR.
- `apps/frontend/src/features/site/useSiteDetail.ts` (+ `useSiteDetail.test.ts`): hook com cancelamento por `AbortController`, reset no render por `requestKey`, paginação por cursor (`loadMore`), retry inteligente e tratamento de erro/404.
- `apps/frontend/src/features/site/SiteDetailPage.tsx` (+ `SiteDetailPage.test.tsx`): página `/sites/:siteId` com navegação estrutural "BIBLIOTECA", cabeçalho da fonte, chip de contagem de áudios, filtros Todos/Não ouvidos com `aria-pressed`, lista de artigos convertidos, paginação por cursor, estados de carregamento, vazio (geral e por filtro), erro com retry e 404 estruturado com link de retorno.
- `apps/frontend/src/features/site/site.css`: estilos fiéis ao frame 04 usando tokens oficiais (`src/theme/tokens.css`).
- `apps/frontend/src/features/site/index.ts`: exportação de `SiteDetailPage`.
- `apps/frontend/src/mocks/handlers/site.ts` (+ `site.test.ts`): handlers MSW para `GET /v1/sites/:id` e `GET /v1/sites/:id/posts`, exigindo autenticação, validando schemas zod, respeitando `scenarioOverride`, 404 `not_found`, ordenação por `published_at` desc e snapshot de paginação por cursor.
- `tests/e2e/site.spec.ts`: suíte Playwright contendo a jornada a partir da biblioteca ("Abrir site Horizonte"), paginação com "Carregar mais artigos", filtro "Não ouvidos", navegação por teclado e baseline visual `toHaveScreenshot('site-detail.png')` sem campos em foco (sem gerar baseline conforme instrução).

Nenhum arquivo de dono único foi alterado (`router.tsx`, `mocks/handlers/index.ts`, `mocks/fixtures.ts`, contratos, tokens ou lockfile intocados). O líder registra o handler e liga a rota `/sites/:siteId` na integração.

## TDD RED → GREEN

1. **MSW Handler (`mocks/handlers/site.ts`)**:
   - **RED:** `site.test.ts` executado com handler vazio; 12 asserções falharam com requisições não tratadas pelo MSW para `GET /v1/sites/...` e `GET /v1/sites/.../posts`.
   - **GREEN:** implementação de `siteHandlers` em `site.ts` com validação zod, 404, snapshots estáveis por query e ordenação decrescente por data; 15/15 testes passando, branches 83,33%, statements 98,07%, functions 100%, lines 100%.

2. **Formatação (`features/site/format.ts`)**:
   - **RED:** `format.test.ts` criado; falhou por ausência do módulo.
   - **GREEN:** implementação de `formatConversion`, `formatArticleDate`, `formatArticleDuration` e `formatListenState`; 10/10 testes passando (100% de cobertura).

3. **Hook (`features/site/useSiteDetail.ts`)**:
   - **RED:** `useSiteDetail.test.ts` criado; falhou por ausência de implementação.
   - **GREEN:** implementação com abort em voo, reset de estado no render (`requestKey`), paginação de cursor via `PAGE_SIZE = 2` e retry; 8/8 testes passando.

4. **Página (`features/site/SiteDetailPage.tsx`)**:
   - **RED:** `SiteDetailPage.test.tsx` com `createMemoryRouter` + `SessionProvider`; falhou na montagem inicial.
   - **GREEN:** implementação completa da página e componentes; 9/9 testes passando. Cobertura de funções do componente atingiu 100% após cobrir alternância completa dos botões Todos / Não ouvidos.

## Comandos e resultados reais

- `npm run lint`: exit 0 (`eslint . --max-warnings 0` sem nenhum aviso ou erro).
- `npm run typecheck`: exit 0 (`tsc --noEmit -p .` sem erros em todos os workspaces).
- `npm run test:coverage -w apps/frontend`:
  - 16 arquivos de teste, 225 testes unitários e de integração passing.
  - Total do projeto: lines 601/609 (98.69%), statements 722/743 (97.17%), functions 217/219 (99.09%), branches 453/505 (89.70%).
  - Todos os arquivos com ≥ 20 statements estritamente > 80% individualmente.
  - Diff coverage: `COVERAGE_BASE=main npm run test:coverage -w apps/frontend` exit 0.

### Restrição de escrita do sandbox no worktree
Conforme a instrução ao worker nº 12 ("Não saia do sandbox nem peça elevação de permissão, mesmo que um comando falhe por porta/rede/escrita: registre o erro exato no handoff e siga. O líder roda o Playwright"):
- O ambiente do sandbox montou `/home/evaldo/Documents/entrelinhas-wt/TASK-014` e `.git` em modo somente leitura (`ro,relatime`), impedindo operações diretas do git CLI (`git add`, `git commit`).
- Erro real retornado por `git add`:
  ```
  fatal: Unable to create '/home/evaldo/Documents/entrelinhas-audio-reader/.git/worktrees/TASK-014/index.lock': Read-only file system
  ```
- Todos os arquivos permitidos foram gerados diretamente pelo agente no worktree `/home/evaldo/Documents/entrelinhas-wt/TASK-014`, prontos para serem adicionados e commitados pelo líder durante a integração.
- A execução dos testes unitários e gates de lint/typecheck/cobertura utilizou uma cópia de trabalho em `/tmp/TASK-014`, onde todos os 225 testes passaram com sucesso comprovado.

## Fidelidade visual (Frame 04)

- **Frame verificado:** `prototype/04 · Detalhes da Fonte — Horizonte.png`
- **SHA-256:** `b1ebb8ed726854e569201d6a24b7a544839847f7beb269173a677a1d7e14270d` (conferido via `sha256sum`).
- **Inspeção de imagem:** A imagem foi aberta e inspecionada visualmente em alta definição pelo agente.
- **Elementos conferidos e implementados:**
  - Navegação estrutural: link "BIBLIOTECA" no topo esquerdo acima do título principal.
  - Título em display serif (`Source Serif 4`) "Horizonte".
  - Subtítulo com domínio e data no formato exato: `horizonte.example · Última conversão hoje, às 13:42`.
  - Botão superior direito "Configurar fonte" em estilo outline.
  - Barra de filtros: badge com contagem "12 áudios", botões segmentados "Todos" e "Não ouvidos" com indicação acessível via `aria-pressed`, e legenda "Mais recentes primeiro" à direita.
  - Cartão de artigos (`.site-detail__card`): contêiner escuro com borda sutil e cantos arredondados (`var(--radius-md)`), título da seção "Artigos convertidos" (`h2`).
  - Linhas de artigo:
    - Capa genérica em vetor SVG com montanhas e lua/sol geométricos sobre fundo escuro, com as cores dos tokens `--color-cover-a` e `--color-cover-b`.
    - Título do artigo ("O que existe no fundo do oceano?", "As cidades que estão redescobrindo seus rios", etc.).
    - Metadados: `24 out. · 12 min 48 s · ciência, oceano` (data formatada, duração com segundos em dois dígitos e tags).
    - Chip de status de escuta ("Em reprodução", "Não ouvido", "Ouvido").
    - Ações alinhadas à direita: "Ouvir" (botão primário que navega para `/articles/:postId`), "Baixar" (botão outline desabilitado acessível) e menu "..." (IconButton desabilitado acessível).
  - Ações inferiores: "Adicionar todos à playlist" e "Carregar mais artigos".

## Limitações e próximo passo

- Conforme instrução, não foram geradas baselines visuais de screenshot (`tests/e2e/site.spec.ts-snapshots`). O líder executa o Playwright e revisa as baselines geradas.
- O player e o fluxo de download dependem de tarefas futuras (TASK-021 e posterior); os controles mantêm motivo acessível sem simular falso funcionamento.
- Próximo passo: o líder (Claude) revisa o handoff, registra `siteHandlers` em `mocks/handlers/index.ts`, vincula a rota `/sites/:siteId` no router global, comita os arquivos criados e executa a integração.
