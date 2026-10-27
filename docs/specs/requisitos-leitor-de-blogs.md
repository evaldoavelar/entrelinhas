# Leitor de blogs e páginas em áudio — requisitos v1.4

Data: 25/10/2026. Arquivo canônico: requisitos-leitor-de-blogs.md.
Documentos relacionados: plano-tecnico-leitor-de-blogs.md v0.8; extensao-navegador-especificacao.md v0.3; decisoes-e-estados.md v0.1.
Estado: especificação, sem implementação/PoC concluída. Este documento descreve comportamento e segurança esperados; mecanismos, esquema, infra e ADRs ficam nos documentos relacionados. Revisões históricas não são regras concorrentes.

## 1. Objetivo e escopo

Receber artigo por URL ou captura textual consentida, gerar áudio com resumo/tags/capa, organizar sites/categorias, ouvir/baixar/criar playlists e monitorar fontes. Entradas por web/API/extensão/Telegram e agentes continuam no escopo total, entregues por fases. MVP não significa todos os recursos simultâneos.

Uma casa, biblioteca comum e perfis de escuta, sem múltiplas famílias/cobrança/multi-tenancy. Capturas têm exceção private_to_profile por padrão, salvo preferência do dono por compartilhar novas capturas com a casa; conteúdo privado exige desbloqueio individual, não simples seleção de avatar. Admin tem credencial individual distinta da senha compartilhada. O operador do host pode alcançar arquivos/segredos e não é adversário isolado por esse produto.

“Solicitado” identifica decisão do usuário; defaults operacionais propostos precisam ser validados antes de ativar o recurso. Escopo por fase e escolhas técnicas estão no plano/ADRs.

## 2. Requisitos funcionais e de segurança

