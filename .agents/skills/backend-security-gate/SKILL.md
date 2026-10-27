---
name: backend-security-gate
description: Criteria and PoC checklist (G0-B) that must be proven on the real host before any real Entrelinhas backend or external-content integration is enabled. Use before starting backend work or when someone proposes it.
---

# backend-security-gate

**Quando usar:** antes de qualquer código de backend real, fetch de conteúdo externo, sandbox, TLS ou integração com provider.

**Entradas:** `docs/specs/plano-tecnico-leitor-de-blogs.md` §1, §3, §5, §17; ADR-02, ADR-08, ADR-12.

**Checklist G0-B (todos com evidência no host real)**
1. Host registrado: físico/VM/LXC, distro/kernel/CPU/RAM/discos, Docker/runtime/seccomp/AppArmor/userns.
2. PoC sandbox: ambiente parser/mídia criado e descartado por tarefa; sem rede/DB/segredos; tarefa A não deixa arquivos/processos/HOME para B. Sem privileged, SYS_ADMIN amplo, Docker socket ou seccomp/AppArmor unconfined.
3. Egress: fetcher só via proxy externo; teste de bypass IPv4/IPv6/DNS/redirect/rebinding.
4. TLS válido + renovação (ADR-08) no browser/dispositivo alvo, sem ignorar erros.
5. Storage/segredos: volumes separados com quota; secret OpenRouter só no provider-proxy.
6. Browser alvo e versão registrados.

**Regras:** mock/MSW nunca conta como prova. Gate falhou → registrar e mudar arquitetura do runtime, não afrouxar política.

**Saídas:** `docs/implementation/gates/G0-B.md` com evidência por item.

**Verificação:** cada item tem comando/saída/data/host; item sem evidência = gate aberto.
