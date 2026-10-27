---
name: prototype-guided-ui
description: Implement or review Entrelinhas screens from the exported PNG frames in prototype/ — inspect the real image, map frame to route/component, build real accessible controls, and verify visual fidelity with screenshots. Use for any UI task.
---

# prototype-guided-ui

**Quando usar:** criar/alterar/revisar tela, modal, menu ou componente visual.

**Entradas:** frames listados na tarefa (caminho relativo em `prototype/` + sha256), `docs/design/prototype-map.md`, tokens em `apps/frontend/src/theme/`.

**Passos**
1. Verifique o hash: `sha256sum "prototype/<arquivo>.png"` deve bater com a tarefa. Divergiu → pare e reporte.
2. **Abra a imagem de verdade** em resolução legível (ferramenta de leitura de imagem do seu agente). Se seu agente não consegue ver imagens, declare isso no handoff e peça revisão visual a outro agente — não afirme fidelidade.
3. Liste o que vê: hierarquia, grid, espaçamentos, tipografia, cores, ícones, estados, densidade.
4. Reuse tokens/componentes existentes; novo token só via líder.
5. Implemente com DOM/React reais, acessíveis e ligados aos mocks. **Proibido** usar o PNG como fundo/imagem da tela.
6. Frames são Dracula (escuro). Tema claro ValueTI (branco/azul/dourado) é derivado dos tokens, mesma geometria — registre como extensão do design.
7. Valide: rode a rota com o cenário MSW correspondente, capture screenshot no viewport do frame (registre dimensões/escala), compare lado a lado com o PNG, corrija diferenças de layout/tipografia/cor.
8. Divergência necessária (acessibilidade, requisito) → registre em `docs/design/prototype-map.md` § Divergências.

**Saídas:** UI implementada + screenshot em `docs/design/evidence/<TASK>/` + notas de comparação no handoff.

**Verificação:** handoff contém frame/hash, rota/viewport/cenário, screenshot da app e lista de diferenças justificadas. Compilar não é prova de fidelidade.
