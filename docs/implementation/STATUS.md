# STATUS

Fonte consolidada de progresso. Conferir sempre contra `git log`/`git worktree list` (RESUME.md).

**Atualizado:** 27/10/2026 (sessão 2) · **Sprint:** S01 concluída · S02 onda 1 em andamento · **Marco G0-F:** atingido em `d7cda13` (S01 inteira aprovada, verify verde).

## Concluído e aprovado por revisão Codex (na `main`)

| Tarefa | Commits | Revisão |
| --- | --- | --- |
| Bootstrap/planejamento | `733e0b7`, `54285dd`, `a4f4e70` | — |
| TASK-001 harness + gate ADR-10 | `6cb3b22`, `c62f027`, `83043f5` | aprovado (3ª rodada) |
| TASK-002 contracts | `1af70b8`, `83043f5` | aprovado |
| TASK-003 api-client + MSW | `3e90ea6`, `142f1d0`, `869e253`, `1640572` | aprovado |
| TASK-004 tokens + componentes | `94dcddf`, `9519f4c`, `2957501` | aprovado |
| TASK-010 login casa/perfil | `44379c2` (worker Codex), `e6db425`, `6149a72`, merge `68e3852` | aprovado (r2; `.omc/reviews/TASK-010-r2.txt`) |
| TASK-005 shell/router/tema | `2957501`, `54d6caa`, `a0bf97f`, `d7cda13` | aprovado (4ª rodada, `.omc/reviews/TASK-005-r4.txt`) |

Último `npm run verify` verde na `main` (`68e3852`): 143 testes frontend + contracts + api-client, cobertura frontend 95% stmts / 90.42% branches, bundle de produção sem MSW, 28 e2e (4 projetos), baselines `toHaveScreenshot` do login revisadas.

## Em aberto

| Tarefa | Estado | Onde | Pendência concreta |
| --- | --- | --- | --- |
| TASK-012 biblioteca | review — r1 **reprovado** (4 achados, corrigidos em `e393af0`), r2 em andamento | branch `task/TASK-012-library` (`e393af0`), worktree `../entrelinhas-wt/TASK-012` | CSS, e2e e 16 baselines revisadas prontos; `main` mesclada com TASK-010; verify verde (176 testes, 52 e2e). Após aprovação: integrar. Handoff `docs/tasks/handoffs/TASK-012.md`. |
| TASK-011 login admin | running — **worker agy** (1ª tarefa do agy) | branch `task/TASK-011-admin-login`, worktree `../entrelinhas-wt/TASK-011` | Aguardar handoff; líder revisa, roda e2e, gera/revisa baselines, liga `/admin/login` e cria `/admin`. Verificar se o agy conseguiu comitar (`--add-dir .git`). |
| TASK-013, 014 | planned | — | dependem da TASK-012 integrada |

## Limitações vigentes

- Toggle de tema do `AppShell` não tratava falha ao salvar (análogo ao #3 da revisão r1 da TASK-012): corrigido com teste RED; revisão Codex pendente.

- Todo comportamento de servidor é **simulado** (MSW). Nada de backend, sandbox, TLS, Telegram, Push, MCP ou agy-runner existe.
- agy liberado e verificado (skills, AGENTS.md, leitura de PNG); escrita em worktree/porta ainda não verificadas.
- Worker Codex: sandbox não comita em worktree nem abre portas (ver agent-compatibility.md); líder comita com atribuição e roda e2e.
- Tema claro e telas móveis (exceto biblioteca) sem frame: derivados. Baselines `toHaveScreenshot`: só login (TASK-010). `e2e/shell.spec.ts` (TASK-005) ainda grava evidência por cima de arquivo versionado — mesmo defeito apontado na revisão da TASK-010; converter para baseline revisada (líder).
- TDD: infraestrutura de mocks (3e90ea6) teve testes depois do código; compensado por mutações.
