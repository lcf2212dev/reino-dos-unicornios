// Aceite do 4º bimestre (Língua Portuguesa), salas inteiras pela interface: o Cap. 11 no tablet. O que confere: o
// cabeçalho de quarto-bimestre-sala-inteira.navegador.test.js (o Cap. 10); o código em quarto-bimestre-sala-inteira-comum.js.
// Rodar (da raiz): npm run unidade -- --so quarto-bimestre-sala-inteira
const { test } = require('node:test');
test(...require('./quarto-bimestre-sala-inteira-comum').capitulo(11, 'tablet'));
