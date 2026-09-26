---
name: nova-materia
description: Use quando o Leandro pedir uma matéria nova no Reino dos Unicórnios (ex.: "cria Geografia", prints numa pasta nova em matérias/ com o nome da matéria), ou para acrescentar salas, livro ou unicórnios a uma matéria. Não use para prova da escola (nova-prova) nem só para o prédio (novo-predio).
---
# Nova matéria

1. Worktree com a pasta dos prints (nunca na árvore principal): `npm run worktree -- <tema> --material <Matéria>`.
   Leia `jogo/js/conteudo/CLAUDE.md`.
2. Siga a receita `docs/receitas/materia-nova.md` (gerador, apostila pelas reduzidas, manifesto, conferir no jogo).
   Contrato: `docs/contratos/conteudo.md`. Prédio próprio: skill `novo-predio`.
3. Fecho: skill `validar-tudo`; falas novas com o texto exato no retorno (quem integra grava com `gravar-vozes`).
   A frente não faz commit; quem orquestra integra até a main (skill `entregar`).
