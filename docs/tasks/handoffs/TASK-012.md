# TASK-012 — Handoff (biblioteca)

- **Agente/provider:** Claude (líder) / Anthropic. **Revisor:** Codex.
- **Branch/worktree:** `task/TASK-012-library` em `../entrelinhas-wt/TASK-012`. Base original `1c002d0^`; `main` mesclada em `7125a4e` (inclui TASK-005 aprovada e TASK-010).
- **Skills:** frontend-tdd, prototype-guided-ui, playwright-regression, api-contract-mocks.

## Arquivos

- `features/library/**` (LibraryPage, SiteCard, SortMenu, ContinueBanner, useSites, format, `library.css`, testes); `mocks/handlers/library.ts` (+ teste), `mocks/handlers/index.ts`, `mocks/mocks.test.ts`; `tests/e2e/library.spec.ts` + 16 baselines.
- **Fora do escopo original (líder, compartilhados):** `app/router.tsx` (`/library` → `LibraryPage`); `components/Field.tsx` (`labelHidden` no `Select`); `components/Icon.tsx` (ícones `grid`, `rows` para os modos no móvel, frame 16); `docs/design/prototype-map.md`.

## TDD / bugs

- Bug encontrado pelo e2e: limpar a busca e trocar a categoria em < 300 ms **revertia a categoria** (o debounce chamava o updater funcional do React Router, que parte dos `searchParams` da renderização antiga). RED: `LibraryPage.test.tsx` › "changing the category while a search is pending is not reverted by the debounce" falhou com `expected '?category=cat_ciencia' not to contain 'category='`; GREEN com `setParam` a partir dos parâmetros mais recentes (ref sincronizada em efeito).
- Lint do WIP corrigido: `role="menu"` sem `tabIndex` (jsx-a11y) e `setState` síncrono em efeito no `useSites` (reset agora durante o render por `requestKey`).
- Gate de cobertura reprovou `useSites.ts` (branches 64,29%): fallback não-`ApiError` era código morto (o api-client só rejeita com `ApiError`) e foi removido; `useSites.test.ts` cobre retry da 1ª página, `loadMore` sem cursor e abort na troca de filtro (1ª página e próxima página). Mutação: removendo as duas guardas de abort, os 2 testes correspondentes falham.

## Comandos (resultados reais)

- `npx vitest run src/features/library`: 3 arquivos, 23 testes passed.
- `COVERAGE_BASE=main npm run test:coverage -w apps/frontend`: projeto lines 98,54% / statements 96,37% / functions 98,72% / branches 89,51%; diff linhas 100% / branches 88,04%; nenhum arquivo abaixo do piso.
- `PW_PORT=4176 npx playwright test tests/e2e/library.spec.ts`: 24 passed, duas execuções seguidas sem update (baselines criadas com `--update-snapshots=missing` e revisadas).
- `npm run verify` (antes do merge da TASK-010): exit 0, 168 testes frontend, 40 e2e.

## Visual

Frames (sha256 prefixo): 01 `c0af61b48c8cfc42`, 02 `fbabbcb1a1f89fc4`, 03 `cc96d0fcecc70d4b`, 16 `242cb729e5bf95fe`, 18 `6361b3ff49e486a1`. Abertos e comparados com capturas da app em 1440×1000 (dark/light) e 390×1100 (dark/light). Evidência: `docs/design/evidence/TASK-012/` (cópia estática das baselines `tests/e2e/library.spec.ts-snapshots/`).

- Conferem: cabeçalho e botão "Adicionar URL" 200 px; banner "continuar"; toolbar em uma linha (busca sem caixa, categoria, ordenar 210 px, modos); grade 3 colunas (cards), 2 (compactos), 1 (lista, colunas nome/categoria/métricas); cartões 12 px de raio com chip de categoria, métricas recuadas sob o nome, "Monitorando" e "Abrir site →"; "Carregar mais" 190 px; menu do frame 18 (grupos, ✓, nota).
- Diferenças justificadas: ícone do site usa só a inicial ("C" para Circuito/Ciência Aberta/Cotidiano; o frame usa "Ci"/"Co" sem regra definida no contrato); rodapé "6 de 24 sites" sem "Mais itens ao rolar" (não há rolagem infinita, só "Carregar mais"); banner "continuar" aparece também em compactos/lista (frames 02/03 sem banner; comportamento igual nos três modos, CA21); select de categoria com seta nativa removida (como no frame). Móvel (frame 16): mantidos o select de categoria, o chip, o rodapé com "Abrir site" e o banner, que o frame omite mas os requisitos exigem (RF04/05, RF45); botões de modo como ícones com nome acessível em texto oculto. Claro: derivado dos tokens ValueTI, sem frame. PlayerBar do frame 01/16 é TASK-021.

## Limitações / próximo passo

- O e2e não cobre persistência do modo após recarregar a página (o banco MSW do navegador reinicia no reload); cobre a volta por navegação interna e o teste unitário "saved view mode is used on the next visit".
- Próximo: revisão Codex → integração → onda 2 (TASK-013/014 dependem desta).
