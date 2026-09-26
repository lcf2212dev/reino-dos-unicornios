---
name: nova-prova
description: Use quando o Leandro mandar fotos de uma prova/revisão bimestral da escola para virar prova no jogo (Escola do Reino), com três acessórios de prêmio. Não use para salas de matéria (nova-materia).
---
# Nova prova

Siga a receita `docs/receitas/prova-nova.md`. Contratos: `docs/contratos/conteudo.md` §5 e `docs/contratos/loja.md` §3.

1. Trabalhe numa worktree. Leia `jogo/js/conteudo/CLAUDE.md`.
2. Gere: `npm run novo -- prova <matéria> <bimestre> --professora <id> --nome-professora "…" --seco` e, conferido,
   sem `--seco` (acessórios inline com desenho e ícone, professora com `Reino.registrarPersonagem`, manifesto, index).
   Preencha `jogo/js/conteudo/provas/<matéria>-<bimestre>.js` (`Reino.registrarProva({ … })`), os enunciados da
   folha na mesma ordem e três acessórios (lendário, raro, comum).
3. O gerador já pôs a linha no manifesto (grupo `provas`, `node: true`). Depois de preencher:
   ```
   npm run index
   npm run validar
   ```
4. A Escola monta a sala de aula sozinha (professor padrão `prof-<prova>` se não houver um no elenco).
5. Desenho e ícone dos acessórios ficam no próprio arquivo (não em `pixelart-unicornio-moldes.js` nem nos lotes).
   Confira: `npm run ver -- --previa acessorios:<id>`.
6. Veja no jogo: `npm run ver -- --tela prova:<id> --tamanhos celular` e `npm run ver -- --ir escola`.
   Vozes: skill `gravar-vozes`. Feche com a skill `validar-tudo`.