| ID | Requisito | Origem |
| --- | --- | --- |
| RF01 | Receber uma URL para conversão manual e informar o resultado do processamento. | Solicitado |
| RF02 | Extrair o conteúdo principal, excluindo menus, anúncios e outros elementos que não pertencem ao artigo. Preservar título, parágrafos e sequência de leitura. | Proposta para viabilizar RF01 |
| RF03 | Converter o texto extraído em um arquivo de áudio e associá-lo ao post e ao site de origem. | Solicitado |
| RF04 | Agrupar os posts por domínio e exibir um card por site na página inicial. | Solicitado |
| RF05 | Mostrar no card o nome amigável do site, seu ícone e a data da última conversão. | Solicitado |
| RF06 | Atualizar a última conversão do site somente quando um áudio for concluído com sucesso. | Proposta |
| RF07 | Abrir, a partir do card, a lista de posts e áudios daquele site. | Proposta |
| RF08 | Permitir cadastrar um blog para monitoramento automático e ativar ou pausar esse monitoramento. | Solicitado; pausa proposta |
| RF09 | Buscar novas publicações periodicamente e encaminhá-las para conversão automática. | Solicitado |
| RF10 | Identificar publicações já conhecidas para evitar reconversão a cada verificação. Registrar histórico suficiente para não baixar novamente áudios removidos pela limpeza. | Proposta |
| RF11 | Gerar um resumo fiel do artigo e usá-lo como descrição do áudio. | Solicitado |
| RF12 | Extrair tags temáticas do texto e associá-las ao post e ao arquivo de áudio. | Solicitado |
| RF13 | Usar a imagem principal do post como capa do áudio; na ausência dela, usar uma imagem genérica predefinida. A capa deve estar incorporada no arquivo entregue. | Solicitado |
| RF14 | Incorporar no áudio título, resumo e tags, além da capa. Manter a URL de origem no registro do sistema. | Solicitado; título e URL propostos |
| RF15 | Exibir inicialmente o dashboard pela data da última conversão, com as mais recentes primeiro. | Solicitado; sentido decrescente proposto |
| RF16 | Oferecer no topo seleção de ordenação por nome ou data, com sentido crescente ou decrescente. | Solicitado |
| RF17 | Disponibilizar barra de pesquisa global sobre os posts de todos os sites, incluindo texto e tags. Incluir também título e resumo. | Solicitado; campos adicionais propostos |
| RF18 | Permitir configurar exclusão automática após ouvir e exclusão após um prazo, inicialmente de 90 dias. | Solicitado |
| RF19 | Reproduzir áudios no player da interface web. Registrar progresso, identificar quando o áudio foi ouvido e permitir retomada. | Player solicitado; progresso e retomada propostos |
| RF20 | Permitir configurar executor/modelo e parâmetros do OpenRouter; credenciais da instalação são provisionadas pelo operador. | Solicitado; implementação no plano |
| RF21 | Expor um servidor MCP para agentes externos consultarem e operarem o sistema, incluindo o envio de resultados de processamento inteligente. | Solicitado |
| RF22 | Permitir escolher entre processamento pelo OpenRouter e processamento por agente externo por etapa, com o mesmo contrato de resultados. | Proposta para realizar a substituição desejada |
| RF23 | Exibir estado e erro de cada conversão; permitir nova tentativa sem duplicar o post. | Proposta |
| RF24 | Disponibilizar download do áudio com os metadados incorporados. | Solicitado |
| RF25 | Quando a análise visual estiver habilitada no painel administrativo, identificar imagens do artigo e enviar a imagem efetiva a um modelo com visão, acompanhada de legenda e contexto, para gerar uma descrição narrada. Não se limitar à capa. | Solicitado |
| RF26 | Incluir descrições de gráficos, ilustrações, fotografias e outras imagens informativas no roteiro de narração, na posição correspondente à imagem no artigo. | Solicitado; posicionamento proposto |
| RF27 | Permitir selecionar uma voz pronta de um catálogo e manter essa voz durante a narração, incluindo as descrições das imagens. | Solicitado |
| RF28 | Gerar voz sem API paga obrigatória e sem enviar narração ao OpenRouter. Oferecer motor local funcional, além de vozes online explicitamente autorizadas. | Solicitado |
| RF29 | Oferecer prévia da voz e seleção por nome e idioma; salvar uma voz padrão e permitir substituição por conversão. | Proposta |
| RF30 | Persistir as descrições das imagens e o roteiro final para possibilitar nova síntese com outra voz sem repetir a análise visual. | Proposta |
| RF31 | Suportar descrição visual tanto via OpenRouter com modelo multimodal quanto por agente MCP capaz de receber e analisar imagens. | Extensão do requisito solicitado de agentes externos |
| RF32 | Disponibilizar no painel administrativo um parâmetro para ligar/desligar a análise de imagens por modelo visual, aplicável tanto ao OpenRouter quanto a agentes externos. | Solicitado |
| RF33 | Com análise visual desligada, produzir uma descrição alternativa por algoritmo local baseado nos textos e metadados associados à imagem, sem enviar imagens a modelos de visão. | Solicitado; estratégia de extração proposta |
| RF34 | Oferecer toda a interface pelo navegador e executar o projeto via Docker. | Solicitado |
| RF35 | Permitir criar playlists de áudios. | Solicitado |
| RF36 | Permitir nomear/renomear/excluir playlists, adicionar/remover e reordenar itens, inclusive de sites diferentes, e reproduzir em sequência no player. | Proposta de operações básicas de playlist |
| RF37 | Permitir alternar a visualização do dashboard entre cards, cards compactos e lista. | Solicitado |
| RF38 | Carregar os itens do dashboard sob demanda, mantendo pesquisa e ordenação sobre o conjunto completo. | Solicitado; consistência de pesquisa/ordenação proposta |
| RF39 | Preservar o modo de visualização escolhido entre visitas. | Proposta |
| RF40 | Oferecer tema escuro baseado em Dracula e tema claro branco, dourado e azul. | Solicitado |
| RF41 | Permitir alternar temas e salvar a preferência no perfil. | Proposta |
| RF42 | Atender uma casa com biblioteca compartilhada, senha de escuta e seleção de perfis; capturas privadas têm exceção de visibilidade e desbloqueio individual. | Escopo doméstico confirmado; privacidade da revisão |
| RF43 | Oferecer troca de perfil e manter progresso, histórico de escuta e playlists separados por perfil. | Seleção solicitada; isolamento proposto |
| RF44 | Compartilhar um áudio por link, dando ao portador acesso somente àquele áudio. | Solicitado |
| RF45 | Definir uma categoria para o card/site na criação e oferecer filtro de categorias no dashboard. | Solicitado |
| RF46 | Permitir gerenciar categorias e editar a categoria de cards existentes. | Proposta |
| RF47 | Permitir revogar links de áudio e configurar validade e permissão de download. | Proposta |
| RF48 | Permitir acionar automaticamente um executor Antigravity no home lab, disponível 24/7, para produzir resumo e demais resultados inteligentes configurados. | Solicitado |
| RF49 | Oferecer ponte Python que obtenha tarefas por pull, execute Antigravity, persista e devolva resultados para continuar o processamento. | Atualizado para pull; sem webhook no MVP |
| RF50 | Instalar `agy` e seu adaptador Python na imagem do runner Docker, separado da ponte de coordenação no Compose. | Decisão atual; substitui coabitação em um serviço |
| RF51 | Tratar páginas, imagens, legendas, capturas e resultados de modelos como não confiáveis, sem permitir que instruções nesses materiais operem o sistema. | Segurança solicitada |
| RF52 | Restringir o executor de resumo a entrada de conteúdo e saída estruturada, bloqueando ferramentas operacionais desnecessárias e sem ignorar permissões. | Requisito de segurança |
| RF53 | Separar a ponte de integração da execução do `agy` em serviços Compose isolados, mantendo a instalação do `agy` dentro de Docker. | Ajuste de isolamento para a proteção solicitada |
| RF54 | Avaliar Slim como etapa opcional de otimização de imagens no CI, promovendo somente imagens que passem pelos testes funcionais e de segurança. | Solicitado; adoção condicionada à prova de conceito |
| RF55 | Separar obtenção pela rede de interpretação de conteúdo hostil; toda decodificação de imagem/áudio ocorre isolada e sem rede ou credenciais de banco. | Segurança obrigatória |
| RF56 | Impedir persistência entre tarefas e acesso a arquivos de outras tentativas. | Segurança obrigatória |
| RF57 | Manter o componente de autorização pública sem leitura da mídia global e chaves de provider fora dos executores de conteúdo. | Segurança obrigatória |
| RF58 | Exigir identidade individual de administrador e confirmação humana para exclusão, mudanças de retenção, chaves, custos e demais operações sensíveis. | Segurança obrigatória |
| RF59 | Definir cotas da instalação e justiça de fila, estados de limites e manutenção automática. | Necessário à operação; valores a validar |
| RF60 | Preservar escuta lógica ao regenerar voz e tornar retenção multi-perfil calculável por assinaturas explícitas. | Correção de consistência |
| RF61 | Oferecer extensão para Chromium que envie a URL da aba atual ao processamento mediante clique explícito do usuário. | Solicitado |
| RF62 | Permitir configurar URL HTTPS do servidor e token de autorização na extensão, testar conexão e remover a configuração/credencial. | Solicitado; teste/remoção propostos |
| RF63 | Emitir credencial própria por instalação da extensão/perfil, com pareamento aprovado ou configuração manual, validade e revogação; persistir para sobreviver a reinícios. | Solicitado; fluxo corrigido |
| RF64 | Informar envio aceito, URL já conhecida, pendência de categoria, token inválido/expirado, cota, indisponibilidade e falha sem afirmar que o áudio está pronto ao apenas enfileirar. | Experiência necessária |
| RF65 | Separar núcleo portável e adaptadores/manifests do navegador para futura implementação de Opera e Firefox; suporte inicial validado apenas no Chromium. | Solicitado |
| RF66 | Enviar URL ou texto principal explicitamente capturado da aba acionada, sem coletar histórico, cookies, senhas, armazenamento ou HTML bruto; não permitir comandos de páginas externas. | Atualizado para captura consentida |
| RF67 | Aplicar à extensão e aos demais canais as mesmas regras de categoria, cotas, deduplicação, idempotência e autorização. | Integração necessária |
| RF68 | Para páginas acessíveis mediante login no navegador, permitir que a extensão capture o texto principal já disponível na aba e o envie ao servidor para narração. | Solicitado |
| RF69 | Mostrar prévia editável do texto capturado e exigir confirmação antes de transmitir; excluir formulários/campos e dados de autenticação, com limites de tamanho e tempo de captura. | Proteção necessária |
| RF70 | Receber texto capturado por canal privado, preservar proveniência declarada e versão, sem precisar entrar novamente no site; a captura continua não confiável. | Integração necessária |
| RF71 | Após o áudio ficar pronto, criar notificação para os perfis solicitantes no frontend, independentemente da entrada por web, extensão, API, agente, monitoramento ou bot. | Solicitado |
| RF72 | Oferecer notificações de sistema no navegador mediante permissão e central persistente na interface como alternativa quando bloqueadas/indisponíveis. | Solicitado; alternativa necessária |
| RF73 | Persistir eventos e entregas de notificação, com retomada após reinício, deduplicação e retentativas limitadas por canal; falha de aviso não refaz o áudio. | Confiabilidade necessária |
| RF74 | Receber links por bot Telegram, em conversa privada e de identidades previamente vinculadas a perfil pelo painel, usando o mesmo serviço de importação. | Solicitado; restrições de acesso necessárias |
| RF75 | Envio originado no Telegram recebe confirmação de entrada e aviso final pelo Telegram, além da notificação no browser do perfil solicitante. | Solicitado |
| RF76 | Manter credencial do bot no servidor e receber updates sem publicar API privada ou permitir administração por mensagem; forma de integração definida no plano. | Segurança e operação |
| RF77 | Limitar requisições, tarefas, tamanho, custo e concorrência por identidade/perfil/instalação, agregando todos os canais; reservar capacidade para uso interativo. | Proteção solicitada |
| RF78 | Ter credenciais próprias para clientes API, associadas a perfil e escopos; separar sessão web, extensão, API, Telegram, MCP e capabilities internas. | Necessário à autorização e notificações |
| RF79 | Tratar captura autenticada como potencialmente sensível e privada ao perfil por padrão; permitir ao dono optar, no próprio perfil, por compartilhar novas capturas com a casa automaticamente; controlar compartilhamento doméstico/público e envio para provedores. | Privacidade da revisão |
| RF80 | Permitir habilitar Web Push para aviso com a aba fechada, quando suportado e consentido; mostrar limites de conectividade, navegador e sistema operacional. | Proposta para entrega em segundo plano |
| RF81 | Abrir popup na extensão com ações distintas de enviar URL e capturar texto, além de acesso às configurações. | Correção do fluxo |
| RF82 | Concluir captura sensível por rota local funcional de resumo extrativo, tags e voz, sem depender de provedor externo ou consentimento para ele. | Correção de viabilidade |
| RF83 | Exigir desbloqueio individual para ler captura privada de um perfil; permitir compartilhar somente por escolha explícita e avisada, por captura ou pela preferência do perfil (§4). | Privacidade da revisão |
| RF84 | Separar referências descobertas/backlog automático de tarefas admitidas e reservar capacidade interativa sem impedir progresso da automação. | Correção de justiça de fila |

