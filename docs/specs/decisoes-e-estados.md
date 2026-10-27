# Decisões e estados canônicos — v0.1

Data: 25/10/2026. Vinculado aos requisitos v1.4, plano v0.8 e extensão v0.3. Projeto ainda documental; as decisões abaixo não comprovam implementação. Este arquivo é a fonte única para identidades, enums e ADRs. Contratos de API, banco e frontend devem gerar/validar os mesmos valores, sem listas paralelas.

## 1. Identidades e propriedade

`principals(id, kind, profile_id, scopes, status, created_at)` representa quem solicita trabalho. `kind`: extension, api_client, telegram_binding, web_session, mcp, source_automation. Sessão web é transportada por cookie; o kind web_session designa a identidade lógica do cliente/perfil, com sessões concretas em registros separados, não uma chave primária de sessão efêmera. Telegram por binding; o fato de existir principal não exige token Bearer para todos. Principal estável sobrevive à rotação de credencial e a novas sessões da mesma identidade lógica. Revogar uma credencial não cria novo orçamento nem transfere posse.

`credentials(id, principal_id, kind, secret_digest, idle_expires_at, absolute_expires_at, revoked_at)` guarda autenticação quando aplicável; sessões e bindings podem usar tabelas específicas referenciadas ao principal. `credential_id` pode constar da auditoria, mas não define a propriedade nem a idempotência.

`imports(id, principal_id, profile_id, input_kind, source_channel, state, reason_code, post_id, asset_id, created_at)` é a intenção do solicitante. `input_kind`: url, captured_text; `source_channel`: web, extension, api, telegram, mcp, source. `import_idempotency(principal_id, operation, key_digest, payload_digest, import_id, expires_at)` tem unicidade nos três primeiros campos. Telegram usa chave derivada de bot/update/link ordinal; web e extensão usam chave aleatória. Não há tabela concorrente submission_origins/import_requests nem ownership por token_id.

`captured_documents(id, import_id, principal_id, profile_id, capture_context_id, revision, content_digest, state, visibility, owner_profile_id, blocks, source_url, created_at)` armazena a captura; versão/contexto não são escolhidos livremente pelo cliente. `jobs` realiza etapas, `attempts` executa tentativas; um job pode atender imports de vários principals autorizados. `notification_recipients` guarda perfis/bindings das intenções, nunca destinatário vindo de modelo/artigo.

Visibilidade: household e private_to_profile. Capturas começam private_to_profile, salvo preferência de compartilhamento automático do dono (ADR-06); a visibilidade é propagada ao texto, resumo, tags, imagens, assets, busca, snapshots, playlists, endpoints e notificações. Não misturar contexto privado e post compartilhado só porque URL coincide. Perfil é organização, salvo quando autenticado/desbloqueado: ver ADR-06.

## 2. Enums por entidade

| Entidade/campo | Valores canônicos | Regra |
| --- | --- | --- |
| job.state | scheduled, queued, running, retry_wait, succeeded, failed, cancelled | leased/reconciling/superseded não pertencem ao job. |
| attempt.state | leased, running, reconciling, succeeded, failed, cancelled, superseded | attempt_no é fencing token crescente por job. |
| product.processing_state | awaiting_category, awaiting_profile_unlock, awaiting_sensitive_consent, awaiting_agent, vision_unavailable, quota_exceeded, needs_review, queued, extracting, describing, narrating, assembling, reconciling, ready, failed, cancelled | Projeção de processamento, nunca fonte para decidir autorização/lease. |
| import.state | awaiting_category, awaiting_profile_unlock, awaiting_sensitive_consent, waiting_capacity, queued, processing, ready, rejected, failed, cancelled | Produto queued pode representar import waiting_capacity admitida. Rejeição HTTP sem admissão não precisa criar import. |
| captured_document.state | awaiting_profile_unlock, awaiting_sensitive_consent, needs_review, accepted, processing, ready, failed, cancelled | Prévia local não é captura persistida; cancelá-la não cria linha no servidor. |
| delivery.state | pending, sending, retry_wait, delivered, failed_terminal, cancelled, expired | delivered significa ACK do canal, não que a pessoa viu/ouviu. |
| pairing.state | pending, approved, delivered, denied, expired, cancelled | Aprovação e entrega idempotentes; não deixar segredo indefinidamente recuperável. |
| principal.status | active, suspended, revoked | Credencial expirada pode requerer novo pareamento sem mudar principal por conveniência. |

