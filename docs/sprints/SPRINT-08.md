# SPRINT-08 — Extensão (UI contra contrato mockado)

Projeto separado `apps/browser-extension` (MV3, Chromium). Instalação/permissões/captura reais exigem testes do browser próprio (CA88) — Playwright com Chromium bundled e contexto persistente descartável.

| Tarefa | Título | Frames | Depende |
| --- | --- | --- | --- |
| TASK-069 | Contrato extensão: pairings, extension/context, imports, captures (líder) | — | 003 |
| TASK-070 | Popup + resultados de envio (estados locais separados dos enums) | 23, 32 | 069 |
| TASK-071 | Prévia de captura (texto editável, rota local, "manter esta privada") | 24 | 070 |
| TASK-072 | Opções: servidor HTTPS, testar conexão, pareamento por código, token manual, persistente/temporário | 25 | 070 |
