---
name: novo-predio
description: Use quando for criar ou refazer um prédio por dentro (interior) no Reino dos Unicórnios, com cômodos, objetos, NPCs e o desenho de fora no mapa (ex.: prédio próprio de uma matéria nova). Não use para mudar só uma fala (gravar-vozes).
---
# Novo prédio

1. Worktree: `npm run worktree -- <tema>`. Leia `jogo/js/interiores/CLAUDE.md`
   (inclui o que o prédio não edita).
2. Siga a receita `docs/receitas/predio-novo.md` (gerador, partes, lugar no mapa, manifesto, conferir no jogo);
   personagem novo: `docs/receitas/personagem-novo.md`; falas: `docs/receitas/licoes-de-voz.md`.
   Contratos: `docs/contratos/interiores.md` e `docs/contratos/npcs-e-dialogo.md`.
3. Fecho: skill `validar-tudo` (com `--desempenho`); falas novas com o texto exato no retorno. Quem orquestra
   integra (skill `entregar`).
