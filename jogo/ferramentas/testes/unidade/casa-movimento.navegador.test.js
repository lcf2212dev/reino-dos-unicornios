// Casa do jogador, o movimento de sempre dos móveis (casa.md §13.7): para cada peça da lista MOVEM, em todas as
// direções que o item aceita, desenha sem uid, parado com uid (desligado, anim em t = 0) e alguns quadros com animação.
// Confere: (1) parado com uid = desenho sem uid, pixel a pixel; (2) os quadros com animação não são todos iguais;
// (3) a animação fica dentro do sprite + 8 px; (4) móvel alto: o anim só usa fillStyle/fillRect. Salva uma prancha por
// cômodo em /tmp/reino-testes/casa-movimento/ (uma linha por direção: sem uid | parado com uid | quadros em TEMPOS).
// Para estender: acrescente à lista MOVEM — 'kit.item' (kit de casa.kits) ou 'movel.<id>'.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');

const PASTA = '/tmp/reino-testes/casa-movimento';
const MOVEM = [
  'movel.fontinha', 'quarto-uni.bebedouro', 'movel.aquario', 'movel.relogio-cuco', 'movel.relogio-pe',
  'banheiro.banheira', 'movel.patinhos', 'movel.arco-iris', 'movel.ferradura', 'movel.cristal', 'movel.caminha-nuvem',
  'movel.aquarinho',
];
const TEMPOS = [300, 700, 1100, 1500, 2300];

const MEDIR = `(function (ids, tempos) {
  var T = 16, M = 12, ESC = 6, OBJ = Reino._interiores.OBJETOS;
  function dirs(n) { return n >= 4 ? ['baixo', 'cima', 'esq', 'dir'] : n === 2 ? ['baixo', 'esq'] : ['baixo']; }
  function achar(id) {
    var p = id.split('.');
    if (p[0] === 'movel') { var m = (Reino.moveisCasa || []).filter(function (x) { return x.id === p[1]; })[0]; return m && { objeto: m.objeto, direcoes: m.direcoes, comodo: m.comodo }; }
    var kit = Reino.kitCasa(p[0]), it = kit && kit.itens.filter(function (x) { return x.id === p[1]; })[0];
    return it && { objeto: it.objeto, direcoes: it.parede ? 1 : (it.direcoes || 1), comodo: p[0] };
  }
  function novo(def, dir) {
    var lado = dir === 'esq' || dir === 'dir', w = lado ? def.h : def.w, h = lado ? def.w : def.h, topo = def.topo || 0;
    var cv = document.createElement('canvas'); cv.width = w * T + 2 * M; cv.height = h * T + topo + 2 * M;
    return { cv: cv, ctx: cv.getContext('2d'), px: M, py: M + topo, w: w, h: h, topo: topo };
  }
  function dados(c) { return c.ctx.getImageData(0, 0, c.cv.width, c.cv.height).data; }
  function igual(a, b) { for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
  function diferentes(a, b) { var n = 0; for (var i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) n++; return n; }
  // pixels pintados fora do sprite + folga (a mesma conta do casa-usos-desenhos)
  function fora(c, d, folga) {
    var n = 0, x0 = c.px - folga, x1 = c.px + c.w * T + folga, y0 = c.py - c.topo - folga, y1 = c.py + c.h * T + folga;
    for (var y = 0; y < c.cv.height; y++) for (var x = 0; x < c.cv.width; x++) {
      if (d[(y * c.cv.width + x) * 4 + 3] && (x < x0 || x >= x1 || y < y0 || y >= y1)) n++;
    }
    return n;
  }
  function obj(c, dir, uid) { var o = { x: 0, y: 0, w: c.w, h: c.h, dir: dir, tipo: '' }; if (uid) o.uid = uid; return o; }
  // t === undefined: só o desenhar
  function pintar(def, dir, uid, ligado, t) {
    var c = novo(def, dir), o = obj(c, dir, uid);
    Reino.CasaUsos.ligar('teste.uid', !!ligado);
    def.desenhar(c.ctx, c.px, c.py, o, null);
    if (t !== undefined && def.anim) def.anim(c.ctx, c.px, c.py, t, o);
    c.final = dados(c);
    return c;
  }
  // ctx falso do móvel alto (ctxPintor do motor): só fillStyle e fillRect; qualquer outra coisa é erro
  function soPintor(def, dir, uid, ligado, t) {
    var c = novo(def, dir), o = obj(c, dir, uid), base = { fillStyle: '#000', fillRect: function () {} };
    var falso = new Proxy(base, {
      get: function (a, k) { if (k === 'fillStyle' || k === 'fillRect') return a[k]; throw new Error('ctx.' + String(k)); },
      set: function (a, k, v) { if (k !== 'fillStyle') throw new Error('ctx.' + String(k) + ' ='); a[k] = v; return true; },
    });
    Reino.CasaUsos.ligar('teste.uid', !!ligado);
    try { def.anim(falso, c.px, c.py, t, o); return null; } catch (e) { return e.message; }
  }
  var res = [], linhas = {};
  ids.forEach(function (id) {
    var a = achar(id), r = { id: id, achou: !!a, dirs: {} };
    res.push(r);
    var def = a && OBJ[a.objeto];
    if (!def) return;
    r.temAnim = !!def.anim; r.alto = !!def.alto;
    dirs(a.direcoes).forEach(function (dir) {
      var semUid = pintar(def, dir, null, false), semUid0 = pintar(def, dir, null, false, 0), parado = pintar(def, dir, 'teste.uid', false, 0);
      var quadros = tempos.map(function (t) { return pintar(def, dir, 'teste.uid', false, t); });
      var d = { paradoIgual: igual(semUid.final, parado.final), paradoDifere: diferentes(semUid.final, parado.final),
        semUidIgual: igual(semUid.final, semUid0.final),
        mexe: quadros.some(function (q) { return !igual(quadros[0].final, q.final); }),
        foraAnim: Math.max.apply(null, quadros.map(function (q) { return fora(q, q.final, 8); })), erroPintor: null };
      if (def.alto && def.anim) {
        [0].concat(tempos).forEach(function (t) {
          d.erroPintor = d.erroPintor || soPintor(def, dir, 'teste.uid', false, t) || soPintor(def, dir, 'teste.uid', true, t) || soPintor(def, dir, null, false, t);
        });
      }
      r.dirs[dir] = d;
      (linhas[a.comodo] = linhas[a.comodo] || []).push([semUid.cv, parado.cv].concat(quadros.map(function (q) { return q.cv; })));
    });
    Reino.CasaUsos.ligar('teste.uid', false);
  });
  var pranchas = {}, n = tempos.length + 2;
  function passo(c, i) { return c.width + (i % n === 1 || i % n === n - 1 ? 10 : 2); }
  Object.keys(linhas).forEach(function (com) {
    var larg = 0, alt = 0;
    linhas[com].forEach(function (l) { var s = 0, a = 0; l.forEach(function (c, i) { s += passo(c, i); a = Math.max(a, c.height); }); larg = Math.max(larg, s); alt += a + 4; });
    var pr = document.createElement('canvas'); pr.width = larg * ESC; pr.height = alt * ESC;
    var g = pr.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#f6e7d2'; g.fillRect(0, 0, pr.width, pr.height);
    var yy = 0;
    linhas[com].forEach(function (l) {
      var xx = 0, a = 0;
      l.forEach(function (c, i) { g.drawImage(c, xx * ESC, yy * ESC, c.width * ESC, c.height * ESC); xx += passo(c, i); a = Math.max(a, c.height); });
      yy += a + 4;
    });
    pranchas[com] = pr.toDataURL();
  });
  return { res: res, pranchas: pranchas };
})`;

