// Testes de unidade: o texto da tela dos pais aponta o arquivo onde o PIN mora de verdade (bug 2 de
// docs/decisoes/historico/bugs-da-refatoracao.md: dizia js/config.js, que virou js/nucleo/config.js na refatoração).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/pais-pin-texto.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const jogo = path.resolve(__dirname, '..', '..', '..');

test('tela dos pais: o PIN é "definido em js/nucleo/config.js", e esse arquivo existe e tem o pinPais', () => {
  const pais = fs.readFileSync(path.join(jogo, 'js/ui/pais.js'), 'utf8');
  assert.ok(pais.includes("'Digite o PIN dos pais (definido em js/nucleo/config.js).'"), 'texto novo na tela dos pais');
  const citados = [...pais.matchAll(/definido em (js\/[\w/.-]+\.js)/g)].map((m) => m[1]);
  assert.deepStrictEqual(citados, ['js/nucleo/config.js']);
  const config = fs.readFileSync(path.join(jogo, citados[0]), 'utf8');
  assert.match(config, /\bpinPais\s*:/, 'o arquivo citado define o pinPais');
});
