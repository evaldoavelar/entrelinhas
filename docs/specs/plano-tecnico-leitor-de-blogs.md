# Leitor de blogs em áudio — plano técnico v0.8

Data: 25/10/2026. Requisitos: requisitos-leitor-de-blogs.md v1.4. Extensão: extensao-navegador-especificacao.md v0.3. Fonte canônica de identidades/enums/ADRs: decisoes-e-estados.md v0.1.
Estado: planejamento documental. Substitui integralmente o plano v0.7; nenhum isolamento, TLS, integração ou teste de produto foi comprovado. Consolidar o plano remove alternativas antigas como regras simultâneas, sem apagar funcionalidades do escopo total.

## 1. Escopo e Gate 0

Uma casa, biblioteca compartilhada e perfis; capturas privadas são exceção explícita. Sem tenants/famílias/RLS multi-tenant. Autorização por principal, perfil, objeto, visibilidade e admin continua necessária. Operador de host/deploy é root-equivalente e alcança dados/segredos.

Gate 0 antecede código de produto. Registrar host físico/VM/LXC, distro/kernel/CPU/RAM/discos, Docker/runtime/seccomp/AppArmor/userns, limites de recursos, TLS e browser/versão real. Se Proxmox for escolhido, preferir VM dedicada como baseline; LXC aninhado exige projeto/PoC próprios. Não assumir que o ambiente atual de documentos representa o home lab.

Primeira PoC: criar/descartar ambiente de parser/mídia por tarefa, negar rede/DB/segredos e provar ausência de arquivos/processos/HOME da tarefa A na B. nsjail/bubblewrap dentro de Docker podem precisar de syscalls/userns recusados pelo runtime/host. Registrar versões, flags e política; não presumir execução sob seccomp padrão. Não liberar privileged, SYS_ADMIN amplo, Docker socket no app ou seccomp/AppArmor unconfined como atalho. Exceção mínima específica de política exige revisão e teste. Se não funcionar, gate falha: mudar para executor externo com ambiente realmente recriado por tarefa/VM, não fingir isolamento com pool persistente ou só instalar gVisor.

CI mínimo e scripts descartáveis de PoC são trabalho do Gate 0, não implementação prematura de produto. Só depois de provar sandbox/TLS/browser passam a fundação e os incrementos TDD. Gate fechado não autoriza presumir o restante validado.

## 2. Stack e implantação proporcional

Stack proposta: Python/FastAPI/Pydantic, PostgreSQL (baseline 18 a confirmar), SQLAlchemy/Alembic; React/TypeScript/Vite, componentes acessíveis, tokens Claro/Dracula. Compose; Actions/GHCR propostos. Sem Redis, Elasticsearch ou Kubernetes obrigatórios.

Baseline de núcleo com OpenRouter: oito serviços, alguns opcionais quando o recurso não é usado. Não instalar todos os serviços/fases desde o dia 1.

| Serviço Compose | Responsabilidade e privilégio |
| --- | --- |
| gateway-private | TLS e ingresso privado; sem mídia global/chaves de provider; aplicação por rede privada. |
| app | API privada/domínio, listener interno de tarefas em porta separada, coordenador/scheduler, orquestração light/heavy, armazenamento passivo de artefatos e módulos de avisos/Telegram quando habilitados. DB/mídia próprios, sem parsing hostil/codecs/agy e sem key OpenRouter. |
| db | PostgreSQL, papel runtime limitado e migração separado; storage protegido contra mídia cheia. |
| egress-proxy | Política de destino fora do fetcher/parser; Smokescreen candidato sujeito a teste. |
| fetcher | HTTP/TLS com limites, rede somente pelo proxy; sem parser complexo/DB/mídia global/chaves. |
| parser-sandbox | HTML/feed/XML, sem rede/DB/segredos, ambiente novo por tentativa. |
| media-sandbox | Toda decodificação de imagem, FFmpeg/ffprobe e TTS offline; sem rede/DB/segredos e ambiente novo por tentativa. |
| provider-proxy | Só OpenRouter, segredo da instalação e chamadas estruturadas autorizadas; sem Edge/codecs/biblioteca global. |

TTS online Edge adiciona tts-online quando habilitado, sem chave OpenRouter. Share público adiciona gateway-share e api-share apenas na fase correspondente. agy adiciona agent-bridge/agy-runner só na fase de agente. Infra de executor por tarefa pode requerer componente do operador definido na PoC: não esconder isso para prometer um número fixo. Pool/processo não é isolamento entre tarefas.

No app, notificações e Telegram são módulos/tarefas limitadas; não precisam de serviços próprios inicialmente. Controles de etapa/fila light/heavy ficam no app, mas processos hostis permanecem fora. Essa consolidação amplia o alcance de falha/comprometimento do app a DB, mídia e módulos ali reunidos; papéis SQL no mesmo processo não são barreira contra RCE nele. Separar no futuro por evidência de carga/risco, não por nome funcional.

## 3. TLS, rede e browsers

Escolher no Gate 0:

