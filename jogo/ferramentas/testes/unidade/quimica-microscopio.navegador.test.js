// Microscópio do Laboratório de Química (Reino.UI.telaQuimicaMicroscopio; docs/contratos/quimica.md §2 e §7): abre,
// escolhe lâmina e aumento, gira o foco até ficar nítida (mosaico antes), grava a descoberta e dá a estrela só na 1ª
// vez, anda pelo teclado e fecha com Esc. Servidor e banco de TESTE novos por cenário (cenario.js); save sintético.
// As lâminas que faltam nos dados entram na hora (a frente do conteúdo escreve as de verdade).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'microscopio-'));
const INJETAR = `(function () {
  var Q = Reino.QUIMICA;
  [['acucar', 'Açúcar'], ['folha', 'Folha'], ['cebola', 'Casca de cebola'], ['polen', 'Pólen de flor'], ['areia', 'Areia'],
   ['algodao', 'Fio de algodão'], ['neve', 'Floco de neve']].forEach(function (a) {
    if (!Reino.Quimica.lamina(a[0])) Q.laminas.push({ id: a[0], nome: a[1], emoji: '🔎', explica: ['Olha que coisa bonita!'],
      aumentos: { 10: 'Aqui é pequenininho.', 40: 'Agora dá para ver mais.', 100: 'Bem de pertinho agora.' } });
  });
  var e = Reino.Progresso.estado(); e.quimica = {};
  window.__falas = []; Reino.Som.falar = function (p) { window.__falas.push(p.slice()); return Promise.resolve(); };
  return Q.laminas.length;
})()`;
const OLHAR = `(function () {
  var t = document.querySelector('.tela-quimica-microscopio'), o = t && t.querySelector('.micro-ocular');
  if (!o) return null;
  // a ocular tem desenho (cores diferentes no meio do campo) e, nítida, é a lâmina sem mosaico
  var d = o.getContext('2d').getImageData(40, 40, 80, 80).data, cores = {}, igual = true;
  var n = Reino.QuimicaLaminas.imagem(o.dataset.lamina, +o.dataset.aumento, 1).getContext('2d').getImageData(40, 40, 80, 80).data;
  for (var i = 0; i < d.length; i += 4) { cores[d[i] + ',' + d[i + 1] + ',' + d[i + 2]] = 1; if (d[i] !== n[i] || d[i + 1] !== n[i + 1] || d[i + 2] !== n[i + 2]) igual = false; }
  return { lamina: o.dataset.lamina, aumento: o.dataset.aumento, foco: +o.dataset.foco, nitida: o.dataset.nitida === 'true',
    cores: Object.keys(cores).length, igual: igual, estrelas: Reino.Progresso.estrelas(),
    laminas: Object.assign({}, (Reino.Progresso.estado().quimica || {}).laminas),
    premio: !t.querySelector('.micro-premio').hidden, falas: window.__falas.slice(),
    apertados: Array.prototype.map.call(t.querySelectorAll('[aria-pressed="true"]'), function (b) { return b.dataset.id || b.dataset.aumento; }) };
})()`;
// gira o foco para a frente até ficar nítida (ou até o fim do trilho); devolve quantos cliques deu
const FOCAR = `(function () {
  var m = document.querySelector('.micro-foco-mais'), o = document.querySelector('.micro-ocular'), n = 0;
  while (o.dataset.nitida !== 'true' && n < 12) { m.click(); n++; }
  return n;
})()`;

