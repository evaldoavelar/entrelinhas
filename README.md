# 🎧 Entrelinhas — Leituras para Ouvir

> **Todos os seus sites. Cada leitura, uma nova escuta.**  
> O Entrelinhas transforma artigos, notícias e blogs da web em áudios narrados com síntese de voz natural, resumos inteligentes e organização completa para sua casa.

![Sua biblioteca no Entrelinhas](docs/assets/entrelinhas-biblioteca.png)

---

## ✨ O que é o Entrelinhas?

O **Entrelinhas** é uma plataforma doméstica e *self-hosted* para converter leituras acumuladas na web em uma biblioteca pessoal de áudio. 

Em vez de deixar dezenas de abas abertas no navegador ou listas infinitas de "ler mais tarde", o Entrelinhas extrai o conteúdo essencial dos seus artigos favoritos, gera áudios de alta fidelidade e permite que você acompanhe seus autores e publicações preferidas em qualquer lugar — no trânsito, durante a caminhada, cozinhando ou simplesmente descansando a vista das telas.

---

## 🌟 Vantagens de Usar

- 🚶 **Aproveite o seu tempo:** Transforme artigos longos em episódios de áudio para escutar enquanto realiza outras atividades do dia a dia.
- 🏠 **100% Sob o seu Controle (Home-Lab & Self-Hosted):** Seus dados, histórico de leitura e arquivos ficam armazenados na sua própria infraestrutura, sem cobranças de assinaturas mensais de plataformas de terceiros.
- 🚫 **Livre de Anúncios e Distrações:** O extrator isola apenas o texto principal do artigo, removendo banners, anúncios intrusivos, popups e menus de navegação.
- 🖼️ **Audiodescrição de Imagens e Gráficos:** Artigos com gráficos, tabelas informativas ou fotos não perdem o sentido. O Entrelinhas é capaz de incluir audiodescrições contextuais no momento certo da narrativa.
- 🏷️ **Resumos e Tags Automáticas:** Cada áudio acompanha um resumo fiel e tags temáticas geradas automaticamente, facilitando encontrar exatamente o que você quer ouvir.
- 👨‍👩‍👧 **Projetado para Toda a Casa:** Uma biblioteca compartilhada com seleção de perfis individuais de escuta e suporte a capturas privadas protegidas por PIN.
- 🎵 **Metadados Embutidos no Arquivo:** O áudio baixado já vem com imagem de capa, título do post, resumo e tags gravados nos metadados ID3, perfeito para qualquer aplicativo de música ou podcast.
- 🎨 **Experiência Visual Imersiva:** Temas escuro (Dracula) e claro elegante, pesquisa global instantânea e três modos de visualização (Cards, Compactos e Lista).

---

## ⚙️ Como Funciona

```mermaid
flowchart TD
    A["1. Captura (URL manual, Extensão de Navegador ou Feeds)"] --> B["2. Higienização (Texto limpo, resumo fiel e tags automáticas)"]
    B --> C["3. Narração (Síntese de voz natural e audiodescrição)"]
    C --> D["4. Biblioteca (Áudio estruturado com capa e metadados ID3)"]
    D --> E["5. Escuta (Player Web com persistência de progresso e playlists)"]
```

1. **Captura Inteligente:**
   - Adicione uma URL manualmente pelo painel da biblioteca;
   - Use a **Extensão de Navegador** (Chromium) para enviar a página atual com um clique ou capturar apenas seleções específicas;
   - Cadastre blogs e sites para **monitoramento automático periódico**.
2. **Higienização e Enriquecimento:**
   - O artigo é processado em ambiente seguro e isolado, extraindo apenas título, autoria e o corpo do texto ordenado;
   - São gerados o resumo executivo, a categorização temática e a capa oficial.
3. **Narração em Áudio (TTS):**
   - O texto limpo é enviado ao motor de síntese de voz (como Piper TTS ou Edge-TTS), garantindo vozes agradáveis, naturais e fluidas sem necessidade de APIs pagas obrigatórias;
   - Quando habilitado, gráficos e imagens do post recebem descrição falada integrada ao fluxo da leitura.
4. **Organização da Biblioteca:**
   - Os posts são organizados por site/domínio de origem e categorias (Tecnologia, Ciência, Cultura, etc.);
   - Metadados completos e capa são incorporados diretamente no arquivo de áudio.
5. **Escuta no Player Web ou Offline:**
   - Player embutido com velocidade variável, atalhos de teclado e persistência do ponto exato onde você parou;
   - Criação de playlists sob medida (ex.: *"Para a caminhada"*, *"Semana em Tecnologia"*);
   - Download direto do arquivo para ouvir offline no seu celular ou tocador dedicado.

---

## 🏠 Instalando no Home-Lab

O Entrelinhas foi projetado como uma solução doméstica de primeira classe para ser executada em **Docker**, seja em um mini-PC, servidor Linux, Proxmox (VM dedicada), Unraid ou Raspberry Pi.

### Arquitetura de Implantação

