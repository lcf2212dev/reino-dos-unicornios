// Aceite do 4º bimestre, a Casa das Palavras: no notebook. O que confere: o cabeçalho de quarto-bimestre-ala.navegador.test.js;
// o código em quarto-bimestre-ala-comum.js. Rodar (da raiz): npm run unidade -- --so quarto-bimestre-ala
const { test } = require('node:test');
test(...require('./quarto-bimestre-ala-comum').tamanhoAla('notebook'));
