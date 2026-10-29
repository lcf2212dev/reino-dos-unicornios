// Quebra de linha (arte.md §17, util.colado) no celular: as falas pares no balão do Claude. O que confere: o cabeçalho de
// colar.navegador.test.js; o código em colar-comum.js. Rodar (da raiz): npm run unidade -- --so colar
const { test } = require('node:test');
test(...require('./colar-comum').parteColar('celular', 'claude', 1));
