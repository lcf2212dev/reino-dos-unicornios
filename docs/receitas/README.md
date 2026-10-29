# Receitas (índice)

Para que serve: passo a passo das tarefas mais comuns, com a lista exata de arquivos, os comandos e as
armadilhas. Antes de uma receita, leia só o que ela cita, pela seção (§): qual registro cada feature usa está em
`docs/ARQUITETURA.md` §5.1; o progresso real é intocável (`docs/contratos/save-e-mescla.md` §9).

| Tarefa | Receita | Contrato |
|---|---|---|
| Matéria nova (salas, livro, unicórnios, lugar no mapa) | `materia-nova.md` | `docs/contratos/conteudo.md` |
| Sala nova do 4º bimestre (sala de livro) | `sala-4bim.md` | `docs/contratos/quarto-bimestre.md` |
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
- Emoji novo na tela = `Reino.registrarIcones` na pasta da feature, sem editar os lotes (`jogo/js/CLAUDE.md`, Arte).
- Texto falado novo = texto exato listado no retorno (`fala-nova-e-vozes.md`); quem grava é quem integra.
- No fim: skill `validar-tudo`.

## Referências (e2e)
- Rodam na worktree (precisam do git). Em `npm test`, o passo *referências de dados* mostra só a diferença
  esperada da receita; os outros passos têm que sair ✔.
- Cada receita lista as diferenças esperadas no `npm run e2e`; qualquer diferença fora da lista é defeito.
- A base do e2e nunca se troca à mão: quem integra usa `npm run integrar -- <branch> --trocar-base "<descrição>"`
  (a base vai no mesmo commit da frente) ou `npm run e2e -- --aceitar "<descrição>"`. Na tarefa, não mexa nela.
