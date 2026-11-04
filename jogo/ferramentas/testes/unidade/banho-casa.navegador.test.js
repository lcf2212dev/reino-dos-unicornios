// Banho do unicórnio na banheira da casa (cuidados.md §7, casa.md §5): Reino.Banho.iniciar(id, { banheira: { x, y, w, h, tipo, dir }, posto })
// com a banheira 'casa-banheiro-banheira' colocada por Reino.Casa.colocar no térreo, cômodo Banheiro, nas 4 direções:
// as medidas saem do tipo + dir (banho-medidas.js), ela não anda (posto dado), o unicórnio fica dentro da água e o banho
// termina e libera a cena. E a conta da Pet Shop é a de antes (números do banho.js e banho-desenho.js de antes de existir a banheira da casa).
// Fotografa o meio do banho de cada direção em /tmp/reino-testes/cu-banho/ para olhar. Servidor de TESTE (cenario.js), save sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');

const PASTA = '/tmp/reino-testes/cu-banho';
const DIRS = ['baixo', 'cima', 'esq', 'dir'];

// coloca a banheira (a 1ª posição livre do Banheiro) e deixa ela ao lado; devolve a banheira como a casa a passa à ação
const COLOCAR = (dir) => `(function () {
  var C = Reino.Casa, uid = 'banheiro.banheira.1', r = null;
  C.guardar(uid);
  for (var y = 4; y < 12 && !r; y++) for (var x = 42; x < 48 && !r; x++) if (C.podeColocar(uid, 'casa', x, y, ${JSON.stringify(dir)}).ok) r = { x: x, y: y };
  if (!r || !C.colocar(uid, 'casa', r.x, r.y, ${JSON.stringify(dir)})) return null;
  var o = Reino.Cena.atual()._objetos.filter(function (i) { return i.o.tipo === 'casa-banheiro-banheira'; })[0];
  var ban = { x: o.o.x, y: o.o.y, w: o.w, h: o.h, tipo: 'casa-banheiro-banheira', dir: ${JSON.stringify(dir)} };
  Reino.util.reduzMovimentoSistema = false; Reino.Progresso.estado().ajustes.animacoes = true;
  Reino.Cuidados.avancar(100 * 60 * 1000);   // sujinho: o banho não é "já limpinho"
  Jogador.posicionar(ban.x - 1, ban.y + ban.h - 1);
  window.__ban = ban; window.__ela = { x: Jogador.x, y: Jogador.y };
  return ban;
})()`;

test('banho: as medidas da Pet Shop são as de sempre; a banheira da casa tem as suas, por tipo e direção', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', materiasCompletas: ['ingles4'], pasta: path.join(PASTA, 'cenario-medidas') });
  try {
    const r = await c.js(`(function () {
      var I = Reino._banho, M = I.medidas, pet = { x: 22, y: 6, w: 3, h: 2, tipo: 'petshop-banheira' };
      var a = M({ x: 22, y: 6, w: 3, h: 2 }), b = M(pet);
      return { semTipo: JSON.stringify(a), petshop: JSON.stringify(b), nulo: M(null), outro: M({ x: 1, y: 1, w: 3, h: 2, tipo: 'outra' }),
        pegada: M({ x: 1, y: 1, w: 3, h: 2, tipo: 'casa-banheiro-banheira', dir: 'baixo' }),
        pegada2: M({ x: 1, y: 1, w: 2, h: 3, tipo: 'casa-banheiro-banheira', dir: 'esq' }),
        pe: M({ x: 1, y: 1, w: 2, h: 3, tipo: 'casa-banheiro-banheira', dir: 'cima' }),
        esq: M({ x: 1, y: 1, w: 3, h: 2, tipo: 'casa-banheiro-banheira', dir: 'esq' }), dir: M({ x: 1, y: 1, w: 3, h: 2, tipo: 'casa-banheiro-banheira', dir: 'dir' }) };
    })()`);
    // os números que o banho tinha, escritos à mão (a banheira 3×2 da Pet Shop)
    const antes = { w: 48, h: 32, linha: 4, escova: 0.5, recorte: [1, 4, 47, 32], tx: 23, sx: 14, sy: 41, espy: 0, bolhas: [6, 11, 38, 43], costas: 4, ordem: 20,
      espuma: [[10, 3, 4], [16, 1, 5], [23, 2, 4], [29, 0, 5], [36, 2, 4], [41, 4, 3], [13, -2, 3], [26, -3, 3], [33, -3, 3]],
      patinho: { casa: [25.5, -2], canto: [40.5, -1] } };
    for (const chave of ['semTipo', 'petshop']) {
      const m = JSON.parse(r[chave]);
      for (const [k, v] of Object.entries(antes)) assert.deepStrictEqual(m[k], v, `${chave}.${k}`);
      assert.strictEqual(m.vista, null, `${chave}: ele olha para ela, como antes`);
      assert.strictEqual(m.ladoSaida, false, `${chave}: sempre sai pelo mesmo lado, como antes`);
    }
    assert.strictEqual(r.nulo, null);
    assert.strictEqual(r.outro, null, 'tipo desconhecido: só a versão curta');
    assert.strictEqual(r.pegada, null, 'a de pé com a pegada de lado: desconhecida');
    assert.strictEqual(r.pegada2, null);
    assert.deepStrictEqual([r.pe.w, r.pe.h, r.pe.vista.vista], [32, 48, 'frente']);
    assert.deepStrictEqual([r.esq.w, r.esq.h, r.dir.w, r.dir.h], [48, 32, 48, 32]);
    // 'dir' é a 'esq' espelhada na largura
    assert.strictEqual(r.dir.tx, 48 - r.esq.tx);
    assert.deepStrictEqual(r.dir.recorte, [48 - r.esq.recorte[2], r.esq.recorte[1], 48 - r.esq.recorte[0], r.esq.recorte[3]]);
    assert.deepStrictEqual(r.dir.bolhas, r.esq.bolhas.map((x) => 48 - x));
    assert.deepStrictEqual(r.dir.espuma.map((b) => b[0]), r.esq.espuma.map((b) => 47 - b[0]));
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});

