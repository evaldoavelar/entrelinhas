# Mapa do protótipo

Fonte visual obrigatória: PNGs exportados em `prototype/` (ADR-12, skill `prototype-guided-ui`). Inventário gerado em 27/10/2026 a partir do filesystem; **cada frame foi aberto e inspecionado visualmente** pelo líder (Claude) nesta data. Prefixos numéricos identificam frames, não ordem de sprint.

Fonte complementar: `prototype/Entrelinhas — Leitor de blogs em áudio.figcraft` (sha256 `9ad8c88bf2dfbadd057cac426e1b66d1e0931e8966d1aeb76910b23e386efa6c`). Não há leitor `.figcraft` verificado neste ambiente; não é usado como fonte de medidas. O link Figma antigo (requisitos §11) representa v0.3 e **não** foi acessado.

## Observações globais (derivadas dos frames)

- **Tema:** todos os 37 frames são Dracula (escuro). Cores amostradas por pixel: fundo `#282a36`, sidebar/topo público `#21222c`, superfície `#44475a`, superfície rebaixada `#343746`, roxo `#bd93f9` (primário/ativo), verde `#50fa7b`, ciano `#8be9fd`, laranja `#ffb86c`, vermelho Dracula (`#ff5555`, ações destrutivas), texto secundário `#6272a4` (comment), texto principal `#f8f8f2`.
- **Tema claro ValueTI:** **não há frame**. Extensão do design: mesma geometria, branco/azul/dourado via tokens (TASK-004), registrado como derivação.
- **Tipografia:** títulos de página em serifa (estilo Source Serif); UI em sans geométrica (Poppins nos frames 19–37; frames 01–15 têm sans geométrica muito próxima). Decisão: Source Serif 4 (display) + Poppins (UI), empacotadas localmente via `@fontsource` (sem CDN, determinístico para screenshots).
- **Layout desktop 1440×1000:** sidebar fixa 224px (logo, subtítulo, navegação, card de status, perfil); conteúdo a partir de x=264 com margem direita 40; título serifado ~36px em y≈97; ação primária no topo direito (200×40, raio 8); barra do player fixa ~105px no rodapé com borda superior.
- **Admin:** sidebar com rótulo laranja "PAINEL DO ADMINISTRADOR", navegação própria e card "Sessão de administrador · expira após 15 min sem uso"; abas em botões (Imagens, Voz e limpeza, Integrações, Pareamentos, Quotas e backlog, Telegram). Sem barra de player.
- **Raio:** cards ~12px, botões/inputs ~8px, chips pill.
- **Capa genérica:** ilustração de montanhas verde/ciano com sol — usada como capa padrão (RF13) em todas as listas.

## Inventário