- Domínio real neutro com ACME DNS-01, DNS privado/split DNS e credencial DNS mínima no mecanismo de renovação, fora do app; não exige expor login privado. Certificado publicamente confiável publica nomes em CT, portanto hostname não é segredo.
- Ou CA interna, com raiz confiada nos stores do OS/browser/dispositivos reais e renovação testada. No Chromium Linux, confirmar store/NSS e seu caminho pela versão/empacotamento; não presumir um caminho universal nem ignorar erro. Nunca distribuir a chave da CA para clientes.

Testar extensão, service worker e notificações com certificado válido e renovação. HTTP só localhost de desenvolvimento sem dados reais. UI/admin privados por LAN/VPN/HTTPS; ACL deny-by-default para endpoints necessários, sem acesso genérico a LAN/peers. Estar na VPN não autentica o app. Gateway valida Host/authority exato e headers de proxy confiáveis, Origin/CSRF para sessões. Cookies __Host-, Secure, HttpOnly, Path=/, sem Domain; SameSite é defesa auxiliar, subdomínios irmãos continuam same-site.

Público usa ingresso/hostname próprios, preferencialmente outro domínio registrável, sem SPA/login/admin/jobs/MCP/imports. Não habilitar share externo antes de DNS/TLS/ingresso específicos. Proposta de proxy privado continua aberta ao Gate 0; X-Accel-Redirect da fase pública exige Nginx, não Caddy nativo.

Qualificar Chromium e, se for o navegador escolhido pelo usuário, Brave na versão instalada. No Brave, Web Push depende da configuração “Use Google Services for Push Messaging” e permissão; verificar o estado real e não habilitar serviços Google silenciosamente. Falta de Push cai para SSE/polling com UI conectada e central ao retornar. Chromium do CI não comprova funcionamento no Brave real/Opera/Firefox.

## 4. Principal, credenciais e perfis

Modelo único em decisoes-e-estados.md §1. Não repetir tabelas concorrentes aqui: principals identificam cliente/sessão/binding estável, credentials autenticam quando aplicável; imports e idempotência pertencem ao principal. Telegram não precisa de token_id de extensão e rotação de token não muda autoria/cota.

Admin individual: Argon2id+TOTP ou passkey com verificação de usuário; recuperação e revogação documentadas. Senha coletiva/seleção de avatar só servem à escuta comum. Para captura private_to_profile, sessão precisa de desbloqueio individual do perfil (PIN/passkey com hash/rate limit, janela e revogação), com scope/profile derivados do servidor. PIN é opcional para perfil que usa só biblioteca comum; leitura privada exige essa proteção. Reset por operador/admin é auditado, sem promessa de proteção contra root.

Propagar visibility/owner_profile_id aos posts/versões/derivados. Aplicar autorização antes de buscar texto, contar itens, montar snapshot, listar playlist, dar Range ou emitir notificação. Evitar vazamento de existência por resultados/contagens/erros e por ligação automática de captura privada a post comum. FKs/unicidade e autorização no domínio, sem RLS multi-tenant no MVP. Privilege SQL por serviço é útil contra bug, não isolamento de componentes reunidos no app.

Exclusão, redução de retenção com efeito de perda, mudança onerosa de provider/visão e publicação exigem intenção+confirmação admin individual vinculada a operação/alvo/versão/prazo/uso único. Visibilidade privada/compartilhamento requer também decisão explícita do proprietário quando aplicável. Agentes não autoaprovam.

## 5. Pipeline de conteúdo e egress

Fetcher conecta só via proxy externo, sem rota direta IPv4/IPv6/UDP/DNS/host network. Proxy resolve/valida endereço/porta e conecta; não implementar IP pinning HTTPX próprio no MVP. Smokescreen é candidato, não controle já testado. CONNECT não filtra path dentro de TLS nem impede exfiltração em toda infraestrutura multiusuário de provedor; limites permanecem explícitos.

HTTP bytes limitados chegam ao endpoint de artefatos do app, que grava passivamente tamanho/checksum/ID próprios. Parser recebe bytes em sandbox sem rede e devolve blocos/URLs candidatas. Cada feed, página, redirect, favicon, imagem e capa passa pelo mesmo fetcher/proxy. Parser não executa HTTP; XML sem DTD/entidades externas. URLs secundárias não escapam do controle. Fontes locais são exceções de hostname/porta/IP esperado aprovadas pelo operador/admin, nunca subnets privadas liberadas por conta/perfil.

Media-sandbox sem rede faz toda decodificação/normalização e montagem. SVG rejeitado inicialmente; limitar bytes, dimensões, pixels/frames, tempo, memória e CPU. Sem decode no fetcher/app/serviço de chaves. Reencode raster para formatos aprovados; saída ainda é dado não confiável, não caminho/comando.

Artefatos por streams/FD/pipe com backpressure e uploader confiável, capability limitada à tentativa/slot; child não vê segredo do uploader. Sem staging global montado nos sandboxes, symlinks/path escolhidos pelo conteúdo ou leitura de outros assets. App/artifact endpoint calcula checksum/tamanho, promove objetos imutáveis e não interpreta codecs. Se for indispensável upload direto em adaptador futuro, registrar o aumento de segredo visível ao child e limitar estritamente.