test('microscópio: lâmina, aumento, foco em mosaico, descoberta e estrela só na 1ª vez, Esc fecha', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: pasta() });
  try {
    assert.strictEqual(await c.js(INJETAR), 8, 'as 8 lâminas nos dados');
    // as falas esperadas vêm dos dados de verdade (conteudo/quimica/laminas.js)
    const F = await c.js("(function (l) { return { explica: l.explica, a40: l.aumentos[40] }; })(Reino.Quimica.lamina('folha'))");
    await c.js("Reino.UI.telaQuimicaMicroscopio(); 'ok'");
    await c.avancar(100);
    let r = await c.js(OLHAR);
    assert.ok(r, 'a tela abriu');
    assert.strictEqual(r.lamina, 'sal'); assert.strictEqual(r.aumento, '10'); assert.strictEqual(r.foco, 0);
    assert.strictEqual(r.nitida, false, 'começa fora de foco');
    assert.ok(r.cores >= 2, 'fora de foco a ocular mostra o mosaico, não fica vazia');
    assert.strictEqual(r.igual, false, 'fora de foco não é a lâmina nítida');
    assert.deepStrictEqual(r.apertados.sort(), ['10', 'sal'], 'a lâmina e o aumento marcados (aria-pressed)');
    assert.ok(r.falas.length >= 1, 'a Doutora Proveta diz oi');

    // escolhe a folha e o aumento de 40×
    await c.js("document.querySelector('.micro-lamina[data-id=\"folha\"]').click(); document.querySelector('.micro-aumento[data-aumento=\"40\"]').click(); 'ok'");
    r = await c.js(OLHAR);
    assert.strictEqual(r.lamina, 'folha'); assert.strictEqual(r.aumento, '40'); assert.strictEqual(r.nitida, false);
    assert.deepStrictEqual(r.falas[r.falas.length - 1], [F.a40], 'trocar o aumento fala o texto dele');
    const antes = r.estrelas;

    // gira o foco até ficar nítida: descoberta gravada e +1 estrela
    const cliques = await c.js(FOCAR);
    assert.ok(cliques >= 3 && cliques <= 6, 'o ponto de foco fica a 3–6 cliques do começo (veio ' + cliques + ')');
    r = await c.js(OLHAR);
    assert.strictEqual(r.nitida, true);
    assert.deepStrictEqual(r.laminas, { folha: 1 }, 'a descoberta foi para o save');
    assert.strictEqual(r.estrelas, antes + 1, '+1 estrela na 1ª vez');
    assert.ok(r.premio, 'o selo +1 ⭐ aparece');
    assert.strictEqual(r.igual, true, 'nítida mostra a lâmina sem mosaico');
    const fala = r.falas[r.falas.length - 1];
    assert.deepStrictEqual(fala.slice(0, F.explica.length + 2), F.explica.concat([F.a40, 'Você ganhou 1 estrela!']));

    // passou do ponto e voltou: nítida de novo, sem estrela nova
    await c.js("document.querySelector('.micro-foco-mais').click(); 'ok'");
    assert.strictEqual((await c.js(OLHAR)).nitida, false, 'passar do ponto borra de novo');
    await c.js("document.querySelector('.micro-foco-menos').click(); 'ok'");
    r = await c.js(OLHAR);
    assert.strictEqual(r.nitida, true);
    assert.strictEqual(r.estrelas, antes + 1, 'a 2ª vez não dá estrela');
    assert.deepStrictEqual(r.falas[r.falas.length - 1], ['Ficou nítida, sem borrão!', F.a40]);

    // tocar de novo na lâmina escolhida: continua nítida e só repete a fala
    await c.js("document.querySelector('.micro-lamina[data-id=\"folha\"]').click(); 'ok'");
    r = await c.js(OLHAR);
    assert.strictEqual(r.nitida, true, 'tocar de novo não tira o foco');
    assert.deepStrictEqual(r.falas[r.falas.length - 1], ['Ficou nítida, sem borrão!', F.a40]);

    // trocar de lâmina volta o foco para o começo
    await c.js("document.querySelector('.micro-lamina[data-id=\"neve\"]').click(); 'ok'");
    r = await c.js(OLHAR);
    assert.strictEqual(r.foco, 0); assert.strictEqual(r.nitida, false); assert.strictEqual(r.premio, false);

    // teclado: Tab chega nos botões, Enter aperta
    await c.js("document.querySelector('.micro-foco-mais').focus(); 'ok'");
    await c.page.keyboard.press('Enter');
    assert.strictEqual((await c.js(OLHAR)).foco, 1, 'Enter no ▶ gira o foco');
    await c.page.keyboard.press('Tab');
    assert.strictEqual(await c.js("document.activeElement.dataset.aumento || ''"), '10', 'Tab segue do foco para o aumento');
    await c.page.keyboard.press('Enter');
    assert.strictEqual((await c.js(OLHAR)).aumento, '10');

    // Esc fecha
    await c.page.keyboard.press('Escape');
    await c.avancar(300);
    assert.strictEqual(await c.js("!!document.querySelector('#telas .tela-quimica-microscopio')"), false, 'Esc fecha a tela');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('microscópio: abre direto na lâmina e no aumento pedidos; sem animação, nenhum timer redesenha', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: pasta() });
  try {
    await c.js(INJETAR);
    await c.js("Reino.UI.telaQuimicaMicroscopio({ lamina: 'cebola', aumento: 100 }); 'ok'");
    const r = await c.js(OLHAR);
    assert.strictEqual(r.lamina, 'cebola'); assert.strictEqual(r.aumento, '100');
    await c.js(FOCAR);
    const a = await c.js("document.querySelector('.micro-ocular').toDataURL()");
    await c.avancar(1000);
    const b = await c.js("document.querySelector('.micro-ocular').toDataURL()");
    assert.strictEqual(a, b, 'congelado (sem animação): o quadro fica parado');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