`reason_code` não é enum de estado. Exemplos: category_required acompanha awaiting_category; quota_exceeded é razão de rejected/waiting_capacity e também valor da projeção de produto; provider_consent_required acompanha awaiting_sensitive_consent. `duplicate` é resultado de associação/dedupe, não job/import de sucesso inventado. `invalid_url` é código de rejeição. UI de rede (offline, submitting, preview etc.) é estado local da extensão, separado dos enums persistentes.

Transições relevantes:

- Job queued → running ao iniciar tentativa; tentativa leased → running. Sucesso grava attempt succeeded/job succeeded e agenda próxima etapa na mesma transação.
- Lease vencido: attempt reconciling, job permanece running e produto pode mostrar reconciling. Só tentativa original entrega na carência; não há nova tentativa concorrente.
- Carência vencida: attempt superseded, job retry_wait; próximo claim cria attempt_no maior. Tentativa antiga nunca publica resultado. Heartbeat é independente do stdout da inferência.
- Falha recuperável: attempt failed, job retry_wait; error retryable/terminal é atributo. Esgotamento fecha job failed. Cancelamento invalida novas chamadas e entregas por capability, sem prometer desfazer chamada externa já feita.
- Categoria/consentimento/capacidade são condições de admissão/importação, não fingem falha de TTS. Retomar não muda configuração congelada sem nova intenção autorizada.
- Asset só fica ready após arquivo/capa/metadados validados e publicação durável. Tombstone/retention é lifecycle distinto do processing_state; áudio expirado não deve aparecer como falha de conversão.

## 3. ADR-01 — Processo doméstico modular

Decisão: app privado reúne API/domínio, coordenador, scheduler, orquestração light/heavy, artifact endpoint, notificações e adapter Telegram em módulos/tarefas limitadas. Sem parser/codecs/agy nesse processo. Listeners privado e interno continuam separados mesmo no mesmo processo. Atividades Telegram/notificação têm filas e orçamento próprios; subprocessos hostis não herdam DB/segredos. Consolidar módulos amplia o alcance de comprometimento do app e permite interferência por bug de event loop; esse risco é aceito para uma casa, com limites e sem alegar isolamento entre módulos.

Separações de processo mantidas: conteúdo hostil (fetcher/parser/media/agy), egress policy, OpenRouter secret, TTS online e ingresso público quando habilitado. O plano lista instâncias por fase, não 17 obrigatórias desde o começo.

## 4. ADR-02 — Gate de infraestrutura primeiro

Decisão: nenhum código de produto antes de host/kernel/runtime, sandbox, TLS e browser alvo serem validados. CI mínimo e scripts descartáveis de PoC são permitidos para provar o gate. Sem privileged, Docker socket no app, SYS_ADMIN genérico ou seccomp/AppArmor globalmente desativados como atalho.

O Docker filtra syscalls/flags de namespaces e o host pode impor AppArmor/userns adicionais. nsjail/bubblewrap são candidatos, não solução comprovada. Uma política específica mínima só pode ser considerada com justificativa e testes; se o desenho exigir liberar amplamente o host, gate falha e a arquitetura do runtime deve mudar. gVisor persistente sozinho não limpa estado entre jobs. Para Proxmox, baseline preferida é VM dedicada; LXC aninhado não é baseline suportada sem nova prova.

## 5. ADR-03 — Segredos e TTS separados

