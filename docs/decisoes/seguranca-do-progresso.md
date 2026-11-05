# Decisão: segurança do progresso real da Mariana

Para que serve: diz por que o progresso de verdade é intocável e quais guardas deixam testar sem risco.

## Contexto
A Mariana joga todo dia. Um teste que grava no lugar errado apaga semanas de estudo dela, e a sincronização
espalha o estrago para os outros aparelhos.

## Decisão
Onde mora o progresso real (o banco da Vercel e o localStorage de cada aparelho; servidor de casa e artifact,
aposentados em 29/09/2026, guardados como cópia) e tudo o que é proibido: `docs/contratos/save-e-mescla.md` §9 e o
`CLAUDE.md` da raiz, por inteiro (não se copia aqui). Na dúvida, vale a forma mais segura para o progresso dela.

## Decisão: as guardas (como testar)
| Guarda | Onde | O que impede |
|---|---|---|
| Servidor de TESTE | `npm run servidor-teste` (`jogo/ferramentas/testes/servidor-teste.js`) | recusa porta < 1024 e a 80; banco só em `/tmp`, nunca em `servidor/dados` |
| Navegador de teste | `jogo/ferramentas/testes/navegador.js` | só Chromium; só `127.0.0.1` com porta de teste ou `file://`; bloqueia toda outra rede |
| Saves sintéticos | `jogo/ferramentas/testes/saves.js` | valores inventados, gerados pelo próprio jogo; nunca o save real |
| Testes sem navegador | `jogo/ferramentas/testes/unidade/` | `vm` com localStorage de mentira |
| Validador de docs | `jogo/ferramentas/validar/validar-docs.js` | nem olha o disco em `servidor/dados` |
| Worktree própria | `/home/leandro/Development/projects/reino-dos-unicornios/worktrees/reino-<tarefa>` | nada escrito na árvore principal |

## Consequências
- Derrube só os seus servidores, pelo PID ou `s.parar()`; nunca `pkill`/`killall` por nome.
- Rascunho em `/tmp` copiado de uma worktree, sempre sem `jogo/servidor/dados`.
