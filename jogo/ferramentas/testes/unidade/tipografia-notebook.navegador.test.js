// Tipografia e pixel renderizados (ui.md §10.9 e §10.10) no notebook, normal e com "Letras grandes". O que confere: o
// cabeçalho de tipografia.navegador.test.js; o código em tipografia-comum.js.
// Rodar (da raiz): npm run unidade -- --so tipografia
const { test } = require('node:test');
test(...require('./tipografia-comum').tamanhoTipografia('notebook'));