| # | Arquivo | Dimensões | sha256 | Tema · viewport | Rota/local | Conteúdo/estado | Componentes | Tarefa | Inspeção |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | `prototype/01 · Biblioteca — Cards.png` | 1440×1000 | `c0af61b48c8cfc429c90a9b16df4c76f7d30ec8dc61922b931138051ac36bab1` | Dracula · desktop | /library?view=cards | Biblioteca (cards), busca, categoria, ordenação, 'continuar', carregar mais | AppShell, SiteCard, ViewToggle, SearchField, ContinueBanner, PlayerBar | TASK-012 | aberto 27/10 |
| 02 | `prototype/02 · Biblioteca — Compactos.png` | 1440×1000 | `fbabbcb1a1f89fc4b45c13c13cf074bfb3c615d253ad321a0cbeb3145f1a91a3` | Dracula · desktop | /library?view=compact | Biblioteca modo compacto (2 colunas) | SiteCardCompact | TASK-012 | aberto 27/10 |
| 03 | `prototype/03 · Biblioteca — Lista.png` | 1440×1000 | `cc96d0fcecc70d4b1a3b032853f360c20fa6951cf8a09588f1fd43bc709ef290` | Dracula · desktop | /library?view=list | Biblioteca modo lista | SiteRow | TASK-012 | aberto 27/10 |
| 04 | `prototype/04 · Detalhes da Fonte — Horizonte.png` | 1440×1000 | `b1ebb8ed726854e569201d6a24b7a544839847f7beb269173a677a1d7e14270d` | Dracula · desktop | /sites/:siteId | Detalhe da fonte: artigos, filtros Todos/Não ouvidos, ouvir/baixar/menu | ArticleRow, StatusChip | TASK-014 | aberto 27/10 |
| 05 | `prototype/05 · Player de Áudio — Detalhe do Artigo.png` | 1440×1000 | `efac68d41ed1d43af2caa83f366dce1fdd5330607024a7a9c1aeb7121a3e29f8` | Dracula · desktop | /articles/:postId | Player/detalhe: agora ouvindo, resumo/tags, descrições de imagens | NowPlayingCard, TagChip | TASK-021 | aberto 27/10 |
| 06 | `prototype/06 · Playlists — Visão Geral.png` | 1440×1000 | `f89501f82130398a31dd06f2c4cd96f071294de53fef0a220885e48aee7b4420` | Dracula · desktop | /playlists | Visão geral de playlists | PlaylistCard | TASK-030 | aberto 27/10 |
| 07 | `prototype/07 · Playlist — Para a caminhada.png` | 1440×1000 | `ca673de830d12ac3a071f2919c654b27662162cc8c1064e3e54342cfe6509bcc` | Dracula · desktop | /playlists/:id | Playlist: ordem, item removido pela limpeza (pulado), renomear | PlaylistItemRow, UnavailableRow | TASK-030 | aberto 27/10 |
| 08 | `prototype/08 · Fontes Monitoradas.png` | 1440×1000 | `9dcfe8f131370ea3a05f6095a29ac5330eac5e2c34be26dfbc346a0e4897fa28` | Dracula · desktop | /sources | Fontes monitoradas: ativa/pausada, toggle, resumo da fila | SourceRow, Toggle, StatStrip | TASK-031 | aberto 27/10 |
| 09 | `prototype/09 · Administração — Descrição de Imagens (Desligada).png` | 1440×1000 | `67570bfeda78ba0cda915366692ca79a992f342ded47a86345bded895b0a13d9` | Dracula · desktop | /admin/images | Admin: descrição de imagens desligada (extração textual) | AdminShell, AdminTabs, Callout | TASK-050 | aberto 27/10 |
| 10 | `prototype/10 · Administração — Descrição de Imagens (Ligada · Modelo Visual).png` | 1440×1000 | `1714ac01cda9dd0698b575d44b492b04f7b521fadebd7e9c1f3f179f434dfe0e` | Dracula · desktop | /admin/images | Admin: descrição de imagens ligada (modelo visual) | AdminTabs, Toggle | TASK-050 | aberto 27/10 |
| 11 | `prototype/11 · Administração — Voz e Limpeza.png` | 1440×1000 | `d089ae983774b7bab931136b947532212210b9c687176817dc3f7c8efcc1914a` | Dracula · desktop | /admin/voice | Admin: voz e limpeza (retenção 90 dias, excluir após ouvir) | Select, Toggle, Callout | TASK-051 | aberto 27/10 |
| 12 | `prototype/12 · Administração — Integrações (OpenRouter e MCP).png` | 1440×1000 | `a4960deecd6ecde1ce882b005f0083ad1b449a8b64810447fc88b24c3e0746c1` | Dracula · desktop | /admin/integrations | Admin: OpenRouter (chave do operador, só leitura) e MCP | Select, Callout | TASK-051 | aberto 27/10 |
| 13 | `prototype/13 · Modal — Adicionar Leitura.png` | 1440×1000 | `6073ff417b540fb8d1aeddcbe3b4c7a19128358090dea36fc1787f77e7c312ed` | Dracula · desktop | /imports/new | Adicionar leitura: URL, voz, playlist, categoria herdada, aviso visão desligada | Form fields | TASK-020 | aberto 27/10 |
| 14 | `prototype/14 · Modal — Preparando Leitura (Progresso).png` | 1440×1000 | `0a949ff47f1c9a990570e2c03367a5e86306c6c55cafa1e26c5d603ffacb1f50` | Dracula · desktop | /imports/:importId | Preparando leitura: etapas de processamento (estado de produto) | ProgressSteps | TASK-020 | aberto 27/10 |
| 15 | `prototype/15 · Busca Global — Resultados.png` | 1440×1000 | `09a712817dcca6695012a2f949bcd5bf0e1c3ba293fc037466543bd8d721aea0` | Dracula · desktop | /search?q= | Busca global: onde foi encontrado (texto/tags/resumo), realce seguro | ArticleRow, SearchField | TASK-013 | aberto 27/10 |
| 16 | `prototype/16 · Biblioteca — Versão Mobile.png` | 390×1100 | `242cb729e5bf95fefa52672a8148f3ffc0ed88f18b60e6e05e78f54907683f96` | Dracula · mobile | /library (390px) | Biblioteca mobile: tab bar inferior, mini player | MobileTabBar, MiniPlayer | TASK-012 | aberto 27/10 |
| 17 | `prototype/17 · Modal — Criar Playlist.png` | 1440×1000 | `c29f268111281e7dd05e271821782efdcd0f6d9b9291b59675efa925bad5ea8d` | Dracula · desktop | /playlists/new | Criar playlist: nome + seleção de áudios | SelectableRow | TASK-030 | aberto 27/10 |
| 18 | `prototype/18 · Menu — Ordenar biblioteca (sobreposição).png` | 332×372 | `6361b3ff49e486a156552ea4c7d3b6fff2e29650a601d045d64cc48a6e55714c` | Dracula · mobile | menu sobre /library | Menu ordenar: critério e sentido, 'vale para itens não carregados' | SortMenu (popover/menu acessível) | TASK-012 | aberto 27/10 |
| 19 | `prototype/19 · Administração — Pareamentos da Extensão.png` | 1440×1000 | `7590f43c70bebfa549e1bcee4c499fabb804a634896d10fe86ee7d5a1f0d9cd6` | Dracula · desktop | /admin/pairings | Pareamentos: pedido pendente (código, perfil, escopos), extensões pareadas, revogar | AdminTabs, DataTable | TASK-052 | aberto 27/10 |
| 20 | `prototype/20 · Capturas Privadas (Desbloqueadas).png` | 1440×1000 | `b32eb563a6aa93805e78ca75d817c9e76850809fd823ab9debb9b5205e515dec` | Dracula · desktop | /private | Capturas privadas desbloqueadas: bloquear agora, compartilhar, excluir | CaptureRow, Badge | TASK-040 | aberto 27/10 |
| 21 | `prototype/21 · Central de Notificações.png` | 1440×1000 | `1f93112dab24429bd9bc315fc64e6cd8e638c7e49e8eeef5583e0ba24f591edd` | Dracula · desktop | /notifications | Central de notificações: filtros, itens, canais (navegador/Web Push) | NotificationRow, FilterChips | TASK-041 | aberto 27/10 |
| 22 | `prototype/22 · Página Pública de Compartilhamento.png` | 1440×1000 | `fca5b543758cbf8930138a2e2b2faf7589a46e3227b98312983ba9d3d7b29cb6` | Dracula · desktop | /s/:token (público) | Página pública de compartilhamento: só o áudio, sem biblioteca | PublicShell, PublicPlayer | TASK-061 | aberto 27/10 |
| 23 | `prototype/23 · Extensão — Popup.png` | 380×520 | `08b1a87628c168ad108de11f1d74d4eb9ef1d76d6898c049ff3af18a44d4f7fb` | Dracula · mobile | extensão: popup | Popup: aba atual, Enviar URL, Capturar texto, Configurações, servidor/perfil | ExtPopup | TASK-070 | aberto 27/10 |
| 24 | `prototype/24 · Extensão — Prévia de Captura.png` | 1440×1000 | `5cec53b287e002b2a386909033c1c7e2d9fcf55f451e662e75982dbbf073e403` | Dracula · desktop | extensão: preview | Prévia de captura editável, processamento local/externo, visibilidade | CapturePreview | TASK-071 | aberto 27/10 |
| 25 | `prototype/25 · Extensão — Configurações e Pareamento.png` | 1440×1000 | `57f76766e519c950e5f38f9e0e8bc42861acb5ff96ae530556a622fe0fabc66f` | Dracula · desktop | extensão: options | Servidor e pareamento: testar conexão, código, token manual, modo persistente/temporário | ExtOptions | TASK-072 | aberto 27/10 |
| 26 | `prototype/26 · Entrar — Senha da casa e perfil.png` | 1440×1000 | `fda947ccaa0da349659960ae5396e63dec8d1565c78b0146cf0311fbb090d299` | Dracula · desktop | /login | Entrar: senha da casa + perfil | LoginCard, ProfilePicker | TASK-010 | aberto 27/10 |
| 27 | `prototype/27 · Administrador — Login individual.png` | 1440×1000 | `a9a814a3ad0cf544d77934eeda8389d5e4d8e98b6550a42f3a48fc4d1f94daa3` | Dracula · desktop | /admin/login | Login individual de administrador (senha+TOTP/passkey) | LoginCard | TASK-011 | aberto 27/10 |
| 28 | `prototype/28 · Administração — Confirmar alteração sensível.png` | 1440×1000 | `a5cdb414a172610b8e891bd0bfd1b3911462554c9c3f81362e427d7d2ec10b17` | Dracula · desktop | /admin/confirm/:intentId | Confirmar alteração sensível (TOTP, uso único, expira) | ConfirmPanel | TASK-053 | aberto 27/10 |
| 29 | `prototype/29 · Capturas privadas — Desbloquear com PIN.png` | 1440×1000 | `80f0509e97f529791b6ee0045770f643f624dd0e1702c52aedf3f41b6b0b0621` | Dracula · desktop | /private (bloqueado) | Desbloquear capturas com PIN/passkey; sem PIN configurado | PinInput | TASK-040 | aberto 27/10 |
| 30 | `prototype/30 · Compartilhar link público.png` | 1440×1000 | `93c6b556a0177689fde487d33f8418e02450a6c1fda35f24bb85bde467d15b94` | Dracula · desktop | /articles/:postId/share | Compartilhar link público: validade, download, confirmação, links ativos/revogar | ShareForm, ActiveLinks | TASK-060 | aberto 27/10 |
| 31 | `prototype/31 · Conversão falhou — Tentar de novo.png` | 1440×1000 | `016504af0c8155e8971a1ddb51682da76f524fdcf70861526649467757015f45` | Dracula · desktop | /imports/:importId (failed) | Conversão falhou: etapa com erro, tentar de novo sem duplicar | ProgressSteps | TASK-020 | aberto 27/10 |
| 32 | `prototype/32 · Extensão — Resultado do envio.png` | 380×820 | `4535eaa9524625e240098cd957a61534df60c80191f251e34aaa63c81e27953f` | Dracula · mobile | extensão: popup resultado | Resultados de envio: na fila, já existe, aguardando categoria, credencial inválida, limite, sem conexão | ExtResultCard | TASK-070 | aberto 27/10 |
| 33 | `prototype/33 · Categoria do novo site.png` | 1440×1000 | `cd8821dfe810572c10651e9a53cfa446e0f04fed92a21ae03c8ad8245c67d293` | Dracula · desktop | /imports/:importId/category | Escolher categoria para site novo (awaiting_category) | ChoiceChips | TASK-020 | aberto 27/10 |
| 34 | `prototype/34 · Categorias — Gerenciar.png` | 1440×1000 | `c58da228413604560e030d862ae0ce8f39a969884dc1bccfa0e2d74ae8c76046` | Dracula · desktop | /categories | Gerenciar categorias e categoria por site | CategoryRow, Select | TASK-022 | aberto 27/10 |
| 35 | `prototype/35 · Administração — Quotas e backlog.png` | 1440×1000 | `d019bf130f736d1c439ab280524f43cbbe99900f5d45cfd6eb2381b48eb2d740` | Dracula · desktop | /admin/quotas | Quotas e backlog: pools interativo/automação, limites | Meter | TASK-052 | aberto 27/10 |
| 36 | `prototype/36 · Administração — Telegram.png` | 1440×1000 | `3cc227d222b54e1ff29e7803f43b566505e3dadadc8ebf76922fe24f47609744` | Dracula · desktop | /admin/telegram | Telegram: bot, contas vinculadas, gerar código de vínculo | LinkedAccountRow | TASK-052 | aberto 27/10 |
| 37 | `prototype/37 · Perfil — Preferências e compartilhamento.png` | 1440×1000 | `220d4592386448f5cb116ed3c6f39ef6a8588c5fb5eb109ac7f1baf889a00f4e` | Dracula · desktop | /profile | Preferências do perfil: compartilhamento automático com PIN, sites sempre privados, segurança | RadioCard, PinInput | TASK-042 | aberto 27/10 |

