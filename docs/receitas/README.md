# Receitas (índice)

Para que serve: passo a passo das tarefas mais comuns, com a lista exata de arquivos, os comandos e as
armadilhas. Antes de qualquer receita: `docs/ARQUITETURA.md` (onde mora cada coisa) e as regras de
segurança (`docs/decisoes/seguranca-do-progresso.md`).

Qual registro cada feature usa: `docs/ARQUITETURA.md` §5.1.

| Tarefa | Receita | Contrato |
|---|---|---|
| Matéria nova (salas, livro, unicórnios, lugar no mapa) | `materia-nova.md` | `docs/contratos/conteudo.md` |
| Prova bimestral nova (Escola) | `prova-nova.md` | `docs/contratos/conteudo.md` §5 |
| Sistema novo (mecânica, como banho, fotos, surpresa) | `sistema-novo.md` | `docs/contratos/cena-e-motor.md` §14 |
| Tipo de desafio novo (jeito novo de perguntar) | `desafio-novo.md` | `docs/contratos/conteudo.md` §3.7 |
| Prédio novo no mapa (com interior) | `predio-novo.md` | `docs/contratos/interiores.md` §9.7 |
| Personagem novo (NPC) | `personagem-novo.md` | `docs/contratos/npcs-e-dialogo.md` |
| Enfeite novo na Loja | `enfeite-novo.md` | `docs/contratos/loja.md` |
| Comida nova na Pet Shop | `comida-nova.md` | `docs/contratos/cuidados.md` |
| Música nova (ambiente) | `musica-nova.md` | `docs/contratos/som-musica-e-voz.md` §3 |
| Fala nova ou mudada, e gravar as vozes | `fala-nova-e-vozes.md` | `docs/contratos/som-musica-e-voz.md` §4 |
| Escrever falas que a voz lê bem | `licoes-de-voz.md` | `docs/contratos/som-musica-e-voz.md` §5 |

## Regras que valem em todas
- Regras gerais (worktree, servidor de TESTE, só Chromium, manifesto + index, temporários, commit): `CLAUDE.md` da raiz.
- Emoji novo na tela = desenho em `jogo/js/arte/icones/<lote>.js`.
- Texto falado novo = texto exato listado no retorno (`fala-nova-e-vozes.md`); quem grava é quem integra.
- No fim: `npm test` e `npm run e2e`.

## Referências (e2e)
- Rodam na worktree (precisam do git). Em `npm test`, o passo *referências de dados* mostra só a diferença
  esperada da receita; os outros passos têm que sair ✔.
- Cada receita lista as diferenças esperadas no `npm run e2e`; qualquer diferença fora da lista é defeito.
- A base do e2e só muda por commit: quem integra troca o hash em `jogo/ferramentas/testes/base-referencia.txt`
  depois do commit da mudança; não edite esse arquivo na tarefa.
