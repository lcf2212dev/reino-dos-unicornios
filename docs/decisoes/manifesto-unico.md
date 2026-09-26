# Decisão: um manifesto só para a ordem de carga

Para que serve: explica por que `jogo/js/manifesto.js` é a única lista de arquivos e o `index.html` é gerado.

## Contexto
- Antes, a ordem dos scripts vivia no `index.html`, e cada ferramenta (vozes, validadores, prévias, testes)
  tinha a sua cópia da lista. Arquivo movido ou novo deixava alguma cópia para trás, em silêncio.

## Decisão
- `jogo/js/manifesto.js` (dados puros, roda no Node e no navegador) lista CSS e scripts na ordem, com
  `grupo` e `node: true` (roda sem DOM).
- `jogo/index.html` é GERADO por `npm run index` (`jogo/ferramentas/gerar-index.js`);
  `node jogo/ferramentas/gerar-index.js --conferir` (em `npm run validar`) acusa index desatualizado,
  arquivo inexistente, repetido ou `.js` de `jogo/js/` fora do manifesto (menos `js/voz/`).
- Ferramentas carregam pelo manifesto: `jogo/ferramentas/jogo-no-node.js` (Node, por grupo ou nome) e
  `jogo/ferramentas/previas/previa.js` (prévias). Nome errado falha alto.
- Na integração, a versão do manifesto que vale é a do orquestrador.

## Consequências
- Arquivo novo = uma linha no manifesto + `npm run index`. Nada mais.
- Listas `nomes:` nas ferramentas (ex.: `jogo/ferramentas/validar/validar-interiores.js`, prévias) citam
  scripts pelo nome: arquivo renomeado precisa ser trocado nelas (elas avisam).
- Ordem dos prédios nas ferramentas: alfabética da pasta (`ordemDosPredios`), que fixa a ordem do `falas.json`.
