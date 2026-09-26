---
name: nova-prova
description: Use quando o Leandro mandar fotos de uma prova/revisão bimestral da escola para virar prova no jogo (Escola do Reino), com três acessórios de prêmio. Não use para salas de matéria (nova-materia).
---
# Nova prova

1. Worktree com a pasta das fotos (nunca na árvore principal): `npm run worktree -- <tema> --material <Pasta>`
   (`<Pasta>` é a da matéria em `matérias/`, ex.: `ciências/Revisão`). Leia `jogo/js/conteudo/CLAUDE.md`.
2. Siga a receita `docs/receitas/prova-nova.md` (gerador, folha pelas reduzidas, acessórios, professora,
   conferir no jogo). Contratos: `docs/contratos/conteudo.md` e `docs/contratos/loja.md`.
3. Fecho: skill `validar-tudo`; falas novas com o texto exato no retorno (quem integra grava com `gravar-vozes`).
   A frente não faz commit; quem orquestra integra até a main (skill `entregar`).
