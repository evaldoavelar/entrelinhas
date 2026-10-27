# TASK-005 — AppShell, router e tema por perfil

- **Estado:** done · **Implementa:** Claude · **Revisa:** Codex · **Sprint:** S01
- **Frames:** 01 (shell: sidebar 224px, navegação, card de status, perfil, PlayerBar), 16 (shell móvel: tab bar, mini player), 09 (variante admin).
- **Objetivo observável:** rotas privadas exigem sessão (sem sessão → `/login`); sidebar com item ativo e badge de notificações; layout móvel <768px com tab bar; tema Dracula/Claro alternável e salvo no perfil via API mock.
- **Requisitos:** RF34, RF40, RF41, RF42 (UI), CA27, CA28.
- **Dependências:** TASK-003, TASK-004.
- **Arquivos permitidos:** `apps/frontend/src/app/**`, `apps/frontend/src/mocks/handlers/session.ts`, `tests/e2e/shell.spec.ts`.
- **Aceite:** testes de componente (navegação, rota protegida, troca de tema persistida); Playwright: shell Dracula desktop comparado ao frame 01 (screenshot de evidência), Claro, móvel.
