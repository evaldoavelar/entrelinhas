---
name: parallel-task
description: Execute one Entrelinhas task in its own git worktree/branch with strict file scope and produce an evidence-based handoff. Use when you are a worker assigned TASK-XXX.
---

# parallel-task

**Quando usar:** você recebeu uma tarefa `TASK-XXX` para implementar ou revisar.

**Entradas:** `docs/tasks/TASK-XXX.md`, o worktree indicado, `AGENTS.md`.

**Passos**
1. Confirme isolamento: `pwd` deve ser o worktree da tarefa; `git branch --show-current` = `task/TASK-XXX-*`; `git rev-parse HEAD` = base declarada (ou descendente seu).
2. Leia a tarefa inteira, incluindo arquivos permitidos/proibidos. Não toque fora do escopo; registre a necessidade no handoff.
3. Instale dependências só dentro do worktree (`npm ci`); não altere lockfile salvo se a tarefa permitir explicitamente.
4. Trabalhe em TDD (skill `frontend-tdd`). UI: skill `prototype-guided-ui`.
5. Rode os comandos de verificação da tarefa e guarde a saída real.
6. Commit na branch da tarefa (Conventional Commits, `TASK-XXX` no corpo). Não faça merge na `main`, não faça push.
7. Escreva o handoff em `docs/tasks/handoffs/TASK-XXX.md` (formato em `AGENTS.md` § Handoff).

**Saídas:** commit(s) na branch da tarefa + handoff.

**Verificação:** `git diff --name-only <base>..HEAD` contém só arquivos permitidos; comandos do handoff reexecutáveis pelo líder com o mesmo resultado.
