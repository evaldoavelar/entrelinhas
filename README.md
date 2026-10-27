# Entrelinhas — leitor de blogs em áudio

Nome provisório. Especificação em `docs/specs/`; política para agentes e pessoas em `AGENTS.md`.

**Estado:** frontend em construção contra API mockada (ADR-12). Não há backend real: autorização, processamento, áudio, isolamento e notificações são **simulados**.

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `apps/frontend` | Web app React + TypeScript + Vite |
| `apps/browser-extension` | Extensão Chromium MV3 (projeto próprio) |
| `packages/contracts` | Schemas/enums canônicos do contrato HTTP v1 |
| `packages/api-client` | Cliente HTTP único (mock e real usam o mesmo) |
| `services/backend` | Backend real — bloqueado até FRONTEND-MOCK-COMPLETE + G0-B |
| `infra` | PoCs de infraestrutura (G0-B) |
| `tests/e2e` | Playwright |
| `prototype` | Frames PNG exportados (referência visual obrigatória) e `.figcraft` |
| `docs/{specs,adr,design,implementation,sprints,tasks}` | Documentação |

## Comandos

Requer Node ≥ 24 e npm. Sem dependências globais.

| Comando | Faz |
| --- | --- |
| `npm ci` | instala exatamente o lockfile |
| `npx playwright install chromium` | baixa o Chromium do Playwright (uma vez) |
| `npm run dev -w apps/frontend` | app em desenvolvimento com API mockada (MSW) |
| `npm run lint` / `npm run typecheck` | ESLint (inclui jsx-a11y e proibição de innerHTML) / TypeScript estrito |
| `npm test` | testes unitários de todos os workspaces + testes do gate de cobertura |
| `npm run test:coverage` | cobertura por projeto com gate ADR-10 (> 80% estrito; `COVERAGE_BASE=<ref>` ativa o gate do diff) |
| `npm run build` | build de produção do frontend |
| `npm run e2e` | Playwright (Dracula/Claro desktop 1440×1000, móvel 390×1100) sobre o build |
| `npm run verify` | tudo acima, na ordem do CI |
| `scripts/agents/validate-skills.sh` | valida skills compartilhadas e links `.claude/skills` |

Baselines de screenshot nunca são atualizadas automaticamente: `--update-snapshots` só com revisão (skill `playwright-regression`).
