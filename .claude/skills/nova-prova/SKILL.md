---
name: nova-prova
description: Use quando o Leandro mandar fotos de uma prova/revisão bimestral da escola para virar prova no jogo (Escola do Reino), com três acessórios de prêmio. Não use para salas de matéria (nova-materia).
---
# Nova prova

Siga a receita `docs/receitas/prova-nova.md`. Contratos: `docs/contratos/conteudo.md` §5 e `docs/contratos/loja.md` §3.

1. Trabalhe numa worktree. Leia `jogo/js/conteudo/CLAUDE.md`.
2. Crie `jogo/js/conteudo/provas/<matéria>-<bimestre>.js` com `Reino.registrarProva({ … })`, os enunciados da
   folha na mesma ordem e três acessórios (lendário, raro, comum).
3. Uma linha em `jogo/js/manifesto.js` (grupo `provas`, `node: true`), depois das provas que já existem. Depois:
   ```
   npm run index
   npm run validar
   ```
4. A Escola monta a sala de aula sozinha (professor padrão `prof-<prova>` se não houver um no elenco).
5. Emoji novo precisa de desenho em `jogo/js/arte/icones/<lote>.js`.
6. Vozes: skill `gravar-vozes`. Feche com a skill `validar-tudo`.
