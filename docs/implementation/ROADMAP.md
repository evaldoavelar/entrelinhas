# Roadmap

Ordem vigente: ADR-12 (frontend primeiro, HTTP mockado). Incrementos verificáveis, sem datas: o ritmo de trabalho de IA ainda não foi medido.

| Sprint | Objetivo | Frames | Saída verificável | Depende de |
| --- | --- | --- | --- | --- |
| S00 Bootstrap | Git, AGENTS/skills, ADR-12, compatibilidade, planejamento | — | commits `733e0b7`, `54285dd` + docs de planejamento | — |
| S01 Fundação (G0-F) | Harness monorepo, contratos/enums, cliente HTTP + MSW, tokens/tema/fontes, AppShell + router, CI | 01 (shell), 26 | `npm run verify` verde; drift de enums testado; app abre com MSW e sem rede | S00 |
| S02 Acesso e biblioteca | Login casa/perfil, login admin, biblioteca 3 modos/busca/categoria/ordenação/carregar mais, busca global, detalhe do site, mobile | 01–04, 15, 16, 18, 26, 27 | jornadas Playwright + screenshots Dracula/Claro desktop/móvel | S01 |
| S03 Importação e player | Adicionar URL, categoria de site novo, progresso, falha/retry, detalhe/player, barra do player com fixture de áudio, categorias | 05, 13, 14, 31, 33, 34 | estados de import canônicos; player retoma/velocidade/fila/download | S02 |
| S04 Playlists e fontes | Playlists (criar/renomear/ordenar/indisponível), fontes monitoradas | 06, 07, 08, 17 | CA20/CA26 simulados | S03 |
| S05 Privacidade e avisos | Desbloqueio PIN, capturas privadas, preferências do perfil, central de notificações | 20, 21, 29, 37 | CA112/CA117 (UI) simulados; permissão de notificação negada | S02 (S03 para "Ouvir") |
| S06 Administração | Imagens, voz/limpeza, integrações, pareamentos, quotas, Telegram, confirmação sensível | 09–12, 19, 28, 35, 36 | confirmação individual exigida em toda mutação sensível | S02 |
| S07 Compartilhamento | Criar/revogar link, página pública | 22, 30 | página pública sem shell/biblioteca; expirado/revogado | S03 |
| S08 Extensão (UI) | Projeto MV3: popup, resultados, preview de captura, opções/pareamento contra contrato mockado | 23, 24, 25, 32 | Playwright com extensão carregada em Chromium bundled; mocks no limite HTTP | S01 |
| S09 FRONTEND-MOCK-COMPLETE | Matriz visual completa, a11y/teclado, revisão final de fidelidade, traceability simulado×real | todos | marco declarado com evidência | S02–S08 |
| S10+ Backend | Implementação real (FastAPI/PostgreSQL) seguindo contratos + conformance tests | — | — | S09 **e** G0-B |

## Marcos

- **G0-F** (fim de S01): ferramentas, repo, contratos, harness e execução isolada com dados fictícios.
- **FRONTEND-MOCK-COMPLETE** (fim de S09): definido em `PROMPT`/ADR-12 — todas as telas/jornadas, estados exercitados, sem rede externa, testes/cobertura/build verdes, temas/responsividade/teclado e fidelidade revisada com evidência; rastreabilidade distingue simulado de real.
- **G0-B** (independente, host real): skill `backend-security-gate`. Bloqueia S10+.

## Fora do escopo das sprints de frontend

Backend real, sandbox, TLS, Telegram real, Web Push real, MCP, agy-runner do produto. As telas existem; a garantia não.
