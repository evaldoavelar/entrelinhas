# STATUS

Fonte consolidada de progresso. Conferir sempre contra `git log`/`git worktree list` (RESUME.md).

**Atualizado:** 27/10/2026 · **Sprint atual:** S01 Fundação · **Marco:** G0-F em andamento (TASK-004 parte 2 e TASK-005 restantes).

## Commits relevantes

| Item | Commit | Verificação |
| --- | --- | --- |
| Initial commit (vazio) | `733e0b7` | — |
| Bootstrap (AGENTS/CLAUDE, skills, specs, ADR-12, prototype) | `54285dd` | `validate-skills.sh` OK, teste negativo |
| Planejamento + compatibilidade + prototype-map | `a4f4e70` | 37 frames abertos; Codex sonda OK; agy bloqueado |
| TASK-001 harness | `6cb3b22` + correções `c62f027`, `83043f5` | Codex: reprovado 2×, **aprovado** na 3ª revisão |
| TASK-002 contracts | `1af70b8` + `83043f5` | Codex: reprovado 1×, **aprovado** |
| TASK-003 api-client + MSW | `3e90ea6`, `142f1d0`, `869e253`, guard `/v1` (commit seguinte) | Codex: reprovado 2× (último achado: prefixo `/v1` corrigido); **re-revisão pendente** |
| TASK-004 parte 1: tokens + contraste | `94dcddf` | 72 testes de contraste; revisão pendente |

Último `npm run verify` verde na `main` após o guard `/v1`: contracts 100%, api-client 98.6% stmts/96.8% branches, frontend 90.1%/89.1%; bundle de produção sem MSW; 8 e2e (4 projetos). Clean checkout em worktree descartável: `npm ci && verify` exit 0 (em `142f1d0`).

## Tarefas

| Tarefa | Estado | Implementa/Revisa |
| --- | --- | --- |
| TASK-001 | done | Claude/Codex |
| TASK-002 | done | Claude/Codex |
| TASK-003 | review (re-revisão do guard `/v1`) | Claude/Codex |
| TASK-004 | running (falta: fontes locais, componentes base, testes a11y) | Claude/Codex |
| TASK-005 | planned | Claude/Codex |
| TASK-010..014 | planned (onda 1 após TASK-005) | ver SPRINT-02 |

## Limitações vigentes

- Todo comportamento de servidor é **simulado** (MSW). Nada de backend, sandbox, TLS, Telegram, Push, MCP ou agy-runner existe.
- agy bloqueado como worker (termos/plano não confirmados pelo usuário).
- Tema claro e telas móveis (exceto biblioteca) sem frame: derivados.
- TDD: infraestrutura de mocks (3e90ea6) teve testes escritos depois do código; compensado por mutações.
- Gate de diff no CI só exercitado por testes unitários (sem PR real ainda).