## Lacunas (sem frame — derivar dos padrões existentes, marcado como extensão do design)

| Lacuna | Derivação |
| --- | --- |
| Tema claro ValueTI de todas as telas | Tokens claros, mesma geometria (TASK-004) |
| Mobile de telas além da biblioteca | Padrão do frame 16: tab bar inferior, mini player, cards em coluna |
| Estados vazio/carregando/erro 4xx/5xx/429/503 genéricos | Superfície `#343746` com callout; skeletons nas dimensões dos cards |
| Sessão expirada (401) e perfil bloqueado em rotas privadas | Redirecionar para frames 26/29 com mensagem |
| Fila do player (próximos itens) | Popover a partir da barra do player, linhas no padrão ArticleRow |
| Configurar PIN pela primeira vez | Padrão PinInput do frame 29/37 |
| Cadastrar blog (formulário) | Padrão de formulário do frame 13 |
| Página interna da extensão para resultado após fechar o popup | Frame 32 em layout de página (padrão 24/25) |

## Divergências registradas

| Frame | Divergência | Motivo |
| --- | --- | --- |
| 13 | "Modal" no nome, mas é página completa no frame | Implementar como rota de página (frame), não diálogo sobreposto |
| 01/16 | Texto de apoio difere ("Todos os seus sites…" vs "Suas leituras, no seu tempo.") | Manter textos de cada viewport conforme frames |
| vários | Texto secundário `#6272a4` sobre `#44475a` tem contraste < 4.5:1 | CA27 exige contraste: clarear o token `text-muted` sobre superfícies elevadas mantendo o matiz; documentar no handoff de TASK-004 |
| 01 | Rodapé da sidebar ganha switch "Tema escuro (Dracula)" e botão "Sair" | RF41 (tema por perfil) e logout; frame não mostra esses controles |
| 01 | Card "Sua biblioteca em dia" e barra do player ausentes no shell | dependem de endpoints de fontes (S04) e do player (TASK-021); entram quando existirem dados reais do mock |
| 01 | Texto de apoio da sidebar ("Protótipo · dados de exemplo") omitido | rótulo do protótipo, não do produto |
| todos | Navegação lateral com `white-space: nowrap` e padding direito 4px | evita quebra de "Capturas privadas" (frame em linha única) |
| 18 | Com "Nome do site" o sentido é "A a Z / Z a A" | frame mostra só o sentido por data ("Mais recentes/antigas primeiro"), sem significado para nomes |
| 01 | Rodapé "Mais itens ao rolar" omitido; carregamento só pelo botão "Carregar mais" | rolagem infinita não implementada; não anunciar comportamento inexistente |
| 01 | Ícone do site usa só a inicial ("C" para Circuito, Ciência Aberta e Cotidiano) | frame usa 1–2 letras sem regra explícita; ícone real virá de `icon_url` |
