# TASK-010 — Login: senha da casa e perfil

- **Estado:** planned · **Implementa:** Codex · **Revisa:** Claude · **Sprint:** S02
- **Frame:** `prototype/26 · Entrar — Senha da casa e perfil.png` (sha256 `fda947ccaa0da349…`, completo em prototype-map), 1440×1000, Dracula.
- **Objetivo observável:** `/login` com senha da casa + escolha de perfil (cartões selecionáveis por teclado, radiogroup); sucesso → biblioteca; senha errada → erro sem bloquear outros perfis; 429 → mensagem com Retry-After; link "Entrar como administrador" → `/admin/login`. Selecionar avatar não desbloqueia capturas privadas.
- **Requisitos:** RF42, RF43, CA28, CA29 (UI simulada).
- **Dependências:** TASK-005.
- **Arquivos permitidos:** `apps/frontend/src/features/auth/**`, `apps/frontend/src/mocks/handlers/auth.ts`, `tests/e2e/login.spec.ts`. **Proibidos:** contracts, theme, router, lockfile.
- **Contrato:** `POST /v1/session` {household_password, profile_id} → Session; `GET /v1/profiles/public` (avatar/nome mínimos). Definidos em TASK-002.
- **Cenários:** sucesso, senha inválida (401), limite (429), indisponível (503).
- **Aceite/comandos:** testes RED→GREEN com Testing Library; `npm run test:coverage -w apps/frontend`; Playwright `login.spec.ts`; screenshot 1440×1000 comparada ao frame 26.
