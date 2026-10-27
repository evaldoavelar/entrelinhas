# SPRINT-03 — Importação e player

Entrada: S02 integrada. Saída: import por URL com estados canônicos (`import.state`, `product.processing_state`), categoria de site novo, progresso, falha+retry sem duplicar, detalhe/player, barra do player com fixture de áudio local (retomar, velocidade, fila, download ≠ ouvido), gestão de categorias.

| Tarefa | Título | Frames | Depende |
| --- | --- | --- | --- |
| TASK-019 | Contrato: imports, idempotência, categories, playback (líder) | — | 012 |
| TASK-020 | Adicionar leitura, categoria do site novo, progresso, falha/retry | 13, 14, 31, 33 | 019 |
| TASK-021 | Detalhe do artigo + player global (fixture de áudio) | 05 | 019 |
| TASK-022 | Gerenciar categorias | 34 | 019 |