Decisão: uma chave OpenRouter por instalação, em secret provisionado pelo operador e montado apenas no provider-proxy. Sem sealed-box/provider_configs cifrados pela UI no MVP. UI/MCP alteram modelo/parâmetros/referência permitida, não escrevem segredo de infraestrutura; rotação exige operação controlada. Secret Compose local pode ser arquivo montado: não é promessa de cofre cifrado contra root, host comprometido ou backup indevido.

Provider-proxy só valida capability/etapa/custo/consentimento e faz requests OpenRouter. Edge fica em tts-online sem secret OpenRouter, DB, OAuth ou biblioteca global. Piper/eSpeak/FFmpeg rodam em mídia sem rede. Bot, VAPID e OAuth têm segredos próprios, nunca repassados ao modelo.

## 6. ADR-04 — Credencial persistente e pareamento

Decisão: storage.local, TRUSTED_CONTEXTS, sem sync é padrão da extensão, com aviso de persistência no primeiro pareamento. Reinício/atualização não exige rotação. storage.session só para buffers e modo temporário explicitamente escolhido; nesse modo o usuário pode reinserir a mesma credencial ainda válida guardada em gerenciador ou parear novamente. Exibição única significa que o servidor não recupera o segredo, não que uma cópia legítima não pode ser reutilizada.

Preferência de UX: pareamento por código aprovado por admin, sem copiar token; configuração manual de token continua suportada. Fluxo da extensão entrega uma credencial pendente ao cliente e só a ativa pelo digest após aprovação, evitando precisar reenviar segredo depois; código curto não é a credencial de polling. Proposta: inatividade 30 dias, vida absoluta 90 dias, revogação imediata; uso válido estende idle até o limite absoluto, sem manter credencial roubada renovável para sempre. Esses prazos são parâmetros propostos. Rotação muda credential, preserva principal e idempotência.

## 7. ADR-05 — Popup e servidor configurável

Decisão: clique abre popup com “Enviar URL”, “Capturar texto” e “Configurações”. Captura pode abrir preview dedicada. Não usar action.onClicked para envio quando default_popup estiver configurado. Não adicionar contextMenus/atalho neste incremento. Servidor HTTPS permanece configurável, pois é requisito explícito; build pode trazer default, e variante fixa gerenciada é opcional posterior.

Host permission efetiva só para destino aprovado. Background com host permission não exige liberar CORS para a extensão; endpoints de cliente não anunciam CORS genérico. CORS da UI web fica independente. Não enfraquecer autenticação, Host/CSRF ou redirect policy. Trocar destino limpa token/pareamento; nenhuma página escolhe URL da API.

## 8. ADR-06 — Captura privada e rota local

Decisão: captura começa private_to_profile e nunca associa automaticamente a um post compartilhado por coincidência de URL. Criar item próprio no contexto de captura; associação manual futura é gate de produto antes de implementá-la. Capturas iguais dentro do mesmo contexto podem reutilizar versão validada, preservando visibilidade. Trocar visibility/publicar exige intenção e confirmação próprias, por captura ou pela preferência de perfil descrita abaixo.

Perfil com captura privada precisa de desbloqueio individual (PIN com hash forte/rate limit ou passkey). Bloquear perfil é opcional para quem só usa biblioteca compartilhada; sem bloqueio, captura privada fica awaiting_profile_unlock até configurar/desbloquear. Compartilhar captura é alternativa explícita e avisada, não fallback silencioso.

Preferência de perfil (revisão 26/10/2026): o dono pode ligar “compartilhar com a casa automaticamente”. Desligada por padrão; ligar ou desligar exige PIN/passkey do dono e mostra aviso de exposição de páginas logadas a todos os perfis, inclusive em busca e notificações. Vale só para capturas novas, nunca retroativamente. Sites na lista “sempre privado” e capturas marcadas “manter esta privada” na prévia continuam private_to_profile. O servidor decide a visibilidade pela preferência gravada: o payload da extensão só pode pedir mais privacidade, nunca menos. Admin e outros perfis não alteram a preferência. Compartilhamento público, IA/TTS online e publicação continuam exigindo consentimentos próprios. PIN não é senha admin nem protege contra operador root; reset administrativo é auditado e não finge privacidade perante o operador. App não retorna conteúdo privado só por trocar avatar. Principals técnicos autorizados permanecem credenciais individuais de escopo fixado.