## 6. Provedores, segredo da instalação e rota offline

Uma instalação usa secret OpenRouter provisionado pelo operador e montado só no provider-proxy. Sem sealed-box/provider_configs cifrados pela UI nem chave mestra de decriptação do produto. UI ajusta modelos/parâmetros e mostra estado do secret, não recebe a chave neste incremento. Rotação é operação de deploy controlada. Secret Compose local pode ser arquivo montado: proteger permissões, backup e operador, sem afirmar criptografia em repouso automática.

Provider-proxy aceita endpoint OpenRouter fixo, modelos/operação congelados, capability/fencing e orçamento, com veto visual/consentimento vigentes antes de cada chamada. Não aceita URL callback/header arbitrários nem é forward proxy. Só fornece inferência; não recebe FFmpeg, HTML nem protocolo Edge. Comprometimento dele expõe a chave de instalação ali montada: quotas do provedor e app reduzem alcance, não eliminam.

Edge em serviço tts-online separado: egress Microsoft aprovado, texto autorizado, stream limitado como artefato; sem DB/chave OpenRouter/OAuth/volume global. Adapter não oficial pode quebrar; validar termos/acesso antes de habilitar e informar que texto vai à Microsoft. Não há fallback pago ou online silencioso. Falha de tts-online não amplia privilégios do proxy de chaves.

TTS offline funcional integra o núcleo: eSpeak NG disponível; Piper e voz local qualificados são recomendados para qualidade e obrigatórios quando selecionados, com modelo/version/checksum provisionados fora da imagem base. Media-sandbox não baixa modelos. Imagem/modelo ausente bloqueia a opção correspondente, não todo caminho local: eSpeak permanece disponível. Testar prosódia/idioma/prévia; não equiparar qualidade robótica à do Edge.

Captura tem rota local completa antes de ser habilitada: extração já enviada → resumo extrativo de trechos + tags heurísticas → roteiro com descrições textuais disponíveis → capa genérica → voz local → metadados/arquivo. Não usar ausência de modelo abstrativo local como motivo para parar todas as capturas. Resumo é fiel por seleção de texto e explicitamente marcado extrativo. IA/TTS online só se o usuário optar e a política administrativa específica permitir. Consentimento de artigo público não cobre captura privada; classificação/modelo/token não removem o veto.

## 7. Captura e extensão

Contrato detalhado em extensao-navegador-especificacao.md v0.3. Popup obrigatório com Enviar URL/Capturar texto/Configurações; sem contextMenus/commands no incremento. Credencial persistente local por padrão, pareamento aprovado preferencial e token manual suportado; servidor continua configurável, variante de build fixo é opção futura.

Extrator empacotado roda pontualmente no mundo ISOLATED, frame principal/documento autorizado; não recebe servidor/token nem faz requests. Excluir formulários/password/input/textarea/contenteditable/hidden, sem serializar HTML completo ou frames externos. Limitar nós/tempo/bytes e conferir navegação/documento no retorno. Isolated world não torna DOM confiável. Prévia editável obriga confirmação de destino/visibilidade/saída de conteúdo, sem carregar imagens/links do preview.

POST /v1/captures exige captures:create explícito e recebe schema fechado de texto/source_url declarado/título/blocos. Sem cookies/binários/gzip/HTML; origem não é atestado de autenticidade nem motivo para fetch automático. Proposta de limite: 1 MiB JSON e 100 mil caracteres, ambos, com TTS possivelmente menor. Servidor marca potentially_private e aplica a visibilidade pela preferência do perfil (private_to_profile por padrão; household só com compartilhamento automático ligado pelo dono e sem exceção de site/captura), autoriza principal/profile e usa contexto gerado no servidor.

captured_documents referencia import/principal e contexto/revisão/hash. Mesma URL de post comum cria item separado de captura, sem overwrite/associação automática; mesmo contexto/hash pode deduplicar. Associação manual futura é gate explícito de produto. Compartilhar captura muda visibilidade mediante consentimento próprio; regeneração conserva sensibilidade/owner por padrão. Retenção cobre texto e derivados/backups. Acesso comum à biblioteca não autoriza ler captura privada.

Sem imagens binárias no incremento: capa genérica, alt/legenda útil como texto, sem buscar URL assinada/privada. Captura não tenta contornar acesso que o browser não disponibiliza. Sem código remoto, mensageria externa ou scripts em todas as páginas.

## 8. Contrato API e CORS

Privado, versionado, Pydantic com campos extras proibidos, bodies/timeouts limitados e SQL parametrizado. Identidade derivada da autenticação e tipo/audience/scopes por rota; não aceitar profile_id/role/provider/priority livre no payload. Sessão web usa cookies/CSRF; API/extension Bearer não aceitam cookie fallback. MCP/Telegram mantêm adapters próprios para o mesmo serviço de domínio.

