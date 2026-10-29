// Tipografia e pixel renderizados (arte.md §9 e §10) no tablet, normal e com "Letras grandes". O que confere: o
// cabeçalho de tipografia.navegador.test.js; o código em tipografia-comum.js.
// Rodar (da raiz): npm run unidade -- --so tipografia
const { test } = require('node:test');
test(...require('./tipografia-comum').tamanhoTipografia('tablet'));
