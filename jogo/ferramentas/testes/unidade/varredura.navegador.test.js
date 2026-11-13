// A varredura de layout (testes/varredura.js) só vale se o medidor enxergar a quebra: aqui cada defeito é posto de
// propósito numa pergunta de verdade (sala de livro, celular) e o medidor tem de acusar o tipo certo; desfeito o
// defeito, a conta volta ao que era.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');
const { medir } = require('../varredura-pagina');
const { gravidade, lerArgs } = require('../varredura');
const Q = require('./ajudantes/quarto-bimestre');

const CARTAO = '.tela-missao .missao-corpo .desafio';
// cada quebra: o que se faz na página (devolve nada) e o tipo que o medidor tem de acusar a mais
const QUEBRAS = [
  ['texto que não quebra a linha vaza do cartão', 'vaza|cortado', `(function (p) { p.dataset.antes = p.style.cssText; p.style.whiteSpace = 'nowrap'; p.textContent = p.textContent + ' ' + p.textContent; })(document.querySelector('${CARTAO} .pergunta'))`],
  ['palavra partida no meio sem hífen', 'palavra-partida', `(function (p) { p.dataset.antes = p.style.cssText; p.style.width = '44px'; })(document.querySelector('${CARTAO} .pergunta'))`],
  ['botão coberto por outra coisa', 'coberto', `(function (t) { var d = document.createElement('div'); d.className = 'quebra-teste'; d.style.cssText = 'position:fixed;left:0;right:0;top:120px;bottom:120px;z-index:99999;background:#f0f'; t.appendChild(d); })(document.querySelector('.tela-missao'))`],
  ['opção em cima da de antes', 'sobreposto', `(function (b) { b.dataset.antes = b.style.cssText; b.style.marginTop = '-40px'; })(document.querySelectorAll('${CARTAO} .opcoes > button')[1])`],
  ['resposta maior que a caixa', 'resposta-nao-cabe', `(function (c) { var i = document.createElement('input'); i.className = 'quebra-teste'; i.style.cssText = 'width:40px;display:block'; i.value = 'uma resposta comprida demais'; c.appendChild(i); })(document.querySelector('${CARTAO}'))`],
  // (o jogo zera o recuo nos pseudo-elementos da letra: css/ui-desafios.css; a quebra aqui desfaz isso à força)
  ['maiúscula acentuada empurrada pelo recuo da caixa', 'acento-deslocado', `(function (c) { var p = document.createElement('p'); p.className = 'quebra-teste'; p.innerHTML = '<style>.quebra-teste span.mai-acento::before, .quebra-teste span.mai-acento::after { text-indent: -16px !important; }</style>VOC<span class="mai-acento" data-b="E" data-a="^">Ê</span>'; c.appendChild(p); })(document.querySelector('${CARTAO}'))`],
  ['uma opção com a letra menor que as irmãs', 'letra-desigual', `(function (t) { t.dataset.antes = t.style.cssText; t.style.fontSize = '8px'; })(document.querySelectorAll('${CARTAO} .opcoes > button')[1].querySelector('.opcao-texto'))`],
  ['marcação do conteúdo aparecendo', 'texto-cru', `(function (c) { var p = document.createElement('p'); p.className = 'quebra-teste'; p.textContent = 'O {gato|0} correu'; c.appendChild(p); })(document.querySelector('${CARTAO}'))`],
];
const DESFAZER = `(function () { Array.prototype.forEach.call(document.querySelectorAll('.quebra-teste'), function (e) { e.remove(); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-antes]'), function (e) { e.style.cssText = e.dataset.antes; delete e.dataset.antes; }); })()`;

test('a varredura acusa cada quebra de layout posta de propósito e volta ao que era sem ela', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: fs.mkdtempSync(path.join(PASTA_TESTES, 'varredura-')) });
  try {
    // uma sala de livro que começa por uma pergunta de escolher (tem opções para pôr uma em cima da outra)
    await c.js(`(function () { var m, s; Reino.materias.some(function (x) { if (x.bimestre !== 4 || x.arquivada) return false;
      s = x.salas.find(function (y) { return y.ordem === 'livro' && y.desafios[0].tipo === 'escolha'; }); m = x; return !!s; });
      void Reino.Missao.iniciar(m, s); })()`);
    await c.avancar(300);
    for (let k = 0; k < 40 && await Q.telaDaMissao(c) !== 'desafio'; k++) { await Q.acionar(c, c.page.locator(Q.PRINCIPAL), 'dom'); await c.avancar(100); }
    assert.strictEqual(await Q.telaDaMissao(c), 'desafio', 'a sala chegou à 1ª pergunta');
    const texto = await c.js(`document.querySelector('${CARTAO} .pergunta').textContent`);
    const conta = async () => {
      const m = await c.page.evaluate(medir, { raiz: '.tela-missao', toque: true }), n = {};
      m.achados.filter((a) => gravidade(a) === 'grave').forEach((a) => { n[a.tipo] = (n[a.tipo] || 0) + 1; });
      return n;
    };
    const antes = await conta();
    for (const [nome, tipos, js] of QUEBRAS) {
      await c.js(js);
      const com = await conta();
      assert.ok(tipos.split('|').some((t) => (com[t] || 0) > (antes[t] || 0)), `${nome}: esperava ${tipos} a mais; antes ${JSON.stringify(antes)}, com a quebra ${JSON.stringify(com)}`);
      await c.js(DESFAZER);
      await c.js(`document.querySelector('${CARTAO} .pergunta').textContent = ${JSON.stringify(texto)}`);
      assert.deepStrictEqual(await conta(), antes, `${nome}: desfeita a quebra, a conta volta ao que era`);
    }
    assert.deepStrictEqual(c.erros, [], 'erro de console');
  } finally { await c.fechar(); }
});

test('opções da varredura: padrão, filtros e recusa do que não existe', () => {
  const a = lerArgs(['--materias', 'ciencias4,ingles4', '--salas', '^ci12', '--tamanhos', 'celular', '--modos', 'sala', '--sem-fotos']);
  assert.deepStrictEqual([a.materias, a.tamanhos, a.modos, a.fotos, a.salas.test('ci12a2')], [['ciencias4', 'ingles4'], ['celular'], ['sala'], false, true]);
  assert.deepStrictEqual(lerArgs([]).tamanhos, ['celular', 'tablet', 'notebook']);
  assert.deepStrictEqual(lerArgs(['--ajustes', '{"texto":1.15}']).ajustes, { texto: 1.15 });
  assert.throws(() => lerArgs(['--tamanhos', 'iphone']), /não existe/);
  assert.throws(() => lerArgs(['--modos', 'prova']), /não existe/);
  assert.throws(() => lerArgs(['--nada']), /opção desconhecida/);
  assert.throws(() => lerArgs(['--salas']), /precisa de um valor/);
});
