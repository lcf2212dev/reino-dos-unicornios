// Casa do jogador, a animação dos móveis atrás de outro móvel (interiores.md §6, casa.md §4): monta na Sala de Estar
// pares "móvel com movimento + móvel na frente" (os da conferência e um de 4 direções) e desenha o fundo da cena
// (desenharFundo) em t = 0 e em vários t > 0. Confere: (1) onde um móvel desenhado depois no estático tem pixel, o fundo
// mostra o pixel do estático (a animação de quem está atrás não aparece por cima; a do próprio móvel e a dos que vêm
// depois dele podem); (2) em t = 0, perto dos móveis de trás, o fundo é pixel a pixel o mesmo arranjo desenhado só com o
// estático de sempre (sem uid). Salva recortes em /tmp/reino-testes/casa-camadas/ (por par: t = 0 | t = 700 | t = 1500).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');

const PASTA = '/tmp/reino-testes/casa-camadas';
const TEMPOS = [300, 700, 1100, 1500, 2300];
// [quem fica atrás, direção, quem fica na frente, direção, quantos tiles abaixo]
const RODADAS = [
  [['movel.relogio-cuco', 'baixo', 'quarto-uni.bebedouro', 'baixo', 2], ['movel.patinhos', 'baixo', 'quarto-uni.estrela', 'baixo', 1],
    ['movel.fontinha', 'baixo', 'quarto-uni.comedouro', 'baixo', 1]],
  [['quarto-uni.bebedouro', 'cima', 'quarto-uni.estrela', 'baixo', 1]],
];

const PREPARAR = `(function () {
  var C = Reino.Casa, e = Reino.Progresso.estado();
  ['quarto-uni'].forEach(function (k) { if (C.kitsGanhos().indexOf(k) < 0) C.escolherKit(k); });
  e.casaMoveis = e.casaMoveis || {};
  ['fontinha', 'relogio-cuco', 'patinhos'].forEach(function (id, i) { e.casaMoveis['teste-' + i] = { movel: id, em: 100 + i }; });
  Reino.CasaMoveis.pendentes().forEach(function (s, i) { e.casaMoveis[s] = { movel: 'vaso-flores', em: 200 + i }; });   // sem a tela de escolha
  Reino.Progresso.salvar();
  return C.kitsGanhos();
})()`;

// coloca cada par no 1º lugar onde cabem os dois; devolve os uids colocados e os tipos de trás
const MONTAR = `(function (pares) {
  var C = Reino.Casa, d = Reino.Interiores.def('casa'), feitos = [], atras = [], falhou = [];
  function peca(chave) { return C.pecas().filter(function (p) { return p.kit + '.' + p.item === chave && !p.lugar; })[0]; }
  pares.forEach(function (pr) {
    var a = peca(pr[0]), f = peca(pr[2]), ok = false;
    for (var y = 1; y < d.tamanho.h - 2 && !ok; y++) for (var x = 1; x < d.tamanho.w - 2 && !ok; x++) {
      if (!C.podeColocar(a.uid, 'casa', x, y, pr[1]).ok || !C.colocar(a.uid, 'casa', x, y, pr[1])) continue;
      if (C.podeColocar(f.uid, 'casa', x, y + pr[4], pr[3]).ok && C.colocar(f.uid, 'casa', x, y + pr[4], pr[3])) ok = true;
      else C.guardar(a.uid);
    }
    if (ok) { feitos.push(a.uid, f.uid); atras.push(a.objeto); } else falhou.push(pr[0]);
  });
  return { feitos: feitos, atras: atras, falhou: falhou };
})`;