| Rota | Função |
| --- | --- |
| POST /v1/imports | URL + Idempotency-Key; criação de intenção, categoria, admissão e dedupe. |
| POST /v1/captures | Captura textual com scope adicional e política de privacidade. |
| GET /v1/imports/{id} | Status do próprio principal, sem HTML/segredos de job. |
| GET /v1/extension/context | Teste/contexto mínimo do cliente de extensão, sem listar perfis/biblioteca. |
| POST /v1/pairings | Início limitado de pareamento; ver contrato de extensão. |
| GET /v1/pairings/{id} | Estado mínimo, autenticado pela credencial pendente, sem segredo em URL. |

Idempotência é principal+operation+key, com payload_digest; mesma chave/outro payload →409. Rotação de credential preserva replay do mesmo principal. Deduplicação de URL/contexto é independente da janela de idempotência. Novo pedido a áudio já pronto devolve disponibilidade, não força regeneração de arquivo limpo. Transação de import+job/reserva atômica. GET nunca inicia conversão.

Import aceita awaiting_category com reason_code=category_required; não usar category_required como estado ou misturar com falha HTTP de autenticação. 202 entrada pendente, 200 associação/reapresentação conforme contrato; 401 credencial inválida, 403 scope, 404 objeto não autorizado, 409 conflito, 413 excesso, 429 Retry-After, 503 indisponibilidade. Timeout do cliente não prova rejeição no servidor.

Background de extensão com host permission dispensa liberação CORS para requests ao servidor. Rotas Bearer não anunciam Access-Control-Allow-Origin só para esse cliente e não usam cookies; CORS não é autenticação. UI same-origin mantém política própria, CSRF e Host. Pareamento e APIs ainda precisam de credenciais, limites, validação de destino e TLS; não aceitar Origin como identidade. Firefox futuro exige teste próprio, sem remover auth para resolver compatibilidade.

## 9. Filas, backlog, estados e agy

Única lista de enums: decisoes-e-estados.md §2. Job não tem superseded/reconciling; tentativa tem. Estados de produto incluem quota_exceeded, needs_review e reconciling como projeção, não controle do lease. Códigos de erro/estados de popup não ampliam enums persistidos.

Descoberta de fontes cria candidate_posts/source_backlog com URLs/IDs mínimos e unicidade, limitado por quota de catálogo; scheduler não baixa conteúdo. 500 referências não são 500 jobs admitidos nem reservam todos os slots. Pools separados interativo/automação: interativo proposto 5 intenções por perfil/20 instalação; automação 4 jobs globais/2 por fonte, com importação histórica paginada. Teto global de custo/disco se aplica a ambos. Ajustes dependem do host, sem default ilimitado.

Capacidades light/heavy/agy independentes, inicialmente 1 de execução cada quando habilitadas. Scheduler reserva atendimento interativo e alterna com automação/aging quando ambos aguardam; uma rodada manual após heavy terminar não é bloqueada por automação que ocupa todos os slots. TTS longo em chunks limitados com montagem final, sem prometer preempção de inferência em curso. Limitar também número de chunks por intenção para não multiplicar backlog.

Claim gera capability por job/attempt/operation/audience curta, digest central; executor vê só sua fila. Configuração congelada no job; antes de cada chamada visual reler veto atual, habilitar depois não altera snapshot. Resultado e próxima etapa na mesma transação/unique. Scheduler usa agenda mínima source_schedule, sem ler artigo para descobrir pelo próprio DB.

Lease: heartbeat independente da inferência, tentativa vence → reconciling com mesma attempt_no; apenas original entrega na carência, sem nova tentativa emitida. Depois superseded, revogação e fencing maior na nova tentativa. Job fica running durante reconciliação e retry_wait ao reagendar. Entrega de tentativa antiga não publica.

agy só na fase 7, instalado em runner Docker com adaptador Python, sem depender de IDE/host. Bridge separado do runner, pull interno, identidade restrita; sem webhook/outbox de despacho. Spool SQLite/arquivos atômicos+fsync guarda IDs, tentativa, checksum/payload, nunca capabilities. Após reinício, delivery-renew pela identidade reautoriza só tentativa válida. ACK durável permite limpar; queda antes de fsync pode repetir inferência. Sem exatamente-uma-chamada externa.

Conta Google dedicada obrigatória, OAuth montado no menor path, HOME/workspace/skills/sessões/contexto novos por tarefa, sem histórico que vaze ao job seguinte. Egress hosts exatos e nenhuma ferramenta de terminal/escrita/MCP mutante/subagente no resumo. Anexo visual real precisa de PoC da CLI; texto puro não comprova visão e não autoriza fallback OpenRouter. Não liberar permissões se o sandbox falhar. Segredos OAuth continuam poder concentrado no runner; termos/cotas precisam ser verificados.

MCP na fase 7 mantém listener privado, sem rota pelo gateway público. Cada cliente é principal kind=mcp com credencial opaca própria, digest, audience/escopos/perfil, validade, rotação e revogação; testar Authorization customizado no cliente alvo. Esse contrato privado não equivale a OAuth genérico; OAuth 2.1/IdP, se necessário, é incremento explícito. Sessão que lê artigo usa content:read/process e não inclui tools mutantes; exclusões/configuração onerosa usam sessão/credencial e intenção separadas com confirmação humana individual de uso único. Não confiar no artigo/agente para obter poderes adicionais, e não repassar chaves administrativas ao runner. Listener interno também não torna o transporte uma identidade: chamadas sempre validam o principal/capability adequado.

