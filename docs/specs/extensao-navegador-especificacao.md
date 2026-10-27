# Extensão de navegador — especificação v0.3

Data: 25/10/2026. Requisitos v1.4, plano técnico v0.8, decisoes-e-estados.md v0.1. Este arquivo substitui integralmente a v0.2; nenhuma extensão foi implementada/publicada. Identidades e enums persistidos são os canônicos, não listas independentes deste documento.

## 1. Escopo e experiência

Chromium desktop primeiro; Brave real será qualificado se escolhido no Gate 0. Opera/Firefox são evolução com adaptadores/manifests/testes próprios, não suporte automático. Projeto TypeScript candidato apps/browser-extension, núcleo de URL/API/config/preview separado de BrowserAdapter. Manifest V3 e dependências mínimas; UI pequena com temas Claro ValueTI/Dracula. Build/pacote/versão próprios; Docker pode construir, mas a extensão roda no browser, não no Compose.

Servidor HTTPS continua configurável conforme RF62, com default de build opcional. Build fixo/policy para uma instalação é variante futura, não remoção da configuração solicitada. Navegador alcança API privada pela LAN/VPN; sem conexão, não abrir porta pública nem usar o domínio de shares como fallback.

**Clique na barra abre popup**, com URL/domínio capturado da aba, “Enviar URL”, “Capturar texto” e “Configurações”. URL comum precisa do botão enviar; captura abre preview dedicada. Sem contextMenus ou commands neste incremento. Não usar action.onClicked para envio se default_popup está definido. Quando necessário após fechar o popup, feedback/preview permanece em página interna acessível, sem perder o resultado de uma requisição em andamento.

Nenhum envio de navegação automática, cookies/sessões, histórico, storage da página, HTML bruto ou frames externos. Captura textual é leitura pontual consentida do DOM já acessível. Sem executor IA/MCP/terminal no browser e sem código remoto.

## 2. Configuração, pareamento e persistência

Opções: servidor/base path HTTPS, parear por código ou token manual mascarado, testar conexão, modo persistente/temporário e desconectar. Mostrar destino e perfil associado. Trocar destino cancela operações antigas, remove permissão anterior desnecessária e limpa token/pareamento; não reaproveitar credencial em servidor novo. Não seguir redirects autenticados ou oferecer bypass de certificado em produção.

Padrão: storage.local, TRUSTED_CONTEXTS, sem sync, com aviso de persistência ao salvar/parear. Atualização/reinício normal conserva a credencial, sem exigir rotação. Não é cofre: malware/perfil/browser/atualização comprometidos podem roubá-la. Não prometer segurança por cifra com chave embutida. Preview/URL transitória e estado de operação ficam em storage.session com TTL/limpeza; não criar histórico persistente de navegação.

Modo temporário é opção explícita: usa storage.session e perde credencial ao reiniciar/recarregar/atualizar. O usuário pode reinserir a mesma credencial ainda válida, se guardada em gerenciador, ou parear novamente. “Segredo exibido uma vez” vale ao servidor não recuperar um token perdido, não proíbe reutilizar cópia legítima. Configuração manual continua suportada conforme o requisito original, sem exigir modo temporário.

Pareamento proposto para evitar cópia de segredo:

1. Extensão chama POST /v1/pairings no servidor configurado, com rótulo/versão mínimos. Servidor devolve pairing_id, código curto legível, prazo/intervalo de polling e credencial aleatória **pendente**, mostrada só ao código da extensão e guardada localmente; banco guarda digest. Essa credencial não importa nem lê biblioteca.
2. Usuário entra no painel privado, autentica admin individual, confere código/dispositivo/destino e aprova perfil/escopos. Captura exige concessão adicional explícita. Código sozinho não aprova nada e não é credencial de polling.
3. Aprovação cria/vincula principal e ativa a credencial já entregue, sem segundo envio do segredo. A extensão consulta estado mínimo com credencial pendente em Authorization, limitada a esse pairing; ao aprovar, testa o contexto autenticado. ACK do armazenamento só muda estado delivered, não dá novos poderes.
4. Polling tem intervalo/backoff, TTL e quotas de tentativas/pendências. Negação/expiração limpa credencial pendente. Se a resposta inicial se perder antes de salvar, aquela pendência expira e novo pareamento é explícito; não existir token plaintext permanentemente recuperável no servidor. Reinício com token pendente salvo retoma o status.