test('banho na Pet Shop: a geometria do banho em curso é a de sempre (ela anda até o lado esquerdo)', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: path.join(PASTA, 'cenario-petshop') });
  try {
    await c.ir('petshop');
    const inicio = await c.js('Jogador.tile()');
    await c.js(`Reino.util.reduzMovimentoSistema = false; Reino.Progresso.estado().ajustes.animacoes = true; Reino.Cuidados.avancar(100 * 60 * 1000); void Reino.Banho.iniciar()`);
    await c.avancar(800);
    assert.notDeepStrictEqual(await c.js('Jogador.tile()'), inicio, 'sem posto, ela anda até o lado da banheira (como antes)');
    await c.avancar(2700);
    const g = await c.js(`(function () {
      var s = Reino._banho.st, g = s && s.geo, b = s && s.banheira, J = Jogador, t = J.tile();
      return { banheira: b, geo: g && { px: g.px, py: g.py, linha: g.linha, tx: g.tx, lx: g.lx, ly: g.ly }, tile: t, curta: s && s.curta };
    })()`);
    assert.strictEqual(g.curta, false);
    assert.strictEqual(g.banheira.tipo, 'petshop-banheira');
    const { px, py } = g.geo;
    assert.deepStrictEqual(g.geo, { px: g.banheira.x * 16, py: g.banheira.y * 16, linha: py + 4, tx: px + 23, lx: px + 14, ly: py + 32 + 9 });
    await c.avancar(6500);
    assert.strictEqual((await c.js('Reino.Banho.depurar()')).ativo, false);
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});

