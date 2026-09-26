---
name: nova-materia
description: Use quando o Leandro pedir uma matéria nova no Reino dos Unicórnios (ex.: "cria Geografia", prints numa pasta nova da raiz com o nome da matéria), ou para acrescentar salas, livro ou unicórnios a uma matéria. Não use para prova da escola (nova-prova) nem só para o prédio (novo-predio).
---
# Nova matéria

Siga a receita `docs/receitas/materia-nova.md`. Contrato: `docs/contratos/conteudo.md`.

1. Trabalhe numa worktree (nunca na árvore principal), criada com a pasta dos prints:
   `node jogo/ferramentas/fluxo/worktree.js <tema> --material <Matéria>` (copia os prints não rastreados da
   árvore principal). Leia `jogo/js/conteudo/CLAUDE.md`.
2. Os prints ficam na pasta da matéria na raiz do repositório (`<Matéria>/`). Não mova essa pasta.
   Rode `node jogo/ferramentas/fluxo/material.js <Matéria> --folha` e leia só as reduzidas e o índice em
   `/tmp/reino-testes/material/<matéria>/`, nunca os originais de 1 MB ou mais. O que está escrito à mão é da
   Mariana: NUNCA é gabarito; na folha da prova, ignore o que ela respondeu.
3. Gere: `npm run novo -- materia <m> --nome "…" --emoji 🌍 --salas <n> --prefixo <p> --seco` e, conferido, sem
   `--seco` (salas, `livro.js`, `<m>.js`, manifesto, index). Sala avulsa: `npm run novo -- sala <m> <idSala>`.
   Preencha todo `(preencher)` com a apostila.
4. O gerador já pôs as linhas no manifesto (salas antes de `livro.js` e `<m>.js`). Depois de preencher:
   ```
   npm run index
   npm run validar
   ```
5. Sem prédio próprio, a matéria ganha o interior padrão. Prédio próprio: skill `novo-predio`.
6. Veja no jogo: `npm run ver -- --ir materia:<m>` e `npm run ver -- --tela sala:<sala> --tamanhos celular`.
   Texto novo precisa de voz: skill `gravar-vozes` (só quem integra grava).
7. Feche com a skill `validar-tudo`. Sem commit na frente: o trabalho fica na worktree; quem integra faz o
   commit, com autorização do Leandro. Sem merge nem push sem ele.