Para manter seu servidor seguro e confiável, a arquitetura é segregada em microsserviços via Docker Compose:
- **`frontend`**: Aplicação Web SPA servida via Nginx de alta performance;
- **`backend`**: API central que gerencia fila de tarefas, metadados e autenticação;
- **`worker-sandbox`**: Executor seguro e descartável que processa páginas externas e mídia sem acesso direto ao restante da rede;
- **`tts-engine`**: Motor local de voz (ex.: Piper TTS) que sintetiza áudio diretamente no hardware local;
- **`database`**: Banco de dados relacional para persistência leve e confiável.

### Exemplo de `docker-compose.yml`

```yaml
services:
  frontend:
    image: ghcr.io/evaldoavelar/entrelinhas-frontend:latest
    container_name: entrelinhas-web
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      - API_URL=http://backend:3000
    depends_on:
      - backend

  backend:
    image: ghcr.io/evaldoavelar/entrelinhas-backend:latest
    container_name: entrelinhas-api
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://entrelinhas:segredo@postgres:5432/entrelinhas
      - STORAGE_PATH=/data/media
      - TTS_PROVIDER_URL=http://tts:5000
    volumes:
      - entrelinhas-data:/data/media
    depends_on:
      - postgres
      - tts

  tts:
    image: rhasspy/wyoming-piper:latest
    container_name: entrelinhas-tts
    restart: unless-stopped
    volumes:
      - piper-voices:/data
    command: ["--voice", "pt_BR-faber-medium"]

  postgres:
    image: postgres:16-alpine
    container_name: entrelinhas-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=entrelinhas
      - POSTGRES_USER=entrelinhas
      - POSTGRES_PASSWORD=segredo
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  entrelinhas-data:
  piper-voices:
  postgres-data:
```

> [!TIP]
> **Acesso Seguro na Rede Doméstica:**  
> Recomendamos acessar o Entrelinhas através de uma rede segura privada (como **Tailscale**, **WireGuard** ou proxy reverso local como **Nginx Proxy Manager**, **Traefik** ou **Caddy** com certificado SSL interno), sem expor portas diretamente para a internet.

---

## 💻 Experimentando em Modo de Desenvolvimento

Atualmente, o projeto está na fase de consolidação do frontend de alta fidelidade com API simulada via **MSW (Mock Service Worker)**, garantindo que toda a experiência visual e de acessibilidade seja perfeita antes do backend real ser acoplado (ADR-12).

### Pré-requisitos
- **Node.js ≥ 24** e **npm**

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/evaldoavelar/entrelinhas.git
cd entrelinhas

# 2. Instale as dependências com o lockfile exato
npm ci

# 3. Inicie o frontend com a API mockada interativa
npm run dev -w apps/frontend
```

Abra `http://localhost:5173` no seu navegador para explorar a interface completa da biblioteca, busca global, filtros e alternância de temas.

---

## 📂 Estrutura do Repositório

| Caminho | Descrição |
| --- | --- |
| `apps/frontend` | Aplicação Web SPA (React + TypeScript + Vite + Tailwind/Tokens) |
| `apps/browser-extension` | Extensão Chromium Manifest V3 para envio rápido de leituras |
| `packages/contracts` | Schemas Zod e enums canônicos compartilhados do contrato HTTP v1 |
| `packages/api-client` | Cliente HTTP tipado compartilhado (usado tanto pelo mock quanto pelo app real) |
| `services/backend` | Backend da aplicação (em preparação pós-gate G0-B) |
| `infra` | Provas de conceito de isolamento seguro e infraestrutura |
| `prototype` | Frames de referência visual em alta fidelidade e projeto de interface |
| `docs/` | Especificações completas (`specs/`), decisões de arquitetura (`adr/`) e tarefas (`tasks/`) |

---

## 🛠️ Comandos Úteis

| Comando | Descrição |
| --- | --- |
| `npm ci` | Instala exatamente as dependências do repositório |
| `npm run dev -w apps/frontend` | Executa o frontend com mock interativo em `localhost:5173` |
| `npm test` | Executa a suíte completa de testes unitários e de integração |
| `npm run test:coverage` | Valida a cobertura de testes (gate rigoroso > 80% em linhas, branches e funções) |
| `npm run lint` | Executa ESLint com regras estritas de acessibilidade (`jsx-a11y`) |
| `npm run typecheck` | Validação estrita de tipos com TypeScript |
| `npm run build` | Gera o build de produção do frontend |
| `npm run e2e` | Roda testes de ponta a ponta com Playwright (temas Claro e Dracula, desktop e mobile) |
| `npm run verify` | Executa a verificação completa de qualidade (lint, tipos, testes e cobertura) |

---

## 📖 Documentação & Políticas

- **Especificações de Requisitos:** Consulte `docs/specs/requisitos-leitor-de-blogs.md` para ver o levantamento funcional (RF) e critérios de aceite (CA).
- **Decisões Técnicas:** Consulte `docs/specs/decisoes-e-estados.md` e o diretório `docs/adr/`.
- **Governança & Agentes:** Diretrizes de contribuição, TDD e convenções de código estão centralizadas em `AGENTS.md`.

---

Feito para quem ama ler, aprender e ouvir. 🎧
