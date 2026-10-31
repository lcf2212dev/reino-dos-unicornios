// Casa do jogador, kits estar, jantar e cozinha (casa.md §3 e §5): cada item aponta para um objeto da biblioteca,
// cada direção declarada desenha só dentro da pegada (com a folga do `topo`), o lado difere da frente e os ids seguem
// o §2. Salva uma prancha de cada kit em /tmp/reino-testes/casa-moveis-a/ para olhar. Servidor de TESTE (cenario.js).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');

const PASTA = '/tmp/reino-testes/casa-moveis-a';
const KITS = ['estar', 'jantar', 'cozinha'];

// desenha cada direção de cada item num canvas próprio (com margem) e devolve a conferência e a prancha em PNG
const MEDIR = `(function (kits) {
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
  var res = {}, pranchas = {};
  kits.forEach(function (id) {
    var kit = Reino.kitCasa(id), linhas = [];
    res[id] = kit ? { nome: kit.nome, capa: kit.capa, itens: [] } : null;
    if (!kit) return;
    kit.itens.forEach(function (it) {
      var def = OBJ[it.objeto], r = { id: it.id, objeto: it.objeto, qtd: it.qtd || 1, direcoes: it.direcoes, parede: !!it.parede, existe: !!def, dirs: {} };
      res[id].itens.push(r);
      if (!def) return;
      r.def = { w: def.w, h: def.h, solido: def.solido, plano: !!def.plano, parede: !!def.parede };
      var linha = [];
      dirs(it.direcoes).forEach(function (dir) { var p = pintar(def, dir); r.dirs[dir] = { fora: p.fora, dentro: p.dentro, dados: p.dados }; linha.push(p.cv); });
      linhas.push(linha);
    });
    // prancha: uma linha por item, as direções lado a lado, ampliadas, com a pegada marcada
    var larg = 0, alt = 0;
    linhas.forEach(function (l) { var s = 0, a = 0; l.forEach(function (c) { s += c.width + 4; a = Math.max(a, c.height); }); larg = Math.max(larg, s); alt += a + 4; });
    var pr = document.createElement('canvas'); pr.width = larg * ESC; pr.height = alt * ESC;
    var g = pr.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#f6e7d2'; g.fillRect(0, 0, pr.width, pr.height);
    var yy = 0;
    linhas.forEach(function (l) {
      var xx = 0, a = 0;
      l.forEach(function (c) { g.drawImage(c, xx * ESC, yy * ESC, c.width * ESC, c.height * ESC); xx += c.width + 4; a = Math.max(a, c.height); });
      yy += a + 4;
    });
    pranchas[id] = pr.toDataURL();
  });
  return { res: res, pranchas: pranchas };
})(${JSON.stringify(KITS)})`;

test('casa, kits estar/jantar/cozinha: itens, pegadas, direções e ids', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: path.join(PASTA, 'cenario') });
  try {
    const { res, pranchas } = await c.js(MEDIR);
    fs.mkdirSync(PASTA, { recursive: true });
    for (const [id, url] of Object.entries(pranchas)) fs.writeFileSync(path.join(PASTA, `kit-${id}.png`), Buffer.from(url.split(',')[1], 'base64'));
    const nomes = { estar: 'Sala de Estar', jantar: 'Sala de Jantar', cozinha: 'Cozinha' };
    for (const id of KITS) {
      const kit = res[id];
      assert.ok(kit, `kit ${id} registrado`);
      assert.strictEqual(kit.nome, nomes[id]);
      assert.ok(kit.itens.some((it) => it.objeto === kit.capa), `${id}: a capa é um item do kit`);
      const total = kit.itens.reduce((s, it) => s + it.qtd, 0);
      assert.ok(total >= 6 && total <= 8, `${id}: ${total} peças (de 6 a 8)`);
      const ids = new Set();
      for (const it of kit.itens) {
        const onde = `${id}.${it.id}`;
        assert.ok(!ids.has(it.id), `${onde}: id repetido`); ids.add(it.id);
        assert.match(it.id, /^[a-z][a-z0-9-]*$/, `${onde}: id sem ponto (uid <kit>.<item>.<n>)`);
        assert.strictEqual(it.objeto, `casa-${id}-${it.id}`, `${onde}: objeto casa-<kit>-<item>`);
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
    }
  } finally { await c.fechar(); }
});
