---
name: novo-predio
description: Use quando for criar ou refazer um prédio por dentro (interior) no Reino dos Unicórnios, com cômodos, objetos, NPCs e o desenho de fora no mapa (ex.: prédio próprio de uma matéria nova). Não use para mudar só uma fala (gravar-vozes).
---
# Novo prédio

Siga a receita `docs/receitas/predio-novo.md` (personagem novo: `docs/receitas/personagem-novo.md`).
Contratos: `docs/contratos/interiores.md` e `docs/contratos/npcs-e-dialogo.md`.

1. Trabalhe numa worktree. Leia `jogo/js/interiores/CLAUDE.md`.
2. Crie `jogo/js/interiores/<p>/`: `falas.js` primeiro, depois `objetos*.js`, `<p>.js`, `acoes.js`, `fora.js`.
   Cada arquivo até ~400 linhas; nada de DOM, canvas ou `PA` no carregamento.
3. Falas até 30 letras por página, frases de 3 palavras ou mais.
4. Linhas no `jogo/js/manifesto.js` (grupo `interiores`, `node: true`), antes de `interiores/padrao.js`. Depois:
   ```
   npm run index
   npm run validar
   ```
5. Confira a prévia `jogo/ferramentas/previas/interiores.html` (file://, no Chromium) e o jogo pela skill
   `servidor-de-teste`.
6. Vozes: skill `gravar-vozes`. Feche com a skill `validar-tudo` (inclui desempenho, se mexeu em desenho:
   `npm run e2e -- --desempenho`).