test('casa, movimento de sempre: parado = desenho de sempre, com animação mexe, perto do móvel', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: path.join(PASTA, 'cenario') });
  try {
    const { res, pranchas } = await c.js(`${MEDIR}(${JSON.stringify(MOVEM)}, ${JSON.stringify(TEMPOS)})`);
    fs.mkdirSync(PASTA, { recursive: true });
    for (const [id, url] of Object.entries(pranchas)) fs.writeFileSync(path.join(PASTA, `movimento-${id}.png`), Buffer.from(url.split(',')[1], 'base64'));
    assert.strictEqual(res.length, MOVEM.length);
    for (const it of res) {
      assert.ok(it.achou, `${it.id}: item existe`);
      assert.ok(it.temAnim, `${it.id}: tem anim`);
      assert.ok(Object.keys(it.dirs).length >= 1, `${it.id}: desenhou`);
      for (const [dir, d] of Object.entries(it.dirs)) {
        const onde = `${it.id} (${dir})`;
        assert.ok(d.paradoIgual, `${onde}: parado com uid = desenho sem uid (${d.paradoDifere} px diferentes)`);
        assert.ok(d.semUidIgual, `${onde}: sem uid, o anim em t = 0 não acrescenta nada`);
        assert.ok(d.mexe, `${onde}: com animação, os quadros mudam`);
        assert.strictEqual(d.foraAnim, 0, `${onde}: ${d.foraAnim} px da animação além do sprite + 8 px`);
        assert.strictEqual(d.erroPintor, null, `${onde}: móvel alto, o anim usou ${d.erroPintor}`);
      }
    }
  } finally { await c.fechar(); }
});
