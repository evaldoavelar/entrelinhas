# TASK-004 — Tokens de tema, fontes e componentes base

- **Estado:** planned · **Implementa:** Claude · **Revisa:** Codex · **Sprint:** S01
- **Frames:** 01 (`c0af61b48c8cfc42…`), 26 (`fda947ccaa0da349…`), 08 (toggle), 19 (cores de estado) — hashes completos em `docs/design/prototype-map.md`.
- **Objetivo observável:** tokens CSS Dracula (amostrados dos frames) e Claro (derivado); Poppins + Source Serif 4 locais; componentes Button (primary/outline/danger/ghost), Card, Chip/Badge, Toggle (switch acessível), TextField, Select, Callout, IconButton, Avatar com testes de acessibilidade.
- **Requisitos:** RF40, RF41, CA27, CA80.
- **Arquivos permitidos:** `apps/frontend/src/theme/**`, `apps/frontend/src/components/**`, `apps/frontend/package.json` (deps de fontes — pedido ao dono do lockfile = líder, mesma tarefa).
- **Aceite:** contraste ≥4.5:1 para texto (teste automático sobre os pares de tokens), foco visível, Toggle com `role="switch"`/`aria-checked`; divergência de contraste do texto secundário registrada.
- **Comandos:** `npm run test -w apps/frontend`.