## 3. Biblioteca e experiência

Agrupar por domínio com normalização conservadora, nome/ícone e última conversão bem-sucedida; não criar novo card por URL repetida. Categoria principal definida na criação/editável, distinta de tags. URL de site conhecido herda categoria. Novo site sem definição aguarda escolha.

Dashboard em cards, compactos e lista; filtros de busca/categoria combinam com ordenação nome/data crescente/decrescente. Inicialmente últimas conversões primeiro. Carregamento sob demanda mantém sequência estável durante a consulta e revalida permissão/exclusão. Novas conversões podem ser sinalizadas sem mover silenciosamente os itens da sessão. Busca considera título/resumo/corpo/tags, sem depender dos itens carregados; tolerância a acentos/caixa e pequenos erros, sem prometer busca semântica.

Player com pausa/retomada, velocidade, fila e voz consistente; download não equivale a ouvido. Playlist referencia artigo lógico e fixa a versão durante a reprodução; indisponível é sinalizado/pulado. Nova voz da mesma versão preserva ouvido lógico; conteúdo alterado ganha versão de consumo própria.

Claro branco/azul/dourado e escuro Dracula, com contraste/foco/teclado e preferência por perfil.

## 4. Conteúdo, imagens, voz e captura

Narrar o texto integral por proposta inicial; resumo é a descrição. Extrair tags do conteúdo. Arquivo incorpora capa, título, resumo/tags quando suportados pelo formato escolhido. Capa principal ou genérica; formato final ainda é gate, MP3 baseline proposta.

