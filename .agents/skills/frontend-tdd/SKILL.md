---
name: frontend-tdd
description: RED/GREEN/REFACTOR workflow for the Entrelinhas React frontend with Vitest + Testing Library, covering accessibility and UI states (loading, empty, error, locked). Use for any frontend behavior change.
---

# frontend-tdd

**Quando usar:** qualquer comportamento novo ou bug no `apps/frontend` ou `apps/browser-extension`.

**Entradas:** critério de aceite (RF/CA) da tarefa, cenário MSW correspondente.

**Passos**
1. **RED:** escreva o teste do comportamento observável (Testing Library por papel/rótulo acessível, não por classe CSS). Rode e confirme que falha **pelo motivo esperado** (asserção), não por import/sintaxe. Registre a saída.
2. **GREEN:** implemente o mínimo para passar. Dados vêm do `api-client` real sobre MSW — nunca fixture importado no componente nem `if (mock)`.
3. **REFACTOR:** extraia componentes/tokens mantendo a suíte verde.
4. Cubra estados: carregando, vazio, erro (4xx/5xx/timeout), sucesso, perfil bloqueado quando aplicável.
5. Acessibilidade: nomes acessíveis, foco visível, navegação por teclado, sem informação só por cor.
6. Rode cobertura do projeto; o gate é > 80% (estrito) em linhas/branches/statements/funções.

**Saídas:** testes + implementação + registro RED/GREEN no handoff.

**Verificação:** `npm run test:coverage -w apps/frontend` verde; o teste falha se a implementação for revertida.
