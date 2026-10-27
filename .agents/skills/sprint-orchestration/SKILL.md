---
name: sprint-orchestration
description: Decompose Entrelinhas work into sprints/tasks with explicit dependencies, assign implementer/reviewer, and resume from checkpoints. Use when planning, re-planning or resuming the backlog.
---

# sprint-orchestration

**Quando usar:** criar/ajustar sprints e tarefas, escolher a próxima tarefa `ready`, retomar após interrupção.

**Entradas:** `docs/specs/*`, `docs/adr/*`, `docs/design/prototype-map.md`, `docs/implementation/{ROADMAP,EXECUTION-ORDER,STATUS,RESUME}.md`, `git log`, `git worktree list`.

**Passos**
1. Confira o estado real primeiro: `git status`, `git log --oneline -20`, `git worktree list`. O status escrito pode estar desatualizado.
2. Cada tarefa em `docs/tasks/TASK-XXX.md` com: ID, objetivo observável, RF/CA/RD, dependências por ID, implementador/revisor, arquivos permitidos/proibidos, base, contrato/mocks, testes de aceite, comandos, evidência, (UI) frames por caminho+hash e viewport/estado.
3. Dependência é entre IDs de tarefa. Não marque paralelo o que toca o mesmo contrato, tokens, router, lockfile ou baseline, ou que depende de código não integrado.
4. Estados de desenvolvimento: `planned → ready → running → review → done`, ou `blocked` com critério de desbloqueio.
5. Atualize `STATUS.md`, `requirements-traceability.md` e `RESUME.md` após cada integração.

**Saídas:** arquivos de sprint/tarefa atualizados; próxima tarefa `ready` identificada.

**Verificação:** todo ID citado em dependências existe; nenhuma tarefa `done` sem commit integrado e evidência de checks.