Toggle visual administrativo impede novas análises ao desligar, mesmo para tarefas já criadas. Ligado: descrever imagem real com contexto, no ponto do roteiro, sem inventar valores ilegíveis. Desligado: legenda/alt/contexto textual disponível, sem reconstruir gráfico por suposição. Imagem decorativa/anúncio pode ser omitida. Capacidade visual não comprovada é indisponibilidade explícita, sem fallback pago silencioso.

Voz pronta selecionável; nenhuma API paga é obrigatória. Antes de habilitar captura, precisa existir narração local funcional e resumo extrativo/tags locais. Provedores online exigem autorização e aviso de envio de conteúdo; isso vale a OpenRouter, agy e texto enviado à Microsoft no Edge.

Captura lê somente texto principal já acessível na aba, mostra prévia editável e transmite após confirmação; sem cookies, senha, campos, histórico, armazenamento da página ou HTML bruto. Não contorna acesso ausente. Preserva título/blocos/proveniência declarada, que não prova autoria. Capa genérica e descrições textuais no primeiro incremento, sem captura binária ou busca automática de imagens privadas.

Captura cria item próprio no contexto privado, mesmo se a URL já existir na biblioteca comum; não há associação automática. Mesmo contexto/conteúdo pode reutilizar versão aprovada. Compartilhamento doméstico exige ação explícita por captura ou a preferência de perfil “compartilhar com a casa automaticamente”: desligada por padrão, ativada só pelo dono com PIN/passkey e aviso de exposição, com exceções por site e por captura (“manter esta privada” na prévia), sem efeito sobre capturas anteriores e sem alteração por admin ou outro perfil. A exceção da prévia só pode tornar a captura mais privada. Compartilhamento público continua exigindo ação própria, assim como envio a provedor externo. Com PIN/passkey de perfil ausente, solicitar configuração/desbloqueio antes de habilitar privacidade real; alternativa compartilhada precisa de consentimento claro.

## 5. Entrada, automação e notificações

Importações têm identidade estável do solicitante e deduplicação entre reentregas. Categoria, cotas e permissões não podem ser contornadas trocando canal. Posts descobertos por monitoramento entram em backlog limitado e são admitidos em lotes justos; reservar capacidade manual, sem paralisar automação. Fonte pausada não cria trabalho novo. Histórico evita reconverter automaticamente áudio limpo.

Extensão Chromium: servidor configurável, popup com URL/captura, pareamento ou token manual, credencial persistente por padrão, teste de conexão e remoção/revogação. Opera/Firefox seguem evolução futura. Perda de conexão mostra resultado conhecido/desconhecido sem fingir que nenhum job foi aceito.

Telegram aceita links de conversa privada e identidade numérica previamente vinculada. Confirma entrada e, ao concluir, notifica o chat de origem e o perfil no frontend. Sem administração/credenciais/arquivos privados pelo bot no incremento inicial. Bot ainda não foi criado em produção.

Todos os canais geram avisos de conclusão para solicitantes autorizados após arquivo pronto, sem refazer áudio por falha de entrega. Central persistente por perfil, leitura e retomada; notificação de sistema exige permissão. Web Push opcional para aba fechada conforme suporte/OS/rede; sem suporte usar conexão ativa/central ao retornar. No Brave, documentar a configuração de serviços Google para Push e não habilitá-la silenciosamente. Notificação privada é genérica por padrão.

## 6. Acesso, privacidade e links

Interface/admin/API privadas em rede autorizada com conexão segura válida. Links externos têm ingresso próprio que mostra apenas asset/versão autorizados. Sem rede pública preparada, compartilhamento externo fica indisponível; extensão não abre API privada à internet.

Captura private_to_profile exige verificação individual para leitura; filtros, contagens, buscas, playlists, snapshots e assets respeitam isso. Perfil bloqueado é opcional para uso comum, obrigatório para proteção efetiva de captura privada. PIN não é credencial admin nem barreira contra o operador root. Notificações não revelam texto/título privado a outro perfil.

Link é autorização por posse, aleatório, revogável, com prazo e permissão de download, fixado ao asset. Visitante não enxerga biblioteca/perfis nem altera progresso do dono. Nova requisição de mídia revalida validade, inclusive após pausa/retomada. Bytes já baixados não podem ser recolhidos. Proposta de defaults: 24h, download desabilitado, publicação confirmada e prazo nunca além da retenção.

Não vazar token por referenciador/log ou recurso externo. Preview de mensageiro consome tráfego e limite, sem contar como escuta, disparar publicação/exclusão ou consumir link de uso único. Publicar narração de terceiro exige permissão adequada; retenção curta não resolve direitos de redistribuição.

## 7. Estados e recuperação

Fonte única: decisoes-e-estados.md §2. Job, tentativa, produto, importação, captura e entrega têm enums distintos. Códigos de erro e estados de conexão do frontend não criam estados persistentes adicionais.