## 10. Busca, consumo e retenção

PostgreSQL text search com search_config por documento para tsvector armazenado e dicionário unaccent antes de stemming. Consulta RHS constante combinando configs permitidas por websearch_to_tsquery, não configuração dependente da linha. GIN validado por EXPLAIN em dados representativos; pg_trgm somente título/tags normalizados. Não criar wrapper falso IMMUTABLE só para indexar unaccent.

Headline nunca entra como HTML confiável: offsets/tokens ou marcadores não HTML escapados, sem innerHTML. Autorização/visibility filtra conjunto antes de resultado, contagem e snapshot. Snapshot uma linha com array limitado de IDs/ordem, filtro/principal/perfil/visibilidade/TTL; cursor íntegro e sem segredo. Revalidar acesso/deleção/desbloqueio a cada lote; cache não revela dados privados após troca de perfil. Debounce/cancelamento e job TTL.

profile_post_consumption(profile, post, content_version) define ouvido lógico. playback_progress(profile, asset) define posição técnica. profile_post_state favorito/arquivado; profile_post_subscriptions explicita quem acompanha a versão. Nova voz não reseta ouvido; versão textual nova tem estado próprio. Inicialmente criador manual acompanha e fontes usam perfis configurados, sem obrigação retroativa a novo perfil. Playlist resolve asset ativo ao começar e fixa durante execução; share fixa versão permanentemente.

Idade padrão 90 dias, relógio proposto asset.ready_at. Link/regeneração não renova o antigo e share não ultrapassa retained_until. Limpeza após ouvir considera subscriptions e regra aprovada; 95%/marcação, início da limpeza, idade prevalecer sobre não ouvido e preservação de favoritos continuam gates antes de exclusão. Arquivamento de um perfil não apaga mídia dos demais. Conteúdo privado não é implicitamente assinatura de todos.

Objetos imutáveis, tombstone bloqueia acesso antes do purge; carência/pins protegem backup. Nomes gerados, sanitização de Content-Disposition/ID3, limites em título/resumo/tags e proibição de URLs nos campos de inferência do contrato inicial. Textos são dados, nunca paths/comandos.

## 11. Notificações e Telegram por módulos

Notificações no app: asset ready e notification_event/recipients/deliveries criados atomicamente após promover arquivo validado. Único por evento/perfil/canal/destino. imports mantém autoria por principal e recipients por perfil/binding; modelo não escolhe destino. Delivery tem seu enum canônico. Fila de entrega durável é outbox de notificações, distinto do webhook/outbox de jobs removido. Falha de aviso não renarra nem desfaz ready.

Central persistente por perfil; SSE com sessão/limites/cursor retomável ou polling com backoff, nunca token em query. Revogar/trocar perfil encerra stream/assinatura anterior. Tag estável/coordenação entre abas evita avisar uma vez por aba. Push/service worker é opt-in em HTTPS, VAPID secret próprio; payload genérico e endpoint de assinatura tratado como segredo/SSRF: providers exatos aprovados, TLS, sem rede privada/redirect, egress controlado. Não cachear artigos privados no service worker. Browser/OS encerrados/rede podem atrasar ou impedir entrega; central recupera ao voltar, Brave tem condicionante descrita no §3.

Telegram inicialmente é módulo async no app, sem decoder de artigo e com timeout/filas/tarefas limitados para não bloquear API. Bot token é secret do app quando esse módulo é habilitado, nunca do provider-proxy. Isso amplia o alcance de um comprometimento do app ao bot; risco aceito e documentado, separação em processo futuro se necessária. Bot API usa endpoint fixo api.telegram.org; token no path exige mascarar URL completa em logs/proxy/exceções.

getUpdates/long polling, sem webhook público. Apenas chat privado e from.id/chat.id numéricos de binding ativo; usernames, encaminhamento, bots/grupos não autorizam. Pareamento de uso único por admin+chat, TTL/limites e sem token da API no /start. Proposta até 5 URLs por mensagem, todas consumindo admissão comum. Status só dos próprios pedidos, ajuda/desvinculação; sem exclusão/admin/arquivos/HTML. Conteúdo/preview de Telegram não é texto confiável do artigo.

telegram_updates com unique(bot, update_id) e resultado/rejeição mínima, cursor durável. Só avançar offset após persistir todas as entradas anteriores na ordem recebida; IDs não precisam ser contíguos numericamente. Um poller com lease por bot; reentrega não duplica importação. Retenção upstream até 24h significa que outage prolongado pode perder updates nunca recebidos; alertar e permitir reenvio. Rejeições/spam têm bytes/TTL/cardinalidade limitados, sem corpo completo ou logs infinitos. Webhook anterior exige migração explícita sem apagar pendências silenciosamente.

Entrada Telegram recebe ACK e conclusão no mesmo chat autorizado, além de central/browser do perfil. Mensagem por template/texto puro com preview desligado, sem source_url privada, token, áudio ou share público automático. Link de player ainda exige VPN/sessão. Revalidar binding antes de enviar. Backoff/jitter/teto/Retry-After, bloqueado/revogado encerra; timeout após ACK perdido pode duplicar aviso externo, não prometer exatamente uma entrega.

