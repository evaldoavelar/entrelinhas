# TASK-010 — Handoff do worker

- **Agente/provider:** Codex / OpenAI.
- **Branch/worktree:** `task/TASK-010-login` em `/home/evaldo/Documents/entrelinhas-wt/TASK-010`.
- **Base:** `54d6caaac757074727a88396ff999b6a37cddf04`; **HEAD:** permanece na base. O commit solicitado não pôde ser criado: `git add` retornou `fatal: Unable to create '/home/evaldo/Documents/entrelinhas-audio-reader/.git/worktrees/TASK-010/index.lock': Read-only file system` (diretório git fora das raízes graváveis deste ambiente).
- **Arquivos alterados:** `apps/frontend/src/features/auth/LoginPage.tsx`, `LoginPage.test.tsx`, `login.css`; `tests/e2e/login.spec.ts`; este handoff exigido pela tarefa. Não houve alteração de router, contratos, tokens ou handler de sessão.
- **Skills usadas:** `parallel-task`, `frontend-tdd`, `prototype-guided-ui`, `playwright-regression`.
- **Implementação:** formulário com senha, perfis públicos do cliente HTTP/MSW, radiogroup e teclado, entrada pela sessão mockada, retorno a `location.state.from` ou `/library`, erros 401/429 (30 segundos de Retry-After)/503, recuperação da lista de perfis e link de administrador. O avatar não altera `private_unlocked`.

## Verificações executadas

- `pwd`, `git branch --show-current`, `git rev-parse HEAD`, `git status --short`: worktree, branch e base acima; estado inicial limpo.
- `sha256sum "prototype/26 · Entrar — Senha da casa e perfil.png"`: `fda947ccaa0da349659960ae5396e63dec8d1565c78b0146cf0311fbb090d299`, confere com `docs/design/prototype-map.md`.
- **RED:** `npx vitest run src/features/auth/LoginPage.test.tsx` em `apps/frontend`: 5 testes falharam; primeiro erro esperado `Unable to find role="radiogroup" and name "Perfil"` na implementação inicial mínima.
- **GREEN:** mesmo comando: 7 testes aprovados, 1 arquivo aprovado.
- `npm run lint`: exit 0 após corrigir papel acessível do grupo.
- `npm run typecheck`: exit 0 (três workspaces).
- `npm run test:coverage -w apps/frontend`: exit 0; 8 arquivos, 139 testes aprovados. Cobertura global: linhas 235/243 (96,71%), statements 276/291 (94,85%), funções 93/95 (97,89%), branches 165/184 (89,67%). `LoginPage.tsx`: statements 47/50, funções 15/15, branches 40/48.
- `COVERAGE_BASE=54d6caa npm run test:coverage -w apps/frontend`: testes passaram, mas verificador de diff encerrou com `Error: spawnSync git EPERM`; cobertura do diff não foi validada.
- `npm run build:mock -w apps/frontend`: exit 0.
- `PW_PORT=4174 npx playwright test tests/e2e/login.spec.ts`: exit 1 antes dos testes, `Process from config.webServer was not able to start`. Reproduzido com `npm run preview -w apps/frontend -- --port 4174`: `listen EPERM` em `::1:4174`; com DNS IPv4: `listen EPERM` em `127.0.0.1:4174`. Nenhum teste E2E foi executado. A spec contém duas verificações de contrato mockado e uma jornada UI marcada `fixme` até a integração da rota.
- `git add ...`: exit 128, `.git/worktrees/TASK-010/index.lock: Read-only file system`; nenhum commit foi criado.

## Visual

Frame 26 aberto em 1440×1000, Dracula. Cartão central de cerca de 500 px, fundo #44475a, título serifado, senha, três cartões de perfil, CTA lilás e link de administração. A UI usa os tokens existentes e a mesma geometria principal. A rota `/login` ainda exibe `PendingPage` por política da tarefa: o router global só pode ser alterado pelo líder. Portanto não foi possível capturar `docs/design/evidence/TASK-010/login-dark-desktop.png` nem comparar screenshot da app com o frame; fidelidade visual permanece sem validação de navegador. O tema claro segue os tokens existentes, sem frame próprio.

## Próximo passo

Em ambiente com escrita no git e porta local disponível, o líder deve registrar o commit Conventional Commits com `TASK-010` no corpo e `Co-Authored-By: Codex <noreply@openai.com>` na linha final, integrar `LoginPage` à rota `/login`, remover o `fixme` da spec após implementar a jornada Playwright, executar o E2E em 4174 e revisar a captura 1440×1000 contra o frame. Não marcar a tarefa `done` antes da revisão independente e dos checks na base integrada.

## Integração pelo líder (Claude, 27/10, sessão 2)

- Commit do worker registrado pelo líder em `44379c2` (sandbox sem escrita no git). Merge da `main` (`d7cda13`) na branch.
- Router: `/login` → `LoginPage` (arquivo de dono único, alterado pelo líder). RED antes: teste `the /login route signs in…` em `src/app/shell.test.tsx` falhou com `Unable to find role="radio" and name "Ana"`; GREEN após a troca.
- E2E: as duas verificações de contrato da spec original **falhavam no navegador real** (`fetch` antes de o service worker do MSW controlar a página → `index.html`, `Unexpected token '<'`); defeito do teste, não do produto (a UI só monta após os mocks). Spec substituída por jornada de UI (teclado no radiogroup, senha errada, Enter → biblioteca), link de admin e evidência; o `test.fixme` foi removido. `PW_PORT=4175 npx playwright test tests/e2e/login.spec.ts`: 12 passed (4 projetos).
- Revisão visual (frame 26 vs `docs/design/evidence/TASK-010/login-dark-desktop.png`, 1440×1000): geometria do cartão, título serifado, campo, cartões de perfil, CTA e link conferem. Corrigido: marca em 700 (frame bold) e cartões de perfil com 128 px (antes esticavam). Diferenças aceitas: subtítulo/explicação usam `--color-text-muted` em vez do azul `#6272a4` do frame (contraste WCAG insuficiente sobre `#44475a`); "Evaldo Avelar" vem da fixture (frame mostra "Evaldo"); cartão ~10 px mais baixo (centralização vertical). Móvel e claro derivados (sem frame); nome longo truncado com reticências, nome acessível completo.
