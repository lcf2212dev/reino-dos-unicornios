// Testes de unidade: a tela dos pais pede o PIN sem caminho de arquivo (D8B-06) e o COMO-USAR.md aponta o arquivo
// onde o PIN mora de verdade (bug 2 de docs/decisoes/historico/bugs-da-refatoracao.md: js/config.js virou js/nucleo/config.js).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/pais-pin-texto.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const jogo = path.resolve(__dirname, '..', '..', '..');

test('tela dos pais: "Digite o PIN dos pais." sem caminho de arquivo; o COMO-USAR.md cita o config.js que tem o pinPais', () => {
  const pais = fs.readFileSync(path.join(jogo, 'js/ui/pais.js'), 'utf8');
  assert.ok(pais.includes("'Digite o PIN dos pais.'"), 'texto novo na tela dos pais');
  assert.ok(!/definido em js\//.test(pais), 'a tela não mostra caminho de arquivo');
  const guia = fs.readFileSync(path.join(jogo, '..', 'COMO-USAR.md'), 'utf8');
  const citados = [...guia.matchAll(/`pinPais` em `(jogo\/js\/[\w/.-]+\.js)`/g)].map((m) => m[1]);
  assert.deepStrictEqual(citados, ['jogo/js/nucleo/config.js']);
  const config = fs.readFileSync(path.join(jogo, '..', citados[0]), 'utf8');
  assert.match(config, /\bpinPais\s*:/, 'o arquivo citado define o pinPais');
});
