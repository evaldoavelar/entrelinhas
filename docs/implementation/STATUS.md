# STATUS

Fonte consolidada de progresso. Conferir sempre contra `git log`/`git worktree list` (RESUME.md).

**Atualizado:** 27/10/2026 · **Sprint atual:** S01 Fundação · **Marco:** G0-F em andamento.

## Concluído

| Item | Commit | Verificação |
| --- | --- | --- |
| Initial commit (vazio) | `733e0b7` | `git log` |
| Bootstrap: AGENTS/CLAUDE, 8 skills + probe, scripts, specs+proveniência, ADR-12, prototype | `54285dd` | `scripts/agents/validate-skills.sh` OK (inclusive teste negativo) |
| Compatibilidade de agentes | (commit de planejamento) | Codex sonda OK; Claude descobre skills; agy bloqueado |
| Planejamento: roadmap, ordem, sprints, tarefas S01/S02, prototype-map (37 frames inspecionados), traceability | (commit de planejamento) | — |

## Tarefas

| Tarefa | Estado | Implementa/Revisa | Commit integrado |
| --- | --- | --- | --- |
| TASK-001 | ready | Claude/Codex | — |
| TASK-002..005 | planned | Claude/Codex | — |
| TASK-010..014 | planned | ver SPRINT-02 | — |

## Limitações vigentes

- Todo comportamento de servidor é **simulado** (MSW). Nada de backend, sandbox, TLS, Telegram, Push, MCP ou agy-runner existe.
- agy bloqueado como worker (termos/plano não confirmados).
- Tema claro e telas móveis (exceto biblioteca) sem frame: derivados.