Lease vencido reconcilia só tentativa original dentro da carência; depois é superada e não publica. Retentativas são idempotentes, com configuração congelada por intenção e veto visual vigente antes de cada chamada. Executor não determina a etapa seguinte. Resultado persistido na ponte pode ser reentregue sem nova inferência; falha antes de persistência pode exigir inferência repetida. Sem promessa de exatamente uma chamada ou uma notificação externa.

Estado pronto exige arquivo, metadados e disponibilidade validados. Falha/limite/espera de categoria, consentimento, agente ou perfil ficam explícitos. Sem truncamento, publicação parcial ou gasto não autorizado silenciosos.

## 8. Retenção, recursos e segurança

Padrão solicitado de idade: 90 dias. Relógio proposto por arquivo a partir de ficar pronto; regeneração/link não renova arquivo antigo. Limpeza após ouvir considera quais perfis acompanham a versão; trocar voz não reseta ouvido. 95%/marcação manual, assinatura inicial, ativação da limpeza e prioridade entre regras continuam gates de produto antes de remover dados.

Remover acesso antes de purge físico; proteger arquivos necessários ao backup e comprovar restauração coerente. Banco não pode cair por mídia/temp cheios. Retenção inclui captura/derivados e backups segundo política explícita, sem prometer retirada de dados de cópias externas já entregues.

Tokens, IPs, perfis e instalação têm limites conjuntos de requisições, backlog, custo, texto, imagem, tempo, conexões, disco e banda. Limites de automação e interatividade não são a mesma fila. Reservas atômicas e rejeições explícitas; indisponibilidade do controle de quotas não libera gasto ilimitado. Não bloquear todos os perfis por um lockout de senha compartilhada.

Conteúdo/modelo não recebe ferramentas de exclusão/terminal, segredos, callbacks ou acesso a arquivos de outros jobs. Isolamento real por tentativa e barreira de rede externa ao parser são obrigatórios. Mídia decodifica sem rede; resumo/tags/títulos são texto, nunca comando/HTML confiável. Mutação sensível de perda/custo exige confirmação individual vinculada à ação. Código de conteúdo hostil e ingresso público continuam isolados mesmo com backend doméstico modular.

## 9. Critérios de aceite

IDs anteriores preservados, com redação atual reconciliada; fases são mapeadas no plano e não significam que tudo existe no MVP.

