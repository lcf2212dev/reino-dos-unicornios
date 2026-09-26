# Receitas (índice)

Para que serve: passo a passo das tarefas mais comuns, com a lista exata de arquivos, os comandos e as
armadilhas. Antes de qualquer receita: `docs/ARQUITETURA.md` (onde mora cada coisa) e as regras de
segurança (`docs/decisoes/seguranca-do-progresso.md`).

| Tarefa | Receita | Contrato |
|---|---|---|
| Matéria nova (salas, livro, unicórnios, lugar no mapa) | `materia-nova.md` | `docs/contratos/conteudo.md` |
| Prova bimestral nova (Escola) | `prova-nova.md` | `docs/contratos/conteudo.md` §5 |
| Prédio novo no mapa (com interior) | `predio-novo.md` | `docs/contratos/interiores.md` |
| Personagem novo (NPC) | `personagem-novo.md` | `docs/contratos/npcs-e-dialogo.md` |
| Enfeite novo na Loja | `enfeite-novo.md` | `docs/contratos/loja.md` |
| Comida nova na Pet Shop | `comida-nova.md` | `docs/contratos/cuidados.md` |
| Música nova (ambiente) | `musica-nova.md` | `docs/contratos/som-musica-e-voz.md` §3 |
| Fala nova ou mudada, e gravar as vozes | `fala-nova-e-vozes.md` | `docs/contratos/som-musica-e-voz.md` §4 |
| Escrever falas que a voz lê bem | `licoes-de-voz.md` | `docs/contratos/som-musica-e-voz.md` §5 |

## Regras que valem em todas
- Trabalhe na sua worktree; nunca em `/home/leandro/Mariana Revisões` (servida ao vivo para a Mariana).
- Nunca abra o servidor de casa (porta 80, `reinodosunicornios.local`, `localhost` sem porta de teste), nem
  `jogo/servidor/dados/`, nem o artifact publicado. Teste só com `npm run servidor-teste`, o Chromium de
  `jogo/ferramentas/testes/navegador.js` e saves de `jogo/ferramentas/testes/saves.js`.
- Testes só no Chromium (celular 390×844, tablet 820×1180, notebook 1366×768). Nada de Firefox/WebKit.
- Arquivo `.js` novo = uma linha em `jogo/js/manifesto.js` + `npm run index`.
- Emoji novo na tela = desenho em `jogo/js/arte/icones/<lote>.js`.
- Texto falado novo = voz gravada (`fala-nova-e-vozes.md`); quem grava é o orquestrador.
- No fim: `npm test`; `npm run e2e` mostra o que mudou contra o commit base (só o esperado).
- Temporários em `/tmp`, sem apagar. Commit: só o orquestrador.
