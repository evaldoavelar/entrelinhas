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
| TASK-012 biblioteca | `1c002d0`…`e8afeeb`, merge `eee4a98`, pós-merge `cc0e725`+teste isolado | Codex r1/r2 reprovadas (6 achados corrigidos com RED); r3 Codex interrompida (limite); **r3 agy aprovada** (`.omc/reviews/TASK-012-r3-agy.txt`) |
| TASK-010 login casa/perfil | `44379c2` (worker Codex), `e6db425`, `6149a72`, merge `68e3852` | aprovado (r2; `.omc/reviews/TASK-010-r2.txt`) |
| TASK-013 busca global | `a6e6c2f`…`5bfda5a`, merge `9886b83` | agy r1/r2 reprovadas (7 achados corrigidos com RED); **r3 agy aprovada** (`.omc/reviews/TASK-013-r3-agy.txt`). Verify verde na `main`: 202 testes, 60 e2e; gate diff 100% linhas / 91,4% branches. Teste de tema do shell (flaky) corrigido. |
| TASK-005 shell/router/tema | `2957501`, `54d6caa`, `a0bf97f`, `d7cda13` | aprovado (4ª rodada, `.omc/reviews/TASK-005-r4.txt`) |

Último `npm run verify` verde na `main` (merge TASK-012 + correção do teste de tema): 183 testes frontend + contracts + api-client, cobertura frontend 96,7% stmts / 90,3% branches, bundle sem MSW, 52 e2e (4 projetos) com baselines revisadas de login e biblioteca.

## Em aberto

| Tarefa | Estado | Onde | Pendência concreta |
| --- | --- | --- | --- |
| TASK-011 login admin | review — implementado pelo **agy** (`a239257`), revisado pelo Claude (aprovado), integrado na branch pelo líder (`c5a1285`: rotas, e2e, baselines) | branch `task/TASK-011-admin-login`, worktree `../entrelinhas-wt/TASK-011` | Falta revisão independente das mudanças do líder (Codex após 15:04 — limite de uso). verify verde (155 testes, 40 e2e). |
| TASK-014 detalhe do site | review — worker agy entregou (`d38df19`, comitado pelo líder); **revisão do líder reprovou** (4 achados) | branch `task/TASK-014-site-detail`, worktree `../entrelinhas-wt/TASK-014` | Após integrar TASK-013: mesclar `main`, reusar `usePagedList`, PAGE_SIZE 4 + fixtures do Horizonte (12), cursor por site, a11y; ligar rota; e2e/baselines. |

## Limitações vigentes

- Toggle de tema do `AppShell` não tratava falha ao salvar: corrigido em `cf44555`/`cc0e725`, aprovado pelo agy.

- Todo comportamento de servidor é **simulado** (MSW). Nada de backend, sandbox, TLS, Telegram, Push, MCP ou agy-runner existe.
- agy liberado e verificado (skills, AGENTS.md, leitura de PNG); escrita em worktree/porta ainda não verificadas.
- Worker Codex: sandbox não comita em worktree nem abre portas (ver agent-compatibility.md); líder comita com atribuição e roda e2e.
- Tema claro e telas móveis (exceto biblioteca) sem frame: derivados. Baselines `toHaveScreenshot` revisadas: login (TASK-010) e biblioteca (TASK-012). `e2e/shell.spec.ts` grava evidência só em `test-results` (corrigido na TASK-012).
- TDD: infraestrutura de mocks (3e90ea6) teve testes depois do código; compensado por mutações.
