---
name: playwright-regression
description: Write and run Playwright E2E and visual regression for Entrelinhas (Dracula/Claro themes, desktop/mobile, keyboard), with deterministic data and reviewed baselines. Use for user journeys and visual checks.
---

# playwright-regression

**Quando usar:** jornada de usuário, regressão visual, teste de teclado/foco.

**Entradas:** cenário MSW, rota, viewport do frame, `tests/e2e/`.

**Passos**
1. App roda com MSW (sem backend); nenhuma rede externa (rotas não mockadas falham).
2. Determinismo: relógio fixo, fontes locais, animações desligadas (`reducedMotion`), dados fixos.
3. Projetos: `dark-desktop`, `light-desktop`, `dark-mobile`, `light-mobile` quando a tarefa exigir.
4. Screenshots: `toHaveScreenshot` com baseline gerada localmente, **revisada por humano/agente revisor** antes de commitar. Nunca `--update-snapshots` em CI ou para "fazer passar".
5. Teste flaky: corrija a causa; retry não é aceitação.
6. Evidência: guarde screenshots relevantes em `docs/design/evidence/<TASK>/`.

**Saídas:** specs em `tests/e2e/`, baselines revisadas.

**Verificação:** `npm run e2e` verde duas vezes seguidas sem retry.
