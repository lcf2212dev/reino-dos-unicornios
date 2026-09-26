---
name: novo-predio
description: Use quando for criar ou refazer um prédio por dentro (interior) no Reino dos Unicórnios, com cômodos, objetos, NPCs e o desenho de fora no mapa (ex.: prédio próprio de uma matéria nova). Não use para mudar só uma fala (gravar-vozes).
---
# Novo prédio

Siga a receita `docs/receitas/predio-novo.md` (personagem novo: `docs/receitas/personagem-novo.md`).
Contratos: `docs/contratos/interiores.md` e `docs/contratos/npcs-e-dialogo.md`.

1. Trabalhe numa worktree. Leia `jogo/js/interiores/CLAUDE.md`.
2. Gere a pasta: `npm run novo -- predio <p> --nome "…" --rect x,y,w,h --caminho "x,y;…" --emoji 🥐 --seco`
   e, conferido, sem `--seco` (cria as partes, manifesto e index). Preencha os `(preencher)`. Personagem:
   `npm run novo -- personagem <id> --predio <p>`. Partes: `falas.js` primeiro, depois `objetos*.js`, `<p>.js`, `acoes.js`, `fora.js`.
   Cada arquivo até ~400 linhas; nada de DOM, canvas ou `PA` no carregamento.
3. Falas até 30 letras por página, frases de 3 palavras ou mais.
4. O gerador já pôs as linhas no manifesto (antes de `interiores/padrao.js`); parte nova à mão entra lá também. Depois:
   ```
   npm run index
   npm run validar
   ```
5. Lugar no mapa: `Reino.registrarLugar` com `menu` em `jogo/js/interiores/<p>/lugar.js` (receita
   `docs/receitas/predio-novo.md`); não edite `mundo/lugares.js`, `ui/lugares.js` nem `validar-interiores.js`.
   Confira: `npm run ver -- --previa interiores:<p>`, `npm run ver -- --ir <p>` e `npm run ver -- --tela lugares`.
6. Vozes: liste as falas novas no retorno; quem integra grava com a skill `gravar-vozes`. Feche com a skill `validar-tudo` (inclui desempenho, se mexeu em desenho:
   `npm run e2e -- --desempenho`).
