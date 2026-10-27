# Compatibilidade de agentes e ferramentas

Verificado em 27/10/2026 no host de desenvolvimento do usuário (Linux 7.2.11-zen1, 16 CPUs, 15 GiB RAM, ~3 GiB disponíveis no momento da medição). "Verificado" = execução real com evidência; ajuda/versão não prova autenticação nem capacidade.

## Ferramentas

| Ferramenta | Versão | Estado |
| --- | --- | --- |
| Git | 2.56.0 | verificado (repo, commits) |
| Node.js / npm | 24.21.0 / 11.19.0 | presente; gerenciador escolhido: npm workspaces (pnpm/bun ausentes, sem instalação global) |
| corepack | 0.36.0 | presente, não usado |
| tmux | 3.8 | presente |
| Python | 3.14.8 | presente (sem Pillow/ImageMagick; amostragem de cor feita com decodificador PNG em Python puro) |
| Claude Code | 2.1.311 | líder (esta sessão) |
| oh-my-claudecode (`omc`) | 5.7.5 | CLI presente; plugin em `~/.claude/plugins/oh-my-claudecode` (Yeachan-Heo/oh-my-claudecode) |
| Codex CLI | 0.164.0 | **verificado** (ver abaixo) |
| agy (Antigravity CLI) | 1.4.8 | instalado; **bloqueado como worker** (ver abaixo) |

## Descoberta de AGENTS.md e skills

| Agente | AGENTS.md | `.agents/skills` | Evidência |
| --- | --- | --- | --- |
| Claude Code | via `CLAUDE.md` → `@AGENTS.md` | via links `.claude/skills/<nome>` → `../../.agents/skills/<nome>` | Após o commit `54285dd`, o harness listou as 9 skills do projeto (incl. `skill-discovery-probe`) como disponíveis nesta sessão. |
| Codex | pré-carregado automaticamente | descoberto automaticamente (lista de skills) | `codex exec -s read-only` (sonda): retornou `ENTRELINHAS-SKILL-PROBE-7f3c9a`, caminho `.agents/skills/skill-discovery-probe/SKILL.md`, "discovered automatically… no filesystem search", AGENTS.md "Preloaded: yes". |
| agy | não verificado | não verificado | Não executado: ver bloqueio. |

Validação estrutural: `scripts/agents/validate-skills.sh` (frontmatter, nome = diretório, links resolvem para a fonte). Teste negativo: link trocado → `FAIL … symlink target`, exit 1; ressincronizado → OK.

## Capacidade visual

- Claude (líder): lê PNG — verificado (37 frames abertos em 27/10).
- Codex: não verificada ainda; tarefas de UI delegadas ao Codex exigem que ele confirme no handoff se abriu as imagens. Revisão visual final sempre feita pelo Claude.

## agy — bloqueado

- A documentação de headless (`antigravity.google/docs/cli/headless/`, consultada 27/10/2026) descreve `agy -p` para scripts/CI, mas não trata de orquestração por agentes de terceiros.
- Há dúvida pública e sem resposta oficial sobre a seção 6 dos Termos do Antigravity restringir acesso via software de terceiros (fórum Google AI Developers, threads 184829 e 181088) e relato de banimento de contas que conectaram agentes de terceiros (fev/2026).
- Plano da conta do usuário (consumidor vs. empresarial) não é conhecido pelo líder.
- **Decisão:** não invocar `agy` a partir do Claude/OMC (nem a sonda de skills). Tarefas atribuíveis ao agy são redistribuídas a Claude/Codex.
- **Para desbloquear:** o usuário confirma o plano/termos aplicáveis (ou uma modalidade explicitamente suportada para orquestração) e autoriza; então rodar a sonda `agy -p` no repositório e registrar aqui.

## OMC

- `omc team` (workers CLI/tmux) e `/team` (sessão Claude) são distintos; não há criação automática de worktrees garantida — o líder cria worktrees com `git worktree add` e lança cada worker com `cwd` no worktree.
- Workers Codex lançados via `codex exec` (modo não interativo documentado) com `-C <worktree>` e sandbox `workspace-write`, sem `--dangerously-bypass-approvals-and-sandbox`.
- Exit code 0 não prova execução: o líder reexecuta testes no worktree e na `main` integrada.

## Concorrência

Máximo inicial: 2 workers de implementação + líder. RAM livre medida ~3 GiB: um `vite`/`vitest`/Playwright por worktree é o teto prático; reavaliar com medição.

## Limitações observadas do worker Codex (27/10, TASK-010)

- `codex exec` sem `< /dev/null` ficou bloqueado lendo stdin; corrigido no procedimento (RESUME.md).
- Sandbox `workspace-write` não grava o diretório Git de um worktree (fica em `<repo>/.git/worktrees/`): `git add` falhou com `Read-only file system`. Mitigação: passar `--add-dir <repo>/.git` ao lançar o worker; até verificar, o líder comita o trabalho do worker na branch da tarefa, com atribuição `Co-Authored-By: Codex`.
- Sandbox recusa abrir porta local (`EPERM` em 4174): Playwright não roda dentro do worker. O líder executa o e2e na integração.
- Como revisor `read-only`, Vitest não inicia (`EROFS` ao criar arquivo temporário); revisões Codex não reexecutam a suíte, o líder reexecuta.