Propostas: código legível 8 caracteres aleatórios com rate limit, credencial 32 bytes aleatórios, TTL 10min para aprovação; token ativo tem inatividade 30 dias e vida absoluta 90 dias. Uso válido estende idle só até teto absoluto. Não há renovação infinita sem reaprovar; revogação interrompe novas chamadas. Retorno sempre deriva perfil/scopes do servidor. Hostname/rótulo do cliente não são atestado de dispositivo.

Modelo canônico: principals + credentials + imports + import_idempotency em decisoes-e-estados.md §1. Rotacionar credential não muda principal nem quotas/dedup/autoria. Reinstalação que perdeu tudo só retoma um principal antigo mediante vínculo administrativo explícito, nunca por rótulo igual enviado pelo cliente.

## 3. Fluxo URL e captura

Ao abrir popup, capturar tab/document/URL em contexto autorizado. Antes de executar uma ação, verificar que ainda se trata do documento escolhido; se mudou, atualizar a seleção explicitamente ou abortar. Nunca reler silenciosamente outra aba após awaits e enviar o que não foi escolhido. activeTab não é permissão para varrer abas.

Modo URL: validar HTTP/HTTPS, comprimento e userinfo; remover fragmento, avisar parâmetros possivelmente secretos sem apagar query funcional indiscriminadamente. Heurística não detecta todo segredo em path/query. Botão Enviar gera chave por intenção e chama endpoint fixo; timeout pode ter sido aceito e não é autorização para criar processamento novo sem dedupe.

Modo Capturar texto: activeTab+scripting, script empacotado uma vez no mundo ISOLATED do frame principal/documento, sem MAIN/allFrames, APIs de cookies/storage ou requests. Extrator não recebe token/servidor e retorna apenas esquema textual limitado por executeScript. Limitar nós/tempo/bytes, excluir password/input/textarea/contenteditable/formulários/hidden e conteúdo externo. A página pode alterar DOM; isolamento JavaScript não é prova de conteúdo seguro/autêntico. Onde o browser proíbe, informar limitação sem pedir acesso global para contornar.

Prévia editável em página interna, sem carregar imagens/links. Mostrar texto/contagem/destino/visibilidade e caminho local/externo escolhido; confirmar só depois da revisão. Texto sensível visível pode permanecer e precisa da revisão humana. Cancelar apaga buffers. Sem upload binário/HTML/gzip: proposta 1 MiB JSON e 100 mil caracteres, além de quotas TTS. Campo source_url é proveniência declarada, nunca ordem para fetch automático.

Captura default private_to_profile, derivada do perfil do principal. Perfil precisa de desbloqueio individual para privacidade real; ausência pede configurar PIN/passkey, não simplesmente trocar avatar. Não colocar PIN no token/URL/extrator. Compartilhamento é escolha explícita com aviso, não fallback: por captura ou pela preferência de perfil “compartilhar com a casa automaticamente” (ADR-06). Com ela ligada, a prévia mostra o destino household e oferece “manter esta privada”; o campo enviado só pode restringir a visibilidade. Rota local obrigatória: resumo extrativo/tags do texto/capa genérica/voz offline. IA/TTS online e publicação exigem consentimentos próprios; não aguardar provedor externo se o usuário escolheu caminho local.

Capturas usam contexto/revisão/hash do servidor e não se associam automaticamente ao post compartilhado da mesma URL. Mesmo contexto/conteúdo pode ser deduplicado; diferenças criam revisão/item próprio sem overwrite silencioso. Imagens privadas não são buscadas; capa genérica e descrições textuais disponíveis no primeiro incremento.

