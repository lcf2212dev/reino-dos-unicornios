// Quebra de linha (ui.md §10.17, util.colado): nenhum grupo colado (span nowrap) passa da caixa do pai nem da tela,
// nos balões (NPC e Claude), nas opções de desafio, nas intros de sala e na capa de prova, no celular e no notebook.
// Cada texto real é posto no lugar de verdade da tela e medido. Nos balões também: o balão inteiro dentro da tela e
// nenhuma linha só com um emoji ou só com um número (D5-07). Exceção: linha de conta ou de lista, sem letra e com
// sinal (+ − × ÷ =), lacuna (___) ou mais de um número ("5 + 5 = 10", "2, 4, 6"): é a conta, não uma sobra; e o
// emoji cuja palavra com ele não cabe numa linha do balão ("travesseiros! 💤" no Claude do celular).
// Servidor e banco de TESTE (cenario.js); save sintético. Uma parte por tamanho e por tipo de texto (esta: telas no
// celular; as outras em colar-*.navegador.test.js), o código em colar-comum.js. Rodar: npm run unidade -- --so colar
const { test } = require('node:test');
test(...require('./colar-comum').parteColar('celular', 'telas'));