Rota local obrigatória antes de habilitar captura: resumo extrativo determinístico (seleção de trechos), tags heurísticas do próprio texto, capa genérica e TTS eSpeak NG disponível; Piper/voz local qualificada melhora a voz, com runtime/modelo/checksum provisionados e testados. Sem chamada externa por padrão, sem resumo abstrativo inventado. Antes de publicar captura, teste deve concluir áudio offline. awaiting_sensitive_consent só ocorre se o usuário escolher processamento externo sem autorização, não como destino inevitável de toda captura.

## 9. ADR-07 — Backlog versus admissão

Decisão: separar posts descobertos/backlog de jobs admitidos. Monitoramento pode registrar 500 referências deduplicadas, limitado por quota de catálogo, sem criar 500 jobs/payloads. Dois pools: interativo e automação, cada um com backlog/slots próprios. Reserva de capacidade para manual; automação ganha turno com aging, nunca monopoliza slots manuais.

Ponto inicial proposto: interativo até 5 intenções pendentes por perfil/20 instalação; automação até 4 jobs admitidos globalmente, 2 por fonte, com descoberta histórica paginada. Capacidade de execução heavy/light é separada desses tetos. Reservar um turno manual no scheduler e alternância justa quando ambas as classes aguardam; tarefa já iniciada não sofre preempção. Custo, banda e disco têm teto global que nenhum pool pode ignorar.

## 10. ADR-08 — HTTPS na LAN/VPN

Escolha a concluir no Gate 0: (A) domínio real neutro com ACME DNS-01, resolução privada e API DNS de privilégio mínimo; ou (B) CA interna, raiz distribuída aos stores realmente usados por OS/browser/dispositivos e renovação testada. Não basta aceitar warning. NSS/caminho de trust depende de versão/empacotamento; verificar no Chromium/Brave real e também no dispositivo móvel, sem distribuir chave privada da CA.

DNS-01 não exige expor app privado. Certificados públicos têm nomes registrados em Certificate Transparency; nome neutro reduz identificação, não torna hostname secreto. Credencial DNS não fica no app/parser/runner. Testar TLS válido, renovação, service worker, extensão e notificações sem ignoreHTTPSerrors ou flags de insegurança.

## 11. ADR-09 — Share e mídia pública

Decisão técnica candidata para fase de share: Nginx público + api-share sem mídia e com função restrita no DB. api-share recebe cada request /s/token, autoriza e responde X-Accel-Redirect para location internal. Não encadear também auth_request sem necessidade; são mecanismos alternativos e sua composição não é automática. Não chamar isso de funcionalidade nativa do Caddy.

Para não montar toda a biblioteca no ingresso, gateway lê somente public-export: cópias imutáveis dos assets explicitamente publicados, com quota e remoção por referência. Sem acesso aos originais privados. Exportar é ação aprovada do domínio; nomes opacos e sem paths do usuário. GET/HEAD/Range externos sempre passam por api-share antes do internal redirect; cache não contorna revogação. Exige PoC de headers, Range, paths e revogação antes de escolher definitivamente este mecanismo. Custo residual: cópia extra e comprometimento do gateway expõe exports ainda presentes; não toda a biblioteca. Se isso não for aceitável, manter delivery interno e registrar nova decisão, sem montar globalmente por conveniência.

Referrer-Policy: no-referrer, conteúdo público sem terceiros, logs sem token e cache restrito. Bots de preview acessam GET/HEAD: contabilizar no orçamento/tráfego, nunca como ouvido. Nenhum GET incrementa consumo, transforma URL em link de uso único consumido ou permite ação administrativa. Link continua bearer, com expiração/revogação/asset fixo. Shared link não dispensa autorização para redistribuir artigo.

## 12. ADR-10 — Cobertura e TDD

