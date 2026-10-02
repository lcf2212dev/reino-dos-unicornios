// Menu Lugares no jogo de verdade: a linha do Laboratório de Ciências diz onde ele fica ("No 3º andar do
// Observatório") e traz o selo "✨ Novo!" até ela entrar; depois de entrar, o selo some (sistemas/visitados.js).
// Servidor e save de TESTE (cenario.js); o relógio congelado fica antes da data da novidade.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

const ACHAR = "[...document.querySelectorAll('.sala-card')].find(function (b) { return b.textContent.replace(/\\u00ad/g, '').indexOf('Laboratório de Ciências') >= 0; })";
const LINHA = ACHAR + ".textContent.replace(/\\u00ad/g, '')";

test('Lugares: "No 3º andar do Observatório" e o selo Novo! que some depois de entrar', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'inicio', pasta: '/tmp/reino-testes/ver/teste-lugares-novo' });
  try {
    // Cenário de uma matéria disponível: verifica o selo de novidade, independente do bimestre ativo.
    await c.js("Reino.materia('ciencias').arquivada = false");
    await c.tela('lugares');
    const linha = await c.js(LINHA);
    assert.ok(/No 3º andar do Observatório/.test(linha), 'linha do menu: ' + linha);
    assert.strictEqual(await c.js(ACHAR + ".querySelectorAll('.aviso-novo').length"), 1);
    await c.js(ACHAR + '.click()');
    for (let i = 0; i < 40 && (await c.js('Reino.Cena.atual().id')) !== 'observatorio-3'; i++) await c.avancar(1000);
    assert.strictEqual(await c.js('Reino.Cena.atual().id'), 'observatorio-3');
    assert.deepStrictEqual(await c.js("({ a: !!Reino.Progresso.estado().visitados['observatorio-3'], b: !!Reino.Progresso.estado().visitados['materia:ciencias'] })"), { a: true, b: true });
    await c.tela('lugares');
    assert.strictEqual(await c.js(ACHAR + ".querySelectorAll('.aviso-novo').length"), 0);
    assert.ok(/No 3º andar do Observatório/.test(await c.js(LINHA)));
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
