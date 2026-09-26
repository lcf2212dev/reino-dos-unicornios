---
name: nova-materia
description: Use quando o Leandro pedir uma matéria nova no Reino dos Unicórnios (ex.: "cria Geografia", prints numa pasta nova da raiz como `Geografia/`), ou para acrescentar salas, livro ou unicórnios a uma matéria. Não use para prova da escola (nova-prova) nem só para o prédio (novo-predio).
---
# Nova matéria

Siga a receita `docs/receitas/materia-nova.md`. Contrato: `docs/contratos/conteudo.md`.

1. Trabalhe numa worktree (nunca na árvore principal). Leia `jogo/js/conteudo/CLAUDE.md`.
2. Os prints ficam na pasta da matéria na raiz do repositório (`<Matéria>/`). Não mova essa pasta.
3. Crie `jogo/js/conteudo/materias/<m>/`: uma sala por arquivo, `livro.js` e `<m>.js`.
4. Uma linha por arquivo em `jogo/js/manifesto.js` (grupo `materias`, `node: true`), salas antes de
   `livro.js` e `<m>.js`. Depois:
   ```
   npm run index
   npm run validar
   ```
5. Sem prédio próprio, a matéria ganha o interior padrão. Prédio próprio: skill `novo-predio`.
6. Texto novo precisa de voz: skill `gravar-vozes` (só quem integra grava).
7. Feche com a skill `validar-tudo`. Commit na branch; sem merge nem push sem o Leandro.