test('banho na casa: 4 direções, ela não anda, o unicórnio fica dentro da banheira e o banho termina', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', materiasCompletas: ['ingles4'], pasta: path.join(PASTA, 'cenario') });
  try {
    await c.ir('casa');
    await c.js(`Reino.Casa.escolherKit('banheiro')`);
    for (const dir of DIRS) {
      const ban = await c.js(COLOCAR(dir));
      assert.ok(ban, `${dir}: achou lugar para a banheira`);
      const lado = dir === 'esq' || dir === 'dir';
      assert.deepStrictEqual([ban.w, ban.h], lado ? [3, 2] : [2, 3], `${dir}: a pegada chega trocada em esq/dir`);
      await c.avancar(500);
      const posto = { x: ban.x - 1, y: ban.y + ban.h - 1 };
      await c.js(`void Reino.Banho.iniciar(null, { banheira: window.__ban, posto: ${JSON.stringify(posto)} })`);
      await c.avancar(2400);   // a fase de esfregar: o meio do banho
      const meio = await c.js(`(function () {
        var s = Reino._banho.st, g = s && s.geo, d = Reino.Banho.depurar(), J = Jogador;
        return { fase: d.fase, curta: d.curta, ocupada: Reino.Cena.estado(), geo: g && { px: g.px, py: g.py, linha: g.linha, tx: g.tx, ty: g.ty, lx: g.lx, ly: g.ly, W: g.m.w, H: g.m.h },
          ela: { x: J.x, y: J.y }, antes: window.__ela, uni: Reino.Banho.desenhandoUni() };
      })()`);
      assert.strictEqual(meio.fase, 'esfregar', dir);
      assert.strictEqual(meio.curta, false, `${dir}: o banho completo, não a versão curta`);
      assert.strictEqual(meio.ocupada, 'atividade', `${dir}: a cena fica ocupada`);
      assert.deepStrictEqual(meio.ela, meio.antes, `${dir}: com posto ela não anda`);
      assert.ok(meio.uni, `${dir}: o banho desenha o unicórnio`);
      const g = meio.geo;
      assert.deepStrictEqual([g.W, g.H], lado ? [48, 32] : [32, 48], dir);
      // dentro da banheira: o meio e a linha da espuma caem no miolo (a água), os pés dele na linha
      assert.ok(g.tx > g.px + 6 && g.tx < g.px + g.W - 6, `${dir}: no meio da banheira (tx ${g.tx - g.px})`);
      assert.ok(g.linha > g.py && g.linha < g.py + g.H - 14, `${dir}: a linha da espuma dentro da banheira (${g.linha - g.py})`);
      assert.ok(g.ty >= g.linha - 4 && g.ty <= g.linha + 2, `${dir}: pés na linha da espuma (${g.ty - g.linha})`);
      assert.ok(g.ly > g.py + g.H, `${dir}: sai no chão, na frente da banheira`);
      assert.ok(g.lx >= g.px && g.lx <= g.px + g.W, `${dir}: sai na frente dela`);
      // foto: a banheira com folga, ampliada
      fs.mkdirSync(PASTA, { recursive: true });
      await c.page.evaluate(() => window.__congelar.respirar(8));
      const clip = await c.js(`(function () { var b = window.__ban, V = Reino._motor, p = V.pintor, r = V.canvas.getBoundingClientRect(),
        a = p.tela(b.x * 16 - 40, b.y * 16 - 48), z = p.tela(b.x * 16 + b.w * 16 + 40, b.y * 16 + b.h * 16 + 40);
        return { x: r.left + a.x / V.dpr, y: r.top + a.y / V.dpr, width: (z.x - a.x) / V.dpr, height: (z.y - a.y) / V.dpr }; })()`);
      const arq = path.join(PASTA, `casa-${dir}.png`);
      await c.page.screenshot({ path: arq, clip });
      assert.ok(fs.statSync(arq).size > 500, `${dir}: foto salva`);
      await c.avancar(4500);
      const fim = await c.js('Reino.Banho.depurar()');
      assert.strictEqual(fim.ativo, false, `${dir}: terminou`);
      assert.strictEqual(fim.resultado.depois, 100, `${dir}: banho cheio no fim`);
      assert.notStrictEqual(await c.js('Reino.Cena.estado()'), 'atividade', `${dir}: cena liberada`);
      await c.js('Reino.UI.fecharTodas && Reino.UI.fecharTodas()');
    }
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});

test('banho na casa: ela do outro lado da banheira, o unicórnio sai do lado dela', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', materiasCompletas: ['ingles4'], pasta: path.join(PASTA, 'cenario-lado') });
  try {
    await c.ir('casa');
    await c.js(`Reino.Casa.escolherKit('banheiro')`);
    for (const dir of ['baixo', 'esq']) {
      const ban = await c.js(COLOCAR(dir));
      assert.ok(ban);
      await c.js(`Jogador.posicionar(window.__ban.x + window.__ban.w, window.__ban.y + window.__ban.h - 1)`);
      await c.js(`void Reino.Banho.iniciar(null, { banheira: window.__ban, posto: null })`);
      await c.avancar(2400);
      const g = await c.js(`(function () { var g = Reino._banho.st.geo; return { px: g.px, W: g.m.w, lx: g.lx }; })()`);
      assert.ok(g.lx > g.px + g.W / 2, `${dir}: sai do lado direito, onde ela está (${g.lx - g.px})`);
      await c.avancar(4500);
      assert.strictEqual((await c.js('Reino.Banho.depurar()')).ativo, false);
    }
    assert.deepStrictEqual(c.erros || [], []);
  } finally { await c.fechar(); }
});