Mantido: TDD e cobertura estritamente >80% por projeto e no diff executável do PR, linhas e branches aplicáveis; TS também statements/funções quando medidos. Arquivos não executados entram no denominador. 80% exatos não passam. Substitui a regra anterior de piso idêntico em qualquer arquivo minúsculo pela política proposta na revisão: piso >80% por arquivo com pelo menos 20 statements executáveis; arquivos menores contribuem no total/diff e têm testes significativos de comportamento, sem teste artificial de import para inflar número. Threshold de 20 é parâmetro proposto a ratificar no harness; até lá, não usar exclusões para esconder módulos.

Alembic/migrations são verificadas por upgrade de banco vazio e da versão suportada anterior, integridade de dados e downgrade quando suportado. Migração irreversível exige plano explícito de restore/rollback, não downgrade fictício. Não usar percentual de execução de migration como prova. Lista de exclusões curta, versionada e revisada. Segurança crítica exige cenários completos independentemente do percentual. Métrica no diff N/A se não há linha/branch executável alterado; não fingir 100% em denominador zero.

## 13. ADR-11 — Fases e Push

Fase 0: infraestrutura/PoCs/CI mínimo. Fase 1: URL manual, pipeline isolado, OpenRouter opcional, TTS offline funcional, Edge separado opcional, dashboard/player. Fase 2: extensão URL e principals/pareamento. Fase 3: captura privada, desbloqueio de perfil e rota local. Fase 4: notificações e monitoramento/quotas justas. Fase 5: share público. Fase 6: Telegram. Fase 7: MCP e agy. Recursos anteriores continuam requisitos do produto, não foram removidos; faseamento evita chamá-los todos de MVP. Playlists/perfis de escuta básicos entram no núcleo antes de habilitar retenção destrutiva; automação/limpeza/backup amadurecem conforme plano.

Push é opt-in e depende de browser/OS/provedor. No Brave, verificar “Use Google Services for Push Messaging”; sem esse serviço/permissão, usar SSE com UI aberta ou polling limitado e central ao reconectar. Não habilitar o serviço do navegador automaticamente. Suporte a Chromium no CI não qualifica implicitamente Brave, Opera ou Firefox reais; registrar versão alvo no Gate 0.

## 14. Rastreabilidade da revisão

| Ponto da revisão | Resolução |
| --- | --- |
| Token efêmero/segredo único | ADR-04, persistência e recuperação coerentes |
| Captura sem acionamento | ADR-05, popup explícito |
| Duas tabelas de autoria | §1, principal estável e credential separado |
| Estados divergentes | §2, enums por entidade e códigos separados |
| 500 posts versus 20 slots | ADR-07, catálogo/backlog/pools separados |
| Captura sem executor local | ADR-06, resumo/tags locais e TTS offline obrigatório |
| Associação captura/post aberta | ADR-06 e gate de associação futura nos requisitos |
| Marcador ambíguo de decode | Usar “toda decodificação” nos documentos |
| Sandbox/TLS/browser incertos | ADR-02/08, Gate 0 bloqueante |
| Proxy com Edge e segredo | ADR-03, TTS online separado |
| Exposição dentro da casa | ADR-06, private_to_profile e desbloqueio |
| 17 serviços/sealed-box | ADR-01/03, modularidade e secret por instalação |
| Entrega pública longa | ADR-09, candidato Nginx sem biblioteca global |
| CORS e cobertura | ADR-05/10, permissões no background e gates úteis |

Fontes primárias consultadas em 25/10/2026: https://docs.docker.com/engine/security/seccomp/ ; https://documentation.ubuntu.com/release-notes/24.04/ ; https://letsencrypt.org/docs/challenge-types/ ; https://letsencrypt.org/docs/ct-logs/ ; https://chromium.googlesource.com/chromium/src/+/main/docs/linux/cert_management.md ; https://nginx.org/en/docs/http/ngx_http_proxy_module.html ; https://nginx.org/en/docs/http/ngx_http_auth_request_module.html ; https://support.brave.com/hc/en-us/articles/360017989132-How-do-I-change-my-Privacy-Settings- .
