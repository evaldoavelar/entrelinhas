# Rastreabilidade de requisitos

Colunas: requisito → tarefas → testes → estado → natureza da evidência. **simulado** = comportamento demonstrado na UI sobre MSW (não é prova de segurança/integração, ADR-12). **real pendente** = depende de backend/infra (S10+, G0-B). Testes são preenchidos na integração de cada tarefa (arquivo:caso).

## Diretrizes de desenvolvimento

| ID | Onde | Evidência |
| --- | --- | --- |
| RD01–RD03, RD06 | todas as tarefas (frontend-tdd) | registro RED/GREEN nos handoffs |
| RD04–RD05 | TASK-003 (MSW sem rede, sem dados pessoais) | `onUnhandledRequest: 'error'` |
| RD07, RD09 | TASK-001 (gate de cobertura) | testes do script de gate |
| RD08 | TASK-001 (Playwright), TASK-090 | baselines revisadas |

## Requisitos funcionais

| RF | Tarefas | Testes | Estado | Natureza |
| --- | --- | --- | --- | --- |
| RF01 | TASK-020 | — | planned | simulado na UI |
| RF02 | S10+ | — | planned | real pendente |
| RF03 | S10+ | — | planned | real pendente |
| RF04 | TASK-012 | `features/library/LibraryPage.test.tsx`, `useSites.test.ts`, `e2e/library.spec.ts` | done | simulado na UI |
| RF05 | TASK-012 | `features/library/LibraryPage.test.tsx`, `useSites.test.ts`, `e2e/library.spec.ts` | done | simulado na UI |
| RF06 | TASK-012 (exibição); S10+ (regra) | — | planned | real pendente |
| RF07 | TASK-012, TASK-014 | TASK-014: `features/site/*.test.*`, `mocks/handlers/site.test.ts`, `e2e/site.spec.ts` | integrado (`c07dfd0`) | simulado na UI |
| RF08 | TASK-031 | — | planned | simulado na UI |
| RF09 | S10+ | — | planned | real pendente |
| RF10 | TASK-031 (aviso); S10+ | — | planned | real pendente |
| RF11 | TASK-021 (exibição); S10+ | — | planned | real pendente |
| RF12 | TASK-021 (exibição); S10+ | — | planned | real pendente |
| RF13 | TASK-021 (capa genérica); S10+ | — | planned | real pendente |
| RF14 | S10+ | — | planned | real pendente |
| RF15 | TASK-012 | `features/library/LibraryPage.test.tsx`, `useSites.test.ts`, `e2e/library.spec.ts` | done | simulado na UI |
| RF16 | TASK-012 | `features/library/LibraryPage.test.tsx`, `useSites.test.ts`, `e2e/library.spec.ts` | done | simulado na UI |
| RF17 | TASK-012, TASK-013 | TASK-012: `features/library/LibraryPage.test.tsx`, `useSites.test.ts`, `e2e/library.spec.ts` (busca na biblioteca); TASK-013: `features/search/SearchPage.test.tsx`, `mocks/handlers/search.test.ts`, `e2e/search.spec.ts` | integrado (`9886b83`) | simulado na UI |
| RF18 | TASK-051 | — | planned | simulado na UI |
| RF19 | TASK-021 | — | planned | simulado na UI |
| RF20 | TASK-051 | — | planned | simulado na UI |
| RF21 | TASK-051 (config UI); S10+ fase 7 | — | planned | real pendente |
| RF22 | TASK-051 (UI); S10+ | — | planned | real pendente |
| RF23 | TASK-020 | — | planned | simulado na UI |
| RF24 | TASK-014, TASK-021 | TASK-014: `features/site/SiteDetailPage.test.tsx`, `e2e/site.spec.ts` | parcial (TASK-021 pendente) | simulado na UI |
| RF25 | TASK-050 | — | planned | simulado na UI |
| RF26 | TASK-021 (exibição); S10+ | — | planned | real pendente |
| RF27 | TASK-020, TASK-051 | — | planned | simulado na UI |
| RF28 | TASK-051 (UI); S10+ | — | planned | real pendente |
| RF29 | TASK-051 | — | planned | simulado na UI |
| RF30 | S10+ | — | planned | real pendente |
| RF31 | TASK-050 (UI); S10+ | — | planned | real pendente |
| RF32 | TASK-050 | — | planned | simulado na UI |
| RF33 | TASK-050 (UI); S10+ | — | planned | real pendente |
| RF34 | TASK-001..005 (navegador); S10+ (Docker) | — | planned | real pendente |
| RF35 | TASK-030 | — | planned | simulado na UI |
| RF36 | TASK-030 | — | planned | simulado na UI |
| RF37 | TASK-012 | `features/library/LibraryPage.test.tsx`, `useSites.test.ts`, `e2e/library.spec.ts` | done | simulado na UI |
| RF38 | TASK-012 | `features/library/LibraryPage.test.tsx`, `useSites.test.ts`, `e2e/library.spec.ts` | done | simulado na UI |
| RF39 | TASK-012 | `features/library/LibraryPage.test.tsx`, `useSites.test.ts`, `e2e/library.spec.ts` | done | simulado na UI |
| RF40 | TASK-004 | — | planned | simulado na UI |
| RF41 | TASK-005 | `app/shell.test.tsx`, `e2e/shell.spec.ts` | done | simulado na UI |
| RF42 | TASK-010 | `features/auth/LoginPage.test.tsx`, `app/shell.test.tsx` (/login route), `e2e/login.spec.ts` | done | simulado na UI |
| RF43 | TASK-010, TASK-030 | TASK-010: `LoginPage.test.tsx` (avatar não desbloqueia privadas), `e2e/login.spec.ts` | parcial (TASK-030 pendente) | simulado na UI |
| RF44 | TASK-060, TASK-061 | — | planned | simulado na UI |
| RF45 | TASK-012, TASK-020 | TASK-012: `features/library/LibraryPage.test.tsx`, `useSites.test.ts`, `e2e/library.spec.ts` (filtro de categoria) | parcial (TASK-020 pendente) | simulado na UI |
| RF46 | TASK-022 | — | planned | simulado na UI |
| RF47 | TASK-060 | — | planned | simulado na UI |
| RF48 | S10+ fase 7 | — | planned | real pendente |
| RF49 | S10+ fase 7 | — | planned | real pendente |
| RF50 | S10+ fase 7 | — | planned | real pendente |
| RF51 | TASK-013 (render seguro); S10+ | — | planned | real pendente |
| RF52 | S10+ fase 7 | — | planned | real pendente |
| RF53 | S10+ fase 7 | — | planned | real pendente |
| RF54 | S10+ | — | planned | real pendente |
| RF55 | S10+ (G0-B) | — | planned | real pendente |
| RF56 | S10+ (G0-B) | — | planned | real pendente |
| RF57 | S10+ fase 5 | — | planned | real pendente |
| RF58 | TASK-011, TASK-053 | — | planned | simulado na UI |
| RF59 | TASK-052 | — | planned | simulado na UI |
| RF60 | TASK-030 (indisponível); S10+ | — | planned | real pendente |
| RF61 | TASK-070 | — | planned | simulado na UI |
| RF62 | TASK-072 | — | planned | simulado na UI |
| RF63 | TASK-052, TASK-072 | — | planned | simulado na UI |
| RF64 | TASK-070 | — | planned | simulado na UI |
| RF65 | TASK-070..072 (adapter) | — | planned | simulado na UI |
| RF66 | TASK-071 | — | planned | simulado na UI |
| RF67 | S10+ | — | planned | real pendente |
| RF68 | TASK-071 | — | planned | simulado na UI |
| RF69 | TASK-071 | — | planned | simulado na UI |
| RF70 | S10+ | — | planned | real pendente |
| RF71 | TASK-041 | — | planned | simulado na UI |
| RF72 | TASK-041 | — | planned | simulado na UI |
| RF73 | S10+ | — | planned | real pendente |
| RF74 | TASK-052 (UI); S10+ fase 6 | — | planned | real pendente |
| RF75 | S10+ fase 6 | — | planned | real pendente |
| RF76 | TASK-052 (UI); S10+ | — | planned | real pendente |
| RF77 | TASK-052 (UI); S10+ | — | planned | real pendente |
| RF78 | TASK-052 (UI); S10+ | — | planned | real pendente |
| RF79 | TASK-042 | — | planned | simulado na UI |
| RF80 | TASK-041 (opt-in UI); S10+ | — | planned | real pendente |
| RF81 | TASK-070 | — | planned | simulado na UI |
| RF82 | TASK-071 (escolha); S10+ | — | planned | real pendente |
| RF83 | TASK-040, TASK-042 | — | planned | simulado na UI |
| RF84 | TASK-052 (UI); S10+ | — | planned | real pendente |

## Critérios de aceite

CA de UI são vinculados às tarefas nos contratos (`docs/tasks/`). CAs de isolamento, rede, sandbox, TLS, leases, spool, restore, Telegram e agy (CA10, CA24, CA35–CA66, CA68, CA72 parcial, CA113, CA115, CA116) permanecem **real pendente** até S10+/G0-B; mocks não os satisfazem.
