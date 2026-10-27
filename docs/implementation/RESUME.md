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

Próximo passo concreto (checkpoint 27/10, fim da sessão 2 — ver tabela "Em aberto" de STATUS.md):
1. ~~TASK-013~~ integrada (`9886b83`).
2. ~~TASK-014~~ integrada (`c07dfd0`).
3. **TASK-011** (`../entrelinhas-wt/TASK-011`, `c5a1285`): falta revisão independente das mudanças do líder (rotas `/admin/login` e `/admin`, e2e, CSS) — Codex (limite de uso em 27/10 até 15:04). Aprovado → integrar.
4. Depois: fechar SPRINT-02 (traceability, revisão de sprint) e seguir para SPRINT-03 (EXECUTION-ORDER.md).

Regras aprendidas na sessão 2: agy worker = `agy --mode accept-edits --sandbox --add-dir <repo>/.git -p "…" < /dev/null` (com `--mode auto` ele saiu do sandbox sozinho; com sandbox o git fica somente leitura e o líder comita com `Co-Authored-By: agy`); agy revisor = `agy --mode plan --sandbox -p "…" < /dev/null`; `-p` sempre por último. Rodar `npm run verify` e o gate `COVERAGE_BASE=main` **antes** de cada commit.

`PROMPT-PARA-CLAUDE.md` (raiz, fora do Git via `.git/info/exclude`) contém a instrução original do usuário.
