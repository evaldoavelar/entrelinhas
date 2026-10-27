# TASK-011 — Handoff do worker

- **Agente/provider:** agy (Google Deepmind / Gemini).
- **Branch/worktree:** `task/TASK-011-admin-login` em `/home/evaldo/Documents/entrelinhas-wt/TASK-011`.
- **Base commit:** `a782402 docs: TASK-011 worker instructions (agy)`.
- **HEAD commit:** `d2674ff feat: implement admin login page and test suite`.
- **Arquivos alterados:**
  - `apps/frontend/src/features/auth/admin/AdminLoginPage.tsx`
  - `apps/frontend/src/features/auth/admin/AdminLoginPage.test.tsx`
  - `apps/frontend/src/features/auth/admin/admin-login.css`
  - `tests/e2e/admin-login.spec.ts`
  - `docs/tasks/handoffs/TASK-011.md`
  *(Nenhum arquivo fora do escopo foi alterado: `router.tsx`, contratos, tokens, lockfile e handlers existentes foram preservados intactos).*
- **Skills usadas:** `parallel-task`, `frontend-tdd`, `prototype-guided-ui`, `playwright-regression`.
- **Implementação:**
  - `AdminLoginPage` com formulário individual de administrador: campos "Usuário", "Senha" e "Código do aplicativo autenticador".
  - Sanitização de espaços no código TOTP ("482 913" → "482913") antes de enviar para `api.createAdminSession`.
  - Sucesso navega para `/admin` com `{ replace: true }` sem alterar `useSession()` nem a sessão doméstica (`db.sessionProfileId` permanece `null`).
  - Erro 401 exibe mensagem genérica (`Usuário, senha ou código incorretos.`), sem vazar qual campo falhou.
  - Erro 429 (`rate_limited`) informa o tempo de espera (Retry-After) e ressalta que os outros perfis da casa não são afetados.
  - Erro 503 (`unavailable`) exibe mensagem de servidor indisponível permitindo nova tentativa.
  - Botão "Usar passkey" (outline) aciona aviso acessível informando que passkey está indisponível nesta versão simulada, sem requisições HTTP inventadas.
  - Link "Voltar" direciona para `/login`.

## Verificações executadas

- `pwd`: `/home/evaldo/Documents/entrelinhas-wt/TASK-011`
- `git branch --show-current`: `task/TASK-011-admin-login`
- `git rev-parse HEAD`: `a7824021dd7ae906a5e1db87bf1516f84d6b63ca`
- `sha256sum "prototype/27 · Administrador — Login individual.png"`: `a9a814a3ad0cf544d77934eeda8389d5e4d8e98b6550a42f3a48fc4d1f94daa3` (confere com o valor da tarefa).
- **RED:** `npm run test -w apps/frontend -- src/features/auth/admin/AdminLoginPage.test.tsx`:
  - 8 testes falharam conforme esperado (`Unable to find an accessible element with the role "heading" and name "Acesso de administrador"` e campos ausentes).
- **GREEN:** `npm run test -w apps/frontend -- src/features/auth/admin/AdminLoginPage.test.tsx`:
  - 8 testes passaram (100%).
- **Cobertura:** `npm run test:coverage -w apps/frontend`:
  - Total do projeto: Statements 95.89% (327/341), Branches 91.71% (199/217), Functions 98.08% (102/104), Lines 97.23% (281/289) — todos estritamente > 80%.
  - `AdminLoginPage.tsx` individualmente: Statements 41/41 (100%), Branches 28/29 (96.55%), Functions 7/7 (100%) — todos estritamente > 80%.
- **Diff Coverage:** `COVERAGE_BASE=main node scripts/coverage/check-coverage.mjs --report apps/frontend/coverage/coverage-final.json --src apps/frontend/src`: exit 0.
- `npm run lint`: exit 0 (0 warnings).
- `npm run typecheck`: exit 0 (workspaces contratos, api-client e frontend válidos).
- `npm run check:workspaces`: exit 0 (3 workspaces com scripts obrigatórios).
- `npm run test:scripts`: exit 0 (18 testes de scripts aprovados).
- `npm run build`: exit 0 (`OK: dist sem MSW/fixtures`, bundle de produção limpo).
- **Playwright E2E:** `PW_PORT=4177 npx playwright test tests/e2e/admin-login.spec.ts`:
  - Modo padrão sandbox bloqueou porta/escrita (`Error: http://localhost:4177 is already used`, `EROFS`).
  - Execução com elevação bypass subiu o servidor preview na porta 4177, mas os testes cronometraram em timeout esperando os seletores do formulário (`waiting for getByLabel('Usuário')`), pois a rota `/admin/login` ainda monta `PendingPage` no `router.tsx` global (que é de dono exclusivo do líder).
  - Nenhuma baseline foi gerada (`--update-snapshots` não utilizado), conforme estritamente orientado.

## Comparação visual (prototype-guided-ui)

- **Frame aberto:** `prototype/27 · Administrador — Login individual.png` inspecionado visualmente via ferramenta de leitura de imagem do agente.
- **Hierarquia visual observada no frame:**
  - Fundo escuro (Dracula), cartão centralizado de cerca de 500px com borda sutil e cantos arredondados (`var(--radius-md)` / 16px).
  - Ícone `headphones` roxo seguido por `entrelinhas` em negrito 700.
  - Título serifado em fonte de display: "Acesso de administrador".
  - Subtítulo suave: "Credencial individual, diferente da senha da casa e do PIN.".
  - Campos verticais com labels legíveis ("Usuário", "Senha", "Código do aplicativo autenticador"), espaçamento vertical consistente de 16px.
  - Botão primário "Entrar" com preenchimento roxo (`var(--color-primary)`).
  - Botão secundário "Usar passkey" com visual outline/fundo surface e borda sutil.
  - Texto informativo sobre tentativas de bloqueio: "Depois de 5 tentativas erradas, aguarde 15 minutos. Os outros perfis da casa não são bloqueados.".
  - Link de navegação "Voltar" apontando para o login doméstico `/login`.
- **Implementação:** Toda a estrutura, hierarquia, tokens e geometria de `LoginPage` foram replicados fielmente via CSS semântico em `admin-login.css`, com contrastes acessíveis e suporte a navegação por teclado.

## Limitações e Próximos Passos

1. O líder integrará o `AdminLoginPage` no `src/app/router.tsx` substituindo o `PendingPage` de `/admin/login` e configurará a rota de destino `/admin`.
2. O líder executará a suíte E2E em `tests/e2e/admin-login.spec.ts` com a rota conectada e gerará/revisará as baselines visuais (`admin-login.png`) para dark/light desktop/mobile.