const MEDIR = `(function (tempos, atras) {
  var cena = Reino.Cena.atual(), II = Reino._interiores, P = Reino.Progresso, ord = II.ordemNoEstatico;
  var est = cena._renderizar(), W = est.width, H = est.height;
  function tela() { var c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
  function dados(c) { return c.getContext('2d').getImageData(0, 0, W, H).data; }
  function so(f) { var c = tela(); f(c.getContext('2d')); return dados(c); }
  function fundo(t) { var c = tela(); cena.desenharFundo(c.getContext('2d'), t, t > 0); return c; }
  var E = so(function (ctx) { ctx.drawImage(est, 0, 0); });
  var lista = cena._objetos.filter(function (it) { return !it.alto; }).sort(ord);
  var anims = lista.filter(function (it) { return it.lib.anim; });
  var desenho = lista.map(function (b) { return so(function (ctx) { b.lib.desenhar(ctx, b.px, b.py, b.o, P); }); });
  var alvos = lista.filter(function (it) { return atras.indexOf(it.o.tipo) >= 0; });
  function caixa(a) { return [Math.max(0, a.px - 10), Math.max(0, a.py - a.topo - 10), Math.min(W, a.px + a.W + 10), Math.min(H, a.base + 10)]; }
  function igual(A, B, i) { return A[i] === B[i] && A[i + 1] === B[i + 1] && A[i + 2] === B[i + 2] && A[i + 3] === B[i + 3]; }
  // t = 0: o mesmo arranjo, só o estático de sempre (sem uid)
  var semUid = tela();
  II.desenharEstatico(semUid.getContext('2d'), cena.def, cena.grade, P, cena._objetos.map(function (it) {
    var o = Object.assign({}, it.o); delete o.uid; return Object.assign({}, it, { o: o });
  }));
  var S = dados(semUid), res = { alvos: alvos.map(function (a) { return a.o.tipo; }), quadros: [], recortes: {} };
  [0].concat(tempos).forEach(function (t) {
    var cv = fundo(t), F = dados(cv), mascaras = anims.map(function (a) { return so(function (ctx) { a.lib.anim(ctx, a.px, a.py, t, a.o); }); });
    var q = { t: t, erros: 0, checados: 0, cobertos: {}, semUid: 0 };
    var outros = anims.filter(function (x) { return alvos.indexOf(x) < 0; }).map(function (x) { return mascaras[anims.indexOf(x)]; });
    alvos.forEach(function (a) {
      var cx = caixa(a), n = 0;
      lista.forEach(function (b, ib) {
        if (ord(a, b) >= 0) return;
        var depois = anims.filter(function (x) { return ord(x, b) >= 0; }).map(function (x) { return mascaras[anims.indexOf(x)]; });
        var ma = mascaras[anims.indexOf(a)], db = desenho[ib];
        for (var y = cx[1]; y < cx[3]; y++) for (var x = cx[0]; x < cx[2]; x++) {
          var i = (y * W + x) * 4;
          if (db[i + 3] !== 255 || depois.some(function (m) { return m[i + 3]; })) continue;
          q.checados++;
          if (ma[i + 3]) n++;                                   // a animação de trás tentou pintar aqui
          if (!igual(F, E, i)) q.erros++;
        }
      });
      q.cobertos[a.o.tipo] = n;
      // (fora o que o anim de outro móvel já pinta parado, como a estrelinha da estrela mágica)
      if (t === 0) for (var y = cx[1]; y < cx[3]; y++) for (var x = cx[0]; x < cx[2]; x++) {
        var k = (y * W + x) * 4;
        if (!outros.some(function (m) { return m[k + 3]; }) && !igual(F, S, k)) q.semUid++;
      }
      if (t === 0 || t === 700 || t === 1500) (res.recortes[a.o.tipo] = res.recortes[a.o.tipo] || []).push({ url: cv.toDataURL(), cx: cx });
    });
    res.quadros.push(q);
  });
  // um recorte por par: os três instantes lado a lado, ampliados
  var ESC = 6, saida = {};
  Object.keys(res.recortes).forEach(function (tipo) {
    var l = res.recortes[tipo], c = l[0].cx, w = c[2] - c[0], h = c[3] - c[1];
    var pr = document.createElement('canvas'); pr.width = (w * l.length + 4 * (l.length - 1)) * ESC; pr.height = h * ESC;
    var g = pr.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#f6e7d2'; g.fillRect(0, 0, pr.width, pr.height);
    saida[tipo] = { pr: pr, g: g, l: l, w: w, h: h, c: c };
  });
  res.pranchas = {};
  return Promise.all(Object.keys(saida).map(function (tipo) {
    var s = saida[tipo];
    return Promise.all(s.l.map(function (r, k) {
      return new Promise(function (ok) { var img = new Image(); img.onload = function () {
        s.g.drawImage(img, s.c[0], s.c[1], s.w, s.h, k * (s.w + 4) * ESC, 0, s.w * ESC, s.h * ESC); ok(); }; img.src = r.url; });
    })).then(function () { res.pranchas[tipo] = s.pr.toDataURL(); });
  })).then(function () { delete res.recortes; return res; });
})`;

