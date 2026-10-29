// Quebra de linha (ui.md §10.17, util.colado) no notebook: opções de desafio, intro, apostila e nome das salas. O que confere: o cabeçalho de
// colar.navegador.test.js; o código em colar-comum.js. Rodar (da raiz): npm run unidade -- --so colar
const { test } = require('node:test');
test(...require('./colar-comum').parteColar('notebook', 'telas'));
