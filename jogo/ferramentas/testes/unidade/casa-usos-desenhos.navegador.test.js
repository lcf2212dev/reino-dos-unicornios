// Casa do jogador, o estado ligado/aberto dos móveis (casa-usos): para cada peça da lista USOS, em todas as
// direções que o item aceita, desenha desligado sem uid, desligado com uid e ligado com uid (Reino.CasaUsos.ligar,
// sem andar). Confere: desligado com uid = sem uid (pixel a pixel), ligado ≠ desligado, o estático ligado dentro da
// pegada e a animação (só ligada) dentro do sprite + 8 px. Salva uma prancha por cômodo em
// /tmp/reino-testes/casa-usos-desenhos/ (por linha: desligado | ligado t=0 | ligado t=350 | ligado t=700).
// Para estender (móveis avulsos, outras frentes): acrescente à lista USOS — 'kit.item' (kit de casa.kits) ou 'movel.<id>'.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');

const PASTA = '/tmp/reino-testes/casa-usos-desenhos';
const USOS = [
  'estar.estante-tv', 'estar.luminaria', 'quarto-jogador.criado-mudo', 'quarto-uni.estrela', 'jantar.cristaleira',
  'cozinha.geladeira', 'cozinha.armario', 'banheiro.armario', 'banheiro.cesto', 'quarto-jogador.guarda-roupa',
  'quarto-uni.bau', 'cozinha.pia', 'banheiro.pia', 'banheiro.vaso', 'cozinha.fogao',
];
const SEM_ANIM = ['banheiro.armario', 'banheiro.cesto', 'quarto-jogador.guarda-roupa', 'cozinha.armario']; // só abrem: nada precisa se mexer
// (os demais: a animação ligada precisa mudar o desenho em pelo menos uma direção)
const TEMPOS = [0, 350, 700];

const MEDIR = `(function (usos, tempos) {
  var T = 16, M = 12, ESC = 4, OBJ = Reino._interiores.OBJETOS;
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
  // pixels pintados fora do retângulo [x0,x1)×[y0,y1) (em px do canvas)
  function fora(c, d, folga, ate) {
    var n = 0, x0 = c.px - folga, x1 = c.px + c.w * T + folga, y0 = c.py - c.topo - folga, y1 = c.py + c.h * T + folga;
    for (var y = 0; y < c.cv.height; y++) for (var x = 0; x < c.cv.width; x++) {
      if (d[(y * c.cv.width + x) * 4 + 3] && (x < x0 || x >= x1 || y < y0 || y >= y1)) n++;
    }
    return n;
  }
  function pintar(def, dir, uid, ligado, t) {
    var c = novo(def, dir), o = { x: 0, y: 0, w: c.w, h: c.h, dir: dir, tipo: '' };
    if (uid) o.uid = uid;
    Reino.CasaUsos.ligar('teste.uid', !!ligado);
    def.desenhar(c.ctx, c.px, c.py, o, null);
    c.estatico = dados(c);
    if (t !== undefined && def.anim) def.anim(c.ctx, c.px, c.py, t, o);
    c.final = dados(c);
    c.dados = c.cv.toDataURL();
    return c;
  }
  var res = [], linhas = {};
  usos.forEach(function (id) {
    var a = achar(id), r = { id: id, achou: !!a, dirs: {} };
    res.push(r);
    var def = a && OBJ[a.objeto];
    if (!def) return;
    r.temAnim = !!def.anim;
    var linha = [];
    dirs(a.direcoes).forEach(function (dir) {
      var semUid = pintar(def, dir, null, false, 0), off = pintar(def, dir, 'teste.uid', false, 0);
      var ligSemUid = (Reino.CasaUsos.ligar('teste.uid', true), pintar(def, dir, null, true, 0));
      var ons = tempos.map(function (t) { return pintar(def, dir, 'teste.uid', true, t); });
      var on0 = ons[0];
      var d = { offIgualSemUid: igual(semUid.final, off.final), ligSemUidIgual: igual(semUid.final, ligSemUid.final),
        ligadoDifere: !igual(off.estatico, on0.estatico), animDifere: ons.some(function (o) { return !igual(on0.final, o.final); }),
        foraEstatico: fora(on0, on0.estatico, 0), foraAnim: Math.max.apply(null, ons.map(function (o) { return fora(o, o.final, 8); })) };
      r.dirs[dir] = d;
      linha.push(semUid.cv); ons.forEach(function (o) { linha.push(o.cv); });
    });
    Reino.CasaUsos.ligar('teste.uid', false);
    (linhas[a.comodo] = linhas[a.comodo] || []).push(linha);
  });
  var pranchas = {};
  Object.keys(linhas).forEach(function (com) {
    var larg = 0, alt = 0;
    linhas[com].forEach(function (l) { var s = 0, a = 0; l.forEach(function (c, i) { s += c.width + (i % (tempos.length + 1) === tempos.length ? 10 : 2); a = Math.max(a, c.height); }); larg = Math.max(larg, s); alt += a + 4; });
    var pr = document.createElement('canvas'); pr.width = larg * ESC; pr.height = alt * ESC;
    var g = pr.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#f6e7d2'; g.fillRect(0, 0, pr.width, pr.height);
    var yy = 0;
    linhas[com].forEach(function (l) {
      var xx = 0, a = 0;
      l.forEach(function (c, i) { g.drawImage(c, xx * ESC, yy * ESC, c.width * ESC, c.height * ESC); xx += c.width + (i % (tempos.length + 1) === tempos.length ? 10 : 2); a = Math.max(a, c.height); });
      yy += a + 4;
    });
    pranchas[com] = pr.toDataURL();
  });
  return { res: res, pranchas: pranchas };
})`;

test('casa, usos: o estado ligado/aberto de cada móvel, em todas as direções', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: path.join(PASTA, 'cenario') });
  try {
    const { res, pranchas } = await c.js(`${MEDIR}(${JSON.stringify(USOS)}, ${JSON.stringify(TEMPOS)})`);
    fs.mkdirSync(PASTA, { recursive: true });
    for (const [id, url] of Object.entries(pranchas)) fs.writeFileSync(path.join(PASTA, `usos-${id}.png`), Buffer.from(url.split(',')[1], 'base64'));
    assert.strictEqual(res.length, USOS.length);
    for (const it of res) {
      assert.ok(it.achou, `${it.id}: item existe`);
      assert.ok(Object.keys(it.dirs).length >= 1, `${it.id}: desenhou`);
      for (const [dir, d] of Object.entries(it.dirs)) {
        const onde = `${it.id} (${dir})`;
        assert.ok(d.offIgualSemUid, `${onde}: desligado com uid = sem uid`);
        assert.ok(d.ligSemUidIgual, `${onde}: sem uid ignora o estado ligado`);
        assert.ok(d.ligadoDifere, `${onde}: ligado difere de desligado`);
        assert.strictEqual(d.foraEstatico, 0, `${onde}: ${d.foraEstatico} px do estado ligado fora da pegada`);
        assert.strictEqual(d.foraAnim, 0, `${onde}: ${d.foraAnim} px da animação além do sprite + 8 px`);
      }
      if (!SEM_ANIM.includes(it.id)) assert.ok(Object.values(it.dirs).some((d) => d.animDifere), `${it.id}: a animação ligada se mexe`);
    }
  } finally { await c.fechar(); }
});