| ID | Verificação |
| --- | --- |
| CA01 | URLs do mesmo site no escopo autorizado reutilizam card. |
| CA02 | Capa válida ou genérica é incorporada ao áudio. |
| CA03 | Resumo/tags/metadados atendem formato e players aprovados. |
| CA04 | Ordenações por nome/data respeitam sentido escolhido. |
| CA05 | Busca encontra palavra apenas no corpo ou apenas nas tags. |
| CA06 | Fonte ativa converte novidade sem duplicar; pausada não agenda novos itens. |
| CA07 | Prazo de 90 dias segue relógio definido sem recriação automática. |
| CA08 | Limpeza após ouvir segue consumo lógico/assinaturas, sem interromper escuta. |
| CA09 | OpenRouter e agente usam mesmo contrato validado por etapa. |
| CA10 | Desconexão não deixa lease indefinido nem aceita publicação duplicada. |
| CA11 | Falha é visível e permite retry sem duplicar post. |
| CA12 | Visão ligada descreve imagens no ponto correspondente do roteiro. |
| CA13 | Valor visual ilegível não é inventado. |
| CA14 | Texto e descrições usam a voz selecionada. |
| CA15 | Trocar voz reutiliza roteiro/descrições válidos. |
| CA16 | TTS não aciona API paga/OpenRouter silenciosamente. |
| CA17 | Agente com visão recebe imagem real da tentativa; sem prova, capacidade é indisponível. |
| CA18 | Veto visual impede toda nova chamada de visão. |
| CA19 | Alternativa textual/ausência não inventa conteúdo. |
| CA20 | Playlist permite ordem e sites distintos sem copiar/apagar áudios. |
| CA21 | Três visualizações preservam filtros/dados. |
| CA22 | Snapshot estabiliza lotes apesar de alteração de last_conversion_at. |
| CA23 | Busca/categoria consideram itens ainda não enviados ao navegador. |
| CA24 | Recriação dos serviços preserva dados duráveis, não contexto hostil entre jobs. |
| CA25 | Player e download funcionam sem marcar download como ouvido. |
| CA26 | Item indisponível é identificado e pulado na fila. |
| CA27 | Temas mantêm contraste, foco e funções. |
| CA28 | Perfis têm progresso/playlists próprios sem poderes administrativos por avatar. |
| CA29 | Biblioteca comum e consumo/playlists são vinculados ao perfil; capturas privadas só aparecem ao proprietário autenticado. Avatar não autoriza administração ou leitura privada. |
| CA30 | Token público não amplia acesso a outro asset. |
| CA31 | Revogação/expiração bloqueiam novos metadados/Range/download. |
| CA32 | Categoria definida em card novo é reutilizada nas próximas URLs. |
| CA33 | Categoria, busca e ordenação combinam nos três modos. |
| CA34 | Visitante não altera estado do perfil que compartilhou. |
| CA35 | Pull conclui resumo/tags e retoma processamento. |
| CA36 | Reinício recupera spool durável. |
| CA37 | Idempotência/rejeição de versão antiga valem em reentrega. |
| CA38 | Falha de entrega pós-fsync não exige nova inferência. |
| CA39 | Timeout/erro/JSON inválido não publica resultado inadequado. |
| CA40 | Job obedece biblioteca, perfil/tarefa autorizados e veto visual vigente. |
| CA41 | agy é instalado no runner Docker e não depende do host/IDE. |
| CA42 | OAuth próprio e spool sobrevivem sem persistir HOME/histórico de jobs. |
| CA43 | Listener interno não é exposto pelo gateway. |
| CA44 | Falha de autenticação/limite não causa fallback pago silencioso. |
| CA45 | Artigo com “apague o diretório” não opera o sistema. |
| CA46 | Legenda/imagem hostil não obtém segredos ou dados de outra tarefa. |
| CA47 | Ferramentas sensíveis são negadas e saída não vira comando. |
| CA48 | Testes descartáveis cobrem exfiltração, paths e abuso de recursos. |
| CA49 | Falha de permissão/validação é recuperável e visível. |
| CA50 | Slim só promove imagem após mesma regressão funcional/de segurança. |
| CA51 | Varredura externa não encontra login/jobs/MCP privados. |
| CA52 | Rebinding/redirect/IPv6 e fontes locais são impostos pelo proxy externo. |
| CA53 | Spool/reentrega respeitam fencing e não persistem capabilities. |
| CA54 | Heavy não trava light; executor e próxima etapa vêm do coordenador. |
| CA55 | Snapshot/debounce/TTL não perdem/repetem itens silenciosamente. |
| CA56 | Restauração recupera banco e todos os arquivos do mesmo ponto consistente, sem depender de mídia já purgada. |
| CA57 | Capacidade de uma tentativa não lê/escreve outra. |
| CA58 | Agente sem confirmação humana individual não exclui nem altera configuração sensível de perda/custo; operações ordinárias seguem seus escopos. |
| CA59 | Parser comprometido não tem rede; fetcher não contorna proxy. |
| CA60 | Todo decode de imagem/SVG/bomb é bloqueado ou confinado sem rede. |
| CA61 | Tarefa A não deixa processos/HOME/arquivos para B. |
| CA62 | Sandbox sem staging mount não lê/modifica artefato de outra tentativa. |
| CA63 | Autorização pública não tem mídia global nem consultas genéricas; entrega externa só alcança arquivos explicitamente publicados. |
| CA64 | Executor não obtém chave do provider; serviço de inferência valida escopo/custo/consentimento e não executa TTS online. |
| CA65 | Credencial admin individual confirma exclusão e mudança onerosa. |
| CA66 | Rede privada, identidade do servidor, cookies e validação de origem impedem acesso indevido nos ingressos privados; implementação testada conforme plano. |
| CA67 | Busca usa acesso indexável e resultados realçados são renderizados como texto seguro, sem injetar HTML. |
| CA68 | Lease vencido reconcilia só a tentativa original; tentativa superada não publica e novo claim tem fencing maior, conforme enums canônicos. |
| CA69 | Nova voz não reseta ouvido; subscriptions tornam retenção calculável. |
| CA70 | Importação grande não monopoliza conversões manuais nem outras fontes/perfis da casa. |
| CA71 | Cota excedida fica explícita sem truncamento/gasto silencioso. |
| CA72 | CI executa testes de segurança desde a fundação, antes do CD. |
| CA73 | Cada incremento de comportamento tem teste escrito antes da implementação e falha observada pelo motivo esperado, seguido de implementação e refatoração com a suíte verde. |
| CA74 | Correção de defeito inclui teste que reproduz a falha antes da correção e impede sua regressão. |
| CA75 | Regras críticas e contratos são exercitados por testes automatizados vinculados aos requisitos; fronteiras de infraestrutura são verificadas no ambiente real correspondente. |
| CA76 | CI bloqueia merge/release quando falham verificações obrigatórias; suíte cotidiana não usa credenciais reais nem exige inferência paga. |
| CA77 | Resultados de IA são validados por esquema e invariantes de segurança; testes não exigem texto exato de modelo nem confundem mocks com prova de isolamento. |
| CA78 | Cobertura é estritamente >80% por projeto e no diff executável; piso por arquivo significativo e testes de migrations seguem ADR-10. Arquivos não exercitados entram no relatório. |
| CA79 | CI rejeita relatório ausente, fontes/exclusões indevidas ou gate abaixo do limite; arquivos pequenos não somem do total e migrations exigem testes de evolução/rollback. |
| CA80 | Playwright cobre fluxos críticos da interface, erros e regressão visual em Claro/Dracula e larguras desktop/móvel; alterações visuais esperadas exigem revisão das referências. |
| CA81 | Ação de envio de URL no popup importa a aba selecionada sem duplicar processamento em reentrega/cliques repetidos. |
| CA82 | Token de extensão não exclui, altera configurações, cria shares, acessa MCP/jobs internos ou enumera biblioteca; consulta somente seus próprios envios. |
| CA83 | Prazo/revogação/rotação e cota da credencial são impostos no servidor; segredo não aparece em URL/log/diagnóstico/artefato de teste. |
| CA84 | Conexão usa somente o destino configurado em HTTPS, não segue redirects autenticados e não reaproveita token ao trocar servidor; sem LAN/VPN, erro é explícito. |
| CA85 | Permissões concedidas limitam-se à aba acionada e ao servidor autorizado; script empacotado de captura só roda sob ação explícita, sem acesso geral a abas/cookies/histórico ou mensageria externa. |
| CA86 | Nova origem exige novo consentimento; URL privilegiada/credenciais embutidas são rejeitadas e links potencialmente sensíveis pedem revisão antes do envio. |
| CA87 | Novo site sem categoria aguarda escolha no painel ou usa padrão autorizado; extensão não contorna RF45 nem altera categoria existente. |
| CA88 | Playwright testa páginas/fluxos da extensão instalada no Chromium e a integração com a API; Chrome/Opera/Firefox não são declarados suportados sem qualificação própria. |
| CA89 | Captura de página autenticada gera roteiro/áudio a partir do texto enviado, sem login/cookies no servidor nem fetch automático do URL de origem. |
| CA90 | Captura exige prévia, exclui campos de autenticação/editáveis/ocultos e frames externos; extrator não recebe credenciais da extensão. |
| CA91 | Navegação durante captura, ausência de permissão ou excesso de tamanho/tempo aborta com erro claro; origem declarada não é prova de autenticidade. |
| CA92 | Captura sensível conclui por rota local sem chamadas externas; usar IA/TTS online ou publicar exige autorização específica. |
| CA93 | Somente arquivo validado como pronto gera aviso final durável aos perfis autorizados; falha de aviso não provoca nova narração. |
| CA94 | Permissão negada, reconexão e aba fechada preservam a central; Web Push depende de opt-in/suporte, sem promessa de entrega com navegador encerrado. |
| CA95 | Telegram não vinculado, chat de grupo/canal, outro from.id ou tentativa de pareamento repetida/expirada não importam nem administram o sistema. |
| CA96 | Reentrega de update_id e falhas antes/depois de persistir cursor não duplicam jobs; offset só confirma entradas duráveis/rejeições registradas. |
| CA97 | Conclusão de importação Telegram notifica o chat originalmente autorizado e a central do perfil; não manda áudio/share público por padrão. |
| CA98 | Rajadas simultâneas por API/extensão/Telegram consomem cota conjunta e nunca excedem vagas/orçamento reservados; retornar 429/Retry-After ou indisponibilidade sem agendar excesso. |
| CA99 | Trocar IDs, adicionar campos de perfil/role/provider ou reutilizar token de outro tipo não amplia acesso a importações, capturas, notificações ou funções administrativas. |
| CA100 | Headers, corpos, queries, uploads, conexões e tempo de processamento têm limites; payload comprimido ou expandido demais e JSON inválido são rejeitados cedo. |
| CA101 | SSE/polling/Web Push têm limites e autorização por perfil/dispositivo; endpoint de Push não vira vetor de SSRF nem vaza artigos na notificação. |
| CA102 | SQL, XSS, CSRF, prompt/command injection e respostas externas hostis são testados nos novos caminhos sem afrouxar sandboxes/escopos. |
| CA103 | Mesma URL não associa captura a post comum nem sobrescreve conteúdo; contexto privado e versão são preservados, com dedupe só dentro do contexto autorizado. |
| CA104 | Reinícios, tokens revogados, logout/troca de perfil, Telegram bloqueado e erro 429 mantêm entregas limitadas e sem avisar destinatário incorreto. |
| CA105 | Playwright cobre captura/login fictício, confirmação e notificações; contratos com Telegram/Push simulados e testes concorrentes de abuso seguem TDD e cobertura >80%. |
| CA106 | Reiniciar/atualizar extensão preserva credencial local; modo temporário e credencial perdida têm recuperação explícita sem confundir expiração com segredo exibido uma vez. |
| CA107 | Popup oferece modos URL/captura acessíveis; não depende de menu/atalho ou handler incompatível com popup. |
| CA108 | Todos os canais registram imports e idempotência por principal estável; rotação de credential preserva autoria, dedupe e cota. |
| CA109 | Job, tentativa, produto, importação, captura e entrega seguem apenas os enums de decisoes-e-estados.md; códigos de erro não são estados novos. |
| CA110 | Descobrir 500 posts cria backlog limitado, não 500 jobs; automação não consome reserva manual e recebe progresso justo. |
| CA111 | Captura de teste conclui offline com resumo extrativo/tags/voz local e capa genérica, sem ficar obrigatoriamente esperando consentimento externo. |
| CA112 | Busca, contagens, snapshots, playlists, downloads e avisos não revelam captura privada a perfil sem desbloqueio autorizado. |
| CA113 | Gate de infraestrutura comprova HTTPS válido e renovação nos dispositivos/browser alvo, sem ignorar erros de certificado. |
| CA114 | Acessos de preview/GET/HEAD consomem limites mas não contam como escuta; página pública não repassa token pelo referenciador. |
| CA115 | Sandbox tem isolamento por tarefa comprovado no host real sem liberação ampla de privilégios; inviabilidade bloqueia código de produto. |
| CA116 | Processo que usa protocolo TTS online não possui a chave de inferência ou outra credencial mais ampla. |
| CA117 | Com a preferência de compartilhamento automático desligada, captura nasce private_to_profile; ligada, nova captura nasce household salvo site excetuado ou exceção marcada na prévia. Alterar exige PIN/passkey do dono, não afeta capturas anteriores, e admin, outro perfil ou payload do cliente não ampliam a visibilidade. |