Categoria: card conhecido conserva sua categoria; novo usa padrão aprovado do principal ou fica import.state=awaiting_category com reason_code=category_required. Isso não é erro de TTS. Escuta/custos/visibilidade não podem ser definidos livremente pelo payload.

## 4. Contrato HTTP

Rotas privadas HTTPS v1. Extensão usa Bearer de kind/audience/scopes próprios, nunca senha da casa, token MCP, provider key ou capability de worker. Sem cookie como fallback. Servidor deriva principal/perfil/limites/visibilidade permitida e rejeita campos administrativos extras. APIs de cliente têm credencial própria, Telegram usa binding.

| Rota | Resultado/escopo |
| --- | --- |
| POST /v1/pairings | Início limitado, credencial pendente sem poderes de processamento; aprovação acontece só no painel admin. |
| GET /v1/pairings/{id} | Estado mínimo do próprio pareamento; Bearer pendente em header, não em query. |
| GET /v1/extension/context | Perfil/rótulo/prazo/schema mínimo da credencial válida, sem listar biblioteca/perfis. |
| POST /v1/imports | url + Idempotency-Key; imports:create; retorna import_id/state/reason_code/indicação de associação existente. |
| POST /v1/captures | source_url declarado/título/blocos/schema; captures:create adicional e Idempotency-Key, retorna import_id. |
| GET /v1/imports/{id} | imports:read-own; ownership por principal_id, não credential_id. Sem corpo bruto/segredos de job. |

Idempotência: principal+operation+key, com payload_digest. Chave igual/outro payload →409; rotação de token do mesmo principal preserva replay. Janela proposta 24h; dedupe de URL/contexto continua independente e não força regeneração de áudio removido. Criação de import/job/reserva é atômica. 202 para entrada pendente, 200 associação/reapresentação conforme contrato; HTTP não substitui enum de entidade. 401 credencial, 403 scope, 404 objeto alheio, 409 conflito, 413 corpo, 429 Retry-After e 503 indisponibilidade. Falhas mantêm mensagens limitadas e sem HTML.

Import/state, job/attempt, captura e delivery vêm apenas do glossário canônico. category_required/invalid_url são reason/error codes, duplicate é resultado de associação. Popup pode ter estados locais unconfigured/preview/submitting/offline/unknown_outcome; não persistir esses nomes como novos estados de job. Aceito não significa pronto. Desconexão/reinício recupera status conhecido ou declara resultado incerto.

Chamadas só ao destino/base path configurados e às rotas fixas. credentials: omit, cache: no-store, referrerPolicy: no-referrer, redirect: error. Sem token na URL, iframe ou resposta ao conteúdo. Secret digitado manualmente fica mascarado; não exportar em diagnóstico/log/trace.

Service worker/background com host permission dispensa CORS liberado para a extensão. Endpoints de cliente não anunciam CORS genérico nem dependem de Origin como identidade. UI web mantém CORS/CSRF separados. Qualificar nova plataforma sem afrouxar autenticação para fazê-la funcionar.

## 5. Permissões e distribuição

Manifest V3 com activeTab e storage, scripting opcional para captura; sem tabs global, cookies/history/debugger/webRequest/downloads/clipboardRead/nativeMessaging. Popup dispensa contextMenus/commands. Servidor genérico requer optional_host_permissions com HTTPS disponível no manifesto e concessão efetiva só ao destino configurado, não wildcard global. Negação/removal falha claramente, sem envio. Host permission não autoriza path nem substitui scope do servidor.

Sem content scripts persistentes, runtime.onMessageExternal/onConnectExternal ou ponte window.postMessage. Resultado de captura volta por executeScript; se houver mensagens internas, validar sender.id, página interna e schema/ação, sem fetch arbitrário. Omitir externamente conectável sem handler externo é parte da proteção; ausência da chave sozinha não é garantia. Sem web-accessible resources desnecessários.