test('casa, camadas: a animação de um móvel não aparece por cima do móvel da frente', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: path.join(PASTA, 'cenario'),
    materiasCompletas: ['ingles4', 'portugues4', 'matematica4', 'historia4', 'ciencias4', 'geografia4'] });
  try {
    fs.mkdirSync(PASTA, { recursive: true });
    assert.ok((await c.js(PREPARAR)).indexOf('quarto-uni') >= 0, 'kit do quarto do unicórnio');
    for (let i = 0; i < 3; i++) { const b = c.page.getByText('Depois', { exact: true }); if (await b.count()) { await b.first().click(); await c.avancar(600); } }
    await c.js("void Reino.Cena.irPara('casa')"); await c.avancar(2500);
    assert.strictEqual(await c.js('__reino.cena()'), 'casa');
    for (const [r, pares] of RODADAS.entries()) {
      const m = await c.js(`${MONTAR}(${JSON.stringify(pares)})`);
      assert.deepStrictEqual(m.falhou, [], `rodada ${r}: todos os pares couberam`);
      // ela longe dos móveis (os pares ficam no alto à esquerda): nenhum vai para a frente dela
      await c.js("(function () { var d = Reino.Interiores.def('casa'), g = Reino.Cena.atual().grade; for (var y = d.tamanho.h - 2; y > 0; y--) for (var x = d.tamanho.w - 2; x > 0; x--) if (!g.solido[y][x]) { Jogador.posicionar(x, y); return; } })()");
      await c.avancar(300);
      const res = await c.js(`${MEDIR}(${JSON.stringify(TEMPOS)}, ${JSON.stringify(m.atras)})`);
      for (const [tipo, url] of Object.entries(res.pranchas)) fs.writeFileSync(path.join(PASTA, `${r}-${tipo}.png`), Buffer.from(url.split(',')[1], 'base64'));
      assert.deepStrictEqual(res.alvos.sort(), m.atras.slice().sort());
      for (const q of res.quadros) {
        assert.ok(q.checados > 0, `rodada ${r}, t = ${q.t}: conferiu algum pixel`);
        assert.strictEqual(q.erros, 0, `rodada ${r}, t = ${q.t}: ${q.erros} px da animação de trás por cima do móvel da frente`);
        if (q.t === 0) assert.strictEqual(q.semUid, 0, `rodada ${r}: em t = 0, ${q.semUid} px diferentes do estático de sempre`);
      }
      // cada par de verdade: a animação de trás alcança o móvel da frente em algum quadro
      for (const tipo of m.atras) assert.ok(res.quadros.some((q) => q.cobertos[tipo] > 0), `rodada ${r}: ${tipo} alcança o móvel da frente`);
      await c.js(`(function (l) { l.forEach(function (u) { Reino.Casa.guardar(u); }); })(${JSON.stringify(m.feitos)})`);
    }
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});
