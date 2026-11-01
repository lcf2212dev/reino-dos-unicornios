// Casa do jogador, os móveis avulsos (casa.md §12): os 41 registrados (um por sala do 4º bimestre, mais 3 camas), cada um com o
// objeto casa-movel-<id> da biblioteca, cômodo de config.casa.kits, nome curto, direções 1/2/4; cada direção
// declarada desenha só dentro da pegada (com a folga do `topo`), o lado e as costas diferem da frente. Salva uma
// prancha por cômodo em /tmp/reino-testes/casa-moveis-salas/ para olhar. Servidor de TESTE (cenario.js).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');

const PASTA = '/tmp/reino-testes/casa-moveis-salas';

// desenha cada direção de cada item num canvas próprio (com margem) e devolve a conferência e a prancha em PNG
const MEDIR = `(function () {
  var T = 16, M = 8, ESC = 4, OBJ = Reino._interiores.OBJETOS;
  function dirs(n) { return n >= 4 ? ['baixo', 'cima', 'esq', 'dir'] : n === 2 ? ['baixo', 'esq'] : ['baixo']; }
  function pintar(def, dir) {
    var lado = dir === 'esq' || dir === 'dir', w = lado ? def.h : def.w, h = lado ? def.w : def.h, topo = def.topo || 0;
    var cv = document.createElement('canvas'); cv.width = w * T + 2 * M; cv.height = h * T + topo + 2 * M;
    var ctx = cv.getContext('2d'), px = M, py = M + topo;
    def.desenhar(ctx, px, py, { x: 0, y: 0, w: w, h: h, dir: dir, tipo: '' }, null);
    var d = ctx.getImageData(0, 0, cv.width, cv.height).data, fora = 0, dentro = 0;
    for (var y = 0; y < cv.height; y++) for (var x = 0; x < cv.width; x++) {
      if (!d[(y * cv.width + x) * 4 + 3]) continue;
      if (x < px || x >= px + w * T || y < py - topo || y >= py + h * T) fora++; else dentro++;
    }
    return { cv: cv, fora: fora, dentro: dentro, dados: cv.toDataURL() };
  }
  var res = [], pranchas = {}, linhas = {};
  (Reino.moveisCasa || []).forEach(function (m) {
    var def = OBJ[m.objeto], r = { id: m.id, nome: m.nome, objeto: m.objeto, comodo: m.comodo, direcoes: m.direcoes, parede: !!m.parede, existe: !!def, dirs: {} };
    res.push(r);
    if (!def) return;
    r.def = { w: def.w, h: def.h, solido: def.solido, plano: !!def.plano, parede: !!def.parede };
    var linha = [];
    dirs(m.direcoes).forEach(function (dir) { var p = pintar(def, dir); r.dirs[dir] = { fora: p.fora, dentro: p.dentro, dados: p.dados }; linha.push(p.cv); });
    (linhas[m.comodo] = linhas[m.comodo] || []).push(linha);
  });
  // prancha por cômodo: uma linha por móvel, as direções lado a lado, ampliadas
  Object.keys(linhas).forEach(function (com) {
    var larg = 0, alt = 0;
    linhas[com].forEach(function (l) { var s = 0, a = 0; l.forEach(function (c) { s += c.width + 4; a = Math.max(a, c.height); }); larg = Math.max(larg, s); alt += a + 4; });
    var pr = document.createElement('canvas'); pr.width = larg * ESC; pr.height = alt * ESC;
    var g = pr.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#f6e7d2'; g.fillRect(0, 0, pr.width, pr.height);
    var yy = 0;
    linhas[com].forEach(function (l) {
      var xx = 0, a = 0;
      l.forEach(function (c) { g.drawImage(c, xx * ESC, yy * ESC, c.width * ESC, c.height * ESC); xx += c.width + 4; a = Math.max(a, c.height); });
      yy += a + 4;
    });
    pranchas[com] = pr.toDataURL();
  });
  return { res: res, pranchas: pranchas, kits: Reino.config.casa.kits };
})()`;

test('casa, móveis avulsos: 41 móveis, objetos, cômodos, pegadas e direções', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: path.join(PASTA, 'cenario') });
  try {
    const { res, pranchas, kits } = await c.js(MEDIR);
    fs.mkdirSync(PASTA, { recursive: true });
    for (const [id, url] of Object.entries(pranchas)) fs.writeFileSync(path.join(PASTA, `moveis-${id}.png`), Buffer.from(url.split(',')[1], 'base64'));
    assert.strictEqual(res.length, 41, '41 móveis (25 salas de Língua Portuguesa + 13 de Inglês, mais 3 camas)');
    const ids = new Set(), porComodo = {};
    for (const it of res) {
      const onde = `movel.${it.id}`;
      assert.ok(!ids.has(it.id), `${onde}: id repetido`); ids.add(it.id);
      assert.match(it.id, /^[a-z][a-z0-9-]*$/, `${onde}: id sem ponto (uid movel.<id>.<n>)`);
      assert.strictEqual(it.objeto, `casa-movel-${it.id}`, `${onde}: objeto casa-movel-<id>`);
      assert.ok(kits.includes(it.comodo), `${onde}: cômodo ${it.comodo} de config.casa.kits`);
      porComodo[it.comodo] = (porComodo[it.comodo] || 0) + 1;
      assert.ok(it.nome.length >= 3 && it.nome.length <= 14, `${onde}: nome "${it.nome}" de 3 a 14 letras`);
      assert.ok(it.existe, `${onde}: objeto ${it.objeto} registrado`);
      assert.ok([1, 2, 4].includes(it.direcoes), `${onde}: direções 1, 2 ou 4`);
      if (it.parede) { assert.strictEqual(it.direcoes, 1, `${onde}: de parede não gira`); assert.ok(it.def.parede, `${onde}: objeto de parede`); }
      else if (it.def.plano) assert.strictEqual(it.def.solido, false, `${onde}: tapete não é sólido`);
      else assert.ok(it.def.solido === true || it.def.solido === 'base', `${onde}: móvel de chão é sólido`);
      for (const [dir, d] of Object.entries(it.dirs)) {
        assert.strictEqual(d.fora, 0, `${onde} (${dir}): ${d.fora} pixels fora da pegada`);
        assert.ok(d.dentro > 40, `${onde} (${dir}): desenhou`);
      }
      if (it.direcoes >= 2) assert.notStrictEqual(it.dirs.esq.dados, it.dirs.baixo.dados, `${onde}: esq difere de baixo`);
      if (it.direcoes === 4) assert.notStrictEqual(it.dirs.cima.dados, it.dirs.baixo.dados, `${onde}: cima difere de baixo`);
    }
    for (const k of kits) assert.ok(porComodo[k] >= 5, `${k}: ${porComodo[k] || 0} móveis (5 ou mais por cômodo)`);
  } finally { await c.fechar(); }
});