CSP de scripts próprios/sem eval/remote/inline executável, object-src none; pacotes/ícones/fontes locais. Conexões HTTPS sujeitas a host permission e validação exata em código: CSP estática de pacote configurável não fixa sozinha cada destino em runtime. Dados são texto, sem innerHTML. Modo anônimo/incógnito inicial desabilitado e file/chrome/about/data/javascript/blob URLs rejeitados.

Distribuição unpacked ou loja/policy será escolhida no Gate 2; policy/ID/trust variam conforme browser/OS/versão e não se assumem por um caminho Linux universal. Build pode trazer servidor default, mas variante fixa só com decisão explícita. Proteger publisher com MFA e pacote/deps fixados/revisados. Loja/assinatura não provam código benigno.

## 6. Avisos e privacidade

Frontend tem central por perfil e SSE/polling; Push opt-in não exige a extensão ler todos os jobs ou receber token administrativo. Avisos da captura privada são genéricos por padrão e levam a player privado com sessão/desbloqueio revalidado. Não criar share público ao importar. Logout/troca de perfil revoga contexto do dispositivo anterior, sem mostrar conteúdo de outro perfil.

No Brave, detectar indisponibilidade de Push e orientar sobre serviço Google/opção/permissão; não ativar automaticamente. Sem Push, conexão ativa/central ao reconectar continuam. Browser/OS encerrados/rede podem impedir entrega; nenhum teste de popup comprova Push externo.

Riscos residuais: browser/malware/extensão comprometidos podem extrair credencial local; usuário pode aprovar servidor enganoso; heurística pode não identificar segredo no texto/URL; DOM pode conter prompt injection; operador root pode ler capturas. Reduzir alcance com escopos/TTL/revogação/quotas, preview e rota local, bloqueio individual de perfil e consentimentos específicos. Proteção de perfil não equivale a separação entre famílias.

## 7. TDD e qualificação

Aplicar RD01–09 e ADR-10. Mais de 80% por projeto/diff e piso de arquivo significativo; fontes não executadas entram. Novo comportamento começa RED, implementação GREEN e refatoração. Mocks do BrowserAdapter não substituem teste de permissões/storage/script na extensão instalada.

Playwright com Chromium bundled/contexto persistente descartável e servidores/credenciais fictícios. Testar popup e escolha dos modos, captura de página fictícia autenticada, exclusão de campos, navegação durante captura, preview/cancelamento, offline e payload excessivo, POST no destino certo, redirect negado, principal ownership e rotação, pareamento negado/expirado/retomado, restart/upgrade conservando credencial local, sessão temporária, captura privada e conclusão local sem requests externos. Negar tentativas de ler texto privado por outro perfil, inclusive busca/contagens/snapshots/Range e aviso.

Comparação visual Claro/Dracula, keyboard/foco/feedback; baselines revisadas em ambiente fixo. Smoke da ação real da barra/permissões no browser alvo; page.click não garante automação da barra nativa. Nenhum perfil pessoal, OAuth ou inferência paga nos testes comuns. Logs/traces usam tokens fictícios e redação de Authorization. Browser real alvo/TLS/versão e distribuição são gates, não inferência a partir de Chromium do CI.

## 8. Histórico e referências

v0.1 URL/token; v0.2 captura/avisos/cotas; v0.3 reconciliação com popup, credencial persistente/pareamento, principals/enums únicos, captura privada com rota local e política de cobertura revisada. Esta versão não mantém a regra antiga de storage.session default ou imports por token_id.

Fontes primárias consultadas em 25/10/2026: https://developer.chrome.com/docs/extensions/develop/concepts/activeTab ; https://developer.chrome.com/docs/extensions/reference/api/permissions ; https://developer.chrome.com/docs/extensions/reference/api/storage ; https://developer.chrome.com/docs/extensions/reference/api/scripting ; https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure ; https://developer.chrome.com/docs/extensions/develop/concepts/network-requests ; https://playwright.dev/docs/chrome-extensions ; https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension ; https://support.brave.com/hc/en-us/articles/360017989132-How-do-I-change-my-Privacy-Settings- .
