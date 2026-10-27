# TASK-011 — Login individual de administrador

- **Estado:** running · **Implementa:** agy (redistribuído do Codex em 27/10; agy liberado) · **Revisa:** Claude · **Sprint:** S02
- **Frame:** `prototype/27 · Administrador — Login individual.png` (`a9a814a3ad0cf544…`).
- **Objetivo:** `/admin/login` usuário+senha+TOTP (6 dígitos) ou passkey (simulada); sucesso → `/admin`; erro genérico; lockout informado sem afetar outros perfis.
- **Requisitos:** RF58, CA65, plano §4. **Dependências:** TASK-010.
- **Arquivos:** `apps/frontend/src/features/auth/admin/**`, `apps/frontend/src/mocks/handlers/admin-auth.ts`, `tests/e2e/admin-login.spec.ts`.

## Instruções ao worker (27/10, sessão 2)

- Worktree `../entrelinhas-wt/TASK-011`, branch `task/TASK-011-admin-login`, base = `main` na criação (`git log -1`). Confirme `pwd`, branch e base antes de escrever.
- Crie `apps/frontend/src/features/auth/admin/AdminLoginPage.tsx` (+ `AdminLoginPage.test.tsx`, `admin-login.css` se necessário). **Não** edite `src/app/router.tsx`: o líder troca o `PendingPage` de `/admin/login` e cria a rota `/admin` na integração. Nos testes, monte com `createMemoryRouter` + `SessionProvider` (modelo: `src/features/auth/LoginPage.test.tsx`).
- Siga o padrão visual e de código de `src/features/auth/LoginPage.tsx`/`login.css` (mesmo cartão; frame 27 tem a mesma geometria do 26). Reutilize `TextField`, `Button`, `Icon` de `src/components`; tokens em `src/theme/tokens.css` (não altere).
- Contrato já existente: `api.createAdminSession({ username, password, totp_code })` → `POST /v1/admin/session` (`AdminSessionCreateRequest`: `totp_code` = exatamente 6 dígitos). O campo de código aceita espaços como no frame ("482 913"), remove-os antes de enviar, `inputMode="numeric"`, `autoComplete="one-time-code"`. Mock: usuário `evaldo`, senha `admin-exemplo`, código `482913`; o handler está em `src/mocks/handlers/session.ts` (não altere; peça ao líder se faltar algo).
- Sucesso → navegar para `/admin` (`replace`). Erro 401 → mensagem **genérica** (não revelar qual campo errou). 429 (cenário `rate_limited`, Retry-After 30) → informar a espera e que os outros perfis da casa não são bloqueados. 503 (`unavailable`) → tentar de novo.
- "Usar passkey": não há contrato de passkey. O botão existe (frame 27) e, ao ser acionado, informa que passkey está indisponível nesta versão simulada — sem chamada HTTP nem endpoint inventado. "Voltar" → `/login`.
- Login de admin **não** cria sessão de perfil da casa nem altera `useSession()`.
- E2E: `tests/e2e/admin-login.spec.ts` — jornada que navega a partir de `/login` pelo link "Entrar como administrador" fica para o líder após ligar a rota; escreva a spec completa (jornada de teclado + `toHaveScreenshot('admin-login.png')` com o campo sem foco, como em `tests/e2e/login.spec.ts`) e tente rodar com `PW_PORT=4177 npx playwright test tests/e2e/admin-login.spec.ts`. Se a porta for negada, registre o erro exato no handoff. **Não** gere baselines (`--update-snapshots`): o líder gera e revisa.
- Abra `prototype/27 · Administrador — Login individual.png` e compare com o que implementou; diga no handoff se abriu a imagem.
- Gates: `npm run lint`, `npm run typecheck`, `npm run test:coverage -w apps/frontend` (>80% estrito; arquivo ≥20 statements também; `COVERAGE_BASE=main` para o diff).
- Comite na branch (Conventional Commits, `TASK-011` no corpo). Se o commit falhar por permissão, registre o erro exato no handoff.
- Handoff em `docs/tasks/handoffs/TASK-011.md` conforme AGENTS.md (RED→GREEN com saídas reais).
