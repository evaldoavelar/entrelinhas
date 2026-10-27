# TASK-011 — Login individual de administrador

- **Estado:** planned · **Implementa:** Codex · **Revisa:** Claude · **Sprint:** S02
- **Frame:** `prototype/27 · Administrador — Login individual.png` (`a9a814a3ad0cf544…`).
- **Objetivo:** `/admin/login` usuário+senha+TOTP (6 dígitos) ou passkey (simulada); sucesso → `/admin`; erro genérico; lockout informado sem afetar outros perfis.
- **Requisitos:** RF58, CA65, plano §4. **Dependências:** TASK-010.
- **Arquivos:** `apps/frontend/src/features/auth/admin/**`, `apps/frontend/src/mocks/handlers/admin-auth.ts`, `tests/e2e/admin-login.spec.ts`.
