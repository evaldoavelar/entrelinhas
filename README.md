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

Atualizados quando o harness existir (TASK-001). Agentes: `scripts/agents/validate-skills.sh` valida as skills compartilhadas.