## 10. Gates e decisões

| Gate | Estado/condição |
| --- | --- |
| G0 infraestrutura | Aberto: host físico/VM/LXC, kernel, runtime/seccomp/AppArmor, CPU/RAM/discos, PoC de sandbox sem liberação ampla, HTTPS válido/renovação e browser/versão alvo. Bloqueia código de produto; PoCs/CI mínimo são permitidos. |
| G1 núcleo | Aberto: egress sem bypass, isolamento por tarefa, formato/players/vozes, quota/disco/budget, rota TTS local, contrato de importação e restore. |
| G2 extensão | Aberto: pareamento/recuperação, permissões e popup no Chromium real, TLS/distribuição/versão mínima. URL configurável mantida; variante fixa opcional não a substitui. |
| G3 captura | Aberto: desbloqueio/visibilidade ponta a ponta e caminho offline completo. Resolvido: não associar automaticamente captura a post comum pela URL. Associação manual futura requer nova decisão de produto antes de implementação. |
| G4 automação/limpeza | Aberto: limites de catálogo/pools/turnos justos, regras finais de ouvido/assinatura/idade e consentimento antes de destruição. |
| G5 público | Aberto: domínio/TLS/ingresso e PoC de entrega restrita/Range/revogação, defaults de links e permissões de redistribuição. |
| G6 integrações | Aberto por fase: Telegram e notificações recuperáveis, MCP/escopos, agy isolado/autenticado e capacidade visual real. |

