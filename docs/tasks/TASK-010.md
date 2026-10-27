# TASK-010 — Login: senha da casa e perfil

- **Estado:** done · **Implementa:** Codex · **Revisa:** Claude · **Sprint:** S02
- **Frame:** `prototype/26 · Entrar — Senha da casa e perfil.png` (sha256 `fda947ccaa0da349…`, completo em prototype-map), 1440×1000, Dracula.
- **Objetivo observável:** `/login` com senha da casa + escolha de perfil (cartões selecionáveis por teclado, radiogroup); sucesso → biblioteca; senha errada → erro sem bloquear outros perfis; 429 → mensagem com Retry-After; link "Entrar como administrador" → `/admin/login`. Selecionar avatar não desbloqueia capturas privadas.
- **Requisitos:** RF42, RF43, CA28, CA29 (UI simulada).
- **Dependências:** TASK-005.
- **Arquivos permitidos:** `apps/frontend/src/features/auth/**`, `apps/frontend/src/mocks/handlers/auth.ts`, `tests/e2e/login.spec.ts`. **Proibidos:** contracts, theme, router, lockfile.
- **Contrato:** `POST /v1/session` {household_password, profile_id} → Session; `GET /v1/profiles/public` (avatar/nome mínimos). Definidos em TASK-002.
- **Cenários:** sucesso, senha inválida (401), limite (429), indisponível (503).
- **Aceite/comandos:** testes RED→GREEN com Testing Library; `npm run test:coverage -w apps/frontend`; Playwright `login.spec.ts`; screenshot 1440×1000 comparada ao frame 26.

## Instruções ao worker (27/10)

- Worktree `../entrelinhas-wt/TASK-010`, branch `task/TASK-010-login`, base = `main` no momento da criação (ver `git log -1`).
- Crie `apps/frontend/src/features/auth/LoginPage.tsx` (+ testes `LoginPage.test.tsx`) e, se necessário, `features/auth/login.css`. **Não** edite `src/app/router.tsx`: o líder troca o `PendingPage` de `/login` pelo `LoginPage` na integração. Nos testes, monte o `LoginPage` com `createMemoryRouter` + `SessionProvider` (veja `src/app/shell.test.tsx`).
- Após sucesso, chame `useSession().signedIn(session)` e navegue para `location.state.from` ou `/library`.
- Mock: senha fictícia `casa-exemplo` (`src/mocks/fixtures.ts`), perfis de `GET /v1/profiles/public`, `POST /v1/session`. Cenários: `rate_limited` (429 Retry-After 30), `unavailable` (503). Handlers de sessão já existem (`src/mocks/handlers/session.ts`); não os altere — peça ao líder se faltar algo.
- Componentes base em `src/components` (`TextField`, `Button`, `Icon`); tokens em `src/theme/tokens.css` (não altere).
- E2E: `tests/e2e/login.spec.ts`; rode com `PW_PORT=4174 npx playwright test tests/e2e/login.spec.ts` para não colidir com o líder. Capture `docs/design/evidence/TASK-010/login-dark-desktop.png` (1440×1000) e compare com `prototype/26 · Entrar — Senha da casa e perfil.png` abrindo as duas imagens; se não conseguir abrir imagens, diga isso no handoff.
- Gates: `npm run lint`, `npm run typecheck`, `npm run test:coverage -w apps/frontend` (>80% estrito; arquivo ≥20 statements também).
