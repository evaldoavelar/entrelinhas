# Ordem de execução

Dependências são entre IDs de tarefa (`docs/tasks/`). "Serializado" = arquivo de dono único (AGENTS.md): só uma tarefa por vez.

## Recursos compartilhados serializados

| Recurso | Dono | Tarefas que alteram |
| --- | --- | --- |
| `package.json` raiz, `package-lock.json`, configs de lint/ts/vitest/playwright | líder | TASK-001 (depois só via pedido) |
| `packages/contracts/**` | líder | TASK-002; ampliações por tarefa de contrato do líder antes da tela dependente |
| `packages/api-client/**`, `apps/frontend/src/mocks/{server,browser,scenario}.ts` | líder | TASK-003 |
| `apps/frontend/src/theme/**`, fontes | líder | TASK-004 |
| `apps/frontend/src/app/{router,AppShell}*` | líder | TASK-005; telas registram rotas via pedido ao líder na integração |
| `.github/workflows/**` | líder | TASK-001 |
| baselines `tests/e2e/**/*-snapshots/**` | revisor da tarefa | uma tarefa por vez por arquivo de spec |

Workers de tela criam arquivos novos em `apps/frontend/src/features/<feature>/**`, handlers em `apps/frontend/src/mocks/handlers/<feature>.ts` e specs em `tests/e2e/<feature>.spec.ts`. Registro de rota/handler em índices compartilhados é feito pelo líder na integração.

## Ondas

**Onda 0 — sequencial, líder (Claude):** TASK-001 → TASK-002 → TASK-003 → TASK-004 → TASK-005. Fundação: tudo depende dela. Não paralelizável (lockfile, contratos, tokens, router).

**Onda 1 — paralela (máx. 2 workers), após TASK-005 integrada:**

| Tarefa | Implementa | Revisa | Arquivos próprios | Depende |
| --- | --- | --- | --- | --- |
| TASK-010 Login casa/perfil | Codex | Claude | `features/auth/**` | 005 |
| TASK-012 Biblioteca (3 modos, filtros, ordenação, mobile) | Claude | Codex | `features/library/**` | 005 |

**Onda 2 — paralela:** TASK-011 admin login (Codex; dep. 010 por compartilhar `features/auth`) · TASK-013 busca global (Claude; dep. 012) · TASK-014 detalhe do site (Codex; dep. 012 — reusa ArticleRow? não: ArticleRow nasce em 014 e é extraído para `components/` pelo líder).

**Onda 3+ (S03–S08):** ver `docs/sprints/`. Regras: S03 antes de S04/S07 (player/artigo); S05 e S06 podem correr em paralelo entre si após S02 (features distintas); S08 (extensão, outro workspace) pode correr em paralelo a S03–S07 a partir de S01, mas usa o mesmo `packages/contracts` → ampliações de contrato para a extensão (pairings/imports/captures) são feitas pelo líder antes.

## Bloqueios atuais

| Bloqueio | Afeta | Desbloqueio | Alternativa |
| --- | --- | --- | --- |
| agy sem confirmação de termos/plano | atribuição ao agy | usuário confirma modalidade suportada | Claude/Codex |
| G0-B (host real) | S10+ backend | evidência por item da skill `backend-security-gate` | seguir frontend |
| Sem frame para tema claro/mobile geral | fidelidade dessas variantes | — | derivação documentada em prototype-map |
