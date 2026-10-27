# STATUS

Fonte consolidada de progresso. Conferir sempre contra `git log`/`git worktree list` (RESUME.md).

**Atualizado:** 27/10/2026 · **Sprint atual:** S01 concluída no código (revisão de TASK-005 pendente) · S02 onda 1 iniciada · **Marco:** G0-F atingido quando a revisão de TASK-005 aprovar.

## Commits relevantes

| Item | Commit | Verificação |
| --- | --- | --- |
| Initial commit (vazio) | `733e0b7` | — |
| Bootstrap (AGENTS/CLAUDE, skills, specs, ADR-12, prototype) | `54285dd` | `validate-skills.sh` OK, teste negativo |
| Planejamento + compatibilidade + prototype-map | `a4f4e70` | 37 frames abertos; Codex sonda OK; agy bloqueado |
| TASK-001 harness | `6cb3b22` + correções `c62f027`, `83043f5` | Codex: reprovado 2×, **aprovado** na 3ª revisão |
| TASK-002 contracts | `1af70b8` + `83043f5` | Codex: reprovado 1×, **aprovado** |
| TASK-003 api-client + MSW | `3e90ea6`, `142f1d0`, `869e253`, guard `/v1` (commit seguinte) | Codex: reprovado 2× (último achado: prefixo `/v1` corrigido); **re-revisão pendente** |
| TASK-004 tokens + componentes | `94dcddf`, `9519f4c`, correções em `2957501` | Codex: tokens reprovado (borda) → corrigido; componentes reprovado (Badge, describedby, outline/IconButton) → corrigido; re-revisão junto com TASK-005 |
| TASK-005 shell/router/tema | `2957501` | 127 unit + 16 e2e verdes; evidência visual vs frame 01; revisão Codex em andamento |
| PW_PORT + instruções TASK-010 | `71af9e5` | — |

Último `npm run verify` verde na `main` (`2957501`): contracts 100%, api-client 98.6% stmts/96.8% branches, frontend 93.8%/91.1%; bundle de produção sem MSW; 16 e2e (4 projetos). Clean checkout em worktree descartável: `npm ci && verify` exit 0 (em `142f1d0`).

## Tarefas

| Tarefa | Estado | Implementa/Revisa |
| --- | --- | --- |
| TASK-001 | done | Claude/Codex |
| TASK-002 | done | Claude/Codex |
| TASK-003 | done (aprovado após guard `/v1`, `1640572`) | Claude/Codex |
| TASK-004 | review | Claude/Codex |
| TASK-005 | review | Claude/Codex |
| TASK-010 | running — worker **Codex** em `../entrelinhas-wt/TASK-010`, branch `task/TASK-010-login` (base `71af9e5`) | Codex/Claude |
| TASK-012 | ready (Claude) | Claude/Codex |
| TASK-011, 013, 014 | planned (onda 2) | ver SPRINT-02 |

## Limitações vigentes

- Todo comportamento de servidor é **simulado** (MSW). Nada de backend, sandbox, TLS, Telegram, Push, MCP ou agy-runner existe.
- agy bloqueado como worker (termos/plano não confirmados pelo usuário).
- Tema claro e telas móveis (exceto biblioteca) sem frame: derivados.
- TDD: infraestrutura de mocks (3e90ea6) teve testes escritos depois do código; compensado por mutações.
- Gate de diff no CI só exercitado por testes unitários (sem PR real ainda).