## 12. Share público simplificado

Fase 5, não MVP. Decisão candidata ADR-09: gateway-share Nginx + api-share sem mount e role DB EXECUTE-only em função de resolução por digest, owner mínimo/search_path fixo, sem SELECT genérico. Não recebe ID/path livre para lookup. Gateway público não encaminha nada privado e não tem chave de provider/OAuth/bot.

Cada GET/HEAD/Range em /s/{token}/... chama api-share; token válido resolve asset/export imutável autorizado e responde X-Accel-Redirect para location internal. Não encadear automaticamente também auth_request; são mecanismos diferentes. A PoC deve validar headers/status/Range/revogação e impedir path traversal e acesso externo ao internal. Se manter Caddy, escolher mecanismo equivalente explicitamente e não colar diretiva Nginx inexistente.

Gateway monta somente public-export read-only, nunca a mídia global. App só exporta cópia de asset após publicação autorizada e reserva de quota; ID opaco e formato conhecido, sem symlink/path do conteúdo. Remover export quando não há share ativo, com prazo operacional e referência; retenção não renova asset original. Cópia extra consome disco e comprometimento do gateway alcança exports remanescentes: risco residual aceito para simplificar, a ratificar na PoC. Se inviável, manter delivery interno e registrar nova ADR; não liberar mount global silenciosamente.

Referrer-Policy: no-referrer, Cache-Control restrito/sem cache que contorne autorização, sem recursos/analytics externos, logs sem bearer. Preview bots acessam GET/HEAD e consomem limites/banda; não são ouvido, não mudam progresso nem consomem link de uso único. Nenhuma rota GET publica/exclui. Um novo Range após revogar falha; download já feito não pode ser recuperado. Proposta 24h/download off/confirmação humana, nunca além de retained_until; autorização para redistribuir permanece responsabilidade de configuração/uso.

## 13. Abuso e limites

Revisão documental, não pentest; controles precisam de prova. Gateway limita IP/conexões/corpo/headers/leitura lenta antes de autenticar, usando apenas proxy headers confiáveis. Domínio controla limites atômicos por principal/perfil/pool/instalação em PostgreSQL/ledger compartilhado entre réplicas; counters de memória isolados não bastam. Token novo/canal diferente não zera quota. Não inflar cardinalidade dos próprios buckets/logs com IDs arbitrários.

Aceitar import+job/reserva de slots/bytes/custo na mesma transação; rejeitar antes de trabalho caro. Reservas liberadas idempotentemente por cancelamento/falha/expiração conciliada, sem expirar enquanto execução válida ainda gasta. Ledger indisponível →503 para caro, nunca modo ilimitado. Estimativa de custo externo não é teto financeiro perfeito; max tokens/modelos/orçamento do provedor complementam com margem. Perfil não pode esgotar tudo só ficando abaixo de requests/minuto.

Defaults propostos a ratificar no host:

| Recurso | Ponto inicial |
| --- | --- |
| Requests de entrada interativa | 10/min por principal e perfil, burst 3; 30/min instalação, burst 6. IP é camada adicional, não lockout de toda a casa. |
| Intenções interativas admitidas | 5/perfil, 20 instalação; separados do pool de automação. |
| Automação admitida | 4 jobs globais/2 por fonte, backlog de referências paginado com quota de catálogo separada. |
| Captura | 1 MiB JSON e 100 mil caracteres, sem compressão/binários; limite TTS pode ser menor. |
| Leituras/status/busca | Status 60/min principal/120 perfil; páginas 20/max50; busca 30/min perfil, 2 mil caracteres e timeout/complexidade limitados. |
| SSE/Push | 2 streams/dispositivo, 8/perfil, 5 subscriptions/perfil; polling alternativo >=30s/backoff. |
| Telegram/pareamento | Até 5 links/mensagem, cada um consome quota; pareamento TTL 10min e rate limitado por IP/código/identidade. |
| Avisos | Teto proposto 8 tentativas/24h; Retry-After, prazo, agrupamento/anti-spam e cancelamento do destino inválido. |

Valores não substituem quotas de custo/duração/disco/banda ainda dependentes do host. Não habilitar recurso sem limite definido. Automação backlog não reserva texto/áudio indefinidamente; preservar dedupe/tombstones com dados mínimos. Login tem backoff combinado IP/conta, sem lockout coletivo rígido.

Testar BOLA/IDOR e enumeração, mass assignment de perfil/role/provider, replay e corridas, CSRF/Host, token de tipo/audience errado, brute force, SQL/command/template/prompt injection, XSS, corpos/expansão/imagens grandes, busca cara, SSE/Push/Range abusivos, API externa hostil e vazamento em logs. TLS e CORS não são autenticação. DDoS que satura uplink precisa também de proteção de borda/rede; quotas de app não garantem disponibilidade diante disso.

## 14. Backup, storage e manutenção

