---
name: review-integrate
description: Independently review a worker's task branch (scope, tests, evidence, visual fidelity) and integrate it into main with conflict resolution and post-merge checks. Use when a task is in review state.
---

# review-integrate

**Quando usar:** tarefa em `review`; integrar branch na `main`.

**Entradas:** branch `task/TASK-XXX-*`, handoff, `docs/tasks/TASK-XXX.md`.

**Passos**
1. Revisor ≠ implementador sempre que houver outro agente disponível.
2. Escopo: `git diff --name-only main...task/TASK-XXX-*` só com arquivos permitidos.
3. Releia o diff: correção, segurança (sem innerHTML, sem fetch fora do api-client, sem segredo), enums canônicos, acessibilidade.
4. Reexecute os comandos do handoff; não confie em resumo. Teste citado e não executado = rejeitar.
5. UI: abra o frame e o screenshot da app; confirme comparação.
6. Integre: `git merge --no-ff` na `main` (local). Conflito: resolva com contexto das duas tarefas.
7. Rode a suíte completa na `main` integrada. Falhou após integrar → não é `done`.
8. Atualize STATUS/traceability/RESUME; remova o worktree.

**Saídas:** merge commit + status atualizado, ou rejeição com motivos.

**Verificação:** checks verdes no hash integrado registrado em `STATUS.md`.
