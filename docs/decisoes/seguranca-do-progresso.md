# Decisão: segurança do progresso real da Mariana

Para que serve: diz onde mora o progresso de verdade, o que é proibido e como testar sem risco.
Detalhes: `docs/contratos/save-e-mescla.md` §9.

## Contexto
A Mariana joga todo dia. Um teste que grava no lugar errado apaga semanas de estudo dela, e a sincronização
espalha o estrago para os outros aparelhos.

## Os 3 lugares do progresso real
1. Servidor de casa: container Docker `reino-unicornios`, porta 80 (`reinodosunicornios.local`, `localhost`,
   `127.0.0.1` e o IP do PC na rede), banco em `jogo/servidor/dados/reino.db`.
2. O artifact publicado no claude.ai (capacidade `db`, doc `progresso/mariana`).
3. O localStorage `mariana-reino-v1` (e a cópia `mariana-reino-v1-novidades`) de cada aparelho.

## Decisão: proibido
- Abrir, chamar ou testar qualquer endereço do servidor de casa.
- Ler, copiar, gravar ou apagar qualquer coisa em `jogo/servidor/dados/` (nem listar).
- `docker compose restart/down/up/build`, mexer no container ou no serviço `reino-nome`.
- Publicar ou republicar o artifact, ou abrir o jogo publicado (só o orquestrador publica, pela skill `publicar-artifact`).
- `localStorage.clear()`, `removeItem` em chave existente, "Apagar tudo", "Novo ciclo" ou pagamento fora do teste.
- Escrever na árvore principal `/home/leandro/Development/projects/reino-dos-unicornios` (servida ao vivo pelo container).

## Decisão: as guardas (como testar)
| Guarda | Onde | O que impede |
|---|---|---|
| Servidor de TESTE | `npm run servidor-teste` (`jogo/ferramentas/testes/servidor-teste.js`) | recusa porta < 1024 e a 80; banco só em `/tmp`, nunca em `servidor/dados` |
| Navegador de teste | `jogo/ferramentas/testes/navegador.js` | só Chromium; só `127.0.0.1` com porta de teste ou `file://`; bloqueia toda outra rede |
| Saves sintéticos | `jogo/ferramentas/testes/saves.js` | valores inventados, gerados pelo próprio jogo; nunca o save real |
| Testes sem navegador | `jogo/ferramentas/testes/unidade/` | `vm` com localStorage de mentira |
| Validador de docs | `jogo/ferramentas/validar/validar-docs.js` | nem olha o disco em `servidor/dados` |
| Worktree própria | `/home/leandro/Development/projects/reino-<tarefa>` | nada escrito na árvore servida |

## Consequências
- Derrube só os seus servidores, pelo PID ou `s.parar()`; nunca `pkill`/`killall` por nome.
- Rascunho em `/tmp` copiado de uma worktree, sempre sem `jogo/servidor/dados`.
- Na dúvida entre duas formas, a mais segura para o progresso dela.