DB, mídia, spool e temp separados com quotas/filesystem/partições reais e alertas: volumes no mesmo disco sem limite não protegem PostgreSQL. Offline models e public-export entram no orçamento. Criptografia de backup protege cópia, não operador root.

Backup consistente: pin contra purge → transação REPEATABLE READ → pg_export_snapshot → manifest nessa mesma transação → pg_dump --snapshot enquanto exportador válido → concluir dump → copiar mídia imutável do manifest → checksums/cobertura → confirmar e liberar pins. Carência maior que intervalo+duração+margem de falha; falha estende proteção com alerta e limite de disco, sem purgar arquivos necessários silenciosamente. Testar restore com conteúdo privado e metadados de autorização também.

Restic/borg candidatos para deduplicação/cifra/cópia, sem prometer consistência DB/mídia por si. Backup key distinta, fora do destino, cópia offline. Secrets OpenRouter/bot/VAPID/OAuth/TLS/DNS ficam no mecanismo do operador e precisam de plano próprio de recuperação/rotação, não no dump como plaintext por conveniência. RPO/RTO/destino pendentes do Gate 0/1.

Scheduler mantém fontes/leases/reconciliação, capacidades expiradas, snapshots TTL, uploads/artefatos órfãos, reservas, sessões/desbloqueio/pareamentos, spool ACK/superseded, tombstones/purge, exports sem referência, notificações/rejeições Telegram limitadas e locks/pins de backup abandonados. Jobs de manutenção têm limites, não viram bypass de visibilidade/retention. Healthcheck não chama modelo: processo/config/tokens presentes não provam autenticação válida, mostrar último sucesso/erro/idade sem restart loop.

## 15. TDD, cobertura e Playwright

TDD desde primeiro incremento: comportamento/critério → teste RED pelo motivo certo → GREEN → refatorar com regressão verde. Import error/ambiente quebrado não é prova do comportamento ausente. Bug começa por reprodução; PR registra evidência sem exigir commits quebrados. CI mínimo acompanha PoCs e cresce por contrato; nenhum untrusted PR roda no home lab ou com segredos pessoais.

Política canônica ADR-10 substitui piso uniforme por arquivo da v0.7: >80% por projeto e diff executável, linhas/branches aplicáveis; arquivos >=20 statements também >80% individual, limiar proposto a ratificar no harness. Pequenos não são excluídos do total/diff; comportamento relevante testado sem artifícios. Migrations recebem testes up/down quando suportado e restore/rollback explícito quando irreversíveis. Não excluir indiscriminadamente código próprio nem fingir downgrade funcional.

Python pytest/coverage.py com source explícito, branches e subprocessos de teste, incluindo fonte não executada; TS Vitest/Testing Library, source include/source maps/relatórios, statements/funções quando disponíveis. Gate em contagens brutas covered*100 > total*80, sem aprovar 80 arredondado. Relatório/fonte faltante falha. Diff usa source maps/linhas alteradas de base exata; denominador zero é N/A. Lista de testes/vendor/gerados/declarations/exceções legítimas versionada e revisada; scripts do próprio gate testados. SQL/infra/layout têm integração/validação real, não percentual fictício. Nunca enfraquecer seccomp para coletar coverage.

Unitários determinísticos de estados, quota/fairness, consentimento/visibilidade, retenção e consumo. Contratos de schemas/capabilities e provedores com fakes. Integração em PostgreSQL real: transações, concorrência, constraints, migrations, função share, FTS; SQLite real no spool. Segurança de rede, namespace, mídia e restore em ambiente descartável equivalente ao deploy, sem mocks como prova. Testes comuns sem OAuth pessoal/inferência paga; qualificação real separada com recursos de teste/orçamento.

Playwright funcional/visual em Chromium: login/perfis/desbloqueio e negações, dashboard 3 modos/filtros/ordem/snapshot, URL/categoria, playlists/player/Range/download, consentimento, capture/preview/abort, central/Push negado/reconexão, share expirado/revogado, extensão instalada. Claro/Dracula, desktop/móvel, teclado/foco/vazio/erro/carregamento. Dados/relógio/animações/fontes/OS fixados para screenshots; baseline revisada, sem auto-update no CI. Traces/redaction com tokens fictícios, não segredos reais. Imagem não prova áudio correto; testar fixture, codecs e progresso.

Extensão usa Chromium bundled/contexto persistente descartável no Playwright, não perfil pessoal. Popup/páginas/handler testados e smoke da barra/permissões no browser alvo; page.click não automatiza UI nativa por si. Compatibilidade Brave real e futura Opera/Firefox são gates próprios. IA testa esquema/invariantes/exemplos, sem comparar prosa byte a byte; exemplos aprovados não provam imunidade a prompt injection.

## 16. Fases, CI/CD e Slim

