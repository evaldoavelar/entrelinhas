# SPRINT-02 — Acesso e biblioteca

**Entrada:** G0-F (SPRINT-01 integrada e verde).
**Saída:** jornadas de login (casa/perfil, admin) e biblioteca completas com mocks; Playwright funcional + screenshots revisados Dracula/Claro desktop (1440×1000) e móvel (390×1100); RF04/05/15/16/17/37/38/39/40/41/42/45 (UI) simulados na traceability.

| Tarefa | Título | Implementa | Revisa | Depende | Frames |
| --- | --- | --- | --- | --- | --- |
| TASK-010 | Login senha da casa + perfil | Codex | Claude | 005 | 26 |
| TASK-011 | Login individual de administrador | Codex | Claude | 010 | 27 |
| TASK-012 | Biblioteca: cards/compactos/lista, busca, categoria, ordenação, carregar mais, mobile, preferência de modo | Claude | Codex | 005 | 01, 02, 03, 16, 18 |
| TASK-013 | Busca global com realce seguro | Claude | Codex | 012 | 15 |
| TASK-014 | Detalhe do site (artigos, filtros, ouvir/baixar) | Codex | Claude | 012 | 04 |

Paralelo: {010, 012} → {011, 013, 014}. Contratos necessários (sessão, perfis, sites, posts, busca) são entregues pelo líder em TASK-002/TASK-003 antes da onda.