TDD, cobertura e CI são obrigações desde a fundação. Limites numéricos, janelas de credencial e limiar de arquivo significativo são propostas registradas nos ADRs, a ratificar no harness/configuração sem enfraquecer testes de comportamento crítico.

## 11. Histórico

- v0.1: entrada URL, biblioteca por site, automação, tags/capa/resumo, retenção, OpenRouter/MCP.
- v0.2: descrição narrada de imagens e voz gratuita selecionável.
- v0.3: análise visual configurável/alternativa textual, Docker, playlists e três visualizações.
- v0.4: temas Claro/Dracula, perfis, links e categorias.
- v0.5: ponte Python/execução agy automática proposta inicialmente por webhook.
- v0.6: instalação agy/Python em Docker confirmada; coabitação inicialmente proposta.
- v0.7: defesa contra prompt injection, ponte/runner separados e Slim opcional.
- v0.8: pull/spool, listeners separados, limites de confiança e revisão de contratos.
- v0.9: consolidação sem regras superadas; fronteiras de rede/parser, artefatos, mídia/providers/admin, busca/leases/retensão e escopo como gate inicial.
- v1.0: escopo confirmado de uma casa; biblioteca compartilhada, configurações da instalação e perfis pessoais; removida complexidade multi-tenant obrigatória do MVP.
- v1.1: TDD solicitado como diretriz obrigatória; ciclo RED/GREEN/REFACTOR, testes por risco/contrato e gates contínuos no CI.
- v1.2: cobertura obrigatória acima de 80%, Playwright funcional/visual e projeto de extensão Chromium com token próprio e limites de segurança.
- v1.3: captura textual autenticada consentida, notificações duráveis no frontend, bot Telegram privado e política unificada contra abuso de API/canais.
- v1.4: reconciliação de autoria/estados, persistência da extensão/popup, captura privada com rota local, pools de fila, Gate 0 e separação entre requisitos e implementação.
- v1.4 (rev. 26/10/2026): preferência de perfil para compartilhar novas capturas com a casa automaticamente (RF79, RF83, §4, CA117, ADR-06).

Arquivo Figma anterior representa v0.3 visual, sem revisões posteriores aplicadas por limite do plano: https://www.figma.com/design/S1t5CMFoHtsy40ZefVr0Sr?node-id=2-25 . Não comprova entrega de funcionalidades atuais.

## 12. Desenvolvimento e qualidade

| ID | Diretriz |
| --- | --- |
| RD01 | TDD: teste antes do novo comportamento, RED pelo motivo esperado, GREEN com implementação necessária e REFACTOR mantendo regressão verde. |
| RD02 | Bug começa por reprodução automatizada; refatoração usa cobertura existente e amplia lacunas reais. |
| RD03 | Testar comportamento/contrato e falhas relevantes, sem espelhar detalhe privado da implementação ou inflar cobertura artificialmente. |
| RD04 | Separar testes de domínio, contrato, integração, interface e segurança real; mocks não comprovam isolamento, rede ou restore. |
| RD05 | Suíte cotidiana determinística, sem OAuth pessoal, dados privados ou inferência paga. Qualificação real é ambiente separado e controlado. |
| RD06 | CI desde o primeiro teste; gates obrigatórios bloqueiam merge/release. Registrar RED/GREEN na revisão, sem commits quebrados obrigatórios. |
| RD07 | Cobertura estritamente >80% por projeto e diff executável; política de arquivo significativo, migrations e exclusões conforme ADR-10, que substitui o piso uniforme da v1.3. |
| RD08 | Playwright para fluxos críticos, acessibilidade funcional e regressão visual Claro/Dracula desktop/móvel; extensão instalada também é qualificada. |
| RD09 | Cenários críticos de autorização, retenção, custos, isolamento e recuperação não podem ser omitidos invocando os 20% restantes. |

Cobertura de fonte própria inclui arquivos não executados. Testes, terceiros e saída gerada sem edição não inflacionam produção. Migrations têm verificação de evolução/rollback/restore, não exigência percentual sem significado. CSS/HTML estático/infraestrutura são validados por comportamento/layout/integração. Referências visuais são revisadas, nunca atualizadas automaticamente para esconder regressão. Testes reduzem risco e não garantem ausência absoluta de quebra.
