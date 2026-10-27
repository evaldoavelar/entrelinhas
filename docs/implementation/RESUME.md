# Como retomar

1. **Estado real primeiro:** `git status --short --branch`, `git log --oneline -15`, `git worktree list`, `ls ../entrelinhas-wt 2>/dev/null`. Status escrito pode estar defasado.
2. Leia `docs/implementation/STATUS.md` e a sprint atual em `docs/sprints/`.
3. Para cada worktree existente: há commits na branch da tarefa? há handoff em `docs/tasks/handoffs/`? → revisar/integrar (skill `review-integrate`) antes de abrir trabalho novo.
4. Rode `npm ci && npm run verify` na `main` (quando o harness existir) para confirmar a base verde.
5. Escolha a próxima tarefa `ready` cujas dependências estão integradas (EXECUTION-ORDER.md). Máx. 2 workers.
6. Lançar worker Codex (exemplo):
   ```sh
   git worktree add ../entrelinhas-wt/TASK-XXX -b task/TASK-XXX-slug main
   (cd ../entrelinhas-wt/TASK-XXX && npm ci)
   codex exec -C ../entrelinhas-wt/TASK-XXX -s workspace-write \
     "Você é worker da TASK-XXX. Use as skills parallel-task, frontend-tdd e prototype-guided-ui. Leia docs/tasks/TASK-XXX.md e AGENTS.md. Implemente, comite na branch e escreva o handoff." < /dev/null
   # < /dev/null é obrigatório: sem ele `codex exec` fica esperando stdin indefinidamente (ocorrido em 27/10).
   ```
7. Após integrar: atualizar STATUS, traceability e este arquivo se o procedimento mudar.

Próximo passo concreto: ver a tabela "Em aberto" de STATUS.md (ordem sugerida: corrigir achado da TASK-005 → integrar TASK-010 → concluir TASK-012 → onda 2).

`PROMPT-PARA-CLAUDE.md` (raiz, fora do Git via `.git/info/exclude`) contém a instrução original do usuário.