| Fase | Entrega e gate |
| --- | --- |
| 0 | Infra/sandbox primeiro, TLS/browser/secret/storage; CI mínimo e scripts PoC. Sem aprovação do gate não começa código de produto. |
| 1 — MVP | URL manual, categoria, pipeline isolado, resumo/tags/capa/áudio, offline funcional, OpenRouter opcional, Edge em processo próprio opcional, dashboard/player/download, perfis comuns básicos e playlists. Backup/restore mínimo antes de dados reais. |
| 2 | Principals/credentials definitivos, pareamento/popup e extensão URL. Rotação preserva identidade/cotas. |
| 3 | Captura privada, desbloqueio individual, resumo/tags/TTS locais e preview; prova offline ponta a ponta. |
| 4 | Monitoramento/pools de backlog justos, notificações duráveis/SSE/Push opcional, maturar retenção/assinaturas e limpeza aprovada. |
| 5 | Share público, domínio/ingresso/export, PoC Nginx Range/revogação/referrer/preview e autorização de redistribuição. |
| 6 | Telegram privado, pareamento/cursor/dedupe/cota conjunta e avisos Telegram+browser. |
| 7 | MCP, depois agy/bridge/visão real/isolamento, reentrega e termos/cotas. |

Fases posteriores não são exclusão de requisitos; testes são mapeados ao incremento em que o recurso existe. CA45–58 essenciais do pipeline começam na fundação, outros gates só quando a superfície correspondente existe e bloqueiam sua promoção. Backup/restauração e controles de autenticação não esperam fim do roadmap.

CI roda lint/tipos/build, testes/coverage/contratos pertinentes em cada PR; mudança de infra/segurança exige PoC/regressão real correspondente, release exige gates completos das capacidades habilitadas. Skip por falta de suporte é gate não validado, não aprovação. Actions/deps/imagens fixadas, artefatos por digest; build publicável não contém token/perfil/config privada. CD só depois de homologação/restore/rollback, releases assinadas/digest sem rebuild/latest. Migração one-shot com lock, expand/contract e rollback compatível; agente de deploy é root-equivalente e precisa de operador confiável.

Slim opcional após multistage/build convencional, medição e regressões equivalentes, só CI. Sem Docker socket no runtime. API/ponte primeiras candidatas, runner/codecs depois, PG/ingresso não reduzidos por padrão. Testar início frio, codecs auxiliares, auth/refresh, jobs de manutenção e restore; preservação de binários/arquivos necessária pode anular ganho. Nenhuma imagem foi reduzida/testada nesta revisão.

## 17. Gate de aceite técnico

Antes da promoção correspondente: host/sandbox sem privilégios amplos e sem persistência A→B; fetcher sem bypass de proxy/IPv6/DNS; parser/media sem rede/DB; imagem/SVG/bomb e staging confinados; segredo só no processo autorizado, Edge sem OpenRouter; principal/rotação/quotas corretos; leases/fencing/spool crash/reentrega; visibilidade privada em busca/mídia/avisos; captura conclui offline; 500 referências não bloqueiam manual; TLS renovável sem bypass; share Range/referrer/preview; restore DB+manifest+mídia+secrets; Telegram/Push recuperam com limites sem refazer conversão.

Concorrência de 100 admissões deve respeitar os tetos e reservas dos dois pools; requests inválidos/limite+1 não criam custo/artefato; counter indisponível não abre acesso. Testar payload extra, query cara, XSS/SQL/prompt/path, bucket/log cardinalidade e erro externo. Resultado mede controles, não promete sistema invulnerável.

## 18. Histórico e fontes

v0.1 stack/Compose; v0.2 pull/fronteiras; v0.3 egress/artefatos/admin; v0.4 casa única; v0.5 TDD; v0.6 cobertura/extensão; v0.7 captura/notificações/Telegram; v0.8 consolidação modular, principals/enums únicos, rota local privada, secret simples, TLS/sandbox Gate 0, pools e entrega pública candidata.

ADRs em decisoes-e-estados.md registram o que substitui opções antigas. Não há sealed-box vigente nem declaração de 17 serviços obrigatórios. Documentos de referência técnica, consultados em 25/10/2026:

- https://docs.docker.com/engine/security/seccomp/
- https://documentation.ubuntu.com/release-notes/24.04/
- https://chromium.googlesource.com/chromium/src/+/main/docs/linux/cert_management.md
- https://letsencrypt.org/docs/challenge-types/
- https://letsencrypt.org/docs/ct-logs/
- https://support.brave.com/hc/en-us/articles/360017989132-How-do-I-change-my-Privacy-Settings-
- https://nginx.org/en/docs/http/ngx_http_proxy_module.html
- https://nginx.org/en/docs/http/ngx_http_auth_request_module.html
- https://github.com/stripe/smokescreen
- https://www.postgresql.org/docs/current/textsearch-controls.html
- https://www.postgresql.org/docs/current/app-pgdump.html
- https://core.telegram.org/bots/api
- https://developer.chrome.com/docs/extensions/develop/concepts/network-requests
- https://developer.chrome.com/docs/extensions/reference/api/scripting
- https://developer.chrome.com/docs/extensions/reference/api/storage
- https://playwright.dev/docs/chrome-extensions
- https://playwright.dev/docs/test-snapshots
- https://antigravity.google/docs/cli/headless/
- https://antigravity.google/docs/permissions/
- https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization
- https://github.com/slimtoolkit/slim#installation

Nenhuma dessas fontes comprova nosso host ou deploy. Gates abertos continuam abertos até execução/registro de evidência.
