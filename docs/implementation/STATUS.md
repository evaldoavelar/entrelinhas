# STATUS

Fonte consolidada de progresso. Conferir sempre contra `git log`/`git worktree list` (RESUME.md).

**Atualizado:** 27/10/2026 (fim da sessão 1) · **Sprint:** S01 quase concluída (1 achado aberto na TASK-005) · S02 onda 1 em andamento · **Marco G0-F:** não declarado até TASK-005 aprovada.

## Concluído e aprovado por revisão Codex (na `main`)

| Tarefa | Commits | Revisão |
| --- | --- | --- |
| Bootstrap/planejamento | `733e0b7`, `54285dd`, `a4f4e70` | — |
| TASK-001 harness + gate ADR-10 | `6cb3b22`, `c62f027`, `83043f5` | aprovado (3ª rodada) |
| TASK-002 contracts | `1af70b8`, `83043f5` | aprovado |
| TASK-003 api-client + MSW | `3e90ea6`, `142f1d0`, `869e253`, `1640572` | aprovado |
| TASK-004 tokens + componentes | `94dcddf`, `9519f4c`, `2957501` | aprovado |

Último `npm run verify` verde na `main` (`a0bf97f`): 134 testes frontend + contracts + api-client, cobertura frontend 94.8% stmts / 91.4% branches, bundle de produção sem MSW, 16 e2e (4 projetos).

## Em aberto

| Tarefa | Estado | Onde | Pendência concreta |
| --- | --- | --- | --- |
| TASK-005 shell/router/tema | review — **reprovado na 3ª revisão** (`a0bf97f`) | `main` | Menu móvel: escolher a rota atual (ex.: Biblioteca estando em /library) fecha o menu e o foco se perde, porque o foco só vai ao `<main>` quando `pathname` muda (`AppShell.tsx`). Corrigir com teste RED primeiro e pedir re-revisão. |
| TASK-010 login casa/perfil | review — implementado pelo **worker Codex**, ainda **não revisado nem integrado** | branch `task/TASK-010-login` (`44379c2`), worktree `../entrelinhas-wt/TASK-010` | Líder: revisar diff/testes, rodar e2e (`tests/e2e/login.spec.ts`; o sandbox do worker não abriu porta), ligar `LoginPage` em `/login` no router, verificar fidelidade ao frame 26, integrar. Handoff em `docs/tasks/handoffs/TASK-010.md` (na branch). |
| TASK-012 biblioteca | running (Claude) | branch `task/TASK-012-library` (`1c002d0` mocks + `660d622` WIP UI), worktree `../entrelinhas-wt/TASK-012` | Fazer merge da `main` (corrige teste instável `root redirects` já resolvido em `a0bf97f`); e2e `tests/e2e/library.spec.ts`; screenshots de evidência nos 4 viewports comparados aos frames 01/02/03/16/18; estilos `library.css` ainda **não escritos** (UI funcional sem CSS próprio); `npm run verify`; revisão Codex; integrar. |
| TASK-011, 013, 014 | planned | — | onda 2 da SPRINT-02 |

## Limitações vigentes

- Todo comportamento de servidor é **simulado** (MSW). Nada de backend, sandbox, TLS, Telegram, Push, MCP ou agy-runner existe.
- agy bloqueado como worker (termos/plano do Antigravity não confirmados pelo usuário).
- Worker Codex: sandbox não comita em worktree nem abre portas (ver agent-compatibility.md); líder comita com atribuição e roda e2e.
- Tema claro e telas móveis (exceto biblioteca) sem frame: derivados. Sem baselines `toHaveScreenshot` ainda (só evidência revisada).
- TDD: infraestrutura de mocks (3e90ea6) teve testes depois do código; compensado por mutações.
