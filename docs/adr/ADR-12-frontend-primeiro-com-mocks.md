# ADR-12 — Frontend primeiro com HTTP mockado; Gate 0 dividido em G0-F e G0-B

Data: 27/10/2026. Estado: aceita. Origem: instrução do usuário ao líder técnico (27/10/2026).
Altera a sequência de ADR-02 e ADR-11 (`docs/specs/decisoes-e-estados.md`) sem apagá-las.

## Contexto

ADR-02 bloqueava qualquer código de produto até host/sandbox/TLS/browser serem validados. O usuário decidiu antecipar a interface: construir todo o frontend contra contratos HTTP versionados e mocks determinísticos, adiando o backend real.

## Decisão

1. Gate 0 é dividido:
   - **G0-F** — ferramentas locais, repositório, contratos, harness de frontend e execução isolada com dados fictícios. Satisfeito ⇒ libera frontend mockado (web app e UI da extensão).
   - **G0-B** — host real, sandbox por tarefa, TLS/renovação, rede/egress, storage/segredos e demais PoCs (ADR-02, ADR-08). Continua **bloqueando backend real e qualquer integração com conteúdo externo**. Não bloqueia a UI mockada.
2. Ordem de entrega: contratos + mocks (MSW) + harness → telas por sprints → marco **FRONTEND-MOCK-COMPLETE** → (com G0-B comprovado) backend real conforme os mesmos contratos, com testes de conformidade provider/consumer.
3. Nenhum backend real é implementado durante as sprints de frontend. PoCs limitadas de infraestrutura podem ser preparadas em paralelo e não contam como backend entregue.
4. Autorização, geração de áudio, processamento, isolamento, notificações e Telegram estão **simulados** até a integração real. RF/CA atendidos só por mock são marcados "simulado" na rastreabilidade.
5. O agy usado como agente de desenvolvimento deste repositório é distinto do `agy-runner` do produto (RF48–RF50, fase 7), que continua não implementado.

## Consequências

- Risco de drift UI × backend: mitigado por contratos em `packages/contracts` (schemas zod, enums canônicos com teste de drift contra `decisoes-e-estados.md`), cliente HTTP único e CI que falha com mocks/contratos divergentes.
- Requisitos de segurança não são removidos: telas expõem os fluxos (desbloqueio, confirmação admin, consentimento), mas a garantia real só existe após G0-B e implementação do servidor.
- O bundle de produção não pode depender do MSW para funcionar.
